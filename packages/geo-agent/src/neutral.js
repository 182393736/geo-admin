'use strict';
/**
 * 监控问题「品牌中立」闸门
 * ------------------------------------------------------------------
 * 业务前提：客户想知道的是——**行业里的真实用户向 AI 提问时，AI 会不会主动提到我的品牌**。
 * 所以监控问题必须是完全中立的中立行业问法。一旦问题里带了品牌名（或别名/公司主体名），
 * AI 的回答必然提到该品牌，提及率/排名/口碑指标立刻失真（等于自问自答），监测就失去意义。
 *
 * 因此这里是**代码级硬闸门**，不依赖提示词自觉：
 *   1) buildBrandTokens  从画像收敛出「品牌指纹」黑名单（品牌名/别名/公司名/域名主体）
 *   2) findBrandToken    归一化后子串匹配（大小写、全半角、空格、中英文标点无关）
 *   3) filterBrandMentions  命中即剔除，并把命中原因回吐给调用侧留痕
 *
 * 为什么黑名单不含产品名与关键词：产品名常与品类词重合（如「图生图」「图像助理」），
 * 纳入会误杀正常行业问法（「AI图生图工具有哪些推荐」）；品牌名/别名/公司名则不存在这种歧义。
 */

/** 归一化：全角→半角、转小写、去掉空白与标点，让「HANYUAI 图像助理」与「hanyuai图像助理」等价 */
function normText(t) {
  return String(t == null ? '' : t)
    .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)) // 全角→半角
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '');
}

/**
 * 过于通用、放进黑名单会误杀正常行业问题的词。
 * 例如品牌名恰好叫「智能」时，「智能家居怎么选」这种正当行业问法不该被剔。
 */
const GENERIC = new Set([
  'ai', 'aigc', '人工智能', '品牌', '官网', '公司', '企业', '产品', '服务', '平台', '工具', '软件',
  '系统', '方案', '技术', '科技', '智能', '推荐', '排名', '对比', '测评', '口碑', '怎么样', '好不好',
  '哪个好', '哪个好用', '厂家', '供应商', '价格', '多少钱', '选购', '指南', '大全', '官网入口',
]);

/** 域名里不代表品牌主体的标签 */
const DOMAIN_NOISE = new Set([
  'www', 'com', 'cn', 'net', 'org', 'co', 'io', 'ai', 'app', 'me', 'cc', 'top', 'xyz',
  'hk', 'tw', 'jp', 'us', 'uk', 'de', 'info', 'biz', 'shop', 'store', 'group', 'inc',
]);

/** 域名 → 品牌主体标签（https://www.hanyuai.com → hanyuai） */
function domainTokens(website) {
  const host = String(website || '')
    .replace(/^[a-z]+:\/\//i, '')
    .split(/[/?#]/)[0]
    .toLowerCase();
  if (!host || !host.includes('.')) return [];
  return host.split('.')
    .filter(l => l.length >= 2 && !DOMAIN_NOISE.has(l) && !/^\d+$/.test(l));
}

/**
 * 从画像/入参收敛「品牌指纹」黑名单（已归一化、去重、去通用词）
 * @param {object} src { name, company, aliases, website, extra }
 * @returns {string[]} 归一化 token 列表
 */
function buildBrandTokens(src = {}) {
  const raw = [
    src.name,
    src.company,
    ...(Array.isArray(src.aliases) ? src.aliases : []),
    ...domainTokens(src.website),
    ...(Array.isArray(src.extra) ? src.extra : []),
  ];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const tok = normText(item);
    // 太短（1 字符）或通用词一律不进黑名单，否则误杀正常行业问法
    if (tok.length < 2 || GENERIC.has(tok) || seen.has(tok)) continue;
    seen.add(tok);
    out.push(tok);
  }
  // 长 token 优先匹配，命中原因更具可读性
  return out.sort((a, b) => b.length - a.length);
}

/**
 * 文本里是否出现品牌指纹
 * @returns {string|null} 命中的 token（未命中返回 null）
 */
function findBrandToken(text, tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return null;
  const hay = normText(text);
  if (!hay) return null;
  for (const tok of tokens) if (hay.includes(tok)) return tok;
  return null;
}

/** 候选问题的全部可展示/可发问文本字段（query 与真正投喂引擎的 platform_query 都要查） */
function candidateTexts(c) {
  const list = (c && Array.isArray(c.question_list) ? c.question_list : []);
  return [
    c && c.query,
    c && c.platform_prompt,
    ...list.map(q => q && q.user_friendly),
    ...list.map(q => q && q.platform_query),
  ];
}

/** 一条候选问题是否含品牌指纹（返回命中的 token 或 null） */
function findBrandTokenInCandidate(c, tokens) {
  for (const t of candidateTexts(c)) {
    const hit = findBrandToken(t, tokens);
    if (hit) return hit;
  }
  return null;
}

/**
 * 候选问题数组过闸门
 * @returns {{kept: object[], dropped: Array<{candidate: object, token: string}>}}
 */
function filterBrandMentions(candidates, tokens) {
  const kept = [];
  const dropped = [];
  for (const c of (Array.isArray(candidates) ? candidates : [])) {
    const hit = findBrandTokenInCandidate(c, tokens);
    if (hit) dropped.push({ candidate: c, token: hit });
    else kept.push(c);
  }
  return { kept, dropped };
}

/**
 * 纯字符串问题数组过闸门（旧版 onboarding 路径用：industry_queries 是 string[]）
 * @returns {{kept: string[], dropped: Array<{query: string, token: string}>}}
 */
function filterBrandMentionStrings(questions, tokens) {
  const kept = [];
  const dropped = [];
  for (const q of (Array.isArray(questions) ? questions : [])) {
    const hit = findBrandToken(q, tokens);
    if (hit) dropped.push({ query: q, token: hit });
    else kept.push(q);
  }
  return { kept, dropped };
}

module.exports = {
  normText,
  GENERIC,
  buildBrandTokens,
  findBrandToken,
  findBrandTokenInCandidate,
  filterBrandMentions,
  filterBrandMentionStrings,
};
