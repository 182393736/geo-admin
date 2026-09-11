'use strict';
const Controller = require('egg').Controller;

/**
 * 用户侧信源查询（对齐 geoapi.timus.cn 契约）
 *  - POST /reference_source/stats            信源被引统计列表（含权威度字段）
 *  - POST /source_intelligence/source_trend / engine_preference / own_trend / perspective
 *  - GET  /source_intelligence/topics
 *  - POST /snapshot/export/list              快照（暂空）
 * 数据源：source_daily_stats / canonical_sources / media_channels / citation_edges
 *
 * 对标响应形状（2026-09-11 抓包 geoapi.timus.cn）：
 *  - source_trend        data: { dates: [], sources: [{ name, total, series: [] }] }
 *  - engine_preference   data: { sources: [{ canonical_source, category, engines:{<engine>:{cur,cmp,chg}}, cur_total, cmp_total, chg_total }] }
 *  - own_trend           data: { trend: [{ date, own_count, total_count, rate }], summary: { cited, cited_chg, rate_now, rate_chg, own_articles, own_articles_chg } }
 *  - perspective         data: { list: [{ name, category, cur_total, cmp_total, change, change_pct, status, tag, engines:{<engine>:{cur,cmp}}, own_rate }], total, page, page_size }
 *  - topics              data: [{ query_id, name }]
 */
const ENGINE_ORDER = ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'];

class SourceController extends Controller {
  async _resolveBrand(userId, brandId) {
    const { ctx } = this;
    const brands = await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    if (!brands.length) return null;
    return brands.find(b => b.brand_id === brandId) || brands[0];
  }
  _n(v, d = 2) { const n = Number(v); return Number.isFinite(n) ? +n.toFixed(d) : 0; }
  _engine(p) { return p === 'qianwen' ? 'qwen' : p; }

  /** 拉取 [start,end] 的 source_daily_stats 并按 (source_id → engine → {cur}) 聚合 */
  async _aggRange(brandId, start, end) {
    const q = { brand_id: brandId };
    if (start && end) q.date = { $gte: start, $lte: end };
    const rows = await this.ctx.model.SourceDailyStat.find(q).lean();
    const bySource = {}; // source_id -> { total, engines:{engine: ref}, own }
    for (const r of rows) {
      const s = (bySource[r.source_id] ||= { total: 0, engines: {}, own: 0 });
      s.total += r.ref_count || 0;
      s.own += r.own_article_count || 0;
      const e = this._engine(r.platform || '');
      if (e) s.engines[e] = (s.engines[e] || 0) + (r.ref_count || 0);
    }
    return bySource;
  }

  /** 生成 start..end 的连续日期数组（含端点，最多 60 天） */
  _dateRange(start, end) {
    const day = this.ctx.app.dayjs;
    let s = day(String(start || '').slice(0, 10));
    let e = day(String(end || '').slice(0, 10));
    if (!s.isValid()) s = day().subtract(6, 'day');
    if (!e.isValid() || e.isBefore(s)) e = day();
    const out = [];
    for (let d = s; d.isBefore(e.add(1, 'day')); d = d.add(1, 'day')) {
      out.push(d.format('YYYY-MM-DD'));
      if (out.length > 60) break;
    }
    return out;
  }

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
    // category 请求参数 = 问题类型维度（industry=排名 / brand=口碑），对标站实测如此；
    // 信源本身的媒体类目（视频/社交/B2B…）在响应的 category 字段返回，二者不是一回事
    const qt = b.category === 'brand' ? 'brand' : 'industry';
    const q = { brand_id: brand.brand_id };
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    if (start && end) q.date = { $gte: start, $lte: end };

    // 直接从 citation_edges 聚合（query_type 分流后的原子事实），再联 CanonicalSource/MediaChannel 补元数据
    const [edges, sources, channels] = await Promise.all([
      ctx.model.CitationEdge.find(q).select('source_id platform article_id query_id query_type is_own').lean(),
      ctx.model.CanonicalSource.find({}).lean(),
      ctx.model.MediaChannel.find({}).select('media_key name sell_price list_price').lean(),
    ]);
    // 回填 query_type：旧数据 citation_edges 未带该字段，按 query_id 从 monitor_queries 解析
    const missing = [...new Set(edges.filter(e => !e.query_type).map(e => e.query_id))];
    const qtMap = {};
    if (missing.length) {
      const mqs = await ctx.model.MonitorQuery.find({ query_id: { $in: missing } }).select('query_id query_type').lean();
      for (const m of mqs) qtMap[m.query_id] = m.query_type;
    }
    const srcMap = {}; for (const s of sources) srcMap[s.source_id] = s;
    const chMap = {}; for (const c of channels) chMap[c.media_key] = c;
    const agg = {};
    for (const e of edges) {
      if ((e.query_type || qtMap[e.query_id] || 'industry') !== qt) continue;
      const a = (agg[e.source_id] ||= { ref_count: 0, article_ids: new Set(), query_ids: new Set(), own_article_count: 0, platforms: {} });
      a.ref_count += 1;
      a.article_ids.add(e.article_id);
      a.query_ids.add(e.query_id);
      if (e.is_own) a.own_article_count += 1;
      const p = (a.platforms[e.platform] ||= { ref_count: 0, article_ids: new Set() });
      p.ref_count += 1;
      p.article_ids.add(e.article_id);
    }
    let list = Object.entries(agg).map(([sid, v]) => {
      const meta = srcMap[sid] || {};
      const ch = chMap[meta.media_key];
      return {
        canonical_source: meta.canonical_source || sid,
        category: meta.category || null,
        domain: (meta.domains && meta.domains[0]) || null,
        auth_info_des: meta.auth_info_des || null,
        auth_info_level: meta.auth_info_level || null,
        ref_count: v.ref_count, article_count: v.article_ids.size, query_count: v.query_ids.size, own_article_count: v.own_article_count,
        first_cited_at: meta.first_cited_at || null,
        platforms: Object.fromEntries(Object.entries(v.platforms).map(([k, p]) => [k, { ref_count: p.ref_count, article_count: p.article_ids.size }])),
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
          platform_breakdown: ENGINE_ORDER.reduce((m, p) => { m[p] = list.reduce((s, x) => s + ((x.platforms[p] || {}).ref_count || 0), 0); return m; }, {}),
        },
        page, page_size: size, total,
      },
    };
  }

  /* ---------- 信源洞察 4 件套（对标响应形状） ---------- */

  /** data: { dates: [], sources: [{ name, total, series: [] }] } */
  async sourceTrend() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { dates: [], sources: [] } }; return; }
    const topN = Number(b.top_n) || 10;
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const dates = this._dateRange(start, end);

    const q = { brand_id: brand.brand_id };
    if (start && end) q.date = { $gte: start, $lte: end };
    const rows = await ctx.model.SourceDailyStat.find(q).lean();

    const bySourceDate = {}; // source_id -> { date -> ref_count }
    const totalBySource = {};
    for (const r of rows) {
      totalBySource[r.source_id] = (totalBySource[r.source_id] || 0) + (r.ref_count || 0);
      const d = (bySourceDate[r.source_id] ||= {});
      d[r.date] = (d[r.date] || 0) + (r.ref_count || 0);
    }
    const topIds = Object.entries(totalBySource).sort((a, z) => z[1] - a[1]).slice(0, topN).map(([id]) => id);
    const sources = await ctx.model.CanonicalSource.find({ source_id: { $in: topIds } }).lean();
    const nameMap = {}; for (const s of sources) nameMap[s.source_id] = s.canonical_source;

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        dates,
        sources: topIds.map(id => ({
          name: nameMap[id] || id,
          total: totalBySource[id] || 0,
          series: dates.map(d => (bySourceDate[id] || {})[d] || 0),
        })),
      },
    };
  }

  /** data: { sources: [{ canonical_source, category, engines:{<engine>:{cur,cmp,chg}}, cur_total, cmp_total, chg_total }] } */
  async enginePreference() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { sources: [] } }; return; }
    const cur = await this._aggRange(brand.brand_id, String(b.start_date || '').slice(0, 10), String(b.end_date || '').slice(0, 10));
    const cmp = await this._aggRange(brand.brand_id, String(b.cmp_start_date || '').slice(0, 10), String(b.cmp_end_date || '').slice(0, 10));

    const allIds = new Set([...Object.keys(cur), ...Object.keys(cmp)]);
    const sources = await ctx.model.CanonicalSource.find({ source_id: { $in: [...allIds] } }).lean();
    const metaMap = {}; for (const s of sources) metaMap[s.source_id] = s;

    const list = [...allIds]
      .map(id => {
        const c = cur[id] || { total: 0, engines: {} };
        const p = cmp[id] || { total: 0, engines: {} };
        const engines = {};
        for (const e of ENGINE_ORDER) {
          const cv = c.engines[e] || 0;
          const pv = p.engines[e] || 0;
          if (cv || pv) engines[e] = { cur: cv, cmp: pv, chg: cv - pv };
        }
        return {
          canonical_source: (metaMap[id] || {}).canonical_source || id,
          category: (metaMap[id] || {}).category || null,
          engines,
          cur_total: c.total, cmp_total: p.total, chg_total: c.total - p.total,
        };
      })
      .sort((a, z) => z.cur_total - a.cur_total);
    ctx.body = { code: 200, msg: 'ok', data: { sources: list } };
  }

  /** data: { trend: [{ date, own_count, total_count, rate }], summary: { cited, cited_chg, rate_now, rate_chg, own_articles, own_articles_chg } } */
  async ownTrend() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    const empty = { trend: [], summary: { cited: 0, cited_chg: 0, rate_now: 0, rate_chg: 0, own_articles: 0, own_articles_chg: 0 } };
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }

    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const dates = this._dateRange(start, end);

    const daily = async (s, e) => {
      const q = { brand_id: brand.brand_id };
      if (s && e) q.date = { $gte: s, $lte: e };
      const rows = await ctx.model.SourceDailyStat.find(q).lean();
      const byDate = {};
      for (const r of rows) {
        const d = (byDate[r.date] ||= { own: 0, total: 0 });
        d.own += r.own_article_count || 0;
        d.total += r.ref_count || 0;
      }
      return byDate;
    };
    const curMap = await daily(start, end);
    const cmpMap = await daily(String(b.cmp_start_date || '').slice(0, 10), String(b.cmp_end_date || '').slice(0, 10));

    const trend = dates.map(date => {
      const d = curMap[date] || { own: 0, total: 0 };
      return { date, own_count: d.own, total_count: d.total, rate: this._n(d.total ? d.own / d.total * 100 : 0) };
    });
    const sum = m => Object.values(m).reduce((s, d) => s + d.own, 0);
    const totalOf = m => Object.values(m).reduce((s, d) => s + d.total, 0);
    const cited = sum(curMap);
    const citedCmp = sum(cmpMap);
    const totalCur = totalOf(curMap);
    const totalCmp = totalOf(cmpMap);
    const rateNow = this._n(totalCur ? cited / totalCur * 100 : 0);
    const rateCmp = this._n(totalCmp ? citedCmp / totalCmp * 100 : 0);

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        trend,
        summary: {
          cited, cited_chg: cited - citedCmp,
          rate_now: rateNow, rate_chg: this._n(rateNow - rateCmp),
          own_articles: cited, own_articles_chg: cited - citedCmp,
        },
      },
    };
  }

  /** data: { list: [{ name, category, cur_total, cmp_total, change, change_pct, status, tag, engines:{<engine>:{cur,cmp}}, own_rate }], total, page, page_size } */
  async perspective() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    const empty = { list: [], total: 0, page: 1, page_size: 20 };
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }

    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.page_size, 10) || 20));
    const cur = await this._aggRange(brand.brand_id, String(b.start_date || '').slice(0, 10), String(b.end_date || '').slice(0, 10));
    const cmp = await this._aggRange(brand.brand_id, String(b.cmp_start_date || '').slice(0, 10), String(b.cmp_end_date || '').slice(0, 10));

    const allIds = new Set([...Object.keys(cur), ...Object.keys(cmp)]);
    const sources = await ctx.model.CanonicalSource.find({ source_id: { $in: [...allIds] } }).lean();
    const metaMap = {}; for (const s of sources) metaMap[s.source_id] = s;

    let list = [...allIds].map(id => {
      const c = cur[id] || { total: 0, engines: {}, own: 0 };
      const p = cmp[id] || { total: 0, engines: {}, own: 0 };
      const change = c.total - p.total;
      const change_pct = this._n(p.total ? change / p.total * 100 : (c.total ? 100 : 0), 1);
      let status = '未提及';
      if (c.total > 0 && p.total > 0) status = '持续被引';
      else if (c.total > 0 && p.total === 0) status = '新增被引';
      else if (c.total === 0 && p.total > 0) status = '停止被引';
      const tag = change > 0 ? '我方占优' : (change < 0 ? '竞品占优' : '持平');
      const engines = {};
      for (const e of ENGINE_ORDER) {
        const cv = c.engines[e] || 0;
        const pv = p.engines[e] || 0;
        if (cv || pv) engines[e] = { cur: cv, cmp: pv };
      }
      const name = (metaMap[id] || {}).canonical_source || id;
      return {
        name,
        category: (metaMap[id] || {}).category || null,
        cur_total: c.total, cmp_total: p.total, change, change_pct,
        status, tag, engines,
        own_rate: this._n(c.total ? c.own / c.total * 100 : 0),
      };
    });

    if (b.search) list = list.filter(x => x.name.includes(b.search));
    if (b.status && b.status !== '') list = list.filter(x => x.status === b.status);

    const sortBy = { total: 'cur_total', change: 'change', change_pct: 'change_pct' }[b.sort_by] || 'cur_total';
    list.sort((a, z) => (b.sort_order === 'asc' ? a[sortBy] - z[sortBy] : z[sortBy] - a[sortBy]));

    const total = list.length;
    ctx.body = {
      code: 200, msg: 'ok',
      data: { list: list.slice((page - 1) * size, page * size), total, page, page_size: size },
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

  /* ---------- 快照（对齐 /snapshot/export/list） ---------- */
  async snapshotList() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    // 对标请求：{ page, page_size, start_date, query_id, query_type }；query_type 决定话题类型，query_id 已唯一到具体问题
    void b.query_type;
    const empty = { list: [], total: 0, page: 1, page_size: 10 };
    const userId = ctx.state.user.id;
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }
    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(50, Math.max(1, parseInt(b.page_size, 10) || 10));
    const q = { brand_id: brand.brand_id };
    const start = String(b.start_date || '').slice(0, 10);
    if (start) q.exec_date = start;
    const qid = parseInt(b.query_id, 10);
    if (Number.isFinite(qid) && qid > 0) q.query_id = qid;
    const [rows, total] = await Promise.all([
      ctx.model.Snapshot.find(q).sort({ created_at: -1 }).skip((page - 1) * size).limit(size).lean(),
      ctx.model.Snapshot.countDocuments(q),
    ]);
    ctx.body = { code: 200, msg: 'ok', data: {
      list: rows.map(r => ({
        id: r.snapshot_id, platform: r.platform, photo_url: r.photo_url || null,
        exec_date: r.exec_date, query_id: r.query_id, size: r.size || null,
      })),
      total, page, page_size: size,
    } };
  }
}

module.exports = SourceController;
