<template>
  <section class="partner section--md">
    <div class="container--narrow">
      <div class="partner-card">
        <div class="eyebrow-line">
          <span class="dash" /><span class="eyebrow">战 略 合 作</span><span class="dash" />
        </div>
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
        <div class="partner-mission body-2">共筑 AI 时代内容安全生态</div>
        <div class="partner-points body-3">
          <span class="pt">中立采集</span><span class="dot">·</span>
          <span class="pt">过程存证</span><span class="dot">·</span>
          <span class="pt">内容可核验</span>
          <span class="mdash">——</span>
          <span>与国家级媒体实验室共同打磨的监测方法论，每一条数据都经得起最严格的审视。</span>
        </div>
        <NuxtLink to="/reports/strategic-partnership" class="btn-dark">阅读战略合作发布&nbsp;→</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* 实测 section pad 88/92 */
.partner { padding: 88px 0 92px; }
.partner-card {
  background: rgb(251, 248, 243); border: 1px solid rgb(242, 235, 221); border-radius: 20px;
  padding: 56px 48px; text-align: center;
}
.eyebrow-line { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 36px; }
.dash { width: 40px; height: 1px; background: rgb(217, 208, 186); display: inline-block; }
.eyebrow { font-size: 12.5px; font-weight: 600; letter-spacing: 0.32em; color: rgb(107, 107, 120); line-height: 18.75px; }

.partner-row { display: flex; align-items: center; justify-content: center; gap: 56px; margin-bottom: 24px; }
.side-title { font-size: 30px; font-weight: 900; color: rgb(10, 10, 15); letter-spacing: -0.01em; line-height: 1.2; }
.side-sub { font-size: 13px; color: rgb(120, 113, 108); margin-top: 8px; letter-spacing: 0.05em; line-height: 1.6; }
.cross { font-size: 26px; color: rgb(234, 179, 8); font-weight: 700; }

.partner-mission { font-size: 15.5px; color: rgb(58, 58, 69); margin-bottom: 18px; font-weight: 500; line-height: 23.25px; }
.partner-points { font-size: 13.5px; color: rgb(58, 58, 69); margin-bottom: 34px; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; align-items: center; line-height: 27px; }
.pt { font-weight: 700; color: rgb(10, 10, 15); }
.dot { color: rgb(154, 154, 166); margin: 0 4px; }
.m-dash { color: rgb(154, 154, 166); margin: 0 6px; }

.btn-dark {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 22px; border-radius: 999px;
  background: rgb(10, 10, 15); color: #fff; font-size: 14px; font-weight: 500;
  transition: transform .15s ease;
  &:hover { transform: translateY(-1px); }
}
</style>
