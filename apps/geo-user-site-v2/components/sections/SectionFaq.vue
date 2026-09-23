<script setup lang="ts">
const items = [
  {
    q: 'GEO 监测具体看哪些指标？',
    a: '核心指标包括品牌提及率、平均推荐位、品牌描述倾向、问题覆盖率、竞品差距和有效引用源。建议固定问题集与采样周期，用原始回答和引用证据做周期性对比。',
  },
  {
    q: '一次诊断需要改动我的网站吗？',
    a: '不需要。公开诊断只做只读抓取与问题采样，不会修改代码、发布内容或影响线上流量。如果需要接入其他数据源，会先经过你的授权。',
  },
  {
    q: 'AI 结果每天都不一样，如何判断 GEO 优化有效？',
    a: '不要用单次截图下结论。固定问题集、引擎、地域和采样频率，保留原始回答与引用证据，再用周期性基线比较提及率、推荐位、品牌描述和有效引用源的变化。',
  },
  {
    q: '可以支持多个品牌和多个站点吗？',
    a: '可以。工作台按项目管理品牌、域名、问题集和竞品，支持多个站点的独立报告，并可用统一的指标口径做横向比较。',
  },
]

const openIndex = ref(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? -1 : i
}
</script>

<template>
  <section class="section" id="faq">
    <div class="container faq-grid">
      <div class="section-head">
        <div class="eyebrow">FAQ</div>
        <h2>关于 GEO 工具，先回答几个常见问题</h2>
        <p>
          没找到想要的答案？
          <a href="mailto:hello@hanyuai.com" style="text-decoration:underline;text-underline-offset:4px;color:hsl(var(--foreground))">写信给我们</a>。
        </p>
      </div>
      <div class="accordion">
        <div v-for="(item, i) in items" :key="item.q" class="accordion-item">
          <button
            class="accordion-trigger"
            type="button"
            :aria-expanded="openIndex === i"
            @click="toggle(i)"
          >
            {{ item.q }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <div class="accordion-content" :data-state="openIndex === i ? 'open' : 'closed'">
            <div>{{ item.a }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
