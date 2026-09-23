'use strict';

/**
 * 把当前公开的首页和 8 个功能页写成平铺模块 pageData，并删除该站点上的其他页面。
 * 用法：cd apps/site-server && node scripts/seed-flagship-pages.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');
const esbuild = require(path.resolve(__dirname, '../../../node_modules/esbuild'));

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/site_manage';
const DOMAIN = process.env.CMS_DOMAIN || 'localhost';
const SITE_URL = (process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:5003').replace(/\/+$/, '');

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

function bundle(entry) {
  const outfile = path.join(os.tmpdir(), `flagship-export-${process.pid}-${path.basename(entry)}.cjs`);
  esbuild.buildSync({
    absWorkingDir: path.resolve(__dirname, '../../..'),
    entryPoints: [ entry ],
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

function buildExport() {
  return bundle('apps/site-server/scripts/flagship-export-entry.ts').pages;
}

function loadShared() {
  return {
    orderPageDoc: bundle('packages/site-shared/src/page-order.ts').orderPageDoc,
    flagshipToModules: bundle('packages/site-shared/src/flagship-modules.ts').flagshipToModules,
  };
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
  const pages = buildExport();
  const { orderPageDoc, flagshipToModules } = loadShared();
  const paths = pages.map((item) => item.path);
  await mongoose.connect(MONGODB_URL);
  const Site = mongoose.connection.collection('sites');
  const Page = mongoose.connection.collection('pages');
  const site = await Site.findOne({ domain: DOMAIN });
  if (!site) {
    throw new Error(`找不到域名 ${DOMAIN} 的站点。先创建站点，或设置 CMS_DOMAIN。`);
  }

  const now = new Date();
  for (const item of pages) {
    const existing = await Page.findOne({ siteId: site._id, path: item.path });
    const doc = orderPageDoc({
      ...(existing ? { _id: existing._id } : {}),
      ...toPageDoc(site._id, item, now, flagshipToModules),
      createdAt: existing?.createdAt || now,
    });
    if (existing) {
      await Page.replaceOne({ _id: existing._id }, doc);
      const unset = { ...UNSET_LEGACY };
      if (item.pageKind === 'pricing' || item.pageKind === 'contact') delete unset.hubContent;
      await Page.updateOne({ _id: existing._id }, { $unset: unset });
    } else {
      await Page.insertOne(doc);
    }
    console.log('upsert', item.path);
  }

  const removed = await Page.deleteMany({
    siteId: site._id,
    path: { $nin: paths },
  });
  console.log('removed other pages:', removed.deletedCount);
  const left = await Page.find({ siteId: site._id }).project({ path: 1, title: 1, status: 1, hero: 1 }).toArray();
  console.log('left', left.map((item) => `${item.status} ${item.path} ${item.title} flat=${!!item.hero}`).join('\n'));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
