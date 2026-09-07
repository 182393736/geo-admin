<template>
  <div class="pce-wrap">
    <div class="pce-icon">📊</div>
    <div class="pce-title">{{ title }}</div>
    <div class="pce-desc">{{ desc }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; desc?: string }>(), {
  title: '暂无数据',
  desc: '该模块的数据将在首次采集完成后生成，当前为采集前状态，暂无数据可展示。',
});
</script>

<style scoped>
.pce-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 72px 32px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  min-height: 320px;
  text-align: center;
}
.pce-icon {
  font-size: 40px;
  line-height: 1;
}
.pce-title {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
}
.pce-desc {
  font-size: 13px;
  color: #9ca3af;
  max-width: 480px;
  line-height: 1.6;
}
</style>
