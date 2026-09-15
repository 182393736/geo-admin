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
          id: String(c._id),
          name: c.name,
          compet_point: c.compet_point || '',
          source: c.source,
          aliases: Array.isArray(c.aliases) ? c.aliases.filter(Boolean) : [],
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

  _normalizeAliases(raw, excludeName) {
    const exclude = String(excludeName || '').trim().toLowerCase();
    const seen = new Set();
    const next = [];
    const list = Array.isArray(raw) ? raw : [];
    for (const item of list) {
      const alias = String(item || '').trim();
      if (!alias || alias.length > 60) continue;
      const key = alias.toLowerCase();
      if (exclude && key === exclude) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(alias);
    }
    return next.slice(0, 50);
  }

  _competitorPayload(row) {
    return {
      id: String(row._id),
      name: row.name || '',
      compet_point: row.compet_point || '',
      source: row.source || '用户登记',
      aliases: Array.isArray(row.aliases) ? row.aliases.filter(Boolean) : [],
      enabled: !!row.enabled,
    };
  }

  /** POST /api/brand/competitors  新增竞品 */
  async createCompetitor() {
    const { ctx } = this;
    const body = ctx.request.body || {};
    const brand = await this._requireBrand(body.brand_id || ctx.query.brand_id);
    if (!brand) return;

    const name = String(body.name || '').trim();
    if (!name) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '竞品名不能为空' };
      return;
    }
    if (name.length > 60) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '竞品名过长（最多 60 字）' };
      return;
    }
    if (name.toLowerCase() === String(brand.name || '').trim().toLowerCase()) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '竞品名不能与本品牌相同' };
      return;
    }

    const aliases = this._normalizeAliases(body.aliases, name);
    const compet_point = String(body.compet_point || '').trim().slice(0, 500);

    const existing = await ctx.model.CompetitorRegister.findOne({
      brand_id: brand.brand_id,
      name,
    }).lean();
    if (existing && existing.enabled) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '该竞品已存在' };
      return;
    }

    const row = existing
      ? await ctx.model.CompetitorRegister.findOneAndUpdate(
        { _id: existing._id },
        {
          $set: {
            name,
            compet_point,
            aliases,
            source: '用户登记',
            enabled: true,
          },
        },
        { new: true },
      ).lean()
      : (await ctx.model.CompetitorRegister.create({
        brand_id: brand.brand_id,
        name,
        compet_point,
        aliases,
        source: '用户登记',
        enabled: true,
      })).toObject();

    ctx.body = { code: 200, msg: 'ok', data: this._competitorPayload(row) };
  }

  /** PUT /api/brand/competitors  更新竞品（名称 / 竞争点 / 别名） */
  async updateCompetitor() {
    const { ctx } = this;
    const body = ctx.request.body || {};
    const brand = await this._requireBrand(body.brand_id || ctx.query.brand_id);
    if (!brand) return;

    const id = String(body.id || body.competitor_id || '').trim();
    if (!id) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '缺少竞品 id' };
      return;
    }

    const current = await ctx.model.CompetitorRegister.findOne({
      _id: id,
      brand_id: brand.brand_id,
      enabled: true,
    }).lean();
    if (!current) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '竞品不存在' };
      return;
    }

    const patch = {};
    if (Object.prototype.hasOwnProperty.call(body, 'name')) {
      const name = String(body.name || '').trim();
      if (!name) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '竞品名不能为空' };
        return;
      }
      if (name.length > 60) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '竞品名过长（最多 60 字）' };
        return;
      }
      if (name.toLowerCase() === String(brand.name || '').trim().toLowerCase()) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '竞品名不能与本品牌相同' };
        return;
      }
      const clash = await ctx.model.CompetitorRegister.findOne({
        brand_id: brand.brand_id,
        name,
        enabled: true,
        _id: { $ne: current._id },
      }).lean();
      if (clash) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '该竞品名已存在' };
        return;
      }
      patch.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'compet_point')) {
      patch.compet_point = String(body.compet_point || '').trim().slice(0, 500);
    }
    if (Object.prototype.hasOwnProperty.call(body, 'aliases')) {
      const nextName = patch.name || current.name;
      patch.aliases = this._normalizeAliases(body.aliases, nextName);
    }

    if (!Object.keys(patch).length) {
      ctx.body = { code: 200, msg: 'ok', data: this._competitorPayload(current) };
      return;
    }

    const row = await ctx.model.CompetitorRegister.findOneAndUpdate(
      { _id: current._id, brand_id: brand.brand_id },
      { $set: patch },
      { new: true },
    ).lean();

    ctx.body = { code: 200, msg: 'ok', data: this._competitorPayload(row) };
  }

  /** DELETE /api/brand/competitors  删除竞品（软删） */
  async deleteCompetitor() {
    const { ctx } = this;
    const body = ctx.request.body || {};
    const brand = await this._requireBrand(body.brand_id || ctx.query.brand_id);
    if (!brand) return;

    const id = String(body.id || body.competitor_id || '').trim();
    if (!id) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '缺少竞品 id' };
      return;
    }

    const row = await ctx.model.CompetitorRegister.findOneAndUpdate(
      { _id: id, brand_id: brand.brand_id, enabled: true },
      { $set: { enabled: false } },
      { new: true },
    ).lean();
    if (!row) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '竞品不存在' };
      return;
    }

    ctx.body = { code: 200, msg: 'ok', data: { id } };
  }
}

module.exports = BrandController;
