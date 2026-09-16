<template>
  <div class="geo-page">
    <div class="flex justify-between items-end border-b border-gray-100 pb-6 mb-0">
      <div class="min-w-0">
        <h1 class="geo-page-title">搜索快照下载</h1>
        <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span>预览 AI 回答，并下载不同模型中的搜索结果快照或回答 Excel</span>
        </div>
        <div class="mt-3 inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          快照数据仅保留最近 7 天，请及时下载保存。
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          title="最多导出连续 7 天"
          class="px-5 py-2.5 bg-white text-gray-700 font-bold text-sm rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          :disabled="exportingText || !list.length"
          @click="exportAnswersCsv"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>
          {{ exportingText ? '导出中…' : '导出回答 Excel' }}
        </button>
        <button
          type="button"
          class="px-5 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          :disabled="batchDownloading || !downloadable.length"
          @click="batchDownload"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4 4 4-4"/></svg>
          {{ batchDownloading ? `下载中 ${batchDone}/${downloadable.length}` : '批量导出快照' }}
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-8 animate-fade-in max-w-[1600px] mx-auto pb-20 mt-8">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div class="flex flex-col border-b border-gray-100 bg-white">
          <div class="w-full px-6 py-4">
            <div class="flex items-center gap-5 flex-wrap">
              <div class="flex items-center gap-1.5 px-0 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none justify-start">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
                <span>问题:</span>
              </div>
              <div class="relative w-[240px]" ref="queryMenuRef">
                <button
                  type="button"
                  class="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                  @click="queryOpen = !queryOpen; platformOpen = false"
                >
                  <span class="truncate font-medium text-gray-700">{{ queryLabel }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 shrink-0 ml-2 transition-transform" :class="queryOpen ? 'rotate-180' : ''"><path d="m6 9 6 6 6-6"/></svg>
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

              <div class="flex items-center gap-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  <span>平台:</span>
                </div>
                <div class="relative w-[160px]" ref="platformMenuRef">
                  <button
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                    @click="platformOpen = !platformOpen; queryOpen = false"
                  >
                    <span class="truncate font-medium text-gray-700">{{ platformLabel }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 shrink-0 ml-2"><path d="m6 9 6 6 6-6"/></svg>
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
              </div>

              <div class="flex items-center gap-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                  <span>日期:</span>
                </div>
                <DashDateInput
                  v-model="date"
                  class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all shadow-sm outline-none"
                  :max="today"
                  @change="onDateChange"
                />
              </div>
              <span v-if="loading" class="text-xs text-gray-400">加载中…</span>
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                    <div class="flex min-w-0 flex-col">
                      <span class="block truncate text-sm font-bold text-gray-900" :title="fileName(s)">{{ fileName(s) }}</span>
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                        <span class="text-sm font-extrabold text-gray-700">{{ platformName(s.platform) }}</span>
                        <span class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-extrabold border-blue-200 bg-blue-50 text-blue-700">网页端</span>
                        <span class="text-sm font-medium text-gray-500">{{ s.exec_date }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span v-if="isRankDash(s.rank_value)" class="text-xs text-gray-300">-</span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >{{ s.rank_value }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ s.size_label || '—' }}</td>
                <td class="px-6 py-4">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors disabled:opacity-40"
                    :disabled="!s.has_answer"
                    @click="openAnswer(s)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      预览
                    </button>
                    <button
                      type="button"
                      class="text-indigo-600 hover:text-indigo-800 text-sm font-bold px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
                      :disabled="!s.photo_url || downloadingId === s.id"
                      @click="downloadOne(s)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
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

        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-500">共 {{ total }} 条记录</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="page <= 1 || loading"
              @click="goPage(page - 1)"
            >上一页</button>
            <span class="text-sm text-gray-600">第 {{ page }} / {{ totalPages }} 页</span>
            <button
              type="button"
              class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="page >= totalPages || loading"
              @click="goPage(page + 1)"
            >下一页</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览灯箱：放大后可拖拽 / 滚轮平移，长截图才能看全 -->
    <Teleport to="body">
      <div
        v-if="previewVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="closePreview"
      >
        <div class="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
          <button
            type="button"
            class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            aria-label="关闭预览"
            @click="closePreview"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div
            class="relative bg-black rounded-lg overflow-hidden shadow-2xl w-full max-h-[80vh] touch-none"
            @wheel.prevent="onPreviewWheel"
          >
            <img
              v-if="previewUrl"
              :src="previewUrl"
              alt="Preview"
              draggable="false"
              class="w-full h-auto max-h-[80vh] object-contain select-none"
              :style="{
                transform: `translate(${previewOffset.x}px, ${previewOffset.y}px) scale(${previewScale})`,
                cursor: previewScale > 1 ? (previewDragging ? 'grabbing' : 'grab') : 'zoom-in',
                transition: previewDragging ? 'none' : 'transform 0.15s ease-out',
                transformOrigin: 'center center',
              }"
              @pointerdown="onPreviewPointerDown"
              @pointermove="onPreviewPointerMove"
              @pointerup="onPreviewPointerUp"
              @pointercancel="onPreviewPointerUp"
              @click.stop="onPreviewClick"
            />
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/70 backdrop-blur rounded-full px-2 py-1 shadow-lg select-none z-10">
              <button
                type="button"
                class="p-2 text-white/90 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="缩小"
                :disabled="previewScale <= 1"
                @click.stop="previewZoomOut"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
              </button>
              <span class="text-white text-xs font-semibold w-12 text-center tabular-nums">{{ Math.round(previewScale * 100) }}%</span>
              <button
                type="button"
                class="p-2 text-white/90 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="放大"
                :disabled="previewScale >= 3"
                @click.stop="previewZoomIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
              </button>
              <div class="w-px h-4 bg-white/20 mx-0.5" />
              <button
                type="button"
                class="p-2 text-white/90 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="复位"
                :disabled="previewScale === 1 && previewOffset.x === 0 && previewOffset.y === 0"
                @click.stop="resetPreviewView"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
          </div>
          <p v-if="previewScale > 1" class="mt-2 text-xs text-white/55">放大后可拖动或滚轮平移查看</p>
        </div>
      </div>
    </Teleport>

    <!-- AI 回答预览 -->
    <Teleport to="body">
      <div
        v-if="answerVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
        @click.self="closeAnswer"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg bg-violet-50 text-violet-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                </div>
                <h3 class="text-lg font-extrabold text-gray-900">AI 回答预览</h3>
              </div>
              <p class="mt-2 text-sm text-gray-500 truncate">{{ answerMeta.query || '—' }}</p>
              <p class="mt-1 text-xs text-gray-400">{{ answerMeta.platform }} · {{ answerMeta.date }}</p>
            </div>
            <button
              type="button"
              class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="关闭回答预览"
              @click="closeAnswer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="flex-1 overflow-auto p-6 bg-gray-50/60">
            <div v-if="answerLoading" class="py-10 text-center text-sm text-gray-400">加载中…</div>
            <div v-else class="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div class="text-sm leading-7 text-gray-700 break-words whitespace-pre-wrap">{{ answerText || '暂无回答原文' }}</div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <span class="text-sm text-red-600">{{ answerError }}</span>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-40"
              :disabled="!answerText"
              @click="copyAnswer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              复制回答
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { monitorApi } from '@/api/modules/monitor';
import type { SnapshotItem } from '@/api/types';
import DashDateInput from '@/components/DashDateInput.vue';

const route = useRoute();
const type = computed<'industry' | 'brand'>(() => (route.query.type === 'brand' ? 'brand' : 'industry'));

const PAGE_SIZE = 10;

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
const page = ref(1);
const loading = ref(false);
const queryId = ref(0);
const queryLabel = ref('全部问题');
const date = ref('');
const today = ref('');
const platform = ref('all');
const queryOpen = ref(false);
const platformOpen = ref(false);
const queryMenuRef = ref<HTMLElement | null>(null);
const platformMenuRef = ref<HTMLElement | null>(null);

const previewVisible = ref(false);
const previewUrl = ref('');
const previewItem = ref<SnapshotItem | null>(null);
const previewScale = ref(1);
const previewOffset = reactive({ x: 0, y: 0 });
const previewDragging = ref(false);
let previewDragMoved = false;
let previewDragStart = { x: 0, y: 0, ox: 0, oy: 0 };

const answerVisible = ref(false);
const answerLoading = ref(false);
const answerText = ref('');
const answerError = ref('');
const answerMeta = ref({ platform: '', date: '', query: '' });

const downloadingId = ref<string | number | null>(null);
const batchDownloading = ref(false);
const batchDone = ref(0);
const exportingText = ref(false);

const platformLabel = computed(
  () => platformOptions.find(p => p.key === platform.value)?.label || '全部平台',
);
const downloadable = computed(() => list.value.filter(s => !!s.photo_url));
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

const platformName = (p: string) => PLATFORM_NAME[p] || p;

function isRankDash(rank?: string) {
  const r = String(rank ?? '').trim();
  return !r || r === '-' || r === '—' || r === 'null' || r === 'undefined';
}

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

function selectQuery(id: number, label: string) {
  queryId.value = id;
  queryLabel.value = label;
  queryOpen.value = false;
  page.value = 1;
  load();
}

function selectPlatform(key: string) {
  platform.value = key;
  platformOpen.value = false;
  page.value = 1;
  load();
}

function onDateChange() {
  page.value = 1;
  load();
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
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
      const t: any = await monitorApi.siTopics('industry');
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
      page.value,
      type.value,
      platform.value,
      PAGE_SIZE,
    );
    list.value = resp?.list || [];
    total.value = resp?.total || list.value.length;
    if (page.value > totalPages.value) page.value = totalPages.value;
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
  resetPreviewView();
  previewVisible.value = true;
}

function closePreview() {
  previewVisible.value = false;
  resetPreviewView();
}

function resetPreviewView() {
  previewScale.value = 1;
  previewOffset.x = 0;
  previewOffset.y = 0;
  previewDragging.value = false;
  previewDragMoved = false;
}

function previewZoomIn() {
  previewScale.value = Math.min(3, Math.round((previewScale.value + 0.25) * 100) / 100);
}

function previewZoomOut() {
  const next = Math.max(1, Math.round((previewScale.value - 0.25) * 100) / 100);
  previewScale.value = next;
  if (next <= 1) {
    previewOffset.x = 0;
    previewOffset.y = 0;
  }
}

function togglePreviewZoom() {
  if (previewScale.value > 1) {
    resetPreviewView();
  } else {
    previewScale.value = 1.5;
  }
}

function onPreviewPointerDown(e: PointerEvent) {
  if (previewScale.value <= 1) return;
  if (e.button != null && e.button !== 0) return;
  previewDragging.value = true;
  previewDragMoved = false;
  previewDragStart = {
    x: e.clientX,
    y: e.clientY,
    ox: previewOffset.x,
    oy: previewOffset.y,
  };
  (e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
}

function onPreviewPointerMove(e: PointerEvent) {
  if (!previewDragging.value) return;
  const dx = e.clientX - previewDragStart.x;
  const dy = e.clientY - previewDragStart.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) previewDragMoved = true;
  previewOffset.x = previewDragStart.ox + dx;
  previewOffset.y = previewDragStart.oy + dy;
}

function onPreviewPointerUp() {
  previewDragging.value = false;
}

function onPreviewClick() {
  if (previewDragMoved) {
    previewDragMoved = false;
    return;
  }
  togglePreviewZoom();
}

function onPreviewWheel(e: WheelEvent) {
  if (previewScale.value <= 1) {
    // 未放大时用滚轮微调放大，便于长截图逐段看
    if (e.deltaY < 0) previewZoomIn();
    return;
  }
  previewOffset.x -= e.deltaX;
  previewOffset.y -= e.deltaY;
}

async function openAnswer(s: SnapshotItem) {
  answerVisible.value = true;
  answerLoading.value = true;
  answerText.value = '';
  answerError.value = '';
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
    answerError.value = e?.message || '加载回答失败';
    answerText.value = '';
  } finally {
    answerLoading.value = false;
  }
}

function closeAnswer() {
  answerVisible.value = false;
}

async function copyAnswer() {
  if (!answerText.value) return;
  try {
    await navigator.clipboard.writeText(answerText.value);
    Message.success('已复制回答');
  } catch {
    Message.error('复制失败');
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
  page.value = 1;
  await loadTopics();
  applyRouteFilters();
  await load();
});

watch(
  () => [route.query.date, route.query.platform, route.query.query_id, route.query.q],
  async () => {
    applyRouteFilters();
    page.value = 1;
    await load();
  },
);

function applyRouteFilters() {
  const q = route.query;
  if (typeof q.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q.date)) {
    date.value = q.date;
  }
  if (typeof q.platform === 'string' && platformOptions.some(p => p.key === q.platform)) {
    platform.value = q.platform;
  }
  const qid = Number(q.query_id);
  if (Number.isFinite(qid) && qid > 0) {
    const hit = topics.value.find(t => Number(t.query_id) === qid);
    queryId.value = qid;
    queryLabel.value = hit?.name || (typeof q.q === 'string' && q.q ? q.q : `问题 #${qid}`);
  } else if (typeof q.q === 'string' && q.q.trim()) {
    const label = q.q.trim();
    const hit = topics.value.find(t => t.name === label || t.name.includes(label) || label.includes(t.name));
    if (hit) {
      queryId.value = hit.query_id;
      queryLabel.value = hit.name;
    } else {
      queryId.value = 0;
      queryLabel.value = label;
    }
  }
}

onMounted(async () => {
  document.addEventListener('click', onDocClick);
  const d = new Date();
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  today.value = ymd;
  date.value = ymd;
  await loadTopics();
  applyRouteFilters();
  await load();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
});
</script>
