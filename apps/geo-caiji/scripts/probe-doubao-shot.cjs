'use strict';
/**
 * 探测豆包会话截图：用已登录 profile 副本打开对话，按采集逻辑截图并量尺寸。
 * node apps/geo-caiji/scripts/probe-doubao-shot.cjs
 */
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { chromium } = require('playwright');
const { captureConversationScreenshot } = require('../src/main/chat/common.cjs');

const SRC = path.join(os.homedir(), 'Library/Application Support/geo-caiji/profiles/5.180.98.221');
const DIR = path.join(__dirname, '..', '..', '..', '.tmp', 'shot-debug');
const PROFILE = path.join(os.tmpdir(), 'geo-caiji-doubao-shot-profile');
const OUT = path.join(DIR, `doubao-probe-${Date.now()}.png`);

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  fs.rmSync(PROFILE, { recursive: true, force: true });
  if (!fs.existsSync(SRC)) throw new Error(`profile 不存在: ${SRC}`);
  fs.cpSync(SRC, PROFILE, { recursive: true });
  for (const n of ['SingletonLock', 'lockfile', 'LOCK']) {
    try { fs.unlinkSync(path.join(PROFILE, n)); } catch { /* ignore */ }
  }

  const context = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled', '--lang=zh-CN'],
  });
  const page = await context.newPage();
  await page.goto('https://www.doubao.com/chat/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  // 点含「AI / 推荐 / 工具」的历史，尽量落到长回答会话
  const clicked = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('[class*="group/conversation-item"], [class*="conversation-item"], [data-testid*="conversation"], a, div'),
    ).filter(el => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      return t.length >= 4 && t.length < 60;
    });
    const prefer = items.find(el => /AI|搜索|推荐|工具|GEO|椅子|优化/.test(el.textContent || '')) || items[0];
    if (!prefer) return '';
    prefer.click();
    return (prefer.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  }).catch(() => '');
  console.log('[probe] clicked history:', clicked || '(none)');
  await page.waitForTimeout(4000);

  const before = await page.evaluate(() => {
    const el = document.querySelector('div[data-page-search-scope="conversation"]');
    if (!el) return { ok: false };
    const r = el.getBoundingClientRect();
    return {
      ok: true,
      clientH: Math.round(el.clientHeight),
      scrollH: Math.round(el.scrollHeight),
      rectH: Math.round(r.height),
      msg: el.querySelectorAll('[data-testid="receive_message"], .flow-markdown-body').length,
    };
  });
  console.log('[probe] conversation before', before);

  const log = (level, msg) => console.log(`[probe][${level}] ${msg}`);
  const buf = await captureConversationScreenshot(page, { platform: 'doubao', log });
  if (!buf || !buf.length) throw new Error('截图为空');
  fs.writeFileSync(OUT, buf);

  // sharp not required — use sips via shell after
  console.log(`[probe] wrote ${OUT} bytes=${buf.length}`);
  await context.close();
}

main().catch(e => {
  console.error('[probe] fail', e);
  process.exit(1);
});
