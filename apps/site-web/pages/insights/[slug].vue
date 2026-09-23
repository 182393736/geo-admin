<script setup lang="ts">
import { GEO_INSIGHTS, getInsightBySlug } from '~/utils/geo-seo'
import { asStructuredContent } from '~/utils/cms-page'

definePageMeta({
  layout: 'geo',
})

const route = useRoute()
const sitePage = useSitePage()
const cms = computed(() => asStructuredContent(sitePage.value?.page))
const article = computed(() => getInsightBySlug(String(route.params.slug || '')))

if (!cms.value && !article.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' })
}

if (!cms.value && article.value) {
  useGeoInsightSeo(article)
}

const related = computed(() =>
  GEO_INSIGHTS.filter((item) => item.slug !== article.value?.slug).slice(0, 2),
)
</script>

<template>
  <GeoCmsStructuredPage
    v-if="cms"
    :page-kind="cms.pageKind"
    :content="cms.content"
  />

  <article v-else-if="article" class="insight-article" itemscope itemtype="https://schema.org/Article">
    <div class="container insight-wrap">
      <header class="insight-header">
        <div class="insight-meta">
          <span class="badge badge-outline">{{ article.category }}</span>
        </div>
        <h1 itemprop="headline">{{ article.title }}</h1>
        <p class="insight-desc" itemprop="description">{{ article.description }}</p>
      </header>
      <div class="insight-body" itemprop="articleBody">
        <section v-for="s in article.sections" :key="s.heading">
          <h2>{{ s.heading }}</h2>
          <p v-for="(para, i) in s.paragraphs" :key="i">{{ para }}</p>
        </section>
      </div>
      <aside v-if="related.length" class="insight-related">
        <h2>继续阅读</h2>
        <NuxtLink v-for="r in related" :key="r.slug" :to="`/insights/${r.slug}`">{{ r.title }}</NuxtLink>
      </aside>
    </div>
  </article>
</template>

<style scoped>
.insight-wrap { max-width: 720px; padding: 2.5rem 1.5rem 4rem; }
.insight-header { margin-bottom: 2rem; }
.insight-header h1 { font-size: clamp(1.6rem, 3vw, 2.1rem); margin: 0.75rem 0; }
.insight-desc { color: hsl(var(--muted-foreground)); line-height: 1.7; }
.insight-body section { margin-top: 1.75rem; }
.insight-body h2 { font-size: 1.2rem; margin-bottom: 0.65rem; }
.insight-body p { line-height: 1.8; margin: 0 0 0.75rem; }
.insight-related { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.insight-related a { color: hsl(var(--primary)); }
</style>
