'use strict';
/**
 * 冒烟测试：S1 onboarding 字段契约补齐（monitor_query / competitor_register / brand_library / onboarding_trace）
 * 运行：MONGO_URL 可不设（自动起内存库）  node test/smoke_onboarding_fields.js
 * 覆盖：
 *  1) LLM 通道：竞品对象 {name, compet_point} 落库 source=品牌挖掘；monitor_query.platform_prompt 默认=query
 *  2) 降级通道：chatJson 抛错 → fallbackParse 完成，竞品为空、任务仍 done
 *  3) 实测契约字段直写回读：golden_query_ranking 引擎映射对象、query_description、library slug/tags/source/word_count、onboarding_traces 各 kind
 */
const assert = require('node:assert');
const path = require('node:path');

// mongod 数据目录落到工作区磁盘：/tmp 是 tmpfs 且很小，多起两个实例就会触发 mongod fassert
const GEO_TMP = path.join(__dirname, '../../..', '.tmp-geo');
require('node:fs').mkdirSync(GEO_TMP, { recursive: true });
process.env.TMPDIR = GEO_TMP;

process.env.EGG_SERVER_ENV = process.env.EGG_SERVER_ENV || 'unittest';
process.env.EGG_LOG = process.env.EGG_LOG || 'none';

async function main() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URL = mem.getUri('geo_test');

  const mm = require('egg-mock');
  const app = mm.app({ baseDir: path.join(__dirname, '..'), cache: false });
  await app.ready();

  const ctx = app.createAnonymousContext();
  const M = name => app.mongoose.model(name);

  // ---- 准备用户 ----
  const user = await M('User').create({ account: 'smoke_tester', name: '字段冒烟', company: 'HANYUAI 图像助理' });

  // ================= 场景1：LLM 通道（桩 chatJson 返回实测契约形态） =================
  // 打开 LLM 门禁（config 可能被冻结，失败则 defineProperty 兜底）
  try { app.config.deepseek.apiKey = 'smoke-key'; } catch (e) {
    Object.defineProperty(app.config.deepseek, 'apiKey', { value: 'smoke-key', configurable: true });
  }
  const llmContract = {
    brand_name: 'HANYUAI 图像助理',
    industry: 'AI图像工具',
    business_desc: '免费在线 AI 图像生成与编辑工具',
    aliases: ['HANYUAI', '涵语AI'],
    competitors: [
      { name: '豆绘AI', compet_point: 'AI图像生成平台 · 同为国内免费 AI 图像生成平台，直接竞争' },
      { name: 'Pic Copilot', compet_point: '电商AI设计工具 · 阿里旗下电商 AI 设计工具，电商场景强' },
      'Canva AI', // 字符串形态兼容
    ],
    keywords: ['AI绘图', '图生图', '科研配图'],
    industry_queries: ['免费AI绘图工具哪个好用', '在线AI生成图片用什么工具', '科研论文配图用什么工具画'],
    brand_queries: ['HANYUAI 图像助理怎么样，口碑好不好'],
  };
  const DeepseekProto = app.serviceClasses.llm.deepseek.prototype;
  const originChatJson = DeepseekProto.chatJson;
  DeepseekProto.chatJson = async () => ({ data: JSON.parse(JSON.stringify(llmContract)) });

  const { task_id: t1, brand_id: b1 } = await ctx.service.onboarding.start(String(user._id), {
    brand_name: '', website: 'hanyuai.com', business_desc: '一句话介绍：AI 图像生成工具，主打免费与科研配图。',
  });
  await waitDone(ctx, t1);

  const comps = await M('CompetitorRegister').find({ brand_id: b1 }).sort({ created_at: 1 }).lean();
  assert.strictEqual(comps.length, 3, '竞品应落库 3 条');
  assert.ok(comps.every(c => c.source === '品牌挖掘'), '竞品 source 应为 品牌挖掘');
  assert.ok(comps[0].compet_point.includes('AI图像生成平台'), '竞品对象形态的 compet_point 应落库');
  assert.strictEqual(comps[2].compet_point, '', '字符串形态竞品 compet_point 为空串');

  const qs = await M('MonitorQuery').find({ brand_id: b1 }).sort({ query_id: 1 }).lean();
  assert.strictEqual(qs.length, 4, '监控问题 3 行业 + 1 口碑');
  assert.ok(qs.every(q => q.platform_prompt === q.query), 'platform_prompt 默认应等于 query');
  assert.ok(qs.every(q => q.task_id === t1), 'task_id 溯源应写入');
  assert.strictEqual(qs[0].query_type, 'industry');
  assert.strictEqual(qs[3].query_type, 'brand');
  assert.ok(qs[0].query_id > 0, 'query_id 自增序列');

  // ---- 实测契约字段直写回读：golden_query_ranking 为引擎映射对象（旧 Number 类型的修正点） ----
  await M('MonitorQuery').updateOne({ query_id: qs[0].query_id }, { $set: {
    weight: 10, is_golden: true,
    query_description: '高热度 · 工具选择',
    golden_query_ranking: { all: { rank: '-1', score: 0 }, deepseek: { rank: '-2', score: 0 }, kimi: { rank: '-99', score: -99 } },
  } });
  const q0 = await M('MonitorQuery').findOne({ query_id: qs[0].query_id }).lean();
  assert.strictEqual(q0.query_description, '高热度 · 工具选择');
  assert.strictEqual(q0.golden_query_ranking.all.rank, '-1');
  assert.strictEqual(q0.golden_query_ranking.kimi.score, -99);

  // ================= 场景2：降级通道（chatJson 抛错 → fallbackParse，竞品留空） =================
  DeepseekProto.chatJson = async () => { throw new Error('llm down'); };
  const { task_id: t2, brand_id: b2 } = await ctx.service.onboarding.start(String(user._id), {
    brand_name: '测试降级品牌', website: '', business_desc: '公共座椅 厂家 直销',
  });
  await waitDone(ctx, t2);
  const comps2 = await M('CompetitorRegister').countDocuments({ brand_id: b2 });
  assert.strictEqual(comps2, 0, '降级路径不生成竞品（留待用户手工登记）');
  const qs2 = await M('MonitorQuery').find({ brand_id: b2 }).lean();
  assert.ok(qs2.length >= 5, '降级路径模板合成行业问题');
  assert.ok(qs2.every(q => q.platform_prompt === q.query), '降级路径 platform_prompt 也应默认=query');

  // ================= 场景3：brand_library / onboarding_trace 契约字段 =================
  const lib = await M('BrandLibrary').create({
    brand_id: b1, kind: 'text',
    slug: '品牌口碑与市场处境-品牌挖掘',
    title: '品牌口碑与市场处境(品牌挖掘)',
    tags: ['品牌挖掘', '口碑'],
    source: '品牌挖掘',
    word_count: 438,
    content: '（AI 情报文正文）',
    meta: { _file_size: 1403 },
  });
  const libBack = await M('BrandLibrary').findById(lib._id).lean();
  assert.strictEqual(libBack.slug, '品牌口碑与市场处境-品牌挖掘');
  assert.deepStrictEqual(libBack.tags, ['品牌挖掘', '口碑']);
  assert.strictEqual(libBack.word_count, 438);
  assert.strictEqual(libBack.meta._file_size, 1403);

  for (const kind of ['search_query', 'page_read', 'keyword_weight', 'llm_output', 'user_confirm']) {
    await M('OnboardingTrace').create({ task_id: t1, brand_id: b1, user_id: String(user._id), kind, query: kind === 'search_query' ? '豆绘AI Pic Copilot AI图像工具' : undefined, keyword: kind === 'keyword_weight' ? 'AI绘图' : undefined, weight: kind === 'keyword_weight' ? 10 : undefined });
  }
  const traces = await M('OnboardingTrace').find({ task_id: t1 }).lean();
  assert.strictEqual(traces.length, 5, 'onboarding_traces 五种 kind 各一条');
  await assert.rejects(
    M('OnboardingTrace').create({ task_id: t1, kind: 'bogus_kind' }),
    /validator|validation/i,
    '非法 kind 应被 enum 拒绝',
  );

  DeepseekProto.chatJson = originChatJson;
  await mem.stop();
  try { await app.close(); } catch (e) { /* egg-mock 常驻句柄，允许强退 */ }
  console.log('SMOKE OK: onboarding 字段契约（竞品 source/compet_point、platform_prompt/query_description、golden_query_ranking 映射、library 显式字段、onboarding_traces）全部通过');
  process.exit(0);
}

async function waitDone(ctx, taskId) {
  for (let i = 0; i < 75; i++) {
    const s = await ctx.service.onboarding.status(taskId);
    if (s && s.done) return s;
    if (s && s.stage === 'fail') throw new Error('onboarding fail: ' + s.error);
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('onboarding timeout: ' + taskId);
}

main().catch(e => { console.error('SMOKE FAIL:', e); process.exit(1); });
