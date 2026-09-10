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

/**
 * 抓取最后一条回答的纯文本 + 清洗后 HTML（保留标题/列表/表格等原格式）
 * 按 contentSelectors 顺序尝试；同一选择器取「最外层」可见节点。
 * 默认取靠下一条；若明显短于同批最长条（追问卡/引导句），改用最长条，
 * 避免文心等把主回答丢掉只留下「需要我帮你…」尾卡。
 */
async function extractAnswerHtml(page, { contentSelectors, stripSelectors = [] }) {
  return page.evaluate(
    ({ contentSelectors, stripSelectors }) => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const textLen = el =>
        ((el && (el.innerText || el.textContent)) || '').replace(/\s+/g, '').length;

      const candidates = [];
      for (const sel of contentSelectors) {
        const matches = Array.from(document.querySelectorAll(sel)).filter(isVisible);
        if (!matches.length) continue;
        const outers = matches.filter(
          el => !matches.some(other => other !== el && other.contains(el))
        );
        for (const el of outers) {
          if (!candidates.some(c => c === el || c.contains(el) || el.contains(c))) {
            candidates.push(el);
          } else {
            // 若已有祖先/子孙，保留更外层
            const idx = candidates.findIndex(c => c.contains(el) || el.contains(c));
            if (idx >= 0 && el.contains(candidates[idx])) candidates[idx] = el;
          }
        }
      }

      let root = null;
      if (candidates.length) {
        candidates.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y);
        let chosen = candidates[candidates.length - 1];
        const longest = candidates.reduce((a, b) => (textLen(a) >= textLen(b) ? a : b));
        const chosenLen = textLen(chosen);
        const longestLen = textLen(longest);
        if (
          longest &&
          chosen !== longest &&
          (chosenLen < 120 || chosenLen < longestLen * 0.45)
        ) {
          chosen = longest;
        }
        root = chosen;
      }
      if (!(root instanceof HTMLElement)) return { text: '', html: '' };

      const clone = root.cloneNode(true);
      const strip = [
        'script',
        'style',
        'noscript',
        'iframe',
        'button',
        'nav',
        'svg',
        '[class*="toolbar"]',
        '[class*="operation"]',
        '[class*="action-bar"]',
        '[class*="actionBar"]',
        '[class*="feedback"]',
        '[data-foundation-type="receive-message-action-bar"]',
        ...stripSelectors
      ].join(',');
      clone.querySelectorAll(strip).forEach(n => n.remove());

      clone.querySelectorAll('*').forEach(el => {
        for (const attr of Array.from(el.attributes)) {
          if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
          if (
            (attr.name === 'href' || attr.name === 'src') &&
            /^\s*javascript:/i.test(attr.value || '')
          ) {
            el.removeAttribute(attr.name);
          }
        }
      });

      const text = (clone.innerText || clone.textContent || '')
        .replace(/\u00a0/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      return { text, html: (clone.innerHTML || '').trim() };
    },
    { contentSelectors, stripSelectors }
  );
}

module.exports = { sleep, findVisibleLocator, extractAnswerHtml };
