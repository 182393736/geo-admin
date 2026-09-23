'use strict';

const Controller = require('egg').Controller;

class MenuController extends Controller {
  async index() {
    const { ctx, service } = this;
    const { siteId } = ctx.query;
    if (!siteId) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '必须指定所属域名（siteId）', data: null };
      return;
    }
    const list = await service.menu.listBySite(siteId);
    ctx.body = { code: 0, message: 'ok', data: list };
  }

  async show() {
    const { ctx, service } = this;
    const menu = await service.menu.findById(ctx.params.id);
    if (!menu) {
      ctx.status = 404;
      ctx.body = { code: 404, message: 'menu not found', data: null };
      return;
    }
    ctx.body = { code: 0, message: 'ok', data: menu };
  }

  async create() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    if (!body.siteId || !body.title || !body.path) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'siteId, title and path are required', data: null };
      return;
    }
    try {
      const menu = await service.menu.create(body);
      ctx.body = { code: 0, message: 'ok', data: menu };
    } catch (err) {
      if (err.status === 400 || err.code === 11000) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: err.message || '路径已存在，不能重复添加',
          data: null,
        };
        return;
      }
      throw err;
    }
  }

  async update() {
    const { ctx, service } = this;
    try {
      const menu = await service.menu.update(ctx.params.id, ctx.request.body);
      if (!menu) {
        ctx.status = 404;
        ctx.body = { code: 404, message: 'menu not found', data: null };
        return;
      }
      ctx.body = { code: 0, message: 'ok', data: menu };
    } catch (err) {
      if (err.status === 400 || err.code === 11000) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: err.message || '路径已存在，不能重复添加',
          data: null,
        };
        return;
      }
      throw err;
    }
  }

  async destroy() {
    const { ctx, service } = this;
    const ok = await service.menu.destroy(ctx.params.id);
    if (!ok) {
      ctx.status = 404;
      ctx.body = { code: 404, message: 'menu not found', data: null };
      return;
    }
    ctx.body = { code: 0, message: 'ok', data: true };
  }
}

module.exports = MenuController;
