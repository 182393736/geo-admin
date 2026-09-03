/**
 * 每日榜单快照（每题一张榜）（leaderboard_dailies）
 *【填充时机】S5 聚合批处理
 *【写入来源】按批次（query×date）聚合 brand_mentions：位次权重分排序
 *【被谁消费】get_references.company_ranking_data、keyword_details.rankings、竞品透视
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    date: { type: String, index: true },
    brand_id: { type: String, index: true },
    query_id: { type: Number, index: true },
    entries: [{ entity_id: String, name: String, rank: Number, score: Number, is_target: Boolean, mentioned_platforms: Number }],
    rank_weight_table: { type: [Number], default: [40, 20, 20, 16, 16, 13.33, 10, 10, 8, 8] },  // 实测逆向权重，可配置
  }, { collection: 'leaderboard_dailies', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, query_id: 1, date: 1 }, { unique: true });
  return app.mongoose.model('LeaderboardDaily', schema);
};
