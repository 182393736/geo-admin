<script setup lang="ts">
const message = ref('');
const quickFills = ['小鹏汽车', '完美日记', '格力空调', '维乐口腔'];
const stats = [
  { num: '50,000', unit: '+', label: '每日中立模拟提问' },
  { num: '8',      unit: '大', label: '主流 AI 引擎端覆盖' },
  { num: '3,000',  unit: '万+', label: '沉淀引用源数据' },
  { num: '110,000', unit: '+', label: '发稿渠道资源' },
];
function fill(brand: string) {
  message.value = `例如：我的品牌叫「${brand}」，是国内领先的品牌，官网是 www.example.com，主要竞品是…`;
}
function submit() { navigateTo('/register'); }
</script>

<template>
  <section class="hero">
    <!-- 装饰方块（几何网格背景图，深浅紫奶油色） -->
    <div class="deco deco--l1" /><div class="deco deco--l2" /><div class="deco deco--l3" />
    <div class="deco deco--r1" /><div class="deco deco--r2" /><div class="deco deco--r3" /><div class="deco deco--r4" /><div class="deco deco--r5" />

    <div class="hero-inner">
      <!-- 主标题 60px × 800 × lh66 × ls-1.2 × #0a0a0f -->
      <h1 class="hero-title">当客户问 <em>AI</em> 时，<br />你被 <em>AI</em> 推荐了吗？</h1>
      <!-- 副题 18px × 200 × lh27 × #0a0a0f -->
      <p class="hero-sub">
        AI 流量时代，别让品牌"隐形"——告诉我你的品牌，<a href="#analysis" class="link-violet">立即免费分析</a>它在豆包、DeepSeek、通义千问等<br />大模型中的真实排名。
      </p>

      <!-- 分析表单卡 -->
      <div class="form-card">
        <textarea
          v-model="message"
          class="form-textarea"
          placeholder="例如：我的品牌叫「格力空调」，是国内领先的空调品牌，官网是 www.gree.com，主要竞品是美的和海尔…"
          rows="4"
        />
        <div class="form-foot">
          <div class="form-actions">
            <button class="form-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              添加品牌介绍链接
            </button>
            <button class="form-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              上传文档
            </button>
          </div>
          <button class="btn-primary" type="button" @click="submit">
            开始免费分析
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <!-- 快速填入 -->
      <div class="quick-fill">
        <span class="quick-label">快速填入：</span>
        <button v-for="q in quickFills" :key="q" class="quick-chip" type="button" @click="fill(q)">{{ q }}</button>
      </div>

      <!-- 信任说明 -->
      <p class="cred">中立监测底座 · 全程中立账号模拟访问，去个性化采集</p>

      <!-- 大数据统计 -->
      <div class="stats">
        <div v-for="s in stats" :key="s.label" class="stat">
          <div class="stat-num">{{ s.num }}<span class="stat-unit">{{ s.unit }}</span></div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* 实测 outer height 844, pad 60/80 */
.hero {
  position: relative; overflow: hidden;
  background: #f6f6f9;
  padding: 60px 0 80px;
  text-align: center;
}
/* 点阵网格背景（原版用的 radial-gradient dots，极浅） */
.hero::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(circle, rgba(0,0,0,.028) 0.6px, transparent 0.6px);
  background-size: 26px 26px;
}
/* 两侧装饰方块（按原版位置/scaling/opacity 重调） */
.deco { position: absolute; border-radius: 18px; pointer-events: none; }
.deco--l1 { left: 40px;  top: 132px; width: 118px; height: 118px; background: rgba(237, 235, 251, 0.55); }
.deco--l2 { left: 194px; top: 132px; width: 88px;  height: 88px;  background: rgba(247, 233, 248, 0.5); }
.deco--l3 { left: 104px; top: 246px; width: 84px;  height: 84px;  background: rgba(253, 240, 224, 0.5); border-radius: 20px; }
.deco--r1 { right: 48px;  top: 132px; width: 112px; height: 112px; background: rgba(228, 236, 253, 0.55); }
.deco--r2 { right: 196px; top: 132px; width: 84px;  height: 84px;  background: rgba(247, 240, 251, 0.5); }
.deco--r3 { right: 108px; top: 252px; width: 92px;  height: 92px;  background: rgba(254, 247, 230, 0.5); }
.deco--r4 { right: 226px; top: 186px; width: 68px;  height: 68px;  background: rgba(243, 241, 253, 0.45); }
.deco--r5 { left: 380px;  top: 500px; width: 64px;  height: 64px;  background: rgba(237, 235, 251, 0.3); }

.hero-inner { position: relative; max-width: 1200px; margin: 0 auto; padding: 0 56px; }

/* 实测：fs60 fw800 lh66 ls-1.2 c=rgb(10,10,15) mb24 */
.hero-title {
  font-size: 60px; font-weight: 800; line-height: 66px; letter-spacing: -1.2px;
  color: rgb(10, 10, 15); margin: 0 0 24px;
  em { font-style: normal; color: rgb(10, 10, 15); }
}
/* 实测：fs18 fw200 lh27 c=rgb(10,10,15) mb48 width 816 mx-auto */
.hero-sub {
  font-size: 18px; font-weight: 200; line-height: 27px; color: rgb(10, 10, 15);
  max-width: 816px; margin: 0 auto 48px;
  .link-violet { color: rgb(139, 92, 246); font-weight: 500; text-decoration: underline; text-decoration-color: rgba(139, 92, 246, 0.4); text-underline-offset: 4px; }
}

/* ---- 表单卡 ---- */
.form-card {
  max-width: 780px; margin: 0 auto;
  background: #fff; border-radius: 16px;
  border: 1px solid rgb(236, 236, 241);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.04);
  overflow: hidden; text-align: left;
}
.form-textarea {
  width: 100%; border: none; outline: none; resize: none;
  padding: 22px 24px 10px; font-size: 15px; line-height: 1.7; color: rgb(26, 26, 26);
  font-family: inherit; background: transparent; font-weight: 400;
  &::placeholder { color: rgb(156, 163, 175); }
}
.form-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px 20px; gap: 20px;
}
.form-actions { display: flex; gap: 8px; }
.form-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
  border: 1px solid transparent; background: transparent; color: rgb(75, 85, 99); cursor: pointer;
  transition: all .15s ease;
  &:hover { background: #f4f4f6; color: rgb(17, 17, 17); }
}
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 999px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff; font-size: 14px; font-weight: 500; border: none; cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  &:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.38); }
}

/* ---- 快速填入 ---- */
.quick-fill { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 26px; }
.quick-label { font-size: 13px; color: rgb(107, 107, 120); font-weight: 400; }
.quick-chip {
  padding: 7px 16px; border-radius: 999px; font-size: 13px; color: rgb(58, 58, 69);
  background: #fff; border: 1px solid rgb(229, 229, 234); cursor: pointer;
  transition: all .15s ease; font-weight: 500;
  &:hover { border-color: rgb(199, 199, 209); background: #fafafa; }
}

/* ---- 信任 + 统计 ---- */
/* 实测：fs12.5 fw400 lh18.75 c=rgb(154,154,166) */
.cred { font-size: 12.5px; color: rgb(154, 154, 166); margin-top: 28px; margin-bottom: 42px; font-weight: 400; line-height: 18.75px; }
.stats { display: flex; justify-content: space-between; max-width: 1080px; margin: 0 auto; gap: 24px; }
.stat { flex: 1; padding: 0 16px; }
.stat + .stat { border-left: 1px solid rgb(233, 233, 238); }
.stat-num { font-size: 44px; font-weight: 800; color: rgb(10, 10, 15); letter-spacing: -0.02em; line-height: 1; font-variant-numeric: tabular-nums; }
.stat-unit { font-size: 18px; font-weight: 700; color: rgb(139, 92, 246); margin-left: 2px; }
.stat-label { font-size: 13px; color: rgb(107, 107, 120); margin-top: 8px; }
</style>
