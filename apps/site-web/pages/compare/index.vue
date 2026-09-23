<script setup lang="ts">
import { GEO_COMPARE_PAGES } from '~/utils/content/solutions'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: 'GEO 对比｜GEO vs SEO、监测 vs 诊断',
  description: '品类与能力对比页：GEO 与 SEO、持续监测与单次诊断、平台与人工抽样。',
  keywords: 'GEO对比,GEO vs SEO,GEO工具对比',
  path: '/compare',
})
</script>

<template>
  <GeoHubPage eyebrow="对比" title="品类与能力对比" description="用同一表格结构说明差异与适用边界，避免口号式对比。">
    <div class="list">
      <NuxtLink v-for="c in GEO_COMPARE_PAGES" :key="c.slug" :to="`/compare/${c.slug}`" class="card card-hover">
        <div class="card-header">
          <div class="card-title">{{ c.title.split('｜')[0] }}</div>
          <div class="card-description">{{ c.summary }}</div>
        </div>
      </NuxtLink>
    </div>
  </GeoHubPage>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 0.75rem; }
</style>
