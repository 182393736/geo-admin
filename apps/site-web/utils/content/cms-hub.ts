import type { HubKindPayload, HubReportContent, PageData, PageKind, ApiResponse } from '@site-manage/shared'

/** 从运行时配置解析旗舰 CMS 域名 */
export function resolveHubCmsDomain(): string {
  const config = useRuntimeConfig()
  try {
    return new URL(String(config.public.siteUrl || 'http://localhost:5003')).hostname
  } catch {
    return 'localhost'
  }
}

export async function fetchHubByKind(pageKind: PageKind, domain?: string): Promise<PageData[]> {
  const config = useRuntimeConfig()
  const apiBase = config.apiBase || config.public.apiBase
  const d = domain || resolveHubCmsDomain()
  try {
    const res = await $fetch<ApiResponse<HubKindPayload>>(`${apiBase}/api/ssr/hub`, {
      query: { domain: d, pageKind },
    })
    if (res.code !== 0 || !res.data?.pages) return []
    return res.data.pages
  } catch {
    return []
  }
}

export function pageToReport(page: PageData): HubReportContent | null {
  const hub = page.hubContent as HubReportContent | undefined
  if (!hub || typeof hub !== 'object') return null
  const slug =
    hub.slug ||
    String(page.path || '')
      .replace(/^\/reports\/?/, '')
      .replace(/\/$/, '') ||
    ''
  if (!slug) return null
  return {
    ...hub,
    slug,
    title: hub.title || page.title,
    description: hub.description || page.seo?.description || '',
    datePublished: hub.datePublished || page.start?.datePublished || '',
    dateModified: hub.dateModified || page.start?.dateModified || '',
    method: hub.method || '',
    engines: hub.engines || [],
    sections: hub.sections || [],
  }
}

/** CMS 报告覆盖静态：同 slug 以 CMS 为准，其余追加 */
export function mergeReports(
  staticReports: HubReportContent[],
  cmsPages: PageData[],
): HubReportContent[] {
  const fromCms = cmsPages
    .map(pageToReport)
    .filter((r): r is HubReportContent => !!r && !!r.slug)
  const bySlug = new Map<string, HubReportContent>()
  for (const r of staticReports) bySlug.set(r.slug, r)
  for (const r of fromCms) bySlug.set(r.slug, r)
  return Array.from(bySlug.values()).sort((a, b) =>
    String(b.dateModified || '').localeCompare(String(a.dateModified || '')),
  )
}
