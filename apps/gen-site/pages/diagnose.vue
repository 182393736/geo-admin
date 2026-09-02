<template>
  <div class="site-page active" id="page-diagnose">
    <DiagnoseDiagband />
    <DiagnoseV2sec />
    <DiagnoseV2sec2 />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "GEO检测监测系统：AI可见度在线查询与竞品分析免费工具｜透镜GEO",
  // design.css 中已有 `body.sub .bg-pattern { display: none }`，
  // 子页面借此隐藏首页的背景装饰层
  bodyAttrs: { class: 'sub' },
})
</script>
