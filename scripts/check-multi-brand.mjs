#!/usr/bin/env node
/**
 * 多品牌 MVP 静态验收（T5/T6 相关代码不变量 + 关键文件存在性）
 * 运行：node scripts/check-multi-brand.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

// 禁止静默 brands[0] 回落
for (const rel of [
  'apps/geo-api/app/controller/summary.js',
  'apps/geo-api/app/controller/source.js',
  'apps/geo-api/app/controller/query.js',
  'apps/geo-api/app/controller/brand.js',
  'apps/geo-api/app/controller/payment.js',
  'apps/geo-api/app/controller/publish.js',
  'apps/geo-api/app/controller/report.js',
  'apps/geo-api/app/controller/brandArticle.js',
]) {
  const t = read(rel);
  assert(!t.includes('_resolveBrand'), `${rel} 仍含 _resolveBrand`);
  assert(!/brands\.find\([^)]*\)\s*\|\|\s*brands\[0\]/.test(t), `${rel} 仍有 brands[0] 静默回落`);
  assert(t.includes('brandScope.requireBrand') || t.includes('_requireBrand'), `${rel} 未使用 requireBrand`);
}

assert(fs.existsSync(path.join(root, 'apps/geo-api/app/service/brand_scope.js')), '缺少 brand_scope.js');
assert(fs.existsSync(path.join(root, 'apps/geo-user-dash/src/components/BrandSwitcher.vue')), '缺少 BrandSwitcher.vue');

const http = read('apps/geo-user-dash/src/api/http.ts');
assert(http.includes('injectBrand') || http.includes('brand_id'), 'dash http 未注入 brand_id');

const site = read('apps/geo-user-dash/src/utils/site.ts');
assert(site.includes('add_brand'), 'siteTrialUrl 缺 from=add_brand');
assert(site.includes('brand_id'), 'ingest 未处理 brand_id');

const trial = read('apps/geo-user-site/components/trial/TrialChat.vue');
assert(trial.includes('savedBrandId'), 'TrialChat 未回传 savedBrandId');
assert(trial.includes('isAddBrand'), 'TrialChat 未识别 add_brand');

const persist = read('packages/geo-agent/src/persist.js');
assert(persist.includes('user_id: opts.userId'), 'persist 更新路径缺 user_id 归属校验');

const runner = read('apps/geo-api/app/service/agent_runner.js');
assert(runner.includes('ensureFreeSubscription'), 'confirm 后未 ensureFreeSubscription');

if (fails.length) {
  console.error('FAIL');
  fails.forEach(f => console.error(' -', f));
  process.exit(1);
}
console.log('OK multi-brand static checks passed (T5/T6 code invariants)');
