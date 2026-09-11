<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="flex flex-col gap-6 animate-fade-in max-w-[1600px] mx-auto pb-20 min-w-0 overflow-x-hidden">

      <!-- 头部 -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">AI 竞品透视</h2>
          <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span>基于 AI 搜索排名数据的竞品分析与对比</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-3">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
              <span>周期:</span>
            </div>
            <span class="text-xs text-gray-400">开始</span>
            <input type="date" class="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all shadow-sm" />
            <span class="text-xs text-gray-400">至</span>
            <span class="text-xs text-gray-400">结束</span>
            <input type="date" class="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all shadow-sm" />
            <button class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">查询</button>
          </div>
          <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            刷新
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            导出 Excel
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
            修正品牌名
          </button>
        </div>
      </div>

      <!-- KPI 指标 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <div class="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            竞品总数
          </div>
          <div class="text-2xl font-extrabold text-gray-900">{{ kpi.total }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <div class="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            监控问题
          </div>
          <div class="text-2xl font-extrabold text-gray-900">{{ kpi.queries }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <div class="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M17 3H7v4h10z"/><path d="M17 5h3v4h-3z"/><path d="M7 5H4v4h3z"/></svg>
            最强竞品
          </div>
          <div class="text-lg font-extrabold text-gray-900 truncate">{{ kpi.top.name }}</div>
          <div class="text-xs text-gray-400 mt-0.5">出现 {{ kpi.top.frequency }} 次 · 提及率 {{ kpi.top.mention_rate }}% · Top3 {{ kpi.top.top3_mention_rate }}%</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <div class="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            最高 Top3 推荐率
          </div>
          <div class="text-2xl font-extrabold text-indigo-600">{{ kpi.top.top3_mention_rate }}%</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ kpi.top.name }} · 综合 Top3 推荐率</div>
        </div>
      </div>

      <!-- 竞品排行表格 -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
          竞品排行
        </h3>
        <div class="overflow-y-auto overflow-x-hidden border border-gray-100 rounded-xl">
          <table class="w-full text-sm table-fixed">
            <thead class="sticky top-0 bg-gray-50/95 z-10">
              <tr class="border-b border-gray-100">
                <th class="text-left py-3 px-4 text-gray-500 font-semibold text-xs w-[6%]">序号</th>
                <th class="text-left py-3 px-4 text-gray-500 font-semibold text-xs w-[24%]">竞品名称</th>
                <th class="text-left py-3 px-4 text-gray-500 font-semibold text-xs w-[24%]">频次条</th>
                <th class="text-center py-3 px-2 text-gray-500 font-semibold text-xs w-[10%]">出现次数</th>
                <th class="text-center py-3 px-2 text-gray-500 font-semibold text-xs w-[11%]">
                  <button class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">提及率
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </button>
                </th>
                <th class="text-center py-3 px-2 text-gray-500 font-semibold text-xs w-[13%]">
                  <button class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">Top3推荐率
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </button>
                </th>
                <th class="text-center py-3 px-2 text-gray-500 font-semibold text-xs w-[12%]">
                  <button class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">首位推荐率
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in rows" :key="c.name + i" class="border-b border-gray-50 last:border-b-0 transition-colors hover:bg-slate-50/60">
                <td class="py-3 px-4">
                  <span :class="['inline-flex w-5 h-5 rounded-full text-[10px] font-bold items-center justify-center text-white', rankColor(i + 1)]">{{ i + 1 }}</span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-[14px] font-semibold truncate text-gray-900">{{ c.name }}</span>
                    <span v-if="c.is_target" class="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded shrink-0">本品牌</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div class="h-full rounded-full" :style="{ width: barW(c.frequency), background: freqColor(c) }"></div>
                  </div>
                </td>
                <td class="text-center py-3 px-2 font-bold text-gray-800">{{ c.frequency }}</td>
                <td class="text-center py-3 px-2 text-xs font-bold text-indigo-600">{{ c.mention_rate }}%</td>
                <td class="text-center py-3 px-2 text-xs font-bold text-violet-600">{{ c.top3_mention_rate }}%</td>
                <td class="text-center py-3 px-2 text-xs font-bold text-amber-600">{{ c.first_mention_rate }}%</td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="7" class="py-10 text-center text-sm text-gray-400">暂无竞品数据（采集或解析尚未产出）</td>
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

const list = ref<any[]>([]);
const rows = computed(() => list.value);

const maxFreq = computed(() => Math.max(1, ...list.value.map((c: any) => c.frequency || 0)));

const kpi = computed(() => {
  const total = list.value.length;
  const queries = new Set(list.value.map((c: any) => c.keyword_count)).size || list.value.length;
  const top = list.value[0] || { name: '—', frequency: 0, mention_rate: 0, top3_mention_rate: 0 };
  return { total, queries, top };
});

const barW = (v: number) => `${Math.max(0, Math.min(100, (v / maxFreq.value) * 100))}%`;
const freqColor = (c: any) => (c.is_target ? '#6366f1' : '#4f46e5');
const rankColor = (i: number) => {
  if (i === 1) return 'bg-gradient-to-br from-yellow-400 to-orange-400';
  if (i === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400';
  if (i === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700';
  return 'bg-gray-300';
};

onMounted(async () => {
  try {
    const resp: any = await monitorApi.competitorInsight();
    list.value = resp?.list || [];
  } catch { list.value = []; }
});
</script>
