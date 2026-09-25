/**
 * 采集 IP 台账：submit 旁路计数 + pull 日限校验（失败不影响主流程）
 */
'use strict';

const Service = require('egg').Service;

const STATUS_FIELD = {
  ok: 'ok',
  fail: 'fail',
  empty: 'empty',
};

class CollectorIpService extends Service {
  get defaultDailyLimit() {
    const n = Number(this.app.config.collector && this.app.config.collector.dailyLimitDefault);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 80;
  }

  get platforms() {
    const list = (this.app.config.collector && this.app.config.collector.platforms) || [];
    return Array.isArray(list) ? list : [];
  }

  /**
   * @param {{ machine_name?: string, ip?: string, port?: number|string, status: string, platform?: string, date?: string }} opts
   */
  async recordSubmit(opts = {}) {
    const { ctx } = this;
    try {
      const machine = String(opts.machine_name || '').trim();
      const ip = String(opts.ip || '').trim();
      const status = String(opts.status || '').trim();
      if (!machine || !ip || !STATUS_FIELD[status]) return;

      let platform = String(opts.platform || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!platform) platform = 'unknown';

      const day = this._bizDay(opts.date);
      const keepDays = this._keepDays(day);
      const field = STATUS_FIELD[status];
      const now = new Date();

      const $inc = {
        [`${field}_count`]: 1,
        total_count: 1,
        [`by_platform.${platform}.${field}`]: 1,
        [`by_platform.${platform}.total`]: 1,
        [`by_day.${day}.${field}`]: 1,
        [`by_day.${day}.total`]: 1,
        [`by_day.${day}.by_platform.${platform}.${field}`]: 1,
        [`by_day.${day}.by_platform.${platform}.total`]: 1,
      };

      const $set = { last_seen_at: now };
      if (status === 'ok') $set.last_ok_at = now;
      else if (status === 'fail') $set.last_fail_at = now;
      else if (status === 'empty') $set.last_empty_at = now;

      const portNum = Number(opts.port);
      if (Number.isFinite(portNum) && portNum > 0) $set.port = portNum;

      await ctx.model.CollectorIp.updateOne(
        { machine_name: machine, ip },
        {
          $inc,
          $set,
          $setOnInsert: { machine_name: machine, ip },
        },
        { upsert: true },
      );

      await this._pruneDays(machine, ip, keepDays);
    } catch (e) {
      ctx.logger.warn('[collector_ip] recordSubmit failed: %s', e && e.message ? e.message : e);
    }
  }

  /**
   * pull 前校验：IP × 平台当日已用（submit 累计）是否达日限
   * @returns {{ allowed: boolean, date: string, used: number, limit: number, error_code?: string }}
   */
  async checkDailyLimit({ machine_name, ip, platform } = {}) {
    const machine = String(machine_name || '').trim();
    const ipStr = String(ip || '').trim();
    const plat = String(platform || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const date = this._bizDay();
    const def = this.defaultDailyLimit;

    if (!ipStr || !plat) {
      return { allowed: true, date, used: 0, limit: def };
    }

    const doc = await this._findDoc(machine, ipStr);
    const limit = this.resolvePlatformLimit(doc, plat);
    const used = this.platformDayUsed(doc, date, plat);
    if (used >= limit) {
      return { allowed: false, date, used, limit, error_code: 'DAILY_LIMIT' };
    }
    return { allowed: true, date, used, limit };
  }

  /** 有效日限：单平台覆盖 → 默认 */
  resolvePlatformLimit(doc, platform) {
    const def = this.defaultDailyLimit;
    const raw = doc && doc.daily_limits && doc.daily_limits[platform];
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    return def;
  }

  platformDayUsed(doc, date, platform) {
    if (!doc || !doc.by_day || !doc.by_day[date]) return 0;
    const st = (doc.by_day[date].by_platform || {})[platform] || {};
    const total = Number(st.total);
    if (Number.isFinite(total) && total >= 0) return total;
    return (Number(st.ok) || 0) + (Number(st.fail) || 0) + (Number(st.empty) || 0);
  }

  /** 列表展示：各平台有效日限 + 今日已用 */
  enrichLimits(doc) {
    const date = this._bizDay();
    const def = this.defaultDailyLimit;
    const daily_limits = {};
    const today_used = {};
    for (const p of this.platforms) {
      daily_limits[p] = this.resolvePlatformLimit(doc, p);
      today_used[p] = this.platformDayUsed(doc, date, p);
    }
    // 保留文档里其它自定义 key 的覆盖值展示
    const stored = (doc && doc.daily_limits) || {};
    for (const k of Object.keys(stored)) {
      if (daily_limits[k] == null) daily_limits[k] = this.resolvePlatformLimit(doc, k);
    }
    return { daily_limits, today_used, default_daily_limit: def, today: date };
  }

  /**
   * 后台设置单 IP × 平台日限（upsert）
   * @param {{ machine_name: string, ip: string, platform: string, daily_limit: number }} opts
   */
  async setDailyLimit(opts = {}) {
    const { ctx } = this;
    const machine = String(opts.machine_name || '').trim();
    const ip = String(opts.ip || '').trim();
    let platform = String(opts.platform || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const limit = Number(opts.daily_limit);
    if (!machine || !ip) {
      const err = new Error('machine_name 与 ip 必填');
      err.status = 400;
      throw err;
    }
    if (!platform) {
      const err = new Error('platform 必填');
      err.status = 400;
      throw err;
    }
    if (!Number.isFinite(limit) || limit < 1 || limit > 100000) {
      const err = new Error('daily_limit 须为 1–100000 的整数');
      err.status = 400;
      throw err;
    }
    const n = Math.floor(limit);
    await ctx.model.CollectorIp.updateOne(
      { machine_name: machine, ip },
      {
        $set: { [`daily_limits.${platform}`]: n },
        $setOnInsert: { machine_name: machine, ip },
      },
      { upsert: true },
    );
    const doc = await ctx.model.CollectorIp.findOne({ machine_name: machine, ip }).lean();
    return {
      machine_name: machine,
      ip,
      platform,
      daily_limit: n,
      ...this.enrichLimits(doc),
    };
  }

  async _findDoc(machine, ip) {
    const { ctx } = this;
    if (machine) {
      const byBoth = await ctx.model.CollectorIp.findOne({ machine_name: machine, ip }).lean();
      if (byBoth) return byBoth;
    }
    // 仅有 ip 时兜底（历史/单机）
    return ctx.model.CollectorIp.findOne({ ip }).sort({ last_seen_at: -1 }).lean();
  }

  _bizDay(date) {
    const s = String(date || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    return this.ctx.app.dayjs().format('YYYY-MM-DD');
  }

  /** 含业务日在内的近 3 个自然日 */
  _keepDays(day) {
    const d = this.ctx.app.dayjs(day);
    return new Set([
      d.format('YYYY-MM-DD'),
      d.subtract(1, 'day').format('YYYY-MM-DD'),
      d.subtract(2, 'day').format('YYYY-MM-DD'),
    ]);
  }

  async _pruneDays(machine, ip, keepDays) {
    const { ctx } = this;
    const doc = await ctx.model.CollectorIp.findOne({ machine_name: machine, ip }).select('by_day').lean();
    if (!doc || !doc.by_day || typeof doc.by_day !== 'object') return;
    const $unset = {};
    for (const k of Object.keys(doc.by_day)) {
      if (!keepDays.has(k)) $unset[`by_day.${k}`] = 1;
    }
    if (Object.keys($unset).length) {
      await ctx.model.CollectorIp.updateOne({ machine_name: machine, ip }, { $unset });
    }
  }
}

module.exports = CollectorIpService;
