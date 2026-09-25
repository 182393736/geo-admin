import { buildLearnUrls, buildPublicUrls, siteBase, urlset } from '../utils/sitemap'

/** 首页 + 功能页 + 第 1 批 learn/glossary */
export default defineEventHandler((event) => {
  const siteUrl = siteBase(useRuntimeConfig())
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return urlset([...buildPublicUrls(siteUrl), ...buildLearnUrls(siteUrl)])
})
