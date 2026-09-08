<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value" :style="{ color }">{{ value }}</div>
    <div v-if="extra" class="stat-extra">{{ extra }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number; extra?: string; color?: string }>();
</script>
