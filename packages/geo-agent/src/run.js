'use strict';
/**
 * 编排器：品牌名+官网(可选) → 完整数据
 * 流程（每步既发事件也写 trace，kind 对齐 onboarding_traces 枚举）：
 *   crawl(page_read) → profile(llm_output) → queries(llm_output)
 *   → reweight(keyword_weight + search_query) → library(llm_output) → done
 * 库不 import egg/mongoose；模型由 persist.js 侧注入。
 */

const { crawlPage } = require('./crawl');
const { profilePrompts, queriesPrompts, libraryPrompts } = require('./prompts');
const { normalizeProfile, normalizeCandidates, normalizeLibraryDoc } = require('./normalize');
const { reweightBySearch } = require('./search');

/**
 * @param {object} deps   { llm, searchProvider?, crawl?:boolean, fetchImpl?, logger? }
 * @param {object} input  { brand_name, website?, business_desc?, query_limit?=8 }
 * @param {function} [onEvent]  ({type, ...}) 过程实况（SSE 直推用）
 */
async function runOnboarding(deps, input, onEvent) {
  if (!deps || !deps.llm) throw new Error('geo-agent: deps.llm 必填');
  const traces = [];
  const usage = [];
  const push = (kind, fields, meta) => {
    const t = { kind, ...fields, meta: meta || undefined };
    traces.push(t);
    if (onEvent) onEvent({ type: 'trace', ...t });
    return t;
  };
  const stage = name => { if (onEvent) onEvent({ type: 'stage', stage: name }); };

  // ---- 1. crawl（可选，失败不阻断） ----
  stage('crawl');
  let site = null;
  if (input.website && deps.crawl !== false) {
    site = await crawlPage(input.website, { fetchImpl: deps.fetchImpl });
    push('page_read', { url: site.url || input.website, snapshot: (site.text || '').slice(0, 500) },
      { ok: site.ok, title: site.title, error: site.error || undefined });
  }

  // ---- 2. 画像抽取 ----
  stage('analyze');
  const p = profilePrompts(input, site);
  const prof = await deps.llm.chatJson({ system: p.sys, user: p.user, schemaHint: p.schemaHint });
  usage.push({ step: 'profile', usage: prof.usage });
  push('llm_output', {}, { step: 'profile', input_chars: p.user.length, raw_chars: (prof.content || '').length });
  const profile = normalizeProfile(prof.data, input);
  if (onEvent) onEvent({ type: 'profile', brand: profile.brand, competitors: profile.competitors.length, aliases: profile.aliases });

  // ---- 3. 监控问题候选 ----
  stage('queries');
  const limit = Math.max(3, Math.min(10, parseInt(input.query_limit, 10) || 8));
  const qp = queriesPrompts(profile, profile.keywords, limit);
  const qr = await deps.llm.chatJson({ system: qp.sys, user: qp.user, schemaHint: qp.schemaHint });
  usage.push({ step: 'queries', usage: qr.usage });
  push('llm_output', {}, { step: 'queries', input_chars: qp.user.length, raw_chars: (qr.content || '').length });
  let candidates = normalizeCandidates(qr.data, { limit });

  // ---- 4. 热度验证（配置了搜索 key 才真实重排，否则诚实标记 llm_estimate） ----
  stage('weigh');
  const source = await reweightBySearch(candidates, deps.searchProvider || null, t => push(t.kind, t, t.meta));
  for (const c of candidates) {
    push('keyword_weight', { keyword: c.query, weight: c.weight }, { source, is_golden: c.is_golden, query_description: c.query_description });
  }
  if (onEvent) onEvent({ type: 'candidates', count: candidates.length, weight_source: source, candidates });

  // ---- 5. 情报文（知识库 text 文档，长文本不走 JSON Mode） ----
  stage('library');
  const lp = libraryPrompts(profile, candidates);
  const lib = await deps.llm.chat(
    [ { role: 'system', content: lp.sys }, { role: 'user', content: lp.user } ],
    { jsonMode: false, temperature: 0.5, maxTokens: 2000 },
  ).then(r => {
    usage.push({ step: 'library', usage: r.usage });
    push('llm_output', {}, { step: 'library', raw_chars: (r.content || '').length });
    return normalizeLibraryDoc(r.content, profile);
  });
  if (onEvent) onEvent({ type: 'library', slug: lib.slug, word_count: lib.word_count });

  stage('done');
  const result = {
    input: { brand_name: input.brand_name || '', website: input.website || '', business_desc: input.business_desc || '' },
    ...profile,
    candidates,
    library_doc: lib,
    weight_source: source,
    traces,
    usage,
    llm_model: deps.llm.model || null,
    generated_at: new Date().toISOString(),
  };
  if (onEvent) onEvent({ type: 'done', counts: {
    aliases: profile.aliases.length, products: profile.products.length,
    competitors: profile.competitors.length, candidates: candidates.length, traces: traces.length,
  } });
  return result;
}

module.exports = { runOnboarding };
