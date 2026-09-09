'use strict';
/**
 * 启动钩子：数据库就绪后灌注默认账号（account: 123456 / password: 123456）
 * - 幂等：仅当 account 不存在时插入
 * - 生产上线前请删除或改为从环境变量读取
 */
// 套餐种子（对齐线上 /payment/plans/grouped 契约）
const SEED_PLANS = [
  { plan_id: 1,  plan_code: 'free',            plan_name: '免费体验版', plan_type: 'free',    billing_cycle: 'permanent', duration_days: 0,  price: 0,    original_price: 0,    query_limit: 8,   sort: 1 },
  { plan_id: 10, plan_code: 'starter_monthly', plan_name: '入门版-月付', plan_type: 'starter', billing_cycle: 'monthly', duration_days: 30,  price: 79,   original_price: 99,   query_limit: 8,   sort: 10 },
  { plan_id: 11, plan_code: 'starter_yearly',  plan_name: '入门版-年付', plan_type: 'starter', billing_cycle: 'yearly',  duration_days: 365, price: 790,  original_price: 948,  query_limit: 8,   sort: 11 },
  { plan_id: 20, plan_code: 'pro_monthly',     plan_name: '专业版-月付', plan_type: 'pro',     billing_cycle: 'monthly', duration_days: 30,  price: 199,  original_price: 259,  query_limit: 30,  sort: 20 },
  { plan_id: 21, plan_code: 'pro_yearly',      plan_name: '专业版-年付', plan_type: 'pro',     billing_cycle: 'yearly',  duration_days: 365, price: 1990, original_price: 2388, query_limit: 30,  sort: 21 },
  { plan_id: 30, plan_code: 'custom',          plan_name: '定制版',     plan_type: 'custom',  billing_cycle: 'yearly',  duration_days: 365, price: 0,    original_price: 0,    query_limit: 100, sort: 30 },
];

// 渠道库种子（代表性样本；价格单位=分，被引数为演示口径，夜间聚合会刷新）
const SEED_MEDIA = [
  { media_key: 'seed_douyin',      name: '抖音',       type: '视频',   categories: ['生活', '新闻资讯'], indexed_engines: ['doubao', 'deepseek', 'yuanbao', 'wenxin'], list_price: 120000, sell_price: 100000, ref_count: 660, article_count: 93 },
  { media_key: 'seed_36kr',        name: '36氪',       type: '新闻门户', categories: ['科技'],           indexed_engines: ['doubao', 'deepseek'], list_price: 60000, sell_price: 50000, ref_count: 92, article_count: 12 },
  { media_key: 'seed_zhihu',       name: '知乎',       type: '问答社区', categories: ['综合'],           indexed_engines: ['doubao', 'deepseek', 'yuanbao'], list_price: 36000, sell_price: 30000, ref_count: 88, article_count: 24 },
  { media_key: 'seed_baijiahao',   name: '百家号',     type: '自媒体',   categories: ['综合'],           indexed_engines: ['doubao'], list_price: 18000, sell_price: 15000, ref_count: 65, article_count: 47 },
  { media_key: 'seed_sohu',        name: '搜狐',       type: '新闻门户', categories: ['新闻资讯'],       indexed_engines: ['deepseek', 'yuanbao'], list_price: 48000, sell_price: 40000, ref_count: 82, article_count: 9 },
  { media_key: 'seed_thepaper',    name: '澎湃新闻',   type: '官方网媒', categories: ['新闻资讯'],       indexed_engines: ['doubao', 'wenxin'], list_price: 72000, sell_price: 60000, ref_count: 120, article_count: 30 },
  { media_key: 'seed_xinhua',      name: '新华网',     type: '官方网媒', categories: ['新闻资讯'],       indexed_engines: ['doubao', 'wenxin', 'deepseek'], list_price: 96000, sell_price: 80000, ref_count: 150, article_count: 40 },
  { media_key: 'seed_people',      name: '人民网',     type: '官方网媒', categories: ['新闻资讯'],       indexed_engines: ['doubao', 'wenxin'], list_price: 102000, sell_price: 85000, ref_count: 140, article_count: 35 },
  { media_key: 'seed_chinanews',   name: '中国新闻网', type: '官方网媒', categories: ['新闻资讯'],       indexed_engines: ['doubao', 'wenxin'], list_price: 90000, sell_price: 75000, ref_count: 110, article_count: 28 },
  { media_key: 'seed_csdn',        name: 'CSDN',       type: '自媒体',   categories: ['科技', 'IT'],    indexed_engines: ['deepseek'], list_price: 24000, sell_price: 20000, ref_count: 75, article_count: 15 },
  { media_key: 'seed_sspai',       name: '少数派',     type: '自媒体',   categories: ['科技'],           indexed_engines: ['doubao', 'deepseek'], list_price: 21600, sell_price: 18000, ref_count: 70, article_count: 10 },
  { media_key: 'seed_huxiu',       name: '虎嗅',       type: '新闻门户', categories: ['科技'],           indexed_engines: ['doubao', 'deepseek'], list_price: 45600, sell_price: 38000, ref_count: 85, article_count: 14 },
  { media_key: 'seed_tmtpost',     name: '钛媒体',     type: '新闻门户', categories: ['科技'],           indexed_engines: ['deepseek', 'yuanbao'], list_price: 38400, sell_price: 32000, ref_count: 78, article_count: 13 },
  { media_key: 'seed_geekpark',    name: '极客公园',   type: '新闻门户', categories: ['科技'],           indexed_engines: ['doubao'], list_price: 42000, sell_price: 35000, ref_count: 80, article_count: 12 },
  { media_key: 'seed_xiaohongshu', name: '小红书',     type: '社交',     categories: ['生活'],           indexed_engines: ['doubao', 'yuanbao'], list_price: 54000, sell_price: 45000, ref_count: 42, article_count: 31 },
  { media_key: 'seed_weibo',       name: '微博',       type: '社交',     categories: ['生活'],           indexed_engines: ['doubao'], list_price: 32400, sell_price: 27000, ref_count: 27, article_count: 20 },
  { media_key: 'seed_bilibili',    name: 'B站',        type: '视频',     categories: ['生活'],           indexed_engines: ['doubao', 'yuanbao'], list_price: 36000, sell_price: 30000, ref_count: 20, article_count: 15 },
  { media_key: 'seed_toutiao',     name: '今日头条',   type: '自媒体',   categories: ['新闻资讯'],       indexed_engines: ['doubao', 'deepseek'], list_price: 26400, sell_price: 22000, ref_count: 55, article_count: 18 },
  { media_key: 'seed_wechat',      name: '微信公众号', type: '自媒体',   categories: ['综合'],           indexed_engines: ['doubao'], list_price: 30000, sell_price: 25000, ref_count: 15, article_count: 12 },
];

module.exports = app => {
  app.beforeStart(async () => {
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

    // 套餐种子（幂等）
    try {
      for (const p of SEED_PLANS) {
        await app.model.Plan.updateOne({ plan_code: p.plan_code }, { $set: p }, { upsert: true });
      }
      log('info', `[seed] 套餐价目已就绪（${SEED_PLANS.length} 档）`);
    } catch (e) {
      log('error', '[seed] 套餐初始化失败: %s', (e && e.message) || String(e));
    }

    // 渠道库种子（幂等）
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
  });
};
