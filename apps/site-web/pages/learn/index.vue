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
  >
    <div class="learn-grid">
      <NuxtLink
        v-for="p in openLearnPages"
        :key="p.slug"
        :to="`/learn/${p.slug}`"
        class="card card-hover"
      >
        <div class="card-header">
          <div class="card-title">{{ p.title.split('｜')[0] }}</div>
          <div class="card-description">{{ p.description }}</div>
        </div>
        <div class="card-footer"><span class="btn btn-link btn-sm">阅读 →</span></div>
      </NuxtLink>
      <NuxtLink to="/glossary" class="card card-hover">
        <div class="card-header">
          <div class="card-title">GEO 术语表</div>
          <div class="card-description">提及率、推荐位、引用源等核心术语的权威释义。</div>
        </div>
      </NuxtLink>
      <NuxtLink to="/tools" class="card card-hover">
        <div class="card-header">
          <div class="card-title">GEO 工具</div>
          <div class="card-description">学完概念后，用工具看品牌在 AI 回答里的真实表现。</div>
        </div>
      </NuxtLink>
    </div>
  </GeoHubPage>
</template>

<style scoped>
.learn-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}
</style>
