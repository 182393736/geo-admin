/**
 * 发稿订单（publish_orders）
 *【填充时机】S7 发布稿件页选择媒体提交
 *【写入来源】下单：冻结积分→提交媒体→成功扣减/失败退回（credit_transactions 联动）
 *【被谁消费】POST /publish/orders（发稿记录）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    order_no: { type: String, unique: true },  // PB202608171622279VDD5E83
    user_id: { type: String, index: true },
    brand_id: String,
    article_id: String,
    article_title: String,
    article_note: String,
    media_key: String,
    media_name: String,
    status: { type: String, enum: ['pending', 'submitted', 'ok', 'fail'], default: 'pending', index: true },
    published_url: String,  // 成功回传收录链接
    fail_reason: String,  // 如 媒体id输入错误
    list_price: Number,
    sell_price: Number,
    discount_rate: Number,
    credit_txn_freeze: String,  // 冻结流水 id
    credit_txn_settle: String,  // 扣减/退回流水 id
    published_at: Date,
    cite_count: { type: Number, default: 0 },  // 归因：被AI引用次数（每日刷新）
    cite_days: [String],
  }, { collection: 'publish_orders', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('PublishOrder', schema);
};
