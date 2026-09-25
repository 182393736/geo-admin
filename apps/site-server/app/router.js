'use strict';

/**
 * @param {Egg.Application} app
 */
module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);

  // ===== 前台 SSR：按域名 + 路径获取页面数据 =====
  router.get('/api/ssr/page', controller.ssr.getPage);
  router.get('/api/ssr/hub', controller.ssr.listHub);

  // ===== 管理端：网站 =====
  router.get('/api/admin/sites', controller.site.index);
  router.get('/api/admin/sites/:id', controller.site.show);
  router.post('/api/admin/sites', controller.site.create);
  router.put('/api/admin/sites/:id', controller.site.update);
  router.delete('/api/admin/sites/:id', controller.site.destroy);

  // ===== 管理端：页面（含菜单树 + pageData） =====
  router.get('/api/admin/pages', controller.page.index);
  router.get('/api/admin/pages/:id', controller.page.show);
  router.post('/api/admin/pages', controller.page.create);
  router.post('/api/admin/pages/:id/copy', controller.page.copy);
  router.put('/api/admin/pages/:id', controller.page.update);
  router.delete('/api/admin/pages/:id', controller.page.destroy);

  // 【临时】空库灌数，用完删除本行 + app/controller/tmp_seed.js
  router.post('/api/admin/_tmp_seed_prod_geo_empty', controller.tmpSeed.seedProdGeoEmpty);
};
