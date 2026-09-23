'use strict';

const Service = require('egg').Service;

class SsrService extends Service {
  /**
   * 根据域名和路径获取 SSR 渲染所需数据
   * 菜单来自「可见且已发布」的页面树，当前页同样取自 Page（含 pageData/blocks）
   */
  async getPageByDomainAndPath(domain, path) {
    const { service } = this;
    const site = await service.site.findByDomain(domain);
    if (!site) return null;

    const page = await service.page.findBySiteAndPath(site._id, path);
    const menus = await service.page.listNavTree(site._id);

    return {
      site,
      page: page || null,
      menus,
    };
  }

  /**
   * 按域名 + pageKind 批量拉取已发布 hub 内容（旗舰站 Learn/Report 等）
   */
  async listHubByKind(domain, pageKind) {
    const { service } = this;
    const site = await service.site.findByDomain(domain);
    if (!site) return null;

    const kind = String(pageKind || 'default');
    const pages = await service.page.listByKind(site._id, kind, { publishedOnly: true });

    return {
      site,
      pageKind: kind,
      pages,
    };
  }
}

module.exports = SsrService;
