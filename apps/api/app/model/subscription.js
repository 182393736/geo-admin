/**
 * 品牌订阅（subscriptions）
 *【填充时机】S1 套餐下单成功后创建；到期任务改 expired
 *【写入来源】POST /payment/order(create→paid 回调)
 *【被谁消费】GET /payment/subscription/current（剩余天数/额度用量）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    subscription_id: { type: Number, unique: true },
    user_id: { type: String, index: true },
    brand_id: { type: String, index: true },
    plan_id: Number,
    plan_code: String,
    plan_name: String,
    vip_level: String,  // starter/pro
    start_date: String,
    expire_date: String,
    query_limit: Number,
    query_count: { type: Number, default: 0 },  // 已建问题数（冗余=monitor_queries count）
    platform_list: [String],
    status: { type: String, enum: ['active', 'expired', 'refunded'], default: 'active' },
    upgrade_from_subscription_id: Number,
  }, { collection: 'subscriptions', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('Subscription', schema);
};
