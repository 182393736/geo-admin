import type {
  HubColumnContent,
  HubHomeContent,
  HubPricingContent,
  HubContactContent,
  PageData,
  PageKind,
} from '@site-manage/shared'

/** 从 CMS PageData 解析首页正文；无效则 null */
export function asHomeContent(page?: PageData | null): HubHomeContent | null {
  if (!page || page.pageKind !== 'home' || !page.hubContent) return null
  const hub = page.hubContent as HubHomeContent
  if (!hub.hero?.title) return null
  return hub
}

/** 从 CMS PageData 解析栏目页正文 */
export function asHubColumnContent(page?: PageData | null): HubColumnContent | null {
  if (!page || page.pageKind !== 'hub' || !page.hubContent) return null
  const hub = page.hubContent as HubColumnContent
  if (!hub.title) return null
  return hub
}

const DETAIL_KINDS = new Set([
  'learn',
  'glossary',
  'insight',
  'report',
  'product',
  'solution',
  'compare',
])

/** learn / glossary / report … 结构化详情 */
export function asStructuredContent(
  page?: PageData | null,
): { pageKind: PageKind; content: Record<string, unknown> } | null {
  if (!page?.pageKind || !page.hubContent) return null
  if (!DETAIL_KINDS.has(page.pageKind)) return null
  return {
    pageKind: page.pageKind as PageKind,
    content: page.hubContent as Record<string, unknown>,
  }
}

/** 价格页（pageKind=pricing） */
export function asPricingContent(page?: PageData | null): HubPricingContent | null {
  if (!page || page.pageKind !== 'pricing' || !page.hubContent) return null
  const hub = page.hubContent as HubPricingContent
  if (!hub.title) return null
  return hub
}

/** 联系我们（pageKind=contact） */
export function asContactContent(page?: PageData | null): HubContactContent | null {
  if (!page || page.pageKind !== 'contact' || !page.hubContent) return null
  const hub = page.hubContent as HubContactContent
  if (!hub.title) return null
  return hub
}

export function cmsPageKind(page?: PageData | null): PageKind | null {
  return (page?.pageKind as PageKind) || null
}

/**
 * 扩展约定：新 pageKind 在此登记「是否由 CMS 结构化驱动」。
 */
export const CMS_STRUCTURED_KINDS: PageKind[] = [
  'home',
  'hub',
  'learn',
  'report',
  'glossary',
  'insight',
  'solution',
  'product',
  'compare',
  'pricing',
  'contact',
]
