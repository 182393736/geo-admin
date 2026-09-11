'use strict';
const Controller = require('egg').Controller;

/**
 * 用户侧排名/口碑/竞品查询（对齐 contracts/api.ts summary 域）
 *  - POST /summary/full_ranking_matrix / mention_rate_trend / top3_rate_trend / first_position_rate_trend
 *  - POST /summary/ai_ranking_matrix / reputation_data / get_references
 *  - POST /competitor/insight
 * 数据源：daily_metric_queries / daily_metric_brands / leaderboard_dailies / brand_mentions / opinions
 */
const PLATFORMS = ['doubao', 'deepseek', 'wenxin', 'yuanbao'];

class SummaryController extends Controller {
  async _resolveBrand(userId, brandId) {
    const { ctx } = this;
    const brands = await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    if (!brands.length) return null;
    return brands.find(b => b.brand_id === brandId) || brands[0];
  }

  _n(v, d = 2) { const n = Number(v); return Number.isFinite(n) ? +n.toFixed(d) : 0; }

  /** 最近有数据的日期（无则回退今天） */
  async _latestDate(model, brandId) {
    const row = await model.findOne({ brand_id: brandId }).sort({ date: -1 }).select('date').lean();
    return row && row.date ? row.date : this.ctx.app.dayjs().format('YYYY-MM-DD');
  }

  /* ---------- 排名矩阵 ---------- */
  async fullRankingMatrix() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    const empty = { platforms: PLATFORMS, list: {}, group_rows: [], valid_data_date_list: [] };
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }
    const qids = (Array.isArray(b.query_id) ? b.query_id : (b.query_id != null ? [b.query_id] : []))
      .map(Number).filter(Number.isFinite);
    if (!qids.length) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }
    const date = String(b.start_date || (await this._latestDate(ctx.model.DailyMetricQuery, brand.brand_id))).slice(0, 10);
    const [queries, metrics, boards] = await Promise.all([
      ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_id: { $in: qids } }).lean(),
      ctx.model.DailyMetricQuery.find({ brand_id: brand.brand_id, query_id: { $in: qids }, date }).lean(),
      ctx.model.LeaderboardDaily.find({ brand_id: brand.brand_id, query_id: { $in: qids }, date }).lean(),
    ]);
    const qMap = {}; for (const q of queries) qMap[q.query_id] = q.query;
    const boardMap = {}; for (const lb of boards) boardMap[lb.query_id] = lb;
    const byQuery = {}; for (const m of metrics) (byQuery[m.query_id] ||= []).push(m);

    const list = {};
    for (const qid of qids) {
      const rows = byQuery[qid] || [];
      const rankValue = {};
      for (const r of rows) rankValue[r.platform] = r.rank_value || '未提及';
      for (const p of PLATFORMS) if (!rankValue[p]) rankValue[p] = '未提及';
      // 榜一竞品：当日榜单第一名非目标实体
      const lb = boardMap[qid];
      let competitor = '—';
      if (lb && Array.isArray(lb.entries)) {
        const nonTarget = lb.entries.find(e => !e.is_target);
        competitor = nonTarget ? nonTarget.name : (lb.entries[0] ? lb.entries[0].name : '—');
      }
      const avg = k => (rows.length ? this._n(rows.reduce((s, r) => s + (Number(r[k]) || 0), 0) / rows.length) : 0);
      list[String(qid)] = {
        query: qMap[qid] || String(qid),
        rank_value: rankValue,
        competitor,
        mention_rate: avg('mention_rate'),
        top3_mention_rate: avg('top3_rate'),
        first_mention_rate: avg('first_rate'),
      };
    }
    ctx.body = {
      code: 200, msg: 'ok',
      data: { platforms: PLATFORMS, list, group_rows: [], valid_data_date_list: date ? [date] : [] },
    };
  }

  /* ---------- 三率趋势 ---------- */
  async _rateTrend(key) {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    const empty = { start_date: '', end_date: '', summary: { all: { denominator: 0, numerator: 0, rate: 0 } }, trend: [] };
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const q = { brand_id: brand.brand_id };
    if (start && end) q.date = { $gte: start, $lte: end };
    const rows = await ctx.model.DailyMetricQuery.find(q).lean();
    const byDate = {};
    for (const r of rows) (byDate[r.date] ||= []).push(r);
    const trend = Object.keys(byDate).sort().map(date => {
      const rs = byDate[date];
      const denominator = rs.reduce((s, r) => s + (Number(r.denominator) || 0), 0);
      const numerator = rs.reduce((s, r) => s + (Number(r[key]) || 0), 0);
      const platforms = {};
      for (const p of PLATFORMS) {
        const pr = rs.filter(r => r.platform === p);
        const d = pr.reduce((s, r) => s + (Number(r.denominator) || 0), 0);
        const num = pr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
        platforms[p] = { denominator: d, numerator: num, rate: d ? this._n(num / d * 100) : 0 };
      }
      return { date_day: date, denominator, numerator, rate: denominator ? this._n(numerator / denominator * 100) : 0, platforms };
    });
    const totalD = trend.reduce((s, t) => s + t.denominator, 0);
    const totalN = trend.reduce((s, t) => s + t.numerator, 0);
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        start_date: start, end_date: end,
        summary: { all: { denominator: totalD, numerator: totalN, rate: totalD ? this._n(totalN / totalD * 100) : 0 } },
        trend,
      },
    };
  }
  async mentionRateTrend() { await this._rateTrend('mentioned'); }
  async top3RateTrend() { await this._rateTrend('top3'); }
  async firstPositionRateTrend() { await this._rateTrend('first'); }

  /* ---------- 口碑评分网格（品牌级 rep_score） ---------- */
  async aiRankingMatrix() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { list: {}, group_rows: [] } }; return; }
    const today = await this._latestDate(ctx.model.DailyMetricBrand, brand.brand_id);
    const yest = ctx.app.dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');
    const [cur, prev] = await Promise.all([
      ctx.model.DailyMetricBrand.find({ brand_id: brand.brand_id, date: today }).lean(),
      ctx.model.DailyMetricBrand.find({ brand_id: brand.brand_id, date: yest }).lean(),
    ]);
    const scoreMap = rows => {
      const m = {};
      const all = rows.filter(r => r.rep_score != null);
      m.all = all.length ? this._n(all.reduce((s, r) => s + Number(r.rep_score), 0) / all.length, 1) : 0;
      for (const p of PLATFORMS) {
        const pr = rows.filter(r => r.platform === p && r.rep_score != null);
        m[p] = pr.length ? this._n(pr.reduce((s, r) => s + Number(r.rep_score), 0) / pr.length, 1) : 0;
      }
      return m;
    };
    const todayScore = scoreMap(cur);
    const yesterdayScore = scoreMap(prev);
    const change = {};
    for (const k of Object.keys(todayScore)) {
      const d = this._n(todayScore[k] - yesterdayScore[k], 1);
      change[k] = { value: todayScore[k], trend: d === 0 ? 'flat' : d > 0 ? 'up' : 'down' };
    }
    ctx.body = {
      code: 200, msg: 'ok',
      data: { list: { all: { today_score: todayScore, yesterday_score: yesterdayScore, change } }, group_rows: [] },
    };
  }

  /* ---------- 口碑数据 ---------- */
  async reputationData() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    const empty = { query_dict: {}, query_id: null, result: [], score_result: [], valid_data_date_list: [], user_data_status: false };
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }
    const query_id = Number(b.query_id) || null;
    const q = { brand_id: brand.brand_id };
    if (query_id) q.query_id = query_id;
    const [opinions, topics, scores, queries] = await Promise.all([
      ctx.model.Opinion.find(q).sort({ date: 1 }).lean(),
      ctx.model.OpinionTopic.find({ brand_id: brand.brand_id }).lean(),
      ctx.model.DailyMetricBrand.find({ brand_id: brand.brand_id }).sort({ date: 1 }).lean(),
      ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_type: 'brand' }).lean(),
    ]);
    const queryDict = {};
    for (const mq of queries) queryDict[mq.query_id] = mq.query;
    // 按极性分组的观点（label → { platforms, variants_count }）
    const bucket = () => ({});
    const analysis = { ratio: { positive: 0, neutral: 0, negative: 0 }, positive: bucket(), neutral: bucket(), negative: bucket() };
    const topicLabel = {}; for (const t of topics) topicLabel[t.topic_id] = t.label;
    for (const o of opinions) {
      const pol = ['positive', 'neutral', 'negative'].includes(o.polarity) ? o.polarity : 'neutral';
      const label = topicLabel[o.topic_id] || '综合';
      const grp = analysis[pol][label] || (analysis[pol][label] = { platforms: {}, variants_count: 0 });
      (grp.platforms[o.platform || 'all'] ||= []).push(o.quote_text);
      grp.variants_count += 1;
    }
    const total = opinions.length || 1;
    analysis.ratio.positive = this._n(opinions.filter(o => o.polarity === 'positive').length / total, 4);
    analysis.ratio.neutral = this._n(opinions.filter(o => o.polarity === 'neutral').length / total, 4);
    analysis.ratio.negative = this._n(opinions.filter(o => o.polarity === 'negative').length / total, 4);
    const dates = [...new Set(scores.map(s => s.date))].sort();
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        query_dict: queryDict, query_id,
        result: [{ id: 1, query_id: query_id || 0, date_day: dates[dates.length - 1] || '', platform: 'all', reputation_analysis: analysis }],
        score_result: scores.map(s => ({ date_day: s.date, score: String(s.rep_score != null ? s.rep_score : 0), platform: s.platform, query_id: query_id || 0 })),
        valid_data_date_list: dates, user_data_status: scores.length > 0,
      },
    };
  }

  /* ---------- 竞品（引用溯源页 company ranking） ---------- */
  async getReferences() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { query_dict: {}, company_ranking_data: [], visibility_trend: { all: [] } } }; return; }
    const latestBoard = await ctx.model.LeaderboardDaily.findOne({ brand_id: brand.brand_id })
      .sort({ date: -1 }).lean();
    const boards = latestBoard
      ? await ctx.model.LeaderboardDaily.find({ brand_id: brand.brand_id, date: latestBoard.date }).lean()
      : [];
    // 按实体聚合位次权重分
    const acc = {};
    for (const lb of boards) {
      for (const e of lb.entries || []) {
        const a = (acc[e.entity_id] ||= { name: e.name, is_target: !!e.is_target, score: 0, queries: 0, best_rank: null });
        a.score += e.score || 0;
        a.queries += 1;
        if (a.best_rank == null || e.rank < a.best_rank) a.best_rank = e.rank;
      }
    }
    const ranking = Object.values(acc)
      .sort((x, y) => y.score - x.score)
      .map((a, i) => ({
        name: a.name, is_target: a.is_target, current_rank: i + 1,
        current_score: this._n(a.score), previous_rank: null, previous_score: null,
        rank_change: 0, trend: 'new',
      }));
    const qids = [...new Set(boards.map(lb => lb.query_id))];
    const mqs = await ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_id: { $in: qids } }).lean();
    const queryDict = {}; for (const mq of mqs) queryDict[mq.query_id] = mq.query;
    // 目标品牌位次趋势（各榜单 is_target 条目的 rank）
    const visAll = boards.map(lb => {
      const t = (lb.entries || []).find(e => e.is_target);
      return { date_day: lb.date, rank_value: t ? String(t.rank) : '未提及', score: t ? String(t.score) : '0' };
    });
    ctx.body = {
      code: 200, msg: 'ok',
      data: { query_dict: queryDict, company_ranking_data: ranking, visibility_trend: { all: visAll } },
    };
  }

  /* ---------- 竞品洞察 ---------- */
  async competitorInsight() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: { list: [] } }; return; }
    const rows = await ctx.model.BrandMention.find({ brand_id: brand.brand_id }).lean();
    const byEntity = {};
    for (const m of rows) {
      if (m.is_target) continue; // 只看竞品
      const a = (byEntity[m.entity_id] ||= { name: m.entity_name || m.entity_id, platforms: new Set(), queries: new Set(), top3: 0, first: 0, total: 0 });
      a.total += 1;
      a.platforms.add(m.platform);
      a.queries.add(m.query_id);
      if (m.position <= 3) a.top3 += 1;
      if (m.position === 1) a.first += 1;
    }
    const slots = await ctx.model.CollectSlot.countDocuments({ brand_id: brand.brand_id, status: { $in: ['ok', 'empty'] } });
    const list = Object.values(byEntity)
      .map(a => ({
        name: a.name, is_target: false,
        frequency: a.total, top3_frequency: a.top3, first_frequency: a.first,
        keyword_count: a.queries.size,
        mention_rate: this._n(slots ? a.total / slots * 100 : 0),
        top3_mention_rate: this._n(slots ? a.top3 / slots * 100 : 0),
        first_mention_rate: this._n(slots ? a.first / slots * 100 : 0),
        platform_stats: {},
      }))
      .sort((x, y) => y.frequency - x.frequency);
    ctx.body = { code: 200, msg: 'ok', data: { list } };
  }
}

module.exports = SummaryController;
