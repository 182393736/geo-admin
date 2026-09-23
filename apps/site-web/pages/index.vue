<script setup lang="ts">
import { GEO_SITE } from '~/utils/geo-seo'
import { flagshipHome } from '~/utils/content/geo-flagship'
import { readCmsFlagship } from '~/utils/cms-flagship'

definePageMeta({ layout: 'geo' })

const sitePage = useSitePage()
const cms = computed(() => readCmsFlagship(sitePage.value?.page))
const source = computed(() => {
  const fromCms = cms.value?.flagship
  if (!fromCms) return null
  if (fromCms.startChips?.length || !flagshipHome.startChips?.length) return fromCms
  return { ...fromCms, startChips: flagshipHome.startChips }
})

useGeoHomeSeo(cms)

const { isFlagship } = useGeoFlagship()
const page = computed(() => sitePage.value?.page)
const blocks = computed(() => page.value?.blocks || [])
const notFound = computed(() => !isFlagship.value && !sitePage.value?.page)
</script>

<template>
  <GeoHomeStatic v-if="isFlagship" :source="source || flagshipHome" />

  <div v-else>
    <p class="sr-only">HANYUAI GEO · {{ GEO_SITE.dateModified }}</p>
    <div v-if="notFound" class="empty">
      <h1>页面不存在</h1>
      <p>当前域名尚未配置站点，或该路径没有已发布的页面。</p>
    </div>
    <template v-else>
      <h1 class="page-title">{{ page?.title }}</h1>
      <section v-for="block in blocks" :key="block.id" class="block">
        <div v-if="block.type === 'hero'" class="block-hero">
          <h2>{{ (block.props as any).heading || '' }}</h2>
          <p>{{ (block.props as any).subtitle || '' }}</p>
        </div>
        <div v-else-if="block.type === 'richtext'" v-html="(block.props as any).html || ''" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.page-title { margin: 0 0 1.5rem; font-size: 2rem; }
.empty { padding: 3rem 0; color: var(--color-muted); }
.block { margin-bottom: 2rem; }
.block-hero h2 { font-size: 2.5rem; margin: 0 0 0.5rem; }
.block-hero p { color: var(--color-muted); }
</style>
