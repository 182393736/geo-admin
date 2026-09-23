<script setup lang="ts">
definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '关于 HANYUAI GEO｜GEO 行业获客与权威站',
  description: 'HANYUAI 以 site-manage 流量站做 GEO 教育与权威内容，以 geo-admin 工作台承载监测、诊断与 Agent。',
  keywords: '关于HANYUAI,GEO公司,生成式引擎优化',
  path: '/about',
})
</script>

<template>
  <GeoHubPage
    eyebrow="关于"
    title="关于 HANYUAI GEO"
    description="我们把「让品牌在 AI 答案中被正确提及」拆成两件事：可索引的行业权威内容，以及可验证的产品工作台。"
  >
    <section class="hub-section">
      <h2>分工</h2>
      <p>本站（www）负责获客、教育、术语、报告与免费轻诊断入口；登录后的深度任务、计费与 Agent 会话在控制台完成。</p>
    </section>
    <section class="hub-section">
      <h2>原则</h2>
      <ul>
        <li>不虚构评分与案例数字</li>
        <li>报告公开方法、引擎与采样周期</li>
        <li>指标与产品模块文案与控制台对齐</li>
      </ul>
    </section>
    <p class="links">
      <NuxtLink to="/security">安全</NuxtLink> ·
      <NuxtLink to="/privacy">隐私</NuxtLink> ·
      <NuxtLink to="/terms">条款</NuxtLink> ·
      <NuxtLink to="/demo">预约演示</NuxtLink>
    </p>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.5rem; }
.hub-section p, .hub-section li { line-height: 1.75; }
.links { margin-top: 2rem; }
.links a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
</style>
