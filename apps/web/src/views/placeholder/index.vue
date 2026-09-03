<template>
  <div class="placeholder-page">
    <div class="ph-card">
      <div class="ph-icon">{{ icon }}</div>
      <h2 class="ph-title">{{ title }}</h2>
      <p class="ph-desc">该模块规划中，敬请期待</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => (route.meta.title as string) || '页面');
const icon = computed(() => (route.meta.icon as string) || '⏳');
</script>

<style scoped>
.placeholder-page {
  height: 100vh; display: flex; align-items: center; justify-content: center;
  background: #f8fafc;
}
.ph-card {
  background: #fff; border: 1px solid #f3f4f6; border-radius: 16px;
  padding: 48px 64px; text-align: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.ph-icon { font-size: 40px; margin-bottom: 12px; }
.ph-title { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px; }
.ph-desc { font-size: 13px; color: #9ca3af; margin: 0; }
</style>
