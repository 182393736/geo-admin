<template>
  <div class="relative" ref="root">
    <button
      type="button"
      class="flex h-9 min-w-[200px] items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent"
      @click.stop="toggle"
    >
      <div class="flex items-center gap-2">
        <Calendar class="h-3.5 w-3.5 text-muted-foreground" />
        <span>{{ start }}</span>
        <span class="text-muted-foreground">→</span>
        <span>{{ end }}</span>
      </div>
      <ChevronDown class="h-3.5 w-3.5 text-muted-foreground" />
    </button>

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
                class="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
              />
            </div>
            <div>
              <label class="mb-1 block text-[10px] font-medium text-muted-foreground">结束日期</label>
              <DashDateInput
                v-model="draftEnd"
                :max="today"
                class="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
              />
            </div>
          </div>
          <div class="mt-auto flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="ghost" size="sm" @click="open = false">取消</Button>
            <Button type="button" size="sm" @click="confirm">应用</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Calendar, ChevronDown } from 'lucide-vue-next'
import { lastNDays } from '@/utils/engines'
import DashDateInput from '@/components/DashDateInput.vue'
import { Button } from '@/components/ui'

const props = defineProps<{ start: string; end: string }>()
const emit = defineEmits<{
  'update:start': [string]
  'update:end': [string]
  change: [{ start: string; end: string }]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const draftStart = ref(props.start)
const draftEnd = ref(props.end)
const today = lastNDays(1).end

const presets = [
  { key: 'today', label: '今日', days: 1 },
  { key: '7', label: '近 7 天', days: 7 },
  { key: '30', label: '近 30 天', days: 30 },
  { key: '90', label: '近 90 天', days: 90 },
  { key: '180', label: '近 180 天', days: 180 },
  { key: 'month', label: '本月', mode: 'month' as const },
  { key: 'lastMonth', label: '上月', mode: 'lastMonth' as const },
]

watch(() => [props.start, props.end], () => {
  draftStart.value = props.start
  draftEnd.value = props.end
})

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function applyPreset(p: (typeof presets)[number]) {
  if (p.mode === 'month') {
    const now = new Date()
    draftStart.value = fmt(new Date(now.getFullYear(), now.getMonth(), 1))
    draftEnd.value = today
    return
  }
  if (p.mode === 'lastMonth') {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    draftStart.value = fmt(start)
    draftEnd.value = fmt(end)
    return
  }
  const { start, end } = lastNDays(p.days || 7)
  draftStart.value = start
  draftEnd.value = end
}

function toggle() {
  if (!open.value) {
    draftStart.value = props.start
    draftEnd.value = props.end
  }
  open.value = !open.value
}

function confirm() {
  let s = draftStart.value
  let e = draftEnd.value
  if (s && e && s > e) [s, e] = [e, s]
  open.value = false
  emit('update:start', s)
  emit('update:end', e)
  emit('change', { start: s, end: e })
}

function onDocClick(ev: MouseEvent) {
  if (!open.value) return
  const t = ev.target as Node
  if (root.value && !root.value.contains(t)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>
