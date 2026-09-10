/**
 * 流水线事件（品牌×天×阶段 的最新状态 / 错误 / 计数）（pipeline_events）
 *【填充时机】各阶段完成/失败时 upsert：expand(collect.js) / collect(collector._syncTask)
 *             parse+aggregate(service/parse.js) / report(report_build)
 *【被谁消费】管理后台「流水线时间轴」GET /admin/pipeline/timeline、/admin/pipeline/days
 * 唯一键 (brand_id, date, stage)：每个品牌每天每个阶段只保留一条最新记录（时间轴上的一个节点）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    event_id: { type: String, unique: true },
    brand_id: { type: String, index: true },
    date: { type: String, index: true },  // YYYY-MM-DD 统计日
    stage: { type: String, enum: ['expand', 'collect', 'parse', 'aggregate', 'report'], index: true },
    status: { type: String, enum: ['pending', 'running', 'ok', 'partial', 'fail'], default: 'pending' },
    message: String,       // 阶段小结（如「展开 8 个槽位」「解析 3 条，失败 1 条」）
    error: String,         // 出错原因（LLM 报错 / 聚合异常 / 槽位失败汇总等）
    detail: Schema.Types.Mixed, // 阶段计数（expected_slots / parsed / failed / ok / empty …）
  }, { collection: 'pipeline_events', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, date: 1, stage: 1 }, { unique: true });
  return app.mongoose.model('PipelineEvent', schema);
};
