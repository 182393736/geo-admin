'use strict';
const Controller = require('egg').Controller;

/**
 * 用户侧信源查询（对齐 geoapi.timus.cn 契约）
 *  - POST /reference_source/stats            信源被引统计列表（含权威度字段）
 *  - POST /source_intelligence/source_trend / engine_preference / own_trend / perspective
 *  - GET  /source_intelligence/topics
 *  - POST /snapshot/export/list              搜索快照列表（含排行/回答摘要）
 *  - POST /snapshot/export/answer            查看单条原始回答
 *  - POST /snapshot/export/text              导出回答 CSV
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
    const brand = await this._requireBrand(b.brand_id);
    const empty = { list: [], summary: { total_ref_count: 0, total_article_count: 0, total_sources: 0, own_source_count: 0, top5_share: 0, platform_breakdown: {} }, page: 1, page_size: 20, total: 0 };
    if (!brand) return;
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
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
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
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
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
    const brand = await this._requireBrand(b.brand_id);
    const empty = { trend: [], summary: { cited: 0, cited_chg: 0, rate_now: 0, rate_chg: 0, own_articles: 0, own_articles_chg: 0 } };
    if (!brand) return;

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
    const brand = await this._requireBrand(b.brand_id);
    const empty = { list: [], total: 0, page: 1, page_size: 20 };
    if (!brand) return;

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
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const rows = await ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_status: true }).lean();
    ctx.body = { code: 200, msg: 'ok', data: rows.map(m => ({ query_id: m.query_id, name: m.query })) };
  }

  /* ---------- 快照（对齐 /snapshot/export/list） ---------- */
  async snapshotList() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const empty = { list: [], total: 0, page: 1, page_size: 10 };
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(50, Math.max(1, parseInt(b.page_size, 10) || 10));
    const queryType = b.query_type === 'brand' ? 'brand' : 'industry';
    const start = String(b.start_date || '').slice(0, 10);
    const platform = String(b.platform || '').trim().toLowerCase();
    const qid = parseInt(b.query_id, 10);

    // query_type → 限定该品牌下对应类型的 query_id 集合
    const typeQueries = await ctx.model.MonitorQuery.find(
      { brand_id: brand.brand_id, query_type: queryType },
      { query_id: 1, query: 1 },
    ).lean();
    const typeQids = typeQueries.map(q => q.query_id).filter(n => Number.isFinite(n));
    const queryNameById = {};
    for (const q of typeQueries) queryNameById[q.query_id] = q.query || '';

    if (!typeQids.length) {
      ctx.body = { code: 200, msg: 'ok', data: { ...empty, page, page_size: size } };
      return;
    }

    const q = { brand_id: brand.brand_id, query_id: { $in: typeQids } };
    if (start) q.exec_date = start;
    if (Number.isFinite(qid) && qid > 0) {
      if (!typeQids.includes(qid)) {
        ctx.body = { code: 200, msg: 'ok', data: { ...empty, page, page_size: size } };
        return;
      }
      q.query_id = qid;
    }
    if (platform && platform !== 'all') q.platform = platform;

    const [rows, total] = await Promise.all([
      ctx.model.Snapshot.find(q).sort({ created_at: -1 }).skip((page - 1) * size).limit(size).lean(),
      ctx.model.Snapshot.countDocuments(q),
    ]);

    const slotIds = rows.map(r => r.slot_id).filter(Boolean);
    const answerIds = rows.map(r => r.answer_id).filter(Boolean);
    const [answersBySlot, answersById, targetMentions, metricRows] = await Promise.all([
      slotIds.length
        ? ctx.model.RawAnswer.find(
          { slot_id: { $in: slotIds } },
          { slot_id: 1, answer_id: 1, answer_text: 1, question_sent: 1 },
        ).lean()
        : [],
      answerIds.length
        ? ctx.model.RawAnswer.find(
          { answer_id: { $in: answerIds } },
          { slot_id: 1, answer_id: 1, answer_text: 1, question_sent: 1 },
        ).lean()
        : [],
      slotIds.length
        ? ctx.model.BrandMention.find(
          { slot_id: { $in: slotIds }, is_target: true },
          { slot_id: 1, position: 1 },
        ).lean()
        : [],
      rows.length
        ? ctx.model.DailyMetricQuery.find({
          brand_id: brand.brand_id,
          date: { $in: [...new Set(rows.map(r => r.exec_date).filter(Boolean))] },
          query_id: { $in: [...new Set(rows.map(r => r.query_id))] },
          platform: { $in: [...new Set(rows.map(r => r.platform))] },
        }, { query_id: 1, platform: 1, date: 1, rank_value: 1 }).lean()
        : [],
    ]);

    const ansSlot = {};
    for (const a of answersBySlot) ansSlot[a.slot_id] = a;
    const ansId = {};
    for (const a of answersById) ansId[a.answer_id] = a;
    const rankBySlot = {};
    for (const m of targetMentions) {
      if (rankBySlot[m.slot_id] == null || m.position < rankBySlot[m.slot_id]) {
        rankBySlot[m.slot_id] = m.position;
      }
    }
    const rankByMetric = {};
    for (const m of metricRows) {
      rankByMetric[`${m.query_id}|${m.platform}|${m.date}`] = m.rank_value || '未提及';
    }

    ctx.body = {
      code: 200, msg: 'ok', data: {
        list: rows.map(r => {
          const ans = (r.slot_id && ansSlot[r.slot_id]) || (r.answer_id && ansId[r.answer_id]) || null;
          const answerText = ans && ans.answer_text ? String(ans.answer_text) : '';
          let rank = '未提及';
          if (r.slot_id && rankBySlot[r.slot_id] != null) rank = String(rankBySlot[r.slot_id]);
          else {
            const mk = `${r.query_id}|${r.platform}|${r.exec_date}`;
            if (rankByMetric[mk]) rank = String(rankByMetric[mk]);
          }
          const queryName = queryNameById[r.query_id]
            || (ans && ans.question_sent)
            || '';
          return {
            id: r.snapshot_id,
            snapshot_id: r.snapshot_id,
            slot_id: r.slot_id || null,
            platform: r.platform,
            end: 'web',
            photo_url: r.photo_url || null,
            oss_key: r.oss_key || null,
            exec_date: r.exec_date,
            query_id: r.query_id,
            query: queryName,
            size: r.size || null,
            size_label: this._formatBytes(r.size),
            rank_value: rank,
            has_answer: !!answerText,
            answer_preview: answerText ? answerText.slice(0, 160) : '',
          };
        }),
        total, page, page_size: size,
      },
    };
  }

  /** 查看单条快照对应的原始回答 */
  async snapshotAnswer() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const snapshotId = String(b.snapshot_id || b.id || '').trim();
    if (!snapshotId) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '缺少 snapshot_id' };
      return;
    }
    const snap = await ctx.model.Snapshot.findOne({
      snapshot_id: snapshotId,
      brand_id: brand.brand_id,
    }).lean();
    if (!snap) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '快照不存在' };
      return;
    }
    let ans = null;
    if (snap.slot_id) {
      ans = await ctx.model.RawAnswer.findOne({ slot_id: snap.slot_id }).lean();
    }
    if (!ans && snap.answer_id) {
      ans = await ctx.model.RawAnswer.findOne({ answer_id: snap.answer_id }).lean();
    }
    const mq = await ctx.model.MonitorQuery.findOne(
      { brand_id: brand.brand_id, query_id: snap.query_id },
      { query: 1 },
    ).lean();
    ctx.body = {
      code: 200, msg: 'ok', data: {
        snapshot_id: snap.snapshot_id,
        platform: snap.platform,
        exec_date: snap.exec_date,
        query_id: snap.query_id,
        query: (mq && mq.query) || (ans && ans.question_sent) || '',
        photo_url: snap.photo_url || null,
        answer_text: (ans && ans.answer_text) || '',
        cited_urls: (ans && ans.cited_urls) || [],
      },
    };
  }

  /** 批量导出回答文本（Excel 友好 CSV） */
  async snapshotExportText() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    const queryType = b.query_type === 'brand' ? 'brand' : 'industry';
    const start = String(b.start_date || '').slice(0, 10);
    const platform = String(b.platform || '').trim().toLowerCase();
    const qid = parseInt(b.query_id, 10);

    const typeQueries = await ctx.model.MonitorQuery.find(
      { brand_id: brand.brand_id, query_type: queryType },
      { query_id: 1, query: 1 },
    ).lean();
    const typeQids = typeQueries.map(q => q.query_id).filter(n => Number.isFinite(n));
    const queryNameById = {};
    for (const q of typeQueries) queryNameById[q.query_id] = q.query || '';

    const q = { brand_id: brand.brand_id, query_id: { $in: typeQids.length ? typeQids : [-1] } };
    if (start) q.exec_date = start;
    if (Number.isFinite(qid) && qid > 0) q.query_id = qid;
    if (platform && platform !== 'all') q.platform = platform;

    const rows = await ctx.model.Snapshot.find(q).sort({ created_at: -1 }).limit(200).lean();
    const slotIds = rows.map(r => r.slot_id).filter(Boolean);
    const answers = slotIds.length
      ? await ctx.model.RawAnswer.find({ slot_id: { $in: slotIds } }).lean()
      : [];
    const ansBySlot = {};
    for (const a of answers) ansBySlot[a.slot_id] = a;

    const PLATFORM_NAME = {
      doubao: '豆包', deepseek: 'DeepSeek', wenxin: '文心一言', qwen: '通义千问', yuanbao: '元宝',
    };
    const lines = [['日期', '平台', '问题', '排行', '回答']];
    for (const r of rows) {
      const ans = (r.slot_id && ansBySlot[r.slot_id]) || null;
      lines.push([
        r.exec_date || '',
        PLATFORM_NAME[r.platform] || r.platform || '',
        queryNameById[r.query_id] || (ans && ans.question_sent) || '',
        '',
        (ans && ans.answer_text) || '',
      ]);
    }
    const csv = `\uFEFF${lines.map(row => row.map(c => {
      const s = String(c == null ? '' : c).replace(/"/g, '""');
      return `"${s}"`;
    }).join(',')).join('\n')}`;
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', `attachment; filename="snapshot-answers-${start || 'export'}.csv"`);
    ctx.body = csv;
  }

  _formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n <= 0) return '—';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  }
}

module.exports = SourceController;
