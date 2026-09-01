<template>
  <div class="original-design-root">
    <SiteBackground />
    <SiteHeader />
    <main>
      <slot />
    </main>
    <SiteFooter />
    <SiteToast />
  </div>
</template>

<script setup lang="ts">
// 页面内容挂载后启动滚动渐显（替代原站 design-runtime.js）
onMounted(() => { nextTick(() => useReveal()) })
</script>
