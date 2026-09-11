<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="flex flex-col gap-6 animate-fade-in max-w-[1600px] mx-auto pb-24 relative">

      <!-- 头部 -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
        <div>
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">监控问题管理</h2>
          <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span>配置实际发送给 AI 的监控问题。</span>
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <div class="flex items-stretch bg-white border border-gray-100 rounded-xl shadow-sm">
            <div class="px-5 py-2.5 flex flex-col justify-center border-r border-gray-100 relative group cursor-help bg-gradient-to-b from-white to-gray-50 rounded-l-xl">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">总占用 · 全部分类</span>
              </div>
              <span class="text-xl font-extrabold leading-none text-gray-900">
                {{ totalUsed }}<span class="text-xs text-gray-400 font-normal"> / {{ totalLimit }}</span>
              </span>
            </div>
            <div class="px-5 py-2.5 flex flex-col justify-center border-r border-gray-100 relative group cursor-help bg-white">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">本页 · 排名词</span>
              </div>
              <span class="text-xl font-extrabold leading-none text-indigo-600">
                {{ rankCount }}<span class="text-xs text-gray-400 font-normal">个</span>
              </span>
            </div>
            <div class="px-5 py-2.5 flex flex-col justify-center border-r border-gray-100 bg-white">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">待释放</span>
              </div>
              <span class="text-xl font-extrabold leading-none text-amber-600">
                0<span class="text-xs text-gray-400 font-normal">个</span>
              </span>
            </div>
            <button class="px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-l border-indigo-100 transition-colors flex flex-col items-center justify-center gap-1 group rounded-r-xl">
              <span class="text-[10px] font-bold">扩容</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 内容卡片 -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">
        <!-- 卡片头 -->
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 group relative cursor-help w-fit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            问题列表 ({{ rankCount }})
          </div>
          <div class="flex items-center gap-3">
            <div class="relative group">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
              <input placeholder="搜索问题..." class="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 w-48 transition-all" />
            </div>
            <button class="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              导出
            </button>
            <button class="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-300 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
              导入问题
            </button>
            <button class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              增加新问题
            </button>
          </div>
        </div>
        <!-- 分组 Tabs -->
        <div class="px-6 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap bg-white">
          <button class="px-3 py-1 rounded-full text-xs font-bold border transition-colors bg-indigo-600 text-white border-indigo-600">全部</button>
          <button class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-colors bg-white text-gray-600 border-gray-200 hover:border-indigo-300">
            未分组 <b class="text-gray-400">{{ rankCount }}</b>
          </button>
          <button class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-dashed border-gray-300 text-gray-500 bg-gray-50 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            新建分组
          </button>
        </div>
        <!-- 表头 -->
        <div class="grid grid-cols-[2fr_6fr_1.6fr_auto_auto_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider select-none items-center">
          <div class="flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors group">监控类型</div>
          <div class="flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors group">问题</div>
          <div class="text-center">分组</div>
          <div class="w-[88px] text-center flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700 transition-colors group">添加时间</div>
          <div class="w-[80px] text-center flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700 transition-colors group">状态</div>
          <div class="w-[68px] text-center">操作</div>
        </div>
        <!-- 行 -->
        <div class="divide-y divide-gray-100 bg-white">
          <div v-for="q in rankQueries" :key="q.id" class="grid grid-cols-[2fr_6fr_1.6fr_auto_auto_auto] gap-4 px-6 py-4 items-start transition-all group relative hover:bg-gray-50/80 cursor-grab active:cursor-grabbing">
            <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors bg-transparent group-hover:bg-indigo-300"></div>
            <div>
              <span class="px-2 py-1 rounded text-xs font-medium border inline-block bg-indigo-50 border-indigo-200 text-indigo-700">{{ q.typeLabel }}</span>
            </div>
            <div class="relative">
              <span class="text-sm font-bold text-gray-900 py-1.5 inline-flex items-center gap-2 flex-wrap">{{ q.content }}</span>
            </div>
            <div class="min-w-0 pt-1">
              <select class="block w-full min-w-0 max-w-full truncate text-xs px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:border-indigo-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <option>{{ q.group }}</option>
              </select>
            </div>
            <div class="w-[88px] flex justify-center pt-2">
              <span class="text-[11px] text-gray-400 whitespace-nowrap">{{ q.date }}</span>
            </div>
            <div class="w-[80px] flex justify-center pt-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600 border border-green-100">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>{{ q.statusLabel }}
              </span>
            </div>
            <div class="w-[68px] flex items-center justify-center gap-1">
              <button class="p-1 rounded transition-colors cursor-pointer text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="编辑问题">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
              </button>
              <button class="p-1 rounded transition-colors cursor-pointer text-gray-300 hover:text-red-500 hover:bg-red-50" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div v-if="!rankQueries.length" class="px-6 py-10 text-center text-sm text-gray-400">暂无监控问题</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import { userApi } from '@/api/modules/user';

const TYPE_LABEL: Record<string, string> = { industry: '排名词', brand: '口碑词' };
const fmtDate = (d: string) => (d || '').slice(0, 10).replace(/-/g, '/');

const rankQueries = ref<{ id: number; typeLabel: string; content: string; group: string; date: string; statusLabel: string }[]>([]);
const totalUsed = ref(0);
const totalLimit = ref(0);

const rankCount = computed(() => rankQueries.value.length);

onMounted(async () => {
  try {
    const [indResp, sub] = await Promise.all([
      monitorApi.queryList('industry').catch(() => null),
      userApi.subscription().catch(() => null),
    ]);
    rankQueries.value = (indResp?.list || []).map(q => ({
      id: q.id,
      typeLabel: TYPE_LABEL[q.query_type] || q.query_type,
      content: q.query,
      group: q.group_id ? String(q.group_id) : '未分组',
      date: fmtDate(q.created_at),
      statusLabel: q.query_status ? '监控中' : '已停用',
    }));
    if (sub) { totalUsed.value = sub.query_count ?? 0; totalLimit.value = sub.query_limit ?? 0; }
  } catch { /* 空态 */ }
});
</script>
