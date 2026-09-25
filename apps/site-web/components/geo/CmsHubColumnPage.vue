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
    :wide="!!content.cards?.length"
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
        class="tile"
      >
        <h3>{{ card.title }}</h3>
        <p>{{ card.description }}</p>
        <em>查看 →</em>
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
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  margin-top: 0.5rem;
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 168px;
  padding: 22px 20px;
  border-radius: 16px;
  background: #f7f7f8;
  border: 1px solid transparent;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.tile:hover {
  background: #fff;
  border-color: #f0c9b0;
  box-shadow: inset 0 -2px 0 #c2410c;
}
.tile h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.35;
}
.tile p {
  margin: 0;
  flex: 1;
  color: #6e6a76;
  font-size: 14px;
  line-height: 1.65;
}
.tile em {
  font-style: normal;
  color: #c2410c;
  font-size: 13px;
  font-weight: 650;
}
.hub-next {
  margin-top: 2rem;
  color: #6e6a76;
  font-size: 14px;
}
.hub-next a {
  color: #c2410c;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 650;
}
</style>
