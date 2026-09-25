/**
 * 生产 CMS 空库灌数（兼容 MongoDB 4.0 自带 mongo shell，不装宿主机依赖）
 *
 * 硬条件：库名 site_manage；sites/pages 均为 0；否则退出不写。
 *
 * 用法（仓库根目录）：
 *   docker run --rm --network host -v "$PWD":/work -w /work mongo:4.0 \
 *     mongo mongodb://127.0.0.1:27017/site_manage apps/site-server/scripts/seed-prod-geo-empty.mongo.js
 */
(function () {
  var dbName = db.getName();
  if (dbName !== 'site_manage') {
    print('[ABORT] 库名必须是 site_manage，当前=' + dbName);
    quit(1);
  }

  var siteCount = db.sites.count();
  var pageCount = db.pages.count();
  print('[check] db=site_manage sites=' + siteCount + ' pages=' + pageCount);
  if (siteCount !== 0 || pageCount !== 0) {
    print('[ABORT] 库非空，拒绝写入');
    quit(1);
  }

  var path = 'apps/site-server/scripts/data/prod-geo-empty-seed.json';
  var raw;
  try {
    raw = cat(path);
  } catch (e) {
    print('[ABORT] 读不到种子文件 ' + path + '（请在仓库根目录执行）: ' + e);
    quit(1);
  }

  var data = JSON.parse(raw);
  if (!data || data.domain !== 'geo.hanyuai.com' || !data.pages || !data.pages.length) {
    print('[ABORT] 种子文件无效');
    quit(1);
  }

  var now = new Date();
  var siteDoc = data.site;
  siteDoc.createdAt = now;
  siteDoc.updatedAt = now;

  var siteRes = db.sites.insert(siteDoc);
  var siteId = siteRes.nInserted ? db.sites.findOne({ domain: data.domain })._id : null;
  // insert() 在不同版本返回值不一，统一再查一次
  if (!siteId) {
    var s = db.sites.findOne({ domain: data.domain });
    if (!s) {
      print('[ABORT] 站点插入失败');
      quit(1);
    }
    siteId = s._id;
  }
  print('[ok] created site ' + data.domain + ' ' + siteId);

  var n = 0;
  for (var i = 0; i < data.pages.length; i++) {
    var p = data.pages[i];
    p.siteId = siteId;
    p.createdAt = now;
    p.updatedAt = now;
    db.pages.insert(p);
    n++;
    print('[ok] page ' + p.path);
  }

  print('[done] sites=' + db.sites.count() + ' pages=' + db.pages.count() + ' insertedPages=' + n);
  print('[next] https://geo-site-admin.hanyuai.com → 站点 geo.hanyuai.com');
})();
