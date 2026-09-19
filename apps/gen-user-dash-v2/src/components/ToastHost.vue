<script setup lang="ts">
import { inject } from 'vue'
import { toastState } from '@/lib/toast'
import { cn } from '@/lib/utils'

const state = inject('toastState', toastState)
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[200] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
    <div
      v-for="t in state.items"
      :key="t.id"
      :class="
        cn(
          'pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-lg',
          t.kind === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
          t.kind === 'error' && 'border-red-200 bg-red-50 text-red-900',
          t.kind === 'warning' && 'border-amber-200 bg-amber-50 text-amber-950',
          t.kind === 'info' && 'border-border bg-card text-foreground',
        )
      "
    >
      {{ t.text }}
    </div>
  </div>
</template>
