<script setup lang="ts">
const faqs = [
  {
    q: '你们能帮我直接把排名做上去吗？',
    a: `我们<strong>从不干预、不篡改任何算法排名</strong>——中立、真实的监测始终是透镜的底座。2.0 打通的是一条合规的提升路径：用监测数据定位差距 → 循证写作产出高质量内容 → 发布到 AI 高频取材的媒体 → 引用数据回流、逐篇归因验证效果。排名的提升，来自"被 AI 引用的好内容"，而不是黑箱操作。`,
  },
  {
    q: '循证写作和普通 AI 写作有什么区别？',
    a: `普通 AI 写作靠模型自由发挥，事实无出处、风格难控制。循证写作以你品牌的<strong>真实引用源与品牌资料库为依据</strong>：选题来自监测数据、每个事实有出处、不引用原文未提及的外部源，并自动执行禁用词检查。产出的是"AI 愿意引用的答案"，而非泛泛而谈的软文。`,
  },
  {
    q: '发稿覆盖哪些渠道？如何计费？',
    a: `覆盖官方网媒、综合门户、行业媒体、地方门户与自媒体等<strong>近万家渠道</strong>，每一家都标注近 30 天被 AI 引用数据与收录引擎，供你按引用表现挑选。计费按篇逐单：提交冻结积分，发布成功扣除、失败<strong>全额退回</strong>；平台实时回传发布状态与收录链接，投放有账可查。`,
  },
  {
    q: '你们是如何做监控的？',
    a: `完整模拟真实用户的搜索与答案获取过程：由<strong>海量中立账号</strong>轮换向各 AI 引擎提问，账号不携带任何个性化历史，<strong>排除个人使用习惯对回答的干扰</strong>，还原普通用户看到的原始结果；搜索<strong>全程录制视频留证</strong>，每一条数据都可回放核验、支持审计。`,
  },
  {
    q: '监测数据是实时的吗？',
    a: `监测以<strong>天</strong>为单位运行，不是实时刷新：中立账号每天对全部监控问题完成一轮抓取，次日即可查看最新排名与口碑。AI 回答本身存在随机性，单次结果可能波动，判断趋势请以持续监测为准（建议配合周报）。`,
  },
];
const openIdx = ref(0);
function toggle(i: number) { openIdx.value = openIdx.value === i ? -1 : i; }
</script>

<template>
  <section class="faq section">
    <div class="container" style="max-width: 860px;">
      <h2 class="section-title">常见问题</h2>
      <p class="section-sub" style="margin-bottom: 48px;">关于 GEO 监测与优化闭环的专业解答</p>

      <div class="faq-list">
        <div v-for="(f, i) in faqs" :key="i" class="faq" :class="{ 'faq--open': openIdx === i }">
          <button class="faq-q" type="button" @click="toggle(i)">
            <span>{{ f.q }}</span>
            <span class="faq-toggle">{{ openIdx === i ? '✕' : '+' }}</span>
          </button>
          <transition name="faq-a">
            <div v-if="openIdx === i" class="faq-a">
              <p v-html="f.a" />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.faq { padding: 104px 0; background: transparent; }
.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq {
  background: #fff; border: 1px solid #ececf1; border-radius: 14px; overflow: hidden;
  transition: box-shadow .15s ease;
  &--open { border-color: #d8d8e0; box-shadow: 0 2px 8px rgba(16,24,40,.04); }
}
.faq-q {
  width: 100%; padding: 22px 26px; display: flex; justify-content: space-between; align-items: center; gap: 16px;
  background: none; border: none; cursor: pointer; text-align: left;
  font-size: 15.5px; font-weight: 700; color: var(--ink);
}
.faq-toggle {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: #f4f4f6; color: #6b7280; font-size: 16px; font-weight: 500;
  display: flex; align-items: center; justify-content: center;
  transition: transform .2s ease;
}
.faq--open .faq-toggle { transform: rotate(45deg); }
.faq-a { padding: 0 26px 22px; }
.faq-a p { font-size: 14px; color: #4b5563; line-height: 1.85; margin: 0; }
.faq-a :deep(strong) { color: var(--ink); font-weight: 700; }
.faq-a-enter-active, .faq-a-leave-active { transition: opacity .2s ease, transform .2s ease; }
.faq-a-enter-from, .faq-a-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
