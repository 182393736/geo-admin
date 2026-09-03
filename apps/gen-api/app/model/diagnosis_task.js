/**
 * 单次诊断任务（diagnosis_tasks）
 *【填充时机】S7 任意品牌即时跑诊断（无需订阅，按积分计费）
 *【写入来源】POST /diagnosis/order/create → aliases/suggest → 跑批 → report
 *【被谁消费】GET /diagnosis/tasks（诊断中心）；diagnosis-report/:id 报告页
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    diagnosis_id: { type: String, unique: true },
    user_id: { type: String, index: true },
    target_brand_input: Schema.Types.Mixed,  // 名字/链接/文档
    aliases: [String],
    ends: { type: [String], default: ['web', 'mobile'] },  // 网页端+APP端
    status: { type: String, enum: ['pending', 'running', 'done', 'fail'], default: 'pending' },
    credit_cost: Number,
    order_no: String,
    result: Schema.Types.Mixed,  // 可见性/排名/引用源/竞品对比
    share_token: String,  // /r/:token
  }, { collection: 'diagnosis_tasks', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('DiagnosisTask', schema);
};
