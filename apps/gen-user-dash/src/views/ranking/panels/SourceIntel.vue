<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="space-y-6 pb-12">

      <!-- 头部 -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-xl font-extrabold text-gray-900 tracking-tight">引用源洞察</h1>
          <p class="text-sm text-gray-500 mt-1">深度拆解 AI 平台的引用源偏好与你的内容被引效果，产出内容分发与优化策略</p>
        </div>
        <div class="relative">
          <button class="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-indigo-300 transition-all shadow-sm">
            <span>{{ rangeStart }} ~ {{ rangeEnd }}</span>
            <span class="text-gray-300 mx-0.5">vs</span>
            <span>{{ cmpStart }} ~ {{ cmpEnd }}</span>
          </button>
        </div>
      </div>

      <!-- 卡片1：Top10 信源每日波动趋势 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">Top10 信源每日波动趋势</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-400 select-none">AI 引擎</span>
            <div class="relative">
              <button class="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-indigo-300 transition-all shadow-sm max-w-[240px]">
                <span class="truncate">全部</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="px-6 py-5">
          <div class="flex flex-col gap-2.5">
            <div v-for="s in topSources" :key="s.canonical_source" class="flex items-center gap-3">
              <span class="text-xs text-gray-600 w-28 shrink-0 text-right truncate" :title="s.canonical_source">{{ s.canonical_source }}</span>
              <div class="flex-1 h-4 bg-gray-50 rounded overflow-hidden">
                <div class="h-full rounded bg-indigo-400" :style="{ width: barW(s.ref_count) }"></div>
              </div>
              <span class="text-xs font-semibold text-gray-800 w-10 text-right shrink-0 tabular-nums">{{ s.ref_count }}</span>
            </div>
            <div v-if="!topSources.length" class="py-10 text-center text-sm text-gray-400">暂无信源波动数据</div>
          </div>
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <button v-for="(s, i) in topSources" :key="s.canonical_source" class="flex items-center gap-1.5 text-xs font-medium transition-opacity opacity-100">
              <span class="w-3 h-[3px] rounded-full" :style="{ background: palette[i % palette.length] }"></span>
              <span class="text-gray-700 max-w-[140px] truncate">{{ s.canonical_source }}</span>
              <span class="text-gray-400">{{ s.ref_count }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 卡片2：AI 引擎信源偏好 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span class="text-base font-bold text-gray-900">AI 引擎信源偏好</span>
        </div>
        <div class="mx-6 mt-4 px-4 py-3 bg-indigo-50 rounded-xl">
          <p v-if="insight" class="text-[13px] text-indigo-800 leading-relaxed">
            <span class="font-bold">{{ insight.source }}</span> 是当前被 AI 引擎引用最多的信源平台（共
            <span class="font-bold">{{ insight.total }}</span> 次），其中
            <span class="font-bold">{{ insight.platform }}</span> 对它的引用最为集中（{{ insight.count }} 次）。建议优先在该平台布局高质量内容。
          </p>
          <p v-else class="text-[13px] text-indigo-800 leading-relaxed">暂无引用数据，完成采集解析后即可生成信源偏好洞察。</p>
        </div>
        <div class="px-5 py-4 overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="sticky left-0 z-20 bg-white text-left text-[11.5px] font-semibold text-gray-400 px-2 py-2 w-10">#</th>
                <th class="sticky left-10 z-20 bg-white text-left text-[11.5px] font-semibold text-gray-400 px-2 py-2 whitespace-nowrap">信源平台</th>
                <th v-for="p in platforms" :key="p.key" class="text-center text-[11.5px] font-semibold px-2 py-2 whitespace-nowrap cursor-pointer select-none transition-colors text-gray-400 hover:text-gray-600">
                  <span class="inline-flex items-center gap-0.5">{{ p.name }}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </span>
                </th>
                <th class="text-right text-[11.5px] font-semibold px-2 py-2 whitespace-nowrap min-w-[140px] cursor-pointer select-none transition-colors text-indigo-600">
                  <span class="inline-flex items-center gap-0.5 justify-end">合计
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in prefRows" :key="s.canonical_source" class="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-2 py-2.5">
                  <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold', i === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700']">{{ i + 1 }}</div>
                </td>
                <td class="sticky left-10 z-10 bg-white group-hover:bg-gray-50 px-2 py-2.5 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="text-[13px] font-semibold text-gray-900">{{ s.canonical_source }}</span>
                    <span v-if="i === 0" class="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">首选</span>
                  </div>
                </td>
                <td v-for="p in platforms" :key="p.key" class="text-center px-1 py-2.5">
                  <div class="inline-flex flex-col items-center justify-center w-12 h-10 rounded-md text-gray-800">
                    <span class="text-[12.5px] font-mono font-semibold">{{ s.engines[p.key] ?? 0 }}</span>
                  </div>
                </td>
                <td class="px-2 py-2.5">
                  <div class="flex items-center gap-2 justify-end">
                    <div class="w-20 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-500 rounded-full transition-all" :style="{ width: barW(s.ref_count) }"></div>
                    </div>
                    <span class="text-[13px] font-bold text-gray-800 w-8 text-right">{{ s.ref_count }}</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!prefRows.length">
                <td :colspan="2 + platforms.length + 1" class="px-2 py-10 text-center text-sm text-gray-400">暂无信源偏好数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 pb-4 text-[11.5px] text-gray-400">颜色越深代表该引擎从该平台引用越多 | 右侧条形图为各引擎总引用次数</div>
      </div>

      <!-- 卡片3：自有内容收录趋势 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">自有内容收录趋势</span>
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-gray-400 select-none">AI 引擎</span>
              <div class="relative">
                <button class="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-indigo-300 transition-all shadow-sm max-w-[240px]">
                  <span class="truncate">综合</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-gray-400 select-none">统计维度</span>
              <div class="flex bg-gray-100 rounded-lg p-0.5">
                <button :class="['px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all', dim === 'rate' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700']" @click="dim = 'rate'">收录率</button>
                <button :class="['px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all', dim === 'count' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700']" @click="dim = 'count'">收录量</button>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 pb-5 grid grid-cols-1 md:grid-cols-[0.8fr_2.4fr] gap-6 items-center">
          <div class="flex flex-col gap-5">
            <div>
              <div class="text-xs text-gray-400 mb-1">本期自有被引</div>
              <div class="text-2xl font-extrabold text-gray-900">
                {{ ownTotal }}<span class="text-sm font-medium text-gray-400"> 次</span>
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">收录率（自有占比）</div>
              <div class="text-2xl font-extrabold text-gray-900">
                {{ ownRate }}<span class="text-sm font-medium text-gray-400"> %</span>
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">收录篇数</div>
              <div class="text-2xl font-extrabold text-gray-900">
                {{ ownTotal }}<span class="text-sm font-medium text-gray-400"> 篇</span>
              </div>
            </div>
          </div>
          <div class="border border-gray-100 rounded-xl bg-gray-50/50 p-4">
            <SparkLine v-if="ownPoints.length > 1" :points="ownPoints" :labels="ownLabels" color="#059669" height="180" :digits="0" />
            <div v-else class="h-[180px] flex items-center justify-center text-sm text-gray-400">暂无自有内容趋势</div>
            <div class="mt-2 text-center text-xs text-gray-500">
              最新收录率 <span class="font-bold text-emerald-700">{{ ownRate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 卡片4：引用源透视 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">引用源透视</span>
          </div>
          <button class="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors disabled:opacity-60">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            导出
          </button>
        </div>
        <div class="px-6 pt-4 flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-400 select-none">问题</span>
            <div class="relative">
              <button class="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-indigo-300 transition-all shadow-sm max-w-[240px]">
                <span class="truncate">全部</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2 ml-auto">
            <div class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
              <input placeholder="搜索信源名称" class="text-[13px] text-gray-700 placeholder-gray-400 outline-none bg-transparent w-36" />
            </div>
          </div>
        </div>
        <div class="px-6 pt-3 pb-2 flex items-center gap-4 flex-wrap">
          <div class="flex bg-gray-100 rounded-lg p-0.5">
            <button class="px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all bg-white text-indigo-700 shadow-sm">信源平台</button>
            <button class="px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all text-gray-500 hover:text-gray-700">引用文章</button>
            <button class="px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all text-gray-500 hover:text-gray-700">自有文章</button>
          </div>
          <div class="flex bg-gray-100 rounded-lg p-0.5">
            <button class="px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all bg-white text-indigo-700 shadow-sm">全部</button>
            <button class="px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all text-gray-500 hover:text-gray-700">本期新增</button>
            <button class="px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all text-gray-500 hover:text-gray-700">持续被引</button>
            <button class="px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all text-gray-500 hover:text-gray-700">本期流失</button>
          </div>
        </div>
        <div class="px-5 pb-2 overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="sticky left-0 z-20 bg-white text-left text-[11.5px] font-semibold text-gray-400 px-2 py-2.5 w-10">排名</th>
                <th class="sticky left-10 z-20 bg-white text-left text-[11.5px] font-semibold text-gray-400 px-2 py-2.5 whitespace-nowrap">名称</th>
                <th class="text-center text-[11.5px] font-semibold text-gray-400 px-2 py-2.5">状态</th>
                <th v-for="p in platforms" :key="p.key" class="text-center text-[11.5px] font-semibold px-2 py-2.5 whitespace-nowrap text-gray-400">{{ p.name }}</th>
                <th class="text-center text-[11.5px] font-semibold px-2 py-2.5 cursor-pointer text-indigo-600">合计</th>
                <th class="text-center text-[11.5px] font-semibold text-gray-400 px-2 py-2.5 whitespace-nowrap">较上期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in perspectiveRows" :key="s.canonical_source" class="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-2 py-3">
                  <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold', i === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700']">{{ i + 1 }}</div>
                </td>
                <td class="sticky left-10 z-10 bg-white group-hover:bg-gray-50 px-2 py-3 text-[13px] font-semibold whitespace-nowrap max-w-[200px] truncate">
                  <span class="text-gray-900">{{ s.canonical_source }}</span>
                </td>
                <td class="px-2 py-3 text-center">
                  <span class="inline-flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span class="text-[11px] font-medium text-blue-600">持续被引</span>
                  </span>
                </td>
                <td v-for="p in platforms" :key="p.key" class="text-center px-2 py-3 text-[12.5px] font-mono text-gray-700">{{ s.engines[p.key] ?? 0 }}</td>
                <td class="text-center px-2 py-3 text-[13px] font-bold text-gray-900">{{ s.ref_count }}</td>
                <td class="text-center px-2 py-3"><span class="text-[11.5px] font-semibold text-gray-300">—</span></td>
              </tr>
              <tr v-if="!perspectiveRows.length">
                <td :colspan="4 + platforms.length" class="px-2 py-10 text-center text-sm text-gray-400">暂无引用源透视数据</td>
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
import SparkLine from '@/components/SparkLine.vue';
import { lastNDays, fmtDate } from '@/utils/engines';

// 对标 geoapi.timus.cn：5 家引擎（顺序 doubao/wenxin/deepseek/qwen/yuanbao）
const platforms = [
  { key: 'doubao', name: '豆包' },
  { key: 'wenxin', name: '文心一言' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'qwen', name: '通义千问' },
  { key: 'yuanbao', name: '元宝' },
];

const palette = ['#6366f1', '#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#9333ea', '#ef4444', '#84cc16', '#06b6d4', '#f43f5e'];

const rangeStart = ref('');
const rangeEnd = ref('');
const cmpStart = ref('');
const cmpEnd = ref('');
const dim = ref<'rate' | 'count'>('rate');

const topSources = ref<any[]>([]);
const statsList = ref<any[]>([]);
const summary = ref<any>({ total_ref_count: 0, platform_breakdown: {} });
const ownCur = ref<Record<string, number>>({});
const ownSummary = ref<any>({});
const perspList = ref<any[]>([]);
const prefSources = ref<any[]>([]);

const maxRef = computed(() => Math.max(1, ...statsList.value.map((s: any) => s.ref_count || 0)));
const barW = (v: number) => `${Math.max(0, Math.min(100, (v / maxRef.value) * 100))}%`;

/* engines 归一：{engine:{cur,cmp,chg}} → {engine: cur} */
const normEngines = (eng: any) =>
  Object.fromEntries(Object.entries(eng || {}).map(([k, v]: any) => [k, (v && typeof v === 'object') ? (v.cur ?? 0) : v]));

const prefRows = computed(() => prefSources.value.slice(0, 15));

const perspectiveRows = computed(() =>
  (perspList.value.length ? perspList.value : statsList.value.map(s => ({
    canonical_source: s.canonical_source, ref_count: s.ref_count, engines: normEngines(s.platforms),
  }))).map(s => ({ ...s, engines: normEngines(s.engines) })),
);

const ownTotal = computed(() => (Object.values(ownCur.value) as number[]).reduce((s, n) => s + (Number(n) || 0), 0));
const ownRate = computed(() => {
  if (ownSummary.value && ownSummary.value.rate_now != null) return ownSummary.value.rate_now;
  const totalRef = summary.value.total_ref_count || 0;
  return totalRef ? ((ownTotal.value / totalRef) * 100).toFixed(1) : '0.0';
});
const ownDates = computed(() => Object.keys(ownCur.value).sort());
const ownPoints = computed(() => ownDates.value.map(d => Number(ownCur.value[d]) || 0));
const ownLabels = computed(() => ownDates.value.map(d => fmtDate(d)));

const insight = computed(() => {
  const top = statsList.value[0];
  const bd = summary.value.platform_breakdown || {};
  const topPlat = Object.entries(bd).sort((a: any, b: any) => b[1] - a[1])[0];
  if (!top) return null;
  const name = topPlat ? (platforms.find(p => p.key === topPlat[0])?.name || topPlat[0]) : '';
  const count = topPlat ? (top.platforms?.[topPlat[0]]?.ref_count || 0) : 0;
  return { source: top.canonical_source, total: top.ref_count, platform: name, count };
});

onMounted(async () => {
  const { start, end } = lastNDays(7);
  rangeStart.value = start;
  rangeEnd.value = end;
  const c = new Date();
  c.setDate(c.getDate() - 7);
  const ce = new Date(c); ce.setDate(ce.getDate() + 6);
  const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  cmpStart.value = f(c); cmpEnd.value = f(ce);
  try {
    const [trend, stats, own, persp, pref] = await Promise.all([
      monitorApi.siSourceTrend(start, end),
      monitorApi.sourceStats(start, end, 1, 50),
      monitorApi.siOwnTrend(start, end, cmpStart.value, cmpEnd.value),
      monitorApi.siPerspective(start, end, cmpStart.value, cmpEnd.value),
      monitorApi.siEnginePreference(start, end, cmpStart.value, cmpEnd.value),
    ]);
    // 对标 source_trend：{dates, sources:[{name,total,series}]}
    topSources.value = ((trend as any)?.sources || []).map((s: any) => ({
      canonical_source: s.name, ref_count: s.total, total: s.total, series: s.series || [],
    }));
    statsList.value = (stats as any)?.list || [];
    summary.value = (stats as any)?.summary || summary.value;
    // 对标 own_trend：{trend:[{date,own_count,total_count,rate}], summary}
    ownSummary.value = (own as any)?.summary || {};
    ownCur.value = Object.fromEntries(((own as any)?.trend || []).map((t: any) => [t.date, t.own_count]));
    // 对标 perspective：{list:[{name,cur_total,cmp_total,change,change_pct,status,tag,engines,own_rate}]}
    perspList.value = ((persp as any)?.list || []).map((s: any) => ({
      canonical_source: s.name, ref_count: s.cur_total,
      change: s.change, change_pct: s.change_pct, status: s.status, tag: s.tag,
      engines: normEngines(s.engines),
    }));
    // 对标 engine_preference：{sources:[{canonical_source,category,engines,cur_total,cmp_total,chg_total}]}
    prefSources.value = ((pref as any)?.sources || []).map((s: any) => ({
      canonical_source: s.canonical_source, ref_count: s.cur_total,
      engines: normEngines(s.engines),
    }));
  } catch { /* 空态 */ }
});
</script>
