<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description: string
  consolePath?: string
  diagnoseCta?: boolean
  /** 正文区加宽（列表页）；文章页默认阅读宽度 */
  wide?: boolean
}>()

const { toConsole } = useGeoConsoleLink()

useHead({ bodyAttrs: { class: 'geo-flagship' } })
</script>

<template>
  <div class="hp">
    <section class="stage">
      <div class="mesh" aria-hidden="true">
        <span class="plate plate-a" />
        <span class="plate plate-b" />
        <span class="plate plate-c" />
      </div>
      <div class="wrap">
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="lead">{{ description }}</p>
        <div v-if="diagnoseCta !== false || consolePath || $slots.actions" class="actions">
          <NuxtLink v-if="diagnoseCta !== false" to="/diagnose" class="go">免费 GEO 诊断</NuxtLink>
          <a
            v-if="consolePath"
            class="ghost"
            :href="toConsole(consolePath)"
          >进入工作台</a>
          <slot name="actions" />
        </div>
      </div>
    </section>

    <section class="block">
      <div class="wrap" :class="{ body: !wide, 'body-wide': wide }">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.hp {
  --ink: #16161a;
  --muted: #6e6a76;
  --line: #ececef;
  --accent: #c2410c;
  color: var(--ink);
  background: #fff;
  font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif;
}
.hp * { box-sizing: border-box; }
.wrap {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
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
.eyebrow {
  margin: 0 0 12px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.04em;
}
.stage h1 {
  margin: 0;
  font-size: 48px;
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
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
}
.go, .ghost,
:deep(.actions .go),
:deep(.actions .ghost) {
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
.go,
:deep(.actions .go) { background: #16161a; color: #fff; }
.go:hover,
:deep(.actions .go:hover) { background: #2a2a30; }
.ghost,
:deep(.actions .ghost) {
  background: #fff;
  color: var(--ink);
  box-shadow: inset 0 0 0 1px var(--line);
}
.ghost:hover,
:deep(.actions .ghost:hover) { background: #f7f7f8; }

.block { padding: 40px 0 88px; }
.body { max-width: 760px; }
.body-wide { max-width: 1120px; }

/* 子页内容默认排版（:deep 覆盖 slot） */
:deep(.hub-section) { margin-top: 2rem; }
:deep(.hub-section:first-child) { margin-top: 0; }
:deep(.hub-section h2),
:deep(article h2) {
  margin: 0 0 0.75rem;
  font-size: 22px;
  line-height: 1.35;
  letter-spacing: -0.02em;
  font-weight: 650;
}
:deep(.hub-section p),
:deep(article p) {
  margin: 0 0 0.85rem;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.8;
}
:deep(.hub-section ul),
:deep(article ul) {
  margin: 0;
  padding: 0 0 0 1.15rem;
  color: var(--muted);
}
:deep(.hub-section li),
:deep(article li) {
  margin: 0 0 0.55rem;
  line-height: 1.7;
  font-size: 15px;
}
:deep(.hub-section a),
:deep(article a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 650;
}

@media (max-width: 900px) {
  .stage { padding-top: 48px; }
  .stage h1 { font-size: 32px; }
  .plate-a, .plate-c { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .plate { transform: none; }
}
</style>
