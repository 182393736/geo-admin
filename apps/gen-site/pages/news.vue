<template>
  <div class="site-page active" id="page-news">
    <NewsPhero />
    <NewsV2sec />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "GEO 行业资讯与 AI 搜索动态｜透镜GEO",
  // design.css 中已有 `body.sub .bg-pattern { display: none }`，
  // 子页面借此隐藏首页的背景装饰层
  bodyAttrs: { class: 'sub' },
})
</script>
