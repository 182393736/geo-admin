'use strict';
/**
 * 探测豆包信源 DOM：打开已登录 profile 副本，对当前页/最近对话 dump 信源相关节点。
 * node apps/gen-caiji/scripts/probe-doubao-sources.cjs
 */
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { chromium } = require('playwright');

const SRC = path.join(os.homedir(), 'Library/Application Support/gen-caiji/profiles/5.180.98.221');
const DIR = path.join(os.tmpdir(), 'gen-caiji-doubao-src');
const PROFILE = path.join(DIR, 'profile');
const OUT = path.join(DIR, `dom-${Date.now()}.json`);

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
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
    viewport: null,
    locale: 'zh-CN',
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled', '--lang=zh-CN'],
  });
  const page = await context.newPage();
  await page.goto('https://www.doubao.com/chat/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // 若有历史对话，点第一条
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[class*="session"], [class*="history"], [class*="conversation"], a, div'))
      .filter(el => {
        const t = (el.textContent || '').trim();
        return t.length > 4 && t.length < 40 && /雕塑|厂家|推荐|礼堂/.test(t);
      });
    items[0]?.click();
  }).catch(() => {});
  await page.waitForTimeout(2500);

  const dump = async label => {
    const data = await page.evaluate(() => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const brief = el => ({
        tag: el.tagName,
        id: el.id || '',
        testid: el.getAttribute('data-testid') || '',
        role: el.getAttribute('role') || '',
        className: String(el.className || '').slice(0, 160),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        href: el.href || el.getAttribute('href') || '',
        y: Math.round(el.getBoundingClientRect().y),
      });

      const hits = [];
      for (const el of Array.from(document.querySelectorAll('button,a,div,span,[role="button"],[data-testid]'))) {
        if (!isVisible(el)) continue;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const cls = String(el.className || '');
        const tid = el.getAttribute('data-testid') || '';
        if (
          /搜索|来源|信源|网页|引用|参考/.test(t) && t.length < 50 ||
          /search|ref|source|cite|reference|webpage/i.test(cls + tid)
        ) {
          hits.push(brief(el));
        }
      }
      hits.sort((a, b) => a.y - b.y);

      const links = Array.from(document.querySelectorAll('a[href^="http"]'))
        .filter(isVisible)
        .map(brief)
        .filter(x => !/doubao\.com|bytedance|feishu/i.test(x.href))
        .slice(0, 40);

      return {
        url: location.href,
        hitCount: hits.length,
        hits: hits.slice(0, 80),
        externalLinks: links,
      };
    });
    return { label, ...data };
  };

  const before = await dump('before-click');

  // 尝试点击最像入口的节点
  const clickInfo = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const score = t => {
      const s = (t || '').replace(/\s+/g, '');
      if (/搜索到\d+个网页/.test(s)) return 100;
      if (/引用了?\d+个网页/.test(s)) return 90;
      if (/\d+个来源/.test(s)) return 80;
      if (/^信源$|^来源$/.test(s)) return 70;
      if (/网页/.test(s) && s.length < 20) return 40;
      return 0;
    };
    const ranked = Array.from(document.querySelectorAll('button,a,div,span,[role="button"]'))
      .filter(isVisible)
      .map(el => ({ el, s: score(el.textContent), t: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), y: el.getBoundingClientRect().y }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s || b.y - a.y);
    const pick = ranked[0];
    if (!pick) return { clicked: false, candidates: ranked.slice(0, 10).map(x => ({ s: x.s, t: x.t, y: x.y })) };
    const target = pick.el.closest('button,a,[role="button"]') || pick.el;
    target.scrollIntoView({ block: 'center' });
    target.click();
    return {
      clicked: true,
      text: pick.t,
      score: pick.s,
      className: String(target.className || '').slice(0, 120),
      testid: target.getAttribute('data-testid') || '',
      candidates: ranked.slice(0, 10).map(x => ({ s: x.s, t: x.t, y: x.y })),
    };
  });

  await page.waitForTimeout(2000);
  const after = await dump('after-click');

  // 再扫一遍侧栏/抽屉
  const drawers = await page.evaluate(() => {
    const isVisible = el => {
      if (!(el instanceof HTMLElement)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    return Array.from(document.querySelectorAll('[class*="drawer" i], [class*="panel" i], [class*="side" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'))
      .filter(isVisible)
      .map(el => ({
        className: String(el.className || '').slice(0, 160),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
        linkCount: el.querySelectorAll('a[href^="http"]').length,
      }))
      .slice(0, 20);
  });

  const payload = { clickInfo, before, after, drawers };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
  console.log('saved', OUT);
  await page.waitForTimeout(5000);
  await context.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
