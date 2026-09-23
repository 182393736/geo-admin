'use strict';
const Controller = require('egg').Controller;

/**
 * 导出族（对标 geoapi.timus.cn /export/*）
 *  - POST /export/competitor_report  品牌透视报告（AI排名透视页右上角）
 */
class ExportController extends Controller {
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

  _csv(rows) {
    return `\uFEFF${rows.map(row => row.map(c => {
      const s = String(c == null ? '' : c).replace(/"/g, '""');
      return `"${s}"`;
    }).join(',')).join('\n')}`;
  }

  /** POST /export/competitor_report */
  async competitorReport() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || b.start_date || '').slice(0, 10);
    const oem = String(b.oem_brand_name || brand.name || '品牌').trim() || '品牌';

    const dateFilter = start && end
      ? { $gte: start, $lte: end }
      : (start || undefined);

    const metricQ = { brand_id: brand.brand_id, platform: 'all' };
    const boardQ = { brand_id: brand.brand_id };
    if (dateFilter) {
      metricQ.date = dateFilter;
      boardQ.date = dateFilter;
    }

    const [metrics, boards] = await Promise.all([
      ctx.model.DailyMetricQuery.find(metricQ).lean(),
      ctx.model.LeaderboardDaily.find(boardQ).sort({ date: -1 }).limit(300).lean(),
    ]);

    const buckets = {
      mention: { denominator: 0, numerator: 0 },
      top3: { denominator: 0, numerator: 0 },
      first: { denominator: 0, numerator: 0 },
    };
    for (const m of metrics) {
      const den = Number(m.denominator) || 0;
      if (!den) continue;
      buckets.mention.denominator += den;
      buckets.mention.numerator += Number(m.mentioned) || 0;
      buckets.top3.denominator += den;
      buckets.top3.numerator += Number(m.top3) || 0;
      buckets.first.denominator += den;
      buckets.first.numerator += Number(m.first) || 0;
    }
    const rateOf = bkt => (bkt.denominator ? +(bkt.numerator / bkt.denominator * 100).toFixed(2) : 0);

    const rows = [
      [ '品牌透视报告' ],
      [ '品牌', oem ],
      [ '统计周期', `${start || '—'} ~ ${end || '—'}` ],
      [],
      [ '指标', '比率(%)', '分子', '分母' ],
      [ '品牌提及率', rateOf(buckets.mention), buckets.mention.numerator, buckets.mention.denominator ],
      [ 'Top3 推荐率', rateOf(buckets.top3), buckets.top3.numerator, buckets.top3.denominator ],
      [ '首位推荐率', rateOf(buckets.first), buckets.first.numerator, buckets.first.denominator ],
      [],
      [ '日期', '问题ID', '品牌', '位次', '得分', '是否目标品牌' ],
    ];

    for (const day of boards) {
      const entries = Array.isArray(day.entries) ? day.entries : [];
      for (const e of entries.slice(0, 30)) {
        rows.push([
          day.date || '',
          day.query_id ?? '',
          e.name || '',
          e.rank ?? '',
          e.score ?? '',
          e.is_target ? '是' : '否',
        ]);
      }
    }

    const rangeTag = start && end ? `${start}_${end}` : (start || 'export');
    const filename = `${oem}_品牌透视报告_${rangeTag}.csv`;
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    ctx.body = this._csv(rows);
  }

  /** POST /export/ranking_matrix */
  async rankingMatrix() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || b.start_date || '').slice(0, 10);
    const platforms = Array.isArray(b.platforms) && b.platforms.length
      ? b.platforms.map(String)
      : [ 'doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao' ];

    const dateFilter = start && end
      ? { $gte: start, $lte: end }
      : (start || undefined);
    const q = { brand_id: brand.brand_id };
    if (dateFilter) q.date = dateFilter;

    const [metrics, queries] = await Promise.all([
      ctx.model.DailyMetricQuery.find(q).lean(),
      ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_type: 'industry' }).lean(),
    ]);
    const qName = {};
    for (const qq of queries) qName[qq.query_id] = qq.query || String(qq.query_id);

    // 按 query_id + date 聚合
    const byKey = new Map();
    for (const m of metrics) {
      const key = `${m.query_id}|${m.date}`;
      const row = byKey.get(key) || {
        date: m.date,
        query_id: m.query_id,
        query: qName[m.query_id] || String(m.query_id),
        ranks: {},
        mention_rate: '',
        top3_rate: '',
        first_rate: '',
      };
      const plat = m.platform || 'all';
      if (plat === 'all') {
        const den = Number(m.denominator) || 0;
        if (den) {
          row.mention_rate = +((Number(m.mentioned) || 0) / den * 100).toFixed(2);
          row.top3_rate = +((Number(m.top3) || 0) / den * 100).toFixed(2);
          row.first_rate = +((Number(m.first) || 0) / den * 100).toFixed(2);
        }
        if (m.rank_value != null) row.ranks.all = m.rank_value;
      } else if (platforms.includes(plat)) {
        row.ranks[plat] = m.rank_value != null ? m.rank_value : '';
      }
      byKey.set(key, row);
    }

    const PLATFORM_NAME = {
      doubao: '豆包', wenxin: '文心一言', deepseek: 'DeepSeek', qwen: '通义千问', yuanbao: '元宝',
    };
    const header = [ '日期', '问题', '提及率(%)', 'Top3(%)', '首位(%)', '综合位次', ...platforms.map(p => PLATFORM_NAME[p] || p) ];
    const rows = [ header ];
    const sorted = Array.from(byKey.values()).sort((a, b) =>
      String(a.date).localeCompare(String(b.date)) || String(a.query).localeCompare(String(b.query)));
    for (const r of sorted) {
      rows.push([
        r.date,
        r.query,
        r.mention_rate,
        r.top3_rate,
        r.first_rate,
        r.ranks.all ?? '',
        ...platforms.map(p => r.ranks[p] ?? ''),
      ]);
    }

    const rangeTag = start && end ? `${start}~${end}` : (start || 'export');
    const filename = `排名矩阵_${rangeTag}.csv`;
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    ctx.body = this._csv(rows);
  }

  /** POST /export/competitor_xlsx */
  async competitorXlsx() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const start = String(b.start_date || '').slice(0, 10);
    const q = { brand_id: brand.brand_id, is_target: { $ne: true } };
    if (start) q.date = start;

    const mentions = await ctx.model.BrandMention.find(q).lean();
    const byName = {};
    for (const m of mentions) {
      const name = String(m.entity_name || '').trim();
      if (!name) continue;
      const a = (byName[name] ||= { name, freq: 0, top3: 0, first: 0 });
      a.freq += 1;
      if (m.position <= 3) a.top3 += 1;
      if (m.position === 1) a.first += 1;
    }
    const queries = await ctx.model.MonitorQuery.countDocuments({ brand_id: brand.brand_id, query_type: 'industry' });
    const denom = Math.max(1, queries * 5);
    const rows = [
      [ '竞品数据导出' ],
      [ '品牌', brand.name ],
      [ '日期', start || '全部' ],
      [],
      [ '竞品名称', '出现次数', '提及率(%)', 'Top3推荐率(%)', '首位提及率(%)' ],
      ...Object.values(byName)
        .sort((a, b) => b.freq - a.freq)
        .map(a => [
          a.name,
          a.freq,
          +((a.freq / denom) * 100).toFixed(2),
          +((a.top3 / denom) * 100).toFixed(2),
          +((a.first / denom) * 100).toFixed(2),
        ]),
    ];
    const filename = `竞品数据_${start || new Date().toISOString().slice(0, 10)}.csv`;
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    ctx.body = this._csv(rows);
  }

  /** POST /export/reference_source — 引用源追溯导出 */
  async referenceSource() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || b.start_date || '').slice(0, 10);
    const qt = b.category === 'brand' ? 'brand' : 'industry';
    const q = { brand_id: brand.brand_id };
    if (start && end) q.date = { $gte: start, $lte: end };
    const filterQid = parseInt(b.query_id, 10);
    if (Number.isFinite(filterQid) && filterQid > 0) q.query_id = filterQid;

    const [ edges, sources ] = await Promise.all([
      ctx.model.CitationEdge.find(q).select('source_id platform article_id query_id query_type is_own').lean(),
      ctx.model.CanonicalSource.find({}).lean(),
    ]);
    const missing = [...new Set(edges.filter(e => !e.query_type).map(e => e.query_id))];
    const qtMap = {};
    if (missing.length) {
      const mqs = await ctx.model.MonitorQuery.find({ query_id: { $in: missing } }).select('query_id query_type').lean();
      for (const m of mqs) qtMap[m.query_id] = m.query_type;
    }
    const srcMap = {};
    for (const s of sources) srcMap[s.source_id] = s;
    const agg = {};
    for (const e of edges) {
      if ((e.query_type || qtMap[e.query_id] || 'industry') !== qt) continue;
      const a = (agg[e.source_id] ||= { ref_count: 0, articles: new Set(), own: 0, platforms: {} });
      a.ref_count += 1;
      a.articles.add(e.article_id);
      if (e.is_own) a.own += 1;
      a.platforms[e.platform] = (a.platforms[e.platform] || 0) + 1;
    }
    const PLATFORM_NAME = {
      doubao: '豆包', wenxin: '文心一言', deepseek: 'DeepSeek', qwen: '通义千问', yuanbao: '元宝',
    };
    const rows = [
      [ '引用源追溯' ],
      [ '品牌', brand.name ],
      [ '统计周期', `${start || '—'} ~ ${end || '—'}` ],
      [],
      [ '信源平台', '类目', '被引次数', '文章数', '自有被引', '覆盖引擎' ],
      ...Object.entries(agg)
        .map(([ sid, v ]) => {
          const meta = srcMap[sid] || {};
          return {
            name: meta.canonical_source || sid,
            category: meta.category || '',
            ref_count: v.ref_count,
            article_count: v.articles.size,
            own: v.own,
            engines: Object.keys(v.platforms).map(p => PLATFORM_NAME[p] || p).join('/'),
          };
        })
        .sort((a, z) => z.ref_count - a.ref_count)
        .map(r => [ r.name, r.category, r.ref_count, r.article_count, r.own, r.engines ]),
    ];
    const rangeTag = start && end ? `${start}_${end}` : (start || 'export');
    const filename = `引用源追溯_${rangeTag}.csv`;
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    ctx.body = this._csv(rows);
  }
}

module.exports = ExportController;
