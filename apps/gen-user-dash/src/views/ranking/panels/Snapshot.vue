<template>
  <div class="geo-page">
    <div class="geo-page-header">
      <div class="geo-page-header__text">
        <h1 class="geo-page-title">搜索快照下载</h1>
        <p class="geo-page-desc">预览 AI 回答，并下载不同模型中的搜索结果快照或回答 Excel</p>
      </div>
      <div class="geo-page-header__actions">
        <button
          type="button"
          title="最多导出连续 7 天"
          class="px-5 py-2.5 bg-white text-gray-700 font-bold text-sm rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :disabled="exportingText || !list.length"
          @click="exportAnswersCsv"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
          {{ exportingText ? '导出中…' : '导出回答 Excel' }}
        </button>
        <button
          type="button"
          class="px-5 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :disabled="batchDownloading || !downloadable.length"
          @click="batchDownload"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
          {{ batchDownloading ? `下载中 ${batchDone}/${downloadable.length}` : '批量导出快照' }}
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div class="flex flex-col border-b border-gray-100 bg-white">
          <div class="w-full px-6 py-4">
            <div class="flex items-center gap-5 flex-wrap">
              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <span>问题:</span>
              </div>
              <div class="relative w-[280px]" ref="queryMenuRef">
                <button
                  type="button"
                  class="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                  @click="queryOpen = !queryOpen"
                >
                  <span class="truncate font-medium text-gray-700">{{ queryLabel }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div
                  v-if="queryOpen"
                  class="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50"
                    :class="queryId === 0 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'"
                    @click="selectQuery(0, '全部问题')"
                  >全部问题</button>
                  <button
                    v-for="t in topics"
                    :key="t.query_id"
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 truncate"
                    :class="queryId === t.query_id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'"
                    @click="selectQuery(t.query_id, t.name)"
                  >{{ t.name }}</button>
                </div>
              </div>
              <span class="text-xs text-gray-400 shrink-0">共 {{ topics.length }} 个问题</span>

              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <span>平台:</span>
              </div>
              <div class="relative w-[190px]" ref="platformMenuRef">
                <button
                  type="button"
                  class="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                  @click="platformOpen = !platformOpen"
                >
                  <span class="truncate font-medium text-gray-700">{{ platformLabel }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div
                  v-if="platformOpen"
                  class="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                  <button
                    v-for="p in platformOptions"
                    :key="p.key"
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50"
                    :class="platform === p.key ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'"
                    @click="selectPlatform(p.key)"
                  >{{ p.label }}</button>
                </div>
              </div>

              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <span>日期:</span>
              </div>
              <input
                v-model="date"
                type="date"
                class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all shadow-sm outline-none"
                @change="load"
              />
              <span v-if="loading" class="text-xs text-gray-400">加载中…</span>
              <span v-else class="text-xs text-gray-400">共 {{ total }} 条</span>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                    <div class="flex min-w-0 flex-col">
                      <span class="block truncate text-sm font-bold text-gray-900" :title="fileName(s)">{{ fileName(s) }}</span>
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="text-sm font-extrabold text-gray-700">{{ platformName(s.platform) }}</span>
                        <span class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-extrabold border-blue-200 bg-blue-50 text-blue-700">网页端</span>
                        <span class="text-sm font-medium text-gray-500">{{ s.exec_date }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                    :class="rankClass(s.rank_value)"
                  >{{ s.rank_value || '未提及' }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ s.size_label || '—' }}</td>
                <td class="px-6 py-4">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors disabled:opacity-40"
                    :disabled="!s.has_answer"
                    @click="openAnswer(s)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    查看回答
                  </button>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="text-gray-600 hover:text-indigo-600 text-sm font-bold px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
                      :disabled="!s.photo_url"
                      @click="openPreview(s)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      预览
                    </button>
                    <button
                      type="button"
                      class="text-indigo-600 hover:text-indigo-800 text-sm font-bold px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
                      :disabled="!s.photo_url || downloadingId === s.id"
                      @click="downloadOne(s)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                      {{ downloadingId === s.id ? '…' : '下载' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!loading && !list.length">
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-400">暂无快照记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 预览 -->
    <a-modal
      v-model:visible="previewVisible"
      :title="previewTitle"
      width="920px"
      :footer="false"
      unmount-on-close
    >
      <div class="max-h-[75vh] overflow-auto bg-slate-950 rounded-lg p-3 flex justify-center">
        <img v-if="previewUrl" :src="previewUrl" alt="快照预览" class="max-w-full h-auto bg-white shadow" />
      </div>
      <div class="mt-3 flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
          :disabled="!previewItem?.photo_url"
          @click="previewItem && downloadOne(previewItem)"
        >下载原图</button>
      </div>
    </a-modal>

    <!-- 回答 -->
    <a-modal
      v-model:visible="answerVisible"
      :title="answerTitle"
      width="720px"
      :footer="false"
      unmount-on-close
    >
      <div v-if="answerLoading" class="py-10 text-center text-sm text-gray-400">加载中…</div>
      <div v-else class="space-y-3">
        <div class="text-xs text-gray-500">
          <span class="font-bold text-gray-700">{{ answerMeta.platform }}</span>
          · {{ answerMeta.date }}
          <span v-if="answerMeta.query"> · {{ answerMeta.query }}</span>
        </div>
        <pre class="whitespace-pre-wrap break-words text-sm leading-6 text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-4 max-h-[60vh] overflow-auto">{{ answerText || '暂无回答原文' }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { monitorApi } from '@/api/modules/monitor';
import type { SnapshotItem } from '@/api/types';

const route = useRoute();
const type = computed<'industry' | 'brand'>(() => (route.query.type === 'brand' ? 'brand' : 'industry'));

const PLATFORM_NAME: Record<string, string> = {
  doubao: '豆包', deepseek: 'DeepSeek', wenxin: '文心一言', qwen: '通义千问', yuanbao: '元宝',
};
const PLATFORM_PREFIX: Record<string, string> = {
  doubao: 'Doubao', deepseek: 'Deepseek', wenxin: 'Wenxin', qwen: 'Qwen', yuanbao: 'Yuanbao',
};
const platformOptions = [
  { key: 'all', label: '全部平台' },
  { key: 'doubao', label: '豆包' },
  { key: 'wenxin', label: '文心一言' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'qwen', label: '通义千问' },
  { key: 'yuanbao', label: '元宝' },
];

const topics = ref<{ query_id: number; name: string }[]>([]);
const list = ref<SnapshotItem[]>([]);
const total = ref(0);
const loading = ref(false);
const queryId = ref(0);
const queryLabel = ref('全部问题');
const date = ref('');
const platform = ref('all');
const queryOpen = ref(false);
const platformOpen = ref(false);
const queryMenuRef = ref<HTMLElement | null>(null);
const platformMenuRef = ref<HTMLElement | null>(null);

const previewVisible = ref(false);
const previewUrl = ref('');
const previewTitle = ref('快照预览');
const previewItem = ref<SnapshotItem | null>(null);

const answerVisible = ref(false);
const answerLoading = ref(false);
const answerText = ref('');
const answerTitle = ref('AI 回答');
const answerMeta = ref({ platform: '', date: '', query: '' });

const downloadingId = ref<string | number | null>(null);
const batchDownloading = ref(false);
const batchDone = ref(0);
const exportingText = ref(false);

const platformLabel = computed(
  () => platformOptions.find(p => p.key === platform.value)?.label || '全部平台',
);
const downloadable = computed(() => list.value.filter(s => !!s.photo_url));

const platformName = (p: string) => PLATFORM_NAME[p] || p;

function extFromUrl(url?: string | null) {
  const m = String(url || '').match(/\.(webp|jpg|jpeg|png)(?:\?|$)/i);
  return (m && m[1].toLowerCase()) || 'jpg';
}

function fileName(s: SnapshotItem) {
  const q = String(s.query || queryLabel.value || '问题')
    .replace(/[\\/:*?"<>|，。,\s]+/g, '')
    .slice(0, 40);
  const short = String(s.id || '').replace(/-/g, '').slice(-8) || 'shot';
  return `${PLATFORM_PREFIX[s.platform] || s.platform}_${q || 'query'}_${short}.${extFromUrl(s.photo_url)}`;
}

function rankClass(rank?: string) {
  if (!rank || rank === '未提及' || rank === '未上榜') {
    return 'bg-gray-50 text-gray-500 border-gray-100';
  }
  return 'bg-indigo-50 text-indigo-700 border-indigo-100';
}

function selectQuery(id: number, label: string) {
  queryId.value = id;
  queryLabel.value = label;
  queryOpen.value = false;
  load();
}

function selectPlatform(key: string) {
  platform.value = key;
  platformOpen.value = false;
  load();
}

function onDocClick(e: MouseEvent) {
  const t = e.target as Node;
  if (queryMenuRef.value && !queryMenuRef.value.contains(t)) queryOpen.value = false;
  if (platformMenuRef.value && !platformMenuRef.value.contains(t)) platformOpen.value = false;
}

async function loadTopics() {
  try {
    if (type.value === 'brand') {
      const qs: any = await monitorApi.queryList('brand');
      topics.value = (qs?.list || []).map((q: any) => ({
        query_id: q.id ?? q.query_id,
        name: q.query || q.name,
      }));
    } else {
      const t: any = await monitorApi.siTopics();
      topics.value = Array.isArray(t) ? t : (t?.list || []);
    }
  } catch {
    topics.value = [];
  }
  queryId.value = 0;
  queryLabel.value = '全部问题';
}

async function load() {
  if (!date.value) return;
  loading.value = true;
  try {
    const resp: any = await monitorApi.snapshotList(
      date.value,
      queryId.value,
      1,
      type.value,
      platform.value,
      50,
    );
    list.value = resp?.list || [];
    total.value = resp?.total || list.value.length;
  } catch {
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function openPreview(s: SnapshotItem) {
  if (!s.photo_url) return;
  previewItem.value = s;
  previewUrl.value = s.photo_url;
  previewTitle.value = `预览 · ${platformName(s.platform)} · ${fileName(s)}`;
  previewVisible.value = true;
}

async function openAnswer(s: SnapshotItem) {
  answerVisible.value = true;
  answerLoading.value = true;
  answerText.value = '';
  answerTitle.value = `AI 回答 · ${platformName(s.platform)}`;
  answerMeta.value = {
    platform: platformName(s.platform),
    date: s.exec_date || '',
    query: s.query || '',
  };
  try {
    const data = await monitorApi.snapshotAnswer(String(s.snapshot_id || s.id));
    answerText.value = data?.answer_text || '';
    if (data?.query) answerMeta.value.query = data.query;
  } catch (e: any) {
    Message.error(e?.message || '加载回答失败');
    answerText.value = '';
  } finally {
    answerLoading.value = false;
  }
}

async function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadOne(s: SnapshotItem) {
  if (!s.photo_url) return;
  downloadingId.value = s.id;
  try {
    const resp = await fetch(s.photo_url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    await saveBlob(blob, fileName(s));
  } catch {
    // OSS CORS 不可用时回退新窗口打开
    window.open(s.photo_url, '_blank', 'noopener');
  } finally {
    downloadingId.value = null;
  }
}

async function batchDownload() {
  const items = downloadable.value;
  if (!items.length) return;
  batchDownloading.value = true;
  batchDone.value = 0;
  for (const s of items) {
    await downloadOne(s);
    batchDone.value += 1;
    await new Promise(r => setTimeout(r, 350));
  }
  batchDownloading.value = false;
  Message.success(`已触发 ${items.length} 个快照下载`);
}

async function exportAnswersCsv() {
  exportingText.value = true;
  try {
    const blob = await monitorApi.snapshotExportTextBlob({
      start_date: date.value,
      query_id: queryId.value,
      query_type: type.value,
      platform: platform.value,
    });
    await saveBlob(blob, `snapshot-answers-${date.value || 'export'}.csv`);
    Message.success('回答已导出（可用 Excel 打开）');
  } catch (e: any) {
    Message.error(e?.message || '导出失败');
  } finally {
    exportingText.value = false;
  }
}

watch(type, async () => {
  await loadTopics();
  await load();
});

onMounted(async () => {
  document.addEventListener('click', onDocClick);
  const d = new Date();
  date.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await loadTopics();
  await load();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
});
</script>
