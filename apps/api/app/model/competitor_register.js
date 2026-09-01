/**
 * 用户登记竞品（competitor_registers）
 *【填充时机】S1 品牌-竞品页登记 3 个
 *【写入来源】品牌-竞品页表单
 *【被谁消费】GET /api/brand/competitors；报告 competitors 模块标注
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, index: true },
    name: String,
    entity_id: String,  // 关联 brand_entities 归一化实体
    note: String,
    enabled: { type: Boolean, default: true },
  }, { collection: 'competitor_registers', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('CompetitorRegister', schema);
};
