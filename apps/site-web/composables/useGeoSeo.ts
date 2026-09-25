import { flagshipHome } from '~/utils/content/geo-flagship'
import type { CmsFlagshipBundle } from '~/utils/cms-flagship'
import {
  GEO_HOME_SEO,
  GEO_INSIGHTS,
  GEO_INSIGHTS_SEO,
  GEO_SERVICES,
  GEO_SITE,
  type GeoInsight,
} from '~/utils/geo-seo'

function absoluteUrl(siteUrl: string, path = '/') {
  const base = siteUrl.replace(/\/+$/, '')
  if (!path || path === '/') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function useGeoSiteUrl() {
  const config = useRuntimeConfig()
  return computed(() =>
    String(config.public.siteUrl || GEO_SITE.defaultSiteUrl).replace(/\/+$/, ''),
  )
}

function buildLogoImage(siteUrl: string) {
  return {
    '@type': 'ImageObject',
    '@id': `${siteUrl}/#logo`,
    url: absoluteUrl(siteUrl, GEO_SITE.logo.path),
    contentUrl: absoluteUrl(siteUrl, GEO_SITE.logo.path),
    width: GEO_SITE.logo.width,
    height: GEO_SITE.logo.height,
    caption: GEO_SITE.logo.caption,
    inLanguage: GEO_SITE.locale,
  }
}

function buildOrganization(
  siteUrl: string,
  config: ReturnType<typeof useRuntimeConfig>,
  site?: { companyZh?: string; companyEn?: string; brandZh?: string; brandEn?: string } | null,
) {
  const sameAs = [
    ...GEO_SITE.sameAs,
    ...String(config.public.geoSameAs || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  ]

  const legalName = site?.companyZh?.trim() || site?.companyEn?.trim() || GEO_SITE.legalName
  const orgName = site?.brandZh?.trim() || site?.brandEn?.trim() || GEO_SITE.name

  const org: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: orgName,
    legalName,
    alternateName: ['HANYUAI'].filter((n) => n !== orgName),
    url: siteUrl,
    email: GEO_SITE.email,
    foundingDate: GEO_SITE.foundingDate,
    brand: {
      '@type': 'Brand',
      name: site?.brandZh?.trim() || GEO_SITE.brand,
    },
    logo: buildLogoImage(siteUrl),
    image: buildLogoImage(siteUrl),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: GEO_SITE.email,
        availableLanguage: ['Chinese', 'zh-CN'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: GEO_SITE.partnerEmail,
        availableLanguage: ['Chinese', 'zh-CN'],
      },
    ],
    knowsAbout: [
      'GEO',
      'Generative Engine Optimization',
      '生成式引擎优化',
      'AI搜索可见性',
      'AI引用源分析',
    ],
    // 信任页锚点：便于 AI / 搜索把实体与政策页关联
    publishingPrinciples: absoluteUrl(siteUrl, '/about'),
    ethicsPolicy: absoluteUrl(siteUrl, '/security'),
    ownershipFundingInfo: absoluteUrl(siteUrl, '/about'),
  }

  // sameAs 只挂实体事实页与外部主页；隐私/条款用页脚与 publishingPrinciples，避免稀释身份信号
  const identitySameAs = [...sameAs, absoluteUrl(siteUrl, '/about')]
  const mergedSameAs = [...new Set(identitySameAs)]
  if (mergedSameAs.length) org.sameAs = mergedSameAs

  if (GEO_SITE.address) {
    org.address = {
      '@type': 'PostalAddress',
      ...GEO_SITE.address,
    }
  }

  return org
}

function buildSpeakable() {
  return {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.stage h1', '.stage .lead'],
  }
}

function richText(parts: { text?: string; br?: boolean }[]) {
  return parts.filter((part) => !part.br).map((part) => part.text || '').join('')
}

/** 首页完整 SEO + 扩展 JSON-LD。传入后台 pageData 时，标题、描述、问答和步骤改用配置。 */
export function useGeoHomeSeo(source?: MaybeRefOrGetter<CmsFlagshipBundle | null | undefined>) {
  const siteUrl = useGeoSiteUrl()
  const pageUrl = computed(() => absoluteUrl(siteUrl.value, '/'))
  const ogImage = computed(() => absoluteUrl(siteUrl.value, GEO_SITE.logo.path))
  const config = useRuntimeConfig()
  const sitePage = useSitePage()
  const cmsSite = computed(() => sitePage.value?.site)
  const bundle = computed(() => (source ? toValue(source) : null) || null)

  const graph = computed(() => {
    const home = bundle.value?.flagship ?? flagshipHome
    const seoTitle = bundle.value?.seo.title || GEO_HOME_SEO.title
    const seoDescription = bundle.value?.seo.description || GEO_HOME_SEO.description
    const url = pageUrl.value
    const base = siteUrl.value
    const orgId = `${base}/#organization`
    const appId = `${base}/#software`
    const productId = `${base}/#product`
    const websiteId = `${base}/#website`
    const webpageId = `${url}#webpage`
    const howtoId = `${url}#howto-diagnose`
    const serviceCatalogId = `${url}#service-catalog`
    const galleryId = `${url}#image-gallery`
    const logo = buildLogoImage(base)

    const nodes: Record<string, unknown>[] = [
      buildOrganization(base, config, cmsSite.value),
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: base,
        name: GEO_SITE.name,
        description: seoDescription,
        inLanguage: GEO_SITE.locale,
        publisher: { '@id': orgId },
        about: { '@id': appId },
      },
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url,
        name: seoTitle,
        description: seoDescription,
        inLanguage: GEO_SITE.locale,
        isPartOf: { '@id': websiteId },
        about: [{ '@id': appId }, { '@id': productId }],
        primaryImageOfPage: logo,
        datePublished: GEO_SITE.datePublished,
        dateModified: GEO_SITE.dateModified,
        speakable: buildSpeakable(),
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: '首页',
              item: url,
            },
          ],
        },
        hasPart: [
          { '@id': `${url}#faq` },
          { '@id': howtoId },
          { '@id': serviceCatalogId },
          { '@id': galleryId },
        ],
      },
      {
        '@type': ['SoftwareApplication', 'WebApplication'],
        '@id': appId,
        name: GEO_SITE.name,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Generative Engine Optimization',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        url,
        description: seoDescription,
        inLanguage: GEO_SITE.locale,
        image: logo,
        screenshot: logo,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(base, '/#start'),
          description: '可在本页直接开始',
        },
        featureList: [
          '免费 AI 可见性监测',
          '免费 AI 竞品透视',
          '免费 AI 引用源分析',
          '免费 AI 口碑分析',
          '免费 GEO 发稿',
          '免费 GEO Agent',
          '免费 GEO 诊断',
          '免费品牌实体核对',
        ],
        creator: { '@id': orgId },
        publisher: { '@id': orgId },
        isRelatedTo: GEO_SERVICES.map((s) => ({ '@id': `${base}/#service-${s.id}` })),
      },
      {
        '@type': 'Product',
        '@id': productId,
        name: GEO_SITE.name,
        description: seoDescription,
        brand: { '@type': 'Brand', name: GEO_SITE.brand },
        category: 'GEO优化 / AI搜索可见性工具',
        image: logo,
        url,
        sku: 'hanyuai-geo-assistant',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(base, '/#start'),
          description: '可在本页直接开始',
          priceValidUntil: '2027-12-31',
        },
        isRelatedTo: { '@id': appId },
      },
      {
        '@type': 'OfferCatalog',
        '@id': serviceCatalogId,
        name: 'HANYUAI GEO 服务与能力',
        itemListElement: GEO_SERVICES.map((service, index) => ({
          '@type': 'Offer',
          position: index + 1,
          itemOffered: {
            '@type': 'Service',
            '@id': `${base}/#service-${service.id}`,
            name: service.name,
            description: service.description,
            url: absoluteUrl(base, service.url),
            provider: { '@id': orgId },
            serviceType: 'Generative Engine Optimization',
            areaServed: {
              '@type': 'Country',
              name: 'CN',
            },
            availableChannel: {
              '@type': 'ServiceChannel',
              serviceUrl: absoluteUrl(base, service.url),
            },
          },
          ...(service.price != null
            ? {
                price: service.price,
                priceCurrency: 'CNY',
                availability: 'https://schema.org/InStock',
              }
            : {}),
        })),
      },
      {
        '@type': 'HowTo',
        '@id': howtoId,
        name: richText(home.loopTitle),
        description: richText(home.loopDeck),
        inLanguage: GEO_SITE.locale,
        image: logo,
        estimatedCost: {
          '@type': 'MonetaryAmount',
          currency: 'CNY',
          value: '0',
        },
        tool: {
          '@type': 'HowToTool',
          name: GEO_SITE.name,
        },
        step: home.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.title,
          text: `${step.sub}。${step.body}`,
          url,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        isPartOf: { '@id': webpageId },
        mainEntity: (bundle.value?.faqs || home.faqs).map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
      {
        '@type': 'ImageGallery',
        '@id': galleryId,
        name: 'GEO 产品与报告示意',
        description: 'AI 可见性快照与 GEO 报告相关示意素材',
        isPartOf: { '@id': webpageId },
        image: [
          {
            ...logo,
            '@id': `${base}/#img-og`,
            name: 'GEO 品牌主视觉',
            caption: GEO_SITE.logo.caption,
          },
          {
            '@type': 'ImageObject',
            '@id': `${base}/#img-visibility-snapshot`,
            url: absoluteUrl(base, GEO_SITE.logo.path),
            contentUrl: absoluteUrl(base, GEO_SITE.logo.path),
            width: GEO_SITE.logo.width,
            height: GEO_SITE.logo.height,
            name: 'AI 可见性快照示意',
            caption: '示例品牌 AI 搜索可见性快照（示意）',
            inLanguage: GEO_SITE.locale,
          },
          {
            '@type': 'ImageObject',
            '@id': `${base}/#img-report`,
            url: absoluteUrl(base, GEO_SITE.logo.path),
            contentUrl: absoluteUrl(base, GEO_SITE.logo.path),
            width: GEO_SITE.logo.width,
            height: GEO_SITE.logo.height,
            name: 'GEO 报告示例示意',
            caption: 'GEO 报告综合概览示意（脱敏示例）',
            inLanguage: GEO_SITE.locale,
          },
        ],
      },
    ]

    if (GEO_SITE.demoVideoUrl) {
      nodes.push({
        '@type': 'VideoObject',
        '@id': `${base}/#demo-video`,
        name: GEO_SITE.demoVideoName,
        description: GEO_SITE.demoVideoDescription,
        thumbnailUrl: absoluteUrl(base, GEO_SITE.logo.path),
        contentUrl: GEO_SITE.demoVideoUrl,
        embedUrl: GEO_SITE.demoVideoUrl,
        uploadDate: GEO_SITE.datePublished,
        inLanguage: GEO_SITE.locale,
        publisher: { '@id': orgId },
      })
    }

    if (GEO_SITE.address) {
      nodes.push({
        '@type': 'LocalBusiness',
        '@id': `${base}/#localbusiness`,
        name: GEO_SITE.name,
        url: base,
        email: GEO_SITE.email,
        image: logo,
        address: {
          '@type': 'PostalAddress',
          ...GEO_SITE.address,
        },
        parentOrganization: { '@id': orgId },
      })
    }

    return {
      '@context': 'https://schema.org',
      '@graph': nodes,
    }
  })

  const baiduVerify = computed(() => String(config.public.baiduSiteVerification || ''))
  const googleVerify = computed(() => String(config.public.googleSiteVerification || ''))
  const bingVerify = computed(() => String(config.public.bingSiteVerification || ''))

  useHead(() => {
    const seoTitle = bundle.value?.seo.title || GEO_HOME_SEO.title
    const seoDescription = bundle.value?.seo.description || GEO_HOME_SEO.description
    const seoKeywords = bundle.value?.seo.keywords || GEO_HOME_SEO.keywords
    const url = pageUrl.value
    const image = ogImage.value

    return {
      htmlAttrs: { lang: GEO_SITE.locale },
      title: seoTitle,
      meta: [
        { name: 'description', content: seoDescription },
        { name: 'keywords', content: seoKeywords },
        { name: 'author', content: GEO_SITE.name },
        { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' },
        { name: 'googlebot', content: 'index,follow' },
        { name: 'bingbot', content: 'index,follow' },
        { name: 'baiduspider', content: 'index,follow' },
        { name: 'theme-color', content: '#2563eb' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'applicable-device', content: 'pc,mobile' },
        { name: 'MobileOptimized', content: 'width' },
        { name: 'HandheldFriendly', content: 'true' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: GEO_SITE.name },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:url', content: url },
        { property: 'og:title', content: seoTitle },
        { property: 'og:description', content: seoDescription },
        { property: 'og:image', content: image },
        { property: 'og:image:width', content: String(GEO_SITE.logo.width) },
        { property: 'og:image:height', content: String(GEO_SITE.logo.height) },
        { property: 'og:image:alt', content: GEO_SITE.logo.caption },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: seoTitle },
        { name: 'twitter:description', content: seoDescription },
        { name: 'twitter:image', content: image },
        ...(GEO_SITE.twitter ? [{ name: 'twitter:site', content: GEO_SITE.twitter }] : []),
        ...(baiduVerify.value ? [{ name: 'baidu-site-verification', content: baiduVerify.value }] : []),
        ...(googleVerify.value ? [{ name: 'google-site-verification', content: googleVerify.value }] : []),
        ...(bingVerify.value ? [{ name: 'msvalidate.01', content: bingVerify.value }] : []),
      ],
      link: [
        { rel: 'canonical', href: url },
        { rel: 'alternate', hreflang: 'zh-CN', href: url },
        { rel: 'alternate', hreflang: 'x-default', href: url },
        { rel: 'sitemap', type: 'application/xml', href: absoluteUrl(siteUrl.value, '/sitemap.xml') },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(graph.value),
        },
      ],
    }
  })
}

/** /insights 合集页：CollectionPage + Blog + ItemList */
export function useGeoInsightsIndexSeo() {
  const siteUrl = useGeoSiteUrl()
  const pageUrl = computed(() => absoluteUrl(siteUrl.value, '/insights'))
  const ogImage = computed(() => absoluteUrl(siteUrl.value, GEO_SITE.logo.path))
  const config = useRuntimeConfig()
  const sitePage = useSitePage()

  const graph = computed(() => {
    const base = siteUrl.value
    const url = pageUrl.value
    const orgId = `${base}/#organization`
    const logo = buildLogoImage(base)

    return {
      '@context': 'https://schema.org',
      '@graph': [
        buildOrganization(base, config, sitePage.value?.site),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: '首页',
              item: absoluteUrl(base, '/'),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'GEO 指南',
              item: url,
            },
          ],
        },
        {
          '@type': ['CollectionPage', 'Blog'],
          '@id': `${url}#collection`,
          url,
          name: GEO_INSIGHTS_SEO.title,
          description: GEO_INSIGHTS_SEO.description,
          inLanguage: GEO_SITE.locale,
          isPartOf: { '@id': `${base}/#website` },
          about: {
            '@type': 'Thing',
            name: 'GEO / Generative Engine Optimization',
          },
          primaryImageOfPage: logo,
          dateModified: GEO_SITE.dateModified,
          publisher: { '@id': orgId },
          blogPost: GEO_INSIGHTS.map((article) => ({
            '@type': 'BlogPosting',
            '@id': `${absoluteUrl(base, `/insights/${article.slug}`)}#article`,
            headline: article.title,
            description: article.description,
            datePublished: article.datePublished,
            dateModified: article.dateModified,
            url: absoluteUrl(base, `/insights/${article.slug}`),
          })),
          mainEntity: {
            '@type': 'ItemList',
            '@id': `${url}#itemlist`,
            numberOfItems: GEO_INSIGHTS.length,
            itemListElement: GEO_INSIGHTS.map((article, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl(base, `/insights/${article.slug}`),
              name: article.title,
              item: {
                '@type': 'BlogPosting',
                '@id': `${absoluteUrl(base, `/insights/${article.slug}`)}#article`,
                headline: article.title,
                description: article.description,
                datePublished: article.datePublished,
                dateModified: article.dateModified,
                url: absoluteUrl(base, `/insights/${article.slug}`),
              },
            })),
          },
        },
      ],
    }
  })

  useHead(() => ({
    htmlAttrs: { lang: GEO_SITE.locale },
    title: GEO_INSIGHTS_SEO.title,
    meta: [
      { name: 'description', content: GEO_INSIGHTS_SEO.description },
      { name: 'keywords', content: GEO_INSIGHTS_SEO.keywords },
      { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: GEO_SITE.name },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:url', content: pageUrl.value },
      { property: 'og:title', content: GEO_INSIGHTS_SEO.title },
      { property: 'og:description', content: GEO_INSIGHTS_SEO.description },
      { property: 'og:image', content: ogImage.value },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: GEO_INSIGHTS_SEO.title },
      { name: 'twitter:description', content: GEO_INSIGHTS_SEO.description },
      { name: 'twitter:image', content: ogImage.value },
    ],
    link: [
      { rel: 'canonical', href: pageUrl.value },
      { rel: 'alternate', hreflang: 'zh-CN', href: pageUrl.value },
      { rel: 'alternate', hreflang: 'x-default', href: pageUrl.value },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(graph.value),
      },
    ],
  }))
}

/** 洞察文章页 SEO + BlogPosting JSON-LD */
export function useGeoInsightSeo(articleSource: MaybeRefOrGetter<GeoInsight | null | undefined>) {
  const siteUrl = useGeoSiteUrl()
  const config = useRuntimeConfig()
  const sitePage = useSitePage()
  const article = computed(() => toValue(articleSource) || null)
  const pageUrl = computed(() =>
    article.value ? absoluteUrl(siteUrl.value, `/insights/${article.value.slug}`) : siteUrl.value,
  )
  const ogImage = computed(() => absoluteUrl(siteUrl.value, GEO_SITE.logo.path))
  const title = computed(() =>
    article.value
      ? `${article.value.title}｜GEO优化指南 - ${GEO_SITE.name}`
      : GEO_SITE.name,
  )

  const graph = computed(() => {
    if (!article.value) return null
    const current = article.value
    const base = siteUrl.value
    const orgId = `${base}/#organization`
    const logo = buildLogoImage(base)

    return {
      '@context': 'https://schema.org',
      '@graph': [
        buildOrganization(base, config, sitePage.value?.site),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: '首页',
              item: absoluteUrl(base, '/'),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'GEO 指南',
              item: absoluteUrl(base, '/insights'),
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: current.title,
              item: pageUrl.value,
            },
          ],
        },
        {
          '@type': ['BlogPosting', 'Article'],
          '@id': `${pageUrl.value}#article`,
          headline: current.title,
          description: current.description,
          keywords: current.keywords.join(','),
          inLanguage: GEO_SITE.locale,
          datePublished: current.datePublished,
          dateModified: current.dateModified,
          wordCount: current.sections.reduce(
            (sum, section) =>
              sum + section.heading.length + section.paragraphs.join('').length,
            0,
          ),
          timeRequired: `PT${current.readingMinutes}M`,
          articleSection: current.category,
          author: {
            '@type': 'Organization',
            '@id': orgId,
            name: GEO_SITE.name,
            url: base,
          },
          publisher: {
            '@type': 'Organization',
            '@id': orgId,
            name: GEO_SITE.name,
            logo,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': pageUrl.value,
          },
          image: [
            {
              ...logo,
              caption: current.title,
            },
          ],
          isPartOf: {
            '@type': 'Blog',
            '@id': `${absoluteUrl(base, '/insights')}#collection`,
            name: GEO_INSIGHTS_SEO.title,
            url: absoluteUrl(base, '/insights'),
          },
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['.insight-header h1', '.insight-lead', '.insight-section h2'],
          },
        },
      ],
    }
  })

  useHead(() => {
    if (!article.value || !graph.value) return {}
    return {
      htmlAttrs: { lang: GEO_SITE.locale },
      title: title.value,
      meta: [
        { name: 'description', content: article.value.description },
        { name: 'keywords', content: article.value.keywords.join(',') },
        { name: 'author', content: GEO_SITE.name },
        { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1' },
        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: GEO_SITE.name },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:url', content: pageUrl.value },
        { property: 'og:title', content: title.value },
        { property: 'og:description', content: article.value.description },
        { property: 'og:image', content: ogImage.value },
        { property: 'og:image:width', content: String(GEO_SITE.logo.width) },
        { property: 'og:image:height', content: String(GEO_SITE.logo.height) },
        { property: 'article:published_time', content: article.value.datePublished },
        { property: 'article:modified_time', content: article.value.dateModified },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title.value },
        { name: 'twitter:description', content: article.value.description },
        { name: 'twitter:image', content: ogImage.value },
      ],
      link: [
        { rel: 'canonical', href: pageUrl.value },
        { rel: 'alternate', hreflang: 'zh-CN', href: pageUrl.value },
        { rel: 'alternate', hreflang: 'x-default', href: pageUrl.value },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(graph.value),
        },
      ],
    }
  })
}
