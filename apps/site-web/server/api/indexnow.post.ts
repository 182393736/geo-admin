import { GEO_SITE } from '../../utils/geo-seo'

/**
 * IndexNow：向 Bing 等引擎提交 URL 变更。
 * POST { urls: string[] } 或 { url: string }
 * 密钥：NUXT_INDEXNOW_KEY；公钥文件：/{key}.txt
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const key = String(config.indexNowKey || '')
  if (!key) {
    throw createError({
      statusCode: 503,
      statusMessage: 'IndexNow 未配置：请设置 NUXT_INDEXNOW_KEY',
    })
  }

  const body = await readBody<{ url?: string; urls?: string[] }>(event).catch(() => ({}))
  const siteUrl = String(config.public.siteUrl || GEO_SITE.defaultSiteUrl).replace(/\/+$/, '')
  const host = new URL(siteUrl).host
  const urls = [
    ...(body?.url ? [body.url] : []),
    ...(Array.isArray(body?.urls) ? body.urls : []),
  ]
    .map((u) => String(u).trim())
    .filter(Boolean)
    .map((u) => (u.startsWith('http') ? u : `${siteUrl}${u.startsWith('/') ? u : `/${u}`}`))

  if (!urls.length) {
    throw createError({ statusCode: 400, statusMessage: '请提供 url 或 urls' })
  }

  const keyLocation = `${siteUrl}/indexnow-key.txt`
  const payload = {
    host,
    key,
    keyLocation,
    urlList: urls.slice(0, 100),
  }

  try {
    const res = await $fetch.raw('https://api.indexnow.org/indexnow', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
    return {
      ok: true,
      status: res.status,
      submitted: payload.urlList.length,
      keyLocation,
    }
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'IndexNow 提交失败',
      data: { submitted: payload.urlList.length },
    })
  }
})
