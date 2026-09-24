/**
 * 采集 IP 台账：submit 旁路计数（失败不影响主流程）
 */
'use strict';

const Service = require('egg').Service;

const STATUS_FIELD = {
  ok: 'ok',
  fail: 'fail',
  empty: 'empty',
};

class CollectorIpService extends Service {
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
