/**
 * 榜单抽取条目（槽位级位次事实）（brand_mentions）
 *【填充时机】S4 流水线 A：每条排名题回答抽取的品牌位次列表
 *【写入来源】榜单抽取 NLP（从 answer_text 识别有序推荐名录）
 *【被谁消费】full_ranking_matrix/get_references 榜单/competitor insight 频次的原子来源
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    slot_id: { type: String, index: true },
    date: { type: String, index: true },
    brand_id: { type: String, index: true },
    query_id: { type: Number, index: true },
    platform: String,
    end: String,
    entity_id: String,
    entity_name: String,
    position: Number,  // 在回答名录中的位次(1起)
    is_target: { type: Boolean, index: true },  // 命中自家品牌/别名
    snippet: String,  // 位次附近原文
  }, { collection: 'brand_mentions', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ date: 1, query_id: 1, platform: 1 });
  schema.index({ date: 1, entity_id: 1 });
  return app.mongoose.model('BrandMention', schema);
};
