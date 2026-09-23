'use strict';

const Controller = require('egg').Controller;

class PageController extends Controller {
  async index() {
    const { ctx, service } = this;
    const { siteId } = ctx.query;
    if (!siteId) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '必须指定所属域名（siteId）', data: null };
      return;
    }
    const list = await service.page.listTree(siteId);
    ctx.body = { code: 0, message: 'ok', data: list };
  }

  async show() {
    const { ctx, service } = this;
    const page = await service.page.findById(ctx.params.id);
    if (!page) {
      ctx.status = 404;
      ctx.body = { code: 404, message: 'page not found', data: null };
      return;
    }
    ctx.body = { code: 0, message: 'ok', data: page };
  }

  async create() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    if (!body.siteId || !body.path || !body.title) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'siteId, path and title are required', data: null };
      return;
    }
    try {
      const page = await service.page.create(body);
      ctx.body = { code: 0, message: 'ok', data: page };
    } catch (err) {
      if (err.status === 400 || err.code === 11000) {
        ctx.status = 400;
        ctx.body = { code: 400, message: err.message || '创建失败', data: null };
        return;
      }
      throw err;
    }
  }

  async update() {
    const { ctx, service } = this;
    try {
      const page = await service.page.update(ctx.params.id, ctx.request.body);
      if (!page) {
        ctx.status = 404;
        ctx.body = { code: 404, message: 'page not found', data: null };
        return;
      }
      ctx.body = { code: 0, message: 'ok', data: page };
    } catch (err) {
      if (err.status === 400 || err.code === 11000) {
        ctx.status = 400;
        ctx.body = { code: 400, message: err.message || '更新失败', data: null };
        return;
      }
      throw err;
    }
  }

  async destroy() {
    const { ctx, service } = this;
    try {
      const ok = await service.page.destroy(ctx.params.id);
      if (!ok) {
        ctx.status = 404;
        ctx.body = { code: 404, message: 'page not found', data: null };
        return;
      }
      ctx.body = { code: 0, message: 'ok', data: true };
    } catch (err) {
      if (err.status === 400) {
        ctx.status = 400;
        ctx.body = { code: 400, message: err.message, data: null };
        return;
      }
      throw err;
    }
  }

  /** POST /api/admin/pages/:id/copy  body: { path?, title?, status? } */
  async copy() {
    const { ctx, service } = this;
    try {
      const page = await service.page.copy(ctx.params.id, ctx.request.body || {});
      if (!page) {
        ctx.status = 404;
        ctx.body = { code: 404, message: 'page not found', data: null };
        return;
      }
      ctx.body = { code: 0, message: 'ok', data: page };
    } catch (err) {
      if (err.status === 400 || err.code === 11000) {
        ctx.status = 400;
        ctx.body = { code: 400, message: err.message || '复制失败', data: null };
        return;
      }
      throw err;
    }
  }
}

module.exports = PageController;
