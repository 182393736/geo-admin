<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="space-y-6">

      <!-- 头部 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">信源平台偏好</h1>
          <p class="text-sm text-gray-500 mt-1">分析各 AI 平台收录引用的来源偏好，洞察内容分发策略</p>
        </div>
      </div>

      <!-- 筛选行 -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-3 relative">
          <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
            <span>日期:</span>
          </div>
          <div class="relative">
            <button class="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[200px]">
              <div class="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                <span>{{ rangeStart }}</span><span class="text-gray-300">-</span><span>{{ rangeEnd }}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button :class="['px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1', tab === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50']" @click="tab = 'all'">全部平台</button>
          <button v-for="p in platforms" :key="p.key" :class="['px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1', tab === p.key ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50']" @click="tab = p.key">{{ p.name }}</button>
        </div>
        <div class="relative">
          <input placeholder="搜索信源..." class="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
        </div>
      </div>

      <!-- KPI 指标 -->
      <div class="grid grid-cols-3 gap-4">
        <div class="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          </div>
          <div class="min-w-0">
            <div class="text-sm text-gray-500 mb-0.5">引用来源数</div>
            <div class="text-2xl font-bold text-gray-900 tabular-nums">{{ summary.total_sources }}</div>
          </div>
        </div>
        <div class="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-amber-100 transition-all">
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          </div>
          <div class="min-w-0">
            <div class="text-sm text-gray-500 mb-0.5">总引用次数</div>
            <div class="text-2xl font-bold text-gray-900 tabular-nums">{{ summary.total_ref_count.toLocaleString() }}</div>
          </div>
        </div>
        <div class="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-emerald-100 transition-all">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
          </div>
          <div class="min-w-0">
            <div class="text-sm text-gray-500 mb-0.5">平均引用次数</div>
            <div class="text-2xl font-bold text-gray-900 tabular-nums">{{ avgRef }}</div>
          </div>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 class="text-base font-semibold text-gray-900">TOP10 信源平台</h3>
            <div class="flex items-center gap-x-3 gap-y-1 flex-wrap">
              <div v-for="p in platforms" :key="p.key" class="flex items-center gap-1.5 text-xs text-gray-500">
                <span class="w-2.5 h-2.5 rounded-sm" :style="{ background: p.color }"></span>{{ p.name }}
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-3 pt-1">
            <div v-for="s in topSources" :key="s.canonical_source" class="flex items-center gap-3">
              <span class="text-xs text-gray-600 w-28 shrink-0 text-right truncate" :title="s.canonical_source">{{ s.canonical_source }}</span>
              <div class="flex-1 h-5 bg-gray-50 rounded flex overflow-hidden">
                <div v-for="(seg, idx) in sourceSegments(s)" :key="idx" :style="{ background: seg.color, width: seg.width }" class="h-full"></div>
              </div>
              <span class="text-xs font-semibold text-gray-900 w-8 text-right shrink-0 tabular-nums">{{ s.ref_count }}</span>
            </div>
            <div v-if="!topSources.length" class="py-10 text-center text-sm text-gray-400">暂无信源引用数据</div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-base font-semibold text-gray-900 mb-4">平台引用占比</h3>
          <div class="relative">
            <div class="flex items-center justify-center">
              <svg width="160" height="160" viewBox="0 0 42 42">
                <circle v-for="(seg, i) in donutSegs" :key="i" cx="21" cy="21" r="15.9155" fill="none"
                  :stroke="seg.color" :stroke-width="6" :stroke-dasharray="`${seg.len} ${100 - seg.len}`"
                  :stroke-dashoffset="seg.offset" stroke-linecap="butt" />
              </svg>
            </div>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div class="text-2xl font-bold text-gray-900 tabular-nums leading-none">{{ summary.total_ref_count.toLocaleString() }}</div>
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
                      <button class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-200 hover:text-gray-600">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
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
              <tr v-for="(s, i) in list" :key="s.canonical_source" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-400 font-medium">{{ i + 1 }}</td>
                <td class="px-6 py-3">
                  <span class="text-gray-900 font-medium">{{ s.canonical_source }}</span>
                  <div v-if="s.domain" class="mt-0.5 text-xs text-gray-400">{{ s.domain }}</div>
                </td>
                <td class="px-6 py-3 text-center">
                  <span v-if="s.auth_info_level" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-amber-600 bg-amber-50">{{ s.auth_info_level }}</span>
                  <span v-else-if="s.auth_info_des" class="text-xs text-gray-500">{{ s.auth_info_des }}</span>
                  <span v-else class="text-xs text-gray-300">--</span>
                </td>
                <td class="px-6 py-3 text-right font-semibold text-gray-900">{{ s.ref_count }}</td>
                <td class="px-6 py-3 text-right text-gray-600">{{ s.article_count }}</td>
                <td class="px-6 py-3">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span v-for="(seg, idx) in platformSegs(s)" :key="idx" class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-white" :style="{ background: seg.color }">
                      {{ seg.name }}<span class="opacity-80">{{ seg.count }}</span>
                    </span>
                    <span v-if="!platformSegs(s).length" class="text-xs text-gray-300">--</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!list.length">
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

const platforms = [
  { key: 'doubao', name: '豆包', color: '#f59e0b' },
  { key: 'deepseek', name: 'DeepSeek', color: '#0ea5e9' },
  { key: 'wenxin', name: '文心一言', color: '#ec4899' },
  { key: 'qwen', name: '通义千问', color: '#9333ea' },
  { key: 'yuanbao', name: '元宝', color: '#6366f1' },
];

const tab = ref('all');
const list = ref<any[]>([]);
const summary = ref<any>({ total_ref_count: 0, total_sources: 0, platform_breakdown: {} });
const rangeStart = ref('—');
const rangeEnd = ref('—');

const topSources = computed(() => list.value.slice(0, 10));
const avgRef = computed(() => (summary.value.total_sources ? (summary.value.total_ref_count / summary.value.total_sources).toFixed(1) : '0'));

const maxRef = computed(() => Math.max(1, ...topSources.value.map((s: any) => s.ref_count || 0)));
const sourceSegments = (s: any) => {
  const segs = Object.entries(s.platforms || {}).map(([k, v]: any) => ({
    color: platforms.find(p => p.key === k)?.color || '#d1d5db',
    count: v?.ref_count || 0,
  })).filter(x => x.count > 0);
  if (!segs.length) return [{ color: '#e5e7eb', width: '100%' }];
  const total = segs.reduce((sum, x) => sum + x.count, 0);
  return segs.map(x => ({ ...x, width: `${(x.count / total) * 100}%` }));
};

const platformSegs = (s: any) =>
  Object.entries(s.platforms || {}).map(([k, v]: any) => ({
    name: platforms.find(p => p.key === k)?.name || k,
    color: platforms.find(p => p.key === k)?.color || '#6b7280',
    count: v?.ref_count || 0,
  })).filter(x => x.count > 0);

const donutData = computed(() => {
  const bd = summary.value.platform_breakdown || {};
  const entries = platforms.map(p => ({ ...p, value: bd[p.key] || 0 })).filter(x => x.value > 0);
  return entries;
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

onMounted(async () => {
  const { start, end } = lastNDays(7);
  rangeStart.value = start;
  rangeEnd.value = end;
  try {
    const resp: any = await monitorApi.sourceStats(start, end, 1, 100);
    list.value = resp?.list || [];
    summary.value = resp?.summary || summary.value;
  } catch { list.value = []; }
});
</script>
