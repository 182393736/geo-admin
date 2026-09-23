<script setup lang="ts">
import { GEO_SOLUTIONS } from '~/utils/content/solutions'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: 'GEO 解决方案｜按角色与行业落地',
  description: '面向品牌、增长、内容、代理与消费品/B2B/电商等场景的 GEO 落地路径。',
  keywords: 'GEO解决方案,行业GEO,品牌GEO',
  path: '/solutions',
})

const personas = computed(() => GEO_SOLUTIONS.filter((s) => s.kind === 'persona'))
const industries = computed(() => GEO_SOLUTIONS.filter((s) => s.kind === 'industry'))
</script>

<template>
  <GeoHubPage
    eyebrow="解决方案"
    title="按角色与行业落地 GEO"
    description="把获客路径映射到产品能力与学习支柱。每页可独立索引。"
  >
    <section class="hub-section">
      <h2>按角色</h2>
      <div class="grid">
        <NuxtLink v-for="p in personas" :key="p.slug" :to="`/solutions/${p.slug}`" class="card card-hover">
          <div class="card-header">
            <div class="card-title">{{ p.title.split('｜')[0] }}</div>
            <div class="card-description">{{ p.definition }}</div>
          </div>
        </NuxtLink>
      </div>
    </section>
    <section class="hub-section">
      <h2>按行业</h2>
      <div class="grid">
        <NuxtLink v-for="p in industries" :key="p.slug" :to="`/solutions/${p.slug}`" class="card card-hover">
          <div class="card-header">
            <div class="card-title">{{ p.title.split('｜')[0] }}</div>
            <div class="card-description">{{ p.definition }}</div>
          </div>
        </NuxtLink>
      </div>
    </section>
    <p class="next">
      也可看
      <NuxtLink to="/compare/geo-vs-seo">GEO vs SEO</NuxtLink>
      与
      <NuxtLink to="/customers">客户故事</NuxtLink>。
    </p>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.75rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.75rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
.next { margin-top: 1.5rem; color: hsl(var(--muted-foreground)); }
.next a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
</style>
