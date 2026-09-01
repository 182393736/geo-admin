<script setup lang="ts">
const cases = [
  {
    segment: '头部家电品牌',
    result: '→ #2',
    metric: '核心推荐词排名，6 周回到第一梯队',
    story: '波动诊断定位五个第三方内容挤占推荐位 → 循证写作产出 4 篇补位稿件 → 按被引数据投放 6 家媒体，稿件 30 天累计被 AI 引用 47 次。',
  },
  {
    segment: '新能源汽车品牌',
    result: '→ 41%',
    metric: '蓝海问题覆盖率，8 周提升 4 倍',
    story: '监控问题挖掘识别 23 个高提问量、低竞争覆盖的新兴问题 → 稿件规划按引用缺口排期 → 抢占首批引用位，成为多个问题的默认答案来源。',
  },
  {
    segment: '连锁医疗机构',
    result: '→ 82 分',
    metric: '口碑情感分，负面归因后 5 周回暖',
    story: '负面溯源锁定 3 篇过时信息源 → 循证回应稿件快速产出与分发 → AI 回答中的负面描述被新内容替代，情感分持续回升。',
  },
];
</script>

<template>
  <section class="effects section--tight">
    <div class="container">
      <h2 class="section-title" style="font-size: 38px;">闭环运行后的真实效果</h2>
      <p class="section-sub" style="margin-bottom: 40px;">来自真实监测底座的效果归因，品牌信息已脱敏。</p>

      <div class="cards">
        <div v-for="c in cases" :key="c.segment" class="card">
          <div class="card-segment">{{ c.segment }}</div>
          <div class="card-result">{{ c.result }}</div>
          <div class="card-metric">{{ c.metric }}</div>
          <div class="card-story">{{ c.story }}</div>
          <div class="card-foot">数据已脱敏 · 来自透镜监测底座</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.effects { background: #fff; padding-top: 40px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card {
  background: #fff; border: 1px solid #ececf1; border-radius: 18px; padding: 30px 26px 24px;
  transition: transform .18s ease, box-shadow .18s ease;
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(16, 24, 40, .06); }
}
.card-segment { font-size: 13px; font-weight: 600; color: #6b7280; letter-spacing: 0.04em; margin-bottom: 16px; }
.card-result { font-size: 44px; font-weight: 900; letter-spacing: -0.02em; color: var(--ink); line-height: 1; margin-bottom: 8px; }
.card-metric { font-size: 14px; color: #374151; font-weight: 500; margin-bottom: 20px; }
.card-story { font-size: 13.5px; color: #6b7280; line-height: 1.75; margin-bottom: 20px; padding-top: 16px; border-top: 1px dashed #f0f0f4; }
.card-foot { font-size: 12px; color: #9ca3af; }
</style>
