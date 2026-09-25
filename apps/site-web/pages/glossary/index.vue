<script setup lang="ts">
import { GEO_GLOSSARY, PUBLIC_GLOSSARY_SLUGS } from '~/utils/geo-hub'
import { GEO_AUTHOR_ORG, GEO_CONTENT_STAMP } from '~/utils/content/authors'

definePageMeta({ layout: 'geo' })

const openTerms = computed(() =>
  GEO_GLOSSARY.filter(t => (PUBLIC_GLOSSARY_SLUGS as readonly string[]).includes(t.slug)),
)

const { crumbs, author, published, modified } = useGeoHubPageSeo({
  title: 'GEO 术语表｜生成式引擎优化核心概念',
  description: 'GEO、提及率、推荐位、引用源、问题集、品牌实体等术语的权威释义，便于搜索引擎与 AI 正确理解实体。',
  keywords: 'GEO术语,生成式引擎优化名词,品牌提及率,引用源',
  path: '/glossary',
  authorId: GEO_AUTHOR_ORG.id,
  datePublished: GEO_CONTENT_STAMP.datePublished,
  dateModified: GEO_CONTENT_STAMP.dateModified,
})
</script>

<template>
  <GeoHubPage
    eyebrow="术语表"
    title="GEO 术语表"
    description="用可被引用的短定义解释核心概念。每个词条可独立索引。"
    wide
    :breadcrumbs="crumbs"
    :author-label="author.short"
    :date-published="published"
    :date-modified="modified"
  >
    <template #actions>
      <NuxtLink to="/learn" class="ghost">回学习中心</NuxtLink>
    </template>
    <div class="term-list">
      <NuxtLink v-for="t in openTerms" :key="t.slug" :to="`/glossary/${t.slug}`" class="term">
        <div class="term-head">
          <h3>{{ t.term }}</h3>
          <span>{{ t.short }}</span>
        </div>
        <p>{{ t.definition }}</p>
      </NuxtLink>
    </div>
  </GeoHubPage>
</template>

<style scoped>
.term-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.term {
  display: block;
  padding: 20px 22px;
  border-radius: 16px;
  background: #f7f7f8;
  border: 1px solid transparent;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.term:hover {
  background: #fff;
  border-color: #f0c9b0;
  box-shadow: inset 0 -2px 0 #c2410c;
}
.term-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 14px;
  margin-bottom: 8px;
}
.term-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.02em;
}
.term-head span {
  color: #c2410c;
  font-size: 13px;
  font-weight: 650;
}
.term p {
  margin: 0;
  color: #6e6a76;
  font-size: 14px;
  line-height: 1.7;
}
</style>
