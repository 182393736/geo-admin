/**
 * 引用边（槽位→文章→信源）（citation_edges）
 *【填充时机】S4 流水线 C 每条引用链接写一条
 *【写入来源】cited_urls × 归一结果 × 自有归因比对
 *【被谁消费】一切信源统计的原子：stats/trend/perspective/writing归因
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    slot_id: { type: String, index: true },
    date: { type: String, index: true },
    brand_id: { type: String, index: true },
    query_id: { type: Number, index: true },
    platform: { type: String, index: true },
    article_id: String,
    source_id: { type: String, index: true },
    is_own: { type: Boolean, default: false, index: true },  // 自有/他源
    mentioned_entity: String,  // 引用出现在推荐谁
  }, { collection: 'citation_edges', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ date: 1, source_id: 1 });
  schema.index({ article_id: 1, date: -1 });
  return app.mongoose.model('CitationEdge', schema);
};
