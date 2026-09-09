'use strict';
/**
 * 腾讯元宝对话测试（CommonJS 移植自上传的 yuanbao.js）
 */
const { sleep, findVisibleLocator } = require('./common.cjs');

const INPUT_SELECTORS = [
  '.ql-editor[contenteditable="true"]',
  '.ql-editor',
  '[class*="chat-input"] [contenteditable="true"]',
  'div[contenteditable="true"][data-placeholder]',
  '[contenteditable="true"]',
  'textarea'
];

const SEND_SELECTORS = [
  'a[class*="send-btn"]:not([class*="disabled"])',
  'button[class*="send-btn"]:not([class*="disabled"])',
  'a[class*="style__send-btn"]:not([class*="disabled"])',
  'button[class*="submit"]:not([class*="disabled"])'
];

async function fillPrompt(page, prompt, log) {
  const input = await findVisibleLocator(page, INPUT_SELECTORS);
  if (!input) throw new Error('未找到元宝输入框');

  log('info', '定位到输入框，准备写入提示词');
  await input.click({ timeout: 5000 });

  const tagName = await input.evaluate(el => el.tagName.toLowerCase());
  if (tagName === 'textarea' || tagName === 'input') {
    await input.fill('');
    await input.fill(prompt);
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
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const send = await findVisibleLocator(page, SEND_SELECTORS);
    if (send) {
      const disabled = await send.evaluate(el => {
        const className = typeof el.className === 'string' ? el.className : '';
        return /disabled/i.test(className);
      });
      if (!disabled) {
        await send.click({ timeout: 5000 });
        log('info', '已点击发送按钮');
        return;
      }
    }
    await sleep(150);
  }

  await page.keyboard.press('Enter');
  log('info', '未找到可用发送按钮，已按 Enter 发送');
}

function sanitizeAnswer(text) {
  return text
    .replace(/内容由AI生成，仅供参考/gi, '')
    .replace(/重新回答/gi, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isIncompleteAnswer(text) {
  const t = text.trim();
  if (!t) return true;
  if (/^(正在搜索资料|搜索资料中|正在思考|思考中|快速回答|深度思考)[.。…\s]*$/i.test(t)) {
    return true;
  }
  const compact = t.replace(/\s+/g, '');
  if (
    /^(正在思考|思考中|正在搜索资料|搜索资料中)?(快速回答|深度思考)?$/i.test(compact) ||
    /^(快速回答|深度思考)(正在思考|思考中)?$/i.test(compact)
  ) {
    return true;
  }
  if (t.length < 40 && /(正在思考|思考中|快速回答|正在搜索资料|搜索资料中)/.test(t)) {
    return true;
  }
  return false;
}

async function readAnswerSnapshot(page) {
  return page.evaluate(() => {
    const clean = value =>
      (value || '')
        .replace(/内容由AI生成，仅供参考/gi, '')
        .replace(/重新回答/gi, '')
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

    const stripThinking = root => {
      const clone = root.cloneNode(true);
      clone
        .querySelectorAll(
          [
            '.hyc-component-deepsearch-cot',
            '[class*="deepsearch-cot"]',
            '[class*="thinking"]',
            '[class*="Think"]',
            '[class*="toolbar"]',
            '[class*="ToolbarSearchGuid"]',
            '.agent-chat__toolbar',
            '[class*="agent-chat__toolbar"]'
          ].join(',')
        )
        .forEach(n => n.remove());
      return clean(clone.innerText || clone.textContent || '');
    };

    const aiItems = Array.from(
      document.querySelectorAll(
        '.agent-chat__list__item--ai, [class*="agent-chat__list__item--ai"], [class*="list__item--ai"]'
      )
    ).filter(node => isVisible(node));

    const texts = [];
    let hasDoneNode = false;

    for (const node of aiItems) {
      const doneNode = node.querySelector('.hyc-content-md-done');
      const mdNode =
        doneNode ||
        node.querySelector('.hyc-content-md') ||
        node.querySelector('[class*="hyc-content-md"]') ||
        node.querySelector('.agent-chat__speech-text') ||
        node.querySelector('.agent-chat__bubble__content');

      if (doneNode && isVisible(doneNode)) hasDoneNode = true;
      if (!mdNode) continue;
      const text = stripThinking(mdNode);
      if (text) texts.push(text);
    }

    if (texts.length === 0) {
      const bodies = Array.from(
        document.querySelectorAll(
          '.hyc-content-md-done, .hyc-content-md, [class*="hyc-content-md"], .agent-chat__bubble__content'
        )
      )
        .filter(el => isVisible(el))
        .map(el => stripThinking(el))
        .filter(Boolean);
      texts.push(...bodies);
      if (document.querySelector('.hyc-content-md-done')) hasDoneNode = true;
    }

    const text = texts.length > 0 ? texts[texts.length - 1] : '';

    const stopVisible = Array.from(
      document.querySelectorAll(
        '[class*="style__stop"], button[aria-label*="停止"], [class*="chat-input-btn"][class*="stop"], [class*="icon-stop"], [class*="stop-btn"]'
      )
    ).some(el => isVisible(el));

    const sendVisible = Array.from(
      document.querySelectorAll('a[class*="send-btn"], button[class*="send-btn"], button[class*="submit"]')
    ).some(el => {
      if (!isVisible(el)) return false;
      const className = typeof el.className === 'string' ? el.className : '';
      return !/disabled/i.test(className);
    });

    const loading = !!document.querySelector(
      '[class*="agent-chat__list__item--ai-loading"], [class*="animate-pulse"], [class*="generating"]'
    );

    const incompleteHint =
      !text ||
      /^(正在搜索资料|搜索资料中|正在思考|思考中|快速回答|深度思考)[.。…\s]*$/i.test(text) ||
      (text.length < 40 && /(正在思考|思考中|快速回答|正在搜索资料|搜索资料中)/.test(text)) ||
      /^(正在思考|思考中)?(快速回答|深度思考)?$/i.test(text.replace(/\s+/g, ''));

    const debug = [
      `host=${location.host}`,
      `aiItems=${aiItems.length}`,
      `answers=${texts.length}`,
      `done=${hasDoneNode ? 1 : 0}`,
      `stop=${stopVisible ? 1 : 0}`,
      `send=${sendVisible ? 1 : 0}`,
      `loading=${loading ? 1 : 0}`,
      `len=${text.length}`
    ].join(' ');

    return {
      text,
      stopVisible,
      sendVisible,
      done: hasDoneNode && !incompleteHint && !stopVisible && !loading,
      incomplete: incompleteHint || stopVisible || loading,
      assistantCount: texts.length,
      debug
    };
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

  log('info', '等待元宝回答完成…');

  while (Date.now() - started < timeoutMs) {
    await sleep(800);
    const snap = await readAnswerSnapshot(page);
    lastDebug = snap.debug;
    const text = sanitizeAnswer(snap.text);
    const incomplete = snap.incomplete || isIncompleteAnswer(text);

    if (text && !incomplete && text !== baselineText) sawNewAnswer = true;
    if (text && !incomplete && text.length > Math.max(baselineText.length + 20, 60)) sawNewAnswer = true;

    if (text && !incomplete && text === lastText) {
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
          `${snap.stopVisible ? '（可停止）' : ''}` +
          `${incomplete ? '（未完成/思考中）' : ''}` +
          `${sawNewAnswer ? '' : '（等待完整回答）'}` +
          ` 稳定${contentStableRounds}轮` +
          ` [${snap.debug}]`
      );
    }

    if (sawNewAnswer && !incomplete && contentStableRounds >= 3 && text.length >= 40) {
      log('success', `回答已稳定（${text.length} 字）`);
      return text;
    }
    if (sawNewAnswer && snap.done && !incomplete && contentStableRounds >= 2 && text.length >= 40) {
      log('success', `回答已完成标记（${text.length} 字）`);
      return text;
    }
    if (
      sawNewAnswer && !incomplete && !snap.stopVisible && snap.sendVisible && contentStableRounds >= 4 && text.length >= 40
    ) {
      log('success', `回答已稳定（发送按钮已恢复，${text.length} 字）`);
      return text;
    }
  }

  if (lastText && !isIncompleteAnswer(lastText) && lastText.length >= 40) {
    log('warn', `等待超时，返回当前已生成内容 [${lastDebug}]`);
    return lastText;
  }
  throw new Error(`等待元宝完整回答超时 [${lastDebug}]`);
}

async function openSourcesPanel(page, log) {
  log('info', '尝试打开右侧信源面板…');

  const alreadyOpen = await page.evaluate(() => {
    return !!(
      document.querySelector('.t-drawer--open .agent-dialogue-references') ||
      document.querySelector('.agent-dialogue-references__item') ||
      document.querySelector('.hyc-common-markdown__ref_card[data-url]')
    );
  });
  if (alreadyOpen) {
    log('info', '信源面板已可见');
    return true;
  }

  const clicked = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const aiItems = Array.from(
      document.querySelectorAll('.agent-chat__list__item--ai, [class*="agent-chat__list__item--ai"]')
    ).filter(n => isVisible(n));
    const scope = aiItems.length > 0 ? aiItems[aiItems.length - 1] : document.body;

    const candidates = [
      ...Array.from(scope.querySelectorAll('[data-toolbar-type="citation"]')),
      ...Array.from(scope.querySelectorAll('[class*="ToolbarSearchGuid_source"]')),
      ...Array.from(scope.querySelectorAll('[class*="ToolbarSearchGuid"]')),
      ...Array.from(document.querySelectorAll('[data-toolbar-type="citation"]')),
      ...Array.from(document.querySelectorAll('[class*="ToolbarSearchGuid_source"]'))
    ];

    const clickable = candidates.find(el => {
      if (!isVisible(el)) return false;
      const text = (el.textContent || '').replace(/\s+/g, '');
      return (
        el.getAttribute('data-toolbar-type') === 'citation' ||
        /来源|信源|引用|源/.test(text) ||
        /source/i.test(el.className?.toString?.() || '')
      );
    });

    if (clickable instanceof HTMLElement) {
      clickable.click();
      return true;
    }

    const textNodes = Array.from(scope.querySelectorAll('button, a, span, div')).filter(el => {
      if (!isVisible(el)) return false;
      const t = (el.textContent || '').replace(/\s+/g, '');
      return t === '来源' || t === '信源' || /^来源\d+$/.test(t) || /^引用\d*$/.test(t);
    });
    const last = textNodes[textNodes.length - 1];
    if (last instanceof HTMLElement) {
      last.click();
      return true;
    }
    return false;
  });

  if (!clicked) {
    log('warn', '未找到信源入口按钮');
    return false;
  }

  for (let i = 0; i < 10; i++) {
    await sleep(400);
    const ready = await page.evaluate(() => {
      return !!(
        document.querySelector('.t-drawer--open .agent-dialogue-references') ||
        document.querySelector('.agent-dialogue-references__item') ||
        document.querySelector('.hyc-common-markdown__ref_card[data-url]')
      );
    });
    if (ready) {
      log('info', '信源面板已打开');
      return true;
    }
  }

  log('warn', '已点击信源入口，但面板未出现');
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

    const items = Array.from(document.querySelectorAll('.agent-dialogue-references__item'));
    for (const item of items) {
      let url = item.getAttribute('dt-ext6') || '';
      const sourceName = item.getAttribute('dt-ext3') || '';
      const refCard = item.querySelector('.hyc-common-markdown__ref_card');
      if (!url && refCard) url = refCard.getAttribute('data-url') || '';

      let title = '';
      if (refCard) {
        const fullText = (refCard.textContent || '').replace(/\s+/g, ' ').trim();
        const sourceEl = refCard.querySelector('[class*="ref_card-foot__source_txt"]');
        const sourceText = (sourceEl?.textContent || '').trim();
        if (sourceText && fullText.includes(sourceText)) {
          title = fullText.replace(sourceText, '').trim() || fullText;
        } else {
          title = fullText;
        }
      }
      if (!title) title = sourceName;
      if (url || title) push(title || sourceName || url, url || undefined, sourceName || undefined);
    }

    const cards = Array.from(document.querySelectorAll('.hyc-common-markdown__ref_card[data-url], .hyc-common-markdown__ref_card'));
    for (const card of cards) {
      const url = card.getAttribute('data-url') || '';
      const title = (card.textContent || '').replace(/\s+/g, ' ').trim();
      if (url || title) push(title.slice(0, 160), url || undefined);
    }

    if (results.length === 0) {
      const docs = Array.from(
        document.querySelectorAll(
          '.hyc-component-deepsearch-cot__think__content__item__doc [class*="__doc__title__text"]'
        )
      );
      for (const doc of docs) {
        const title = (doc.textContent || '').replace(/\s+/g, ' ').trim();
        if (title) push(title);
      }
    }

    return results.slice(0, 40);
  });

  log('info', `提取到信源 ${sources.length} 条`);
  return sources;
}

async function runConversation(page, prompt, log) {
  log('info', `开始元宝对话：${prompt}`);
  await page.bringToFront().catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);

  const loginGate = await page.evaluate(() => {
    const bodyText = document.body?.innerText || '';
    const hasWechatLoginText = bodyText.includes('微信扫码登录');
    const hasLoginBtn = !!document.querySelector(
      'button.agent-dialogue__tool__login, [class*="agent-dialogue__tool__login"], [class*="hyc-login"]'
    );
    return hasWechatLoginText || hasLoginBtn;
  });
  if (loginGate) throw new Error('元宝需要登录后再测试');

  const baseline = await readAnswerSnapshot(page);
  await fillPrompt(page, prompt, log);
  await sleep(300);
  await clickSend(page, log);

  const answer = await waitForAnswer(page, sanitizeAnswer(baseline.text), log);
  if (!answer || isIncompleteAnswer(answer)) {
    throw new Error('未获取到元宝完整回答内容');
  }

  const sources = await extractSources(page, log);
  log('success', '元宝对话完成');
  return { answer, sources };
}

module.exports = { runConversation };
