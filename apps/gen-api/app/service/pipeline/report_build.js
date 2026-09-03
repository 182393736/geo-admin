'use strict';
/**
 * S6 报告装配：把指标域+行动域压成 report.payload（对线上 /report/latest 的 18 键结构对齐）
 */
const { Service } = require('egg');
class ReportBuildService extends Service {
  async run({ period_type, brand_id }) {
    const { ctx } = this;
    const brands = brand_id ? [{ brand_id }] : await ctx.model.Brand.find({ status: { $in: ['active', 'expired'] } }).lean();
    for (const b of brands) {
      const range = ctx.service.report.range(period_type);           // { start, end, cmpStart, cmpEnd, periodKey, label }
      const daily = await ctx.model.DailyMetricQuery.find({ brand_id: b.brand_id, date: { $gte: range.start, $lte: range.end } }).lean();
      const repDaily = await ctx.model.DailyMetricBrand.find({ brand_id: b.brand_id, date: { $gte: range.start, $lte: range.end } }).lean();
      const srcAgg = await ctx.service.report.sourceSummary(b.brand_id, range); // sources/sourceChanges/channels
      const boards = await ctx.model.LeaderboardDaily.find({ brand_id: b.brand_id, date: { $gte: range.start, $lte: range.end } }).lean();
      const writing = await ctx.service.report.writingSummary(b.brand_id, range); // publish × cite 回流
      const payload = {
        id: range.periodKey, label: range.label, range: range.rangeLabel,
        trend: ctx.service.report.trend(daily), engines: ctx.service.report.engines(daily, range),
        metrics: ctx.service.report.metricCards(daily, repDaily, srcAgg, range),
        monitor: ctx.service.report.monitorCards(b.brand_id, range),
        sources: srcAgg.list, sourceChanges: srcAgg.changes, allSourceNames: srcAgg.allNames, knownSourceNames: srcAgg.knownNames,
        competitors: ctx.service.report.competitors(boards), writing,
        publish: writing.publishList || [], channels: srcAgg.channels || [],
        terminals: ctx.service.report.terminals(b.brand_id, range),
        summary: '', competitorNote: '', generatedAt: ctx.app.dayjs().format('YYYY-MM-DD HH:mm'),
      };
      await ctx.model.Report.updateOne(
        { brand_id: b.brand_id, period_type, period_key: range.periodKey },
        { $set: { report_id: ctx.helper.uuid(), status: 'ready', payload, generated_at: new Date(),
                  overview_stats: await ctx.service.report.overviewStats(b.brand_id, range) } },
        { upsert: true });
      await ctx.model.Reminder.create({ user_id: b.user_id, brand_id: b.brand_id, type: 'report_ready', title: `${range.label}已生成` });
    }
  }
}
module.exports = ReportBuildService;
