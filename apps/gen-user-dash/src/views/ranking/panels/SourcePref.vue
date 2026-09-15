<template>
  <div class="geo-page">
    <div class="geo-page-header">
      <div class="geo-page-header__text">
        <h1 class="geo-page-title">信源平台偏好</h1>
        <p class="geo-page-desc">分析各 AI 平台收录引用的来源偏好，洞察内容分发策略</p>
      </div>
    </div>

    <div class="space-y-6 pb-20">
      <!-- 筛选行 -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-3 relative">
          <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            <span>日期:</span>
          </div>
          <DashDateRange v-model:start="rangeStart" v-model:end="rangeEnd" @change="reload" />
        </div>
        <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button
            type="button"
            :class="['px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1', tab === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50']"
            @click="setTab('all')"
          >全部平台</button>
          <button
            v-for="p in tabPlatforms"
            :key="p.key"
            type="button"
            :class="['px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1', tab === p.key ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50']"
            @click="setTab(p.key)"
          >{{ p.name }}</button>
        </div>
        <div class="relative">
          <input
            v-model="keyword"
            placeholder="搜索来源..."
            class="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
        </div>
        <span v-if="loading" class="text-xs text-gray-400">加载中…</span>
      </div>

      <!-- KPI -->
      <div class="grid grid-cols-3 gap-4">
        <div class="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          </div>
          <div class="min-w-0">
            <div class="text-sm text-gray-500 mb-0.5">引用来源数</div>
            <div class="text-2xl font-bold text-gray-900 tabular-nums">{{ filteredSummary.total_sources }}</div>
          </div>
        </div>
        <div class="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-amber-100 transition-all">
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          </div>
          <div class="min-w-0">
            <div class="text-sm text-gray-500 mb-0.5">总引用次数</div>
            <div class="text-2xl font-bold text-gray-900 tabular-nums">{{ filteredSummary.total_ref_count.toLocaleString() }}</div>
          </div>
        </div>
        <div class="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-emerald-100 transition-all">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
          </div>
          <div class="min-w-0">
            <div class="text-sm text-gray-500 mb-0.5">平均引用次数</div>
            <div class="text-2xl font-bold text-gray-900 tabular-nums">{{ avgRef }}</div>
          </div>
        </div>
      </div>

      <!-- 图表 -->
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 class="text-base font-semibold text-gray-900">
              TOP10 信源平台<span v-if="tab !== 'all'" class="text-gray-500 font-medium"> ({{ tabName }})</span>
            </h3>
            <div v-if="tab === 'all'" class="flex items-center gap-x-3 gap-y-1 flex-wrap">
              <div v-for="p in platforms" :key="p.key" class="flex items-center gap-1.5 text-xs text-gray-500">
                <span class="w-2.5 h-2.5 rounded-sm" :style="{ background: p.color }"></span>{{ p.name }}
              </div>
            </div>
          </div>

          <div class="relative" @mouseleave="barHover = null">
            <svg :viewBox="`0 0 ${BW} ${BH}`" class="w-full" style="height: 380px;" preserveAspectRatio="xMidYMid meet">
              <!-- X grid -->
              <line
                v-for="(tick, i) in xTicks"
                :key="'xg' + i"
                :x1="xOf(tick)"
                :x2="xOf(tick)"
                :y1="PAD.t"
                :y2="BH - PAD.b"
                stroke="#f1f5f9"
                stroke-width="1"
              />
              <!-- X labels -->
              <text
                v-for="(tick, i) in xTicks"
                :key="'xl' + i"
                :x="xOf(tick)"
                :y="BH - 8"
                text-anchor="middle"
                class="bar-axis"
              >{{ tick }}</text>

              <g v-for="(row, ri) in topSources" :key="row.canonical_source">
                <text
                  :x="PAD.l - 8"
                  :y="yOf(ri) + BAR_H / 2 + 4"
                  text-anchor="end"
                  class="bar-label"
                >{{ truncate(row.canonical_source, 10) }}</text>
                <g>
                  <rect
                    v-for="(seg, si) in stackSegs(row)"
                    :key="si"
                    :x="seg.x"
                    :y="yOf(ri)"
                    :width="Math.max(seg.w, 0)"
                    :height="BAR_H"
                    :fill="seg.color"
                    class="cursor-pointer"
                    @mousemove="onBarMove($event, row)"
                  />
                </g>
                <text
                  :x="xOf(row.ref_count) + 6"
                  :y="yOf(ri) + BAR_H / 2 + 4"
                  class="bar-value"
                >{{ row.ref_count }}</text>
              </g>
            </svg>

            <div
              v-if="barHover"
              class="pointer-events-none absolute z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm min-w-[140px]"
              :style="{ left: barHover.left + 'px', top: barHover.top + 'px' }"
            >
              <div class="font-medium mb-2 text-gray-900">{{ barHover.name }}</div>
              <div
                v-for="s in barHover.segs"
                :key="s.key"
                class="flex items-center justify-between gap-3 text-gray-600 leading-6"
              >
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :style="{ background: s.color }"></span>{{ s.name }}
                </span>
                <span class="font-semibold text-gray-900 tabular-nums">{{ s.count }}</span>
              </div>
              <div class="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-gray-100 text-gray-500">
                <span>合计</span>
                <span class="font-bold text-indigo-600 tabular-nums">{{ barHover.total }}</span>
              </div>
            </div>

            <div v-if="!topSources.length" class="py-16 text-center text-sm text-gray-400">暂无信源引用数据</div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-base font-semibold text-gray-900 mb-4">平台引用占比</h3>
          <div class="relative" style="height: 220px;">
            <div class="flex items-center justify-center h-full">
              <svg width="180" height="180" viewBox="0 0 42 42">
                <circle
                  v-for="(seg, i) in donutSegs"
                  :key="i"
                  cx="21" cy="21" r="15.9155"
                  fill="none"
                  :stroke="seg.color"
                  :stroke-width="6"
                  :stroke-dasharray="`${seg.len} ${100 - seg.len}`"
                  :stroke-dashoffset="seg.offset"
                  stroke-linecap="butt"
                />
              </svg>
            </div>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div class="text-2xl font-bold text-gray-900 tabular-nums leading-none">{{ filteredSummary.total_ref_count.toLocaleString() }}</div>
              <div class="text-xs text-gray-400 mt-1">总引用</div>
            </div>
          </div>
          <div class="space-y-1.5 mt-3">
            <div v-for="p in donutLegend" :key="p.key" class="flex items-center gap-2.5 text-sm">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: p.color }"></span>
              <span class="text-gray-600 shrink-0">{{ p.name }}</span>
              <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :style="{ width: p.width, background: p.color }"></div>
              </div>
              <span class="font-semibold text-gray-900 tabular-nums shrink-0 w-10 text-right">{{ p.pct }}%</span>
            </div>
            <div v-if="!donutLegend.length" class="py-4 text-center text-xs text-gray-400">暂无占比数据</div>
          </div>
        </div>
      </div>

      <!-- 明细表 -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-base font-semibold text-gray-900">引用来源明细</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-500">
                <th class="text-left px-6 py-3 font-medium">排名</th>
                <th class="text-left px-6 py-3 font-medium">信源平台</th>
                <th class="px-6 py-3 font-medium">
                  <div class="flex items-center justify-center gap-1.5">
                    <span>豆包媒体权威度</span>
                    <span class="group/authority-tip relative inline-flex">
                      <button type="button" class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-200 hover:text-gray-600">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                      </button>
                      <span class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg group-hover/authority-tip:block">此评价来源于豆包接口。</span>
                    </span>
                  </div>
                </th>
                <th class="text-right px-6 py-3 font-medium">引用次数</th>
                <th class="text-right px-6 py-3 font-medium">文章数</th>
                <th class="text-left px-6 py-3 font-medium">平台分布</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="(s, i) in filteredList" :key="s.canonical_source" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-400 font-medium">{{ i + 1 }}</td>
                <td class="px-6 py-3">
                  <span class="text-gray-900 font-medium">{{ s.canonical_source }}</span>
                  <div v-if="s.domain" class="mt-0.5 text-xs text-gray-400">{{ s.domain }}</div>
                </td>
                <td class="px-6 py-3 text-center">
                  <span v-if="s.auth_info_des" class="text-xs text-gray-500">{{ s.auth_info_des }}</span>
                  <span v-else-if="s.auth_info_level" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-amber-600 bg-amber-50">{{ s.auth_info_level }}</span>
                  <span v-else class="text-xs text-gray-300">--</span>
                </td>
                <td class="px-6 py-3 text-right font-semibold text-gray-900">{{ s.ref_count }}</td>
                <td class="px-6 py-3 text-right text-gray-600">{{ s.article_count }}</td>
                <td class="px-6 py-3">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      v-for="(seg, idx) in platformSegs(s)"
                      :key="idx"
                      class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-white"
                      :style="{ background: seg.color }"
                    >{{ seg.name }}<span class="opacity-80">{{ seg.count }}</span></span>
                    <span v-if="!platformSegs(s).length" class="text-xs text-gray-300">--</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredList.length">
                <td colspan="6" class="px-6 py-10 text-center text-sm text-gray-400">暂无信源引用数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import { lastNDays } from '@/utils/engines';
import DashDateRange from '@/components/DashDateRange.vue';

/** 对标 geo.timus.cn：Tab 顺序 ≠ 图例/堆叠色序 */
const tabPlatforms = [
  { key: 'doubao', name: '豆包', color: '#f59e0b' },
  { key: 'deepseek', name: 'DeepSeek', color: '#6366f1' },
  { key: 'wenxin', name: '文心一言', color: '#ec4899' },
  { key: 'qwen', name: '通义千问', color: '#9333ea' },
  { key: 'yuanbao', name: '元宝', color: '#0ea5e9' },
];
/** 图例 & 堆叠条色序：文心 → 豆包 → DeepSeek → 通义 → 元宝 */
const platforms = [
  { key: 'wenxin', name: '文心一言', color: '#ec4899' },
  { key: 'doubao', name: '豆包', color: '#f59e0b' },
  { key: 'deepseek', name: 'DeepSeek', color: '#6366f1' },
  { key: 'qwen', name: '通义千问', color: '#9333ea' },
  { key: 'yuanbao', name: '元宝', color: '#0ea5e9' },
];

const tab = ref('all');
const list = ref<any[]>([]);
const summary = ref<any>({ total_ref_count: 0, total_sources: 0, platform_breakdown: {} });
const init = lastNDays(7);
const rangeStart = ref(init.start);
const rangeEnd = ref(init.end);
const keyword = ref('');
const loading = ref(false);
const barHover = ref<null | {
  name: string;
  segs: { key: string; name: string; color: string; count: number }[];
  total: number;
  left: number;
  top: number;
}>(null);

const BW = 720;
const BH = 380;
const PAD = { t: 4, r: 40, b: 28, l: 124 };
const BAR_H = 10;
const ROW_GAP = 34.2;

const tabName = computed(() => tabPlatforms.find(p => p.key === tab.value)?.name || '');

const filteredList = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return list.value;
  return list.value.filter((s: any) => (s.canonical_source || '').includes(kw) || (s.domain || '').includes(kw));
});

const filteredSummary = computed(() => {
  const rows = filteredList.value;
  if (!keyword.value.trim()) {
    return {
      total_sources: summary.value.total_sources || rows.length,
      total_ref_count: summary.value.total_ref_count || 0,
      platform_breakdown: summary.value.platform_breakdown || {},
    };
  }
  const bd: Record<string, number> = {};
  let total = 0;
  for (const s of rows) {
    total += s.ref_count || 0;
    for (const [k, v] of Object.entries(s.platforms || {})) {
      bd[k] = (bd[k] || 0) + ((v as any)?.ref_count || 0);
    }
  }
  return { total_sources: rows.length, total_ref_count: total, platform_breakdown: bd };
});

const avgRef = computed(() => {
  const s = filteredSummary.value;
  return s.total_sources ? (s.total_ref_count / s.total_sources).toFixed(1) : '0';
});

const topSources = computed(() => filteredList.value.slice(0, 10));
const maxRef = computed(() => Math.max(1, ...topSources.value.map((s: any) => s.ref_count || 0), 1));

const xTicks = computed(() => {
  const max = maxRef.value;
  const step = niceStep(max);
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.01; v += step) ticks.push(Math.round(v));
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks.slice(0, 6);
});

function niceStep(max: number) {
  if (max <= 10) return 2;
  if (max <= 50) return 10;
  if (max <= 100) return 25;
  if (max <= 200) return 50;
  if (max <= 500) return 100;
  if (max <= 1000) return 200;
  return Math.ceil(max / 4 / 100) * 100;
}

function xOf(v: number) {
  const maxX = xTicks.value[xTicks.value.length - 1] || maxRef.value;
  const plotW = BW - PAD.l - PAD.r;
  return PAD.l + (v / Math.max(maxX, 1)) * plotW;
}
function yOf(i: number) {
  return PAD.t + 12 + i * ROW_GAP;
}

function stackSegs(s: any) {
  const segs = platforms
    .map(p => ({
      key: p.key,
      color: p.color,
      count: (s.platforms?.[p.key]?.ref_count) || 0,
    }))
    .filter(x => x.count > 0);
  let acc = 0;
  return segs.map(x => {
    const x0 = xOf(acc);
    acc += x.count;
    const x1 = xOf(acc);
    return { ...x, x: x0, w: Math.max(0, x1 - x0) };
  });
}

function platformSegs(s: any) {
  return platforms
    .map(p => ({
      name: p.name,
      color: p.color,
      count: (s.platforms?.[p.key]?.ref_count) || 0,
    }))
    .filter(x => x.count > 0);
}

function truncate(s: string, n: number) {
  const t = String(s || '');
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

function onBarMove(ev: MouseEvent, row: any) {
  const host = (ev.currentTarget as SVGElement)?.ownerSVGElement?.parentElement;
  if (!host) return;
  const rect = host.getBoundingClientRect();
  const segs = platforms
    .map(p => ({
      key: p.key,
      name: p.name,
      color: p.color,
      count: (row.platforms?.[p.key]?.ref_count) || 0,
    }))
    .filter(x => x.count > 0);
  barHover.value = {
    name: row.canonical_source,
    segs,
    total: row.ref_count || segs.reduce((a, x) => a + x.count, 0),
    left: Math.min(ev.clientX - rect.left + 12, rect.width - 160),
    top: Math.max(8, ev.clientY - rect.top - 10),
  };
}

const donutData = computed(() => {
  const bd = filteredSummary.value.platform_breakdown || {};
  return platforms.map(p => ({ ...p, value: bd[p.key] || 0 })).filter(x => x.value > 0);
});
const donutTotal = computed(() => donutData.value.reduce((s, x) => s + x.value, 0) || 1);
const donutSegs = computed(() => {
  let acc = 0;
  const total = donutTotal.value;
  return donutData.value.map(x => {
    const len = (x.value / total) * 100;
    const seg = { color: x.color, len, offset: 100 - acc - len + 25 };
    acc += len;
    return seg;
  });
});
const donutLegend = computed(() => donutData.value.map(x => ({
  ...x,
  pct: Math.round((x.value / donutTotal.value) * 100),
  width: `${Math.max(0, Math.min(100, (x.value / donutTotal.value) * 100))}%`,
})));

function setTab(key: string) {
  tab.value = key;
  reload();
}

async function reload() {
  loading.value = true;
  barHover.value = null;
  try {
    const opts: { platform?: string } = {};
    if (tab.value !== 'all') opts.platform = tab.value;
    const resp: any = await monitorApi.sourceStats(
      rangeStart.value,
      rangeEnd.value,
      1,
      500,
      'industry',
      opts,
    );
    list.value = resp?.list || [];
    summary.value = resp?.summary || { total_ref_count: 0, total_sources: 0, platform_breakdown: {} };
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(reload);
</script>

<style scoped>
.bar-axis { font-size: 11px; fill: #94a3b8; }
.bar-label { font-size: 11px; fill: #4b5563; }
.bar-value { font-size: 11px; fill: #111827; font-weight: 600; }
</style>
