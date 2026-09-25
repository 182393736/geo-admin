import { buildReportsUrls, siteBase, urlset } from '../utils/sitemap'

/** 已开放的方法报告 */
export default defineEventHandler((event) => {
  const siteUrl = siteBase(useRuntimeConfig())
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return urlset(buildReportsUrls(siteUrl))
})
