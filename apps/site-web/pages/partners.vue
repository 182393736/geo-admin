<script setup lang="ts">
import { GEO_PARTNERS } from '~/utils/content/ecosystem'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '合作伙伴｜代理、技术与媒体',
  description: 'HANYUAI GEO 伙伴计划：代理交付、技术协作与测评媒体。统一采样口径，拒绝无方法排行榜。',
  keywords: 'GEO合作伙伴,GEO代理,测评合作',
  path: '/partners',
})

const { toConsole } = useGeoConsoleLink()
const tierLabel: Record<string, string> = {
  agency: '代理',
  technology: '技术',
  media: '媒体',
}
</script>

<template>
  <GeoHubPage eyebrow="生态" title="合作伙伴" description="欢迎在统一方法口径下共建交付与内容。商务申请走控制台意向。">
    <div class="list">
      <article v-for="p in GEO_PARTNERS" :key="p.slug" class="card">
        <div class="card-header">
          <div class="card-title">{{ p.name }} <span class="tier">{{ tierLabel[p.tier] }}</span></div>
          <div class="card-description">{{ p.blurb }}</div>
        </div>
      </article>
    </div>
    <p class="cta">
      <a class="btn btn-default" :href="toConsole('/login?intent=partner', 'geo_partners')">申请成为伙伴</a>
      <NuxtLink to="/demo" class="btn btn-outline">预约沟通</NuxtLink>
    </p>
  </GeoHubPage>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 0.65rem; }
.tier { font-size: 0.75rem; color: hsl(var(--muted-foreground)); font-weight: 500; }
.cta { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
</style>
