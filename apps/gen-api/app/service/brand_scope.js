'use strict';
/**
 * 品牌作用域：多品牌请求必须显式 brand_id，禁止静默回落到 brands[0]。
 *  - requireBrand：空 → 400；非本人/禁用 → 403
 *  - resolveBrandOptional：info 等兼容缺省（仅缺省时用首个品牌）
 *  - ensureFreeSubscription：建档后幂等开通免费体验版
 */
const { Service } = require('egg');

function scopeError(status, msg) {
  const err = new Error(msg);
  err.status = status;
  err.code = status;
  return err;
}

class BrandScopeService extends Service {
  async requireBrand(userId, brandId) {
    const id = brandId != null ? String(brandId).trim() : '';
    if (!id) throw scopeError(400, 'brand_id 必填');
    const brand = await this.ctx.model.Brand.findOne({
      brand_id: id,
      user_id: userId,
      status: { $ne: 'disabled' },
    }).lean();
    if (!brand) throw scopeError(403, '品牌不存在或无权访问');
    return brand;
  }

  /** 仅 /user/info 等兼容路径：有 brand_id 则强制校验，无则取首个启用品牌 */
  async resolveBrandOptional(userId, brandId) {
    const id = brandId != null ? String(brandId).trim() : '';
    if (id) return this.requireBrand(userId, id);
    return this.ctx.model.Brand.findOne({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
  }

  async _nextSeq(name) {
    const coll = this.app.mongoose.connection.db.collection('counters');
    const r = await coll.findOneAndUpdate(
      { _id: name }, { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );
    const doc = r && r.value ? r.value : r;
    return doc.seq;
  }

  /**
   * 品牌列表摘要（登录 / GET /user/brands 同款）：含 vip 档位与过期日，供侧栏切换面板。
   * 尚未开通订阅时按「免费体验版」语义返回 vip_level=free。
   */
  async brandBriefs(brands) {
    const { ctx } = this;
    if (!brands || !brands.length) return [];
    const ids = brands.map(b => b.brand_id);
    const [subs, aliasRows] = await Promise.all([
      ctx.model.Subscription.find({ brand_id: { $in: ids }, status: 'active' }).sort({ created_at: -1 }).lean(),
      ctx.model.BrandAlias.find({ brand_id: { $in: ids }, enabled: true }).lean(),
    ]);
    const subMap = {};
    for (const s of subs) if (!subMap[s.brand_id]) subMap[s.brand_id] = s;
    const aliasMap = {};
    for (const a of aliasRows) (aliasMap[a.brand_id] ||= []).push(a.alias);
    return brands.map(b => {
      const sub = subMap[b.brand_id];
      return {
        brand_id: b.brand_id,
        name: b.name,
        industry: b.industry || '',
        vip_level: sub ? (sub.vip_level || 'free') : 'free',
        vip_plan_code: sub ? (sub.plan_code || '') : '',
        vip_expire_date: sub ? (sub.expire_date || '') : '',
        status: b.status,
        platforms: b.platforms || [],
        aliases: aliasMap[b.brand_id] || [],
        is_first_brand: !!b.is_first_brand,
        rename_remaining: b.rename_remaining != null ? b.rename_remaining : 0,
        created_at: b.created_at,
      };
    });
  }

  /**
   * 幂等：品牌无 active 订阅时开通免费体验版（对齐 payment.subscriptionCurrent）
   * @returns {object|null} subscription lean/doc
   */
  async ensureFreeSubscription(userId, brand) {
    const { ctx } = this;
    if (!brand || !brand.brand_id) return null;
    let sub = await ctx.model.Subscription.findOne({ brand_id: brand.brand_id, status: 'active' })
      .sort({ created_at: -1 }).lean();
    if (sub) return sub;

    const free = await ctx.model.Plan.findOne({ plan_code: 'free' }).lean();
    const dayjs = ctx.app.dayjs ? ctx.app.dayjs() : require('dayjs')();
    const start = dayjs.format('YYYY-MM-DD');
    const expire = dayjs.add(free && free.duration_days ? free.duration_days : 30, 'day').format('YYYY-MM-DD');
    const platforms = (brand.platforms && brand.platforms.length)
      ? brand.platforms
      : (ctx.app.config.platforms || ['doubao', 'deepseek', 'wenxin', 'yuanbao']);
    sub = await ctx.model.Subscription.create({
      subscription_id: await this._nextSeq('subscription'),
      user_id: userId,
      brand_id: brand.brand_id,
      plan_id: free ? free.plan_id : null,
      plan_code: free ? free.plan_code : 'free',
      plan_name: free ? free.plan_name : '免费体验版',
      vip_level: 'free',
      start_date: start,
      expire_date: expire,
      query_limit: free ? (free.query_limit || 8) : 8,
      query_count: 0,
      platform_list: free ? platforms.slice(0, 3) : platforms,
      status: 'active',
    });
    return sub;
  }
}

module.exports = BrandScopeService;
