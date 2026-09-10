'use strict';
/**
 * 单次跑元宝对话（profile 副本，不抢 Electron 锁）
 * node apps/gen-caiji/scripts/run-yuanbao-once.cjs [prompt]
 */
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { chromium } = require('playwright');
const { runConversation } = require('../src/main/chat/yuanbao.cjs');
const { saveResult } = require('../src/main/chat/index.cjs');

const PROMPT = process.argv.slice(2).join(' ').trim() || '雕塑厂家推荐哪家好';
const IP = '5.180.98.221';
const SRC = path.join(os.homedir(), 'Library/Application Support/gen-caiji/profiles', IP);
const DIR = path.join(os.tmpdir(), 'gen-caiji-yuanbao-once');
const PROFILE = path.join(DIR, 'profile');
const OUT = path.join(os.homedir(), 'Library/Application Support/gen-caiji/results', IP);

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  fs.rmSync(PROFILE, { recursive: true, force: true });
  fs.cpSync(SRC, PROFILE, { recursive: true });
  for (const n of ['SingletonLock', 'lockfile', 'LOCK']) {
    try {
      fs.unlinkSync(path.join(PROFILE, n));
    } catch {}
  }

  const log = (level, message) => console.log(`[yuanbao] [${level}] ${message}`);
  console.log(`[yuanbao] prompt=${PROMPT}`);

  const context = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome',
    headless: false,
    viewport: null,
    locale: 'zh-CN',
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled', '--lang=zh-CN'],
  });

  const page = await context.newPage();
  await page.goto('https://yuanbao.tencent.com/chat/', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  const startedAt = new Date();
  try {
    const r = await runConversation(page, PROMPT, log);
    fs.mkdirSync(OUT, { recursive: true });
    const saved = saveResult(OUT, {
      ip: IP,
      platform: 'yuanbao',
      platformName: '腾讯元宝',
      prompt: PROMPT,
      answer: r.answer || '',
      answerHtml: r.answerHtml || '',
      sources: r.sources || [],
      startedAt,
    });
    console.log(
      `[yuanbao] done answer=${(r.answer || '').length} sources=${(r.sources || []).length}`
    );
    console.log(`[yuanbao] html=${saved.htmlPath}`);
    console.log(`[yuanbao] json=${saved.jsonPath}`);
    console.log(`[yuanbao] answerPreview=${String(r.answer || '').slice(0, 200)}`);
  } finally {
    await context.close().catch(() => {});
  }
}

main().catch(err => {
  console.error('[yuanbao] FAIL', err);
  process.exit(1);
});
