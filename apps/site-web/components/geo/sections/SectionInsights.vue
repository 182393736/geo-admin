<script setup lang="ts">
import { GEO_INSIGHTS } from '~/utils/geo-seo'

function formatDate(iso: string) {
  return iso.replace(/-/g, '.')
}
</script>

<template>
  <section class="section section-alt" id="insights">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">方法论与实战</div>
        <h2>GEO 优化实战指南：先理解 AI 如何选答案，再决定写什么</h2>
        <p>
          把复杂的 AI 搜索与生成式引擎优化拆成可执行方法。浏览
          <NuxtLink to="/insights" style="text-decoration:underline;text-underline-offset:3px">全部 GEO 指南</NuxtLink>
          ，或与首页
          <a href="#capabilities" style="text-decoration:underline;text-underline-offset:3px">产品能力</a>
          、
          <a href="#faq" style="text-decoration:underline;text-underline-offset:3px">GEO FAQ</a>
          互相跳转。
        </p>
      </div>
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
            <div class="card-title" style="font-size:1.0625rem;margin-top:.5rem">{{ article.title }}</div>
            <div class="card-description" style="line-height:1.65">{{ article.description }}</div>
          </div>
          <div class="card-footer"><span class="btn btn-link btn-sm">阅读全文 →</span></div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
