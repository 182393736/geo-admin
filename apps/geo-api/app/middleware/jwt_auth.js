'use strict';
/**
 * JWT 鉴权中间件（Bearer token）
 * - 校验通过：ctx.state.user = { id, jti }
 * - 黑名单（登出 jti）：直接 401
 * 注意：只捕获 jwt.verify 的异常；控制器抛错应正常向上冒泡为 500，避免被误判为 401。
 */
module.exports = () => {
  const jwt = require('jsonwebtoken');
  return async function jwtAuth(ctx, next) {
    const header = ctx.get('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      ctx.status = 401;
      ctx.body = { code: 401, msg: '未登录或登录已过期' };
      return;
    }
    let payload;
    try {
      payload = jwt.verify(token, ctx.app.config.jwt.secret);
    } catch (e) {
      ctx.status = 401;
      ctx.body = { code: 401, msg: '未登录或登录已过期' };
      return;
    }
    if (payload.jti && ctx.service.auth.isRevoked(payload.jti)) {
      ctx.status = 401;
      ctx.body = { code: 401, msg: '登录已失效，请重新登录' };
      return;
    }
    ctx.state.user = { id: payload.sub, jti: payload.jti };
    await next();
  };
};
