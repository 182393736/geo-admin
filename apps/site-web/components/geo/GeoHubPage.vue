<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description: string
  consolePath?: string
  diagnoseCta?: boolean
}>()

const { toConsole } = useGeoConsoleLink()
</script>

<template>
  <main class="hub-page">
    <div class="container hub-wrap">
      <header class="hub-hero">
        <div v-if="eyebrow" class="eyebrow">{{ eyebrow }}</div>
        <h1>{{ title }}</h1>
        <p class="hub-desc">{{ description }}</p>
        <div class="hub-actions">
          <NuxtLink v-if="diagnoseCta !== false" to="/diagnose" class="btn btn-default">免费 GEO 诊断</NuxtLink>
          <a
            v-if="consolePath"
            class="btn btn-outline"
            :href="toConsole(consolePath)"
          >进入工作台</a>
          <slot name="actions" />
        </div>
      </header>
      <slot />
    </div>
  </main>
</template>

<style scoped>
.hub-wrap {
  padding: 2.5rem 1.5rem 4rem;
  max-width: 900px;
}
.hub-hero {
  margin-bottom: 2.5rem;
}
.hub-hero h1 {
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 0.5rem 0 0.85rem;
}
.hub-desc {
  color: hsl(var(--muted-foreground));
  line-height: 1.7;
  font-size: 1.05rem;
  margin: 0 0 1.25rem;
}
.hub-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
