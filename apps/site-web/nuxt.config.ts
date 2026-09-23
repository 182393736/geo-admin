// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  runtimeConfig: {
    // 服务端私有
    apiBase: process.env.NUXT_API_BASE || 'http://127.0.0.1:5001',
    indexNowKey: process.env.NUXT_INDEXNOW_KEY || '',
    geoIngestSecret: process.env.NUXT_GEO_INGEST_SECRET || '',
    public: {
      // 浏览器端可访问（如需）
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:5001',
      // GEO 落地页登录后跳转工作台（本地 dash-v2）
      consoleUrl: process.env.NUXT_PUBLIC_CONSOLE_URL || 'http://127.0.0.1:5180',
      geoApiBase: process.env.NUXT_PUBLIC_GEO_API_BASE || '/geo-api',
      // SEO / 规范 URL：本地默认本机前台
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:5003',
      baiduSiteVerification: process.env.NUXT_PUBLIC_BAIDU_SITE_VERIFICATION || '',
      googleSiteVerification: process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
      bingSiteVerification: process.env.NUXT_PUBLIC_BING_SITE_VERIFICATION || '',
      // 逗号分隔的品牌社交主页，写入 Organization.sameAs
      geoSameAs: process.env.NUXT_PUBLIC_GEO_SAME_AS || '',
      indexNowKeyPublic: process.env.NUXT_INDEXNOW_KEY || '',
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    server: {
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.nuxt/**', '**/.output/**'],
      },
    },
  },

  ignore: ['**/node_modules/**', '**/.git/**', '**/.output/**', '**/dist/**'],

  routeRules: {
    '/geo-api/**': {
      proxy: `${process.env.NUXT_GEO_API_TARGET || 'http://127.0.0.1:6001'}/**`,
    },
    '/': { prerender: false },
    '/insights/**': { prerender: false },
    '/robots.txt': { headers: { 'Cache-Control': 'public, max-age=3600' } },
    '/sitemap.xml': { headers: { 'Cache-Control': 'public, max-age=3600' } },
    '/sitemap-*.xml': { headers: { 'Cache-Control': 'public, max-age=3600' } },
    '/llms.txt': { headers: { 'Cache-Control': 'public, max-age=3600' } },
    '/product': { redirect: { to: '/tools', statusCode: 301 } },
    '/product/**': { redirect: { to: '/tools/**', statusCode: 301 } },
    '/tools': { prerender: false },
    '/tools/**': { prerender: false },
    '/learn/**': { prerender: false },
    '/glossary/**': { prerender: false },
    '/reports/**': { prerender: false },
    '/diagnose': { prerender: false },
  },
})
