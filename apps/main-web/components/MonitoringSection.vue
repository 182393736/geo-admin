<script setup lang="ts">
const points = [
  { title: '排名透视',   desc: '各引擎推荐名单里你的真实位置与波动' },
  { title: '口碑监测',   desc: 'AI 如何描述你，正负面倾向与高频印象词' },
  { title: '竞品透视',   desc: '谁在推荐名单上、靠什么内容占位，同榜对比一目了然' },
  { title: '引用源分析', desc: '看清 AI 答案背后引用了哪些站点与内容，锁定话语权阵地' },
  { title: '过程存证',   desc: '搜索全链路视频留痕，数据可回放、可审计' },
];
const engines = [
  { key: 'doubao',  letter: '豆', cls: 'doubao' },
  { key: 'deepseek', letter: 'D',  cls: 'deepseek' },
  { key: 'wenxin',   letter: '文', cls: 'wenxin' },
  { key: 'qwen',     letter: '通', cls: 'qwen' },
  { key: 'yuanbao',  letter: '元', cls: 'yuanbao' },
];
</script>

<template>
  <section class="monitor section">
    <div class="container">
      <div class="grid2">
        <!-- 左：文案 -->
        <div>
          <div class="eyebrow">中立监测</div>
          <h2 class="title">还原 <em>AI</em> 眼中，<br />品牌的真实处境</h2>
          <p class="sub">中立账号每天模拟真实用户提问，覆盖 8 大主流 AI 引擎端，全程去个性化、可回放存证——你看到的，就是用户看到的。</p>
          <ul class="points">
            <li v-for="p in points" :key="p.title" class="point">
              <span class="point-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <div>
                <div class="point-title">{{ p.title }}</div>
                <div class="point-desc">{{ p.desc }}</div>
              </div>
            </li>
          </ul>
        </div>

        <!-- 右：监测产出 mock -->
        <div class="monitor-mock">
          <div class="engines-row">
            <div v-for="e in engines" :key="e.key" class="engine" :class="`engine--${e.cls}`">{{ e.letter }}</div>
          </div>
          <div class="live-line"><span class="live-dot" />中立账号 · 采集运行中</div>
          <div class="result-card">
            <div class="rc-head">
              <span class="rc-brand-icon">◎</span>
              <span class="rc-brand">你的品牌 · 今日监测产出</span>
            </div>
            <div class="rc-row">
              <span class="rc-label">综合排名</span>
              <span class="rc-value"><b>#2</b> <span class="rc-up">↑ 2</span></span>
            </div>
            <div class="rc-row">
              <span class="rc-label">口碑倾向</span>
              <span class="rc-value rc-good">正面 86% ·「专业」「性价比高」</span>
            </div>
            <div class="rc-row">
              <span class="rc-label">引用源</span>
              <span class="rc-value"><b>156 个信源</b> · 本周新增 12</span>
            </div>
            <div class="rc-row">
              <span class="rc-label">竞品对比</span>
              <span class="rc-value">可见性领先主要竞品 <b>+4%</b></span>
            </div>
            <div class="rc-badge">✓ 全程视频留痕 · 每一条数据可回放核验</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.monitor { padding: 76px 0; background: transparent; }
.eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.18em; color: #6b7280; margin-bottom: 18px; }
.title { font-size: 40px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; color: var(--ink); margin: 0 0 18px; em { font-style: normal; color: #6366f1; } }
.sub { font-size: 15.5px; color: #4b5563; line-height: 1.8; margin-bottom: 34px; max-width: 480px; }

.points { list-style: none; padding: 0; margin: 0; }
.point { display: flex; gap: 14px; padding: 14px 0; border-top: 1px solid #f0f0f4; &:first-child { border-top: none; padding-top: 4px; } }
.point-icon {
  width: 26px; height: 26px; border-radius: 7px;
  background: linear-gradient(135deg, #eef2ff, #f3e8ff); color: #6366f1;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.point-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
.point-desc { font-size: 13px; color: #6b7280; }

.grid2 { display: grid; grid-template-columns: 1.1fr 1fr; gap: 56px; align-items: start; }

.monitor-mock {
  background: linear-gradient(135deg, #ede9fe 0%, #e8e4fb 55%, #f3e8fd 100%);
  border-radius: 24px; padding: 44px 32px 32px;
}
.engines-row { display: flex; justify-content: center; gap: 26px; margin-bottom: 32px; }
.engine {
  width: 56px; height: 56px; border-radius: 50%; background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700; box-shadow: 0 2px 8px rgba(16, 24, 40, .06);
  position: relative;
  &::after { content: ''; position: absolute; left: 50%; bottom: -24px; transform: translateX(-50%); width: 1px; height: 24px; background: #c7c2d9; }
}
.engine--doubao { color: #1668dc; }
.engine--deepseek { color: #4f46e5; }
.engine--wenxin { color: #1668dc; }
.engine--qwen { color: #f59e0b; }
.engine--yuanbao { color: #8b5cf6; }

.live-line {
  text-align: center; margin: 36px 0 20px;
  font-size: 12.5px; color: #6b7280; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 7px;
}
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 4px rgba(34, 197, 94, .2); }

.result-card { background: #fff; border-radius: 16px; padding: 22px 24px; box-shadow: 0 4px 16px rgba(16, 24, 40, .05); }
.rc-head { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 13.5px; font-weight: 600; color: var(--ink); }
.rc-brand-icon { width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.rc-row { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #f3f4f6; font-size: 13.5px; }
.rc-label { color: #6b7280; }
.rc-value { color: #111827; font-weight: 500; }
.rc-value b { font-weight: 700; }
.rc-up, .rc-good { color: #16a34a; }
.rc-badge { margin-top: 14px; text-align: center; font-size: 12.5px; color: #b45309; background: #fffbeb; border-radius: 8px; padding: 8px 0; font-weight: 500; }
</style>
