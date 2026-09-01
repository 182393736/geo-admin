/**
 * 品牌识别别名（brand_aliases）
 *【填充时机】S1 自动生成（宏祥盛誉/宏祥家具）；S4 补录
 *【写入来源】onboarding LLM 扩展 + 监控识别管理页手工维护
 *【被谁消费】GET /api/brand/aliases；流水线 A 实体归一时读取
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, index: true },
    alias: { type: String, required: true },
    source: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    enabled: { type: Boolean, default: true },
  }, { collection: 'brand_aliases', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, alias: 1 }, { unique: true });
  return app.mongoose.model('BrandAlias', schema);
};
