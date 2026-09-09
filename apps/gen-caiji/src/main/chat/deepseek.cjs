'use strict';
/**
 * DeepSeek 对话测试（CommonJS 移植自上传的 deepseek.js）
 * runConversation(page, prompt, log) → { answer, sources }
 */
const { sleep, findVisibleLocator } = require('./common.cjs');

const INPUT_SELECTORS = [
  'textarea#chat-input',
  'textarea[data-testid="chat-input"]',
  'textarea[data-testid="chat_input"]',
  'textarea[placeholder*="DeepSeek" i]',
  'textarea[placeholder*="Message" i]',
  'textarea[placeholder*="发送消息"]',
  'textarea[placeholder*="问"]',
  'textarea'
];

const SEND_SELECTORS = [
  'div[role="button"][aria-label="Send"]',
  'button[aria-label="Send"]',
  'div[aria-label="Send"]',
  'button[aria-label*="发送"]',
  'div[role="button"][aria-label*="发送"]',
  'button[data-testid="send-button"]',
  'button[data-testid*="send" i]',
  'div.ds-icon-button:not([aria-disabled="true"])'
];

async function dismissPopups(page) {
  await page
    .evaluate(() => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const closers = Array.from(document.querySelectorAll('button, div[role="button"], span'));
      for (const el of closers) {
        if (!isVisible(el)) continue;
        const label = (el.getAttribute('aria-label') || '').trim();
        const text = (el.textContent || '').replace(/\s+/g, '');
        if (label === '关闭' || label === 'Close' || text === '关闭' || text === '×') {
          el.click();
          return;
        }
      }
    })
    .catch(() => undefined);
}

async function enableWebSearch(page, log) {
  const enabled = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const isActive = el => {
      const pressed = el.getAttribute('aria-pressed');
      if (pressed !== null) return pressed === 'true';
      const state = el.getAttribute('data-state') || '';
      if (state === 'on' || state === 'checked' || state === 'true') return true;
      const className = typeof el.className === 'string' ? el.className : '';
      return /(^|\s)(active|selected|on|checked)(\s|$)/i.test(className);
    };
    const candidates = Array.from(
      document.querySelectorAll('button, div[role="button"], [aria-label], [title]')
    ).filter(isVisible);
    const scored = candidates
      .map(el => {
        const label = `${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''} ${el.textContent || ''}`
          .replace(/\s+/g, ' ')
          .trim();
        let score = 0;
        if (/联网搜索|网页搜索|Web\s*search/i.test(label) && label.length < 40) score = 100;
        else if (/搜索/.test(label) && /联网|网页|web/i.test(label) && label.length < 48) score = 80;
        return { el, score, label, active: isActive(el) };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    const pick = scored[0];
    if (!pick) return { ok: false, reason: 'not_found' };
    if (pick.active) return { ok: true, reason: 'already_on', label: pick.label };
    pick.el.click();
    return { ok: true, reason: 'clicked', label: pick.label };
  });

  if (!enabled.ok) {
    log('warn', '未找到联网搜索开关，将直接发送');
    return;
  }
  if (enabled.reason === 'already_on') {
    log('info', `联网搜索已开启（${enabled.label || '搜索'}）`);
  } else {
    log('info', `已开启联网搜索（${enabled.label || '搜索'}）`);
    await sleep(350);
  }
}

async function fillPrompt(page, prompt, log) {
  const input = await findVisibleLocator(page, INPUT_SELECTORS);
  if (!input) throw new Error('未找到 DeepSeek 输入框');

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
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const send = await findVisibleLocator(page, SEND_SELECTORS);
    if (send) {
      const disabled = await send.evaluate(el => {
        if (el instanceof HTMLButtonElement && el.disabled) return true;
        if (el.getAttribute('aria-disabled') === 'true') return true;
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
    .replace(/内容由 AI 生成，请仔细甄别/gi, '')
    .replace(/重新生成|复制|分享|赞|踩/gi, '')
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
        .replace(/内容由 AI 生成，请仔细甄别/gi, '')
        .replace(/重新生成|复制|分享|赞|踩/gi, '')
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
            '[class*="toolbar"]',
            '[class*="action"]',
            '[class*="thinking"]',
            '[class*="Think"]',
            '[class*="search-view"]',
            '[class*="SearchView"]',
            '[class*="citation"]',
            '[class*="ref-list"]'
          ].join(',')
        )
        .forEach(n => n.remove());
      return clean(clone.innerText || clone.textContent || '');
    };

    const texts = [];
    const messages = Array.from(document.querySelectorAll('.ds-message, [class*="ds-message"]')).filter(isVisible);
    for (const msg of messages) {
      const md =
        msg.querySelector('.ds-markdown') ||
        msg.querySelector('[class*="ds-markdown"]') ||
        msg.querySelector('[class*="markdown"]');
      if (!md || !isVisible(md)) continue;
      const text = stripChrome(md);
      if (text) texts.push(text);
    }

    if (texts.length === 0) {
      const mdNodes = Array.from(document.querySelectorAll('.ds-markdown, [class*="ds-markdown"]'))
        .filter(isVisible)
        .map(el => stripChrome(el))
        .filter(Boolean);
      texts.push(...mdNodes);
    }

    const text = texts.length > 0 ? texts[texts.length - 1] : '';

    const bodyText = document.body?.innerText || '';
    const hasSearchMark =
      /已搜索到\s*\d+\s*个网页/.test(bodyText) ||
      /搜索到\s*\d+\s*个网页/.test(bodyText) ||
      /找到\s*\d+\s*个结果/.test(bodyText) ||
      /Found\s+\d+\s+results/i.test(bodyText);

    const stopVisible = Array.from(document.querySelectorAll('button, div[role="button"]')).some(el => {
      if (!isVisible(el)) return false;
      const t = (el.textContent || '').replace(/\s+/g, '');
      const aria = el.getAttribute('aria-label') || '';
      return t === '停止生成' || t === '停止' || /停止生成|Stop generating|Stop/i.test(aria) || /^Stop$/i.test(t);
    });

    const streamingHint =
      stopVisible ||
      /正在生成|生成中|思考中|正在搜索/.test(bodyText.slice(-400)) ||
      !!document.querySelector('.ds-markdown [class*="cursor"], .ds-markdown [class*="blink"]');

    const debug = [
      `host=${location.host}`,
      `path=${location.pathname.slice(0, 48)}`,
      `answers=${texts.length}`,
      `search=${hasSearchMark ? 1 : 0}`,
      `stream=${streamingHint ? 1 : 0}`,
      `stop=${stopVisible ? 1 : 0}`,
      `len=${text.length}`
    ].join(' ');

    return { text, streaming: streamingHint, stopVisible, hasSearchMark, assistantCount: texts.length, debug };
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

  log('info', '等待 DeepSeek 回答完成…');

  while (Date.now() - started < timeoutMs) {
    await sleep(800);
    const snap = await readAnswerSnapshot(page);
    lastDebug = snap.debug;
    const text = sanitizeAnswer(snap.text);
    const placeholder = isIncompleteAnswer(text);

    if (text && !placeholder && text !== baselineText) sawNewAnswer = true;
    if (text && !placeholder && text.length > Math.max(baselineText.length + 20, 60)) sawNewAnswer = true;

    if (text && !placeholder && text === lastText) {
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
          `${snap.hasSearchMark ? '（已有搜索）' : ''}` +
          `${sawNewAnswer ? '' : '（等待完整回答）'}` +
          ` 稳定${contentStableRounds}轮` +
          ` [${snap.debug}]`
      );
    }

    if (sawNewAnswer && !placeholder && !snap.streaming && contentStableRounds >= 2 && text.length >= 40) {
      log('success', `回答已完成（${text.length} 字）`);
      return text;
    }
    if (
      sawNewAnswer && !placeholder && snap.hasSearchMark && !snap.stopVisible && contentStableRounds >= 3 && text.length >= 80
    ) {
      log('success', `回答已稳定（含搜索标记，${text.length} 字）`);
      return text;
    }
    if (sawNewAnswer && !placeholder && contentStableRounds >= 5 && text.length >= 120) {
      log('success', `回答已稳定（${text.length} 字）`);
      return text;
    }
  }

  if (lastText && !isIncompleteAnswer(lastText) && lastText.length >= 40) {
    log('warn', `等待超时，返回当前已生成内容 [${lastDebug}]`);
    return lastText;
  }
  throw new Error(`等待 DeepSeek 完整回答超时 [${lastDebug}]`);
}

function domainFromUrl(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

async function openSourcesPanel(page, log) {
  const alreadyOpen = await page.evaluate(() => {
    const msgs = Array.from(document.querySelectorAll('.ds-message'));
    const lastAi = [...msgs].reverse().find(msg => {
      const cls = String(msg.className || '');
      if (cls.includes('d29f3d7d')) return false;
      return !!msg.querySelector('.ds-markdown, [class*="ds-markdown"]');
    });
    const scope = lastAi || document;
    return (
      scope.querySelectorAll('a[class*="_04ab7b1"], .f2021e64 a[href^="http"], [class*="_02fb570"] a[href^="http"]').length >= 1
    );
  });
  if (alreadyOpen) {
    log('info', '信源卡片已可见');
    return true;
  }

  log('info', '尝试展开 DeepSeek「搜索到 N 个网页」…');

  const clicked = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const msgs = Array.from(document.querySelectorAll('.ds-message'));
    const lastAi = [...msgs].reverse().find(msg => {
      const cls = String(msg.className || '');
      if (cls.includes('d29f3d7d')) return false;
      return !!msg.querySelector('.ds-markdown, [class*="ds-markdown"]');
    });
    const scope = lastAi || document;
    const summary = scope.querySelector('span[class*="_08cbf39"], [class*="_08cbf39"]') || null;

    const ranked = Array.from(scope.querySelectorAll('div, span, button, a'))
      .filter(isVisible)
      .map(el => {
        const t = (el.textContent || '').replace(/\s+/g, '');
        let s = 0;
        if (/^搜索到\d+个网页$/.test(t) || /^已搜索到\d+个网页$/.test(t)) s = 100;
        else if (/搜索到\d+个网页/.test(t) && t.length < 24) s = 90;
        else if (/^找到\d+个结果$/.test(t)) s = 85;
        else if (/Found\d+results/i.test(t) && t.length < 28) s = 80;
        else if (/^来源\d*$/.test(t) || /^引用\d*$/.test(t)) s = 50;
        return { el, s, y: el.getBoundingClientRect().y };
      })
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s || a.y - b.y);

    const pick = summary && isVisible(summary) ? summary : ranked[0]?.el;
    if (!pick) return false;
    pick.scrollIntoView({ block: 'center' });
    pick.click();
    return true;
  });

  if (!clicked) {
    log('warn', '未找到搜索结果入口（可能未开启联网搜索）');
    return false;
  }

  for (let i = 0; i < 14; i++) {
    await sleep(350);
    const ready = await page.evaluate(() => {
      const msgs = Array.from(document.querySelectorAll('.ds-message'));
      const lastAi = [...msgs].reverse().find(msg => {
        const cls = String(msg.className || '');
        if (cls.includes('d29f3d7d')) return false;
        return !!msg.querySelector('.ds-markdown, [class*="ds-markdown"]');
      });
      const scope = lastAi || document;
      return (
        scope.querySelectorAll('a[class*="_04ab7b1"], .f2021e64 a[href^="http"], [class*="_02fb570"] a[href^="http"]').length >= 1
      );
    });
    if (ready) {
      log('info', '信源卡片已展开');
      return true;
    }
  }

  log('warn', '已点击搜索入口，但信源卡片未出现');
  return false;
}

async function extractSources(page, log, networkSources = []) {
  await openSourcesPanel(page, log);
  await sleep(500);

  const sources = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    const push = (title, url, snippet) => {
      const key = `${title || ''}|${url || ''}`;
      if (!key || key === '|' || seen.has(key)) return;
      if (!title && !url) return;
      if (/deepseek\.com|accounts\.google|passport\./i.test(url || '')) return;
      seen.add(key);
      results.push({
        title: title?.trim() || undefined,
        url: url?.trim() || undefined,
        snippet: snippet?.trim() || undefined
      });
    };
    const domainOf = url => {
      try { return new URL(url).hostname; } catch { return url; }
    };
    const msgs = Array.from(document.querySelectorAll('.ds-message'));
    const lastAi = [...msgs].reverse().find(msg => {
      const cls = String(msg.className || '');
      if (cls.includes('d29f3d7d')) return false;
      return !!msg.querySelector('.ds-markdown, [class*="ds-markdown"]');
    });
    const scope = lastAi || document;

    let refLinks = Array.from(scope.querySelectorAll('a[class*="_04ab7b1"]'));
    if (refLinks.length === 0) {
      const section = scope.querySelector('.f2021e64, [class*="f2021e64"]');
      if (section) refLinks = Array.from(section.querySelectorAll('a'));
    }
    if (refLinks.length === 0) {
      refLinks = Array.from(scope.querySelectorAll('[class*="_02fb570"] a[href^="http"]'));
    }

    for (const link of refLinks) {
      const url = (link.href || '').trim();
      if (!url || /deepseek\.com/i.test(url)) continue;
      let title = (link.textContent || '').replace(/\s+/g, ' ').trim();
      if (/^-?\d+$/.test(title) || !title) title = domainOf(url);
      push(title.slice(0, 220), url);
    }

    if (results.length === 0 && lastAi) {
      for (const a of Array.from(lastAi.querySelectorAll('a[href^="http"]'))) {
        const url = a.href;
        if (!url || /deepseek\.com/i.test(url)) continue;
        let title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        if (/^-?\d+$/.test(title) || !title) title = domainOf(url);
        push(title.slice(0, 220), url);
      }
    }

    return results.slice(0, 40);
  });

  const merged = [...sources];
  const seen = new Set(merged.map(s => `${s.title || ''}|${s.url || ''}`));
  for (const item of networkSources) {
    const key = `${item.title || ''}|${item.url || ''}`;
    if (seen.has(key)) continue;
    if (!item.title && !item.url) continue;
    if (item.url && /deepseek\.com/i.test(item.url)) continue;
    seen.add(key);
    merged.push({
      title: item.title || (item.url ? domainFromUrl(item.url) : undefined),
      url: item.url,
      snippet: item.snippet
    });
  }

  log('info', `提取到信源 ${merged.length} 条`);
  return merged.slice(0, 40);
}

function attachDeepseekSourceListener(page) {
  const collected = [];
  const seen = new Set();

  const push = (title, url, snippet) => {
    const key = `${title || ''}|${url || ''}`;
    if (!key || key === '|' || seen.has(key)) return;
    if (!title && !url) return;
    if (url && /deepseek\.com/i.test(url)) return;
    seen.add(key);
    collected.push({ title, url, snippet });
  };

  const visit = (value, depth) => {
    if (depth > 10 || value == null) return;
    if (Array.isArray(value)) {
      value.forEach(item => visit(item, depth + 1));
      return;
    }
    if (typeof value !== 'object') return;
    const record = value;
    const urlCandidate =
      (typeof record.url === 'string' && record.url) ||
      (typeof record.link === 'string' && record.link) ||
      (typeof record.href === 'string' && record.href) ||
      (typeof record.site_url === 'string' && record.site_url) ||
      undefined;
    const titleCandidate =
      (typeof record.title === 'string' && record.title) ||
      (typeof record.name === 'string' && record.name) ||
      (typeof record.site_name === 'string' && record.site_name) ||
      undefined;
    const snippetCandidate =
      (typeof record.snippet === 'string' && record.snippet) ||
      (typeof record.summary === 'string' && record.summary) ||
      (typeof record.content === 'string' && record.content.slice(0, 200)) ||
      undefined;
    if (urlCandidate && /^https?:\/\//i.test(urlCandidate)) {
      push(titleCandidate || undefined, urlCandidate, snippetCandidate || undefined);
    }
    for (const [key, child] of Object.entries(record)) {
      if (/search|cite|citation|source|webpage|web_page|reference|result/i.test(key)) {
        visit(child, depth + 1);
      } else if (Array.isArray(child) || (typeof child === 'object' && child !== null)) {
        if (depth < 4) visit(child, depth + 1);
      }
    }
  };

  const onResponse = async response => {
    try {
      const url = response.url();
      if (!/chat\.deepseek\.com/i.test(url)) return;
      if (!/(completion|chat|search|message|conversation|stream)/i.test(url)) return;
      if (/\.(js|css|png|jpg|jpeg|webp|svg|woff2?)(\?|$)/i.test(url)) return;

      const contentType = response.headers()['content-type'] || '';
      const text = await response.text().catch(() => '');
      if (!text) return;

      if (/json/i.test(contentType) || text.trim().startsWith('{') || text.trim().startsWith('[')) {
        try { visit(JSON.parse(text), 0); } catch { /* ignore */ }
        return;
      }

      for (const line of text.split('\n')) {
        const payload = line.replace(/^data:\s*/, '').trim();
        if (!payload || payload === '[DONE]') continue;
        if (!(payload.startsWith('{') || payload.startsWith('['))) continue;
        try { visit(JSON.parse(payload), 0); } catch { /* ignore */ }
      }
    } catch {
      /* ignore */
    }
  };

  page.on('response', onResponse);
  return {
    getSources: () => collected.slice(0, 40),
    dispose: () => page.off('response', onResponse)
  };
}

async function runConversation(page, prompt, log) {
  log('info', `开始 DeepSeek 对话：${prompt}`);
  await page.bringToFront().catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  await dismissPopups(page);
  await sleep(400);

  const loginGate = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const hasInput = !!document.querySelector('#chat-input, textarea');
    if (hasInput) return false;
    const signIn =
      document.querySelector('.ds-sign-in-form__main, .ds-sign-in-form-wrapper, .ds-auth-form-wrapper') ||
      Array.from(document.querySelectorAll('button')).find(el => {
        if (!isVisible(el)) return false;
        const t = (el.textContent || '').replace(/\s+/g, '');
        return t === '登录' || t === 'Log in' || t === 'Sign in';
      });
    return !!signIn;
  });
  if (loginGate) throw new Error('DeepSeek 需要登录后再测试');

  await enableWebSearch(page, log);

  const sourceListener = attachDeepseekSourceListener(page);
  try {
    const baseline = await readAnswerSnapshot(page);
    await fillPrompt(page, prompt, log);
    await sleep(300);
    await clickSend(page, log);

    await page.waitForURL(/\/a\/chat\//, { timeout: 20000 }).catch(() => undefined);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);

    const answer = await waitForAnswer(page, sanitizeAnswer(baseline.text), log);
    if (!answer || isIncompleteAnswer(answer)) {
      throw new Error('未获取到 DeepSeek 完整回答内容');
    }

    const sources = await extractSources(page, log, sourceListener.getSources());
    log('success', 'DeepSeek 对话完成');
    return { answer, sources };
  } finally {
    sourceListener.dispose();
  }
}

module.exports = { runConversation };
