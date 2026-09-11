<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="flex flex-col gap-8 animate-fade-in max-w-[1600px] mx-auto pb-20">

      <!-- 头部 -->
      <div class="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">搜索快照下载</h2>
          <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span>预览 AI 回答，并下载不同模型中的搜索结果快照或回答 Excel</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button title="最多导出连续 7 天" class="px-5 py-2.5 bg-white text-gray-700 font-bold text-sm rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            导出回答 Excel
          </button>
          <button class="px-5 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            批量导出快照
          </button>
        </div>
      </div>

      <!-- 卡片 -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div class="flex flex-col border-b border-gray-100 bg-white">
          <div class="w-full px-6 py-4">
            <div class="flex items-center gap-5 flex-wrap">
              <div class="flex items-center gap-1.5 px-0 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none justify-start">
                <span>问题:</span>
              </div>
              <div class="relative w-[240px]">
                <button class="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors">
                  <span class="truncate font-medium text-gray-700">{{ queryLabel }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
              <span class="text-xs text-gray-400 shrink-0">共 {{ topics.length }} 个问题</span>
              <div class="flex items-center gap-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                  <span>平台:</span>
                </div>
                <div class="relative w-[190px]">
                  <button class="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors">
                    <span class="truncate font-medium text-gray-700">全部平台</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                  <span>日期:</span>
                </div>
                <input v-model="date" type="date" @change="load" class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all shadow-sm outline-none" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 overflow-auto relative min-h-[300px]">
          <table class="w-full table-fixed text-left">
            <thead class="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-white z-10">
              <tr>
                <th class="w-[42%] px-6 py-4">文件名称</th>
                <th class="w-[110px] px-6 py-4">排行值</th>
                <th class="w-[110px] px-6 py-4">文件大小</th>
                <th class="w-[140px] px-6 py-4">AI 回答</th>
                <th class="w-[180px] px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="s in list" :key="s.id" class="hover:bg-gray-50/50 transition-colors group">
                <td class="min-w-0 px-6 py-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="shrink-0 p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                    <div class="flex min-w-0 flex-col">
                      <span class="block truncate text-sm font-bold text-gray-900">{{ fileName(s) }}</span>
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="text-sm font-extrabold text-gray-700">{{ platformName(s.platform) }}</span>
                        <span class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-extrabold border-blue-200 bg-blue-50 text-blue-700">网页端</span>
                        <span class="text-sm font-medium text-gray-500">{{ s.exec_date }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">未提及</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ s.size || '—' }}</td>
                <td class="px-6 py-4">
                  <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    查看回答
                  </button>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="text-gray-600 hover:text-indigo-600 text-sm font-bold px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      预览
                    </button>
                    <button class="text-indigo-600 hover:text-indigo-800 text-sm font-bold px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                      下载
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!list.length">
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-400">暂无快照记录（截图快照上传功能暂未开放）</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';

const PLATFORM_NAME: Record<string, string> = {
  doubao: '豆包', deepseek: 'DeepSeek', wenxin: '文心一言', qwen: '通义千问', yuanbao: '元宝',
};
const PLATFORM_PREFIX: Record<string, string> = {
  doubao: 'Doubao', deepseek: 'Deepseek', wenxin: 'Wenxin', qwen: 'Qwen', yuanbao: 'Yuanbao',
};

const topics = ref<any[]>([]);
const list = ref<any[]>([]);
const queryId = ref(0);
const queryLabel = ref('全部问题');
const date = ref('');

const platformName = (p: string) => PLATFORM_NAME[p] || p;
const fileName = (s: any) => `${PLATFORM_PREFIX[s.platform] || s.platform}_${queryLabel.value.replace(/[，。]/g, '')}_${String(s.id).slice(-8)}.jpg`;

async function load() {
  try {
    const resp: any = await monitorApi.snapshotList(date.value, queryId.value, 1);
    list.value = resp?.list || [];
  } catch { list.value = []; }
}

onMounted(async () => {
  const d = new Date();
  date.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  try {
    const t: any = await monitorApi.siTopics();
    topics.value = Array.isArray(t) ? t : [];
    if (topics.value.length) {
      queryLabel.value = topics.value[0].name || '全部问题';
      queryId.value = topics.value[0].query_id || 0;
    }
  } catch { topics.value = []; }
  await load();
});
</script>
