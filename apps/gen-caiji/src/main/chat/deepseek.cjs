'use strict';
/**
 * DeepSeek 对话测试（CommonJS 移植自上传的 deepseek.js）
 * runConversation(page, prompt, log) → { answer, sources }
 */
const { sleep, findVisibleLocator, extractAnswerHtml } = require('./common.cjs');

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
      const aria = (el.getAttribute('aria-label') || '').replace(/\s+/g, '');
      // 避免单独「停止」误伤其它按钮；优先匹配停止生成
      return (
        t === '停止生成' ||
        /^Stopgenerating$/i.test(t) ||
        /停止生成|Stopgenerating/i.test(aria) ||
        (t === '停止' && /生成|回答|输出/.test(aria))
      );
    });

    // 仅看最后一条回答内的光标，避免全局 loading/aria-busy 误判成一直生成中
    let lastMd = null;
    const mdAll = Array.from(document.querySelectorAll('.ds-markdown')).filter(isVisible);
    if (mdAll.length) lastMd = mdAll[mdAll.length - 1];
    const cursorInAnswer =
      !!lastMd &&
      Array.from(lastMd.querySelectorAll('[class*="cursor"], [class*="blink"]')).some(isVisible);

    const streamingHint = stopVisible || cursorInAnswer;

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
  const timeoutMs = 600_000; // 与主进程 CHAT_TIMEOUT_MS 对齐（10 分钟）
  const started = Date.now();
  let lastText = '';
  let contentStableRounds = 0;
  let sawNewAnswer = false;
  let lastProgressLog = 0;
  let lastDebug = '';
  let maxLen = 0;

  log('info', '等待 DeepSeek 回答完成…');

  while (Date.now() - started < timeoutMs) {
    await sleep(800);
    const snap = await readAnswerSnapshot(page);
    lastDebug = snap.debug;
    const text = sanitizeAnswer(snap.text);
    const placeholder = isIncompleteAnswer(text);
    if (text.length > maxLen) maxLen = text.length;

    if (text && !placeholder && text !== baselineText) sawNewAnswer = true;
    if (text && !placeholder && text.length > Math.max(baselineText.length + 20, 60)) sawNewAnswer = true;

    // 以字数稳定为准累加；流式误判不再清零（否则永远卡在「对话中」）
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
          `${snap.hasSearchMark ? '（已有搜索）' : ''}` +
          `${sawNewAnswer ? '' : '（等待完整回答）'}` +
          ` 稳定${contentStableRounds}轮` +
          ` [${snap.debug}]`
      );
    }

    // 仍能点「停止」→ 确实在生成，继续等
    if (snap.stopVisible) continue;

    // 无停止钮 + 字数稳定约 4s
    if (
      sawNewAnswer &&
      !placeholder &&
      contentStableRounds >= 5 &&
      text.length >= 80 &&
      text.length >= maxLen
    ) {
      log('success', `回答已完成（${text.length} 字）`);
      return text;
    }

    // 有搜索标记时稍严一点
    if (
      sawNewAnswer &&
      !placeholder &&
      snap.hasSearchMark &&
      contentStableRounds >= 6 &&
      text.length >= 120 &&
      text.length >= maxLen
    ) {
      log('success', `回答已稳定（含搜索标记，${text.length} 字）`);
      return text;
    }

    // 兜底
    if (
      sawNewAnswer &&
      !placeholder &&
      contentStableRounds >= 12 &&
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
  throw new Error(`等待 DeepSeek 完整回答超时 [${lastDebug}]`);
}

function domainFromUrl(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

/** 右侧区域指纹：点击前后对比（链接 / favicon / 站点名） */
async function rightPanelFingerprint(page) {
  return page.evaluate(() => {
    const mid = window.innerWidth * 0.68;
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.left >= mid;
    };
    let links = 0;
    let favicons = 0;
    const siteNames = [];
    for (const a of document.querySelectorAll('a[href^="http"]')) {
      if (!isVisible(a) || /deepseek\.com/i.test(a.href || '')) continue;
      links += 1;
    }
    for (const img of document.querySelectorAll('img')) {
      if (!isVisible(img)) continue;
      const r = img.getBoundingClientRect();
      if (r.width > 0 && r.width <= 28 && r.height <= 28) favicons += 1;
    }
    for (const el of document.querySelectorAll('div, span, a, p')) {
      if (!isVisible(el)) continue;
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (t.length < 2 || t.length > 40) continue;
      if (/搜索到|网页|引用|来源|DeepSeek|复制|分享/.test(t)) continue;
      if (/^https?:/i.test(t)) continue;
      if (/[。！？]/.test(t)) continue;
      if (el.children.length > 3) continue;
      siteNames.push(t);
    }
    const uniq = [...new Set(siteNames)].slice(0, 12);
    return { links, favicons, siteNames: uniq, siteCount: uniq.length, textLen: uniq.join('').length };
  });
}

/** 右侧信源抽屉是否真正打开：需要站点名/favicon，不能只靠正文引用链 */
async function isSourcesDrawerOpen(page) {
  const fp = await rightPanelFingerprint(page);
  const open =
    (fp.links >= 5 && fp.favicons >= 3) ||
    (fp.links >= 4 && fp.siteCount >= 3 && fp.favicons >= 2);
  return { open, links: fp.links, favicons: fp.favicons, siteCount: fp.siteCount, siteNames: fp.siteNames };
}

function panelShotDir() {
  const path = require('node:path');
  const os = require('node:os');
  const fs = require('node:fs');
  const dir = path.join(os.homedir(), 'Library/Application Support/gen-caiji/results/_debug_deepseek_sources');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * 打开 DeepSeek 右侧信源抽屉。
 * 实测「搜索到 N 个网页」在助手消息顶部（回答正文上方）；滚到回答底部时该入口 top 为负，点击会落空。
 * 流程：滚到消息顶部 → 点入口 → 截图前后对比（favicon/站点名）→ 未展开则失败。
 */
async function openSourcesPanel(page, log) {
  const path = require('node:path');
  const shotDir = panelShotDir();
  const stamp = Date.now();
  const beforePath = path.join(shotDir, `${stamp}-before.png`);
  const afterPath = path.join(shotDir, `${stamp}-after.png`);

  log('info', '打开 DeepSeek 信源：先滚到消息顶部点击「搜索到 N 个网页」…');

  await page.evaluate(() => {
    document.querySelectorAll('[data-geo-ds-source-entry]').forEach(el => el.removeAttribute('data-geo-ds-source-entry'));
  });

  // 滚到最后一条 AI 消息顶部，让「搜索到 N 个网页」进入视口
  await page.evaluate(() => {
    const msgs = Array.from(document.querySelectorAll('.ds-message'));
    const lastAi = [...msgs].reverse().find(msg => {
      const cls = String(msg.className || '');
      if (cls.includes('d29f3d7d')) return false;
      return !!msg.querySelector('.ds-markdown');
    });
    if (!lastAi) return;
    lastAi.scrollIntoView({ block: 'start', inline: 'nearest' });
    // 微调：避免被顶栏遮住
    const scroller = lastAi.closest('[class*="scroll"]') || document.scrollingElement;
    if (scroller) scroller.scrollTop = Math.max(0, scroller.scrollTop - 40);
  });
  await sleep(600);

  const beforeFp = await rightPanelFingerprint(page);
  await page.screenshot({ path: beforePath, fullPage: false }).catch(() => undefined);
  log('info', `点击前指纹 links=${beforeFp.links} favicons=${beforeFp.favicons} sites=${beforeFp.siteCount} → ${beforePath}`);

  const locateAndMark = async () =>
    page.evaluate(() => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      document.querySelectorAll('[data-geo-ds-source-entry]').forEach(el => el.removeAttribute('data-geo-ds-source-entry'));

      const msgs = Array.from(document.querySelectorAll('.ds-message'));
      const lastAi = [...msgs].reverse().find(msg => {
        const cls = String(msg.className || '');
        if (cls.includes('d29f3d7d')) return false;
        return !!msg.querySelector('.ds-markdown');
      });
      if (!lastAi) return { ok: false, reason: 'no-ai' };
      lastAi.scrollIntoView({ block: 'start', inline: 'nearest' });

      const md = lastAi.querySelector('.ds-markdown');
      const mdTop = md ? md.getBoundingClientRect().top : 9999;

      const candidates = [];
      for (const el of lastAi.querySelectorAll('div, span, button, a, [role="button"]')) {
        if (!isVisible(el)) continue;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const compact = t.replace(/\s+/g, '');
        if (!/^已?搜索到\d+个网页$/.test(compact) && !/^已?搜索到\d+个网页/.test(compact)) continue;
        if (compact.length > 20) continue;
        const r = el.getBoundingClientRect();
        // 优先：在 markdown 上方或紧贴其上方的入口（DeepSeek 常见位置）
        const aboveMd = r.bottom <= mdTop + 8;
        const nearTop = r.top >= 60 && r.top < 520;
        let s = /^已?搜索到\d+个网页$/.test(compact) ? 100 : 80;
        if (aboveMd) s += 40;
        if (nearTop) s += 20;
        // 同级取更小节点（叶子）
        s -= Math.min(30, Math.floor((r.width * r.height) / 20000));
        candidates.push({ el, t, s, top: r.top, aboveMd });
      }
      candidates.sort((a, b) => b.s - a.s || a.top - b.top);
      const pick = candidates[0]?.el;
      if (!pick) {
        return {
          ok: false,
          reason: 'no-search-entry',
          mdTop: Math.round(mdTop),
          all: candidates.length
        };
      }
      // 必须点「整行」宽容器（实测叶子文案仅 ~187px，整行约 700px+ 才可展开）
      let target = pick;
      let best = pick;
      let bestW = pick.getBoundingClientRect().width;
      for (let p = pick; p && p !== lastAi; p = p.parentElement) {
        const pr = p.getBoundingClientRect();
        if (pr.height < 18 || pr.height > 96) continue;
        if (pr.width < 160) continue;
        // 更宽的同行容器优先
        if (pr.width > bestW && pr.width < window.innerWidth * 0.95) {
          best = p;
          bestW = pr.width;
        }
        // 含多个小图标的行直接采用
        const imgs = Array.from(p.querySelectorAll('img')).filter(img => {
          const ir = img.getBoundingClientRect();
          return ir.width > 0 && ir.width <= 28;
        });
        if (imgs.length >= 2 && pr.width > 240) {
          best = p;
          bestW = pr.width;
          break;
        }
      }
      target = best;
      target.setAttribute('data-geo-ds-source-entry', '1');
      // 调试：把边框标红，方便截图确认点的是整行
      try {
        target.style.outline = '3px solid #ff2d55';
        target.style.outlineOffset = '2px';
      } catch (e) {}
      target.scrollIntoView({ block: 'center', inline: 'nearest' });
      const r = target.getBoundingClientRect();
      return {
        ok: true,
        label: (candidates[0].t || '').slice(0, 40),
        top: Math.round(r.top),
        left: Math.round(r.left),
        w: Math.round(r.width),
        h: Math.round(r.height),
        aboveMd: candidates[0].aboveMd,
        score: candidates[0].s,
        tag: target.tagName,
        cls: String(target.className || '').slice(0, 80)
      };
    });

  const changedEnough = (before, after) => {
    if (!after) return false;
    if (after.favicons >= Math.max(5, before.favicons + 4)) return true;
    if (after.links >= before.links + 5 && after.favicons >= 3) return true;
    if (after.siteCount >= before.siteCount + 5 && after.favicons >= 3) return true;
    return false;
  };

  for (let attempt = 1; attempt <= 5; attempt++) {
    const marked = await locateAndMark();
    if (!marked?.ok) {
      log('warn', `第${attempt}次未找到「搜索到N个网页」: ${JSON.stringify(marked)}`);
      // 全文兜底
      const fb = await page.getByText(/已?搜索到\s*\d+\s*个网页/).first();
      if (await fb.isVisible().catch(() => false)) {
        await fb.scrollIntoViewIfNeeded().catch(() => undefined);
        await page.screenshot({ path: beforePath, fullPage: false }).catch(() => undefined);
        await fb.click({ force: true });
        log('info', `第${attempt}次 Playwright getByText 点击`);
      } else {
        await sleep(400);
        continue;
      }
    } else {
      log('info', `第${attempt}次入口「${marked.label}」top=${marked.top} aboveMd=${marked.aboveMd} box=${marked.w}x${marked.h}`);
      if (marked.top < 50 || marked.top > 700) {
        log('warn', '入口不在舒适视口，scrollIntoView 后再点');
      }
      const loc = page.locator('[data-geo-ds-source-entry="1"]').first();
      await loc.scrollIntoViewIfNeeded().catch(() => undefined);
      await sleep(250);
      const box = await loc.boundingBox();
      if (!box) {
        log('warn', '无 boundingBox');
        continue;
      }
      log('info', `准备点击整行 ${Math.round(box.width)}x${Math.round(box.height)} @(${Math.round(box.x + box.width / 2)},${Math.round(box.y + box.height / 2)})`);
      // 先截一张「标红入口」图
      await page.screenshot({ path: beforePath.replace('-before', `-entry${attempt}`), fullPage: false }).catch(() => undefined);
      // 真实鼠标序列点整行中部偏左（避开纯文字叶子）
      const cx = box.x + Math.min(Math.max(box.width * 0.25, 40), box.width - 20);
      const cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.up();
      await sleep(150);
      await loc.click({ timeout: 3000, force: true }).catch(() => undefined);
      log('info', `已点击整行 @(${Math.round(cx)},${Math.round(cy)})`);
    }

    for (let w = 0; w < 18; w++) {
      await sleep(400);
      const afterFp = await rightPanelFingerprint(page);
      if (changedEnough(beforeFp, afterFp) || (await isSourcesDrawerOpen(page)).open) {
        await page.screenshot({ path: afterPath, fullPage: false }).catch(() => undefined);
        log(
          'info',
          `右侧信源已展开 favicons=${afterFp.favicons} links=${afterFp.links} sites=${JSON.stringify(afterFp.siteNames.slice(0, 8))} → ${afterPath}`
        );
        await sleep(2000);
        return true;
      }
    }
    await page.screenshot({ path: afterPath, fullPage: false }).catch(() => undefined);
    log('warn', `第${attempt}次未展开 after=${JSON.stringify(await rightPanelFingerprint(page))} shot=${afterPath}`);
  }

  log('error', `信源抽屉未展开 shots=${beforePath} | ${afterPath}`);
  return false;
}

async function extractSources(page, log, networkSources = []) {
  const opened = await openSourcesPanel(page, log);
  if (!opened) {
    throw new Error('DeepSeek 右侧信源列表未展开（已截图对比），拒绝在未展开时结束');
  }
  await sleep(700);

  const sources = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    const domainOf = url => {
      try {
        return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
      } catch {
        return '';
      }
    };
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const push = item => {
      const url = (item.url || '').trim();
      if (!url || /deepseek\.com/i.test(url)) return;
      if (seen.has(url)) return;
      seen.add(url);
      results.push({
        url,
        title: String(item.title || '').trim(),
        index: results.length + 1,
        snippet: String(item.snippet || '').trim(),
        site_name: String(item.site_name || '').trim(),
        domain: String(item.domain || domainOf(url) || '').trim(),
        publish_time: String(item.publish_time || '').trim()
      });
    };

    const mid = window.innerWidth * 0.55;
    const panels = Array.from(document.querySelectorAll('aside, [role="dialog"], div'))
      .filter(isVisible)
      .map(el => {
        const r = el.getBoundingClientRect();
        const links = Array.from(el.querySelectorAll('a[href^="http"]')).filter(
          a => isVisible(a) && !/deepseek\.com/i.test(a.href || '')
        );
        return { el, r, links };
      })
      .filter(x => x.r.left >= mid - 10 && x.r.width > 200 && x.r.height > 150 && x.links.length >= 2)
      .sort((a, b) => b.links.length - a.links.length || b.r.left - a.r.left);

    const panel = panels[0]?.el || null;
    if (!panel) return results;

    const findCard = link => {
      let best = link;
      for (let el = link.parentElement; el && el !== panel; el = el.parentElement) {
        const r = el.getBoundingClientRect();
        if (r.height < 52 || r.height > 320 || r.width < 160) continue;
        const links = el.querySelectorAll('a[href^="http"]');
        // 单卡通常 1 个主链接；过大容器跳过
        if (links.length >= 1 && links.length <= 2) {
          best = el;
          if (r.height <= 220) break;
        }
      }
      return best;
    };

    const dateRe = /(\d{4}\/\d{1,2}\/\d{1,2}|\d{4}-\d{1,2}-\d{1,2}|\d{4}年\d{1,2}月\d{1,2}日)/;
    const parseCard = (card, link) => {
      const url = (link.href || '').trim();
      // 按视觉行拆：卡片结构 = 站点名+日期 / 标题 / 摘要
      const lines = (card.innerText || '')
        .split(/\n+/)
        .map(s => s.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter(s => !/^\d{1,2}$/.test(s)); // 去掉角标数字

      let site_name = '';
      let publish_time = '';
      let title = '';
      let snippet = '';

      for (const line of lines) {
        const dm = line.match(dateRe);
        if (dm && !publish_time && line.length <= 48) {
          publish_time = dm[1] || dm[0];
          const rest = line.replace(dateRe, '').replace(/\s+/g, ' ').trim();
          if (rest && rest.length <= 40 && !site_name) site_name = rest;
          continue;
        }
        if (!site_name && line.length >= 2 && line.length <= 30 && !dateRe.test(line)) {
          site_name = line;
          continue;
        }
        if (!title && line.length >= 6) {
          title = line;
          continue;
        }
        if (title) {
          snippet = snippet ? `${snippet} ${line}` : line;
        }
      }

      // 链接自身文案若更干净，优先作标题（排除整卡粘连）
      const linkText = (link.textContent || '').replace(/\s+/g, ' ').trim();
      if (
        linkText &&
        linkText.length >= 6 &&
        linkText.length <= 180 &&
        (!site_name || !linkText.startsWith(site_name)) &&
        !/^\d{4}\/\d{1,2}\/\d{1,2}/.test(linkText)
      ) {
        // 若 linkText 明显短于粘连 title，或 title 仍含站点名，则用 linkText
        if (!title || title.startsWith(site_name) || (site_name && title.includes(site_name) && title.includes(publish_time))) {
          if (linkText !== site_name && linkText !== publish_time) title = linkText;
        }
      }

      // 清理 title 里误带的站点名 / 日期 / 开头角标
      if (site_name && title.startsWith(site_name)) title = title.slice(site_name.length).trim();
      if (publish_time && title.startsWith(publish_time)) title = title.slice(publish_time.length).trim();
      if (site_name && publish_time && title.startsWith(`${site_name}${publish_time}`)) {
        title = title.slice(site_name.length + publish_time.length).trim();
      }
      // 粘连形态：百度百科2025/10/281标题…
      if (site_name) {
        title = title.replace(new RegExp(`^${site_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '').trim();
      }
      if (publish_time) {
        title = title.replace(new RegExp(`^${publish_time.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '').trim();
      }
      title = title.replace(/^\d{1,3}(?!\d)/, '').trim();
      // 去重「标题 - 标题」
      const halves = title.split(/\s+-\s+/);
      if (halves.length === 2 && halves[0] === halves[1]) title = halves[0];

      if (!title) title = domainOf(url);
      snippet = snippet.slice(0, 300);
      // snippet 不要再含完整 title 前缀时强行截断即可
      if (snippet.startsWith(title)) snippet = snippet.slice(title.length).trim();

      return {
        url,
        title: title.slice(0, 220),
        snippet,
        site_name: site_name.slice(0, 80),
        publish_time: publish_time.slice(0, 40)
      };
    };

    // 每个卡片只取一次（避免同一卡多个 a 重复）
    const usedCards = new Set();
    const links = Array.from(panel.querySelectorAll('a[href^="http"]')).filter(
      a => isVisible(a) && !/deepseek\.com/i.test(a.href || '')
    );
    for (const link of links) {
      const card = findCard(link);
      if (usedCards.has(card)) continue;
      usedCards.add(card);
      // 主链接：卡片内最长文案的 http 链接，或第一个
      const cardLinks = Array.from(card.querySelectorAll('a[href^="http"]')).filter(
        a => isVisible(a) && !/deepseek\.com/i.test(a.href || '')
      );
      const main =
        cardLinks.sort(
          (a, b) =>
            (b.textContent || '').replace(/\s+/g, '').length - (a.textContent || '').replace(/\s+/g, '').length
        )[0] || link;
      push(parseCard(card, main));
    }

    return results.slice(0, 40);
  });

  const merged = [...sources];
  const seen = new Set(merged.map(s => s.url));
  for (const item of networkSources) {
    const url = item.url || '';
    if (!url || seen.has(url) || /deepseek\.com/i.test(url)) continue;
    seen.add(url);
    merged.push({
      url,
      title: item.title || '',
      index: merged.length + 1,
      snippet: item.snippet || '',
      site_name: item.site_name || '',
      domain: item.domain || domainFromUrl(url) || '',
      publish_time: item.publish_time || ''
    });
  }

  const stripMetaFromTitle = s => {
    let title = String(s.title || '').trim();
    const site = String(s.site_name || '').trim();
    const time = String(s.publish_time || '').trim();
    const esc = v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (site && title.startsWith(site)) title = title.slice(site.length).trim();
    if (time && title.startsWith(time)) title = title.slice(time.length).trim();
    if (site && time) {
      title = title.replace(new RegExp(`^${esc(site)}\\s*${esc(time)}`), '').trim();
      title = title.replace(new RegExp(`^${esc(site)}${esc(time)}`), '').trim();
    }
    title = title.replace(/^\d{1,3}(?!\d)/, '').trim();
    return title;
  };

  const normalized = merged.slice(0, 40).map((s, i) => ({
    url: s.url || '',
    title: stripMetaFromTitle(s) || s.title || '',
    index: s.index != null ? s.index : i + 1,
    snippet: s.snippet || '',
    site_name: s.site_name || '',
    domain: s.domain || domainFromUrl(s.url) || '',
    publish_time: s.publish_time || ''
  }));

  log('info', `提取到信源 ${normalized.length} 条`);
  return normalized;
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

    const rich = await extractAnswerHtml(page, {
      contentSelectors: ['.ds-markdown', '[class*="ds-markdown"]'],
      stripSelectors: [
        '[class*="thinking"]',
        '[class*="Think"]',
        '[class*="search-view"]',
        '[class*="SearchView"]',
        '[class*="citation"]',
        '[class*="ref-list"]',
      ],
    });
    // 优先用完整 markdown 容器文本；过短则回退 wait 阶段文本
    const answerHtml = rich.html || '';
    const finalAnswer =
      rich.text && rich.text.length >= Math.max(80, answer.length * 0.5)
        ? rich.text
        : answer;

    const sources = await extractSources(page, log, sourceListener.getSources());
    log('success', 'DeepSeek 对话完成');
    return { answer: finalAnswer, answerHtml, sources };
  } finally {
    sourceListener.dispose();
  }
}

module.exports = { runConversation };
