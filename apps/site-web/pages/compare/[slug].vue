<script setup lang="ts">
import { getComparePage } from '~/utils/content/solutions'
import { asStructuredContent } from '~/utils/cms-page'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const sitePage = useSitePage()
const cms = computed(() => asStructuredContent(sitePage.value?.page))
const page = computed(() => getComparePage(String(route.params.slug || '')))

if (!cms.value && !page.value) {
  throw createError({ statusCode: 404, statusMessage: '对比页不存在' })
}

if (!cms.value && page.value) {
  useGeoHubPageSeo({
    title: page.value.title,
    description: page.value.description,
    keywords: page.value.keywords,
    path: `/compare/${page.value.slug}`,
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
    eyebrow="对比"
    :title="page.title.split('｜')[0]"
    :description="page.summary"
    :diagnose-cta="false"
  >
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>{{ page.leftLabel }}</th>
            <th>{{ page.rightLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in page.rows" :key="row.dimension">
            <td>{{ row.dimension }}</td>
            <td>{{ row.left }}</td>
            <td>{{ row.right }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <GeoHubFaq :items="[...page.faq]" />
  </GeoHubPage>
</template>

<style scoped>
.table-wrap { overflow-x: auto; margin-top: 1rem; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid hsl(var(--border)); padding: 0.5rem 0.65rem; text-align: left; }
th { background: hsl(var(--muted) / 0.3); }
</style>
