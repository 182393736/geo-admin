'use strict';
module.exports = app => {
  const { router, controller, middleware } = app;
  const jwtAuth = middleware.jwtAuth();

  router.get('/health', async ctx => (ctx.body = { code: 200, msg: 'ok' }));

  // ============ 认证（对齐契约层 src/api/modules/user.ts） ============
  router.post('/user/login', controller.auth.login);
  router.get('/user/info', jwtAuth, controller.auth.info);
  router.post('/api/auth/logout', jwtAuth, controller.auth.logout);
};
