import { flagshipHome, flagshipTools, getFlagship } from '../../site-web/utils/content/geo-flagship'
import { flagshipKeywordPages, KEYWORD_PAGE_META } from '../../site-web/utils/content/geo-flagship-keywords'
import { GEO_CONTACT_DEFAULT } from '../../site-web/utils/content/geo-contact'
import { GEO_PRICING_DEFAULT } from '../../site-web/utils/content/geo-pricing'
import { GEO_PRODUCT_PAGES } from '../../site-web/utils/geo-hub'
import { GEO_HOME_SEO, GEO_SITE } from '../../site-web/utils/geo-seo'

const legacySlugs = [
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
]

function headline(parts: { text?: string; br?: boolean }[]) {
  return parts.filter((part) => !part.br).map((part) => part.text || '').join('')
}

function productTitle(slug: string, fallback: string) {
  const product = GEO_PRODUCT_PAGES.find((item) => item.slug === slug)
  return product?.title.split('｜')[0] || fallback
}

function productSeo(slug: string, meta?: { title: string; description: string; keywords: string }) {
  const product = GEO_PRODUCT_PAGES.find((item) => item.slug === slug)
  return {
    title: product?.title || meta?.title || '',
    description: product?.description || meta?.description || '',
    keywords: product?.keywords || meta?.keywords || '',
  }
}

const legacyPages = legacySlugs.map((slug, index) => {
  const flagship = getFlagship(slug)
  if (!flagship) throw new Error(`missing flagship page: ${slug}`)
  return {
    path: `/tools/${slug}`,
    title: productTitle(slug, slug),
    pageKind: 'product',
    sort: index + 1,
    seo: productSeo(slug),
    flagship,
  }
})

const keywordPages = KEYWORD_PAGE_META.map((meta, index) => {
  const flagship = flagshipKeywordPages[meta.slug]
  if (!flagship) throw new Error(`missing keyword page: ${meta.slug}`)
  return {
    path: `/tools/${meta.slug}`,
    title: productTitle(meta.slug, meta.title.split('｜')[0]),
    pageKind: 'product',
    sort: legacySlugs.length + index + 1,
    seo: productSeo(meta.slug, meta),
    flagship,
  }
})

const flagshipPages = [
  {
    path: '/',
    title: '首页',
    pageKind: 'home',
    sort: 0,
    seo: {
      title: GEO_HOME_SEO.title,
      description: GEO_HOME_SEO.description,
      keywords: GEO_HOME_SEO.keywords,
    },
    flagship: flagshipHome,
  },
  {
    path: '/tools',
    title: productTitle('', 'GEO工具'),
    pageKind: 'product',
    sort: 0.5,
    seo: productSeo('', {
      title: 'GEO工具｜免费看品牌在 AI 回答里的表现',
      description:
        'GEO工具汇总可见性监测、品牌诊断、竞品分析、GEO优化、引用源与口碑等能力。选一个工具，输入品牌就能开始。',
      keywords: 'GEO工具,免费GEO工具,GEO平台,AI搜索可见性,生成式引擎优化',
    }),
    flagship: flagshipTools,
  },
  ...legacyPages,
  ...keywordPages,
].map((item) => ({
  ...item,
  headline: headline(item.flagship.heroTitle),
  dateModified: GEO_SITE.dateModified,
  datePublished: GEO_SITE.datePublished,
}))

const pricingPage = {
  path: '/pricing',
  title: '价格',
  pageKind: 'pricing',
  template: 'pricing',
  sort: 0.7,
  seo: {
    title: 'GEO价格｜监控套餐与积分计费',
    description:
      '监控按品牌订阅，写作与发稿按积分量付。免费版 ¥0、入门版 ¥79/月、基础版 ¥199/月、专业版 ¥499/月，定制版按需。',
    keywords: 'GEO价格,GEO套餐,GEO定价,AI监控套餐,生成式引擎优化价格',
  },
  hubContent: GEO_PRICING_DEFAULT,
  headline: `${GEO_PRICING_DEFAULT.title}${GEO_PRICING_DEFAULT.titleAccent || ''}`,
  dateModified: GEO_SITE.dateModified,
  datePublished: GEO_SITE.datePublished,
}

const contactPage = {
  path: '/contact',
  title: '联系我们',
  pageKind: 'contact',
  template: 'contact',
  sort: 0.8,
  seo: {
    title: '联系我们｜HANYUAI GEO',
    description: GEO_CONTACT_DEFAULT.description,
    keywords: '联系我们,GEO演示,商务合作,HANYUAI GEO客服',
  },
  hubContent: GEO_CONTACT_DEFAULT,
  headline: GEO_CONTACT_DEFAULT.title,
  dateModified: GEO_SITE.dateModified,
  datePublished: GEO_SITE.datePublished,
}

const pages = [ ...flagshipPages, pricingPage, contactPage ]

module.exports = { pages }
