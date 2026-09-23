<script setup lang="ts">
import type { HubPricingContent, HubPricingPlan } from '@site-manage/shared'
import {
  GEO_PRICING_DEFAULT,
  GEO_PRICING_PLANS,
  PRICING_BOTH_HINT,
  PRICING_CYCLES,
  PRICING_PC_ENGINES,
  displayMonthlyPrice,
  type PricingCycle,
  type PricingScope,
} from '~/utils/content/geo-pricing'

const props = defineProps<{
  content?: HubPricingContent | null
}>()

useHead({ bodyAttrs: { class: 'geo-flagship' } })

const { toConsole } = useGeoConsoleLink()

const page = computed(() => {
  const cms = props.content
  return {
    ...GEO_PRICING_DEFAULT,
    ...cms,
    title: cms?.title || GEO_PRICING_DEFAULT.title,
    description: cms?.description || GEO_PRICING_DEFAULT.description,
    plans: cms?.plans?.length ? cms.plans : GEO_PRICING_PLANS,
    faq: cms?.faq?.length ? cms.faq : GEO_PRICING_DEFAULT.faq,
  }
})

const scopeSel = reactive<Record<string, PricingScope>>({})
const cycleSel = reactive<Record<string, PricingCycle>>({})
const openFaq = ref(0)

function scopeOf(id: string): PricingScope {
  return scopeSel[id] || 'pc'
}
function cycleOf(id: string): PricingCycle {
  return cycleSel[id] || 'monthly'
}
function setScope(id: string, s: PricingScope) {
  scopeSel[id] = s
}
function setCycle(id: string, c: PricingCycle) {
  cycleSel[id] = c
}

function ctaHref(plan: HubPricingPlan) {
  if (plan.ctaKind === 'demo') return '/demo'
  if (plan.ctaKind === 'disabled') return '#'
  return toConsole('/dashboard/plan-upgrade', 'geo_pricing')
}

function onCta(plan: HubPricingPlan, e: Event) {
  if (plan.ctaKind === 'disabled') {
    e.preventDefault()
    return
  }
  if (plan.ctaKind === 'console') {
    e.preventDefault()
    window.location.href = toConsole('/dashboard/plan-upgrade', 'geo_pricing')
  }
}
</script>

<template>
  <div class="pp">
    <section class="stage">
      <div class="mesh" aria-hidden="true">
        <span class="plate plate-a" />
        <span class="plate plate-b" />
        <span class="plate plate-c" />
      </div>
      <div class="wrap">
        <h1>
          {{ page.title }}<span v-if="page.titleAccent" class="key">{{ page.titleAccent }}</span>
        </h1>
        <p class="lead">{{ page.description }}</p>
        <p v-if="page.billingNote" class="trust">{{ page.billingNote }}</p>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <div class="plans" aria-label="套餐">
          <article
            v-for="plan in page.plans"
            :key="plan.id"
            class="plan"
            :class="{ hi: plan.highlighted, custom: plan.id === 'custom' }"
          >
            <p v-if="plan.banner" class="banner">{{ plan.banner }}</p>
            <header class="head">
              <h2>{{ plan.name }}</h2>
              <p v-if="plan.subtitle" class="sub">{{ plan.subtitle }}</p>
            </header>

            <div class="price-block">
              <template v-if="plan.monthlyPrice != null">
                <span class="currency">¥</span>
                <span class="amount">{{ displayMonthlyPrice(plan) }}</span>
                <span v-if="plan.unit" class="unit">{{ plan.unit }}</span>
              </template>
              <template v-else>
                <span class="custom-price">{{ plan.priceText || '按需定价' }}</span>
              </template>
            </div>

            <div v-if="plan.hasAiScope" class="scope">
              <div class="field-label">AI 引擎监控能力</div>
              <div class="seg" role="group" :aria-label="`${plan.name} 端类型`">
                <button
                  type="button"
                  :class="{ on: scopeOf(plan.id) === 'pc' }"
                  @click="setScope(plan.id, 'pc')"
                >
                  网页端
                </button>
                <button type="button" disabled title="即将开放">APP 端</button>
                <button
                  type="button"
                  :class="{ on: scopeOf(plan.id) === 'both' }"
                  @click="setScope(plan.id, 'both')"
                >
                  双端
                </button>
              </div>
              <p class="scope-read">
                {{ scopeOf(plan.id) === 'both' ? '8 端主流 AI' : '5 大主流 AI' }}
                <span
                  class="hint"
                  :title="scopeOf(plan.id) === 'both' ? PRICING_BOTH_HINT : PRICING_PC_ENGINES"
                >ⓘ</span>
              </p>
            </div>

            <ul class="feats">
              <li
                v-for="(f, i) in plan.features"
                :key="i"
                :class="{ no: !f.included, hi: f.highlight }"
              >
                <span class="mark" aria-hidden="true">{{ f.included ? '✓' : '×' }}</span>
                {{ f.text }}
              </li>
              <li v-for="(f, i) in plan.customFeatures || []" :key="'c' + i">
                <span class="mark" aria-hidden="true">✓</span>
                {{ f }}
              </li>
            </ul>

            <div v-if="plan.monthlyPrice && plan.monthlyPrice > 0" class="cycles">
              <div class="field-label">计费周期</div>
              <div class="seg" role="group" :aria-label="`${plan.name} 计费周期`">
                <button
                  v-for="c in PRICING_CYCLES"
                  :key="c.id"
                  type="button"
                  :class="{ on: cycleOf(plan.id) === c.id }"
                  @click="setCycle(plan.id, c.id)"
                >
                  {{ c.label }}
                  <em v-if="c.discount">{{ c.discount }}</em>
                </button>
              </div>
            </div>

            <a
              class="cta"
              :class="{ ghost: plan.ctaKind === 'disabled', go: plan.ctaKind !== 'disabled' }"
              :href="ctaHref(plan)"
              @click="onCta(plan, $event)"
            >
              {{ plan.ctaLabel }}
            </a>
          </article>
        </div>
      </div>
    </section>

    <section v-if="page.faq?.length" class="block soft" id="faq">
      <div class="wrap faq">
        <div>
          <h2>常见问题</h2>
          <p class="deck">关于套餐、积分与计费</p>
        </div>
        <div>
          <button
            v-for="(item, i) in page.faq"
            :key="item.q"
            type="button"
            class="faq-item"
            @click="openFaq = openFaq === i ? -1 : i"
          >
            <span class="faq-q">{{ item.q }}</span>
            <i aria-hidden="true">{{ openFaq === i ? '–' : '+' }}</i>
            <p v-show="openFaq === i">{{ item.a }}</p>
          </button>
        </div>
      </div>
    </section>

    <section v-if="page.note" class="invite">
      <div class="wrap">
        <p>{{ page.note }}</p>
        <div class="invite-row">
          <NuxtLink class="go" to="/demo">预约演示</NuxtLink>
          <a class="ghost" :href="toConsole('/dashboard/plan-upgrade', 'geo_pricing')">去工作台开通</a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pp {
  --ink: #16161a;
  --muted: #6e6a76;
  --line: #ececef;
  --accent: #c2410c;
  color: var(--ink);
  background: #fff;
  font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif;
}
.pp * { box-sizing: border-box; }
.wrap {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}
h2 {
  margin: 0;
  font-size: 36px;
  line-height: 1.25;
  letter-spacing: -0.03em;
  font-weight: 650;
}
.deck {
  margin: 12px 0 0;
  color: var(--muted);
  line-height: 1.7;
  font-size: 16px;
}
a:focus-visible, button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.stage {
  position: relative;
  padding: 72px 0 28px;
  text-align: center;
  overflow: hidden;
}
.mesh {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(22, 22, 26, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(22, 22, 26, 0.045) 1px, transparent 1px);
  background-size: 72px 72px;
  background-position: center top;
  mask-image: linear-gradient(#000 0%, transparent 88%);
}
.plate {
  position: absolute;
  display: block;
  border-radius: 28px;
}
.plate-a {
  width: 220px;
  height: 148px;
  top: 36px;
  left: 7%;
  background: #ffd7b5;
  transform: rotate(-8deg);
  opacity: 0.7;
}
.plate-b {
  width: 168px;
  height: 112px;
  top: 88px;
  right: 9%;
  background: #ffe0c2;
  transform: rotate(10deg);
  opacity: 0.85;
}
.plate-c {
  width: 120px;
  height: 120px;
  top: 250px;
  left: 16%;
  background: #ffc9a8;
  opacity: 0.75;
}
.stage .wrap { position: relative; }
.stage h1 {
  margin: 0;
  font-size: 56px;
  line-height: 1.18;
  letter-spacing: -0.04em;
  font-weight: 680;
}
.key { color: var(--accent); }
.lead {
  max-width: 640px;
  margin: 16px auto 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.75;
}
.trust {
  margin: 18px 0 0;
  color: #9b97a3;
  font-size: 13px;
}

.block { padding: 56px 0 88px; }
.block.soft {
  background: #fafafa;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.plans {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}
.plan {
  display: flex;
  flex-direction: column;
  padding: 18px 16px 16px;
  border-radius: 16px;
  background: #f7f7f8;
  border: 1px solid transparent;
}
.plan.hi {
  background: #fff;
  border-color: #f0c9b0;
  box-shadow: inset 0 -2px 0 var(--accent);
}
.plan.custom {
  background: #fff;
  box-shadow: inset 0 0 0 1px var(--line);
}
.banner {
  margin: -6px 0 12px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 650;
}
.head h2 {
  font-size: 18px;
  letter-spacing: -0.02em;
}
.sub {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.45;
}
.price-block {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin: 14px 0 12px;
  min-height: 44px;
}
.currency { font-size: 18px; font-weight: 650; }
.amount {
  font-size: 34px;
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1;
}
.unit {
  margin-left: 2px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
}
.custom-price {
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--accent);
}

.field-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 650;
  color: #9b97a3;
}
.seg {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: #fff;
  box-shadow: inset 0 0 0 1px var(--line);
}
.plan.hi .seg,
.plan.custom .seg {
  background: #f7f7f8;
  box-shadow: none;
}
.seg button {
  flex: 1;
  position: relative;
  border: 0;
  background: transparent;
  border-radius: 10px;
  padding: 8px 4px;
  font: inherit;
  font-size: 11px;
  font-weight: 650;
  color: var(--muted);
  cursor: pointer;
}
.seg button.on {
  background: #fff;
  color: var(--ink);
  box-shadow: inset 0 0 0 1px #f0c9b0;
}
.plan.hi .seg button.on,
.plan.custom .seg button.on {
  box-shadow: 0 1px 3px rgba(22, 22, 26, 0.06);
}
.seg button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.seg button em {
  position: absolute;
  top: -7px;
  right: -2px;
  font-style: normal;
  background: var(--accent);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 999px;
  padding: 1px 5px;
}
.scope { margin-bottom: 12px; }
.scope-read {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 650;
  display: flex;
  align-items: center;
  gap: 4px;
}
.hint { color: var(--muted); cursor: help; font-weight: 500; }

.feats {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.feats li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  line-height: 1.45;
  color: #3f3b46;
}
.feats li.no { color: var(--muted); }
.feats li.hi { color: var(--accent); font-weight: 650; }
.mark { flex-shrink: 0; width: 12px; text-align: center; color: var(--accent); }
.feats li.no .mark { color: #b7b3be; }
.cycles { margin-bottom: 14px; }

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  margin-top: auto;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
}
.cta.go { background: #16161a; color: #fff; }
.cta.go:hover { background: #2a2a30; }
.cta.ghost {
  background: #fff;
  color: var(--muted);
  box-shadow: inset 0 0 0 1px var(--line);
  pointer-events: none;
}

.faq {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 48px;
  align-items: start;
}
.faq-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px;
  column-gap: 16px;
  width: 100%;
  text-align: left;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  padding: 18px 0;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}
.faq-q { font-size: 16px; font-weight: 650; line-height: 1.5; }
.faq-item i { font-style: normal; text-align: right; color: var(--muted); }
.faq-item p {
  grid-column: 1 / -1;
  margin: 8px 0 0;
  font-weight: 400;
  color: var(--muted);
  line-height: 1.7;
  font-size: 14px;
}

.invite { padding: 72px 0 88px; text-align: center; }
.invite p {
  max-width: 520px;
  margin: 0 auto;
  color: var(--muted);
  line-height: 1.7;
  font-size: 14px;
}
.invite-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
  flex-wrap: wrap;
}
.go, .ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
}
.go { background: #16161a; color: #fff; }
.go:hover { background: #2a2a30; }
.ghost {
  background: #fff;
  color: var(--ink);
  box-shadow: inset 0 0 0 1px var(--line);
}

@media (max-width: 1100px) {
  .plans { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .stage { padding-top: 48px; }
  .stage h1 { font-size: 34px; }
  h2 { font-size: 28px; }
  .plate-a, .plate-c { display: none; }
  .faq { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .plans { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .plate { transform: none; }
}
</style>
