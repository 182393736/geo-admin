'use strict';

/**
 * 【临时】生产 CMS 空库灌数 — 用完即删本文件 + router 对应行
 * POST /api/admin/_tmp_seed_prod_geo_empty
 * Header: X-Cms-Seed-Token: SEED_PROD_GEO_EMPTY_ONCE
 */
const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;

const SEED_TOKEN = 'SEED_PROD_GEO_EMPTY_ONCE';
const DOMAIN = 'geo.hanyuai.com';

class TmpSeedController extends Controller {
  async seedProdGeoEmpty() {
    const { ctx, app } = this;
    const token = ctx.get('x-cms-seed-token') || String(ctx.query.token || '');
    if (token !== SEED_TOKEN) {
      ctx.status = 403;
      ctx.body = { code: 403, message: 'forbidden', data: null };
      return;
    }

    const Site = ctx.model.Site;
    const Page = ctx.model.Page;
    const siteCount = await Site.countDocuments();
    const pageCount = await Page.countDocuments();
    if (siteCount !== 0 || pageCount !== 0) {
      ctx.status = 409;
      ctx.body = {
        code: 409,
        message: `库非空，拒绝写入（sites=${siteCount}, pages=${pageCount}）`,
        data: { siteCount, pageCount },
      };
      return;
    }

    const seedPath = path.join(app.baseDir, 'scripts/data/prod-geo-empty-seed.json');
    let data;
    try {
      data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    } catch (e) {
      ctx.status = 500;
      ctx.body = { code: 500, message: `读种子失败: ${e.message}`, data: null };
      return;
    }
    if (!data || data.domain !== DOMAIN || !Array.isArray(data.pages) || !data.pages.length) {
      ctx.status = 500;
      ctx.body = { code: 500, message: '种子文件无效', data: null };
      return;
    }

    const site = await Site.create(data.site);
    const docs = data.pages.map(p => {
      const row = { ...p, siteId: site._id };
      delete row._id;
      return row;
    });
    await Page.insertMany(docs, { ordered: true });

    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        domain: DOMAIN,
        siteId: String(site._id),
        pages: docs.length,
        hint: '灌数完成，请删除 TmpSeedController 与路由后重新部署',
      },
    };
  }
}

module.exports = TmpSeedController;
