<template>
  <!-- GEO 优化闭环（可切换轮播） -->
  <section class="loop-band rv" id="loop">
    <div class="v2-wrap">
        <div class="decor lc-sq1 fill-p" aria-hidden="true"></div>
        <div class="decor lc-sq2 line-b" aria-hidden="true"></div>
        <div class="decor lc-sq3 line-y" aria-hidden="true"></div>
        <div class="loop-head">
          <span class="badge"><span class="badge-dot"></span>全新升级 2.0 · 从监测工具，到 GEO 优化闭环平台</span>
          <h3>从中立监测，到<em>被 AI 引用</em></h3>
          <p>品牌 GEO 优化闭环 · 每一步都由上一步的数据驱动</p>
        </div>

        <div class="lt-tabs" id="ltTabs">
          <button :class="tabClass(0)" @click="ltShow(0)">
            <span class="li"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path></svg><span class="no">01</span></span>
            <b>中立监测</b>
            <span class="d">还原 AI 眼中真实的排名与口碑</span>
            <span class="prog"></span>
          </button>
          <button :class="tabClass(1)" @click="ltShow(1)">
            <span class="li"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"></path></svg><span class="no">02</span></span>
            <b>洞察建议</b>
            <span class="d">波动与缺口，转成行动建议</span>
            <span class="prog"></span>
          </button>
          <button :class="tabClass(2)" @click="ltShow(2)">
            <span class="li"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg><span class="no">03</span></span>
            <b>循证写作</b>
            <span class="d">写成 AI 愿意引用的答案</span>
            <span class="prog"></span>
          </button>
          <button :class="tabClass(3)" @click="ltShow(3)">
            <span class="li"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"></path><path d="M22 2 11 13"></path></svg><span class="no">04</span></span>
            <b>精准发稿</b>
            <span class="d">11万+渠道筛选，一键发布</span>
            <span class="prog"></span>
          </button>
          <button :class="tabClass(4)" @click="ltShow(4)">
            <span class="li"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"></path><path d="M21 3v6h-6"></path></svg><span class="no">05</span></span>
            <b>效果归因</b>
            <span class="d">引用数据回流，逐篇闭环归因</span>
            <span class="prog"></span>
          </button>
        </div>

        <div class="lt-stage" id="ltStage">
          <div class="lt-desktop">
            <div class="lt-window">
              <div class="lt-winbar"><i></i><i></i><i></i><span id="ltWinTitle">{{ winTitle }}</span></div>
              <div class="lt-frames">
              <img :class="frameClass(0)" src="/i_3e8443816d.png" alt="中立监测 · 产品截图" loading="lazy">
              <img :class="frameClass(1)" src="/i_b8f853047b.png" alt="洞察建议 · 产品截图" loading="lazy">
              <img :class="frameClass(2)" src="/i_3e5d8118a8.webp" alt="循证写作 · 产品截图" loading="lazy">
              <img :class="frameClass(3)" src="/i_fbd7e49f12.webp" alt="精准发稿 · 产品截图" loading="lazy">
              <img :class="frameClass(4)" src="/i_e6b10bd7cc.png" alt="效果归因 · 产品截图" loading="lazy">
              </div>
            </div>
          </div>
        </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 与原站一致：初始停在第 1 步「中立监测」
const tab = ref(0)
const STEP_NAMES = ['中立监测', '洞察建议', '循证写作', '精准发稿', '效果归因']
const winTitle = computed(() => `透镜GEO · ${STEP_NAMES[tab.value]}`)

const ltShow = (i: number) => { tab.value = i }
const tabClass = (i: number) => ['lt-tab', { on: tab.value === i }]
const frameClass = (i: number) => ['lt-frame', { on: tab.value === i }]

// 原站行为：闭环区块进入视口后才自动轮播
let timer: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined
const start = () => { if (!timer) timer = setInterval(() => { tab.value = (tab.value + 1) % 5 }, 7000) }
const stop = () => { if (timer) { clearInterval(timer); timer = undefined } }

onMounted(() => {
  const root = document.getElementById('loop')
  if (!root) return
  // 尊重系统「减少动态效果」设置（同时也让视觉回归测试保持稳定）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  io = new IntersectionObserver((es) => { es[0]?.isIntersecting ? start() : stop() },
    { threshold: 0.25 })
  io.observe(root)
})

onUnmounted(() => { stop(); io?.disconnect() })
</script>
