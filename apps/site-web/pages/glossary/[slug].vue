<script setup lang="ts">
import { GEO_GLOSSARY, PUBLIC_GLOSSARY_SLUGS, getGlossaryTerm } from '~/utils/geo-hub'
import { asStructuredContent } from '~/utils/cms-page'
import { GEO_AUTHOR_ORG, GEO_CONTENT_STAMP } from '~/utils/content/authors'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const sitePage = useSitePage()
const cms = computed(() => asStructuredContent(sitePage.value?.page))
const term = computed(() => getGlossaryTerm(String(route.params.slug || '')))

if (!cms.value && !term.value) {
  throw createError({ statusCode: 404, statusMessage: '术语不存在' })
}

const { crumbs, author, published, modified } = useGeoHubPageSeo(computed(() => {
  const t = term.value
  return {
    title: t ? `${t.term}是什么？｜GEO 术语表` : 'GEO 术语',
    description: t?.definition || '',
    keywords: t ? `${t.term},${t.short},GEO` : 'GEO',
    path: t ? `/glossary/${t.slug}` : '/glossary',
    type: 'article' as const,
    authorId: GEO_AUTHOR_ORG.id,
    datePublished: GEO_CONTENT_STAMP.datePublished,
    dateModified: GEO_CONTENT_STAMP.dateModified,
    definedTerm: t
      ? { name: t.term, description: t.definition, short: t.short }
      : undefined,
  }
}))

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
    :breadcrumbs="crumbs"
    :author-label="author.short"
    :date-published="published"
    :date-modified="modified"
  >
    <template #actions>
      <NuxtLink to="/glossary" class="ghost">术语表</NuxtLink>
      <NuxtLink to="/tools" class="ghost">看 GEO 工具</NuxtLink>
    </template>
    <article class="hub-section">
      <h2>{{ term.term }} 的定义</h2>
      <p>{{ term.definition }}</p>
    </article>
    <section v-if="term.why" class="hub-section">
      <h2>为什么重要</h2>
      <p>{{ term.why }}</p>
    </section>
    <section v-if="term.measure" class="hub-section">
      <h2>怎么测 / 怎么落地</h2>
      <p>{{ term.measure }}</p>
    </section>
    <section v-if="related.length" class="hub-section">
      <h2>相关术语</h2>
      <ul class="related">
        <li v-for="r in related" :key="r!.slug">
          <NuxtLink :to="`/glossary/${r!.slug}`">{{ r!.term }}</NuxtLink>
          <span>— {{ r!.short }}</span>
        </li>
      </ul>
    </section>
    <p class="next">
      想看这个概念在真实答案里的表现？去
      <NuxtLink to="/tools">GEO 工具</NuxtLink>
      或
      <NuxtLink to="/diagnose">免费诊断</NuxtLink>。
    </p>
  </GeoHubPage>
</template>

<style scoped>
.related {
  list-style: none;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.related li {
  margin: 0 !important;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f7f7f8;
}
.related a { margin-right: 6px; }
.related span { color: #6e6a76; font-weight: 400; }
.next {
  margin: 2.5rem 0 0;
  padding: 16px 18px;
  border-radius: 14px;
  background: #fff4ec;
  color: #6e6a76;
  font-size: 14px;
  line-height: 1.7;
}
.next a {
  color: #c2410c;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
