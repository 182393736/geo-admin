<script setup lang="ts">
import { GEO_ENGINES_DOC } from '~/utils/geo-hub'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: GEO_ENGINES_DOC.title,
  description: GEO_ENGINES_DOC.description,
  keywords: 'AI引擎采样,GEO方法,DeepSeek,豆包,IndexNow',
  path: '/engines',
})
</script>

<template>
  <GeoHubPage
    eyebrow="方法"
    title="引擎覆盖与采样方法"
    :description="GEO_ENGINES_DOC.description"
    :diagnose-cta="false"
  >
    <section v-if="GEO_ENGINES_DOC.engines?.length" class="hub-section">
      <h2>引擎名单</h2>
      <ul>
        <li v-for="e in GEO_ENGINES_DOC.engines" :key="e.name">
          <strong>{{ e.name }}</strong> — {{ e.note }}
        </li>
      </ul>
    </section>
    <section v-for="s in GEO_ENGINES_DOC.sections" :key="s.heading" class="hub-section">
      <h2>{{ s.heading }}</h2>
      <p v-for="(para, i) in s.paragraphs" :key="i">{{ para }}</p>
    </section>
    <section class="hub-section">
      <h2>与产品的对应关系</h2>
      <p>
        采样口径与
        <NuxtLink to="/tools/visibility">可见性监测</NuxtLink>
        一致。学习差异见
        <NuxtLink to="/learn/ai-engines">AI 引擎差异</NuxtLink>。
        站长侧可用
        <code>POST /api/indexnow</code>
        提交 URL（需配置密钥）。
      </p>
    </section>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.65rem; }
.hub-section p, .hub-section li { line-height: 1.75; margin: 0 0 0.65rem; }
.hub-section a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
code { font-size: 0.85em; }
</style>
