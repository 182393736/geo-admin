'use strict';
/**
 * 启动种子：默认账号 / 套餐价目 / 渠道库
 * 与 app.js 拆分，避免 egg 热更新风暴
 */
const PC5 = [ 'deepseek', 'doubao', 'wenxin', 'qwen', 'yuanbao' ];
const BOTH8 = [ 'deepseek', 'doubao', 'wenxin', 'qwen', 'yuanbao', 'mobile_doubao', 'mobile_deepseek', 'mobile_qwen' ];

const SEED_PLANS = [
  { plan_id: 1, plan_code: 'free', plan_name: '免费体验版', plan_type: 'free', billing_cycle: 'permanent', duration_days: 0, price: 0, original_price: 0, credit_price: 0, query_limit: 3, platform_list: [ 'deepseek', 'doubao', 'yuanbao' ], platform_scope: 'pc', sort: 1 },
  { plan_id: 8, plan_code: 'starter_monthly', plan_name: '入门版-月付', plan_type: 'starter', billing_cycle: 'monthly', duration_days: 30, price: 79, original_price: 79, credit_price: 790, query_limit: 8, platform_list: PC5, platform_scope: 'pc', sort: 2 },
  { plan_id: 9, plan_code: 'starter_quarterly', plan_name: '入门版-季付', plan_type: 'starter', billing_cycle: 'quarterly', duration_days: 90, price: 189.6, original_price: 237, credit_price: 1896, query_limit: 8, platform_list: PC5, platform_scope: 'pc', sort: 3 },
  { plan_id: 10, plan_code: 'starter_yearly', plan_name: '入门版-年付', plan_type: 'starter', billing_cycle: 'yearly', duration_days: 365, price: 663.6, original_price: 948, credit_price: 6636, query_limit: 8, platform_list: PC5, platform_scope: 'pc', sort: 4 },
  { plan_id: 18, plan_code: 'starter_monthly_both', plan_name: '入门版·双端(月)', plan_type: 'starter', billing_cycle: 'monthly', duration_days: 30, price: 168, original_price: 168, credit_price: 1680, query_limit: 8, platform_list: BOTH8, platform_scope: 'both', sort: 12 },
  { plan_id: 19, plan_code: 'starter_quarterly_both', plan_name: '入门版·双端(季)', plan_type: 'starter', billing_cycle: 'quarterly', duration_days: 90, price: 403.2, original_price: 504, credit_price: 4032, query_limit: 8, platform_list: BOTH8, platform_scope: 'both', sort: 13 },
  { plan_id: 110, plan_code: 'starter_yearly_both', plan_name: '入门版·双端(年)', plan_type: 'starter', billing_cycle: 'yearly', duration_days: 365, price: 1411.2, original_price: 2016, credit_price: 14112, query_limit: 8, platform_list: BOTH8, platform_scope: 'both', sort: 14 },
  { plan_id: 20, plan_code: 'basic_monthly', plan_name: '基础版', plan_type: 'basic', billing_cycle: 'monthly', duration_days: 30, price: 199, original_price: 199, credit_price: 1990, query_limit: 30, platform_list: PC5, platform_scope: 'pc', sort: 20 },
  { plan_id: 21, plan_code: 'basic_quarterly', plan_name: '基础版', plan_type: 'basic', billing_cycle: 'quarterly', duration_days: 90, price: 477, original_price: 597, credit_price: 4770, query_limit: 30, platform_list: PC5, platform_scope: 'pc', sort: 21 },
  { plan_id: 22, plan_code: 'basic_yearly', plan_name: '基础版', plan_type: 'basic', billing_cycle: 'yearly', duration_days: 365, price: 1670, original_price: 2388, credit_price: 16700, query_limit: 30, platform_list: PC5, platform_scope: 'pc', sort: 22 },
  { plan_id: 28, plan_code: 'basic_monthly_both', plan_name: '基础版·双端(月)', plan_type: 'basic', billing_cycle: 'monthly', duration_days: 30, price: 438, original_price: 438, credit_price: 4380, query_limit: 30, platform_list: BOTH8, platform_scope: 'both', sort: 28 },
  { plan_id: 29, plan_code: 'basic_quarterly_both', plan_name: '基础版·双端(季)', plan_type: 'basic', billing_cycle: 'quarterly', duration_days: 90, price: 1051.2, original_price: 1314, credit_price: 10512, query_limit: 30, platform_list: BOTH8, platform_scope: 'both', sort: 29 },
  { plan_id: 210, plan_code: 'basic_yearly_both', plan_name: '基础版·双端(年)', plan_type: 'basic', billing_cycle: 'yearly', duration_days: 365, price: 3679.2, original_price: 5256, credit_price: 36792, query_limit: 30, platform_list: BOTH8, platform_scope: 'both', sort: 30 },
  { plan_id: 30, plan_code: 'pro_monthly', plan_name: '专业版', plan_type: 'pro', billing_cycle: 'monthly', duration_days: 30, price: 499, original_price: 499, credit_price: 4990, query_limit: 100, platform_list: PC5, platform_scope: 'pc', sort: 40 },
  { plan_id: 31, plan_code: 'pro_quarterly', plan_name: '专业版', plan_type: 'pro', billing_cycle: 'quarterly', duration_days: 90, price: 1197, original_price: 1497, credit_price: 11970, query_limit: 100, platform_list: PC5, platform_scope: 'pc', sort: 41 },
  { plan_id: 32, plan_code: 'pro_yearly', plan_name: '专业版(年付)', plan_type: 'pro', billing_cycle: 'yearly', duration_days: 365, price: 4190, original_price: 5988, credit_price: 41900, query_limit: 100, platform_list: PC5, platform_scope: 'pc', sort: 42 },
  { plan_id: 38, plan_code: 'pro_monthly_both', plan_name: '专业版·双端(月)', plan_type: 'pro', billing_cycle: 'monthly', duration_days: 30, price: 1098, original_price: 1098, credit_price: 10980, query_limit: 100, platform_list: BOTH8, platform_scope: 'both', sort: 48 },
  { plan_id: 39, plan_code: 'pro_quarterly_both', plan_name: '专业版·双端(季)', plan_type: 'pro', billing_cycle: 'quarterly', duration_days: 90, price: 2635.2, original_price: 3294, credit_price: 26352, query_limit: 100, platform_list: BOTH8, platform_scope: 'both', sort: 49 },
  { plan_id: 310, plan_code: 'pro_yearly_both', plan_name: '专业版·双端(年)', plan_type: 'pro', billing_cycle: 'yearly', duration_days: 365, price: 9223.2, original_price: 13176, credit_price: 92232, query_limit: 100, platform_list: BOTH8, platform_scope: 'both', sort: 50 },
];

const SEED_MEDIA = [
  { media_key: 'seed_douyin', name: '抖音', type: '视频', categories: [ '生活', '新闻资讯' ], indexed_engines: [ 'doubao', 'deepseek', 'yuanbao', 'wenxin' ], list_price: 120000, sell_price: 100000, ref_count: 660, article_count: 93 },
  { media_key: 'seed_36kr', name: '36氪', type: '新闻门户', categories: [ '科技' ], indexed_engines: [ 'doubao', 'deepseek' ], list_price: 60000, sell_price: 50000, ref_count: 92, article_count: 12 },
  { media_key: 'seed_zhihu', name: '知乎', type: '问答社区', categories: [ '综合' ], indexed_engines: [ 'doubao', 'deepseek', 'yuanbao' ], list_price: 36000, sell_price: 30000, ref_count: 88, article_count: 24 },
  { media_key: 'seed_baijiahao', name: '百家号', type: '自媒体', categories: [ '综合' ], indexed_engines: [ 'doubao' ], list_price: 18000, sell_price: 15000, ref_count: 65, article_count: 47 },
  { media_key: 'seed_sohu', name: '搜狐', type: '新闻门户', categories: [ '新闻资讯' ], indexed_engines: [ 'deepseek', 'yuanbao' ], list_price: 48000, sell_price: 40000, ref_count: 82, article_count: 9 },
  { media_key: 'seed_thepaper', name: '澎湃新闻', type: '官方网媒', categories: [ '新闻资讯' ], indexed_engines: [ 'doubao', 'wenxin' ], list_price: 72000, sell_price: 60000, ref_count: 120, article_count: 30 },
  { media_key: 'seed_xinhua', name: '新华网', type: '官方网媒', categories: [ '新闻资讯' ], indexed_engines: [ 'doubao', 'wenxin', 'deepseek' ], list_price: 96000, sell_price: 80000, ref_count: 150, article_count: 40 },
  { media_key: 'seed_people', name: '人民网', type: '官方网媒', categories: [ '新闻资讯' ], indexed_engines: [ 'doubao', 'wenxin' ], list_price: 102000, sell_price: 85000, ref_count: 140, article_count: 35 },
  { media_key: 'seed_chinanews', name: '中国新闻网', type: '官方网媒', categories: [ '新闻资讯' ], indexed_engines: [ 'doubao', 'wenxin' ], list_price: 90000, sell_price: 75000, ref_count: 110, article_count: 28 },
  { media_key: 'seed_csdn', name: 'CSDN', type: '自媒体', categories: [ '科技', 'IT' ], indexed_engines: [ 'deepseek' ], list_price: 24000, sell_price: 20000, ref_count: 75, article_count: 15 },
  { media_key: 'seed_sspai', name: '少数派', type: '自媒体', categories: [ '科技' ], indexed_engines: [ 'doubao', 'deepseek' ], list_price: 21600, sell_price: 18000, ref_count: 70, article_count: 10 },
  { media_key: 'seed_huxiu', name: '虎嗅', type: '新闻门户', categories: [ '科技' ], indexed_engines: [ 'doubao', 'deepseek' ], list_price: 45600, sell_price: 38000, ref_count: 85, article_count: 14 },
  { media_key: 'seed_tmtpost', name: '钛媒体', type: '新闻门户', categories: [ '科技' ], indexed_engines: [ 'deepseek', 'yuanbao' ], list_price: 38400, sell_price: 32000, ref_count: 78, article_count: 13 },
  { media_key: 'seed_geekpark', name: '极客公园', type: '新闻门户', categories: [ '科技' ], indexed_engines: [ 'doubao' ], list_price: 42000, sell_price: 35000, ref_count: 80, article_count: 12 },
  { media_key: 'seed_xiaohongshu', name: '小红书', type: '社交', categories: [ '生活' ], indexed_engines: [ 'doubao', 'yuanbao' ], list_price: 54000, sell_price: 45000, ref_count: 42, article_count: 31 },
  { media_key: 'seed_weibo', name: '微博', type: '社交', categories: [ '生活' ], indexed_engines: [ 'doubao' ], list_price: 32400, sell_price: 27000, ref_count: 27, article_count: 20 },
  { media_key: 'seed_bilibili', name: 'B站', type: '视频', categories: [ '生活' ], indexed_engines: [ 'doubao', 'yuanbao' ], list_price: 36000, sell_price: 30000, ref_count: 20, article_count: 15 },
  { media_key: 'seed_toutiao', name: '今日头条', type: '自媒体', categories: [ '新闻资讯' ], indexed_engines: [ 'doubao', 'deepseek' ], list_price: 26400, sell_price: 22000, ref_count: 55, article_count: 18 },
  { media_key: 'seed_wechat', name: '微信公众号', type: '自媒体', categories: [ '综合' ], indexed_engines: [ 'doubao' ], list_price: 30000, sell_price: 25000, ref_count: 15, article_count: 12 },
];

module.exports = async app => {
  const log = (lvl, ...args) => {
    const lg = app && app.logger;
    if (lg && typeof lg[lvl] === 'function') lg[lvl](...args);
    else console.log('[seed]', lvl, ...args);
  };

  try {
    const bcrypt = require('bcryptjs');
    const doc = { account: '123456', name: '管理员', is_superuser: true };
    const existed = await app.model.User.findOne({ account: doc.account });
    if (!existed) {
      await app.model.User.create({ ...doc, password_hash: bcrypt.hashSync('123456', 10) });
      log('info', '[seed] 默认账户已创建 account=123456 password=123456');
    } else {
      log('info', '[seed] 默认账户已存在，跳过');
    }
  } catch (e) {
    log('error', '[seed] 默认账户初始化失败: %s', (e && e.stack) || String(e));
  }

  try {
    const codes = SEED_PLANS.map(p => p.plan_code);
    for (const p of SEED_PLANS) {
      const { plan_id, ...rest } = p;
      await app.model.Plan.updateOne(
        { plan_code: p.plan_code },
        { $set: { ...rest, on_sale: true }, $setOnInsert: { plan_id } },
        { upsert: true },
      );
    }
    await app.model.Plan.updateMany(
      { plan_code: { $nin: codes } },
      { $set: { on_sale: false } },
    );
    log('info', `[seed] 套餐价目已就绪（${SEED_PLANS.length} 档）`);
  } catch (e) {
    log('error', '[seed] 套餐初始化失败: %s', (e && e.message) || String(e));
  }

  try {
    for (const c of SEED_MEDIA) {
      const cost = c.ref_count > 0 ? Math.round((c.sell_price / c.ref_count) * 100) / 100 : null;
      await app.model.MediaChannel.updateOne(
        { media_key: c.media_key },
        { $set: { ...c, discount_rate: 1, cost_per_citation: cost, stats_window_days: 30, enabled: true } },
        { upsert: true },
      );
    }
    log('info', `[seed] 渠道库已就绪（${SEED_MEDIA.length} 家代表渠道）`);
  } catch (e) {
    log('error', '[seed] 渠道库初始化失败: %s', (e && e.message) || String(e));
  }
};
