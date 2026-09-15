'use strict';
const Controller = require('egg').Controller;

const RECHARGE_PACKS = [
  { pack_id: 1, credits: 500, price: 50 },
  { pack_id: 2, credits: 1000, price: 100 },
  { pack_id: 3, credits: 3000, price: 300 },
  { pack_id: 4, credits: 10000, price: 1000 },
  { pack_id: 5, credits: 30000, price: 3000 },
  { pack_id: 6, credits: 50000, price: 5000 },
];

/**
 * 积分钱包
 *  - GET  /credit/account
 *  - GET  /credit/transactions
 *  - GET  /credit/recharge/packs
 *  - POST /credit/recharge/create
 */
class CreditController extends Controller {
  async _ensureAccount(userId) {
    const { ctx } = this;
    let acc = await ctx.model.CreditAccount.findOne({ user_id: userId });
    if (!acc) {
      acc = await ctx.model.CreditAccount.create({
        user_id: userId,
        gold_balance: 0, silver_balance: 0, frozen: 0,
        available: 0, publish_available: 0,
        total_recharge: 0, total_consume: 0, total_expired: 0,
      });
    }
    return acc;
  }

  _fmtAccount(acc) {
    const gold = acc.gold_balance || 0;
    const silver = acc.silver_balance || 0;
    const frozen = acc.frozen || 0;
    const available = (acc.available != null ? acc.available : gold + silver - frozen);
    return {
      balance: gold + silver,
      frozen,
      available: Math.max(0, available),
      gold_balance: gold,
      silver_balance: silver,
      gold_available: gold,
      silver_available: silver,
      publish_available: acc.publish_available != null ? acc.publish_available : Math.max(0, available),
      total_recharge: acc.total_recharge || 0,
      total_consume: acc.total_consume || 0,
      total_expired: acc.total_expired || 0,
    };
  }

  async account() {
    const { ctx } = this;
    const acc = await this._ensureAccount(ctx.state.user.id);
    ctx.body = { code: 200, msg: 'ok', data: this._fmtAccount(acc) };
  }

  async transactions() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const page = Math.max(1, parseInt(ctx.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(ctx.query.page_size, 10) || 20));
    const type = ctx.query.type; // consume | obtain | all
    const q = { user_id: userId };
    if (type === 'consume') q.type = { $in: [ 'consume', 'freeze' ] };
    else if (type === 'obtain' || type === 'recharge') q.type = { $in: [ 'recharge', 'unfreeze', 'refund' ] };

    const [ total, rows ] = await Promise.all([
      ctx.model.CreditTransaction.countDocuments(q),
      ctx.model.CreditTransaction.find(q).sort({ created_at: -1 })
        .skip((page - 1) * pageSize).limit(pageSize).lean(),
    ]);

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(t => ({
          txn_id: t.txn_id,
          type: t.type,
          coin: t.coin || 'gold',
          amount: t.amount,
          balance_after: t.balance_after,
          ref_type: t.ref_type || '',
          ref_id: t.ref_id || '',
          remark: t.remark || '',
          title: this._txnTitle(t),
          created_at: t.created_at,
        })),
        total, page, page_size: pageSize,
      },
    };
  }

  _txnTitle(t) {
    if (t.remark) return String(t.remark).split('\n')[0];
    if (t.type === 'recharge') return '充值到账';
    if (t.type === 'consume') return '积分消耗';
    if (t.type === 'expired') return '积分过期';
    return t.type || '积分变动';
  }

  async rechargePacks() {
    const { ctx } = this;
    ctx.body = {
      code: 200, msg: 'ok',
      data: RECHARGE_PACKS.map(p => ({
        ...p,
        unit_price: +(p.price / p.credits).toFixed(2),
      })),
    };
  }

  async rechargeCreate() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const body = ctx.request.body || {};
    const pack = RECHARGE_PACKS.find(p => p.pack_id === Number(body.pack_id));
    if (!pack) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '充值包不存在' };
      return;
    }

    const ts = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
    const orderNo = `CR${stamp}${Math.floor(Math.random() * 900000 + 100000)}`;
    const expireTime = new Date(Date.now() + 15 * 60 * 1000);

    await ctx.model.PaymentOrder.create({
      order_no: orderNo,
      user_id: userId,
      brand_id: body.brand_id || '',
      order_category: 'recharge',
      pay_method: 'wx',
      credit_amount: pack.credits,
      pack_id: pack.pack_id,
      plan_name: `充值 ${pack.credits} 积分`,
      original_price: pack.price,
      price: pack.price,
      pay_amount: pack.price,
      status: 'pending',
      expire_time: expireTime,
      client_ip: ctx.ip,
      order_type: 'new',
      wx_code_url: `mock://wxpay/${orderNo}`,
      remark: `购买积分 ${pack.credits}`,
    });

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        order_no: orderNo,
        status: 'pending',
        pack_id: pack.pack_id,
        credits: pack.credits,
        price: pack.price,
        expire_time: expireTime.toISOString(),
        code_url: `mock://wxpay/${orderNo}`,
        mock_pay: true,
      },
    };
  }
}

module.exports = CreditController;
