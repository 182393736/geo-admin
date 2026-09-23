<script setup lang="ts">
import { GEO_REPORTS } from '~/utils/geo-hub'
import { fetchHubByKind, mergeReports } from '~/utils/content/cms-hub'

definePageMeta({ layout: 'geo' })

const { data: reports } = await useAsyncData('hub-reports-list', async () => {
  const cms = await fetchHubByKind('report')
  return mergeReports(GEO_REPORTS, cms)
})

const list = computed(() => reports.value || GEO_REPORTS)

useGeoHubPageSeo({
  title: 'GEO 公开报告｜方法、引擎与行业观察',
  description: '公开 GEO 行业报告与方法说明。每份报告标注引擎列表、采样周期、证据样例与 dateModified，可供引用与复核。',
  keywords: 'GEO报告,AI搜索可见性报告,行业报告',
  path: '/reports',
})
</script>

<template>
  <GeoHubPage
    eyebrow="数据权威"
    title="公开报告"
    description="先公开可复核的方法口径与证据结构，再追加品类数据。禁止无评分、无方法的「排行榜」叙事。"
  >
    <div class="list">
      <NuxtLink v-for="r in list" :key="r.slug" :to="`/reports/${r.slug}`" class="card card-hover">
        <div class="card-header">
          <div class="card-title">{{ r.title }}</div>
          <div class="card-description">{{ r.description }}</div>
          <div class="meta">
            更新于 {{ r.dateModified }}
            · 引擎 {{ r.engines?.length || 0 }} 个
            <template v-if="r.questionSetVersion"> · {{ r.questionSetVersion }}</template>
          </div>
        </div>
      </NuxtLink>
    </div>
    <p class="next">
      相关：
      <NuxtLink to="/benchmarks">行业基准</NuxtLink> ·
      <NuxtLink to="/engines">引擎与方法</NuxtLink> ·
      <NuxtLink to="/changelog">更新日志</NuxtLink>
    </p>
  </GeoHubPage>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 0.75rem; }
.meta { margin-top: 0.5rem; font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
.next { margin-top: 1.75rem; color: hsl(var(--muted-foreground)); }
.next a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
</style>
