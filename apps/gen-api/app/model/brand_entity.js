/**
 * 品牌实体库（自动发现竞品池）（brand_entities）
 *【填充时机】S4 流水线 A 每解析出一条位次就 upsert
 *【写入来源】榜单抽取：品牌名归一化（别名+企业实体修正）
 *【被谁消费】竞品榜、实体修正 /competitor/name-corrections
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    entity_id: { type: String, unique: true },
    canonical_name: { type: String, index: true },  // 归一主名
    name_variants: [String],
    scope: { type: String, enum: ['target', 'registered', 'discovered'], default: 'discovered' },  // 自家/登记竞品/自动发现
    industry: String,
    discovered_from: { query_id: Number, platform: String },
    first_seen: String,
    last_seen: String,
  }, { collection: 'brand_entities', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('BrandEntity', schema);
};
