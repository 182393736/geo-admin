import { buildLearnUrls, buildPublicUrls, buildReportsUrls, siteBase, urlset } from '../utils/sitemap'

/** 首页 + 功能页 + 已开放 learn/glossary + 公开方法报告 */
export default defineEventHandler((event) => {
  const siteUrl = siteBase(useRuntimeConfig())
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return urlset([
    ...buildPublicUrls(siteUrl),
    ...buildLearnUrls(siteUrl),
    ...buildReportsUrls(siteUrl),
  ])
})
