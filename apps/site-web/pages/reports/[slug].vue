<script setup lang="ts">
import { GEO_REPORTS, GEO_CONTENT_PIPELINE, getReport } from '~/utils/geo-hub'
import { fetchHubByKind, mergeReports } from '~/utils/content/cms-hub'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { data: report } = await useAsyncData(
  () => `hub-report-${route.params.slug}`,
  async () => {
    const cms = await fetchHubByKind('report')
    const merged = mergeReports(GEO_REPORTS, cms)
    return merged.find((r) => r.slug === slug.value) || getReport(slug.value) || null
  },
)

if (!report.value) {
  throw createError({ statusCode: 404, statusMessage: '报告不存在' })
}

useGeoHubPageSeo({
  title: report.value.title,
  description: report.value.description,
  keywords: 'GEO报告,AI搜索可见性,采样方法,证据样例',
  path: `/reports/${report.value.slug}`,
  type: 'article',
  datePublished: report.value.datePublished,
  dateModified: report.value.dateModified,
  faqs: report.value.faq,
})
</script>

<template>
  <GeoHubPage
    v-if="report"
    eyebrow="方法报告"
    :title="report.title"
    :description="report.description"
    :diagnose-cta="false"
  >
    <dl class="meta-box">
      <div><dt>发布</dt><dd><time :datetime="report.datePublished">{{ report.datePublished }}</time></dd></div>
      <div><dt>更新</dt><dd><time :datetime="report.dateModified">{{ report.dateModified }}</time></dd></div>
      <div><dt>引擎</dt><dd>{{ report.engines.join('、') }}</dd></div>
      <div v-if="report.samplingPeriod">
        <dt>采样周期</dt>
        <dd>{{ report.samplingPeriod.start }} ~ {{ report.samplingPeriod.end }}（{{ report.samplingPeriod.cadence }}）</dd>
      </div>
      <div v-if="report.questionSetVersion"><dt>问题集版本</dt><dd><code>{{ report.questionSetVersion }}</code></dd></div>
      <div v-if="report.sampleSize">
        <dt>样本量</dt>
        <dd>
          prompts {{ report.sampleSize.prompts }}
          · answers {{ report.sampleSize.answers }}
          <template v-if="report.sampleSize.brands"> · brands {{ report.sampleSize.brands }}</template>
        </dd>
      </div>
      <div v-if="report.authors?.length"><dt>作者</dt><dd>{{ report.authors.join('、') }}</dd></div>
      <div><dt>方法</dt><dd>{{ report.method }}</dd></div>
    </dl>

    <section v-if="report.metricsDefinitions?.length" class="hub-section">
      <h2>指标定义</h2>
      <dl class="metric-defs">
        <div v-for="m in report.metricsDefinitions" :key="m.name">
          <dt>{{ m.name }}</dt>
          <dd>{{ m.definition }}</dd>
        </div>
      </dl>
    </section>

    <article>
      <section v-for="s in report.sections" :key="s.heading" class="hub-section">
        <h2>{{ s.heading }}</h2>
        <p v-for="(para, i) in s.paragraphs" :key="i">{{ para }}</p>
      </section>
    </article>

    <section v-if="report.evidenceSamples?.length" class="hub-section">
      <h2>证据样例</h2>
      <p class="lede">脱敏摘录，用于展示可复核结构。完整证据包在授权审计场景提供。</p>
      <article v-for="ev in report.evidenceSamples" :key="ev.id" class="evidence card">
        <div class="card-header">
          <div class="card-title">{{ ev.engine }} · {{ ev.sampledAt }}</div>
          <div class="card-description"><strong>问：</strong>{{ ev.question }}</div>
        </div>
        <blockquote>{{ ev.excerpt }}</blockquote>
        <div class="ev-meta">
          引用类型：{{ ev.citationTypes.join('、') }}
          <span v-if="ev.note"> · {{ ev.note }}</span>
        </div>
      </article>
    </section>

    <section v-if="report.limitations?.length" class="hub-section">
      <h2>局限与声明</h2>
      <ul>
        <li v-for="l in report.limitations" :key="l">{{ l }}</li>
      </ul>
    </section>

    <GeoHubFaq v-if="report.faq?.length" :items="[...report.faq]" />

    <section class="hub-section">
      <h2>内容生产流程</h2>
      <ol>
        <li v-for="step in GEO_CONTENT_PIPELINE" :key="step">{{ step }}</li>
      </ol>
    </section>

    <p class="next">
      <NuxtLink to="/reports">全部报告</NuxtLink> ·
      <NuxtLink to="/engines">引擎文档</NuxtLink> ·
      <NuxtLink to="/diagnose">免费诊断</NuxtLink>
    </p>
  </GeoHubPage>
</template>

<style scoped>
.meta-box {
  display: grid;
  gap: 0.75rem;
  margin: 0 0 2rem;
  padding: 1rem 1.1rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  font-size: 0.9rem;
}
.meta-box dt { font-weight: 600; margin-bottom: 0.15rem; }
.meta-box dd { margin: 0; color: hsl(var(--muted-foreground)); line-height: 1.6; }
.metric-defs { display: grid; gap: 0.75rem; }
.metric-defs dt { font-weight: 600; }
.metric-defs dd { margin: 0.2rem 0 0; color: hsl(var(--muted-foreground)); line-height: 1.6; }
.hub-section { margin-top: 1.75rem; }
.hub-section h2 { font-size: 1.2rem; margin-bottom: 0.65rem; }
.hub-section p, .hub-section li { line-height: 1.8; margin: 0 0 0.65rem; }
.lede { color: hsl(var(--muted-foreground)); margin-bottom: 0.85rem !important; }
.evidence { margin-bottom: 0.75rem; }
.evidence blockquote {
  margin: 0 1.1rem 0.75rem;
  padding-left: 0.75rem;
  border-left: 3px solid hsl(var(--border));
  color: hsl(var(--foreground) / 0.9);
  line-height: 1.7;
  font-size: 0.95rem;
}
.ev-meta { margin: 0 1.1rem 1rem; font-size: 0.8rem; color: hsl(var(--muted-foreground)); }
.next { margin-top: 2rem; }
.next a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
code { font-size: 0.85em; }
</style>
