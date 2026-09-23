<script setup lang="ts">
import { GEO_BENCHMARKS } from '~/utils/geo-hub'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: GEO_BENCHMARKS.title,
  description: GEO_BENCHMARKS.description,
  keywords: 'GEO基准,品类可见性,AI搜索基准',
  path: '/benchmarks',
})
</script>

<template>
  <GeoHubPage
    eyebrow="数据权威"
    title="行业基准"
    :description="GEO_BENCHMARKS.description"
  >
    <section class="hub-section">
      <h2>解读原则</h2>
      <ul>
        <li v-for="p in GEO_BENCHMARKS.points" :key="p">{{ p }}</li>
      </ul>
    </section>
    <section v-if="GEO_BENCHMARKS.frameworks?.length" class="hub-section">
      <h2>品类框架（非排行榜）</h2>
      <div class="grid">
        <article v-for="f in GEO_BENCHMARKS.frameworks" :key="f.category" class="card">
          <div class="card-header">
            <div class="card-title">{{ f.category }}</div>
            <div class="card-description">{{ f.notes }}</div>
          </div>
          <ul class="watch">
            <li v-for="w in f.watch" :key="w">{{ w }}</li>
          </ul>
        </article>
      </div>
    </section>
    <section class="hub-section">
      <h2>首期内容生产</h2>
      <p>
        品类数值随
        <NuxtLink to="/reports">公开报告</NuxtLink>
        季度更新。禁止无方法刷分。
      </p>
    </section>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.65rem; }
.hub-section p, .hub-section li { line-height: 1.75; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
.watch { margin: 0 0 1rem; padding: 0 1.25rem; color: hsl(var(--muted-foreground)); line-height: 1.6; }
a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
</style>
