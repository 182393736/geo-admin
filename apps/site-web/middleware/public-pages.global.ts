/** 生产对外路由白名单：未列入的内容页 404（文件保留，便于逐批开放）。 */
import { isPublicContentPath } from '~/utils/geo-hub'

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

  if (path === '/login') {
    return navigateTo(
      { path: '/', query: { ...to.query, auth: '1' }, hash: to.hash },
      { redirectCode: 301 },
    )
  }

  if (isPublicContentPath(path)) return
  throw createError({ statusCode: 404, statusMessage: '页面不存在' })
})
