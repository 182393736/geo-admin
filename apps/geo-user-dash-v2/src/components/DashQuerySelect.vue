<template>
  <div class="relative" :class="wrapClass" ref="root">
    <button
      type="button"
      class="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent"
      :class="btnClass"
      @click.stop="toggle"
    >
      <span class="truncate">{{ label }}</span>
      <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-full z-50 mt-1 w-max min-w-[280px] max-w-[600px] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
      @click.stop
    >
      <div class="flex items-center gap-2 border-b px-3 py-2">
        <Search class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索问题或分组…"
          class="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          @click.stop
        />
      </div>
      <div class="max-h-[260px] overflow-y-auto py-1">
        <div
          class="cursor-pointer whitespace-nowrap px-3 py-2 text-xs transition-colors"
          :class="isSelected(0) ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent'"
          @click="pick(0, '全部问题')"
        >全部问题</div>
        <div
          v-for="opt in filtered"
          :key="String(opt.value)"
          class="cursor-pointer whitespace-nowrap px-3 py-2 text-xs transition-colors"
          :class="isSelected(opt.value) ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent'"
          @click="pick(opt.value, opt.label)"
        >{{ opt.label }}</div>
        <div v-if="!filtered.length" class="px-3 py-6 text-center text-xs text-muted-foreground">无匹配问题</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ChevronDown, Search } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: { value: string | number; label: string }[]
  label?: string
  btnClass?: string
  wrapClass?: string
}>(), {
  label: '全部问题',
  btnClass: 'min-w-[180px] max-w-[320px]',
  wrapClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [string | number]
  'update:label': [string]
  change: [string | number]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return props.options
  return props.options.filter((o) => o.label.includes(q))
})

function isSelected(value: string | number) {
  const cur = props.modelValue
  if (value === 0 || value === '0') return cur === 0 || cur === '0' || cur == null || cur === ''
  return String(cur) === String(value)
}

function toggle() {
  open.value = !open.value
  if (open.value) keyword.value = ''
}

function pick(value: string | number, text: string) {
  open.value = false
  emit('update:modelValue', value)
  emit('update:label', text)
  emit('change', value)
}

function onDocClick(ev: MouseEvent) {
  if (!open.value) return
  const t = ev.target as Node
  if (root.value && !root.value.contains(t)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>
