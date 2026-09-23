<script setup lang="ts">
import { PREVIEW_TYPES } from '~/utils/content/page-type-samples'

definePageMeta({ layout: 'geo' })

useHead({
  title: '页面类型完整样例预览（确认结构用）',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})
</script>

<template>
  <main class="wrap">
    <div class="container">
      <p class="badge">DEV · noindex</p>
      <h1>12 类页面完整样子预览</h1>
      <p class="lead">
        按搜索引擎适收录标准优化后的样例：信息页答案块+一级出处、降产品 CTA；报告走方法权威；Hub/工具壳按意图控短。确认后冻结 schema。
      </p>
      <div class="grid">
        <NuxtLink
          v-for="t in PREVIEW_TYPES"
          :key="t.id"
          :to="`/dev/page-preview/${t.id}`"
          class="card card-hover"
        >
          <div class="card-header">
            <div class="card-title">{{ t.label }}</div>
            <div class="card-description">
              {{ t.seoJob }} · 例 {{ t.pathExample }}
            </div>
            <p class="richness">约 {{ t.approxChars }} 字 · {{ t.readingMinutes }} 分钟</p>
          </div>
          <div class="card-footer"><span class="btn btn-link btn-sm">查看完整样例 →</span></div>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.wrap { padding: 2.5rem 0 4rem; }
.badge {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.75rem;
}
h1 { font-size: clamp(1.6rem, 3vw, 2.1rem); letter-spacing: -0.03em; margin: 0 0 0.75rem; }
.lead { color: hsl(var(--muted-foreground)); line-height: 1.7; max-width: 40rem; margin-bottom: 1.5rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }
.richness {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
}
</style>
