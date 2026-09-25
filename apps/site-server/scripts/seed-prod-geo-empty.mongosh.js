/**
 * 生产 CMS 空库灌数（仅 mongosh，不装 Node 依赖）
 *
 * 硬条件：库名 site_manage；sites/pages 均为 0；否则退出不写。
 *
 * 用法（在仓库根目录）：
 *   mongosh 'mongodb://127.0.0.1:27017/site_manage' --file apps/site-server/scripts/seed-prod-geo-empty.mongosh.js
 */
(() => {
  const dbName = db.getName();
  if (dbName !== 'site_manage') {
    print('[ABORT] 库名必须是 site_manage，当前=' + dbName);
    quit(1);
  }

  const siteCount = db.sites.countDocuments();
  const pageCount = db.pages.countDocuments();
  print('[check] db=site_manage sites=' + siteCount + ' pages=' + pageCount);
  if (siteCount !== 0 || pageCount !== 0) {
    print('[ABORT] 库非空，拒绝写入');
    quit(1);
  }

  const path = 'apps/site-server/scripts/data/prod-geo-empty-seed.json';
  let raw;
  try {
    raw = fs.readFileSync(path, 'utf8');
  } catch (e) {
    print('[ABORT] 读不到种子文件 ' + path + '（请在仓库根目录执行）: ' + e);
    quit(1);
  }

  const data = JSON.parse(raw);
  if (!data || data.domain !== 'geo.hanyuai.com' || !Array.isArray(data.pages) || !data.pages.length) {
    print('[ABORT] 种子文件无效');
    quit(1);
  }

  const now = new Date();
  const siteDoc = Object.assign({}, data.site, {
    createdAt: now,
    updatedAt: now,
  });
  const siteRes = db.sites.insertOne(siteDoc);
  const siteId = siteRes.insertedId;
  print('[ok] created site ' + data.domain + ' ' + siteId);

  let n = 0;
  for (const p of data.pages) {
    const doc = Object.assign({}, p, {
      siteId: siteId,
      createdAt: now,
      updatedAt: now,
    });
    db.pages.insertOne(doc);
    n += 1;
    print('[ok] page ' + doc.path);
  }

  print('[done] sites=' + db.sites.countDocuments() + ' pages=' + db.pages.countDocuments() + ' insertedPages=' + n);
  print('[next] https://geo-site-admin.hanyuai.com → 站点 geo.hanyuai.com');
})();
