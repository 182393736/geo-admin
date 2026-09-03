/**
 * 品牌级日指标（口碑+汇总）（daily_metric_brands）
 *【填充时机】S5 聚合批处理
 *【写入来源】聚合 opinions/daily_metric_query/score_result
 *【被谁消费】ai_ranking_matrix（口碑评分网格）、metrics 周汇报、报告 trend 数组
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, index: true },
    query_id: Number,  // 口碑题时才有
    platform: String,
    date: String,
    positive_n: Number,
    neutral_n: Number,
    negative_n: Number,
    ratio: { positive: Number, neutral: Number, negative: Number },
    rep_score: Number,  // 0-100 口碑分（评级阈值≥80健康/≥60中风险/否则高风险）
    mention_rate: Number,
    top3_rate: Number,
    first_rate: Number,
    avg_rank: Number,
    visibility_score: Number,
  }, { collection: 'daily_metric_brands', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, platform: 1, date: 1 }, { unique: true });
  return app.mongoose.model('DailyMetricBrand', schema);
};
