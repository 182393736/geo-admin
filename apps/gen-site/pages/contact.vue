<template>
  <div class="site-page active" id="page-contact">
    <ContactPhero />
    <ContactV2sec />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "联系透镜GEO：产品咨询与商务合作｜透镜GEO",
  // design.css 中已有 `body.sub .bg-pattern { display: none }`，
  // 子页面借此隐藏首页的背景装饰层
  bodyAttrs: { class: 'sub' },
})
</script>
