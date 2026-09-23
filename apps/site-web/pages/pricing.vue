<script setup lang="ts">
import type { HubPricingContent } from '@site-manage/shared'
import { asPricingContent } from '~/utils/cms-page'
import { GEO_PRICING_DEFAULT } from '~/utils/content/geo-pricing'

definePageMeta({ layout: 'geo' })

const sitePage = useSitePage()
const cms = computed(() => asPricingContent(sitePage.value?.page))

const seoTitle = computed(() => sitePage.value?.page?.seo?.title || 'GEO价格｜监控套餐与积分计费')
const seoDesc = computed(
  () =>
    sitePage.value?.page?.seo?.description ||
    GEO_PRICING_DEFAULT.description + '入门版 ¥79/月起，专业版 ¥499/月，定制版按需。',
)
const seoKeywords = computed(
  () => sitePage.value?.page?.seo?.keywords || 'GEO价格,GEO套餐,GEO定价,AI监控套餐,生成式引擎优化价格',
)

useGeoHubPageSeo({
  title: seoTitle.value,
  description: seoDesc.value,
  keywords: seoKeywords.value,
  path: '/pricing',
})

const content = computed<HubPricingContent>(() => cms.value || GEO_PRICING_DEFAULT)
</script>

<template>
  <GeoPricingPage :content="content" />
</template>
