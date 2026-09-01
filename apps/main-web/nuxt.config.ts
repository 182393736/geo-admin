// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  app: {
    head: {
      title: '透镜GEO - 专业的AI搜索品牌数据检测与智能决策平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '透镜GEO 2.0：中立 GEO 监测 + 优化闭环平台。中立监测、洞察建议、循证写作 Agent、精准发稿 11 万+渠道、效果归因。' },
        { name: 'keywords', content: 'GEO,生成式引擎优化,AI搜索排名,品牌监测,AI引用,精凊发稿' },
        { property: 'og:title', content: '透镜GEO - 专业的AI搜索品牌数据检测平台' },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#6366f1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  typescript: { shim: false, strict: false },
  devtools: { enabled: false },
  compatibilityDate: '2024-08-01',
});
