'use strict';
/**
 * Playwright 执行器：按 steps.js 逐步执行，每步截图 + 写回任务记录。
 * 执行结束后从 geo_token 解出 user_id、从业务库查出 brand_id，供「删除任务数据」使用。
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { getTask, updateTask, appendStep, connect, ensureTestUser } = require('./db');
const { decodeJwtPayload } = require('@geo-admin/contracts');

/**
 * Cursor Agent / 部分 IDE shell 会注入 PLAYWRIGHT_BROWSERS_PATH → sandbox 缓存，
 * 且常缺完整 Chromium。始终优先本机 ~/Library/Caches/ms-playwright（或显式可执行文件）。
 */
function localMsPlaywrightDir() {
  return path.join(os.homedir(), 'Library/Caches/ms-playwright');
}

function findChromiumBinary(browsersDir) {
  if (!browsersDir || !fs.existsSync(browsersDir)) return '';
  let dirs = [];
  try {
    dirs = fs.readdirSync(browsersDir).filter(d => /^chromium-\d+$/.test(d));
  } catch {
    return '';
  }
  // 版本号高的优先（与较新 playwright 匹配）
  dirs.sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  for (const d of dirs) {
    const base = path.join(browsersDir, d);
    const candidates = [
      path.join(base, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
      path.join(base, 'chrome-mac', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
      path.join(base, 'chrome-linux', 'chrome'),
      path.join(base, 'chrome-win64', 'chrome.exe'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return '';
}

function ensurePlaywrightBrowsers() {
  const cur = process.env.PLAYWRIGHT_BROWSERS_PATH || '';
  const homeCache = localMsPlaywrightDir();
  // 丢弃无效 / sandbox 路径，避免 chromium.executablePath() 指到空壳
  if (!cur || cur.includes('cursor-sandbox-cache') || !fs.existsSync(cur)) {
    delete process.env.PLAYWRIGHT_BROWSERS_PATH;
    if (fs.existsSync(homeCache)) process.env.PLAYWRIGHT_BROWSERS_PATH = homeCache;
  }

  let exe = findChromiumBinary(process.env.PLAYWRIGHT_BROWSERS_PATH || homeCache);
  if (!exe) {
    try {
      const guessed = chromium.executablePath();
      if (guessed && fs.existsSync(guessed) && !guessed.includes('cursor-sandbox-cache')) {
        exe = guessed;
      }
    } catch {
      /* ignore */
    }
  }
  if (!exe) {
    throw new Error(
      `Playwright Chromium 不存在（已避开 cursor-sandbox-cache）。\n请在本机执行: cd apps/gen-test && npx playwright install chromium\n当前 PLAYWRIGHT_BROWSERS_PATH=${process.env.PLAYWRIGHT_BROWSERS_PATH || '(unset)'}`,
    );
  }
  return exe;
}

/** 每次任务重新加载 steps.js，避免改步骤后还要重启 gen-test */
function loadSteps() {
  const stepsPath = require.resolve('./steps');
  delete require.cache[stepsPath];
  return require('./steps');
}

function skipDetail(step, runCtx) {
  const name = String(step.name || '');
  if (/品牌 2|添加新品牌|添加品牌|2 个品牌/.test(name)) {
    return '未填写品牌 2，跳过多品牌步骤';
  }
  return '不适用（账号已有品牌，跳过首登建档）';
}

const DASH = process.env.DASH_URL || 'http://127.0.0.1:5173';
const SITE = process.env.SITE_URL || 'http://localhost:3002';
const API = process.env.API_URL || 'http://127.0.0.1:7001';
const ADMIN = process.env.ADMIN_URL || 'http://localhost:5180';
const ARTIFACTS = process.env.ARTIFACTS_DIR || path.join(__dirname, '..', 'data', 'artifacts');

let running = false;

/** 依赖服务健康检查（dash / site / api / admin 任一离线则无法执行） */
async function checkDeps() {
  const deps = { DASH, SITE, API, ADMIN };
  const missing = [];
  for (const [k, base] of Object.entries(deps)) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(5000) });
      if (!r.ok && r.status >= 500) missing.push(`${k}(${base})`);
    } catch {
      missing.push(`${k}(${base})`);
    }
  }
  return { ok: missing.length === 0, missing, deps };
}

async function runTask(taskId) {
  const startedAt = new Date();
  let browser = null;
  try {
    const { steps, extractBrandName } = loadSteps();
    const task = await getTask(taskId);
    if (!task) throw new Error('任务不存在');
    // 与 gen-api 同库同步账号密码，避免 geo_dev / 过期密码导致登录失败
    await ensureTestUser(task.account, task.password);
    const brandName = extractBrandName(task.brand_input);
    await updateTask(taskId, { status: 'running', started_at: startedAt, result: null, steps: [], cleanup: null });

    const depCheck = await checkDeps();
    if (!depCheck.ok) {
      await updateTask(taskId, {
        status: 'failed', finished_at: new Date(),
        result: { pass: false, summary: `依赖服务未就绪：${depCheck.missing.join('、')}（请先启动 gen-api / gen-user-dash / gen-user-site）` },
      });
      return;
    }

    const dir = path.join(ARTIFACTS, taskId);
    fs.mkdirSync(dir, { recursive: true });

    // 有头模式：弹出真实浏览器窗口供观察；配合 slowMo 放慢每步操作，便于肉眼跟进交互过程。
    // 无头模式（默认）：静默执行，适合无人值守批量回归。
    const headed = !!task.headed;
    const executablePath = ensurePlaywrightBrowsers();
    browser = await chromium.launch({ headless: !headed, slowMo: headed ? 250 : 0, executablePath });
    const bctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await bctx.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e)));

    const runCtx = { deps: depCheck.deps, task, brandName, route: null };

    let failed = false;
    let failedSeq = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const seq = i + 1;
      if (failed) {
        await appendStep(taskId, { seq, name: step.name, status: 'skip', detail: '前序步骤失败，跳过', screenshot: null, ts: new Date() });
        continue;
      }
      if (step.skip && step.skip(runCtx)) {
        await appendStep(taskId, { seq, name: step.name, status: 'skip', detail: skipDetail(step, runCtx), screenshot: null, ts: new Date() });
        continue;
      }
      let out;
      try {
        out = await step.run(page, runCtx);
      } catch (e) {
        out = { status: 'fail', detail: String((e && e.message) || e).slice(0, 300) };
      }
      let shot = null;
      if (task.screenshot) {
        const f = `step-${String(seq).padStart(2, '0')}.png`;
        try { await page.screenshot({ path: path.join(dir, f) }); shot = f; } catch { /* 截图失败不阻断 */ }
      }
      await appendStep(taskId, { seq, name: step.name, status: out.status, detail: out.detail || '', screenshot: shot, ts: new Date() });
      if (out.status === 'fail') { failed = true; failedSeq = seq; }
    }

    // —— 收集清理信息：user_id（JWT sub）、brand_id / 品牌名（业务库） ——
    let user_id = '';
    let brand_id = '';
    let brand_name = brandName;
    let info = { href: '', token: '', userId: '' };
    try {
      // 两站 token key 不同（dash 用 geo_token，官网用 geo.token）；再兜底从 geo_user 解 id，
      // 确保「删除任务数据」的锚点 user_id 尽量可靠（步骤 15 等偶发超时不至于连锚点一起丢）。
      info = await page.evaluate(() => {
        let geoUser = null;
        try { geoUser = JSON.parse(localStorage.getItem('geo_user') || 'null'); } catch { /* 忽略 */ }
        return {
          href: location.href,
          token: localStorage.getItem('geo_token') || localStorage.getItem('geo.token') || '',
          userId: (geoUser && geoUser.id) || '',
        };
      });
      if (info.token) {
        const payload = decodeJwtPayload(info.token);
        user_id = (payload && payload.sub) || '';
      }
      if (!user_id) user_id = info.userId;
    } catch { /* 未登录成功则留空 */ }
    try {
      const db = await connect();
      const brandDoc = await db.collection('brands').findOne({ user_id }, { sort: { created_at: -1 } });
      if (brandDoc) { brand_id = brandDoc.brand_id; brand_name = brandDoc.name || brand_name; }
    } catch { /* 忽略 */ }

    const pass = !failed;
    await updateTask(taskId, {
      status: pass ? 'passed' : 'failed',
      finished_at: new Date(),
      result: {
        pass,
        summary: pass
          ? `共 ${steps.length} 步全部通过${pageErrors.length ? `；页面 JS 错误 ${pageErrors.length} 条` : ''}`
          : `第 ${failedSeq} 步失败${pageErrors.length ? `；页面 JS 错误 ${pageErrors.length} 条` : ''}`,
        page_errors: pageErrors,
      },
      cleanup: {
        account: task.account, user_id, brand_id, brand_name, cleaned: false, deleted_counts: null,
        collect_debug: { href: info.href, has_token: !!info.token, has_geo_user: !!info.userId },
      },
    });
    await bctx.close().catch(() => {});
  } finally {
    if (browser) await browser.close().catch(() => {});
    running = false;
  }
}

/** 串行启动：同一时间只跑一个任务，避免共享账号/库互相干扰 */
function tryStartTask(id) {
  if (running) throw Object.assign(new Error('已有任务在执行中，请等待其完成'), { status: 409 });
  running = true;
  runTask(id).catch(async e => {
    try {
      await updateTask(id, { status: 'failed', finished_at: new Date(), result: { pass: false, summary: String((e && e.message) || e).slice(0, 300) } });
    } catch { /* 任务可能已被删除 */ }
  });
  return { started: true };
}

function isRunning() { return running; }

module.exports = { tryStartTask, isRunning, checkDeps, ARTIFACTS, DASH, SITE, API, ADMIN };
