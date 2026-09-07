<template>
  <div class="empty-page">
    <header class="ep-header">
      <h2 class="ep-title">AI 口碑分析</h2>
      <p class="ep-sub">定性分析 AI 回答内容的语义理解与情感倾向</p>
    </header>
    <PreCollectionEmpty title="AI 口碑分析" />
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
