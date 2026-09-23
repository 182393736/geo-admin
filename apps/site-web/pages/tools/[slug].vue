<script setup lang="ts">
import { getProductPage } from '~/utils/geo-hub'
import { getFlagship } from '~/utils/content/geo-flagship'
import { getFlagshipKeyword } from '~/utils/content/geo-flagship-keywords'
import { readCmsFlagship } from '~/utils/cms-flagship'

definePageMeta({
  layout: 'geo',
  key: (route) => `tools-${String(route.params.slug || 'index')}`,
})

const route = useRoute()
const sitePage = useSitePage()
const page = computed(() => getProductPage(String(route.params.slug || '')))
const cms = computed(() => readCmsFlagship(sitePage.value?.page))
const view = computed(() => {
  const slug = page.value?.slug || String(route.params.slug || '')
  const local = getFlagship(slug) ?? getFlagshipKeyword(slug)
  const fromCms = cms.value?.flagship
  if (!fromCms) return local
  if (fromCms.startChips?.length || !local?.startChips?.length) return fromCms
  return { ...fromCms, startChips: local.startChips }
})

if (!page.value && !cms.value) {
  throw createError({ statusCode: 404, statusMessage: '工具页不存在' })
}

useGeoHubPageSeo(computed(() => {
  const product = page.value
  const fromCms = cms.value
  const flagship = view.value
  const title = fromCms?.seo.title || product?.title || 'GEO工具'
  return {
    title,
    description: fromCms?.seo.description || product?.description || '',
    keywords: fromCms?.seo.keywords || product?.keywords || '',
    path: `/tools/${product?.slug || String(route.params.slug || '')}`,
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
  <GeoHomeStatic
    v-if="view"
    :source="view"
    :topic="String(page?.slug || route.params.slug || 'home')"
  />
  <GeoProductLanding v-else :page="page!" />
</template>
