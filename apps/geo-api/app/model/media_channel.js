/**
 * 发稿渠道库（11万+）（media_channels）
 *【填充时机】运营导入 + 每晚按 30 天窗口从 citation 统计刷新被引数据
 *【写入来源】渠道库运营 + 夜间聚合（source_daily_stat 回写 ref_count）
 *【被谁消费】POST /publish/media/facets、/publish/media/list（信源库页）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    media_key: { type: String, unique: true },  // kuaiyibo_680036
    name: { type: String, index: true },  // 抖音/澎湃新闻
    type: String,  // 官方网媒/综合门户/行业媒体/UGC社区/自媒体
    site_url: String,
    favicon: String,
    list_price: Number,  // 牌面价（分）
    sell_price: Number,  // 售价
    discount_rate: Number,
    categories: [String],  // 行业标签 → facets
    indexed_engines: [String],  // 收录引擎
    ref_count: { type: Number, default: 0 },  // 近30天被引次数（夜间刷新）
    article_count: { type: Number, default: 0 },
    query_count: { type: Number, default: 0 },
    cost_per_citation: Number,  // = sell_price / ref_count（洞察推荐排序键）
    stats_window_days: { type: Number, default: 30 },
    stats_status: String,
    source_id: String,  // 与 canonical_sources 打通 → 信源情报联动
    enabled: { type: Boolean, default: true },
  }, { collection: 'media_channels', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('MediaChannel', schema);
};
