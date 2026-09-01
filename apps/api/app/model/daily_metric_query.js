/**
 * 问题级日指标（排名题）（daily_metric_queries）
 *【填充时机】S5 每日聚合批处理
 *【写入来源】聚合 collect_slots + brand_mentions
 *【被谁消费】mention_rate_trend / top3_rate_trend / first_position_rate_trend / full_ranking_matrix
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, index: true },
    query_id: { type: Number, index: true },
    platform: String,  // 引擎 / all
    end: String,
    date: { type: String, index: true },
    denominator: Number,  // 当日该题有效槽位数(=引擎数)
    mentioned: Number,  // is_target 命中槽位
    top3: Number,
    first: Number,
    mention_rate: Number,  // =mentioned/denominator*100
    top3_rate: Number,
    first_rate: Number,
    rank_value: String,  // 当日代表位次：'4' 或 '未提及'
    score: Number,  // 位次权重分聚合
    group_id: String,
  }, { collection: 'daily_metric_queries', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, query_id: 1, platform: 1, date: 1, end: 1 }, { unique: true });
  return app.mongoose.model('DailyMetricQuery', schema);
};
