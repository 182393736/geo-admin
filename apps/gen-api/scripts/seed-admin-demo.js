'use strict';
/**
 * 管理总后台演示数据（幂等，按 account 去重）
 * 用法：MONGO_URL=mongodb://127.0.0.1:42439/geo_dev node scripts/seed-admin-demo.js
 * 作用：给 gen-admin 的监控页注入跨域真实形态数据（用户/品牌/采集/解析/LLM/计费/内容/报告/首登/行为/消息）
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const DAY = '2026-09-08';

(async () => {
  const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:42439/geo_dev';
  await mongoose.connect(url);
  const db = mongoose.connection.db;
  const now = new Date();
  const ago = d => new Date(now.getTime() - d * 24 * 3600 * 1000);

  const userId = uuid();
  const brandId = uuid();

  // ---- 用户 ----
  const userExisted = await db.collection('users').findOne({ account: 'demo' });
  if (!userExisted) {
    await db.collection('users').insertOne({
      _id: userId, account: 'demo', phone: '13900000001', name: '陈演示', company: '佛山市宏祥家具实业有限公司',
      industry: '公共家具制造', is_superuser: false, roles: [], status: 'active',
      password_hash: bcrypt.hashSync('123456', 10), created_at: ago(21), updated_at: now,
    });
  } else {
    console.log('demo 用户已存在，跳过');
  }
  const demoUser = (await db.collection('users').findOne({ account: 'demo' })) || { _id: userId };
  const uid = demoUser._id;

  // ---- 品牌 ----
  const brandExisted = await db.collection('brands').findOne({ user_id: uid });
  const bid = brandExisted ? brandExisted.brand_id : brandId;
  if (!brandExisted) {
    await db.collection('brands').insertOne({
      _id: uuid(), brand_id: bid, user_id: uid, name: '宏祥公共座椅', industry: '公共家具制造',
      website: 'https://www.hongxiang-seating.example.com', business_desc: '影院/礼堂/机场公共座椅制造商',
      platforms: ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao'], status: 'active',
      is_first_brand: true, rename_remaining: 2, access_type: 'own', menu_keys: [],
      created_at: ago(20), updated_at: now,
    });
    await db.collection('brand_profiles').insertOne({
      _id: uuid(), brand_id: bid, industry: ['公共家具制造'], website: 'https://www.hongxiang-seating.example.com',
      slogan: '让每一排座椅都经得起时间', tone: { style: '专业稳重' },
      description: '专注影院、礼堂、机场等公共场景座椅的制造品牌，主打耐用与人体工学。',
      scripts: ['欢迎咨询公共座椅解决方案'], seeded_from_db: false, exists: true,
      created_at: ago(19), updated_at: ago(2),
    });
    await db.collection('brand_aliases').insertMany([
      { _id: uuid(), brand_id: bid, alias: '宏祥座椅', source: 'auto', enabled: true, created_at: ago(19), updated_at: ago(19) },
      { _id: uuid(), brand_id: bid, alias: '宏祥公共家具', source: 'auto', enabled: true, created_at: ago(19), updated_at: ago(19) },
      { _id: uuid(), brand_id: bid, alias: 'Hongxiang Seating', source: 'manual', enabled: true, created_at: ago(18), updated_at: ago(18) },
    ]);
    await db.collection('brand_products').insertMany([
      { _id: uuid(), brand_id: bid, name: '影院翻板座椅 HS-300', category: '影院座椅', price_range: '300-500元', created_at: ago(19), updated_at: ago(19) },
      { _id: uuid(), brand_id: bid, name: '礼堂连排椅 HS-500', category: '礼堂座椅', price_range: '500-800元', created_at: ago(19), updated_at: ago(19) },
    ]);
    await db.collection('competitor_registers').insertMany([
      { _id: uuid(), brand_id: bid, name: '祥聚座椅', source: '品牌挖掘', compet_point: '同城竞品，性价比路线', enabled: true, created_at: ago(19), updated_at: ago(19) },
      { _id: uuid(), brand_id: bid, name: '大丰实业', source: '用户登记', compet_point: '上市企业，高端场馆座椅', enabled: true, created_at: ago(18), updated_at: ago(18) },
    ]);
  }

  // ---- 监控问题 ----
  if ((await db.collection('monitor_queries').countDocuments({ brand_id: bid })) === 0) {
    await db.collection('monitor_queries').insertMany([
      { query_id: 40001, user_id: uid, brand_id: bid, query: '公共座椅品牌推荐', query_type: 'industry', question_list: [{ user_friendly: '公共座椅品牌推荐', platform_query: '公共座椅品牌推荐' }], query_status: true, query_is_execute: true, weight: 10, query_description: '高热度 · 品牌选择', query_order: 0, created_at: ago(19), updated_at: ago(2) },
      { query_id: 40002, user_id: uid, brand_id: bid, query: '影院座椅十大品牌', query_type: 'industry', question_list: [{ user_friendly: '影院座椅十大品牌', platform_query: '影院座椅十大品牌' }], query_status: true, query_is_execute: true, weight: 9, query_description: '高热度 · 榜单', query_order: 1, created_at: ago(19), updated_at: ago(2) },
      { query_id: 40003, user_id: uid, brand_id: bid, query: '礼堂座椅厂家哪家好', query_type: 'industry', question_list: [{ user_friendly: '礼堂座椅厂家哪家好', platform_query: '礼堂座椅厂家哪家好' }], query_status: true, query_is_execute: true, weight: 8, query_description: '核心场景 · 厂家选择', query_order: 2, created_at: ago(19), updated_at: ago(2) },
      { query_id: 40004, user_id: uid, brand_id: bid, query: '宏祥公共座椅口碑怎么样', query_type: 'brand', question_list: [{ user_friendly: '宏祥公共座椅口碑怎么样', platform_query: '宏祥公共座椅口碑怎么样' }], query_status: true, query_is_execute: true, weight: 10, query_description: '品牌口碑', query_order: 0, created_at: ago(19), updated_at: ago(2) },
      { query_id: 40005, user_id: uid, brand_id: bid, query: '宏祥座椅质量评价', query_type: 'brand', question_list: [{ user_friendly: '宏祥座椅质量评价', platform_query: '宏祥座椅质量评价' }], query_status: true, query_is_execute: true, weight: 8, query_description: '品牌质量', query_order: 1, created_at: ago(19), updated_at: ago(2) },
    ]);
  }

  // ---- 订阅 + 积分 + 订单 + 流水 ----
  if (!(await db.collection('subscriptions').findOne({ brand_id: bid }))) {
    await db.collection('subscriptions').insertOne({
      subscription_id: 1001, user_id: uid, brand_id: bid, plan_id: 20, plan_code: 'pro_monthly', plan_name: '专业版-月付',
      vip_level: 'pro', start_date: '2026-08-20', expire_date: '2026-09-20', query_limit: 30, query_count: 5,
      platform_list: ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao'], status: 'active', created_at: ago(19), updated_at: ago(19),
    });
  }
  if (!(await db.collection('credit_accounts').findOne({ user_id: uid }))) {
    await db.collection('credit_accounts').insertOne({
      _id: uuid(), user_id: uid, gold_balance: 3200, silver_balance: 800, frozen: 500,
      available: 3500, publish_available: 3200, total_recharge: 5000, total_consume: 1300, total_expired: 0,
      created_at: ago(21), updated_at: ago(1),
    });
  }
  if ((await db.collection('payment_orders').countDocuments({ user_id: uid })) === 0) {
    await db.collection('payment_orders').insertMany([
      { order_no: 'CP20260820100104250001', user_id: uid, brand_id: bid, order_category: 'plan', pay_method: 'wx', credit_amount: 0, plan_id: 20, plan_code: 'pro_monthly', plan_name: '专业版-月付', original_price: 259, price: 199, pay_amount: 199, status: 'paid', paid_at: ago(19), client_ip: '127.0.0.1', order_type: 'new', created_at: ago(19), updated_at: ago(19) },
      { order_no: 'CP20260901100104250002', user_id: uid, brand_id: bid, order_category: 'recharge', pay_method: 'wx', credit_amount: 500000, pack_id: 2, price: 500, pay_amount: 500, status: 'paid', paid_at: ago(7), client_ip: '127.0.0.1', order_type: 'new', created_at: ago(7), updated_at: ago(7) },
    ]);
  }
  if ((await db.collection('credit_transactions').countDocuments({ user_id: uid })) === 0) {
    await db.collection('credit_transactions').insertMany([
      { txn_id: uuid(), user_id: uid, type: 'recharge', coin: 'gold', amount: 5000, balance_after: 5000, ref_type: 'recharge', ref_id: 'CP20260901100104250002', remark: '充值500元', created_at: ago(7), updated_at: ago(7) },
      { txn_id: uuid(), user_id: uid, type: 'consume', coin: 'gold', amount: -1300, balance_after: 3700, ref_type: 'publish', ref_id: 'PB20260905162227900001', remark: '发稿扣减', created_at: ago(3), updated_at: ago(3) },
      { txn_id: uuid(), user_id: uid, type: 'freeze', coin: 'gold', amount: -500, balance_after: 3200, ref_type: 'publish', ref_id: 'PB20260907162227900002', remark: '发稿冻结', created_at: ago(1), updated_at: ago(1) },
    ]);
  }

  // ---- 采集任务 / 槽位 / 回答 / 截图 ----
  const taskId = `CT-${bid}-${DAY}`;
  if (!(await db.collection('collect_tasks').findOne({ task_id: taskId }))) {
    await db.collection('collect_tasks').insertOne({
      _id: uuid(), task_id: taskId, brand_id: bid, date: DAY, trigger: 'schedule',
      expected_slots: 20, actual_slots: 18, failed_slots: 1, completeness_rate: 90,
      status: 'ok', started_at: ago(0), finished_at: now, created_at: now, updated_at: now,
    });
    const slotRows = [];
    const platforms = ['doubao', 'deepseek', 'wenxin', 'qwen'];
    for (const qid of [40001, 40002, 40003, 40004, 40005]) {
      for (const p of platforms) {
        slotRows.push({
          _id: uuid(), slot_id: `${bid}:${DAY}:${qid}:${p}:web`, task_id: taskId, brand_id: bid,
          query_id: qid, query_type: qid === 40004 || qid === 40005 ? 'brand' : 'industry', platform: p, end: 'web',
          date: DAY, question_sent: '示例问题', mock_account_id: 'mock-acc-01',
          status: 'ok', answer_id: `A-${qid}-${p}`, attempts: 1, finished_at: now, created_at: now, updated_at: now,
        });
      }
    }
    // 一条失败槽位
    slotRows.push({
      _id: uuid(), slot_id: `${bid}:${DAY}:40003:yuanbao:web`, task_id: taskId, brand_id: bid,
      query_id: 40003, query_type: 'industry', platform: 'yuanbao', end: 'web', date: DAY,
      question_sent: '礼堂座椅厂家哪家好', mock_account_id: 'mock-acc-01',
      status: 'fail', error: '验证码拦截', attempts: 3, created_at: now, updated_at: now,
    });
    await db.collection('collect_slots').insertMany(slotRows);
    await db.collection('raw_answers').insertMany([
      { answer_id: 'A-40001-doubao', slot_id: `${bid}:${DAY}:40001:doubao:web`, brand_id: bid, query_id: 40001, platform: 'doubao', end: 'web', date: DAY, question_sent: '公共座椅品牌推荐', answer_text: '在公共座椅领域，宏祥公共座椅、大丰实业、祥聚座椅等品牌较为活跃…', cited_urls: [{ url: 'https://example.com/a', title: '公共座椅品牌盘点', rank: 1 }], parsed: true, created_at: now, updated_at: now },
      { answer_id: 'A-40004-deepseek', slot_id: `${bid}:${DAY}:40004:deepseek:web`, brand_id: bid, query_id: 40004, platform: 'deepseek', end: 'web', date: DAY, question_sent: '宏祥公共座椅口碑怎么样', answer_text: '宏祥公共座椅以交期快、性价比高著称，部分用户反馈安装周期略长…', cited_urls: [], parsed: false, created_at: now, updated_at: now },
    ]);
    await db.collection('snapshots').insertOne({
      _id: uuid(), snapshot_id: uuid(), slot_id: `${bid}:${DAY}:40001:doubao:web`, brand_id: bid, query_id: 40001,
      platform: 'doubao', exec_date: DAY, photo_url: 'https://oss.example.com/snap/1.png', oss_key: 'snap/1.png', size: 204800, created_at: now, updated_at: now,
    });
  }

  // ---- 解析产物 ----
  if ((await db.collection('brand_mentions').countDocuments({ brand_id: bid })) === 0) {
    await db.collection('brand_mentions').insertMany([
      { slot_id: `${bid}:${DAY}:40001:doubao:web`, date: DAY, brand_id: bid, query_id: 40001, platform: 'doubao', end: 'web', entity_id: 'e1', entity_name: '宏祥公共座椅', position: 1, is_target: true, snippet: '宏祥公共座椅…', created_at: now, updated_at: now },
      { slot_id: `${bid}:${DAY}:40002:deepseek:web`, date: DAY, brand_id: bid, query_id: 40002, platform: 'deepseek', end: 'web', entity_id: 'e2', entity_name: '大丰实业', position: 1, is_target: false, snippet: '大丰实业…', created_at: now, updated_at: now },
      { slot_id: `${bid}:${DAY}:40002:qwen:web`, date: DAY, brand_id: bid, query_id: 40002, platform: 'qwen', end: 'web', entity_id: 'e1', entity_name: '宏祥公共座椅', position: 3, is_target: true, snippet: '…宏祥公共座椅…', created_at: now, updated_at: now },
    ]);
    await db.collection('opinions').insertMany([
      { slot_id: `${bid}:${DAY}:40004:deepseek:web`, date: DAY, brand_id: bid, query_id: 40004, platform: 'deepseek', quote_text: '交期快（现货3-7天）', polarity: 'positive', target_entity: '宏祥公共座椅', created_at: now, updated_at: now },
      { slot_id: `${bid}:${DAY}:40004:qwen:web`, date: DAY, brand_id: bid, query_id: 40004, platform: 'qwen', quote_text: '性价比高', polarity: 'positive', target_entity: '宏祥公共座椅', created_at: now, updated_at: now },
      { slot_id: `${bid}:${DAY}:40005:wenxin:web`, date: DAY, brand_id: bid, query_id: 40005, platform: 'wenxin', quote_text: '安装周期略长', polarity: 'negative', target_entity: '宏祥公共座椅', created_at: now, updated_at: now },
      { slot_id: `${bid}:${DAY}:40005:doubao:web`, date: DAY, brand_id: bid, query_id: 40005, platform: 'doubao', quote_text: '款式选择较多', polarity: 'neutral', target_entity: '宏祥公共座椅', created_at: now, updated_at: now },
    ]);
    await db.collection('brand_entities').insertMany([
      { _id: 'e1', entity_id: 'e1', canonical_name: '宏祥公共座椅', name_variants: ['宏祥座椅', '宏祥公共家具'], scope: 'target', industry: '公共家具制造', first_seen: '2026-08-20', last_seen: DAY, created_at: ago(19), updated_at: now },
      { _id: 'e2', entity_id: 'e2', canonical_name: '大丰实业', name_variants: ['大丰'], scope: 'registered', industry: '场馆设施', first_seen: '2026-08-20', last_seen: DAY, created_at: ago(19), updated_at: now },
    ]);
    await db.collection('canonical_sources').insertMany([
      { _id: uuid(), source_id: 'src-1', canonical_source: '抖音', category: 'UGC社区', domains: ['douyin.com'], first_cited_at: '2026-08-20', last_cited_at: DAY, created_at: ago(19), updated_at: now },
      { _id: uuid(), source_id: 'src-2', canonical_source: '知乎', category: '问答社区', domains: ['zhihu.com'], first_cited_at: '2026-08-21', last_cited_at: DAY, created_at: ago(19), updated_at: now },
    ]);
    await db.collection('citation_edges').insertMany([
      { slot_id: `${bid}:${DAY}:40001:doubao:web`, date: DAY, brand_id: bid, query_id: 40001, platform: 'doubao', article_id: 'art-1', source_id: 'src-1', is_own: false, mentioned_entity: '宏祥公共座椅', created_at: now, updated_at: now },
      { slot_id: `${bid}:${DAY}:40002:deepseek:web`, date: DAY, brand_id: bid, query_id: 40002, platform: 'deepseek', article_id: 'art-2', source_id: 'src-2', is_own: true, mentioned_entity: '宏祥公共座椅', created_at: now, updated_at: now },
    ]);
    await db.collection('cited_articles').insertMany([
      { _id: 'art-1', article_id: 'art-1', canonical_url: 'https://douyin.com/v/1', url: 'https://douyin.com/v/1', title: '公共座椅品牌盘点', source_id: 'src-1', first_cited_at: '2026-08-20', last_cited_at: DAY, is_brand_published: false, created_at: ago(19), updated_at: now },
      { _id: 'art-2', article_id: 'art-2', canonical_url: 'https://zhihu.com/q/1', url: 'https://zhihu.com/q/1', title: '宏祥公共座椅真实体验', source_id: 'src-2', first_cited_at: '2026-08-21', last_cited_at: DAY, is_brand_published: true, created_at: ago(19), updated_at: now },
    ]);
  }

  // ---- 近 7 天口碑 ----
  if ((await db.collection('daily_metric_brands').countDocuments({ brand_id: bid })) === 0) {
    const rows = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000).toISOString().slice(0, 10);
      rows.push({
        _id: uuid(), brand_id: bid, platform: 'all', date: d,
        positive_n: 6 + i, neutral_n: 2, negative_n: i > 2 ? 0 : 1,
        ratio: { positive: 0.72, neutral: 0.2, negative: 0.08 },
        rep_score: 72 + i * 3, mention_rate: 0.5 + i * 0.03, top3_rate: 0.35, first_rate: 0.2,
        avg_rank: 2.1, visibility_score: 80 + i, created_at: now, updated_at: now,
      });
    }
    await db.collection('daily_metric_brands').insertMany(rows);
  }

  // ---- LLM 调用日志 ----
  if ((await db.collection('llm_call_logs').countDocuments()) === 0) {
    const rows = [];
    const sites = ['LLM-01', 'LLM-02', 'LLM-03', 'LLM-04'];
    for (const s of sites) {
      for (let i = 0; i < 3; i++) {
        rows.push({
          _id: uuid(), call_site: s, brand_id: bid, ref_id: `ref-${i}`, prompt_version: 'v1', model: 'deepseek-chat',
          input_hash: uuid().slice(0, 12),
          usage: { prompt_tokens: 1200 + i * 100, completion_tokens: 400 + i * 50, total_tokens: 1600 + i * 150 },
          latency_ms: 1800 + i * 400, success: i !== 2 || s !== 'LLM-04', retry: s === 'LLM-04' && i === 2 ? 1 : 0,
          error: s === 'LLM-04' && i === 2 ? 'JSON 解析失败' : '', created_at: new Date(now.getTime() - i * 3600 * 1000), updated_at: now,
        });
      }
    }
    await db.collection('llm_call_logs').insertMany(rows);
  }

  // ---- 报告 ----
  if (!(await db.collection('reports').findOne({ brand_id: bid }))) {
    await db.collection('reports').insertOne({
      _id: uuid(), report_id: uuid(), brand_id: bid, period_type: 'weekly', period_key: 'W-20260830',
      label: '8/24–8/30周报', range: '08-24 至 08-30', status: 'ready', template_id: 1,
      modules_summary: { monitor: true }, overview_stats: { slots: 0.9, sources: 12 }, generated_at: ago(1),
      created_at: ago(1), updated_at: ago(1),
    });
  }

  // ---- 首登任务 + 留痕 ----
  if (!(await db.collection('onboarding_tasks').findOne({ brand_id: bid }))) {
    const otaskId = uuid();
    await db.collection('onboarding_tasks').insertOne({
      _id: uuid(), task_id: otaskId, user_id: uid, brand_id: bid,
      input: { brand_name: '宏祥公共座椅', website: 'https://www.hongxiang-seating.example.com', business_desc: '影院/礼堂/机场公共座椅制造商' },
      stage: 'done', crawler_started_at: ago(20), crawler_completed_at: ago(20),
      keyword_gen_started_at: ago(20), keyword_gen_completed_at: ago(20), keywords: ['公共座椅', '影院座椅', '礼堂座椅'],
      created_at: ago(20), updated_at: ago(20),
    });
    await db.collection('onboarding_traces').insertMany([
      { _id: uuid(), task_id: otaskId, brand_id: bid, user_id: uid, kind: 'search_query', query: '公共座椅 品牌推荐 影院 礼堂', created_at: ago(20) },
      { _id: uuid(), task_id: otaskId, brand_id: bid, user_id: uid, kind: 'page_read', url: 'https://www.hongxiang-seating.example.com/about', snapshot: '公司简介：专注公共座椅制造20年…', created_at: ago(20) },
      { _id: uuid(), task_id: otaskId, brand_id: bid, user_id: uid, kind: 'keyword_weight', keyword: '公共座椅', weight: 10, created_at: ago(20) },
      { _id: uuid(), task_id: otaskId, brand_id: bid, user_id: uid, kind: 'user_confirm', meta: { picked: 5 }, created_at: ago(20) },
    ]);
  }

  // ---- 行为埋点 ----
  if ((await db.collection('user_click_events').countDocuments({ user_id: uid })) === 0) {
    await db.collection('user_click_events').insertMany([
      { user_id: uid, brand_id: bid, source: 'AI排名透视', operation: '访问', ip: '127.0.0.1', created_at: ago(1) },
      { user_id: uid, brand_id: bid, source: 'AI口碑分析', operation: '访问', ip: '127.0.0.1', created_at: ago(1) },
      { user_id: uid, brand_id: bid, source: '信源库', operation: '访问', ip: '127.0.0.1', created_at: ago(0) },
    ]);
  }

  // ---- 发稿 / 稿件 / 写作 / 诊断 / Agent / 消息 ----
  if ((await db.collection('publish_orders').countDocuments({ brand_id: bid })) === 0) {
    await db.collection('publish_orders').insertOne({
      _id: uuid(), order_no: 'PB20260907162227900002', user_id: uid, brand_id: bid, article_id: 'article-demo-1',
      article_title: '公共座椅选购指南：宏祥公共座椅的三大优势', media_key: 'seed_zhihu', media_name: '知乎',
      status: 'submitted', list_price: 36000, sell_price: 30000, discount_rate: 1,
      credit_txn_freeze: uuid(), created_at: ago(1), updated_at: ago(1),
    });
  }
  if ((await db.collection('articles_generated').countDocuments({ brand_id: bid })) === 0) {
    await db.collection('articles_generated').insertOne({
      _id: 'article-demo-1', article_id: 'article-demo-1', job_id: 'job-demo-1', uid, brand_id: bid,
      title: '公共座椅选购指南：宏祥公共座椅的三大优势', content_md: '# 引言…', word_count: 850, status: 'ready',
      created_at: ago(2), updated_at: ago(1),
    });
  }
  if ((await db.collection('writing_jobs').countDocuments({ brand_id: bid })) === 0) {
    await db.collection('writing_jobs').insertOne({
      _id: 'job-demo-1', job_id: 'job-demo-1', uid, brand_id: bid, topic: '公共座椅选购指南', query_id: 40001,
      evidence_ids: [], kb_refs: [], status: 'completed', current_node: '护栏', created_at: ago(2), updated_at: ago(1),
    });
  }
  if ((await db.collection('diagnosis_tasks').countDocuments({ user_id: uid })) === 0) {
    await db.collection('diagnosis_tasks').insertOne({
      _id: uuid(), diagnosis_id: uuid(), user_id: uid, target_brand_input: { name: '祥聚座椅' }, aliases: ['祥聚'],
      ends: ['web'], status: 'done', credit_cost: 50, order_no: 'CP20260907100104250003', created_at: ago(1), updated_at: ago(1),
    });
  }
  if ((await db.collection('agent_histories').countDocuments({ uid })) === 0) {
    await db.collection('agent_histories').insertOne({
      _id: uuid(), session_id: uuid(), uid, brand_id: bid, kind: 'chat', payload: { q: '帮我看看竞品' }, created_at: ago(1), updated_at: ago(1),
    });
  }
  if ((await db.collection('reminders').countDocuments({ user_id: uid })) === 0) {
    await db.collection('reminders').insertMany([
      { _id: uuid(), user_id: uid, brand_id: bid, type: 'collect_fail', level: 'warn', title: '昨日采集 1 个槽位失败', body: 'yuanbao 平台验证码拦截，已自动重试 3 次', read: false, created_at: ago(0), updated_at: ago(0) },
      { _id: uuid(), user_id: uid, brand_id: bid, type: 'report_ready', level: 'info', title: '周报已生成', body: '8/24–8/30周报可查看', read: true, created_at: ago(1), updated_at: ago(1) },
    ]);
  }

  console.log('演示数据就绪：demo/123456（非管理员，1 品牌 + 采集/解析/LLM/计费/内容/报告/首登/行为/消息）');
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
