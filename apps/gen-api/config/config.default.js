'use strict';
const { resolveKey } = require('@geo-admin/geo-agent');

module.exports = () => ({
  mongoose: {
    client: {
      url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/geo',
      options: { autoIndex: true, useUnifiedTopology: true, useNewUrlParser: true,
             serverSelectionTimeoutMS: 8000, reconnectTries: 10 },
    },
  },
  security: { csrf: { enable: false } }, // API 走 JWT Bearer，无表单 CSRF 面
  keys: 'geo-secret',
  deepseek: { apiKey: process.env.DEEPSEEK_API_KEY || '' },
  // 首登分析 Agent（packages/geo-agent）：硅基流动 OpenAI 兼容协议。
  // 密钥优先级：环境变量 > packages/geo-agent/src/dev-keys.js 内置测试密钥（私有仓库开发用，生产用 env 覆盖）。
  siliconflow: {
    apiKey: resolveKey('SILICONFLOW_API_KEY'),
    baseURL: resolveKey('SILICONFLOW_BASE_URL'),
    model: resolveKey('SILICONFLOW_MODEL'),
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
});
