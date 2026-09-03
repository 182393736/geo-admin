'use strict';
/** 渠道库被引统计夜间刷新：source_daily_stats 近30天 → media_channels.ref_count/cost_per_citation */
const { Service } = require('egg');
class MediaStatService extends Service {
  async refresh(brandId) {
    const { ctx } = this, since = ctx.app.dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const rows = await ctx.model.SourceDailyStat.aggregate([
      { $match: { brand_id: brandId, date: { $gte: since } } },
      { $group: { _id: '$source_id', ref: { $sum: '$ref_count' }, art: { $sum: '$article_count' }, q: { $addToSet: '$query_id' } } } ]);
    for (const r of rows) {
      const src = await ctx.model.CanonicalSource.findOne({ source_id: r._id }).lean();
      if (!src || !src.media_key) continue;
      const ch = { ref_count: r.ref, article_count: r.art, query_count: r.q.length, stats_status: 'ok' };
      await ctx.model.MediaChannel.updateOne({ media_key: src.media_key }, { $set: { ...ch } });
      const m = await ctx.model.MediaChannel.findOne({ media_key: src.media_key }).lean();
      await ctx.model.MediaChannel.updateOne({ media_key: src.media_key },
        { $set: { cost_per_citation: m.ref_count ? +(m.sell_price / m.ref_count).toFixed(2) : null } });
    }
  }
}
module.exports = MediaStatService;
