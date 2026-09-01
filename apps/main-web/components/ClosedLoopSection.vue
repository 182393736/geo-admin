<script setup lang="ts">
const steps = [
  { key: 'eye', num: '01', label: '中立监测', desc: '还原 AI 眼中真实的排名与口碑',
    icon: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>' },
  { key: 'insight', num: '02', label: '洞察建议', desc: '波动与缺口，转成行动建议',
    icon: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>' },
  { key: 'write', num: '03', label: '循证写作', desc: '写成 AI 愿意引用的答案',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
  { key: 'publish', num: '04', label: '精准发稿', desc: '11万+渠道筛选，一键发布',
    icon: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>' },
  { key: 'attribution', num: '05', label: '效果归因', desc: '引用数据回流，逐篇闭环归因',
    icon: '<path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>' },
];

const active = ref(0);
const mock = [
  { icon: '▦', title: '引用源透视', tip: '导出 CSV', body: '斗豹 | DeepSeek | 文心一言 | 通义千问 | 元宝' },
  { icon: '💡', title: '洞察建议', tip: 'AI 运营洞察', body: '波动信号：本周上升 3 条，下降 1 条' },
  { icon: '📝', title: '循证写作', tip: '稿件编辑器', body: '原创性自评 · 相似度 22%（健康）' },
  { icon: '🚀', title: '精准发稿', tip: '媒体库与订单', body: '搜狐重心阵地 · 36 氪 · 科技阵地' },
  { icon: '📊', title: '效果归因', tip: '被引回流明细', body: '本期被引 +33 篇 · 较上期 +38%' },
];
</script>

<template>
  <section class="closed-loop section">
    <div class="container">
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
              <span class="mock-icon">{{ mock[active].icon }}</span>
              <span class="mock-title">{{ steps[active].label }}</span>
              <span class="mock-tip">{{ mock[active].tip }}</span>
            </div>
            <div class="mock-desc">{{ mock[active].body }}</div>
            <div class="mock-skeleton">
              <div class="sk" style="width:92%" /><div class="sk" style="width:78%" /><div class="sk sk--short" style="width:46%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.closed-loop { background: #fff; }
.upgrade-chip {
  display: inline-flex; align-items: center; gap: 8px; margin: 0 auto 28px;
  padding: 7px 16px; border-radius: 999px; font-size: 12.5px; color: #6b7280;
  background: #f8f7f8; border: 1px solid #ececf1; font-weight: 500;
}
.chip-dot { width: 6px; height: 6px; border-radius: 999px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: inline-block; }
.section-title {
  font-size: 44px; margin-bottom: 16px;
  .grad { background: linear-gradient(135deg, #6366f1, #d946ef); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
}

.steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 48px 0 36px; }
.step {
  position: relative; text-align: left; cursor: pointer; padding: 18px 20px 16px;
  border: 1px solid #ececf1; border-radius: 14px; background: #fff;
  transition: all .18s ease;
  &:hover { border-color: #c7c7d4; transform: translateY(-2px); }
  &--active {
    border-color: #6366f1; background: linear-gradient(180deg, #f7f7ff 0%, #faf9ff 100%);
    box-shadow: 0 1px 2px rgba(99, 102, 241, .06), 0 8px 20px rgba(99, 102, 241, .08);
    .step-icon { color: #6366f1; }
  }
}
.step-icon { color: #9ca3af; margin-bottom: 10px; }
.step-text { line-height: 1.45; }
.step-label { font-size: 15.5px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.step-desc { font-size: 12px; color: #6b7280; }
.step-num { position: absolute; top: 14px; right: 16px; font-size: 11.5px; font-weight: 600; color: #d0d0d7; }

.preview-card {
  border-radius: 18px; background: linear-gradient(135deg, #f3f1fd 0%, #f5f1fc 50%, #f8f1fa 100%);
  overflow: hidden; padding: 2px;
}
.preview-header {
  display: flex; align-items: center; gap: 7px; padding: 12px 18px;
  background: rgba(255,255,255,.6);
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot--r { background: #fca5a5; } .dot--y { background: #fde68a; } .dot--g { background: #86efac; }
.preview-title { font-size: 13px; color: #6b7280; margin-left: 10px; font-weight: 500; }
.preview-body { padding: 28px 34px 36px; }
.preview-mock { background: #fff; border-radius: 12px; padding: 22px 24px; box-shadow: 0 1px 3px rgba(16,24,40,.05); }
.mock-top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.mock-icon { font-size: 18px; }
.mock-title { font-size: 15px; font-weight: 700; color: var(--ink); }
.mock-tip { margin-left: auto; font-size: 12.5px; color: #9ca3af; border: 1px solid #ececf1; padding: 4px 10px; border-radius: 6px; }
.mock-desc { font-size: 13.5px; color: #4b5563; margin-bottom: 16px; }
.mock-skeleton { display: flex; flex-direction: column; gap: 10px; }
.sk { height: 10px; border-radius: 999px; background: linear-gradient(90deg, #f3f4f6 25%, #ececf1 50%, #f3f4f6 75%); background-size: 400px 100%; animation: shimmer 1.8s infinite; }
.sk--short { background: #e3e0f0; }
@keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
</style>
