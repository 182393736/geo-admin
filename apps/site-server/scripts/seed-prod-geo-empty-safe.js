'use strict';

/**
 * 生产官网 CMS 空库灌数（安全版）
 *
 * 硬条件（任一不满足立即退出，不写库）：
 *   1) CONFIRM=SEED_PROD_GEO_EMPTY
 *   2) MONGODB_URL 已设置，且库名为 site_manage
 *   3) sites / pages 均为 0（非空一律拒绝）
 *
 * 用法（生产宿主机）：
 *   CONFIRM=SEED_PROD_GEO_EMPTY MONGODB_URL='mongodb://127.0.0.1:27017/site_manage' \
 *     node apps/site-server/scripts/seed-prod-geo-empty-safe.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

const ROOT = path.resolve(__dirname, '../../..');
const SERVER_DIR = path.resolve(__dirname, '..');

/** 优先从 site-server / 仓库根解析依赖（兼容未 cd 到 apps/site-server） */
function requireDep(name) {
  const paths = [
    path.join(SERVER_DIR, 'node_modules'),
    path.join(ROOT, 'node_modules'),
    path.join(ROOT, 'node_modules', '.pnpm', 'node_modules'),
  ];
  const resolved = Module._resolveFilename(name, {
    id: __filename,
    filename: __filename,
    paths: [...paths, ...(Module._nodeModulePaths(__dirname))],
  });
  return require(resolved);
}

const mongoose = requireDep('mongoose');
const esbuild = requireDep('esbuild');

const CONFIRM = String(process.env.CONFIRM || '');
const MONGODB_URL = String(process.env.MONGODB_URL || '').trim();
const DOMAIN = 'geo.hanyuai.com';
const SITE_URL = 'https://geo.hanyuai.com';

const UNSET_LEGACY = {
  hubContent: '',
  header: '',
  start: '',
  tabVisible: '',
  blocks: '',
  qa: '',
  howto: '',
  steps: '',
};

function die(msg) {
  console.error('[ABORT]', msg);
  process.exit(1);
}

function bundle(entry) {
  const outfile = path.join(os.tmpdir(), `flagship-export-${process.pid}-${path.basename(entry)}.cjs`);
  esbuild.buildSync({
    absWorkingDir: ROOT,
    entryPoints: [entry],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });
  const data = require(outfile);
  fs.rmSync(outfile, { force: true });
  return data;
}

function dbNameFromUrl(url) {
  try {
    const u = new URL(url.replace(/^mongodb(\+srv)?:/, 'http:'));
    const name = (u.pathname || '').replace(/^\//, '').split('?')[0];
    return name || '';
  } catch {
    const m = String(url).match(/\/([^/?]+)(\?|$)/);
    return m ? m[1] : '';
  }
}

function toPageDoc(siteId, item, now, flagshipToModules) {
  const canonical = item.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${item.path}`;
  if (item.pageKind === 'pricing' || item.pageKind === 'contact') {
    return {
      siteId,
      path: item.path,
      title: item.title,
      parentId: null,
      sort: item.sort,
      visible: true,
      template: item.template || item.pageKind,
      pageKind: item.pageKind,
      status: 'published',
      seo: {
        title: item.seo.title,
        description: item.seo.description,
        keywords: item.seo.keywords,
        canonical,
      },
      schema: {
        visible: true,
        schemaType: 'WebPage',
        name: item.title,
        headline: item.headline,
        description: item.seo.description,
        image: `${SITE_URL}/og-geo.png`,
        url: canonical,
        author: 'HANYUAI GEO',
        publisher: 'HANYUAI GEO',
        datePublished: item.datePublished,
        dateModified: item.dateModified,
        inLanguage: 'zh-CN',
        keywords: item.seo.keywords,
        mainEntityOfPage: canonical,
      },
      hubContent: item.hubContent,
      updatedAt: now,
    };
  }
  const modules = flagshipToModules(item.flagship);
  return {
    siteId,
    path: item.path,
    title: item.title,
    parentId: null,
    sort: item.sort,
    visible: true,
    template: 'flagship',
    pageKind: item.pageKind,
    status: 'published',
    seo: {
      title: item.seo.title,
      description: item.seo.description,
      keywords: item.seo.keywords,
      canonical,
    },
    schema: {
      visible: true,
      schemaType: 'WebPage',
      name: item.title,
      headline: item.headline,
      description: item.seo.description,
      image: `${SITE_URL}/og-geo.png`,
      url: canonical,
      author: 'HANYUAI GEO',
      publisher: 'HANYUAI GEO',
      datePublished: item.datePublished,
      dateModified: item.dateModified,
      inLanguage: 'zh-CN',
      keywords: item.seo.keywords,
      mainEntityOfPage: canonical,
    },
    ...modules,
    updatedAt: now,
  };
}

async function main() {
  if (CONFIRM !== 'SEED_PROD_GEO_EMPTY') {
    die('必须设置 CONFIRM=SEED_PROD_GEO_EMPTY（防止误跑）');
  }
  if (!MONGODB_URL) {
    die('必须设置 MONGODB_URL');
  }
  const dbName = dbNameFromUrl(MONGODB_URL);
  if (dbName !== 'site_manage') {
    die(`库名必须是 site_manage，当前解析为「${dbName || '(空)'}」：${MONGODB_URL}`);
  }
  if (/\/geo(\?|$)/.test(MONGODB_URL) && dbName !== 'site_manage') {
    die('疑似业务库 geo，拒绝');
  }

  const pagesExport = bundle('apps/site-server/scripts/flagship-export-entry.ts').pages;
  const { orderPageDoc, flagshipToModules } = {
    orderPageDoc: bundle('packages/site-shared/src/page-order.ts').orderPageDoc,
    flagshipToModules: bundle('packages/site-shared/src/flagship-modules.ts').flagshipToModules,
  };
  if (!Array.isArray(pagesExport) || !pagesExport.length) {
    die('旗舰页导出为空，中止');
  }

  await mongoose.connect(MONGODB_URL);
  const db = mongoose.connection.db;
  if (!db || db.databaseName !== 'site_manage') {
    die(`已连接库名为 ${db && db.databaseName}，期望 site_manage`);
  }

  const Site = db.collection('sites');
  const Page = db.collection('pages');
  const siteCount = await Site.countDocuments();
  const pageCount = await Page.countDocuments();
  console.log('[check] db=site_manage sites=%s pages=%s domain=%s', siteCount, pageCount, DOMAIN);

  if (siteCount !== 0 || pageCount !== 0) {
    die(`库非空（sites=${siteCount}, pages=${pageCount}），拒绝写入。请人工确认后再处理。`);
  }

  const now = new Date();
  const inserted = await Site.insertOne({
    name: 'HANYUAI GEO',
    domain: DOMAIN,
    aliases: ['www.geo.hanyuai.com'],
    status: 'active',
    enabled: true,
    meta: {
      title: 'HANYUAI GEO',
      description: 'GEO 优化 · AI 搜索可见性',
    },
    brandZh: 'HANYUAI GEO',
    brandEn: 'HANYUAI GEO',
    createdAt: now,
    updatedAt: now,
  });
  const siteId = inserted.insertedId;
  console.log('[ok] created site', DOMAIN, String(siteId));

  for (const item of pagesExport) {
    const doc = orderPageDoc({
      ...toPageDoc(siteId, item, now, flagshipToModules),
      createdAt: now,
    });
    // 清理 pricing/contact 上不需要的 unset 字段占位
    if (item.pageKind === 'pricing' || item.pageKind === 'contact') {
      for (const k of Object.keys(UNSET_LEGACY)) {
        if (k !== 'hubContent') delete doc[k];
      }
    }
    await Page.insertOne(doc);
    console.log('[ok] page', item.path);
  }

  const leftSites = await Site.countDocuments();
  const leftPages = await Page.countDocuments();
  console.log('[done] sites=%s pages=%s', leftSites, leftPages);
  console.log('[next] 打开 https://geo-site-admin.hanyuai.com 选站点 %s', DOMAIN);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
