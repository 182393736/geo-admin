<script setup lang="ts">
import { GEO_CUSTOMER_STORIES } from '~/utils/content/ecosystem'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '客户故事｜真实方法，不虚构评分',
  description: '展示 GEO 落地方法与动作路径。未获授权不展示精确分数或虚假排名。',
  keywords: 'GEO客户案例,GEO故事',
  path: '/customers',
})
</script>

<template>
  <GeoHubPage
    eyebrow="信任"
    title="客户故事"
    description="只写可核对的方法与动作。评分、名次与客户名称需授权后才会出现在脱敏报告中。"
  >
    <div class="list">
      <NuxtLink
        v-for="c in GEO_CUSTOMER_STORIES"
        :key="c.slug"
        :to="`/customers/${c.slug}`"
        class="card card-hover"
      >
        <div class="card-header">
          <div class="eyebrow">{{ c.industry }}</div>
          <div class="card-title">{{ c.title }}</div>
          <div class="card-description">{{ c.summary }}</div>
        </div>
      </NuxtLink>
    </div>
    <p class="note">
      也可查看
      <NuxtLink to="/reports/shared/demo-consumer-2026q3">脱敏报告示例</NuxtLink>。
    </p>
  </GeoHubPage>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 0.75rem; }
.eyebrow { font-size: 0.75rem; color: hsl(var(--muted-foreground)); margin-bottom: 0.25rem; }
.note { margin-top: 1.5rem; color: hsl(var(--muted-foreground)); }
.note a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
</style>
