'use strict';

const Controller = require('egg').Controller;

class SiteController extends Controller {
  async index() {
    const { ctx, service } = this;
    const { page = 1, pageSize = 20, keyword } = ctx.query;
    const result = await service.site.list({
      page: Number(page),
      pageSize: Number(pageSize),
      keyword,
    });
    ctx.body = { code: 0, message: 'ok', data: result };
  }

  async show() {
    const { ctx, service } = this;
    const site = await service.site.findById(ctx.params.id);
    if (!site) {
      ctx.status = 404;
      ctx.body = { code: 404, message: 'site not found', data: null };
      return;
    }
    ctx.body = { code: 0, message: 'ok', data: site };
  }

  async create() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    if (!body.name || !body.domain) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'name and domain are required', data: null };
      return;
    }
    const site = await service.site.create(body);
    ctx.body = { code: 0, message: 'ok', data: site };
  }

  async update() {
    const { ctx, service } = this;
    const site = await service.site.update(ctx.params.id, ctx.request.body);
    if (!site) {
      ctx.status = 404;
      ctx.body = { code: 404, message: 'site not found', data: null };
      return;
    }
    ctx.body = { code: 0, message: 'ok', data: site };
  }

  async destroy() {
    const { ctx, service } = this;
    const ok = await service.site.destroy(ctx.params.id);
    if (!ok) {
      ctx.status = 404;
      ctx.body = { code: 404, message: 'site not found', data: null };
      return;
    }
    ctx.body = { code: 0, message: 'ok', data: true };
  }
}

module.exports = SiteController;
