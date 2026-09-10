'use strict';
const Controller = require('egg').Controller;

/**
 * 采集 worker 协议接口（机器对机器，collector_auth 鉴权）
 *  - POST /collector/slots/pull           拉取待采集槽位（原子领取 pending→running，含运行超时回收）
 *  - POST /collector/slots/:slot_id/submit 单条提交回答原文（ok/empty/fail）
 *
 * 数据流（与 schedule + 解析流水线的衔接）：
 *   daily_collect(00:30) 展开 collect_tasks/collect_slots(pending)
 *     → worker pull 领取 running → 提问 → submit 落 raw_answers(parsed=false) + 回写 slot/task
 *     → daily_parse(04:00) 扫 raw_answers(parsed=false) 按 query_type 分流解析
 *
 * 阶段约束（后续逐步放开）：
 *   - 平台恒 4 家（doubao/deepseek/wenxin/yuanbao，千问暂移除）；end 恒 web
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

  get runningTtlMs() {
    const n = Number(this.cfg.runningTtlMs);
    return Number.isFinite(n) && n > 0 ? n : 15 * 60 * 1000;
  }

  /**
   * 运行超时回收（浏览器崩溃/会话挂起后，running 槽位没人提交会永久卡死）：
   *   - running 且超过 runningTtlMs 且 attempts+1 未达上限 → 回退 pending（attempts+1，等待重新领取）
   *   - running 且超过 runningTtlMs 且 attempts+1 已达上限 → 终态 fail（attempts+1，error=运行超时）
   * 在每次 pull 入口先执行，保证挂死的槽位能被重新分配。
   */
  async _reclaimTimedOut() {
    const { ctx } = this;
    const M = ctx.model;
    const cutoff = new Date(Date.now() - this.runningTtlMs);
    const cond = { status: 'running', started_at: { $lt: cutoff } };
    const rows = await M.CollectSlot.find(cond, { task_id: 1 }).lean();
    const taskIds = [...new Set(rows.map(r => r.task_id).filter(Boolean))];
    if (!taskIds.length) return;
    // 终态 fail：本次超时 +1 后达上限（缺 attempts 视为 0，不会进此支）
    await M.CollectSlot.updateMany(
      { ...cond, attempts: { $gte: this.maxAttempts - 1 } },
      { $set: { status: 'fail', error: '运行超时', finished_at: new Date() }, $inc: { attempts: 1 } },
    );
    // 回退 pending：未达上限，或 attempts 字段缺失（视为 0）
    await M.CollectSlot.updateMany(
      {
        ...cond,
        $or: [
          { attempts: { $lt: this.maxAttempts - 1 } },
          { attempts: { $exists: false } },
          { attempts: null },
        ],
      },
      { $set: { status: 'pending', error: '运行超时回收', started_at: null }, $inc: { attempts: 1 } },
    );
    for (const t of taskIds) await this._syncTask(t).catch(() => {});
  }

  /** 拉取单个待采集槽位：单条 + 一步原子领取（findOneAndUpdate 带 sort，无竞争窗口）。
   *  平台：兼容单数 platform / 复数 platforms；缺省=全部 4 家；指定但均不在白名单=无。 */
  async pull() {
    const { ctx } = this;
    const M = ctx.model;
    const b = ctx.request.body || {};

    // 先回收运行超时的槽位（浏览器崩溃/挂起 → 回退或终态），保证不被永久卡死
    await this._reclaimTimedOut().catch(() => {});

    // 平台：单数 platform 或复数 platforms 都接受；未指定=全部 4 家
    const requested = Array.isArray(b.platforms) ? b.platforms
      : (typeof b.platform === 'string' && b.platform ? [b.platform] : null);
    const platforms = requested === null
      ? this.cfg.platforms
      : requested.filter(p => this.cfg.platforms.includes(p));

    const end = b.end === 'mobile' ? 'mobile' : 'web';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || ''))
      ? String(b.date)
      : ctx.app.dayjs().format('YYYY-MM-DD');

    const none = () => { ctx.body = { code: 200, msg: 'ok', data: { slot: null } }; };
    if (!platforms.length) return none(); // 指定的平台都不在白名单（如 kimi）

    // attempts 缺省视为 0（bulkWrite 展开时可能未写入该字段；$lt 不会匹配缺字段文档）
    const q = {
      status: 'pending',
      platform: { $in: platforms },
      end,
      date,
      $or: [
        { attempts: { $lt: this.maxAttempts } },
        { attempts: { $exists: false } },
        { attempts: null },
      ],
    };
    if (b.query_type === 'industry' || b.query_type === 'brand') q.query_type = b.query_type;

    // 一步原子领取：按 query_id 升序找第一个 pending 槽位并置 running（并发下各 tab 必拿到不同槽位）
    // attempts 在此不 +1：attempts 语义 = 失败/超时次数，只在 fail 提交与超时回收时递增
    const doc = await M.CollectSlot.findOneAndUpdate(
      q,
      { $set: { status: 'running', started_at: new Date() } },
      { returnDocument: 'after', sort: { query_id: 1, platform: 1 } },
    );
    if (!doc) return none();

    // 所属任务进入 running（幂等）
    await M.CollectTask.updateOne(
      { task_id: doc.task_id, status: { $nin: ['ok', 'fail'] } },
      { $set: { status: 'running', started_at: new Date() } },
    ).catch(() => {});

    // 补 question_list（用户友好口径 + 引擎发问口径，来自 monitor_queries）
    const mq = (await M.MonitorQuery.findOne({ query_id: doc.query_id }).lean()) || {};

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        slot: {
          slot_id: doc.slot_id,
          task_id: doc.task_id,
          brand_id: doc.brand_id,
          query_id: doc.query_id,
          query_type: doc.query_type,
          platform: doc.platform,
          end: doc.end,
          date: doc.date,
          question_sent: doc.question_sent,
          question_list: (mq.question_list && mq.question_list.length)
            ? mq.question_list
            : [{ user_friendly: doc.question_sent, platform_query: doc.question_sent }],
          mock_account_id: doc.mock_account_id || null,
        },
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
    let attemptsAfter = slot.attempts; // attempts 语义 = 失败/超时次数（成功/empty 不递增）
    const slotUpdate = {};

    if (status === 'ok') {
      if (!answerText) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: 'status=ok 时 answer_text 必填' };
        return;
      }
      // 按 slot_id upsert：重采/重提不会撞 unique index
      const existing = await M.RawAnswer.findOne({ slot_id: slot.slot_id }, { answer_id: 1 }).lean();
      answerId = (existing && existing.answer_id) || ctx.helper.uuid();
      await M.RawAnswer.updateOne(
        { slot_id: slot.slot_id },
        {
          $set: {
            answer_id: answerId,
            brand_id: slot.brand_id,
            query_id: slot.query_id,
            query_type: slot.query_type,
            platform: slot.platform,
            end: slot.end,
            date: slot.date,
            question_sent: slot.question_sent,
            answer_text: answerText,
            cited_urls: this._mapCitedUrls(b.cited_urls),
            model_meta: b.model_meta ?? undefined,
            parsed: false,
          },
          $setOnInsert: { slot_id: slot.slot_id },
        },
        { upsert: true },
      );
      slotUpdate.answer_id = answerId;
    } else if (status === 'empty') {
      // empty = 引擎无有效回答，但槽位有效（进指标分母）；有原文时也落 raw_answers 留证
      if (answerText) {
        const existing = await M.RawAnswer.findOne({ slot_id: slot.slot_id }, { answer_id: 1 }).lean();
        answerId = (existing && existing.answer_id) || ctx.helper.uuid();
        await M.RawAnswer.updateOne(
          { slot_id: slot.slot_id },
          {
            $set: {
              answer_id: answerId,
              brand_id: slot.brand_id,
              query_id: slot.query_id,
              query_type: slot.query_type,
              platform: slot.platform,
              end: slot.end,
              date: slot.date,
              question_sent: slot.question_sent,
              answer_text: answerText,
              cited_urls: this._mapCitedUrls(b.cited_urls),
              parsed: false,
            },
            $setOnInsert: { slot_id: slot.slot_id },
          },
          { upsert: true },
        );
        slotUpdate.answer_id = answerId;
      }
    } else { // fail：失败次数 +1，达上限即终态
      const error = String(b.error || '采集失败').slice(0, 500);
      attemptsAfter = slot.attempts + 1;
      if (attemptsAfter >= this.maxAttempts) {
        nextStatus = 'fail';               // 已达上限 → 终态 fail
      } else {
        nextStatus = 'pending';            // 未达上限 → 回退 pending，等待重新领取重试
        finishedAt = null;
      }
      slotUpdate.attempts = attemptsAfter;
      slotUpdate.error = error;
    }

    slotUpdate.status = nextStatus;
    slotUpdate.finished_at = finishedAt;
    await M.CollectSlot.updateOne({ slot_id: slotId }, { $set: slotUpdate });

    // 汇总所属任务进度
    await this._syncTask(slot.task_id);

    ctx.body = {
      code: 200, msg: 'ok',
      data: { slot_id: slotId, status: nextStatus, attempts: attemptsAfter, answer_id: answerId },
    };
  }

  /** 归一化信源清单：url 必填，title/index(兼容 rank)/snippet/site_name/domain/publish_time 可选，只写有值字段 */
  _mapCitedUrls(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(c => c && c.url).map(c => {
      const out = { url: String(c.url) };
      if (typeof c.title === 'string') out.title = c.title;
      const idx = c.index != null ? c.index : c.rank; // 兼容旧字段 rank
      if (idx != null && idx !== '') out.index = Number(idx);
      if (typeof c.snippet === 'string' && c.snippet) out.snippet = c.snippet;
      if (typeof c.site_name === 'string' && c.site_name) out.site_name = c.site_name;
      if (typeof c.publish_time === 'string' && c.publish_time) out.publish_time = c.publish_time;
      // domain：优先用 worker 抓到的；未抓到则从 url 兜底推导。统一小写、去 www，作为「手动统一信源名」的键
      let domain = (typeof c.domain === 'string' ? c.domain : '').trim().toLowerCase().replace(/^www\./, '');
      if (!domain) { try { domain = new URL(out.url).hostname.toLowerCase().replace(/^www\./, ''); } catch (e) { /* 无法解析则留空 */ } }
      if (domain) out.domain = domain;
      return out;
    });
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
