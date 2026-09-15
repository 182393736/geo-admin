<template>
  <div class="relative" :class="wrapClass" ref="root">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 shadow-sm transition-all hover:border-indigo-300"
      :class="btnClass"
      @click.stop="toggle"
    >
      <span class="truncate">{{ label }}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
    </button>

    <div
      v-if="open"
      class="absolute top-full left-0 z-50 mt-1 max-w-[600px] min-w-[280px] w-max overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl"
      @click.stop
    >
      <div class="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索问题或分组…"
          class="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
          @click.stop
        />
      </div>
      <div class="max-h-[260px] overflow-y-auto py-1">
        <div
          class="cursor-pointer whitespace-nowrap px-4 py-2.5 text-[13px] transition-colors"
          :class="isSelected(0) ? 'bg-indigo-50 font-semibold text-indigo-700' : 'font-medium text-gray-600 hover:bg-gray-50'"
          @click="pick(0, '全部问题')"
        >全部问题</div>
        <div
          v-for="opt in filtered"
          :key="String(opt.value)"
          class="cursor-pointer whitespace-nowrap px-4 py-2.5 text-[13px] transition-colors"
          :class="isSelected(opt.value) ? 'bg-indigo-50 font-semibold text-indigo-700' : 'font-medium text-gray-600 hover:bg-gray-50'"
          @click="pick(opt.value, opt.label)"
        >{{ opt.label }}</div>
        <div v-if="!filtered.length" class="px-4 py-6 text-center text-xs text-gray-400">无匹配问题</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string | number;
  options: { value: string | number; label: string }[];
  label?: string;
  btnClass?: string;
  wrapClass?: string;
}>(), {
  label: '全部问题',
  btnClass: 'min-w-[180px] max-w-[320px]',
  wrapClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [string | number];
  'update:label': [string];
  change: [string | number];
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const keyword = ref('');

const filtered = computed(() => {
  const q = keyword.value.trim();
  if (!q) return props.options;
  return props.options.filter(o => o.label.includes(q));
});

function isSelected(value: string | number) {
  const cur = props.modelValue;
  if (value === 0 || value === '0') return cur === 0 || cur === '0' || cur == null || cur === '';
  return String(cur) === String(value);
}

function toggle() {
  open.value = !open.value;
  if (open.value) keyword.value = '';
}

function pick(value: string | number, text: string) {
  open.value = false;
  emit('update:modelValue', value);
  emit('update:label', text);
  emit('change', value);
}

function onDocClick(ev: MouseEvent) {
  if (!open.value) return;
  const t = ev.target as Node;
  if (root.value && !root.value.contains(t)) open.value = false;
}

onMounted(() => document.addEventListener('mousedown', onDocClick));
onUnmounted(() => document.removeEventListener('mousedown', onDocClick));
</script>
