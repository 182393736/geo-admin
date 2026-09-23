<script setup lang="ts">
import { GEO_CHANGELOG } from '~/utils/geo-hub'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '更新日志｜口径与产品同步',
  description: '记录流量站 IA、报告口径与产品文案对齐变更，便于引用方追踪 dateModified。',
  keywords: 'GEO更新日志,changelog',
  path: '/changelog',
})
</script>

<template>
  <GeoHubPage
    eyebrow="变更"
    title="更新日志"
    description="公开记录方法口径与站点结构变更。重大指标定义变更会同步 Learn / Product 文案。"
  >
    <article v-for="entry in GEO_CHANGELOG" :key="entry.date" class="entry">
      <h2><time :datetime="entry.date">{{ entry.date }}</time> · {{ entry.title }}</h2>
      <ul>
        <li v-for="item in entry.items" :key="item">{{ item }}</li>
      </ul>
    </article>
  </GeoHubPage>
</template>

<style scoped>
.entry { margin-top: 1.5rem; }
.entry h2 { font-size: 1.1rem; margin-bottom: 0.5rem; }
.entry li { line-height: 1.7; }
</style>
