'use strict';
/**
 * S6 报告生成：每周日 05:00 周报 / 每月 1 日 05:00 月报（线上实测 05:05 产出）
 * 读： daily_metric_* / source_daily_stats / leaderboard_dailies / publish_orders
 * 写： reports(status: generating→ready)
 */
const { Subscription } = require('egg');

class ReportGenerate extends Subscription {
  static get schedule() { return { cron: '0 0 5 * * 0', type: 'worker' }; } // weekly 示例，monthly 另配
  async subscribe() {
    const { app } = this;
    await app.service.pipeline.reportBuild.run({ period_type: 'weekly' });
  }
}
module.exports = ReportGenerate;
