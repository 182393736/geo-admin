'use strict';
const Controller = require('egg').Controller;

/**
 * 积分钱包（采集前即需真实展示：套餐页账户积分）
 *  - GET /credit/account  查余额；无钱包自动开户（注册即开语义，幂等）
 */
class CreditController extends Controller {
  async account() {
    const { ctx } = this;
    const userId = ctx.state.user.id;

    let acc = await ctx.model.CreditAccount.findOne({ user_id: userId }).lean();
    if (!acc) {
      acc = await ctx.model.CreditAccount.create({
        user_id: userId,
        gold_balance: 0, silver_balance: 0, frozen: 0,
        available: 0, publish_available: 0,
        total_recharge: 0, total_consume: 0, total_expired: 0,
      });
    }

    const gold = acc.gold_balance || 0;
    const silver = acc.silver_balance || 0;
    const frozen = acc.frozen || 0;
    const available = (acc.available != null ? acc.available : gold + silver - frozen);

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        balance: gold + silver,
        frozen,
        available: Math.max(0, available),
        gold_balance: gold,
        silver_balance: silver,
        publish_available: acc.publish_available != null ? acc.publish_available : Math.max(0, available),
        total_recharge: acc.total_recharge || 0,
        total_consume: acc.total_consume || 0,
        total_expired: acc.total_expired || 0,
      },
    };
  }
}

module.exports = CreditController;
