'use strict';
/**
 * 搜索热度验证（可插拔）：
 *  - 配置 SERPAPI_KEY / BING_SEARCH_KEY 时走真实搜索，用命中量给候选重排并赋权 10/9/8…
 *  - 未配置时保留 LLM 自估 weight，trace 标记 source='llm_estimate'（契约诚实，不假装验证过）
 *  - 对标站同款思路：母词去重 → 真实热度 → 排序截断
 */

function createSearchProvider(opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  const serpKey = opts.serpApiKey || process.env.SERPAPI_KEY || '';
  const bingKey = opts.bingKey || process.env.BING_SEARCH_KEY || '';

  if (serpKey) {
    return { name: 'serpapi', query: q => hitCount(`https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${serpKey}`, fetchImpl, j => j && j.search_information && j.search_information.total_results) };
  }
  if (bingKey) {
    return {
      name: 'bing',
      query: q => hitCount(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(q)}&count=1`, fetchImpl, j => j && j.webPages && j.webPages.totalEstimatedMatches, { 'Ocp-Apim-Subscription-Key': bingKey }),
    };
  }
  return null; // 未配置 → 调用侧走 llm_estimate
}

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

/**
 * 联网检索（供 tool-calling 循环调用的真实搜索执行器）：
 * 返回 [{ title, url, snippet }]；未配置任何 key 返回 null（调用侧降级不联网）
 */
function createWebSearch(opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  const serpKey = opts.serpApiKey || process.env.SERPAPI_KEY || '';
  const bingKey = opts.bingKey || process.env.BING_SEARCH_KEY || '';
  const limit = opts.limit || 6;

  if (serpKey) {
    return { name: 'serpapi', async search(query) {
      try {
        const resp = await fetchImpl(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpKey}`, { signal: AbortSignal.timeout(12000) });
        if (!resp.ok) return [];
        const j = await resp.json();
        return (j.organic_results || []).slice(0, limit)
          .map(r => ({ title: r.title || '', url: r.link || '', snippet: r.snippet || '' }))
          .filter(r => r.url);
      } catch (e) { return []; }
    } };
  }
  if (bingKey) {
    return { name: 'bing', async search(query) {
      try {
        const resp = await fetchImpl(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${limit}`, {
          headers: { 'Ocp-Apim-Subscription-Key': bingKey }, signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) return [];
        const j = await resp.json();
        return (((j.webPages || {}).value) || []).slice(0, limit)
          .map(r => ({ title: r.name || '', url: r.url || '', snippet: r.snippet || '' }))
          .filter(r => r.url);
      } catch (e) { return []; }
    } };
  }
  return null;
}

module.exports = { createSearchProvider, createWebSearch, reweightBySearch };
