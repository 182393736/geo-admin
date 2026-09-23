'use strict';

const Controller = require('egg').Controller;

class SsrController extends Controller {
  /**
   * GET /api/ssr/page?domain=xxx&path=/about
   * Nuxt SSR 入口：按域名 + 路径拉取站点、页面、菜单
   */
  async getPage() {
    const { ctx, service } = this;
    const domain = ctx.query.domain;
    const path = ctx.query.path || '/';

    if (!domain) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'domain is required', data: null };
      return;
    }

    const payload = await service.ssr.getPageByDomainAndPath(domain, path);
    if (!payload) {
      ctx.status = 404;
      ctx.body = { code: 404, message: 'site not found', data: null };
      return;
    }

    ctx.body = { code: 0, message: 'ok', data: payload };
  }

  /**
   * GET /api/ssr/hub?domain=xxx&pageKind=report
   * 旗舰站按 pageKind 批量拉取结构化内容
   */
  async listHub() {
    const { ctx, service } = this;
    const domain = ctx.query.domain;
    const pageKind = ctx.query.pageKind || 'default';

    if (!domain) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'domain is required', data: null };
      return;
    }

    const allowed = [
      'home',
      'hub',
      'learn',
      'report',
      'glossary',
      'insight',
      'solution',
      'product',
      'compare',
      'pricing',
      'contact',
    ];
    if (!allowed.includes(String(pageKind))) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: `pageKind must be one of: ${allowed.join(', ')}`,
        data: null,
      };
      return;
    }

    const payload = await service.ssr.listHubByKind(domain, pageKind);
    if (!payload) {
      ctx.status = 404;
      ctx.body = { code: 404, message: 'site not found', data: null };
      return;
    }

    ctx.body = { code: 0, message: 'ok', data: payload };
  }
}

module.exports = SsrController;
