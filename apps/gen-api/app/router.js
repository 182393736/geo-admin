'use strict';
module.exports = app => {
  const { router, controller, middleware } = app;
  const jwtAuth = middleware.jwtAuth();

  router.get('/health', async ctx => (ctx.body = { code: 200, msg: 'ok' }));

  // ============ 认证（对齐契约层 src/api/modules/user.ts） ============
  router.post('/user/login', controller.auth.login);
  router.get('/user/info', jwtAuth, controller.auth.info);
  router.post('/api/auth/logout', jwtAuth, controller.auth.logout);

  // ============ 首次品牌分析（onboarding 状态机） ============
  router.post('/user/brands/analyze', jwtAuth, controller.onboarding.analyze);
  router.get('/user/onboarding/status', jwtAuth, controller.onboarding.status);
  router.get('/user/brands', jwtAuth, controller.onboarding.brands);

  // ============ 首登分析 Agent（geo-agent：完整字段集 + 流式实况） ============
  router.post('/agent/onboarding/run', jwtAuth, controller.agent.run);
  router.post('/agent/onboarding/stream', jwtAuth, controller.agent.stream);
  router.post('/agent/onboarding/confirm', jwtAuth, controller.agent.confirm);

  // ============ 品牌档案展示（建档结果页 / 概览页品牌卡 / 名片） ============
  router.get('/api/brand/summary', jwtAuth, controller.brand.summary);

  // ============ 监控问题 / 采集状态（概览页采集状态卡 · 排名/口碑问题列表） ============
  router.get('/api/query/list', jwtAuth, controller.query.list);
  router.get('/user/get_query_status', jwtAuth, controller.query.status);

  // ============ 套餐 / 订阅 / 积分钱包（采集前真实展示） ============
  router.get('/payment/plans/grouped', jwtAuth, controller.payment.plansGrouped);
  router.get('/payment/subscription/current', jwtAuth, controller.payment.subscriptionCurrent);
  router.get('/payment/orders', jwtAuth, controller.payment.orders);
  router.get('/credit/account', jwtAuth, controller.credit.account);

  // ============ 发稿渠道库（采集前真实展示：信源库页） ============
  router.post('/publish/media/facets', jwtAuth, controller.publish.mediaFacets);
  router.post('/publish/media/list', jwtAuth, controller.publish.mediaList);
};
