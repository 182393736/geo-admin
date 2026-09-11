'use strict';
/**
 * 报告装配服务（S6 report_build 依赖）
 * 产出对齐线上 /report/latest 的 payload 结构：
 *   trend / engines / metrics / monitor / sources / sourceChanges /
 *   allSourceNames / knownSourceNames / competitors / writing / publish /
 *   channels / terminals / overview_stats
 *
 * 指标口径复用 service/metrics.js（三率 / 口碑 / 环比），只做装配与聚合。
 */
const { Service } = require('egg');

const PLATFORM_NAMES = { doubao: '豆包', deepseek: 'DeepSeek', wenxin: '文心一言', yuanbao: '腾讯元宝' };
const PLATFORM_KEYS = Object.keys(PLATFORM_NAMES);

class ReportService extends Service {
  /* ================= 周期 ================= */
  /** 返回 { start, end, cmpStart, cmpEnd, periodKey, label, rangeLabel }（日期均为 YYYY-MM-DD 字符串）
   *  opts.endToday=true：end=今天（测试期实时出报告用）；缺省 end=昨天（正式周报语义） */
  range(periodType, opts = {}) {
    const dayjs = this.app.dayjs;
    const today = dayjs();
    let start, end, cmpStart, cmpEnd, periodKey, label, rangeLabel;
    if (periodType === 'monthly') {
      end = today.startOf('month').subtract(1, 'day');     // 上月末
      start = end.startOf('month');                         // 上月初
      periodKey = `M-${start.format('YYYYMM')}`;
      label = `${start.format('M/D')}–${end.format('M/D')}月报`;
      rangeLabel = `${start.format('MM-DD')} 至 ${end.format('MM-DD')}`;
      cmpStart = start.subtract(1, 'month').startOf('month');
      cmpEnd = start.subtract(1, 'day');
    } else {
      end = opts.endToday ? today : today.subtract(1, 'day'); // 实时报告含今天；正式周报截至昨天
      start = end.subtract(6, 'day');                       // 滚动 7 天
      periodKey = `W-${end.format('YYYYMMDD')}`;
      label = `${start.format('M/D')}–${end.format('M/D')}周报`;
      rangeLabel = `${start.format('MM-DD')} 至 ${end.format('MM-DD')}`;
      cmpStart = start.subtract(7, 'day');
      cmpEnd = end.subtract(7, 'day');
    }
    return {
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
      cmpStart: cmpStart.format('YYYY-MM-DD'),
      cmpEnd: cmpEnd.format('YYYY-MM-DD'),
      periodKey, label, rangeLabel,
    };
  }

  _num(v, d = 2) { const n = Number(v); return Number.isFinite(n) ? +n.toFixed(d) : 0; }

  _avg(rows, key) {
    if (!rows || !rows.length) return 0;
    return this._num(rows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / rows.length);
  }

  /** 按 platform 聚合日指标行 → { platform: { mention_rate, top3_rate, first_rate, score, samples } } */
  _aggByPlatform(rows) {
    const acc = {};
    for (const r of rows || []) {
      const p = r.platform || 'all';
      const a = (acc[p] ||= { mention: 0, top3: 0, first: 0, score: 0, n: 0 });
      a.mention += Number(r.mention_rate) || 0;
      a.top3 += Number(r.top3_rate) || 0;
      a.first += Number(r.first_rate) || 0;
      a.score += Number(r.score) || 0;
      a.n += 1;
    }
    const out = {};
    for (const p of Object.keys(acc)) {
      const a = acc[p];
      out[p] = {
        mention_rate: this._num(a.mention / a.n),
        top3_rate: this._num(a.top3 / a.n),
        first_rate: this._num(a.first / a.n),
        score: this._num(a.score / a.n),
        samples: a.n,
      };
    }
    return out;
  }

  /* ================= 趋势 ================= */
  /** daily: DailyMetricQuery[]（本期）。按天聚合平均提及率/前三率/首位率/权重分 + 口碑分 */
  async trend(daily) {
    const { ctx } = this;
    const byDate = {};
    for (const r of daily || []) (byDate[r.date] ||= []).push(r);
    const dates = Object.keys(byDate).sort();
    const avg = (key, dateRows) => dates.map(d => this._avg(dateRows[d], key));

    let repByDate = {};
    const brandId = daily && daily[0] && daily[0].brand_id;
    if (brandId) {
      const repDaily = await ctx.model.DailyMetricBrand.find({
        brand_id: brandId,
        date: { $gte: dates[0], $lte: dates[dates.length - 1] },
      }).lean().catch(() => []);
      for (const r of repDaily) (repByDate[r.date] ||= []).push(r);
    }
    return {
      labels: dates.map(d => d.slice(5)), // MM-DD
      dates,
      mention_rate: avg('mention_rate', byDate),
      top3_rate: avg('top3_rate', byDate),
      first_rate: avg('first_rate', byDate),
      score: avg('score', byDate),
      rep_score: dates.map(d => this._avg(repByDate[d], 'rep_score')),
    };
  }

  /* ================= 引擎 ================= */
  /** 各引擎 + all 的本期均值与环比（cmp 取上周期） */
  async engines(daily, range) {
    const { ctx } = this;
    const cur = this._aggByPlatform(daily);
    const brandId = daily && daily[0] && daily[0].brand_id;
    let cmp = {};
    if (brandId) {
      const cmpRows = await ctx.model.DailyMetricQuery.find({
        brand_id: brandId, date: { $gte: range.cmpStart, $lte: range.cmpEnd },
      }).lean().catch(() => []);
      cmp = this._aggByPlatform(cmpRows);
    }
    const allCur = {
      mention_rate: this._avg(daily, 'mention_rate'),
      top3_rate: this._avg(daily, 'top3_rate'),
      first_rate: this._avg(daily, 'first_rate'),
      score: this._avg(daily, 'score'),
      samples: (daily || []).length,
    };
    const rows = PLATFORM_KEYS.map(p => ({ key: p, name: PLATFORM_NAMES[p], ...(cur[p] || { mention_rate: 0, top3_rate: 0, first_rate: 0, score: 0, samples: 0 }) }));
    rows.push({ key: 'all', name: '全部引擎', ...allCur });
    return rows.map(r => {
      const prev = cmp[r.key] || { mention_rate: 0, top3_rate: 0, first_rate: 0, score: 0 };
      const d = k => ctx.service.metrics.delta(r[k], prev[k] || 0);
      return {
        ...r,
        mention_rate_delta: d('mention_rate'),
        top3_rate_delta: d('top3_rate'),
        first_rate_delta: d('first_rate'),
        score_delta: d('score'),
      };
    });
  }

  /* ================= 核心指标卡 ================= */
  /** 四项主指标（提及率/前三率/首位率/口碑分）+ 引用源总量，含环比 */
  async metricCards(daily, repDaily, srcAgg, range) {
    const { ctx } = this;
    const metrics = ctx.service.metrics;
    const brandId = (daily && daily[0] && daily[0].brand_id) || (repDaily && repDaily[0] && repDaily[0].brand_id);

    const cur = {
      mention_rate: this._avg(daily, 'mention_rate'),
      top3_rate: this._avg(daily, 'top3_rate'),
      first_rate: this._avg(daily, 'first_rate'),
    };
    const repScore = this._avg(repDaily, 'rep_score');

    let prev = { mention_rate: 0, top3_rate: 0, first_rate: 0 };
    let repPrev = 0;
    if (brandId) {
      const [cmpRows, cmpRep] = await Promise.all([
        ctx.model.DailyMetricQuery.find({ brand_id: brandId, date: { $gte: range.cmpStart, $lte: range.cmpEnd } }).lean().catch(() => []),
        ctx.model.DailyMetricBrand.find({ brand_id: brandId, date: { $gte: range.cmpStart, $lte: range.cmpEnd } }).lean().catch(() => []),
      ]);
      prev = {
        mention_rate: this._avg(cmpRows, 'mention_rate'),
        top3_rate: this._avg(cmpRows, 'top3_rate'),
        first_rate: this._avg(cmpRows, 'first_rate'),
      };
      repPrev = this._avg(cmpRep, 'rep_score');
    }

    const srcTotal = (srcAgg && srcAgg.list || []).reduce((s, x) => s + (x.ref_count || 0), 0);
    const d = k => metrics.delta(cur[k], prev[k] || 0);
    return [
      { key: 'mention_rate', label: '平均提及率', value: cur.mention_rate, unit: '%', ...d('mention_rate') },
      { key: 'top3_rate', label: '平均前三率', value: cur.top3_rate, unit: '%', ...d('top3_rate') },
      { key: 'first_rate', label: '平均首位率', value: cur.first_rate, unit: '%', ...d('first_rate') },
      {
        key: 'rep_score', label: '口碑分', value: repScore, unit: '',
        delta: this._num(repScore - repPrev),
        trend: repScore === repPrev ? 'flat' : repScore > repPrev ? 'up' : 'down',
      },
      { key: 'sources', label: '引用源总量', value: srcTotal, unit: '' },
    ];
  }

  /* ================= 监控问题卡 ================= */
  /** 每个启用问题的本期指标（均值 + 各平台明细 + 代表位次） */
  async monitorCards(brandId, range) {
    const { ctx } = this;
    const [queries, daily] = await Promise.all([
      ctx.model.MonitorQuery.find({ brand_id: brandId, query_status: true }).sort({ query_order: 1, created_at: 1 }).lean().catch(() => []),
      ctx.model.DailyMetricQuery.find({ brand_id: brandId, date: { $gte: range.start, $lte: range.end } }).lean().catch(() => []),
    ]);
    const byQ = {};
    for (const r of daily) (byQ[r.query_id] ||= []).push(r);
    return queries.map(q => {
      const rows = byQ[q.query_id] || [];
      const platforms = {};
      let rankValue = '未提及';
      for (const r of rows) {
        platforms[r.platform] = {
          mention_rate: this._num(r.mention_rate), top3_rate: this._num(r.top3_rate), first_rate: this._num(r.first_rate),
          rank_value: r.rank_value || '未提及', score: this._num(r.score),
        };
        const v = r.rank_value;
        if (v && /^\d+$/.test(String(v))) {
          if (rankValue === '未提及' || Number(v) < Number(rankValue)) rankValue = String(v);
        }
      }
      return {
        query_id: q.query_id, query: q.query, query_type: q.query_type,
        mention_rate: this._avg(rows, 'mention_rate'),
        top3_rate: this._avg(rows, 'top3_rate'),
        first_rate: this._avg(rows, 'first_rate'),
        rank_value: rankValue,
        platforms,
      };
    });
  }

  /* ================= 信源 ================= */
  /** 本期信源列表 + 环比增减 + 可投放渠道（命中 media_channels） */
  async sourceSummary(brandId, range) {
    const { ctx } = this;
    const [curRows, cmpRows, sources, channels] = await Promise.all([
      ctx.model.SourceDailyStat.find({ brand_id: brandId, date: { $gte: range.start, $lte: range.end } }).lean().catch(() => []),
      ctx.model.SourceDailyStat.find({ brand_id: brandId, date: { $gte: range.cmpStart, $lte: range.cmpEnd } }).lean().catch(() => []),
      ctx.model.CanonicalSource.find({}).lean().catch(() => []),
      ctx.model.MediaChannel.find({}).select('media_key name type ref_count article_count cost_per_citation sell_price').lean().catch(() => []),
    ]);
    const srcMap = {};
    for (const s of sources) srcMap[s.source_id] = s;
    const chByName = {};
    for (const c of channels) chByName[c.name] = c;

    const agg = rows => {
      const a = {};
      for (const r of rows) {
        const x = (a[r.source_id] ||= { ref_count: 0, article_count: 0, query_count: 0, own_article_count: 0, platforms: {} });
        x.ref_count += r.ref_count || 0;
        x.article_count += r.article_count || 0;
        x.query_count += r.query_count || 0;
        x.own_article_count += r.own_article_count || 0;
        x.platforms[r.platform] = (x.platforms[r.platform] || 0) + (r.ref_count || 0);
      }
      return a;
    };
    const cur = agg(curRows);
    const cmp = agg(cmpRows);

    const list = Object.entries(cur).map(([sourceId, v]) => {
      const meta = srcMap[sourceId] || {};
      return {
        source_id: sourceId,
        canonical_source: meta.canonical_source || sourceId,
        category: meta.category || '未分类',
        ref_count: v.ref_count, article_count: v.article_count, query_count: v.query_count, own_article_count: v.own_article_count,
        platforms: v.platforms,
        media_key: meta.media_key || null,
      };
    }).sort((a, b) => b.ref_count - a.ref_count);

    const changes = list.map(x => ({
      canonical_source: x.canonical_source, ref_count: x.ref_count,
      delta_ref: x.ref_count - ((cmp[x.source_id] || {}).ref_count || 0),
    })).sort((a, b) => b.delta_ref - a.delta_ref);

    const known = list.filter(x => chByName[x.canonical_source]);
    const channelRows = known.map(x => {
      const c = chByName[x.canonical_source];
      return {
        canonical_source: x.canonical_source, media_key: c.media_key, ref_count: x.ref_count,
        cost_per_citation: c.cost_per_citation != null ? c.cost_per_citation
          : (c.sell_price && x.ref_count ? this._num(c.sell_price / x.ref_count) : null),
      };
    });
    return {
      list,
      changes,
      allNames: list.map(x => x.canonical_source),
      knownNames: known.map(x => x.canonical_source),
      channels: channelRows,
    };
  }

  /* ================= 竞争格局 ================= */
  /** boards: LeaderboardDaily[]。按实体聚合位次权重分 → 竞品榜（含目标品牌） */
  competitors(boards) {
    const totalQueries = (boards || []).length;
    const acc = {};
    for (const b of boards || []) {
      for (const e of b.entries || []) {
        const a = (acc[e.entity_id] ||= {
          name: e.name, is_target: !!e.is_target, score: 0, queries: 0,
          top3: 0, first: 0, best_rank: null, mentioned_platforms: 0,
        });
        a.score += e.score || 0;
        a.queries += 1;
        if (Number(e.rank) <= 3) a.top3 += 1;
        if (Number(e.rank) === 1) a.first += 1;
        if (a.best_rank == null || Number(e.rank) < a.best_rank) a.best_rank = Number(e.rank);
        a.mentioned_platforms = Math.max(a.mentioned_platforms, e.mentioned_platforms || 0);
      }
    }
    return Object.values(acc)
      .map(a => ({
        ...a,
        mention_rate: this._num(totalQueries ? a.queries / totalQueries * 100 : 0),
        top3_rate: this._num(totalQueries ? a.top3 / totalQueries * 100 : 0),
        first_rate: this._num(totalQueries ? a.first / totalQueries * 100 : 0),
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 20);
  }

  /* ================= 发稿 × 被引回流 ================= */
  async writingSummary(brandId, range) {
    const { ctx } = this;
    const dayjs = this.app.dayjs;
    const orders = await ctx.model.PublishOrder.find({ brand_id: brandId, status: 'ok' }).sort({ published_at: -1 }).lean().catch(() => []);
    const start = dayjs(range.start).subtract(1, 'day');
    const end = dayjs(range.end).add(1, 'day');
    const inRange = orders.filter(o => o.published_at && dayjs(o.published_at).isAfter(start) && dayjs(o.published_at).isBefore(end));
    const publishList = (inRange.length ? inRange : orders).slice(0, 50).map(o => ({
      order_no: o.order_no, article_title: o.article_title || '', media_name: o.media_name || '',
      status: o.status, published_url: o.published_url || '',
      published_at: o.published_at ? dayjs(o.published_at).format('YYYY-MM-DD HH:mm') : null,
      cite_count: o.cite_count || 0,
    }));
    return {
      total: orders.length,
      cited: orders.filter(o => (o.cite_count || 0) > 0).length,
      total_cites: orders.reduce((s, o) => s + (o.cite_count || 0), 0),
      publishList,
    };
  }

  /* ================= 终端（各 AI 引擎采集/引用汇总） ================= */
  async terminals(brandId, range) {
    const { ctx } = this;
    const [slots, answers, refs] = await Promise.all([
      ctx.model.CollectSlot.find({ brand_id: brandId, date: { $gte: range.start, $lte: range.end } }).lean().catch(() => []),
      ctx.model.RawAnswer.find({ brand_id: brandId, date: { $gte: range.start, $lte: range.end } }).lean().catch(() => []),
      ctx.model.CitationEdge.find({ brand_id: brandId, date: { $gte: range.start, $lte: range.end } }).lean().catch(() => []),
    ]);
    const byP = {};
    const ensure = p => (byP[p] ||= { slots: 0, ok: 0, empty: 0, fail: 0, answers: 0, refs: 0 });
    for (const s of slots) {
      const a = ensure(s.platform);
      a.slots += 1;
      if (s.status === 'ok') a.ok += 1;
      else if (s.status === 'empty') a.empty += 1;
      else if (s.status === 'fail') a.fail += 1;
    }
    for (const r of answers) ensure(r.platform).answers += 1;
    for (const e of refs) ensure(e.platform).refs += 1;
    return PLATFORM_KEYS.map(p => {
      const a = byP[p] || { slots: 0, ok: 0, empty: 0, fail: 0, answers: 0, refs: 0 };
      return { key: p, name: PLATFORM_NAMES[p], ...a };
    });
  }

  /* ================= 快捷卡片（对齐 OverviewStats 契约） ================= */
  async overviewStats(brandId, range) {
    const { ctx } = this;
    const dayjs = this.app.dayjs;
    const [brand, monitored, srcIds, published, aliases, competitors, slots, collected, latest] = await Promise.all([
      ctx.model.Brand.findOne({ brand_id: brandId }).lean().catch(() => null),
      ctx.model.MonitorQuery.countDocuments({ brand_id: brandId, query_status: true }).catch(() => 0),
      ctx.model.SourceDailyStat.distinct('source_id', { brand_id: brandId, date: { $gte: range.start, $lte: range.end } }).catch(() => []),
      ctx.model.PublishOrder.countDocuments({ brand_id: brandId, status: 'ok' }).catch(() => 0),
      ctx.model.BrandAlias.countDocuments({ brand_id: brandId, enabled: true }).catch(() => 0),
      ctx.model.CompetitorRegister.countDocuments({ brand_id: brandId, enabled: true }).catch(() => 0),
      ctx.model.CollectSlot.find({ brand_id: brandId, date: { $gte: range.start, $lte: range.end } }).lean().catch(() => []),
      ctx.model.RawAnswer.countDocuments({ brand_id: brandId, date: { $gte: range.start, $lte: range.end } }).catch(() => 0),
      ctx.model.RawAnswer.findOne({ brand_id: brandId }).sort({ updated_at: -1 }).lean().catch(() => null),
    ]);
    const expected = slots.length;
    const actual = slots.filter(s => s.status === 'ok' || s.status === 'empty').length;
    return {
      monitored_queries: monitored,
      collected_queries: collected,
      reference_sources: (srcIds || []).length,
      published_articles: published,
      industry: (brand && brand.industry) || '',
      website: (brand && brand.website) || null,
      alias_count: aliases,
      competitor_count: competitors,
      stat_date: range.end,
      updated_at: latest && latest.updated_at ? dayjs(latest.updated_at).format('YYYY-MM-DD HH:mm') : dayjs().format('YYYY-MM-DD HH:mm'),
      collection_status: expected === 0 ? 'no_data' : 'normal',
      expected_slots: expected,
      actual_slots: actual,
      completeness_rate: expected ? this._num(actual / expected * 100) : 0,
      source: 'gen-api aggregate',
    };
  }
}
module.exports = ReportService;
