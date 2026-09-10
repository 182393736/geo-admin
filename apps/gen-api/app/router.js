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
  router.post('/user/generate_today', jwtAuth, controller.query.generateToday);

  // ============ 套餐 / 订阅 / 积分钱包（采集前真实展示） ============
  router.get('/payment/plans/grouped', jwtAuth, controller.payment.plansGrouped);
  router.get('/payment/subscription/current', jwtAuth, controller.payment.subscriptionCurrent);
  router.get('/payment/orders', jwtAuth, controller.payment.orders);
  router.get('/credit/account', jwtAuth, controller.credit.account);

  // ============ 发稿渠道库（采集前真实展示：信源库页） ============
  router.post('/publish/media/facets', jwtAuth, controller.publish.mediaFacets);
  router.post('/publish/media/list', jwtAuth, controller.publish.mediaList);

  // ============ 采集 worker 协议（机器对机器，服务级鉴权） ============
  const collectorAuth = middleware.collectorAuth();
  router.post('/collector/slots/pull', collectorAuth, controller.collector.pull);
  router.post('/collector/slots/:slot_id/submit', collectorAuth, controller.collector.submit);

  // ============ 管理员总后台（gen-admin · 只读监控）============
  // 鉴权：jwtAuth + adminAuth（is_superuser=true）；后续增删改再放开写接口
  const adminAuth = middleware.adminAuth();
  router.get('/admin/me', jwtAuth, adminAuth, controller.admin.me);
  router.get('/admin/overview', jwtAuth, adminAuth, controller.admin.overview);
  // 用户 / 品牌
  router.get('/admin/users', jwtAuth, adminAuth, controller.admin.users);
  router.get('/admin/users/:id', jwtAuth, adminAuth, controller.admin.userDetail);
  router.get('/admin/brands', jwtAuth, adminAuth, controller.admin.brands);
  router.get('/admin/brands/:id', jwtAuth, adminAuth, controller.admin.brandDetail);
  // 采集监控
  router.get('/admin/collect/tasks', jwtAuth, adminAuth, controller.admin.collectTasks);
  router.get('/admin/collect/tasks/:id/slots', jwtAuth, adminAuth, controller.admin.collectSlots);
  router.get('/admin/collect/answers', jwtAuth, adminAuth, controller.admin.collectAnswers);
  router.get('/admin/collect/answers/:id', jwtAuth, adminAuth, controller.admin.collectAnswerDetail);
  router.get('/admin/collect/snapshots', jwtAuth, adminAuth, controller.admin.collectSnapshots);
  // 解析监控
  router.get('/admin/parse/overview', jwtAuth, adminAuth, controller.admin.parseOverview);
  // LLM
  router.get('/admin/llm/logs', jwtAuth, adminAuth, controller.admin.llmLogs);
  // 计费
  router.get('/admin/billing/plans', jwtAuth, adminAuth, controller.admin.plans);
  router.get('/admin/billing/subscriptions', jwtAuth, adminAuth, controller.admin.subscriptions);
  router.get('/admin/billing/orders', jwtAuth, adminAuth, controller.admin.orders);
  router.get('/admin/billing/credit', jwtAuth, adminAuth, controller.admin.creditAccounts);
  router.get('/admin/billing/credit-transactions', jwtAuth, adminAuth, controller.admin.creditTransactions);
  // 内容与发稿
  router.get('/admin/content/media', jwtAuth, adminAuth, controller.admin.mediaChannels);
  router.get('/admin/content/publish-orders', jwtAuth, adminAuth, controller.admin.publishOrders);
  router.get('/admin/content/articles', jwtAuth, adminAuth, controller.admin.articles);
  router.get('/admin/content/writing-jobs', jwtAuth, adminAuth, controller.admin.writingJobs);
  // 报告
  router.get('/admin/reports', jwtAuth, adminAuth, controller.admin.reports);
  // 首登漏斗
  router.get('/admin/onboarding/tasks', jwtAuth, adminAuth, controller.admin.onboardingTasks);
  router.get('/admin/onboarding/traces', jwtAuth, adminAuth, controller.admin.onboardingTraces);
  // 行为 / 诊断 / Agent / 消息 / 系统
  router.get('/admin/behavior/events', jwtAuth, adminAuth, controller.admin.behaviorEvents);
  router.get('/admin/diagnosis', jwtAuth, adminAuth, controller.admin.diagnosis);
  router.get('/admin/agent/histories', jwtAuth, adminAuth, controller.admin.agentHistories);
  router.get('/admin/reminders', jwtAuth, adminAuth, controller.admin.reminders);
  router.get('/admin/system', jwtAuth, adminAuth, controller.admin.system);
};
