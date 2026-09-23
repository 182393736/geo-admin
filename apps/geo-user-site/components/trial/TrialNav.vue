<template>
  <!-- 顶部导航：Logo + 返回首页 -->
  <nav class="trial-nav"><a class="trial-logo" href="/"><img class="trial-logo-image" alt="透镜GEO" :src="logoSrc">透镜GEO</a><a href="/" class="trial-nav-lk">返回首页</a></nav>
</template>

<script setup lang="ts">
// 资源放在 public/ 下；用动态绑定可避免 Vite 在构建期把它当模块导入解析
const logoSrc = '/trial-assets/a_e4fc38b37b.svg'
</script>
