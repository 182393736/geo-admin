<script setup lang="ts">
import { GEO_REPORTS, GEO_CONTENT_PIPELINE, PUBLIC_REPORT_SLUGS, getReport } from '~/utils/geo-hub'
import { fetchHubByKind, mergeReports } from '~/utils/content/cms-hub'
import { GEO_AUTHOR_ORG } from '~/utils/content/authors'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { data: report } = await useAsyncData(
  () => `hub-report-${route.params.slug}`,
  async () => {
    const allow = new Set(PUBLIC_REPORT_SLUGS as readonly string[])
    if (!allow.has(slug.value)) return null
    const cms = await fetchHubByKind('report')
    const merged = mergeReports(GEO_REPORTS, cms)
    return merged.find((r) => r.slug === slug.value) || getReport(slug.value) || null
  },
)

if (!report.value) {
  throw createError({ statusCode: 404, statusMessage: '报告不存在' })
}

const { crumbs, author, published, modified } = useGeoHubPageSeo({
  title: report.value.title,
  description: report.value.description,
  keywords: 'GEO报告,AI搜索可见性,采样方法,证据样例,可复核基线',
  path: `/reports/${report.value.slug}`,
  type: 'article',
  datePublished: report.value.datePublished,
  dateModified: report.value.dateModified,
  faqs: report.value.faq,
  authorId: GEO_AUTHOR_ORG.id,
})
</script>

<template>
  <GeoHubPage
    v-if="report"
    eyebrow="方法报告"
    :title="report.title"
    :description="report.description"
    :diagnose-cta="false"
    :breadcrumbs="crumbs"
    :author-label="author.short"
    :date-published="published"
    :date-modified="modified"
  >
    <template #actions>
      <NuxtLink to="/reports" class="ghost">全部公开报告</NuxtLink>
      <NuxtLink to="/tools" class="ghost">看 GEO 工具</NuxtLink>
    </template>

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
        <p v-for="(para, i) in s.paragraphs" :key="i"><GeoLinkedText :text="para" /></p>
      </section>
    </article>

    <section v-if="report.evidenceSamples?.length" class="hub-section">
      <h2>证据样例</h2>
      <p class="lede">脱敏摘录，用于展示可复核结构。完整证据包在授权审计场景提供。</p>
      <article v-for="ev in report.evidenceSamples" :key="ev.id" class="evidence">
        <div class="ev-head">{{ ev.engine }} · {{ ev.sampledAt }}</div>
        <p class="ev-q"><strong>问：</strong>{{ ev.question }}</p>
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
      <NuxtLink to="/reports">公开报告</NuxtLink>
      ·
      <NuxtLink to="/learn">学习中心</NuxtLink>
      ·
      <NuxtLink to="/diagnose">免费诊断</NuxtLink>
    </p>
  </GeoHubPage>
</template>

<style scoped>
.meta-box {
  display: grid;
  gap: 12px;
  margin: 0 0 2rem;
  padding: 18px 20px;
  border-radius: 16px;
  background: #f7f7f8;
  font-size: 14px;
}
.meta-box dt {
  font-weight: 650;
  margin-bottom: 0.15rem;
  color: #16161a;
}
.meta-box dd {
  margin: 0;
  color: #6e6a76;
  line-height: 1.65;
}
.metric-defs { display: grid; gap: 12px; }
.metric-defs dt { font-weight: 650; }
.metric-defs dd { margin: 0.25rem 0 0; color: #6e6a76; line-height: 1.65; }
.lede { color: #6e6a76; margin-bottom: 0.85rem !important; }
.evidence {
  margin-bottom: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  background: #f7f7f8;
}
.ev-head {
  font-size: 13px;
  font-weight: 650;
  color: #c2410c;
  margin-bottom: 8px;
}
.ev-q {
  margin: 0 0 10px;
  font-size: 14px;
  color: #16161a;
  line-height: 1.55;
}
.evidence blockquote {
  margin: 0 0 10px;
  padding-left: 12px;
  border-left: 3px solid #f0c9b0;
  color: #3f3b46;
  line-height: 1.7;
  font-size: 14px;
}
.ev-meta { font-size: 12px; color: #9b97a3; line-height: 1.55; }
.next {
  margin-top: 2rem;
  padding: 16px 18px;
  border-radius: 14px;
  background: #fff4ec;
  color: #6e6a76;
  font-size: 14px;
}
.next a {
  color: #c2410c;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 3px;
}
code {
  font-size: 0.9em;
  background: #fff;
  padding: 1px 6px;
  border-radius: 6px;
}
</style>
