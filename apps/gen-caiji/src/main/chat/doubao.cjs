'use strict';
/**
 * 豆包对话测试（CommonJS 移植自上传的 doubao.js）
 */
const { sleep, findVisibleLocator, extractAnswerHtml } = require('./common.cjs');

const INPUT_SELECTORS = [
  '.tiptap.ProseMirror',
  '[data-testid="chat_input_input"]',
  'textarea[data-testid="chat_input_input"]',
  '[data-testid="chat_input"] textarea',
  '[contenteditable="true"]',
  'textarea[placeholder*="发消息"]',
  'textarea'
];

const SEND_SELECTORS = [
  '[data-testid="chat_input_send"]',
  'button[data-testid="chat_input_send_button"]',
  'button[aria-label*="发送"]',
  'button[class*="send" i]'
];

/** 新对话页打开后输入框可能晚于 DOMContentLoaded，轮询等待可见可编辑 */
async function waitForInput(page, log) {
  log('info', '等待豆包输入框加载…');
  const timeoutMs = 45_000;
  const started = Date.now();
  const joined = INPUT_SELECTORS.join(', ');

  try {
    await page.waitForSelector(joined, { state: 'visible', timeout: timeoutMs });
  } catch {
    // 继续用轮询兜底
  }

  while (Date.now() - started < timeoutMs) {
    const input = await findVisibleLocator(page, INPUT_SELECTORS);
    if (input) {
      const ready = await input
        .evaluate(el => {
          if (!(el instanceof HTMLElement)) return false;
          if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
            return !el.disabled && !el.readOnly;
          }
          return el.isContentEditable;
        })
        .catch(() => false);
      if (ready) return input;
    }
    await sleep(400);
  }

  throw new Error(`未找到豆包输入框（当前页 ${page.url()}）`);
}

/**
 * 每次开跑前：若「最近」里有历史会话，hover → 三点 → 删除 → 确认，删掉一条（通常最新一条）。
 * 没有历史则跳过，不抛错。
 */
async function deleteOneHistorySession(page, log) {
  log('info', '检查并删除一条历史会话…');
  await sleep(600);

  const itemLocator = page.locator('[class*="group/conversation-item"], [class*="conversation-item"]').first();
  const visible = await itemLocator.isVisible({ timeout: 4000 }).catch(() => false);
  if (!visible) {
    log('info', '无历史会话，跳过删除');
    return false;
  }

  const title = ((await itemLocator.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  await itemLocator.scrollIntoViewIfNeeded().catch(() => undefined);
  await itemLocator.hover({ force: true }).catch(() => undefined);
  await sleep(350);

  // hover 后右侧三点：data-dbx-name=button
  let openedMenu = false;
  const moreInItem = itemLocator.locator('[data-dbx-name="button"]');
  if ((await moreInItem.count().catch(() => 0)) > 0) {
    await moreInItem.last().click({ force: true, timeout: 3000 }).catch(() => undefined);
    openedMenu = true;
  }

  if (!openedMenu) {
    const box = await itemLocator.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.move(box.x + box.width - 14, box.y + box.height / 2);
      await sleep(200);
      await page.mouse.click(box.x + box.width - 14, box.y + box.height / 2);
      openedMenu = true;
    }
  }

  if (!openedMenu) {
    log('warn', `未能打开历史会话菜单${title ? `（${title}）` : ''}`);
    return false;
  }
  await sleep(400);

  // 菜单项「删除」
  const deleteCandidates = [
    page.locator('[role="menuitem"]').filter({ hasText: /^删除/ }),
    page.getByRole('menuitem', { name: /删除/ }),
    page.locator('[data-radix-collection-item], [class*="menu"] [class*="item"]').filter({ hasText: /^删除/ }),
    page.getByText(/^删除$/, { exact: true }),
  ];
  let deletedMenu = false;
  for (const loc of deleteCandidates) {
    const target = loc.first();
    if (await target.isVisible({ timeout: 800 }).catch(() => false)) {
      await target.click({ timeout: 3000 }).catch(() => undefined);
      deletedMenu = true;
      break;
    }
  }
  if (!deletedMenu) {
    // evaluate 兜底
    deletedMenu = await page.evaluate(() => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const nodes = Array.from(
        document.querySelectorAll('[role="menuitem"], [data-radix-collection-item], button, div, span, li')
      ).filter(isVisible);
      const pick = nodes.find(el => {
        const t = (el.textContent || '').replace(/\s+/g, '').trim();
        return t === '删除' || t === '删除对话' || t === '删除会话';
      });
      if (!pick) return false;
      (pick.closest('[role="menuitem"], button, [role="button"]') || pick).click();
      return true;
    });
  }

  if (!deletedMenu) {
    log('warn', '未找到「删除」菜单项');
    await page.keyboard.press('Escape').catch(() => undefined);
    return false;
  }
  await sleep(500);

  // 确认弹窗：确认删除 / 确定 / 删除
  const confirmCandidates = [
    page.getByRole('button', { name: /确认删除|确定删除/ }),
    page.locator('button').filter({ hasText: /确认删除|确定删除/ }),
    page.getByRole('button', { name: /^确定$/ }),
    page.locator('[class*="modal"] button, [class*="dialog"] button, [role="dialog"] button').filter({
      hasText: /^删除$|^确定$|确认删除/,
    }),
  ];
  let confirmed = false;
  for (const loc of confirmCandidates) {
    const target = loc.first();
    if (await target.isVisible({ timeout: 1200 }).catch(() => false)) {
      await target.click({ timeout: 3000 }).catch(() => undefined);
      confirmed = true;
      break;
    }
  }
  if (!confirmed) {
    confirmed = await page.evaluate(() => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const nodes = Array.from(document.querySelectorAll('button, [role="button"]')).filter(isVisible);
      const rank = t => {
        if (/确认删除|确定删除/.test(t)) return 100;
        if (t === '确定' || t === '确认') return 80;
        if (t === '删除') return 60;
        return 0;
      };
      const scored = nodes
        .map(el => {
          const t = (el.textContent || '').replace(/\s+/g, '').trim();
          return { el, t, s: rank(t) };
        })
        .filter(x => x.s > 0 && x.t.length < 12 && x.t !== '取消')
        .sort((a, b) => b.s - a.s);
      const pick = scored[0]?.el;
      if (!pick) return false;
      pick.click();
      return true;
    });
  }

  if (!confirmed) {
    log('warn', '未找到删除确认按钮');
    await page.keyboard.press('Escape').catch(() => undefined);
    return false;
  }

  await sleep(800);
  log('success', `已删除一条历史会话${title ? `：${title}` : ''}`);
  return true;
}

async function fillPrompt(page, prompt, log) {
  const input = await waitForInput(page, log);

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
      return document.execCommand('insertText', false, text);
    }, prompt);
    if (!inserted) {
      await page.keyboard.type(prompt, { delay: 8 });
    }
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
  const send = await findVisibleLocator(page, SEND_SELECTORS);
  if (send) {
    await send.click({ timeout: 5000 });
    log('info', '已点击发送按钮');
    return;
  }
  await page.keyboard.press('Enter');
  log('info', '未找到发送按钮，已按 Enter 发送');
}

/** 过短 / 仍在思考 / 与提问原文几乎相同 → 视为未完成 */
function isIncompleteAnswer(text, prompt = '') {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return true;
  if (t.length < 60) return true;
  if (/^(正在|思考中|搜索中|请稍候|生成中)/.test(t) && t.length < 120) return true;
  const p = String(prompt || '').replace(/\s+/g, ' ').trim();
  if (p) {
    if (t === p) return true;
    // 回答几乎整段复述提问（常见误抓用户气泡）
    if (t.length <= p.length + 8 && (t.includes(p) || p.includes(t))) return true;
  }
  return false;
}

async function readAnswerSnapshot(page) {
  const frames = page.frames();
  let best = { text: '', streaming: false, sendVisible: false, stopVisible: false, assistantCount: 0, debug: 'no-frame' };

  for (const frame of frames) {
    try {
      const snap = await frame.evaluate(() => {
        const clean = value =>
          (value || '').replace(/\u00a0/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

        const isVisible = el => {
          if (!(el instanceof HTMLElement)) return false;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        };

        const getRole = root => {
          if (
            root.matches('[data-testid="send_message"], [class*="send-message"], [class*="bg-g-send-msg-bubble"]') ||
            root.querySelector(
              '[data-testid="send_message"], [class*="send-message"], [class*="bg-g-send-msg-bubble"], [data-foundation-type="send-message-action-bar"]'
            )
          ) {
            return 'User';
          }
          if (
            root.matches(
              '[data-testid="receive_message"], [data-testid*="receive_message"], [class*="receive-message"], [class*="bg-g-receive-msg-bubble"]'
            ) ||
            root.querySelector(
              '[data-testid="receive_message"], [data-testid*="receive_message"], [class*="receive-message"], [class*="bg-g-receive-msg-bubble"], [data-foundation-type="receive-message-action-bar"]'
            )
          ) {
            return 'Assistant';
          }
          if (
            (root.matches('[class*="inner-item-"], [class*="top-item-"]') ||
              root.closest('[class*="inner-item-"], [class*="top-item-"]')) &&
            (root.matches('.flow-markdown-body, .md-box-root, [class*="md-box-root"]') ||
              root.querySelector('.flow-markdown-body, .md-box-root, [class*="md-box-root"]')) &&
            !root.matches('[class*="bg-g-send-msg-bubble"]') &&
            !root.querySelector('[class*="bg-g-send-msg-bubble"]')
          ) {
            return 'Assistant';
          }
          return '';
        };

        const messageTextSelectors = [
          '[data-testid="message_text_content"]',
          '[data-testid="message_content"]',
          '[data-testid*="message_text"]',
          '[data-testid*="message_content"]',
          '[class*="message-text"]',
          '[class*="message-content"]',
          '[class*="bg-g-receive-msg-bubble"]',
          '.flow-markdown-body',
          '.md-box-root',
          '[class*="md-box-root"]'
        ];

        const extractText = root => {
          for (const selector of messageTextSelectors) {
            const nodes = Array.from(root.querySelectorAll(selector))
              .filter(el => isVisible(el))
              .map(el => clean(el.innerText || el.textContent || ''))
              .filter(Boolean);
            if (nodes.length > 0) return nodes.sort((a, b) => b.length - a.length)[0];
          }
          return clean(root.innerText || root.textContent || '');
        };

        const itemSelectors = [
          '[class*="inner-item-"]',
          '[class*="top-item-"]',
          '[class*="item-kDun2N"]',
          '[data-testid="union_message"]',
          '[data-testid="message-block-container"]',
          '[data-message-id]',
          '[class*="bg-g-send-msg-bubble"]',
          '[class*="bg-g-receive-msg-bubble"]'
        ];

        const messageLists = Array.from(
          document.querySelectorAll(
            '[class*="message-list-"], .container-PvPoAn, .scroll-view-OEiNXD, [data-testid="message-list"], main, [class*="chat-list"]'
          )
        ).filter(el => isVisible(el));

        const allRoots = [];
        const seen = new Set();
        const scopes = messageLists.length > 0 ? messageLists : [document.body];
        for (const scope of scopes) {
          for (const sel of itemSelectors) {
            scope.querySelectorAll(sel).forEach(el => {
              if (!seen.has(el)) {
                seen.add(el);
                allRoots.push(el);
              }
            });
          }
        }

        document.querySelectorAll('.flow-markdown-body, .md-box-root, [class*="md-box-root"]').forEach(el => {
          if (!seen.has(el)) {
            seen.add(el);
            allRoots.push(el);
          }
        });

        const roots = allRoots
          .filter(el => isVisible(el) && !el.closest('script, style, noscript'))
          .filter((el, index, items) => !items.some((other, otherIndex) => otherIndex !== index && other.contains(el)));

        const turns = roots
          .map(el => {
            let role = getRole(el);
            if (
              !role &&
              (el.matches('.flow-markdown-body, .md-box-root, [class*="md-box-root"]') ||
                el.querySelector('.flow-markdown-body, .md-box-root, [class*="md-box-root"]')) &&
              !el.closest('[class*="bg-g-send-msg-bubble"]')
            ) {
              role = 'Assistant';
            }
            const text = extractText(el);
            return { el, role, text };
          })
          .filter(item => (item.role === 'User' || item.role === 'Assistant') && item.text)
          .sort((a, b) => {
            const pos = a.el.compareDocumentPosition(b.el);
            return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          });

        const assistantTurns = turns.filter(t => t.role === 'Assistant');
        const userTurns = turns.filter(t => t.role === 'User');
        const lastUserText = userTurns.length ? userTurns[userTurns.length - 1].text : '';

        // 取最后一条助手回答；若与最后用户提问相同，说明误抓了用户气泡，换上一条或置空
        let text = '';
        for (let i = assistantTurns.length - 1; i >= 0; i--) {
          const cand = assistantTurns[i].text || '';
          const sameAsUser =
            lastUserText &&
            cand.replace(/\s+/g, ' ').trim() === lastUserText.replace(/\s+/g, ' ').trim();
          if (sameAsUser) continue;
          text = cand;
          break;
        }

        if (!text) {
          const bodies = Array.from(
            document.querySelectorAll('.flow-markdown-body, .md-box-root, [class*="md-box-root"]')
          )
            .filter(el => isVisible(el))
            .filter(el => !el.closest('[class*="bg-g-send-msg-bubble"], [data-testid="send_message"], [class*="send-message"]'))
            .map(el => clean(el.innerText || ''))
            .filter(t => {
              if (t.length <= 20) return false;
              if (/^(请仔细甄别|下载电脑版)/.test(t)) return false;
              if (lastUserText && t.replace(/\s+/g, ' ').trim() === lastUserText.replace(/\s+/g, ' ').trim()) {
                return false;
              }
              return true;
            })
            .sort((a, b) => b.length - a.length);
          text = bodies[0] || '';
        }

        const lastAssistantEl = (() => {
          for (let i = assistantTurns.length - 1; i >= 0; i--) {
            const cand = assistantTurns[i].text || '';
            const sameAsUser =
              lastUserText &&
              cand.replace(/\s+/g, ' ').trim() === lastUserText.replace(/\s+/g, ' ').trim();
            if (!sameAsUser) return assistantTurns[i].el;
          }
          return null;
        })();

        const streamingInMessage = !!(
          lastAssistantEl &&
          (lastAssistantEl.querySelector(
            '[data-testid*="cursor"], [class*="typing-cursor"], [class*="stream-cursor"], [class*="caret-blink"]'
          ) ||
            Array.from(lastAssistantEl.querySelectorAll('[class*="cursor"]')).some(el => {
              const cls = el.className || '';
              return /typing|stream|blink|caret|animate/i.test(cls);
            }))
        );

        const stopVisible = Array.from(
          document.querySelectorAll(
            '[data-testid="chat_input_local_break_button"], button[aria-label*="停止生成"], button[aria-label="停止"]'
          )
        ).some(el => isVisible(el));

        const sendVisible = Array.from(
          document.querySelectorAll(
            '[data-testid="chat_input_send"], button[data-testid="chat_input_send_button"], button[aria-label*="发送"]'
          )
        ).some(el => isVisible(el));

        const streaming = stopVisible || streamingInMessage;

        const debug = [
          `host=${location.host}`,
          `lists=${messageLists.length}`,
          `roots=${roots.length}`,
          `turns=${turns.length}`,
          `assistant=${assistantTurns.length}`,
          `md=${document.querySelectorAll('.flow-markdown-body, .md-box-root, [class*="md-box-root"]').length}`,
          `inner=${document.querySelectorAll('[class*="inner-item-"]').length}`,
          `stop=${stopVisible ? 1 : 0}`,
          `send=${sendVisible ? 1 : 0}`,
          `streamHint=${streamingInMessage ? 1 : 0}`
        ].join(' ');

        return { text, streaming, sendVisible, stopVisible, assistantCount: assistantTurns.length, debug };
      });

      if (snap.text.length > best.text.length || snap.assistantCount > best.assistantCount) {
        best = snap;
      } else if (!best.text && snap.debug !== best.debug) {
        best = { ...best, debug: `${best.debug} | ${snap.debug}` };
      }
    } catch {
      // cross-origin frame, ignore
    }
  }

  return best;
}

async function waitForAnswer(page, baselineText, log, prompt = '') {
  const timeoutMs = 600_000; // 与主进程 CHAT_TIMEOUT_MS 对齐（10 分钟）
  const started = Date.now();
  let lastText = '';
  let contentStableRounds = 0;
  let sawNewAnswer = false;
  let lastProgressLog = 0;
  let lastDebug = '';
  let maxLen = 0;

  log('info', '等待豆包回答完成…');

  while (Date.now() - started < timeoutMs) {
    await sleep(800);
    const snap = await readAnswerSnapshot(page);
    const text = String(snap.text || '').trim();
    lastDebug = snap.debug;
    const incomplete = isIncompleteAnswer(text, prompt);
    if (text.length > maxLen) maxLen = text.length;

    if (text && !incomplete && text !== baselineText) sawNewAnswer = true;
    if (text && !incomplete && text.length > Math.max((baselineText || '').length + 20, 80)) {
      sawNewAnswer = true;
    }

    // 仍显示「停止」→ 还在生成，稳定轮次清零意义不大，直接继续等
    if (snap.stopVisible) {
      contentStableRounds = 0;
      lastText = text;
    } else if (text && !incomplete && text === lastText && text.length >= maxLen) {
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
          `${snap.streaming ? '（流式中）' : ''}` +
          `${incomplete ? '（过短/同提问）' : ''}` +
          `${sawNewAnswer ? '' : '（等待新回答）'}` +
          ` 稳定${contentStableRounds}轮` +
          ` [${snap.debug}]`
      );
    }

    if (snap.stopVisible) continue;

    // 无停止钮 + 实质性正文稳定约 4.8s
    if (
      sawNewAnswer &&
      !incomplete &&
      contentStableRounds >= 6 &&
      text.length >= 80 &&
      text.length >= maxLen
    ) {
      log('success', `回答已稳定（${text.length} 字）`);
      return text;
    }

    // 发送钮恢复时稍严
    if (
      sawNewAnswer &&
      !incomplete &&
      snap.sendVisible &&
      contentStableRounds >= 7 &&
      text.length >= 120 &&
      text.length >= maxLen
    ) {
      log('success', `回答已稳定（发送按钮已恢复，${text.length} 字）`);
      return text;
    }

    // 兜底：更长静默
    if (
      sawNewAnswer &&
      !incomplete &&
      contentStableRounds >= 15 &&
      text.length >= 200 &&
      text.length >= maxLen
    ) {
      log('success', `回答已长时间稳定（${text.length} 字）`);
      return text;
    }
  }

  if (lastText && !isIncompleteAnswer(lastText, prompt) && lastText.length >= 80) {
    log('warn', `等待超时，返回当前已生成内容 [${lastDebug}]`);
    return lastText;
  }
  throw new Error(`等待豆包完整回答超时 [${lastDebug}]`);
}

/**
 * 豆包信源展开：
 *  - 单次搜索：直接点「搜索 N 个关键词，参考 N 篇资料」
 *  - 多次搜索：先点「已完成思考，参考 N 篇资料」展开思考面板，
 *    再分别点下面的「搜索 N 个关键词，参考 N 篇资料」
 * 必须用 Playwright 点带 cursor-pointer 的整行（DOM 点到纯文字节点无效）。
 */
async function countExpandedSourceLinks(page) {
  return page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const blocks = Array.from(
      document.querySelectorAll('[data-plugin-identifier*="search_query_result"]')
    );
    let n = 0;
    for (const block of blocks) {
      for (const a of block.querySelectorAll('a[href^="http"]')) {
        if (!isVisible(a)) continue;
        if (/doubao\.com\/(chat|download)|bytedance\.com|feishu\.cn/i.test(a.href)) continue;
        n += 1;
      }
    }
    return n;
  });
}

/** 页面内按文案匹配可点击入口；preferLast=true 取靠下的一条 */
async function clickByTextPattern(page, patterns, { preferLast = true } = {}) {
  // 1) Playwright locator
  for (const re of patterns) {
    const locs = [
      page.locator('div.relative.flex-row.inline-flex.cursor-pointer', { hasText: re }),
      page.locator('[data-copy-ignore].cursor-pointer', { hasText: re }),
      page.locator('div.cursor-pointer, span.cursor-pointer, button.cursor-pointer', { hasText: re }),
      page.getByText(re),
    ];
    for (const loc of locs) {
      const count = await loc.count().catch(() => 0);
      if (!count) continue;
      const target = preferLast ? loc.last() : loc.first();
      if (!(await target.isVisible().catch(() => false))) continue;
      try {
        await target.scrollIntoViewIfNeeded().catch(() => undefined);
        // 若点到文字叶子，尽量升到 cursor-pointer 祖先
        const handle = await target.elementHandle().catch(() => null);
        if (handle) {
          const box = await handle.evaluate(el => {
            const clickable =
              el.closest('div.relative.flex-row.inline-flex.cursor-pointer') ||
              el.closest('.cursor-pointer') ||
              el.closest('[data-copy-ignore]') ||
              el;
            const r = clickable.getBoundingClientRect();
            clickable.scrollIntoView({ block: 'center', inline: 'nearest' });
            return { x: r.x + Math.min(r.width / 2, 80), y: r.y + r.height / 2, ok: r.width > 0 && r.height > 0 };
          });
          if (box && box.ok) {
            await page.mouse.click(box.x, box.y);
            return true;
          }
        }
        await target.click({ timeout: 4000 });
        return true;
      } catch {
        // try next
      }
    }
  }

  // 2) evaluate 兜底
  return page.evaluate(patternSources => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const regs = patternSources.map(s => new RegExp(s, 'i'));
    const nodes = Array.from(document.querySelectorAll('div, span, button, a')).filter(isVisible);
    const hits = [];
    for (const el of nodes) {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!t || t.length > 80) continue;
      if (!regs.some(re => re.test(t))) continue;
      const target =
        el.closest('div.relative.flex-row.inline-flex.cursor-pointer') ||
        el.closest('.cursor-pointer') ||
        el.closest('[data-copy-ignore]') ||
        el;
      const r = target.getBoundingClientRect();
      hits.push({ el: target, y: r.y, h: r.height, w: r.width, t });
    }
    if (!hits.length) return false;
    hits.sort((a, b) => b.y - a.y);
    const pick = hits[0].el;
    pick.scrollIntoView({ block: 'center' });
    pick.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    pick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    pick.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    pick.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    pick.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, patterns.map(re => (re instanceof RegExp ? re.source : String(re))));
}

/** 统计可见的「搜索 N 个关键词」入口数量 */
async function countKeywordSearchEntries(page) {
  return page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const re = /搜索\s*\d+\s*个关键词/;
    const seen = new Set();
    let n = 0;
    for (const el of document.querySelectorAll('div, span')) {
      if (!isVisible(el)) continue;
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!re.test(t) || t.length > 60) continue;
      const root =
        el.closest('div.relative.flex-row.inline-flex.cursor-pointer') ||
        el.closest('.cursor-pointer') ||
        el;
      if (seen.has(root)) continue;
      seen.add(root);
      n += 1;
    }
    return n;
  });
}

/** 点击所有尚未展开的「搜索 N 个关键词，参考 N 篇资料」 */
async function clickAllKeywordSearchEntries(page, log) {
  let clickedTotal = 0;
  for (let round = 0; round < 8; round++) {
    const beforeLinks = await countExpandedSourceLinks(page);
    // 真实鼠标点（纯 DOM click 对豆包无效）
    const scrolled = await page.evaluate(() => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const re = /搜索\s*\d+\s*个关键词/;
      const seen = new Set();
      const candidates = [];
      for (const el of document.querySelectorAll('div, span')) {
        if (!isVisible(el)) continue;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (t.length > 60 || !re.test(t)) continue;
        const root =
          el.closest('div.relative.flex-row.inline-flex.cursor-pointer') ||
          el.closest('.cursor-pointer') ||
          el.closest('[data-copy-ignore]') ||
          el;
        if (seen.has(root)) continue;
        seen.add(root);
        const block =
          root.closest('[data-plugin-identifier*="search_query_result"]') || root.parentElement;
        const hasLinks = !!(
          block &&
          Array.from(block.querySelectorAll('a[href^="http"]')).some(a => {
            if (!isVisible(a)) return false;
            return !/doubao\.com\/(chat|download)|bytedance\.com|feishu\.cn/i.test(a.href);
          })
        );
        if (hasLinks) continue;
        candidates.push(root);
      }
      candidates.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y);
      const pick = candidates[0];
      if (!pick) return null;
      pick.scrollIntoView({ block: 'center', inline: 'nearest' });
      const r = pick.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return null;
      return { x: r.x + Math.min(r.width / 2, 80), y: r.y + r.height / 2 };
    });

    if (!scrolled) break;
    await page.mouse.click(scrolled.x, scrolled.y);
    clickedTotal += 1;
    log('info', `已点击第 ${clickedTotal} 个「搜索 N 个关键词」入口`);
    for (let i = 0; i < 12; i++) {
      await sleep(300);
      const n = await countExpandedSourceLinks(page);
      if (n > beforeLinks) break;
    }
  }
  return clickedTotal;
}

async function openSourcesPanel(page, log) {
  const already = await countExpandedSourceLinks(page);
  if (already >= 2) {
    log('info', `信源列表已展开（${already} 条链接）`);
    return true;
  }

  // —— 步骤 1：多次搜索时先展开「已完成思考，参考 N 篇资料」——
  let keywordCount = await countKeywordSearchEntries(page);
  if (keywordCount === 0) {
    log('info', '尝试展开「已完成思考 / 参考 N 篇资料」…');
    const thinkPatterns = [
      /已完成思考[，,\s]*参考\s*\d+\s*篇资料/,
      /已完成思考/,
      /参考\s*\d+\s*篇资料/,
      /思考完成[，,\s]*参考\s*\d+\s*篇资料/,
    ];
    const openedThink = await clickByTextPattern(page, thinkPatterns, { preferLast: true });
    if (openedThink) {
      log('info', '已点击思考/资料汇总入口，等待关键词搜索项出现…');
      for (let i = 0; i < 15; i++) {
        await sleep(400);
        keywordCount = await countKeywordSearchEntries(page);
        if (keywordCount > 0) break;
        // 有时点开后直接出链接
        const n = await countExpandedSourceLinks(page);
        if (n >= 2) {
          log('info', `信源列表已展开（${n} 条链接）`);
          return true;
        }
      }
    } else {
      log('info', '未找到思考汇总入口，继续直接找关键词搜索项');
    }
  }

  // —— 步骤 2：点击「搜索 N 个关键词，参考 N 篇资料」（可能多条）——
  log('info', '点击「搜索 N 个关键词，参考 N 篇资料」展开…');
  let clicked = await clickAllKeywordSearchEntries(page, log);

  // 若一轮没点到，再用单条 locator 兜底一次
  if (clicked === 0) {
    const ok = await clickByTextPattern(
      page,
      [
        /搜索\s*\d+\s*个关键词[\s\S]*参考\s*\d+\s*篇资料/,
        /搜索\s*\d+\s*个关键词/,
      ],
      { preferLast: true }
    );
    if (ok) {
      clicked = 1;
      log('info', '已通过兜底点击关键词搜索入口');
    }
  }

  if (clicked === 0 && keywordCount === 0) {
    log('warn', '未找到信源入口（思考汇总 / 关键词搜索）');
    return false;
  }

  for (let i = 0; i < 20; i++) {
    await sleep(350);
    const n = await countExpandedSourceLinks(page);
    if (n >= 2) {
      log('info', `信源列表已展开（${n} 条链接）`);
      return true;
    }
  }

  log('warn', '已尝试展开信源，但列表未出现');
  return false;
}

async function extractSources(page, log) {
  await openSourcesPanel(page, log);
  await sleep(400);

  const sources = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    const push = (title, url, snippet) => {
      const key = `${title || ''}|${url || ''}`;
      if (!key || key === '|' || seen.has(key)) return;
      if (!title && !url) return;
      if (url && /doubao\.com\/(chat|download)|bytedance\.com|feishu\.cn/i.test(url)) return;
      seen.add(key);
      results.push({
        title: title?.trim() || undefined,
        url: url?.trim() || undefined,
        snippet: snippet?.trim() || undefined
      });
    };

    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const blocks = Array.from(
      document.querySelectorAll('[data-plugin-identifier*="search_query_result"]')
    );
    const scopes = blocks.length > 0 ? blocks : [document.body];

    for (const scope of scopes) {
      const anchors = Array.from(scope.querySelectorAll('a[href^="http"]')).filter(isVisible);
      for (const a of anchors) {
        const url = (a.href || '').trim();
        if (!url) continue;
        if (/doubao\.com\/(chat|download)|bytedance\.com|feishu\.cn/i.test(url)) continue;
        let title = (a.textContent || '').replace(/\s+/g, ' ').trim();
        // 去掉前缀序号「1.」「12.」
        title = title.replace(/^\d+\.\s*/, '').trim();
        if (!title || title.length < 2) title = url;
        push(title.slice(0, 200), url);
      }
    }

    return results.slice(0, 40);
  });

  log('info', `提取到信源 ${sources.length} 条`);
  return sources;
}

async function runConversation(page, prompt, log) {
  log('info', `开始豆包对话：${prompt}`);
  await page.bringToFront().catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  // 新会话页 SPA 渲染输入框需要一点时间
  await sleep(800);

  // 开跑前删掉一条「最近」历史（有则删，无则跳过）
  await deleteOneHistorySession(page, log).catch(err => {
    log('warn', `删除历史会话失败（继续对话）：${err?.message || err}`);
  });

  const baseline = await readAnswerSnapshot(page);
  await fillPrompt(page, prompt, log);
  await sleep(300);
  await clickSend(page, log);

  const answer = await waitForAnswer(page, baseline.text, log, prompt);
  if (!answer || isIncompleteAnswer(answer, prompt)) {
    throw new Error('未获取到豆包完整回答内容');
  }

  const rich = await extractAnswerHtml(page, {
    contentSelectors: ['.flow-markdown-body', '.md-box-root', '[class*="md-box-root"]'],
    stripSelectors: [
      '[class*="search_query_result"]',
      '[data-plugin-identifier*="search_query_result"]',
      '[class*="ref-"]',
    ],
  });
  const richOk = !!(rich.text && !isIncompleteAnswer(rich.text, prompt) && rich.text.length >= answer.length * 0.8);
  const answerHtml = richOk ? rich.html || '' : '';
  const finalAnswer = (richOk ? rich.text : answer) || answer;

  const sources = await extractSources(page, log);
  log('success', '豆包对话完成');
  return { answer: finalAnswer, answerHtml, sources };
}

module.exports = { runConversation };
