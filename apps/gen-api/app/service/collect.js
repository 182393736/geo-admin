'use strict';
const { Service } = require('egg');

/**
 * 采集任务展开（S2）：按品牌生成当日 collect_tasks + collect_slots(pending)
 * 供 egg schedule(daily_collect 00:30) 与手动 POST /user/generate_today 复用。
 * 幂等：task 按 (brand_id, date) upsert、slot 按 slot_id upsert，重复调用不产生脏数据。
 */
class CollectService extends Service {
  /** 采集平台：品牌平台与 4 家白名单取交集（去 kimi）；品牌未配置时用默认 4 家（千问暂移除） */
  platformsOf(brand) {
    const cfg = this.app.config.collector || {};
    const white = cfg.platforms || ['doubao', 'deepseek', 'wenxin', 'yuanbao'];
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
          attempts: 0,
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
    // 流水线时间轴：expand 阶段事件
    await ctx.service.pipelineEvent.record({
      brand_id: brand.brand_id, date, stage: 'expand',
      status: slots.length ? 'ok' : 'partial',
      message: slots.length ? `展开 ${slots.length} 个槽位（${[...new Set(platforms)].join('/')}）` : '无启用且可执行的监控词，未展开槽位',
      detail: { expected_slots: slots.length, queries: queries.length, platforms },
    });
    return M.CollectTask.findOne({ task_id }).lean();
  }

  /**
   * 重算任务进度：actual=ok+empty，failed=fail；
   * 结清后 ok / partial / fail，未结清 running / created。
   */
  async syncTask(taskId) {
    const { ctx } = this;
    const M = ctx.model;
    const task = await M.CollectTask.findOne({ task_id: taskId }).lean();
    if (!task) return null;
    const rows = await M.CollectSlot.aggregate([
      { $match: { task_id: taskId } },
      { $group: { _id: '$status', n: { $sum: 1 } } },
    ]);
    const by = {};
    for (const r of rows) by[r._id] = r.n;
    const ok = by.ok || 0;
    const empty = by.empty || 0;
    const fail = by.fail || 0;
    const actual = ok + empty;
    const expected = task.expected_slots || 0;
    const settled = actual + fail;
    let status = 'created';
    if (settled >= expected && expected > 0) {
      if (fail === 0) status = 'ok';
      else if (actual === 0) status = 'fail';
      else status = 'partial';
    } else if (settled > 0) {
      status = 'running';
    }
    const update = {
      actual_slots: actual,
      failed_slots: fail,
      completeness_rate: expected ? +(actual / expected * 100).toFixed(2) : 0,
      status,
    };
    if (!task.started_at) update.started_at = new Date();
    if (settled >= expected && expected > 0) update.finished_at = new Date();
    else update.finished_at = null; // 重新有 pending 时任务未完成
    await M.CollectTask.updateOne({ task_id: taskId }, { $set: update }).catch(() => {});

    const finalStatus = status === 'created' ? 'pending' : status;
    await ctx.service.pipelineEvent.record({
      brand_id: task.brand_id, date: task.date, stage: 'collect',
      status: finalStatus,
      message: `应采 ${expected} / 已采 ${actual}（ok ${ok} / empty ${empty}）/ 失败 ${fail}`,
      error: fail > 0 ? `${fail} 个槽位采集失败` : null,
      detail: { expected, actual, failed: fail, ok, empty, ...by },
    });
    return M.CollectTask.findOne({ task_id: taskId }).lean();
  }

  /** 失败槽位重置为 pending，清零 attempts，可供采集端重新领取 */
  async resetFailedSlot(slotId) {
    const { ctx } = this;
    const M = ctx.model;
    const slot = await M.CollectSlot.findOne({ slot_id: slotId }).lean();
    if (!slot) {
      const err = new Error('槽位不存在');
      err.status = 404;
      throw err;
    }
    if (slot.status !== 'fail') {
      const err = new Error(`仅终态 fail 可重置，当前状态为 ${slot.status}`);
      err.status = 400;
      throw err;
    }
    await M.CollectSlot.updateOne(
      { slot_id: slotId, status: 'fail' },
      {
        $set: { status: 'pending', attempts: 0, started_at: null, finished_at: null, answer_id: null },
        $unset: { error: 1 },
      },
    );
    const task = await this.syncTask(slot.task_id);
    const updated = await M.CollectSlot.findOne({ slot_id: slotId }).lean();
    return { slot: updated, task };
  }

  /** 将某任务下全部 fail 槽位重置为 pending */
  async resetFailedSlotsByTask(taskId) {
    const { ctx } = this;
    const M = ctx.model;
    const task = await M.CollectTask.findOne({ task_id: taskId }).lean();
    if (!task) {
      const err = new Error('任务不存在');
      err.status = 404;
      throw err;
    }
    const r = await M.CollectSlot.updateMany(
      { task_id: taskId, status: 'fail' },
      {
        $set: { status: 'pending', attempts: 0, started_at: null, finished_at: null, answer_id: null },
        $unset: { error: 1 },
      },
    );
    const synced = await this.syncTask(taskId);
    return { reset_count: r.modifiedCount || 0, task: synced };
  }
}

module.exports = CollectService;
