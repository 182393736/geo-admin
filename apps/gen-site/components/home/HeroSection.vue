<template>
  <!-- Hero · 免费分析入口 -->
  <section class="hero">
    <h1 class="hero-title">
      <span class="ht-light">当客户问 AI 时，</span><br>
      <span class="grad">你被 AI 推荐了吗？</span>
    </h1>

    <p class="hero-sub">
      AI 流量时代，别让品牌"隐形"——告诉我你的品牌，<span class="em-grad">立即免费分析</span>它在豆包、DeepSeek、通义千问等大模型中的真实排名。
    </p>

    <!-- INTEGRATED INPUT BOX -->
    <div class="input-card" ref="cardEl" :class="{ 'timus-analysis-shake': shaking }">
      <div class="input-card-inner">
        <textarea id="brandInput" v-model="brandText" placeholder="例如：我的品牌叫「格力空调」，是国内领先的空调品牌，官网是 www.gree.com，主要竞品是美的和海尔..."></textarea>
      </div>
      <div class="input-actions">
        <div class="input-tools">
          <button class="tool-btn" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            添加品牌介绍链接
          </button>
          <button class="tool-btn" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            上传文档
          </button>
        </div>
        <button class="submit-btn" type="button" data-timus-analysis-submit="" @click="onSubmit">
          <span class="btn-content">开始免费分析</span>
        </button>
      </div>
    </div>

    <!-- QUICK FILL CHIPS -->
    <div class="quick-fill">
      <span class="quick-fill-label">快速填入：</span>
      <button class="chip" data-timus-brand-preset="小鹏汽车" @click="brandText = '小鹏汽车'">小鹏汽车</button>
      <button class="chip" data-timus-brand-preset="完美日记" @click="brandText = '完美日记'">完美日记</button>
      <button class="chip" data-timus-brand-preset="格力空调" @click="brandText = '格力空调'">格力空调</button>
      <button class="chip" data-timus-brand-preset="维乐口腔" @click="brandText = '维乐口腔'">维乐口腔</button>
    </div>

    <!-- PROOF STRIP：中立监测底座数字（原四信任点退役，数字上岗） -->
    <p class="hp-cap">中立监测底座 · 全程中立账号模拟访问，去个性化采集</p>
    <div class="hero-proof">
      <div class="hp-item"><b><span class="num" data-t="50000">50,000</span><em>+</em></b><span>每日中立模拟提问</span></div>
      <div class="hp-item"><b><span class="num" data-t="8">8</span><em>大</em></b><span>主流 AI 引擎端覆盖</span></div>
      <div class="hp-item"><b><span class="num" data-t="3000" data-unit="万">3,000万</span><em>+</em></b><span>沉淀引用源数据</span></div>
      <div class="hp-item"><b><span class="num" data-t="110000">110,000</span><em>+</em></b><span>发稿渠道资源</span></div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brandText = ref('')
const shaking = ref(false)
const cardEl = ref<HTMLElement | null>(null)

const { isLoggedIn } = useAuth()
const { open } = useAuthModal()
const { showToast } = useToast()

let shakeTimer: ReturnType<typeof setTimeout> | null = null

function shake() {
  shaking.value = false
  // 下一帧再加类，保证连续点击也能重新触发动画
  requestAnimationFrame(() => {
    shaking.value = true
    if (shakeTimer) clearTimeout(shakeTimer)
    shakeTimer = setTimeout(() => { shaking.value = false }, 400)
  })
}

function onSubmit() {
  if (!brandText.value.trim()) {
    shake()
    return
  }
  // 未登录：先弹出登录框，默认选中「账号密码」
  if (!isLoggedIn.value) {
    open('password', 'home-submit')
    return
  }
  // 已登录：走原有的分析流程（此处沿用原站的 Toast 反馈）
  showToast('正在进入控制台...')
}
</script>
