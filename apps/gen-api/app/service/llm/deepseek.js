'use strict';
/**
 * LLM 统一客户端（gen-api 侧所有 LLM 调用唯一入口）
 * ------------------------------------------------------------------
 * 协议：OpenAI 兼容 POST {baseURL}/chat/completions，默认跟随 config.llm 当前供应商
 * 传输层：复用 @geo-admin/geo-agent 的 createSiliconFlowClient
 * 约定：所有结构化抽取强制 JSON Mode；调用结束写入 llm_call_logs（不阻塞失败主流程）
 */
const { Service } = require('egg');
const { createSiliconFlowClient } = require('@geo-admin/geo-agent');
const crypto = require('crypto');

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

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  const prompt = Number(usage.prompt_tokens) || 0;
  const completion = Number(usage.completion_tokens) || 0;
  const total = Number(usage.total_tokens) || (prompt + completion);
  return { prompt_tokens: prompt, completion_tokens: completion, total_tokens: total };
}

// 传输层参数只打印一次（schedule 每 tick 新建实例，避免刷屏）
let transportLogged = false;

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
      proxy: String(llm.proxy || process.env.LLM_PROXY || '').trim() || '',
    };
  }

  /** geo-agent 客户端（与首登分析同源） */
  get client() {
    if (!this._client) {
      const c = this.cfg;
      this._client = createSiliconFlowClient({
        apiKey: c.apiKeys[0] || '',
        apiKeys: c.apiKeys,
        baseURL: c.baseURL,
        model: c.model,
        chatTemplateKwargs: c.chatTemplateKwargs || null,
        proxy: c.proxy || undefined,
      });
      if (!transportLogged) {
        transportLogged = true;
        const appLogger = this.app && this.app.logger;
        if (appLogger) appLogger.info(`[llm] 传输层=geo-agent fetch 通道 model=${c.model} baseURL=${c.baseURL} proxy=${c.proxy || '(直连)'}`);
        else console.log(`[llm] 传输层=geo-agent fetch 通道 model=${c.model} baseURL=${c.baseURL} proxy=${c.proxy || '(直连)'}`);
      }
    }
    return this._client;
  }

  /** 异步写调用日志（失败只打日志，不抛） */
  async _logCall({
    call_site = 'UNKNOWN',
    user_id = '',
    brand_id = '',
    ref_id = '',
    prompt_version = 'v1',
    usage = null,
    latency_ms = 0,
    success = true,
    retry = 0,
    error = '',
    input_hash = '',
  } = {}) {
    try {
      await this.ctx.model.LlmCallLog.create({
        call_site: String(call_site || 'UNKNOWN').slice(0, 64),
        user_id: String(user_id || ''),
        brand_id: String(brand_id || ''),
        ref_id: String(ref_id || '').slice(0, 120),
        prompt_version: String(prompt_version || 'v1').slice(0, 32),
        model: this.cfg.model,
        input_hash: input_hash || undefined,
        usage: normalizeUsage(usage),
        latency_ms: Number(latency_ms) || 0,
        success: !!success,
        retry: Number(retry) || 0,
        error: error ? String(error).slice(0, 500) : undefined,
      });
    } catch (e) {
      this.ctx.logger.warn(`[llm] 写 llm_call_logs 失败: ${e.message}`);
    }
  }

  _stripMeta(opts = {}) {
    const { meta, ...rest } = opts || {};
    return { meta: meta || {}, clientOpts: rest };
  }

  /** 原始对话：messages → { content, usage }；opts.meta 用于记账 */
  async chat(messages, opts = {}) {
    if (!this.cfg.apiKeys.length) throw new Error('LLM 未配置 API Key（请设置 LLM_PROVIDER 对应供应商的 *_API_KEY / *_API_KEYS）');
    const { meta, clientOpts } = this._stripMeta(opts);
    const started = Date.now();
    let usage = null;
    let success = true;
    let errMsg = '';
    try {
      const r = await this.client.chat(messages, clientOpts);
      usage = r.usage;
      return r;
    } catch (e) {
      success = false;
      errMsg = e && e.message ? e.message : String(e);
      throw e;
    } finally {
      await this._logCall({
        ...meta,
        usage,
        latency_ms: Date.now() - started,
        success,
        error: errMsg,
        input_hash: crypto.createHash('sha1').update(JSON.stringify(messages || []).slice(0, 4000)).digest('hex').slice(0, 16),
      });
    }
  }

  /** 结构化调用：返回 { data, usage }；opts.meta 用于记账 */
  async chatJson({ system, user, schemaHint, meta, ...opts }) {
    if (!this.cfg.apiKeys.length) throw new Error('LLM 未配置 API Key（请设置 LLM_PROVIDER 对应供应商的 *_API_KEY / *_API_KEYS）');
    const started = Date.now();
    let usage = null;
    let success = true;
    let errMsg = '';
    try {
      const r = await this.client.chatJson({ system, user, schemaHint, ...opts });
      usage = r.usage;
      return r;
    } catch (e) {
      success = false;
      errMsg = e && e.message ? e.message : String(e);
      throw e;
    } finally {
      await this._logCall({
        ...(meta || {}),
        usage,
        latency_ms: Date.now() - started,
        success,
        error: errMsg,
        input_hash: crypto.createHash('sha1').update(String(user || '').slice(0, 4000)).digest('hex').slice(0, 16),
      });
    }
  }

  safeParse(s) { try { return JSON.parse(s); } catch { return null; } }

  /**
   * 流水线A：排名抽取 —— 从 AI 回答原文抽取有序品牌/厂家名录
   * meta: { brand_id, user_id, ref_id }
   */
  async extractRankedList(answerText, meta = {}) {
    const schemaHint = `{
  "list": [
    { "name": "回答中出现的品牌/厂家原始名称", "norm_name": "规范化简称（去掉 有限公司/集团/股份/实业 等后缀与地名，如 '佛山市宏祥家具实业有限公司'→'宏祥家具'）", "position": 1, "snippet": "名称附近原文短句(<=40字)" }
  ]
}`;
    const { data } = await this.chatJson({
      system: '你是品牌榜单抽取助手。从 AI 引擎回答原文中按出现顺序抽取被推荐的品牌/厂家/公司。规则：\n1. 只抽取真实品牌或公司实体，不抽产品型号、材质、地名、平台名；\n2. 同一品牌只保留第一次出现的位置；\n3. 去掉「推荐/第一名/首选」等修饰词，保留名称本体；\n4. 回答未明确推荐任何品牌时返回空列表 list: []。',
      user: `回答原文：\n${String(answerText || '').slice(0, 8000)}`,
      schemaHint,
      timeoutMs: 60000,
      meta: { call_site: 'LLM-07', prompt_version: 'v1', ...meta },
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
   * meta: { brand_id, user_id, ref_id }
   */
  async extractOpinions(answerText, meta = {}) {
    const schemaHint = `{
  "opinions": [
    { "quote": "观点原文短句(<=30字，必须逐字来自原文，不得改写)", "label": "观点主题词(<=10字，如 交期/价格/质量/售后/款式)", "polarity": "positive|neutral|negative", "target": "该观点针对的品牌/厂家名(无则空字符串)" }
  ]
}`;
    const { data } = await this.chatJson({
      system: '你是口碑观点抽取助手。从 AI 回答原文中抽取市场/用户对品牌、产品、厂家的评价观点。规则：\n1. quote 必须逐字来自原文，不得改写或拼接；\n2. label 是观点主题的归并词，同义观点用同一 label；\n3. polarity 三选一（positive/neutral/negative）；\n4. 没有明确评价时返回空列表 opinions: []。',
      user: `回答原文：\n${String(answerText || '').slice(0, 8000)}`,
      schemaHint,
      timeoutMs: 60000,
      meta: { call_site: 'LLM-09', prompt_version: 'v1', ...meta },
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
