<template>
  <div class="toast" id="toast" :class="{ show: visible }" aria-hidden="true">
    <div class="toast-spinner"></div>
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
const { text, visible } = useToast()
</script>
