<template>
  <div class="site-page active" id="page-pricing">
    <PricingPhero />
    <PricingV2sec />
    <PricingV2sec2 />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "GEO 监测系统与软件价格：平台套餐与免费版费用｜透镜GEO",
  // design.css 中已有 `body.sub .bg-pattern { display: none }`，
  // 子页面借此隐藏首页的背景装饰层
  bodyAttrs: { class: 'sub' },
})
</script>
