'use strict';

/**
 * 写入各 pageKind 完整样例页（localhost）
 * 用法：cd apps/server && node scripts/seed-cms-samples.js
 * 依赖：先有 localhost 站点（可先跑 seed-cms-localhost.js）
 */
const mongoose = require('mongoose');
const { SAMPLE_PAGES } = require('./cms-sample-payloads');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/site_manage';
const DOMAIN = process.env.CMS_DOMAIN || 'localhost';

async function upsertPage(Page, siteId, doc) {
  const now = new Date();
  const hub = doc.hubContent;
  const qa = (hub && hub.faq ? hub.faq : []).map((item, i) => ({
    id: `qa-${i + 1}`,
    question: item.q,
    answer: item.a,
  }));
  await Page.updateOne(
    { siteId, path: doc.path },
    {
      $set: {
        siteId,
        path: doc.path,
        title: doc.title,
        parentId: null,
        sort: doc.sort ?? 20,
        visible: true,
        template: doc.template || 'default',
        pageKind: doc.pageKind,
        hubContent: hub,
        status: 'published',
        blocks: doc.blocks || [],
        qa,
        howto: [],
        steps: [],
        seo: doc.seo || {},
        start: {
          schemaType: doc.pageKind === 'report' ? 'Article' : 'WebPage',
          name: doc.title,
          description: (doc.seo && doc.seo.description) || '',
          inLanguage: 'zh-CN',
          dateModified: (hub && hub.dateModified) || '2026-09-20',
        },
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
}

async function main() {
  await mongoose.connect(MONGODB_URL);
  const Site = mongoose.connection.collection('sites');
  const Page = mongoose.connection.collection('pages');

  let site = await Site.findOne({ domain: DOMAIN });
  if (!site) {
    console.error('Site not found for', DOMAIN, '— run seed-cms-localhost.js first');
    process.exit(1);
  }

  for (const doc of SAMPLE_PAGES) {
    await upsertPage(Page, site._id, doc);
    console.log('OK', doc.pageKind, doc.path);
  }

  console.log('Seed CMS samples done:', SAMPLE_PAGES.length, 'pages');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
