<script setup lang="ts">
</script>

<template>
  <section class="agency section--tight">
    <div class="container">
      <div class="ag-card">
        <div class="ag-copy">
          <h3 class="ag-title">服务多个品牌？<em>用同一个监测底座</em></h3>
          <p class="ag-desc">Agency 工作台支持多品牌统一管理：每个品牌独立的监测、洞察与发稿空间，共享积分钱包，单次诊断直接用 于提案打单。用中立数据向客户证明每一分预算的去向。</p>
        </div>
        <NuxtLink to="/contact" class="btn-white">预约商务演示&nbsp;→</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.agency { background: #fff; padding: 40px 0; }
.ag-card {
  background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
  border-radius: 20px; padding: 44px 48px;
  display: flex; align-items: center; justify-content: space-between; gap: 40px;
}
.ag-title { font-size: 24px; font-weight: 800; color: #fafaf9; margin: 0 0 10px; em { font-style: normal; background: linear-gradient(135deg, #c4b5fd, #e9d5ff); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; } }
.ag-desc { font-size: 14px; color: #d6d3d1; opacity: .92; line-height: 1.8; margin: 0; max-width: 620px; }
.btn-white {
  padding: 0 26px; height: 44px; border-radius: 999px;
  background: #fff; color: #0f0f0f; font-size: 14px; font-weight: 700;
  display: inline-flex; align-items: center; flex-shrink: 0;
  transition: transform .15s ease;
  &:hover { transform: translateY(-1px); }
}
</style>
