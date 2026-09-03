// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  // 抓取自 geo.timus.cn 的原始样式，引入顺序与原站 <head> 完全一致，保证层叠结果不变。
  // 注意：原站下发顺序是 design.css → 重置/变量块 → 页面级内联样式，
  // 其中存在后置覆盖（如 .hero-sub{font-weight:600} 覆盖 design.css 里的 200），
  // 顺序一旦颠倒层叠结果就会变化，请勿调整。
  css: [
    '~/assets/css/design.css',   // 主样式表 design.css（最先下发）
    '~/assets/css/tokens.css',   // 重置 + 设计变量（:root）及后置覆盖
    '~/assets/css/sections.css', // 随页面内联下发的组件级样式
    '~/assets/css/auth.css',     // 登录弹窗 .shared-auth-*（必须排在最后）
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '透镜GEO - 专业的AI搜索品牌数据检测与智能决策平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'AI 流量时代，别让品牌"隐形"——告诉我你的品牌，立即免费分析它在豆包、DeepSeek、通义千问等大模型中的真实排名。',
        },
        { name: 'theme-color', content: '#fafafb' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/i_e4fc38b37b.svg' }],
    },
  },

  // 容器 / 代理域名下访问 dev server 时放行（Vite 默认拒绝未知 host）
  vite: { server: { allowedHosts: true } },

  // GEO API（apps/gen-api, Egg.js）接线：
  //  - 开发/Node 运行时走同域代理 /geo-api/**（规避 CORS，SSE 可流式透传）
  //  - 静态部署时把 NUXT_PUBLIC_API_BASE 指到完整 API 地址（API 侧已开 CORS 兜底）
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/geo-api',
      // 分析完成后「前往控制台」落地地址：控制台 = apps/gen-user-dash 用户后台（vite dev 默认 5173），可用 NUXT_PUBLIC_CONSOLE_URL 覆盖
      consoleUrl: process.env.NUXT_PUBLIC_CONSOLE_URL || 'http://127.0.0.1:5173',
    },
  },
  routeRules: {
    '/geo-api/**': {
      proxy: `${process.env.NUXT_GEO_API_TARGET || 'http://127.0.0.1:7001'}/**`,
    },
  },
})
