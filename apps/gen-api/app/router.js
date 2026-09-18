'use strict';
module.exports = app => {
  const { router, controller, middleware } = app;
  const jwtAuth = middleware.jwtAuth();

  router.get('/health', async ctx => (ctx.body = { code: 200, msg: 'ok' }));

  // ============ 认证（对齐契约层 src/api/modules/user.ts） ============
  router.post('/user/login', controller.auth.login);
  router.get('/user/info', jwtAuth, controller.auth.info);
  router.post('/api/auth/logout', jwtAuth, controller.auth.logout);

  // ============ 品牌列表 ============
  // 注：旧 POST /user/brands/analyze、GET /user/onboarding/status 已废弃移除（见提交
  //     《chore(gen-api): 移除废弃的 /user/brands/analyze 首登建档路径》，git 历史可恢复）；
  //     首登建档现走 /agent/onboarding/{run,stream,confirm}（geo-agent 落库）。
  router.get('/user/brands', jwtAuth, controller.onboarding.brands);

  // ============ 首登分析 Agent（geo-agent：完整字段集 + 流式实况） ============
  router.post('/agent/onboarding/run', jwtAuth, controller.agent.run);
  router.post('/agent/onboarding/stream', jwtAuth, controller.agent.stream);
  router.post('/agent/onboarding/confirm', jwtAuth, controller.agent.confirm);

  // ============ AGENT 新建对话 / 会话流（对标 /dashboard/new-agent → /dashboard/writing/:id） ============
  router.post('/agent/chat/start', jwtAuth, controller.agentChat.start);
  router.get('/agent/chat/list', jwtAuth, controller.agentChat.list);
  router.get('/agent/chat/:session_id', jwtAuth, controller.agentChat.detail);
  router.post('/agent/chat/:session_id/message', jwtAuth, controller.agentChat.message);
  router.post('/agent/chat/:session_id/end', jwtAuth, controller.agentChat.end);

  // ============ 品牌档案展示（建档结果页 / 概览页品牌卡 / 名片） ============
  router.get('/api/brand/summary', jwtAuth, controller.brand.summary);
  router.post('/api/brand/rename', jwtAuth, controller.brand.rename);
  router.post('/api/brand/aliases', jwtAuth, controller.brand.updateAliases);
  router.post('/api/brand/competitors', jwtAuth, controller.brand.createCompetitor);
  router.put('/api/brand/competitors', jwtAuth, controller.brand.updateCompetitor);
  router.delete('/api/brand/competitors', jwtAuth, controller.brand.deleteCompetitor);

  // ============ 监控问题 / 采集状态（概览页采集状态卡 · 排名/口碑问题列表） ============
  // 对标 geoapi.timus.cn：/query/list（无 /api 前缀）；保留 /api/query/list 兼容旧前端
  router.get('/query/list', jwtAuth, controller.query.list);
  router.get('/api/query/list', jwtAuth, controller.query.list);
  router.post('/query/add', jwtAuth, controller.query.add);
  router.post('/query/update', jwtAuth, controller.query.update);
  router.post('/query/delete', jwtAuth, controller.query.delete);
  router.post('/query/sort', jwtAuth, controller.query.sort);
  router.get('/user/get_query_status', jwtAuth, controller.query.status);
  router.post('/user/generate_today', jwtAuth, controller.query.generateToday);

  // ============ 套餐 / 订阅 / 积分钱包（采集前真实展示） ============
  router.get('/payment/plans/grouped', jwtAuth, controller.payment.plansGrouped);
  router.get('/payment/subscription/current', jwtAuth, controller.payment.subscriptionCurrent);
  router.get('/payment/orders', jwtAuth, controller.payment.orders);
  router.post('/payment/order/create', jwtAuth, controller.payment.orderCreate);
  router.get('/payment/order/:order_no', jwtAuth, controller.payment.orderGet);
  router.post('/payment/order/:order_no/mock-pay', jwtAuth, controller.payment.orderMockPay);
  router.get('/credit/account', jwtAuth, controller.credit.account);
  router.get('/credit/transactions', jwtAuth, controller.credit.transactions);
  router.get('/credit/recharge/packs', jwtAuth, controller.credit.rechargePacks);
  router.post('/credit/recharge/create', jwtAuth, controller.credit.rechargeCreate);

  // ============ 发稿渠道库（采集前真实展示：信源库页） ============
  router.post('/publish/media/facets', jwtAuth, controller.publish.mediaFacets);
  router.post('/publish/media/list', jwtAuth, controller.publish.mediaList);
  router.post('/publish/media/fav', jwtAuth, controller.publish.mediaFav);
  router.post('/publish/orders', jwtAuth, controller.publish.orders);
  router.post('/publish/order/republish', jwtAuth, controller.publish.orderRepublish);
  router.post('/publish/order/cites', jwtAuth, controller.publish.orderCites);

  // ============ 报告（概览页周报/月报 6 模块） ============
  router.get('/report/cycle', jwtAuth, controller.report.cycle);
  router.post('/report/list', jwtAuth, controller.report.list);
  router.post('/report/latest', jwtAuth, controller.report.latest);

  // ============ 排名/口碑/竞品（summary 域） ============
  router.post('/summary/full_ranking_matrix', jwtAuth, controller.summary.fullRankingMatrix);
  router.post('/summary/mention_rate_trend', jwtAuth, controller.summary.mentionRateTrend);
  router.post('/summary/top3_rate_trend', jwtAuth, controller.summary.top3RateTrend);
  router.post('/summary/first_position_rate_trend', jwtAuth, controller.summary.firstPositionRateTrend);
  router.post('/summary/ai_ranking_matrix', jwtAuth, controller.summary.aiRankingMatrix);
  router.post('/summary/reputation_data', jwtAuth, controller.summary.reputationData);
  router.post('/summary/get_references', jwtAuth, controller.summary.getReferences);
  router.post('/competitor/insight', jwtAuth, controller.summary.competitorInsight);
  router.get('/competitor/name-corrections', jwtAuth, controller.summary.nameCorrections);
  router.put('/competitor/name-corrections', jwtAuth, controller.summary.saveNameCorrections);

  // ============ 信源（引用源统计 / 信源洞察 / 快照） ============
  router.post('/reference_source/stats', jwtAuth, controller.source.stats);
  router.post('/reference_source/articles', jwtAuth, controller.source.articles);
  router.post('/reference_source/analyze', jwtAuth, controller.source.analyze);
  router.post('/reference_source/media_accounts', jwtAuth, controller.source.mediaAccounts);
  router.post('/summary/reference_source/tag_own_article', jwtAuth, controller.source.tagOwnArticle);
  router.post('/article/library/import', jwtAuth, controller.source.importOwnArticles);
  router.post('/source_intelligence/source_trend', jwtAuth, controller.source.sourceTrend);
  router.post('/source_intelligence/engine_preference', jwtAuth, controller.source.enginePreference);
  router.post('/source_intelligence/own_trend', jwtAuth, controller.source.ownTrend);
  router.post('/source_intelligence/perspective', jwtAuth, controller.source.perspective);
  router.get('/source_intelligence/topics', jwtAuth, controller.source.topics);
  router.post('/snapshot/export/list', jwtAuth, controller.source.snapshotList);
  router.post('/snapshot/export/answer', jwtAuth, controller.source.snapshotAnswer);
  router.post('/snapshot/export/text', jwtAuth, controller.source.snapshotExportText);

  // ============ 导出族（对标 /export/*） ============
  router.post('/export/competitor_report', jwtAuth, controller.export.competitorReport);
  router.post('/export/ranking_matrix', jwtAuth, controller.export.rankingMatrix);
  router.post('/export/competitor_xlsx', jwtAuth, controller.export.competitorXlsx);
  router.post('/export/reference_source', jwtAuth, controller.export.referenceSource);

  // ============ 缺失补齐：问题分组 / 稿件 / 诊断（对标 geoapi.timus.cn） ============
  router.post('/query-group/list', jwtAuth, controller.query.queryGroupList);
  router.post('/query-group/save', jwtAuth, controller.query.queryGroupSave);
  router.post('/query-group/move_query', jwtAuth, controller.query.queryGroupMove);
  router.post('/query-group/delete', jwtAuth, controller.query.queryGroupDelete);
  router.post('/publish/article/drafts', jwtAuth, controller.publish.articleDrafts);
  router.post('/publish/article/save_draft', jwtAuth, controller.publish.articleSaveDraft);
  router.post('/publish/estimate', jwtAuth, controller.publish.estimate);
  router.post('/publish/submit', jwtAuth, controller.publish.submit);
  router.post('/article/library', jwtAuth, controller.publish.articleLibrary);
  router.post('/article/library/cites', jwtAuth, controller.publish.articleCites);
  router.get('/diagnosis/tasks', jwtAuth, controller.diagnosis.list);
  router.post('/diagnosis/order/create', jwtAuth, controller.diagnosis.create);
  router.post('/diagnosis/order/cancel', jwtAuth, controller.diagnosis.cancel);

  // ============ 品牌·内容域（geoarticle 无壳 raw，带 /api 前缀） ============
  router.get('/api/brand/intro', jwtAuth, controller.brandArticle.intro);
  router.patch('/api/brand/intro', jwtAuth, controller.brandArticle.updateIntro);
  router.get('/api/brand/aliases', jwtAuth, controller.brandArticle.aliases);
  router.get('/api/brand/competitors', jwtAuth, controller.brandArticle.competitors);
  router.get('/api/brand/products', jwtAuth, controller.brandArticle.products);
  router.get('/api/brand/library/text', jwtAuth, controller.brandArticle.libraryText);
  router.get('/api/brand/library/links', jwtAuth, controller.brandArticle.libraryLinks);
  router.get('/api/brand/library/docs', jwtAuth, controller.brandArticle.libraryDocs);
  router.get('/api/brand/wiki/tree', jwtAuth, controller.brandArticle.wikiTree);
  router.get('/api/articles', jwtAuth, controller.brandArticle.articles);
  router.delete('/api/articles/:run_id', jwtAuth, controller.brandArticle.deleteArticle);

  // ============ 采集 worker 协议（机器对机器，服务级鉴权） ============
  const collectorAuth = middleware.collectorAuth();
  router.post('/collector/slots/pull', collectorAuth, controller.collector.pull);
  router.post('/collector/slots/:slot_id/submit', collectorAuth, controller.collector.submit);

  // ============ 管理员总后台（gen-admin）============
  // 鉴权：jwtAuth + adminAuth（is_superuser=true）；含监控读接口 + 少量运营写接口（添加用户等）
  const adminAuth = middleware.adminAuth();
  router.get('/admin/me', jwtAuth, adminAuth, controller.admin.me);
  router.get('/admin/overview', jwtAuth, adminAuth, controller.admin.overview);
  // 用户 / 品牌
  router.get('/admin/users', jwtAuth, adminAuth, controller.admin.users);
  router.post('/admin/users', jwtAuth, adminAuth, controller.admin.createUser);
  router.get('/admin/users/:id', jwtAuth, adminAuth, controller.admin.userDetail);
  router.post('/admin/users/:id/purge', jwtAuth, adminAuth, controller.admin.purgeUser);
  router.get('/admin/brands', jwtAuth, adminAuth, controller.admin.brands);
  router.get('/admin/brands/:id', jwtAuth, adminAuth, controller.admin.brandDetail);
  // 采集监控
  router.get('/admin/collect/tasks', jwtAuth, adminAuth, controller.admin.collectTasks);
  router.get('/admin/collect/tasks/:id/slots', jwtAuth, adminAuth, controller.admin.collectSlots);
  router.post('/admin/collect/tasks/:id/reset-failed', jwtAuth, adminAuth, controller.admin.collectTaskResetFailed);
  router.get('/admin/collect/slots', jwtAuth, adminAuth, controller.admin.collectSlotList);
  router.post('/admin/collect/slots/:slotId/reset', jwtAuth, adminAuth, controller.admin.collectSlotReset);
  router.post('/admin/collect/slots/:slotId/reparse', jwtAuth, adminAuth, controller.admin.collectSlotReparse);
  router.get('/admin/collect/answers', jwtAuth, adminAuth, controller.admin.collectAnswers);
  router.get('/admin/collect/answers/:id', jwtAuth, adminAuth, controller.admin.collectAnswerDetail);
  router.get('/admin/collect/snapshots', jwtAuth, adminAuth, controller.admin.collectSnapshots);
  // 解析监控
  router.get('/admin/parse/overview', jwtAuth, adminAuth, controller.admin.parseOverview);
  // 流水线时间轴（品牌×天：槽位→采集→解析→聚合→报告）
  router.get('/admin/pipeline/days', jwtAuth, adminAuth, controller.admin.pipelineDays);
  router.get('/admin/pipeline/timeline', jwtAuth, adminAuth, controller.admin.pipelineTimeline);
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
