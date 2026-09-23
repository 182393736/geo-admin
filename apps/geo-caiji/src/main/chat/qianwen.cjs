'use strict';
/**
 * 通义千问对话测试（CommonJS 移植自上传的 qianwen.js）
 */
const { sleep, findVisibleLocator } = require('./common.cjs');

const INPUT_SELECTORS = [
  '[role="textbox"][contenteditable="true"]',
  'textarea.message-input-textarea',
  'textarea[placeholder*="输入"]',
  'textarea[placeholder*="问"]',
  '[contenteditable="true"]',
  'textarea'
];

const SEND_SELECTORS = [
  'button[aria-label="发送消息"]',
  'button[aria-label*="发送"]',
  '.message-input-right-button-send',
  'button[class*="send" i]:not([disabled])'
];

async function fillPrompt(page, prompt, log) {
  const input = await findVisibleLocator(page, INPUT_SELECTORS);
  if (!input) throw new Error('未找到千问输入框');

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
      el.dispatchEvent(
        new InputEvent('beforeinput', {
          inputType: 'insertText',
          data: text,
          bubbles: true,
          cancelable: true
        })
      );
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
        if (el instanceof HTMLButtonElement) return el.disabled;
        const className = typeof el.className === 'string' ? el.className : '';
        return /disabled/i.test(className) || el.getAttribute('aria-disabled') === 'true';
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
    .replace(/内容由AI生成[，,]仅供参考/gi, '')
    .replace(/重新生成|重新回答|复制|分享/gi, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isIncompleteAnswer(text) {
  const t = text.trim();
  if (!t) return true;
  if (/^(正在思考|思考中|正在搜索|搜索中|生成中|请稍候)[.。…\s]*$/i.test(t)) return true;
  const compact = t.replace(/\s+/g, '');
  if (/^(正在思考|思考中|正在搜索|搜索中|生成中)+$/i.test(compact)) return true;
  if (t.length < 40 && /(正在思考|思考中|正在搜索|搜索中|生成中)/.test(t)) return true;
  return false;
}

async function readAnswerSnapshot(page) {
  return page.evaluate(() => {
    const clean = value =>
      (value || '')
        .replace(/内容由AI生成[，,]仅供参考/gi, '')
        .replace(/重新生成|重新回答|复制|分享/gi, '')
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
            '[class*="toolbar"]',
            '[class*="operation"]',
            '[class*="action"]',
            '[class*="reference-wrap"]',
            '[id^="reference-link-anchor-"]',
            '[data-answer-feedback-toolbar]',
            '[class*="thinking"]',
            '[class*="Think"]',
            '[class*="video"]',
            '[class*="Video"]',
            'button'
          ].join(',')
        )
        .forEach(n => n.remove());
      return clean(clone.innerText || clone.textContent || '');
    };

    const texts = [];

    const answerWraps = Array.from(
      document.querySelectorAll('[data-chat-answers-wrap], [data-msgid$="-answer"]')
    ).filter(node => isVisible(node));

    for (const node of answerWraps) {
      const content =
        node.querySelector('#qk-markdown-react') ||
        node.querySelector('.qk-md-text') ||
        node.querySelector('[class*="markdown"]') ||
        node;
      const text = stripChrome(content);
      if (text) texts.push(text);
    }

    if (texts.length === 0) {
      const mdNodes = Array.from(document.querySelectorAll('.qk-md-text, #qk-markdown-react'))
        .filter(el => isVisible(el))
        .map(el => stripChrome(el))
        .filter(Boolean);
      texts.push(...mdNodes);
    }

    if (texts.length === 0) {
      const phase = Array.from(
        document.querySelectorAll('.response-message-content.phase-answer, [class*="phase-answer"]')
      )
        .filter(el => isVisible(el))
        .map(el => stripChrome(el))
        .filter(Boolean);
      texts.push(...phase);
    }

    const text = texts.length > 0 ? texts[texts.length - 1] : '';

    const stopVisible = Array.from(
      document.querySelectorAll('button[aria-label*="停止"], button[aria-label*="stop" i], [class*="stop" i]')
    ).some(el => isVisible(el));

    const sendVisible = Array.from(
      document.querySelectorAll('button[aria-label="发送消息"], button[aria-label*="发送"], .message-input-right-button-send')
    ).some(el => {
      if (!isVisible(el)) return false;
      if (el instanceof HTMLButtonElement && el.disabled) return false;
      return el.getAttribute('aria-disabled') !== 'true';
    });

    const loading = Array.from(
      document.querySelectorAll(
        [
          '[class*="animate-pulse"]',
          '[class*="streaming"]',
          '[class*="generating"]',
          '[class*="cursor-blink"]',
          '[class*="typing"]',
          '[class*="loading-dot"]'
        ].join(',')
      )
    ).some(el => isVisible(el));

    const incompleteHint =
      !text ||
      /^(正在思考|思考中|正在搜索|搜索中|生成中|请稍候)[.。…\s]*$/i.test(text) ||
      (text.length < 40 && /(正在思考|思考中|正在搜索|搜索中|生成中)/.test(text));

    const debug = [
      `host=${location.host}`,
      `answers=${texts.length}`,
      `stop=${stopVisible ? 1 : 0}`,
      `send=${sendVisible ? 1 : 0}`,
      `loading=${loading ? 1 : 0}`,
      `len=${text.length}`
    ].join(' ');

    return {
      text,
      stopVisible,
      sendVisible,
      loading,
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

  log('info', '等待千问回答完成…');

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
    if (
      sawNewAnswer && !incomplete && !snap.stopVisible && !snap.loading && snap.sendVisible && contentStableRounds >= 2 && text.length >= 40
    ) {
      log('success', `回答已完成（发送按钮已恢复，${text.length} 字）`);
      return text;
    }
  }

  if (lastText && !isIncompleteAnswer(lastText) && lastText.length >= 40) {
    log('warn', `等待超时，返回当前已生成内容 [${lastDebug}]`);
    return lastText;
  }
  throw new Error(`等待千问完整回答超时 [${lastDebug}]`);
}

async function openSourcesPanel(page, log) {
  const alreadyOpen = await page.evaluate(() => {
    const panel = document.querySelector('#qianwen-layout-right-panel, [data-testid="qianwen-layout-right-panel"]');
    if (!(panel instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(panel);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = panel.getBoundingClientRect();
    if (rect.width < 200 || rect.height < 120) return false;
    return /参考来源/.test(panel.innerText || '');
  });
  if (alreadyOpen) {
    log('info', '信源右侧面板已可见');
    return true;
  }

  log('info', '点击回答下方「N篇来源」打开右侧信源列表…');

  const ref = page.locator('[class*="reference-wrap"], [id^="reference-link-anchor-"]').filter({ hasText: /篇来源/ });
  if ((await ref.count()) > 0) {
    const target = ref.last();
    await target.scrollIntoViewIfNeeded().catch(() => undefined);
    await target.click({ force: true, timeout: 5000 }).catch(() => undefined);
  } else {
    const clicked = await page.evaluate(() => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const nodes = Array.from(
        document.querySelectorAll(
          '[class*="reference-wrap"], [id^="reference-link-anchor-"], [class*="link-title"], [class*="text-content"], span, div'
        )
      ).filter(isVisible);

      const ranked = nodes
        .map(el => {
          const t = (el.textContent || '').replace(/\s+/g, '');
          let score = 0;
          if (/^\d+篇来源$/.test(t)) score = 50;
          else if (/\d+篇来源/.test(t) && t.length < 16) score = 40;
          else if (/reference-wrap|reference-link-anchor/i.test(String(el.className || '') + el.id)) score = 30;
          return { el, score, t };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);

      const pick = ranked[0]?.el;
      if (!(pick instanceof HTMLElement)) return false;
      const clickable =
        pick.closest('[class*="reference-wrap"]') ||
        pick.closest('[id^="reference-link-anchor-"]') ||
        pick.closest('[class*="link-title"]') ||
        pick;
      pick.scrollIntoView({ block: 'center', inline: 'nearest' });
      clickable.click();
      return true;
    });
    if (!clicked) {
      log('warn', '未找到「N篇来源」入口');
      return false;
    }
  }

  for (let i = 0; i < 12; i++) {
    await sleep(400);
    const ready = await page.evaluate(() => {
      const panel = document.querySelector('#qianwen-layout-right-panel, [data-testid="qianwen-layout-right-panel"]');
      if (!(panel instanceof HTMLElement)) return false;
      const rect = panel.getBoundingClientRect();
      if (rect.width < 200 || rect.height < 120) return false;
      return (
        /参考来源/.test(panel.innerText || '') ||
        !!panel.querySelector('[data-c="refer_panel"], [class*="source-item"], [class*="deep-think-source"]')
      );
    });
    if (ready) {
      log('info', '右侧信源面板已打开');
      return true;
    }
  }

  log('warn', '已点击来源入口，但右侧面板未出现');
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
      if (/tv\.sohu\.com|bilibili\.com|iqiyi\.com|youku\.com/i.test(url || '')) {
        if (/小狐狸|避坑指南|报价单的陷阱|标题党/i.test(title || '')) return;
      }
      seen.add(key);
      results.push({
        title: title?.trim() || undefined,
        url: url?.trim() || undefined,
        snippet: snippet?.trim() || undefined
      });
    };

    const panel =
      document.querySelector('#qianwen-layout-right-panel, [data-testid="qianwen-layout-right-panel"]') ||
      Array.from(document.querySelectorAll('[class*="deep-think-source"]')).find(el => /参考来源/.test(el.textContent || '')) ||
      null;

    if (panel) {
      const cards = Array.from(
        panel.querySelectorAll('[data-c="refer_panel"], [class*="source-item"], [id^="deep-think-source-card-"]')
      );

      for (const card of cards) {
        const link = card.querySelector('a[href^="http"]') || card.querySelector('a[href]');
        let url = (link?.href || '').trim();
        if (/qianwen\.com|tongyi\.|aliyun\.com|passport\.|alicdn\./i.test(url)) url = '';

        let title = (link?.textContent || card.querySelector('[class*="title"]')?.textContent || '')
          .replace(/\s+/g, ' ')
          .trim();

        if (!title) title = (card.textContent || '').replace(/\s+/g, ' ').trim();
        title = title.replace(/^\d+\s*/, '').trim();
        title = title.replace(/(?:\s*(?:www\.)?[a-z0-9.-]+\.[a-z]{2,})+$/i, '').trim();

        const site = (card.querySelector('[class*="site"], [class*="host"], [class*="domain"]')?.textContent || '')
          .replace(/\s+/g, ' ')
          .trim();

        if (url || (title && title.length > 2 && !/^参考来源/.test(title))) {
          push(title.slice(0, 200) || url, url || undefined, site || undefined);
        }
      }

      const anchors = Array.from(panel.querySelectorAll('a[href]'));
      for (const a of anchors) {
        const href = a.href || '';
        if (!href || /qianwen\.com|tongyi\.|aliyun\.com|passport\.|alicdn\./i.test(href)) continue;
        const title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (title.length < 2) continue;
        push(title.slice(0, 200), href);
      }
    }

    return results.slice(0, 40);
  });

  log('info', `提取到信源 ${sources.length} 条`);
  return sources;
}

async function runConversation(page, prompt, log) {
  log('info', `开始千问对话：${prompt}`);
  await page.bringToFront().catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);

  await page
    .evaluate(() => {
      const modal = document.querySelector('[role=alert-biz-modal]');
      if (!(modal instanceof HTMLElement)) return;
      const closer =
        Array.from(modal.querySelectorAll('div, button, span')).find(node => {
          const label = node.getAttribute('aria-label') || '';
          const className = String(node.className || '');
          return label === '关闭' || /close|dismiss|cancel/i.test(className);
        }) || modal.querySelector('svg')?.parentElement;
      if (closer instanceof HTMLElement) closer.click();
    })
    .catch(() => undefined);

  const loginGate = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const modal = document.querySelector('[role=alert-biz-modal]');
    if (modal && isVisible(modal)) {
      const src = modal.querySelector('iframe')?.getAttribute('src') || '';
      if (/passport\.qianwen\.com|login/i.test(src)) return true;
    }
    const loginButton = Array.from(document.querySelectorAll('button')).find(
      node => (node.textContent || '').trim() === '登录' && isVisible(node)
    );
    if (loginButton) return true;
    const hint = Array.from(document.querySelectorAll('p')).find(node =>
      (node.textContent || '').includes('登录可同步历史对话')
    );
    return !!(hint && isVisible(hint));
  });
  if (loginGate) throw new Error('千问需要登录后再测试');

  const baseline = await readAnswerSnapshot(page);
  await fillPrompt(page, prompt, log);
  await sleep(300);
  await clickSend(page, log);

  const answer = await waitForAnswer(page, sanitizeAnswer(baseline.text), log);
  if (!answer || isIncompleteAnswer(answer)) {
    throw new Error('未获取到千问完整回答内容');
  }

  const sources = await extractSources(page, log);
  log('success', '千问对话完成');
  return { answer, sources };
}

module.exports = { runConversation };
