/**
 * 被引文章注册表（URL 粒度）（cited_articles）
 *【填充时机】S4 流水线 C upsert
 *【写入来源】引用 URL 归一（canonical_url）
 *【被谁消费】article/library（稿件追踪）、品牌档案的引用明细
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    article_id: { type: String, unique: true },
    canonical_url: { type: String, unique: true },
    url: String,
    title: String,
    source_id: { type: String, index: true },
    publish_date: String,
    first_cited_at: String,
    last_cited_at: String,
    is_brand_published: { type: Boolean, default: false },  // 是否自家发稿（URL 命中 publish_orders.published_url）
  }, { collection: 'cited_articles', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('CitedArticle', schema);
};
