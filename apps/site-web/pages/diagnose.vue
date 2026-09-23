<script setup lang="ts">
definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '免费 GEO 诊断｜3 分钟看清品牌在 AI 答案中的位置',
  description:
    '输入品牌名或官网，免费获取 GEO 快速诊断基线。只读采样，不改网站。完整持续监测请登录 HANYUAI 工作台。',
  keywords: '免费GEO诊断,GEO体检,AI搜索可见性检测',
  path: '/diagnose',
})

const route = useRoute()
const brandInput = ref(typeof route.query.brand === 'string' ? route.query.brand : '')
const status = ref<'idle' | 'running' | 'done' | 'error'>('idle')
const message = ref('')
const result = ref<{
  mode?: string
  data?: { summary?: string; focus?: string[]; note?: string }
  upgrade?: { loginUrl?: string; message?: string }
} | null>(null)

onMounted(() => {
  if (brandInput.value.trim()) {
    // 从首页带入品牌名时可自动跑一轮
    onSubmit(new Event('submit'))
  }
})

async function onSubmit(e: Event) {
  e.preventDefault()
  if (!brandInput.value.trim()) return
  status.value = 'running'
  message.value = '正在请求公开诊断…'
  result.value = null
  try {
    const res = await $fetch<typeof result.value & { ok: boolean }>('/api/geo/diagnose', {
      method: 'POST',
      body: { brand: brandInput.value.trim() },
    })
    result.value = res
    status.value = 'done'
    message.value =
      res?.mode === 'live'
        ? '已返回公开诊断结果。完整报告请登录工作台。'
        : '已生成演示基线（上游 API 未就绪时的回退）。完整报告请登录工作台。'
  } catch (err: any) {
    status.value = 'error'
    message.value = err?.data?.statusMessage || err?.message || '诊断失败，请稍后重试'
  }
}

function fill(name: string) {
  brandInput.value = name
}
</script>

<template>
  <GeoHubPage
    eyebrow="免费工具"
    title="免费 GEO 诊断"
    description="输入品牌名称或官网，约 3 分钟拿到可见性基线思路。公开页提供轻诊断；深度任务在工作台完成。"
    :diagnose-cta="false"
    console-path="/dashboard/report-center"
  >
    <form class="diag-form" @submit="onSubmit">
      <label class="sr-only" for="diag-brand">品牌名称或官网</label>
      <input
        id="diag-brand"
        v-model="brandInput"
        class="input"
        type="text"
        placeholder="例如 HANYUAI 或 https://example.com"
        required
      >
      <button class="btn btn-default" type="submit" :disabled="status === 'running'">
        {{ status === 'running' ? '诊断中…' : '开始免费体检' }}
      </button>
    </form>
    <div class="quick">
      <span>快速试试：</span>
      <button type="button" @click="fill('小鹏汽车')">小鹏汽车</button>
      <button type="button" @click="fill('完美日记')">完美日记</button>
      <button type="button" @click="fill('B2B 软件')">B2B 软件</button>
    </div>
    <p v-if="message" class="diag-msg">{{ message }}</p>

    <section v-if="status === 'done' && result" class="hub-section card">
      <div class="card-header">
        <div class="card-title">{{ result.mode === 'live' ? '公开诊断结果' : '演示基线' }}</div>
        <div class="card-description">
          {{ result.data?.summary || result.upgrade?.message }}
        </div>
      </div>
      <ul v-if="result.data?.focus?.length" class="focus">
        <li v-for="f in result.data.focus" :key="f">{{ f }}</li>
      </ul>
      <p v-if="result.data?.note" class="note">{{ result.data.note }}</p>
      <div class="card-footer" style="gap:.75rem;flex-wrap:wrap">
        <a
          class="btn btn-default"
          :href="result.upgrade?.loginUrl || '/login?redirect=/dashboard/report-center'"
        >登录查看完整诊断</a>
        <NuxtLink to="/tools/visibility" class="btn btn-outline">了解可见性监测</NuxtLink>
        <NuxtLink to="/learn/what-is-geo" class="btn btn-ghost">什么是 GEO</NuxtLink>
      </div>
    </section>

    <section class="hub-section">
      <h2>诊断会做什么？</h2>
      <ol>
        <li>只读理解品牌/官网公开信息</li>
        <li>按问题模板说明可见性与引用关注点</li>
        <li>给出进入工作台持续监测的路径（登录回跳）</li>
      </ol>
      <p>不会修改你的网站代码，也不会自动发内容。协议：流量站 → <code>/api/geo/diagnose</code> → geo-admin 公开 API；失败回退演示载荷。</p>
    </section>
  </GeoHubPage>
</template>

<style scoped>
.diag-form { display: flex; gap: 0.5rem; max-width: 36rem; }
.diag-form .input { flex: 1; }
.quick { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-top: 0.85rem; font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
.quick button { border-radius: 9999px; border: 1px solid hsl(var(--border)); padding: 0.25rem 0.625rem; font-size: 0.75rem; }
.diag-msg { margin-top: 1rem; color: hsl(var(--muted-foreground)); line-height: 1.6; }
.hub-section { margin-top: 2rem; }
.hub-section h2 { font-size: 1.2rem; margin-bottom: 0.65rem; }
.hub-section li, .hub-section p { line-height: 1.7; }
.focus { margin: 0 0 1rem; padding-left: 1.25rem; line-height: 1.7; }
.note { font-size: 0.85rem; color: hsl(var(--muted-foreground)); margin: 0 1.25rem 1rem; }
code { font-size: 0.85em; }
@media (max-width: 600px) {
  .diag-form { flex-direction: column; }
}
</style>
