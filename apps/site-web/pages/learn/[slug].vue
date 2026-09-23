<script setup lang="ts">
import { getLearnPage } from '~/utils/geo-hub'
import { asStructuredContent } from '~/utils/cms-page'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const sitePage = useSitePage()
const cms = computed(() => asStructuredContent(sitePage.value?.page))
const page = computed(() => getLearnPage(String(route.params.slug || '')))

if (!cms.value && !page.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' })
}

if (!cms.value && page.value) {
  useGeoHubPageSeo({
    title: page.value.title,
    description: page.value.description,
    keywords: page.value.keywords,
    path: `/learn/${page.value.slug}`,
    type: 'article',
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
    eyebrow="学习"
    :title="page.title.split('｜')[0]"
    :description="page.description"
    :diagnose-cta="false"
  >
    <article>
      <section v-for="s in page.sections" :key="s.heading" class="hub-section">
        <h2>{{ s.heading }}</h2>
        <p v-for="(para, i) in s.paragraphs" :key="i">{{ para }}</p>
      </section>
    </article>
    <GeoHubFaq :items="[...page.faq]" />
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.75rem; }
.hub-section h2 { font-size: 1.2rem; margin-bottom: 0.65rem; }
.hub-section p { line-height: 1.8; margin: 0 0 0.75rem; }
</style>
