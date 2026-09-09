'use strict';
const Controller = require('egg').Controller;

/**
 * 采集 worker 协议接口（机器对机器，collector_auth 鉴权）
 *  - POST /collector/slots/pull           拉取待采集槽位（原子领取 pending→running，attempts+1）
 *  - POST /collector/slots/:slot_id/submit 单条提交回答原文（ok/empty/fail）
 *
 * 数据流（与 schedule + 解析流水线的衔接）：
 *   daily_collect(00:30) 展开 collect_tasks/collect_slots(pending)
 *     → worker pull 领取 running → 提问 → submit 落 raw_answers(parsed=false) + 回写 slot/task
 *     → daily_parse(04:00) 扫 raw_answers(parsed=false) 按 query_type 分流解析
 *
 * 阶段约束（后续逐步放开）：
 *   - 平台恒 5 家（doubao/deepseek/wenxin/qwen/yuanbao）；end 恒 web
 *   - 截图存证 / 中立账号池：占位 null，后续补
 *   - 失败重试：每槽最多尝试 maxAttempts（默认 2）次后终态 fail
 */
class CollectorController extends Controller {
  get cfg() {
    return this.ctx.app.config.collector || {};
  }

  get maxAttempts() {
    const n = Number(this.cfg.maxAttempts);
    return Number.isFinite(n) && n > 0 ? n : 2;
  }

  /** 拉取待采集槽位：原子领取，多 worker 并发安全（findOneAndUpdate 条件带 status=pending） */
  async pull() {
    const { ctx } = this;
    const M = ctx.model;
    const b = ctx.request.body || {};
    const platforms = Array.isArray(b.platforms) && b.platforms.length
      ? b.platforms.filter(p => this.cfg.platforms.includes(p))
      : this.cfg.platforms;
    const limit = Math.max(1, Math.min(50, parseInt(b.limit, 10) || 10));
    const end = b.end === 'mobile' ? 'mobile' : 'web';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || ''))
      ? String(b.date)
      : ctx.app.dayjs().format('YYYY-MM-DD');

    const q = { status: 'pending', attempts: { $lt: this.maxAttempts }, platform: { $in: platforms }, end, date };
    if (b.query_type === 'industry' || b.query_type === 'brand') q.query_type = b.query_type;

    const candidates = await M.CollectSlot.find(q)
      .sort({ query_id: 1, platform: 1 })
      .limit(limit).lean();

    const claimed = [];
    for (const c of candidates) {
      // 原子领取：只有仍处于 pending 且未超重试上限的槽位才能被领走
      const doc = await M.CollectSlot.findOneAndUpdate(
        { slot_id: c.slot_id, status: 'pending', attempts: { $lt: this.maxAttempts } },
        { $set: { status: 'running', started_at: new Date() }, $inc: { attempts: 1 } },
        { returnDocument: 'after' },
      );
      if (!doc) continue; // 并发下被其他 worker 领走 / 已超限
      claimed.push(doc);
      // 所属任务进入 running（幂等）
      await M.CollectTask.updateOne(
        { task_id: doc.task_id, status: { $nin: ['ok', 'fail'] } },
        { $set: { status: 'running', started_at: new Date() } },
      ).catch(() => {});
    }

    // 补 question_list（用户友好口径 + 引擎发问口径，来自 monitor_queries）
    const qids = [...new Set(claimed.map(s => s.query_id))];
    const qmap = {};
    if (qids.length) {
      const rows = await M.MonitorQuery.find({ query_id: { $in: qids } }).lean();
      for (const r of rows) qmap[r.query_id] = r;
    }

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        slots: claimed.map(s => {
          const mq = qmap[s.query_id] || {};
          return {
            slot_id: s.slot_id,
            task_id: s.task_id,
            brand_id: s.brand_id,
            query_id: s.query_id,
            query_type: s.query_type,
            platform: s.platform,
            end: s.end,
            date: s.date,
            question_sent: s.question_sent,
            question_list: (mq.question_list && mq.question_list.length)
              ? mq.question_list
              : [{ user_friendly: s.question_sent, platform_query: s.question_sent }],
            mock_account_id: s.mock_account_id || null,
          };
        }),
      },
    };
  }

  /** 单条提交回答原文 */
  async submit() {
    const { ctx } = this;
    const M = ctx.model;
    const slotId = ctx.params.slot_id;
    const b = ctx.request.body || {};
    const status = b.status;

    if (!['ok', 'empty', 'fail'].includes(status)) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'status 必须是 ok / empty / fail' };
      return;
    }

    const slot = await M.CollectSlot.findOne({ slot_id: slotId }).lean();
    if (!slot) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '槽位不存在' };
      return;
    }
    if (slot.status !== 'running') {
      ctx.status = 409;
      ctx.body = { code: 409, msg: `槽位当前状态为 ${slot.status}，不接受提交（仅 running 可提交）` };
      return;
    }

    const answerText = typeof b.answer_text === 'string' ? b.answer_text.trim() : '';
    let answerId = null;
    let nextStatus = status;
    let finishedAt = new Date();
    const slotUpdate = {};

    if (status === 'ok') {
      if (!answerText) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: 'status=ok 时 answer_text 必填' };
        return;
      }
      answerId = ctx.helper.uuid();
      await M.RawAnswer.create({
        answer_id: answerId,
        slot_id: slot.slot_id,
        brand_id: slot.brand_id,
        query_id: slot.query_id,
        query_type: slot.query_type,          // 解析分流的唯一依据
        platform: slot.platform,
        end: slot.end,
        date: slot.date,
        question_sent: slot.question_sent,
        answer_text: answerText,
        cited_urls: Array.isArray(b.cited_urls) ? b.cited_urls.filter(c => c && c.url).map(c => ({
          url: String(c.url), title: String(c.title || ''), rank: c.rank != null ? Number(c.rank) : undefined,
        })) : [],
        model_meta: b.model_meta ?? undefined,
        parsed: false,                        // 等 daily_parse 批处理
      });
      slotUpdate.answer_id = answerId;
    } else if (status === 'empty') {
      // empty = 引擎无有效回答，但槽位有效（进指标分母）；有原文时也落 raw_answers 留证
      if (answerText) {
        answerId = ctx.helper.uuid();
        await M.RawAnswer.create({
          answer_id: answerId, slot_id: slot.slot_id, brand_id: slot.brand_id,
          query_id: slot.query_id, query_type: slot.query_type, platform: slot.platform,
          end: slot.end, date: slot.date, question_sent: slot.question_sent,
          answer_text: answerText,
          cited_urls: Array.isArray(b.cited_urls) ? b.cited_urls.filter(c => c && c.url).map(c => ({ url: String(c.url), title: String(c.title || '') })) : [],
          parsed: false,
        });
        slotUpdate.answer_id = answerId;
      }
    } else { // fail
      const error = String(b.error || '采集失败').slice(0, 500);
      if (slot.attempts >= this.maxAttempts) {
        // 已达重试上限 → 终态 fail
        nextStatus = 'fail';
      } else {
        // 未达上限 → 回退 pending，等待下次拉取重试
        nextStatus = 'pending';
        finishedAt = null;
      }
      slotUpdate.error = error;
    }

    slotUpdate.status = nextStatus;
    slotUpdate.finished_at = finishedAt;
    await M.CollectSlot.updateOne({ slot_id: slotId }, { $set: slotUpdate });

    // 汇总所属任务进度
    await this._syncTask(slot.task_id);

    ctx.body = {
      code: 200, msg: 'ok',
      data: { slot_id: slotId, status: nextStatus, attempts: slot.attempts, answer_id: answerId },
    };
  }

  /** 重算任务进度：actual=ok+empty，failed=fail，完成度/状态随槽位回写联动 */
  async _syncTask(taskId) {
    const { ctx } = this;
    const M = ctx.model;
    const task = await M.CollectTask.findOne({ task_id: taskId }).lean();
    if (!task) return;
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
    const update = {
      actual_slots: actual,
      failed_slots: fail,
      completeness_rate: expected ? +(actual / expected * 100).toFixed(2) : 0,
      status: settled >= expected ? 'ok' : (settled > 0 ? 'running' : 'created'),
    };
    if (!task.started_at) update.started_at = new Date();
    if (settled >= expected) update.finished_at = new Date();
    await M.CollectTask.updateOne({ task_id: taskId }, { $set: update }).catch(() => {});
  }
}

module.exports = CollectorController;
