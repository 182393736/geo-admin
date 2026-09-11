'use strict';
/**
 * LLM 统一客户端（gen-api 侧所有 LLM 调用唯一入口）
 * ------------------------------------------------------------------
 * 协议：OpenAI 兼容 POST {baseURL}/chat/completions，默认跟随 config.llm 当前供应商
 *       （siliconflow / agnes / deepseek / mistral，LLM_PROVIDER 切换），向后兼容旧 config.deepseek。
 * 传输层：复用 @geo-admin/geo-agent 的 createSiliconFlowClient —— 全局 fetch + undici ProxyAgent
 *         显式代理，与「首登分析」完全同一条通道。开发环境走 LLM_PROXY（如 http://localhost:1087），
 *         生产不设置即直连。⚠️ 不再用 ctx.curl：urllib v4 已移除 proxy 选项，dispatcher 透传不可靠，
 *         曾导致直连 api.mistral.ai 超时。
 * 约定：所有结构化抽取强制 JSON Mode（response_format: json_object）；
 *       供应商不认该参数（400）时自动去掉重试一次；解析失败再按 JSON 修复重试一次。
 */
const { Service } = require('egg');
const { createSiliconFlowClient } = require('@geo-admin/geo-agent');

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
      // 显式 HTTP(S) 代理：本地开发走本机代理访问海外供应商（如 Mistral）；生产不设置即直连
      proxy: String(llm.proxy || process.env.LLM_PROXY || '').trim() || '',
    };
  }

  /** geo-agent 客户端（与首登分析同源：fetch + undici ProxyAgent；多 key 轮询 + 网络重试） */
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

  /** 原始对话：messages → { content, usage } */
  async chat(messages, opts = {}) {
    if (!this.cfg.apiKeys.length) throw new Error('LLM 未配置 API Key（请设置 LLM_PROVIDER 对应供应商的 *_API_KEY / *_API_KEYS）');
    const { content, usage } = await this.client.chat(messages, opts);
    return { content, usage };
  }

  /** 结构化调用：schema 仅用于提示词注入，返回 { data, usage }（JSON 模式 + 解析失败补救） */
  async chatJson({ system, user, schemaHint, ...opts }) {
    if (!this.cfg.apiKeys.length) throw new Error('LLM 未配置 API Key（请设置 LLM_PROVIDER 对应供应商的 *_API_KEY / *_API_KEYS）');
    const { data, usage } = await this.client.chatJson({ system, user, schemaHint, ...opts });
    return { data, usage };
  }

  safeParse(s) { try { return JSON.parse(s); } catch { return null; } }

  /**
   * 流水线A：排名抽取 —— 从 AI 回答原文抽取有序品牌/厂家名录
   * 返回 [{ name, norm_name, position, snippet }]
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
      timeoutMs: 60000,
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
      timeoutMs: 60000,
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
