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
const { chromium } = require('playwright');
const PLATFORMS = require('../shared/platforms.json');

const IP_LIST_URL = 'http://api.tupianseo.com/daili/daili_list';

// 应用名固定，保证 userData 目录稳定（与包名里的 @scope/ 无关）
app.setName('gen-caiji');

/** ip -> { context, pages: Map<platform, Page>, dir } */
const sessions = new Map();

/** 以 IP 作为会话文件夹名（IP 里的「.」合法保留；Windows 非法字符替换为 _） */
function profileDirFor(ip) {
  const safe = String(ip || '').trim().replace(/[\\/:*?"<>|\s]/g, '_') || 'default';
  return path.join(app.getPath('userData'), 'profiles', safe);
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

  // —— 在该 IP 会话内打开平台标签页（浏览器未开则自动开）——
  ipcMain.handle('browser:open-platform', async (_e, { ip, platform }) => {
    try {
      const cfg = PLATFORMS.find(p => p.key === platform);
      if (!cfg) return { ok: false, error: `未知平台：${platform}` };
      const s = await getSession(ip);
      let page = s.pages.get(platform);
      if (!page || page.isClosed()) {
        page = await s.context.newPage();
        s.pages.set(platform, page);
        await page.goto(cfg.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      } else {
        await page.bringToFront().catch(() => {});
      }
      return { ok: true, ip, platform, name: cfg.name, url: cfg.url };
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
