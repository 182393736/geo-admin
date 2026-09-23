/** 官网交接与 token 吸收（首登已迁入本应用 /trial） */

import { takeAuthHandoff } from './auth-handoff'

export type SiteTrialOpts = { from?: 'add_brand' | string }

/** @deprecated 首登在本应用 /trial；保留给外链兼容 */
export function siteTrialUrl(token = '', opts: SiteTrialOpts = {}): string {
  let target = '/trial'
  if (opts.from) target += `?from=${encodeURIComponent(opts.from)}`
  // 不再把 JWT 放进 URL；同应用内跳转直接读 localStorage 即可
  void token
  return target
}

function applyToken(token: string): void {
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

function stripHandoffFromUrl(): void {
  const hash = window.location.hash || ''
  if (!hash.includes('token=') && !hash.includes('brand_id=')) return
  const url = new URL(window.location.href)
  url.hash = url.hash
    .replace(/[?&]?token=[^&]*/g, '')
    .replace(/[?&]?brand_id=[^&]*/g, '')
    .replace(/^[#&]+/, '#')
    .replace(/^#$/, '')
  history.replaceState(null, '', url.pathname + url.search + (url.hash === '#' ? '' : url.hash))
}

/**
 * 吸收站点带回的登录态。
 * 优先 window.name（地址栏无 token）；兼容旧链接 #token= / #brand_id=。
 */
export function ingestConsoleToken(): void {
  try {
    const handoff = takeAuthHandoff()
    if (handoff?.token) applyToken(handoff.token)
    if (handoff?.brandId) localStorage.setItem('geo_active_brand', handoff.brandId)

    const hash = window.location.hash || ''
    const tokenM = hash.match(/(?:^[#&]|[?&])token=([^&]+)/) || hash.match(/[#&]?token=([^&]+)/)
    const brandM = hash.match(/[#&]?brand_id=([^&]+)/)

    if (tokenM && !handoff?.token) {
      const token = decodeURIComponent(tokenM[1])
      if (token) applyToken(token)
    }
    if (brandM && !handoff?.brandId) {
      const brandId = decodeURIComponent(brandM[1])
      if (brandId) localStorage.setItem('geo_active_brand', brandId)
    }

    stripHandoffFromUrl()
  } catch { /* ignore */ }
}
