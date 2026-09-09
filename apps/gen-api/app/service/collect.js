'use strict';
const { Service } = require('egg');

/**
 * 采集任务展开（S2）：按品牌生成当日 collect_tasks + collect_slots(pending)
 * 供 egg schedule(daily_collect 00:30) 与手动 POST /user/generate_today 复用。
 * 幂等：task 按 (brand_id, date) upsert、slot 按 slot_id upsert，重复调用不产生脏数据。
 */
class CollectService extends Service {
  /** 采集平台：品牌平台与 5 家白名单取交集（去 kimi）；品牌未配置时用默认 5 家 */
  platformsOf(brand) {
    const cfg = this.app.config.collector || {};
    const white = cfg.platforms || ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao'];
    const list = (brand && brand.platforms && brand.platforms.length) ? brand.platforms : white;
    const out = list.filter(p => white.includes(p));
    return out.length ? out : white;
  }

  /** 为单个品牌展开指定统计日的采集任务与槽位（幂等），返回 task（lean） */
  async expandDailyTask(brand, date, opts = {}) {
    const { ctx } = this;
    const M = ctx.model;
    const trigger = opts.trigger === 'manual' ? 'manual' : 'schedule';
    const platforms = this.platformsOf(brand);
    const queries = await M.MonitorQuery.find({ brand_id: brand.brand_id, query_status: true, query_is_execute: true }).lean();
    const slots = [];
    for (const q of queries) {
      for (const p of platforms) {
        slots.push({
          slot_id: `${brand.brand_id}:${date}:${q.query_id}:${p}:web`,
          task_id: '', brand_id: brand.brand_id,
          query_id: q.query_id, query_type: q.query_type, platform: p, end: 'web', date,
          question_sent: (q.question_list && q.question_list[0] && q.question_list[0].platform_query) || q.query,
          status: 'pending',
        });
      }
    }
    const task_id = `CT-${brand.brand_id}-${date}`;
    await M.CollectTask.updateOne(
      { brand_id: brand.brand_id, date },
      { $setOnInsert: { task_id, brand_id: brand.brand_id, date, trigger, expected_slots: slots.length, status: 'created' } },
      { upsert: true },
    );
    if (slots.length) {
      await M.CollectSlot.bulkWrite(slots.map(s => ({
        updateOne: { filter: { slot_id: s.slot_id }, update: { $setOnInsert: { ...s, task_id } }, upsert: true },
      })));
    }
    return M.CollectTask.findOne({ task_id }).lean();
  }
}

module.exports = CollectService;
