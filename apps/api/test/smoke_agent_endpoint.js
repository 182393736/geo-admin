'use strict';
/**
 * 端点冒烟（零外网）：POST /agent/onboarding/run —— 桩硅基流动 + 桩官网抓取
 * 覆盖：JSON 出口完整字段集、落库 10 类、勾选子集 user_confirm 留痕
 * 运行：node test/smoke_agent_endpoint.js
 */
const assert = require('node:assert');
const path = require('node:path');

// mongod 数据目录落到工作区磁盘：/tmp 是 tmpfs 且很小，多起两个实例就会触发 mongod fassert
const GEO_TMP = path.join(__dirname, '../../..', '.tmp-geo');
require('node:fs').mkdirSync(GEO_TMP, { recursive: true });
process.env.TMPDIR = GEO_TMP;

process.env.EGG_SERVER_ENV = process.env.EGG_SERVER_ENV || 'unittest';
process.env.EGG_LOG = process.env.EGG_LOG || 'none';
process.env.SILICONFLOW_API_KEY = 'stub-key';

// ===== 全局 fetch 桩：硅基流动 chat/completions + 官网页面 =====
const realFetch = globalThis.fetch;
const canned = {
  profile: { brand_name: 'HANYUAI 图像助理', industary: ['AI图像工具'], website: 'https://hanyuai.com',
    business_desc: '免费在线 AI 图像生成与编辑工具', description: '面向设计师与科研人群的免费 AI 图像工具。',
    scripts: ['免费额度开箱即用'], tone: { style: '亲和', persona: '产品助手' }, aliases: ['HANYUAI'],
    products: [{ name: '图生图', category: '图像生成', price_range: '免费' }],
    competitors: [{ name: '豆绘AI', compet_point: '图像生成平台 · 国内免费直接竞争' }],
    keywords: ['AI绘图', '科研配图'] },
  queries: { candidates: [
    { query: '免费AI绘图工具哪个好用', query_type: 'industry', weight: 10, is_golden: true, query_description: '高热度 · 工具选择' },
    { query: '科研论文配图用什么工具画', query_type: 'industry', weight: 8, is_golden: true, query_description: '核心场景 · 科研绘图' },
    { query: 'HANYUAI口碑怎么样', query_type: 'brand', weight: 4, query_description: '品牌口碑 · 综合' },
  ] },
};
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.includes('api.siliconflow.cn')) {
    const body = JSON.parse(opts.body || '{}');
    const userMsg = (body.messages || []).map(m => m.content).join('\n');
    const picks = userMsg.includes('结构化品牌档案') ? canned.profile
      : userMsg.includes('监控问题候选') ? canned.queries : null;
    const content = picks ? JSON.stringify(picks) : '## 市场处境\n免费赛道拥挤。\n## 监控建议\n持续观测核心场景词。';
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }], usage: { total_tokens: 10 } }), text: async () => '' };
  }
  if (u.includes('hanyuai.com')) {
    return { ok: true, status: 200, text: async () => '<title>HANYUAI 图像助理</title><meta name="description" content="免费在线AI图像生成"><body>AI 图像生成 科研配图</body>' };
  }
  return realFetch(url, opts);
};

async function main() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URL = mem.getUri('geo_agent_ep');

  const mm = require('egg-mock');
  const app = mm.app({ baseDir: path.join(__dirname, '..'), cache: false });
  await app.ready();

  // 登录拿 token（seed 默认账户 123456/123456）
  const login = await app.httpRequest().post('/user/login').send({ account: '123456', password: '123456' });
  assert.strictEqual(login.status, 200, '登录成功');
  const token = login.body.accessToken;
  const auth = { Authorization: `Bearer ${token}` };

  // ===== save=true：完整字段集 + 落库 =====
  const r1 = await app.httpRequest().post('/agent/onboarding/run').set(auth)
    .send({ brand_name: 'HANYUAI 图像助理', website: 'hanyuai.com', business_desc: '免费 AI 绘图工具' });
  assert.strictEqual(r1.status, 200, `run 200，实际 ${r1.status}: ${JSON.stringify(r1.body).slice(0, 300)}`);
  const { result, saved } = r1.body.data;
  assert.strictEqual(result.brand.name, 'HANYUAI 图像助理');
  assert.strictEqual(result.candidates.length, 3);
  assert.strictEqual(result.library_doc.source, '品牌挖掘');
  assert.ok(saved.counts.queries === 3 && saved.counts.competitors === 1 && saved.counts.library === 1, '落库计数');
  const brandId = saved.brand_id;

  const M = n => app.mongoose.model(n);
  const prof = await M('BrandProfile').findOne({ brand_id: brandId }).lean();
  assert.deepStrictEqual(prof.industry, ['AI图像工具']);
  assert.deepStrictEqual(prof.scripts, ['免费额度开箱即用']);
  const comps = await M('CompetitorRegister').find({ brand_id: brandId }).lean();
  assert.strictEqual(comps[0].source, '品牌挖掘');
  assert.ok(comps[0].compet_point.includes('·'));
  const qs = await M('MonitorQuery').find({ brand_id: brandId }).sort({ weight: -1 }).lean();
  assert.strictEqual(qs.length, 3);
  assert.strictEqual(qs[0].platform_prompt, qs[0].query);
  assert.strictEqual(qs[0].query_description, '高热度 · 工具选择');
  assert.ok(qs[0].query_id > 0, 'query_id 自增');
  const lib = await M('BrandLibrary').findOne({ brand_id: brandId }).lean();
  assert.strictEqual(lib.slug, '品牌口碑与市场处境-品牌挖掘-HANYUAI 图像助理');
  assert.ok(lib.word_count > 10);
  const tk = new Set((await M('OnboardingTrace').find({ brand_id: brandId }).lean()).map(t => t.kind));
  assert.ok(tk.has('page_read') && tk.has('llm_output') && tk.has('keyword_weight'), '留痕三类');

  // ===== selected_queries：勾选子集 + user_confirm 留痕 =====
  const r2 = await app.httpRequest().post('/agent/onboarding/run').set(auth)
    .send({ brand_name: 'HANYUAI 图像助理', website: 'hanyuai.com', brand_id: brandId,
            selected_queries: ['免费AI绘图工具哪个好用'] });
  assert.strictEqual(r2.status, 200);
  assert.strictEqual(r2.body.data.saved.counts.queries, 1, '只存勾选的一条');
  const confirm = await M('OnboardingTrace').findOne({ brand_id: brandId, kind: 'user_confirm' }).lean();
  assert.deepStrictEqual(confirm.meta.selected, ['免费AI绘图工具哪个好用']);

  // ===== save=false 纯预览不落库 =====
  const before = await M('MonitorQuery').countDocuments({});
  const r3 = await app.httpRequest().post('/agent/onboarding/run').set(auth)
    .send({ brand_name: '预览品牌', save: false });
  assert.strictEqual(r3.status, 200);
  assert.ok(r3.body.data.result.brand.name);
  assert.strictEqual(await M('MonitorQuery').countDocuments({}), before, '预览不落库');

  // ===== 鉴权与参数 =====
  const r4 = await app.httpRequest().post('/agent/onboarding/run').send({ brand_name: 'x' });
  assert.strictEqual(r4.status, 401);
  const r5 = await app.httpRequest().post('/agent/onboarding/run').set(auth).send({});
  assert.strictEqual(r5.status, 400);

  // ===== 只给官网链接（品牌名缺省）也要能分析 —— 对齐"链接可选"场景 =====
  const r5b = await app.httpRequest().post('/agent/onboarding/run').set(auth)
    .send({ website: 'hanyuai.com', save: false });
  assert.strictEqual(r5b.status, 200, `仅官网链接可分析，实际 ${r5b.status}`);
  assert.strictEqual(r5b.body.data.result.brand.name, 'HANYUAI 图像助理', '品牌名由 LLM 从站点内容推断');

  // ===== SSE 流：事件序列 + 终事件携带完整 result（供确认回传） =====
  const r6 = await app.httpRequest().post('/agent/onboarding/stream').set(auth)
    .buffer(true)
    .parse((res, cb) => { let raw = ''; res.on('data', c => { raw += c; }); res.on('end', () => cb(null, raw)); })
    .send({ brand_name: 'HANYUAI 图像助理', website: 'hanyuai.com', save: false });
  const sseText = String(r6.body);
  ['event: stage', 'event: trace', 'event: profile', 'event: candidates', 'event: library', 'event: result']
    .forEach(tag => assert.ok(sseText.includes(tag), `SSE 缺事件 ${tag}`));
  assert.ok(sseText.includes('"compet_point"'), 'SSE result 内含完整候选/竞品字段');

  // ===== 两段式确认：回传 preview + 勾选子集 → 落库 + user_confirm 留痕 + 配额硬封顶 =====
  const preview = r3.body.data.result;
  const picked = preview.candidates.slice(0, 2).map(c => c.query);
  const r7 = await app.httpRequest().post('/agent/onboarding/confirm').set(auth)
    .send({ preview, selected_queries: [...picked, '不存在的注入问题'], confirm_limit: 99 });
  assert.strictEqual(r7.status, 200, `confirm 200，实际 ${r7.status}: ${JSON.stringify(r7.body).slice(0, 300)}`);
  assert.strictEqual(r7.body.data.confirm_limit, 3, 'confirm_limit 服务端硬封顶为 3');
  assert.strictEqual(r7.body.data.saved.counts.queries, 2, '只有真实勾选的 2 条落库，注入忽略');
  const newBrandId = r7.body.data.saved.brand_id;
  const confirmTrace = await M('OnboardingTrace').findOne({ brand_id: newBrandId, kind: 'user_confirm' }).lean();
  assert.ok(confirmTrace, 'user_confirm 留痕存在');
  assert.deepStrictEqual(confirmTrace.meta.selected, picked, '留痕的勾选清单与有效选择一致');
  assert.strictEqual(confirmTrace.meta.limit, 3);
  const prof2 = await M('BrandProfile').findOne({ brand_id: newBrandId }).lean();
  assert.ok(prof2 && prof2.description, 'preview 品牌画像经 sanitize 后落库');
  const r8 = await app.httpRequest().post('/agent/onboarding/confirm').set(auth).send({});
  assert.strictEqual(r8.status, 400);
  const r9 = await app.httpRequest().post('/agent/onboarding/confirm').send({ preview });
  assert.strictEqual(r9.status, 401);

  globalThis.fetch = realFetch;
  await mem.stop();
  try { await app.close(); } catch (e) { /* 常驻句柄允许强退 */ }
  console.log('ENDPOINT OK: run/save=false/SSE/confirm(配额封顶+注入过滤+留痕)/鉴权 全部通过');
  process.exit(0);
}

main().catch(e => { console.error('ENDPOINT FAIL:', e); process.exit(1); });
