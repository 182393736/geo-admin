/**
 * Agent工作记忆（品牌/公司/竞品）（brand_wikis）
 *【填充时机】S7 写作 Agent 运行中读写
 *【写入来源】GET /api/brand/wiki/tree|file|profile
 *【被谁消费】AGENT 三页 wiki-brand/wiki-company/wiki-competitor
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, index: true },
    scope: { type: String, enum: ['brand', 'company', 'competitor'] },
    path: String,  // 树节点路径
    markdown: String,
  }, { collection: 'brand_wikis', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, scope: 1, path: 1 }, { unique: true });
  return app.mongoose.model('BrandWiki', schema);
};
