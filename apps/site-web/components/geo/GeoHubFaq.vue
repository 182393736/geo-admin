<script setup lang="ts">
defineProps<{
  items: { q: string; a: string }[]
}>()
const openIndex = ref(0)
function toggle(i: number) {
  openIndex.value = openIndex.value === i ? -1 : i
}
</script>

<template>
  <section class="hub-faq" id="faq">
    <h2>常见问题</h2>
    <div class="accordion">
      <div v-for="(item, i) in items" :key="item.q" class="accordion-item">
        <button class="accordion-trigger" type="button" :aria-expanded="openIndex === i" @click="toggle(i)">
          {{ item.q }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <div class="accordion-content" :data-state="openIndex === i ? 'open' : 'closed'">
          <div>{{ item.a }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hub-faq {
  margin-top: 2.5rem;
}
.hub-faq h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
</style>
