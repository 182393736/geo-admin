/** GEO 落地页站点常量与可复用 SEO 数据 */

import { GEO_INSIGHTS_EXTENDED, type GeoInsight } from './content/insights'

export type { GeoInsight }

export const GEO_SITE = {
  name: 'HANYUAI GEO',
  brand: 'HANYUAI GEO',
  legalName: 'HANYUAI',
  email: 'hello@hanyuai.com',
  partnerEmail: 'partner@hanyuai.com',
  /** 默认站点 URL：本地开发用本机；上线用环境变量 NUXT_PUBLIC_SITE_URL */
  defaultSiteUrl: 'http://localhost:5003',
  locale: 'zh-CN',
  twitter: '@hanyuai',
  /** 品牌社交主页，上线后换成真实 URL；空则不输出 sameAs */
  sameAs: [
    // 'https://www.zhihu.com/org/hanyuai',
    // 'https://weibo.com/hanyuai',
  ] as string[],
  foundingDate: '2024-01-01',
  dateModified: '2026-09-20',
  datePublished: '2026-08-01',
  logo: {
    path: '/og-geo.png',
    width: 1200,
    height: 630,
    caption: 'HANYUAI GEO — GEO 优化与 AI 搜索可见性监测',
  },
  /** 有正式演示视频后再填；空则不输出 VideoObject */
  demoVideoUrl: '' as string,
  demoVideoName: 'HANYUAI GEO 产品演示',
  demoVideoDescription: '演示如何用 HANYUAI GEO 完成品牌 GEO 诊断、可见性监测与引用源分析。',
  /** 有真实办公地址再填；空则不输出 LocalBusiness/PostalAddress */
  address: null as null | {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  },
} as const

export const GEO_HOWTO_DIAGNOSE = {
  name: '如何用 HANYUAI GEO 做一次免费 GEO 诊断',
  description:
    '输入品牌或官网，在约 3 分钟内获取 AI 搜索可见性基线，包括提及率、推荐位与引用源缺口，并得到可执行的 GEO 优化优先级。',
  totalTime: 'PT3M',
  steps: [
    {
      name: '输入品牌名称或官网',
      text: '在首页诊断框输入品牌名（如 HANYUAI）或官网 URL，也可点选示例品牌快速试用。',
      url: '/diagnose',
    },
    {
      name: '启动免费 GEO 体检',
      text: '提交后系统只读采样主流 AI 引擎对相关问题的回答，不会修改你的网站代码或影响线上流量。',
      url: '/diagnose',
    },
    {
      name: '查看可见性与理解度信号',
      text: '阅读品牌提及率、平均推荐位、AI 理解度与竞品差距等指标，确认当前基线。',
      url: '/tools/visibility',
    },
    {
      name: '按优先级执行内容行动',
      text: '根据引用源缺口与机会问题清单，补齐场景证据、第三方信源与可抽取事实，并用同一问题集复测效果。',
      url: '/tools/optimize',
    },
  ],
} as const

export const GEO_SERVICES = [
  {
    id: 'geo-diagnose',
    name: '免费 GEO 快速诊断',
    description: '输入品牌或官网，获取一次只读的 AI 搜索可见性、推荐位与引用源基线。',
    url: '/diagnose',
    price: '0',
  },
  {
    id: 'geo-visibility',
    name: '免费 AI 搜索可见性监测',
    description: '用固定问题集看品牌在豆包、DeepSeek、通义、元宝等引擎中的提及率、推荐位与描述倾向。',
    url: '/tools/visibility',
    price: '0',
  },
  {
    id: 'geo-understanding',
    name: '免费品牌实体核对',
    description: '核对正式名、叫法和易混名，定位名字没对齐时影响推荐的障碍。',
    url: '/tools/brand',
    price: '0',
  },
  {
    id: 'geo-brief',
    name: '免费 GEO优化',
    description: '按缺口题写成可引页、选对渠道类型，发出后用同一题集复测是否进池。',
    url: '/tools/optimize',
    price: '0',
  },
] as const

export const GEO_HOME_SEO = {
  title: '免费GEO优化工具｜AI搜索可见性监测与品牌GEO诊断 - HANYUAI GEO',
  description:
    'HANYUAI GEO 是免费 GEO 优化工具。覆盖监测、竞品、引用源、口碑、发稿、写作、诊断和品牌实体，以及豆包、DeepSeek、通义、元宝，看提及率、推荐位与引用源。',
  keywords:
    '免费GEO,免费GEO优化,GEO优化工具,免费AI搜索可见性,免费GEO诊断,生成式引擎优化,AI搜索优化,品牌可见性监测,AI引用源,DeepSeek,豆包,通义千问',
} as const

export const GEO_INSIGHTS_SEO = {
  title: 'GEO优化指南与实战文章｜方法论合集 - HANYUAI GEO',
  description:
    '系统解读 GEO 核心指标、AI 品牌理解信号与内容不被推荐的原因。HANYUAI GEO 方法论合集，帮助团队把生成式引擎优化做成可执行闭环。',
  keywords: 'GEO指南,GEO优化文章,生成式引擎优化,AI搜索可见性,品牌理解度,引用源优化',
} as const

export const GEO_FAQ_ITEMS = [
  {
    q: '什么是 GEO 优化？和 SEO 有什么区别？',
    a: 'GEO（Generative Engine Optimization，生成式引擎优化）关注品牌在 ChatGPT、豆包、DeepSeek、通义等 AI 答案中是否被提及、如何被描述、引用了哪些信源。SEO 主要优化传统搜索结果页排名；GEO 在此基础上增加问题集采样、引擎交叉对比和可引用内容结构，两者互补而非替代。',
  },
  {
    q: 'GEO 监测具体看哪些指标？',
    a: '核心指标包括品牌提及率、平均推荐位、品牌描述倾向、问题覆盖率、竞品差距和有效引用源。建议固定问题集与采样周期，用原始回答和引用证据做周期性对比。',
  },
  {
    q: '一次诊断需要改动我的网站吗？',
    a: '不需要。公开诊断只做只读抓取与问题采样，不会修改代码、发布内容或影响线上流量。如果需要接入其他数据源，会先经过你的授权。',
  },
  {
    q: 'AI 结果每天都不一样，如何判断 GEO 优化有效？',
    a: '不要用单次截图下结论。固定问题集、引擎、地域和采样频率，保留原始回答与引用证据，再用周期性基线比较提及率、推荐位、品牌描述和有效引用源的变化。',
  },
  {
    q: '可以支持多个品牌和多个站点吗？',
    a: '可以。工作台按项目管理品牌、域名、问题集和竞品，支持多个站点的独立报告，并可用统一的指标口径做横向比较。',
  },
  {
    q: '如何让品牌更容易被 AI 搜索引擎引用？',
    a: '先补齐可验证的品牌事实与产品证据，再针对高提问量场景发布含数据、案例和第三方背书的内容，并持续用同一问题集监测提及率与引用源变化，把内容行动和效果验证放在同一闭环里。',
  },
] as const

export const GEO_INSIGHTS: GeoInsight[] = GEO_INSIGHTS_EXTENDED

export function getInsightBySlug(slug: string) {
  return GEO_INSIGHTS.find((item) => item.slug === slug)
}
