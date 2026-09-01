/**
 * 信源站点归一库（canonical_sources）
 *【填充时机】S4 流水线 C 按域名 upsert；运营补充类目
 *【写入来源】域名归一 + 类目打标（视频/搜索引擎/企业服务/电商…）
 *【被谁消费】reference_source/stats、engine_preference、信源库联动
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    source_id: { type: String, unique: true },
    canonical_source: { type: String, unique: true },  // 抖音/中国采购与招标网
    category: String,
    domains: [String],
    auth_info_des: String,
    auth_info_level: String,
    media_key: String,  // 若在 11 万发稿渠道库中 → 可发稿标记
    first_cited_at: String,
    last_cited_at: String,
  }, { collection: 'canonical_sources', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('CanonicalSource', schema);
};
