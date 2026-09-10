'use strict';
/**
 * 文心一言对话测试（CommonJS 移植自上传的 yiyan.js）
 */
const { sleep, findVisibleLocator, extractAnswerHtml } = require('./common.cjs');

const INPUT_SELECTORS = [
  '#chat-textarea',
  'textarea#chat-textarea',
  'textarea.ci-textarea',
  '.ci-textarea',
  '#dialogue-input',
  'textarea#dialogue-input',
  'textarea[placeholder*="输入"]',
  'textarea[placeholder*="问"]',
  '[contenteditable="true"][role="textbox"]',
  '[contenteditable="true"]',
  'textarea'
];

const SEND_SELECTORS = [
  'img.ci-submit-button-ai-active',
  '[class*="ci-submit-button-ai-active"]',
  'span.ci-submit-button:has(img.ci-submit-button-ai-active)',
  '.ci-submit-button',
  'button[aria-label*="发送"]',
  'button[class*="send" i]:not([disabled])'
];

async function waitForInput(page, log) {
  log('info', '等待文心输入框加载…');
  try {
    await page.waitForSelector('#chat-textarea, textarea.ci-textarea, #dialogue-input', {
      state: 'visible',
      timeout: 25000
    });
  } catch {
    // fall through to multi-selector search
  }
  const input = await findVisibleLocator(page, INPUT_SELECTORS);
  if (!input) {
    throw new Error(`未找到文心一言输入框（当前页 ${page.url()}）`);
  }
  return input;
}

async function dismissPopups(page) {
  await page
    .evaluate(() => {
      const labels = ['我知道了', '接受协议', '同意', '开始体验', '关闭', '暂不登录'];
      for (const el of Array.from(document.querySelectorAll('button, div, span, a'))) {
        if (!(el instanceof HTMLElement)) continue;
        const t = (el.textContent || '').replace(/\s+/g, '');
        if (!labels.includes(t)) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        el.click();
      }
    })
    .catch(() => undefined);
}

async function fillPrompt(page, prompt, log) {
  const input = await waitForInput(page, log);

  log('info', '定位到输入框，准备写入提示词');
  await input.click({ timeout: 5000 });

  const tagName = await input.evaluate(el => el.tagName.toLowerCase());
  if (tagName === 'textarea' || tagName === 'input') {
    await input.fill('');
    await input.fill(prompt);
    await input.evaluate((el, text) => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, prompt);
  } else {
    await input.evaluate(el => {
      el.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.keyboard.press('Backspace');
    const inserted = await input.evaluate((el, text) => {
      el.focus();
      el.textContent = '';
      return document.execCommand('insertText', false, text);
    }, prompt);
    if (!inserted) {
      await page.keyboard.type(prompt, { delay: 8 });
    }
    await input.evaluate((el, text) => {
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
    }, prompt);
  }

  const current = (
    (await input.innerText().catch(() => '')) ||
    (await input.inputValue().catch(() => ''))
  ).trim();
  if (!current.includes(prompt.slice(0, Math.min(12, prompt.length)))) {
    log('warn', '输入框内容校验未完全匹配，继续尝试发送');
  } else {
    log('info', '提示词已写入输入框');
  }
}

async function clickSend(page, log) {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const activeImg = page.locator('img.ci-submit-button-ai-active');
    if ((await activeImg.count()) > 0 && (await activeImg.last().isVisible().catch(() => false))) {
      await activeImg.last().click({ force: true, timeout: 5000 });
      log('info', '已点击发送按钮（文心 submit）');
      return;
    }

    const send = await findVisibleLocator(page, SEND_SELECTORS);
    if (send) {
      const disabled = await send.evaluate(el => {
        if (el instanceof HTMLButtonElement) return el.disabled;
        const className = typeof el.className === 'string' ? el.className : '';
        return /disabled/i.test(className) || el.getAttribute('aria-disabled') === 'true';
      });
      if (!disabled) {
        await send.click({ force: true, timeout: 5000 });
        log('info', '已点击发送按钮');
        return;
      }
    }

    const siblingClicked = await page.evaluate(() => {
      const input = document.querySelector('#dialogue-input');
      if (!(input instanceof HTMLElement)) return false;
      const parent = input.parentElement;
      if (!parent) return false;
      let sib = parent.nextElementSibling;
      while (sib && sib.nodeType !== 1) sib = sib.nextElementSibling;
      if (sib instanceof HTMLElement) {
        sib.click();
        return true;
      }
      return false;
    });
    if (siblingClicked) {
      log('info', '已点击发送按钮（输入框相邻控件）');
      return;
    }

    await sleep(150);
  }

  await page.locator('#chat-textarea, #dialogue-input, textarea').last().press('Enter');
  log('info', '未找到可用发送按钮，已按 Enter 发送');
}

function sanitizeAnswer(text) {
  return text
    .replace(/内容由AI生成[，,]仅供参考/gi, '')
    .replace(/重新生成|复制|分享|点赞|踩/gi, '')
    .replace(/共参考\d+篇资料/gi, '')
    .replace(/参考\d+个网页/gi, '')
    .replace(/登录同步历史对话|开启新对话|立即下载|意见反馈|收藏夹/gi, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isIncompleteAnswer(text) {
  const t = text.trim();
  if (!t) return true;
  if (/^(正在思考|思考中|正在搜索|搜索中|生成中|请稍候|检索\d+篇结果)[.。…\s]*$/i.test(t)) {
    return true;
  }
  const compact = t.replace(/\s+/g, '');
  if (/^(正在思考|思考中|正在搜索|搜索中|生成中|智能体回答中请等待)+$/i.test(compact)) {
    return true;
  }
  if (t.length < 40 && /(正在思考|思考中|正在搜索|搜索中|生成中|智能体回答中)/.test(t)) {
    return true;
  }
  return false;
}

async function readAnswerSnapshot(page) {
  return page.evaluate(() => {
    const clean = value =>
      (value || '')
        .replace(/内容由AI生成[，,]仅供参考/gi, '')
        .replace(/重新生成|复制|分享|点赞|踩/gi, '')
        .replace(/共参考\d+篇资料/gi, '')
        .replace(/参考\d+个网页/gi, '')
        .replace(/登录同步历史对话|开启新对话|立即下载|意见反馈|收藏夹/gi, '')
        .replace(/\u00a0/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const stripChrome = root => {
      const clone = root.cloneNode(true);
      clone
        .querySelectorAll(
          [
            'script',
            'style',
            'button',
            'nav',
            'aside',
            '[class*="toolbar"]',
            '[class*="operation"]',
            '[class*="action"]',
            '[class*="sourceContainer"]',
            '[class*="container__M"]',
            '[class*="titleText"]',
            '[class*="_reference_"]',
            '[class*="reference-list"]',
            '[class*="_reference-item_"]',
            '[class*="_could-expand_"]',
            '[class*="_main-header_"]',
            '.thinking-steps-title-extra',
            '#chat-input-home',
            '#chat-textarea',
            '.ci-textarea'
          ].join(',')
        )
        .forEach(n => n.remove());
      return clean(clone.innerText || clone.textContent || '');
    };

    // 取最外层可见回答容器（不要取段落叶子，否则字数会卡在一两百）
    const pickBodies = selectors => {
      const matches = Array.from(document.querySelectorAll(selectors)).filter(isVisible);
      const outers = matches.filter(
        el => !matches.some(other => other !== el && other.contains(el))
      );
      return outers
        .map(el => ({ el, text: stripChrome(el), y: el.getBoundingClientRect().y }))
        .filter(x => x.text.length > 20)
        .sort((a, b) => a.y - b.y);
    };

    let bodies = pickBodies(
      [
        '.cosd-markdown-content',
        '[class*="cosd-markdown-content"]',
        '[class*="answerBox"] [class*="markdown"]',
        '[class*="md-content"]',
        '[class*="ai-content"]',
        '[data-module="answer"]'
      ].join(',')
    );

    if (bodies.length === 0) {
      bodies = pickBodies('[class*="markdown"], [class*="search-result"], [class*="ai-message"], [class*="answerBox"]');
    }

    // 优先靠下的一条；若最后一条明显短于最长条（侧栏/追问卡），改用最长
    let chosen = bodies[bodies.length - 1];
    if (bodies.length >= 2) {
      const longest = bodies.reduce((a, b) => (a.text.length >= b.text.length ? a : b));
      if (
        chosen &&
        longest &&
        chosen !== longest &&
        (chosen.text.length < 300 || chosen.text.length < longest.text.length * 0.45)
      ) {
        chosen = longest;
      }
    }
    const text = chosen?.text || '';
    const answerRoot = chosen?.el || null;

    const bodyText = document.body?.innerText || '';
    const hasReferences = /共参考\d+篇资料/.test(bodyText);

    const stopVisible = Array.from(document.querySelectorAll('button, [role="button"]')).some(el => {
      if (!isVisible(el)) return false;
      const t = (el.textContent || '').replace(/\s+/g, '');
      const aria = (el.getAttribute('aria-label') || '').replace(/\s+/g, '');
      return (
        t === '停止生成' ||
        /^Stopgenerating$/i.test(t) ||
        /停止生成|Stopgenerating/i.test(aria) ||
        (t === '停止' && /生成|回答|输出/.test(aria))
      );
    });

    // 仅看回答内光标，避免全局 loading / 「生成中」文案把 stream 钉死
    const cursorInAnswer =
      !!answerRoot &&
      Array.from(
        answerRoot.querySelectorAll(
          '[class*="cursor"], [class*="blink"], [class*="typing"], [class*="streaming"]'
        )
      ).some(isVisible);

    const streaming = stopVisible || cursorInAnswer;

    const debug = [
      `host=${location.host}`,
      `path=${location.pathname.slice(0, 40)}`,
      `answers=${bodies.length}`,
      `ref=${hasReferences ? 1 : 0}`,
      `stream=${streaming ? 1 : 0}`,
      `stop=${stopVisible ? 1 : 0}`,
      `len=${text.length}`
    ].join(' ');

    return { text, streaming, stopVisible, hasReferences, assistantCount: bodies.length, debug };
  });
}

async function waitForAnswer(page, baselineText, log) {
  const timeoutMs = 180_000;
  const started = Date.now();
  let lastText = '';
  let contentStableRounds = 0;
  let sawNewAnswer = false;
  let lastProgressLog = 0;
  let lastDebug = '';
  let maxLen = 0;

  log('info', '等待文心一言回答完成…');

  while (Date.now() - started < timeoutMs) {
    await sleep(800);
    const snap = await readAnswerSnapshot(page);
    lastDebug = snap.debug;
    const text = sanitizeAnswer(snap.text);
    const placeholder = isIncompleteAnswer(text);
    if (text.length > maxLen) maxLen = text.length;

    if (text && !placeholder && text !== baselineText) sawNewAnswer = true;
    if (text && !placeholder && text.length > Math.max(baselineText.length + 20, 60)) sawNewAnswer = true;

    // 以字数稳定为准累加；流式误判不再清零
    if (text && !placeholder && text === lastText && text.length >= maxLen) {
      contentStableRounds += 1;
    } else {
      contentStableRounds = 0;
      lastText = text;
    }

    const now = Date.now();
    if (now - lastProgressLog > 4000) {
      lastProgressLog = now;
      log(
        'info',
        `生成中… 已读 ${text.length} 字` +
          `${snap.streaming ? '（生成中）' : ''}` +
          `${placeholder ? '（占位/过短）' : ''}` +
          `${snap.hasReferences ? '（已有资料）' : ''}` +
          `${sawNewAnswer ? '' : '（等待完整回答）'}` +
          ` 稳定${contentStableRounds}轮` +
          ` [${snap.debug}]`
      );
    }

    // 仍能点「停止」→ 确实在生成，继续等
    if (snap.stopVisible) continue;

    // 无停止钮 + 字数稳定约 5.6s
    if (
      sawNewAnswer &&
      !placeholder &&
      contentStableRounds >= 7 &&
      text.length >= 120 &&
      text.length >= maxLen
    ) {
      log('success', `回答已完成（${text.length} 字）`);
      return text;
    }

    // 有资料标记时稍严一点
    if (
      sawNewAnswer &&
      !placeholder &&
      snap.hasReferences &&
      contentStableRounds >= 8 &&
      text.length >= 150 &&
      text.length >= maxLen
    ) {
      log('success', `回答已稳定（含资料标记，${text.length} 字）`);
      return text;
    }

    // 兜底：更长静默（约 12s）
    if (
      sawNewAnswer &&
      !placeholder &&
      contentStableRounds >= 15 &&
      text.length >= 200 &&
      text.length >= maxLen
    ) {
      log('success', `回答已长时间稳定（${text.length} 字）`);
      return text;
    }
  }

  if (lastText && !isIncompleteAnswer(lastText) && lastText.length >= 80) {
    log('warn', `等待超时，返回当前已生成内容 [${lastDebug}]`);
    return lastText;
  }
  throw new Error(`等待文心一言完整回答超时 [${lastDebug}]`);
}

async function openSourcesPanel(page, log) {
  const alreadyOpen = await page.evaluate(() => {
    const items = document.querySelectorAll('[class*="_reference-item_"], [class*="reference-item"], [class*="reference-list"] [class*="_text_"]');
    return items.length >= 2;
  });
  if (alreadyOpen) {
    log('info', '信源列表已展开');
    return true;
  }

  log('info', '点击回答上方「共参考N篇资料」展开信源…');

  const clicked = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const expandHeader = Array.from(
      document.querySelectorAll('[class*="_could-expand_"], [class*="_main-header_"], .thinking-steps-title-extra, span.pre-text')
    ).find(el => {
      if (!isVisible(el)) return false;
      const t = (el.textContent || '').replace(/\s+/g, '');
      return /共参考\d+篇资料/.test(t);
    });

    if (expandHeader) {
      const clickable =
        expandHeader.closest('[class*="_could-expand_"]') ||
        expandHeader.closest('[class*="_main-header_"]') ||
        expandHeader;
      clickable.scrollIntoView({ block: 'center' });
      clickable.click();
      return true;
    }

    const ranked = Array.from(document.querySelectorAll('div, span, header, button'))
      .filter(isVisible)
      .map(el => {
        const t = (el.textContent || '').replace(/\s+/g, '');
        let s = 0;
        if (/^共参考\d+篇资料$/.test(t)) s = 100;
        else if (/共参考\d+篇资料/.test(t) && t.length < 24) s = 80;
        else if (/^参考\d+个网页$/.test(t)) s = 50;
        return { el, s, y: el.getBoundingClientRect().y };
      })
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s || a.y - b.y);

    const pick = ranked[0]?.el;
    if (!(pick instanceof HTMLElement)) return false;
    const clickable = pick.closest('[class*="_could-expand_"]') || pick.closest('[class*="_main-header_"]') || pick;
    clickable.scrollIntoView({ block: 'center' });
    clickable.click();
    return true;
  });

  if (!clicked) {
    log('warn', '未找到「共参考N篇资料」入口');
    return false;
  }

  for (let i = 0; i < 12; i++) {
    await sleep(400);
    const ready = await page.evaluate(() => {
      return document.querySelectorAll('[class*="_reference-item_"], [class*="reference-item"]').length >= 2;
    });
    if (ready) {
      log('info', '信源列表已展开');
      return true;
    }
  }

  log('warn', '已点击参考入口，但信源列表未出现');
  return false;
}

async function extractSources(page, log) {
  await openSourcesPanel(page, log);
  await sleep(500);

  const sources = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    const push = (title, url, snippet) => {
      const key = `${title || ''}|${url || ''}`;
      if (!key || key === '|' || seen.has(key)) return;
      if (!title && !url) return;
      seen.add(key);
      results.push({
        title: title?.trim() || undefined,
        url: url?.trim() || undefined,
        snippet: snippet?.trim() || undefined
      });
    };

    const items = Array.from(document.querySelectorAll('[class*="_reference-item_"], [class*="reference-item"]'));

    for (const item of items) {
      let title = (
        item.querySelector('[class*="_text_"]')?.textContent ||
        item.querySelector('[class*="text"]')?.textContent ||
        ''
      )
        .replace(/\s+/g, ' ')
        .trim();

      let url = '';
      const ext = item.getAttribute('data-long-press-ext-info') || '';
      if (ext) {
        try {
          const data = JSON.parse(ext);
          if (data.link) url = String(data.link).trim();
          if (!title && data.linkTitle) title = String(data.linkTitle).trim();
        } catch {
          // ignore
        }
      }

      if (!title) {
        title = (item.textContent || '')
          .replace(/\s+/g, ' ')
          .replace(/^\d+[\.、]\s*/, '')
          .trim();
      }
      if (!title) continue;
      if (/yiyan\.baidu|wenxin\.baidu|chat\.baidu|passport\.baidu|wappass\.baidu/i.test(url)) {
        url = '';
      }
      push(title.slice(0, 220), url || undefined);
    }

    if (results.length === 0) {
      const panel = document.querySelector('[class*="sourceContainer"]');
      if (panel) {
        for (const item of Array.from(panel.querySelectorAll('[class*="item__"], [class*="source-item"]'))) {
          const titleEl = item.querySelector('[class*="titleInfo"], [class*="title"]');
          const siteEl = item.querySelector('[class*="siteText"], [class*="site"]');
          const link = item.querySelector('a[href]');
          let title = (titleEl?.textContent || link?.textContent || '').replace(/\s+/g, ' ').trim();
          if (!title) continue;
          const site = (siteEl?.textContent || '').replace(/\s+/g, ' ').trim();
          let url = (link?.href || '').trim();
          if (/yiyan\.baidu|wenxin\.baidu|chat\.baidu|passport\.baidu/i.test(url)) url = '';
          const display = site && !title.includes(site) ? `${title} - ${site}` : title;
          push(display.slice(0, 220), url || undefined, site || undefined);
        }
      }
    }

    return results.slice(0, 40);
  });

  log('info', `提取到信源 ${sources.length} 条`);
  return sources;
}

async function runConversation(page, prompt, log) {
  log('info', `开始文心一言对话：${prompt}`);
  await page.bringToFront().catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  await dismissPopups(page);
  await sleep(500);

  const loginGate = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const hard = Array.from(document.querySelectorAll('button, a')).find(el => {
      if (!isVisible(el)) return false;
      const t = (el.textContent || '').replace(/\s+/g, '');
      return t === '立即登录' && el.getBoundingClientRect().y < 200;
    });
    return !!hard && !document.querySelector('#chat-textarea, #dialogue-input');
  });
  if (loginGate) throw new Error('文心一言需要登录后再测试');

  const baseline = await readAnswerSnapshot(page);
  await fillPrompt(page, prompt, log);
  await sleep(300);
  await clickSend(page, log);

  await page.waitForURL(/\/search\//, { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);

  const answer = await waitForAnswer(page, sanitizeAnswer(baseline.text), log);
  if (!answer || isIncompleteAnswer(answer)) {
    throw new Error('未获取到文心一言完整回答内容');
  }

  const rich = await extractAnswerHtml(page, {
    contentSelectors: [
      '.cosd-markdown-content',
      '[class*="cosd-markdown-content"]',
      '[class*="md-content"]',
      '[class*="answerBox"] [class*="markdown"]',
      '[class*="marklang"]',
    ],
    stripSelectors: [
      '[class*="sourceContainer"]',
      '[class*="_reference_"]',
      '[class*="reference-list"]',
      '[class*="_reference-item_"]',
      '[class*="_could-expand_"]',
      '[class*="_main-header_"]',
      '.thinking-steps-title-extra',
    ],
  });
  // 富文本明显短于 waitForAnswer 结果时不用（避免 HTML 只剩追问尾卡）
  const richOk = !!(rich.text && rich.text.length >= Math.max(80, answer.length * 0.8));
  const answerHtml = richOk ? rich.html || '' : '';
  const finalAnswer = (richOk ? rich.text : answer) || answer;

  const sources = await extractSources(page, log);
  log('success', '文心一言对话完成');
  return { answer: finalAnswer, answerHtml, sources };
}

module.exports = { runConversation };
