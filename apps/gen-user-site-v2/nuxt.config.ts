// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  experimental: {
    appManifest: false,
  },

  css: ['~/assets/css/site.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'HANYUAI GEO助手｜让品牌被 AI 看见，让 GEO 增长可被验证',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'HANYUAI GEO助手将 AI 搜索可见性监测、品牌认知分析和内容引用优化放进同一张增长地图，帮助团队找到品牌被看见的原因与下一步动作。',
        },
        { name: 'theme-color', content: '#ffffff' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  vite: {
    server: {
      allowedHosts: true,
      watch: { usePolling: false, ignored: ['**/node_modules/**', '**/.git/**', '**/.nuxt/**', '**/.output/**'] },
    },
  },

  ignore: ['**/node_modules/**', '**/.git/**', '**/.output/**', '**/dist/**'],

  runtimeConfig: {
    public: {
      consoleUrl: process.env.NUXT_PUBLIC_CONSOLE_URL || 'http://127.0.0.1:5180',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/geo-api',
    },
  },

  routeRules: {
    '/geo-api/**': {
      proxy: `${process.env.NUXT_GEO_API_TARGET || 'http://127.0.0.1:6001'}/**`,
    },
  },
})
