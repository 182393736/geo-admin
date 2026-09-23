import {
  consoleHref,
  isFlagshipHostWithSiteUrl,
  isGeoHubPath,
} from '~/utils/geo-hub'
import { GEO_SITE } from '~/utils/geo-seo'

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

export function useGeoHubPageSeo(input: MaybeRefOrGetter<{
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
}>) {
  const current = computed(() => toValue(input))
  const siteUrl = useGeoSiteUrl()
  const pageUrl = computed(() => {
    const base = siteUrl.value.replace(/\/+$/, '')
    const path = current.value.path.startsWith('/') ? current.value.path : `/${current.value.path}`
    return path === '/' ? `${base}/` : `${base}${path}`
  })

  const ogImage = computed(() => `${siteUrl.value.replace(/\/+$/, '')}${GEO_SITE.logo.path}`)

  const graph = computed(() => {
    const opts = current.value
    const isProduct = opts.path.startsWith('/tools/')
    const hasSteps = !!opts.steps?.length
    const nodes: Record<string, unknown>[] = [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl.value}#webpage`,
        url: pageUrl.value,
        name: opts.title,
        description: opts.description,
        inLanguage: 'zh-CN',
        isPartOf: { '@id': `${siteUrl.value}/#website` },
        dateModified: opts.dateModified || '2026-09-20',
        datePublished: opts.datePublished || opts.dateModified || '2026-09-20',
        ...(isProduct
          ? {
              mainEntity: { '@id': `${pageUrl.value}#app` },
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['.stage h1', '.stage .lead'],
              },
              primaryImageOfPage: ogImage.value,
            }
          : {}),
        ...(hasSteps || opts.faqs?.length
          ? {
              hasPart: [
                ...(opts.faqs?.length ? [{ '@id': `${pageUrl.value}#faq` }] : []),
                ...(hasSteps ? [{ '@id': `${pageUrl.value}#howto` }] : []),
              ],
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: `${siteUrl.value}/` },
          { '@type': 'ListItem', position: 2, name: opts.title, item: pageUrl.value },
        ],
      },
    ]
    if (isProduct) {
      nodes.push({
        '@type': ['SoftwareApplication', 'WebApplication'],
        '@id': `${pageUrl.value}#app`,
        name: opts.title.split('｜')[0],
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        url: pageUrl.value,
        description: opts.description,
        image: ogImage.value,
        ...(opts.steps?.length ? { featureList: opts.steps.map((step) => step.title) } : {}),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
          availability: 'https://schema.org/InStock',
          url: `${pageUrl.value}#start`,
          description: '可在本页直接开始',
        },
      })
    }
    if (opts.steps?.length) {
      nodes.push({
        '@type': 'HowTo',
        '@id': `${pageUrl.value}#howto`,
        name: `${opts.title.split('｜')[0]}怎么做`,
        description: opts.description,
        inLanguage: 'zh-CN',
        step: opts.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.title,
          text: step.text,
          url: pageUrl.value,
        })),
      })
    }
    if (opts.faqs?.length) {
      nodes.push({
        '@type': 'FAQPage',
        '@id': `${pageUrl.value}#faq`,
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
    return {
    htmlAttrs: { lang: 'zh-CN' },
    title: opts.title,
    meta: [
      { name: 'description', content: opts.description },
      ...(opts.keywords ? [{ name: 'keywords', content: opts.keywords }] : []),
      { name: 'author', content: GEO_SITE.name },
      { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1' },
      { name: 'theme-color', content: '#2563eb' },
      { property: 'og:type', content: opts.type || 'website' },
      { property: 'og:site_name', content: GEO_SITE.name },
      { property: 'og:url', content: pageUrl.value },
      { property: 'og:title', content: opts.title },
      { property: 'og:description', content: opts.description },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:image', content: ogImage.value },
      { property: 'og:image:width', content: String(GEO_SITE.logo.width) },
      { property: 'og:image:height', content: String(GEO_SITE.logo.height) },
      { property: 'og:image:alt', content: GEO_SITE.logo.caption },
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
}

