'use strict';
/**
 * 归一化：把 LLM 输出收敛到落库契约形状（缺省/截断/去重/钳位），并做得分排序。
 * 所有字段给安全默认，保证「输入品牌+可选链接 → 一定能拿到完整字段集」。
 */

const s = x => String(x == null ? '' : x).trim();
const arrOfStr = (x, max) => (Array.isArray(x) ? x : []).map(s).filter(Boolean).slice(0, max);
const clampInt = (x, lo, hi, dft) => {
  const n = parseInt(x, 10);
  if (Number.isNaN(n)) return dft;
  return Math.max(lo, Math.min(hi, n));
};

function normalizeProfile(raw, input) {
  raw = raw || {};
  const industry = arrOfStr(raw.industary || raw.industry, 3);
  const website = s(raw.website) || s(input.website);
  const brand = {
    name: s(raw.brand_name) || s(input.brand_name) || '未命名品牌',
    company: s(raw.company),
    industry: industry[0] || '',
    website,
    business_desc: s(raw.business_desc) || s(input.business_desc).slice(0, 120),
  };
  const profile = {
    industry,
    website,
    slogan: s(raw.slogan),
    tone: raw.tone && typeof raw.tone === 'object' ? { style: s(raw.tone.style), persona: s(raw.tone.persona) } : { style: '', persona: '' },
    description: s(raw.description) || brand.business_desc,
    scripts: arrOfStr(raw.scripts, 6),
  };
  const aliases = arrOfStr(raw.aliases, 4).filter(a => a && a !== brand.name);
  const products = (Array.isArray(raw.products) ? raw.products : []).map(p => ({
    name: s(p && p.name), category: s(p && p.category), price_range: s(p && p.price_range),
  })).filter(p => p.name).slice(0, 8);
  const competitors = (Array.isArray(raw.competitors) ? raw.competitors : []).map(c => {
    if (typeof c === 'string') return { name: s(c), compet_point: '' };
    return { name: s(c && c.name), compet_point: s(c && (c.compet_point || c.point)) };
  }).filter(c => c.name).slice(0, 6);
  const keywords = arrOfStr(raw.keywords, 8);
  return { brand, profile, aliases, products, competitors, keywords };
}

function normalizeCandidates(raw, { limit = 8 } = {}) {
  const list = (raw && Array.isArray(raw.candidates) ? raw.candidates : []).map(c => {
    const query = s(c && c.query);
    const platformQuery = s(c && c.platform_query) || query;
    return {
      query,
      query_type: c && c.query_type === 'brand' ? 'brand' : 'industry',
      weight: clampInt(c && c.weight, 1, 10, 1),
      is_golden: !!(c && c.is_golden),
      query_description: s(c && c.query_description),
      platform_prompt: s(c && c.platform_prompt) || platformQuery,
      question_list: [ { user_friendly: s(c && c.user_friendly) || query, platform_query: platformQuery } ],
    };
  }).filter(c => c.query);
  // 去重（按 query）→ 热度降序 → 截断
  const seen = new Set();
  const dedup = list.filter(c => (seen.has(c.query) ? false : (seen.add(c.query), true)))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
  // 兜底：LLM 没标金标时，热度前三的 industry 自动金标
  if (!dedup.some(c => c.is_golden)) {
    let marked = 0;
    for (const c of dedup) {
      if (c.query_type === 'industry' && marked < 3) { c.is_golden = true; marked++; }
    }
  }
  return dedup;
}

/** 情报文 → brand_library 契约（slug/tags/source/word_count 显式字段） */
function normalizeLibraryDoc(content, profile) {
  const text = s(content);
  const title = '品牌口碑与市场处境(品牌挖掘)';
  return {
    slug: `品牌口碑与市场处境-品牌挖掘-${s(profile.brand.name) || 'brand'}`.slice(0, 120),
    title,
    tags: ['品牌挖掘', '口碑'],
    source: '品牌挖掘',
    word_count: text.replace(/\s+/g, '').length,
    content: text,
  };
}

module.exports = { normalizeProfile, normalizeCandidates, normalizeLibraryDoc };
