<template>
  <div class="relative" ref="root">
    <button
      type="button"
      class="flex min-w-[130px] items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 shadow-sm transition-all hover:border-indigo-300"
      @click.stop="toggle"
    >
      <span class="truncate">{{ label }}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
    </button>

    <div
      v-if="open"
      class="absolute top-full left-0 z-50 mt-1 w-[230px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-2xl"
      @click.stop
    >
      <div class="border-b border-gray-50 px-4 py-2 text-[10px] font-bold text-gray-400">可多选模型，点击外部完成</div>
      <div
        class="flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-[13px] transition-colors"
        :class="isAll ? 'bg-indigo-50 font-semibold text-indigo-700' : 'font-medium text-gray-600 hover:bg-gray-50'"
        @click="selectAll"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span
            class="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
            :class="isAll ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 bg-white'"
          >
            <svg v-if="isAll" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
          <span class="truncate">全部</span>
        </span>
      </div>
      <div
        v-for="opt in options"
        :key="opt.value"
        class="flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-[13px] transition-colors"
        :class="selected.has(opt.value) && !isAll ? 'bg-indigo-50 font-semibold text-indigo-700' : 'font-medium text-gray-600 hover:bg-gray-50'"
        @click="toggleOne(opt.value)"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span
            class="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
            :class="selected.has(opt.value) && !isAll ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 bg-white'"
          >
            <svg v-if="selected.has(opt.value) && !isAll" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
          <span class="truncate">{{ opt.label }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string[];
  options: { value: string; label: string }[];
}>();

const emit = defineEmits<{
  'update:modelValue': [string[]];
  change: [string[]];
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const selected = ref<Set<string>>(new Set(props.modelValue));

watch(() => props.modelValue, v => {
  selected.value = new Set(v);
});

const isAll = computed(() => selected.value.size === 0 || selected.value.size >= props.options.length);

const label = computed(() => {
  if (isAll.value) return '全部';
  const names = props.options.filter(o => selected.value.has(o.value)).map(o => o.label);
  return names.join('、') || '全部';
});

function emitValue(next: string[]) {
  selected.value = new Set(next);
  emit('update:modelValue', next);
  emit('change', next);
}

function selectAll() {
  emitValue([]);
}

function toggleOne(value: string) {
  const next = new Set(isAll.value ? [] : selected.value);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  if (next.size === 0 || next.size >= props.options.length) {
    emitValue([]);
    return;
  }
  emitValue([...next]);
}

function toggle() {
  open.value = !open.value;
}

function onDocClick(ev: MouseEvent) {
  if (!open.value) return;
  const t = ev.target as Node;
  if (root.value && !root.value.contains(t)) open.value = false;
}

onMounted(() => document.addEventListener('mousedown', onDocClick));
onUnmounted(() => document.removeEventListener('mousedown', onDocClick));
</script>
