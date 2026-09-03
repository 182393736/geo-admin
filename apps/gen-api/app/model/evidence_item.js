/**
 * 循证库（写作事实底座）（evidence_items）
 *【填充时机】S4 解析顺带沉淀高被引优质内容；手工收藏
 *【写入来源】citation_edges 高分文章入库 + /api/brand/evidence-library/recommend|refresh
 *【被谁消费】GET /api/brand/evidence-library（写作 Agent 挂载）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    evidence_id: { type: String, unique: true },
    brand_id: { type: String, index: true },
    title: String,
    url: String,
    excerpt: String,
    platform: String,
    tag: { type: String, enum: ['top-cite', 'recent', '5star', 'standard'] },
    quote_count: { type: Number, default: 0 },
    referenced_at: String,
    alive: { type: Boolean, default: true },  // alive_filtered 过滤死链
    is_own: { type: Boolean, default: false },
  }, { collection: 'evidence_items', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('EvidenceItem', schema);
};
