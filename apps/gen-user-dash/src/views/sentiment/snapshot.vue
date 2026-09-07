<template>
  <div class="empty-page">
    <header class="ep-header">
      <h2 class="ep-title">搜索快照下载</h2>
      <p class="ep-sub">预览 AI 回答，并下载不同模型中的搜索结果快照或回答 Excel</p>
    </header>
    <PreCollectionEmpty title="搜索快照下载" />
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
