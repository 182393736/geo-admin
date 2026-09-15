'use strict';
/**
 * 搜索（可插拔；密钥优先级：显式入参 > 环境变量 > src/dev-keys.js 内置测试密钥）：
 *  - 联网取证 createWebSearch：
 *      · 主：博查 Web Search（summary:true，国内源；POST https://api.bochaai.com/v1/web-search）
 *      · 备：Tavily（博查出错时回退；清洗正文 → snippet）
 *      · 工具循环里 DeepSeek 主动调 web_search → 本模块执行真实检索 → 结果回填
 *      · 每次 search() 后 lastEngine / lastFallback / lastError 供留痕（管理后台可见）
 *      · 两家 key 皆空 → null（降级不联网，诚实标 llm_estimate）
 *  - 热度验证 createSearchProvider：现阶段无 Provider（诚实降级 llm_estimate）
 *      · Tavily 不返回"总命中数"，与热度语义不匹配，不挪用
 *      · Bing Search API 已于 2025-08-11 退役；SerpAPI 待定
 *      · 博查响应含 totalEstimatedMatches，自建热度时可接
 */

const { resolveKey } = require('./dev-keys');

const SNIPPET_MAX = 500;
const BOCHA_URL = 'https://api.bochaai.com/v1/web-search';
const TAVILY_URL = 'https://api.tavily.com/search';

function createSearchProvider(opts = {}) {
  void opts; // 现阶段恒 null；保留入参签名，自建搜索接入时恢复下方分支
  return null; // 未配置 → 调用侧走 llm_estimate
}

/**
 * 通用命中量取数（供自建搜索 Provider 复用）：非 2xx / 超时 / 字段缺失 → null
 */
async function hitCount(url, fetchImpl, pick, headers = {}) {
  try {
    const resp = await fetchImpl(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return null;
    const j = await resp.json();
    const n = pick(j);
    return typeof n === 'number' && n >= 0 ? n : null;
  } catch (e) {
    return null;
  }
}

/**
 * 用真实命中量给候选重排：count 多的排前，weight 依次 10,9,8…
 * 任一候选取不到 count 时整体放弃重排（保持 LLM 估计），返回实际采用的 source。
 */
async function reweightBySearch(candidates, provider, trace) {
  if (!provider || !candidates.length) return 'llm_estimate';
  const counts = await Promise.all(candidates.map(async c => {
    const n = await provider.query(c.query);
    if (trace) trace({ kind: 'search_query', query: c.query, meta: { engine: provider.name, total: n } });
    return n;
  }));
  if (counts.some(n => n === null)) return 'llm_estimate';
  const order = candidates.map((c, i) => i).sort((a, b) => counts[b] - counts[a]);
  order.forEach((candIdx, rank) => {
    candidates[candIdx].weight = Math.max(1, 10 - rank); // 10/9/8... 递减截断
    candidates[candIdx].is_golden = rank < 3 && candidates[candIdx].query_type === 'industry';
  });
  candidates.sort((a, b) => b.weight - a.weight);
  return 'real_search';
}

function clipSnippet(text) {
  return String(text || '').slice(0, SNIPPET_MAX);
}

async function searchBocha(query, { apiKey, fetchImpl, limit }) {
  const resp = await fetchImpl(BOCHA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      query,
      count: limit,
      summary: true,       // 网页原文摘要，厚于 SERP snippet
      freshness: 'noLimit',
    }),
    signal: AbortSignal.timeout(12000),
  });
  const text = await resp.text().catch(() => '');
  if (!resp.ok) {
    throw new Error(`bocha http ${resp.status}: ${text.slice(0, 200)}`);
  }
  let j;
  try { j = JSON.parse(text || '{}'); } catch (e) {
    throw new Error(`bocha bad json: ${text.slice(0, 120)}`);
  }
  // 官方包装：{ code, data: { webPages: { value } } }；偶发直出 Bing 形态
  if (j.code != null && Number(j.code) !== 200) {
    throw new Error(`bocha code ${j.code}: ${String(j.msg || text).slice(0, 200)}`);
  }
  const pages = (j.data && j.data.webPages && j.data.webPages.value)
    || (j.webPages && j.webPages.value)
    || [];
  if (!Array.isArray(pages)) {
    throw new Error('bocha unexpected webPages.value');
  }
  return pages.slice(0, limit)
    .map(r => ({
      title: r.name || r.title || '',
      url: r.url || '',
      snippet: clipSnippet(r.summary || r.snippet || ''),
    }))
    .filter(r => r.url);
}

async function searchTavily(query, { apiKey, fetchImpl, limit }) {
  const resp = await fetchImpl(TAVILY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      query,
      max_results: limit,
      search_depth: 'basic',
      include_answer: false,
    }),
    signal: AbortSignal.timeout(12000),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`tavily http ${resp.status}: ${text.slice(0, 200)}`);
  }
  const j = await resp.json();
  return (j.results || []).slice(0, limit)
    .map(r => ({
      title: r.title || '',
      url: r.url || '',
      snippet: clipSnippet(r.content || ''),
    }))
    .filter(r => r.url);
}

/**
 * 联网检索（供 tool-calling 循环调用的真实搜索执行器）：
 * 返回 [{ title, url, snippet }]；未配置任何 key 返回 null（调用侧降级不联网）
 * 副作用字段（每次 search 后更新，供 onboarding 留痕 / 管理后台）：
 *   lastEngine  — 本次实际使用的引擎 bocha | tavily
 *   lastFallback — 是否从博查回退到了 Tavily
 *   lastError   — 主引擎失败原因（有回退时保留）
 *
 * 密钥：显式入参（含空串=强制不用）优先；未传字段才走 env / dev-keys。
 */
function createWebSearch(opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  const pick = (envName, explicit) => (
    explicit !== undefined && explicit !== null
      ? String(explicit).trim()
      : resolveKey(envName)
  );
  const bochaKey = pick('BOCHA_API_KEY', opts.bochaKey);
  const tavilyKey = pick('TAVILY_API_KEY', opts.tavilyKey);
  const limit = opts.limit || 6;

  if (!bochaKey && !tavilyKey) return null;

  const primary = bochaKey ? 'bocha' : 'tavily';
  const provider = {
    name: primary,
    lastEngine: null,
    lastFallback: false,
    lastError: null,
    async search(query) {
      provider.lastEngine = null;
      provider.lastFallback = false;
      provider.lastError = null;
      const q = String(query || '');

      if (bochaKey) {
        try {
          const results = await searchBocha(q, { apiKey: bochaKey, fetchImpl, limit });
          provider.lastEngine = 'bocha';
          return results;
        } catch (e) {
          provider.lastError = String(e && e.message || e).slice(0, 300);
          if (!tavilyKey) {
            provider.lastEngine = 'bocha';
            return [];
          }
          // 博查出错 → Tavily 兜底
        }
      }

      if (tavilyKey) {
        try {
          const results = await searchTavily(q, { apiKey: tavilyKey, fetchImpl, limit });
          provider.lastEngine = 'tavily';
          provider.lastFallback = !!bochaKey; // 有主引擎才算 fallback
          return results;
        } catch (e) {
          if (!provider.lastError) {
            provider.lastError = String(e && e.message || e).slice(0, 300);
          }
          provider.lastEngine = 'tavily';
          provider.lastFallback = !!bochaKey;
          return [];
        }
      }

      return [];
    },
  };
  return provider;
}

module.exports = { createSearchProvider, createWebSearch, reweightBySearch };
