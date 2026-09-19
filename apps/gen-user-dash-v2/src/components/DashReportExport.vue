<template>
  <div class="relative" ref="root">
    <Button type="button" :disabled="loading" @click.stop="toggle">
      <Download class="h-4 w-4" />
      {{ loading ? (loadingLabel || '导出中…') : (label || '导出品牌透视报告') }}
    </Button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-50 mt-2 w-[400px] overflow-hidden rounded-lg border bg-popover p-4 text-popover-foreground shadow-md"
      @click.stop
    >
      <div class="flex gap-4">
        <div class="flex w-1/3 flex-col gap-1 border-r pr-4">
          <div class="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">快速选择</div>
          <button
            v-for="p in presets"
            :key="p.key"
            type="button"
            class="rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            @click="applyPreset(p)"
          >{{ p.label }}</button>
        </div>
        <div class="flex flex-1 flex-col gap-4">
          <div class="space-y-3">
            <div>
              <label class="mb-1 block text-[10px] font-medium text-muted-foreground">开始日期</label>
              <DashDateInput
                v-model="draftStart"
                :max="today"
                class="h-9 w-full rounded-lg border border-input px-2 text-xs"
              />
            </div>
            <div>
              <label class="mb-1 block text-[10px] font-medium text-muted-foreground">结束日期</label>
              <DashDateInput
                v-model="draftEnd"
                :max="today"
                class="h-9 w-full rounded-lg border border-input px-2 text-xs"
              />
            </div>
          </div>
          <div class="mt-auto flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="ghost" size="sm" @click="open = false">取消</Button>
            <Button type="button" size="sm" :disabled="loading" @click="confirm">确认导出</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { lastNDays } from '@/utils/engines'
import DashDateInput from '@/components/DashDateInput.vue'
import { Button } from '@/components/ui'

defineProps<{
  loading?: boolean
  label?: string
  loadingLabel?: string
}>()
const emit = defineEmits<{ confirm: [{ start: string; end: string }] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const init = lastNDays(7)
const draftStart = ref(init.start)
const draftEnd = ref(init.end)
const today = lastNDays(1).end

const presets = [
  { key: '7', label: '近 7 天', days: 7 },
  { key: '30', label: '近 30 天', days: 30 },
  { key: '90', label: '近 90 天', days: 90 },
]

function applyPreset(p: { days: number }) {
  const r = lastNDays(p.days)
  draftStart.value = r.start
  draftEnd.value = r.end
}

function toggle() {
  open.value = !open.value
}

function confirm() {
  emit('confirm', { start: draftStart.value, end: draftEnd.value })
  open.value = false
}

function onDoc(e: MouseEvent) {
  if (!open.value) return
  const t = e.target as Node
  if (root.value && !root.value.contains(t)) open.value = false
}

onMounted(() => document.addEventListener('click', onDoc))
onUnmounted(() => document.removeEventListener('click', onDoc))
</script>
