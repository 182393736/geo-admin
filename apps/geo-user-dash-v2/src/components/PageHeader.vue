<template>
  <div class="geo-page-header">
    <div class="geo-page-header__text">
      <h1 class="geo-page-title">{{ title }}</h1>
      <p v-if="desc" class="geo-page-desc">{{ desc }}</p>
    </div>
    <div v-if="$slots.actions" class="geo-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  desc?: string;
}>();
</script>
