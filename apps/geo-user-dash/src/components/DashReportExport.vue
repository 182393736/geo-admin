<template>
  <div class="relative" ref="root">
    <button
      type="button"
      class="mb-1 flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="loading"
      @click.stop="toggle"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
      {{ loading ? (loadingLabel || '导出中...') : (label || '导出品牌透视报告') }}
    </button>

    <div
      v-if="open"
      class="absolute top-full right-0 z-50 mt-2 w-[400px] overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-2xl"
      @click.stop
    >
      <div class="flex gap-4">
        <div class="flex w-1/3 flex-col gap-1 border-r border-gray-50 pr-4">
          <div class="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">快速选择</div>
          <button
            v-for="p in presets"
            :key="p.key"
            type="button"
            class="rounded-lg px-2 py-1.5 text-left text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-indigo-600"
            @click="applyPreset(p)"
          >{{ p.label }}</button>
        </div>
        <div class="flex flex-1 flex-col gap-4">
          <div class="space-y-3">
            <div>
              <label class="mb-1 block text-[10px] font-bold text-gray-500">开始日期</label>
              <DashDateInput
                v-model="draftStart"
                :max="today"
                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-50"
              />
            </div>
            <div>
              <label class="mb-1 block text-[10px] font-bold text-gray-500">结束日期</label>
              <DashDateInput
                v-model="draftEnd"
                :max="today"
                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-50"
              />
            </div>
          </div>
          <div class="mt-auto flex justify-end gap-2 border-t border-gray-50 pt-4">
            <button type="button" class="rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-100" @click="open = false">取消</button>
            <button type="button" class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50" :disabled="loading" @click="confirm">确认导出</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { lastNDays } from '@/utils/engines';
import DashDateInput from '@/components/DashDateInput.vue';

defineProps<{
  loading?: boolean;
  label?: string;
  loadingLabel?: string;
}>();
const emit = defineEmits<{ confirm: [{ start: string; end: string }] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const init = lastNDays(7);
const draftStart = ref(init.start);
const draftEnd = ref(init.end);
const today = lastNDays(1).end;

const presets = [
  { key: '7', label: '近 7 天', days: 7 },
  { key: '30', label: '近 30 天', days: 30 },
  { key: '90', label: '近 90 天', days: 90 },
  { key: '180', label: '近 180 天', days: 180 },
  { key: 'month', label: '本月', mode: 'month' as const },
  { key: 'lastMonth', label: '上月', mode: 'lastMonth' as const },
];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function applyPreset(p: (typeof presets)[number]) {
  if (p.mode === 'month') {
    const now = new Date();
    draftStart.value = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
    draftEnd.value = today;
    return;
  }
  if (p.mode === 'lastMonth') {
    const now = new Date();
    draftStart.value = fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    draftEnd.value = fmt(new Date(now.getFullYear(), now.getMonth(), 0));
    return;
  }
  const { start, end } = lastNDays(p.days || 7);
  draftStart.value = start;
  draftEnd.value = end;
}

function toggle() {
  open.value = !open.value;
}

function confirm() {
  let s = draftStart.value;
  let e = draftEnd.value;
  if (s && e && s > e) [s, e] = [e, s];
  open.value = false;
  emit('confirm', { start: s, end: e });
}

function onDocClick(ev: MouseEvent) {
  if (!open.value) return;
  const t = ev.target as Node;
  if (root.value && !root.value.contains(t)) open.value = false;
}

onMounted(() => document.addEventListener('mousedown', onDocClick));
onUnmounted(() => document.removeEventListener('mousedown', onDocClick));
</script>
