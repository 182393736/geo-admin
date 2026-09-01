/**
 * 话题挖掘候选（mined_topics）
 *【填充时机】S7 用户在话题挖掘页触发 AI 生成
 *【写入来源】POST /api/brand/mining/trigger、/propose-topics（挖掘Agent）
 *【被谁消费】话题挖掘页列表；采纳后转 monitor_queries(status→adopted)
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    topic_id: { type: String, unique: true, default: () => require('uuid').v4() },
    brand_id: { type: String, index: true },
    query_text: String,
    semantic_hash: String,  // 语义归并去重（与 batch_generalize 同源）
    volume_hint: Number,  // 提问量估计（蓝海评分依据）
    competition_hint: Number,
    status: { type: String, enum: ['candidate', 'adopted', 'dismissed'], default: 'candidate' },
    adopted_query_id: Number,
  }, { collection: 'mined_topics', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('MinedTopic', schema);
};
