/**
 * 观点话题词典（变体归并）（opinion_topics）
 *【填充时机】S4 流水线 B 语义归并时 upsert
 *【写入来源】LLM 归并：交期快⇋交付较快，variants 记录变体
 *【被谁消费】口碑页话题卡列表与次数
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    topic_id: { type: String, unique: true },
    brand_id: { type: String, index: true },
    label: String,  // 规范标签：交期快
    variants: [String],  // 交付较快…（variants_count=len）
    polarity_hint: String,
    first_seen: String,
    last_seen: String,
  }, { collection: 'opinion_topics', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, label: 1 }, { unique: true });
  return app.mongoose.model('OpinionTopic', schema);
};
