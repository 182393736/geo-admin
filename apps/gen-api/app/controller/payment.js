'use strict';
const Controller = require('egg').Controller;

/**
 * 套餐 / 订阅（采集前即需真实展示：套餐页价目 + 当前订阅卡）
 *  - GET /payment/plans/grouped        按 plan_type 分组的价目表（种子数据，app.js 幂等灌注）
 *  - GET /payment/subscription/current 当前品牌订阅；无订阅时自动开通「免费体验版」（幂等）
 *  - GET /payment/orders?limit=20      充值/套餐/诊断订单（采集前为空列表）
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
    return {
      id: p.plan_id, plan_code: p.plan_code, plan_name: p.plan_name, plan_type: p.plan_type,
      billing_cycle: p.billing_cycle, duration_days: p.duration_days || 0,
      original_price: p.original_price != null ? p.original_price : 0,
      price: p.price != null ? p.price : 0,
      credit_price: p.credit_price != null ? p.credit_price : (p.price != null ? p.price : 0),
      query_limit: p.query_limit || 0, features: p.features || null,
      sort: p.sort || 0, on_sale: p.on_sale !== false,
    };
  }

  async plansGrouped() {
    const { ctx } = this;
    const plans = await ctx.model.Plan.find({ on_sale: { $ne: false } })
      .sort({ sort: 1, plan_id: 1 }).lean();
    const grouped = { free: [], starter: [], pro: [], custom: [] };
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

    // 无订阅 → 自动开通免费体验版（幂等）
    let sub = await ctx.service.brandScope.ensureFreeSubscription(userId, brand);
    if (sub && sub.toObject) sub = sub.toObject();

    // query_count 冗余字段随监控问题实时刷新（采集前=建档生成的问题数）
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
}

module.exports = PaymentController;
