/**
 * 品牌产品线（brand_products）
 *【填充时机】S1 爬虫提取 / 手工维护
 *【写入来源】品牌-产品页
 *【被谁消费】GET /api/brand/products（含 stats）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, index: true },
    name: String,
    category: String,
    specs: Schema.Types.Mixed,
    price_range: String,
  }, { collection: 'brand_products', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('BrandProduct', schema);
};
