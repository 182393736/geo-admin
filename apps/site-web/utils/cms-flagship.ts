import type { PageData } from '@site-manage/shared'
import type { FlagshipPage } from '~/utils/content/geo-flagship'

/** 后台旗舰页：平铺模块拼成 FlagshipPage；旧 hubContent 仍可读。 */
export type CmsFlagshipBundle = {
  flagship: FlagshipPage
  seo: { title: string; description: string; keywords: string }
  faqs: { q: string; a: string }[]
  dateModified?: string
}

const MODULE_FIELDS: Record<string, string[]> = {
  hero: [
    'consolePath', 'startPlaceholder', 'startFill', 'startButton', 'startChips', 'insightSlugs',
    'heroTitle', 'heroLead', 'heroTrust', 'stats',
  ],
  workflow: [
    'loopTitle', 'loopDeck', 'tabsLabel', 'windowBrand', 'windowPill', 'steps',
    'tableHead', 'tableRows', 'advice', 'draft', 'publish', 'attrib',
  ],
  effects: [ 'effectsTitle', 'effectsDeck', 'effects' ],
  watch: [ 'watchTitle', 'watchDeck', 'monitors', 'panelK', 'panelItems', 'panelFoot' ],
  write: [ 'writeTitle', 'writeDeck', 'agentSteps', 'writeLinks', 'manuscript' ],
  cite: [ 'citeTitle', 'citeDeck', 'citeDims', 'sampleK', 'sampleTitle', 'sampleNote', 'citeMore' ],
  channel: [ 'channelTitle', 'channelDeck', 'channels', 'channelFine', 'channelMore' ],
  diagnosis: [
    'diagTitle', 'diagDeck', 'reportBits', 'diagLinks',
    'agencyTitle', 'agencyText', 'agencyMore',
  ],
  rails: [ 'railsTitle', 'rails' ],
  invite: [ 'inviteTitle', 'inviteText', 'inviteLinks' ],
  posts: [ 'postsTitle', 'postsDeck', 'postsMore' ],
  faq: [ 'faqTitle', 'faqDeck', 'faqs' ],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isFlagshipPage(value: unknown): value is FlagshipPage {
  if (!isRecord(value)) return false
  return Array.isArray(value.heroTitle) && Array.isArray(value.faqs) && Array.isArray(value.steps)
}

function modulesToFlagship(doc: Record<string, unknown>): FlagshipPage | null {
  if (!isRecord(doc.hero) || !Array.isArray(doc.hero.heroTitle)) return null
  const page: Record<string, unknown> = {}
  for (const [ modKey, fields ] of Object.entries(MODULE_FIELDS)) {
    const mod = doc[modKey]
    if (!isRecord(mod)) continue
    for (const field of fields) {
      if (field in mod) page[field] = mod[field]
    }
  }
  return isFlagshipPage(page) ? page : null
}

function seoFrom(page?: PageData | null) {
  return {
    title: page?.seo?.title || page?.header?.metaTitle || '',
    description: page?.seo?.description || page?.header?.metaDescription || '',
    keywords: page?.seo?.keywords || page?.header?.metaKeywords || '',
  }
}

/** 已发布旗舰页：优先读平铺模块，其次旧 hubContent。否则返回 null。 */
export function readCmsFlagship(page?: PageData | null): CmsFlagshipBundle | null {
  if (!page) return null

  const flat = modulesToFlagship(page as unknown as Record<string, unknown>)
  if (flat) {
    return {
      flagship: flat,
      seo: seoFrom(page),
      faqs: flat.faqs,
      dateModified: page.schema?.dateModified || page.start?.dateModified || undefined,
    }
  }

  const hub = page.hubContent as { layout?: string; page?: unknown } | null | undefined
  if (!hub || hub.layout !== 'flagship' || !isFlagshipPage(hub.page)) return null

  return {
    flagship: hub.page,
    seo: seoFrom(page),
    faqs: hub.page.faqs,
    dateModified: page.schema?.dateModified || page.start?.dateModified || undefined,
  }
}
