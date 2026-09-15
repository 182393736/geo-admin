'use strict';
const Controller = require('egg').Controller;
const crypto = require('crypto');

/**
 * 套餐 / 订阅 / 下单
 *  - GET  /payment/plans/grouped
 *  - GET  /payment/subscription/current
 *  - GET  /payment/orders
 *  - POST /payment/order/create          现金(wx) 或 积分支付
 *  - GET  /payment/order/:order_no       轮询订单
 *  - POST /payment/order/:order_no/mock-pay  本地模拟微信支付成功
 */
class PaymentController extends Controller {
  async _requireBrand(brandId) {
    const { ctx } = this;
    try {
      return await ctx.service.brandScope.requireBrand(ctx.state.user.id, brandId);
    } catch (e) {
      ctx.status = e.status || 400;
      ctx.body = { code: e.code || e.status || 400, msg: e.message };
      return null;
    }
  }

  _fmtPlan(p) {
    const price = p.price != null ? p.price : 0;
    return {
      id: p.plan_id, plan_code: p.plan_code, plan_name: p.plan_name, plan_type: p.plan_type,
      billing_cycle: p.billing_cycle, duration_days: p.duration_days || 0,
      original_price: p.original_price != null ? p.original_price : 0,
      price,
      credit_price: p.credit_price != null ? p.credit_price : Math.round(price * 10),
      discount_rate: (p.original_price > 0 && price < p.original_price)
        ? Math.round((price / p.original_price) * 100) / 100
        : 1,
      query_limit: p.query_limit || 0,
      platform_list: p.platform_list || [],
      platform_scope: p.platform_scope || 'pc',
      features: p.features || null,
      sort: p.sort || 0, on_sale: p.on_sale !== false,
    };
  }

  _orderNo(prefix = 'CP') {
    const ts = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
    return `${prefix}${stamp}${Math.floor(Math.random() * 900000 + 100000)}`;
  }

  async plansGrouped() {
    const { ctx } = this;
    const plans = await ctx.model.Plan.find({ on_sale: { $ne: false } })
      .sort({ sort: 1, plan_id: 1 }).lean();
    const grouped = { free: [], starter: [], basic: [], pro: [], custom: [] };
    for (const p of plans) {
      const key = p.plan_type || 'custom';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(this._fmtPlan(p));
    }
    ctx.body = { code: 200, msg: 'ok', data: grouped };
  }

  async subscriptionCurrent() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;

    let sub = await ctx.service.brandScope.ensureFreeSubscription(userId, brand);
    if (sub && sub.toObject) sub = sub.toObject();

    const queryCount = await ctx.model.MonitorQuery.countDocuments({ brand_id: brand.brand_id, query_status: true });
    const limit = sub.query_limit || 0;
    const remainingDays = sub.expire_date
      ? Math.max(0, Math.ceil((new Date(sub.expire_date).getTime() - Date.now()) / 86400000))
      : 0;

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        vip_level: sub.vip_level,
        plan_code: sub.plan_code,
        plan_name: sub.plan_name,
        start_date: sub.start_date || '',
        expire_date: sub.expire_date || '',
        remaining_days: remainingDays,
        query_limit: limit,
        query_count: queryCount,
        query_remaining: Math.max(0, limit - queryCount),
        platform_list: sub.platform_list || [],
        status: sub.status,
      },
    };
  }

  async orders() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const limit = Math.min(100, Math.max(1, parseInt(ctx.query.limit, 10) || 20));
    const rows = await ctx.model.PaymentOrder.find({ user_id: userId })
      .sort({ created_at: -1 }).limit(limit).lean();
    ctx.body = {
      code: 200, msg: 'ok',
      data: rows.map(o => ({
        id: o.id || o._id, order_no: o.order_no, order_category: o.order_category,
        plan_name: o.plan_name || '', price: o.price, pay_amount: o.pay_amount,
        status: o.status, created_at: o.created_at, paid_at: o.paid_at || null,
      })),
    };
  }

  async _activatePlan(userId, brand, plan, order) {
    const { ctx } = this;
    const dayjs = require('dayjs');
    const start = dayjs().format('YYYY-MM-DD');
    const days = plan.duration_days || 30;
    const expire = dayjs().add(days, 'day').format('YYYY-MM-DD');
    const platforms = (plan.platform_list && plan.platform_list.length)
      ? plan.platform_list
      : (ctx.app.config.platforms || [ 'doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao' ]);

    await ctx.model.Subscription.updateMany(
      { brand_id: brand.brand_id, status: 'active' },
      { $set: { status: 'expired' } },
    );

    const seq = await ctx.service.brandScope._nextSeq('subscription');
    await ctx.model.Subscription.create({
      subscription_id: seq,
      user_id: userId,
      brand_id: brand.brand_id,
      plan_id: plan.plan_id,
      plan_code: plan.plan_code,
      plan_name: plan.plan_name,
      vip_level: plan.plan_type,
      start_date: start,
      expire_date: expire,
      query_limit: plan.query_limit || 0,
      query_count: 0,
      platform_list: platforms,
      status: 'active',
    });

    order.status = 'paid';
    order.paid_at = new Date();
    await order.save();
  }

  async _ensureCreditAccount(userId) {
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

  async _writeTxn(userId, type, amount, balanceAfter, refType, refId, remark) {
    const { ctx } = this;
    await ctx.model.CreditTransaction.create({
      txn_id: crypto.randomUUID(),
      user_id: userId,
      type,
      coin: 'gold',
      amount,
      balance_after: balanceAfter,
      ref_type: refType,
      ref_id: refId,
      remark,
    });
  }

  async orderCreate() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const body = ctx.request.body || {};
    const brand = await this._requireBrand(body.brand_id || ctx.query.brand_id);
    if (!brand) return;

    const plan = await ctx.model.Plan.findOne({
      $or: [
        { plan_code: body.plan_code },
        { plan_id: Number(body.plan_id) || -1 },
      ],
      on_sale: { $ne: false },
    }).lean();
    if (!plan) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '套餐不存在' };
      return;
    }

    const payMethod = body.pay_method === 'credit' ? 'credit' : 'wx';
    const price = plan.price || 0;
    const creditPrice = plan.credit_price != null ? plan.credit_price : Math.round(price * 10);
    const orderNo = this._orderNo('CP');
    const expireTime = new Date(Date.now() + 15 * 60 * 1000);

    const order = await ctx.model.PaymentOrder.create({
      order_no: orderNo,
      user_id: userId,
      brand_id: brand.brand_id,
      order_category: 'plan',
      pay_method: payMethod,
      credit_amount: payMethod === 'credit' ? creditPrice : 0,
      plan_id: plan.plan_id,
      plan_code: plan.plan_code,
      plan_name: plan.plan_name,
      duration_days: plan.duration_days || 0,
      query_limit: plan.query_limit || 0,
      original_price: plan.original_price || price,
      price,
      pay_amount: payMethod === 'credit' ? creditPrice : price,
      status: 'pending',
      expire_time: expireTime,
      client_ip: ctx.ip,
      order_type: body.order_type || 'new',
      wx_code_url: payMethod === 'wx' ? `mock://wxpay/${orderNo}` : '',
    });

    if (payMethod === 'credit') {
      const acc = await this._ensureCreditAccount(userId);
      const available = acc.available != null
        ? acc.available
        : (acc.gold_balance || 0) + (acc.silver_balance || 0) - (acc.frozen || 0);
      if (available < creditPrice) {
        order.status = 'closed';
        await order.save();
        ctx.status = 400;
        ctx.body = { code: 400, msg: '积分不足', data: { need: creditPrice, available: Math.max(0, available) } };
        return;
      }
      acc.gold_balance = Math.max(0, (acc.gold_balance || 0) - creditPrice);
      acc.available = Math.max(0, available - creditPrice);
      acc.total_consume = (acc.total_consume || 0) + creditPrice;
      await acc.save();
      await this._writeTxn(userId, 'consume', -creditPrice, acc.available, 'plan', orderNo,
        `开通套餐 · ${plan.plan_name} · ${brand.name || brand.brand_id}`);
      await this._activatePlan(userId, brand, plan, order);
      ctx.body = {
        code: 200, msg: 'ok',
        data: {
          order_no: orderNo, status: 'paid', pay_method: 'credit',
          plan_code: plan.plan_code, plan_name: plan.plan_name,
          price, credit_price: creditPrice, paid_at: order.paid_at,
        },
      };
      return;
    }

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        order_no: orderNo,
        status: 'pending',
        pay_method: 'wx',
        plan_code: plan.plan_code,
        plan_name: plan.plan_name,
        plan_type: plan.plan_type,
        price,
        credit_price: creditPrice,
        query_limit: plan.query_limit || 0,
        duration_days: plan.duration_days || 0,
        expire_time: expireTime.toISOString(),
        code_url: order.wx_code_url,
        mock_pay: true,
      },
    };
  }

  async orderGet() {
    const { ctx } = this;
    const orderNo = ctx.params.order_no;
    const order = await ctx.model.PaymentOrder.findOne({
      order_no: orderNo, user_id: ctx.state.user.id,
    }).lean();
    if (!order) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '订单不存在' };
      return;
    }
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        order_no: order.order_no,
        status: order.status,
        pay_method: order.pay_method,
        plan_code: order.plan_code,
        plan_name: order.plan_name,
        price: order.price,
        pay_amount: order.pay_amount,
        expire_time: order.expire_time,
        paid_at: order.paid_at || null,
        code_url: order.wx_code_url || '',
      },
    };
  }

  async orderMockPay() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const order = await ctx.model.PaymentOrder.findOne({
      order_no: ctx.params.order_no, user_id: userId,
    });
    if (!order) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '订单不存在' };
      return;
    }
    if (order.status === 'paid') {
      ctx.body = { code: 200, msg: 'ok', data: { order_no: order.order_no, status: 'paid' } };
      return;
    }
    if (order.status !== 'pending') {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '订单状态不可支付' };
      return;
    }

    if (order.order_category === 'recharge') {
      const packCredits = order.credit_amount || 0;
      const acc = await this._ensureCreditAccount(userId);
      acc.gold_balance = (acc.gold_balance || 0) + packCredits;
      acc.available = (acc.available != null ? acc.available : 0) + packCredits;
      acc.publish_available = (acc.publish_available != null ? acc.publish_available : 0) + packCredits;
      acc.total_recharge = (acc.total_recharge || 0) + packCredits;
      await acc.save();
      await this._writeTxn(userId, 'recharge', packCredits, acc.available, 'recharge', order.order_no, '充值到账');
      order.status = 'paid';
      order.paid_at = new Date();
      await order.save();
    } else {
      const brand = await this._requireBrand(order.brand_id);
      if (!brand) return;
      const plan = await ctx.model.Plan.findOne({ plan_code: order.plan_code }).lean();
      if (!plan) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '套餐不存在' };
        return;
      }
      await this._activatePlan(userId, brand, plan, order);
    }

    ctx.body = { code: 200, msg: 'ok', data: { order_no: order.order_no, status: 'paid', paid_at: order.paid_at } };
  }
}

module.exports = PaymentController;
