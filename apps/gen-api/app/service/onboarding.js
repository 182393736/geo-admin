'use strict';
/**
 * Onboarding 服务：新用户「首次品牌分析」状态机
 * 流程：创建品牌(building) + onboarding_task → 异步三段：crawl → keyword → query → done
 *  - crawl   抓取官网标题等基础信息（可选，失败不阻塞）
 *  - keyword 调用 DeepSeek 结构化解析：行业/简介/别名/竞品/监控问题候选
 *  - query   落库 brand_aliases + monitor_queries（数字自增 query_id 走 counters 集合）
 *  - done    brand.status building→active
 * 无 DEEPSEEK_API_KEY 时走确定性降级解析，保证链路可演示。
 */
const { Service } = require('egg');
// 监控问题「品牌中立」闸门：与 packages/geo-agent 共用同一套黑名单口径
const { buildBrandTokens, findBrandToken, filterBrandMentionStrings, NEUTRAL_RULES } = require('@geo-admin/geo-agent');

class OnboardingService extends Service {
  /** 开启一次首次分析。返回 { task_id, brand_id } */
  async start(userId, input) {
    const { ctx } = this;
    const { brand_name, website, business_desc } = input;

    const existing = await ctx.model.Brand.countDocuments({ user_id: userId, status: { $ne: 'disabled' } });
    const brand = await ctx.model.Brand.create({
      user_id: userId,
      name: brand_name || '未命名品牌',
      industry: '',
      website: website || '',
      business_desc: business_desc || '',
      status: 'building',
      is_first_brand: existing === 0,
    });

    const task = await ctx.model.OnboardingTask.create({
      user_id: userId,
      brand_id: brand.brand_id,
      input: { brand_name, website, business_desc },
      stage: 'crawl',
      crawler_started_at: new Date(),
    });

    // 异步跑分析（匿名 ctx：脱离请求生命周期）
    const actx = this.app.createAnonymousContext();
    setImmediate(() =>
      this.runAnalysis(actx, task.task_id).catch(async e => {
        this.app.coreLogger.error('[onboarding] analysis failed: %s', e.stack || e);
        await this.app.mongoose.model('OnboardingTask').updateOne(
          { task_id: task.task_id },
          { $set: { stage: 'fail', error: String(e.message || e).slice(0, 500) } });
      }),
    );

    return { task_id: task.task_id, brand_id: brand.brand_id };
  }

  /** 查询任务状态（前端轮询） */
  async status(taskId, userId) {
    const { ctx } = this;
    const filter = userId ? { task_id: taskId, user_id: userId } : { task_id: taskId };
    const task = await ctx.model.OnboardingTask.findOne(filter).lean();
    if (!task) return null;
    const [brand, aliasCount, industryCount, brandCount] = await Promise.all([
      ctx.model.Brand.findOne({ brand_id: task.brand_id }).lean(),
      ctx.model.BrandAlias.countDocuments({ brand_id: task.brand_id }),
      ctx.model.MonitorQuery.countDocuments({ brand_id: task.brand_id, query_type: 'industry' }),
      ctx.model.MonitorQuery.countDocuments({ brand_id: task.brand_id, query_type: 'brand' }),
    ]);
    return {
      task_id: task.task_id,
      brand_id: task.brand_id,
      stage: task.stage, // crawl | keyword | query | overview | done | fail
      done: task.stage === 'done',
      error: task.error || null,
      crawler_started_at: task.crawler_started_at || null,
      crawler_completed_at: task.crawler_completed_at || null,
      keyword_gen_started_at: task.keyword_gen_started_at || null,
      keyword_gen_completed_at: task.keyword_gen_completed_at || null,
      generated: { aliases: aliasCount, industry_queries: industryCount, brand_queries: brandCount },
      brand: brand ? { brand_id: brand.brand_id, name: brand.name, industry: brand.industry || '', status: brand.status } : null,
    };
  }

  /** 最新的一次 onboarding（供 /user/info 投影 first_login 等字段） */
  async latestForUser(userId) {
    return this.app.mongoose.model('OnboardingTask')
      .findOne({ user_id: userId }).sort({ created_at: -1 }).lean();
  }

  /* ================= 内部：异步分析主流程 ================= */

  async runAnalysis(actx, taskId) {
    const M = this.app.mongoose.model.bind(this.app.mongoose);
    const task = await M('OnboardingTask').findOne({ task_id: taskId }).lean();
    if (!task) throw new Error('task not found: ' + taskId);
    const input = task.input || {};

    // ---- 阶段1 crawl：抓官网基础信息（失败降级为纯 LLM/纯规则） ----
    let siteTitle = '';
    if (input.website) {
      try {
        const url = /^https?:\/\//.test(input.website) ? input.website : `https://${input.website}`;
        const resp = await actx.curl(url, {
          timeout: 8000, dataType: 'text',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeoOnboardingBot/1.0)' },
        });
        const html = String(resp.data || '');
        const m = html.match(/<title[^>]*>([^<]{0,120})<\/title>/i);
        if (m) siteTitle = m[1].trim();
      } catch (e) {
        this.app.coreLogger.warn('[onboarding] crawl failed, continue with llm path: %s', e.message);
      }
    }
    await M('OnboardingTask').updateOne({ task_id: taskId },
      { $set: { crawler_completed_at: new Date(), keyword_gen_started_at: new Date(), stage: 'keyword' } });

    // ---- 阶段2 keyword：LLM 结构化解析（无 key 走降级） ----
    const parsed = await this.analyzeWithLLM(actx, input, siteTitle)
      .catch(() => this.fallbackParse(input, siteTitle));

    // ---- 阶段2.5 品牌中立闸门：问题里不得出现品牌名/别名/公司名 ----
    // 客户测的是「行业用户问 AI 时，AI 会不会主动提到我」，问题带了品牌名等于自问自答，指标失真
    const brandTokens = buildBrandTokens({
      name: parsed.brand_name || input.brand_name,
      aliases: parsed.aliases,
      website: input.website,
      extra: [input.brand_name],
    });
    const neutral = filterBrandMentionStrings(parsed.industry_queries || [], brandTokens);
    if (neutral.dropped.length) {
      this.app.coreLogger.info('[onboarding] 剔除含品牌名的监控问题 %j',
        neutral.dropped.map(d => ({ query: d.query, hit: d.token })));
    }
    parsed.industry_queries = neutral.kept;

    // ---- 阶段3 query：写品牌档案、别名、监控问题 ----
    await M('Brand').updateOne({ brand_id: task.brand_id }, {
      $set: {
        name: parsed.brand_name || input.brand_name || '未命名品牌',
        industry: parsed.industry || '',
        website: input.website || '',
        business_desc: parsed.business_desc || input.business_desc || '',
      },
    });
    if (parsed.business_desc) {
      await M('BrandProfile').updateOne({ brand_id: task.brand_id }, { $set: {
        brand_id: task.brand_id, user_id: task.user_id,
        description: parsed.business_desc,
        raw: { source: 'onboarding', site_title: siteTitle },
      } }, { upsert: true }).catch(() => {});
    }
    for (const a of parsed.aliases || []) {
      await M('BrandAlias').updateOne(
        { brand_id: task.brand_id, alias: a },
        { $setOnInsert: { brand_id: task.brand_id, alias: a, source: 'auto', enabled: true } },
        { upsert: true },
      );
    }
    // 竞品落库（LLM 解析出的候选：source=品牌挖掘；compet_point 竞争点由后续 agent/insight 阶段补全）
    for (const c of parsed.competitors || []) {
      const name = typeof c === 'string' ? c.trim() : String((c && c.name) || '').trim();
      const point = typeof c === 'object' && c ? String(c.compet_point || c.point || '').trim() : '';
      if (!name) continue;
      await M('CompetitorRegister').updateOne(
        { brand_id: task.brand_id, name },
        { $setOnInsert: { brand_id: task.brand_id, name, source: '品牌挖掘', compet_point: point, enabled: true } },
        { upsert: true },
      );
    }
    let order = 0;
    for (const q of parsed.industry_queries || []) {
      const qid = await this.nextSeq('monitor_query');
      await M('MonitorQuery').create({
        query_id: qid, user_id: task.user_id, brand_id: task.brand_id,
        query: q, question_list: [{ user_friendly: q, platform_query: q }],
        platform_prompt: q,  // 实测契约：默认与 query 同值，平台差异化改写由后续 agent 覆盖
        query_type: 'industry', query_order: ++order, task_id: taskId,
      });
    }
    // 注：不再落 query_type='brand' 的口碑题。口碑题必然含品牌名（「XX怎么样」），
    // AI 回答必然提到该品牌，等于自问自答；口碑改由中立问题里 AI 自发提及的品牌拆解得出（流水线B）。

    // ---- done ----
    await M('Brand').updateOne({ brand_id: task.brand_id }, { $set: { status: 'active' } });
    await M('OnboardingTask').updateOne({ task_id: taskId },
      { $set: { stage: 'done', keyword_gen_completed_at: new Date(), keywords: parsed.keywords || [] } });
  }

  /* ================= LLM 解析 ================= */

  async analyzeWithLLM(actx, input, siteTitle) {
    if (!this.app.config.deepseek.apiKey) throw new Error('no deepseek key, use fallback');
    const { data } = await actx.service.llm.deepseek.chatJson({
      system: '你是一个品牌信息分析助手。根据用户提供的品牌介绍与官网信息，抽取品牌的核心要素，并为一个“AI 搜索可见性监测平台”生成首批监控问题。\n\n' + NEUTRAL_RULES,
      user: `品牌名称（仅用于理解业务，禁止出现在 industry_queries 里）：${input.brand_name || '未知'}\n官网：${input.website || '未提供'}${siteTitle ? `（页面标题：${siteTitle}）` : ''}\n品牌介绍：${input.business_desc || '未提供'}\n\n请输出结构化结果。`,
      schemaHint: `{
  "brand_name": "品牌的正式名称",
  "industry": "所属行业，如 公共家具制造",
  "business_desc": "一句话品牌简介（<=80字）",
  "aliases": ["品牌的常用简称/别名，0~3个"],
  "competitors": [{"name": "竞品名称", "compet_point": "一句话竞争定位（品类 · 差异点），如 '电商AI设计工具 · 阿里旗下电商 AI 设计工具，电商场景强'"}, "0~5个"],
  "keywords": ["核心业务关键词，3~6个"],
  "industry_queries": ["用户会向 AI 提问的行业中立问题，5~8个，如 '公共座椅厂家推荐'；一律不得出现品牌名/别名/公司名"]
}`,
    });
    return {
      brand_name: String(data.brand_name || input.brand_name || '').trim(),
      industry: String(data.industry || '').trim(),
      business_desc: String(data.business_desc || '').trim(),
      aliases: (data.aliases || []).filter(x => typeof x === 'string' && x.trim()).slice(0, 3),
      // 兼容 LLM 返回字符串数组或 {name, compet_point} 对象数组
      competitors: (data.competitors || []).map(c =>
        typeof c === 'string' ? c.trim() : { name: String((c && c.name) || '').trim(), compet_point: String((c && (c.compet_point || c.point)) || '').trim() },
      ).filter(c => (typeof c === 'string' ? c : c.name)).slice(0, 5),
      keywords: (data.keywords || []).filter(x => typeof x === 'string' && x.trim()).slice(0, 6),
      industry_queries: (data.industry_queries || []).filter(x => typeof x === 'string' && x.trim()).slice(0, 8),
    };
  }

  /** 无 LLM 时的确定性降级：从表单文本提取 + 模板合成监控问题 */
  fallbackParse(input, siteTitle) {
    const name = (input.brand_name || this.guessName(input.business_desc) || '未命名品牌').trim();
    const tokens = buildBrandTokens({ name, aliases: [], website: input.website, extra: [input.brand_name] });
    // 母词取自介绍文本，而介绍常以品牌名开头 → 先剔掉含品牌指纹的词，
    // 否则会合成出「XX厂家推荐」这类自问自答题（下游闸门也会剔，但那样就一条不剩了）
    const kw = (input.business_desc || siteTitle || '产品服务').replace(/[，。,.!！?\s]+/g, ' ').split(' ')
      .filter(Boolean).filter(w => !findBrandToken(w, tokens)).slice(0, 4);
    const head = kw[0] || '产品';
    return {
      brand_name: name,
      industry: '',
      business_desc: (input.business_desc || '').slice(0, 120),
      aliases: [],
      competitors: [],  // 降级路径无检索能力，竞品留空由用户手工登记
      keywords: kw,
      industry_queries: [
        `${head}厂家推荐`, `${head}品牌哪个好`, `靠谱的${head}供应商有哪些`,
        `${head}怎么选`, `${head}公司排名`,
      ],
      // 不再生成 brand_queries：口碑题必然含品牌名，会让监测变成自问自答
    };
  }

  guessName(text) {
    if (!text) return '';
    const m = text.match(/[「『"]([^」』"]{2,20})[」』"]/) || text.match(/(?:品牌叫|我是|我们是)([^，。,.]{2,20})/);
    return m ? m[1] : '';
  }

  /** 自增序列（counters 集合）——query_id / 订单号的唯一来源 */
  async nextSeq(name) {
    const coll = this.app.mongoose.connection.db.collection('counters');
    const r = await coll.findOneAndUpdate(
      { _id: name }, { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );
    const doc = r && r.value ? r.value : r; // driver v4/v6 兼容
    return doc.seq;
  }
}
module.exports = OnboardingService;
