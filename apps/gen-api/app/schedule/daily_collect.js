'use strict';
/**
 * S2 每日采集任务展开：凌晨 00:30 为每个 active 品牌生成槽位
 * 写表：collect_tasks → collect_slots
 * 展开逻辑复用 ctx.service.collect.expandDailyTask（与手动 POST /user/generate_today 同源）
 */
const { Subscription } = require('egg');

class DailyCollect extends Subscription {
  static get schedule() { return { cron: '0 30 0 * * *', type: 'worker', immediate: false }; }
  async subscribe() {
    const { ctx } = this;
    const date = ctx.app.dayjs().format('YYYY-MM-DD');
    const brands = await ctx.model.Brand.find({ status: 'active' }).lean();
    for (const b of brands) {
      const task = await ctx.service.collect.expandDailyTask(b, date);
      await ctx.service.queue.push('geo.collect.slot', { task_id: task.task_id }); // → worker 逐槽提问、落 raw_answers/snapshots
    }
  }
}
module.exports = DailyCollect;
