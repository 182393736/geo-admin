/**
 * 官网 / 首登分析站（apps/gen-user-site，Nuxt）地址解析与登录态交接。
 *
 * 背景：用户后台（本应用 gen-user-dash）不再自建 /trial 页，
 * 首次品牌分析与「添加品牌」统一落到 Nuxt 站的 /trial。两站共用一套后端 JWT，
 * 通过 URL hash 交接 token（及新建 brand_id），避免二次登录：
 *  - 后台 → siteTrialUrl(token, { from:'add_brand' }) → `${站址}/trial?from=add_brand#token=...`
 *  - 站点完成分析 → 「前往控制台」以 #token=&brand_id= 回传 → ingestConsoleToken() 吸收
 */

export type SiteTrialOpts = { from?: 'add_brand' | string };

/** 跳转官网 /trial（携带 token；可选 from=add_brand） */
export function siteTrialUrl(token = '', opts: SiteTrialOpts = {}): string {
  // 生产同域（geo.timus.cn 下 /trial 与 /dashboard 同源）时置空；dev 分端口时填站点地址
  const base = String(import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '');
  let target = base ? `${base}/trial` : '/trial';
  if (opts.from) {
    target += `?from=${encodeURIComponent(opts.from)}`;
  }
  return token ? `${target}#token=${encodeURIComponent(token)}` : target;
}

/**
 * 吸收站点「前往控制台」带回的 token / brand_id（URL hash）。
 * 在 main.ts 挂载前调用一次，写入与登录接口一致的本站 localStorage，
 * 使路由守卫 / 鉴权 store 直接识别为已登录并切到新品牌；随后清除 hash 防泄漏。
 */
export function ingestConsoleToken(): void {
  try {
    const hash = window.location.hash || '';
    const tokenM = hash.match(/(?:^[#&]|[?&])token=([^&]+)/) || hash.match(/[#&]?token=([^&]+)/);
    const brandM = hash.match(/[#&]?brand_id=([^&]+)/);
    if (!tokenM && !brandM) return;

    if (tokenM) {
      const token = decodeURIComponent(tokenM[1]);
      if (token) {
        localStorage.setItem('geo_token', token);
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
      }
    }

    if (brandM) {
      const brandId = decodeURIComponent(brandM[1]);
      if (brandId) localStorage.setItem('geo_active_brand', brandId);
    }

    // 清除 URL 中的敏感 hash 参数
    const url = new URL(window.location.href);
    url.hash = url.hash
      .replace(/[?&]?token=[^&]*/g, '')
      .replace(/[?&]?brand_id=[^&]*/g, '')
      .replace(/^[#&]+/, '#')
      .replace(/^#$/, '');
    history.replaceState(null, '', url.pathname + url.search + (url.hash === '#' ? '' : url.hash));
  } catch {
    /* 隐私模式等极端情况忽略 */
  }
}
