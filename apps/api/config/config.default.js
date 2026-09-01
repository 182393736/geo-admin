'use strict';
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
  // 登录 JWT：生产务必用环境变量覆盖 secret
  jwt: { secret: process.env.JWT_SECRET || 'geo-jwt-dev-secret', expiresIn: '7d' },
  rankWeights: [40, 20, 20, 16, 16, 13.33, 10, 10, 8, 8], // 实测逆向的位次权重（第1~10名），可配置校准
  platforms: ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao'],
});
