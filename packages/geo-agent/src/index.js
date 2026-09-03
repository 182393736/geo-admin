'use strict';
/**
 * @geo-admin/geo-agent —— GEO 首登分析 Agent（纯 CJS 零依赖）
 * 用法：
 *   const { createSiliconFlowClient, runOnboarding, persistResult } = require('@geo-admin/geo-agent');
 *   const llm = createSiliconFlowClient({ apiKey: process.env.SILICONFLOW_API_KEY });
 *   const result = await runOnboarding({ llm }, { brand_name, website?, business_desc? }, onEvent?);
 *   await persistResult(models, { userId, result, nextSeq, selectedQueries? });
 */
const { createSiliconFlowClient } = require('./llm');
const { createSearchProvider, createWebSearch } = require('./search');
const { runOnboarding } = require('./run');
const { persistResult } = require('./persist');
const { crawlPage } = require('./crawl');
const { sanitizePreview } = require('./sanitize');
const { normalizeProfile, normalizeCandidates, normalizeLibraryDoc } = require('./normalize');
const { buildBrandTokens, findBrandToken, findBrandTokenInCandidate, filterBrandMentions, filterBrandMentionStrings } = require('./neutral');
const { NEUTRAL_RULES } = require('./prompts');
const { DEV_KEYS, resolveKey, devKeysEnabled } = require('./dev-keys');

module.exports = {
  createSiliconFlowClient, createSearchProvider, createWebSearch, runOnboarding, persistResult, crawlPage,
  sanitizePreview, normalizeProfile, normalizeCandidates, normalizeLibraryDoc,
  // 监控问题「品牌中立」闸门（宿主侧生成问题时应复用同一套黑名单口径）
  buildBrandTokens, findBrandToken, findBrandTokenInCandidate, filterBrandMentions, filterBrandMentionStrings,
  NEUTRAL_RULES,
  DEV_KEYS, resolveKey, devKeysEnabled,
};
