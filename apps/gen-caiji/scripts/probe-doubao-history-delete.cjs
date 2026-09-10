'use strict';
/**
 * 探测豆包侧边栏历史会话删除交互：hover → 三点 → 删除 → 确认
 * node apps/gen-caiji/scripts/probe-doubao-history-delete.cjs
 */
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { chromium } = require('playwright');

const SRC = path.join(os.homedir(), 'Library/Application Support/gen-caiji/profiles/5.180.98.221');
const DIR = path.join(os.tmpdir(), 'gen-caiji-doubao-hist');
const PROFILE = path.join(DIR, 'profile');
const SHOT = path.join(__dirname, '_shots');

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  fs.mkdirSync(SHOT, { recursive: true });
  fs.rmSync(PROFILE, { recursive: true, force: true });
  fs.cpSync(SRC, PROFILE, { recursive: true });
  for (const n of ['SingletonLock', 'lockfile', 'LOCK']) {
    try {
      fs.unlinkSync(path.join(PROFILE, n));
    } catch {}
  }

  const context = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1400, height: 900 },
    locale: 'zh-CN',
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled', '--lang=zh-CN'],
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://www.doubao.com/chat/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const dumpSidebar = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const brief = el => ({
      tag: el.tagName,
      testid: el.getAttribute('data-testid') || '',
      aria: el.getAttribute('aria-label') || '',
      role: el.getAttribute('role') || '',
      className: String(el.className || '').slice(0, 200),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      x: Math.round(el.getBoundingClientRect().x),
      y: Math.round(el.getBoundingClientRect().y),
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    });

    const leftish = Array.from(document.querySelectorAll('aside, nav, [class*="sidebar"], [class*="side-bar"], [class*="history"], [class*="session"], [class*="conversation"], [data-testid]'))
      .filter(isVisible)
      .filter(el => el.getBoundingClientRect().x < 420)
      .slice(0, 80)
      .map(brief);

    const histHints = Array.from(document.querySelectorAll('[data-testid], a, div, li, button'))
      .filter(isVisible)
      .filter(el => {
        const r = el.getBoundingClientRect();
        if (r.x > 420 || r.width < 40 || r.height < 20 || r.height > 80) return false;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const tid = el.getAttribute('data-testid') || '';
        const cls = String(el.className || '');
        return (
          /history|session|conversation|thread|chat-item|sidebar-item/i.test(tid + cls) ||
          (t.length >= 4 && t.length <= 40 && r.x < 360)
        );
      })
      .slice(0, 40)
      .map(brief);

    return { leftish, histHints, url: location.href };
  });

  console.log('URL', dumpSidebar.url);
  console.log('leftish count', dumpSidebar.leftish.length);
  console.log('histHints', JSON.stringify(dumpSidebar.histHints.slice(0, 15), null, 2));

  // 找左侧会话项并 hover
  const itemInfo = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 80 && r.height >= 28 && r.height <= 72 && r.x < 400;
    };
    const candidates = Array.from(
      document.querySelectorAll(
        [
          '[data-testid*="history"]',
          '[data-testid*="session"]',
          '[data-testid*="conversation"]',
          '[data-testid*="thread"]',
          '[class*="history-item"]',
          '[class*="session-item"]',
          '[class*="conversation-item"]',
          '[class*="thread-item"]',
          'aside a',
          'nav a',
          '[class*="sidebar"] a',
          '[class*="sidebar"] [role="listitem"]',
          '[class*="sidebar"] li',
        ].join(',')
      )
    ).filter(isVisible);

    // 兜底：左侧窄高列表项
    if (!candidates.length) {
      for (const el of Array.from(document.querySelectorAll('a, div, li, [role="button"]'))) {
        if (!isVisible(el)) continue;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (t.length < 4 || t.length > 50) continue;
        if (/新对话|新建|展开|收起|设置|更多/.test(t)) continue;
        candidates.push(el);
      }
    }

    const el = candidates[0];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      testid: el.getAttribute('data-testid') || '',
      className: String(el.className || '').slice(0, 200),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      x: r.x + r.width / 2,
      y: r.y + r.height / 2,
      selectorHint: el.getAttribute('data-testid')
        ? `[data-testid="${el.getAttribute('data-testid')}"]`
        : null,
    };
  });

  console.log('first item', JSON.stringify(itemInfo, null, 2));
  if (!itemInfo) {
    await page.screenshot({ path: path.join(SHOT, 'doubao-hist-empty.png'), fullPage: false });
    console.log('no history item found, shot saved');
    await context.close();
    return;
  }

  await page.mouse.move(itemInfo.x, itemInfo.y);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOT, 'doubao-hist-hover.png'), fullPage: false });

  const afterHover = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const brief = el => ({
      tag: el.tagName,
      testid: el.getAttribute('data-testid') || '',
      aria: el.getAttribute('aria-label') || '',
      className: String(el.className || '').slice(0, 180),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      x: Math.round(el.getBoundingClientRect().x),
      y: Math.round(el.getBoundingClientRect().y),
    });
    const more = Array.from(
      document.querySelectorAll(
        'button, [role="button"], span, div, [data-testid*="more"], [data-testid*="menu"], [aria-label*="更多"], [aria-label*="操作"], [class*="more"], [class*="ellipsis"], [class*="operate"]'
      )
    )
      .filter(isVisible)
      .filter(el => {
        const r = el.getBoundingClientRect();
        if (r.x > 420) return false;
        const t = (el.textContent || '').replace(/\s+/g, '').trim();
        const aria = el.getAttribute('aria-label') || '';
        const tid = el.getAttribute('data-testid') || '';
        const cls = String(el.className || '');
        return (
          /更多|操作|菜单/.test(aria + t) ||
          /more|menu|ellipsis|dots|operate/i.test(tid + cls) ||
          t === '···' ||
          t === '...' ||
          t === '⋯'
        );
      })
      .map(brief);
    return more.slice(0, 20);
  });
  console.log('afterHover more buttons', JSON.stringify(afterHover, null, 2));

  // 点三点
  const clickedMore = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.x < 420;
    };
    const nodes = Array.from(
      document.querySelectorAll('button, [role="button"], span, div, [data-testid]')
    ).filter(isVisible);
    const scored = nodes
      .map(el => {
        const t = (el.textContent || '').replace(/\s+/g, '').trim();
        const aria = el.getAttribute('aria-label') || '';
        const tid = el.getAttribute('data-testid') || '';
        const cls = String(el.className || '');
        let s = 0;
        if (/更多|操作/.test(aria)) s += 50;
        if (/more|menu|ellipsis|operate/i.test(tid)) s += 40;
        if (/more|ellipsis|operate|dropdown/i.test(cls)) s += 20;
        if (t === '···' || t === '...' || t === '⋯') s += 60;
        return { el, s, tid, aria, t, cls: cls.slice(0, 80) };
      })
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);
    const pick = scored[0]?.el;
    if (!pick) return null;
    pick.click();
    return { tid: scored[0].tid, aria: scored[0].aria, t: scored[0].t, cls: scored[0].cls };
  });
  console.log('clickedMore', clickedMore);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOT, 'doubao-hist-menu.png'), fullPage: false });

  const menuItems = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    return Array.from(
      document.querySelectorAll(
        '[role="menuitem"], [role="option"], li, button, div, span, [data-testid*="delete"], [class*="menu"] *'
      )
    )
      .filter(isVisible)
      .filter(el => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return t.length > 0 && t.length < 20 && /删除|移除|清空|delete|rename|重命名|置顶|分享/.test(t);
      })
      .map(el => ({
        tag: el.tagName,
        testid: el.getAttribute('data-testid') || '',
        role: el.getAttribute('role') || '',
        className: String(el.className || '').slice(0, 160),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      }))
      .slice(0, 30);
  });
  console.log('menuItems', JSON.stringify(menuItems, null, 2));

  // 点删除（探测，不确认也可以）
  const clickedDelete = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const nodes = Array.from(document.querySelectorAll('[role="menuitem"], button, div, span, li')).filter(
      isVisible
    );
    const pick = nodes.find(el => {
      const t = (el.textContent || '').replace(/\s+/g, '').trim();
      return t === '删除' || t === '删除对话' || t === '删除会话';
    });
    if (!pick) return null;
    (pick.closest('[role="menuitem"], button, [role="button"]') || pick).click();
    return (pick.textContent || '').trim();
  });
  console.log('clickedDelete', clickedDelete);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOT, 'doubao-hist-confirm.png'), fullPage: false });

  const confirm = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    return Array.from(document.querySelectorAll('button, [role="button"], div, span'))
      .filter(isVisible)
      .filter(el => {
        const t = (el.textContent || '').replace(/\s+/g, '').trim();
        return /确认删除|确定|删除|取消|确认/.test(t) && t.length < 12;
      })
      .map(el => ({
        tag: el.tagName,
        testid: el.getAttribute('data-testid') || '',
        className: String(el.className || '').slice(0, 140),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      }))
      .slice(0, 20);
  });
  console.log('confirm candidates', JSON.stringify(confirm, null, 2));

  fs.writeFileSync(
    path.join(DIR, 'probe.json'),
    JSON.stringify({ dumpSidebar, itemInfo, afterHover, clickedMore, menuItems, confirm }, null, 2)
  );
  console.log('wrote', path.join(DIR, 'probe.json'));
  await page.waitForTimeout(2000);
  await context.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
