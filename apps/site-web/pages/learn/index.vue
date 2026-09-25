<script setup lang="ts">
import { GEO_LEARN_PAGES, PUBLIC_LEARN_SLUGS } from '~/utils/geo-hub'
import { asHubColumnContent } from '~/utils/cms-page'

definePageMeta({ layout: 'geo' })

const sitePage = useSitePage()
const cmsColumn = computed(() => asHubColumnContent(sitePage.value?.page))
const openLearnPages = computed(() =>
  GEO_LEARN_PAGES.filter(p => (PUBLIC_LEARN_SLUGS as readonly string[]).includes(p.slug)),
)

if (!cmsColumn.value) {
  useGeoHubPageSeo({
    title: 'GEO 学习中心｜生成式引擎优化知识库',
    description: '系统学习什么是 GEO、核心指标、引擎差异、引用策略与效果验证，并连接到产品能力与免费诊断。',
    keywords: 'GEO学习,生成式引擎优化教程,AI搜索优化指南',
    path: '/learn',
  })
}
</script>

<template>
  <GeoCmsHubColumnPage v-if="cmsColumn" :content="cmsColumn" />

  <GeoHubPage
    v-else
    eyebrow="学习中心"
    title="GEO 学习中心"
    description="面向品牌与内容团队的生成式引擎优化知识库。先建立概念与指标，再进入产品与诊断。"
    wide
  >
    <template #actions>
      <NuxtLink to="/tools" class="ghost">看 GEO 工具</NuxtLink>
    </template>
    <div class="learn-grid">
      <NuxtLink
        v-for="p in openLearnPages"
        :key="p.slug"
        :to="`/learn/${p.slug}`"
        class="tile"
      >
        <h3>{{ p.title.split('｜')[0] }}</h3>
        <p>{{ p.description }}</p>
        <em>阅读 →</em>
      </NuxtLink>
      <NuxtLink to="/glossary" class="tile">
        <h3>GEO 术语表</h3>
        <p>提及率、推荐位、引用源等核心术语的权威释义。</p>
        <em>浏览 →</em>
      </NuxtLink>
      <NuxtLink to="/tools" class="tile">
        <h3>GEO 工具</h3>
        <p>学完概念后，用工具看品牌在 AI 回答里的真实表现。</p>
        <em>进入 →</em>
      </NuxtLink>
    </div>
  </GeoHubPage>
</template>

<style scoped>
.learn-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 168px;
  padding: 22px 20px;
  border-radius: 16px;
  background: #f7f7f8;
  border: 1px solid transparent;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.tile:hover {
  background: #fff;
  border-color: #f0c9b0;
  box-shadow: inset 0 -2px 0 #c2410c;
}
.tile h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.35;
}
.tile p {
  margin: 0;
  flex: 1;
  color: #6e6a76;
  font-size: 14px;
  line-height: 1.65;
}
.tile em {
  font-style: normal;
  color: #c2410c;
  font-size: 13px;
  font-weight: 650;
}
</style>
