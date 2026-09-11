'use strict';
const Controller = require('egg').Controller;

/**
 * 用户侧信源查询（对齐 contracts/api.ts）
 *  - POST /reference_source/stats            信源被引统计列表
 *  - POST /source_intelligence/source_trend / engine_preference / own_trend / perspective / topics
 *  - POST /snapshot/export/list              快照（暂空）
 * 数据源：source_daily_stats / canonical_sources / media_channels / citation_edges
 */
const PLATFORMS = ['doubao', 'deepseek', 'wenxin', 'yuanbao'];

class SourceController extends Controller {
  async _resolveBrand(userId, brandId) {
    const { ctx } = this;
    const brands = await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    if (!brands.length) return null;
    return brands.find(b => b.brand_id === brandId) || brands[0];
  }
  _n(v, d = 2) { const n = Number(v); return Number.isFinite(n) ? +n.toFixed(d) : 0; }

  /* ---------- 信源统计 ---------- */
  async stats() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    const empty = { list: [], summary: { total_ref_count: 0, total_article_count: 0, total_sources: 0, own_source_count: 0, top5_share: 0, platform_breakdown: {} }, page: 1, page_size: 20, total: 0 };
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }
    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.page_size, 10) || 20));
    const q = { brand_id: brand.brand_id };
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    if (start && end) q.date = { $gte: start, $lte: end };

    const [rows, sources, channels] = await Promise.all([
      ctx.model.SourceDailyStat.find(q).lean(),
      ctx.model.CanonicalSource.find({}).lean(),
      ctx.model.MediaChannel.find({}).select('media_key name sell_price list_price').lean(),
    ]);
    const srcMap = {}; for (const s of sources) srcMap[s.source_id] = s;
    const chMap = {}; for (const c of channels) chMap[c.media_key] = c;
    const agg = {};
    for (const r of rows) {
      const a = (agg[r.source_id] ||= { ref_count: 0, article_count: 0, query_count: 0, own_article_count: 0, platforms: {} });
      a.ref_count += r.ref_count || 0;
      a.article_count += r.article_count || 0;
      a.query_count += r.query_count || 0;
      a.own_article_count += r.own_article_count || 0;
      (a.platforms[r.platform] ||= { ref_count: 0, article_count: 0 });
      a.platforms[r.platform].ref_count += r.ref_count || 0;
      a.platforms[r.platform].article_count += r.article_count || 0;
    }
    const list = Object.entries(agg).map(([sid, v]) => {
      const meta = srcMap[sid] || {};
      const ch = chMap[meta.media_key];
      return {
        canonical_source: meta.canonical_source || sid,
        category: meta.category || '未分类',
        domain: (meta.domains && meta.domains[0]) || null,
        ref_count: v.ref_count, article_count: v.article_count, query_count: v.query_count, own_article_count: v.own_article_count,
        first_cited_at: meta.first_cited_at || null,
        platforms: v.platforms,
        media_key: meta.media_key || null,
        sell_price: ch ? (ch.sell_price != null ? ch.sell_price : null) : null,
        list_price: ch ? (ch.list_price != null ? ch.list_price : null) : null,
        cost_per_citation: ch && ch.sell_price && v.ref_count ? this._n(ch.sell_price / v.ref_count) : null,
      };
    }).sort((a, z) => z.ref_count - a.ref_count);
    const total = list.length;
    const paged = list.slice((page - 1) * size, page * size);
    const totalRef = list.reduce((s, x) => s + x.ref_count, 0);
    const top5 = list.slice(0, 5).reduce((s, x) => s + x.ref_count, 0);
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: paged,
        summary: {
          total_ref_count: totalRef,
          total_article_count: list.reduce((s, x) => s + x.article_count, 0),
          total_sources: total,
          own_source_count: list.filter(x => x.own_article_count > 0).length,
          top5_share: totalRef ? this._n(top5 / totalRef * 100) : 0,
          platform_breakdown: PLATFORMS.reduce((m, p) => { m[p] = list.reduce((s, x) => s + ((x.platforms[p] || {}).ref_count || 0), 0); return m; }, {}),
        },
        page, page_size: size, total,
      },
    };
  }

  /* ---------- 信源洞察 4 件套 ---------- */
  async sourceTrend() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { list: [], trend: [] } }; return; }
    const q = { brand_id: brand.brand_id };
    if (b.start_date && b.end_date) q.date = { $gte: String(b.start_date).slice(0, 10), $lte: String(b.end_date).slice(0, 10) };
    const rows = await ctx.model.SourceDailyStat.find(q).lean();
    const topN = Number(b.top_n) || 10;
    const srcRef = {};
    for (const r of rows) srcRef[r.source_id] = (srcRef[r.source_id] || 0) + (r.ref_count || 0);
    const topIds = Object.entries(srcRef).sort((a, z) => z[1] - a[1]).slice(0, topN).map(([id]) => id);
    const sources = await ctx.model.CanonicalSource.find({ source_id: { $in: topIds } }).lean();
    const nameMap = {}; for (const s of sources) nameMap[s.source_id] = s.canonical_source;
    ctx.body = {
      code: 200, msg: 'ok',
      data: { list: topIds.map(id => ({ source_id: id, canonical_source: nameMap[id] || id, ref_count: srcRef[id] })), trend: [] },
    };
  }

  async enginePreference() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { current: {}, compare: {} } }; return; }
    const aggRange = (start, end) => {
      const q = { brand_id: brand.brand_id };
      if (start && end) q.date = { $gte: start, $lte: end };
      return ctx.model.SourceDailyStat.aggregate([
        { $match: q }, { $group: { _id: '$platform', n: { $sum: '$ref_count' } } },
      ]);
    };
    const [cur, cmp] = await Promise.all([
      aggRange(String(b.start_date || '').slice(0, 10), String(b.end_date || '').slice(0, 10)),
      aggRange(String(b.cmp_start_date || '').slice(0, 10), String(b.cmp_end_date || '').slice(0, 10)),
    ]);
    const toMap = rows => { const m = {}; for (const r of rows) m[r._id] = r.n; return m; };
    ctx.body = { code: 200, msg: 'ok', data: { current: toMap(cur), compare: toMap(cmp) } };
  }

  async ownTrend() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { current: {}, compare: {} } }; return; }
    const aggRange = (start, end) => {
      const q = { brand_id: brand.brand_id };
      if (start && end) q.date = { $gte: start, $lte: end };
      return ctx.model.SourceDailyStat.aggregate([
        { $match: q }, { $group: { _id: '$date', n: { $sum: '$own_article_count' } } },
      ]);
    };
    const [cur, cmp] = await Promise.all([
      aggRange(String(b.start_date || '').slice(0, 10), String(b.end_date || '').slice(0, 10)),
      aggRange(String(b.cmp_start_date || '').slice(0, 10), String(b.cmp_end_date || '').slice(0, 10)),
    ]);
    const toMap = rows => { const m = {}; for (const r of rows) m[r._id] = r.n; return m; };
    ctx.body = { code: 200, msg: 'ok', data: { current: toMap(cur), compare: toMap(cmp) } };
  }

  async perspective() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { list: [] } }; return; }
    const q = { brand_id: brand.brand_id };
    if (b.start_date && b.end_date) q.date = { $gte: String(b.start_date).slice(0, 10), $lte: String(b.end_date).slice(0, 10) };
    const rows = await ctx.model.SourceDailyStat.find(q).lean();
    const agg = {};
    for (const r of rows) agg[r.source_id] = (agg[r.source_id] || 0) + (r.ref_count || 0);
    const ids = Object.keys(agg);
    const sources = await ctx.model.CanonicalSource.find({ source_id: { $in: ids } }).lean();
    const nameMap = {}; for (const s of sources) nameMap[s.source_id] = s.canonical_source;
    ctx.body = {
      code: 200, msg: 'ok',
      data: { list: Object.entries(agg).map(([id, n]) => ({ source_id: id, canonical_source: nameMap[id] || id, ref_count: n })).sort((a, z) => z.ref_count - a.ref_count) },
    };
  }

  async topics() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const brand = await this._resolveBrand(userId, '');
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: [] }; return; }
    const rows = await ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_status: true }).lean();
    ctx.body = { code: 200, msg: 'ok', data: rows.map(m => ({ query_id: m.query_id, name: m.query })) };
  }

  /* ---------- 快照（暂空） ---------- */
  async snapshotList() {
    const { ctx } = this;
    ctx.body = { code: 200, msg: 'ok', data: { list: [], total: 0, page: 1, page_size: 10 } };
  }
}

module.exports = SourceController;
