'use strict';
/**
 * dev:all —— 本地开发一键启动（仅限本地使用！）
 * ------------------------------------------------------------------
 * 依次拉起：MongoDB(内存,固定端口) → gen-api → gen-user-dash → gen-user-site → gen-test
 * 所有服务共用一个 MongoDB（mongodb://127.0.0.1:42439/geo_dev），
 * 保证 gen-test 的「删除任务数据」能清理 gen-api 的业务库。
 *
 * ⚠️ 仅限本地开发：NODE_ENV=production 时直接拒绝启动。
 * 用法：pnpm dev:all        （Ctrl+C 一键停止全部）
 *       DEV_ALL_NO_OPEN=1 pnpm dev:all   （不自动打开浏览器）
 */
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

// ---- 仅限本地：生产环境直接拒绝 ----
if (process.env.NODE_ENV === 'production') {
  console.error('[dev:all] ❌ 该脚本仅限本地开发环境使用，禁止在生产环境运行。');
  process.exit(1);
}

// ---- LLM 代理（仅本地开发）----
// 海外 LLM 供应商（如 Mistral）在大陆直连会 fetch failed；本地开发默认走本机 HTTP 代理。
//   LLM_PROXY 未设置 → 注入 http://localhost:1087；LLM_PROXY=xxx → 用 xxx；LLM_PROXY=（空）→ 强制直连。
//   生产环境不经过本脚本（且 NODE_ENV=production 会被上方拦截），完全不受影响。
if (process.env.LLM_PROXY === undefined) {
  process.env.LLM_PROXY = 'http://localhost:1087';
  console.log('[dev:all] ℹ️  本地 LLM 默认走本机代理 http://localhost:1087（LLM_PROXY= 留空强制直连，LLM_PROXY=xxx 自定义）');
}

const ROOT = path.join(__dirname, '..');
const MONGO_PORT = Number(process.env.GEO_MONGO_PORT || 42439);
const MONGO_URL = `mongodb://127.0.0.1:${MONGO_PORT}/geo_dev`;

// pnpm 路径：优先用 pnpm 运行时注入的 npm_execpath（最可靠），否则回退 PATH 中的 pnpm
const PNPM = process.env.npm_execpath && /pnpm/i.test(process.env.npm_execpath)
  ? process.env.npm_execpath
  : (process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm');

const SERVICES = {
  mongo: { port: MONGO_PORT, host: '127.0.0.1', label: 'MongoDB(内存)', url: MONGO_URL },
  api:   { port: 7001,      host: '127.0.0.1', label: 'gen-api 后端',  url: 'http://127.0.0.1:7001' },
  dash:  { port: 5173,      host: '127.0.0.1', label: '用户后台',      url: 'http://localhost:5173' },
  site:  { port: 3002,      host: 'localhost', label: '官网/首登站',   url: 'http://localhost:3002' },
  test:  { port: 8787,      host: '127.0.0.1', label: '测试程序',      url: 'http://localhost:8787' },
  admin: { port: 5180,      host: '127.0.0.1', label: '管理总后台',    url: 'http://localhost:5180' },
};

const COLORS = { mongo: '\x1b[32m', api: '\x1b[33m', dash: '\x1b[36m', site: '\x1b[35m', test: '\x1b[34m', admin: '\x1b[31m' };
const RESET = '\x1b[0m';
const children = new Set();

/** 是否自动打开浏览器（默认打开；DEV_ALL_NO_OPEN=1 时关闭） */
const AUTO_OPEN = process.env.DEV_ALL_NO_OPEN !== '1';

/** 在系统默认浏览器打开 URL（跨平台；无 GUI 环境下静默失败不阻塞） */
function openBrowser(url) {
  return new Promise(resolve => {
    let child;
    if (process.platform === 'win32') {
      child = spawn('cmd', ['/c', 'start', '""', url], { stdio: 'ignore', detached: true });
    } else if (process.platform === 'darwin') {
      child = spawn('open', [url], { stdio: 'ignore', detached: true });
    } else {
      child = spawn('xdg-open', [url], { stdio: 'ignore', detached: true });
    }
    child.on('error', () => resolve(false));
    child.on('exit', () => resolve(true));
    try { child.unref(); } catch { /* 忽略 */ }
    // 兜底：xdg-open 等可能长时间不退出，3 秒后视为已尝试
    setTimeout(() => resolve(true), 3000);
  });
}

/** 给子进程输出按行加 [名字] 前缀 */
function prefixLines(name, stream) {
  let buf = '';
  stream.on('data', chunk => {
    buf += chunk.toString();
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).replace(/\r$/, '');
      buf = buf.slice(idx + 1);
      if (line.trim()) console.log(`${COLORS[name]}[${name}]${RESET} ${line}`);
    }
  });
}

function portInUse(port, host) {
  return new Promise(resolve => {
    const s = net.connect({ port, host });
    s.once('connect', () => { s.destroy(); resolve(true); });
    s.once('error', () => resolve(false));
  });
}

/**
 * 启动一个子进程，可选等待其 stdout 出现 waitFor 标记（用于确认服务就绪）。
 * 返回 Promise：就绪时 resolve；提前退出或超时则 reject。
 */
function run(name, cmd, args, { cwd = ROOT, env = {}, waitFor = null, waitTimeout = 240_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    children.add(child);
    prefixLines(name, child.stdout);
    prefixLines(name, child.stderr);

    let settled = false;
    const done = err => { if (!settled) { settled = true; err ? reject(err) : resolve(); } };

    child.on('error', err => done(new Error(`[${name}] 启动失败：${err.message}（找不到 ${cmd}？请确认 pnpm 已安装）`)));
    child.on('exit', (code, sig) => { if (!settled) done(new Error(`[${name}] 提前退出（${code ?? sig}），请查看上方日志`)); });

    if (waitFor) {
      let found = '';
      const timer = setTimeout(() => done(new Error(`[${name}] 等待 "${waitFor}" 超时（${waitTimeout / 1000}s）`)), waitTimeout);
      const onData = chunk => {
        found += chunk.toString();
        if (found.includes(waitFor)) { clearTimeout(timer); child.stdout.off('data', onData); done(); }
      };
      child.stdout.on('data', onData);
    } else {
      done();
    }
  });
}

async function startIfFree(name, start) {
  const svc = SERVICES[name];
  if (await portInUse(svc.port, svc.host)) {
    console.log(`${COLORS[name]}[${name}]${RESET} 端口 ${svc.port} 已占用，跳过（复用现有实例）`);
    return;
  }
  await start();
  console.log(`${COLORS[name]}[${name}]${RESET} ✅ 已就绪 → ${svc.url}`);
}

(async () => {
  console.log('');
  console.log('  🚀 geo-admin 本地开发一键启动（dev:all）');
  console.log('  ⚠️  仅限本地开发环境使用，请勿用于生产。Ctrl+C 一键停止全部。');
  console.log('');

  // 1) MongoDB（必须最先就绪，api/test 启动时都要连它）
  if (await portInUse(MONGO_PORT, '127.0.0.1')) {
    console.log('[mongo] 端口已占用，复用现有实例 → ' + MONGO_URL);
  } else {
    try {
      await run('mongo', process.execPath,
        [path.join(ROOT, 'apps/gen-api/scripts/dev-mongo-fixed.js'), String(MONGO_PORT)],
        { waitFor: 'mongod 已启动' });
      console.log('[mongo] ✅ 已就绪 → ' + MONGO_URL);
    } catch (e) {
      console.error('[mongo] ❌ ' + e.message);
      process.exit(1);
    }
  }

  // 2) 其余服务（各自等待就绪标记）
  try {
    await startIfFree('api', () => run('api', PNPM, ['--filter', '@geo-admin/gen-api', 'dev'],
      { env: { MONGO_URL }, waitFor: 'egg started' }));
  } catch (e) { console.error('[api] ❌ ' + e.message); }

  try {
    await startIfFree('dash', () => run('dash', PNPM, ['--filter', '@geo-admin/gen-user-dash', 'dev'],
      { waitFor: 'ready in' }));
  } catch (e) { console.error('[dash] ❌ ' + e.message); }

  try {
    await startIfFree('site', () => run('site', PNPM, ['--filter', '@geo-admin/gen-user-site', 'dev'],
      { waitFor: 'Local:' }));
  } catch (e) { console.error('[site] ❌ ' + e.message); }

  try {
    await startIfFree('test', () => run('test', PNPM, ['--filter', '@geo-admin/gen-test', 'dev'],
      { env: { TEST_MONGO_URL: MONGO_URL }, waitFor: '测试程序已启动' }));
  } catch (e) { console.error('[test] ❌ ' + e.message); }

  try {
    await startIfFree('admin', () => run('admin', PNPM, ['--filter', '@geo-admin/gen-admin', 'dev'],
      { waitFor: 'ready in' }));
  } catch (e) { console.error('[admin] ❌ ' + e.message); }

  console.log('');
  console.log('  ✅ 服务启动完成：');
  for (const k of ['api', 'dash', 'site', 'test', 'admin']) {
    console.log(`     ${SERVICES[k].label.padEnd(12, '　')} ${SERVICES[k].url}`);
  }
  console.log('  打开测试程序 → http://localhost:8787');
  console.log('  管理总后台 → http://localhost:5180（管理员 123456/123456）');
  console.log('  按 Ctrl+C 停止全部服务。');
  console.log('');

  // 自动在默认浏览器打开三个网页（dash / site / test）
  if (AUTO_OPEN) {
    console.log('  🌐 正在默认浏览器打开网页…');
    for (const k of ['dash', 'site', 'test']) {
      const ok = await openBrowser(SERVICES[k].url);
      console.log(`     ${ok ? '✅' : '⚠️ '}${SERVICES[k].label.padEnd(12, '　')} ${SERVICES[k].url}${ok ? '' : '（无法自动打开，请手动访问）'}`);
    }
    console.log('');
  } else {
    console.log('  ℹ️  已禁用自动打开浏览器（DEV_ALL_NO_OPEN=1）。');
    console.log('');
  }

  // 优雅停止：逐个给子进程发 SIGTERM
  const shutdown = sig => {
    console.log(`\n[dev:all] 收到 ${sig}，正在停止全部服务…`);
    for (const c of children) { try { c.kill('SIGTERM'); } catch { /* 已退出 */ } }
    setTimeout(() => process.exit(0), 1500);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
})().catch(e => { console.error('[dev:all] 失败：', e.message); process.exit(1); });
