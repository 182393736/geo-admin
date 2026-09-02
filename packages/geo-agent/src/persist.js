'use strict';
/**
 * 落库（sinks）：宿主注入 mongoose models 与 nextSeq，本库不 import egg/mongoose。
 * 契约与 service/onboarding.js 同源：竞品=品牌挖掘、platform_prompt 默认=query、
 * candidates 支持用户勾选子集（selectedQueries）→ 写 user_confirm trace。
 */

/**
 * @param {object} models  { Brand, BrandProfile, BrandAlias, BrandProduct, CompetitorRegister, BrandLibrary, MonitorQuery, OnboardingTrace, OnboardingTask? }
 * @param {object} opts    { userId, brandId?, taskId?, result, nextSeq?, selectedQueries?, confirmLimit? }
 */
async function persistResult(models, opts) {
  const { result } = opts;
  if (!result) throw new Error('geo-agent.persist: opts.result 必填');
  const need = ['Brand', 'BrandProfile', 'BrandAlias', 'BrandProduct', 'CompetitorRegister', 'BrandLibrary', 'MonitorQuery', 'OnboardingTrace'];
  for (const k of need) if (!models[k]) throw new Error(`geo-agent.persist: models.${k} 必填`);
  const counts = { aliases: 0, products: 0, competitors: 0, queries: 0, library: 0, traces: 0 };

  // ---- 品牌主档：有 brandId 更新，无则新建（is_first_brand 看存量） ----
  let brandId = opts.brandId;
  if (brandId) {
    await models.Brand.updateOne({ brand_id: brandId }, { $set: {
      name: result.brand.name, industry: result.brand.industry || '',
      website: result.brand.website || '', business_desc: result.brand.business_desc || '',
      status: 'active',
    } });
  } else {
    const existing = await models.Brand.countDocuments({ user_id: opts.userId, status: { $ne: 'disabled' } });
    const doc = await models.Brand.create({
      user_id: opts.userId,
      name: result.brand.name, industry: result.brand.industry || '',
      website: result.brand.website || '', business_desc: result.brand.business_desc || '',
      status: 'active', is_first_brand: existing === 0,
    });
    brandId = doc.brand_id;
  }

  // ---- 画像（含 industry[]/slogan/tone/description/scripts） ----
  await models.BrandProfile.updateOne({ brand_id: brandId }, { $set: {
    brand_id: brandId,
    industry: result.profile.industry, website: result.profile.website,
    slogan: result.profile.slogan, tone: result.profile.tone,
    description: result.profile.description, scripts: result.profile.scripts,
    seeded_from_db: false, exists: true,
  } }, { upsert: true });

  // ---- 别名 ----
  for (const a of result.aliases || []) {
    await models.BrandAlias.updateOne(
      { brand_id: brandId, alias: a },
      { $setOnInsert: { brand_id: brandId, alias: a, source: 'auto', enabled: true } },
      { upsert: true },
    ).then(() => { counts.aliases++; }).catch(() => {});
  }

  // ---- 产品线 ----
  for (const p of result.products || []) {
    await models.BrandProduct.updateOne(
      { brand_id: brandId, name: p.name },
      { $setOnInsert: { brand_id: brandId, name: p.name, category: p.category || '', price_range: p.price_range || '' } },
      { upsert: true },
    ).then(() => { counts.products++; }).catch(() => {});
  }

  // ---- 竞品（source=品牌挖掘 + compet_point 竞争点） ----
  for (const c of result.competitors || []) {
    await models.CompetitorRegister.updateOne(
      { brand_id: brandId, name: c.name },
      { $setOnInsert: { brand_id: brandId, name: c.name, source: '品牌挖掘', compet_point: c.compet_point || '', enabled: true } },
      { upsert: true },
    ).then(() => { counts.competitors++; }).catch(() => {});
  }

  // ---- 情报文（library text，slug 幂等覆盖） ----
  if (result.library_doc && result.library_doc.content) {
    const d = result.library_doc;
    await models.BrandLibrary.updateOne({ brand_id: brandId, slug: d.slug }, { $set: {
      brand_id: brandId, kind: 'text', slug: d.slug, title: d.title,
      tags: d.tags, source: d.source, word_count: d.word_count, content: d.content,
    } }, { upsert: true }).then(() => { counts.library = 1; }).catch(() => {});
  }

  // ---- 监控问题：勾选子集优先；全部保存时受 confirmLimit 截断 ----
  let selected = result.candidates || [];
  if (Array.isArray(opts.selectedQueries) && opts.selectedQueries.length) {
    const wanted = new Set(opts.selectedQueries);
    selected = selected.filter(c => wanted.has(c.query));
  }
  if (opts.confirmLimit) selected = selected.slice(0, opts.confirmLimit);
  let order = 0;
  for (const c of selected) {
    try {
      const qid = opts.nextSeq ? await opts.nextSeq('monitor_query') : undefined;
      await models.MonitorQuery.create({
        query_id: qid, user_id: opts.userId, brand_id: brandId,
        query: c.query, question_list: c.question_list,
        platform_prompt: c.platform_prompt, query_description: c.query_description,
        query_type: c.query_type, weight: c.weight, is_golden: !!c.is_golden,
        query_order: ++order, task_id: opts.taskId || undefined,
      });
      counts.queries++;
    } catch (e) { /* 单条失败不阻断整体 */ }
  }

  // ---- 过程留痕 + 确认留痕 ----
  const traceDocs = (result.traces || []).map(t => ({
    task_id: opts.taskId || undefined, brand_id: brandId, user_id: opts.userId,
    kind: t.kind, query: t.query, url: t.url, snapshot: t.snapshot,
    keyword: t.keyword, weight: t.weight, meta: t.meta,
  })).filter(t => t.kind);
  if (opts.selectedQueries) {
    traceDocs.push({
      task_id: opts.taskId || undefined, brand_id: brandId, user_id: opts.userId,
      kind: 'user_confirm', meta: { selected: selected.map(c => c.query), limit: opts.confirmLimit || null },
    });
  }
  if (traceDocs.length) {
    await models.OnboardingTrace.insertMany(traceDocs, { ordered: false }).then(r => { counts.traces = r.length; }).catch(() => {});
  }

  // ---- 任务状态机联动（可选） ----
  if (opts.taskId && models.OnboardingTask) {
    await models.OnboardingTask.updateOne({ task_id: opts.taskId }, { $set: {
      stage: 'done', keyword_gen_completed_at: new Date(),
      keywords: result.keywords || [],
      generated_question_list: (result.candidates || []).map(c => ({ query: c.query, weight: c.weight, is_golden: c.is_golden })),
    } }).catch(() => {});
  }

  return { brand_id: brandId, counts };
}

module.exports = { persistResult };
