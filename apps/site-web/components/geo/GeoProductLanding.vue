<script setup lang="ts">
import type { HubProductPage } from '~/utils/geo-hub'
import { GEO_PRODUCT_PAGES } from '~/utils/geo-hub'

const props = defineProps<{
  page: HubProductPage
  showCatalog?: boolean
}>()

useHead({ bodyAttrs: { class: 'geo-home' } })

const headlines: Record<string, string> = {
  '': '选一个 GEO工具，马上看你的品牌',
  visibility: '你的品牌，在 AI 答案里出现了吗？',
  competitor: '同一类问题上，别人凭什么更常被提到？',
  ranking: '品类推荐名单里，你排第几？',
  status: '现在别人怎么认识你，缺的是哪一块？',
  industry: '这个品类里，别人常问什么、谁被点名？',
  reputation: '别人怎么介绍你，说对了还是说偏了？',
  opinion: '关于你的说法变了没有，哪一句在扩散？',
  'geo-search': '用户问生成式引擎时，品牌有没有进答案？',
  'geo-promo': '把品牌推进生成式答案里的那一轮动作',
  'publish-platform': '对手发在哪，你也能在同类媒体补上',
  citation: 'AI 引用的是你，还是别人的页面？',
  sentiment: 'AI 是在介绍你，还是在用过时信息？',
  optimize: '让 AI 回答里，也推荐你的品牌',
  agent: '把监测缺口，写成能被引用的稿',
  diagnosis: '客户搜你、问 AI 时，品牌还站得住吗？',
  brand: '名称没对齐，后面的监测都会偏',
}

const headline = computed(() => headlines[props.page.slug] || props.page.title.split('｜')[0])
const others = computed(() =>
  props.showCatalog ? GEO_PRODUCT_PAGES.filter((p) => p.slug) : [],
)
const cols = computed(() => {
  const n = props.page.metrics.length
  if (n === 6) return 3
  return Math.max(n, 1)
})
const openFaq = ref(0)
</script>

<template>
  <div class="pl">
    <section class="stage">
      <div class="mesh" aria-hidden="true" />
      <div class="wrap">
        <p class="eyebrow">GEO工具</p>
        <h1>{{ headline }}</h1>
        <p class="lead">{{ page.definition }} 输入品牌先看基线，或点下面的工具进入对应页面。</p>
        <GeoStartCard
          :console-path="page.consolePath"
          :chips="['小鹏汽车', '完美日记', '格力空调', 'B2B 软件']"
          submit-label="免费开始"
        />
      </div>
    </section>

    <section class="meters">
      <div class="wrap">
        <p class="meters-note">{{ showCatalog ? 'GEO工具帮你看清这些事' : '这一页对应的工作台能力 · 数字以诊断和监测为准' }}</p>
        <div class="meter-row" :style="{ '--cols': String(cols) }">
          <div v-for="(m, i) in page.metrics" :key="m" class="meter">
            <strong>{{ String(i + 1).padStart(2, '0') }}</strong>
            <span>{{ m }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <p class="kicker">怎么开始</p>
        <h2>进来就能做的几步</h2>
        <ol class="steps">
          <li v-for="(u, i) in page.usage" :key="u">
            <em>{{ String(i + 1).padStart(2, '0') }}</em>
            <span>{{ u }}</span>
          </li>
        </ol>
      </div>
    </section>

    <section v-if="others.length" class="block soft">
      <div class="wrap">
        <p class="kicker">GEO工具</p>
        <h2>每个工具都是单独一页</h2>
        <div class="cards">
          <NuxtLink v-for="item in others" :key="item.slug" :to="`/tools/${item.slug}`">
            <h3>{{ item.title.split('｜')[0] }}</h3>
            <p>{{ item.definition }}</p>
            <em>进入 →</em>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="page.faq.length" class="block" :class="{ soft: !others.length }" id="faq">
      <div class="wrap faq">
        <div>
          <p class="kicker">FAQ</p>
          <h2>常见问题</h2>
        </div>
        <div>
          <button
            v-for="(item, i) in page.faq"
            :key="item.q"
            type="button"
            class="faq-item"
            @click="openFaq = openFaq === i ? -1 : i"
          >
            <span>{{ item.q }}</span>
            <i>{{ openFaq === i ? '–' : '+' }}</i>
            <p v-show="openFaq === i">{{ item.a }}</p>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pl {
  --ink: #141210;
  --muted: #6a625a;
  --line: #e6e1d8;
  --paper: #f7f4ee;
  color: var(--ink);
  background: var(--paper);
  font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif;
}
.pl * { box-sizing: border-box; }
.wrap { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.kicker { margin: 0 0 8px; color: #4f46e5; font-size: 12px; font-weight: 650; letter-spacing: 0.16em; }
h2 { margin: 0; font-size: 36px; line-height: 1.25; letter-spacing: -0.03em; font-weight: 650; }
.stage { position: relative; padding: 72px 0 8px; text-align: center; overflow: hidden; }
.mesh {
  position: absolute; inset: 0 0 auto; height: 560px; pointer-events: none;
  background-image:
    linear-gradient(rgba(20, 18, 16, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(20, 18, 16, 0.04) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: linear-gradient(#000, transparent 92%);
}
.eyebrow, h1, .lead { position: relative; }
.eyebrow {
  display: inline-flex; align-items: center; height: 32px; margin: 0 0 20px; padding: 0 12px;
  border-radius: 999px; background: #fff; border: 1px solid var(--line); color: var(--muted); font-size: 12px;
}
.stage h1 { margin: 0; font-size: 48px; line-height: 1.2; letter-spacing: -0.04em; font-weight: 680; }
.lead { max-width: 720px; margin: 16px auto 28px; color: var(--muted); font-size: 16px; line-height: 1.75; }
.meters { padding: 40px 0 8px; }
.meters-note { margin: 0 0 16px; text-align: center; color: var(--muted); font-size: 13px; }
.meter-row {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}
.meter { min-height: 120px; padding: 24px 16px; text-align: center; }
.meter + .meter { border-left: 1px solid var(--line); }
.meter strong { display: block; font-size: 28px; letter-spacing: -0.04em; color: #4f46e5; }
.meter span { display: block; margin-top: 8px; color: var(--ink); font-size: 15px; line-height: 1.45; }
.block { padding: 80px 0; }
.block.soft { background: #fff; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.steps { list-style: none; margin: 24px 0 0; padding: 0; border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden; }
.steps li { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 12px; align-items: center; min-height: 64px; padding: 16px 20px; }
.steps li + li { border-top: 1px solid var(--line); }
.steps em { font-style: normal; font-weight: 700; color: #4f46e5; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 28px; }
.cards a {
  display: flex; flex-direction: column; min-height: 180px; padding: 20px;
  background: var(--paper); border: 1px solid var(--line); border-radius: 16px;
  text-decoration: none; color: inherit;
}
.cards h3 { margin: 0 0 8px; font-size: 18px; }
.cards p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.7; }
.cards em { margin-top: auto; padding-top: 16px; font-style: normal; font-weight: 650; }
.faq { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: 48px; align-items: start; }
.faq-item {
  display: grid; grid-template-columns: minmax(0, 1fr) 24px; column-gap: 16px;
  width: 100%; text-align: left; border: 0; border-bottom: 1px solid var(--line);
  background: transparent; padding: 18px 0; color: var(--ink); font: inherit; cursor: pointer;
}
.faq-item span { font-size: 16px; font-weight: 650; line-height: 1.5; }
.faq-item i { font-style: normal; text-align: right; color: var(--muted); }
.faq-item p { grid-column: 1 / -1; margin: 8px 0 0; font-weight: 400; color: var(--muted); line-height: 1.7; font-size: 14px; }
@media (max-width: 860px) {
  .stage h1 { font-size: 32px; }
  h2 { font-size: 28px; }
  .meter-row, .cards, .faq { grid-template-columns: 1fr !important; }
  .meter + .meter { border-left: 0; border-top: 1px solid var(--line); }
}
</style>
