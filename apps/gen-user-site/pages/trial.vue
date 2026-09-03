<template>
  <div id="root">
    <div class="trial-root">
      <TrialDecor />
      <TrialNav />
      <div class="trial-page">
        <TrialChat />
      </div>
      <!-- 登录弹窗（Teleported）；表单提交时若未登录会自动唤起，成功后接续分析 -->
      <SiteAuthModal />
    </div>
  </div>
</template>

<script setup lang="ts">
// /trial 在线上是独立的 React SPA（Tailwind + 页面内联样式），
// 与官网首页不是同一套样式体系，因此：
// 1) 用 layout: false 脱离首页的导航/页脚外壳
// 2) 样式按需加载，避免 Tailwind preflight 影响首页
definePageMeta({ layout: false })

useHead({
  htmlAttrs: { lang: 'zh-CN' },
  title: '透镜GEO - 免费分析你的品牌在 AI 中的真实排名',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      name: 'description',
      content: '告诉我你的品牌，立即免费分析它在豆包、DeepSeek、通义千问等大模型中的真实排名。',
    },
    { name: 'theme-color', content: '#fafafb' },
  ],
  link: [{ rel: 'stylesheet', href: '/css/trial.css' }],
  bodyAttrs: { class: 'trial-body' },
})
</script>
