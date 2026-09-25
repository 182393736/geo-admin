<script setup lang="ts">
import { GEO_GLOSSARY, PUBLIC_GLOSSARY_SLUGS, getGlossaryTerm } from '~/utils/geo-hub'
import { asStructuredContent } from '~/utils/cms-page'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const sitePage = useSitePage()
const cms = computed(() => asStructuredContent(sitePage.value?.page))
const term = computed(() => getGlossaryTerm(String(route.params.slug || '')))

if (!cms.value && !term.value) {
  throw createError({ statusCode: 404, statusMessage: '术语不存在' })
}

if (!cms.value && term.value) {
  useGeoHubPageSeo({
    title: `${term.value.term}是什么？｜GEO 术语表`,
    description: term.value.definition,
    keywords: `${term.value.term},${term.value.short},GEO`,
    path: `/glossary/${term.value.slug}`,
    type: 'article',
  })
}

const related = computed(() =>
  (term.value?.related || [])
    .map((slug) => GEO_GLOSSARY.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> =>
      !!t && (PUBLIC_GLOSSARY_SLUGS as readonly string[]).includes(t.slug),
    ),
)
</script>

<template>
  <GeoCmsStructuredPage
    v-if="cms"
    :page-kind="cms.pageKind"
    :content="cms.content"
  />

  <GeoHubPage
    v-else-if="term"
    eyebrow="术语"
    :title="term.term"
    :description="term.short"
    :diagnose-cta="false"
  >
    <article class="hub-section">
      <h2>{{ term.term }} 的定义</h2>
      <p>{{ term.definition }}</p>
    </article>
    <section v-if="related.length" class="hub-section">
      <h2>相关术语</h2>
      <ul>
        <li v-for="r in related" :key="r!.slug">
          <NuxtLink :to="`/glossary/${r!.slug}`">{{ r!.term }}</NuxtLink> — {{ r!.short }}
        </li>
      </ul>
    </section>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.2rem; margin-bottom: 0.65rem; }
.hub-section p, .hub-section li { line-height: 1.75; }
.hub-section a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
</style>
