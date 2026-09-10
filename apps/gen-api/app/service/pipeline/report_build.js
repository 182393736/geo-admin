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
      // 并行装配全部模块（trend/engines/metrics/monitor/terminals/overviewStats 均为异步查询）
      const [trend, engines, metrics, monitor, terminals, overviewStats, competitors, writing] = await Promise.all([
        ctx.service.report.trend(daily),
        ctx.service.report.engines(daily, range),
        ctx.service.report.metricCards(daily, repDaily, srcAgg, range),
        ctx.service.report.monitorCards(b.brand_id, range),
        ctx.service.report.terminals(b.brand_id, range),
        ctx.service.report.overviewStats(b.brand_id, range),
        ctx.service.report.competitors(boards),
        ctx.service.report.writingSummary(b.brand_id, range), // publish × cite 回流
      ]);
      const payload = {
        id: range.periodKey, label: range.label, range: range.rangeLabel,
        trend, engines, metrics, monitor,
        sources: srcAgg.list, sourceChanges: srcAgg.changes, allSourceNames: srcAgg.allNames, knownSourceNames: srcAgg.knownNames,
        competitors, writing,
        publish: writing.publishList || [], channels: srcAgg.channels || [],
        terminals,
        summary: '', competitorNote: '', generatedAt: ctx.app.dayjs().format('YYYY-MM-DD HH:mm'),
      };
      await ctx.model.Report.updateOne(
        { brand_id: b.brand_id, period_type, period_key: range.periodKey },
        { $set: { report_id: ctx.helper.uuid(), status: 'ready', payload, generated_at: new Date(),
                  overview_stats: overviewStats } },
        { upsert: true });
      await ctx.model.Reminder.create({ user_id: b.user_id, brand_id: b.brand_id, type: 'report_ready', title: `${range.label}已生成` });
      // 流水线时间轴：report 阶段事件（周报/月报；日期锚定到报告区间末日）
      await ctx.service.pipelineEvent.record({
        brand_id: b.brand_id, date: range.end, stage: 'report',
        status: 'ok', message: `${range.label}已生成`,
        detail: { period_type, period_key: range.periodKey },
      });
    }
  }
}
module.exports = ReportBuildService;
