/**
 * AI 原始回答（大文本事实源）（raw_answers）
 *【填充时机】S3 采集 worker 拿到回答即落库（先存原文再解析，可重跑）
 *【写入来源】采集 worker
 *【被谁消费】解析流水线 A/B/C；快照页可回放；summary/get_references 原文引用
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    answer_id: { type: String, unique: true },
    slot_id: { type: String, unique: true, index: true },
    brand_id: String,
    query_id: Number,
    query_type: { type: String, enum: ['industry', 'brand'], index: true },  // 解析分流的唯一依据（industry→排名A / brand→口碑B）
    platform: String,
    end: String,
    date: String,
    question_sent: String,
    answer_text: String,  // 完整原文
    cited_urls: [{ url: String, title: String, index: Number, snippet: String, site_name: String, domain: String, publish_time: String }],  // 解析前的信源清单（url 必填，其余可选；domain 为手动统一信源名的键）
    model_meta: Schema.Types.Mixed,
    parsed: { type: Boolean, default: false, index: true },  // 批处理标记
  }, { collection: 'raw_answers', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, date: 1 });
  return app.mongoose.model('RawAnswer', schema);
};
