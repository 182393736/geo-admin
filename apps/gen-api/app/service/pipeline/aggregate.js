'use strict';
/**
 * S5 聚合批处理：把槽位事实压成指标（线上凌晨跑批的核心）
 * 读 collect_slots/brand_mentions/opinions/citation_edges
 * 写 daily_metric_queries / daily_metric_brands / source_daily_stats / leaderboard_dailies；同步回写 publish_orders.cite_count
 */
const { Service } = require('egg');

class AggregateService extends Service {
  async run(brandId, date) {
    const { ctx } = this, app = ctx.app;
    const brands = brandId ? [{ brand_id: brandId }] : null;
    const targetDate = date || app.dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const brandList = brands || await ctx.model.Brand.find({ status: 'active' }).lean();
    for (const b of brandList) {
      /* ---- 1) 问题级日指标：denominator 来自有效槽位 ---- */
      const slots = await ctx.model.CollectSlot.find({ brand_id: b.brand_id, date: targetDate, status: { $in: ['ok', 'empty'] } }).lean();
      const byQP = {};
      slots.forEach(s => { (byQP[`${s.query_id}|${s.platform}|${s.end}`] ||= []).push(s); });
      for (const key of Object.keys(byQP)) {
        const [queryId, platform, end] = key.split('|');
        const qSlots = byQP[key];
        const mentions = await ctx.model.BrandMention.find({ brand_id: b.brand_id, date: targetDate, query_id: +queryId, platform }).lean();
        const r = ctx.service.metrics.rates(qSlots, mentions);
        const targetMention = mentions.find(m => m.is_target);
        await ctx.model.DailyMetricQuery.updateOne(
          { brand_id: b.brand_id, query_id: +queryId, platform, end, date: targetDate },
          { $set: { ...r, rank_value: targetMention ? String(targetMention.position) : '未提及',
                    score: mentions.filter(m => m.is_target).reduce((s, m) => s + ctx.service.metrics.rankScore(m.position), 0) } },
          { upsert: true });
      }
      /* ---- 2) 口碑日指标 ---- */
      for (const platform of b.platforms) {
        const ops = await ctx.model.Opinion.find({ brand_id: b.brand_id, date: targetDate, platform }).lean();
        const rep = ctx.service.metrics.reputation(ops);
        await ctx.model.DailyMetricBrand.updateOne({ brand_id: b.brand_id, platform, date: targetDate }, { $set: rep }, { upsert: true });
      }
      /* ---- 3) 信源日统计（含自有归因） ---- */
      await ctx.model.CitationEdge.aggregate([
        { $match: { brand_id: b.brand_id, date: targetDate } },
        { $group: { _id: { s: '$source_id', p: '$platform' }, ref_count: { $sum: 1 },
                    articles: { $addToSet: '$article_id' }, queries: { $addToSet: '$query_id' }, own: { $sum: { $cond: ['$is_own', 1, 0] } } } },
      ]).then(rows => ctx.model.SourceDailyStat.bulkWrite(rows.map(r => ({
        updateOne: { filter: { brand_id: b.brand_id, source_id: r._id.s, platform: r._id.p, date: targetDate },
          update: { $set: { ref_count: r.ref_count, article_count: r.articles.length, query_count: r.queries.length, own_article_count: r.own } }, upsert: true } }))));
      /* ---- 4) 榜单快照 ---- */
      const qids = await ctx.model.MonitorQuery.distinct('query_id', { brand_id: b.brand_id, query_type: 'industry', query_status: true });
      for (const qid of qids) {
        const mentions = await ctx.model.BrandMention.find({ brand_id: b.brand_id, date: targetDate, query_id: qid }).lean();
        const acc = {};
        mentions.forEach(m => { const a = (acc[m.entity_id] ||= { entity_id: m.entity_id, name: m.entity_name, score: 0, is_target: m.is_target, mentioned_platforms: new Set() });
          a.score += ctx.service.metrics.rankScore(m.position); a.mentioned_platforms.add(m.platform); if (m.is_target) a.is_target = true; });
        const entries = Object.values(acc).sort((x, y) => y.score - x.score)
          .map((e, i) => ({ entity_id: e.entity_id, name: e.name, rank: i + 1, score: e.score, is_target: e.is_target, mentioned_platforms: e.mentioned_platforms.size }));
        await ctx.model.LeaderboardDaily.updateOne({ brand_id: b.brand_id, query_id: qid, date: targetDate }, { $set: { entries } }, { upsert: true });
      }
      /* ---- 5) 归因回写：本品牌发稿被引次数 ---- */
      const mys = await ctx.model.PublishOrder.find({ brand_id: b.brand_id, status: 'ok' }).lean();
      for (const o of mys) {
        const cnt = await ctx.model.CitationEdge.countDocuments({ brand_id: b.brand_id, is_own: true, article_id: { $in: await ctx.model.CitedArticle.distinct('article_id', { canonical_url: o.published_url }) } });
        if (cnt !== o.cite_count) await ctx.model.PublishOrder.updateOne({ order_no: o.order_no }, { cite_count: cnt, $addToSet: { cite_days: targetDate } });
      }
      /* ---- 6) 渠道库 30 天被引刷新 → media_channels ---- */
      await ctx.service.pipeline.mediaStat.refresh(b.brand_id);
    }
  }
}
module.exports = AggregateService;
