/**
 * 积分流水（credit_transactions）
 *【填充时机】所有金币变动动作
 *【写入来源】充值/消费/冻结/解冻/退款/过期
 *【被谁消费】GET /credit/transactions；财务对账
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    txn_id: { type: String, unique: true },
    user_id: { type: String, index: true },
    type: { type: String, enum: ['recharge', 'consume', 'freeze', 'unfreeze', 'refund', 'expired'] },
    coin: { type: String, enum: ['gold', 'silver'], default: 'gold' },
    amount: Number,
    balance_after: Number,
    ref_type: String,  // plan/publish/diagnosis/recharge
    ref_id: String,  // 订单号
    remark: String,
  }, { collection: 'credit_transactions', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('CreditTransaction', schema);
};
