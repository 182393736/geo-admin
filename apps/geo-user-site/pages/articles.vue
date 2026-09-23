<template>
  <div class="site-page active" id="page-academy">
    <ArticlesPhero />
    <ArticlesV2sec />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "GEO 深度文章与 AI 搜索优化指南｜透镜GEO",
  // design.css 中已有 `body.sub .bg-pattern { display: none }`，
  // 子页面借此隐藏首页的背景装饰层
  bodyAttrs: { class: 'sub' },
})
</script>
