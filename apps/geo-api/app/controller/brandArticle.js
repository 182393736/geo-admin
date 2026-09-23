'use strict';
const Controller = require('egg').Controller;

/**
 * 品牌·内容域（对齐 geoarticle.timus.cn：无 {code,msg,data} 壳、raw 返回、带 /api 前缀）
 *  - GET /api/brand/intro|aliases|competitors|products
 *  - GET /api/brand/library/text|links|docs
 *  - GET /api/brand/wiki/tree
 *  - GET /api/articles?uid=&brand_id=&kind=writing&limit=200
 * 响应形状逐字段对齐 2026-09-11 抓包（见 /home/user/geo_login/endpoints_detail.json）：
 *  - intro       { industry:[], website, slogan, tone:{}, description, scripts }（scripts 为字符串）
 *  - aliases     { aliases:[] }
 *  - competitors [ { name } ]（裸数组）
 *  - products    [ { name, 来源 } ]（裸数组，键为中文「来源」）
 *  - library/*   []（裸数组；空库即空数组）
 *  - wiki/tree   { brand_present, company_present, brand_md, company_md, competitor:[], competitors:[] }
 *  - articles    { uid, brand_id, total, counters:{starting,running,awaiting_user,completed,failed,cancelled,all}, pagination:{}, list:[] }
 */
class BrandArticleController extends Controller {
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

  _introPayload(brand, profile) {
    const profileIndustry = profile && Array.isArray(profile.industry)
      ? profile.industry.map(s => String(s || '').trim()).filter(Boolean)
      : [];
    const industry = profileIndustry.length
      ? profileIndustry
      : (brand.industry ? [brand.industry] : []);
    const scripts = profile && Array.isArray(profile.scripts) ? profile.scripts.join('\n') : '';
    return {
      industry,
      website: (profile && profile.website) || brand.website || '',
      slogan: profile ? (profile.slogan || '') : '',
      tone: (profile && profile.tone) ? profile.tone : {},
      description: profile
        ? (profile.description || '')
        : (brand.business_desc || ''),
      scripts,
      updated_at: (profile && profile.updated_at) || brand.updated_at || null,
      exists: !!(profile && profile.exists !== false),
      seeded_from_db: !!(profile && profile.seeded_from_db),
    };
  }

  async intro() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const profile = await ctx.model.BrandProfile.findOne({ brand_id: brand.brand_id }).lean();
    ctx.body = this._introPayload(brand, profile);
  }

  /**
   * 编辑档案失焦保存（对标 geoarticle PATCH /api/brand/intro）
   * body 可部分提交：{ brand_id, industry?: string[], website?: string, description?: string }
   */
  async updateIntro() {
    const { ctx } = this;
    const body = ctx.request.body || {};
    const brand = await this._requireBrand(body.brand_id || ctx.query.brand_id);
    if (!brand) return;

    const brandSet = {};
    const profileSet = {};
    let touched = false;

    if (Object.prototype.hasOwnProperty.call(body, 'industry')) {
      let industry = [];
      if (Array.isArray(body.industry)) {
        industry = body.industry.map(s => String(s || '').trim()).filter(Boolean);
      } else if (body.industry != null) {
        industry = String(body.industry)
          .split(/[·•、,，|/]+/)
          .map(s => s.trim())
          .filter(Boolean);
      }
      if (industry.length > 20) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '行业标签过多（最多 20 个）' };
        return;
      }
      profileSet.industry = industry;
      brandSet.industry = industry.join(' · ');
      touched = true;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'website')) {
      const website = String(body.website || '').trim();
      if (website.length > 300) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '官网链接过长' };
        return;
      }
      profileSet.website = website;
      brandSet.website = website;
      touched = true;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'description')) {
      const description = String(body.description || '').trim();
      if (description.length > 2000) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '品牌简介过长（最多 2000 字）' };
        return;
      }
      profileSet.description = description;
      brandSet.business_desc = description;
      touched = true;
    }

    if (!touched) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '没有可更新的字段' };
      return;
    }

    const bid = brand.brand_id;
    const [updatedBrand, profile] = await Promise.all([
      Object.keys(brandSet).length
        ? ctx.model.Brand.findOneAndUpdate(
          { brand_id: bid, user_id: ctx.state.user.id },
          { $set: brandSet },
          { new: true },
        ).lean()
        : Promise.resolve(brand),
      ctx.model.BrandProfile.findOneAndUpdate(
        { brand_id: bid },
        {
          $set: { ...profileSet, brand_id: bid, exists: true },
          $setOnInsert: { seeded_from_db: false },
        },
        { new: true, upsert: true },
      ).lean(),
    ]);

    ctx.body = this._introPayload(updatedBrand || brand, profile);
  }

  async aliases() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const rows = await ctx.model.BrandAlias.find({ brand_id: brand.brand_id, enabled: true }).lean();
    ctx.body = { aliases: rows.map(a => a.alias) };
  }

  async competitors() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const rows = await ctx.model.CompetitorRegister.find({ brand_id: brand.brand_id, enabled: true })
      .sort({ created_at: 1 }).lean();
    ctx.body = rows.map(c => ({
      id: String(c._id),
      name: c.name,
      compet_point: c.compet_point || '',
      aliases: Array.isArray(c.aliases) ? c.aliases.filter(Boolean) : [],
      source: c.source || '',
    }));
  }

  async products() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const rows = await ctx.model.BrandProduct.find({ brand_id: brand.brand_id }).lean();
    ctx.body = rows.map(p => ({ name: p.name, 来源: p.source || '品牌挖掘' }));
  }

  async _library(kind) {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const rows = await ctx.model.BrandLibrary.find({ brand_id: brand.brand_id, kind }).sort({ created_at: -1 }).lean();
    ctx.body = rows.map(r => ({
      slug: r.slug || null, title: r.title || null, tags: r.tags || [],
      source: r.source || null, word_count: r.word_count || 0,
      url: r.url || null, content: r.content || null, meta: r.meta || null,
    }));
  }
  async libraryText() { await this._library('text'); }
  async libraryLinks() { await this._library('link'); }
  async libraryDocs() { await this._library('doc'); }

  async wikiTree() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const rows = await ctx.model.BrandWiki.find({ brand_id: brand.brand_id }).lean();
    const mdOf = scope => {
      const r = rows.find(x => x.scope === scope);
      return r ? (r.markdown || '') : '';
    };
    const brandMd = mdOf('brand');
    const companyMd = mdOf('company');
    const comp = rows.filter(x => x.scope === 'competitor');
    ctx.body = {
      brand_present: !!brandMd,
      company_present: !!companyMd,
      brand_md: brandMd,
      company_md: companyMd,
      competitor: comp.map(r => ({ path: r.path, markdown: r.markdown })),
      competitors: comp.map(r => ({ path: r.path, markdown: r.markdown })),
    };
  }

  async articles() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id);
    if (!brand) return;
    const uid = ctx.query.uid || ctx.state.user.id;
    const brandId = brand.brand_id;
    const kind = String(ctx.query.kind || 'writing').trim() || 'writing';
    const limit = Math.min(500, Math.max(1, parseInt(ctx.query.limit, 10) || 200));
    const q = { uid, brand_id: brandId };

    const [jobs, histories, articles] = await Promise.all([
      ctx.model.WritingJob.find(q).sort({ updated_at: -1 }).limit(limit).lean(),
      kind === 'writing'
        ? ctx.model.AgentHistory.find({ ...q, kind: 'writing' }).sort({ updated_at: -1 }).limit(limit).lean()
        : Promise.resolve([]),
      ctx.model.ArticleGenerated.find(q).sort({ updated_at: -1 }).limit(limit).lean(),
    ]);

    const itemsMap = new Map();
    for (const j of jobs) {
      const progress = j.status === 'completed' ? 100
        : j.status === 'awaiting_user' ? 5
          : j.status === 'running' ? 45
            : j.status === 'starting' ? 10
              : 0;
      itemsMap.set(j.job_id, {
        run_id: j.job_id,
        job_id: j.job_id,
        title: j.topic || '',
        topic: j.topic || '',
        slug: null,
        status: j.status || 'starting',
        progress_percent: progress,
        generate_mode: (j.evidence_ids && j.evidence_ids.length) ? 'evidence' : null,
        updated_at: j.updated_at,
        created_at: j.created_at,
        source: 'writing_job',
      });
    }
    for (const h of histories) {
      const payload = h.payload || {};
      const sid = h.session_id;
      if (!sid || itemsMap.has(sid)) continue;
      const status = payload.ended ? 'completed'
        : (payload.status === 'completed' ? 'completed'
          : (payload.status === 'running' ? 'running' : 'awaiting_user'));
      itemsMap.set(sid, {
        run_id: sid,
        job_id: sid,
        title: payload.title || payload.prompt || '',
        topic: payload.prompt || '',
        slug: null,
        status,
        progress_percent: payload.progress != null ? payload.progress : (status === 'completed' ? 100 : 5),
        generate_mode: null,
        updated_at: h.updated_at,
        created_at: h.created_at,
        source: 'agent_history',
      });
    }

    const items = Array.from(itemsMap.values())
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      .slice(0, limit);

    const counters = { starting: 0, running: 0, awaiting_user: 0, completed: 0, failed: 0, cancelled: 0, all: items.length };
    for (const it of items) {
      if (counters[it.status] != null) counters[it.status] += 1;
    }

    const list = articles.map(a => ({
      article_id: a.article_id, job_id: a.job_id || null, title: a.title || '',
      word_count: a.word_count || 0, status: a.status,
      quality_report: a.quality_report || null, style_references: a.style_references || [],
      publish_order_nos: a.publish_order_nos || [],
      created_at: a.created_at, updated_at: a.updated_at,
    }));

    ctx.body = {
      uid, brand_id: brandId || null, kind,
      total: items.length,
      counters,
      pagination: { page: 1, page_size: limit, total: items.length },
      items,
      list,
    };
  }

  /** DELETE /api/articles/:run_id — 删除写作会话 / 稿件 */
  async deleteArticle() {
    const { ctx } = this;
    const brand = await this._requireBrand(ctx.query.brand_id || (ctx.request.body || {}).brand_id);
    if (!brand) return;
    const uid = ctx.state.user.id;
    const runId = String(ctx.params.run_id || '').trim();
    if (!runId) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'run_id required' };
      return;
    }
    const brandId = brand.brand_id;
    const [jobDel, histDel, artDel] = await Promise.all([
      ctx.model.WritingJob.deleteMany({ uid, brand_id: brandId, job_id: runId }),
      ctx.model.AgentHistory.deleteMany({ uid, brand_id: brandId, session_id: runId }),
      ctx.model.ArticleGenerated.deleteMany({ uid, brand_id: brandId, $or: [{ job_id: runId }, { article_id: runId }] }),
    ]);
    const deleted = (jobDel.deletedCount || 0) + (histDel.deletedCount || 0) + (artDel.deletedCount || 0);
    if (!deleted) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: 'not found' };
      return;
    }
    ctx.body = { ok: true, run_id: runId, deleted };
  }
}

module.exports = BrandArticleController;
