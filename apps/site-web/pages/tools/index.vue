<script setup lang="ts">
import { getProductPage } from '~/utils/geo-hub'
import { getFlagship } from '~/utils/content/geo-flagship'
import { readCmsFlagship } from '~/utils/cms-flagship'

definePageMeta({
  layout: 'geo',
  key: 'tools-index',
})

const sitePage = useSitePage()
const page = computed(() => getProductPage(''))
const cms = computed(() => readCmsFlagship(sitePage.value?.page))
const view = computed(() => {
  const local = getFlagship('tools')
  const fromCms = cms.value?.flagship
  if (!fromCms) return local
  if (fromCms.startChips?.length || !local?.startChips?.length) return fromCms
  return { ...fromCms, startChips: local!.startChips }
})

if (!page.value && !cms.value && !view.value) {
  throw createError({ statusCode: 404, statusMessage: 'GEO工具页不存在' })
}

useGeoHubPageSeo(computed(() => {
  const product = page.value
  const fromCms = cms.value
  const flagship = view.value
  return {
    title: fromCms?.seo.title || product?.title || 'GEO工具',
    description: fromCms?.seo.description || product?.description || '',
    keywords: fromCms?.seo.keywords || product?.keywords || 'GEO工具',
    path: '/tools',
    faqs: fromCms?.faqs ?? flagship?.faqs ?? product?.faq,
    steps: flagship?.steps.map((step) => ({
      title: step.title,
      text: `${step.sub}。${step.body}`,
    })),
    dateModified: fromCms?.dateModified,
  }
}))
</script>

<template>
  <GeoHomeStatic v-if="view" :source="view" topic="tools" />
</template>
