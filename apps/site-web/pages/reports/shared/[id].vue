<script setup lang="ts">
import { getSharedReport } from '~/utils/content/authority'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const { open: openAuth } = useGeoAuthModal()
const report = computed(() => getSharedReport(String(route.params.id || '')))

if (!report.value) {
  throw createError({ statusCode: 404, statusMessage: '脱敏报告不存在' })
}

useGeoHubPageSeo({
  title: report.value.title,
  description: `${report.value.industry} · ${report.value.method}`,
  keywords: '脱敏GEO报告,可分享诊断摘要',
  path: `/reports/shared/${report.value.id}`,
  type: 'article',
  datePublished: report.value.datePublished,
  dateModified: report.value.dateModified,
})

// 个性化/示例页：允许索引方法示例；真实客户回流可在 CMS 侧加 noindex
</script>

<template>
  <GeoHubPage
    v-if="report"
    eyebrow="脱敏报告"
    :title="report.title"
    :description="report.sourceNote"
  >
    <dl class="meta-box">
      <div><dt>行业</dt><dd>{{ report.industry }}</dd></div>
      <div><dt>更新</dt><dd><time :datetime="report.dateModified">{{ report.dateModified }}</time></dd></div>
      <div><dt>引擎</dt><dd>{{ report.engines.join('、') }}</dd></div>
      <div><dt>方法</dt><dd>{{ report.method }}</dd></div>
    </dl>
    <section class="hub-section">
      <h2>定性要点</h2>
      <ul>
        <li v-for="h in report.highlights" :key="h">{{ h }}</li>
      </ul>
    </section>
    <section v-for="s in report.sections" :key="s.heading" class="hub-section">
      <h2>{{ s.heading }}</h2>
      <p v-for="(para, i) in s.paragraphs" :key="i">{{ para }}</p>
    </section>
    <p class="next">
      <NuxtLink to="/reports">公开报告</NuxtLink> ·
      <NuxtLink to="/diagnose">免费诊断</NuxtLink> ·
      <button type="button" class="linkish" @click="openAuth('wechat', 'shared_report')">登录工作台导出</button>
    </p>
  </GeoHubPage>
</template>

<style scoped>
.meta-box {
  display: grid; gap: 0.75rem; margin: 0 0 1.5rem; padding: 1rem;
  border: 1px solid hsl(var(--border)); border-radius: var(--radius); font-size: 0.9rem;
}
.meta-box dt { font-weight: 600; margin-bottom: 0.15rem; }
.meta-box dd { margin: 0; color: hsl(var(--muted-foreground)); line-height: 1.6; }
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.5rem; }
.hub-section p, .hub-section li { line-height: 1.75; }
.next { margin-top: 1.75rem; }
.next a, .next .linkish {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}
.next .linkish {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
</style>
