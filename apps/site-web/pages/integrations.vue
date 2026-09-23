<script setup lang="ts">
import { GEO_INTEGRATIONS } from '~/utils/content/ecosystem'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '集成｜Webhook、导出、通知与 IndexNow',
  description: 'HANYUAI GEO 与通知、导出、CMS 回流及 IndexNow 等集成能力说明。',
  keywords: 'GEO集成,IndexNow,Webhook',
  path: '/integrations',
})

const statusLabel: Record<string, string> = {
  available: '可用',
  beta: 'Beta',
  planned: '规划中',
}
</script>

<template>
  <GeoHubPage eyebrow="生态" title="集成" description="深度任务在控制台配置；流量站侧提供 IndexNow 与公开文档入口。">
    <div class="list">
      <article v-for="item in GEO_INTEGRATIONS" :key="item.slug" class="card">
        <div class="card-header">
          <div class="card-title">
            {{ item.name }}
            <span class="badge">{{ statusLabel[item.status] }}</span>
          </div>
          <div class="card-description">{{ item.summary }}</div>
        </div>
        <div v-if="item.href" class="card-footer">
          <NuxtLink :to="item.href" class="btn btn-link btn-sm">了解更多 →</NuxtLink>
        </div>
      </article>
    </div>
  </GeoHubPage>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 0.65rem; }
.badge {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  border: 1px solid hsl(var(--border));
  vertical-align: middle;
}
</style>
