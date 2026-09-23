<script setup lang="ts">
import { flagshipHome, getFlagship } from '~/utils/content/geo-flagship'
import { getFlagshipKeyword } from '~/utils/content/geo-flagship-keywords'
import type { FlagshipPage } from '~/utils/content/geo-flagship'

const props = withDefaults(defineProps<{ topic?: string; source?: FlagshipPage | null }>(), {
  topic: 'home',
  source: null,
})

const openStep = ref(0)
const openFaq = ref(0)

useHead({ bodyAttrs: { class: 'geo-flagship' } })

const page = computed(() => props.source || getFlagship(props.topic) || getFlagshipKeyword(props.topic) || flagshipHome)

watch(() => [props.topic, props.source], () => {
  openStep.value = 0
  openFaq.value = 0
})

const stats = computed(() => page.value.stats)

const steps = computed(() => page.value.steps)
const effects = computed(() => page.value.effects)
const monitors = computed(() => page.value.monitors)
const agentSteps = computed(() => page.value.agentSteps)
const citeDims = computed(() => page.value.citeDims)
const channels = computed(() => page.value.channels)
const reportBits = computed(() => page.value.reportBits)
const faqs = computed(() => page.value.faqs)
</script>

<template>
  <div class="gh">
    <section class="stage">
      <div class="mesh" aria-hidden="true">
        <span class="plate plate-a" />
        <span class="plate plate-b" />
        <span class="plate plate-c" />
      </div>
      <div class="wrap">
        <h1><GeoRich :parts="page.heroTitle" /></h1>
        <p class="lead"><GeoRich :parts="page.heroLead" /></p>
        <div id="start">
          <GeoStartCard
            :console-path="page.consolePath"
            :placeholder="page.startPlaceholder"
            :fill-template="page.startFill"
            :submit-label="page.startButton"
            :chips="page.startChips"
          />
        </div>
        <p class="trust"><GeoRich :parts="page.heroTrust" /></p>
      </div>
    </section>

    <section class="meters">
      <div class="wrap meter-row">
        <div v-for="s in stats" :key="s.label" class="meter">
          <strong>{{ s.value }}<small>{{ s.unit }}</small></strong>
          <span>{{ s.label }}</span>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <div class="sec-intro">
          <h2><GeoRich :parts="page.loopTitle" /></h2>
          <p class="deck"><GeoRich :parts="page.loopDeck" /></p>
        </div>

        <div class="tabs" role="tablist" :aria-label="page.tabsLabel">
          <button
            v-for="(step, i) in steps"
            :key="step.n"
            type="button"
            role="tab"
            class="tab"
            :class="{ on: openStep === i }"
            :aria-selected="openStep === i"
            @click="openStep = i"
          >
            <span class="tab-top">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle v-if="i === 0" cx="11" cy="11" r="6" />
                <path v-if="i === 0" d="M16 16l4 4" />
                <path v-else-if="i === 1" d="M5 16l4-5 3 3 7-8" />
                <path v-else-if="i === 2" d="M6 5h12v14H6zM9 9h6M9 13h4" />
                <path v-else-if="i === 3" d="M5 12h11M12 7l5 5-5 5" />
                <path v-else d="M6 16V8h4l2 3 2-3h4v8" />
              </svg>
              <em>{{ step.n }}</em>
            </span>
            <b>{{ step.title }}</b>
            <span>{{ step.sub }}</span>
          </button>
        </div>

        <div class="window" role="tabpanel">
          <div class="win-bar">
            <span class="dots" aria-hidden="true"><i /><i /><i /></span>
            <span>{{ page.windowBrand }} · {{ steps[openStep].title }}</span>
            <span class="pill">{{ page.windowPill }}</span>
          </div>
          <div class="win-body">
            <p class="win-note">{{ steps[openStep].body }}</p>

            <div v-if="openStep === 0" class="sheet">
              <div class="row head">
                <span v-for="head in page.tableHead" :key="head">{{ head }}</span>
              </div>
              <div v-for="row in page.tableRows" :key="row.q" class="row">
                <span>{{ row.q }}</span>
                <b v-for="(cell, i) in row.cells" :key="i" :class="{ miss: cell.miss }">{{ cell.t }}</b>
              </div>
            </div>

            <ol v-else-if="openStep === 1" class="sheet list">
              <li v-for="item in page.advice" :key="item.b"><b>{{ item.b }}</b><span>{{ item.s }}</span></li>
            </ol>

            <article v-else-if="openStep === 2" class="sheet draft">
              <h3>{{ page.draft.h }}</h3>
              <p>{{ page.draft.p }}</p>
              <ul>
                <li v-for="item in page.draft.items" :key="item">{{ item }}</li>
              </ul>
            </article>

            <ul v-else-if="openStep === 3" class="sheet cite">
              <li v-for="item in page.publish" :key="item.b"><b>{{ item.b }}</b><span>{{ item.s }}</span></li>
            </ul>

            <ul v-else class="sheet cite">
              <li v-for="item in page.attrib" :key="item.b"><b>{{ item.b }}</b><span>{{ item.s }}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="block soft">
      <div class="wrap">
        <div class="sec-intro">
          <h2><GeoRich :parts="page.effectsTitle" /></h2>
          <p class="deck">{{ page.effectsDeck }}</p>
        </div>
        <div class="effects">
          <article v-for="item in effects" :key="item.title">
            <h3>{{ item.title }}</h3>
            <p class="path">{{ item.path }}</p>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="wrap watch">
        <div>
          <h2><GeoRich :parts="page.watchTitle" /></h2>
          <p class="deck"><GeoRich :parts="page.watchDeck" /></p>
          <ul class="checks">
            <li v-for="m in monitors" :key="m.title">
              <NuxtLink :to="m.to"><b>{{ m.title }}</b></NuxtLink>
              <span>{{ m.text }}</span>
            </li>
          </ul>
        </div>
        <aside class="panel">
          <p class="panel-k">{{ page.panelK }}</p>
          <ul>
            <li v-for="item in page.panelItems" :key="item">{{ item }}</li>
          </ul>
          <p>{{ page.panelFoot }}</p>
        </aside>
      </div>
    </section>

    <section class="block soft">
      <div class="wrap agent">
        <div>
          <h2><GeoRich :parts="page.writeTitle" /></h2>
          <p class="deck"><GeoRich :parts="page.writeDeck" /></p>
          <ol class="agent-steps">
            <li v-for="step in agentSteps" :key="step.title">
              <b>{{ step.title }}</b>
              <span>{{ step.text }}</span>
            </li>
          </ol>
          <div class="invite-row left">
            <NuxtLink v-for="link in page.writeLinks" :key="link.to" :to="link.to" class="more">{{ link.label }}</NuxtLink>
          </div>
        </div>
        <aside class="brief manuscript">
          <div class="ms-bar">
            <span>{{ page.manuscript.bar[0] }}</span>
            <span>{{ page.manuscript.bar[1] }}</span>
          </div>
          <h3>{{ page.manuscript.h }}</h3>
          <p>{{ page.manuscript.p }}</p>
          <div class="fact">
            <b>{{ page.manuscript.factLabel }}</b>
            <span>{{ page.manuscript.fact }}</span>
          </div>
          <ul>
            <li v-for="item in page.manuscript.items" :key="item">{{ item }}</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <div class="sec-intro">
          <h2><GeoRich :parts="page.citeTitle" /></h2>
          <p class="deck"><GeoRich :parts="page.citeDeck" /></p>
        </div>
        <div class="dims">
          <article v-for="d in citeDims" :key="d.title">
            <h3>{{ d.title }}</h3>
            <p>{{ d.text }}</p>
          </article>
        </div>
        <aside class="sample">
          <p>{{ page.sampleK }}</p>
          <h3><GeoRich :parts="page.sampleTitle" /></h3>
          <span>{{ page.sampleNote }}</span>
        </aside>
        <NuxtLink :to="page.citeMore.to" class="more">{{ page.citeMore.label }}</NuxtLink>
      </div>
    </section>

    <section class="block soft">
      <div class="wrap">
        <div class="sec-intro">
          <h2><GeoRich :parts="page.channelTitle" /></h2>
          <p class="deck"><GeoRich :parts="page.channelDeck" /></p>
        </div>
        <ul class="channels">
          <li v-for="item in channels" :key="item.name">
            <b>{{ item.name }}</b>
            <span>{{ item.note }}</span>
          </li>
        </ul>
        <p class="fine">{{ page.channelFine }}</p>
        <NuxtLink :to="page.channelMore.to" class="more">{{ page.channelMore.label }}</NuxtLink>
      </div>
    </section>

    <section class="block">
      <div class="wrap split">
        <div>
          <h2><GeoRich :parts="page.diagTitle" /></h2>
          <p class="deck">{{ page.diagDeck }}</p>
          <dl class="bits">
            <div v-for="bit in reportBits" :key="bit.k">
              <dt>{{ bit.k }}</dt>
              <dd>{{ bit.v }}</dd>
            </div>
          </dl>
          <div class="invite-row left">
            <NuxtLink
              v-for="link in page.diagLinks"
              :key="link.to"
              :to="link.to"
              :class="link.kind === 'go' ? 'go' : 'ghost'"
            >{{ link.label }}</NuxtLink>
          </div>
        </div>
        <div class="agency">
          <h3>{{ page.agencyTitle }}</h3>
          <p>{{ page.agencyText }}</p>
          <NuxtLink :to="page.agencyMore.to" class="more">{{ page.agencyMore.label }}</NuxtLink>
        </div>
      </div>
    </section>

    <section class="invite">
      <div class="wrap">
        <h2><GeoRich :parts="page.inviteTitle" /></h2>
        <p>{{ page.inviteText }}</p>
        <div class="invite-row">
          <NuxtLink
            v-for="link in page.inviteLinks"
            :key="link.label"
            :to="link.to"
            :class="link.kind === 'go' ? 'go' : 'ghost'"
          >{{ link.label }}</NuxtLink>
        </div>
      </div>
    </section>

    <section class="block soft" id="faq">
      <div class="wrap faq">
        <div>
          <h2>{{ page.faqTitle }}</h2>
          <p class="deck">{{ page.faqDeck }}</p>
        </div>
        <div>
          <button
            v-for="(item, i) in faqs"
            :key="item.q"
            type="button"
            class="faq-item"
            :aria-expanded="openFaq === i"
            @click="openFaq = openFaq === i ? -1 : i"
          >
            <span class="faq-q">{{ item.q }}</span>
            <i aria-hidden="true">{{ openFaq === i ? '–' : '+' }}</i>
            <p v-show="openFaq === i">{{ item.a }}</p>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gh {
  --ink: #16161a;
  --muted: #6e6a76;
  --line: #ececef;
  --accent: #c2410c;
  color: var(--ink);
  background: #fff;
  font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif;
}
.gh * { box-sizing: border-box; }
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
.sec-intro { max-width: 640px; margin-bottom: 28px; }
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
.stage :deep(.start) {
  max-width: 760px;
  margin: 28px auto 0;
}
.stage h1 {
  margin: 0;
  font-size: 56px;
  line-height: 1.18;
  letter-spacing: -0.04em;
  font-weight: 680;
}
.lead {
  max-width: 640px;
  margin: 16px auto 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.75;
}
.lead span,
.key,
:deep(.key) { color: var(--accent); font-style: normal; }
.lead .key,
.lead :deep(.key) { font-weight: 650; }
.trust {
  margin: 18px 0 0;
  color: #9b97a3;
  font-size: 13px;
}

.meters { padding: 36px 0 8px; }
.meter-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.meter { text-align: center; padding: 12px 8px 28px; }
.meter strong {
  display: block;
  font-size: 44px;
  line-height: 1;
  letter-spacing: -0.045em;
  font-weight: 650;
}
.meter small {
  margin-left: 2px;
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
}
.meter span {
  display: block;
  margin-top: 10px;
  color: var(--muted);
  font-size: 14px;
}

.block { padding: 88px 0; }
.block.soft {
  background: #fafafa;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}
.tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-height: 148px;
  padding: 16px 14px 14px;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 16px;
  background: #f7f7f8;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}
.tab.on b { color: var(--accent); }
.tab.on {
  background: #fff;
  border-color: #f0c9b0;
  box-shadow: inset 0 -2px 0 var(--accent);
}
.tab-top {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}
.tab svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.tab em {
  font-style: normal;
  color: #b7b3be;
  font-size: 12px;
  font-weight: 650;
}
.tab b { font-size: 15px; line-height: 1.3; }
.tab > span:last-child {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}

.window {
  margin-top: 16px;
  border-radius: 20px;
  background:
    radial-gradient(900px 220px at 20% 0%, rgba(194, 65, 12, 0.08), transparent 60%),
    #fff4ec;
  padding: 18px;
}
.win-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 28px;
  margin-bottom: 12px;
  color: var(--muted);
  font-size: 13px;
}
.dots { display: inline-flex; gap: 6px; }
.dots i {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: #d9d6e2;
}
.dots i:first-child { background: #ffb4a8; }
.dots i:nth-child(2) { background: #ffe08a; }
.dots i:nth-child(3) { background: #b7ebc6; }
.pill {
  margin-left: auto;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  line-height: 24px;
  font-size: 12px;
}
.win-body {
  background: #fff;
  border-radius: 14px;
  padding: 20px 22px 8px;
  box-shadow: 0 16px 40px rgba(80, 36, 12, 0.06);
}
.win-note {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}
.sheet { padding-bottom: 14px; }
.row {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 44px;
  border-top: 1px solid var(--line);
  font-size: 14px;
}
.row.head {
  border-top: 0;
  min-height: 32px;
  color: #9b97a3;
  font-size: 12px;
}
.row b:not(.miss) { color: var(--accent); font-weight: 650; }
.row .miss { color: #b45309; font-weight: 650; }
.list {
  margin: 0;
  padding: 0 0 8px 1.1rem;
}
.list li { margin: 0 0 14px; }
.list b, .cite b { display: block; font-size: 15px; color: var(--accent); }
.list span, .cite span, .draft p, .draft li, .compare span {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.65;
}
.draft h3 { margin: 0 0 8px; font-size: 18px; letter-spacing: -0.02em; }
.draft p { margin: 0 0 10px; }
.draft ul { margin: 0 0 8px; padding-left: 1.1rem; }
.compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-bottom: 16px;
}
.compare > div {
  padding: 16px;
  border-radius: 12px;
  background: #f7f7f8;
}
.compare em {
  display: block;
  margin-bottom: 8px;
  font-style: normal;
  color: #9b97a3;
  font-size: 12px;
}
.compare strong { display: block; margin-bottom: 6px; font-size: 20px; letter-spacing: -0.03em; color: var(--accent); }
.compare strong.miss { color: #b45309; }
.cite { list-style: none; margin: 0; padding: 0 0 8px; }
.cite li {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--line);
}

.effects {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}
.effects h3 { margin: 0 0 8px; font-size: 18px; letter-spacing: -0.02em; }
.effects p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.7; }
.effects .path { margin: 0 0 8px; color: var(--accent); font-weight: 650; }

.agent, .split {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  gap: 40px;
  align-items: start;
}
.agent-steps { list-style: none; margin: 22px 0 0; padding: 0; }
.agent-steps li { padding: 14px 0; border-top: 1px solid var(--line); }
.agent-steps b { display: block; margin-bottom: 4px; color: var(--accent); }
.agent-steps span { color: var(--muted); font-size: 14px; line-height: 1.65; }
.brief {
  background: #fff;
  border-radius: 16px;
  padding: 22px;
  box-shadow: inset 0 0 0 1px var(--line);
}
.brief .panel-k { color: var(--muted); }
.brief h3 { margin: 0 0 12px; font-size: 18px; letter-spacing: -0.02em; line-height: 1.45; }
.brief ul { margin: 0; padding-left: 1.1rem; }
.brief li { margin: 8px 0; font-size: 14px; line-height: 1.55; }
.brief > p { margin: 14px 0 0; color: #9b97a3; font-size: 13px; }

.dims {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}
.dims h3 { margin: 0 0 8px; font-size: 16px; color: var(--accent); }
.dims p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.65; }
.sample { margin-top: 28px; padding: 20px 22px; border-radius: 16px; background: #fff4ec; }
.sample p { margin: 0; color: var(--accent); font-size: 13px; font-weight: 650; }
.sample h3 { margin: 8px 0; font-size: 18px; letter-spacing: -0.02em; line-height: 1.45; }
.sample span { color: var(--muted); font-size: 14px; line-height: 1.65; }
.brief.manuscript { padding: 0 0 16px; overflow: hidden; }
.ms-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  background: #fff4ec;
  color: var(--muted);
  font-size: 12px;
}
.manuscript h3 { margin: 16px 18px 8px; }
.manuscript > p { margin: 0 18px; color: var(--ink); font-size: 14px; line-height: 1.7; }
.fact {
  margin: 14px 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fff4ec;
}
.fact b { display: block; margin-bottom: 4px; color: var(--accent); font-size: 13px; }
.fact span { color: var(--muted); font-size: 14px; line-height: 1.6; }
.manuscript ul { margin: 0 18px; }
.channels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
}
.channels li {
  height: auto;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: inset 0 0 0 1px #f0c9b0;
  line-height: 1.45;
}
.channels b { display: block; font-size: 15px; }
.channels span { display: block; margin-top: 4px; color: var(--muted); font-size: 13px; }
.fine { margin: 14px 0 0; color: #9b97a3; font-size: 13px; }
.bits { margin: 18px 0 0; }
.bits div {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--line);
}
.bits dt { font-weight: 650; color: var(--accent); }
.bits dd { margin: 0; color: var(--muted); line-height: 1.5; }
.agency { padding: 24px; border-radius: 16px; background: #16161a; color: #f4f4f5; }
.agency h3 { margin: 0 0 10px; font-size: 22px; letter-spacing: -0.02em; }
.agency p { margin: 0; color: #c4c0cc; line-height: 1.7; }
.agency .more { color: #fff; }
.invite-row.left { justify-content: flex-start; }
.post-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) 280px;
  gap: 40px;
  align-items: start;
}
.post-layout .posts { grid-template-columns: 1fr; }
.post-layout .posts a,
.post-layout .posts a:nth-child(even) { padding-left: 0; padding-right: 0; }
.more-list p { margin: 0 0 8px; color: var(--muted); font-size: 13px; }
.more-list > a {
  display: block;
  padding: 10px 0;
  border-top: 1px solid var(--line);
  color: inherit;
  text-decoration: none;
  font-size: 14px;
  line-height: 1.45;
}
.more-list > a:hover { text-decoration: underline; text-underline-offset: 3px; }
.more-list .more { margin-right: 16px; }

.watch {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 48px;
  align-items: start;
}
.checks {
  list-style: none;
  margin: 22px 0 0;
  padding: 0;
}
.checks li {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid var(--line);
}
.checks b { font-size: 14px; }
.checks span { color: var(--muted); font-size: 14px; line-height: 1.6; }
.more {
  display: inline-block;
  margin-top: 18px;
  color: var(--ink);
  font-weight: 650;
  font-size: 14px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.panel {
  padding: 24px;
  border-radius: 16px;
  background: #fff4ec;
  color: var(--ink);
  box-shadow: inset 0 0 0 1px #f0c9b0;
}
.panel-k { margin: 0 0 12px; color: #c4c0cc; font-size: 13px; }
.panel .panel-k { color: var(--accent); font-weight: 650; }
.panel ul { margin: 0; padding-left: 1.1rem; }
.panel li { margin: 8px 0; line-height: 1.5; }
.panel > p { margin: 16px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }

.rails {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.rail {
  display: block;
  padding: 8px 28px 8px 0;
  color: inherit;
  text-decoration: none;
}
.rail + .rail {
  padding-left: 28px;
  border-left: 1px solid var(--line);
}
.rail span { color: var(--accent); font-size: 13px; font-weight: 650; }
.rail h3 { margin: 8px 0; font-size: 20px; letter-spacing: -0.02em; }
.rail p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.7; }
.rail em { display: block; margin-top: 16px; font-style: normal; font-weight: 650; }
.checks a { color: var(--accent); text-decoration: none; }
.checks a:hover { text-decoration: underline; text-underline-offset: 3px; }
.rail:hover h3 { text-decoration: underline; text-underline-offset: 3px; }

.invite { padding: 88px 0; text-align: center; }
.invite p {
  max-width: 460px;
  margin: 12px auto 0;
  color: var(--muted);
  line-height: 1.7;
}
.invite-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
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

.sec-h {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 8px;
}
.sec-h .more { margin: 0; }
.posts {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.posts a {
  display: block;
  padding: 20px 24px 20px 0;
  border-top: 1px solid var(--line);
  color: inherit;
  text-decoration: none;
}
.posts a:nth-child(even) { padding-left: 24px; }
.posts span { color: var(--accent); font-size: 13px; font-weight: 650; }
.posts h3 { margin: 6px 0; font-size: 17px; letter-spacing: -0.02em; }
.posts p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.65; }
.posts a:hover h3 { text-decoration: underline; text-underline-offset: 3px; }

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

@media (max-width: 900px) {
  .stage { padding-top: 48px; }
  .stage h1 { font-size: 34px; }
  h2 { font-size: 28px; }
  .plate-a, .plate-c { display: none; }
  .meter-row, .tabs, .effects, .watch, .rails, .posts, .faq, .compare,
  .agent, .split, .dims, .post-layout, .channels {
    grid-template-columns: 1fr;
  }
  .tabs { gap: 8px; }
  .tab { min-height: 0; }
  .rail + .rail { padding-left: 0; border-left: 0; border-top: 1px solid var(--line); padding-top: 20px; margin-top: 20px; }
  .posts a, .posts a:nth-child(even) { padding-left: 0; padding-right: 0; }
  .row { grid-template-columns: 1.2fr repeat(3, 0.7fr); font-size: 12px; }
  .invite-row, .sec-h { flex-direction: column; align-items: center; }
  .invite-row.left, .sec-h { align-items: flex-start; }
  .checks li, .cite li { grid-template-columns: 1fr; gap: 4px; }
  .win-bar { flex-wrap: wrap; }
  .pill { margin-left: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .plate { transform: none; }
}
</style>
