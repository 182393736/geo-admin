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
  async _resolveBrand(userId, brandId) {
    const { ctx } = this;
    const brands = await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    if (!brands.length) return null;
    return brands.find(b => b.brand_id === brandId) || brands[0];
  }

  async intro() {
    const { ctx } = this;
    const brand = await this._resolveBrand(ctx.state.user.id, ctx.query.brand_id);
    if (!brand) { ctx.body = { industry: [], website: '', slogan: '', tone: {}, description: '', scripts: '' }; return; }
    const profile = await ctx.model.BrandProfile.findOne({ brand_id: brand.brand_id }).lean();
    const scripts = profile && Array.isArray(profile.scripts) ? profile.scripts.join('\n') : '';
    ctx.body = {
      industry: brand.industry ? [brand.industry] : [],
      website: brand.website || '',
      slogan: profile ? (profile.slogan || '') : '',
      tone: (profile && profile.tone) ? profile.tone : {},
      description: profile ? (profile.description || '') : '',
      scripts,
    };
  }

  async aliases() {
    const { ctx } = this;
    const brand = await this._resolveBrand(ctx.state.user.id, ctx.query.brand_id);
    if (!brand) { ctx.body = { aliases: [] }; return; }
    const rows = await ctx.model.BrandAlias.find({ brand_id: brand.brand_id, enabled: true }).lean();
    ctx.body = { aliases: rows.map(a => a.alias) };
  }

  async competitors() {
    const { ctx } = this;
    const brand = await this._resolveBrand(ctx.state.user.id, ctx.query.brand_id);
    if (!brand) { ctx.body = []; return; }
    const rows = await ctx.model.CompetitorRegister.find({ brand_id: brand.brand_id, enabled: true }).lean();
    ctx.body = rows.map(c => ({ name: c.name }));
  }

  async products() {
    const { ctx } = this;
    const brand = await this._resolveBrand(ctx.state.user.id, ctx.query.brand_id);
    if (!brand) { ctx.body = []; return; }
    const rows = await ctx.model.BrandProduct.find({ brand_id: brand.brand_id }).lean();
    ctx.body = rows.map(p => ({ name: p.name, 来源: p.source || '品牌挖掘' }));
  }

  async _library(kind) {
    const { ctx } = this;
    const brand = await this._resolveBrand(ctx.state.user.id, ctx.query.brand_id);
    if (!brand) { ctx.body = []; return; }
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
    const brand = await this._resolveBrand(ctx.state.user.id, ctx.query.brand_id);
    const empty = { brand_present: false, company_present: false, brand_md: '', company_md: '', competitor: [], competitors: [] };
    if (!brand) { ctx.body = empty; return; }
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
    const uid = ctx.query.uid || ctx.state.user.id;
    const brandId = ctx.query.brand_id;
    const limit = Math.min(500, Math.max(1, parseInt(ctx.query.limit, 10) || 200));
    const q = { uid };
    if (brandId) q.brand_id = brandId;

    const [jobs, articles] = await Promise.all([
      ctx.model.WritingJob.find(q).lean(),
      ctx.model.ArticleGenerated.find(q).sort({ updated_at: -1 }).limit(limit).lean(),
    ]);
    const counters = { starting: 0, running: 0, awaiting_user: 0, completed: 0, failed: 0, cancelled: 0, all: jobs.length };
    for (const j of jobs) if (counters[j.status] != null) counters[j.status] += 1;
    const list = articles.map(a => ({
      article_id: a.article_id, job_id: a.job_id || null, title: a.title || '',
      word_count: a.word_count || 0, status: a.status,
      quality_report: a.quality_report || null, style_references: a.style_references || [],
      publish_order_nos: a.publish_order_nos || [],
      created_at: a.created_at, updated_at: a.updated_at,
    }));
    ctx.body = {
      uid, brand_id: brandId || null, total: list.length,
      counters,
      pagination: { page: 1, page_size: limit, total: list.length },
      list,
    };
  }
}

module.exports = BrandArticleController;
