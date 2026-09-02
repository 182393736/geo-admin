'use strict';
/**
 * 契约冒烟（零网络）：桩 LLM + 桩 fetch，验证「品牌名+可选链接 → 完整字段集」
 * 运行：node test/smoke_contract.js
 */
const assert = require('node:assert');
const { runOnboarding } = require('../src/run');

// 桩 fetch：只服务 crawlPage，返回一个极简官网 HTML
const stubFetch = async url => ({
  ok: true, status: 200, url,
  text: async () => '<html><head><title>HANYUAI 图像助理 - 免费AI绘图</title><meta name="description" content="免费在线AI图像生成与编辑"></head><body>AI 图像生成 图生图 科研配图 免费额度</body></html>',
});

// 桩 LLM：按提示词内容分辨三段调用
const stubLlm = {
  model: 'stub-offline',
  async chatJson({ user }) {
    if (user.includes('请输出结构化品牌档案')) {
      return { data: {
        brand_name: 'HANYUAI 图像助理', company: '', industary: ['AI图像工具'],
        website: 'https://hanyuai.com', slogan: '让创意即刻生成',
        business_desc: '免费在线 AI 图像生成与编辑工具',
        description: '面向设计师与科研人群的免费在线 AI 图像生成工具，主打零门槛与科研配图场景。',
        scripts: ['免费额度开箱即用', '科研配图一键出图'],
        tone: { style: '亲和', persona: '懂设计的产品助手' },
        aliases: ['HANYUAI', '涵语AI'],
        products: [{ name: '图生图', category: '图像生成', price_range: '免费' }],
        competitors: [
          { name: '豆绘AI', compet_point: 'AI图像生成平台 · 国内免费平台，直接竞争' },
          { name: 'Canva AI', compet_point: '设计平台 · 全球性平台，免费额度有限' },
        ],
        keywords: ['AI绘图', '图生图', '科研配图', 'AI图像工具'],
      }, usage: { total_tokens: 100 } };
    }
    if (user.includes('监控问题候选')) {
      return { data: { candidates: [
        { query: '免费AI绘图工具哪个好用', query_type: 'industry', weight: 10, is_golden: true, query_description: '高热度 · 工具选择', platform_query: '免费AI绘图工具哪个好用' },
        { query: '在线AI生成图片用什么工具', query_type: 'industry', weight: 9, is_golden: true, query_description: '高热度 · 场景决策' },
        { query: '科研论文配图用什么工具画', query_type: 'industry', weight: 8, is_golden: true, query_description: '核心场景 · 科研绘图' },
        { query: 'AI图生图工具有哪些推荐', query_type: 'industry', weight: 6, query_description: '功能对比 · 图生图' },
        { query: 'HANYUAI 图像助理口碑怎么样', query_type: 'brand', weight: 4, query_description: '品牌口碑 · 综合' },
      ] }, usage: { total_tokens: 120 } };
    }
    throw new Error('stub: unexpected chatJson prompt: ' + user.slice(0, 50));
  },
  async chat(messages, opts) {
    return { content: '## 市场处境\n免费 AI 图像工具赛道拥挤……\n## 口碑风险\n免费额度收窄会被放大讨论……## 监控建议\n围绕核心场景词持续观测。', usage: { total_tokens: 80 } };
  },
};

async function main() {
  const events = [];
  const result = await runOnboarding(
    { llm: stubLlm, fetchImpl: stubFetch },
    { brand_name: 'HANYUAI 图像助理', website: 'hanyuai.com', business_desc: '免费 AI 绘图工具' },
    e => events.push(e),
  );

  // ===== 完整字段集断言（对标实测契约逐项） =====
  // brand 主档
  assert.strictEqual(result.brand.name, 'HANYUAI 图像助理');
  assert.strictEqual(result.brand.industry, 'AI图像工具');
  assert.strictEqual(result.brand.website, 'https://hanyuai.com');
  assert.ok(result.brand.business_desc);
  // profile（industry[]/website/slogan/tone/description/scripts）
  assert.deepStrictEqual(result.profile.industry, ['AI图像工具']);
  assert.strictEqual(result.profile.slogan, '让创意即刻生成');
  assert.strictEqual(result.profile.tone.style, '亲和');
  assert.ok(result.profile.description.length > 10);
  assert.strictEqual(result.profile.scripts.length, 2);
  // aliases/products/competitors（含 compet_point）
  assert.deepStrictEqual(result.aliases, ['HANYUAI', '涵语AI']);
  assert.strictEqual(result.products[0].name, '图生图');
  assert.strictEqual(result.competitors.length, 2);
  assert.ok(result.competitors[0].compet_point.includes('·'));
  // candidates：weight 降序、金标、双形态、platform_prompt、query_description
  const c0 = result.candidates[0];
  assert.strictEqual(c0.weight, 10);
  assert.ok(c0.is_golden && c0.query_type === 'industry');
  assert.strictEqual(c0.platform_prompt, c0.question_list[0].platform_query);
  assert.ok(c0.query_description.includes('·'));
  assert.ok(result.candidates.every((c, i, a) => i === 0 || a[i - 1].weight >= c.weight), '按热度降序');
  assert.strictEqual(result.candidates.filter(c => c.is_golden).length, 3, '金标恰好 3 条');
  assert.strictEqual(result.weight_source, 'llm_estimate', '未配置搜索 key 时诚实标记');
  // library 情报文契约（slug/tags/source/word_count）
  assert.strictEqual(result.library_doc.source, '品牌挖掘');
  assert.ok(result.library_doc.tags.includes('品牌挖掘'));
  assert.ok(result.library_doc.word_count > 30);
  assert.ok(result.library_doc.slug.startsWith('品牌口碑与市场处境-品牌挖掘'));
  // traces：五类 kind 中的关键四类（无 user_confirm——那是 persist 侧）
  const kinds = new Set(result.traces.map(t => t.kind));
  assert.ok(kinds.has('page_read'), 'page_read 留痕');
  assert.ok(kinds.has('llm_output'));
  assert.ok(kinds.has('keyword_weight'));
  // 事件流
  const stages = events.filter(e => e.type === 'stage').map(e => e.stage);
  assert.deepStrictEqual(stages, ['crawl', 'analyze', 'queries', 'weigh', 'library', 'done']);
  // usage 记账
  assert.strictEqual(result.usage.length, 3);

  // ===== 无链接场景：只给品牌名也要出完整字段 =====
  const r2 = await runOnboarding({ llm: stubLlm, fetchImpl: stubFetch }, { brand_name: 'HANYUAI 图像助理' });
  assert.ok(r2.brand.name && r2.profile.description && r2.candidates.length >= 3, '仅品牌名也要完整产出');
  assert.ok(!r2.traces.some(t => t.kind === 'page_read'), '无链接则不抓页');

  console.log('CONTRACT OK: 品牌+可选链接 → 完整字段集（画像/别名/产品/竞品/候选/情报文/留痕/记账）全部通过');
}

main().catch(e => { console.error('CONTRACT FAIL:', e); process.exit(1); });
