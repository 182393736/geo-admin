'use strict';
/**
 * S2 每日采集任务展开：凌晨 00:30 为每个 active 品牌生成槽位
 * 写表：collect_tasks → collect_slots
 */
const { Subscription } = require('egg').Schedule;

class DailyCollect extends Subscription {
  static get schedule() { return { cron: '0 30 0 * * *', type: 'worker', immediate: false }; }
  async subscribe() {
    const { ctx } = this;
    const date = ctx.app.dayjs().format('YYYY-MM-DD');
    const brands = await ctx.model.Brand.find({ status: 'active' }).lean();
    for (const b of brands) {
      const queries = await ctx.model.MonitorQuery.find({ brand_id: b.brand_id, query_status: true, query_is_execute: true }).lean();
      const slots = [];
      for (const q of queries)
        for (const p of b.platforms)
          slots.push({ slot_id: `${b.brand_id}:${date}:${q.query_id}:${p}:web`, task_id: '', brand_id: b.brand_id,
            query_id: q.query_id, query_type: q.query_type, platform: p, end: 'web', date,
            question_sent: q.question_list?.[0]?.platform_query || q.query, status: 'pending' });
      const task_id = `CT-${b.brand_id}-${date}`;
      await ctx.model.CollectTask.updateOne({ brand_id: b.brand_id, date },
        { $setOnInsert: { task_id, brand_id: b.brand_id, date, expected_slots: slots.length, status: 'created' } }, { upsert: true });
      if (slots.length) await ctx.model.CollectSlot.bulkWrite(slots.map(s => ({
        updateOne: { filter: { slot_id: s.slot_id }, update: { $setOnInsert: { ...s, task_id } }, upsert: true } })));
      await ctx.service.queue.push('geo.collect.slot', { task_id }); // → worker 逐槽提问、落 raw_answers/snapshots
    }
  }
}
module.exports = DailyCollect;
