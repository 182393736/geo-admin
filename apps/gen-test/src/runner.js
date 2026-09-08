'use strict';
/**
 * Playwright 执行器：按 steps.js 逐步执行，每步截图 + 写回任务记录。
 * 执行结束后从 geo_token 解出 user_id、从业务库查出 brand_id，供「删除任务数据」使用。
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { steps, extractBrandName } = require('./steps');
const { getTask, updateTask, appendStep, connect } = require('./db');
const { decodeJwtPayload } = require('@geo-admin/contracts');

const DASH = process.env.DASH_URL || 'http://127.0.0.1:5173';
const SITE = process.env.SITE_URL || 'http://localhost:3002';
const API = process.env.API_URL || 'http://127.0.0.1:7001';
const ARTIFACTS = process.env.ARTIFACTS_DIR || path.join(__dirname, '..', 'data', 'artifacts');

let running = false;

/** 依赖服务健康检查（dash / site / api 任一离线则无法执行） */
async function checkDeps() {
  const deps = { DASH, SITE, API };
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
    const task = await getTask(taskId);
    if (!task) throw new Error('任务不存在');
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
    browser = await chromium.launch({ headless: !headed, slowMo: headed ? 250 : 0 });
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
        await appendStep(taskId, { seq, name: step.name, status: 'skip', detail: '不适用（账号已有品牌，跳过首登建档）', screenshot: null, ts: new Date() });
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
    try {
      // 两站 token key 不同（dash 用 geo_token，官网用 geo.token）；再兜底从 geo_user 解 id，
      // 确保「删除任务数据」的锚点 user_id 尽量可靠（步骤 15 等偶发超时不至于连锚点一起丢）。
      const info = await page.evaluate(() => {
        let geoUser = null;
        try { geoUser = JSON.parse(localStorage.getItem('geo_user') || 'null'); } catch { /* 忽略 */ }
        return {
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
      cleanup: { account: task.account, user_id, brand_id, brand_name, cleaned: false, deleted_counts: null },
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

module.exports = { tryStartTask, isRunning, checkDeps, ARTIFACTS, DASH, SITE, API };
