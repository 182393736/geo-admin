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
  <section v-if="items.length" class="hub-faq" id="faq">
    <h2>常见问题</h2>
    <p class="deck">方法口径与落地方式</p>
    <div class="faq-list">
      <button
        v-for="(item, i) in items"
        :key="item.q"
        type="button"
        class="faq-item"
        :aria-expanded="openIndex === i"
        @click="toggle(i)"
      >
        <span class="faq-q">{{ item.q }}</span>
        <i aria-hidden="true">{{ openIndex === i ? '–' : '+' }}</i>
        <p v-show="openIndex === i">{{ item.a }}</p>
      </button>
    </div>
  </section>
</template>

<style scoped>
.hub-faq {
  margin-top: 3rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--line, #ececef);
}
.hub-faq h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.25;
  letter-spacing: -0.03em;
  font-weight: 650;
  color: var(--ink, #16161a);
}
.deck {
  margin: 10px 0 0;
  color: var(--muted, #6e6a76);
  font-size: 15px;
  line-height: 1.6;
}
.faq-list { margin-top: 8px; }
.faq-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px;
  column-gap: 16px;
  width: 100%;
  text-align: left;
  border: 0;
  border-bottom: 1px solid var(--line, #ececef);
  background: transparent;
  padding: 18px 0;
  color: var(--ink, #16161a);
  font: inherit;
  cursor: pointer;
}
.faq-q { font-size: 16px; font-weight: 650; line-height: 1.5; }
.faq-item i { font-style: normal; text-align: right; color: var(--muted, #6e6a76); }
.faq-item p {
  grid-column: 1 / -1;
  margin: 8px 0 0;
  font-weight: 400;
  color: var(--muted, #6e6a76);
  line-height: 1.7;
  font-size: 14px;
}
</style>
