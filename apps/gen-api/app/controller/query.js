'use strict';
const Controller = require('egg').Controller;

/**
 * 监控问题与采集状态（排名/口碑页问题列表 + 概览页采集状态卡）
 *  - GET /api/query/list?query_type=industry|brand
 *  - GET /user/get_query_status
 *
 * 采集之前（S2 尚未运行）时：collect_tasks 为空 → 返回 pending=true 的诚实空态，
 * 概览页据此展示「等待首次采集」而不是伪造指标。
 */
class QueryController extends Controller {
  async _resolveBrand(userId, brandId) {
    const { ctx } = this;
    const brands = await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    if (!brands.length) return null;
    return brands.find(b => b.brand_id === brandId) || brands[0];
  }

  async list() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const brand = await this._resolveBrand(userId, ctx.query.brand_id);
    if (!brand) {
      ctx.body = { code: 200, msg: 'ok', data: { list: [] } };
      return;
    }
    const qt = ctx.query.query_type === 'brand' ? 'brand' : 'industry';
    const rows = await ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_type: qt })
      .sort({ query_order: 1, created_at: 1 }).lean();
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(m => ({
          id: m.query_id, brand_id: m.brand_id, query: m.query,
          query_type: m.query_type, query_status: !!m.query_status,
          query_is_execute: !!m.query_is_execute, weight: m.weight != null ? m.weight : 1,
          query_description: m.query_description || '', platform_prompt: m.platform_prompt || m.query,
          query_order: m.query_order || 0, group_id: m.group_id || null,
          created_at: m.created_at,
        })),
      },
    };
  }

  /** 采集状态（概览页采集状态卡）：契约对齐线上 { list, last_date }，并附加采集前语义 */
  async status() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const brand = await this._resolveBrand(userId, ctx.query.brand_id);

    if (!brand) {
      ctx.body = { code: 200, msg: 'ok', data: { list: {}, last_date: '', pending: true, enabled_queries: 0, expected_slots: 0 } };
      return;
    }

    const [enabledQueries, lastTask] = await Promise.all([
      ctx.model.MonitorQuery.countDocuments({ brand_id: brand.brand_id, query_status: true }),
      ctx.model.CollectTask.findOne({ brand_id: brand.brand_id }).sort({ date: -1, created_at: -1 }).lean(),
    ]);

    // 采集槽位口径：启用问题 × 5 引擎（web 端），与 S2 collect_slots 展开口径一致
    const platforms = (brand.platforms && brand.platforms.length) ? brand.platforms.length : 5;
    const expectedSlots = enabledQueries * platforms;

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: lastTask ? { [lastTask.date]: { expected: lastTask.expected_slots, actual: lastTask.actual_slots, failed: lastTask.failed_slots } } : {},
        last_date: lastTask ? (lastTask.date || '') : '',
        pending: !lastTask,            // true = 等待首次采集
        enabled_queries: enabledQueries,
        expected_slots: expectedSlots,
      },
    };
  }
  /** 手动生成当日采集任务（POST /user/generate_today）：为当前用户所有 active 品牌展开当日槽位（幂等） */
  async generateToday() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const body = ctx.request.body || {};
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(body.date || ''))
      ? String(body.date)
      : ctx.app.dayjs().format('YYYY-MM-DD');
    const brands = await ctx.model.Brand.find({ user_id: userId, status: 'active' }).sort({ created_at: 1 }).lean();
    if (!brands.length) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '暂无生效品牌，无法生成采集任务' };
      return;
    }
    const tasks = [];
    for (const b of brands) {
      const task = await ctx.service.collect.expandDailyTask(b, date, { trigger: 'manual' });
      tasks.push({
        task_id: task.task_id, brand_id: b.brand_id, brand_name: b.name, date: task.date,
        expected_slots: task.expected_slots, actual_slots: task.actual_slots, failed_slots: task.failed_slots,
        status: task.status,
      });
    }
    ctx.body = { code: 200, msg: 'ok', data: { date, tasks } };
  }
}

module.exports = QueryController;
