<script setup lang="ts">
import { getCustomerStory } from '~/utils/content/ecosystem'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const story = computed(() => getCustomerStory(String(route.params.slug || '')))

if (!story.value) {
  throw createError({ statusCode: 404, statusMessage: '故事不存在' })
}

useGeoHubPageSeo({
  title: `${story.value.title}｜客户故事`,
  description: story.value.summary,
  keywords: `GEO案例,${story.value.industry}`,
  path: `/customers/${story.value.slug}`,
  type: 'article',
})
</script>

<template>
  <GeoHubPage v-if="story" eyebrow="客户故事" :title="story.title" :description="story.summary">
    <section class="hub-section">
      <h2>做了什么</h2>
      <ol>
        <li v-for="a in story.actions" :key="a">{{ a }}</li>
      </ol>
    </section>
    <section class="hub-section">
      <h2>关于结果数字</h2>
      <p>{{ story.outcomeNote }}</p>
    </section>
    <p class="next">
      <NuxtLink to="/customers">全部故事</NuxtLink> ·
      <NuxtLink to="/diagnose">免费诊断</NuxtLink> ·
      <NuxtLink to="/demo">预约演示</NuxtLink>
    </p>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.5rem; }
.hub-section p, .hub-section li { line-height: 1.75; }
.next { margin-top: 1.75rem; }
.next a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
</style>
