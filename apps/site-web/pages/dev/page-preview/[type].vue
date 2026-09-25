<script setup lang="ts">
import {
  PREVIEW_TYPES,
  SAMPLE_LEARN,
  SAMPLE_GLOSSARY,
  SAMPLE_INSIGHT,
  SAMPLE_REPORT,
  SAMPLE_PRODUCT,
  SAMPLE_SOLUTION,
  SAMPLE_COMPARE,
  SAMPLE_HUB,
  SAMPLE_TOOL_SHELL,
  SAMPLE_ECOSYSTEM,
  SAMPLE_BENCHMARK_DOC,
  SAMPLE_DEFAULT,
  type PreviewTypeId,
} from '~/utils/content/page-type-samples'

definePageMeta({ layout: 'geo' })

const route = useRoute()
const typeId = computed(() => String(route.params.type || '') as PreviewTypeId)
const meta = computed(() => PREVIEW_TYPES.find((t) => t.id === typeId.value))

if (!meta.value) {
  throw createError({ statusCode: 404, statusMessage: '未知页面类型' })
}

useHead({
  title: `样例预览 · ${meta.value.label}`,
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})

const samples: Record<PreviewTypeId, unknown> = {
  learn: SAMPLE_LEARN,
  glossary: SAMPLE_GLOSSARY,
  insight: SAMPLE_INSIGHT,
  report: SAMPLE_REPORT,
  product: SAMPLE_PRODUCT,
  solution: SAMPLE_SOLUTION,
  compare: SAMPLE_COMPARE,
  hub: SAMPLE_HUB,
  tool_shell: SAMPLE_TOOL_SHELL,
  ecosystem: SAMPLE_ECOSYSTEM,
  benchmark_doc: SAMPLE_BENCHMARK_DOC,
  default: SAMPLE_DEFAULT,
}

const data = computed(() => samples[typeId.value])
</script>

<template>
  <div>
    <div class="preview-bar">
      <div class="container bar-inner">
        <NuxtLink to="/dev/page-preview" class="back">← 全部类型</NuxtLink>
        <label class="switcher">
          <span>切换类型</span>
          <select
            :value="typeId"
            @change="navigateTo(`/dev/page-preview/${($event.target as HTMLSelectElement).value}`)"
          >
            <option v-for="t in PREVIEW_TYPES" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
        </label>
        <span class="hint">
          DEV · noindex · 约 {{ meta?.approxChars }} 字 · {{ meta?.readingMinutes }} 分钟阅读
        </span>
      </div>
    </div>

    <!-- LEARN -->
    <GeoHubPage
      v-if="typeId === 'learn'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
      :diagnose-cta="false"
    >
      <aside v-if="(data as any).answerBox" class="answer-box card pad">
        <strong>可摘录定义</strong>
        <p>{{ (data as any).answerBox }}</p>
      </aside>
      <section v-if="(data as any).primarySources?.length" class="sec">
        <h2>一级出处</h2>
        <ul class="sources">
          <li v-for="s in (data as any).primarySources" :key="s.href">
            <a :href="s.href" target="_blank" rel="noopener noreferrer">{{ s.label }}</a>
            <span class="muted"> — {{ s.note }}</span>
          </li>
        </ul>
      </section>
      <section class="sec">
        <h2>关键结论</h2>
        <ul class="bullets"><li v-for="t in (data as any).takeaways" :key="t">{{ t }}</li></ul>
      </section>
      <section v-for="s in (data as any).sections" :key="s.heading" class="sec">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, i) in (s.paragraphs || [])" :key="i">{{ p }}</p>
        <ul v-if="s.bullets?.length" class="bullets">
          <li v-for="b in s.bullets" :key="b">{{ b }}</li>
        </ul>
        <ol v-if="s.steps?.length" class="steps">
          <li v-for="st in s.steps" :key="st.title">
            <strong>{{ st.title }}</strong>
            <p>{{ st.body }}</p>
          </li>
        </ol>
      </section>
      <section class="sec">
        <h2>核心指标怎么读</h2>
        <div v-for="m in (data as any).metrics" :key="m.name" class="metric">
          <h3>{{ m.name }}</h3>
          <p>{{ m.definition }}</p>
          <p class="muted">读法：{{ m.howToRead }}</p>
          <p class="muted">坑：{{ m.pitfall }}</p>
        </div>
      </section>
      <section class="sec">
        <h2>可执行清单</h2>
        <ol><li v-for="c in (data as any).checklist" :key="c">{{ c }}</li></ol>
        <h3>反模式</h3>
        <ul><li v-for="a in (data as any).antiPatterns" :key="a">{{ a }}</li></ul>
      </section>
      <section class="sec">
        <h2>场景例子</h2>
        <article v-for="e in (data as any).examples" :key="e.title" class="card pad">
          <strong>{{ e.title }}</strong>
          <p>{{ e.body }}</p>
        </article>
      </section>
      <section class="sec">
        <h2>相关术语</h2>
        <p>
          <NuxtLink v-for="g in (data as any).relatedGlossary" :key="g.to" :to="g.to" class="chip">{{ g.term }}</NuxtLink>
        </p>
        <p v-if="(data as any).relatedProduct" class="soft-cta">
          <NuxtLink :to="(data as any).relatedProduct.to" class="btn btn-outline btn-sm">{{ (data as any).relatedProduct.label }}</NuxtLink>
        </p>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- GLOSSARY -->
    <GeoHubPage
      v-else-if="typeId === 'glossary'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
      :diagnose-cta="false"
    >
      <aside v-if="(data as any).answerBox" class="answer-box card pad">
        <strong>可摘录定义</strong>
        <p>{{ (data as any).answerBox }}</p>
      </aside>
      <p class="aka">又称：{{ (data as any).alsoKnownAs.join('、') }} · 短定义：{{ (data as any).short }}</p>
      <section v-if="(data as any).primarySources?.length" class="sec">
        <h2>一级出处</h2>
        <ul class="sources">
          <li v-for="s in (data as any).primarySources" :key="s.href">
            <a :href="s.href" target="_blank" rel="noopener noreferrer">{{ s.label }}</a>
            <span class="muted"> — {{ s.note }}</span>
          </li>
        </ul>
      </section>
      <section class="sec"><h2>定义</h2><p>{{ (data as any).definition }}</p></section>
      <section class="sec"><h2>在 GEO 中的用法</h2><p>{{ (data as any).inGeo }}</p></section>
      <p v-if="(data as any).vendorNote" class="muted sec">{{ (data as any).vendorNote }}</p>
      <section class="sec">
        <h2>易混辨析</h2>
        <div v-for="d in (data as any).disambiguation" :key="d.vs" class="metric">
          <h3>vs {{ d.vs }}</h3><p>{{ d.note }}</p>
        </div>
      </section>
      <section class="sec"><h2>如何测量</h2><p>{{ (data as any).howMeasured }}</p></section>
      <section v-if="(data as any).formula" class="sec">
        <h2>公式</h2>
        <p class="formula">{{ (data as any).formula }}</p>
      </section>
      <section v-if="(data as any).measurementSteps?.length" class="sec">
        <h2>测量步骤</h2>
        <ol><li v-for="s in (data as any).measurementSteps" :key="s">{{ s }}</li></ol>
      </section>
      <section class="sec">
        <h2>正例 / 反例</h2>
        <p><strong>正例：</strong>{{ (data as any).examples.good }}</p>
        <p><strong>反例：</strong>{{ (data as any).examples.bad }}</p>
      </section>
      <section v-if="(data as any).commonMistakes?.length" class="sec">
        <h2>常见错误</h2>
        <ul><li v-for="m in (data as any).commonMistakes" :key="m">{{ m }}</li></ul>
      </section>
      <section class="sec">
        <h2>相关术语</h2>
        <NuxtLink v-for="r in (data as any).related" :key="r.to" :to="r.to" class="chip">{{ r.term }}</NuxtLink>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- INSIGHT -->
    <GeoHubPage
      v-else-if="typeId === 'insight'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
      :diagnose-cta="false"
    >
      <aside v-if="(data as any).answerBox" class="answer-box card pad">
        <strong>可摘录结论</strong>
        <p>{{ (data as any).answerBox }}</p>
      </aside>
      <p class="meta-line">{{ (data as any).category }} · {{ (data as any).readingMinutes }} 分钟 · 更新 {{ (data as any).dateModified }}</p>
      <section v-if="(data as any).fieldNotes?.length" class="sec">
        <h2>现场观察（脱敏）</h2>
        <article v-for="n in (data as any).fieldNotes" :key="n.title" class="card pad">
          <strong>{{ n.title }}</strong>
          <p>{{ n.body }}</p>
        </article>
      </section>
      <section class="sec">
        <h2>TL;DR</h2>
        <ul class="bullets"><li v-for="t in (data as any).takeaways" :key="t">{{ t }}</li></ul>
      </section>
      <section v-for="s in (data as any).sections" :key="s.heading" class="sec">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, i) in (s.paragraphs || [])" :key="i">{{ p }}</p>
        <ul v-if="s.bullets?.length" class="bullets">
          <li v-for="b in s.bullets" :key="b">{{ b }}</li>
        </ul>
        <ol v-if="s.steps?.length" class="steps">
          <li v-for="st in s.steps" :key="st.title">
            <strong>{{ st.title }}</strong>
            <p>{{ st.body }}</p>
          </li>
        </ol>
      </section>
      <section class="sec">
        <h2>发布前清单</h2>
        <ol><li v-for="c in (data as any).checklist" :key="c">{{ c }}</li></ol>
      </section>
      <section v-if="(data as any).primarySources?.length" class="sec">
        <h2>相关出处</h2>
        <ul class="sources">
          <li v-for="s in (data as any).primarySources" :key="s.href">
            <NuxtLink v-if="s.href.startsWith('/')" :to="s.href">{{ s.label }}</NuxtLink>
            <a v-else :href="s.href" target="_blank" rel="noopener noreferrer">{{ s.label }}</a>
            <span class="muted"> — {{ s.note }}</span>
          </li>
        </ul>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- REPORT -->
    <GeoHubPage
      v-else-if="typeId === 'report'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
      :diagnose-cta="false"
    >
      <aside v-if="(data as any).answerBox" class="answer-box card pad">
        <strong>报告定位</strong>
        <p>{{ (data as any).answerBox }}</p>
      </aside>
      <p v-if="(data as any).positioningNote" class="muted">{{ (data as any).positioningNote }}</p>
      <aside class="cite card pad">
        <strong>如何引用</strong>
        <p>{{ (data as any).citeHow }}</p>
      </aside>
      <dl class="meta-box">
        <div><dt>作者</dt><dd>{{ (data as any).authors.join('、') }}</dd></div>
        <div><dt>发布 / 更新</dt><dd>{{ (data as any).datePublished }} / {{ (data as any).dateModified }}</dd></div>
        <div><dt>引擎</dt><dd>{{ (data as any).engines.join('、') }}</dd></div>
        <div><dt>采样周期</dt><dd>{{ (data as any).samplingPeriod.start }} ~ {{ (data as any).samplingPeriod.end }}（{{ (data as any).samplingPeriod.cadence }}）</dd></div>
        <div><dt>问题集</dt><dd><code>{{ (data as any).questionSetVersion }}</code></dd></div>
        <div><dt>样本量</dt><dd>prompts {{ (data as any).sampleSize.prompts }} · answers {{ (data as any).sampleSize.answers }}（方法演示窗口，非全量普查）</dd></div>
        <div><dt>方法</dt><dd>{{ (data as any).method }}</dd></div>
      </dl>
      <section v-if="(data as any).changelog?.length" class="sec">
        <h2>Changelog</h2>
        <ul>
          <li v-for="c in (data as any).changelog" :key="c.version">
            <code>{{ c.version }}</code> · {{ c.date }} — {{ c.note }}
          </li>
        </ul>
      </section>
      <section class="sec">
        <h2>指标定义</h2>
        <div v-for="m in (data as any).metricsDefinitions" :key="m.name" class="metric">
          <h3>{{ m.name }}</h3>
          <p>{{ m.definition }}</p>
          <p class="muted">坑：{{ m.pitfall }}</p>
        </div>
      </section>
      <section v-for="f in (data as any).findings" :key="f.heading" class="sec">
        <h2>{{ f.heading }}</h2>
        <p v-for="(p, i) in (f.paragraphs || [])" :key="i">{{ p }}</p>
        <ul v-if="f.bullets?.length" class="bullets">
          <li v-for="b in f.bullets" :key="b">{{ b }}</li>
        </ul>
      </section>
      <section class="sec">
        <h2>证据样例</h2>
        <article v-for="(ev, i) in (data as any).evidenceSamples" :key="i" class="card pad evidence">
          <div class="ev-h">{{ ev.engine }} · {{ ev.sampledAt }}</div>
          <p><strong>问：</strong>{{ ev.question }}</p>
          <blockquote>{{ ev.excerpt }}</blockquote>
          <p class="muted">引用类型：{{ ev.citationTypes.join('、') }} · {{ ev.note }}</p>
        </article>
      </section>
      <section class="sec">
        <h2>局限与声明</h2>
        <ul><li v-for="l in (data as any).limitations" :key="l">{{ l }}</li></ul>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- PRODUCT -->
    <GeoHubPage
      v-else-if="typeId === 'product'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
      :console-path="(data as any).consolePath"
    >
      <section class="sec">
        <h2>适合谁</h2>
        <p>{{ (data as any).whoFor.join('、') }}</p>
      </section>
      <section class="sec">
        <h2>你看什么指标</h2>
        <div v-for="m in (data as any).metrics" :key="m.name" class="metric">
          <h3>{{ m.name }}</h3><p>决策用途：{{ m.use }}</p>
        </div>
      </section>
      <section class="sec">
        <h2>怎么用</h2>
        <ol><li v-for="u in (data as any).usage" :key="u">{{ u }}</li></ol>
      </section>
      <section class="sec"><h2>上下游</h2><p>{{ (data as any).workflow }}</p></section>
      <section class="sec">
        <h2>输入 / 输出 / 不做</h2>
        <p><strong>输入：</strong>{{ (data as any).inputsOutputs.in.join('、') }}</p>
        <p><strong>输出：</strong>{{ (data as any).inputsOutputs.out.join('、') }}</p>
        <p><strong>不做：</strong>{{ (data as any).inputsOutputs.not.join('、') }}</p>
      </section>
      <section v-for="s in ((data as any).sections || [])" :key="s.heading" class="sec">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, i) in (s.paragraphs || [])" :key="i">{{ p }}</p>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- SOLUTION -->
    <GeoHubPage
      v-else-if="typeId === 'solution'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
    >
      <section class="sec">
        <h2>痛点（在 AI 答案中的表现）</h2>
        <div v-for="p in (data as any).painPoints" :key="p.title" class="metric">
          <h3>{{ p.title }}</h3><p>{{ p.ai }}</p>
        </div>
      </section>
      <section class="sec">
        <h2>成功样子（定性）</h2>
        <ul><li v-for="o in (data as any).outcomes" :key="o">{{ o }}</li></ul>
      </section>
      <section class="sec">
        <h2>分阶段打法</h2>
        <article v-for="pl in (data as any).plays" :key="pl.phase" class="card pad">
          <strong>{{ pl.phase }}</strong>
          <p>{{ pl.actions }}</p>
          <p class="muted">看：{{ pl.metrics }}</p>
        </article>
      </section>
      <section class="sec"><h2>用到的产品模块</h2><p>{{ (data as any).stack.join('、') }}</p></section>
      <section class="sec"><h2>30 天内容优先级</h2><ol><li v-for="c in (data as any).contentPlan" :key="c">{{ c }}</li></ol></section>
      <section v-for="s in ((data as any).sections || [])" :key="s.heading" class="sec">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, i) in (s.paragraphs || [])" :key="i">{{ p }}</p>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- COMPARE -->
    <GeoHubPage
      v-else-if="typeId === 'compare'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
      :diagnose-cta="false"
    >
      <aside v-if="(data as any).answerBox" class="answer-box card pad">
        <strong>可摘录结论</strong>
        <p>{{ (data as any).answerBox }}</p>
      </aside>
      <section v-if="(data as any).primarySources?.length" class="sec">
        <h2>一级出处</h2>
        <ul class="sources">
          <li v-for="s in (data as any).primarySources" :key="s.href">
            <a :href="s.href" target="_blank" rel="noopener noreferrer">{{ s.label }}</a>
            <span class="muted"> — {{ s.note }}</span>
          </li>
        </ul>
      </section>
      <section class="sec card pad"><h2>快速结论</h2><p>{{ (data as any).verdict }}</p></section>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>维度</th><th>{{ (data as any).leftLabel }}</th><th>{{ (data as any).rightLabel }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in (data as any).rows" :key="r.dimension">
              <td>{{ r.dimension }}</td><td>{{ r.left }}</td><td>{{ r.right }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <section class="sec">
        <h2>常见误解</h2>
        <ul><li v-for="m in (data as any).misconceptions" :key="m">{{ m }}</li></ul>
      </section>
      <section class="sec">
        <h2>决策指引</h2>
        <ol><li v-for="d in (data as any).decision" :key="d">{{ d }}</li></ol>
      </section>
      <section v-for="s in ((data as any).sections || [])" :key="s.heading" class="sec">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, i) in (s.paragraphs || [])" :key="i">{{ p }}</p>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- HUB -->
    <main v-else-if="typeId === 'hub'" class="hub-full">
      <section class="hub-hero-full">
        <div class="container">
          <div class="brand">{{ (data as any).brand }}</div>
          <h1>{{ (data as any).title }}</h1>
          <p>{{ (data as any).lead }}</p>
          <div class="actions">
            <NuxtLink :to="(data as any).primaryCta.to" class="btn btn-default btn-lg">{{ (data as any).primaryCta.label }}</NuxtLink>
            <NuxtLink :to="(data as any).secondaryCta.to" class="btn btn-outline btn-lg">{{ (data as any).secondaryCta.label }}</NuxtLink>
          </div>
        </div>
      </section>
      <section class="container sec">
        <h2>为何可信</h2>
        <ul class="bullets"><li v-for="p in (data as any).proofPoints" :key="p">{{ p }}</li></ul>
      </section>
      <section class="container sec">
        <h2>产品能力</h2>
        <div class="chip-row">
          <NuxtLink v-for="c in (data as any).capabilities" :key="c.to" :to="c.to" class="chip">{{ c.title }}</NuxtLink>
        </div>
      </section>
      <section class="container sec">
        <h2>学习与报告</h2>
        <div class="chip-row">
          <NuxtLink v-for="l in (data as any).learnRail" :key="l.to" :to="l.to" class="chip">{{ l.title }}</NuxtLink>
          <NuxtLink v-for="r in (data as any).reportRail" :key="r.to" :to="r.to" class="chip">{{ r.title }}</NuxtLink>
        </div>
      </section>
      <section v-if="(data as any).faq?.length" class="container sec">
        <GeoHubFaq :items="(data as any).faq" />
      </section>
    </main>

    <!-- TOOL SHELL -->
    <GeoHubPage
      v-else-if="typeId === 'tool_shell'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
      :diagnose-cta="false"
      console-path="/dashboard/report-center"
    >
      <section class="sec">
        <h2>怎么做</h2>
        <ol><li v-for="h in (data as any).howItWorks" :key="h">{{ h }}</li></ol>
      </section>
      <section class="sec">
        <h2>你能得到什么</h2>
        <p><strong>公开页：</strong>{{ (data as any).whatYouGet.public.join('、') }}</p>
        <p><strong>登录后：</strong>{{ (data as any).whatYouGet.loggedIn.join('、') }}</p>
      </section>
      <section class="sec"><h2>隐私与边界</h2><p>{{ (data as any).privacy }}</p></section>
      <section class="sec card pad fixed-slot">
        <strong>FixedSlot（代码区示意）</strong>
        <p>{{ (data as any).fixedSlotNote }}</p>
        <div class="fake-form">
          <input class="input" placeholder="品牌名称或官网（示意，不提交）" disabled>
          <button class="btn btn-default" type="button" disabled>开始免费体检</button>
        </div>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- ECOSYSTEM -->
    <GeoHubPage
      v-else-if="typeId === 'ecosystem'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
    >
      <p class="meta-line">行业：{{ (data as any).industry }}</p>
      <section v-for="s in ((data as any).sections || [])" :key="s.heading" class="sec">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, i) in (s.paragraphs || [])" :key="i">{{ p }}</p>
        <ul v-if="s.bullets?.length" class="bullets">
          <li v-for="b in s.bullets" :key="b">{{ b }}</li>
        </ul>
      </section>
      <section class="sec">
        <h2>做了什么</h2>
        <ol><li v-for="a in (data as any).actions" :key="a">{{ a }}</li></ol>
      </section>
      <section class="sec">
        <h2>关于结果数字</h2>
        <p>{{ (data as any).outcomeNote }}</p>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- BENCHMARK DOC -->
    <GeoHubPage
      v-else-if="typeId === 'benchmark_doc'"
      :eyebrow="(data as any).eyebrow"
      :title="(data as any).title"
      :description="(data as any).lead"
      :diagnose-cta="false"
    >
      <aside v-if="(data as any).answerBox" class="answer-box card pad">
        <strong>可摘录结论</strong>
        <p>{{ (data as any).answerBox }}</p>
      </aside>
      <section v-if="(data as any).primarySources?.length" class="sec">
        <h2>一级出处</h2>
        <ul class="sources">
          <li v-for="s in (data as any).primarySources" :key="s.href">
            <NuxtLink v-if="s.href.startsWith('/')" :to="s.href">{{ s.label }}</NuxtLink>
            <a v-else :href="s.href" target="_blank" rel="noopener noreferrer">{{ s.label }}</a>
            <span class="muted"> — {{ s.note }}</span>
          </li>
        </ul>
      </section>
      <section class="sec">
        <h2>原则</h2>
        <ul><li v-for="p in (data as any).principles" :key="p">{{ p }}</li></ul>
      </section>
      <section class="sec">
        <h2>引擎目录</h2>
        <div v-for="e in (data as any).catalog" :key="e.name" class="metric">
          <h3>{{ e.name }}</h3><p>{{ e.note }}</p>
        </div>
      </section>
      <section class="sec"><h2>如何与报告对齐引用</h2><p>{{ (data as any).citeHow }}</p></section>
      <section class="sec"><h2>变更策略</h2><p>{{ (data as any).changePolicy }}</p></section>
      <section v-for="s in ((data as any).sections || [])" :key="s.heading" class="sec">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, i) in (s.paragraphs || [])" :key="i">{{ p }}</p>
        <ol v-if="s.steps?.length" class="steps">
          <li v-for="st in s.steps" :key="st.title">
            <strong>{{ st.title }}</strong>
            <p>{{ st.body }}</p>
          </li>
        </ol>
      </section>
      <GeoHubFaq :items="(data as any).faq" />
    </GeoHubPage>

    <!-- DEFAULT -->
    <GeoHubPage
      v-else-if="typeId === 'default'"
      eyebrow="客户站 · default"
      :title="(data as any).title"
      :description="(data as any).lead"
      :diagnose-cta="false"
    >
      <section v-for="(b, i) in (data as any).blocks" :key="i" class="sec">
        <template v-if="b.type === 'hero'">
          <h2>{{ b.heading }}</h2>
          <p>{{ b.subtitle }}</p>
        </template>
        <div v-else-if="b.type === 'richtext'" v-html="b.html" />
      </section>
      <GeoHubFaq :items="(data as any).qa.map((q: any) => ({ q: q.q, a: q.a }))" />
    </GeoHubPage>
  </div>
</template>

<style scoped>
.preview-bar {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.92);
  backdrop-filter: blur(8px);
}
.bar-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: center;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
}
.back { color: hsl(var(--primary)); }
.switcher { display: flex; align-items: center; gap: 0.4rem; }
.switcher select {
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 0.25rem 0.5rem;
  background: hsl(var(--background));
}
.hint { color: hsl(var(--muted-foreground)); margin-left: auto; }
.answer-box { margin-bottom: 1.25rem; border-left: 3px solid hsl(var(--primary)); }
.answer-box p { margin: 0.5rem 0 0; line-height: 1.7; }
.sources { padding-left: 1.2rem; }
.sources li { margin-bottom: 0.55rem; line-height: 1.55; }
.sources a { color: hsl(var(--primary)); }
.soft-cta { margin-top: 0.85rem; }
.sec { margin-top: 1.75rem; }
.sec h2 { font-size: 1.2rem; margin: 0 0 0.65rem; }
.sec h3 { font-size: 1rem; margin: 0.85rem 0 0.35rem; }
.sec p, .sec li { line-height: 1.75; margin: 0 0 0.65rem; }
.bullets, .steps { padding-left: 1.2rem; }
.steps li { margin-bottom: 0.75rem; }
.steps p { margin: 0.25rem 0 0; }
.formula {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--muted) / 0.25);
}
.metric { margin-bottom: 0.85rem; padding-bottom: 0.65rem; border-bottom: 1px solid hsl(var(--border) / 0.7); }
.metric h3 { margin: 0 0 0.25rem; font-size: 1rem; }
.muted, .meta-line, .aka { color: hsl(var(--muted-foreground)); font-size: 0.9rem; line-height: 1.6; }
.chip {
  display: inline-block;
  margin: 0 0.4rem 0.4rem 0;
  padding: 0.25rem 0.65rem;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  font-size: 0.85rem;
  color: hsl(var(--foreground));
}
.chip-row { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.pad { padding: 1rem 1.1rem; }
.cite { margin-bottom: 1.25rem; }
.meta-box {
  display: grid; gap: 0.75rem; padding: 1rem; border: 1px solid hsl(var(--border));
  border-radius: var(--radius); font-size: 0.9rem; margin-bottom: 0.5rem;
}
.meta-box dt { font-weight: 600; margin-bottom: 0.15rem; }
.meta-box dd { margin: 0; color: hsl(var(--muted-foreground)); line-height: 1.55; }
.evidence blockquote {
  margin: 0.5rem 0; padding-left: 0.75rem; border-left: 3px solid hsl(var(--border)); line-height: 1.65;
}
.ev-h { font-weight: 600; margin-bottom: 0.35rem; }
.table-wrap { overflow-x: auto; margin-top: 1rem; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { border: 1px solid hsl(var(--border)); padding: 0.55rem 0.65rem; text-align: left; vertical-align: top; }
th { background: hsl(var(--muted) / 0.35); }
.hub-full { padding-bottom: 3rem; }
.hub-hero-full {
  padding: 3.5rem 0 2.5rem;
  background:
    radial-gradient(1200px 400px at 10% -10%, hsl(var(--primary) / 0.12), transparent),
    hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
}
.hub-hero-full .brand {
  font-size: clamp(1.4rem, 3vw, 1.85rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 0.75rem;
}
.hub-hero-full h1 {
  font-size: clamp(1.75rem, 4vw, 2.6rem);
  letter-spacing: -0.035em;
  line-height: 1.15;
  margin: 0 0 0.85rem;
  max-width: 16ch;
}
.hub-hero-full p { max-width: 36rem; color: hsl(var(--muted-foreground)); line-height: 1.7; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem; }
.fixed-slot { border-style: dashed; }
.fake-form { display: flex; gap: 0.5rem; margin-top: 0.75rem; max-width: 28rem; }
.fake-form .input { flex: 1; }
</style>
