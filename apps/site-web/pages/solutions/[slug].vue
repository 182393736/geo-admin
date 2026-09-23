<script setup lang="ts">
import { getSolution } from '~/utils/content/solutions'
import { asStructuredContent } from '~/utils/cms-page'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const sitePage = useSitePage()
const cms = computed(() => asStructuredContent(sitePage.value?.page))
const page = computed(() => getSolution(String(route.params.slug || '')))

if (!cms.value && !page.value) {
  throw createError({ statusCode: 404, statusMessage: '方案不存在' })
}

if (!cms.value && page.value) {
  useGeoHubPageSeo({
    title: page.value.title,
    description: page.value.description,
    keywords: page.value.keywords,
    path: `/solutions/${page.value.slug}`,
    faqs: page.value.faq,
  })
}
</script>

<template>
  <GeoCmsStructuredPage
    v-if="cms"
    :page-kind="cms.pageKind"
    :content="cms.content"
  />
  <GeoHubPage
    v-else-if="page"
    :eyebrow="page.kind === 'persona' ? '角色方案' : '行业方案'"
    :title="page.title.split('｜')[0]"
    :description="page.definition"
  >
    <section class="hub-section">
      <h2>常见痛点</h2>
      <ul><li v-for="p in page.painPoints" :key="p">{{ p }}</li></ul>
    </section>
    <section class="hub-section">
      <h2>推荐打法</h2>
      <ol><li v-for="p in page.plays" :key="p">{{ p }}</li></ol>
    </section>
    <GeoHubFaq :items="[...page.faq]" />
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.5rem; }
</style>
