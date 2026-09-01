/**
 * 套餐定义（plans）
 *【填充时机】运维配置
 *【写入来源】管理后台
 *【被谁消费】GET /payment/plans/grouped（13KB 价目表）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    plan_id: { type: Number, unique: true },
    plan_code: { type: String, unique: true },  // starter_monthly/pro_monthly…
    plan_name: String,
    plan_type: String,
    billing_cycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
    price: Number,
    original_price: Number,
    duration_days: Number,
    query_limit: Number,  // 监控问题额度（入门版=8）
    features: Schema.Types.Mixed,  // 菜单权限/诊断折扣等
    sort: Number,
    on_sale: { type: Boolean, default: true },
  }, { collection: 'plans', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('Plan', schema);
};
