<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="搜索快照下载" description="预览 AI 回答，并下载不同模型中的搜索结果快照或回答 Excel">
      <template #actions>
        <Button
          variant="outline"
          size="sm"
          title="最多导出连续 7 天"
          :disabled="exportingText || !list.length"
          @click="exportAnswersCsv"
        >
          <FileSpreadsheet class="h-3.5 w-3.5" />
          {{ exportingText ? '导出中…' : '导出回答 Excel' }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="batchDownloading || !downloadable.length"
          @click="batchDownload"
        >
          <CloudDownload class="h-3.5 w-3.5" />
          {{ batchDownloading ? `下载中 ${batchDone}/${downloadable.length}` : '批量导出快照' }}
        </Button>
      </template>
    </PageHeader>

    <div class="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
      快照数据仅保留最近 7 天，请及时下载保存。
    </div>

    <Card class="overflow-hidden">
      <div class="flex flex-wrap items-center gap-4 border-b bg-muted/30 px-5 py-4">
        <div class="flex min-w-0 items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">问题</span>
          <DashQuerySelect
            v-model="queryId"
            v-model:label="queryLabel"
            :options="queryOptions"
            wrap-class="w-[240px]"
            @change="onQueryChange"
          />
          <span class="shrink-0 text-xs text-muted-foreground">共 {{ topics.length }} 个问题</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">平台</span>
          <DashSelect
            v-model="platform"
            :options="platformSelectOptions"
            min-width="140px"
            @change="onPlatformChange"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">日期</span>
          <DashDateInput
            v-model="date"
            class="h-9 rounded-lg border border-input bg-background px-2.5 text-xs"
            :max="today"
            @change="onDateChange"
          />
        </div>
        <span v-if="loading" class="text-xs text-muted-foreground">加载中…</span>
      </div>

      <div class="min-h-[300px] overflow-auto">
        <table class="w-full table-fixed text-left text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th class="w-[42%] px-5 py-3 text-left font-medium">文件名称</th>
              <th class="w-[110px] px-5 py-3 text-left font-medium">排行值</th>
              <th class="w-[110px] px-5 py-3 text-left font-medium">文件大小</th>
              <th class="w-[140px] px-5 py-3 text-left font-medium">AI 回答</th>
              <th class="w-[180px] px-5 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in list"
              :key="s.id"
              class="border-b last:border-0 hover:bg-muted/45"
            >
              <td class="min-w-0 px-5 py-4">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ImageIcon class="h-4 w-4" />
                  </div>
                  <div class="flex min-w-0 flex-col">
                    <span class="block truncate text-sm font-semibold" :title="fileName(s)">{{ fileName(s) }}</span>
                    <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span class="text-sm font-medium">{{ platformName(s.platform) }}</span>
                      <Badge class="border-transparent bg-primary/10 text-[10px] text-primary">网页端</Badge>
                      <span class="text-xs text-muted-foreground">{{ s.exec_date }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <span v-if="isRankDash(s.rank_value)" class="text-xs text-muted-foreground">-</span>
                <Badge
                  v-else
                  class="border-transparent bg-primary/10 font-mono text-xs text-primary"
                >{{ s.rank_value }}</Badge>
              </td>
              <td class="px-5 py-4 text-sm text-muted-foreground">{{ s.size_label || '—' }}</td>
              <td class="px-5 py-4">
                <Button
                  size="sm"
                  variant="outline"
                  class="h-8"
                  :disabled="!s.has_answer"
                  @click="openAnswer(s)"
                >
                  <Bot class="h-3.5 w-3.5" />
                  查看回答
                </Button>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    class="h-8"
                    :disabled="!s.photo_url"
                    @click="openPreview(s)"
                  >
                    <Eye class="h-3.5 w-3.5" />
                    预览
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="h-8 text-primary"
                    :disabled="!s.photo_url || downloadingId === s.id"
                    @click="downloadOne(s)"
                  >
                    <Download class="h-3.5 w-3.5" />
                    {{ downloadingId === s.id ? '…' : '下载' }}
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !list.length">
              <td colspan="5" class="px-5 py-12 text-center text-sm text-muted-foreground">暂无快照记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t px-5 py-3">
        <span class="text-sm text-muted-foreground">共 {{ total }} 条记录</span>
        <div class="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            :disabled="page <= 1 || loading"
            @click="goPage(page - 1)"
          >上一页</Button>
          <span class="text-sm text-muted-foreground">第 {{ page }} / {{ totalPages }} 页</span>
          <Button
            size="sm"
            variant="outline"
            :disabled="page >= totalPages || loading"
            @click="goPage(page + 1)"
          >下一页</Button>
        </div>
      </div>
    </Card>

    <!-- 预览灯箱：滚轮缩放 · 按住拖动平移 -->
    <Teleport to="body">
      <div
        v-if="previewVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        @click.self="closePreview"
      >
        <div class="relative flex w-full max-w-5xl max-h-[90vh] flex-col items-center justify-center">
          <button
            type="button"
            class="absolute -top-12 right-0 text-white transition-colors hover:text-white/70"
            aria-label="关闭预览"
            @click="closePreview"
          >
            <X class="h-8 w-8" />
          </button>
          <div
            class="relative w-full max-h-[80vh] touch-none overflow-hidden rounded-lg bg-black shadow-2xl"
            @wheel.prevent="onPreviewWheel"
          >
            <img
              v-if="previewUrl"
              :src="previewUrl"
              alt="Preview"
              draggable="false"
              class="h-auto max-h-[80vh] w-full select-none object-contain"
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
            <div class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 select-none items-center gap-1 rounded-full bg-black/70 px-2 py-1 shadow-lg backdrop-blur">
              <button
                type="button"
                class="p-2 text-white/90 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                title="缩小"
                :disabled="previewScale <= 1"
                @click.stop="previewZoomOut"
              >
                <ZoomOut class="h-[18px] w-[18px]" />
              </button>
              <span class="w-12 text-center font-mono text-xs tabular-nums text-white">{{ Math.round(previewScale * 100) }}%</span>
              <button
                type="button"
                class="p-2 text-white/90 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                title="放大"
                :disabled="previewScale >= 3"
                @click.stop="previewZoomIn"
              >
                <ZoomIn class="h-[18px] w-[18px]" />
              </button>
              <div class="mx-0.5 h-4 w-px bg-white/20" />
              <button
                type="button"
                class="p-2 text-white/90 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                title="复位"
                :disabled="previewScale === 1 && previewOffset.x === 0 && previewOffset.y === 0"
                @click.stop="resetPreviewView"
              >
                <RotateCcw class="h-4 w-4" />
              </button>
            </div>
          </div>
          <p class="mt-2 text-xs text-white/55">滚轮缩放 · 放大后按住拖动可平移</p>
        </div>
      </div>
    </Teleport>

    <!-- AI 回答预览 -->
    <Teleport to="body">
      <div
        v-if="answerVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
        @click.self="closeAnswer"
      >
        <div class="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border bg-card shadow-2xl">
          <div class="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot class="h-4 w-4" />
                </div>
                <h3 class="text-base font-semibold">AI 回答预览</h3>
              </div>
              <p class="mt-2 truncate text-sm text-muted-foreground">{{ answerMeta.query || '—' }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ answerMeta.platform }} · {{ answerMeta.date }}</p>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" aria-label="关闭回答预览" @click="closeAnswer">
              <X class="h-4 w-4" />
            </Button>
          </div>
          <div class="flex-1 overflow-auto bg-muted/30 p-5">
            <div v-if="answerLoading" class="py-10 text-center text-sm text-muted-foreground">加载中…</div>
            <div v-else class="rounded-lg border bg-card p-5 shadow-sm">
              <div class="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{{ answerText || '暂无回答原文' }}</div>
            </div>
          </div>
          <div class="flex items-center justify-between gap-4 border-t px-5 py-4">
            <span class="text-sm text-destructive">{{ answerError }}</span>
            <Button size="sm" variant="outline" :disabled="!answerText" @click="copyAnswer">
              <Copy class="h-3.5 w-3.5" />
              复制回答
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  Bot, CloudDownload, Copy, Download, Eye, FileSpreadsheet,
  Image as ImageIcon, RotateCcw, X, ZoomIn, ZoomOut,
} from 'lucide-vue-next';
import { monitorApi } from '@/api/modules/monitor';
import type { SnapshotItem } from '@/api/types';
import DashDateInput from '@/components/DashDateInput.vue';
import DashQuerySelect from '@/components/DashQuerySelect.vue';
import DashSelect from '@/components/DashSelect.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Badge, Button, Card } from '@/components/ui';
import { Message } from '@/lib/toast';

const route = useRoute();
const type = computed<'industry' | 'brand'>(() =>
  (route.query.type === 'brand' || route.query.from === 'sentiment' ? 'brand' : 'industry'),
);

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
const platformSelectOptions = platformOptions.map(p => ({ value: p.key, label: p.label }));

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

const queryOptions = computed(() =>
  topics.value.map(t => ({ value: t.query_id, label: t.name })),
);
const downloadable = computed(() => list.value.filter(s => !!s.photo_url));
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

/** Absolute snapshot image URL — API already returns full URLs; leave relative paths as-is. */
function resolvePhotoUrl(url?: string | null) {
  if (!url) return '';
  return url;
}

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

function onQueryChange() {
  page.value = 1;
  load();
}

function onPlatformChange() {
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
  const url = resolvePhotoUrl(s.photo_url);
  if (!url) return;
  previewItem.value = s;
  previewUrl.value = url;
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

/** 放大后按住拖动平移（上下左右均可） */
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

/** 滚轮放大 / 缩小 */
function onPreviewWheel(e: WheelEvent) {
  if (e.deltaY < 0) previewZoomIn();
  else if (e.deltaY > 0) previewZoomOut();
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
  const photo = resolvePhotoUrl(s.photo_url);
  if (!photo) return;
  downloadingId.value = s.id;
  try {
    const resp = await fetch(photo);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    await saveBlob(blob, fileName(s));
  } catch {
    window.open(photo, '_blank', 'noopener');
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
  () => [route.query.date, route.query.platform, route.query.query_id, route.query.q, route.query.from],
  async () => {
    applyRouteFilters();
    page.value = 1;
    await load();
  },
);

function applyRouteFilters() {
  const q = route.query;
  // type / from=sentiment are consumed via `type` computed (brand from sentiment links)
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
  const d = new Date();
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  today.value = ymd;
  date.value = ymd;
  await loadTopics();
  applyRouteFilters();
  await load();
});
</script>
