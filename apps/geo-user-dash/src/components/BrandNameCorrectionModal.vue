<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[180] flex items-center justify-center bg-gray-950/45 p-4"
    @mousedown.self="!saving && $emit('close')"
  >
    <section
      class="flex max-h-[min(760px,calc(100vh-32px))] w-[680px] max-w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brandCorrectionTitle"
    >
      <header class="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
        <div class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51 15.42 17.49"/><path d="M15.41 6.51 8.59 10.49"/></svg>
        </div>
        <div class="min-w-0 flex-1">
          <h3 id="brandCorrectionTitle" class="text-base font-extrabold text-gray-900">修正品牌名</h3>
          <p class="mt-1 text-xs leading-5 text-gray-500">把 AI 检测到的不同写法归到本品牌或竞品，榜单与统计会自动合并。</p>
        </div>
        <button type="button" class="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50" title="关闭" :disabled="saving" @click="$emit('close')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </header>

      <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-5 py-3">
          <label class="flex h-9 min-w-[190px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 focus-within:border-indigo-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input v-model="search" type="text" placeholder="搜索 AI 识别名" class="min-w-0 flex-1 bg-transparent text-xs text-gray-800 outline-none" />
          </label>
          <template v-if="selectedCount > 0">
            <span class="text-xs text-gray-500">已选 <strong class="text-gray-900">{{ selectedCount }}</strong> 项</span>
            <select v-model="batchAssign" class="h-9 max-w-[190px] rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-indigo-400">
              <option value="">选择批量归属</option>
              <option value="brand">本品牌 · {{ brandName }}{{ aliases.length ? `（含 ${aliases.length} 个别名）` : '' }}</option>
              <option v-for="c in competitors" :key="c" :value="`competitor:${c}`">竞品 · {{ c }}</option>
              <option value="ignore">忽略，不计入</option>
              <option value="pending">清除归类</option>
            </select>
            <button type="button" class="h-9 rounded-lg bg-gray-900 px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" :disabled="!batchAssign" @click="applyBatch">应用</button>
          </template>
        </div>

        <div class="grid grid-cols-[28px_minmax(0,1fr)_minmax(200px,260px)] items-center gap-2 border-b border-gray-100 px-5 py-2 text-[11px] font-bold text-gray-400 max-sm:grid-cols-[28px_minmax(0,1fr)]">
          <input type="checkbox" :checked="allFilteredSelected" aria-label="全选当前结果" @change="onToggleAll($event)" />
          <span>AI 检测到的写法</span>
          <span class="max-sm:hidden">归属品牌</span>
        </div>

        <div class="min-h-[240px] flex-1 overflow-y-auto">
          <div v-if="loading" class="grid h-56 place-items-center text-xs text-gray-400">
            <span class="flex items-center gap-2">加载识别名...</span>
          </div>
          <div v-else-if="!filtered.length" class="grid h-56 place-items-center px-6 text-center text-xs text-gray-400">
            {{ items.length ? '没有匹配的识别名' : '当前日期没有可修正的品牌名称' }}
          </div>
          <div
            v-for="row in filtered"
            :key="row.source_name"
            class="grid grid-cols-[28px_minmax(0,1fr)_minmax(200px,260px)] items-center gap-2 border-b border-gray-100 px-5 py-3 last:border-0 hover:bg-gray-50/60 max-sm:grid-cols-[28px_minmax(0,1fr)]"
          >
            <input type="checkbox" :checked="row.selected" :aria-label="`选择 ${row.source_name}`" @change="onToggleRow(row, $event)" />
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold text-gray-800" :title="row.source_name">{{ row.source_name }}</div>
            </div>
            <select
              :value="assignKey(row)"
              class="h-9 min-w-0 rounded-lg border px-2 text-xs outline-none max-sm:col-start-2"
              :class="row.assignment_type === 'pending' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-700 focus:border-indigo-400'"
              @change="onAssignChange(row.source_name, $event)"
            >
              <option value="pending">— 选择归属 —</option>
              <option value="brand">本品牌 · {{ brandName }}{{ aliases.length ? `（含 ${aliases.length} 个别名）` : '' }}</option>
              <option v-for="c in competitors" :key="c" :value="`competitor:${c}`">竞品 · {{ c }}</option>
              <option
                v-if="row.assignment_type === 'competitor' && row.target_name && !competitors.some(c => c.toLowerCase() === row.target_name!.toLowerCase())"
                :value="`competitor:${row.target_name}`"
              >新竞品 · {{ row.target_name }}</option>
              <option
                v-if="row.assignment_type !== 'competitor' && !competitors.some(c => c.toLowerCase() === row.source_name.toLowerCase())"
                value="new"
              >＋ 设为新竞品「{{ row.source_name }}」</option>
              <option value="ignore">忽略，不计入</option>
            </select>
          </div>
        </div>
      </div>

      <footer class="border-t border-gray-100 bg-white px-5 py-4">
        <div v-if="error" class="mb-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{{ error }}</div>
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs text-gray-400">未归类 {{ pendingCount }} · 共 {{ items.length }}</span>
          <div class="flex items-center gap-2">
            <button type="button" class="h-9 rounded-lg border border-gray-200 px-4 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50" :disabled="saving" @click="$emit('close')">取消</button>
            <button type="button" class="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50" :disabled="saving" @click="save">
              {{ saving ? '保存中...' : '保存归类' }}
            </button>
          </div>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import { brandApi } from '@/api/modules/brand';
import { useAuthStore } from '@/stores/auth';

export type CorrectionItem = {
  source_name: string;
  assignment_type: 'pending' | 'brand' | 'competitor' | 'ignore';
  target_name: string | null;
  selected: boolean;
};

const props = defineProps<{ open: boolean; date?: string }>();
const emit = defineEmits<{ close: []; saved: [number] }>();

const auth = useAuthStore();
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const search = ref('');
const brandName = ref('本品牌');
const aliases = ref<string[]>([]);
const competitors = ref<string[]>([]);
const items = ref<CorrectionItem[]>([]);
const batchAssign = ref('');
const initialKeys = ref<Record<string, string>>({});

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter(i => i.source_name.toLowerCase().includes(q));
});
const selectedCount = computed(() => items.value.filter(i => i.selected).length);
const pendingCount = computed(() => items.value.filter(i => i.assignment_type === 'pending').length);
const allFilteredSelected = computed(() => filtered.value.length > 0 && filtered.value.every(i => i.selected));

function assignKey(row: CorrectionItem) {
  return row.assignment_type === 'competitor' ? `competitor:${row.target_name || ''}` : row.assignment_type;
}

function setAssign(source: string, value: string) {
  items.value = items.value.map(n => {
    if (n.source_name !== source) return n;
    if (value === 'brand' || value === 'ignore' || value === 'pending') {
      return { ...n, assignment_type: value, target_name: value === 'brand' ? brandName.value : null };
    }
    if (value === 'new') {
      return { ...n, assignment_type: 'competitor', target_name: n.source_name };
    }
    return { ...n, assignment_type: 'competitor', target_name: value.slice('competitor:'.length) };
  });
}

function toggleAllFiltered(checked: boolean) {
  const set = new Set(filtered.value.map(i => i.source_name));
  items.value = items.value.map(n => (set.has(n.source_name) ? { ...n, selected: checked } : n));
}

function onToggleAll(e: Event) {
  toggleAllFiltered((e.target as HTMLInputElement).checked);
}
function onToggleRow(row: CorrectionItem, e: Event) {
  row.selected = (e.target as HTMLInputElement).checked;
}
function onAssignChange(source: string, e: Event) {
  setAssign(source, (e.target as HTMLSelectElement).value);
}

function applyBatch() {
  if (!batchAssign.value) return;
  const v = batchAssign.value;
  items.value = items.value.map(a => {
    if (!a.selected) return a;
    if (v === 'brand') return { ...a, assignment_type: 'brand', target_name: brandName.value, selected: false };
    if (v === 'ignore') return { ...a, assignment_type: 'ignore', target_name: null, selected: false };
    if (v === 'pending') return { ...a, assignment_type: 'pending', target_name: null, selected: false };
    return { ...a, assignment_type: 'competitor', target_name: v.slice('competitor:'.length), selected: false };
  });
  batchAssign.value = '';
}

async function load() {
  loading.value = true;
  error.value = '';
  search.value = '';
  batchAssign.value = '';
  try {
    const [corr, comps, summary] = await Promise.all([
      monitorApi.nameCorrections(props.date),
      brandApi.competitors().catch(() => []),
      brandApi.summary().catch(() => null),
    ]);
    const brand = corr?.brand || summary?.brand?.name || auth.activeBrand?.name || '本品牌';
    const aliasList = (summary?.aliases || []).map((a: any) => String(a.alias || a).trim()).filter(Boolean);
    const brandSet = new Set([brand, ...aliasList].map(s => s.toLowerCase()));
    const compFromSummary = (summary?.competitors || []).map((c: any) => String(c.name || '').trim()).filter(Boolean);
    const compFromApi = (Array.isArray(comps) ? comps : [])
      .map((c: any) => String(c.name || '').trim())
      .filter(Boolean);
    const compNames = [...new Set([...compFromSummary, ...compFromApi])]
      .filter((n: string) => n && !brandSet.has(n.toLowerCase()));
    const compMap = new Map(compNames.map((n: string) => [n.toLowerCase(), n]));

    const mapped: CorrectionItem[] = (corr?.items || []).map((s: any) => {
      const src = String(s.source_name || '').trim();
      if (brandSet.has(src.toLowerCase())) {
        return { source_name: src, assignment_type: 'brand' as const, target_name: brand, selected: false };
      }
      const hit = compMap.get(src.toLowerCase());
      if ((s.assignment_type === 'pending' || !s.assignment_type) && hit) {
        return { source_name: src, assignment_type: 'competitor' as const, target_name: hit, selected: false };
      }
      return {
        source_name: src,
        assignment_type: (s.assignment_type || 'pending') as CorrectionItem['assignment_type'],
        target_name: s.target_name ?? null,
        selected: false,
      };
    });

    brandName.value = brand;
    aliases.value = aliasList;
    competitors.value = compNames;
    items.value = mapped;
    initialKeys.value = Object.fromEntries(mapped.map(s => [s.source_name, assignKey(s)]));
  } catch (e: any) {
    error.value = e?.message || '加载失败';
    items.value = [];
  } finally {
    loading.value = false;
  }
}

async function save() {
  const changed = items.value.filter(a => assignKey(a) !== initialKeys.value[a.source_name]);
  if (!changed.length) {
    emit('close');
    return;
  }
  saving.value = true;
  error.value = '';
  try {
    const resp = await monitorApi.saveNameCorrections(
      changed.map(r => ({
        source_name: r.source_name,
        assignment_type: r.assignment_type,
        target_name: r.target_name,
      })),
      props.date,
    );
    emit('saved', resp?.updated ?? changed.length);
    emit('close');
  } catch (e: any) {
    error.value = e?.message || '保存失败，请稍后重试';
  } finally {
    saving.value = false;
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && !saving.value) emit('close');
}

watch(() => props.open, (v) => { if (v) void load(); });
onMounted(() => document.addEventListener('keydown', onKey));
onUnmounted(() => document.removeEventListener('keydown', onKey));
</script>
