<script setup lang="ts">
/**
 * CMS 结构化详情页（learn / glossary / insight / product / solution / compare / report）
 */
const props = defineProps<{
  pageKind: string
  content: Record<string, any>
}>()

const c = computed(() => props.content || {})
const title = computed(
  () => c.value.title || c.value.term || '未命名',
)
const description = computed(
  () => c.value.answerBox || c.value.short || c.value.description || c.value.definition || '',
)
const eyebrow = computed(() => {
  const map: Record<string, string> = {
    learn: '学习',
    glossary: '术语',
    insight: '实战',
    report: '报告',
    product: 'GEO工具',
    solution: '方案',
    compare: '对比',
  }
  return map[props.pageKind] || '内容'
})
</script>

<template>
  <GeoHubPage
    :eyebrow="eyebrow"
    :title="String(title).split('｜')[0]"
    :description="description"
    :diagnose-cta="pageKind === 'product' || pageKind === 'solution'"
    :console-path="c.consolePath"
  >
    <p v-if="c.answerBox && c.description" class="lead">{{ c.lead || c.description }}</p>

    <section v-if="c.primarySources?.length" class="hub-section">
      <h2>一级出处</h2>
      <ul>
        <li v-for="(s, i) in c.primarySources" :key="i">
          <a :href="s.href" target="_blank" rel="noopener">{{ s.label }}</a>
          <span v-if="s.note"> — {{ s.note }}</span>
        </li>
      </ul>
    </section>

    <section v-if="c.takeaways?.length" class="hub-section">
      <h2>要点</h2>
      <ul>
        <li v-for="(t, i) in c.takeaways" :key="i">{{ t }}</li>
      </ul>
    </section>

    <section v-if="pageKind === 'glossary' && c.definition" class="hub-section">
      <h2>{{ c.term }} 的定义</h2>
      <p>{{ c.definition }}</p>
      <p v-if="c.formula"><strong>公式：</strong>{{ c.formula }}</p>
      <p v-if="c.howMeasured">{{ c.howMeasured }}</p>
    </section>

    <section v-if="pageKind === 'product' && c.metrics?.length" class="hub-section">
      <h2>看什么指标</h2>
      <ul><li v-for="m in c.metrics" :key="m">{{ m }}</li></ul>
    </section>
    <section v-if="pageKind === 'product' && c.usage?.length" class="hub-section">
      <h2>怎么用</h2>
      <ol><li v-for="u in c.usage" :key="u">{{ u }}</li></ol>
    </section>

    <section v-if="pageKind === 'solution' && c.painPoints?.length" class="hub-section">
      <h2>痛点</h2>
      <ul><li v-for="p in c.painPoints" :key="p">{{ p }}</li></ul>
    </section>
    <section v-if="pageKind === 'solution' && c.plays?.length" class="hub-section">
      <h2>打法</h2>
      <ol><li v-for="p in c.plays" :key="p">{{ p }}</li></ol>
    </section>

    <section v-if="pageKind === 'compare' && c.dimensions?.length" class="hub-section">
      <h2>{{ c.left }} vs {{ c.right }}</h2>
      <table class="cmp">
        <thead>
          <tr><th>维度</th><th>{{ c.left }}</th><th>{{ c.right }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(d, i) in c.dimensions" :key="i">
            <td>{{ d.name }}</td>
            <td>{{ d.left }}</td>
            <td>{{ d.right }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="pageKind === 'report' && c.method" class="hub-section">
      <h2>方法</h2>
      <p>{{ c.method }}</p>
      <p v-if="c.engines?.length"><strong>引擎：</strong>{{ c.engines.join('、') }}</p>
      <p v-if="c.questionSetVersion"><strong>题集：</strong>{{ c.questionSetVersion }}</p>
    </section>

    <article>
      <section v-for="(s, i) in (c.sections || [])" :key="i" class="hub-section">
        <h2>{{ s.heading || s.title }}</h2>
        <p v-for="(para, j) in (s.paragraphs || [])" :key="j">{{ para }}</p>
        <ul v-if="s.bullets?.length">
          <li v-for="(b, k) in s.bullets" :key="k">{{ b }}</li>
        </ul>
        <ol v-if="s.steps?.length">
          <li v-for="(st, k) in s.steps" :key="k">{{ st }}</li>
        </ol>
      </section>
    </article>

    <p v-if="c.relatedLinks?.length" class="hub-next">
      相关：
      <template v-for="(link, i) in c.relatedLinks" :key="link.to">
        <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
        <template v-if="i < c.relatedLinks.length - 1"> · </template>
      </template>
    </p>

    <GeoHubFaq v-if="c.faq?.length" :items="c.faq" />
  </GeoHubPage>
</template>

<style scoped>
.lead { line-height: 1.75; color: hsl(var(--muted-foreground)); margin: 0 0 1rem; }
.hub-section { margin-top: 1.75rem; }
.hub-section h2 { font-size: 1.2rem; margin-bottom: 0.65rem; }
.hub-section p, .hub-section li { line-height: 1.8; margin: 0 0 0.65rem; }
.hub-section a, .hub-next a {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}
.hub-next { margin-top: 2rem; color: hsl(var(--muted-foreground)); }
.cmp {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.cmp th, .cmp td {
  border: 1px solid hsl(var(--border));
  padding: 0.55rem 0.65rem;
  text-align: left;
  vertical-align: top;
}
.cmp th { background: hsl(var(--muted) / 0.35); }
</style>
