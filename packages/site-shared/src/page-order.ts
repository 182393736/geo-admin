/** 页面文档的固定字段顺序。表单和 JSON 都按这个顺序展示，方便跨页对照。 */

import { FLAGSHIP_MODULE_KEYS, getModuleFields } from './flagship-modules'

const PAGE_KEYS = [
  'title',
  'path',
  'parentId',
  'sort',
  'visible',
  'template',
  'pageKind',
  'status',
  'seo',
  'schema',
  ...FLAGSHIP_MODULE_KEYS,
]

const ORDERS: Record<string, string[]> = {
  page: PAGE_KEYS,
  seo: [ 'title', 'description', 'keywords', 'ogImage', 'canonical' ],
  schema: [
    'visible', 'schemaType', 'name', 'headline', 'description', 'image', 'url',
    'author', 'publisher', 'datePublished', 'dateModified', 'inLanguage',
    'keywords', 'mainEntityOfPage',
  ],
  rich: [ 'text', 'key', 'br' ],
  stat: [ 'value', 'unit', 'label' ],
  flagshipStep: [ 'n', 'title', 'sub', 'body' ],
  tableRow: [ 'q', 'cells' ],
  cell: [ 't', 'miss' ],
  pair: [ 'b', 's' ],
  effect: [ 'title', 'path', 'text' ],
  monitor: [ 'title', 'text', 'to' ],
  titled: [ 'title', 'text' ],
  link: [ 'to', 'label' ],
  action: [ 'to', 'label', 'kind' ],
  rail: [ 'kicker', 'title', 'text', 'to', 'cta' ],
  channelItem: [ 'name', 'note' ],
  bit: [ 'k', 'v' ],
  draft: [ 'h', 'p', 'items' ],
  manuscript: [ 'bar', 'h', 'p', 'factLabel', 'fact', 'items' ],
  faqItem: [ 'q', 'a' ],
}

for (const key of FLAGSHIP_MODULE_KEYS) {
  ORDERS[key] = [ 'visible', ...getModuleFields(key) ]
}

const RICH_KEYS = new Set([
  'heroTitle', 'heroLead', 'heroTrust', 'loopTitle', 'loopDeck',
  'effectsTitle', 'watchTitle', 'watchDeck', 'writeTitle', 'writeDeck',
  'citeTitle', 'citeDeck', 'sampleTitle', 'channelTitle', 'diagTitle', 'inviteTitle',
])

const META_FIRST = [ '_id', 'siteId' ]
const META_LAST = [ 'createdAt', 'updatedAt', '__v' ]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function childHint(parent: string, key: string) {
  if (parent === 'page') {
    if (key === 'seo' || key === 'schema') return key
    if ((FLAGSHIP_MODULE_KEYS as readonly string[]).includes(key)) return key
  }
  if ((FLAGSHIP_MODULE_KEYS as readonly string[]).includes(parent)) {
    if (RICH_KEYS.has(key)) return 'rich'
    if (key === 'stats') return 'stat'
    if (key === 'steps') return 'flagshipStep'
    if (key === 'tableRows') return 'tableRow'
    if (key === 'advice' || key === 'publish' || key === 'attrib') return 'pair'
    if (key === 'effects') return 'effect'
    if (key === 'monitors') return 'monitor'
    if (key === 'agentSteps' || key === 'citeDims') return 'titled'
    if (key === 'writeLinks' || key === 'citeMore' || key === 'channelMore' || key === 'agencyMore') return 'link'
    if (key === 'diagLinks' || key === 'inviteLinks') return 'action'
    if (key === 'rails') return 'rail'
    if (key === 'channels') return 'channelItem'
    if (key === 'reportBits') return 'bit'
    if (key === 'draft') return 'draft'
    if (key === 'manuscript') return 'manuscript'
    if (key === 'faqs') return 'faqItem'
  }
  if (parent === 'tableRow' && key === 'cells') return 'cell'
  return ''
}

function orderValue(value: unknown, hint: string): unknown {
  if (Array.isArray(value)) return value.map(item => orderValue(item, hint))
  if (!isPlainObject(value)) return value

  let src = value
  if (hint === 'hero') {
    src = { ...src }
    if (!('startPlaceholder' in src)) src.startPlaceholder = ''
    if (!('startFill' in src)) src.startFill = ''
    if (!('startButton' in src)) src.startButton = ''
    if (!('startChips' in src)) src.startChips = []
    if (!('visible' in src)) src.visible = true
  } else if ((FLAGSHIP_MODULE_KEYS as readonly string[]).includes(hint) || hint === 'schema') {
    src = { ...src }
    if (!('visible' in src)) src.visible = true
  }

  const preferred = ORDERS[hint] || []
  const seen = new Set<string>()
  const keys: string[] = []
  for (const key of preferred) {
    if (key in src) {
      keys.push(key)
      seen.add(key)
    }
  }
  for (const key of Object.keys(src)) {
    if (!seen.has(key)) keys.push(key)
  }

  const out: Record<string, unknown> = {}
  for (const key of keys) out[key] = orderValue(src[key], childHint(hint, key))
  return out
}

/** 重排页面文档。已有字段保持原值。 */
export function orderPageDoc<T>(doc: T): T {
  if (!isPlainObject(doc)) return doc
  const ordered = orderValue(doc, 'page') as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of META_FIRST) if (key in ordered) out[key] = ordered[key]
  for (const key of Object.keys(ordered)) {
    if (META_FIRST.includes(key) || META_LAST.includes(key)) continue
    out[key] = ordered[key]
  }
  for (const key of META_LAST) if (key in ordered) out[key] = ordered[key]
  return out as T
}
