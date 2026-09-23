<script setup lang="ts">
import type { HubColumnContent } from '@site-manage/shared'

defineProps<{ content: HubColumnContent }>()
</script>

<template>
  <GeoHubPage
    :eyebrow="content.eyebrow"
    :title="content.title"
    :description="content.description"
    :diagnose-cta="content.diagnoseCta !== false"
    :console-path="content.consolePath"
  >
    <article v-if="content.sections?.length">
      <section v-for="s in content.sections" :key="s.heading" class="hub-section">
        <h2>{{ s.heading }}</h2>
        <p v-for="(para, i) in s.paragraphs" :key="i">{{ para }}</p>
      </section>
    </article>

    <div v-if="content.cards?.length" class="card-grid">
      <NuxtLink
        v-for="card in content.cards"
        :key="card.to + card.title"
        :to="card.to"
        class="card card-hover"
      >
        <div class="card-header">
          <div class="card-title">{{ card.title }}</div>
          <div class="card-description">{{ card.description }}</div>
        </div>
        <div class="card-footer"><span class="btn btn-link btn-sm">查看 →</span></div>
      </NuxtLink>
    </div>

    <p v-if="content.relatedLinks?.length" class="hub-next">
      相关：
      <template v-for="(link, i) in content.relatedLinks" :key="link.to">
        <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
        <template v-if="i < content.relatedLinks!.length - 1"> · </template>
      </template>
    </p>

    <GeoHubFaq v-if="content.faq?.length" :items="content.faq" />
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.75rem; }
.hub-section h2 { font-size: 1.2rem; margin-bottom: 0.65rem; }
.hub-section p { line-height: 1.8; margin: 0 0 0.75rem; }
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;
}
.hub-next {
  margin-top: 2rem;
  color: hsl(var(--muted-foreground));
}
.hub-next a {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
