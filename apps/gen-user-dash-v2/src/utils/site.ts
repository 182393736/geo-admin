/** 官网交接与 token 吸收（首登已迁入本应用 /trial） */

export type SiteTrialOpts = { from?: 'add_brand' | string }

/** @deprecated 首登在本应用 /trial；保留给外链兼容 */
export function siteTrialUrl(token = '', opts: SiteTrialOpts = {}): string {
  let target = '/trial'
  if (opts.from) target += `?from=${encodeURIComponent(opts.from)}`
  return token ? `${target}#token=${encodeURIComponent(token)}` : target
}

/** 吸收站点带回的 token / brand_id（URL hash） */
export function ingestConsoleToken(): void {
  try {
    const hash = window.location.hash || ''
    const tokenM = hash.match(/(?:^[#&]|[?&])token=([^&]+)/) || hash.match(/[#&]?token=([^&]+)/)
    const brandM = hash.match(/[#&]?brand_id=([^&]+)/)
    if (!tokenM && !brandM) return

    if (tokenM) {
      const token = decodeURIComponent(tokenM[1])
      if (token) {
        localStorage.setItem('geo_token', token)
        let id = ''
        let username = ''
        try {
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
          id = payload?.sub || ''
          username = payload?.name || ''
        } catch { /* ignore */ }
        localStorage.setItem('geo_user', JSON.stringify({ id, username }))
      }
    }

    if (brandM) {
      const brandId = decodeURIComponent(brandM[1])
      if (brandId) localStorage.setItem('geo_active_brand', brandId)
    }

    const url = new URL(window.location.href)
    url.hash = url.hash
      .replace(/[?&]?token=[^&]*/g, '')
      .replace(/[?&]?brand_id=[^&]*/g, '')
      .replace(/^[#&]+/, '#')
      .replace(/^#$/, '')
    history.replaceState(null, '', url.pathname + url.search + (url.hash === '#' ? '' : url.hash))
  } catch { /* ignore */ }
}
