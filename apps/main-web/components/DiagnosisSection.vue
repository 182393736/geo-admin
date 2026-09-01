<script setup lang="ts">
const webRows = [
  { name: '豆包',    value: 74, color: '#f59e0b' },
  { name: 'DeepSeek', value: 61, color: '#6366f1' },
  { name: '文心一言', value: 58, color: '#dc2626' },
  { name: '通义千问', value: 70, color: '#16a34a' },
  { name: '元宝',    value: 66, color: '#ef4444' },
];
</script>

<template>
  <section class="diag section--tight">
    <div class="container">
      <div class="diag-panel">
        <!-- 左：文案 -->
        <div class="diag-copy">
          <div class="diag-chip"><span class="dot" />品牌单次诊断</div>
          <h2 class="diag-title">为任意品牌，即时跑出<br />一份完整的 <em>AI 诊断报告</em></h2>
          <p class="diag-sub">无需订阅、不必先建品牌，按需即跑。覆盖五大国产大模型、网页端与 APP 端两个入口，输出品牌可见性、排名、引用源与竞品对比——新品牌上线前快速摸底，代理提案时拿一份有分量的诊断上桌。</p>
          <div class="diag-actions">
            <NuxtLink to="/reports/demo" class="btn-dark-o">查看报告 Demo</NuxtLink>
            <NuxtLink to="/diagnosis" class="btn-white">前往单次诊断&nbsp;→</NuxtLink>
          </div>
          <div class="diag-meta">
            <span class="meta-pill">按积分计费 · 100 积分起</span>
            <span class="meta-pill">无需订阅</span>
          </div>
        </div>

        <!-- 右：报告 mock -->
        <div class="report-mock">
          <div class="rm-head">
            <div class="rm-title">
              诊断报告
              <span class="rm-eg">示例</span>
            </div>
            <div class="rm-brand">格力空调 · 网页端 + APP 端</div>
          </div>
          <div class="rm-score">
            <div class="rm-num">68<span class="rm-num-unit">%</span></div>
            <div class="rm-label">AI 可见性<br />全端综合</div>
          </div>
          <div class="rm-block">
            <div class="rm-block-title">网页端</div>
            <div v-for="r in webRows" :key="r.name" class="rm-row">
              <span class="rm-name">{{ r.name }}</span>
              <div class="rm-bar"><div class="rm-fill" :style="{ width: r.value + '%', background: r.color }" /></div>
              <span class="rm-val">{{ r.value }}%</span>
            </div>
          </div>
          <div class="rm-block rm-block--app">
            <div class="rm-block-title">APP 端</div>
            <div class="rm-app-row">
              <span class="rm-app-dot" style="background:#f59e0b" />豆包
              <span class="rm-app-dot" style="background:#4f46e5" />DeepSeek
              <span class="rm-app-dot" style="background:#16a34a" />通义千问
            </div>
          </div>
          <div class="rm-foot">
            <span>平均排名 <b>#3</b></span>
            <span>引用源 <b>156</b></span>
            <span>竞品差距 <b class="rm-up">+4%</b></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.diag { background: #fff; padding: 88px 0; }
.diag-panel {
  background: #131024;
  border-radius: 26px; padding: 68px 64px;
  display: grid; grid-template-columns: 1.15fr 1fr; gap: 64px; align-items: center;
}
.diag-copy { color: #f3f3f6; }
.diag-chip {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 500;
  background: rgba(99, 102, 241, .14); color: #c7d2fe; margin-bottom: 26px;
  .dot { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); }
}
.diag-title { font-size: 36px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.3; color: #fff; margin: 0 0 20px; em { font-style: normal; color: #c7d2fe; } }
.diag-sub { font-size: 14.5px; color: #a5b4fc; opacity: .9; line-height: 1.85; margin-bottom: 32px; max-width: 520px; }
.diag-actions { display: flex; gap: 12px; margin-bottom: 30px; }
.btn-dark-o {
  display: inline-flex; align-items: center; padding: 0 22px; height: 44px;
  border-radius: 999px; border: 1px solid rgba(255,255,255,.16); color: #f3f3f6; font-size: 14px; font-weight: 600; transition: all .15s ease;
  &:hover { background: rgba(255,255,255,.06); }
}
.btn-white {
  display: inline-flex; align-items: center; padding: 0 26px; height: 44px;
  border-radius: 999px; background: #fff; color: #0f0f0f; font-size: 14px; font-weight: 700; transition: all .15s ease;
  &:hover { transform: translateY(-1px); }
}
.diag-meta { display: flex; gap: 10px; }
.meta-pill { font-size: 12px; color: #9ca3af; border: 1px solid rgba(255,255,255,.1); padding: 5px 12px; border-radius: 6px; }

.report-mock { background: #fff; border-radius: 18px; padding: 24px 24px 18px; }
.rm-head { margin-bottom: 18px; }
.rm-title { font-size: 16px; font-weight: 800; color: var(--ink); }
.rm-eg { font-size: 11px; font-weight: 600; color: #9ca3af; background: #f4f4f6; padding: 2px 8px; border-radius: 4px; margin-left: 6px; }
.rm-brand { font-size: 12px; color: #6b7280; margin-top: 4px; }
.rm-score { display: flex; align-items: baseline; gap: 10px; margin-bottom: 22px; }
.rm-num { font-size: 46px; font-weight: 900; color: var(--ink); letter-spacing: -0.02em; line-height: 1; }
.rm-num-unit { font-size: 20px; font-weight: 700; }
.rm-label { font-size: 12px; color: #6b7280; line-height: 1.4; }
.rm-block { padding: 14px 0; border-top: 1px dashed #f0f0f4; }
.rm-block--app { border-top-style: dashed; }
.rm-block-title { font-size: 11.5px; font-weight: 600; color: #9ca3af; letter-spacing: 0.05em; margin-bottom: 10px; }
.rm-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; color: var(--ink-2); }
.rm-name { width: 62px; flex-shrink: 0; font-weight: 500; }
.rm-bar { flex: 1; height: 6px; background: #f3f4f6; border-radius: 999px; overflow: hidden; }
.rm-fill { height: 100%; border-radius: 999px; }
.rm-val { width: 38px; text-align: right; font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.rm-app-row { display: flex; align-items: center; gap: 16px; font-size: 12.5px; color: #4b5563; }
.rm-app-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 5px; }
.rm-foot { display: flex; justify-content: space-between; padding-top: 14px; border-top: 1px solid #f3f4f6; font-size: 12.5px; color: #6b7280; }
.rm-foot b { color: var(--ink); }
.rm-up { color: #16a34a; }
</style>
