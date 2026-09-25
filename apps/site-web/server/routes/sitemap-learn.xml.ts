import { buildLearnUrls, siteBase, urlset } from '../utils/sitemap'

/** 第 1 批已开放的 learn + glossary */
export default defineEventHandler((event) => {
  const siteUrl = siteBase(useRuntimeConfig())
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return urlset(buildLearnUrls(siteUrl))
})
