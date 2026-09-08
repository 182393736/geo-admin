'use strict';
const { resolveKey, resolveKeys } = require('@geo-admin/geo-agent');

/**
 * 大模型供应商预设（OpenAI 兼容协议）
 * - 切换：环境变量 LLM_PROVIDER=mistral | siliconflow | agnes | deepseek（默认 mistral）
 * - 各供应商可再用 *_API_KEY(S) / *_BASE_URL / *_MODEL 环境变量覆盖
 * - mistral：ministral-3b-2512，多 key 轮询（MISTRAL_API_KEYS 支持 JSON 数组或逗号分隔）
 * - agnes 默认关闭思考模式（enable_thinking:false，降延迟省 token），AGNES_ENABLE_THINKING=1 打开
 */
const LLM_PROVIDERS = {
  mistral: {
    apiKeys: resolveKeys('MISTRAL_API_KEYS'),
    baseURL: resolveKey('MISTRAL_BASE_URL'),
    model: resolveKey('MISTRAL_MODEL'),
    chatTemplateKwargs: null,
  },
  siliconflow: {
    apiKey: resolveKey('SILICONFLOW_API_KEY'),
    baseURL: resolveKey('SILICONFLOW_BASE_URL'),
    model: resolveKey('SILICONFLOW_MODEL'),
    chatTemplateKwargs: null,
  },
  agnes: {
    apiKey: resolveKey('AGNES_API_KEY'),
    baseURL: resolveKey('AGNES_BASE_URL'),
    model: resolveKey('AGNES_MODEL'),
    chatTemplateKwargs: process.env.AGNES_ENABLE_THINKING === '1' ? null : { enable_thinking: false },
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    chatTemplateKwargs: null,
  },
};

/** 供应商 → 统一形态：apiKey（首个，兼容旧消费方）+ apiKeys（数组，轮询） */
function normalizeProvider(p) {
  const keys = Array.isArray(p.apiKeys) && p.apiKeys.length ? p.apiKeys : (p.apiKey ? [p.apiKey] : []);
  return {
    apiKey: keys[0] || '',
    apiKeys: keys,
    baseURL: p.baseURL || '',
    model: p.model || '',
    chatTemplateKwargs: p.chatTemplateKwargs ?? null,
  };
}

module.exports = () => {
  const rawProvider = process.env.LLM_PROVIDER || 'mistral';
  const provider = LLM_PROVIDERS[rawProvider] ? rawProvider : 'mistral'; // 未知值兜底到默认 mistral
  const active = normalizeProvider(LLM_PROVIDERS[provider]);
  return {
  mongoose: {
    client: {
      url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/geo',
      options: { autoIndex: true, useUnifiedTopology: true, useNewUrlParser: true,
             serverSelectionTimeoutMS: 8000, reconnectTries: 10 },
    },
  },
  security: { csrf: { enable: false } }, // API 走 JWT Bearer，无表单 CSRF 面
  keys: 'geo-secret',
  // 统一 LLM 配置：gen-api 所有大模型调用唯一入口（首登 Agent / 解析流水线 / 报告等）
  llm: {
    provider,
    apiKey: active.apiKey,
    apiKeys: active.apiKeys,
    baseURL: active.baseURL,
    model: active.model,
    chatTemplateKwargs: active.chatTemplateKwargs,
    providers: LLM_PROVIDERS,
  },
  // 向后兼容旧字段（agent_runner 等历史引用）
  siliconflow: {
    apiKey: LLM_PROVIDERS.siliconflow.apiKey,
    baseURL: LLM_PROVIDERS.siliconflow.baseURL,
    model: LLM_PROVIDERS.siliconflow.model,
  },
  deepseek: {
    apiKey: LLM_PROVIDERS.deepseek.apiKey,
    baseURL: LLM_PROVIDERS.deepseek.baseURL,
    model: LLM_PROVIDERS.deepseek.model,
  },
  // 联网取证（Tavily）：同样支持 env 覆盖内置测试密钥，未配置则降级不联网
  tavily: { apiKey: resolveKey('TAVILY_API_KEY') },
  // Agent 交互约束：免费版候选问题确认上限（对齐对标 free 套餐 query_limit=3）
  geoAgent: { freeQueryLimit: Number(process.env.GEO_FREE_QUERY_LIMIT || 3) },
  // CORS 兜底（前端直连场景；nitro 代理路径下同源不需要但无害）
  middleware: ['cors'],
  // 登录 JWT：生产务必用环境变量覆盖 secret
  jwt: { secret: process.env.JWT_SECRET || 'geo-jwt-dev-secret', expiresIn: '7d' },
  // 登录接口模拟网络延时（dev 便于观察 loading 态）；生产默认为 0
  loginDelayMs: process.env.NODE_ENV === 'production' ? 0 : 2000,
  rankWeights: [40, 20, 20, 16, 16, 13.33, 10, 10, 8, 8], // 实测逆向的位次权重（第1~10名），可配置校准
  platforms: ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao'],
  };
};
