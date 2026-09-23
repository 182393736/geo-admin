<script setup lang="ts">
import { GEO_INSIGHTS } from '~/utils/geo-seo'

definePageMeta({
  layout: 'geo',
})

useGeoInsightsIndexSeo()

function formatDate(iso: string) {
  return iso.replace(/-/g, '.')
}
</script>

<template>
  <main class="insights-index">
    <div class="container insights-wrap">
      <nav class="insight-breadcrumb" aria-label="面包屑">
        <NuxtLink to="/">首页</NuxtLink>
        <span>/</span>
        <span>GEO 指南</span>
      </nav>

      <header class="insights-header">
        <div class="eyebrow">方法论合集</div>
        <h1>GEO 优化指南与实战文章</h1>
        <p>
          系统解读 GEO 核心指标、AI 品牌理解信号，以及内容很多却仍不被推荐的原因。
          建议先读完后再回到
          <NuxtLink to="/#diagnose">免费 GEO 诊断</NuxtLink>
          建立基线。
        </p>
      </header>

      <div class="insights">
        <NuxtLink
          v-for="article in GEO_INSIGHTS"
          :key="article.slug"
          :to="`/insights/${article.slug}`"
          class="card card-hover"
        >
          <div class="card-header">
            <div class="insight-meta">
              <span class="badge badge-outline">{{ article.category }}</span>
              <time :datetime="article.datePublished">{{ formatDate(article.datePublished) }}</time>
              <span>·</span>
              <span>{{ article.readingMinutes }} 分钟</span>
            </div>
            <div class="card-title" style="font-size:1.125rem;margin-top:.5rem">{{ article.title }}</div>
            <div class="card-description" style="line-height:1.65">{{ article.description }}</div>
          </div>
          <div class="card-footer"><span class="btn btn-link btn-sm">阅读全文 →</span></div>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.insights-wrap {
  padding: 2.5rem 1.5rem 4rem;
}
.insight-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
}
.insight-breadcrumb a {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}
.insights-header {
  max-width: 44rem;
  margin-bottom: 2.5rem;
}
.insights-header h1 {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0.5rem 0 0.85rem;
}
.insights-header p {
  color: hsl(var(--muted-foreground));
  line-height: 1.7;
  margin: 0;
}
.insights-header a {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}
.insight-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}
</style>
