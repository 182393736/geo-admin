<script setup lang="ts">
import { GEO_GLOSSARY } from '~/utils/geo-hub'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: 'GEO 术语表｜生成式引擎优化核心概念',
  description: 'GEO、提及率、推荐位、引用源、问题集、品牌实体等术语的权威释义，便于搜索引擎与 AI 正确理解实体。',
  keywords: 'GEO术语,生成式引擎优化名词,品牌提及率,引用源',
  path: '/glossary',
})
</script>

<template>
  <GeoHubPage
    eyebrow="术语表"
    title="GEO 术语表"
    description="用可被引用的短定义解释核心概念。每个词条可独立索引。"
  >
    <div class="term-list">
      <NuxtLink v-for="t in GEO_GLOSSARY" :key="t.slug" :to="`/glossary/${t.slug}`" class="card card-hover term">
        <div class="card-header">
          <div class="card-title">{{ t.term }}</div>
          <div class="card-description">{{ t.short }} — {{ t.definition }}</div>
        </div>
      </NuxtLink>
    </div>
  </GeoHubPage>
</template>

<style scoped>
.term-list { display: flex; flex-direction: column; gap: 0.65rem; }
</style>
