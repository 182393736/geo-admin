/**
 * 官网 / 首登分析站（apps/gen-user-site，Nuxt）地址解析与登录态交接。
 *
 * 背景：用户后台（本应用 gen-user-dash）不再自建 /trial 页，
 * 首次品牌分析统一落到 Nuxt 站的 /trial。两站共用一套后端 JWT，
 * 通过 URL hash 交接 token，避免二次登录：
 *  - 后台无品牌 → siteTrialUrl(token) → `${站址}/trial#token=...`（hash 不进服务器日志）
 *  - 站点完成分析 → 「前往控制台」同样以 #token= 回传 → ingestConsoleToken() 吸收
 */

/** 用户后台无品牌时跳转到官网 /trial 的完整地址（携带 token 免二次登录） */
export function siteTrialUrl(token = ''): string {
  // 生产同域（geo.timus.cn 下 /trial 与 /dashboard 同源）时置空；dev 分端口时填站点地址
  const base = String(import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '');
  const target = base ? `${base}/trial` : '/trial';
  return token ? `${target}#token=${encodeURIComponent(token)}` : target;
}

/**
 * 吸收站点「前往控制台」带回的 token（URL hash #token=...）。
 * 在 main.ts 挂载前调用一次，写入与登录接口一致的本站 localStorage，
 * 使路由守卫 / 鉴权 store 直接识别为已登录；随后清除 hash 防泄漏。
 */
export function ingestConsoleToken(): void {
  try {
    const m = window.location.hash.match(/[#&]?token=([^&]+)/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    if (!token) return;

    localStorage.setItem('geo_token', token);

    // 从 JWT 解出账号信息（apps/gen-api sign 载荷 { sub, jti, name }），
    // 与 auth store 期望的 { id, username } 对齐
    let id = '';
    let username = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      id = payload?.sub || '';
      username = payload?.name || '';
    } catch {
      /* 非标准 JWT，忽略 */
    }
    localStorage.setItem('geo_user', JSON.stringify({ id, username }));

    // 清除 URL 中的 token，避免刷新 / 分享时重复使用
    const url = new URL(window.location.href);
    url.hash = url.hash.replace(/[?&]?token=[^&]*/g, '');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch {
    /* 隐私模式等极端情况忽略 */
  }
}
