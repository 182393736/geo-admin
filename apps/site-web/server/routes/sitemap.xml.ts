import { buildPublicUrls, siteBase, urlset } from '../utils/sitemap'

/** 目前只公开首页和功能页 */
export default defineEventHandler((event) => {
  const siteUrl = siteBase(useRuntimeConfig())
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return urlset(buildPublicUrls(siteUrl))
})
