<script setup lang="ts">
const brandInput = ref('')
const submitting = ref(false)
const btnText = ref('开始免费体检')

function fill(name: string) {
  brandInput.value = name
}

async function onSubmit(e: Event) {
  e.preventDefault()
  if (!brandInput.value.trim()) return
  submitting.value = true
  btnText.value = '正在生成基线…'
  await new Promise((r) => setTimeout(r, 1200))
  btnText.value = '已生成示例基线'
  submitting.value = false
  document.getElementById('diagnose')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="hero" id="hero">
    <div class="container hero-grid">
      <div>
        <div class="hero-eyebrow">
          <span class="badge badge-secondary">GEO 智能增长工作台</span>
          <span class="badge badge-outline">BETA</span>
        </div>
        <h1>让品牌被<span class="accent">AI 看见</span>，也让 AI 搜索增长可被验证</h1>
        <p class="hero-desc">
          从 AI 回答里的品牌排名，到品牌信息能不能被 AI 理解、引用和推荐，把看不见的 GEO 增长问题变成一张可执行的路线图。
        </p>
        <div class="hero-actions">
          <a href="#diagnose" class="btn btn-default btn-lg">
            免费跑一次诊断
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10" /></svg>
          </a>
          <a href="#workflow" class="btn btn-outline btn-lg">先看工作流</a>
        </div>
        <form class="diag-form" id="diagnose-form" @submit="onSubmit">
          <label class="sr-only" for="url">品牌名称或官网</label>
          <input
            id="url"
            v-model="brandInput"
            class="input"
            name="url"
            type="text"
            placeholder="例如 HANYUAI 或 https://example.com"
            required
          >
          <button type="submit" class="btn btn-secondary" :disabled="submitting">{{ btnText }}</button>
        </form>
        <p class="hero-helper">可输入品牌名称或官网 · 无需登录 · 3 分钟出结果 · 只读访问</p>
        <div class="quick">
          <span>快速试试：</span>
          <button type="button" @click="fill('小鹏汽车')">小鹏汽车</button>
          <button type="button" @click="fill('完美日记')">完美日记</button>
          <button type="button" @click="fill('B2B 软件')">B2B 软件</button>
        </div>
      </div>

      <div class="card preview">
        <div class="preview-head">
          <div>
            <div class="t">AI 可见性快照</div>
            <div class="b">示例品牌 · 全端综合</div>
          </div>
          <span class="badge badge-success"><span class="dot" style="margin-right:.375rem" />监测正常</span>
        </div>
        <div class="preview-body">
          <div class="score-row">
            <div>
              <div class="text-muted" style="font-size:.75rem;margin-bottom:.25rem">可见性</div>
              <div class="score">78<small>/100</small></div>
            </div>
            <span class="badge badge-secondary">+12%</span>
          </div>
          <svg class="chart" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true" style="color:hsl(var(--primary))">
            <defs>
              <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stop-color="currentColor" stop-opacity=".18" />
                <stop offset="1" stop-color="currentColor" stop-opacity="0" />
              </linearGradient>
            </defs>
            <g stroke="hsl(var(--border))" stroke-dasharray="3 3">
              <line x1="0" x2="400" y1="30" y2="30" />
              <line x1="0" x2="400" y1="60" y2="60" />
              <line x1="0" x2="400" y1="90" y2="90" />
            </g>
            <path fill="url(#g1)" d="M0,84 L50,72 L100,78 L150,60 L200,52 L250,54 L300,32 L350,40 L400,12 L400,120 L0,120Z" />
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M0,84 L50,72 L100,78 L150,60 L200,52 L250,54 L300,32 L350,40 L400,12" />
            <circle cx="400" cy="12" r="4" fill="currentColor" />
          </svg>
          <div class="metrics">
            <div class="metric"><div class="l">平均推荐位</div><div class="v">#3</div><div class="d">↑ 2</div></div>
            <div class="metric"><div class="l">引用信源</div><div class="v">126</div><div class="d">本周 +18</div></div>
            <div class="metric"><div class="l">AI 理解度</div><div class="v">92</div><div class="d">良好</div></div>
            <div class="metric"><div class="l">竞品差距</div><div class="v">+8%</div><div class="d">领先</div></div>
          </div>
        </div>
        <div class="preview-foot">基于 8 个 AI 引擎、42 组问题的中立采样</div>
      </div>
    </div>
  </section>
</template>
