/** 首页和功能页以外的内容路由先不开放，文件保留，方便以后逐页加回。 */
import { GEO_FUNCTIONAL_SLUGS } from '~/utils/geo-hub'

export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.replace(/\/+$/, '') || '/'

  if (path === '/product') {
    return navigateTo({ path: '/tools', query: to.query, hash: to.hash }, { redirectCode: 301 })
  }
  const legacy = path.match(/^\/product\/([^/]+)$/)
  if (legacy) {
    return navigateTo(
      { path: `/tools/${legacy[1]}`, query: to.query, hash: to.hash },
      { redirectCode: 301 },
    )
  }

  if (path === '/' || path === '/diagnose' || path === '/login' || path === '/tools' || path === '/pricing' || path === '/contact') return
  const match = path.match(/^\/tools\/([^/]+)$/)
  if (match && (GEO_FUNCTIONAL_SLUGS as readonly string[]).includes(match[1])) return
  throw createError({ statusCode: 404, statusMessage: '页面不存在' })
})
