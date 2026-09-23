<script setup lang="ts">
definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '安全说明｜HANYUAI GEO',
  description: '公开诊断只读采样；账号与密钥在控制台侧管理。说明流量站与工作台的安全边界。',
  keywords: 'GEO安全,数据安全',
  path: '/security',
})
</script>

<template>
  <GeoHubPage eyebrow="信任" title="安全说明" description="流量站仅承载公开内容与轻诊断入口；敏感数据与任务执行在控制台与 API 侧。">
    <section class="hub-section">
      <h2>公开诊断</h2>
      <p>免费诊断对品牌/官网做只读理解，不修改客户站点，不索取 CMS/服务器凭据。</p>
    </section>
    <section class="hub-section">
      <h2>登录与令牌</h2>
      <p>登录跳转控制台完成。流量站不持久化工作台访问令牌；深度结果需登录后查看。</p>
    </section>
    <section class="hub-section">
      <h2>联系</h2>
      <p>安全问题请通过控制台工单或商务渠道反馈。</p>
    </section>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.5rem; }
.hub-section p { line-height: 1.75; }
</style>
