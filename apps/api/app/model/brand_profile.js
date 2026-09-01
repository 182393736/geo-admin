/**
 * 品牌画像（AI生成）（brand_profiles）
 *【填充时机】S1 官网爬虫+LLM 分析完成后落库
 *【写入来源】onboarding 异步任务（ai 生成简介/话术）
 *【被谁消费】GET /api/brand/intro（品牌名片、AGENT 写作知识）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, unique: true },
    industry: [String],
    website: String,
    slogan: String,
    tone: Schema.Types.Mixed,
    description: String,  // AI 总结的品牌定位+客群
    scripts: [String],  // 沟通话术脚本
    seeded_from_db: { type: Boolean, default: false },
    exists: { type: Boolean, default: true },
  }, { collection: 'brand_profiles', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('BrandProfile', schema);
};
