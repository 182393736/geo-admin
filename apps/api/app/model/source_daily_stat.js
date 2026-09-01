/**
 * 信源×引擎×日 统计（source_daily_stats）
 *【填充时机】S5 聚合批处理
 *【写入来源】聚合 citation_edges
 *【被谁消费】engine_preference/source_trend/perspective/reference_source/stats 的时间序列底座
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    date: { type: String, index: true },
    brand_id: { type: String, index: true },
    source_id: { type: String, index: true },
    platform: String,
    ref_count: Number,  // 当日被引次数
    article_count: Number,  // distinct article_id
    query_count: Number,  // 覆盖问题数
    own_article_count: Number,  // 其中自有内容
  }, { collection: 'source_daily_stats', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, source_id: 1, platform: 1, date: 1 }, { unique: true });
  return app.mongoose.model('SourceDailyStat', schema);
};
