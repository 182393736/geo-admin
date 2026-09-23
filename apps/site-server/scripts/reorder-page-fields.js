'use strict';

/**
 * 只重排已有页面的字段顺序，不改文案。
 * 用法：cd apps/site-server && node scripts/reorder-page-fields.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');
const esbuild = require(path.resolve(__dirname, '../../../node_modules/esbuild'));

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/site_manage';

function loadOrderPageDoc() {
  const outfile = path.join(os.tmpdir(), `page-order-${process.pid}.cjs`);
  esbuild.buildSync({
    absWorkingDir: path.resolve(__dirname, '../../..'),
    entryPoints: [ 'packages/site-shared/src/page-order.ts' ],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });
  const data = require(outfile);
  fs.rmSync(outfile, { force: true });
  return data.orderPageDoc;
}

function signature(doc, prefix = '') {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc) || doc._bsontype) return prefix;
  return Object.keys(doc).map((key) => {
    const value = doc[key];
    if (value && typeof value === 'object' && !Array.isArray(value) && !value._bsontype && !(value instanceof Date)) {
      return signature(value, `${prefix}${key}.`);
    }
    return `${prefix}${key}`;
  }).join('|');
}

async function main() {
  const orderPageDoc = loadOrderPageDoc();
  await mongoose.connect(MONGODB_URL);
  const Page = mongoose.connection.collection('pages');
  const pages = await Page.find({}).toArray();
  const signatures = new Set();
  for (const page of pages) {
    const next = orderPageDoc(page);
    await Page.replaceOne({ _id: page._id }, next);
    const visible = { ...next };
    delete visible._id;
    delete visible.siteId;
    delete visible.createdAt;
    delete visible.updatedAt;
    delete visible.__v;
    signatures.add(signature(visible));
    console.log('reordered', page.path);
  }
  console.log('pages', pages.length, 'distinct shapes', signatures.size);
  for (const item of signatures) console.log(item.split('|').slice(0, 24).join(','));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
