'use strict';
/**
 * sanitizePreview：确认落库前的不可信输入清洗
 * 浏览器回传的 preview（agent 分析结果）必须重新过一遍归一化管线，
 * 截断/枚举校验/形状重建全部重做，等价于服务端重新生成。
 */

const { normalizeProfile, normalizeCandidates, normalizeLibraryDoc } = require('./normalize');
const { buildBrandTokens } = require('./neutral');

const TRACE_KINDS = new Set(['search_query', 'page_read', 'keyword_weight', 'llm_output', 'user_confirm']);
const str = (x, max) => (typeof x === 'string' && x ? x.slice(0, max) : undefined);
const num = x => (typeof x === 'number' && Number.isFinite(x) ? x : undefined);

function sanitizePreview(p) {
  p = p && typeof p === 'object' ? p : {};
  const brand = p.brand || {};
  const prof0 = p.profile || {};

  // 画像段重建：把 result 形状映射回 normalizeProfile 的原料形状
  const norm = normalizeProfile({
    brand_name: brand.name,
    company: brand.company,
    industary: prof0.industry || (brand.industry ? [brand.industry] : []),
    website: brand.website || prof0.website,
    slogan: prof0.slogan,
    business_desc: brand.business_desc,
    description: prof0.description,
    scripts: prof0.scripts,
    tone: prof0.tone,
    aliases: p.aliases,
    products: p.products,
    competitors: p.competitors,
    keywords: p.keywords,
  }, { brand_name: brand.name, website: brand.website, business_desc: brand.business_desc });

  // 候选问题段重建：从 question_list 还原 user_friendly/platform_query 原料字段
  const rawCandidates = (Array.isArray(p.candidates) ? p.candidates : []).map(c => ({
    query: c && c.query,
    query_type: c && c.query_type,
    weight: c && c.weight,
    is_golden: c && c.is_golden,
    query_description: c && c.query_description,
    platform_prompt: c && c.platform_prompt,
    platform_query: (c && c.platform_query) || (c && c.question_list && c.question_list[0] && c.question_list[0].platform_query),
    user_friendly: (c && c.user_friendly) || (c && c.question_list && c.question_list[0] && c.question_list[0].user_friendly),
  }));
  // 品牌中立闸门：浏览器回传的 preview 属不可信输入，按重建后的画像再过一遍黑名单
  // （否则用户可在确认前手工塞进「XX品牌怎么样」这类自问自答题，把监测指标做假）
  const brandTokens = buildBrandTokens({
    name: norm.brand.name,
    company: norm.brand.company,
    aliases: norm.aliases,
    website: norm.profile.website || norm.brand.website,
  });
  const candidates = normalizeCandidates({ candidates: rawCandidates }, { limit: 10, brandTokens });

  // 情报文段：正文重新计字数；slug 由品牌名重新生成（幂等 upsert 键）
  const lib0 = p.library_doc || {};
  const library_doc = normalizeLibraryDoc(str(lib0.content, 20000) || '', norm);

  // 过程留痕：类型白名单 + 单条截断 + 总量封顶
  const traces = (Array.isArray(p.traces) ? p.traces : [])
    .filter(t => t && TRACE_KINDS.has(t.kind))
    .slice(0, 200)
    .map(t => ({
      kind: t.kind,
      query: str(t.query, 300),
      url: str(t.url, 500),
      snapshot: str(t.snapshot, 1000),
      keyword: str(t.keyword, 200),
      weight: num(t.weight),
      meta: t.meta && typeof t.meta === 'object' ? t.meta : undefined,
    }));

  return { ...norm, candidates, library_doc, traces };
}

module.exports = { sanitizePreview };
