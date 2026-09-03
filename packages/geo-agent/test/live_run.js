'use strict';
/**
 * 真机验证（需要 SILICONFLOW_API_KEY；可选 TAVILY_API_KEY 开联网取证）：
 *   SILICONFLOW_API_KEY=sk-xxx TAVILY_API_KEY=tvly-xxx node test/live_run.js [品牌名] [官网]
 * 默认样本：HANYUAI 图像助理 / hanyuai.com
 */
const { createSiliconFlowClient, createWebSearch, runOnboarding } = require('../src/index');

async function main() {
  if (!process.env.SILICONFLOW_API_KEY) {
    console.error('缺少 SILICONFLOW_API_KEY（export 后再跑）');
    process.exit(1);
  }
  const brand_name = process.argv[2] || 'HANYUAI 图像助理';
  const website = process.argv[3] || 'hanyuai.com';
  const llm = createSiliconFlowClient({});
  const webSearch = createWebSearch({}); // 未配 TAVILY_API_KEY 时为 null → 不联网、诚实 llm_estimate
  console.log(`run: brand=${brand_name} site=${website} model=${llm.model} webSearch=${webSearch ? webSearch.name : 'off'}`);

  const t0 = Date.now();
  const result = await runOnboarding(
    { llm, webSearch },
    { brand_name, website, query_limit: 8 },
    e => { if (e.type === 'stage') console.log(`  ·stage ${e.stage}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`); },
  );

  console.log('\n===== 品牌 =====');
  console.log(JSON.stringify(result.brand, null, 1));
  console.log('===== 画像（截断） =====');
  console.log('industry:', result.profile.industry, '| slogan:', result.profile.slogan);
  console.log('scripts:', result.profile.scripts);
  console.log('description:', (result.profile.description || '').slice(0, 120), '…');
  console.log('===== 别名/产品/竞品 =====');
  console.log('aliases:', result.aliases, '| products:', result.products.map(p => p.name));
  for (const c of result.competitors) console.log(`  竞品 ${c.name} —— ${c.compet_point}`);
  console.log('===== 监控问题候选（weight 降序） =====');
  for (const c of result.candidates) {
    console.log(`  [${c.weight}]${c.is_golden ? '★' : ' '} ${c.query} | ${c.query_type} | ${c.query_description}`);
  }
  console.log('===== 情报文 =====');
  console.log(`  ${result.library_doc.title} slug=${result.library_doc.slug} words=${result.library_doc.word_count}`);
  console.log('===== 留痕/记账 =====');
  const kinds = {};
  for (const t of result.traces) kinds[t.kind] = (kinds[t.kind] || 0) + 1;
  console.log('  traces:', kinds, '| weight_source:', result.weight_source, '| search_grounded:', result.search_grounded);
  console.log('  usage:', JSON.stringify(result.usage.map(u => ({ step: u.step, total: u.usage && u.usage.total_tokens }))));
  console.log(`\nLIVE OK in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch(e => { console.error('LIVE FAIL:', e.message || e); process.exit(1); });
