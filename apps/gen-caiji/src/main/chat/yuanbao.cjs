'use strict';
/**
 * 腾讯元宝对话测试（CommonJS 移植自上传的 yuanbao.js）
 */
const { sleep, findVisibleLocator, extractAnswerHtml } = require('./common.cjs');

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
  return String(text || '')
    .replace(/已思考\d+次/g, '')
    .replace(/内容由AI生成，仅供参考/gi, '')
    .replace(/重新回答/gi, '')
    .replace(/(正在思考|思考中|正在搜索资料|搜索资料中)[.。…\s]*$/g, '')
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
  // 正文里仍夹着思考态（跳过后常见）
  if (t.length < 600 && /(正在思考|思考中|正在搜索资料|搜索资料中)/.test(t)) {
    return true;
  }
  // 澄清式半截回答（后面通常会跟选项卡，需点「跳过」继续）
  if (
    t.length < 500 &&
    /(先(跟你)?确认几个|先明确几个|明确几个关键点|关键点[，,].{0,12}精准|先确认一下|为了给你精准推荐|告诉我(一下)?几个关键|方便再给你推荐|勾几个关键点|才能给你精准)/.test(
      t
    )
  ) {
    return true;
  }
  return false;
}

/** 中途选项卡：优先点右上角「跳过所有」继续生成完整回答 */
async function dismissContinuePrompt(page, log) {
  // 1) Playwright 定位最稳：文案带倒计时「跳过所有 (29s)」
  try {
    const skipAll = page.getByText(/跳过所有/, { exact: false }).first();
    if (await skipAll.isVisible({ timeout: 300 }).catch(() => false)) {
      await skipAll.click({ timeout: 2000 });
      log('info', '检测到中途选项卡，已点击「跳过所有」继续回答');
      await sleep(800);
      return true;
    }
  } catch {}

  const clicked = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const score = t => {
      const s = (t || '').replace(/\s+/g, '');
      if (!s || s.length > 28) return 0;
      if (/跳过所有/.test(s)) return 120;
      if (s === '跳过') return 100;
      if (/^跳过继续/.test(s) || s === '跳过，继续回答') return 95;
      if (/^跳过/.test(s) && s.length <= 16) return 85;
      if (s === '继续' || s === '继续回答' || s === '不用了，直接回答') return 70;
      return 0;
    };

    const nodes = Array.from(
      document.querySelectorAll(
        'button, a, [role="button"], div, span, [class*="option"], [class*="chip"], [class*="suggest"], [class*="card"]'
      )
    ).filter(isVisible);

    const ranked = nodes
      .map(el => {
        const own =
          el.childNodes && el.childNodes.length
            ? Array.from(el.childNodes)
                .filter(n => n.nodeType === 3)
                .map(n => n.textContent || '')
                .join('')
            : '';
        const t = (own || el.textContent || '').replace(/\s+/g, ' ').trim();
        return { el, t, s: score(t), y: el.getBoundingClientRect().y };
      })
      .filter(x => x.s > 0 && x.t.length < 32)
      .sort((a, b) => b.s - a.s || a.y - b.y);

    const pick = ranked[0]?.el;
    if (!(pick instanceof HTMLElement)) return '';
    const target = pick.closest('button, a, [role="button"]') || pick;
    target.scrollIntoView({ block: 'center', inline: 'nearest' });
    target.click();
    return (ranked[0].t || '跳过').slice(0, 28);
  });

  if (clicked) {
    log('info', `检测到中途选项卡，已点击「${clicked}」继续回答`);
    await sleep(800);
    return true;
  }
  return false;
}

async function hasContinuePrompt(page) {
  try {
    const skipAll = page.getByText(/跳过所有/, { exact: false }).first();
    if (await skipAll.isVisible({ timeout: 200 }).catch(() => false)) return true;
  } catch {}

  return page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    return Array.from(
      document.querySelectorAll('button, a, [role="button"], div, span')
    ).some(el => {
      if (!isVisible(el)) return false;
      const t = (el.textContent || '').replace(/\s+/g, '').trim();
      if (t.length > 28) return false;
      return (
        /跳过所有/.test(t) ||
        t === '跳过' ||
        /^跳过继续/.test(t) ||
        t === '继续回答' ||
        t === '不用了，直接回答'
      );
    });
  });
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
      return clean(clone.innerText || clone.textContent || '')
        .replace(/已思考\d+次/g, '')
        .replace(/(正在思考|思考中|正在搜索资料|搜索资料中)[.。…\s]*$/g, '')
        .trim();
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
        [
          '[class*="style__stop"]',
          'button[aria-label*="停止"]',
          'a[aria-label*="停止"]',
          '[class*="chat-input-btn"][class*="stop"]',
          '[class*="icon-stop"]',
          '[class*="stop-btn"]',
          '[class*="stopBtn"]',
          '[class*="__stop"]'
        ].join(',')
      )
    ).some(el => isVisible(el));

    const sendVisible = Array.from(
      document.querySelectorAll('a[class*="send-btn"], button[class*="send-btn"], button[class*="submit"]')
    ).some(el => {
      if (!isVisible(el)) return false;
      const className = typeof el.className === 'string' ? el.className : '';
      return !/disabled/i.test(className);
    });

    const loading = Array.from(
      document.querySelectorAll(
        [
          '[class*="agent-chat__list__item--ai-loading"]',
          '[class*="animate-pulse"]',
          '[class*="generating"]',
          '[class*="typing"]',
          '[class*="loading-dot"]',
          '[class*="stream"]'
        ].join(',')
      )
    ).some(el => isVisible(el));

    // 有正文但尚未出现完成标记，且发送钮不可用 / 仍可停止 → 视为仍在生成（中途停顿也会卡字数）
    const awaitingDone = !!(text && !hasDoneNode);
    const stillGenerating = awaitingDone && (stopVisible || loading || !sendVisible);

    const incompleteHint =
      !text ||
      stillGenerating ||
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
      `gen=${stillGenerating ? 1 : 0}`,
      `len=${text.length}`
    ].join(' ');

    return {
      text,
      stopVisible,
      sendVisible,
      done: hasDoneNode && !incompleteHint && !stopVisible && !loading && !stillGenerating,
      incomplete: incompleteHint || stopVisible || loading || stillGenerating,
      assistantCount: texts.length,
      debug
    };
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
  let skipClicks = 0;
  let lengthAtSkip = 0;

  log('info', '等待元宝回答完成…');

  while (Date.now() - started < timeoutMs) {
    await sleep(800);

    // 中途澄清选项卡：点「跳过」后继续等完整回答
    if (await hasContinuePrompt(page)) {
      const beforeSkip = Math.max(maxLen, lastText.length);
      const ok = await dismissContinuePrompt(page, log);
      if (ok) {
        skipClicks += 1;
        lengthAtSkip = Math.max(beforeSkip, 50);
        contentStableRounds = 0;
        lastText = '';
        // 跳过后通常会重新进入生成态，至少再等一轮再生
        await sleep(1500);
        continue;
      }
    }

    const snap = await readAnswerSnapshot(page);
    lastDebug = snap.debug;
    const text = sanitizeAnswer(snap.text);
    const choiceOpen = await hasContinuePrompt(page);
    const incomplete = snap.incomplete || isIncompleteAnswer(text) || choiceOpen;
    if (text.length > maxLen) maxLen = text.length;

    if (text && !incomplete && text !== baselineText) sawNewAnswer = true;
    if (text && text.length > Math.max(baselineText.length + 20, 60)) sawNewAnswer = true;

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
          `${choiceOpen ? '（有选项卡）' : ''}` +
          `${sawNewAnswer ? '' : '（等待完整回答）'}` +
          ` 稳定${contentStableRounds}轮` +
          ` [${snap.debug}]`
      );
    }

    // 有「跳过」选项时绝不结束
    if (choiceOpen) continue;

    // 跳过后：半截澄清文案常会短暂带 done，必须等正文明显变长
    const grewAfterSkip = skipClicks === 0 || text.length >= Math.max(lengthAtSkip + 80, 280);
    const looksLikeStub =
      text.length < 320 &&
      /(确认|关键点|方便再|先跟你|先明确|精准的推荐|勾几个|正在思考)/.test(text);

    // 1) 优先：出现正式完成标记 .hyc-content-md-done（且不是澄清半截）
    if (
      sawNewAnswer &&
      snap.done &&
      !incomplete &&
      grewAfterSkip &&
      !looksLikeStub &&
      contentStableRounds >= (skipClicks > 0 ? 4 : 2) &&
      text.length >= 80 &&
      !isIncompleteAnswer(text)
    ) {
      log('success', `回答已完成标记（${text.length} 字）`);
      return text;
    }

    // 2) 发送钮恢复 + 较长稳定（约 5.6s），且字数不再增长
    if (
      sawNewAnswer &&
      !incomplete &&
      grewAfterSkip &&
      !looksLikeStub &&
      !snap.stopVisible &&
      snap.sendVisible &&
      contentStableRounds >= 7 &&
      text.length >= 120 &&
      text.length >= maxLen &&
      !isIncompleteAnswer(text)
    ) {
      log('success', `回答已稳定（发送按钮已恢复，${text.length} 字）`);
      return text;
    }

    // 3) 兜底：无完成标记时要求更长静默（约 12s）
    if (
      sawNewAnswer &&
      !incomplete &&
      grewAfterSkip &&
      !looksLikeStub &&
      !snap.stopVisible &&
      contentStableRounds >= 15 &&
      text.length >= 200 &&
      !isIncompleteAnswer(text)
    ) {
      log('success', `回答已长时间稳定（${text.length} 字）`);
      return text;
    }
  }

  if (lastText && !isIncompleteAnswer(lastText) && lastText.length >= 80) {
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
    const push = ({ title, url, snippet, site_name, publish_time }) => {
      const t = (title || '').trim();
      const u = (url || '').trim();
      const key = `${t}|${u}`;
      if (!key || key === '|' || seen.has(key)) return;
      if (!t && !u) return;
      seen.add(key);
      results.push({
        title: t || undefined,
        url: u || undefined,
        snippet: (snippet || '').trim() || undefined,
        site_name: (site_name || '').trim() || undefined,
        publish_time: (publish_time || '').trim() || undefined,
      });
    };

    const items = Array.from(document.querySelectorAll('.agent-dialogue-references__item'));
    for (const item of items) {
      let url = item.getAttribute('dt-ext6') || '';
      const siteFromAttr = (item.getAttribute('dt-ext3') || '').trim();
      const refCard = item.querySelector('.hyc-common-markdown__ref_card');
      if (!url && refCard) url = refCard.getAttribute('data-url') || '';

      let title = '';
      let snippet = '';
      let site_name = siteFromAttr;
      let publish_time = '';

      if (refCard) {
        const sourceEl = refCard.querySelector('[class*="ref_card-foot__source_txt"]');
        const sourceText = (sourceEl?.textContent || '').replace(/\s+/g, ' ').trim();
        if (sourceText) site_name = site_name || sourceText;

        const titleEl = refCard.querySelector(
          '[class*="ref_card-title"], [class*="ref_card__title"], [class*="ref_card-head__title"], [class*="__title__"]'
        );
        const snippetEl = refCard.querySelector(
          '[class*="ref_card-desc"], [class*="ref_card__desc"], [class*="ref_card-content"], [class*="ref_card-summary"], [class*="__desc"], [class*="__summary"]'
        );
        const timeEl = refCard.querySelector(
          '[class*="ref_card-foot__time"], [class*="ref_card__time"], [class*="publish"], time'
        );

        if (titleEl) title = (titleEl.textContent || '').replace(/\s+/g, ' ').trim();
        if (snippetEl) snippet = (snippetEl.textContent || '').replace(/\s+/g, ' ').trim();
        if (timeEl) publish_time = (timeEl.textContent || '').replace(/\s+/g, ' ').trim();

        if (!title) {
          // 无结构化标题时：整卡文本去掉站点名，剩余作为 title（不再把站点塞进 snippet）
          let fullText = (refCard.textContent || '').replace(/\s+/g, ' ').trim();
          if (site_name && fullText.includes(site_name)) {
            fullText = fullText.split(site_name).join(' ').replace(/\s+/g, ' ').trim();
          }
          if (publish_time && fullText.includes(publish_time)) {
            fullText = fullText.split(publish_time).join(' ').replace(/\s+/g, ' ').trim();
          }
          title = fullText;
        } else if (snippet && title.includes(snippet)) {
          title = title.replace(snippet, '').replace(/\s+/g, ' ').trim() || title;
        }

        // 标题里若仍粘着站点名则剥离
        if (site_name && title.startsWith(site_name)) {
          title = title.slice(site_name.length).replace(/^[\s\-_|·:：]+/, '').trim();
        }
        // snippet 不应等于站点名
        if (snippet && site_name && snippet === site_name) snippet = '';
      }

      if (!title) title = site_name || url;
      if (url || title) {
        push({
          title: title || site_name || url,
          url: url || undefined,
          snippet: snippet || undefined,
          site_name: site_name || undefined,
          publish_time: publish_time || undefined,
        });
      }
    }

    const cards = Array.from(
      document.querySelectorAll('.hyc-common-markdown__ref_card[data-url], .hyc-common-markdown__ref_card')
    );
    for (const card of cards) {
      const url = card.getAttribute('data-url') || '';
      const sourceEl = card.querySelector('[class*="ref_card-foot__source_txt"]');
      const site_name = (sourceEl?.textContent || '').replace(/\s+/g, ' ').trim();
      let title = (card.textContent || '').replace(/\s+/g, ' ').trim();
      if (site_name && title.includes(site_name)) {
        title = title.split(site_name).join(' ').replace(/\s+/g, ' ').trim();
      }
      title = title.slice(0, 200);
      if (url || title) push({ title, url: url || undefined, site_name: site_name || undefined });
    }

    if (results.length === 0) {
      const docs = Array.from(
        document.querySelectorAll(
          '.hyc-component-deepsearch-cot__think__content__item__doc [class*="__doc__title__text"]'
        )
      );
      for (const doc of docs) {
        const title = (doc.textContent || '').replace(/\s+/g, ' ').trim();
        if (title) push({ title });
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

  const rich = await extractAnswerHtml(page, {
    contentSelectors: [
      '.hyc-content-md-done',
      '.hyc-content-md',
      '[class*="hyc-content-md"]',
      '.agent-chat__bubble__content',
    ],
    stripSelectors: [
      '[class*="think"]',
      '[class*="Think"]',
      '[class*="hyc-common-markdown__ref"]',
      '.hyc-common-markdown__ref_card',
    ],
  });
  const answerHtml = rich.html || '';
  const finalAnswer = (rich.text && rich.text.length >= answer.length * 0.8 ? rich.text : answer) || answer;

  const sources = await extractSources(page, log);
  log('success', '元宝对话完成');
  return { answer: finalAnswer, answerHtml, sources };
}

module.exports = { runConversation };
