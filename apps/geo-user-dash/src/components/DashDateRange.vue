<template>
  <div class="relative" ref="root">
    <button
      type="button"
      class="flex min-w-[200px] items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition-all hover:border-indigo-300"
      @click.stop="toggle"
    >
      <div class="flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
        <span>{{ start }}</span>
        <span class="text-gray-300">→</span>
        <span>{{ end }}</span>
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
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
            <button type="button" class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700" @click="confirm">应用</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { lastNDays } from '@/utils/engines';
import DashDateInput from '@/components/DashDateInput.vue';

const props = defineProps<{ start: string; end: string }>();
const emit = defineEmits<{
  'update:start': [string];
  'update:end': [string];
  change: [{ start: string; end: string }];
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const draftStart = ref(props.start);
const draftEnd = ref(props.end);
const today = lastNDays(1).end;

const presets = [
  { key: 'today', label: '今日', days: 1 },
  { key: '7', label: '近 7 天', days: 7 },
  { key: '30', label: '近 30 天', days: 30 },
  { key: '90', label: '近 90 天', days: 90 },
  { key: '180', label: '近 180 天', days: 180 },
  { key: 'month', label: '本月', mode: 'month' as const },
  { key: 'lastMonth', label: '上月', mode: 'lastMonth' as const },
];

watch(() => [props.start, props.end], () => {
  draftStart.value = props.start;
  draftEnd.value = props.end;
});

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
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    draftStart.value = fmt(start);
    draftEnd.value = fmt(end);
    return;
  }
  const { start, end } = lastNDays(p.days || 7);
  draftStart.value = start;
  draftEnd.value = end;
}

function toggle() {
  if (!open.value) {
    draftStart.value = props.start;
    draftEnd.value = props.end;
  }
  open.value = !open.value;
}

function confirm() {
  let s = draftStart.value;
  let e = draftEnd.value;
  if (s && e && s > e) [s, e] = [e, s];
  open.value = false;
  emit('update:start', s);
  emit('update:end', e);
  emit('change', { start: s, end: e });
}

function onDocClick(ev: MouseEvent) {
  if (!open.value) return;
  const t = ev.target as Node;
  if (root.value && !root.value.contains(t)) open.value = false;
}

onMounted(() => document.addEventListener('mousedown', onDocClick));
onUnmounted(() => document.removeEventListener('mousedown', onDocClick));
</script>
