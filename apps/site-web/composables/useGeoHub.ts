import {
  consoleHref,
  isFlagshipHostWithSiteUrl,
} from '~/utils/geo-hub'
import { GEO_SITE } from '~/utils/geo-seo'
import {
  GEO_CONTENT_STAMP,
  getGeoAuthor,
  type GeoAuthor,
} from '~/utils/content/authors'

export function useGeoFlagship() {
  const config = useRuntimeConfig()
  const url = useRequestURL()

  const isFlagship = computed(() =>
    isFlagshipHostWithSiteUrl(url.hostname, String(config.public.siteUrl || '')),
  )

  return { isFlagship }
}

export function useGeoConsoleLink() {
  const config = useRuntimeConfig()
  const consoleUrl = computed(() =>
    String(config.public.consoleUrl || 'http://127.0.0.1:5180').replace(/\/+$/, ''),
  )

  function toConsole(path: string, utm?: string) {
    return consoleHref(consoleUrl.value, path, utm)
  }

  function goConsole(path: string, utm?: string) {
    if (import.meta.client) {
      window.location.href = toConsole(path, utm)
    }
  }

  return { consoleUrl, toConsole, goConsole }
}

export type GeoHubBreadcrumb = { name: string; path: string }

export type GeoHubPageSeoInput = {
  title: string
  description: string
  keywords?: string
  path: string
  type?: 'website' | 'article'
  dateModified?: string
  datePublished?: string
  faqs?: { q: string; a: string }[]
  /** 这一页自己的步骤。有步骤才输出 HowTo，不复用首页的诊断步骤。 */
  steps?: { title: string; text: string }[]
  /** 面包屑：不含首页；首页会自动插在最前。缺省按 path 推断 learn/glossary。 */
  breadcrumbs?: GeoHubBreadcrumb[]
  /** 作者 id，默认机构作者 */
  authorId?: string
  /** 术语页：输出 DefinedTerm */
  definedTerm?: { name: string; description: string; short?: string }
}

function abs(siteUrl: string, path: string) {
  const base = siteUrl.replace(/\/+$/, '')
  if (!path || path === '/') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function inferBreadcrumbs(path: string, title: string): GeoHubBreadcrumb[] {
  const normalized = path.replace(/\/+$/, '') || '/'
  const learn = normalized.match(/^\/learn(?:\/([^/]+))?$/)
  if (learn) {
    const crumbs: GeoHubBreadcrumb[] = [{ name: '学习中心', path: '/learn' }]
    if (learn[1]) crumbs.push({ name: title.split('｜')[0], path: normalized })
    return crumbs
  }
  const gloss = normalized.match(/^\/glossary(?:\/([^/]+))?$/)
  if (gloss) {
    const crumbs: GeoHubBreadcrumb[] = [{ name: '术语表', path: '/glossary' }]
    if (gloss[1]) crumbs.push({ name: title.split('｜')[0], path: normalized })
    return crumbs
  }
  const report = normalized.match(/^\/reports(?:\/([^/]+))?$/)
  if (report) {
    const crumbs: GeoHubBreadcrumb[] = [{ name: '公开报告', path: '/reports' }]
    if (report[1]) crumbs.push({ name: title.split('｜')[0], path: normalized })
    return crumbs
  }
  return [{ name: title.split('｜')[0], path: normalized }]
}

function buildOrgNode(siteUrl: string, config: ReturnType<typeof useRuntimeConfig>) {
  const sameAs = [
    ...GEO_SITE.sameAs,
    ...String(config.public.geoSameAs || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    abs(siteUrl, '/about'),
  ]
  const org: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: GEO_SITE.name,
    legalName: GEO_SITE.legalName,
    alternateName: ['HANYUAI'],
    url: siteUrl,
    email: GEO_SITE.email,
    foundingDate: GEO_SITE.foundingDate,
    logo: {
      '@type': 'ImageObject',
      url: abs(siteUrl, GEO_SITE.logo.path),
      width: GEO_SITE.logo.width,
      height: GEO_SITE.logo.height,
    },
    publishingPrinciples: abs(siteUrl, '/about'),
    ethicsPolicy: abs(siteUrl, '/security'),
    ownershipFundingInfo: abs(siteUrl, '/about'),
    sameAs: [...new Set(sameAs)],
  }
  return org
}

function buildAuthorNode(author: GeoAuthor, siteUrl: string) {
  const id = `${siteUrl}/#author-${author.id}`
  if (author.kind === 'Organization') {
    return {
      '@type': 'Organization',
      '@id': id,
      name: author.name,
      url: abs(siteUrl, author.urlPath || '/'),
      ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
    }
  }
  return {
    '@type': 'Person',
    '@id': id,
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.short,
    url: abs(siteUrl, author.urlPath || '/'),
    worksFor: { '@id': `${siteUrl}/#organization` },
    ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
  }
}

export function useGeoHubPageSeo(input: MaybeRefOrGetter<GeoHubPageSeoInput>) {
  const current = computed(() => toValue(input))
  const siteUrl = useGeoSiteUrl()
  const config = useRuntimeConfig()
  const pageUrl = computed(() => abs(siteUrl.value, current.value.path))
  const ogImage = computed(() => abs(siteUrl.value, GEO_SITE.logo.path))
  const author = computed(() => getGeoAuthor(current.value.authorId))
  const published = computed(
    () => current.value.datePublished || GEO_CONTENT_STAMP.datePublished,
  )
  const modified = computed(
    () => current.value.dateModified || GEO_CONTENT_STAMP.dateModified,
  )
  const crumbs = computed(() => {
    const opts = current.value
    const list = opts.breadcrumbs?.length
      ? opts.breadcrumbs
      : inferBreadcrumbs(opts.path, opts.title)
    return list
  })

  const graph = computed(() => {
    const opts = current.value
    const base = siteUrl.value.replace(/\/+$/, '')
    const url = pageUrl.value
    const isProduct = opts.path.startsWith('/tools/')
    const isArticle = opts.type === 'article' || !!opts.definedTerm
    const hasSteps = !!opts.steps?.length
    const orgId = `${base}/#organization`
    const authorNode = buildAuthorNode(author.value, base)
    const authorId = authorNode['@id'] as string

    const breadcrumbItems = [
      { '@type': 'ListItem', position: 1, name: '首页', item: `${base}/` },
      ...crumbs.value.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.name,
        item: abs(base, c.path),
      })),
    ]

    const nodes: Record<string, unknown>[] = [
      buildOrgNode(base, config),
      authorNode,
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: opts.title,
        description: opts.description,
        inLanguage: 'zh-CN',
        isPartOf: { '@id': `${base}/#website` },
        dateModified: modified.value,
        datePublished: published.value,
        author: { '@id': authorId },
        publisher: { '@id': orgId },
        primaryImageOfPage: ogImage.value,
        breadcrumb: { '@id': `${url}#breadcrumb` },
        ...(isProduct
          ? {
              mainEntity: { '@id': `${url}#app` },
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['.stage h1', '.stage .lead'],
              },
            }
          : {}),
        ...(isArticle && !opts.definedTerm
          ? { mainEntity: { '@id': `${url}#article` } }
          : {}),
        ...(opts.definedTerm
          ? { mainEntity: { '@id': `${url}#definedterm` } }
          : {}),
        ...(hasSteps || opts.faqs?.length
          ? {
              hasPart: [
                ...(opts.faqs?.length ? [{ '@id': `${url}#faq` }] : []),
                ...(hasSteps ? [{ '@id': `${url}#howto` }] : []),
              ],
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ]

    if (opts.definedTerm) {
      nodes.push({
        '@type': 'DefinedTerm',
        '@id': `${url}#definedterm`,
        name: opts.definedTerm.name,
        description: opts.definedTerm.description,
        ...(opts.definedTerm.short ? { alternateName: opts.definedTerm.short } : {}),
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          '@id': `${base}/glossary#termset`,
          name: 'GEO 术语表',
          url: abs(base, '/glossary'),
        },
        url,
        inLanguage: 'zh-CN',
        dateModified: modified.value,
        datePublished: published.value,
        author: { '@id': authorId },
        publisher: { '@id': orgId },
        isPartOf: { '@id': `${url}#webpage` },
      })
    } else if (isArticle) {
      nodes.push({
        '@type': ['Article', 'TechArticle'],
        '@id': `${url}#article`,
        headline: opts.title,
        description: opts.description,
        keywords: opts.keywords,
        inLanguage: 'zh-CN',
        datePublished: published.value,
        dateModified: modified.value,
        mainEntityOfPage: { '@id': `${url}#webpage` },
        author: { '@id': authorId },
        publisher: {
          '@type': 'Organization',
          '@id': orgId,
          name: GEO_SITE.name,
          logo: {
            '@type': 'ImageObject',
            url: ogImage.value,
            width: GEO_SITE.logo.width,
            height: GEO_SITE.logo.height,
          },
        },
        image: [ogImage.value],
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.stage h1', '.stage .lead', '.hub-section h2', 'article h2'],
        },
      })
    }

    if (isProduct) {
      nodes.push({
        '@type': ['SoftwareApplication', 'WebApplication'],
        '@id': `${url}#app`,
        name: opts.title.split('｜')[0],
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        url,
        description: opts.description,
        image: ogImage.value,
        ...(opts.steps?.length ? { featureList: opts.steps.map((step) => step.title) } : {}),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
          availability: 'https://schema.org/InStock',
          url: `${url}#start`,
          description: '可在本页直接开始',
        },
      })
    }
    if (opts.steps?.length) {
      nodes.push({
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: `${opts.title.split('｜')[0]}怎么做`,
        description: opts.description,
        inLanguage: 'zh-CN',
        step: opts.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.title,
          text: step.text,
          url,
        })),
      })
    }
    if (opts.faqs?.length) {
      nodes.push({
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: opts.faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      })
    }
    return { '@context': 'https://schema.org', '@graph': nodes }
  })

  useHead(() => {
    const opts = current.value
    const authorName = author.value.name
    return {
      htmlAttrs: { lang: 'zh-CN' },
      title: opts.title,
      meta: [
        { name: 'description', content: opts.description },
        ...(opts.keywords ? [{ name: 'keywords', content: opts.keywords }] : []),
        { name: 'author', content: authorName },
        { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1' },
        { name: 'theme-color', content: '#16161a' },
        { property: 'og:type', content: opts.type === 'article' || opts.definedTerm ? 'article' : (opts.type || 'website') },
        { property: 'og:site_name', content: GEO_SITE.name },
        { property: 'og:url', content: pageUrl.value },
        { property: 'og:title', content: opts.title },
        { property: 'og:description', content: opts.description },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:image', content: ogImage.value },
        { property: 'og:image:width', content: String(GEO_SITE.logo.width) },
        { property: 'og:image:height', content: String(GEO_SITE.logo.height) },
        { property: 'og:image:alt', content: GEO_SITE.logo.caption },
        { property: 'article:published_time', content: published.value },
        { property: 'article:modified_time', content: modified.value },
        { property: 'article:author', content: authorName },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: opts.title },
        { name: 'twitter:description', content: opts.description },
        { name: 'twitter:image', content: ogImage.value },
        ...(GEO_SITE.twitter ? [{ name: 'twitter:site', content: GEO_SITE.twitter }] : []),
      ],
      link: [
        { rel: 'canonical', href: pageUrl.value },
        { rel: 'alternate', hreflang: 'zh-CN', href: pageUrl.value },
        { rel: 'alternate', hreflang: 'x-default', href: pageUrl.value },
      ],
      script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(graph.value) }],
    }
  })

  return {
    author,
    published,
    modified,
    crumbs,
  }
}
