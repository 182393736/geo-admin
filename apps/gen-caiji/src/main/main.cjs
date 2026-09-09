'use strict';
/**
 * 采集应用主进程
 *  - 渲染窗口：首页 IP 列表（Element Plus 表格）
 *  - IP 列表拉取：Node fetch 调公开 POST http://api.tupianseo.com/daili/daili_list（规避渲染层 CORS）
 *  - 会话隔离：每个 IP 一个独立浏览器（playwright launchPersistentContext，userDataDir=profiles/<ip>）
 *  - 平台标签页：同一 IP 会话内 newPage 打开 5 个 AI 平台（同窗口多 tab）
 *
 * 本轮只搭骨架：不做采集的拉取/提交。
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');
const PLATFORMS = require('../shared/platforms.json');
const { detectAuth, watchUsername } = require('./login-detect.cjs');
const { runChat, saveResult, buildJsonPreviewHtml } = require('./chat/index.cjs');

const IP_LIST_URL = 'http://api.tupianseo.com/daili/daili_list';

// 应用名固定，保证 userData 目录稳定（与包名里的 @scope/ 无关）
app.setName('gen-caiji');

/** ip -> { context, pages: Map<platform, Page>, dir } */
const sessions = new Map();

/** 对话测试：最近一次结果 `${ip}:${platform}` -> { htmlPath, jsonPath } */
const lastResults = new Map();
/** 对话测试：进行中的 `${ip}:${platform}` 集合（防重入） */
const runningChats = new Set();

/** 对话测试硬超时（秒）：整个对话流程超过即中止并返回错误，保证按钮不再卡在「对话中」 */
const CHAT_TIMEOUT_MS = 180_000;

/** 给 Promise 加硬超时：超时后无论底层是否结束，都立刻 reject（并在结束时清定时器） */
function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** 渲染主窗口（用于主动推送平台登录态变化） */
let mainWindow = null;

function pushAuth(ip, platform, auth) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('platform-auth-changed', { ip, platform, loggedIn: !!auth.loggedIn, username: auth.username || '' });
  }
}

/** 把对话测试日志推送到渲染层（页面下方日志区） */
function makeChatLog(ip, platform) {
  return (level, message) => {
    const entry = { ip, platform, level, message, time: Date.now() };
    console.log(`[chat:${platform}@${ip}] [${level}] ${message}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('chat-log', entry);
    }
  };
}

/** IP 等字符串 → 文件系统安全名（Windows 非法字符替换为 _） */
function safeName(v) {
  return String(v || '').trim().replace(/[\\/:*?"<>|\s]/g, '_') || 'default';
}

/** 以 IP 作为会话文件夹名 */
function profileDirFor(ip) {
  return path.join(app.getPath('userData'), 'profiles', safeName(ip));
}

/** 对话结果 HTML 保存目录 */
function resultsDirFor(ip) {
  return path.join(app.getPath('userData'), 'results', safeName(ip));
}

/** 获取（或首次创建）该 IP 的独立浏览器会话；若窗口已被手动关闭则自动重建 */
async function getSession(ip) {
  const existing = sessions.get(ip);
  if (existing) {
    try {
      existing.context.pages(); // 已关闭的 context 会抛错，以此探活
      return existing;
    } catch {
      sessions.delete(ip); // 用户手动关掉了窗口 → 重建
    }
  }
  const dir = profileDirFor(ip);
  const context = await chromium.launchPersistentContext(dir, {
    headless: false,   // 真实窗口
    viewport: null,    // 视口跟随窗口大小
    // 后续接代理时在此注入：proxy: { server: `http://${ip}:${port}` }（本轮不做）
  });
  const s = { context, pages: new Map(), dir };
  sessions.set(ip, s);
  console.log(`[collector] 已打开浏览器会话 ${ip} → ${dir}`);
  return s;
}

/** 把「找不到 chromium」这类错误翻译成可执行的提示 */
function friendlyErr(err) {
  const msg = String((err && err.message) || err);
  if (/Executable doesn't exist|chromium|browser/i.test(msg)) {
    return `${msg}（请先运行：pnpm --filter @geo-admin/gen-caiji install:browsers）`;
  }
  return msg;
}

function registerIpc() {
  // —— 拉取 IP 列表 ——
  ipcMain.handle('ip-list:fetch', async () => {
    try {
      const resp = await fetch(IP_LIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(20_000),
      });
      if (!resp.ok) return { ok: false, error: `HTTP ${resp.status}` };
      const data = await resp.json();
      const list = Array.isArray(data && data.list) ? data.list : [];
      return {
        ok: true,
        count: data && data.count != null ? data.count : list.length,
        list: list.map(r => ({ ip: r.ip, port: r.port })),
      };
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  });

  // —— 打开该 IP 的独立浏览器会话 ——
  ipcMain.handle('browser:open', async (_e, ip) => {
    try {
      const s = await getSession(ip);
      return { ok: true, ip, userDataDir: s.dir };
    } catch (err) {
      return { ok: false, error: friendlyErr(err) };
    }
  });

  // —— 在该 IP 会话内打开平台标签页（浏览器未开则自动开；打开时检测登录态）——
  ipcMain.handle('browser:open-platform', async (_e, { ip, platform }) => {
    try {
      const cfg = PLATFORMS.find(p => p.key === platform);
      if (!cfg) return { ok: false, error: `未知平台：${platform}` };
      const s = await getSession(ip);
      let page = s.pages.get(platform);
      let auth = { loggedIn: false, username: '' };
      if (!page || page.isClosed()) {
        page = await s.context.newPage();
        s.pages.set(platform, page);
        // 打开即检测：先挂 response 监听兜底（覆盖导航期接口），再 goto，再读凭证判定
        const watch = watchUsername(page, platform);
        await page.goto(cfg.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        auth = await detectAuth(page, s.context, platform);
        if (!auth.username) auth.username = await watch.promise;
        watch.stop();
        // 页面后续跳转/登录成功刷新 → 自动复检并推送到渲染层
        page.on('load', async () => {
          const re = await detectAuth(page, s.context, platform).catch(() => ({ loggedIn: false, username: '' }));
          pushAuth(ip, platform, re);
        });
      } else {
        await page.bringToFront().catch(() => {});
        auth = await detectAuth(page, s.context, platform).catch(() => ({ loggedIn: false, username: '' }));
      }
      return { ok: true, ip, platform, name: cfg.name, url: cfg.url, loggedIn: auth.loggedIn, username: auth.username };
    } catch (err) {
      return { ok: false, error: friendlyErr(err) };
    }
  });

  // —— 关闭该 IP 会话内的某个平台标签页 ——
  ipcMain.handle('platform:close', async (_e, { ip, platform }) => {
    try {
      const s = sessions.get(ip);
      if (!s) return { ok: true, ip, platform, closed: false };
      const page = s.pages.get(platform);
      if (page && !page.isClosed()) await page.close().catch(() => {});
      s.pages.delete(platform);
      return { ok: true, ip, platform, closed: true };
    } catch (err) {
      return { ok: false, error: friendlyErr(err) };
    }
  });

  // —— 关闭该 IP 的整个浏览器会话（持久化数据保留在磁盘，可再次打开）——
  ipcMain.handle('browser:close', async (_e, ip) => {
    try {
      const s = sessions.get(ip);
      if (!s) return { ok: true, ip, closed: false };
      await s.context.close().catch(() => {});
      sessions.delete(ip);
      console.log(`[collector] 已关闭浏览器会话 ${ip}`);
      return { ok: true, ip, closed: true };
    } catch (err) {
      return { ok: false, error: friendlyErr(err) };
    }
  });

  // —— 对话测试：在对应平台 tab 上执行一次对话，输出回答+信源并保存 HTML ——
  ipcMain.handle('chat:run', async (_e, { ip, platform, prompt }) => {
    const key = `${ip}:${platform}`;
    if (runningChats.has(key)) return { ok: false, error: '该平台正在对话中，请稍候' };
    const cfg = PLATFORMS.find(p => p.key === platform);
    if (!cfg) return { ok: false, error: `未知平台：${platform}` };
    const q = String(prompt || '').trim();
    if (!q) return { ok: false, error: '请输入测试问题' };

    const log = makeChatLog(ip, platform);
    const startedAt = new Date();
    let openedPlatform = false;
    runningChats.add(key);
    try {
      // 整个对话流程（打开 tab → 执行对话 → 保存 HTML）加 180s 硬超时，
      // 超时后必定返回，runningChats 与渲染层按钮状态才能被可靠清除
      const result = await withTimeout(
        (async () => {
          const s = await getSession(ip);
          let page = s.pages.get(platform);
          if (!page || page.isClosed()) {
            page = await s.context.newPage();
            s.pages.set(platform, page);
            openedPlatform = true;
            log('info', `打开 ${cfg.name} 标签页：${cfg.url}`);
            await page.goto(cfg.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
          }
          log('info', `开始 ${cfg.name} 对话：${q}`);
          const r = await runChat(page, platform, q, log);
          const saved = saveResult(resultsDirFor(ip), {
            ip, platform, platformName: cfg.name, prompt: q,
            answer: r.answer || '', sources: r.sources || [],
            startedAt: startedAt.toLocaleString('zh-CN', { hour12: false }),
          });
          lastResults.set(key, saved);
          log('success', `对话完成：回答 ${(r.answer || '').length} 字，信源 ${(r.sources || []).length} 条，已保存 ${saved.htmlPath} / ${saved.jsonPath}`);
          return { ok: true, ip, platform, openedPlatform, answer: r.answer || '', sources: r.sources || [], htmlPath: saved.htmlPath, jsonPath: saved.jsonPath };
        })(),
        CHAT_TIMEOUT_MS,
        `${cfg.name} 对话超时（${Math.round(CHAT_TIMEOUT_MS / 1000)} 秒），已中止`
      );
      return result;
    } catch (err) {
      const msg = String((err && err.message) || err);
      log('error', `对话失败：${msg}`);
      return { ok: false, error: msg };
    } finally {
      runningChats.delete(key);
    }
  });

  // —— 预览：打开该 IP/平台最近一次对话结果 HTML ——
  ipcMain.handle('chat:preview', async (_e, { ip, platform }) => {
    const p = lastResults.get(`${ip}:${platform}`);
    if (!p || !fs.existsSync(p.htmlPath)) return { ok: false, error: '暂无对话结果，请先执行测试' };
    try {
      const win = new BrowserWindow({
        width: 900,
        height: 760,
        title: `对话结果 · ${platform}`,
        webPreferences: { contextIsolation: true, nodeIntegration: false },
      });
      win.loadFile(p.htmlPath);
      return { ok: true, htmlPath: p.htmlPath };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  // —— 预览：打开该 IP/平台最近一次模拟提交 JSON ——
  ipcMain.handle('chat:preview-json', async (_e, { ip, platform }) => {
    const p = lastResults.get(`${ip}:${platform}`);
    if (!p || !fs.existsSync(p.jsonPath)) return { ok: false, error: '暂无对话结果，请先执行测试' };
    try {
      const content = fs.readFileSync(p.jsonPath, 'utf8');
      const win = new BrowserWindow({
        width: 900,
        height: 760,
        title: `提交 JSON · ${platform}`,
        webPreferences: { contextIsolation: true, nodeIntegration: false },
      });
      win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(buildJsonPreviewHtml(content)));
      return { ok: true, jsonPath: p.jsonPath };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    title: '采集应用',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow = win;
  win.on('closed', () => { mainWindow = null; });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  for (const s of sessions.values()) s.context.close().catch(() => {});
  sessions.clear();
  if (process.platform !== 'darwin') app.quit();
});
