/**
 * 生成稿件/草稿（articles_generated）
 *【填充时机】S7 写作 Agent 完成产出
 *【写入来源】writing_jobs 完成节点；可继续 patch-draft
 *【被谁消费】GET /api/articles（稿件库 my-articles）；POST /api/article/report/patch-draft；publish/article/drafts
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    article_id: { type: String, unique: true },
    job_id: { type: String, index: true },
    uid: String,
    brand_id: String,
    title: String,
    content_md: String,
    word_count: Number,
    status: { type: String, enum: ['draft', 'ready', 'published', 'archived'], default: 'draft' },
    quality_report: Schema.Types.Mixed,
    style_references: [String],
    publish_order_nos: [String],  // 已投订单
  }, { collection: 'articles_generated', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('ArticleGenerated', schema);
};
