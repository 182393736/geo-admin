import { GEO_SITE } from '../../utils/geo-seo'

/** IndexNow 公钥文件：https://www.example.com/{key}.txt */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const key = String(config.indexNowKey || '')
  const siteUrl = String(config.public.siteUrl || GEO_SITE.defaultSiteUrl).replace(/\/+$/, '')

  if (!key) {
    throw createError({ statusCode: 404, statusMessage: 'IndexNow key not configured' })
  }

  // 动态路由：仅当路径等于 /{key}.txt 时由下面的 catch 或专用路由处理
  // 本文件作为 /indexnow-key.txt 备用；主公钥见 server/routes/[key].txt — 改用固定路径
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return key
})
