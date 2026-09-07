<template>
  <div class="empty-page">
    <header class="ep-header">
      <h2 class="ep-title">引用源追溯</h2>
      <p class="ep-sub">追踪 AI 回答中高频引用的信息来源与权重归因</p>
    </header>
    <PreCollectionEmpty title="引用源追溯" />
  </div>
</template>

<script setup lang="ts">
import PreCollectionEmpty from '@/components/PreCollectionEmpty.vue';
</script>

<style scoped>
.empty-page {
  max-width: 1240px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 36px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.ep-header h2 {
  font-size: 22px;
  font-weight: 800;
  line-height: 33px;
  color: #0f1115;
  margin: 0;
}
.ep-header p {
  font-size: 13px;
  color: #9ca3af;
  margin: 4px 0 0;
}
</style>
