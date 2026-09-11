'use strict';
const Controller = require('egg').Controller;

/**
 * 用户侧排名/口碑/竞品查询（对齐 contracts/api.ts summary 域）
 *  - POST /summary/full_ranking_matrix / mention_rate_trend / top3_rate_trend / first_position_rate_trend
 *  - POST /summary/ai_ranking_matrix / reputation_data / get_references
 *  - POST /competitor/insight
 * 数据源：daily_metric_queries / daily_metric_brands / leaderboard_dailies / brand_mentions / opinions
 */
// 对标 geoapi.timus.cn：5 家引擎（含 qwen），矩阵 platforms 顺序 = 对标
const PLATFORMS = ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'];
// 竞品透视：引擎中文标签（对标 platform_stats/platform_ranks 的键）
const ENGINE_LABELS = { doubao: '豆包', wenxin: '文心一言', deepseek: 'DeepSeek', qwen: '通义千问', qianwen: '通义千问', yuanbao: '元宝' };
const ENGINE_ORDER = ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'];

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
      // 对标 rank_value：all 在前，5 引擎在后；all = 各引擎最好名次
      const rankValue = { all: '未提及' };
      for (const p of PLATFORMS) rankValue[p] = '未提及';
      for (const r of rows) rankValue[r.platform] = r.rank_value || '未提及';
      const numeric = PLATFORMS.map(p => Number(rankValue[p])).filter(Number.isFinite);
      rankValue.all = numeric.length ? String(Math.min(...numeric)) : '未提及';
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
        first_mention_rate: avg('first_rate'),
        top3_mention_rate: avg('top3_rate'),
      };
    }
    const validDates = await ctx.model.DailyMetricQuery.distinct('date', { brand_id: brand.brand_id });
    validDates.sort().reverse();
    ctx.body = {
      code: 200, msg: 'ok',
      data: { platforms: PLATFORMS, list, group_rows: [], valid_data_date_list: validDates.slice(0, 7) },
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
    // 对标 summary：all + 各引擎分项
    const summary = { all: { denominator: totalD, numerator: totalN, rate: totalD ? this._n(totalN / totalD * 100) : 0 } };
    for (const p of PLATFORMS) {
      const d = trend.reduce((s, t) => s + (t.platforms[p] ? t.platforms[p].denominator : 0), 0);
      const num = trend.reduce((s, t) => s + (t.platforms[p] ? t.platforms[p].numerator : 0), 0);
      summary[p] = { denominator: d, numerator: num, rate: d ? this._n(num / d * 100) : 0 };
    }
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        start_date: start, end_date: end,
        summary,
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
    const empty = { query_dict: {}, company_ranking_data: [], visibility_trend: { all: [] }, valid_data_date_list: [], user_data_status: false };
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }

    // 有效数据日期（对标：valid_data_date_list 近 7 日降序）
    const metricDates = await ctx.model.DailyMetricQuery.distinct('date', { brand_id: brand.brand_id });
    const validList = metricDates.sort().reverse().slice(0, 7);
    const curDate = b.date || validList[0] || this.ctx.app.dayjs().format('YYYY-MM-DD');
    const prevDate = validList[1] || null;

    // 仅取指定 query（可选，对标默认不带）
    const qFilter = { brand_id: brand.brand_id, date: curDate };
    if (b.query_id != null && b.query_id !== '') {
      const qid = Number(b.query_id) || String(b.query_id);
      qFilter.query_id = qid;
    }
    const boards = await ctx.model.LeaderboardDaily.find(qFilter).lean();

    const agg = boardsArr => {
      const acc = {};
      for (const lb of boardsArr) {
        for (const e of lb.entries || []) {
          const a = (acc[e.entity_id] ||= { name: e.name, is_target: !!e.is_target, score: 0, best_rank: null });
          a.score += e.score || 0;
          if (a.best_rank == null || e.rank < a.best_rank) a.best_rank = e.rank;
        }
      }
      return Object.values(acc).sort((x, y) => y.score - x.score);
    };
    const curAgg = agg(boards);
    const prevBoards = prevDate && (!b.query_id || b.query_id === '')
      ? await ctx.model.LeaderboardDaily.find({ brand_id: brand.brand_id, date: prevDate }).lean()
      : [];
    const prevAgg = agg(prevBoards);
    const prevRankMap = {};
    prevAgg.forEach((a, i) => { prevRankMap[a.name] = { rank: i + 1, score: a.score }; });

    const company_ranking_data = curAgg.map((a, i) => {
      const p = prevRankMap[a.name];
      const current_rank = i + 1;
      const previous_rank = p ? p.rank : null;
      const previous_score = p ? this._n(p.score) : null;
      const rank_change = previous_rank == null ? 0 : previous_rank - current_rank;
      let trend = 'new';
      if (previous_rank == null) trend = 'new';
      else if (rank_change > 0) trend = 'up';
      else if (rank_change < 0) trend = 'down';
      else trend = 'stable';
      return {
        name: a.name, is_target: a.is_target,
        current_rank, previous_rank,
        current_score: this._n(a.score), previous_score,
        rank_change, trend,
      };
    });

    const qids = [...new Set(boards.map(lb => lb.query_id))];
    const mqs = await ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_id: { $in: qids } }).lean();
    const queryDict = {}; for (const mq of mqs) queryDict[mq.query_id] = mq.query;

    // 目标品牌位次/得分趋势（覆盖 valid_data_date_list 每一天）
    const visAll = [];
    for (const date of validList) {
      const dayBoards = await ctx.model.LeaderboardDaily.find({ brand_id: brand.brand_id, date }).lean();
      let bestRank = null; let scoreSum = 0; let scoreCnt = 0;
      for (const lb of dayBoards) {
        const t = (lb.entries || []).find(e => e.is_target);
        if (!t) continue;
        if (bestRank == null || t.rank < bestRank) bestRank = t.rank;
        scoreSum += Number(t.score) || 0; scoreCnt += 1;
      }
      visAll.push({
        date_day: date,
        rank_value: bestRank == null ? '未上榜' : String(bestRank),
        score: (scoreCnt ? scoreSum / scoreCnt : 0).toFixed(1),
      });
    }

    ctx.body = {
      code: 200, msg: 'ok',
      data: { query_dict: queryDict, company_ranking_data, visibility_trend: { all: visAll }, valid_data_date_list: validList, user_data_status: true },
    };
  }

  /* ---------- 竞品洞察 ---------- */
  async competitorInsight() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const brand = await this._resolveBrand(userId, b.brand_id);
    // 对标 geoapi.timus.cn /competitor/insight 响应结构
    const empty = {
      brand: '', date: '', start_date: '', end_date: '',
      keyword_count: 0, competitor_count: 0,
      target_mention_summary: {
        mention_rate: 0, top3_mention_rate: 0, first_mention_rate: 0,
        denominator: 0, mention_numerator: 0, top3_numerator: 0, first_numerator: 0,
        platform_stats: {},
      },
      valid_data_date_list: [], keyword_details: [], competitor_compare_list: [],
    };
    if (!brand) { ctx.body = { code: 200, msg: 'ok', data: empty }; return; }

    const [mentions, queries, metrics, boards, competitorTotal] = await Promise.all([
      ctx.model.BrandMention.find({ brand_id: brand.brand_id }).lean(),
      ctx.model.MonitorQuery.find({ brand_id: brand.brand_id, query_type: 'industry' }).lean(),
      ctx.model.DailyMetricQuery.find({ brand_id: brand.brand_id }).lean(),
      ctx.model.LeaderboardDaily.find({ brand_id: brand.brand_id }).lean(),
      ctx.model.CompetitorRegister.countDocuments({ brand_id: brand.brand_id }),
    ]);

    const keywordCount = queries.length;      // 监控问题数（对标 keyword_count=5）
    const engineCount = ENGINE_ORDER.length;  // 5
    const allDenom = keywordCount * engineCount; // 综合分母（对标 25）
    const engDenom = keywordCount;            // 单引擎分母（对标 5）

    // 对标：按最新有效日期聚合（start_date=end_date=当日）；有效数据日期近 7 日降序
    const dates = [...new Set(metrics.map(m => m.date))].sort().reverse().slice(0, 7);
    const latestDate = dates[0] || this.ctx.app.dayjs().format('YYYY-MM-DD');

    const tgt = { freq: 0, top3: 0, first: 0, platforms: {} };
    const byEntity = {};
    for (const m of mentions) {
      if (m.date && m.date !== latestDate) continue;
      const label = ENGINE_LABELS[m.platform] || m.platform;
      if (m.is_target) {
        tgt.freq += 1;
        if (m.position <= 3) tgt.top3 += 1;
        if (m.position === 1) tgt.first += 1;
        const tp = (tgt.platforms[label] ||= { total: 0, top3: 0, first: 0 });
        tp.total += 1;
        if (m.position <= 3) tp.top3 += 1;
        if (m.position === 1) tp.first += 1;
      } else {
        const a = (byEntity[m.entity_id] ||= { name: m.entity_name || m.entity_id, freq: 0, top3: 0, first: 0, platforms: {} });
        a.freq += 1;
        if (m.position <= 3) a.top3 += 1;
        if (m.position === 1) a.first += 1;
        const ap = (a.platforms[label] ||= { total: 0, top3: 0, first: 0 });
        ap.total += 1;
        if (m.position <= 3) ap.top3 += 1;
        if (m.position === 1) ap.first += 1;
      }
    }

    const psOf = p => ({
      mention_rate: this._n(engDenom ? p.total / engDenom * 100 : 0),
      top3_mention_rate: this._n(engDenom ? p.top3 / engDenom * 100 : 0),
      first_mention_rate: this._n(engDenom ? p.first / engDenom * 100 : 0),
      mention_numerator: p.total, top3_numerator: p.top3, first_numerator: p.first,
      denominator: engDenom,
    });
    const psAllOf = p => ({
      mention_rate: this._n(allDenom ? p.freq / allDenom * 100 : 0),
      top3_mention_rate: this._n(allDenom ? p.top3 / allDenom * 100 : 0),
      first_mention_rate: this._n(allDenom ? p.first / allDenom * 100 : 0),
      mention_numerator: p.freq, top3_numerator: p.top3, first_numerator: p.first,
      denominator: allDenom,
    });

    const tgtPs = {};
    for (const e of ENGINE_ORDER) tgtPs[ENGINE_LABELS[e]] = psOf(tgt.platforms[ENGINE_LABELS[e]] || { total: 0, top3: 0, first: 0 });
    tgtPs.综合 = psAllOf(tgt);
    const target_mention_summary = {
      mention_rate: tgtPs.综合.mention_rate,
      top3_mention_rate: tgtPs.综合.top3_mention_rate,
      first_mention_rate: tgtPs.综合.first_mention_rate,
      denominator: allDenom, mention_numerator: tgt.freq, top3_numerator: tgt.top3, first_numerator: tgt.first,
      platform_stats: tgtPs,
    };

    const competitor_compare_list = Object.values(byEntity)
      .sort((x, y) => y.freq - x.freq)
      .map(a => {
        const ps = {};
        for (const e of ENGINE_ORDER) ps[ENGINE_LABELS[e]] = psOf(a.platforms[ENGINE_LABELS[e]] || { total: 0, top3: 0, first: 0 });
        ps.综合 = psAllOf(a);
        return {
          name: a.name, is_target: false,
          frequency: a.freq, top3_frequency: a.top3, first_frequency: a.first,
          keyword_count: allDenom,
          mention_rate: this._n(allDenom ? a.freq / allDenom * 100 : 0),
          top3_mention_rate: this._n(allDenom ? a.top3 / allDenom * 100 : 0),
          first_mention_rate: this._n(allDenom ? a.first / allDenom * 100 : 0),
          platform_stats: ps,
        };
      });
    // 对标：本品牌作为 is_target 行参与同一榜单排序
    competitor_compare_list.push({
      name: brand.name, is_target: true,
      frequency: tgt.freq, top3_frequency: tgt.top3, first_frequency: tgt.first,
      keyword_count: allDenom,
      mention_rate: tgtPs.综合.mention_rate,
      top3_mention_rate: tgtPs.综合.top3_mention_rate,
      first_mention_rate: tgtPs.综合.first_mention_rate,
      platform_stats: tgtPs,
    });
    competitor_compare_list.sort((x, y) => y.frequency - x.frequency);

    // keyword_details：每问题的目标位次 + 当日榜单
    const metricByQuery = {};
    for (const m of metrics) (metricByQuery[m.query_id] ||= []).push(m);
    const boardLatest = {};
    for (const lb of boards) {
      if (!boardLatest[lb.query_id] || lb.date > boardLatest[lb.query_id].date) boardLatest[lb.query_id] = lb;
    }
    const keyword_details = queries.map(q => {
      const rows = (metricByQuery[q.query_id] || []).filter(r => r.date === latestDate);
      const platform_ranks = {};
      let best = null;
      for (const e of ENGINE_ORDER) {
        const r = rows.find(x => x.platform === e);
        const rv = r ? r.rank_value : null;
        const n = Number(rv);
        platform_ranks[ENGINE_LABELS[e]] = Number.isFinite(n) ? String(n) : '未上榜';
        if (Number.isFinite(n) && (best == null || n < best)) best = n;
      }
      const lb = boardLatest[q.query_id];
      const rankings = (lb && Array.isArray(lb.entries) ? lb.entries : []).slice(0, 10)
        .map(en => ({ name: en.name, rank: en.rank, score: en.score, is_target: !!en.is_target }));
      return {
        query_id: q.query_id, keyword: q.query, query_type: q.query_type || 'industry',
        target_rank: best, platform_ranks, rankings,
      };
    });

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        brand: brand.name, date: latestDate, start_date: latestDate, end_date: latestDate,
        keyword_count: keywordCount, competitor_count: competitorTotal || competitor_compare_list.length,
        target_mention_summary, valid_data_date_list: dates, keyword_details, competitor_compare_list,
      },
    };
  }
}

module.exports = SummaryController;
