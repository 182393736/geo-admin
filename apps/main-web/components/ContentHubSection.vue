<script setup lang="ts">
const modules = [
  {
    icon: '📊', label: '报告',
    desc: '引用源月报与行业专题研究——用中立数据看清中文 AI 搜索生态。',
    link: '/reports', action: '查看报告',
  },
  {
    icon: '📖', label: '文章',
    desc: '从入门指南到实战方法：GEO 怎么理解、内容怎么写、渠道怎么选、效果怎么测，系统成体系。',
    link: '/articles', action: '阅读文章',
  },
  {
    icon: '📰', label: '资讯',
    desc: '产品更新、监测观察与行业动态——AI 搜索生态每周都在变，这里是变化的第一现场。',
    link: '/news', action: '浏览资讯',
  },
];
</script>

<template>
  <section class="content-hub section">
    <div class="container">
      <h2 class="section-title">研究与内容</h2>
      <p class="section-sub">吃自己的狗粮：透镜的每一篇内容，都按 GEO 方法论生产，并用监测底座验证被引效果。</p>
      <div class="hub-grid">
        <div v-for="m in modules" :key="m.label" class="hub-card">
          <div class="hub-icon">{{ m.icon }}</div>
          <div class="hub-label">{{ m.label }}</div>
          <p class="hub-desc">{{ m.desc }}</p>
          <NuxtLink :to="m.link" class="hub-link">{{ m.action }}&nbsp;→</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.content-hub { padding: 104px 0; background: transparent; }
.hub-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.hub-card {
  background: #fff; border: 1px solid #ececf1; border-radius: 18px; padding: 30px 28px;
  transition: transform .18s ease, box-shadow .18s ease;
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(16, 24, 40, .06); }
}
.hub-icon {
  width: 44px; height: 44px; border-radius: 10px; margin-bottom: 18px;
  background: linear-gradient(135deg, #eef2ff, #f3e8ff); color: #6366f1;
  font-size: 20px; display: flex; align-items: center; justify-content: center;
}
.hub-label { font-size: 18px; font-weight: 800; color: var(--ink); margin-bottom: 12px; }
.hub-desc { font-size: 13.5px; color: #6b7280; line-height: 1.8; margin-bottom: 22px; min-height: 50px; }
.hub-link { font-size: 14px; font-weight: 700; color: #6366f1; transition: gap .15s ease; &:hover { color: #4f46e5; } }
</style>
