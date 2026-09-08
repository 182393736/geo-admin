'use strict';
/**
 * 管理员鉴权中间件（必须在 jwtAuth 之后使用）
 * - 定位：总后台（gen-admin）只读监控专用；单角色管理员（is_superuser=true）
 * - 未登录由 jwtAuth 拦截；此处只校验「是否管理员」，非管理员统一 403
 * - 校验通过后挂 ctx.state.admin = 用户文档（lean），供 controller 使用
 */
module.exports = () => async function adminAuth(ctx, next) {
  const userId = ctx.state.user && ctx.state.user.id;
  const user = userId ? await ctx.model.User.findById(userId).lean() : null;
  if (!user || user.status === 'disabled') {
    ctx.status = 403;
    ctx.body = { code: 403, msg: '账号不可用' };
    return;
  }
  if (!user.is_superuser) {
    ctx.status = 403;
    ctx.body = { code: 403, msg: '无管理员权限' };
    return;
  }
  ctx.state.admin = user;
  await next();
};
