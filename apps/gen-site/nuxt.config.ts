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
})
