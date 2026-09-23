<script setup lang="ts">
import type { RichPart } from '~/utils/content/geo-flagship'

defineProps<{ parts: RichPart[] }>()
</script>

<template>
  <template v-for="(part, i) in parts" :key="i">
    <br v-if="part.br">
    <span v-else-if="part.key" class="key">{{ part.text }}</span>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
