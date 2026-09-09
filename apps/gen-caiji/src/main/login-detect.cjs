'use strict';
/**
 * 5 平台登录态检测（参考 platform-login-detection.md）
 * 统一返回 { loggedIn: boolean, username?: string }
 *
 * 策略：Cookie/localStorage 判登录 → 接口/IndexedDB/DOM 取展示名 → 打开 Tab 时 response 监听兜底
 * 说明：各平台 DOM/接口会变，Cookie/Storage 凭证相对稳定；检测依赖平台 Tab 已打开且同源。
 */

/** 用 playwright context.cookies 读取（含 HttpOnly），比 document.cookie 更全 */
async function cookiesFor(context, url) {
  try { return await context.cookies(url); } catch { return []; }
}

function pickCookie(cookies, names) {
  for (const c of cookies) {
    if (names.includes(c.name) && c.value) return String(c.value);
  }
  return '';
}

/** 在 JSON 对象里递归找第一个符合的展示名字段 */
function extractUsername(obj, fields, depth = 0) {
  if (!obj || depth > 4) return '';
  if (Array.isArray(obj)) {
    for (const it of obj) { const v = extractUsername(it, fields, depth + 1); if (v) return v; }
    return '';
  }
  if (typeof obj === 'object') {
    for (const f of fields) {
      const v = obj[f];
      if (typeof v === 'string' && validUsername(v)) return v;
    }
    for (const k in obj) { const v = extractUsername(obj[k], fields, depth + 1); if (v) return v; }
  }
  return '';
}

/** 过滤内部码 / 纯 hex / 产品文案 */
function validUsername(v) {
  const s = v.trim();
  if (!s || s.length > 40) return false;
  if (/^[0-9a-f]{32}$/i.test(s)) return false;
  if (/^(登录|注册|退出|百度|文心|豆包|DeepSeek|deepseek|通义|千问|元宝)/i.test(s)) return false;
  return true;
}

/* ================= 各平台判定与用户名获取 ================= */

/** 豆包：Cookie sessionid（>8）判登录；IndexedDB 找 nickname */
async function detectDoubao(page, context) {
  const cookies = await cookiesFor(context, 'https://www.doubao.com');
  const sessionid = pickCookie(cookies, ['sessionid']);
  const loggedIn = sessionid.length > 8;
  let username = '';
  if (loggedIn) username = await page.evaluate(() => readDoubaoUsernameInPage()).catch(() => '');
  return { loggedIn, username };
}
// 注入到页面内执行的豆包用户名读取（IndexedDB → performance 资源 → DOM）
function readDoubaoUsernameInPage() {
  const nickFields = ['nickname'];
  const filter = s => {
    s = (s || '').trim();
    if (!s || s.length > 40 || /^user_/.test(s) || /^[0-9a-f]{32}$/i.test(s)) return '';
    return s;
  };
  return new Promise(resolve => {
    let found = '';
    const tryDom = () => {
      const el = document.querySelector('[class*="user-name"], [class*="nickname"], [class*="userName"]');
      return el ? filter(el.textContent) : '';
    };
    const tryResources = async () => {
      const entries = (performance.getEntriesByType('resource') || []).map(e => e.name);
      for (const u of entries) {
        if (!/doubao\.com/i.test(u) || !/user|profile|account|passport|member/i.test(u)) continue;
        try {
          const r = await fetch(u, { credentials: 'include' });
          const j = await r.json();
          const n = walk(j);
          if (n) return n;
        } catch { /* ignore */ }
      }
      return '';
    };
    const walk = (obj, d = 0) => {
      if (!obj || d > 4) return '';
      if (Array.isArray(obj)) { for (const it of obj) { const v = walk(it, d + 1); if (v) return v; } return ''; }
      if (typeof obj === 'object') {
        for (const f of nickFields) { const v = filter(obj[f]); if (v) return v; }
        for (const k in obj) { const v = walk(obj[k], d + 1); if (v) return v; }
      }
      return '';
    };
    const scanDb = async () => {
      let list = [];
      try { list = indexedDB.databases ? await indexedDB.databases() : []; } catch { /* ignore */ }
      for (const dbInfo of list) {
        const nm = (dbInfo.name || '').toLowerCase();
        if (!/multiuserprofiles|userprofile|samantha/.test(nm)) continue;
        const nick = await new Promise(res => {
          let done = false;
          const req = indexedDB.open(dbInfo.name);
          req.onerror = () => res('');
          req.onsuccess = () => {
            const db = req.result;
            const stores = [...db.objectStoreNames];
            if (!stores.length) { res(''); return; }
            let remain = stores.length;
            for (const st of stores) {
              try {
                const txn = db.transaction(st, 'readonly');
                const getAll = txn.objectStore(st).getAll();
                getAll.onsuccess = () => {
                  for (const r of (getAll.result || [])) {
                    const v = r && typeof r === 'object' ? filter(r.nickname) : '';
                    if (v && !done) { done = true; res(v); return; }
                  }
                  if (--remain === 0 && !done) res('');
                };
                getAll.onerror = () => { if (--remain === 0 && !done) res(''); };
              } catch { if (--remain === 0 && !done) res(''); }
            }
          };
        });
        if (nick) { found = nick; break; }
      }
      return found;
    };
    (async () => {
      found = await scanDb();
      if (!found) found = tryDom();
      if (!found) found = await tryResources();
      resolve(found);
    })();
  });
}

/** DeepSeek：localStorage userToken（>8）判登录；/api/v0/users/current 取展示名 */
async function detectDeepseek(page) {
  const token = await page.evaluate(() => {
    const raw = localStorage.getItem('userToken') || sessionStorage.getItem('userToken') || '';
    if (!raw) return '';
    try { const j = JSON.parse(raw); return String(j.value || j.token || j.accessToken || raw || ''); } catch { return raw; }
  }).catch(() => '');
  const loggedIn = token.length > 8;
  let username = '';
  if (loggedIn) {
    username = await page.evaluate(async tk => {
      const fields = ['nickname', 'displayName', 'name', 'email', 'mobile', 'phone'];
      const walk = (o, d) => {
        if (!o || d > 4) return '';
        if (Array.isArray(o)) { for (const it of o) { const v = walk(it, d + 1); if (v) return v; } return ''; }
        if (typeof o === 'object') {
          for (const f of fields) { const v = o[f]; if (typeof v === 'string' && v.trim() && v.trim().length < 40 && !/^[0-9a-f]{32}$/i.test(v)) return v.trim(); }
          for (const k in o) { const v = walk(o[k], d + 1); if (v) return v; }
        }
        return '';
      };
      for (const u of ['/api/v0/users/current', '/api/v0/user/current', '/api/v0/users/me']) {
        try {
          const r = await fetch(u, { headers: { Authorization: 'Bearer ' + tk } });
          if (!r.ok) continue;
          const j = await r.json();
          const n = walk(j && j.data ? j.data : j, 0);
          if (n) return n;
        } catch { /* ignore */ }
      }
      return '';
    }, token).catch(() => '');
  }
  return { loggedIn, username };
}

/** 元宝：Cookie hy_user + hy_token(>20) 判登录；/api/getuserinfo 取展示名，兜底 hy_user */
async function detectYuanbao(page, context) {
  const cookies = await cookiesFor(context, 'https://yuanbao.tencent.com');
  const hyUser = pickCookie(cookies, ['hy_user']);
  const hyToken = pickCookie(cookies, ['hy_token']);
  const loggedIn = !!hyUser && hyToken.length > 20;
  let username = '';
  if (loggedIn) {
    username = await page.evaluate(async () => {
      const fields = ['nickname', 'nickName', 'wechatName', 'wxName', 'displayName'];
      const walk = (o, d) => {
        if (!o || d > 4) return '';
        if (Array.isArray(o)) { for (const it of o) { const v = walk(it, d + 1); if (v) return v; } return ''; }
        if (typeof o === 'object') {
          for (const f of fields) { const v = o[f]; if (typeof v === 'string' && v.trim() && v.trim().length < 40) return v.trim(); }
          for (const k in o) { const v = walk(o[k], d + 1); if (v) return v; }
        }
        return '';
      };
      for (const u of ['/api/getuserinfo', '/api/userinfo/getuserconfig', '/api/v5/accountLogic/login/accountList']) {
        try { const r = await fetch(u); if (!r.ok) continue; const j = await r.json(); const n = walk(j, 0); if (n) return n; } catch { /* ignore */ }
      }
      return '';
    }).catch(() => '');
    if (!username) username = hyUser; // 兜底（通常为用户 ID）
  }
  return { loggedIn, username };
}

/** 千问：Cookie tongyi_sso_ticket + tongyi_sso_ticket_hash 判登录；接口/DOM 取展示名，兜底 b-user-id */
async function detectQianwen(page, context) {
  const cookies = await cookiesFor(context, 'https://www.qianwen.com');
  const ticket = pickCookie(cookies, ['tongyi_sso_ticket']);
  const hash = pickCookie(cookies, ['tongyi_sso_ticket_hash']);
  const loggedIn = !!ticket && !!hash;
  let username = '';
  if (loggedIn) {
    username = await page.evaluate(async () => {
      const fields = ['nickname', 'nickName', 'userNick', 'userName', 'displayName', 'userNickName'];
      const walk = (o, d) => {
        if (!o || d > 4) return '';
        if (Array.isArray(o)) { for (const it of o) { const v = walk(it, d + 1); if (v) return v; } return ''; }
        if (typeof o === 'object') {
          for (const f of fields) { const v = o[f]; if (typeof v === 'string' && v.trim() && v.trim().length < 40) return v.trim(); }
          for (const k in o) { const v = walk(o[k], d + 1); if (v) return v; }
        }
        return '';
      };
      const entries = (performance.getEntriesByType('resource') || []).map(e => e.name);
      for (const u of entries) {
        if (!/qianwen\.com|tongyi\.com|tongyi\.aliyun\.com/i.test(u)) continue;
        if (!/user|profile|account|passport|member|info/i.test(u)) continue;
        try { const r = await fetch(u, { credentials: 'include' }); const j = await r.json(); const n = walk(j, 0); if (n) return n; } catch { /* ignore */ }
      }
      return '';
    }).catch(() => '');
    if (!username) username = pickCookie(cookies, ['b-user-id']);
  }
  return { loggedIn, username };
}

/** 文心一言：Cookie BDUSS/BDUSS_BFESS(>20) 判登录；aitabserver userinfo / DOM 取展示名，兜底 SAVEUSERID */
async function detectYiyan(page, context) {
  const cookies = await cookiesFor(context, 'https://wenxin.baidu.com');
  const bduss = pickCookie(cookies, ['BDUSS', 'BDUSS_BFESS']);
  const loggedIn = bduss.length > 20;
  let username = '';
  if (loggedIn) {
    username = await page.evaluate(async () => {
      const filter = s => {
        s = (s || '').trim();
        if (!s || s.length > 40) return '';
        if (/^(登录|注册|退出|百度|文心)/.test(s)) return '';
        return s;
      };
      try {
        const r = await fetch('/aichat/api/aitabserver?ctl=userinfo');
        const j = await r.json();
        const n = (j && j.userInfo && j.userInfo.name) || (j && j.user_name_show) || (j && j.uname);
        if (filter(n)) return filter(n);
      } catch { /* ignore */ }
      const sel = document.querySelector('.chat-aside-user-mask .cos-line-clamp-1');
      if (sel && filter(sel.textContent)) return filter(sel.textContent);
      return '';
    }).catch(() => '');
    if (!username) username = pickCookie(cookies, ['SAVEUSERID', 'SAVEUSERID_BFESS']);
  }
  return { loggedIn, username };
}

const DETECTORS = {
  doubao: detectDoubao,
  deepseek: detectDeepseek,
  yuanbao: detectYuanbao,
  qwen: detectQianwen,
  wenxin: detectYiyan,
};

/* ================= 响应监听兜底（打开 Tab 时挂） ================= */

const WATCH_PATTERNS = {
  doubao: { url: /doubao\.com/i, fields: ['nickname'] },
  deepseek: { url: /chat\.deepseek\.com/i, fields: ['nickname', 'displayName', 'name', 'email', 'mobile', 'phone'] },
  yuanbao: { url: /yuanbao\.tencent\.com/i, fields: ['nickname', 'nickName', 'wechatName', 'wxName', 'displayName'] },
  qwen: { url: /qianwen\.com|tongyi\.com|tongyi\.aliyun\.com/i, fields: ['nickname', 'nickName', 'userNick', 'userName', 'displayName', 'userNickName'] },
  wenxin: { url: /wenxin\.baidu\.com|yiyan\.baidu\.com|baidu\.com/i, fields: ['name', 'user_name_show', 'uname'] },
};

/** 挂 response 监听收集展示名（覆盖「页面自己请求用户信息」的导航窗口），返回 { promise, stop } */
function watchUsername(page, platformKey) {
  const cfg = WATCH_PATTERNS[platformKey];
  let stop = () => {};
  if (!cfg) return { promise: Promise.resolve(''), stop };
  let found = '';
  let resolveFn = () => {};
  const promise = new Promise(resolve => { resolveFn = resolve; });
  const handler = async resp => {
    if (found) return;
    try {
      const url = resp.url();
      if (!cfg.url.test(url)) return;
      const ct = resp.headers()['content-type'] || '';
      if (!/json/i.test(ct)) return;
      const body = await resp.json().catch(() => null);
      const n = extractUsername(body, cfg.fields);
      if (n) { found = n; cleanup(); resolveFn(n); }
    } catch { /* ignore */ }
  };
  const timer = setTimeout(() => { cleanup(); resolveFn(''); }, 2500);
  function cleanup() { page.off('response', handler); clearTimeout(timer); }
  stop = cleanup;
  page.on('response', handler);
  return { promise, stop };
}

/** 统一入口：检测某平台的登录态与展示名 */
async function detectAuth(page, context, platformKey) {
  const detector = DETECTORS[platformKey];
  if (!detector) return { loggedIn: false, username: '' };
  try {
    const res = await detector(page, context);
    return { loggedIn: !!res.loggedIn, username: res.username || '' };
  } catch {
    return { loggedIn: false, username: '' };
  }
}

module.exports = { detectAuth, watchUsername, pickCookie, cookiesFor };
