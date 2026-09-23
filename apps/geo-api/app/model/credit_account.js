/**
 * 积分钱包（金币/银币/冻结）（credit_accounts）
 *【填充时机】S0 注册即开；充值/消费/发稿冻结时更新
 *【写入来源】payment/order 支付成功、publish 下单冻结、失败解冻退回
 *【被谁消费】GET /credit/account、GET /credit/transactions
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    user_id: { type: String, unique: true },
    gold_balance: { type: Number, default: 0 },  // 充值金币
    silver_balance: { type: Number, default: 0 },  // 赠送银币
    frozen: { type: Number, default: 0 },  // 发稿冻结中
    available: Number,  // 服务层计算=gold+silver-frozen；冗余存储便于读
    publish_available: Number,
    total_recharge: { type: Number, default: 0 },
    total_consume: { type: Number, default: 0 },
    total_expired: { type: Number, default: 0 },
  }, { collection: 'credit_accounts', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('CreditAccount', schema);
};
