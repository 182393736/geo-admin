'use strict';
const Controller = require('egg').Controller;

/**
 * 品牌档案展示接口（建档结果页 / 概览页品牌卡 / 品牌名片）
 *  - GET /api/brand/summary  一次性聚合：品牌主档 + 画像 + 识别词 + 产品 + 竞品 + 监控问题
 *    支持 ?brand_id= 指定品牌；缺省取用户第一个启用品牌。
 */
class BrandController extends Controller {
  /** 取当前用户的目标品牌（?brand_id 优先，否则首个启用品牌） */
  async _resolveBrand(userId, brandId) {
    const { ctx } = this;
    const brands = await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    if (!brands.length) return null;
    return brands.find(b => b.brand_id === brandId) || brands[0];
  }

  async summary() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const brand = await this._resolveBrand(userId, ctx.query.brand_id);
    if (!brand) {
      // 无品牌：前端路由守卫会强制跳 /trial，这里给空数据兜底
      ctx.body = { code: 200, msg: 'ok', data: null };
      return;
    }
    const bid = brand.brand_id;

    const [profile, aliases, products, competitors, industryQueries, brandQueries] = await Promise.all([
      ctx.model.BrandProfile.findOne({ brand_id: bid }).lean(),
      ctx.model.BrandAlias.find({ brand_id: bid, enabled: true }).sort({ created_at: 1 }).lean(),
      ctx.model.BrandProduct.find({ brand_id: bid }).sort({ created_at: 1 }).lean(),
      ctx.model.CompetitorRegister.find({ brand_id: bid, enabled: true }).sort({ created_at: 1 }).lean(),
      ctx.model.MonitorQuery.find({ brand_id: bid, query_type: 'industry' })
        .sort({ query_order: 1, created_at: 1 }).lean(),
      ctx.model.MonitorQuery.find({ brand_id: bid, query_type: 'brand' })
        .sort({ query_order: 1, created_at: 1 }).lean(),
    ]);

    // 对齐前端 MonitorQuery 契约（/query/list 线上返回 id，即 query_id）
    const toQuery = m => ({
      id: m.query_id,
      query: m.query,
      query_type: m.query_type,
      query_status: !!m.query_status,
      query_is_execute: !!m.query_is_execute,
      weight: m.weight != null ? m.weight : 1,
      query_description: m.query_description || '',
      platform_prompt: m.platform_prompt || m.query,
    });

    ctx.body = {
      code: 200,
      msg: 'ok',
      data: {
        brand: {
          brand_id: brand.brand_id,
          name: brand.name,
          industry: brand.industry || '',
          website: brand.website || '',
          business_desc: brand.business_desc || '',
          status: brand.status,
          is_first_brand: !!brand.is_first_brand,
          rename_remaining: brand.rename_remaining != null ? brand.rename_remaining : 0,
          platforms: brand.platforms || [],
        },
        profile: profile ? {
          description: profile.description || '',
          slogan: profile.slogan || '',
          tone: profile.tone || null,
          scripts: profile.scripts || [],
        } : null,
        aliases: aliases.map(a => ({ alias: a.alias, source: a.source, enabled: !!a.enabled })),
        products: products.map(p => ({
          name: p.name, category: p.category || '',
          specs: p.specs || null, price_range: p.price_range || '',
        })),
        competitors: competitors.map(c => ({
          name: c.name, compet_point: c.compet_point || '', source: c.source,
        })),
        queries: {
          industry: industryQueries.map(toQuery),
          brand: brandQueries.map(toQuery),
        },
      },
    };
  }
}

module.exports = BrandController;
