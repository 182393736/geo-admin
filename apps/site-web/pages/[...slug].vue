<script setup lang="ts">
import { asHomeContent, asHubColumnContent, asStructuredContent } from '~/utils/cms-page'

const sitePage = useSitePage()
const page = computed(() => sitePage.value?.page)
const homeContent = computed(() => asHomeContent(page.value))
const hubColumn = computed(() => asHubColumnContent(page.value))
const structured = computed(() => asStructuredContent(page.value))
const blocks = computed(() => page.value?.blocks || [])
const qa = computed(() => page.value?.qa || [])
const howto = computed(() => page.value?.howto || [])
const steps = computed(() => page.value?.steps || [])
const notFound = computed(() => !sitePage.value?.page)
const hasContent = computed(
  () => blocks.value.length || qa.value.length || howto.value.length || steps.value.length
)

if (homeContent.value || hubColumn.value || structured.value) {
  setPageLayout('geo')
}
</script>

<template>
  <GeoCmsHomePage v-if="homeContent" :content="homeContent" />
  <GeoCmsHubColumnPage v-else-if="hubColumn" :content="hubColumn" />
  <GeoCmsStructuredPage
    v-else-if="structured"
    :page-kind="structured.pageKind"
    :content="structured.content"
  />

  <div v-else>
    <div v-if="notFound" class="empty">
      <h1>页面不存在</h1>
      <p>当前域名尚未配置站点，或该路径没有已发布的页面。</p>
    </div>

    <template v-else>
      <h1 class="page-title">{{ page?.title }}</h1>

      <div v-if="!hasContent" class="empty-blocks">
        <p>该页面暂无内容。</p>
      </div>

      <section v-for="block in blocks" :key="block.id" class="block" :data-type="block.type">
        <div v-if="block.type === 'hero'" class="block-hero">
          <h2>{{ (block.props as any).heading || '' }}</h2>
          <p>{{ (block.props as any).subtitle || '' }}</p>
        </div>
        <div v-else-if="block.type === 'richtext'" class="block-richtext">
          <div v-html="(block.props as any).html || ''" />
        </div>
        <div v-else class="block-unknown">
          <code>{{ block.type }}</code>
          <pre>{{ block.props }}</pre>
        </div>
      </section>

      <section v-if="qa.length" class="section">
        <h2 class="section-title">问答</h2>
        <div v-for="item in qa" :key="item.id" class="qa-item">
          <h3 class="qa-q">{{ item.question }}</h3>
          <p class="qa-a">{{ item.answer }}</p>
        </div>
      </section>

      <section v-if="howto.length" class="section">
        <h2 class="section-title">HowTo</h2>
        <div v-for="item in howto" :key="item.id" class="list-item">
          <h3>{{ item.title }}</h3>
          <p>{{ item.content }}</p>
        </div>
      </section>

      <section v-if="steps.length" class="section">
        <h2 class="section-title">Steps</h2>
        <ol class="steps">
          <li v-for="item in steps" :key="item.id" class="list-item">
            <h3>{{ item.title }}</h3>
            <p>{{ item.content }}</p>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<style scoped>
.page-title { margin: 0 0 1.5rem; font-size: 2rem; }
.empty, .empty-blocks { padding: 3rem 0; color: var(--color-muted); }
.block, .section { margin-bottom: 2rem; }
.section-title { font-size: 1.35rem; margin: 0 0 1rem; }
.block-hero h2 { font-size: 2.5rem; margin: 0 0 0.5rem; }
.block-hero p, .qa-a, .list-item p { color: var(--color-muted); }
.block-unknown {
  padding: 1rem;
  background: #fff;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}
.qa-item, .list-item { margin-bottom: 1.25rem; }
.qa-q, .list-item h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }
.qa-a, .list-item p { margin: 0; line-height: 1.6; white-space: pre-wrap; }
.steps { margin: 0; padding-left: 1.25rem; }
</style>
