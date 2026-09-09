'use strict';
/**
 * 采集 worker 服务鉴权中间件（机器对机器，与用户 JWT 无关）
 * - 校验请求头 Authorization: Bearer <COLLECTOR_API_KEY>，或 X-Collector-Key
 * - 通过后挂 ctx.state.collector = true
 * - 未配置 key 时 503（拒绝放行），凭证错误统一 401
 */
module.exports = () => async function collectorAuth(ctx, next) {
  const cfg = ctx.app.config.collector || {};
  const expected = String(cfg.apiKey || '');
  if (!expected) {
    ctx.status = 503;
    ctx.body = { code: 503, msg: '采集服务未配置 COLLECTOR_API_KEY' };
    return;
  }
  const header = ctx.get('Authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const supplied = bearer || (ctx.get('X-Collector-Key') || '').trim();
  if (!supplied || supplied !== expected) {
    ctx.status = 401;
    ctx.body = { code: 401, msg: '采集凭证无效' };
    return;
  }
  ctx.state.collector = true;
  await next();
};
