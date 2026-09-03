/**
 * 口碑观点单元（opinions）
 *【填充时机】S4 流水线 B：口碑题回答 LLM 拆解
 *【写入来源】语义抽取+极性分类（positive/neutral/negative）
 *【被谁消费】summary/reputation_data → 情感环图/观点标签卡
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    slot_id: { type: String, index: true },
    date: { type: String, index: true },
    brand_id: String,
    query_id: Number,
    platform: String,
    topic_id: { type: String, index: true },  // 归并后话题
    quote_text: String,  // 原文短句，如 交期快（现货3-7天）
    polarity: { type: String, enum: ['positive', 'neutral', 'negative'], index: true },
    target_entity: String,  // 观点针对的品牌（默认自家）
  }, { collection: 'opinions', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ date: 1, query_id: 1, polarity: 1 });
  return app.mongoose.model('Opinion', schema);
};
