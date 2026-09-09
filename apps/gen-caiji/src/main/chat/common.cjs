'use strict';
/**
 * 对话测试公共工具（CommonJS，主进程用）
 * 参考上传的 types.ts：sleep / ChatLogFn / ChatConversationResult / findVisibleLocator
 */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 依次尝试一组选择器，返回第一个可见的最后一个匹配 locator */
async function findVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).last();
    if ((await locator.count()) === 0) continue;
    const visible = await locator.isVisible().catch(() => false);
    if (visible) return locator;
  }
  return undefined;
}

module.exports = { sleep, findVisibleLocator };
