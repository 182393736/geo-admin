/**
 * 充值/套餐/诊断订单（payment_orders）
 *【填充时机】所有支付动作
 *【写入来源】POST /payment/order/create|/credit/recharge/create|/diagnosis/order/create + 微信支付回调
 *【被谁消费】GET /payment/orders（计费页流水）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    order_no: { type: String, unique: true },  // CP20260819100104249559
    user_id: { type: String, index: true },
    brand_id: String,
    order_category: { type: String, enum: ['plan', 'recharge', 'diagnosis'] },
    pay_method: { type: String, enum: ['credit', 'wx'], default: 'credit' },
    credit_amount: Number,
    plan_id: Number,
    plan_code: String,
    plan_name: String,
    pack_id: Number,  // 充值包
    duration_days: Number,
    query_limit: Number,
    original_price: Number,
    price: Number,
    pay_amount: Number,
    upgrade_deduct: { type: Number, default: 0 },  // 升级折抵（upgrade/preview）
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'closed'], default: 'pending', index: true },
    receipt_no: String,
    is_invoiced: { type: Boolean, default: false },
    wx_prepay_id: String,
    wx_transaction_id: String,
    wx_code_url: String,
    wx_pay_time: Date,
    paid_at: Date,
    expire_time: Date,
    client_ip: String,
    remark: String,
    diagnosis_id: String,
    order_type: { type: String, default: 'new' },  // new/upgrade
  }, { collection: 'payment_orders', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('PaymentOrder', schema);
};
