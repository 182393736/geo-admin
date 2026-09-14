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

/**
 * 截取完整回答（含超长内容）：
 * 按平台锚定「最后一条 AI 回答」卡片，撑开裁剪祖先后再截该元素。
 * 避免误选左侧历史会话栏（DeepSeek / 文心常见问题）。
 * @param {import('playwright').Page} page
 * @param {{ platform?: string }} [opts]
 */
async function captureConversationScreenshot(page, opts = {}) {
  await page.bringToFront().catch(() => {});
  const platform = String(opts.platform || '');

  await page.evaluate(platformKey => {
    const isEl = n => n instanceof HTMLElement;
    const isVisible = el => {
      if (!isEl(el)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const textLen = el => ((el && (el.innerText || el.textContent)) || '').replace(/\s+/g, '').length;

    /** 侧栏/历史：窄且贴左，或 class 暗示 */
    const looksLikeSidebar = el => {
      if (!isEl(el)) return true;
      const r = el.getBoundingClientRect();
      const cls = String(el.className || '');
      if (/sidebar|side-bar|aside|history|session-list|conv-list|nav-list/i.test(cls)) return true;
      if (r.width > 0 && r.width < 380 && r.left < 80 && r.height > 200) return true;
      return false;
    };

    const answerSelectorsByPlatform = {
      deepseek: ['.ds-markdown', '[class*="ds-markdown"]'],
      wenxin: [
        '.cosd-markdown-content',
        '[class*="cosd-markdown-content"]',
        '[class*="answerBox"] [class*="markdown"]',
        '[data-module="answer"]',
        '[class*="md-content"]',
      ],
      doubao: [
        '.flow-markdown-body',
        '.md-box-root',
        '[class*="md-box-root"]',
        '[data-testid="message_text_content"]',
      ],
      qianwen: ['.response-message-content.phase-answer', '[class*="phase-answer"]', '[class*="markdown"]'],
      yuanbao: ['[class*="agent-chat__list__item--ai"]', '[class*="markdown"]', '[class*="hyc-content"]'],
    };

    const bubbleClimbSelectors = {
      deepseek: ['.ds-message', '[class*="ds-message"]'],
      wenxin: [
        '[class*="answerBox"]',
        '[class*="answer-box"]',
        '[class*="ai-message"]',
        '[class*="dialogue"]',
        '[data-module="answer"]',
      ],
      doubao: [
        '[data-testid="receive_message"]',
        '[data-testid="union_message"]',
        '[class*="receive-message"]',
        '[class*="message-block"]',
      ],
      qianwen: ['[class*="response-message"]', '[class*="chat-item"]', '[class*="message-item"]'],
      yuanbao: ['[class*="agent-chat__list__item"]', '[class*="chat-item"]'],
    };

    const genericAnswerSels = [
      '.ds-markdown',
      '[class*="ds-markdown"]',
      '.cosd-markdown-content',
      '[class*="cosd-markdown-content"]',
      '[data-testid="message_text_content"]',
      '.flow-markdown-body',
      '[class*="phase-answer"]',
      '[class*="markdown-body"]',
      '[class*="markdown"]',
    ];

    const ansSels = answerSelectorsByPlatform[platformKey] || genericAnswerSels;
    const bubbleSels = bubbleClimbSelectors[platformKey] || [];

    // 收集候选回答节点：可见、非侧栏、有足够正文
    const tips = [];
    for (const sel of ansSels) {
      for (const el of Array.from(document.querySelectorAll(sel)).filter(isVisible)) {
        if (looksLikeSidebar(el)) continue;
        // 豆包/通用：信源列表面板里的链接文字很长，绝不能当回答正文
        if (
          el.closest('[data-plugin-identifier*="search_query_result"]') ||
          el.closest('[data-plugin-identifier*="search"]') ||
          el.closest('[class*="search_query_result"]') ||
          el.closest('[class*="SearchResultList"]') ||
          el.closest('[class*="source-list"]')
        ) {
          continue;
        }
        const n = textLen(el);
        if (n < 20) continue;
        // 只要最外层（去掉被更大 markdown 包裹的叶子）
        tips.push({ el, n, y: el.getBoundingClientRect().y });
      }
    }
    // 去重：被其它候选包含的去掉
    const outers = tips.filter(
      a => !tips.some(b => b.el !== a.el && b.el.contains(a.el))
    );

    let tip = null;
    if (outers.length) {
      outers.sort((a, b) => a.y - b.y);
      tip = outers[outers.length - 1];
      const longest = outers.reduce((a, b) => (a.n >= b.n ? a : b));
      if (tip !== longest && (tip.n < 120 || tip.n < longest.n * 0.45)) tip = longest;
    }

    // 上溯到消息气泡
    let card = tip ? tip.el : null;
    if (tip) {
      // DeepSeek：只截最后一条 AI 消息气泡，排除底部输入框；对话区先滚到底
      if (platformKey === 'deepseek') {
        const bubble =
          tip.el.closest('.ds-message, [class*="ds-message"]') || tip.el;
        card = bubble;

        const isComposer = el => {
          if (!isEl(el)) return false;
          if (el.matches?.('#chat-input, textarea, [class*="chat-input"], [class*="ChatInput"]')) return true;
          if (el.querySelector?.('#chat-input, textarea#chat-input, textarea[data-testid="chat-input"]')) return true;
          const cls = String(el.className || '');
          if (/composer|input-area|input-box|chat-input|footer-input/i.test(cls)) return true;
          return false;
        };

        // 找主对话滚动容器（含消息、不含侧栏），滚到底部
        let scroller = null;
        let cur = bubble.parentElement;
        while (cur && cur !== document.body) {
          if (!looksLikeSidebar(cur) && cur.scrollHeight > cur.clientHeight + 80) {
            const r = cur.getBoundingClientRect();
            if (r.width >= 420 && bubble && cur.contains(bubble) && !isComposer(cur)) {
              scroller = cur;
              break;
            }
          }
          cur = cur.parentElement;
        }
        if (!scroller) {
          scroller =
            bubble.closest('[class*="scroll"]') ||
            document.scrollingElement ||
            document.documentElement;
        }
        try {
          scroller.scrollTop = scroller.scrollHeight;
          bubble.scrollIntoView({ block: 'end', inline: 'nearest' });
          // 再滚一次，避免输入框抢占视口后消息被顶走
          scroller.scrollTop = scroller.scrollHeight;
        } catch { /* ignore */ }

        // 若误选了含输入框的父级，强制退回气泡本身
        if (card && isComposer(card)) card = bubble;
      }

      // 豆包：必须锚定回答 markdown，上溯到整条 receive 消息（含信源头+正文），排除纯信源面板
      if (platformKey === 'doubao' && tip) {
        const md =
          tip.el.closest('.flow-markdown-body, .md-box-root, [class*="md-box-root"]') || tip.el;
        let cur = md;
        let best = md;
        for (let i = 0; i < 12 && cur && cur !== document.body; i++) {
          if (looksLikeSidebar(cur)) break;
          // 跳过信源结果面板本身
          if (
            cur.matches?.('[data-plugin-identifier*="search_query_result"]') ||
            cur.closest?.('[data-plugin-identifier*="search_query_result"]') === cur
          ) {
            cur = cur.parentElement;
            continue;
          }
          const hasMd = !!cur.querySelector(
            '.flow-markdown-body, .md-box-root, [class*="md-box-root"]'
          );
          const isBubble =
            cur.matches?.(
              '[data-testid="receive_message"], [data-testid="union_message"], [data-testid*="receive_message"], [class*="receive-message"], [class*="bg-g-receive-msg-bubble"], [class*="message-block"]'
            ) || false;
          const r = cur.getBoundingClientRect();
          if (
            hasMd &&
            textLen(cur.querySelector('.flow-markdown-body, .md-box-root, [class*="md-box-root"]') || md) >= 40 &&
            r.width >= 360 &&
            r.width < window.innerWidth * 0.96
          ) {
            best = cur;
            if (isBubble) break;
          }
          cur = cur.parentElement;
        }
        card = best;
        try {
          const mdEl = card.querySelector('.flow-markdown-body, .md-box-root, [class*="md-box-root"]') || md;
          mdEl.scrollIntoView({ block: 'start', inline: 'nearest' });
        } catch { /* ignore */ }
      }

      // 文心：必须包住「可见信源列表」+ 回答正文（仅 collapsed 标题不够）
      if (platformKey === 'wenxin') {
        const vis = el => {
          if (!isEl(el)) return false;
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
          const r = el.getBoundingClientRect();
          return r.width > 8 && r.height > 8;
        };
        let cur = tip.el;
        for (let i = 0; i < 16 && cur && cur !== document.body; i++) {
          if (looksLikeSidebar(cur)) break;
          const hasAns = !!cur.querySelector(
            '.cosd-markdown-content, [class*="cosd-markdown-content"], [class*="answerBox"] [class*="markdown"]'
          );
          const refNodes = Array.from(
            cur.querySelectorAll(
              [
                '[class*="_reference-item_"]',
                '[class*="reference-item"]',
                '[class*="sourceContainer"] [class*="item"]',
                '[class*="source-item"]',
                '[class*="reference-list"] a',
              ].join(',')
            )
          ).filter(vis);
          const hasRefHeader = !!Array.from(
            cur.querySelectorAll('[class*="_could-expand_"], [class*="_main-header_"], span, div')
          ).find(el => {
            if (!vis(el)) return false;
            const t = (el.textContent || '').replace(/\s+/g, '');
            return /^共参考\d+篇资料$/.test(t) || (/共参考\d+篇资料/.test(t) && t.length < 24);
          });
          // 优先：可见信源条目 + 回答；否则至少标题 + 回答（展开失败时仍尽量完整截回答）
          if (hasAns && (refNodes.length >= 2 || hasRefHeader) && isVisible(cur)) {
            const r = cur.getBoundingClientRect();
            if (r.width >= 360 && r.width < window.innerWidth * 0.96) {
              // 有可见信源时立刻采用；仅有标题则继续上溯找更大容器
              if (refNodes.length >= 2) {
                card = cur;
                break;
              }
              card = cur;
            }
          }
          cur = cur.parentElement;
        }
      }

      if (platformKey !== 'deepseek' && platformKey !== 'doubao' && (!card || card === tip.el)) {
        for (const sel of bubbleSels) {
          const hit = tip.el.closest(sel);
          if (hit && isEl(hit) && !looksLikeSidebar(hit)) {
            card = hit;
            break;
          }
        }
      }
      if (platformKey !== 'deepseek' && platformKey !== 'doubao' && card === tip.el) {
        let cur = tip.el.parentElement;
        for (let i = 0; i < 8 && cur && cur !== document.body; i++) {
          if (looksLikeSidebar(cur)) break;
          const r = cur.getBoundingClientRect();
          if (r.width >= 420 && r.width < window.innerWidth * 0.96 && textLen(cur) >= tip.n) {
            card = cur;
            if (r.height >= tip.el.getBoundingClientRect().height * 0.9) break;
          }
          cur = cur.parentElement;
        }
      }
    }

    let target = card;
    if (!target) {
      let best = null;
      let bestScore = 0;
      for (const el of document.querySelectorAll('div, main, section, article')) {
        if (!isVisible(el) || looksLikeSidebar(el)) continue;
        const dy = el.scrollHeight - el.clientHeight;
        if (dy < 80) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 420) continue;
        const hasMd = !!el.querySelector(
          '.ds-markdown, [class*="ds-markdown"], .cosd-markdown-content, [class*="markdown"]'
        );
        const score = el.scrollHeight + (hasMd ? 50000 : 0) + r.width * 5;
        if (score > bestScore) {
          best = el;
          bestScore = score;
        }
      }
      target = best || document.documentElement;
    }

    try {
      if (platformKey === 'deepseek') {
        // 已在上方滚到底；保持消息贴底，避免再滚回顶部把输入框带进构图
        target.scrollIntoView({ block: 'end', inline: 'nearest' });
      } else {
        target.scrollIntoView({ block: 'start', inline: 'nearest' });
      }
    } catch { /* ignore */ }

    // DeepSeek：截图目标不得包含输入框
    if (
      platformKey === 'deepseek' &&
      target &&
      target.querySelector &&
      target.querySelector('#chat-input, textarea#chat-input, textarea[data-testid="chat-input"]')
    ) {
      const bubble = target.querySelector('.ds-message .ds-markdown, [class*="ds-message"] .ds-markdown');
      const msg = bubble && bubble.closest('.ds-message, [class*="ds-message"]');
      if (msg) target = msg;
    }

    const patched = [];
    const seen = new Set();
    const patch = el => {
      if (!isEl(el) || el === document.documentElement || seen.has(el)) return;
      const cs = getComputedStyle(el);
      const needs =
        el === target ||
        el.scrollHeight > el.clientHeight + 10 ||
        /auto|scroll|hidden/.test(cs.overflowY) ||
        /auto|scroll|hidden/.test(cs.overflow) ||
        (cs.maxHeight && cs.maxHeight !== 'none' && cs.maxHeight !== '0px');
      if (!needs) return;
      seen.add(el);
      patched.push({
        el,
        overflow: el.style.overflow,
        overflowY: el.style.overflowY,
        overflowX: el.style.overflowX,
        height: el.style.height,
        maxHeight: el.style.maxHeight,
        minHeight: el.style.minHeight,
      });
      el.style.overflow = 'visible';
      el.style.overflowY = 'visible';
      el.style.overflowX = 'visible';
      el.style.maxHeight = 'none';
    };

    const applyHeights = () => {
      // 多轮：子节点撑开后再更新祖先高度
      for (let round = 0; round < 4; round++) {
        for (const p of patched) {
          const h = Math.max(p.el.scrollHeight, p.el.clientHeight, p.el.offsetHeight || 0);
          p.el.style.height = `${h}px`;
          p.el.style.minHeight = `${h}px`;
        }
      }
    };

    // DeepSeek：只撑开消息气泡内部，不要改祖先（祖先一撑容易把整页/输入区卷进来）
    if (platformKey === 'deepseek') {
      patch(target);
      if (target && target.querySelectorAll) {
        target.querySelectorAll('div, section, article').forEach(patch);
      }
    } else {
      let cur2 = target;
      while (cur2 && cur2 !== document.documentElement) {
        patch(cur2);
        cur2 = cur2.parentElement;
      }
      if (target && target.querySelectorAll) {
        target.querySelectorAll('div, section, article, main').forEach(patch);
      }
    }

    applyHeights();

    try {
      target.setAttribute('data-geo-shot-target', '1');
    } catch { /* ignore */ }

    window.__geoShotRestore = patched;
    window.__geoShotTarget = target;
    window.__geoShotApplyHeights = applyHeights;
  }, platform);

  await sleep(platform === 'wenxin' ? 400 : 150);
  await page.evaluate(() => {
    try {
      if (typeof window.__geoShotApplyHeights === 'function') window.__geoShotApplyHeights();
    } catch { /* ignore */ }
  }).catch(() => {});
  await sleep(120);

  // 截图前隐藏底部固定输入条 / sticky 浮层，避免滚动拼接把对话框叠进图
  await page.evaluate(() => {
    const hidden = [];
    const hide = el => {
      if (!(el instanceof HTMLElement)) return;
      if (el.dataset.geoShotHide === '1') return;
      const target = window.__geoShotTarget;
      if (target && (el === target || target.contains(el) || el.contains(target))) return;
      hidden.push({ el, display: el.style.display });
      el.dataset.geoShotHide = '1';
      el.style.display = 'none';
    };

    for (const sel of [
      '#chat-input',
      'textarea#chat-input',
      'textarea[data-testid="chat-input"]',
      'textarea[data-testid="chat_input"]',
      'textarea[placeholder*="DeepSeek"]',
      'textarea[placeholder*="发送消息"]',
      'textarea[placeholder*="给 DeepSeek"]',
    ]) {
      document.querySelectorAll(sel).forEach(el => {
        hide(el);
        let cur = el.parentElement;
        for (let i = 0; i < 8 && cur && cur !== document.body; i++) {
          const r = cur.getBoundingClientRect();
          const cls = String(cur.className || '');
          if (
            r.height > 36 &&
            r.height < 320 &&
            r.width > 240 &&
            (r.bottom > window.innerHeight - 260 ||
              /input|composer|editor|footer|bottom|textarea|chat-input/i.test(cls))
          ) {
            hide(cur);
            break;
          }
          cur = cur.parentElement;
        }
      });
    }

    for (const el of document.querySelectorAll('div, form, section, footer, aside')) {
      if (!(el instanceof HTMLElement)) continue;
      const st = getComputedStyle(el);
      if (st.position !== 'fixed' && st.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 100 || r.height < 28) continue;
      if (r.top > window.innerHeight * 0.5 || r.bottom >= window.innerHeight - 8) {
        if (el.querySelector('textarea, input, [contenteditable="true"]') || r.height < 260) {
          hide(el);
        }
      }
    }

    for (const el of document.querySelectorAll('div, p, span')) {
      if (!(el instanceof HTMLElement)) continue;
      const t = (el.textContent || '').replace(/\s+/g, '');
      if (t === '内容由AI生成，请仔细甄别' || t === '内容由AI生成请仔细甄别') {
        hide(el);
        if (el.parentElement && (el.parentElement.textContent || '').replace(/\s+/g, '').length < 40) {
          hide(el.parentElement);
        }
      }
    }

    window.__geoShotHidden = hidden;
  });

  let buf = null;
  try {
    // CDP 超出视口截完整目标盒：避免 element.screenshot 滚动拼接叠入固定输入框，也避免长回答被裁切
    const box = await page.evaluate(() => {
      const el = window.__geoShotTarget || document.querySelector('[data-geo-shot-target="1"]');
      if (!(el instanceof HTMLElement)) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.max(0, Math.floor(r.x + window.scrollX)),
        y: Math.max(0, Math.floor(r.y + window.scrollY)),
        width: Math.max(1, Math.ceil(Math.max(r.width, el.scrollWidth))),
        height: Math.max(1, Math.ceil(Math.max(r.height, el.scrollHeight))),
      };
    });

    if (box) {
      const session = await page.context().newCDPSession(page);
      try {
        const width = Math.min(box.width, 4500);
        const height = Math.min(box.height, 32000);
        const result = await session.send('Page.captureScreenshot', {
          format: 'png',
          fromSurface: true,
          captureBeyondViewport: true,
          clip: { x: box.x, y: box.y, width, height, scale: 1 },
        });
        buf = Buffer.from(result.data, 'base64');
      } finally {
        await session.detach().catch(() => {});
      }
    }

    if (!buf || !buf.length) {
      const handle = await page.evaluateHandle(() => window.__geoShotTarget);
      const el = handle.asElement();
      if (el) {
        try {
          buf = await el.screenshot({ type: 'png', animations: 'disabled' });
        } catch {
          buf = null;
        }
      }
      await handle.dispose().catch(() => {});
    }
    if (!buf || !buf.length) {
      buf = await page.screenshot({ type: 'png', fullPage: true, animations: 'disabled' });
    }
  } finally {
    await page.evaluate(() => {
      const hidden = window.__geoShotHidden || [];
      for (const h of hidden) {
        try {
          h.el.style.display = h.display;
          delete h.el.dataset.geoShotHide;
        } catch { /* ignore */ }
      }
      delete window.__geoShotHidden;

      const patched = window.__geoShotRestore || [];
      for (const p of patched) {
        try {
          p.el.style.overflow = p.overflow;
          p.el.style.overflowY = p.overflowY;
          p.el.style.overflowX = p.overflowX;
          p.el.style.height = p.height;
          p.el.style.maxHeight = p.maxHeight;
          p.el.style.minHeight = p.minHeight;
        } catch { /* ignore */ }
      }
      try {
        document.querySelectorAll('[data-geo-shot-target]').forEach(n => n.removeAttribute('data-geo-shot-target'));
      } catch { /* ignore */ }
      delete window.__geoShotRestore;
      delete window.__geoShotTarget;
      delete window.__geoShotApplyHeights;
    }).catch(() => {});
  }

  return buf;
}

module.exports = { sleep, findVisibleLocator, extractAnswerHtml, captureConversationScreenshot };
