<template>
  <div class="site-page active" id="page-reports">
    <ResourcesPhero />
    <ResourcesV2sec />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "GEO 研究报告与引用源数据｜透镜GEO",
  // design.css 中已有 `body.sub .bg-pattern { display: none }`，
  // 子页面借此隐藏首页的背景装饰层
  bodyAttrs: { class: 'sub' },
})
</script>
