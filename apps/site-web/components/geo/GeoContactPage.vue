<script setup lang="ts">
import type { HubContactChannel, HubContactContent } from '@site-manage/shared'
import { GEO_CONTACT_DEFAULT } from '~/utils/content/geo-contact'
import { GEO_SITE } from '~/utils/geo-seo'

const props = defineProps<{
  content?: HubContactContent | null
}>()

useHead({ bodyAttrs: { class: 'geo-flagship' } })

const { toConsole } = useGeoConsoleLink()
const sitePage = useSitePage()

const page = computed(() => {
  const cms = props.content
  return {
    ...GEO_CONTACT_DEFAULT,
    ...cms,
    title: cms?.title || GEO_CONTACT_DEFAULT.title,
    description: cms?.description || GEO_CONTACT_DEFAULT.description,
    channels: cms?.channels?.length ? cms.channels : GEO_CONTACT_DEFAULT.channels,
    faq: cms?.faq?.length ? cms.faq : GEO_CONTACT_DEFAULT.faq,
  }
})

const companyName = computed(
  () => sitePage.value?.site?.companyZh?.trim() || GEO_SITE.legalName,
)
const openFaq = ref(0)

function channelHref(ch: HubContactChannel) {
  if (!ch.href) return undefined
  if (ch.href.startsWith('console:')) {
    return toConsole(ch.href.replace(/^console:/, '') || '/login', 'geo_contact')
  }
  return ch.href
}

function onChannelClick(ch: HubContactChannel, e: Event) {
  if (!ch.href?.startsWith('console:')) return
  e.preventDefault()
  window.location.href = toConsole(ch.href.replace(/^console:/, '') || '/login', 'geo_contact')
}
</script>

<template>
  <div class="cp">
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
        <p v-if="companyName" class="trust">{{ companyName }}</p>
      </div>
    </section>

    <section class="block">
      <div class="wrap">
        <div class="channels" aria-label="联系渠道">
          <article v-for="ch in page.channels" :key="ch.id" class="channel">
            <p class="label">{{ ch.label }}</p>
            <a
              v-if="channelHref(ch)"
              class="value"
              :href="channelHref(ch)"
              :target="ch.kind === 'email' ? undefined : ch.href?.startsWith('http') ? '_blank' : undefined"
              :rel="ch.href?.startsWith('http') ? 'noopener noreferrer' : undefined"
              @click="onChannelClick(ch, $event)"
            >{{ ch.value }}</a>
            <p v-else class="value plain">{{ ch.value }}</p>
            <p v-if="ch.note" class="note-line">{{ ch.note }}</p>
          </article>
        </div>
      </div>
    </section>

    <section v-if="page.faq?.length" class="block soft" id="faq">
      <div class="wrap faq">
        <div>
          <h2>常见问题</h2>
          <p class="deck">演示、邮件与合作</p>
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
          <NuxtLink class="ghost" to="/diagnose">免费诊断</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cp {
  --ink: #16161a;
  --muted: #6e6a76;
  --line: #ececef;
  --accent: #c2410c;
  color: var(--ink);
  background: #fff;
  font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif;
}
.cp * { box-sizing: border-box; }
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
  top: 220px;
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

.channels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.channel {
  padding: 22px 20px;
  border-radius: 16px;
  background: #f7f7f8;
  border: 1px solid transparent;
}
.channel:hover {
  background: #fff;
  border-color: #f0c9b0;
  box-shadow: inset 0 -2px 0 var(--accent);
}
.label {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 650;
}
.value {
  display: block;
  margin: 0;
  color: var(--ink);
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.35;
  text-decoration: none;
}
.value:hover { text-decoration: underline; text-underline-offset: 3px; }
.value.plain { cursor: default; }
.note-line {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.65;
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

@media (max-width: 900px) {
  .stage { padding-top: 48px; }
  .stage h1 { font-size: 34px; }
  h2 { font-size: 28px; }
  .plate-a, .plate-c { display: none; }
  .channels, .faq { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .plate { transform: none; }
}
</style>
