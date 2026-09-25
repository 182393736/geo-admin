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
    <template #actions>
      <NuxtLink :to="page.relatedProduct || '/tools'" class="ghost">看对应工具</NuxtLink>
      <NuxtLink to="/learn" class="ghost">学习中心</NuxtLink>
    </template>
    <article>
      <section v-for="s in page.sections" :key="s.heading" class="hub-section">
        <h2>{{ s.heading }}</h2>
        <p v-for="(para, i) in s.paragraphs" :key="i">{{ para }}</p>
        <ul v-if="s.bullets?.length" class="bullets">
          <li v-for="(b, i) in s.bullets" :key="i">{{ b }}</li>
        </ul>
        <div
          v-if="s.table"
          class="sheet"
          :style="{ '--cols': String(s.table.head.length) }"
        >
          <div class="row head">
            <span v-for="h in s.table.head" :key="h">{{ h }}</span>
          </div>
          <div v-for="(row, ri) in s.table.rows" :key="ri" class="row">
            <span v-for="(cell, ci) in row" :key="ci">{{ cell }}</span>
          </div>
        </div>
      </section>
    </article>
    <p class="next">
      下一步：
      <NuxtLink :to="page.relatedProduct || '/tools'">打开对应 GEO 工具</NuxtLink>
      看真实基线，或先去
      <NuxtLink to="/diagnose">免费诊断</NuxtLink>。
    </p>
    <GeoHubFaq :items="[...page.faq]" />
  </GeoHubPage>
</template>

<style scoped>
.bullets {
  margin: 0.25rem 0 1rem !important;
  padding-left: 1.15rem !important;
  color: #6e6a76;
}
.bullets li {
  margin: 0 0 0.45rem !important;
  line-height: 1.7;
  font-size: 15px;
}
.sheet {
  margin: 1rem 0 0.5rem;
  border-radius: 14px;
  background: #f7f7f8;
  padding: 6px 16px 10px;
  overflow-x: auto;
}
.row {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
  gap: 10px;
  align-items: start;
  min-height: 40px;
  padding: 10px 0;
  border-top: 1px solid #ececef;
  font-size: 14px;
  color: #3f3b46;
  line-height: 1.5;
}
.row.head {
  border-top: 0;
  min-height: 28px;
  color: #9b97a3;
  font-size: 12px;
  font-weight: 650;
}
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
