<template>
  <div class="relative" ref="root">
    <button
      type="button"
      class="flex h-9 min-w-[130px] items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent"
      @click.stop="toggle"
    >
      <span class="truncate">{{ label }}</span>
      <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-full z-50 mt-1 w-[230px] overflow-hidden rounded-lg border bg-popover py-1 text-popover-foreground shadow-md"
      @click.stop
    >
      <div class="border-b px-3 py-2 text-[10px] font-medium text-muted-foreground">可多选，点击外部完成</div>
      <div
        class="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors"
        :class="isAll ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent'"
        @click="selectAll"
      >
        <span
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
          :class="isAll ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background'"
        >
          <Check v-if="isAll" class="h-3 w-3" />
        </span>
        <span class="truncate">全部</span>
      </div>
      <div
        v-for="opt in options"
        :key="opt.value"
        class="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors"
        :class="selected.has(opt.value) && !isAll ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent'"
        @click="toggleOne(opt.value)"
      >
        <span
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
          :class="selected.has(opt.value) && !isAll ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background'"
        >
          <Check v-if="selected.has(opt.value) && !isAll" class="h-3 w-3" />
        </span>
        <span class="truncate">{{ opt.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string[]
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [string[]]
  change: [string[]]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const selected = ref<Set<string>>(new Set(props.modelValue))

watch(() => props.modelValue, (v) => {
  selected.value = new Set(v)
})

const isAll = computed(() => selected.value.size === 0 || selected.value.size >= props.options.length)

const label = computed(() => {
  if (isAll.value) return '全部'
  const names = props.options.filter((o) => selected.value.has(o.value)).map((o) => o.label)
  return names.join('、') || '全部'
})

function emitValue(next: string[]) {
  selected.value = new Set(next)
  emit('update:modelValue', next)
  emit('change', next)
}

function selectAll() {
  emitValue([])
}

function toggleOne(value: string) {
  const next = new Set(isAll.value ? [] : selected.value)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  if (next.size === 0 || next.size >= props.options.length) {
    emitValue([])
    return
  }
  emitValue([...next])
}

function toggle() {
  open.value = !open.value
}

function onDocClick(ev: MouseEvent) {
  if (!open.value) return
  const t = ev.target as Node
  if (root.value && !root.value.contains(t)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>
