/**
 * 每日采集任务（品牌×天）（collect_tasks）
 *【填充时机】S2 凌晨定时任务为每个 active 品牌创建；手动 POST /user/generate_today
 *【写入来源】egg schedule（每日 00:30 展开槽位）
 *【被谁消费】GET /user/get_query_status；collect_tasks 汇总槽位完成率
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    task_id: { type: String, unique: true },
    brand_id: { type: String, index: true },
    date: { type: String, index: true },  // YYYY-MM-DD 统计日
    trigger: { type: String, enum: ['schedule', 'manual'], default: 'schedule' },
    expected_slots: Number,  // = 启用问题数 × 引擎数
    actual_slots: { type: Number, default: 0 },
    failed_slots: { type: Number, default: 0 },
    completeness_rate: Number,  // actual/expected，报告 overview 用
    status: { type: String, enum: ['created', 'running', 'ok', 'fail'], default: 'created' },
    started_at: Date,
    finished_at: Date,
  }, { collection: 'collect_tasks', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, date: 1 }, { unique: true });
  return app.mongoose.model('CollectTask', schema);
};
