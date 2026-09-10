'use strict';
/**
 * LLM 统一客户端（gen-api 侧所有 LLM 调用唯一入口）
 * ------------------------------------------------------------------
 * 协议：OpenAI 兼容 POST {baseURL}/chat/completions，默认跟随 config.llm 当前供应商
 *       （siliconflow / agnes / deepseek，LLM_PROVIDER 切换），向后兼容旧 config.deepseek。
 * 约定：所有结构化抽取强制 JSON Mode（response_format: json_object）；
 *       供应商不认该参数（400）时自动去掉重试一次；解析失败再按 JSON 修复重试一次。
 */
const { Service } = require('egg');

/** 品牌名规范化兜底：去空白、去常见公司/法律/电商后缀（LLM 未给 norm_name 时使用） */
const BRAND_SUFFIXES = [
  '有限责任公司', '股份有限公司', '集团有限公司', '实业有限公司', '科技有限公司', '家具有限公司',
  '有限公司', '集团', '股份', '实业', '公司', '厂', '官网', '官方网站', '旗舰店', '专卖店',
];
function normalizeBrandName(name) {
  let s = String(name || '').replace(/\s+/g, '');
  for (const suf of BRAND_SUFFIXES) {
    if (s.endsWith(suf)) { s = s.slice(0, -suf.length); break; }
  }
  return s;
}

class DeepseekService extends Service {
  /** 当前供应商配置：config.llm（apiKey(s)/baseURL/model/chatTemplateKwargs）> config.deepseek */
  get cfg() {
    const llm = this.config.llm || {};
    const keys = (Array.isArray(llm.apiKeys) && llm.apiKeys.length)
      ? llm.apiKeys
      : (llm.apiKey ? [llm.apiKey] : ((this.config.deepseek || {}).apiKey ? [(this.config.deepseek || {}).apiKey] : []));
    return {
      apiKeys: keys,
      baseURL: (llm.baseURL || (this.config.deepseek || {}).baseURL || 'https://api.deepseek.com').replace(/\/+$/, ''),
      model: llm.model || (this.config.deepseek || {}).model || 'deepseek-chat',
      chatTemplateKwargs: llm.chatTemplateKwargs || null,
      // 显式 HTTP(S) 代理：本地开发走本机代理访问海外供应商（如 Mistral）；生产不设置即直连
      proxy: String(llm.proxy || process.env.LLM_PROXY || '').trim() || '',
    };
  }

  /** 多 key 轮询：每次调用取下一个 key，重试自动换 key 分摊速率限制 */
  nextKey() {
    const keys = this.cfg.apiKeys;
    if (!keys.length) return '';
    if (this._keyCursor === undefined) this._keyCursor = 0;
    return keys[this._keyCursor++ % keys.length];
  }

  async chat(messages, { model, temperature = 0.2, jsonMode = true, maxTokens = 4096 } = {}) {
    const { ctx } = this;
    const c = this.cfg;
    if (!c.apiKeys.length) throw new Error('LLM 未配置 API Key（请设置 LLM_PROVIDER 对应供应商的 *_API_KEY / *_API_KEYS）');
    const body = {
      model: model || c.model, temperature, messages, max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      ...(c.chatTemplateKwargs ? { chat_template_kwargs: c.chatTemplateKwargs } : {}),
    };
    let resp;
    try {
      resp = await ctx.curl(`${c.baseURL}/chat/completions`, {
        method: 'POST', timeout: 60000,
        headers: { Authorization: `Bearer ${this.nextKey()}`, 'Content-Type': 'application/json' },
        contentType: 'json', data: body, dataType: 'json',
        ...(c.proxy ? { proxy: c.proxy } : {}),
      });
    } catch (e) {
      // 供应商不认 response_format → 去掉重试一次
      if (jsonMode && e.status === 400) {
        const { response_format, ...rest } = body;
        resp = await ctx.curl(`${c.baseURL}/chat/completions`, {
          method: 'POST', timeout: 60000,
          headers: { Authorization: `Bearer ${this.nextKey()}`, 'Content-Type': 'application/json' },
          contentType: 'json', data: rest, dataType: 'json',
          ...(c.proxy ? { proxy: c.proxy } : {}),
        });
      } else {
        throw e;
      }
    }
    const content = resp.data?.choices?.[0]?.message?.content ?? '';
    return { content, usage: resp.data?.usage };
  }

  /** 结构化调用：schema 仅用于提示词注入与校验注释，返回 JSON 对象 */
  async chatJson({ system, user, schemaHint, ...opts }) {
    const sys = `${system}\n【严格要求】只输出合法 JSON 对象，不要任何解释、不要 markdown 围栏。结构必须符合：\n${schemaHint}`;
    let { content, usage } = await this.chat([{ role: 'system', content: sys }, { role: 'user', content: user }], opts);
    let data = this.safeParse(content);
    if (data === null) {
      // 失败补救：抽取第一个 {...} 区块重试一次
      const m = content.match(/\{[\s\S]*\}/);
      if (m) data = this.safeParse(m[0]);
    }
    if (data === null) throw new Error(`LLM JSON 解析失败: ${content.slice(0, 200)}`);
    return { data, usage };
  }

  safeParse(s) { try { return JSON.parse(s); } catch { return null; } }

  /**
   * 流水线A：排名抽取 —— 从 AI 回答原文抽取有序品牌/厂家名录
   * 返回 [{ name, norm_name, position, snippet }]
   *  - name      回答中出现的原始名称
   *  - norm_name 规范化简称（去公司/集团/实业等后缀与地名），作 canonical_name 归并与别名命中的键
   *  - position  位次（1 起）
   *  - snippet   名称附近原文短句
   */
  async extractRankedList(answerText) {
    const schemaHint = `{
  "list": [
    { "name": "回答中出现的品牌/厂家原始名称", "norm_name": "规范化简称（去掉 有限公司/集团/股份/实业 等后缀与地名，如 '佛山市宏祥家具实业有限公司'→'宏祥家具'）", "position": 1, "snippet": "名称附近原文短句(<=40字)" }
  ]
}`;
    const { data } = await this.chatJson({
      system: '你是品牌榜单抽取助手。从 AI 引擎回答原文中按出现顺序抽取被推荐的品牌/厂家/公司。规则：\n1. 只抽取真实品牌或公司实体，不抽产品型号、材质、地名、平台名；\n2. 同一品牌只保留第一次出现的位置；\n3. 去掉「推荐/第一名/首选」等修饰词，保留名称本体；\n4. 回答未明确推荐任何品牌时返回空列表 list: []。',
      user: `回答原文：\n${String(answerText || '').slice(0, 8000)}`,
      schemaHint,
    });
    const list = Array.isArray(data && data.list) ? data.list : [];
    return list
      .map((x, i) => {
        const name = String((x && x.name) || '').trim();
        if (!name) return null;
        const norm = String((x && x.norm_name) || '').trim() || normalizeBrandName(name);
        return {
          name: name.slice(0, 80),
          norm_name: (norm || name).slice(0, 80),
          position: Number.isFinite(Number(x && x.position)) ? Number(x.position) : i + 1,
          snippet: String((x && x.snippet) || '').trim().slice(0, 200),
        };
      })
      .filter(Boolean)
      .slice(0, 40);
  }

  /**
   * 流水线B：口碑抽取 —— 从 AI 回答原文抽取市场/用户评价观点
   * 返回 [{ quote, label, polarity, target }]
   *  - quote    观点原文短句（逐字来自原文）
   *  - label    观点主题归并词（同义观点用同一 label）
   *  - polarity positive | neutral | negative
   *  - target   该观点针对的品牌/厂家名（无则空字符串）
   */
  async extractOpinions(answerText) {
    const schemaHint = `{
  "opinions": [
    { "quote": "观点原文短句(<=30字，必须逐字来自原文，不得改写)", "label": "观点主题词(<=10字，如 交期/价格/质量/售后/款式)", "polarity": "positive|neutral|negative", "target": "该观点针对的品牌/厂家名(无则空字符串)" }
  ]
}`;
    const { data } = await this.chatJson({
      system: '你是口碑观点抽取助手。从 AI 回答原文中抽取市场/用户对品牌、产品、厂家的评价观点。规则：\n1. quote 必须逐字来自原文，不得改写或拼接；\n2. label 是观点主题的归并词，同义观点用同一 label；\n3. polarity 三选一（positive/neutral/negative）；\n4. 没有明确评价时返回空列表 opinions: []。',
      user: `回答原文：\n${String(answerText || '').slice(0, 8000)}`,
      schemaHint,
    });
    const opinions = Array.isArray(data && data.opinions) ? data.opinions : [];
    return opinions
      .map(x => {
        const quote = String((x && x.quote) || '').trim().slice(0, 200);
        if (!quote) return null;
        const pol = String((x && x.polarity) || '').toLowerCase();
        return {
          quote,
          label: String((x && x.label) || '').trim().slice(0, 40) || '综合',
          polarity: ['positive', 'neutral', 'negative'].includes(pol) ? pol : 'neutral',
          target: String((x && (x.target || x.target_entity)) || '').trim().slice(0, 80),
        };
      })
      .filter(Boolean)
      .slice(0, 60);
  }
}
module.exports = DeepseekService;
