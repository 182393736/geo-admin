'use strict';
/**
 * 豆包对话测试（CommonJS 移植自上传的 doubao.js）
 */
const { sleep, findVisibleLocator } = require('./common.cjs');

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

async function fillPrompt(page, prompt, log) {
  const input = await findVisibleLocator(page, INPUT_SELECTORS);
  if (!input) throw new Error('未找到豆包输入框');

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

async function extractSources(page, log) {
  const sources = await page.evaluate(() => {
    const results = [];
    const seen = new Set();

    const push = (title, url, snippet) => {
      const key = `${title || ''}|${url || ''}`;
      if (!key || key === '|' || seen.has(key)) return;
      seen.add(key);
      results.push({
        title: title?.trim() || undefined,
        url: url?.trim() || undefined,
        snippet: snippet?.trim() || undefined
      });
    };

    const receive = document.querySelectorAll(
      '[data-testid="receive_message"], [class*="bg-g-receive-msg-bubble"], [class*="receive-msg-bubble"], .flow-markdown-body, [class*="message-item"]'
    );
    const scope = receive.length > 0 ? receive[receive.length - 1] : document.body;

    const anchors = Array.from(scope.querySelectorAll('a[href]'));
    for (const a of anchors) {
      const href = a.href || '';
      if (!/^https?:/i.test(href)) continue;
      if (/doubao\.com|bytedance\.com|feishu\.cn/i.test(href)) continue;
      const title = (a.getAttribute('title') || a.textContent || '').replace(/\s+/g, ' ').trim();
      if (!title || title.length > 120) continue;
      push(title, href);
    }

    const refBlocks = Array.from(
      scope.querySelectorAll(
        '[class*="source" i], [class*="reference" i], [class*="cite" i], [data-testid*="search" i], [data-testid*="ref" i]'
      )
    );
    for (const block of refBlocks) {
      const text = (block.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length < 2 || text.length > 200) continue;
      const link = block.querySelector('a[href]');
      push(text.slice(0, 120), link?.href);
    }

    return results.slice(0, 30);
  });

  log('info', `提取到信源 ${sources.length} 条`);
  return sources;
}

async function runConversation(page, prompt, log) {
  log('info', `开始豆包对话：${prompt}`);
  await page.bringToFront().catch(() => undefined);
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);

  const baseline = await readAnswerSnapshot(page);
  await fillPrompt(page, prompt, log);
  await sleep(300);
  await clickSend(page, log);

  const answer = await waitForAnswer(page, baseline.text, log);
  if (!answer) throw new Error('未获取到豆包回答内容');

  const sources = await extractSources(page, log);
  log('success', '豆包对话完成');
  return { answer, sources };
}

module.exports = { runConversation };
