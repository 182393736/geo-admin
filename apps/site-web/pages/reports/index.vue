<script setup lang="ts">
import { GEO_REPORTS, PUBLIC_REPORT_SLUGS } from '~/utils/geo-hub'
import { fetchHubByKind, mergeReports } from '~/utils/content/cms-hub'
import { GEO_AUTHOR_ORG, GEO_CONTENT_STAMP } from '~/utils/content/authors'

definePageMeta({ layout: 'geo' })

const { data: reports } = await useAsyncData('hub-reports-list-public', async () => {
  const cms = await fetchHubByKind('report')
  const allow = new Set(PUBLIC_REPORT_SLUGS as readonly string[])
  return mergeReports(GEO_REPORTS, cms).filter((r) => allow.has(r.slug))
})

const list = computed(() => {
  const allow = new Set(PUBLIC_REPORT_SLUGS as readonly string[])
  return (reports.value || GEO_REPORTS).filter((r) => allow.has(r.slug))
})

const { crumbs, author, published, modified } = useGeoHubPageSeo({
  title: 'GEO 公开报告｜可复核方法与证据结构',
  description:
    '先公开可复核的方法口径与证据结构，再追加品类数据。禁止无评分、无方法的「排行榜」叙事。',
  keywords: 'GEO报告,AI搜索可见性报告,方法报告,可复核基线',
  path: '/reports',
  authorId: GEO_AUTHOR_ORG.id,
  datePublished: GEO_CONTENT_STAMP.datePublished,
  dateModified: GEO_CONTENT_STAMP.dateModified,
})
</script>

<template>
  <GeoHubPage
    eyebrow="方法报告"
    title="公开报告"
    description="先公开可复核的方法口径与证据结构，再追加品类数据。禁止无评分、无方法的「排行榜」叙事。"
    wide
    :diagnose-cta="false"
    :breadcrumbs="crumbs"
    :author-label="author.short"
    :date-published="published"
    :date-modified="modified"
  >
    <template #actions>
      <NuxtLink to="/learn" class="ghost">学习中心</NuxtLink>
      <NuxtLink to="/tools" class="ghost">看 GEO 工具</NuxtLink>
    </template>
    <div class="list">
      <NuxtLink v-for="r in list" :key="r.slug" :to="`/reports/${r.slug}`" class="tile">
        <h3>{{ r.title }}</h3>
        <p>{{ r.description }}</p>
        <div class="meta">
          更新于 {{ r.dateModified }}
          · 引擎 {{ r.engines?.length || 0 }} 个
          <template v-if="r.questionSetVersion"> · {{ r.questionSetVersion }}</template>
        </div>
        <em>阅读 →</em>
      </NuxtLink>
    </div>
    <p class="next">
      相关：
      <NuxtLink to="/learn/what-is-geo">什么是 GEO</NuxtLink>
      ·
      <NuxtLink to="/learn/measurement">如何验证效果</NuxtLink>
      ·
      <NuxtLink to="/diagnose">免费诊断</NuxtLink>
    </p>
  </GeoHubPage>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 20px;
  border-radius: 16px;
  background: #f7f7f8;
  border: 1px solid transparent;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.tile:hover {
  background: #fff;
  border-color: #f0c9b0;
  box-shadow: inset 0 -2px 0 #c2410c;
}
.tile h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.35;
}
.tile p {
  margin: 0;
  color: #6e6a76;
  font-size: 14px;
  line-height: 1.7;
}
.meta {
  font-size: 12px;
  color: #9b97a3;
}
.tile em {
  font-style: normal;
  color: #c2410c;
  font-size: 13px;
  font-weight: 650;
}
.next {
  margin-top: 2rem;
  color: #6e6a76;
  font-size: 14px;
}
.next a {
  color: #c2410c;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
