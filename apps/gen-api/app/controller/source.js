'use strict';
const Controller = require('egg').Controller;

/**
 * 用户侧信源查询（对齐 geoapi.timus.cn 契约）
 *  - POST /reference_source/stats            信源被引统计列表（含权威度字段）
 *  - POST /reference_source/articles         展开信源下文章明细
 *  - POST /reference_source/analyze          信源分析抽屉
 *  - POST /reference_source/media_accounts   可投媒体号分页
 *  - POST /summary/reference_source/tag_own_article  标记/取消自有文章
 *  - POST /article/library/import           导入自有文章
 *  - POST /source_intelligence/source_trend / engine_preference / own_trend / perspective
 *  - GET  /source_intelligence/topics
 *  - POST /snapshot/export/list              搜索快照列表（含排行/回答摘要）
 *  - POST /snapshot/export/answer            查看单条原始回答
 *  - POST /snapshot/export/text              导出回答 CSV
 * 数据源：citation_edges（按 query_type=industry|brand 分流）/ canonical_sources / media_channels
 * 备注：source_daily_stats 仍按 query_type 写入，供渠道库夜间汇总；洞察 API 直接读 edges 以保证旧数据也能分流
 *
 * 对标响应形状（2026-09-11 抓包 geoapi.timus.cn）：
 *  - source_trend        data: { dates: [], sources: [{ name, total, series: [] }] }
 *  - engine_preference   data: { sources: [{ canonical_source, category, engines:{<engine>:{cur,cmp,chg}}, cur_total, cmp_total, chg_total }] }
 *  - own_trend           data: { trend: [{ date, own_count, total_count, rate }], summary: { cited, cited_chg, rate_now, rate_chg, own_articles, own_articles_chg } }
 *  - perspective         data: { list: [{ name, category, cur_total, cmp_total, change, change_pct, status, tag, engines:{<engine>:{cur,cmp}}, own_rate }], total, page, page_size }
 *  - topics              data: [{ query_id, name }]
 */
const ENGINE_ORDER = ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'];

class SourceController extends Controller {
  async _requireBrand(brandId) {
    const { ctx } = this;
    try {
      return await ctx.service.brandScope.requireBrand(ctx.state.user.id, brandId);
    } catch (e) {
      ctx.status = e.status || 400;
      ctx.body = { code: e.code || e.status || 400, msg: e.message };
      return null;
    }
  }
  _n(v, d = 2) { const n = Number(v); return Number.isFinite(n) ? +n.toFixed(d) : 0; }
  _engine(p) { return p === 'qianwen' ? 'qwen' : p; }

  /** category / query_type → industry|brand（默认排名） */
  _qt(b = {}) {
    const v = b.category || b.query_type || 'industry';
    return v === 'brand' ? 'brand' : 'industry';
  }

  /** 旧边缺 query_type 时，用 monitor_queries 回填 */
  async _resolveQtMap(edges) {
    const { ctx } = this;
    const missing = [...new Set(edges.filter(e => !e.query_type).map(e => e.query_id))];
    const qtMap = {};
    if (missing.length) {
      const mqs = await ctx.model.MonitorQuery.find({ query_id: { $in: missing } }).select('query_id query_type').lean();
      for (const m of mqs) qtMap[m.query_id] = m.query_type;
    }
    return qtMap;
  }

  _edgeQt(e, qtMap) {
    return e.query_type || qtMap[e.query_id] || 'industry';
  }

  /**
   * 拉取区间内 citation_edges，按 query_type 过滤后聚合成
   * source_id → { total, engines:{engine: ref}, own }
   */
  async _aggRange(brandId, start, end, qt = 'industry', platform = null) {
    const { ctx } = this;
    const q = { brand_id: brandId };
    if (start && end) q.date = { $gte: start, $lte: end };
    if (platform) q.platform = platform;
    const edges = await ctx.model.CitationEdge.find(q)
      .select('source_id platform query_id query_type is_own')
      .lean();
    const qtMap = await this._resolveQtMap(edges);
    const bySource = {};
    for (const e of edges) {
      if (this._edgeQt(e, qtMap) !== qt) continue;
      const s = (bySource[e.source_id] ||= { total: 0, engines: {}, own: 0 });
      s.total += 1;
      if (e.is_own) s.own += 1;
      const eng = this._engine(e.platform || '');
      if (eng) s.engines[eng] = (s.engines[eng] || 0) + 1;
    }
    return bySource;
  }

  /** 生成 start..end 的连续日期数组（含端点，最多 60 天） */
  _dateRange(start, end) {
    const day = this.ctx.app.dayjs;
    let s = day(String(start || '').slice(0, 10));
    let e = day(String(end || '').slice(0, 10));
    if (!s.isValid()) s = day().subtract(6, 'day');
    if (!e.isValid() || e.isBefore(s)) e = day();
    const out = [];
    for (let d = s; d.isBefore(e.add(1, 'day')); d = d.add(1, 'day')) {
      out.push(d.format('YYYY-MM-DD'));
      if (out.length > 60) break;
    }
    return out;
  }

  /* ---------- 信源统计 ---------- */
  async stats() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    const empty = { list: [], summary: { total_ref_count: 0, total_article_count: 0, total_sources: 0, own_source_count: 0, top5_share: 0, platform_breakdown: {} }, page: 1, page_size: 20, total: 0 };
    if (!brand) return;
    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(500, Math.max(1, parseInt(b.page_size, 10) || 20));
    // category 请求参数 = 问题类型维度（industry=排名 / brand=口碑），对标站实测如此；
    // 信源本身的媒体类目（视频/社交/B2B…）在响应的 category 字段返回，二者不是一回事
    const qt = b.category === 'brand' ? 'brand' : 'industry';
    const q = { brand_id: brand.brand_id };
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    if (start && end) q.date = { $gte: start, $lte: end };
    const filterQid = parseInt(b.query_id, 10);
    if (Number.isFinite(filterQid) && filterQid > 0) q.query_id = filterQid;
    // 对标：单引擎用 platform；多选用 platforms[]
    let platFilter = Array.isArray(b.platforms)
      ? b.platforms.map(p => this._engine(String(p))).filter(Boolean)
      : [];
    if (!platFilter.length && b.platform && b.platform !== 'all') {
      platFilter = [ this._engine(String(b.platform)) ].filter(Boolean);
    }
    if (platFilter.length === 1) q.platform = platFilter[0];
    else if (platFilter.length > 1) q.platform = { $in: platFilter };

    // 直接从 citation_edges 聚合（query_type 分流后的原子事实），再联 CanonicalSource/MediaChannel 补元数据
    const [edges, sources, channels] = await Promise.all([
      ctx.model.CitationEdge.find(q).select('source_id platform article_id query_id query_type is_own').lean(),
      ctx.model.CanonicalSource.find({}).lean(),
      ctx.model.MediaChannel.find({}).select('media_key name sell_price list_price').lean(),
    ]);
    // 回填 query_type：旧数据 citation_edges 未带该字段，按 query_id 从 monitor_queries 解析
    const missing = [...new Set(edges.filter(e => !e.query_type).map(e => e.query_id))];
    const qtMap = {};
    if (missing.length) {
      const mqs = await ctx.model.MonitorQuery.find({ query_id: { $in: missing } }).select('query_id query_type').lean();
      for (const m of mqs) qtMap[m.query_id] = m.query_type;
    }
    const srcMap = {}; for (const s of sources) srcMap[s.source_id] = s;
    const chMap = {}; for (const c of channels) chMap[c.media_key] = c;
    const agg = {};
    for (const e of edges) {
      if ((e.query_type || qtMap[e.query_id] || 'industry') !== qt) continue;
      if (platFilter.length && !platFilter.includes(this._engine(e.platform || ''))) continue;
      const a = (agg[e.source_id] ||= { ref_count: 0, article_ids: new Set(), query_ids: new Set(), own_article_count: 0, platforms: {} });
      a.ref_count += 1;
      a.article_ids.add(e.article_id);
      a.query_ids.add(e.query_id);
      if (e.is_own) a.own_article_count += 1;
      const p = (a.platforms[e.platform] ||= { ref_count: 0, article_ids: new Set() });
      p.ref_count += 1;
      p.article_ids.add(e.article_id);
    }
    let list = Object.entries(agg).map(([sid, v]) => {
      const meta = srcMap[sid] || {};
      const ch = chMap[meta.media_key];
      return {
        canonical_source: meta.canonical_source || sid,
        category: meta.category || null,
        domain: (meta.domains && meta.domains[0]) || null,
        auth_info_des: meta.auth_info_des || null,
        auth_info_level: meta.auth_info_level || null,
        ref_count: v.ref_count, article_count: v.article_ids.size, query_count: v.query_ids.size, own_article_count: v.own_article_count,
        first_cited_at: meta.first_cited_at || null,
        platforms: Object.fromEntries(Object.entries(v.platforms).map(([k, p]) => [k, { ref_count: p.ref_count, article_count: p.article_ids.size }])),
        media_key: meta.media_key || null,
        sell_price: ch ? (ch.sell_price != null ? ch.sell_price : null) : null,
        list_price: ch ? (ch.list_price != null ? ch.list_price : null) : null,
        cost_per_citation: ch && ch.sell_price && v.ref_count ? this._n(ch.sell_price / v.ref_count) : null,
      };
    }).sort((a, z) => z.ref_count - a.ref_count);
    const total = list.length;
    const paged = list.slice((page - 1) * size, page * size);
    const totalRef = list.reduce((s, x) => s + x.ref_count, 0);
    const top5 = list.slice(0, 5).reduce((s, x) => s + x.ref_count, 0);
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: paged,
        summary: {
          total_ref_count: totalRef,
          total_article_count: list.reduce((s, x) => s + x.article_count, 0),
          total_sources: total,
          own_source_count: list.filter(x => x.own_article_count > 0).length,
          top5_share: totalRef ? this._n(top5 / totalRef * 100) : 0,
          platform_breakdown: ENGINE_ORDER.reduce((m, p) => { m[p] = list.reduce((s, x) => s + ((x.platforms[p] || {}).ref_count || 0), 0); return m; }, {}),
        },
        page, page_size: size, total,
      },
    };
  }

  /* ---------- 引用源追溯：文章展开 / 分析抽屉 / 标记自有 / 导入 ---------- */

  _platformDisplay(p) {
    return ({ doubao: '豆包', wenxin: '文心一言', deepseek: 'DeepSeek', qwen: '通义千问', yuanbao: '元宝' })[p] || p;
  }

  async _resolveSourceMeta(canonicalSource, sourceId) {
    const { ctx } = this;
    if (sourceId) {
      const byId = await ctx.model.CanonicalSource.findOne({ source_id: sourceId }).lean();
      if (byId) return byId;
    }
    const name = String(canonicalSource || '').trim();
    if (!name) return null;
    return ctx.model.CanonicalSource.findOne({ canonical_source: name }).lean();
  }

  /** POST /reference_source/articles — 展开某信源下的被引文章 */
  async articles() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.page_size, 10) || 20));
    const qt = b.category === 'brand' ? 'brand' : 'industry';
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const meta = await this._resolveSourceMeta(b.canonical_source || b.source_name, b.source_id);
    if (!meta) {
      ctx.body = { code: 200, msg: 'ok', data: { list: [], total: 0, page, page_size: size } };
      return;
    }

    const q = { brand_id: brand.brand_id, source_id: meta.source_id };
    if (start && end) q.date = { $gte: start, $lte: end };
    const filterQid = parseInt(b.query_id, 10);
    if (Number.isFinite(filterQid) && filterQid > 0) q.query_id = filterQid;
    const platFilter = Array.isArray(b.platforms)
      ? b.platforms.map(p => this._engine(String(p))).filter(Boolean)
      : [];
    if (platFilter.length === 1) q.platform = platFilter[0];
    else if (platFilter.length > 1) q.platform = { $in: platFilter };

    const edges = await ctx.model.CitationEdge.find(q)
      .select('article_id platform query_id query_type is_own')
      .lean();
    const missing = [...new Set(edges.filter(e => !e.query_type).map(e => e.query_id))];
    const qtMap = {};
    if (missing.length) {
      const mqs = await ctx.model.MonitorQuery.find({ query_id: { $in: missing } }).select('query_id query_type').lean();
      for (const m of mqs) qtMap[m.query_id] = m.query_type;
    }

    const byArt = {};
    for (const e of edges) {
      if ((e.query_type || qtMap[e.query_id] || 'industry') !== qt) continue;
      if (platFilter.length && !platFilter.includes(this._engine(e.platform || ''))) continue;
      const a = (byArt[e.article_id] ||= { ref_count: 0, is_own: false, platforms: {} });
      a.ref_count += 1;
      if (e.is_own) a.is_own = true;
      const p = this._engine(e.platform || '');
      if (p) a.platforms[p] = (a.platforms[p] || 0) + 1;
    }

    const ids = Object.keys(byArt);
    const articles = ids.length
      ? await ctx.model.CitedArticle.find({ article_id: { $in: ids } }).lean()
      : [];
    const artMap = {};
    for (const a of articles) artMap[a.article_id] = a;

    let list = ids.map(id => {
      const v = byArt[id];
      const a = artMap[id] || {};
      return {
        article_id: id,
        title: a.title || a.canonical_url || a.url || id,
        url: a.url || a.canonical_url || null,
        canonical_url: a.canonical_url || a.url || null,
        ref_count: v.ref_count,
        is_own: !!(v.is_own || a.is_brand_published),
        platforms: Object.fromEntries(
          Object.entries(v.platforms).map(([k, c]) => [ k, { ref_count: c } ]),
        ),
        auth_info_des: null,
        auth_info_level: null,
      };
    }).sort((a, z) => z.ref_count - a.ref_count || String(a.title).localeCompare(String(z.title)));

    const total = list.length;
    list = list.slice((page - 1) * size, page * size);
    ctx.body = { code: 200, msg: 'ok', data: { list, total, page, page_size: size } };
  }

  /** POST /reference_source/analyze — 信源分析抽屉 */
  async analyze() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const qt = this._qt(b);
    const meta = await this._resolveSourceMeta(b.canonical_source || b.source_name, b.source_id);
    if (!meta) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '信源不存在' };
      return;
    }

    const q = { brand_id: brand.brand_id, source_id: meta.source_id };
    if (start && end) q.date = { $gte: start, $lte: end };
    const edgesRaw = await ctx.model.CitationEdge.find(q)
      .select('platform article_id query_id query_type is_own')
      .lean();
    const qtMap = await this._resolveQtMap(edgesRaw);
    const edges = edgesRaw.filter(e => this._edgeQt(e, qtMap) === qt);

    const engineMap = {};
    const queryMap = {};
    const articleIds = new Set();
    for (const e of edges) {
      const p = this._engine(e.platform || '');
      if (p) engineMap[p] = (engineMap[p] || 0) + 1;
      if (e.query_id != null) queryMap[e.query_id] = (queryMap[e.query_id] || 0) + 1;
      if (e.article_id) articleIds.add(e.article_id);
    }
    const qids = Object.keys(queryMap).map(Number).filter(Number.isFinite);
    const mqs = qids.length
      ? await ctx.model.MonitorQuery.find({ query_id: { $in: qids } }).select('query_id query').lean()
      : [];
    const qName = {};
    for (const m of mqs) qName[m.query_id] = m.query || String(m.query_id);

    const mediaQ = meta.media_key
      ? { $or: [ { media_key: meta.media_key }, { source_id: meta.source_id }, { name: meta.canonical_source } ] }
      : { $or: [ { source_id: meta.source_id }, { name: meta.canonical_source } ] };
    const mediaRows = await ctx.model.MediaChannel.find(mediaQ).sort({ sell_price: 1 }).limit(50).lean();
    const mediaCount = await ctx.model.MediaChannel.countDocuments(
      meta.source_id ? { $or: [ { source_id: meta.source_id }, { name: meta.canonical_source } ] } : { name: meta.canonical_source },
    );
    const fallbackCount = mediaCount || await ctx.model.MediaChannel.countDocuments({ enabled: true });

    const totalRef = edges.length;
    const engineBreakdown = Object.entries(engineMap)
      .map(([ platform, ref_count ]) => ({
        platform,
        display_name: this._platformDisplay(platform),
        ref_count,
      }))
      .sort((a, z) => z.ref_count - a.ref_count);
    const queryBreakdown = Object.entries(queryMap)
      .map(([ query_id, ref_count ]) => ({
        query_id: Number(query_id),
        question: qName[query_id] || String(query_id),
        ref_count,
      }))
      .sort((a, z) => z.ref_count - a.ref_count);

    const media_accounts = mediaRows.map(c => this._mediaAccountRow(c, meta.canonical_source));
    const top = media_accounts[0];
    const recommendations = top ? [{
      canonical_source: meta.canonical_source,
      media_key: top.media_key,
      media_name: top.name,
      priority: 1,
      score: 99,
      ref_count: totalRef,
      query_count: qids.length,
      article_count: articleIds.size,
      sell_price: top.sell_price,
      cost_per_ref: top.sell_price && totalRef ? this._n(top.sell_price / totalRef) : null,
      reason: `${meta.canonical_source}引用稳定，匹配到可投媒体「${top.name}」` +
        (top.sell_price && totalRef ? `，单次被引成本约 ${this._n(top.sell_price / totalRef)}。` : '。'),
      action: 'publish',
    }] : [];

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        summary: {
          total_ref_count: totalRef,
          total_sources: 1,
          recommended_count: recommendations.length,
        },
        recommendations,
        source: {
          canonical_source: meta.canonical_source,
          basic_info: {
            media_type: meta.category || '其他',
            region: '全国',
            available_media_count: fallbackCount,
            source_origin: '监控问题命中',
            category: meta.category || null,
            domain: (meta.domains && meta.domains[0]) || null,
          },
          description: `${meta.canonical_source}在当前统计范围内被引用 ${totalRef} 次，覆盖 ${qids.length} 个监控问题和 ${engineBreakdown.length} 个 AI 引擎。`,
          publish_stats: {
            expected_publish_time: null,
            inclusion_rate: null,
            average_success_rate: mediaRows.length ? 15 : null,
            inclusion_type: null,
          },
          citation_performance: {
            citation_index: Math.min(100, totalRef),
            total_ref_count: totalRef,
            article_count: articleIds.size,
            query_count: qids.length,
            engine_count: engineBreakdown.length,
            index_factors: { engine_coverage: engineBreakdown.length, query_coverage: qids.length },
            engine_breakdown: engineBreakdown,
            query_breakdown: queryBreakdown,
          },
          media_accounts,
        },
      },
    };
  }

  _mediaAccountRow(c, platformName) {
    return {
      media_key: c.media_key,
      name: c.name,
      category: c.type || 'selfmedia',
      taxonomy: (c.categories && c.categories[0]) || '',
      area: '全国',
      sell_price: c.sell_price != null ? c.sell_price : null,
      list_price: c.list_price != null ? c.list_price : null,
      inclusion: null,
      note: '',
      auth_status: 0,
      success_rate: 0,
      publish_time: null,
      platform: platformName || c.name || '',
      logo: c.favicon || '',
      case_url: c.site_url || '',
      is_recommend: false,
      can_geo: false,
      fav: false,
      ai_cite_count: c.ref_count || 0,
    };
  }

  /** POST /reference_source/media_accounts */
  async mediaAccounts() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.size || b.page_size, 10) || 50));
    const meta = await this._resolveSourceMeta(b.canonical_source || b.source_name, b.source_id);
    const name = (meta && meta.canonical_source) || String(b.canonical_source || '').trim();
    const q = name
      ? { $or: [
        ...(meta && meta.source_id ? [{ source_id: meta.source_id }] : []),
        ...(meta && meta.media_key ? [{ media_key: meta.media_key }] : []),
        { name },
      ] }
      : { enabled: true };

    let sort = { sell_price: 1 };
    if (b.sort === 'priceDesc') sort = { sell_price: -1 };
    else if (b.sort === 'citeDesc') sort = { ref_count: -1 };

    const [ total, rows ] = await Promise.all([
      ctx.model.MediaChannel.countDocuments(q),
      ctx.model.MediaChannel.find(q).sort(sort).skip((page - 1) * size).limit(size).lean(),
    ]);
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(c => this._mediaAccountRow(c, name)),
        total: total || rows.length,
        page,
        page_size: size,
      },
    };
  }

  /** POST /summary/reference_source/tag_own_article */
  async tagOwnArticle() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const articleId = String(b.article_id || '').trim();
    const url = String(b.url || b.canonical_url || '').trim();
    let article = null;
    if (articleId) article = await ctx.model.CitedArticle.findOne({ article_id: articleId });
    if (!article && url) {
      article = await ctx.model.CitedArticle.findOne({
        $or: [ { canonical_url: url }, { url } ],
      });
    }
    if (!article) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '文章不存在' };
      return;
    }
    const isOwn = b.is_own === false || b.is_own === 0 || b.is_own === 'false' ? false : true;
    article.is_brand_published = isOwn;
    await article.save();
    await ctx.model.CitationEdge.updateMany(
      { brand_id: brand.brand_id, article_id: article.article_id },
      { $set: { is_own: isOwn } },
    );
    ctx.body = {
      code: 200, msg: 'ok',
      data: { article_id: article.article_id, is_own: isOwn, is_brand_published: isOwn },
    };
  }

  /** POST /article/library/import — 导入自有文章 */
  async importOwnArticles() {
    const { ctx } = this;
    const crypto = require('crypto');
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const items = Array.isArray(b.items) ? b.items : (Array.isArray(b.articles) ? b.articles : []);
    if (!items.length && (b.url || b.canonical_url)) {
      items.push({ title: b.title || '', url: b.url || b.canonical_url });
    }
    if (!items.length) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '请提供文章链接' };
      return;
    }

    const today = ctx.app.dayjs().format('YYYY-MM-DD');
    const imported = [];
    for (const it of items) {
      const rawUrl = String(it.url || it.canonical_url || '').trim();
      if (!rawUrl) continue;
      let canon = rawUrl;
      try {
        const u = new URL(rawUrl);
        u.hash = '';
        [ 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content' ].forEach(k => u.searchParams.delete(k));
        canon = u.toString();
      } catch { /* keep raw */ }
      const article_id = crypto.createHash('sha1').update(canon).digest('hex').slice(0, 16);
      const title = String(it.title || '').trim() || canon;
      const rawType = String(it.type || it.content_type || 'graphic').toLowerCase();
      const content_type = rawType === 'video' || rawType === '视频' ? 'video' : 'graphic';
      const source_kind = it.source_kind === 'publish' ? 'publish' : 'own';
      const doc = await ctx.model.CitedArticle.findOneAndUpdate(
        { canonical_url: canon },
        {
          $set: {
            article_id,
            brand_id: brand.brand_id,
            url: rawUrl,
            title,
            is_brand_published: source_kind === 'publish',
            source_kind,
            content_type,
            registered_at: today,
            last_cited_at: today,
          },
          $setOnInsert: { first_cited_at: today },
        },
        { upsert: true, new: true },
      );
      await ctx.model.CitationEdge.updateMany(
        { brand_id: brand.brand_id, article_id: doc.article_id },
        { $set: { is_own: true } },
      );
      imported.push({
        article_id: doc.article_id,
        title: doc.title,
        url: doc.url || doc.canonical_url,
        content_type,
        source_kind,
        is_brand_published: !!doc.is_brand_published,
      });
    }
    ctx.body = { code: 200, msg: 'ok', data: { imported, count: imported.length } };
  }

  /* ---------- 信源洞察 4 件套（对标响应形状） ---------- */

  /** data: { dates: [], sources: [{ name, total, series: [] }] } */
  async sourceTrend() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const topN = Number(b.top_n) || 10;
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const dates = this._dateRange(start, end);
    const qt = this._qt(b);
    const plat = b.platform && b.platform !== 'all' && b.platform !== 'null'
      ? this._engine(String(b.platform))
      : null;

    const q = { brand_id: brand.brand_id };
    if (start && end) q.date = { $gte: start, $lte: end };
    if (plat) q.platform = plat;
    const edges = await ctx.model.CitationEdge.find(q)
      .select('source_id date platform query_id query_type')
      .lean();
    const qtMap = await this._resolveQtMap(edges);

    const bySourceDate = {};
    const totalBySource = {};
    for (const e of edges) {
      if (this._edgeQt(e, qtMap) !== qt) continue;
      totalBySource[e.source_id] = (totalBySource[e.source_id] || 0) + 1;
      const d = (bySourceDate[e.source_id] ||= {});
      d[e.date] = (d[e.date] || 0) + 1;
    }
    const topIds = Object.entries(totalBySource).sort((a, z) => z[1] - a[1]).slice(0, topN).map(([id]) => id);
    const sources = await ctx.model.CanonicalSource.find({ source_id: { $in: topIds } }).lean();
    const nameMap = {}; for (const s of sources) nameMap[s.source_id] = s.canonical_source;

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        dates,
        sources: topIds.map(id => ({
          name: nameMap[id] || id,
          total: totalBySource[id] || 0,
          series: dates.map(d => (bySourceDate[id] || {})[d] || 0),
        })),
      },
    };
  }

  /** data: { sources: [{ canonical_source, category, engines:{<engine>:{cur,cmp,chg}}, cur_total, cmp_total, chg_total }] } */
  async enginePreference() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const qt = this._qt(b);
    const cur = await this._aggRange(brand.brand_id, String(b.start_date || '').slice(0, 10), String(b.end_date || '').slice(0, 10), qt);
    const cmp = await this._aggRange(brand.brand_id, String(b.cmp_start_date || '').slice(0, 10), String(b.cmp_end_date || '').slice(0, 10), qt);

    const allIds = new Set([...Object.keys(cur), ...Object.keys(cmp)]);
    const sources = await ctx.model.CanonicalSource.find({ source_id: { $in: [...allIds] } }).lean();
    const metaMap = {}; for (const s of sources) metaMap[s.source_id] = s;

    const list = [...allIds]
      .map(id => {
        const c = cur[id] || { total: 0, engines: {} };
        const p = cmp[id] || { total: 0, engines: {} };
        const engines = {};
        for (const e of ENGINE_ORDER) {
          const cv = c.engines[e] || 0;
          const pv = p.engines[e] || 0;
          if (cv || pv) engines[e] = { cur: cv, cmp: pv, chg: cv - pv };
        }
        return {
          canonical_source: (metaMap[id] || {}).canonical_source || id,
          category: (metaMap[id] || {}).category || null,
          engines,
          cur_total: c.total, cmp_total: p.total, chg_total: c.total - p.total,
        };
      })
      .sort((a, z) => z.cur_total - a.cur_total);
    ctx.body = { code: 200, msg: 'ok', data: { sources: list } };
  }

  /** data: { trend: [{ date, own_count, total_count, rate }], summary: { cited, cited_chg, rate_now, rate_chg, own_articles, own_articles_chg } } */
  async ownTrend() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const dates = this._dateRange(start, end);
    const qt = this._qt(b);
    const plat = b.platform && b.platform !== 'all' && b.platform !== 'null' && b.platform !== '综合'
      ? this._engine(String(b.platform))
      : null;

    const daily = async (s, e) => {
      const q = { brand_id: brand.brand_id };
      if (s && e) q.date = { $gte: s, $lte: e };
      if (plat) q.platform = plat;
      const edges = await ctx.model.CitationEdge.find(q)
        .select('date query_id query_type is_own')
        .lean();
      const qtMap = await this._resolveQtMap(edges);
      const byDate = {};
      for (const edge of edges) {
        if (this._edgeQt(edge, qtMap) !== qt) continue;
        const d = (byDate[edge.date] ||= { own: 0, total: 0 });
        d.total += 1;
        if (edge.is_own) d.own += 1;
      }
      return byDate;
    };
    const curMap = await daily(start, end);
    const cmpMap = await daily(String(b.cmp_start_date || '').slice(0, 10), String(b.cmp_end_date || '').slice(0, 10));

    const trend = dates.map(date => {
      const d = curMap[date] || { own: 0, total: 0 };
      return { date, own_count: d.own, total_count: d.total, rate: this._n(d.total ? d.own / d.total * 100 : 0) };
    });
    const sum = m => Object.values(m).reduce((s, d) => s + d.own, 0);
    const totalOf = m => Object.values(m).reduce((s, d) => s + d.total, 0);
    const cited = sum(curMap);
    const citedCmp = sum(cmpMap);
    const totalCur = totalOf(curMap);
    const totalCmp = totalOf(cmpMap);
    const rateNow = this._n(totalCur ? cited / totalCur * 100 : 0);
    const rateCmp = this._n(totalCmp ? citedCmp / totalCmp * 100 : 0);

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        trend,
        summary: {
          cited, cited_chg: cited - citedCmp,
          rate_now: rateNow, rate_chg: this._n(rateNow - rateCmp),
          own_articles: cited, own_articles_chg: cited - citedCmp,
        },
      },
    };
  }

  /** data: { list: [{ name, category, cur_total, cmp_total, change, change_pct, status, tag, engines:{<engine>:{cur,cmp}}, own_rate }], total, page, page_size } */
  async perspective() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    const empty = { list: [], total: 0, page: 1, page_size: 20 };
    if (!brand) return;

    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(200, Math.max(1, parseInt(b.page_size, 10) || 20));
    const view = String(b.view || 'source');
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const cmpStart = String(b.cmp_start_date || '').slice(0, 10);
    const cmpEnd = String(b.cmp_end_date || '').slice(0, 10);
    const plat = b.platform && b.platform !== 'all' && b.platform !== 'null'
      ? this._engine(String(b.platform))
      : null;
    const filterQid = parseInt(b.query_id, 10);
    const qt = this._qt(b);

    // 对标筛选项：本期新增 / 持续被引 / 本期流失
    const statusAlias = {
      '本期新增': '本期新增',
      '新增被引': '本期新增',
      '持续被引': '持续被引',
      '本期流失': '本期流失',
      '停止被引': '本期流失',
    };

    const toStatus = (curTotal, cmpTotal) => {
      if (curTotal > 0 && cmpTotal > 0) return '持续被引';
      if (curTotal > 0 && cmpTotal === 0) return '本期新增';
      if (curTotal === 0 && cmpTotal > 0) return '本期流失';
      return '未提及';
    };

    let list = [];

    if (view === 'article' || view === 'own') {
      // 按文章聚合（own = 仅自有文章）；按 query_type 分流
      const edgeQ = { brand_id: brand.brand_id };
      if (start && end) edgeQ.date = { $gte: start, $lte: end };
      if (plat) edgeQ.platform = plat;
      if (Number.isFinite(filterQid) && filterQid > 0) edgeQ.query_id = filterQid;
      if (view === 'own') edgeQ.is_own = true;

      const cmpQ = { brand_id: brand.brand_id };
      if (cmpStart && cmpEnd) cmpQ.date = { $gte: cmpStart, $lte: cmpEnd };
      if (plat) cmpQ.platform = plat;
      if (Number.isFinite(filterQid) && filterQid > 0) cmpQ.query_id = filterQid;
      if (view === 'own') cmpQ.is_own = true;

      const [curEdgesRaw, cmpEdgesRaw] = await Promise.all([
        ctx.model.CitationEdge.find(edgeQ).select('article_id platform is_own query_id query_type').lean(),
        ctx.model.CitationEdge.find(cmpQ).select('article_id platform is_own query_id query_type').lean(),
      ]);
      const qtMap = await this._resolveQtMap([...curEdgesRaw, ...cmpEdgesRaw]);
      const agg = (edges) => {
        const m = {};
        for (const e of edges) {
          if (this._edgeQt(e, qtMap) !== qt) continue;
          if (!e.article_id) continue;
          const a = (m[e.article_id] ||= { total: 0, engines: {}, own: 0 });
          a.total += 1;
          if (e.is_own) a.own += 1;
          const p = this._engine(e.platform || '');
          if (p) a.engines[p] = (a.engines[p] || 0) + 1;
        }
        return m;
      };
      const cur = agg(curEdgesRaw);
      const cmp = agg(cmpEdgesRaw);
      const ids = [...new Set([...Object.keys(cur), ...Object.keys(cmp)])];
      const arts = ids.length
        ? await ctx.model.CitedArticle.find({ article_id: { $in: ids } }).select('article_id title url canonical_url').lean()
        : [];
      const artMap = {};
      for (const a of arts) artMap[a.article_id] = a;

      list = ids.map(id => {
        const c = cur[id] || { total: 0, engines: {}, own: 0 };
        const p = cmp[id] || { total: 0, engines: {}, own: 0 };
        const change = c.total - p.total;
        const change_pct = this._n(p.total ? change / p.total * 100 : (c.total ? 100 : 0), 1);
        const status = toStatus(c.total, p.total);
        const engines = {};
        for (const e of ENGINE_ORDER) {
          const cv = c.engines[e] || 0;
          const pv = p.engines[e] || 0;
          if (cv || pv) engines[e] = { cur: cv, cmp: pv };
        }
        const meta = artMap[id] || {};
        return {
          name: meta.title || meta.canonical_url || meta.url || id,
          category: null,
          cur_total: c.total, cmp_total: p.total, change, change_pct,
          status, tag: change > 0 ? '上升' : (change < 0 ? '下降' : '持平'),
          engines,
          own_rate: this._n(c.total ? c.own / c.total * 100 : 0),
        };
      });
    } else {
      const cur = await this._aggRange(brand.brand_id, start, end, qt, plat);
      const cmp = await this._aggRange(brand.brand_id, cmpStart, cmpEnd, qt, plat);
      const allIds = new Set([...Object.keys(cur), ...Object.keys(cmp)]);
      const sources = await ctx.model.CanonicalSource.find({ source_id: { $in: [...allIds] } }).lean();
      const metaMap = {}; for (const s of sources) metaMap[s.source_id] = s;

      list = [...allIds].map(id => {
        const c = cur[id] || { total: 0, engines: {}, own: 0 };
        const p = cmp[id] || { total: 0, engines: {}, own: 0 };
        const curTotal = c.total;
        const cmpTotal = p.total;
        const engines = {};
        for (const e of ENGINE_ORDER) {
          const cv = c.engines[e] || 0;
          const pv = p.engines[e] || 0;
          if (cv || pv) engines[e] = { cur: cv, cmp: pv };
        }
        const change = curTotal - cmpTotal;
        const change_pct = this._n(cmpTotal ? change / cmpTotal * 100 : (curTotal ? 100 : 0), 1);
        const status = toStatus(curTotal, cmpTotal);
        return {
          name: (metaMap[id] || {}).canonical_source || id,
          category: (metaMap[id] || {}).category || null,
          cur_total: curTotal, cmp_total: cmpTotal, change, change_pct,
          status, tag: change > 0 ? '上升' : (change < 0 ? '下降' : '持平'),
          engines,
          own_rate: this._n(c.total ? c.own / c.total * 100 : 0),
        };
      }).filter(x => x.cur_total > 0 || x.cmp_total > 0);
    }

    if (b.search) list = list.filter(x => (x.name || '').includes(String(b.search)));
    if (b.status && b.status !== '' && b.status !== '全部') {
      const want = statusAlias[String(b.status)] || String(b.status);
      list = list.filter(x => x.status === want);
    }

    const sortBy = { total: 'cur_total', change: 'change', change_pct: 'change_pct' }[b.sort_by] || 'cur_total';
    list.sort((a, z) => (b.sort_order === 'asc' ? a[sortBy] - z[sortBy] : z[sortBy] - a[sortBy]));

    const total = list.length;
    ctx.body = {
      code: 200, msg: 'ok',
      data: { list: list.slice((page - 1) * size, page * size), total, page, page_size: size },
    };
  }

  async topics() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const qt = this._qt(ctx.query);
    const rows = await ctx.model.MonitorQuery.find({
      brand_id: brand.brand_id,
      query_status: true,
      query_type: qt,
    }).lean();
    ctx.body = { code: 200, msg: 'ok', data: rows.map(m => ({ query_id: m.query_id, name: m.query })) };
  }

  /* ---------- 快照（对齐 /snapshot/export/list） ---------- */
  async snapshotList() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const empty = { list: [], total: 0, page: 1, page_size: 10 };
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(50, Math.max(1, parseInt(b.page_size, 10) || 10));
    const queryType = b.query_type === 'brand' ? 'brand' : 'industry';
    const start = String(b.start_date || '').slice(0, 10);
    const platform = String(b.platform || '').trim().toLowerCase();
    const qid = parseInt(b.query_id, 10);

    // query_type → 限定该品牌下对应类型的 query_id 集合
    const typeQueries = await ctx.model.MonitorQuery.find(
      { brand_id: brand.brand_id, query_type: queryType },
      { query_id: 1, query: 1 },
    ).lean();
    const typeQids = typeQueries.map(q => q.query_id).filter(n => Number.isFinite(n));
    const queryNameById = {};
    for (const q of typeQueries) queryNameById[q.query_id] = q.query || '';

    if (!typeQids.length) {
      ctx.body = { code: 200, msg: 'ok', data: { ...empty, page, page_size: size } };
      return;
    }

    const q = { brand_id: brand.brand_id, query_id: { $in: typeQids } };
    if (start) q.exec_date = start;
    if (Number.isFinite(qid) && qid > 0) {
      if (!typeQids.includes(qid)) {
        ctx.body = { code: 200, msg: 'ok', data: { ...empty, page, page_size: size } };
        return;
      }
      q.query_id = qid;
    }
    if (platform && platform !== 'all') q.platform = platform;

    const [rows, total] = await Promise.all([
      ctx.model.Snapshot.find(q).sort({ created_at: -1 }).skip((page - 1) * size).limit(size).lean(),
      ctx.model.Snapshot.countDocuments(q),
    ]);

    const slotIds = rows.map(r => r.slot_id).filter(Boolean);
    const answerIds = rows.map(r => r.answer_id).filter(Boolean);
    const [answersBySlot, answersById, targetMentions, metricRows] = await Promise.all([
      slotIds.length
        ? ctx.model.RawAnswer.find(
          { slot_id: { $in: slotIds } },
          { slot_id: 1, answer_id: 1, answer_text: 1, question_sent: 1 },
        ).lean()
        : [],
      answerIds.length
        ? ctx.model.RawAnswer.find(
          { answer_id: { $in: answerIds } },
          { slot_id: 1, answer_id: 1, answer_text: 1, question_sent: 1 },
        ).lean()
        : [],
      slotIds.length
        ? ctx.model.BrandMention.find(
          { slot_id: { $in: slotIds }, is_target: true },
          { slot_id: 1, position: 1 },
        ).lean()
        : [],
      rows.length
        ? ctx.model.DailyMetricQuery.find({
          brand_id: brand.brand_id,
          date: { $in: [...new Set(rows.map(r => r.exec_date).filter(Boolean))] },
          query_id: { $in: [...new Set(rows.map(r => r.query_id))] },
          platform: { $in: [...new Set(rows.map(r => r.platform))] },
        }, { query_id: 1, platform: 1, date: 1, rank_value: 1 }).lean()
        : [],
    ]);

    const ansSlot = {};
    for (const a of answersBySlot) ansSlot[a.slot_id] = a;
    const ansId = {};
    for (const a of answersById) ansId[a.answer_id] = a;
    const rankBySlot = {};
    for (const m of targetMentions) {
      if (rankBySlot[m.slot_id] == null || m.position < rankBySlot[m.slot_id]) {
        rankBySlot[m.slot_id] = m.position;
      }
    }
    const rankByMetric = {};
    for (const m of metricRows) {
      rankByMetric[`${m.query_id}|${m.platform}|${m.date}`] = m.rank_value || '未提及';
    }

    ctx.body = {
      code: 200, msg: 'ok', data: {
        list: rows.map(r => {
          const ans = (r.slot_id && ansSlot[r.slot_id]) || (r.answer_id && ansId[r.answer_id]) || null;
          const answerText = ans && ans.answer_text ? String(ans.answer_text) : '';
          // 对标：无榜单/无指标时前端显示 "-"；有 daily_metric 的「未提及」才出徽章
          let rank = '';
          if (r.slot_id && rankBySlot[r.slot_id] != null) rank = String(rankBySlot[r.slot_id]);
          else {
            const mk = `${r.query_id}|${r.platform}|${r.exec_date}`;
            if (rankByMetric[mk]) rank = String(rankByMetric[mk]);
          }
          const queryName = queryNameById[r.query_id]
            || (ans && ans.question_sent)
            || '';
          return {
            id: r.snapshot_id,
            snapshot_id: r.snapshot_id,
            slot_id: r.slot_id || null,
            platform: r.platform,
            end: 'web',
            photo_url: r.photo_url || null,
            oss_key: r.oss_key || null,
            exec_date: r.exec_date,
            query_id: r.query_id,
            query: queryName,
            size: r.size || null,
            size_label: this._formatBytes(r.size),
            rank_value: rank,
            has_answer: !!answerText,
            answer_preview: answerText ? answerText.slice(0, 160) : '',
          };
        }),
        total, page, page_size: size,
      },
    };
  }

  /** 查看单条快照对应的原始回答 */
  async snapshotAnswer() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const snapshotId = String(b.snapshot_id || b.id || '').trim();
    if (!snapshotId) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '缺少 snapshot_id' };
      return;
    }
    const snap = await ctx.model.Snapshot.findOne({
      snapshot_id: snapshotId,
      brand_id: brand.brand_id,
    }).lean();
    if (!snap) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '快照不存在' };
      return;
    }
    let ans = null;
    if (snap.slot_id) {
      ans = await ctx.model.RawAnswer.findOne({ slot_id: snap.slot_id }).lean();
    }
    if (!ans && snap.answer_id) {
      ans = await ctx.model.RawAnswer.findOne({ answer_id: snap.answer_id }).lean();
    }
    const mq = await ctx.model.MonitorQuery.findOne(
      { brand_id: brand.brand_id, query_id: snap.query_id },
      { query: 1 },
    ).lean();
    ctx.body = {
      code: 200, msg: 'ok', data: {
        snapshot_id: snap.snapshot_id,
        platform: snap.platform,
        exec_date: snap.exec_date,
        query_id: snap.query_id,
        query: (mq && mq.query) || (ans && ans.question_sent) || '',
        photo_url: snap.photo_url || null,
        answer_text: (ans && ans.answer_text) || '',
        cited_urls: (ans && ans.cited_urls) || [],
      },
    };
  }

  /** 批量导出回答文本（Excel 友好 CSV） */
  async snapshotExportText() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const queryType = b.query_type === 'brand' ? 'brand' : 'industry';
    const start = String(b.start_date || '').slice(0, 10);
    const platform = String(b.platform || '').trim().toLowerCase();
    const qid = parseInt(b.query_id, 10);

    const typeQueries = await ctx.model.MonitorQuery.find(
      { brand_id: brand.brand_id, query_type: queryType },
      { query_id: 1, query: 1 },
    ).lean();
    const typeQids = typeQueries.map(q => q.query_id).filter(n => Number.isFinite(n));
    const queryNameById = {};
    for (const q of typeQueries) queryNameById[q.query_id] = q.query || '';

    const q = { brand_id: brand.brand_id, query_id: { $in: typeQids.length ? typeQids : [-1] } };
    if (start) q.exec_date = start;
    if (Number.isFinite(qid) && qid > 0) q.query_id = qid;
    if (platform && platform !== 'all') q.platform = platform;

    const rows = await ctx.model.Snapshot.find(q).sort({ created_at: -1 }).limit(200).lean();
    const slotIds = rows.map(r => r.slot_id).filter(Boolean);
    const answers = slotIds.length
      ? await ctx.model.RawAnswer.find({ slot_id: { $in: slotIds } }).lean()
      : [];
    const ansBySlot = {};
    for (const a of answers) ansBySlot[a.slot_id] = a;

    const PLATFORM_NAME = {
      doubao: '豆包', deepseek: 'DeepSeek', wenxin: '文心一言', qwen: '通义千问', yuanbao: '元宝',
    };
    const lines = [['日期', '平台', '问题', '排行', '回答']];
    for (const r of rows) {
      const ans = (r.slot_id && ansBySlot[r.slot_id]) || null;
      lines.push([
        r.exec_date || '',
        PLATFORM_NAME[r.platform] || r.platform || '',
        queryNameById[r.query_id] || (ans && ans.question_sent) || '',
        '',
        (ans && ans.answer_text) || '',
      ]);
    }
    const csv = `\uFEFF${lines.map(row => row.map(c => {
      const s = String(c == null ? '' : c).replace(/"/g, '""');
      return `"${s}"`;
    }).join(',')).join('\n')}`;
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', `attachment; filename="snapshot-answers-${start || 'export'}.csv"`);
    ctx.body = csv;
  }

  _formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n <= 0) return '—';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  }
}

module.exports = SourceController;
