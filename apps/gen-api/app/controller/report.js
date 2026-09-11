'use strict';
const Controller = require('egg').Controller;

/**
 * 用户侧报告（概览页周报/月报 6 模块）
 *  - POST /report/latest  最新一期报告；无 ready 报告时实时生成（含今天）并落库
 *  - POST /report/list    报告列表
 *  - GET  /report/cycle   周期元信息
 */
class ReportController extends Controller {
  async _resolveBrand(userId, brandId) {
    const { ctx } = this;
    const brands = await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    if (!brands.length) return null;
    return brands.find(b => b.brand_id === brandId) || brands[0];
  }

  _fmtTemplate() {
    return {
      id: 1, name: '标准版',
      modules: [
        { key: 'overview', sort: 1, enabled: true },
        { key: 'metrics', sort: 2, enabled: true },
        { key: 'competitors', sort: 3, enabled: true },
        { key: 'sources', sort: 4, enabled: true },
        { key: 'writing', sort: 5, enabled: true },
        { key: 'publish', sort: 6, enabled: true },
      ],
    };
  }

  async latest() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const body = ctx.request.body || {};
    const period_type = body.period_type === 'monthly' ? 'monthly' : 'weekly';
    const brand = await this._resolveBrand(userId, body.brand_id);
    if (!brand) {
      ctx.body = { code: 200, msg: 'ok', data: null };
      return;
    }
    let rep = await ctx.model.Report.findOne({ brand_id: brand.brand_id, period_type, status: 'ready' })
      .sort({ generated_at: -1 }).lean();
    // 测试期（parse.mode=realtime）数据每 5s 都在变：报告必须随聚合刷新，否则永远停留在首次落库的空/旧快照。
    // 刷新策略：无 ready 报告，或已过期（超过一个清扫周期，默认 60s）→ 实时重算并落库（幂等 upsert 同 period_key）。
    const parseCfg = ctx.app.config.parse || {};
    const realtime = parseCfg.mode === 'realtime';
    const staleMs = Number(parseCfg.sweepIntervalMs) || 60 * 1000;
    const stale = realtime && (!rep || !rep.generated_at || Date.now() - new Date(rep.generated_at).getTime() > staleMs);
    if (!rep || stale) {
      await ctx.service.pipeline.reportBuild.run({ period_type, brand_id: brand.brand_id, endToday: true });
      rep = await ctx.model.Report.findOne({ brand_id: brand.brand_id, period_type, status: 'ready' })
        .sort({ generated_at: -1 }).lean();
    }
    if (!rep) {
      ctx.body = {
        code: 200, msg: 'ok',
        data: {
          period_key: '', label: '', range: '', status: 'generating', generated_at: null,
          template: this._fmtTemplate(), payload: null,
          overview_stats: await ctx.service.report.overviewStats(brand.brand_id, ctx.service.report.range(period_type, { endToday: true })),
        },
      };
      return;
    }
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        period_key: rep.period_key,
        label: (rep.payload && rep.payload.label) || rep.period_key,
        range: (rep.payload && rep.payload.range) || '',
        status: 'ready',
        generated_at: rep.generated_at,
        template: this._fmtTemplate(),
        payload: rep.payload || null,
        overview_stats: rep.overview_stats || {},
      },
    };
  }

  async list() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const body = ctx.request.body || {};
    const period_type = body.period_type === 'monthly' ? 'monthly' : 'weekly';
    const brand = await this._resolveBrand(userId, body.brand_id);
    if (!brand) {
      ctx.body = { code: 200, msg: 'ok', data: { list: [] } };
      return;
    }
    const rows = await ctx.model.Report.find({ brand_id: brand.brand_id, period_type })
      .sort({ generated_at: -1 }).limit(Number(body.limit) || 8).lean();
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(r => ({
          period_key: r.period_key, label: (r.payload && r.payload.label) || r.period_key,
          range: (r.payload && r.payload.range) || '',
          period_start: (r.payload && (r.payload.period_start || r.payload.start_date)) || null,
          period_end: (r.payload && (r.payload.period_end || r.payload.end_date)) || null,
          status: r.status, generated_at: r.generated_at,
        })),
      },
    };
  }

  async cycle() {
    const { ctx } = this;
    // 对标 geoapi.timus.cn /report/cycle：5 个平铺字段
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        weekly_generate_dow: 7,
        monthly_generate_dom: 0,
        weekly_enabled: true,
        monthly_enabled: true,
        cycle_locked: false,
      },
    };
  }
}

module.exports = ReportController;
