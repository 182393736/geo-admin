import {
  GEO_GLOSSARY,
  GEO_LEARN_PAGES,
  GEO_REPORTS,
  GEO_FUNCTIONAL_SLUGS,
  PUBLIC_LEARN_SLUGS,
  PUBLIC_GLOSSARY_SLUGS,
} from '../../utils/geo-hub'
import { GEO_INSIGHTS, GEO_SITE } from '../../utils/geo-seo'
import { GEO_SOLUTIONS, GEO_COMPARE_PAGES } from '../../utils/content/solutions'
import { GEO_CUSTOMER_STORIES } from '../../utils/content/ecosystem'
import { GEO_SHARED_REPORTS } from '../../utils/content/authority'

function siteBase(config: ReturnType<typeof useRuntimeConfig>) {
  return String(config.public.siteUrl || GEO_SITE.defaultSiteUrl).replace(/\/+$/, '')
}

function urlset(
  urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[],
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || GEO_SITE.dateModified}</lastmod>
    <changefreq>${u.changefreq || 'monthly'}</changefreq>
    <priority>${u.priority || '0.6'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
}

/** 枢纽与转化页（不含已拆到其它 sitemap 的栏目） */
export function buildCoreUrls(siteUrl: string) {
  const paths = [
    '/',
    '/diagnose',
    '/pricing',
    '/contact',
    '/demo',
    '/about',
    '/security',
    '/privacy',
    '/terms',
    '/integrations',
    '/partners',
  ]
  return paths.map((path) => ({
    loc: path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`,
    lastmod: GEO_SITE.dateModified,
    changefreq: path === '/' || path === '/diagnose' ? 'weekly' : 'monthly',
    priority: path === '/' ? '1.0' : path === '/diagnose' ? '0.95' : '0.7',
  }))
}

export function buildPublicUrls(siteUrl: string) {
  return [
    { loc: `${siteUrl}/`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '1.0' },
    { loc: `${siteUrl}/tools`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '0.95' },
    ...GEO_FUNCTIONAL_SLUGS.map((slug) => ({
      loc: `${siteUrl}/tools/${slug}`,
      lastmod: GEO_SITE.dateModified,
      changefreq: 'weekly',
      priority: '0.9',
    })),
  ]
}

export function buildLearnUrls(siteUrl: string) {
  const learnSlugs = new Set(PUBLIC_LEARN_SLUGS as readonly string[])
  const glossSlugs = new Set(PUBLIC_GLOSSARY_SLUGS as readonly string[])
  return [
    { loc: `${siteUrl}/learn`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '0.9' },
    ...GEO_LEARN_PAGES.filter(p => learnSlugs.has(p.slug)).map(p => ({
      loc: `${siteUrl}/learn/${p.slug}`,
      lastmod: GEO_SITE.dateModified,
      changefreq: 'monthly',
      priority: p.slug === 'what-is-geo' ? '0.95' : '0.85',
    })),
    { loc: `${siteUrl}/glossary`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '0.9' },
    ...GEO_GLOSSARY.filter(t => glossSlugs.has(t.slug)).map(t => ({
      loc: `${siteUrl}/glossary/${t.slug}`,
      lastmod: GEO_SITE.dateModified,
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ]
}

export function buildInsightsUrls(siteUrl: string) {
  return [
    { loc: `${siteUrl}/insights`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '0.9' },
    ...GEO_INSIGHTS.map((article) => ({
      loc: `${siteUrl}/insights/${article.slug}`,
      lastmod: article.dateModified,
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ]
}

export function buildReportsUrls(siteUrl: string) {
  return [
    { loc: `${siteUrl}/reports`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '0.9' },
    { loc: `${siteUrl}/benchmarks`, lastmod: GEO_SITE.dateModified, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/engines`, lastmod: GEO_SITE.dateModified, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/changelog`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '0.6' },
    ...GEO_REPORTS.map((r) => ({
      loc: `${siteUrl}/reports/${r.slug}`,
      lastmod: r.dateModified,
      changefreq: 'monthly',
      priority: '0.85',
    })),
    ...GEO_SHARED_REPORTS.map((r) => ({
      loc: `${siteUrl}/reports/shared/${r.id}`,
      lastmod: r.dateModified,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ]
}

export function buildEcosystemUrls(siteUrl: string) {
  return [
    { loc: `${siteUrl}/solutions`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '0.85' },
    ...GEO_SOLUTIONS.map((s) => ({
      loc: `${siteUrl}/solutions/${s.slug}`,
      lastmod: GEO_SITE.dateModified,
      changefreq: 'monthly',
      priority: '0.8',
    })),
    { loc: `${siteUrl}/compare`, lastmod: GEO_SITE.dateModified, changefreq: 'weekly', priority: '0.85' },
    ...GEO_COMPARE_PAGES.map((c) => ({
      loc: `${siteUrl}/compare/${c.slug}`,
      lastmod: GEO_SITE.dateModified,
      changefreq: 'monthly',
      priority: '0.8',
    })),
    { loc: `${siteUrl}/customers`, lastmod: GEO_SITE.dateModified, changefreq: 'monthly', priority: '0.75' },
    ...GEO_CUSTOMER_STORIES.map((c) => ({
      loc: `${siteUrl}/customers/${c.slug}`,
      lastmod: GEO_SITE.dateModified,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ]
}

export { siteBase, urlset }
