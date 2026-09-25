/** GEO 流量站 IA、内容骨架与 Host 分流 */

import { visibilityFaqs } from './content/geo-flagship'
import { KEYWORD_PAGE_META } from './content/geo-flagship-keywords'
import { GEO_GLOSSARY_EXTENDED, type GlossaryTerm } from './content/glossary'
import {
  GEO_REPORTS_EXTENDED,
  GEO_BENCHMARKS_EXTENDED,
  GEO_ENGINES_DOC_EXTENDED,
  type HubReport,
} from './content/authority'

export type { GlossaryTerm, HubReport }

export const GEO_FLAGSHIP_HOSTS = [
  'geo.hanyuai.com',
  'www.geo.hanyuai.com',
  'www.hanyuai.com',
  'hanyuai.com',
  'localhost',
  '127.0.0.1',
] as const

/** 显式 GEO 路由前缀：不走客户站 CMS SSR */
export const GEO_HUB_PREFIXES = [
  '/tools',
  '/learn',
  '/insights',
  '/glossary',
  '/reports',
  '/benchmarks',
  '/engines',
  '/changelog',
  '/solutions',
  '/integrations',
  '/partners',
  '/customers',
  '/compare',
  '/diagnose',
  '/pricing',
  '/contact',
  '/demo',
  '/about',
  '/security',
  '/privacy',
  '/terms',
  '/dev',
] as const

export function isGeoHubPath(path: string): boolean {
  if (path === '/' || path === '') return true
  return GEO_HUB_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
}

export function isFlagshipHost(host?: string | null): boolean {
  if (!host) return true
  const domain = host.split(':')[0].toLowerCase()
  const configHosts = GEO_FLAGSHIP_HOSTS as readonly string[]
  if (configHosts.includes(domain)) return true
  // 允许通过 siteUrl 配置的主机
  return false
}

export function isFlagshipHostWithSiteUrl(host: string | null | undefined, siteUrl: string): boolean {
  if (isFlagshipHost(host)) return true
  try {
    const u = new URL(siteUrl)
    const domain = (host || '').split(':')[0].toLowerCase()
    return domain === u.hostname.toLowerCase()
  } catch {
    return isFlagshipHost(host)
  }
}

export type GeoNavItem = { label: string; to: string; children?: { label: string; to: string }[] }

export const GEO_FUNCTIONAL_SLUGS = [
  'visibility',
  'competitor',
  'ranking',
  'status',
  'industry',
  'reputation',
  'opinion',
  'geo-search',
  'geo-promo',
  'publish-platform',
  'citation',
  'sentiment',
  'optimize',
  'agent',
  'diagnosis',
  'brand',
  'report',
  'source-preference',
  'source-intel',
  'questions',
  'recognition',
  'snapshots',
  'products',
  'wiki',
  'rivals',
  'publish',
  'records',
  'tracking',
  'articles',
  'pricing',
] as const

/** 对外内容只保留首页、功能页，以及第 1 批学习/术语（其余路由 404，文件保留便于逐批加回）。 */
export const PUBLIC_LEARN_SLUGS = [
  'what-is-geo',
  'geo-vs-seo-deep-dive',
  'geo-metrics',
  'ai-engines',
  'citation-strategy',
  'measurement',
] as const

export const PUBLIC_GLOSSARY_SLUGS = [
  'geo',
  'generative-engine-optimization',
  'ai-visibility',
  'mention-rate',
  'citation-source',
  'brand-entity',
  'llms-txt',
] as const

/** 第 2 批起步：只开 1 份可复核方法报告（非排行榜） */
export const PUBLIC_REPORT_SLUGS = [
  'ai-visibility-baseline-2026-q3',
] as const

export function isPublicContentPath(path: string) {
  const normalized = path.replace(/\/+$/, '') || '/'
  if (
    normalized === '/'
    || normalized === '/diagnose'
    || normalized === '/tools'
    || normalized === '/pricing'
    || normalized === '/contact'
    || normalized === '/learn'
    || normalized === '/glossary'
    || normalized === '/reports'
  ) {
    return true
  }
  const tools = normalized.match(/^\/tools\/([^/]+)$/)
  if (tools && (GEO_FUNCTIONAL_SLUGS as readonly string[]).includes(tools[1])) return true
  const learn = normalized.match(/^\/learn\/([^/]+)$/)
  if (learn && (PUBLIC_LEARN_SLUGS as readonly string[]).includes(learn[1])) return true
  const gloss = normalized.match(/^\/glossary\/([^/]+)$/)
  if (gloss && (PUBLIC_GLOSSARY_SLUGS as readonly string[]).includes(gloss[1])) return true
  const report = normalized.match(/^\/reports\/([^/]+)$/)
  if (report && (PUBLIC_REPORT_SLUGS as readonly string[]).includes(report[1])) return true
  return false
}

export const GEO_PRIMARY_NAV: GeoNavItem[] = [
  {
    label: 'GEO工具',
    to: '/tools',
    children: [
      { label: 'AI 可见性监测', to: '/tools/visibility' },
      { label: '引用源分析', to: '/tools/citation' },
      { label: '信源平台偏好', to: '/tools/source-preference' },
      { label: '引用源洞察', to: '/tools/source-intel' },
      { label: '监控问题管理', to: '/tools/questions' },
      { label: '监控识别管理', to: '/tools/recognition' },
      { label: 'AI 搜索快照', to: '/tools/snapshots' },
      { label: 'AI 口碑', to: '/tools/sentiment' },
      { label: 'GEO 报告', to: '/tools/report' },
      { label: '发布稿件', to: '/tools/publish' },
      { label: '发稿记录', to: '/tools/records' },
      { label: '稿件追踪', to: '/tools/tracking' },
      { label: 'GEO Agent', to: '/tools/agent' },
      { label: '稿件库', to: '/tools/articles' },
      { label: '品牌实体', to: '/tools/brand' },
      { label: '产品矩阵', to: '/tools/products' },
      { label: '品牌知识库', to: '/tools/wiki' },
      { label: '竞品名单', to: '/tools/rivals' },
      { label: 'GEO 套餐', to: '/tools/pricing' },
    ],
  },
  {
    label: 'GEO品牌',
    to: '/tools/diagnosis',
    children: [
      { label: '品牌现状', to: '/tools/status' },
      { label: '竞品分析', to: '/tools/competitor' },
      { label: '品牌排行', to: '/tools/ranking' },
      { label: '行业数据分析', to: '/tools/industry' },
      { label: '品牌口碑', to: '/tools/reputation' },
      { label: '舆情监控', to: '/tools/opinion' },
      { label: 'GEO搜索', to: '/tools/geo-search' },
      { label: 'GEO推广', to: '/tools/geo-promo' },
    ],
  },
  { label: 'GEO优化', to: '/tools/optimize' },
  { label: '发稿平台', to: '/tools/publish-platform' },
  { label: '价格', to: '/pricing' },
  { label: '联系我们', to: '/contact' },
]

export type HubPageFaq = { q: string; a: string }

export type HubProductPage = {
  slug: string
  title: string
  description: string
  keywords: string
  consolePath: string
  definition: string
  metrics: string[]
  usage: string[]
  faq: HubPageFaq[]
}

export const GEO_PRODUCT_PAGES: HubProductPage[] = [
  {
    slug: '',
    title: 'GEO工具｜免费看品牌在 AI 回答里的表现',
    description:
      'GEO工具汇总可见性监测、GEO品牌、品牌现状、竞品分析、品牌排行、行业数据分析、品牌口碑、舆情监控、GEO搜索、GEO推广、发稿平台、GEO优化、引用源与口碑等能力。选一个工具，输入品牌就能开始。',
    keywords: 'GEO工具,免费GEO工具,GEO平台,AI搜索可见性,生成式引擎优化',
    consolePath: '/dashboard/brand-library',
    definition:
      'GEO工具帮你弄清：用户问 AI 时，品牌有没有被提到、说得对不对、引用了谁，以及下一步该怎么补。',
    metrics: ['有没有被提到', '排在什么位置', '引用了哪些页面', '和竞品差在哪', '介绍是否过时', '下一篇该补什么'],
    usage: [
      '先挑一个工具，或从 GEO品牌 开始',
      '输入品牌名称或官网',
      '看清 AI 现在怎么说你',
      '再到 GEO优化 补上被漏掉的内容',
    ],
    faq: [
      {
        q: 'GEO工具 和 SEO 工具有什么不同？',
        a: 'SEO 工具看搜索引擎结果页的排名；GEO工具看品牌在豆包、DeepSeek、通义等 AI 回答里的提及、排序与引用。两者可以一起用。',
      },
      {
        q: '我该从哪个工具开始？',
        a: '第一次建议先看 GEO品牌；要持续看趋势用可见性监测；要提升被推荐，用 GEO优化。',
      },
      {
        q: '这些工具要先付费吗？',
        a: '各工具页都有免费额度，在本站输入品牌就能开始。需要加量或多人协作时，再进工作台。',
      },
    ],
  },
  {
    slug: 'visibility',
    title: '免费 AI 可见性监测｜品牌在 AI 答案中的提及率与推荐位',
    description: '免费 AI 可见性监测，可在本页直接开始。用固定问题集记录品牌在豆包、DeepSeek、通义等引擎里是否被提及、推荐位第几、描述是否准确。',
    keywords: '免费AI可见性监测,免费AI搜索可见性,AI 可见性监测,品牌提及率,AI推荐位,GEO监测',
    consolePath: '/dashboard/ai-index',
    definition:
      'AI 可见性监测模拟真实用户问题，记录不同 AI 引擎是否提及、如何排序与描述你的品牌，形成可对比的时间序列。',
    metrics: ['提及率', '平均推荐位', '引擎覆盖', '问题覆盖率', '描述倾向'],
    usage: ['选定行业问题集', '按引擎交叉查看', '导出快照与证据', '与竞品同口径对比'],
    faq: visibilityFaqs,
  },
  {
    slug: 'competitor',
    title: '竞品分析｜同一类问题上，别人凭什么更常被提到',
    description:
      '竞品分析把你和会被一起问到的对手放进同一批问题，看谁被点名、差在哪一问、对方靠哪篇内容占位，再决定下一篇补什么。',
    keywords: '竞品分析,免费竞品分析,GEO竞品分析,品牌竞品对照,AI竞品',
    consolePath: '/dashboard/competitor-insight',
    definition:
      '竞品分析回答的是：在客户真正会拿来比较的问题上，你和对手谁出现、谁排前、对方靠什么内容站住。',
    metrics: ['同题谁被点名', '名次差在哪一问', '只有对手的问题', '对方占位的那篇内容'],
    usage: ['写下品牌和会被一起问到的对手', '同一批问题并排对照', '标出你落后或缺席的问题', '对着差距去补内容并复测'],
    faq: [
      {
        q: '竞品分析要选行业龙头吗？',
        a: '不一定。选客户提问时会一起出现的名字，而不是财报里的对标对象。',
      },
    ],
  },
  {
    slug: 'ranking',
    title: '品牌排行｜品类推荐名单里，你排第几',
    description:
      '品牌排行看客户问「哪个好」「推荐几个」时，名单里有没有你、排第几、前面靠什么内容站住，再决定下一篇补什么。',
    keywords: '品牌排行,免费品牌排行,GEO品牌排行,品类品牌排名,推荐名单排行',
    consolePath: '/dashboard/brand-ranking',
    definition:
      '品牌排行回答的是：在品类推荐和「哪个好」这类问题上，名单里谁在前、你在不在、前面那几位靠什么内容站住。',
    metrics: ['推荐名单有没有你', '排在第几位', '前面几位靠哪篇', '品类题是否缺席'],
    usage: ['写下品牌和品类', '看推荐名单与品类题', '标出未进名单或名次靠后的题', '对着缺口去补内容并复测'],
    faq: [
      {
        q: '品牌排行和竞品分析有什么不同？',
        a: '竞品分析是你和指定对手同题对照；品牌排行看的是品类推荐名单里谁进了、谁排前，不一定先点名某一个对手。',
      },
    ],
  },
  {
    slug: 'status',
    title: '品牌现状｜现在别人怎么认识你，缺的是哪一块',
    description:
      '品牌现状把公开结果和问 AI 时的表现摊开：现在怎么被认识、哪里对、哪里空、本周该先补哪一件。只读，不改网站。',
    keywords: '品牌现状,免费品牌现状,GEO品牌现状,品牌当前表现,品牌摸底',
    consolePath: '/dashboard/brand-status',
    definition:
      '品牌现状回答的是：此刻别人怎么认识你——公开结果是什么、问 AI 时怎样、缺的是哪一块、下一步先动哪一件。',
    metrics: ['公开结果是否仍像你', '问及时有没有被提到', '说法是否过时', '本周该先补的一件事'],
    usage: ['输入品牌或官网', '摊开公开结果与问答表现', '标出对的、空的、错的', '只留本周先做的一件事'],
    faq: [
      {
        q: '品牌现状和 GEO品牌 有什么不同？',
        a: 'GEO品牌 看别人问起你时品牌还站不站得住；品牌现状把当前全貌摊开成可汇报的摸底：现在怎样、缺哪块、先补哪件。',
      },
    ],
  },
  {
    slug: 'industry',
    title: '行业数据分析｜这个品类里，别人常问什么、谁被点名',
    description:
      '行业数据分析按品类摊开：客户常问哪些题、答案里常点谁、引用偏哪类内容，再对照你缺哪一类，而不是给一个行业总分。',
    keywords: '行业数据分析,免费行业数据分析,GEO行业数据,品类问题分析,行业提及数据',
    consolePath: '/dashboard/industry-data',
    definition:
      '行业数据分析回答的是：这个品类里常被问到的问题是什么、答案里常出现谁、靠什么内容站住，以及你相对行业缺在哪一类。',
    metrics: ['品类高频问题', '行业常被点名的名字', '常见引用类型', '你相对行业的缺口题'],
    usage: ['写下品牌与所属品类', '看品类高频问题与常被点名名单', '标出行业有、你没有的题', '对着缺口去补并复测'],
    faq: [
      {
        q: '行业数据分析和竞品分析有什么不同？',
        a: '竞品分析是你和指定对手同题对照；行业数据分析先看品类里常问什么、常点谁，不一定先锁定某一个对手。',
      },
    ],
  },
  {
    slug: 'reputation',
    title: '品牌口碑｜别人怎么介绍你，说对了还是说偏了',
    description:
      '品牌口碑抽出别人介绍你时的原句：哪些说对、哪些过时、哪些说混，再决定先改哪一页事实，而不是给一个口碑分数。',
    keywords: '品牌口碑,免费品牌口碑,GEO品牌口碑,品牌口碑分析,品牌怎么被介绍',
    consolePath: '/dashboard/brand-reputation',
    definition:
      '品牌口碑回答的是：别人怎么介绍你——原句说对了没有、过时了没有、有没有和别人说混，以及先改哪一页。',
    metrics: ['介绍原句', '说对 / 过时 / 说混', '错句常靠哪一页', '本周该先改的一件'],
    usage: ['输入品牌', '抽出介绍原句并分类', '追到被引用的那一页', '改事实或补现行说明后复测'],
    faq: [
      {
        q: '品牌口碑和 AI 口碑分析有什么不同？',
        a: 'AI 口碑分析偏引擎原句核对；品牌口碑围绕「别人怎么介绍你」做可汇报的口碑摸底，两边可以一起用。',
      },
    ],
  },
  {
    slug: 'opinion',
    title: '舆情监控｜关于你的说法变了没有，哪一句在扩散',
    description:
      '舆情监控按同一批问法反复看：关于你的说法有没有变、哪一句在扩散、从哪一页冒出来，再决定先处置哪一件，而不是给一个舆情指数。',
    keywords: '舆情监控,免费舆情监控,GEO舆情监控,品牌舆情监测,说法变化监控',
    consolePath: '/dashboard/opinion-monitor',
    definition:
      '舆情监控回答的是：关于你的说法这几天有没有变、哪一句在扩散、靠哪一页站住，以及先处置哪一件。',
    metrics: ['说法是否变化', '扩散中的原句', '冒头的来源页', '本周该先处置的一件'],
    usage: ['设定品牌与固定问法', '按窗口对比说法变化', '标出新出现或扩散的原句', '追到来源页并处置后复测'],
    faq: [
      {
        q: '舆情监控和品牌口碑有什么不同？',
        a: '品牌口碑偏一次摸底：原句对不对；舆情监控偏持续看：说法变了没有、哪一句在扩散。',
      },
    ],
  },
  {
    slug: 'geo-search',
    title: 'GEO搜索｜用户问生成式引擎时，品牌有没有进答案',
    description:
      'GEO搜索看用户向豆包、DeepSeek、通义等提问时，品牌有没有进答案、排第几、引用了哪一页，再决定下一篇补什么。',
    keywords: 'GEO搜索,免费GEO搜索,生成式引擎搜索,GEO搜索可见性,AI问答搜索',
    consolePath: '/dashboard/geo-search',
    definition:
      'GEO搜索回答的是：在生成式引擎的问答场景里，品牌有没有被点名、出现在什么位置、答案靠哪一页撑着。',
    metrics: ['问答里有没有你', '推荐位第几', '答案引用了哪页', '高意图题是否缺席'],
    usage: ['写下品牌与常被问到的题', '看各引擎答案里的出现与位置', '标出未出现或靠后的题', '对着缺口去补并复测'],
    faq: [
      {
        q: 'GEO搜索和普通网页搜索有什么不同？',
        a: '网页搜索看结果列表里的蓝链；GEO搜索看生成式引擎直接给出的答案里，品牌有没有被点名、引用了谁。',
      },
    ],
  },
  {
    slug: 'geo-promo',
    title: 'GEO推广｜把品牌推进生成式答案里的那一轮动作',
    description:
      'GEO推广按缺口题推进：写可引用的一页、投到答案常引用的那类媒体、回传链接并用同一问法核对是否进答案，而不是按曝光量堆投放。',
    keywords: 'GEO推广,geo推广,免费GEO推广,生成式引擎推广,GEO投放推广',
    consolePath: '/dashboard/geo-promo',
    definition:
      'GEO推广回答的是：已知缺口题之后，怎样一轮一轮把品牌推进生成式答案——写什么、投哪类、如何核对进没进。',
    metrics: ['本轮服务哪道缺口题', '投的是否同类媒体', '回传链接是否齐全', '同题是否进答案'],
    usage: ['从 GEO搜索 或竞品分析带出缺口题', '写成可引用的一页', '按引用类型做 GEO推广 发出', '用同一问法核对是否进答案'],
    faq: [
      {
        q: 'GEO推广和 GEO优化 有什么不同？',
        a: 'GEO优化 覆盖找缺口、写、发、核的完整方法；GEO推广 更强调「推进答案占位」这一轮投放动作，适合按题推进的小白用户。',
      },
    ],
  },
  {
    slug: 'publish-platform',
    title: '发稿平台｜对手发在哪，你也能在同类媒体补上',
    description:
      '发稿平台对接可用媒体：从竞争品牌引用源追到对手常发的站点类型，帮小白用户按同一类媒体发出可回传链接的一页，而不是按刊例堆量。',
    keywords: '发稿平台,免费发稿平台,GEO发稿平台,媒体发稿平台,同媒体发稿',
    consolePath: '/dashboard/media-library',
    definition:
      '发稿平台回答的是：对手靠哪类媒体站住推荐、你能不能在同类站点补上一页、发出后链接能不能回传核对。',
    metrics: ['对手引用落在哪类媒体', '可对接的同类站点', '一题一类一链接', '回传后是否进引用'],
    usage: ['从引用源或竞品分析带出对手媒体类型', '在发稿平台锁定同类站点', '发出可核对的一页并回传 URL', '用同一题看有没有被引用'],
    faq: [
      {
        q: '发稿平台和发布稿件有什么不同？',
        a: '发布稿件是一题一类一链接的工单流程；发稿平台强调对接媒体能力——尤其按对手引用源去同类站点发，方便第一次发稿的人上手。',
      },
    ],
  },
  {
    slug: 'citation',
    title: '免费 AI 引用源分析｜答案引用的是哪一页',
    description: '免费 AI 引用源分析，可在本页拆开回答里的链接。看是官网、测评、问答还是媒体，以及那一页是不是你的。',
    keywords: '免费AI引用源分析,免费引用源,AI 引用源分析,信源类型,引用链接',
    consolePath: '/dashboard/citation-sources',
    definition: '引用源分析回答「AI 凭什么推荐别人」：第三方测评、案例、媒体与官网各自贡献多少。',
    metrics: ['有效引用源数', '信源类型分布', '平台偏好', '缺口问题数'],
    usage: ['查看类型分布', '定位高价值缺口', '规划测评与案例', '发布后回流验证'],
    faq: [
      {
        q: '官网文章很多为什么引用还是少？',
        a: 'AI 更偏好可验证的第三方与结构化证据。需补测评、对比与结果指标，而不是只堆软文。',
      },
    ],
  },
  {
    slug: 'sentiment',
    title: '免费 AI 口碑分析｜介绍你的原句说对了吗',
    description: '免费 AI 口碑分析，可在本页抽出介绍品牌的原句，分成说对、过时、说混。不提供情感总分。',
    keywords: '免费AI口碑分析,免费AI口碑,AI 口碑分析,品牌描述,错误描述',
    consolePath: '/dashboard/sentiment',
    definition: '口碑分析关注「被怎样说」，而不只是「有没有出现」。',
    metrics: ['情感倾向', '描述词云', '风险表述', '正面证据覆盖'],
    usage: ['筛选品牌相关问题', '查看负面集中点', '用事实页纠正误述', '持续复测'],
    faq: [
      {
        q: '口碑差一定是舆情危机吗？',
        a: '不一定。常见原因是公开事实不全，AI 用过时或竞品语境填补。先补可验证事实再判断。',
      },
    ],
  },
  {
    slug: 'optimize',
    title: '免费 GEO优化｜让 AI 回答里也推荐你的品牌',
    description:
      '免费 GEO优化：先看清用户问 AI 时你被漏掉了哪类问题，再写一篇有用的内容发到合适平台，并用同样的问题核对有没有被引用。',
    keywords: 'GEO优化,免费GEO优化,生成式引擎优化,GEO内容优化,AI搜索优化',
    consolePath: '/dashboard/media-library',
    definition:
      'GEO优化帮品牌在 AI 回答里被提到、说对、被引用：找到漏掉的问题，写成完整一页，发到合适平台，再核对结果。',
    metrics: ['漏掉的问题是否补上', '有用内容是否发出', '平台类型是否选对', '有没有被 AI 引用'],
    usage: ['找出 AI 漏掉的问题', '写成完整一页', '发到合适平台并记下链接', '用同样的问题再核对'],
    faq: [
      {
        q: 'GEO优化 和 SEO 有什么不同？',
        a: 'SEO 优化搜索排名；GEO优化 让品牌在 AI 回答里被提到、说得对、被引用。看的问题和核对方式不同。',
      },
    ],
  },
  {
    slug: 'agent',
    title: '免费 GEO Agent｜按缺的题起草可核对的一页',
    description: '免费 GEO Agent，可在本页按一道还没被引用的题起草。事实表里没有的数字保持为空，人核对后才能入库。',
    keywords: '免费GEO Agent,免费GEO写作,GEO Agent,事实核对,可引用草稿',
    consolePath: '/dashboard/new-agent',
    definition: 'GEO Agent 面向「可被 AI 抽取与引用」的写作与分析，而不是普通营销文案生成。',
    metrics: ['会话产出', '稿件入库数', 'brief 完成率'],
    usage: ['描述品牌与目标问题', '生成结构与证据清单', '进入写作会话', '入库并进入发稿'],
    faq: [
      {
        q: 'Agent 会不会编造数据？',
        a: '应以品牌档案与监测证据为准。对外发布前必须人工核对事实字段。',
      },
    ],
  },
  {
    slug: 'diagnosis',
    title: 'GEO品牌｜客户搜你、问 AI 时，品牌站得住吗',
    description:
      'GEO品牌帮你看清：别人搜品牌名时看到什么，问 AI 时有没有提到你、说得对不对，以及下一步该先补哪一类内容。只读，不改网站。',
    keywords: 'GEO品牌,品牌GEO,免费GEO品牌,品牌可见性,品牌被AI推荐',
    consolePath: '/dashboard/report-center',
    definition:
      'GEO品牌关心的是品牌在公开网络和 AI 回答里是否被正确认识：搜得到、说得对、该补的内容有着落。',
    metrics: ['搜品牌名时相关结果是否仍是你', '问 AI 时有没有被提到', '介绍句子是否过时', '下一步先补什么'],
    usage: ['输入品牌或官网', '看公开结果与 AI 回答里的品牌表现', '标出该先处理的一件事', '需要时再打开对应 GEO工具'],
    faq: [
      {
        q: 'GEO品牌 和普通品牌监测有什么不同？',
        a: '它不只看搜索结果里有没有你，还会看用户问 AI 时品牌是否被提到、说法对不对，并指出下一步该补什么。',
      },
    ],
  },
  {
    slug: 'brand',
    title: '免费品牌实体｜正式名、叫法和易混名对齐',
    description: '免费品牌实体核对，可在本页收录正式名、简称、英文和旧名，并把容易认错的名字标成不要认成。事实空着就空着。',
    keywords: '免费品牌实体,免费品牌别名,品牌实体,AI品牌识别,易混名',
    consolePath: '/dashboard/brand-library',
    definition: '品牌实体是 GEO 的底座：名称不统一、事实缺失，后续监测与优化都会失真。',
    metrics: ['实体完整度', '别名覆盖', '产品事实字段数'],
    usage: ['完善品牌档案', '校对别名与品类', '关联竞品与问题集', '同步到监测任务'],
    faq: [
      {
        q: '为什么要管别名？',
        a: '用户与 AI 常用简称、英文名或旧名提问。别名缺失会导致提及率被低估。',
      },
    ],
  },
  ...KEYWORD_PAGE_META.map((item) => ({
    slug: item.slug,
    title: item.title,
    description: item.description,
    keywords: item.keywords,
    consolePath: item.consolePath,
    definition: item.description,
    metrics: [] as string[],
    usage: [] as string[],
    faq: [] as HubPageFaq[],
  })),
]

export function getProductPage(slug: string): HubProductPage | undefined {
  if (!slug || slug === 'index') return GEO_PRODUCT_PAGES.find((p) => p.slug === '')
  return GEO_PRODUCT_PAGES.find((p) => p.slug === slug)
}

export type HubLearnSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
  table?: { head: string[]; rows: string[][] }
}

export type HubLearnSource = {
  title: string
  href: string
  note?: string
}

export type HubLearnPage = {
  slug: string
  title: string
  description: string
  keywords: string
  sections: HubLearnSection[]
  faq: HubPageFaq[]
  relatedProduct?: string
  /** 正文外链出处（学术/官方文档等） */
  sources?: HubLearnSource[]
}

export const GEO_LEARN_PAGES: HubLearnPage[] = [
  {
    slug: 'what-is-geo',
    title: '什么是 GEO？生成式引擎优化与 SEO 的区别',
    description:
      'GEO（Generative Engine Optimization）提高品牌在生成式 AI 答案中被提及、正确描述或引用的概率。它建立在 SEO 之上，衡量重点扩展到答案可见度；二者并行，而非替代。',
    keywords: '什么是GEO,GEO是什么,生成式引擎优化,GEO和SEO区别',
    relatedProduct: '/tools',
    sections: [
      {
        heading: 'GEO 是什么？',
        paragraphs: [
          'GEO（Generative Engine Optimization，生成式引擎优化）是一套可复核的实践：改进内容结构、可访问性与权威信号，提高品牌或页面在生成式 AI 答案中被提及、正确描述，或被当作引用信源的概率。',
          '学术上，该术语由 Aggarwal 等人在 [KDD 2024 论文（arXiv:2311.09735）](https://arxiv.org/abs/2311.09735) 中系统提出；商业实践范围更宽。[Google 搜索中心](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) 亦强调：面向生成式 AI 搜索体验的优化，根基仍是对用户有帮助、可抓取、可信的内容——从搜索角度看属于 SEO 的延伸，而不是另一套神秘算法。',
          '对品牌团队更直白的说法是：当客户向豆包、DeepSeek、通义、元宝或 ChatGPT 提问「怎么选」「和谁比」「有没有替代」时，你有没有被说到、说对、以及答案依据了哪类页面。',
        ],
      },
      {
        heading: 'GEO 和 SEO 有什么区别？',
        paragraphs: [
          'SEO 优化搜索结果页（蓝链）的排名与点击；GEO 优化生成式答案里的品牌占位、表述与信源。成功单位不同：一次点击 vs 一次提及/引用（很多场景是零点击）。',
          '二者共用可抓取、清晰结构、权威与体验等基础，但 KPI 必须分流。共用品牌实体与事实底座，再分别排期，比「二选一」成本更低。更完整的并行排期见 [GEO 与 SEO 如何并行](/learn/geo-vs-seo-deep-dive)；可复核采样口径见 [2026 Q3 方法报告](/reports/ai-visibility-baseline-2026-q3)。',
        ],
        table: {
          head: ['维度', 'SEO', 'GEO'],
          rows: [
            ['主要入口', '搜索结果蓝链', '生成式 AI 答案 / AI 摘要'],
            ['成功单位', '排名、点击、转化', '提及、推荐位、正确描述、被引用'],
            ['证据形态', '收录、外链、主题集群', '固定题集采样、引用源类型、复测趋势'],
            ['常见误区', '只追词不追转化', '发稿堆量、无法复核的排行榜'],
          ],
        },
      },
      {
        heading: '一个可核对的例子',
        paragraphs: [
          '假设品类题是「1.5 匹空调怎么选」。SEO 关心你的对比页是否进前十；GEO 关心：豆包有没有把你写进推荐名单、排第几、引用的是测评还是官网首页。',
          '若三个引擎里有两个完全未出现，优先补「可抽取的选型事实表 + 第三方测评」；不要先开一轮无关资讯软文。补完后用同一题集、同一引擎名单复测，看提及与引用是否移动。',
        ],
        bullets: [
          '反例：只发品牌故事，题里仍无人提到你。',
          '反例：提及率升高，但全来自低意图长尾题，高意图对比题仍空白。',
          '正例：先锁 15 道高意图题 → 建基线 → 按引用类型补证据 → 双周复测。',
        ],
      },
      {
        heading: 'GEO 不是什么',
        paragraphs: [
          '不是训练语料操控，也不是提示词工程。不是「发得越多越好」，更不是无法复核的排行榜营销。',
          '有效闭环是：固定问题集建基线 → 按引用缺口补可抽取证据 → 同口径复测 → 用证据包（题、引擎、日期、原件）汇报，而不是一张截图。',
        ],
      },
      {
        heading: '如何开始做 GEO？',
        paragraphs: [
          '第一步只做三件事：写出 10–20 条高意图题（选型 / 对比 / 替代）；选好目标用户真实会用的引擎；跑一轮基线，标出「未出现」与「被说混」的题。',
          '第二步只改一类变量（例如补一类测评信源），再复测。需要工具时再用可见性监测或免费诊断；先方法，再产品。',
        ],
        bullets: [
          '本周：定题集与引擎名单，不要频繁改。',
          '下周：按缺口写 1–2 篇可引用事实页或对接第三方测评。',
          '双周：同口径复测，决定下一轮补什么类型的证据。',
        ],
      },
    ],
    faq: [
      {
        q: 'GEO 会取代 SEO 吗？',
        a: '不会。蓝链与 AI 答案会长期并存。应并行经营：SEO 管主题与点击，GEO 管答案占位与引用。',
      },
      {
        q: 'GEO 是不是只是营销新词？',
        a: '名称有营销放大，但答案入口与「引用/提及」成功单位是真实变化。应用可复核口径，避免捷径话术。',
      },
      {
        q: '中小团队也需要 GEO 吗？',
        a: '若目标客户已在用 AI 做品类与方案对比，就需要。可从核心高意图题集与基线起步，不必一上来铺全引擎。',
      },
      {
        q: '没有技术团队怎么落地？',
        a: '先用固定题集手工或工具采样建基线，把「未出现 / 说混 / 缺第三方」写成内容 brief，再交给写作与 PR；监测工具用来加速复测，而不是替代方法。',
      },
    ],
    sources: [
      {
        title: 'GEO: Generative Engine Optimization（Aggarwal et al., arXiv:2311.09735）',
        href: 'https://arxiv.org/abs/2311.09735',
        note: '学术定义与实验设定的原始出处',
      },
      {
        title: 'Google Search Central — Creating helpful, reliable, people-first content',
        href: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
        note: '面向搜索（含 AI 体验）的官方内容质量原则',
      },
      {
        title: 'HANYUAI：中国 AI 搜索可见性可复核基线方法（2026 Q3）',
        href: '/reports/ai-visibility-baseline-2026-q3',
        note: '本站公开的采样与指标口径',
      },
    ],
  },
  {
    slug: 'geo-metrics',
    title: 'GEO 核心指标详解｜提及率、推荐位与引用源',
    description:
      'GEO 应同时看提及率、推荐位、描述倾向、问题覆盖与引用源类型。单看一个综合分会掩盖高意图题空白。',
    keywords: 'GEO指标,品牌提及率,AI推荐位,引用源指标',
    relatedProduct: '/tools/visibility',
    sections: [
      {
        heading: 'GEO 核心指标有哪些？',
        paragraphs: [
          '把指标想成一张「决策表」，而不是一个打分条。至少同时看：品牌提及率、平均推荐位、品牌描述倾向、问题覆盖率、竞品差距、有效引用源数量与类型。',
          '口径必须绑定：同一问题集、同一引擎名单、同一采样窗口。换题或换引擎后，历史曲线不可直接对比。公开可复核定义见 [2026 Q3 方法报告](/reports/ai-visibility-baseline-2026-q3)。',
        ],
        table: {
          head: ['指标', '看什么', '常见误读'],
          rows: [
            ['提及率', '题集中被提到的比例', '长尾题拉高，掩盖高意图空白'],
            ['平均推荐位', '进入名单时的平均位次', '未进入名单时不可用「假第 1」'],
            ['描述倾向', '介绍是否过时/说混', '只看情感词，不核对事实字段'],
            ['引用源类型', '测评/问答/媒体/官网占比', '只数链接条数，不看类型缺口'],
            ['问题覆盖', '高意图题有没有被采到', '用综合题稀释选型/对比题'],
          ],
        },
      },
      {
        heading: '为什么不能只看提及率？',
        paragraphs: [
          '提及率升高可能来自低价值长尾问题；高价值对比题若仍未进入推荐名单，增长并不健康。',
          '正确读法是：先看高意图子集的提及与推荐位，再看引用源是否从「全是官网」变成「有第三方」。竞品对照放在同一题上，而不是各自挑好看的题。',
        ],
        bullets: [
          '健康：高意图提及 ↑，推荐位改善，第三方引用出现。',
          '虚假繁荣：总提及 ↑，但选型/对比题仍空白。',
          '危险：提及在，但描述把型号、产地、竞品关系说混。',
        ],
      },
      {
        heading: '怎么放进周会',
        paragraphs: [
          '一张表即可：行是高意图题，列是引擎，单元格写「未出现 / 提及第 N / 引用类型」。附件留原件链接与日期。',
          '行动项只写「补哪一类证据」，不要写「加强曝光」。下一次会议先看同一格有没有变化。验证闭环见 [如何验证 GEO 优化有效](/learn/measurement)。',
        ],
      },
    ],
    faq: [
      {
        q: '指标多久更新一次合适？',
        a: '常见做法是周更或双周更，并保持问题集与引擎列表不变。改题后要重新标定基线。',
      },
      {
        q: '要不要做一个 GEO 综合分？',
        a: '对内沟通可以加权，但对外与决策仍应拆开看。综合分容易掩盖「某一引擎或某类题完全未出现」。',
      },
      {
        q: '和 SEO 的排名指标怎么并存？',
        a: '两套表：蓝链看关键词与落地页；GEO 看题集与引擎。共享的是品牌实体与事实字段，不是同一个分数。',
      },
    ],
    sources: [
      {
        title: 'HANYUAI：中国 AI 搜索可见性可复核基线方法（2026 Q3）',
        href: '/reports/ai-visibility-baseline-2026-q3',
        note: '指标定义与采样声明的同口径出处',
      },
    ],
  },
  {
    slug: 'ai-engines',
    title: 'AI 搜索引擎差异｜豆包、DeepSeek、通义、元宝与 ChatGPT',
    description:
      '不同生成式引擎的采样与引用习惯不同。GEO 监测要分引擎看，不能只看综合分；名单应覆盖真实用户入口并保持稳定。',
    keywords: 'AI搜索引擎,豆包,DeepSeek,通义千问,元宝,ChatGPT GEO',
    relatedProduct: '/tools/visibility',
    sections: [
      {
        heading: '为什么要分引擎监测？',
        paragraphs: [
          '同一问题在不同引擎的提及率与引用源结构可以差很多。综合分会掩盖「某一引擎完全未出现」的风险——而这往往正是你目标客户每天在用的入口。',
          '分引擎不是为了做更多报表，而是为了决定「下一篇证据投向哪类信源、优先修哪个入口」。本站公开窗口使用的引擎名单与采样原则见 [方法报告](/reports/ai-visibility-baseline-2026-q3)。',
        ],
        table: {
          head: ['观察点', '为什么重要', '落地动作'],
          rows: [
            ['提及差异', '有的引擎提你，有的完全空白', '优先补空白引擎常引的信源类型'],
            ['引用习惯', '测评 vs 问答 vs 官网权重不同', '按缺口写 brief，而不是统一发资讯'],
            ['描述一致性', '同一品牌事实被说混', '先对齐实体与事实页，再谈发稿量'],
            ['名单稳定性', '频繁换引擎导致曲线失效', '先定 4–6 个主力，少改'],
          ],
        },
      },
      {
        heading: '如何选监测引擎集合？',
        paragraphs: [
          '优先覆盖目标用户真实使用的引擎，再保留 1–2 个对照引擎。ToB 与消费品牌的主力入口往往不同，不要照搬竞品名单。',
          '名单确定后至少保持一个完整复测周期再调整。海外决策场景再纳入 ChatGPT 等；纯国内获客可先做国内主力。',
        ],
        bullets: [
          '国内常见主力：豆包、DeepSeek、通义、元宝等（按你的客户实际使用调整）。',
          '对照：保留一个「你不主攻但竞品常被提到」的引擎，避免盲区。',
          '不要把「支持的引擎数」当成效果；效果看同题复测是否移动。',
        ],
      },
      {
        heading: '采样时注意什么',
        paragraphs: [
          '尽量固定端（网页/App）、登录态与个性化干扰。公开监测应只读、可复现；个性化过强的结果不要当行业基线。',
          '单次答案会波动。用周期均值 + 原件留存，比「今天截一张好看的」更可靠。站长侧可用 [IndexNow](https://www.indexnow.org/) 加速权威页被发现，但它不能替代题集复测。',
        ],
      },
    ],
    faq: [
      {
        q: '海外引擎要监测吗？',
        a: '若客户决策发生在海外或双语场景，应纳入；否则先做国内主力引擎，把预算留给高意图题与证据。',
      },
      {
        q: '引擎越多越好吗？',
        a: '不是。引擎过多会稀释复测频率与行动聚焦。先覆盖真实入口，再谈广度。',
      },
      {
        q: '引擎更新很快，方法会不会失效？',
        a: '入口会变，但「固定题集 + 分引擎 + 引用类型 + 复测」的方法仍然成立。变的是名单与信源偏好，不是要不要监测。',
      },
    ],
    sources: [
      {
        title: 'IndexNow protocol',
        href: 'https://www.indexnow.org/',
        note: 'URL 变更主动通知（发现辅助，非 GEO 效果本身）',
      },
      {
        title: 'HANYUAI：中国 AI 搜索可见性可复核基线方法（2026 Q3）',
        href: '/reports/ai-visibility-baseline-2026-q3',
        note: '公开采样窗口的引擎名单与局限声明',
      },
    ],
  },
  {
    slug: 'citation-strategy',
    title: '如何让品牌更容易被 AI 引用？',
    description:
      '从信源类型、事实密度与第三方背书出发，给出可执行的引用优化策略。类型缺口比发稿量更能解释「为什么总不被引」。',
    keywords: 'AI引用,如何被AI引用,引用源策略,GEO引用优化',
    relatedProduct: '/tools/citation',
    sections: [
      {
        heading: 'AI 更常引用什么？',
        paragraphs: [
          '常见高权重信源包括行业媒体、测评对比、问答社区高质量回答、白皮书与含结果指标的案例，而不仅是官网首页。',
          '读引用结构时，先看类型分布，再看条数。若几乎全是官网，高意图对比题往往仍会输给「有测评的对手」。公开窗口里如何标注 citationTypes，见 [方法报告 · 证据样例](/reports/ai-visibility-baseline-2026-q3)。',
        ],
        table: {
          head: ['类型', '常见场景', '缺口时优先动作'],
          rows: [
            ['测评/对比', '怎么选、和谁比', '补可核对的对比维度与第三方测评'],
            ['问答/社区', '有没有坑、值不值得买', '写真实问句下的可引用回答'],
            ['行业媒体', '品类趋势、方案解读', '投有事实表的稿，不投空泛软文'],
            ['官网事实页', '参数、实体、FAQ', '结论前置 + 表格化字段 + 日期'],
            ['白皮书/案例', 'B2B 选型与替代', '写可验证指标与边界条件'],
          ],
        },
      },
      {
        heading: '内容怎么写才可引用？',
        paragraphs: [
          '用真实问句做标题，首段直接给结论，表格化事实字段，标注可验证数据与日期，并保持全站实体一致。',
          '「可抽取」比「写得好听」更重要：模型更常截取答案前置段、对比表与带日期的数字，而不是抒情开头。写作原则与 [Google 的people-first 内容指南](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) 同向——对用户有用的结构，也更利于被引用。',
        ],
        bullets: [
          '标题 ≈ 用户原问题；首段给结论。',
          '事实表：型号、适用条件、对比维度、更新日。',
          '全站同一品牌名与别名，避免答案说混。',
          '发完用同一题集复测：看引用类型有没有移动。',
        ],
      },
      {
        heading: '常见翻车',
        paragraphs: [
          '只堆品牌故事；把渠道数当效果；同一事实多套说法；改完不复测。',
        ],
        bullets: [
          '翻车：发了 20 篇资讯，对比题引用类型仍是空。',
          '翻车：官网改了参数，答案还在说旧型号。',
          '正确：按类型缺口写 brief → 发一类证据 → 同口径复测。',
        ],
      },
    ],
    faq: [
      {
        q: '只有官网可以吗？',
        a: '可以起步，但高价值问题通常需要第三方证据。建议官网事实页 + 外部测评/案例组合。',
      },
      {
        q: '发得越多越好吗？',
        a: '不是。无效类型上的产量几乎不移动引用结构。先看缺口类型，再决定写什么。',
      },
      {
        q: '怎么知道补对了？',
        a: '固定题集与引擎，看目标题的 citationTypes 是否出现你补的那一类，并核对描述是否仍准确。',
      },
    ],
    sources: [
      {
        title: 'Google Search Central — Creating helpful, reliable, people-first content',
        href: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
        note: '可抽取、对人有用的内容结构原则',
      },
      {
        title: 'HANYUAI：中国 AI 搜索可见性可复核基线方法（2026 Q3）',
        href: '/reports/ai-visibility-baseline-2026-q3',
        note: '引用类型与证据字段的公开口径',
      },
    ],
  },
  {
    slug: 'content-brief',
    title: 'GEO 内容 Brief 怎么写？面向 AI 抽取的结构',
    description: '把目标问题、必填事实、证据类型与复测窗口写进 brief，让内容生产可验证。',
    keywords: 'GEO内容brief,AI可抽取内容,内容结构',
    relatedProduct: '/tools/optimize',
    sections: [
      {
        heading: '一份 GEO brief 至少包含什么？',
        paragraphs: [
          '目标问题句、必填事实字段、证据类型、期望被引用的段落结构、发布渠道与复测窗口。',
        ],
      },
    ],
    faq: [
      {
        q: 'brief 和普通选题单有何不同？',
        a: 'GEO brief 以「问题—证据—可抽取结构—复测」为主，而不是以传播话题或情绪为主。',
      },
    ],
  },
  {
    slug: 'measurement',
    title: '如何验证 GEO 优化有效？',
    description:
      '用固定问题集、引擎与采样周期比较基线变化，避免单次截图误判。有效验证是小实验，不是「感觉被提到更多了」。',
    keywords: 'GEO效果验证,GEO复测,AI搜索优化效果',
    relatedProduct: '/tools/visibility',
    sections: [
      {
        heading: '有效验证的最小实验设计',
        paragraphs: [
          '固定问题集与引擎，每次只改一类变量（如补第三方测评），再比较提及率、推荐位与有效引用源。',
          '实验记录至少包含：questionSetVersion、引擎名单、采样起止、改动了什么、改前/改后证据包位置。公开口径模板见 [方法报告](/reports/ai-visibility-baseline-2026-q3)。',
        ],
        table: {
          head: ['步骤', '做什么', '不要做什么'],
          rows: [
            ['定基线', '同题同引擎采一轮并留原件', '挑好看的截图当基线'],
            ['改一类变量', '只补一种证据类型或实体字段', '同时改题、改引擎、狂发稿'],
            ['复测', '同一窗口规则再采', '换题后仍对比旧曲线'],
            ['下结论', '看高意图格子是否移动', '用综合分掩盖单引擎空白'],
          ],
        },
      },
      {
        heading: '波动怎么办？',
        paragraphs: [
          '生成式答案日内会抖。用窗口内聚合（如双周）与证据留存，而不是单次截图。趋势与竞品同题差距，比绝对分更可靠。',
          '若必须对外沟通，写清采样周期与局限，禁止无法复核的「行业第 N」。',
        ],
        bullets: [
          '波动是常态；无原件的「涨了」不可审计。',
          '改题集必须升版本，旧数据归档。',
          '成功单位：提及/推荐位/引用类型，不是发稿量。',
        ],
      },
      {
        heading: '和内容排期怎么对齐',
        paragraphs: [
          '复测窗口应写进 [引用策略](/learn/citation-strategy) 与内容 brief。发稿日不等于生效日；给发现与引用留时间，再采第二轮。',
        ],
      },
    ],
    faq: [
      {
        q: 'AI 每天答案不一样怎么办？',
        a: '用周期均值与证据留存，而不是单次截图。波动是常态，趋势与差距才是决策依据。',
      },
      {
        q: '多久复测一次？',
        a: '常见双周；改完一类证据后至少完整跑一轮同口径采样再下结论。',
      },
      {
        q: '怎样才算有效？',
        a: '目标高意图题：未出现率下降，或推荐位改善，或出现你补的那类引用——且描述仍正确。',
      },
    ],
    sources: [
      {
        title: 'HANYUAI：中国 AI 搜索可见性可复核基线方法（2026 Q3）',
        href: '/reports/ai-visibility-baseline-2026-q3',
        note: '采样周期、问题集版本与局限声明的模板',
      },
    ],
  },
  {
    slug: 'geo-vs-seo-deep-dive',
    title: 'GEO 与 SEO 如何并行｜同一内容体系服务两种入口',
    description:
      '蓝链与 AI 答案共用品牌实体与事实底座，再分流 KPI 与排期。并行不是两套内容团队各写各的，而是同一 brief 服务两种入口。',
    keywords: 'GEO和SEO并行,内容体系,生成式引擎优化,GEO vs SEO',
    relatedProduct: '/tools',
    sections: [
      {
        heading: '为什么要并行而不是二选一？',
        paragraphs: [
          '用户仍会从搜索进入官网，也会直接向 AI 提问选型。关掉任一入口，都会在决策链路上留白。',
          '成本最低的做法是：共用品牌实体、别名、产品事实与可抽取段落；SEO 负责主题集群与可点击落地；GEO 负责高意图题集、引用源类型与同口径复测。',
        ],
        table: {
          head: ['共享层', 'SEO 侧动作', 'GEO 侧动作'],
          rows: [
            ['品牌实体', '站内名称/结构化数据一致', '题集与答案描述用同一套别名'],
            ['事实字段', '参数表、FAQ、对比页可抓取', '答案可抽取：结论前置 + 表格'],
            ['证据', '外链与媒体报道', '测评/问答等可被引用的第三方'],
            ['KPI', '排名、点击、转化', '提及、推荐位、引用类型'],
            ['节奏', '主题集群迭代', '双周按缺口复测'],
          ],
        },
      },
      {
        heading: '同一内容体系怎么排期',
        paragraphs: [
          '先写一份共享 brief：目标问题句、必填事实、证据类型、发布渠道、复测窗口。SEO 同学据此做主题页与内链；GEO 同学据此挑高意图题采样，并决定要不要补第三方。',
          '避免两套选题会：一套追热词，一套追「感觉该发」。共享事实字段变更时，两边同一周更新，减少「官网已改、答案仍说旧型号」。',
        ],
        bullets: [
          '周一：同步题集与事实变更。',
          '周中：产出/更新可引用页或对接测评。',
          '周末或双周：GEO 复测 + SEO 抽查核心词，会议只对「格子是否移动」。',
        ],
      },
      {
        heading: '预算有限时怎么切',
        paragraphs: [
          '先用免费诊断或小样本采样看 AI 答案缺口。若搜索仍是主流量，保留基础 SEO（技术健康 + 核心主题页），把增量预算给 10–20 道高意图 GEO 题与一类证据。',
          '不要用「全面品牌曝光」稀释两边；并行的目标是同一事实被两种入口正确使用，不是内容产量翻倍。',
        ],
      },
      {
        heading: '常见翻车',
        paragraphs: [
          'SEO 与 GEO 各建一套品牌说法；发稿量当效果；用无法复核的「AI 排名」对外宣传；改题集却继续对比旧曲线。',
        ],
        bullets: [
          '翻车：两套 slogan，答案说混。',
          '翻车：只追综合分，不看高意图空白。',
          '正确：共享实体 + 分流 KPI + 证据包复测。',
        ],
      },
    ],
    faq: [
      {
        q: '预算有限先投哪里？',
        a: '先看 AI 答案缺口；若搜索仍是主流量，保留基础 SEO，把增量预算给高意图 GEO 题与可引用证据。',
      },
      {
        q: '要不要单独成立 GEO 团队？',
        a: '早期不必。指定负责人维护题集与复测即可，内容与 PR 仍可复用；等题集稳定、缺口清晰再扩编制。',
      },
      {
        q: '和内容营销是什么关系？',
        a: '内容营销可以服务传播；GEO 要求每篇都能回答具体题、可抽取、可复测。共享日历，但验收标准不同。',
      },
    ],
    sources: [
      {
        title: 'Google Search Central — Creating helpful, reliable, people-first content',
        href: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
        note: '蓝链与 AI 体验共用的内容质量根基',
      },
      {
        title: 'GEO: Generative Engine Optimization（arXiv:2311.09735）',
        href: 'https://arxiv.org/abs/2311.09735',
        note: 'GEO 学术定义出处',
      },
      {
        title: 'HANYUAI：中国 AI 搜索可见性可复核基线方法（2026 Q3）',
        href: '/reports/ai-visibility-baseline-2026-q3',
        note: '并行体系下的 GEO 采样与指标口径',
      },
    ],
  },
  {
    slug: 'indexnow-for-geo',
    title: 'IndexNow 与 GEO：加快可引用页被发现',
    description: '发布或更新权威页后，用 IndexNow 通知 Bing 等引擎，缩短发现与潜在引用延迟。',
    keywords: 'IndexNow,GEO收录,Bing提交',
    relatedProduct: '/engines',
    sections: [
      {
        heading: 'IndexNow 解决什么？',
        paragraphs: [
          'Sitemap 是被动发现；IndexNow 在变更时主动通知。对方法报告、术语与产品页更新尤其有用。',
        ],
      },
      {
        heading: '本站怎么用？',
        paragraphs: [
          '配置 NUXT_INDEXNOW_KEY 后，调用 POST /api/indexnow 提交 URL；公钥文件见 /indexnow-key.txt。',
        ],
      },
    ],
    faq: [
      {
        q: '只提交首页够吗？',
        a: '不够。应提交变更的权威 URL（报告、Learn、术语），并保持 sitemap index 同步。',
      },
    ],
  },
]

export function getLearnPage(slug: string) {
  return GEO_LEARN_PAGES.find((p) => p.slug === slug)
}

export const GEO_GLOSSARY: GlossaryTerm[] = GEO_GLOSSARY_EXTENDED

export function getGlossaryTerm(slug: string) {
  return GEO_GLOSSARY.find((t) => t.slug === slug)
}

export const GEO_REPORTS: HubReport[] = GEO_REPORTS_EXTENDED

export function getReport(slug: string) {
  return GEO_REPORTS.find((r) => r.slug === slug)
}

export const GEO_BENCHMARKS = GEO_BENCHMARKS_EXTENDED

export const GEO_ENGINES_DOC = GEO_ENGINES_DOC_EXTENDED

export const GEO_CHANGELOG = [
  {
    date: '2026-09-20',
    title: '流量站 IA 上线',
    items: ['产品/学习/报告导航', '术语表与学习支柱', '公开报告方法说明', 'sitemap index'],
  },
  {
    date: '2026-09-20',
    title: 'P1–P3 内容扩量',
    items: [
      '术语 50+ / insights 15+',
      'solutions / compare 首批',
      'IndexNow 与脱敏报告回流',
      'integrations / partners / customers',
    ],
  },
]

/** 权威内容首期生产流程（reports / benchmarks / engines） */
export const GEO_CONTENT_PIPELINE = [
  '选题：主词/场景词/引擎词一页一词，写入 Learn 或 Report slug',
  '口径：锁定问题模板、引擎名单、采样周期，写入报告 method 字段',
  '采样：只读采集并保留原始回答与引用证据',
  '写作：H2 下首段答案前置 + FAQ + JSON-LD',
  '对齐：指标名与 geo-admin 产品文案一致',
  '发布：更新 dateModified，刷新 sitemap 子图与 llms.txt',
  '回流（可选）：控制台脱敏摘要进入 /reports',
] as const

export function consoleHref(consoleUrl: string, path: string, utm = 'geo_hub') {
  const base = consoleUrl.replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  const joiner = p.includes('?') ? '&' : '?'
  return `${base}${p}${joiner}utm_source=${utm}&utm_medium=referral`
}
