'use strict';
const Controller = require('egg').Controller;

/**
 * 监控问题与采集状态（排名/口碑页问题列表 + 概览页采集状态卡）
 *  - GET /api/query/list?query_type=industry|brand
 *    industry：排名词；brand：口碑词；空/all：全部（额度等统计用）
 *  - GET /user/get_query_status
 *
 * 采集之前（S2 尚未运行）时：collect_tasks 为空 → 返回 pending=true 的诚实空态，
 * 概览页据此展示「等待首次采集」而不是伪造指标。
 */
class QueryController extends Controller {
  async _requireBrand(brandId) {
    const { ctx } = this;
    try {
      return await ctx.service.brandScope.requireBrand(ctx.state.user.id, brandId);
    } catch (e) {
      ctx.status = e.status || 400;
      ctx.body = { code: e.code || e.status || 400, msg: e.message };
      return null;
    }
  }

  async list() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const rawQt = String(ctx.query.query_type || '').trim();
    // all / 空：管理页（排名入口）展示全部类型；brand|industry 按类型过滤
    const filter = { brand_id: brand.brand_id };
    if (rawQt === 'brand' || rawQt === 'industry') filter.query_type = rawQt;
    const rows = await ctx.model.MonitorQuery.find(filter)
      .sort({ query_order: 1, created_at: 1 }).lean();
    const pendingRelease = rows.filter(m => !m.query_status).length;
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(m => ({
          id: m.query_id, query: m.query,
          user_id: m.user_id || brand.user_id, brand_id: m.brand_id,
          created_at: m.created_at, updated_at: m.updated_at,
          question_list: (m.question_list && m.question_list.length)
            ? m.question_list
            : [{ user_friendly: m.query, platform_query: m.platform_prompt || m.query }],
          task_id: m.task_id || null,
          weight: m.weight != null ? m.weight : 1,
          is_golden: !!m.is_golden,
          query_type: m.query_type,
          golden_query_ranking: m.golden_query_ranking != null ? m.golden_query_ranking : null,
          query_status: !!m.query_status,
          query_is_execute: !!m.query_is_execute,
          effective_to: m.effective_to || null,
          query_order: m.query_order || 0,
          group_id: m.group_id || null,
        })),
        pending_release: pendingRelease,
        total: rows.length,
      },
    };
  }

  /** 问题分组（对标 POST /query-group/list）：{ groups, ungrouped_count, total, query_map } */
  async queryGroupList() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const rawQt = String(b.query_type || '').trim();
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const qFilter = { brand_id: brand.brand_id };
    const gFilter = { brand_id: brand.brand_id };
    if (rawQt === 'brand' || rawQt === 'industry') {
      qFilter.query_type = rawQt;
      gFilter.query_type = rawQt;
    }
    const [groups, queries] = await Promise.all([
      ctx.model.QueryGroup.find(gFilter).sort({ sort: 1, created_at: 1 }).lean(),
      ctx.model.MonitorQuery.find(qFilter).lean(),
    ]);
    const total = queries.length;
    const ungrouped = queries.filter(q => !q.group_id).length;
    const queryMap = {};
    for (const q of queries) {
      if (q.group_id) {
        (queryMap[q.group_id] ||= []).push(q.query_id);
      }
    }
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        groups: groups.map(g => ({
          group_id: g.group_id, name: g.name, sort: g.sort || 0,
          query_type: g.query_type || null,
          query_count: queries.filter(q => q.group_id === g.group_id).length,
        })),
        ungrouped_count: ungrouped,
        total,
        query_map: queryMap,
      },
    };
  }

  async _quota(brandId) {
    const { ctx } = this;
    const used = await ctx.model.MonitorQuery.countDocuments({ brand_id: brandId });
    const sub = await ctx.model.Subscription.findOne({ brand_id: brandId, status: 'active' })
      .sort({ updated_at: -1 }).lean().catch(() => null)
      || await ctx.model.Subscription.findOne({ brand_id: brandId }).sort({ updated_at: -1 }).lean().catch(() => null);
    const limit = (sub && sub.query_limit) || 8;
    return { used, limit, remain: Math.max(0, limit - used) };
  }

  /** POST /query/add — 批量新增监控问题（额度校验） */
  async add() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const qt = b.query_type === 'brand' ? 'brand' : 'industry';
    let lines = [];
    if (Array.isArray(b.queries)) lines = b.queries.map(s => String(s || '').trim()).filter(Boolean);
    else if (typeof b.query === 'string') lines = b.query.split(/\n+/).map(s => s.trim()).filter(Boolean);
    else if (typeof b.text === 'string') lines = b.text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    lines = [...new Set(lines.map(s => s.slice(0, 50)))];
    if (!lines.length) {
      ctx.status = 400; ctx.body = { code: 400, msg: '请输入至少一个监控问题' }; return;
    }
    const quota = await this._quota(brand.brand_id);
    if (lines.length > quota.remain) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: `剩余额度不足（剩余 ${quota.remain}，本次 ${lines.length}）` };
      return;
    }
    const existing = await ctx.model.MonitorQuery.find({ brand_id: brand.brand_id }).select('query').lean();
    const existSet = new Set(existing.map(e => e.query));
    const created = [];
    let orderBase = existing.length;
    try {
      for (const q of lines) {
        if (existSet.has(q)) continue;
        const query_id = await ctx.service.onboarding.nextSeq('query_id');
        const doc = {
          query_id,
          user_id: ctx.state.user.id,
          brand_id: brand.brand_id,
          query: q,
          question_list: [{ user_friendly: q, platform_query: q }],
          query_type: qt,
          query_status: true,
          query_is_execute: true,
          query_order: orderBase++,
          group_id: b.group_id || null,
          weight: 1,
        };
        await ctx.model.MonitorQuery.create(doc);
        created.push({ id: query_id, query: q, query_type: qt });
        existSet.add(q);
      }
    } catch (err) {
      ctx.logger.error('[query.add] %s', err && err.stack || err);
      ctx.status = 500;
      ctx.body = { code: 500, msg: (err && err.message) || '添加问题失败' };
      return;
    }
    const used = await ctx.model.MonitorQuery.countDocuments({ brand_id: brand.brand_id });
    await ctx.model.Subscription.updateMany({ brand_id: brand.brand_id, status: 'active' }, { $set: { query_count: used } }).catch(() => null);
    ctx.body = { code: 200, msg: 'ok', data: { created, count: created.length, remain: Math.max(0, quota.limit - used) } };
  }

  /** POST /query/update — 更新问题文案 / 状态 */
  async update() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const qid = Number(b.query_id || b.id);
    if (!Number.isFinite(qid)) {
      ctx.status = 400; ctx.body = { code: 400, msg: 'query_id 必填' }; return;
    }
    const doc = await ctx.model.MonitorQuery.findOne({ brand_id: brand.brand_id, query_id: qid });
    if (!doc) { ctx.status = 404; ctx.body = { code: 404, msg: '问题不存在' }; return; }
    const $set = {};
    if (typeof b.query === 'string' && b.query.trim()) {
      const q = b.query.trim().slice(0, 50);
      $set.query = q;
      $set.question_list = [{ user_friendly: q, platform_query: q }];
    }
    if (typeof b.query_status === 'boolean') {
      $set.query_status = b.query_status;
      $set.query_is_execute = b.query_status;
    }
    if (b.query_type === 'brand' || b.query_type === 'industry') $set.query_type = b.query_type;
    if ('group_id' in b) $set.group_id = b.group_id || null;
    await ctx.model.MonitorQuery.updateOne({ brand_id: brand.brand_id, query_id: qid }, { $set });
    ctx.body = { code: 200, msg: 'ok', data: { query_id: qid, ...$set } };
  }

  /** POST /query/delete — 删除问题（硬删，释放额度） */
  async delete() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const ids = Array.isArray(b.query_ids)
      ? b.query_ids.map(Number).filter(Number.isFinite)
      : [Number(b.query_id || b.id)].filter(Number.isFinite);
    if (!ids.length) {
      ctx.status = 400; ctx.body = { code: 400, msg: 'query_id 必填' }; return;
    }
    const r = await ctx.model.MonitorQuery.deleteMany({ brand_id: brand.brand_id, query_id: { $in: ids } });
    const used = await ctx.model.MonitorQuery.countDocuments({ brand_id: brand.brand_id });
    await ctx.model.Subscription.updateMany({ brand_id: brand.brand_id, status: 'active' }, { $set: { query_count: used } }).catch(() => null);
    ctx.body = { code: 200, msg: 'ok', data: { deleted: r.deletedCount || 0 } };
  }

  /** POST /query/sort — 拖拽排序 */
  async sort() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const orders = Array.isArray(b.orders) ? b.orders : [];
    if (!orders.length) {
      ctx.status = 400; ctx.body = { code: 400, msg: 'orders 必填' }; return;
    }
    const ops = orders.map((row, i) => ({
      updateOne: {
        filter: { brand_id: brand.brand_id, query_id: Number(row.query_id || row.id) },
        update: { $set: { query_order: Number.isFinite(Number(row.query_order)) ? Number(row.query_order) : i } },
      },
    })).filter(op => Number.isFinite(op.updateOne.filter.query_id));
    if (ops.length) await ctx.model.MonitorQuery.bulkWrite(ops);
    ctx.body = { code: 200, msg: 'ok', data: { updated: ops.length } };
  }

  /** POST /query-group/save — 新建/重命名分组 */
  async queryGroupSave() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const name = String(b.name || '').trim().slice(0, 30);
    if (!name) { ctx.status = 400; ctx.body = { code: 400, msg: '分组名必填' }; return; }
    const qt = b.query_type === 'brand' ? 'brand' : (b.query_type === 'industry' ? 'industry' : 'industry');
    if (b.group_id) {
      await ctx.model.QueryGroup.updateOne(
        { brand_id: brand.brand_id, group_id: b.group_id },
        { $set: { name } },
      );
      ctx.body = { code: 200, msg: 'ok', data: { group_id: b.group_id, name } };
      return;
    }
    const count = await ctx.model.QueryGroup.countDocuments({ brand_id: brand.brand_id });
    const { v4: uuid } = require('uuid');
    const group_id = uuid();
    await ctx.model.QueryGroup.create({
      group_id, brand_id: brand.brand_id, query_type: qt, name, sort: count,
    });
    ctx.body = { code: 200, msg: 'ok', data: { group_id, name, query_type: qt } };
  }

  /** POST /query-group/move_query — 将问题移入/移出分组 */
  async queryGroupMove() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const qid = Number(b.query_id || b.id);
    if (!Number.isFinite(qid)) {
      ctx.status = 400; ctx.body = { code: 400, msg: 'query_id 必填' }; return;
    }
    const group_id = b.group_id ? String(b.group_id) : null;
    await ctx.model.MonitorQuery.updateOne(
      { brand_id: brand.brand_id, query_id: qid },
      { $set: { group_id } },
    );
    ctx.body = { code: 200, msg: 'ok', data: { query_id: qid, group_id } };
  }

  /** POST /query-group/delete — 删除分组（问题回未分组） */
  async queryGroupDelete() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const group_id = String(b.group_id || '');
    if (!group_id) { ctx.status = 400; ctx.body = { code: 400, msg: 'group_id 必填' }; return; }
    await Promise.all([
      ctx.model.QueryGroup.deleteOne({ brand_id: brand.brand_id, group_id }),
      ctx.model.MonitorQuery.updateMany({ brand_id: brand.brand_id, group_id }, { $set: { group_id: null } }),
    ]);
    ctx.body = { code: 200, msg: 'ok', data: { group_id } };
  }

  /** 采集状态（概览页采集状态卡）：契约对齐线上 { list, last_date }，并附加采集前语义 */
  async status() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);

    if (!brand) return;

    const [enabledQueries, lastTask] = await Promise.all([
      ctx.model.MonitorQuery.countDocuments({ brand_id: brand.brand_id, query_status: true }),
      ctx.model.CollectTask.findOne({ brand_id: brand.brand_id }).sort({ date: -1, created_at: -1 }).lean(),
    ]);

    // 采集槽位口径：启用问题 × 4 引擎（web 端），与 S2 collect_slots 展开口径一致
    const platforms = this.service.collect.platformsOf(brand).length;
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
  /** 手动生成采集任务（POST /user/generate_today，仅测试程序消费）：
   *  为当前用户所有 active 品牌展开指定日期的槽位（幂等）。
   *  - body.date（可选）：单日 YYYY-MM-DD
   *  - body.days（可选，1~3）：最近 N 天（含今天）；仅测试程序用于观察多天数据
   *  生产 00:30 定时任务只展开当天，不受本接口影响。 */
  async generateToday() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const body = ctx.request.body || {};
    const dayjs = ctx.app.dayjs;

    // 目标日期集合：显式 date（单日）> days（最近 N 天）> 仅今天
    let dates;
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(body.date || ''))) {
      dates = [String(body.date)];
    } else {
      const days = Math.max(1, Math.min(3, Number(body.days) || 1));
      dates = [];
      for (let i = days - 1; i >= 0; i--) dates.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    }

    const brands = await ctx.model.Brand.find({ user_id: userId, status: 'active' }).sort({ created_at: 1 }).lean();
    if (!brands.length) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '暂无生效品牌，无法生成采集任务' };
      return;
    }
    const tasks = [];
    for (const b of brands) {
      for (const date of dates) {
        const task = await ctx.service.collect.expandDailyTask(b, date, { trigger: 'manual' });
        tasks.push({
          task_id: task.task_id, brand_id: b.brand_id, brand_name: b.name, date: task.date,
          expected_slots: task.expected_slots, actual_slots: task.actual_slots, failed_slots: task.failed_slots,
          status: task.status,
        });
      }
    }
    ctx.body = { code: 200, msg: 'ok', data: { dates, tasks } };
  }
}

module.exports = QueryController;
