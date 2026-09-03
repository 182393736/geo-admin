'use strict';
/**
 * CORS：gen-user-site 等前端直连 API 场景（非 nitro 代理）兜底。
 * 鉴权走 Authorization 头（无 Cookie），回显 Origin 即可；OPTIONS 预检短路。
 */
module.exports = () => {
  return async function cors(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', ctx.get('Origin') || '*');
    ctx.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    ctx.set('Access-Control-Max-Age', '86400');
    if (ctx.method === 'OPTIONS') {
      ctx.status = 204;
      return;
    }
    await next();
  };
};
