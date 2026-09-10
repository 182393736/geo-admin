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
        let text = assistantTurns.length > 0 ? assistantTurns[assistantTurns.length - 1].text : '';

        if (!text) {
          const bodies = Array.from(
            document.querySelectorAll('.flow-markdown-body, .md-box-root, [class*="md-box-root"]')
          )
            .filter(el => isVisible(el))
            .map(el => clean(el.innerText || ''))
            .filter(t => t.length > 20 && !/^(请仔细甄别|下载电脑版)/.test(t))
            .sort((a, b) => b.length - a.length);
          text = bodies[0] || '';
        }

        const lastAssistantEl = assistantTurns.length > 0 ? assistantTurns[assistantTurns.length - 1].el : null;

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

async function waitForAnswer(page, baselineText, log) {
  const timeoutMs = 180_000;
  const started = Date.now();
  let lastText = '';
  let contentStableRounds = 0;
  let sawNewAnswer = false;
  let lastProgressLog = 0;
  let lastDebug = '';

  log('info', '等待豆包回答完成…');

  while (Date.now() - started < timeoutMs) {
    await sleep(700);
    const snap = await readAnswerSnapshot(page);
    const text = snap.text;
    lastDebug = snap.debug;

    if (text && text !== baselineText) sawNewAnswer = true;
    if (text && text.length > baselineText.length + 20) sawNewAnswer = true;

    if (text && text === lastText) {
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
          `${snap.streaming && snap.stopVisible ? '（流式中）' : ''}` +
          `${sawNewAnswer ? '' : '（等待新回答）'}` +
          ` 稳定${contentStableRounds}轮` +
          ` [${snap.debug}]`
      );
    }

    if (sawNewAnswer && text.length > 0 && contentStableRounds >= 4) {
      log('success', `回答已稳定（${text.length} 字）`);
      return text;
    }
    if (sawNewAnswer && text.length > 0 && !snap.stopVisible && snap.sendVisible && contentStableRounds >= 2) {
      log('success', `回答已稳定（发送按钮已恢复，${text.length} 字）`);
      return text;
    }
  }

  if (lastText) {
    log('warn', `等待超时，返回当前已生成内容 [${lastDebug}]`);
    return lastText;
  }
  throw new Error(`等待豆包回答超时 [${lastDebug}]`);
}

/**
 * 豆包信源折叠在回答上方，文案形如「搜索 4 个关键词，参考 24 篇资料」。
 * 必须用 Playwright 点击带 cursor-pointer 的整行（DOM click 点到纯文字节点无效）。
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

async function openSourcesPanel(page, log) {
  const already = await countExpandedSourceLinks(page);
  if (already >= 2) {
    log('info', `信源列表已展开（${already} 条链接）`);
    return true;
  }

  log('info', '点击回答上方「搜索 N 个关键词，参考 N 篇资料」展开…');

  const candidates = [
    page.locator('div.relative.flex-row.inline-flex.cursor-pointer', {
      hasText: /搜索\s*\d+\s*个关键词[\s\S]*参考\s*\d+\s*篇资料/
    }),
    page.locator('[data-plugin-identifier*="search_query_result"] .cursor-pointer', {
      hasText: /搜索\s*\d+\s*个关键词/
    }),
    page.locator('[data-copy-ignore].cursor-pointer', {
      hasText: /搜索\s*\d+\s*个关键词/
    }),
    page.locator('div.cursor-pointer', {
      hasText: /搜索\s*\d+\s*个关键词[\s\S]*参考\s*\d+\s*篇资料/
    }),
  ];

  let clicked = false;
  for (const loc of candidates) {
    const target = loc.last();
    if ((await target.count().catch(() => 0)) === 0) continue;
    const visible = await target.isVisible().catch(() => false);
    if (!visible) continue;
    try {
      await target.scrollIntoViewIfNeeded().catch(() => undefined);
      await target.click({ timeout: 5000 });
      clicked = true;
      break;
    } catch (err) {
      log('warn', `点击信源入口失败：${String((err && err.message) || err).slice(0, 120)}`);
    }
  }

  if (!clicked) {
    // 兜底：在页面里找到 cursor-pointer 祖先再 dispatch 真实 pointer 事件
    clicked = await page.evaluate(() => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const nodes = Array.from(document.querySelectorAll('div, span')).filter(isVisible);
      const leaf = nodes.find(el => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return /搜索\s*\d+\s*个关键词.*参考\s*\d+\s*篇资料/.test(t) && t.length < 40;
      });
      if (!leaf) return false;
      const target =
        leaf.closest('div.relative.flex-row.inline-flex.cursor-pointer') ||
        leaf.closest('.cursor-pointer') ||
        leaf.closest('[data-copy-ignore]') ||
        leaf;
      target.scrollIntoView({ block: 'center' });
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
  }

  if (!clicked) {
    log('warn', '未找到「搜索 N 个关键词，参考 N 篇资料」入口');
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

  log('warn', '已点击信源入口，但列表未出现');
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

  const answer = await waitForAnswer(page, baseline.text, log);
  if (!answer) throw new Error('未获取到豆包回答内容');

  const rich = await extractAnswerHtml(page, {
    contentSelectors: ['.flow-markdown-body', '.md-box-root', '[class*="md-box-root"]'],
    stripSelectors: [
      '[class*="search_query_result"]',
      '[data-plugin-identifier*="search_query_result"]',
      '[class*="ref-"]',
    ],
  });
  const answerHtml = rich.html || '';
  const finalAnswer = (rich.text && rich.text.length >= answer.length * 0.8 ? rich.text : answer) || answer;

  const sources = await extractSources(page, log);
  log('success', '豆包对话完成');
  return { answer: finalAnswer, answerHtml, sources };
}

module.exports = { runConversation };
