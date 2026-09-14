'use strict';
const Controller = require('egg').Controller;

/**
 * 品牌档案展示接口（建档结果页 / 概览页品牌卡 / 品牌名片）
 *  - GET  /api/brand/summary?brand_id=  必填 brand_id
 *  - POST /api/brand/rename             修改识别词（正式名，限次）
 *  - POST /api/brand/aliases            覆盖相似识别词列表
 */
class BrandController extends Controller {
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

  async summary() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
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

  /**
   * 修改识别词（正式品牌名）
   * body: { brand_id, name }
   * - 限次：rename_remaining > 0，成功后 -1
   * - 旧名自动落入相似识别词（enabled），保证后续仍可命中
   */
  async rename() {
    const { ctx } = this;
    const body = ctx.request.body || {};
    const brand = await this._requireBrand(body.brand_id || ctx.query.brand_id);
    if (!brand) return;

    const name = String(body.name || '').trim();
    if (!name) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '新的品牌名不能为空' };
      return;
    }
    if (name.length > 60) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '品牌名过长（最多 60 字）' };
      return;
    }
    if (name === brand.name) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '新品牌名与当前相同' };
      return;
    }
    const remaining = brand.rename_remaining != null ? brand.rename_remaining : 0;
    if (remaining <= 0) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '修改次数已用尽' };
      return;
    }

    const oldName = brand.name;
    const updated = await ctx.model.Brand.findOneAndUpdate(
      { brand_id: brand.brand_id, user_id: ctx.state.user.id, rename_remaining: { $gt: 0 } },
      { $set: { name }, $inc: { rename_remaining: -1 } },
      { new: true },
    ).lean();
    if (!updated) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '修改失败，请重试' };
      return;
    }

    // 旧名保留为别名；若新名曾是别名则禁用，避免与正式名重复展示
    await Promise.all([
      ctx.model.BrandAlias.updateOne(
        { brand_id: brand.brand_id, alias: oldName },
        { $set: { brand_id: brand.brand_id, alias: oldName, source: 'manual', enabled: true } },
        { upsert: true },
      ),
      ctx.model.BrandAlias.updateOne(
        { brand_id: brand.brand_id, alias: name },
        { $set: { enabled: false } },
      ),
    ]);

    ctx.body = {
      code: 200,
      msg: 'ok',
      data: {
        name: updated.name,
        rename_remaining: updated.rename_remaining != null ? updated.rename_remaining : 0,
      },
    };
  }

  /**
   * 覆盖相似识别词
   * body: { brand_id, aliases: string[] }
   * - 去空、去重、排除与正式名相同的项
   * - 列表内：upsert enabled=true source=manual
   * - 原 enabled 但不在列表：enabled=false
   */
  async updateAliases() {
    const { ctx } = this;
    const body = ctx.request.body || {};
    const brand = await this._requireBrand(body.brand_id || ctx.query.brand_id);
    if (!brand) return;

    const raw = Array.isArray(body.aliases) ? body.aliases : [];
    const brandNameLower = String(brand.name || '').trim().toLowerCase();
    const seen = new Set();
    const next = [];
    for (const item of raw) {
      const alias = String(item || '').trim();
      if (!alias || alias.length > 60) continue;
      const key = alias.toLowerCase();
      if (key === brandNameLower) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(alias);
    }
    if (next.length > 50) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '别名过多（最多 50 个）' };
      return;
    }

    const bid = brand.brand_id;
    const existing = await ctx.model.BrandAlias.find({ brand_id: bid }).lean();
    const nextLower = new Set(next.map(a => a.toLowerCase()));

    await Promise.all([
      ...next.map(alias => ctx.model.BrandAlias.updateOne(
        { brand_id: bid, alias },
        { $set: { brand_id: bid, alias, source: 'manual', enabled: true } },
        { upsert: true },
      )),
      ...existing
        .filter(a => a.enabled && !nextLower.has(String(a.alias || '').toLowerCase()))
        .map(a => ctx.model.BrandAlias.updateOne(
          { brand_id: bid, alias: a.alias },
          { $set: { enabled: false } },
        )),
    ]);

    const rows = await ctx.model.BrandAlias.find({ brand_id: bid, enabled: true }).sort({ created_at: 1 }).lean();
    ctx.body = {
      code: 200,
      msg: 'ok',
      data: {
        aliases: rows.map(a => ({ alias: a.alias, source: a.source, enabled: !!a.enabled })),
      },
    };
  }
}

module.exports = BrandController;
