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
    // 实测契约 GET /api/brand/competitors 的"来源"：品牌挖掘=AI 从检索中挖出；用户登记=手工填写
    // 不做 enum 硬约束（后续话题挖掘等新来源可能扩展），已知取值见注释
    source: { type: String, default: '用户登记' },
    // 实测契约"主要竞争点"：AI 一句话竞争定位，如 "电商AI设计工具 · 阿里旗下电商 AI 设计工具，电商场景强"
    compet_point: String,
    enabled: { type: Boolean, default: true },
  }, { collection: 'competitor_registers', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('CompetitorRegister', schema);
};
