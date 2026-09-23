<script setup lang="ts">
import { GEO_FAQ_ITEMS } from '~/utils/geo-seo'

const items = GEO_FAQ_ITEMS
const openIndex = ref(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? -1 : i
}
</script>

<template>
  <section class="section" id="faq" itemscope itemtype="https://schema.org/FAQPage">
    <div class="container faq-grid">
      <div class="section-head">
        <div class="eyebrow">FAQ</div>
        <h2>关于 GEO 优化与 AI 搜索可见性，先回答这些常见问题</h2>
        <p>
          GEO（生成式引擎优化）关注品牌在 AI 答案中的提及、排序与引用。没找到想要的答案？
          <a href="mailto:hello@hanyuai.com" style="text-decoration:underline;text-underline-offset:4px;color:hsl(var(--foreground))">写信给我们</a>。
        </p>
      </div>
      <div class="accordion">
        <div
          v-for="(item, i) in items"
          :key="item.q"
          class="accordion-item"
          itemscope
          itemprop="mainEntity"
          itemtype="https://schema.org/Question"
        >
          <button
            class="accordion-trigger"
            type="button"
            :aria-expanded="openIndex === i"
            @click="toggle(i)"
          >
            <span itemprop="name">{{ item.q }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <div
            class="accordion-content"
            :data-state="openIndex === i ? 'open' : 'closed'"
            itemscope
            itemprop="acceptedAnswer"
            itemtype="https://schema.org/Answer"
          >
            <div itemprop="text">{{ item.a }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
