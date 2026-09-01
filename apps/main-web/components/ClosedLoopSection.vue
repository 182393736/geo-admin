<script setup lang="ts">
const steps = [
  { key: 'eye', num: '01', label: '中立监测', desc: '还原 AI 眼中真实的排名与口碑',
    icon: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>' },
  { key: 'insight', num: '02', label: '洞察建议', desc: '波动与缺口，转成行动建议',
    icon: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>' },
  { key: 'write', num: '03', label: '循证写作', desc: '写成 AI 愿意引用的答案',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
  { key: 'publish', num: '04', label: '精准发稿', desc: '11万+渠道筛选，一键发布',
    icon: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>' },
  { key: 'attribution', num: '05', label: '效果归因', desc: '引用数据回流，逐篇闭环归因',
    icon: '<path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>' },
];
const active = ref(0);
const mock = [
  { title: '引用源透视', tip: '导出 CSV' },
  { title: '洞察建议', tip: 'AI 运营洞察' },
  { title: '循证写作', tip: '原创性自评' },
  { title: '精准发稿', tip: '媒体库与订单' },
  { title: '效果归因', tip: '被引回流明细' },
];
</script>

<template>
  <section class="closed-loop section">
    <div class="container--narrow">
      <div class="upgrade-chip">
        <span class="chip-dot" />全新升级 2.0 · 从监测工具，到 GEO 优化闭环平台
      </div>
      <h2 class="section-title">从中立监测，到<span class="grad">被 AI 引用</span></h2>
      <p class="section-sub">品牌 GEO 优化闭环 · 每一步都由上一步的数据驱动</p>

      <!-- 5 步标签 -->
      <div class="steps">
        <button
          v-for="(s, i) in steps" :key="s.key"
          class="step" :class="{ 'step--active': active === i }"
          type="button"
          @click="active = i"
        >
          <div class="step-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="s.icon" />
          </div>
          <div class="step-text">
            <div class="step-label">{{ s.label }}</div>
            <div class="step-desc">{{ s.desc }}</div>
          </div>
          <div class="step-num">{{ s.num }}</div>
        </button>
      </div>

      <!-- 预览卡 -->
      <div class="preview-card">
        <div class="preview-header">
          <span class="dot dot--r" /><span class="dot dot--y" /><span class="dot dot--g" />
          <span class="preview-title">透镜GEO · {{ steps[active].label }} · {{ mock[active].tip }}</span>
        </div>
        <div class="preview-body">
          <div class="preview-mock">
            <div class="mock-top">
              <span class="mock-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="steps[active].icon" />
              </span>
              <span class="mock-title">{{ steps[active].label }}</span>
              <span class="mock-tip">{{ mock[active].tip }}</span>
            </div>
            <div class="mock-skeleton">
              <div class="sk" style="width:92%" /><div class="sk" style="width:78%" /><div class="sk sk--3" style="width:46%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* 实测: bg=rgb(255,255,255) padding 84px/90px */
.closed-loop { background: rgb(255, 255, 255); padding: 84px 0 90px; }
.upgrade-chip {
  display: inline-flex; align-items: center; gap: 8px; margin: 0 auto 28px;
  padding: 6px 14px; border-radius: 999px; font-size: 12.5px; color: rgb(107, 107, 120);
  background: rgb(250, 250, 251); border: 1px solid rgb(236, 236, 241); font-weight: 500; line-height: 18.75px;
}
.chip-dot { width: 6px; height: 6px; border-radius: 999px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: inline-block; }
.section-title { font-size: 42px; line-height: 49.56px; letter-spacing: -0.84px; color: rgb(10, 10, 15); margin-bottom: 16px;
  .grad { background: linear-gradient(135deg, #6366f1, #d946ef); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; } }

.steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 48px 0 36px; }
.step {
  position: relative; text-align: left; cursor: pointer; padding: 16px 18px 14px;
  border: 1px solid rgb(236, 236, 241); border-radius: 14px; background: #fff;
  transition: all .18s ease; background-clip: padding-box;
  &:hover { border-color: rgb(199, 199, 212); transform: translateY(-2px); }
  &--active {
    border-color: #6366f1; background: linear-gradient(180deg, rgb(247, 247, 255) 0%, rgb(250, 249, 255) 100%);
    box-shadow: 0 1px 2px rgba(99, 102, 241, 0.06), 0 8px 20px rgba(99, 102, 241, 0.08);
    .step-icon { color: #6366f1; }
  }
}
.step-icon { color: rgb(156, 163, 175); margin-bottom: 10px; display: block; }
.step-text { line-height: 1.45; }
.step-label { font-size: 15px; font-weight: 700; color: rgb(10, 10, 15); margin-bottom: 3px; }
.step-desc { font-size: 12px; color: rgb(107, 107, 120); line-height: 1.55; }
.step-num { position: absolute; top: 12px; right: 14px; font-size: 11.5px; font-weight: 600; color: rgb(208, 208, 215); line-height: 1; }

.preview-card {
  border-radius: 18px;
  /* 实测背景：radial-gradient(130% 150% at 0% 0%, rgb(58,36,128) 0%, rgb(36,26,77) 46%, rgb(21,19,47) 100%)   +白色遮罩 */
  background: linear-gradient(135deg, rgba(243, 241, 253, 0.5) 0%, rgba(245, 241, 252, 0.5) 55%, rgba(248, 241, 250, 0.5) 100%), #fff;
  overflow: hidden; border: 1px solid rgb(240, 240, 245);
}
.preview-header { display: flex; align-items: center; gap: 7px; padding: 10px 16px; background: rgba(255,255,255,0.75); }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot--r { background: rgb(252, 165, 165); } .dot--y { background: rgb(253, 230, 138); } .dot--g { background: rgb(134, 239, 172); }
.preview-title { font-size: 12.5px; color: rgb(107, 107, 120); margin-left: 10px; font-weight: 500; }
.preview-body { padding: 24px 30px 30px; }
.preview-mock { background: #fff; border-radius: 12px; padding: 20px 22px; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.05); }
.mock-top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.mock-icon { color: #6366f1; display: flex; }
.mock-title { font-size: 14.5px; font-weight: 700; color: rgb(10, 10, 15); }
.mock-tip { margin-left: auto; font-size: 12px; color: rgb(156, 163, 175); border: 1px solid rgb(236, 236, 241); padding: 3px 8px; border-radius: 6px; font-weight: 500; }
.mock-skeleton { display: flex; flex-direction: column; gap: 10px; }
.sk { height: 10px; border-radius: 999px; background: linear-gradient(90deg, #f3f4f6 25%, #ececf1 50%, #f3f4f6 75%); background-size: 400px 100%; animation: shimmer 1.8s infinite; }
.sk--3 { background: linear-gradient(90deg, #e3e0f0 25%, #d8d4ec 50%, #e3e0f0 75%); background-size: 400px 100%; }
@keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
</style>
