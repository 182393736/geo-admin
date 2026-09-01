<template>
  <section class="partner section--tight">
    <div class="container--narrow">
      <div class="partner-card">
        <div class="eyebrow-line"><span class="dash" /><span class="eyebrow">战 略 合 作</span><span class="dash" /></div>
        <div class="partner-row">
          <div class="side">
            <div class="side-title">透镜GEO</div>
            <div class="side-sub">GEO 优化闭环平台</div>
          </div>
          <div class="cross">✕</div>
          <div class="side">
            <div class="side-title">新华社国家重点实验室</div>
            <div class="side-sub">媒体融合生产技术与系统</div>
          </div>
        </div>
        <div class="partner-mission">共筑 AI 时代内容安全生态</div>
        <div class="partner-points">
          <span class="pt">中立采集</span><span class="dot">·</span>
          <span class="pt">过程存证</span><span class="dot">·</span>
          <span class="pt">内容可核验</span>
          <span class="mdash">——</span>
          <span class="pt-text">与国家级媒体实验室共同打磨的监测方法论，每一条数据都经得起最严格的审视。</span>
        </div>
        <NuxtLink to="/reports/strategic-partnership" class="btn-dark">阅读战略合作发布&nbsp;<span aria-hidden>→</span></NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.partner { padding: 40px 0 64px; }
.partner-card {
  background: #fbf8f3; border: 1px solid #f2ebdd; border-radius: 20px;
  padding: 56px 48px; text-align: center;
}
.eyebrow-line { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 36px; }
.dash { width: 40px; height: 1px; background: #d9d0ba; display: inline-block; }
.eyebrow { font-size: 12.5px; font-weight: 600; letter-spacing: 0.32em; color: #6b7280; }

.partner-row { display: flex; align-items: center; justify-content: center; gap: 56px; margin-bottom: 24px; }
.side-title { font-size: 30px; font-weight: 900; color: var(--ink); letter-spacing: -0.01em; }
.side-sub { font-size: 13px; color: #78716c; margin-top: 8px; letter-spacing: 0.05em; }
.cross { font-size: 26px; color: #eab308; font-weight: 700; }

.partner-mission { font-size: 16.5px; color: #57534e; margin-bottom: 18px; font-weight: 500; }
.partner-points { font-size: 14px; color: #57534e; margin-bottom: 34px; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; align-items: center; }
.pt { font-weight: 700; color: #1c1917; }
.dot { color: #a8a29e; margin: 0 4px; }
.m-dash { color: #a8a29e; margin: 0 6px; }
.pt-text { color: #57534e; }

.btn-dark {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 26px; border-radius: 999px;
  background: #0a0a0a; color: #fff; font-size: 14px; font-weight: 600;
  transition: transform .15s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-1px); }
}
</style>
