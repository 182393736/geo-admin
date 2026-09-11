<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="flex flex-col gap-6 animate-fade-in max-w-[1600px] mx-auto pb-20">

      <!-- 头部 -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">引用源追溯</h2>
          <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span>追踪 AI 回答中高频引用的信息来源与权重归因</span>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <button class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              导出数据
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
              导入自有文章
            </button>
          </div>
        </div>
      </div>

      <!-- 表格卡片 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible flex flex-col min-h-[600px]">
        <!-- 筛选行 -->
        <div class="flex flex-col border-b border-gray-100">
          <div class="w-full bg-white px-6 py-4 flex flex-wrap gap-x-6 gap-y-4 items-center">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <span>问题:</span>
              </div>
              <div class="relative">
                <button class="flex items-center justify-between gap-2 bg-gray-50 border rounded-xl px-4 py-2 text-xs font-bold text-gray-700 min-w-[200px] max-w-[300px] cursor-pointer hover:border-gray-300 transition-all border-gray-100">
                  <span class="truncate">全部问题</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
            <div class="flex items-center gap-3 relative">
              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <span>AI引擎:</span>
              </div>
              <div class="relative">
                <button class="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[140px]">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background:#6366f1"></span>
                    <span>全部·网页端</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
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
          </div>
          <div class="px-8 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500 font-medium">
                <span class="font-bold text-gray-900 mx-1">全部问题</span>
                <span class="mx-1">·</span>
                <span class="font-bold text-gray-900 mx-1">全部模型·网页端</span>
              </span>
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{{ total }} 个来源</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button :class="['px-3 py-1.5 rounded-md text-xs font-bold transition-all', filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']" @click="filter = 'all'">全部</button>
                <button :class="['px-3 py-1.5 rounded-md text-xs font-bold transition-all', filter === 'own' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']" @click="filter = 'own'">自有文章</button>
              </div>
              <div class="relative group">
                <input v-model="keyword" placeholder="搜索来源名称..." class="bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-10 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500 w-64 transition-all" />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
                <button class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-600 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5v14"/><path d="M5 12h14"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格 -->
        <div class="overflow-x-auto min-h-[400px]">
          <table class="w-full min-w-[1000px] text-left">
            <thead class="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th class="px-8 py-4 w-1/3 cursor-pointer hover:text-gray-600 transition-colors select-none">
                  <div class="flex items-center gap-1"><span>信源平台 (Platform)</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-center cursor-pointer hover:text-gray-600 transition-colors select-none">
                  <div class="flex items-center justify-center gap-1"><span>被引次数</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <span>豆包媒体权威度</span>
                    <span class="group/authority-tip relative inline-flex">
                      <button class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                      </button>
                      <span class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-white shadow-lg group-hover/authority-tip:block">此评价来源于豆包接口。</span>
                    </span>
                  </div>
                </th>
                <th class="px-6 py-4 text-center">覆盖模型</th>
                <th class="px-6 py-4 text-center">发稿通道</th>
                <th class="px-6 py-4 text-center">分析</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="s in filteredList" :key="s.canonical_source" class="group transition-all cursor-pointer hover:bg-gray-50/50">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="text-gray-400 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <div class="text-sm font-extrabold text-gray-800">{{ s.canonical_source }}</div>
                        <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">{{ s.article_count }} 篇文章</span>
                      </div>
                      <div class="mt-0.5 text-xs text-gray-400">{{ s.category || '未分类' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <div class="flex flex-col items-center gap-1.5">
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-base font-black text-gray-900">{{ s.ref_count }}</span>
                      <span class="text-[11px] font-semibold text-gray-400">{{ share(s.ref_count) }}</span>
                    </div>
                    <div class="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-500" :style="{ width: shareBar(s.ref_count) }"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <span v-if="s.auth_info_level" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-amber-600 bg-amber-50">{{ s.auth_info_level }}</span>
                  <span v-else-if="s.auth_info_des" class="text-xs text-gray-500">{{ s.auth_info_des }}</span>
                  <span v-else class="text-xs text-gray-300">--</span>
                </td>
                <td class="px-6 py-5 text-center">
                  <div class="flex flex-wrap items-center justify-center gap-1.5">
                    <span v-for="p in platformTags(s)" :key="p.key" class="text-[10px] font-medium px-2 py-1 rounded text-white" :style="{ backgroundColor: p.color }">
                      {{ p.name }}<span class="ml-1 opacity-80">{{ p.count }}</span>
                    </span>
                    <span v-if="!platformTags(s).length" class="text-xs text-gray-300">--</span>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <div class="flex flex-col items-center gap-0.5">
                    <span v-if="s.sell_price != null" class="inline-flex items-center gap-0.5 whitespace-nowrap text-[11px] font-bold text-indigo-600">{{ s.sell_price }} 积分起</span>
                    <span v-else class="text-xs text-gray-300">--</span>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <button title="打开信源分析" class="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-indigo-500 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white disabled:opacity-50">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
                    分析
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredList.length">
                <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-400">暂无信源引用数据（采集或解析尚未产出）</td>
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
import { useRoute } from 'vue-router';
import { monitorApi } from '@/api/modules/monitor';
import { lastNDays } from '@/utils/engines';

// 排名/口碑共用本页：?type=industry（默认，category=industry）/ ?type=brand（category=brand）
const route = useRoute();
const type = computed<'industry' | 'brand'>(() => (route.query.type === 'brand' ? 'brand' : 'industry'));

const PLATFORM_META: Record<string, { name: string; color: string }> = {
  doubao: { name: '豆包', color: '#f59e0b' },
  deepseek: { name: 'DeepSeek', color: '#0ea5e9' },
  wenxin: { name: '文心一言', color: '#ec4899' },
  qwen: { name: '通义千问', color: '#9333ea' },
  yuanbao: { name: '元宝', color: '#6366f1' },
};

const list = ref<any[]>([]);
const summary = ref<any>({ total_ref_count: 0 });
const rangeStart = ref('—');
const rangeEnd = ref('—');
const filter = ref<'all' | 'own'>('all');
const keyword = ref('');

const total = computed(() => summary.value.total_sources ?? list.value.length);

const filteredList = computed(() => {
  let arr = list.value;
  if (filter.value === 'own') arr = arr.filter((s: any) => (s.own_article_count || 0) > 0);
  if (keyword.value.trim()) arr = arr.filter((s: any) => (s.canonical_source || '').includes(keyword.value.trim()));
  return arr;
});

const share = (n: number) => {
  const totalRef = summary.value.total_ref_count || 1;
  return `${((n / totalRef) * 100).toFixed(1)}%`;
};
const shareBar = (n: number) => {
  const totalRef = summary.value.total_ref_count || 1;
  return `${Math.max(0, Math.min(100, (n / totalRef) * 100))}%`;
};
const platformTags = (s: any) =>
  Object.entries(s.platforms || {}).map(([k, v]: any) => ({
    key: k,
    name: PLATFORM_META[k]?.name || k,
    color: PLATFORM_META[k]?.color || '#6b7280',
    count: v?.ref_count || 0,
  }));

onMounted(async () => {
  const { start, end } = lastNDays(7);
  rangeStart.value = start;
  rangeEnd.value = end;
  try {
    const resp: any = await monitorApi.sourceStats(start, end, 1, 100, type.value);
    list.value = resp?.list || [];
    summary.value = resp?.summary || summary.value;
  } catch { list.value = []; }
});
</script>
