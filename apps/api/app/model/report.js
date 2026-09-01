/**
 * 周报/月报（装配产物）（reports）
 *【填充时机】S6 周日/月末截止后次日 05:00 跑批生成
 *【写入来源】汇总 daily_metric_* + source_daily_stat + leaderboards + publish 归因 + 上期 diff
 *【被谁消费】POST /report/list、/report/latest、/report/cycle；导出与分享页 /r/:token
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    report_id: { type: String, unique: true },
    brand_id: { type: String, index: true },
    period_type: { type: String, enum: ['weekly', 'monthly'], index: true },
    period_key: String,  // W-20260830 / M-202608
    label: String,  // 8/24–8/30周报
    range: String,  // 08-24 至 08-30
    status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'generating' },
    template_id: Number,
    modules_summary: Schema.Types.Mixed,
    payload: Schema.Types.Mixed,  // 12+ 模块：trend/engines/metrics/monitor/sources/sourceChanges/competitors/writing/channels/terminals…
    overview_stats: Schema.Types.Mixed,  // 快捷卡片：槽位完整率/引用源数/竞品数/文案状态
    generated_at: Date,
  }, { collection: 'reports', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, period_type: 1, period_key: 1 }, { unique: true });
  return app.mongoose.model('Report', schema);
};
