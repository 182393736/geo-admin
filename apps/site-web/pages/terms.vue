<script setup lang="ts">
definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '服务条款｜HANYUAI GEO',
  description: '使用 HANYUAI GEO 流量站与跳转控制台服务的基本条款。',
  keywords: '服务条款,GEO条款',
  path: '/terms',
})
</script>

<template>
  <GeoHubPage eyebrow="信任" title="服务条款" description="使用本站内容与免费诊断即表示你理解公开信息的参考性质，深度能力以控制台协议为准。">
    <section class="hub-section">
      <h2>服务范围</h2>
      <p>本站提供 GEO 相关公开内容与轻诊断入口。付费功能、SLA 与数据处理协议在控制台签约后生效。</p>
    </section>
    <section class="hub-section">
      <h2>内容准确性</h2>
      <p>学习与报告页尽力保持方法透明；AI 答案本身具有波动性，诊断结果仅供参考，不构成投资或法律建议。</p>
    </section>
    <section class="hub-section">
      <h2>禁止行为</h2>
      <p>禁止对公开诊断接口进行滥用爬取、绕过限流或伪造品牌批量攻击。</p>
    </section>
    <p class="meta">更新日期：2026-09-20</p>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.5rem; }
.hub-section p { line-height: 1.75; }
.meta { margin-top: 2rem; color: hsl(var(--muted-foreground)); font-size: 0.875rem; }
</style>
