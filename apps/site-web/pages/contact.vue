<script setup lang="ts">
import type { HubContactContent } from '@site-manage/shared'
import { asContactContent } from '~/utils/cms-page'
import { GEO_CONTACT_DEFAULT } from '~/utils/content/geo-contact'

definePageMeta({ layout: 'geo' })

const sitePage = useSitePage()
const cms = computed(() => asContactContent(sitePage.value?.page))

const seoTitle = computed(() => sitePage.value?.page?.seo?.title || '联系我们｜HANYUAI GEO')
const seoDesc = computed(
  () =>
    sitePage.value?.page?.seo?.description ||
    GEO_CONTACT_DEFAULT.description,
)
const seoKeywords = computed(
  () => sitePage.value?.page?.seo?.keywords || '联系我们,GEO演示,商务合作,HANYUAI GEO客服',
)

useGeoHubPageSeo({
  title: seoTitle.value,
  description: seoDesc.value,
  keywords: seoKeywords.value,
  path: '/contact',
})

const content = computed<HubContactContent>(() => cms.value || GEO_CONTACT_DEFAULT)
</script>

<template>
  <GeoContactPage :content="content" />
</template>
