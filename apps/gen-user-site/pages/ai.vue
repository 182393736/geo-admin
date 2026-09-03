<template>
  <div class="site-page active" id="page-ai">
    <AiPhero />
    <AiV2sec />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "AI Instructions：面向 AI 爬虫的开放策略｜透镜GEO",
  // design.css 中已有 `body.sub .bg-pattern { display: none }`，
  // 子页面借此隐藏首页的背景装饰层
  bodyAttrs: { class: 'sub' },
})
</script>
