'use strict';
/**
 * 搜索（可插拔，密钥只走环境变量，严禁入库）：
 *  - 联网取证 createWebSearch：Tavily（LLM 专用检索，返回清洗后正文而非 SERP 摘要）
 *      · 工具循环里 DeepSeek 主动调 web_search → 本模块执行真实 Tavily 检索 → 结果回填
 *      · 未配 TAVILY_API_KEY 返回 null（调用侧降级不联网，诚实标 llm_estimate）
 *  - 热度验证 createSearchProvider：现阶段无 Provider（诚实降级 llm_estimate）
 *      · Tavily 不返回"总命中数"，与热度语义不匹配，不挪用
 *      · Bing Search API 已于 2025-08-11 退役（存量 key 全部失效）；SerpAPI 待定
 *      · 自建搜索就绪后：恢复/新增分支，返回 { name, query(q) -> number|null } 即可
 */

function createSearchProvider(opts = {}) {
  void opts; // 现阶段恒 null；保留入参签名，自建搜索接入时恢复下方分支
  // [停用] SerpAPI：Google 总命中量，热度语义正确；需要时取消注释
  // const serpKey = opts.serpApiKey || process.env.SERPAPI_KEY || '';
  // if (serpKey) {
  //   return { name: 'serpapi', query: q => hitCount(`https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${serpKey}`, globalThis.fetch, j => j && j.search_information && j.search_information.total_results) };
  // }
  // [停用] Bing：官方 Search API 已于 2025-08-11 退役，不再可用
  // const bingKey = opts.bingKey || process.env.BING_SEARCH_KEY || '';
  // if (bingKey) {
  //   return { name: 'bing', query: q => hitCount(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(q)}&count=1`, globalThis.fetch, j => j && j.webPages && j.webPages.totalEstimatedMatches, { 'Ocp-Apim-Subscription-Key': bingKey }) };
  // }
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

/**
 * 联网检索（供 tool-calling 循环调用的真实搜索执行器）：
 * 返回 [{ title, url, snippet }]；未配置任何 key 返回 null（调用侧降级不联网）
 * Tavily：POST /search（Bearer 鉴权），basic 档 1 credit/次，content 为清洗后正文（远厚于 SERP 摘要）
 */
function createWebSearch(opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  const tavilyKey = opts.tavilyKey || process.env.TAVILY_API_KEY || '';
  const limit = opts.limit || 6;

  if (tavilyKey) {
    return { name: 'tavily', async search(query) {
      try {
        const resp = await fetchImpl('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tavilyKey}` },
          body: JSON.stringify({
            query,
            max_results: limit,
            search_depth: 'basic',     // 1 credit/次；advanced=2 credits 更厚更慢，取证场景不需要
            include_answer: false,     // 推理由自家 DeepSeek 做，不为 Tavily 的答案摘要多花 credit
          }),
          signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) return [];
        const j = await resp.json();
        return (j.results || []).slice(0, limit)
          .map(r => ({ title: r.title || '', url: r.url || '', snippet: (r.content || '').slice(0, 500) })) // content→snippet，截断控工具消息 token
          .filter(r => r.url);
      } catch (e) { return []; }
    } };
  }

  // [停用] SerpAPI：Google 有机结果（中文覆盖最强）；待自建搜索或需 Google 兜底时恢复
  // const serpKey = opts.serpApiKey || process.env.SERPAPI_KEY || '';
  // if (serpKey) {
  //   return { name: 'serpapi', async search(query) {
  //     try {
  //       const resp = await fetchImpl(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpKey}`, { signal: AbortSignal.timeout(12000) });
  //       if (!resp.ok) return [];
  //       const j = await resp.json();
  //       return (j.organic_results || []).slice(0, limit)
  //         .map(r => ({ title: r.title || '', url: r.link || '', snippet: r.snippet || '' }))
  //         .filter(r => r.url);
  //     } catch (e) { return []; }
  //   } };
  // }
  // [停用] Bing：官方 Search API 已于 2025-08-11 退役，不再可用
  // const bingKey = opts.bingKey || process.env.BING_SEARCH_KEY || '';
  // if (bingKey) {
  //   return { name: 'bing', async search(query) {
  //     try {
  //       const resp = await fetchImpl(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${limit}`, {
  //         headers: { 'Ocp-Apim-Subscription-Key': bingKey }, signal: AbortSignal.timeout(12000),
  //       });
  //       if (!resp.ok) return [];
  //       const j = await resp.json();
  //       return (((j.webPages || {}).value) || []).slice(0, limit)
  //         .map(r => ({ title: r.name || '', url: r.url || '', snippet: r.snippet || '' }))
  //         .filter(r => r.url);
  //     } catch (e) { return []; }
  //   } };
  // }
  return null;
}

module.exports = { createSearchProvider, createWebSearch, reweightBySearch };
