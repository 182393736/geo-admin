/**
 * 采集槽位（问题×引擎×天）【原子单位】（collect_slots）
 *【填充时机】S2 由 collect_tasks 展开生成；worker 逐槽执行
 *【写入来源】采集 worker（中立账号模拟提问写回）
 *【被谁消费】/user/get_query_status；一切指标的分母
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    slot_id: { type: String, unique: true },
    task_id: { type: String, index: true },
    brand_id: { type: String, index: true },
    query_id: { type: Number, index: true },
    query_type: String,
    platform: { type: String, enum: ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao', 'kimi'], index: true },
    end: { type: String, enum: ['web', 'mobile'], default: 'web' },
    date: { type: String, index: true },
    question_sent: String,  // 实际发出的 platform_query
    mock_account_id: String,  // 中立账号池抽取记录（审计）
    status: { type: String, enum: ['pending', 'running', 'ok', 'fail', 'empty'], default: 'pending' },
    answer_id: String,  // → raw_answers
    error: String,
    attempts: { type: Number, default: 0 },
    finished_at: Date,
  }, { collection: 'collect_slots', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, date: 1, query_id: 1, platform: 1, end: 1 }, { unique: true });
  schema.index({ status: 1, date: 1 });
  return app.mongoose.model('CollectSlot', schema);
};
