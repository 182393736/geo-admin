import type { SitePagePayload, ApiResponse } from '@site-manage/shared'

/**
 * 服务端调用后台 SSR 接口，按域名 + 路径获取页面数据
 */
export async function fetchSitePage(
  domain: string,
  path: string
): Promise<SitePagePayload | null> {
  const config = useRuntimeConfig()
  const apiBase = config.apiBase || config.public.apiBase

  try {
    const res = await $fetch<ApiResponse<SitePagePayload>>(`${apiBase}/api/ssr/page`, {
      query: { domain, path },
    })
    if (res.code !== 0 || !res.data) return null
    return res.data
  } catch {
    return null
  }
}

/**
 * 从请求头解析访问域名
 */
export function resolveDomain(host?: string | null): string {
  if (!host) return 'localhost'
  return host.split(':')[0].toLowerCase()
}
