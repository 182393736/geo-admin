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
const profileData = {
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
};

const stubLlm = {
  model: 'stub-offline',
  async chatJson({ user }) {
    if (user.includes('请输出结构化品牌档案')) {
      return { data: JSON.parse(JSON.stringify(profileData)), usage: { total_tokens: 100 } };
    }
    if (user.includes('监控问题候选')) {
      // 后 3 条是「模型不守中立约束」的固定用例：分别踩中品牌名 / 别名 / 官网域名主体
      return { data: { candidates: [
        { query: '免费AI绘图工具哪个好用', query_type: 'industry', weight: 10, is_golden: true, query_description: '高热度 · 工具选择', platform_query: '免费AI绘图工具哪个好用' },
        { query: '在线AI生成图片用什么工具', query_type: 'industry', weight: 9, is_golden: true, query_description: '高热度 · 场景决策' },
        { query: '科研论文配图用什么工具画', query_type: 'industry', weight: 8, is_golden: true, query_description: '核心场景 · 科研绘图' },
        { query: 'AI图生图工具有哪些推荐', query_type: 'industry', weight: 6, query_description: '功能对比 · 图生图' },
        { query: 'HANYUAI 图像助理口碑怎么样', query_type: 'brand', weight: 5, query_description: '品牌口碑 · 综合' },
        { query: '涵语AI和豆绘AI哪个好用', weight: 4, query_description: '竞品对比' },
        { query: 'hanyuai.com 官网入口在哪', weight: 3, query_description: '入口查找' },
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

  // ===== 品牌中立闸门：含品牌名/别名/域名主体的候选必须被剔除 =====
  const { buildBrandTokens, findBrandToken } = require('../src/neutral');
  const tokens = buildBrandTokens({
    name: result.brand.name, company: result.brand.company,
    aliases: result.aliases, website: result.brand.website,
  });
  assert.ok(tokens.some(t => t.includes('hanyuai图像助理')), '品牌名归一化（去空格/小写）后进黑名单');
  assert.ok(tokens.includes('hanyuai'), '别名与官网域名主体应进黑名单');
  assert.ok(tokens.includes('涵语ai'), '中文别名归一化后进黑名单');
  assert.strictEqual(result.candidates.length, 4, `3 条含品牌指纹的候选应被剔除（实际剩 ${result.candidates.length} 条）`);
  for (const c of result.candidates) {
    assert.strictEqual(findBrandToken(c.query, tokens), null, `问题不得含品牌名：${c.query}`);
    assert.strictEqual(findBrandToken(c.question_list[0].platform_query, tokens), null, '实际发问口径同样不得含品牌名');
    assert.strictEqual(c.query_type, 'industry', '监控问题一律行业中立（不再产出 brand 口碑题）');
  }
  const filterTrace = result.traces.find(t => t.meta && t.meta.step === 'queries_brand_filter');
  assert.ok(filterTrace, '剔除动作必须留痕（badcase 归因用）');
  assert.strictEqual(filterTrace.meta.dropped_total, 3, '应剔除 3 条');
  assert.ok(filterTrace.meta.dropped.every(d => d.hit), '每条剔除都记明命中的品牌指纹');
  assert.strictEqual(events.find(e => e.type === 'candidates').filtered_out, 3, '事件流回吐剔除数供前端提示');
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
  assert.strictEqual(r2.search_grounded, false, '未配搜索 key：不联网、诚实标记');

  // ===== 联网取证场景：配了 webSearch → DeepSeek 经 tool-calling 主动发搜索 =====
  const toolCalls = [];
  const stubLlmWithTools = {
    ...stubLlm,
    async chatToolLoop({ tools, handlers }) {
      assert.ok(tools[0]?.function?.name === 'web_search', '暴露 web_search 工具');
      const q1 = 'HANYUAI 图像助理 官网 产品';
      const q2 = '免费 AI 图像工具 对比 豆绘 Canva';
      const r1 = await handlers.web_search({ query: q1 });
      const r2x = await handlers.web_search({ query: q2 });
      toolCalls.push(q1, q2);
      assert.ok(r1.results[0]?.url, '工具返回搜索结果');
      return { content: '证据要点：HANYUAI 为一站式免费 AI 图像平台；同类竞品包括豆绘AI、Canva。来源：https://hanyuai.com …', calls: [], usage: { total_tokens: 500 } };
    },
  };
  const stubWeb = { name: 'fake-serp', async search(q) {
    return [ { title: `${q} - 结果A`, url: 'https://example.com/a', snippet: '摘要A' } ];
  } };
  const r3 = await runOnboarding(
    { llm: stubLlmWithTools, fetchImpl: stubFetch, webSearch: stubWeb },
    { brand_name: 'HANYUAI 图像助理', website: 'hanyuai.com' },
  );
  assert.strictEqual(r3.search_grounded, true, '联网取证生效标记');
  const sq = r3.traces.filter(t => t.kind === 'search_query');
  assert.ok(sq.length >= 2, '检索词留痕');
  assert.ok(sq.every(t => t.meta.engine === 'fake-serp'), '检索来源留痕');
  assert.ok(r3.usage.some(u => u.step === 'web_research'), '联网步记账');

  // ===== Tavily 执行器契约：createWebSearch 走 Tavily 分支（content→snippet 截断）；未配 key 全部降级 null =====
  const { createWebSearch, createSearchProvider } = require('../src/search');
  const tavilyFetch = async (url, init = {}) => {
    assert.strictEqual(url, 'https://api.tavily.com/search', 'Tavily 端点');
    assert.ok(String(init.headers.Authorization || '').startsWith('Bearer tvly-stub'), 'Bearer 鉴权');
    const body = JSON.parse(init.body);
    assert.ok(body.query && body.max_results >= 1, 'query/max_results 传参');
    assert.strictEqual(body.include_answer, false, '不要 Tavily 答案摘要（推理留给自家 LLM）');
    return { ok: true, status: 200, json: async () => ({ results: [
      { title: '结果A', url: 'https://example.com/a', content: 'A'.repeat(900) },
      { title: '结果B', url: 'https://example.com/b', content: '正文B' },
      { title: '无URL', url: '', content: '应被过滤' },
    ] }) };
  };
  const ws = createWebSearch({ tavilyKey: 'tvly-stub-key', fetchImpl: tavilyFetch });
  assert.strictEqual(ws.name, 'tavily');
  const tavilyResults = await ws.search('免费AI绘图工具哪个好用');
  assert.strictEqual(tavilyResults.length, 2, '空 url 过滤');
  assert.strictEqual(tavilyResults[0].snippet.length, 500, 'content 截断 500 字符为 snippet');
  assert.strictEqual(tavilyResults[1].snippet, '正文B');
  assert.ok(tavilyResults.every(r => r.title && r.url), 'title/url 契约');
  // 降级链：无 TAVILY_API_KEY → webSearch null；热度 Provider 现阶段恒 null（SerpAPI/Bing 已停用）
  // dev-keys.js 内置了测试用 TAVILY_API_KEY，验证"无密钥降级"路径需显式关闭内置值
  process.env.GEO_DISABLE_DEV_KEYS = '1';
  const savedTavily = process.env.TAVILY_API_KEY;
  delete process.env.TAVILY_API_KEY;
  assert.strictEqual(createWebSearch({ fetchImpl: tavilyFetch }), null, '未配 TAVILY_API_KEY → null 不联网');
  delete process.env.GEO_DISABLE_DEV_KEYS;
  if (savedTavily) process.env.TAVILY_API_KEY = savedTavily;
  assert.strictEqual(createSearchProvider({ serpApiKey: 'x', bingKey: 'y' }), null, '热度 Provider 恒 null → 诚实 llm_estimate');

  // ===== 纠偏重试：第一轮不守中立约束 → 带被剔样本再要一轮 =====
  let round = 0;
  const leakyLlm = {
    model: 'stub-leaky',
    async chatJson({ user }) {
      if (user.includes('请输出结构化品牌档案')) {
        return { data: JSON.parse(JSON.stringify(profileData)), usage: { total_tokens: 100 } };
      }
      round++;
      if (round === 1) {
        assert.ok(user.includes('禁止出现的词'), '品牌黑名单应写进提示词');
        return { data: { candidates: [
          { query: 'HANYUAI 图像助理怎么样', weight: 9 },
          { query: '涵语AI好不好用', weight: 8 },
        ] }, usage: { total_tokens: 60 } };
      }
      assert.ok(user.includes('上一轮不合格的问法'), '重试必须带上被剔样本');
      return { data: { candidates: [
        { query: '免费AI绘图工具哪个好用', weight: 10, is_golden: true },
        { query: '科研论文配图用什么工具画', weight: 8 },
        { query: 'AI图生图工具有哪些推荐', weight: 6 },
      ] }, usage: { total_tokens: 60 } };
    },
    async chat() { return { content: '## 市场处境\n……', usage: { total_tokens: 40 } }; },
  };
  const r4 = await runOnboarding({ llm: leakyLlm, fetchImpl: stubFetch }, { brand_name: 'HANYUAI 图像助理', query_limit: 3 });
  assert.strictEqual(round, 2, '第一轮全被剔除时应重试一次');
  assert.strictEqual(r4.candidates.length, 3, '重试后应拿到干净候选');
  assert.ok(r4.traces.some(t => t.meta && t.meta.step === 'queries_retry'), '重试要留痕');
  assert.ok(r4.candidates.every(c => findBrandToken(c.query, tokens) === null), '重试结果同样过闸门');

  // ===== 确认落库前的不可信 preview 也要过闸门（否则用户能手工塞自问自答题把指标做假） =====
  const { sanitizePreview } = require('../src/sanitize');
  const dirty = sanitizePreview({
    brand: { name: 'HANYUAI 图像助理', company: '', website: 'https://hanyuai.com', business_desc: '免费在线 AI 图像生成与编辑工具' },
    profile: { industry: ['AI图像工具'] },
    aliases: ['涵语AI'],
    candidates: [
      { query: '免费AI绘图工具哪个好用', weight: 10, is_golden: true, question_list: [{ user_friendly: '免费AI绘图工具哪个好用', platform_query: '免费AI绘图工具哪个好用' }] },
      { query: 'HANYUAI 图像助理怎么样，口碑好不好', weight: 9, question_list: [{ user_friendly: 'HANYUAI 口碑', platform_query: 'HANYUAI 图像助理怎么样，口碑好不好' }] },
      { query: '在线AI生成图片用什么工具', weight: 8, platform_query: '涵语AI 好不好用' },
    ],
    traces: [],
  });
  assert.strictEqual(dirty.candidates.length, 1, `回传 preview 里的品牌题应被拦（实际剩 ${dirty.candidates.length} 条）`);
  assert.strictEqual(dirty.candidates[0].query, '免费AI绘图工具哪个好用');
  assert.strictEqual(dirty.candidates[0].query_type, 'industry');

  console.log('CONTRACT OK: 完整字段集 + 品牌中立闸门（剔除/重试/回传拦截）+ 联网工具循环 + Tavily 执行器全部通过');
}

main().catch(e => { console.error('CONTRACT FAIL:', e); process.exit(1); });
