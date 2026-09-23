'use strict';
const Controller = require('egg').Controller;

/** LLM 调用点中文标签（管理端展示） */
const CALL_SITE_LABELS = {
  'LLM-01': '首登·品牌画像',
  'LLM-04': '首登·监控问题',
  'LLM-07': '解析·排名抽取',
  'LLM-09': '解析·口碑抽取',
  ONBOARD_WEB: '首登·联网取证',
  ONBOARD_LIBRARY: '首登·情报文稿',
};

/**
 * 管理员总后台（geo-admin）—— 监控 + 少量运营写接口
 * ------------------------------------------------------------------
 * 定位：跨用户/跨品牌的「上帝视角」，检索 / 下钻 / 聚合；写接口仅限超管运营动作（如添加用户）。
 * 管理总后台只读监控 API（+ 开发环境用户清空）。
 * 全部挂在 /admin/**，鉴权：jwtAuth + adminAuth（is_superuser=true）。
 * 响应统一壳 { code: 200, msg: 'ok', data }；列表统一 { list, total, page, page_size }。
 */
class AdminController extends Controller {
  // ---------- 通用工具 ----------
  _ok(data) { this.ctx.body = { code: 200, msg: 'ok', data }; }

  /** 统一分页参数解析：page 从 1 起，page_size 上限 100 */
  _page() {
    const { ctx } = this;
    const page = Math.max(1, parseInt(ctx.query.page, 10) || 1);
    const page_size = Math.min(100, Math.max(1, parseInt(ctx.query.page_size, 10) || 20));
    return { page, page_size };
  }

  /** 日期范围解析（YYYY-MM-DD 起止），非法则返回 null */
  _range() {
    const { ctx } = this;
    const re = /^\d{4}-\d{2}-\d{2}$/;
    const from = re.test(String(ctx.query.from || '')) ? ctx.query.from : null;
    const to = re.test(String(ctx.query.to || '')) ? ctx.query.to : null;
    return { from, to };
  }

  _today() { return this.app.dayjs().format('YYYY-MM-DD'); }

  /** 布尔查询参数解析：'true'/'1' → true；'false'/'0' → false；其余 undefined */
  _bool(v) {
    if (v === undefined || v === '') return undefined;
    return v === 'true' || v === '1';
  }

  _safeNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

  /** brands(lean[]) → { [brand_id]: account }：品牌名可能重复，账户名用于区分归属（无账户时回退 name/_id） */
  async _brandAccountMap(brands) {
    const { ctx } = this;
    const userIds = [...new Set(brands.map(b => b.user_id).filter(Boolean))];
    if (!userIds.length) return {};
    const users = await ctx.model.User.find({ _id: { $in: userIds } }).lean();
    const um = {}; for (const u of users) um[u._id] = u.account || u.name || String(u._id);
    const out = {};
    for (const b of brands) out[b.brand_id] = um[b.user_id] || '';
    return out;
  }

  // ---------- 身份 ----------
  async me() {
    const { ctx } = this;
    const u = ctx.state.admin;
    this._ok({
      user_id: u._id,
      account: u.account,
      name: u.name || u.account,
      is_superuser: !!u.is_superuser,
      roles: u.roles || [],
      purge_user_enabled: ctx.service.userPurge.isAllowed(),
    });
  }

  // ---------- 驾驶舱 ----------
  async overview() {
    const { ctx } = this;
    const today = this._today();
    const M = ctx.model;
    const startOfToday = ctx.app.dayjs().startOf('day').toDate();

    const [users, brands, activeBrands, queries, media, subsActive,
      rawTotal, unparsed, mentions, opinions, entities, citations, canonical,
      reportsReady, reportsGenerating, reportsFailed,
      remindersError, remindersWarn, remindersUnread] = await Promise.all([
      M.User.countDocuments(),
      M.Brand.countDocuments(),
      M.Brand.countDocuments({ status: 'active' }),
      M.MonitorQuery.countDocuments(),
      M.MediaChannel.countDocuments(),
      M.Subscription.countDocuments({ status: 'active' }),
      M.RawAnswer.countDocuments(),
      M.RawAnswer.countDocuments({ parsed: false }),
      M.BrandMention.countDocuments(),
      M.Opinion.countDocuments(),
      M.BrandEntity.countDocuments(),
      M.CitationEdge.countDocuments(),
      M.CanonicalSource.countDocuments(),
      M.Report.countDocuments({ status: 'ready' }),
      M.Report.countDocuments({ status: 'generating' }),
      M.Report.countDocuments({ status: 'failed' }),
      M.Reminder.countDocuments({ level: 'error', read: false }),
      M.Reminder.countDocuments({ level: 'warn', read: false }),
      M.Reminder.countDocuments({ read: false }),
    ]);

    // 今日采集
    const todayTasks = await M.CollectTask.find({ date: today }).lean();
    const coll = todayTasks.reduce((a, t) => ({
      expected: a.expected + this._safeNum(t.expected_slots),
      actual: a.actual + this._safeNum(t.actual_slots),
      failed: a.failed + this._safeNum(t.failed_slots),
    }), { expected: 0, actual: 0, failed: 0 });
    const statusDist = {};
    for (const t of todayTasks) statusDist[t.status] = (statusDist[t.status] || 0) + 1;

    // 今日 LLM
    const llmToday = await M.LlmCallLog.find({ created_at: { $gte: startOfToday } }).lean();
    const llm = {
      today_calls: llmToday.length,
      today_tokens: llmToday.reduce((s, l) => s + this._safeNum(l.usage && l.usage.total_tokens), 0),
      today_errors: llmToday.filter(l => !l.success).length,
    };
    const lat = llmToday.map(l => this._safeNum(l.latency_ms)).filter(n => n > 0).sort((a, b) => a - b);
    llm.today_avg_latency_ms = lat.length ? Math.round(lat.reduce((s, n) => s + n, 0) / lat.length) : 0;
    llm.today_p95_latency_ms = lat.length ? lat[Math.min(lat.length - 1, Math.floor(lat.length * 0.95))] : 0;

    // 今日订单 GMV
    const paidToday = await M.PaymentOrder.find({ status: 'paid', paid_at: { $gte: startOfToday } }).lean();
    const billing = {
      today_gmv: paidToday.reduce((s, o) => s + this._safeNum(o.pay_amount), 0),
      today_orders: paidToday.length,
    };
    const creditAgg = await M.CreditAccount.aggregate([
      { $group: { _id: null, gold: { $sum: '$gold_balance' }, silver: { $sum: '$silver_balance' }, frozen: { $sum: '$frozen' } } },
    ]);
    billing.gold_balance = this._safeNum(creditAgg[0] && creditAgg[0].gold);
    billing.silver_balance = this._safeNum(creditAgg[0] && creditAgg[0].silver);
    billing.frozen = this._safeNum(creditAgg[0] && creditAgg[0].frozen);

    // 调度证据
    const lastCollect = await M.CollectTask.findOne().sort({ date: -1 }).lean();
    const lastReport = await M.Report.findOne({ status: 'ready' }).sort({ generated_at: -1 }).lean();
    const schedule = {
      queue_backlog: Array.isArray(ctx.app.__queueBacklog) ? ctx.app.__queueBacklog.length : 0,
      last_collect_date: lastCollect ? lastCollect.date : null,
      last_report_at: lastReport && lastReport.generated_at ? lastReport.generated_at : null,
    };

    // 最近动态
    const recentUsers = await M.User.find().sort({ created_at: -1 }).limit(8).lean();
    const recentOrders = await M.PaymentOrder.find().sort({ created_at: -1 }).limit(8).lean();

    this._ok({
      counts: {
        users, brands, active_brands: activeBrands, monitor_queries: queries,
        media_channels: media, subscriptions_active: subsActive,
      },
      collection: {
        date: today, tasks: todayTasks.length,
        expected_slots: coll.expected, actual_slots: coll.actual, failed_slots: coll.failed,
        completeness: coll.expected ? +(coll.actual / coll.expected * 100).toFixed(1) : null,
        status: statusDist,
      },
      parse: {
        raw_total: rawTotal, parsed: rawTotal - unparsed, unparsed,
        mentions, opinions, entities, citations, canonical_sources: canonical,
      },
      llm,
      billing,
      reports: { ready: reportsReady, generating: reportsGenerating, failed: reportsFailed },
      reminders: { error: remindersError, warn: remindersWarn, unread: remindersUnread },
      schedule,
      recent: {
        users: recentUsers.map(u => this._fmtUser(u)),
        orders: recentOrders.map(o => this._fmtOrder(o)),
      },
    });
  }

  // ---------- 用户 ----------
  _fmtUser(u) {
    return {
      user_id: u._id, account: u.account || '', phone: u.phone || '', name: u.name || '',
      company: u.company || '', industry: u.industry || '',
      status: u.status || 'active', is_superuser: !!u.is_superuser, roles: u.roles || [],
      password: u.password_plain || '',
      created_at: u.created_at, updated_at: u.updated_at,
    };
  }

  /** POST /admin/users — 运营添加新用户（账号+密码；密码明文存 password_plain 供列表可见） */
  async createUser() {
    const { ctx } = this;
    const bcrypt = require('bcryptjs');
    const b = ctx.request.body || {};
    const account = String(b.account || '').trim();
    const password = String(b.password || '');
    const name = String(b.name || '').trim();
    const phone = String(b.phone || '').trim();
    const company = String(b.company || '').trim();
    const is_superuser = !!b.is_superuser;

    if (!account) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '账号必填' };
      return;
    }
    if (!password || password.length < 4) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '密码至少 4 位' };
      return;
    }
    const exists = await ctx.model.User.findOne({ account }).lean();
    if (exists) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '账号已存在' };
      return;
    }
    if (phone) {
      const phoneHit = await ctx.model.User.findOne({ phone }).lean();
      if (phoneHit) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '手机号已被占用' };
        return;
      }
    }

    const doc = {
      account,
      password_hash: bcrypt.hashSync(password, 10),
      password_plain: password,
      name: name || account,
      phone: phone || undefined,
      company: company || undefined,
      is_superuser,
      roles: is_superuser ? ['admin'] : [],
      status: 'active',
    };
    const user = await ctx.model.User.create(doc);
    // 预建空积分账户，避免首次进控制台缺钱包
    try {
      const existed = await ctx.model.CreditAccount.findOne({ user_id: user._id }).lean();
      if (!existed) {
        const { v4: uuidv4 } = require('uuid');
        await ctx.model.CreditAccount.create({
          _id: uuidv4(),
          user_id: user._id,
          gold_balance: 0,
          silver_balance: 0,
          frozen: 0,
        });
      }
    } catch (e) {
      ctx.logger.warn('[admin.createUser] credit account skip: %s', (e && e.message) || e);
    }

    this._ok({ ...this._fmtUser(user.toObject ? user.toObject() : user), brand_count: 0 });
  }

  /**
   * POST /admin/users/:id/purge
   * 开发环境专用：删除该用户全部业务数据 + 账号本身。
   * body: { confirm_account: string } 必须与目标账号一致
   */
  async purgeUser() {
    const { ctx } = this;
    if (!ctx.service.userPurge.isAllowed()) {
      ctx.status = 403;
      ctx.body = { code: 403, msg: '仅开发环境可用' };
      return;
    }
    const id = String(ctx.params.id || '').trim();
    const confirm = String((ctx.request.body && ctx.request.body.confirm_account) || '').trim();
    if (!id) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'user_id 必填' };
      return;
    }
    const user = await ctx.model.User.findById(id).lean();
    if (!user) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '用户不存在' };
      return;
    }
    if (!confirm || confirm !== String(user.account || '')) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '请输入目标账号以确认删除（confirm_account）' };
      return;
    }
    const actorId = ctx.state.admin && ctx.state.admin._id;
    try {
      const result = await ctx.service.userPurge.purgeAll(id, { actorId });
      this._ok(result);
    } catch (e) {
      const status = e.status || 500;
      ctx.status = status;
      ctx.body = { code: status, msg: String(e.message || e).slice(0, 300) };
    }
  }

  async users() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.kw) q.$or = [{ account: { $regex: ctx.query.kw, $options: 'i' } }, { phone: { $regex: ctx.query.kw, $options: 'i' } }, { name: { $regex: ctx.query.kw, $options: 'i' } }];
    if (ctx.query.status) q.status = ctx.query.status;
    if (ctx.query.super === 'true') q.is_superuser = true;
    const [total, rows] = await Promise.all([
      M.User.countDocuments(q),
      M.User.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    const ids = rows.map(u => u._id);
    const brandCounts = await M.Brand.aggregate([
      { $match: { user_id: { $in: ids } } },
      { $group: { _id: '$user_id', n: { $sum: 1 } } },
    ]);
    const bm = {}; for (const b of brandCounts) bm[b._id] = b.n;
    this._ok({
      list: rows.map(u => ({ ...this._fmtUser(u), brand_count: bm[u._id] || 0 })),
      total, page, page_size,
    });
  }

  async userDetail() {
    const { ctx } = this;
    const M = ctx.model;
    const id = ctx.params.id;
    const user = await M.User.findById(id).lean();
    if (!user) { ctx.status = 404; ctx.body = { code: 404, msg: '用户不存在' }; return; }
    const [brands, credit, orders, clicks, subscriptions, token_summary] = await Promise.all([
      M.Brand.find({ user_id: id }).sort({ created_at: -1 }).lean(),
      M.CreditAccount.findOne({ user_id: id }).lean(),
      M.PaymentOrder.find({ user_id: id }).sort({ created_at: -1 }).limit(20).lean(),
      M.UserClickEvent.find({ user_id: id }).sort({ created_at: -1 }).limit(20).lean(),
      M.Subscription.find({ user_id: id }).sort({ created_at: -1 }).limit(20).lean(),
      this._tokenSummary({ user_id: String(id) }),
    ]);
    const brandIds = brands.map(b => b.brand_id);
    const queryCounts = await M.MonitorQuery.aggregate([
      { $match: { brand_id: { $in: brandIds } } },
      { $group: { _id: '$brand_id', n: { $sum: 1 } } },
    ]);
    const qm = {}; for (const c of queryCounts) qm[c._id] = c.n;
    this._ok({
      user: this._fmtUser(user),
      brands: brands.map(b => ({
        brand_id: b.brand_id, name: b.name, industry: b.industry || '', status: b.status || '',
        query_count: qm[b.brand_id] || 0, rename_remaining: b.rename_remaining ?? 3,
        created_at: b.created_at,
      })),
      credit: credit || null,
      subscriptions: subscriptions.map(s => this._fmtSubscription(s)),
      orders: orders.map(o => this._fmtOrder(o)),
      recent_clicks: clicks.map(c => ({ source: c.source, operation: c.operation, ip: c.ip, created_at: c.created_at })),
      token_summary,
    });
  }

  // ---------- 品牌 ----------
  _fmtBrand(b, account) {
    return {
      brand_id: b.brand_id, name: b.name, industry: b.industry || '', user_id: b.user_id,
      account: account || '', status: b.status || '', platforms: b.platforms || [],
      rename_remaining: b.rename_remaining ?? 3, access_type: b.access_type || 'own',
      created_at: b.created_at, updated_at: b.updated_at,
    };
  }

  async brands() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.kw) q.name = { $regex: ctx.query.kw, $options: 'i' };
    if (ctx.query.status) q.status = ctx.query.status;
    const [total, rows] = await Promise.all([
      M.Brand.countDocuments(q),
      M.Brand.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    const userIds = [...new Set(rows.map(b => b.user_id))];
    const brandIds = rows.map(b => b.brand_id);
    const [users, queryCounts, activeSubs, anySubs] = await Promise.all([
      M.User.find({ _id: { $in: userIds } }).lean(),
      brandIds.length
        ? M.MonitorQuery.aggregate([
          { $match: { brand_id: { $in: brandIds } } },
          { $group: { _id: '$brand_id', n: { $sum: 1 } } },
        ])
        : [],
      brandIds.length
        ? M.Subscription.find({ brand_id: { $in: brandIds }, status: 'active' })
          .sort({ updated_at: -1, created_at: -1 }).lean()
        : [],
      brandIds.length
        ? M.Subscription.find({ brand_id: { $in: brandIds } })
          .sort({ created_at: -1 }).lean()
        : [],
    ]);
    const um = {}; for (const u of users) um[u._id] = u.account || '';
    const qm = {}; for (const c of queryCounts) qm[c._id] = c.n;
    const activeMap = {}; for (const s of activeSubs) { if (!activeMap[s.brand_id]) activeMap[s.brand_id] = s; }
    const anyMap = {}; for (const s of anySubs) { if (!anyMap[s.brand_id]) anyMap[s.brand_id] = s; }
    this._ok({
      list: rows.map(b => {
        const sub = activeMap[b.brand_id] || anyMap[b.brand_id];
        return {
          ...this._fmtBrand(b, um[b.user_id] || ''),
          query_count: qm[b.brand_id] || 0,
          query_limit: sub && sub.query_limit != null ? sub.query_limit : null,
        };
      }),
      total, page, page_size,
    });
  }

  async brandDetail() {
    const { ctx } = this;
    const M = ctx.model;
    const id = ctx.params.id;
    const brand = await M.Brand.findOne({ brand_id: id }).lean();
    if (!brand) { ctx.status = 404; ctx.body = { code: 404, msg: '品牌不存在' }; return; }
    const user = await M.User.findById(brand.user_id).lean();
    const [profile, aliases, products, competitors, queries, subscription, credit, tasks, entities, token_summary] = await Promise.all([
      M.BrandProfile.findOne({ brand_id: id }).lean(),
      M.BrandAlias.find({ brand_id: id }).lean(),
      M.BrandProduct.find({ brand_id: id }).lean(),
      M.CompetitorRegister.find({ brand_id: id }).lean(),
      M.MonitorQuery.find({ brand_id: id }).sort({ query_order: 1, created_at: 1 }).lean(),
      M.Subscription.findOne({ brand_id: id }).sort({ created_at: -1 }).lean(),
      M.CreditAccount.findOne({ user_id: brand.user_id }).lean(),
      M.CollectTask.find({ brand_id: id }).sort({ date: -1 }).limit(10).lean(),
      M.BrandEntity.find({ scope: 'target' }).limit(50).lean(),
      this._tokenSummary({ brand_id: id }),
    ]);
    this._ok({
      brand: this._fmtBrand(brand, user ? user.account : ''),
      user: user ? this._fmtUser(user) : null,
      profile: profile || null,
      aliases: aliases.map(a => ({ alias: a.alias, source: a.source, enabled: !!a.enabled })),
      products: products.map(p => ({ name: p.name, category: p.category, price_range: p.price_range })),
      competitors: competitors.map(c => ({ name: c.name, source: c.source, compet_point: c.compet_point, enabled: !!c.enabled })),
      queries: queries.map(m => ({
        query_id: m.query_id, query: m.query, query_type: m.query_type,
        query_status: !!m.query_status, query_is_execute: !!m.query_is_execute,
        weight: m.weight != null ? m.weight : 1, query_description: m.query_description || '',
      })),
      subscription: subscription ? this._fmtSubscription(subscription) : null,
      credit: credit || null,
      collect_tasks: tasks.map(t => this._fmtCollectTask(t)),
      target_entities: entities.map(e => ({ entity_id: e.entity_id, canonical_name: e.canonical_name, industry: e.industry })),
      token_summary,
    });
  }

  /**
   * POST /admin/brands/:id/query-limit
   * 仅调整该品牌当前订阅的监控问题额度（subscriptions.query_limit），
   * 不改 plans / 其他品牌 / 套餐门控逻辑。购套餐激活仍可能按 plan 回写。
   */
  async updateBrandQueryLimit() {
    const { ctx } = this;
    const M = ctx.model;
    const brandId = ctx.params.id;
    const brand = await M.Brand.findOne({ brand_id: brandId }).lean();
    if (!brand) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '品牌不存在' };
      return;
    }
    const raw = (ctx.request.body || {}).query_limit;
    const limit = parseInt(raw, 10);
    if (!Number.isFinite(limit) || limit < 1 || limit > 500) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'query_limit 须为 1–500 的整数' };
      return;
    }
    let sub = await M.Subscription.findOne({ brand_id: brandId, status: 'active' })
      .sort({ updated_at: -1, created_at: -1 });
    if (!sub) {
      sub = await M.Subscription.findOne({ brand_id: brandId }).sort({ created_at: -1 });
    }
    if (!sub) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '该品牌无订阅记录，无法调整额度' };
      return;
    }
    const prev = sub.query_limit;
    sub.query_limit = limit;
    await sub.save();
    this._ok({
      brand_id: brandId,
      subscription_id: sub.subscription_id,
      previous_query_limit: prev,
      query_limit: sub.query_limit,
      query_count: sub.query_count,
      subscription: this._fmtSubscription(sub.toObject ? sub.toObject() : sub),
    });
  }

  // ---------- 采集 ----------
  _fmtCollectTask(t) {
    return {
      task_id: t.task_id, brand_id: t.brand_id, date: t.date, trigger: t.trigger,
      expected_slots: this._safeNum(t.expected_slots), actual_slots: this._safeNum(t.actual_slots),
      failed_slots: this._safeNum(t.failed_slots), completeness_rate: t.completeness_rate,
      status: t.status, started_at: t.started_at, finished_at: t.finished_at,
    };
  }

  async collectTasks() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const { from, to } = this._range();
    const q = {};
    if (from || to) { q.date = {}; if (from) q.date.$gte = from; if (to) q.date.$lte = to; }
    if (ctx.query.status) q.status = ctx.query.status;
    if (ctx.query.brand_id) q.brand_id = ctx.query.brand_id;
    const [total, rows] = await Promise.all([
      M.CollectTask.countDocuments(q),
      M.CollectTask.find(q).sort({ date: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    // 品牌名映射 + 账户名映射（品牌名可重复，账户名区分归属）
    const bids = [...new Set(rows.map(t => t.brand_id))];
    const brands = await M.Brand.find({ brand_id: { $in: bids } }).lean();
    const bm = {}; for (const b of brands) bm[b.brand_id] = b.name;
    const am = await this._brandAccountMap(brands);
    this._ok({ list: rows.map(t => ({ ...this._fmtCollectTask(t), brand_name: bm[t.brand_id] || t.brand_id, account: am[t.brand_id] || '' })), total, page, page_size });
  }

  async collectSlots() {
    const { ctx } = this;
    const M = ctx.model;
    const taskId = ctx.params.id;
    const task = await M.CollectTask.findOne({ task_id: taskId }).lean();
    if (!task) { ctx.status = 404; ctx.body = { code: 404, msg: '任务不存在' }; return; }
    const slots = await M.CollectSlot.find({ task_id: taskId }).sort({ platform: 1, query_id: 1 }).lean();
    const dist = {};
    for (const s of slots) dist[s.status] = (dist[s.status] || 0) + 1;
    this._ok({
      task: this._fmtCollectTask(task),
      summary: dist,
      list: slots.map(s => ({
        slot_id: s.slot_id, query_id: s.query_id, query_type: s.query_type,
        platform: s.platform, end: s.end, question_sent: s.question_sent,
        mock_account_id: s.mock_account_id, status: s.status, answer_id: s.answer_id,
        error: s.error, attempts: s.attempts, finished_at: s.finished_at,
        task_id: s.task_id, brand_id: s.brand_id, date: s.date,
      })),
    });
  }

  /** 跨任务槽位列表（可按 status / date / platform / brand_id 筛选） */
  async collectSlotList() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const { from, to } = this._range();
    const q = {};
    if (from || to) { q.date = {}; if (from) q.date.$gte = from; if (to) q.date.$lte = to; }
    if (ctx.query.status) q.status = ctx.query.status;
    if (ctx.query.brand_id) q.brand_id = ctx.query.brand_id;
    if (ctx.query.platform) q.platform = ctx.query.platform;
    if (ctx.query.task_id) q.task_id = ctx.query.task_id;
    const [total, rows] = await Promise.all([
      M.CollectSlot.countDocuments(q),
      M.CollectSlot.find(q).sort({ date: -1, updated_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    const bids = [...new Set(rows.map(s => s.brand_id).filter(Boolean))];
    const brands = bids.length ? await M.Brand.find({ brand_id: { $in: bids } }).lean() : [];
    const bm = {}; for (const b of brands) bm[b.brand_id] = b.name;
    const am = await this._brandAccountMap(brands);
    this._ok({
      list: rows.map(s => ({
        slot_id: s.slot_id,
        task_id: s.task_id,
        brand_id: s.brand_id,
        brand_name: bm[s.brand_id] || s.brand_id,
        account: am[s.brand_id] || '',
        date: s.date,
        query_id: s.query_id,
        query_type: s.query_type,
        platform: s.platform,
        end: s.end,
        question_sent: s.question_sent,
        mock_account_id: s.mock_account_id,
        status: s.status,
        answer_id: s.answer_id,
        error: s.error,
        attempts: s.attempts,
        finished_at: s.finished_at,
      })),
      total, page, page_size,
    });
  }

  /** 重置单个终态 fail 槽位 → pending，供采集端重新领取 */
  async collectSlotReset() {
    const { ctx } = this;
    try {
      const r = await ctx.service.collect.resetFailedSlot(ctx.params.slotId);
      this._ok({
        slot: {
          slot_id: r.slot.slot_id, status: r.slot.status, attempts: r.slot.attempts,
          error: r.slot.error || null, task_id: r.slot.task_id,
        },
        task: r.task ? this._fmtCollectTask(r.task) : null,
      });
    } catch (e) {
      ctx.status = e.status || 500;
      ctx.body = { code: ctx.status, msg: e.message || '重置失败' };
    }
  }

  /** 单槽重新解析：清旧事实 → A/B/C → 聚合该品牌×该日（不改原文/采集状态） */
  async collectSlotReparse() {
    const { ctx } = this;
    try {
      const r = await ctx.service.parse.reprocessSlot(ctx.params.slotId);
      this._ok(r);
    } catch (e) {
      ctx.status = e.status || 500;
      ctx.body = { code: ctx.status, msg: e.message || '重解析失败' };
    }
  }

  /** 重置某采集任务下全部 fail 槽位 */
  async collectTaskResetFailed() {
    const { ctx } = this;
    try {
      const r = await ctx.service.collect.resetFailedSlotsByTask(ctx.params.id);
      this._ok({
        reset_count: r.reset_count,
        task: r.task ? this._fmtCollectTask(r.task) : null,
      });
    } catch (e) {
      ctx.status = e.status || 500;
      ctx.body = { code: ctx.status, msg: e.message || '重置失败' };
    }
  }

  async collectAnswers() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const { from, to } = this._range();
    const q = {};
    if (from || to) { q.date = {}; if (from) q.date.$gte = from; if (to) q.date.$lte = to; }
    if (ctx.query.brand_id) q.brand_id = ctx.query.brand_id;
    const parsed = this._bool(ctx.query.parsed);
    if (parsed !== undefined) q.parsed = parsed;
    const [total, rows] = await Promise.all([
      M.RawAnswer.countDocuments(q),
      M.RawAnswer.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    const bids = [...new Set(rows.map(a => a.brand_id).filter(Boolean))];
    const brands = bids.length ? await M.Brand.find({ brand_id: { $in: bids } }).lean() : [];
    const bm = {}; for (const b of brands) bm[b.brand_id] = b.name;
    const am = await this._brandAccountMap(brands);
    this._ok({
      list: rows.map(a => ({
        answer_id: a.answer_id, slot_id: a.slot_id, brand_id: a.brand_id,
        brand_name: bm[a.brand_id] || a.brand_id,
        account: am[a.brand_id] || '',
        query_id: a.query_id,
        platform: a.platform, date: a.date, question_sent: a.question_sent,
        answer_len: (a.answer_text || '').length, cited_urls: (a.cited_urls || []).length,
        parsed: !!a.parsed, created_at: a.created_at,
      })),
      total, page, page_size,
    });
  }

  /** 原始回答详情：正文 + 信源列表 */
  async collectAnswerDetail() {
    const { ctx } = this;
    const M = ctx.model;
    const id = ctx.params.id;
    const a = await M.RawAnswer.findOne({ answer_id: id }).lean();
    if (!a) { ctx.status = 404; ctx.body = { code: 404, msg: '回答不存在' }; return; }
    const brand = a.brand_id ? await M.Brand.findOne({ brand_id: a.brand_id }).lean() : null;
    this._ok({
      answer_id: a.answer_id,
      slot_id: a.slot_id,
      brand_id: a.brand_id,
      brand_name: (brand && brand.name) || a.brand_id,
      query_id: a.query_id,
      query_type: a.query_type,
      platform: a.platform,
      end: a.end,
      date: a.date,
      question_sent: a.question_sent,
      answer_text: a.answer_text || '',
      answer_len: (a.answer_text || '').length,
      cited_urls: Array.isArray(a.cited_urls) ? a.cited_urls : [],
      parsed: !!a.parsed,
      model_meta: a.model_meta,
      created_at: a.created_at,
    });
  }

  async collectSnapshots() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.brand_id) q.brand_id = ctx.query.brand_id;
    if (ctx.query.slot_id) q.slot_id = ctx.query.slot_id;
    const [total, rows] = await Promise.all([
      M.Snapshot.countDocuments(q),
      M.Snapshot.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    const bids = [...new Set(rows.map(s => s.brand_id).filter(Boolean))];
    const brands = bids.length ? await M.Brand.find({ brand_id: { $in: bids } }).lean() : [];
    const bm = {}; for (const b of brands) bm[b.brand_id] = b.name;
    const am = await this._brandAccountMap(brands);
    this._ok({
      list: rows.map(s => ({
        snapshot_id: s.snapshot_id, slot_id: s.slot_id, brand_id: s.brand_id,
        brand_name: bm[s.brand_id] || s.brand_id,
        account: am[s.brand_id] || '',
        platform: s.platform, exec_date: s.exec_date, photo_url: s.photo_url, size: s.size,
      })),
      total, page, page_size,
    });
  }

  // ---------- 解析 ----------
  async parseOverview() {
    const { ctx } = this;
    const M = ctx.model;
    const polarity = await M.Opinion.aggregate([
      { $group: { _id: '$polarity', n: { $sum: 1 } } },
    ]);
    const pol = { positive: 0, neutral: 0, negative: 0 };
    for (const p of polarity) if (pol[p._id] !== undefined) pol[p._id] = p.n;
    // 最近 7 天口碑分
    const days = [];
    for (let i = 6; i >= 0; i--) days.push(ctx.app.dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    const recent = await M.DailyMetricBrand.aggregate([
      { $match: { date: { $in: days } } },
      { $group: { _id: '$date', avg_rep: { $avg: '$rep_score' }, avg_mention: { $avg: '$mention_rate' }, n: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const [entities, canonical, citedArticles, mentions, opinions, edges] = await Promise.all([
      M.BrandEntity.countDocuments(),
      M.CanonicalSource.countDocuments(),
      M.CitedArticle.countDocuments(),
      M.BrandMention.countDocuments(),
      M.Opinion.countDocuments(),
      M.CitationEdge.countDocuments(),
    ]);
    // $avg 对全组缺字段/无数值返回 null（如 daily_metric_brands 尚未写入 mention_rate），兜底为 0
    const toFixedSafe = (v, d) => (typeof v === 'number' && Number.isFinite(v)) ? +v.toFixed(d) : 0;
    this._ok({
      counts: { entities, canonical_sources: canonical, cited_articles: citedArticles, mentions, opinions, citations: edges },
      polarity: pol,
      recent_7d: recent.map(r => ({
        date: r._id,
        avg_rep_score: toFixedSafe(r.avg_rep, 1),
        avg_mention_rate: toFixedSafe(r.avg_mention, 2),
        brands: r.n || 0,
      })),
    });
  }

  // ---------- 流水线时间轴（品牌×天：槽位→采集→解析→聚合→报告） ----------
  /** 品牌×天 列表 + 各阶段状态汇总 */
  async pipelineDays() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.brand_id) q.brand_id = ctx.query.brand_id;
    const { from, to } = this._range();
    if (from || to) { q.date = {}; if (from) q.date.$gte = from; if (to) q.date.$lte = to; }
    const [total, tasks] = await Promise.all([
      M.CollectTask.countDocuments(q),
      M.CollectTask.find(q).sort({ date: -1, brand_id: 1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    const bids = [...new Set(tasks.map(t => t.brand_id))];
    const brands = await M.Brand.find({ brand_id: { $in: bids } }).lean();
    const bm = {}; for (const b of brands) bm[b.brand_id] = b.name;
    // 一次取出这些品牌×天的全部阶段事件
    const orKeys = tasks.map(t => ({ brand_id: t.brand_id, date: t.date }));
    const events = orKeys.length ? await M.PipelineEvent.find({ $or: orKeys }).lean() : [];
    const evBy = {}; for (const e of events) evBy[`${e.brand_id}|${e.date}|${e.stage}`] = e;
    const STAGES = ['expand', 'collect', 'parse', 'aggregate', 'report'];
    const list = tasks.map(t => {
      const stages = {};
      let hasError = false;
      let latest = null;
      for (const s of STAGES) {
        const e = evBy[`${t.brand_id}|${t.date}|${s}`];
        stages[s] = e ? e.status : 'none';
        if (e) {
          if (e.status === 'fail' || e.status === 'partial') hasError = true;
          if (!latest || (e.updated_at && (!latest.updated_at || e.updated_at > latest.updated_at))) latest = e;
        }
      }
      return {
        brand_id: t.brand_id, brand_name: bm[t.brand_id] || t.brand_id, date: t.date,
        task_status: t.status, completeness_rate: t.completeness_rate,
        expected_slots: this._safeNum(t.expected_slots), actual_slots: this._safeNum(t.actual_slots), failed_slots: this._safeNum(t.failed_slots),
        stages, has_error: hasError, latest_event_at: latest ? latest.updated_at : null,
      };
    });
    this._ok({ list, total, page, page_size });
  }

  /** 单品牌×单天 完整时间轴 + 槽位明细 + 结果汇总 */
  async pipelineTimeline() {
    const { ctx } = this;
    const M = ctx.model;
    const brandId = String(ctx.query.brand_id || '');
    const date = String(ctx.query.date || '');
    if (!brandId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'brand_id 与 date(YYYY-MM-DD) 必填' };
      return;
    }
    const [brand, task, events, slots, answers, parsedAnswers] = await Promise.all([
      M.Brand.findOne({ brand_id: brandId }).lean(),
      M.CollectTask.findOne({ brand_id: brandId, date }).lean(),
      M.PipelineEvent.find({ brand_id: brandId, date }).lean(),
      M.CollectSlot.find({ brand_id: brandId, date }).sort({ query_id: 1, platform: 1 }).lean(),
      M.RawAnswer.countDocuments({ brand_id: brandId, date }),
      M.RawAnswer.countDocuments({ brand_id: brandId, date, parsed: true }),
    ]);
    const [mentions, opinions, edges, dmq, dmb, sds, lb] = await Promise.all([
      M.BrandMention.countDocuments({ brand_id: brandId, date }),
      M.Opinion.countDocuments({ brand_id: brandId, date }),
      M.CitationEdge.countDocuments({ brand_id: brandId, date }),
      M.DailyMetricQuery.countDocuments({ brand_id: brandId, date }),
      M.DailyMetricBrand.countDocuments({ brand_id: brandId, date }),
      M.SourceDailyStat.countDocuments({ brand_id: brandId, date }),
      M.LeaderboardDaily.countDocuments({ brand_id: brandId, date }),
    ]);
    const slotSummary = {};
    const slotErrors = [];
    for (const s of slots) {
      slotSummary[s.status] = (slotSummary[s.status] || 0) + 1;
      if (s.status === 'fail' && s.error) {
        slotErrors.push({ slot_id: s.slot_id, platform: s.platform, query_id: s.query_id, error: s.error, attempts: this._safeNum(s.attempts) });
      }
    }
    const lastReport = await M.Report.findOne({ brand_id: brandId }).sort({ generated_at: -1 }).lean();
    this._ok({
      brand: brand ? { brand_id: brand.brand_id, name: brand.name, industry: brand.industry || '' } : { brand_id: brandId, name: brandId, industry: '' },
      date,
      task: task ? this._fmtCollectTask(task) : null,
      timeline: events.map(e => this._fmtEvent(e)),
      slots: {
        summary: slotSummary,
        list: slots.map(s => ({
          slot_id: s.slot_id, query_id: s.query_id, query_type: s.query_type,
          platform: s.platform, end: s.end, question_sent: s.question_sent,
          mock_account_id: s.mock_account_id, status: s.status, answer_id: s.answer_id,
          error: s.error, attempts: s.attempts, finished_at: s.finished_at,
        })),
        errors: slotErrors,
      },
      answers: { total: answers, parsed: parsedAnswers, unparsed: answers - parsedAnswers },
      results: { mentions, opinions, citation_edges: edges, daily_metric_queries: dmq, daily_metric_brands: dmb, source_daily_stats: sds, leaderboard_dailies: lb },
      report: lastReport ? {
        period_type: lastReport.period_type, period_key: lastReport.period_key, label: lastReport.label,
        status: lastReport.status, generated_at: lastReport.generated_at,
      } : null,
    });
  }

  _fmtEvent(e) {
    return {
      event_id: e.event_id, stage: e.stage, status: e.status, message: e.message,
      error: e.error, detail: e.detail, created_at: e.created_at, updated_at: e.updated_at,
    };
  }

  // ---------- LLM ----------
  /** 汇总某维度的 token 消耗 */
  async _tokenSummary(match = {}) {
    const { ctx } = this;
    const rows = await ctx.model.LlmCallLog.aggregate([
      { $match: match },
      { $group: {
        _id: '$call_site',
        calls: { $sum: 1 },
        errors: { $sum: { $cond: ['$success', 0, 1] } },
        tokens: { $sum: { $ifNull: ['$usage.total_tokens', 0] } },
        prompt_tokens: { $sum: { $ifNull: ['$usage.prompt_tokens', 0] } },
        completion_tokens: { $sum: { $ifNull: ['$usage.completion_tokens', 0] } },
      } },
      { $sort: { tokens: -1 } },
    ]);
    const by_call_site = rows.map(r => ({
      call_site: r._id || 'UNKNOWN',
      label: CALL_SITE_LABELS[r._id] || r._id || 'UNKNOWN',
      calls: r.calls,
      errors: r.errors,
      tokens: this._safeNum(r.tokens),
      prompt_tokens: this._safeNum(r.prompt_tokens),
      completion_tokens: this._safeNum(r.completion_tokens),
    }));
    return {
      calls: by_call_site.reduce((s, x) => s + x.calls, 0),
      errors: by_call_site.reduce((s, x) => s + x.errors, 0),
      tokens: by_call_site.reduce((s, x) => s + x.tokens, 0),
      prompt_tokens: by_call_site.reduce((s, x) => s + x.prompt_tokens, 0),
      completion_tokens: by_call_site.reduce((s, x) => s + x.completion_tokens, 0),
      by_call_site,
    };
  }

  async llmLogs() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const { from, to } = this._range();
    const q = {};
    if (from || to) { q.created_at = {}; if (from) q.created_at.$gte = ctx.app.dayjs(from).startOf('day').toDate(); if (to) q.created_at.$lte = ctx.app.dayjs(to).endOf('day').toDate(); }
    if (ctx.query.call_site) q.call_site = ctx.query.call_site;
    if (ctx.query.brand_id) q.brand_id = ctx.query.brand_id;
    if (ctx.query.user_id) q.user_id = ctx.query.user_id;
    const success = this._bool(ctx.query.success);
    if (success !== undefined) q.success = success;
    const [total, rows, agg] = await Promise.all([
      M.LlmCallLog.countDocuments(q),
      M.LlmCallLog.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
      M.LlmCallLog.aggregate([
        { $match: q },
        { $group: {
          _id: '$call_site',
          calls: { $sum: 1 },
          errors: { $sum: { $cond: ['$success', 0, 1] } },
          tokens: { $sum: { $ifNull: ['$usage.total_tokens', 0] } },
          avg_latency: { $avg: '$latency_ms' },
        } },
        { $sort: { tokens: -1 } },
      ]),
    ]);
    const userIds = [...new Set(rows.map(l => l.user_id).filter(Boolean))];
    const brandIds = [...new Set(rows.map(l => l.brand_id).filter(Boolean))];
    const [users, brands] = await Promise.all([
      userIds.length ? M.User.find({ _id: { $in: userIds } }).lean() : [],
      brandIds.length ? M.Brand.find({ brand_id: { $in: brandIds } }).lean() : [],
    ]);
    const um = {}; for (const u of users) um[String(u._id)] = u.account || '';
    const bm = {}; for (const b of brands) bm[b.brand_id] = b.name;
    this._ok({
      list: rows.map(l => ({
        call_site: l.call_site,
        call_site_label: CALL_SITE_LABELS[l.call_site] || l.call_site,
        user_id: l.user_id || '',
        account: um[String(l.user_id)] || '',
        brand_id: l.brand_id || '',
        brand_name: bm[l.brand_id] || '',
        ref_id: l.ref_id, prompt_version: l.prompt_version,
        model: l.model, usage: l.usage, latency_ms: l.latency_ms, success: !!l.success,
        retry: l.retry, error: l.error, created_at: l.created_at,
      })),
      agg: agg.map(a => ({
        call_site: a._id,
        label: CALL_SITE_LABELS[a._id] || a._id,
        calls: a.calls, errors: a.errors,
        tokens: this._safeNum(a.tokens), avg_latency_ms: Math.round(a.avg_latency || 0),
      })),
      total, page, page_size,
    });
  }

  // ---------- 计费 ----------
  _fmtOrder(o) {
    return {
      order_no: o.order_no, user_id: o.user_id, brand_id: o.brand_id,
      order_category: o.order_category, plan_name: o.plan_name, pay_method: o.pay_method,
      pay_amount: this._safeNum(o.pay_amount), credit_amount: this._safeNum(o.credit_amount),
      status: o.status, is_invoiced: !!o.is_invoiced, paid_at: o.paid_at, created_at: o.created_at,
    };
  }

  _fmtSubscription(s) {
    return {
      subscription_id: s.subscription_id, user_id: s.user_id, brand_id: s.brand_id,
      plan_name: s.plan_name, vip_level: s.vip_level, start_date: s.start_date, expire_date: s.expire_date,
      query_limit: s.query_limit, query_count: s.query_count, status: s.status,
    };
  }

  async plans() {
    const { ctx } = this;
    const rows = await ctx.model.Plan.find().sort({ sort: 1, plan_id: 1 }).lean();
    this._ok({ list: rows.map(p => ({
      plan_id: p.plan_id, plan_code: p.plan_code, plan_name: p.plan_name, plan_type: p.plan_type,
      billing_cycle: p.billing_cycle, price: p.price, original_price: p.original_price,
      duration_days: p.duration_days, query_limit: p.query_limit, on_sale: p.on_sale !== false, sort: p.sort,
    })) });
  }

  async subscriptions() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.status) q.status = ctx.query.status;
    if (ctx.query.brand_id) q.brand_id = ctx.query.brand_id;
    const [total, rows] = await Promise.all([
      M.Subscription.countDocuments(q),
      M.Subscription.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(s => this._fmtSubscription(s)), total, page, page_size });
  }

  async orders() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.status) q.status = ctx.query.status;
    if (ctx.query.category) q.order_category = ctx.query.category;
    const [total, rows] = await Promise.all([
      M.PaymentOrder.countDocuments(q),
      M.PaymentOrder.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(o => this._fmtOrder(o)), total, page, page_size });
  }

  async creditAccounts() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const [total, rows, agg] = await Promise.all([
      M.CreditAccount.countDocuments(),
      M.CreditAccount.find().sort({ updated_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
      M.CreditAccount.aggregate([
        { $group: { _id: null, gold: { $sum: '$gold_balance' }, silver: { $sum: '$silver_balance' }, frozen: { $sum: '$frozen' }, recharge: { $sum: '$total_recharge' }, consume: { $sum: '$total_consume' } } },
      ]),
    ]);
    this._ok({
      list: rows.map(c => ({
        user_id: c.user_id, gold_balance: c.gold_balance, silver_balance: c.silver_balance,
        frozen: c.frozen, available: c.available, publish_available: c.publish_available,
        total_recharge: c.total_recharge, total_consume: c.total_consume, updated_at: c.updated_at,
      })),
      total, page, page_size,
      totals: agg[0] ? {
        gold_balance: this._safeNum(agg[0].gold), silver_balance: this._safeNum(agg[0].silver),
        frozen: this._safeNum(agg[0].frozen), total_recharge: this._safeNum(agg[0].recharge), total_consume: this._safeNum(agg[0].consume),
      } : null,
    });
  }

  async creditTransactions() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.type) q.type = ctx.query.type;
    const [total, rows] = await Promise.all([
      M.CreditTransaction.countDocuments(q),
      M.CreditTransaction.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(t => ({
      txn_id: t.txn_id, user_id: t.user_id, type: t.type, coin: t.coin, amount: t.amount,
      balance_after: t.balance_after, ref_type: t.ref_type, ref_id: t.ref_id, remark: t.remark, created_at: t.created_at,
    })), total, page, page_size });
  }

  // ---------- 内容与发稿 ----------
  async mediaChannels() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.kw) q.name = { $regex: ctx.query.kw, $options: 'i' };
    if (ctx.query.type) q.type = ctx.query.type;
    const [total, rows, stat] = await Promise.all([
      M.MediaChannel.countDocuments(q),
      M.MediaChannel.find(q).sort({ ref_count: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
      M.MediaChannel.aggregate([{ $group: { _id: null, n: { $sum: 1 }, enabled: { $sum: { $cond: ['$enabled', 1, 0] } }, ref: { $sum: '$ref_count' } } }]),
    ]);
    this._ok({
      list: rows.map(c => ({
        media_key: c.media_key, name: c.name, type: c.type, categories: c.categories,
        indexed_engines: c.indexed_engines, sell_price: c.sell_price, list_price: c.list_price,
        ref_count: c.ref_count, article_count: c.article_count, cost_per_citation: c.cost_per_citation,
        enabled: c.enabled !== false,
      })),
      total, page, page_size,
      totals: stat[0] ? { total: stat[0].n, enabled: stat[0].enabled, ref_count: this._safeNum(stat[0].ref) } : null,
    });
  }

  async publishOrders() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.status) q.status = ctx.query.status;
    const [total, rows] = await Promise.all([
      M.PublishOrder.countDocuments(q),
      M.PublishOrder.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(o => ({
      order_no: o.order_no, user_id: o.user_id, brand_id: o.brand_id, article_title: o.article_title,
      media_name: o.media_name, status: o.status, published_url: o.published_url, fail_reason: o.fail_reason,
      sell_price: o.sell_price, cite_count: o.cite_count, published_at: o.published_at, created_at: o.created_at,
    })), total, page, page_size });
  }

  async articles() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.status) q.status = ctx.query.status;
    const [total, rows] = await Promise.all([
      M.ArticleGenerated.countDocuments(q),
      M.ArticleGenerated.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(a => ({
      article_id: a.article_id, job_id: a.job_id, brand_id: a.brand_id, title: a.title,
      word_count: a.word_count, status: a.status, publish_order_nos: a.publish_order_nos, created_at: a.created_at,
    })), total, page, page_size });
  }

  async writingJobs() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.status) q.status = ctx.query.status;
    const [total, rows] = await Promise.all([
      M.WritingJob.countDocuments(q),
      M.WritingJob.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(j => ({
      job_id: j.job_id, uid: j.uid, brand_id: j.brand_id, topic: j.topic, status: j.status,
      current_node: j.current_node, created_at: j.created_at,
    })), total, page, page_size });
  }

  // ---------- 报告 ----------
  async reports() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.period_type) q.period_type = ctx.query.period_type;
    if (ctx.query.status) q.status = ctx.query.status;
    const [total, rows] = await Promise.all([
      M.Report.countDocuments(q),
      M.Report.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    const bids = [...new Set(rows.map(r => r.brand_id))];
    const brands = await M.Brand.find({ brand_id: { $in: bids } }).lean();
    const bm = {}; for (const b of brands) bm[b.brand_id] = b.name;
    this._ok({ list: rows.map(r => ({
      report_id: r.report_id, brand_id: r.brand_id, brand_name: bm[r.brand_id] || r.brand_id,
      period_type: r.period_type, period_key: r.period_key, label: r.label, status: r.status,
      generated_at: r.generated_at, created_at: r.created_at,
    })), total, page, page_size });
  }

  // ---------- 首登漏斗 ----------
  async onboardingTasks() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const [total, rows, funnel] = await Promise.all([
      M.OnboardingTask.countDocuments(),
      M.OnboardingTask.find().sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
      M.OnboardingTask.aggregate([{ $group: { _id: '$stage', n: { $sum: 1 } } }]),
    ]);
    this._ok({
      list: rows.map(t => ({
        task_id: t.task_id, user_id: t.user_id, brand_id: t.brand_id,
        brand_name: t.input && t.input.brand_name, stage: t.stage, error: t.error,
        crawler_started_at: t.crawler_started_at, keyword_gen_completed_at: t.keyword_gen_completed_at,
        created_at: t.created_at,
      })),
      funnel: funnel.map(f => ({ stage: f._id, n: f.n })),
      total, page, page_size,
    });
  }

  async onboardingTraces() {
    const { ctx } = this;
    const M = ctx.model;
    const taskId = ctx.query.task_id;
    const brandId = ctx.query.brand_id;
    if (!taskId && !brandId) { this._ok({ list: [], total: 0 }); return; }
    // 优先 task_id；同时用 brand_id 兜底（历史确认未挂 task 的留痕）
    const q = taskId && brandId
      ? { $or: [{ task_id: taskId }, { brand_id: brandId }] }
      : (taskId ? { task_id: taskId } : { brand_id: brandId });
    const rows = await M.OnboardingTrace.find(q).sort({ created_at: 1 }).lean();
    this._ok({ list: rows.map(t => ({
      kind: t.kind, query: t.query, url: t.url, keyword: t.keyword, weight: t.weight,
      snapshot: t.snapshot, meta: t.meta, created_at: t.created_at,
    })), total: rows.length });
  }

  // ---------- 行为埋点 ----------
  async behaviorEvents() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.source) q.source = ctx.query.source;
    const [total, rows, top] = await Promise.all([
      M.UserClickEvent.countDocuments(q),
      M.UserClickEvent.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
      M.UserClickEvent.aggregate([
        { $group: { _id: '$source', n: { $sum: 1 } } },
        { $sort: { n: -1 } }, { $limit: 20 },
      ]),
    ]);
    this._ok({
      list: rows.map(e => ({ user_id: e.user_id, brand_id: e.brand_id, source: e.source, operation: e.operation, ip: e.ip, created_at: e.created_at })),
      top_pages: top.map(t => ({ source: t._id, n: t.n })),
      total, page, page_size,
    });
  }

  // ---------- 诊断 ----------
  async diagnosis() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.status) q.status = ctx.query.status;
    const [total, rows] = await Promise.all([
      M.DiagnosisTask.countDocuments(q),
      M.DiagnosisTask.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(d => ({
      diagnosis_id: d.diagnosis_id, user_id: d.user_id, status: d.status, credit_cost: d.credit_cost,
      order_no: d.order_no, aliases: d.aliases, created_at: d.created_at,
    })), total, page, page_size });
  }

  // ---------- Agent ----------
  async agentHistories() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.kind) q.kind = ctx.query.kind;
    const [total, rows] = await Promise.all([
      M.AgentHistory.countDocuments(q),
      M.AgentHistory.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(a => ({
      session_id: a.session_id, uid: a.uid, brand_id: a.brand_id, kind: a.kind, created_at: a.created_at,
    })), total, page, page_size });
  }

  // ---------- 站内消息 ----------
  async reminders() {
    const { ctx } = this;
    const M = ctx.model;
    const { page, page_size } = this._page();
    const q = {};
    if (ctx.query.level) q.level = ctx.query.level;
    if (ctx.query.type) q.type = ctx.query.type;
    const [total, rows] = await Promise.all([
      M.Reminder.countDocuments(q),
      M.Reminder.find(q).sort({ created_at: -1 }).skip((page - 1) * page_size).limit(page_size).lean(),
    ]);
    this._ok({ list: rows.map(r => ({
      user_id: r.user_id, brand_id: r.brand_id, type: r.type, level: r.level,
      title: r.title, body: r.body, read: !!r.read, created_at: r.created_at,
    })), total, page, page_size });
  }

  // ---------- 系统观测 ----------
  async system() {
    const { ctx } = this;
    const M = ctx.model;
    const menus = await M.MenuConfig.find().sort({ sort_order: 1 }).lean();
    const lastCollect = await M.CollectTask.findOne().sort({ date: -1 }).lean();
    const lastParsedAnswer = await M.RawAnswer.findOne({ parsed: true }).sort({ updated_at: -1 }).lean();
    const lastReport = await M.Report.findOne({ status: 'ready' }).sort({ generated_at: -1 }).lean();
    this._ok({
      schedules: [
        { name: 'daily_collect', cron: '0 30 0 * * *', desc: '每日 00:30 采集任务展开（展槽）', last_evidence: lastCollect ? `最近采集日 ${lastCollect.date}` : '尚无采集记录' },
        { name: 'daily_parse', cron: '0 0 4 * * *', desc: '每日 04:00 解析与聚合批处理', last_evidence: lastParsedAnswer ? `最近解析回答 ${ctx.app.dayjs(lastParsedAnswer.updated_at).format('YYYY-MM-DD HH:mm')}` : '尚无解析记录' },
        { name: 'report_generate', cron: '0 0 5 * * 0', desc: '每周日 05:00 周报生成（月报另配）', last_evidence: lastReport && lastReport.generated_at ? `最近报告 ${ctx.app.dayjs(lastReport.generated_at).format('YYYY-MM-DD HH:mm')}` : '尚无报告' },
      ],
      queue: {
        impl: '内存队列（dev）',
        backlog: Array.isArray(ctx.app.__queueBacklog) ? ctx.app.__queueBacklog.length : 0,
        topics: Array.isArray(ctx.app.__queueBacklog) ? [...new Set(ctx.app.__queueBacklog.map(b => b.topic))] : [],
      },
      menus: menus.map(m => ({
        menu_code: m.menu_code, category: m.category, label: m.label, path: m.path,
        icon: m.icon, sort_order: m.sort_order, visible: m.visible !== false, min_plan: m.min_plan,
      })),
    });
  }
}

module.exports = AdminController;
