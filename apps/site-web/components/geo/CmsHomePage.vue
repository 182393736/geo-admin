<script setup lang="ts">
import type { HubHomeContent } from '@site-manage/shared'

const props = defineProps<{ content: HubHomeContent }>()

const brandInput = ref('')
const submitting = ref(false)
const btnText = ref('开始免费体检')

const hero = computed(() => props.content.hero)
const enabledSections = computed(() =>
  (props.content.sections || []).filter((s) => s.enabled !== false),
)

function fill(name: string) {
  brandInput.value = name
}

async function onSubmit(e: Event) {
  e.preventDefault()
  if (!brandInput.value.trim()) return
  submitting.value = true
  btnText.value = '跳转诊断…'
  await navigateTo({ path: '/diagnose', query: { brand: brandInput.value.trim() } })
}
</script>

<template>
  <main>
    <section class="hero" id="hero">
      <div class="container hero-grid">
        <div>
          <div class="hero-eyebrow">
            <span v-if="hero.eyebrow" class="badge badge-secondary">{{ hero.eyebrow }}</span>
            <span v-if="hero.badge" class="badge badge-outline">{{ hero.badge }}</span>
          </div>
          <h1>
            {{ hero.title }}<span v-if="hero.titleAccent" class="accent">{{ hero.titleAccent }}</span>
          </h1>
          <p class="hero-desc">{{ hero.description }}</p>
          <div class="hero-actions">
            <NuxtLink :to="hero.primaryCta.to" class="btn btn-default btn-lg">
              {{ hero.primaryCta.label }}
            </NuxtLink>
            <NuxtLink
              v-if="hero.secondaryCta"
              :to="hero.secondaryCta.to"
              class="btn btn-outline btn-lg"
            >
              {{ hero.secondaryCta.label }}
            </NuxtLink>
          </div>
          <form class="diag-form" @submit="onSubmit">
            <label class="sr-only" for="cms-home-url">品牌名称或官网</label>
            <input
              id="cms-home-url"
              v-model="brandInput"
              class="input"
              type="text"
              :placeholder="hero.formPlaceholder || '品牌或官网'"
              required
            >
            <button type="submit" class="btn btn-secondary" :disabled="submitting">{{ btnText }}</button>
          </form>
          <p v-if="hero.helper" class="hero-helper">{{ hero.helper }}</p>
          <div v-if="hero.quickTries?.length" class="quick">
            <span>快速试试：</span>
            <button
              v-for="name in hero.quickTries"
              :key="name"
              type="button"
              @click="fill(name)"
            >
              {{ name }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <template v-for="sec in enabledSections" :key="sec.id">
      <section
        class="section"
        :class="{ 'section-alt': sec.layout === 'steps' || sec.layout === 'links' }"
        :id="sec.id"
      >
        <div class="container">
          <div v-if="sec.layout !== 'stats'" class="section-head">
            <div v-if="sec.eyebrow" class="eyebrow">{{ sec.eyebrow }}</div>
            <h2 v-if="sec.title">{{ sec.title }}</h2>
            <p v-if="sec.description">{{ sec.description }}</p>
          </div>
          <div v-else class="eyebrow">{{ sec.eyebrow }}</div>

          <div v-if="sec.layout === 'stats'" class="stats">
            <div v-for="(item, i) in sec.items || []" :key="i" class="stat">
              <div class="v">{{ item.value }}</div>
              <div class="l">{{ item.label || item.title }}</div>
            </div>
          </div>

          <div v-else-if="sec.layout === 'steps'" class="steps">
            <div v-for="(item, i) in sec.items || []" :key="i" class="card card-hover step">
              <div class="card-header">
                <div class="step-top">
                  <span class="num mono">{{ String(i + 1).padStart(2, '0') }}</span>
                  <span v-if="item.badge" class="badge badge-outline">{{ item.badge }}</span>
                </div>
                <div class="card-title">{{ item.title }}</div>
                <div class="card-description">{{ item.description }}</div>
              </div>
            </div>
          </div>

          <div v-else-if="sec.layout === 'cards'" class="features">
            <div v-for="(item, i) in sec.items || []" :key="i" class="card card-hover">
              <div class="card-header">
                <div v-if="item.kicker" class="text-muted mono" style="font-size:.6875rem;letter-spacing:.06em;text-transform:uppercase">{{ item.kicker }}</div>
                <div class="card-title" style="font-size:1.125rem">{{ item.title }}</div>
                <div class="card-description">{{ item.description }}</div>
              </div>
              <div v-if="item.points?.length" class="card-content">
                <ul class="feature-list">
                  <li v-for="(p, j) in item.points" :key="j">{{ p }}</li>
                </ul>
              </div>
              <div v-if="item.to" class="card-footer">
                <NuxtLink :to="item.to" class="btn btn-link btn-sm">了解更多 →</NuxtLink>
              </div>
            </div>
          </div>

          <div v-else-if="sec.layout === 'links'" class="insights">
            <NuxtLink
              v-for="(item, i) in sec.items || []"
              :key="i"
              :to="item.to || '#'"
              class="card card-hover"
            >
              <div class="card-header">
                <div v-if="item.badge" class="insight-meta">
                  <span class="badge badge-outline">{{ item.badge }}</span>
                </div>
                <div class="card-title" style="font-size:1.0625rem;margin-top:.5rem">{{ item.title }}</div>
                <div class="card-description">{{ item.description }}</div>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="prose-block">
            <p v-for="(para, i) in (sec.description || '').split('\n').filter(Boolean)" :key="i">{{ para }}</p>
          </div>
        </div>
      </section>
    </template>

    <section v-if="content.faq?.length" class="section" id="faq">
      <div class="container">
        <div class="section-head">
          <h2>常见问题</h2>
        </div>
        <GeoHubFaq :items="content.faq" />
      </div>
    </section>

    <section v-if="content.cta" class="section" id="cta">
      <div class="container section-head" style="text-align:center">
        <h2>{{ content.cta.title }}</h2>
        <p>{{ content.cta.description }}</p>
        <NuxtLink :to="content.cta.button.to" class="btn btn-default btn-lg">
          {{ content.cta.button.label }}
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.cms-items {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: grid;
  gap: 0.75rem;
}
.cms-items li {
  padding: 1rem 0;
  border-top: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.cms-items strong { font-size: 1.05rem; }
.cms-items span { color: hsl(var(--muted-foreground)); line-height: 1.6; }
.prose-block p { line-height: 1.8; margin: 0 0 0.75rem; max-width: 44rem; }
.feature-list { margin: 0.5rem 0 0; padding-left: 1.1rem; }
.feature-list li { margin: 0.35rem 0; line-height: 1.55; color: hsl(var(--muted-foreground)); }
</style>
