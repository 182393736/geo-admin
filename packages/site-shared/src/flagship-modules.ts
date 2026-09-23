/** 旗舰页正文按页面从上到下平铺的模块。每个模块自带 visible，不再套 hubContent / 重复 qa。 */

export const FLAGSHIP_MODULE_KEYS = [
  'hero',
  'workflow',
  'effects',
  'watch',
  'write',
  'cite',
  'channel',
  'diagnosis',
  'rails',
  'invite',
  'posts',
  'faq',
] as const

export type FlagshipModuleKey = (typeof FLAGSHIP_MODULE_KEYS)[number]

const MODULE_FIELDS: Record<FlagshipModuleKey, string[]> = {
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

/** 旧 tabVisible → 模块 visible */
const TAB_TO_MODULE: Partial<Record<string, FlagshipModuleKey>> = {
  hero: 'hero',
  steps: 'workflow',
  qa: 'faq',
  posts: 'posts',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function pick(src: Record<string, unknown>, keys: string[]) {
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    if (key in src) out[key] = src[key]
  }
  return out
}

/** 把扁平的 FlagshipPage 拆成按页顺序的模块。 */
export function flagshipToModules(
  page: Record<string, unknown>,
  tabVisible?: Record<string, unknown> | null,
) {
  const modules: Record<string, Record<string, unknown>> = {}
  for (const key of FLAGSHIP_MODULE_KEYS) {
    const visibleKey = Object.entries(TAB_TO_MODULE).find(([, mod]) => mod === key)?.[0]
    const visible = visibleKey && tabVisible
      ? tabVisible[visibleKey] !== false
      : true
    modules[key] = { visible, ...pick(page, MODULE_FIELDS[key]) }
  }
  return modules
}

/** 从页面文档拼回 FlagshipPage 形状，给前台渲染用。 */
export function modulesToFlagship(doc: Record<string, unknown>): Record<string, unknown> | null {
  if (!isRecord(doc.hero) || !Array.isArray(doc.hero.heroTitle)) return null
  const page: Record<string, unknown> = {}
  for (const key of FLAGSHIP_MODULE_KEYS) {
    const mod = doc[key]
    if (!isRecord(mod)) continue
    for (const field of MODULE_FIELDS[key]) {
      if (field in mod) page[field] = mod[field]
    }
  }
  if (!Array.isArray(page.faqs) || !Array.isArray(page.steps)) return null
  return page
}

export function isFlatFlagshipDoc(doc: unknown): doc is Record<string, unknown> {
  return isRecord(doc) && isRecord(doc.hero) && Array.isArray(doc.hero.heroTitle)
}

export function getModuleFields(key: FlagshipModuleKey) {
  return MODULE_FIELDS[key]
}

/** 旧 hubContent.page + 外围字段 → 扁平文档片段（不含 _id/siteId）。 */
export function flattenLegacyFlagshipPage(doc: Record<string, unknown>) {
  const hub = doc.hubContent as { layout?: string; page?: Record<string, unknown> } | null | undefined
  const page = hub?.layout === 'flagship' && isRecord(hub.page) ? hub.page : null
  if (!page) return null

  const tabVisible = isRecord(doc.tabVisible) ? doc.tabVisible : null
  const modules = flagshipToModules(page, tabVisible)

  const seo = isRecord(doc.seo) ? { ...doc.seo } : {}
  const header = isRecord(doc.header) ? doc.header : null
  if (header) {
    if (!seo.title && header.metaTitle) seo.title = header.metaTitle
    if (!seo.description && header.metaDescription) seo.description = header.metaDescription
    if (!seo.keywords && header.metaKeywords) seo.keywords = header.metaKeywords
    if (header.canonical) seo.canonical = header.canonical
  }

  const start = isRecord(doc.start) ? doc.start : {}
  const schema = {
    visible: tabVisible ? tabVisible.start !== false : true,
    ...start,
  }

  return {
    title: doc.title,
    path: doc.path,
    parentId: doc.parentId ?? null,
    sort: doc.sort ?? 0,
    visible: doc.visible !== false,
    template: doc.template || 'flagship',
    pageKind: doc.pageKind || 'product',
    status: doc.status || 'published',
    seo,
    schema,
    ...modules,
  }
}
