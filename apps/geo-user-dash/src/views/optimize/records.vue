<template>
  <div class="rc-page geo-page">
    <div class="rc-header geo-page-header">
      <div class="rc-title-block">
        <h2 class="rc-title geo-page-title">发稿记录</h2>
        <p class="rc-desc geo-page-desc">把稿件一键分发到 AI 收录的媒体平台 · 每次发布按媒体逐家生成订单，实时回传发布状态与收录链接 · 提交冻结积分，成功扣除、失败全额退回</p>
      </div>
      <div class="rc-header-actions">
        <button class="rc-btn rc-btn--ghost" type="button" :disabled="!rows.length" @click="exportXlsx">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
          导出
        </button>
        <button class="rc-btn rc-btn--ghost" type="button" @click="goTracking">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          稿件追踪
        </button>
        <button class="rc-btn rc-btn--dark" type="button" @click="goPublish">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          发布新稿件
        </button>
      </div>
    </div>

    <div class="geo-page-stack">
      <div class="rc-card">
        <!-- 筛选 -->
        <div class="rc-filter-bar">
          <div class="rc-search-wrap">
            <svg class="rc-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
            <input
              v-model="filters.q"
              class="rc-search-input"
              type="text"
              placeholder="搜索稿件、媒体..."
              @keydown.enter="reload(1)"
            />
          </div>

          <div class="rc-filter-group">
            <span class="rc-filter-label">引用情况</span>
            <select v-model="filters.cite" class="rc-select" @change="reload(1)">
              <option value="all">全部</option>
              <option value="cited">已引用</option>
              <option value="uncited">未引用</option>
            </select>
          </div>

          <div class="rc-date-wrap" ref="dateRoot">
            <button
              type="button"
              class="rc-date-btn"
              :class="{ 'rc-date-btn--open': dateOpen }"
              @click.stop="dateOpen = !dateOpen"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8f9b" stroke-width="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
              <span>{{ dateLabel }}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b606a" stroke-width="2" :style="{ transform: dateOpen ? 'rotate(180deg)' : '' }"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div v-if="dateOpen" class="rc-date-panel" @click.stop>
              <div class="rc-date-presets">
                <div class="rc-date-presets-label">快速选择</div>
                <button
                  v-for="p in datePresets"
                  :key="p.key"
                  type="button"
                  class="rc-date-preset"
                  :class="{ on: datePreset === p.key }"
                  @click="applyDatePreset(p)"
                >{{ p.label }}</button>
              </div>
              <div class="rc-date-custom">
                <label>开始日期<input v-model="draftStart" type="date" /></label>
                <label>结束日期<input v-model="draftEnd" type="date" /></label>
                <div class="rc-date-actions">
                  <button type="button" class="rc-date-link" @click="clearDate">清除</button>
                  <div class="rc-date-actions-right">
                    <button type="button" class="rc-btn rc-btn--ghost rc-btn--sm" @click="dateOpen = false">取消</button>
                    <button type="button" class="rc-btn rc-btn--dark rc-btn--sm" @click="confirmDate">应用</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="rc-tabs-bar">
          <div class="rc-tabs">
            <button
              v-for="t in tabs"
              :key="t.key"
              type="button"
              class="rc-tab"
              :class="{ 'rc-tab--active': tab === t.key }"
              @click="setTab(t.key)"
            >
              {{ t.label }}
              <span class="rc-tab-num">{{ counts[t.countKey] || 0 }}</span>
            </button>
          </div>
          <div class="rc-sort">
            <span class="rc-sort-label">排序</span>
            <select v-model="filters.sort" class="rc-sort-select" @change="reload(1)">
              <option value="newest">最新提交</option>
              <option value="oldest">最早提交</option>
              <option value="cite-desc">引用最多</option>
              <option value="price-desc">积分最高</option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="rc-table-wrap">
          <table class="rc-table">
            <thead>
              <tr>
                <th class="rc-th rc-th--title">稿件</th>
                <th class="rc-th">发稿媒体</th>
                <th class="rc-th">状态</th>
                <th class="rc-th">发稿链接</th>
                <th class="rc-th">引用情况</th>
                <th class="rc-th">积分</th>
                <th class="rc-th">创建时间</th>
                <th class="rc-th rc-th--action">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td class="rc-empty" colspan="8">加载中…</td>
              </tr>
              <tr v-else-if="!rows.length">
                <td class="rc-empty" colspan="8">该状态下暂无发稿记录</td>
              </tr>
              <tr v-for="row in rows" :key="row.order_no || row.article_id" class="rc-tr">
                <td class="rc-td rc-td--title">
                  <div class="rc-article-name">{{ row.article_title || '未命名稿件' }}</div>
                  <div v-if="row.order_no" class="rc-order-no">订单 {{ row.order_no }}</div>
                  <div v-else class="rc-order-no">草稿 {{ row.article_id }}</div>
                </td>
                <td class="rc-td">{{ row.media_name || '—' }}</td>
                <td class="rc-td">
                  <span class="rc-status" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
                </td>
                <td class="rc-td">
                  <a
                    v-if="row.published_url"
                    class="rc-link"
                    :href="row.published_url"
                    target="_blank"
                    rel="noopener"
                  >{{ row.published_url }}</a>
                  <span v-else-if="row.status === 'fail' && row.fail_reason" class="rc-fail-reason">失败：{{ row.fail_reason }}</span>
                  <span v-else class="rc-cite rc-cite--dash">—</span>
                </td>
                <td class="rc-td">
                  <span v-if="row.status === 'draft' || row.status === 'fail' || isPublishing(row.status)" class="rc-cite rc-cite--dash">—</span>
                  <button
                    v-else-if="row.cite_count > 0"
                    type="button"
                    class="rc-cite rc-cite--ok"
                    @click="showCites(row)"
                  >已被引 {{ row.cite_count }} 次</button>
                  <span v-else class="rc-cite rc-cite--none">暂无引用</span>
                </td>
                <td class="rc-td">
                  <span v-if="row.status === 'draft'" class="rc-cite rc-cite--dash">—</span>
                  <span v-else-if="row.status === 'fail'" class="rc-credit rc-credit--refund">已解冻 ✦{{ row.sell_price || 0 }}</span>
                  <span v-else-if="isPublishing(row.status)" class="rc-credit rc-credit--freeze">冻结中 ✦{{ row.sell_price || 0 }}</span>
                  <span v-else class="rc-credit">✦ {{ row.sell_price || 0 }}</span>
                </td>
                <td class="rc-td rc-td--time">{{ formatTime(row.created_at) }}</td>
                <td class="rc-td rc-td--action">
                  <button v-if="row.status === 'draft'" class="rc-action" type="button" @click="editDraft(row)">继续编辑</button>
                  <template v-else>
                    <button class="rc-action" type="button" @click="openPreview(row)">预览</button>
                    <button
                      v-if="row.status === 'fail'"
                      class="rc-action rc-action--retry"
                      type="button"
                      :disabled="retrying === row.order_no"
                      @click="retryOrder(row)"
                    >{{ retrying === row.order_no ? '重试中…' : '重试' }}</button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rc-pagination">
          <span class="rc-page-info">显示 {{ rangeLabel }} · 共 {{ total }} 条</span>
          <div class="rc-page-controls">
            <button class="rc-page-btn rc-page-btn--nav" type="button" :disabled="page <= 1" @click="reload(page - 1)">‹ 上一页</button>
            <button
              v-for="p in pageButtons"
              :key="p"
              type="button"
              class="rc-page-btn"
              :class="{ 'rc-page-btn--active': p === page }"
              @click="reload(p)"
            >{{ p }}</button>
            <button class="rc-page-btn rc-page-btn--nav" type="button" :disabled="page >= totalPages" @click="reload(page + 1)">下一页 ›</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览 -->
    <div v-if="previewOpen" class="rc-modal-mask" @click.self="previewOpen = false">
      <div class="rc-modal">
        <div class="rc-modal-head">
          <div>
            <div class="rc-modal-title">订单预览</div>
            <div class="rc-modal-sub">{{ previewRow?.order_no || '' }}</div>
          </div>
          <button type="button" class="rc-modal-x" @click="previewOpen = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="rc-modal-body" v-if="previewRow">
          <div class="rc-preview-title">{{ previewRow.article_title }}</div>
          <div class="rc-preview-grid">
            <div><label>发稿媒体</label><span>{{ previewRow.media_name || '—' }}</span></div>
            <div><label>状态</label><span class="rc-status" :class="statusClass(previewRow.status)">{{ statusLabel(previewRow.status) }}</span></div>
            <div><label>积分</label><span>✦ {{ previewRow.sell_price || 0 }}</span></div>
            <div><label>创建时间</label><span>{{ formatTime(previewRow.created_at) }}</span></div>
            <div class="rc-preview-full"><label>发稿链接</label>
              <a v-if="previewRow.published_url" :href="previewRow.published_url" target="_blank" rel="noopener" class="rc-link">{{ previewRow.published_url }}</a>
              <span v-else-if="previewRow.fail_reason" class="rc-fail-reason">{{ previewRow.fail_reason }}</span>
              <span v-else>—</span>
            </div>
            <div v-if="previewRow.article_note" class="rc-preview-full"><label>发稿备注</label><span>{{ previewRow.article_note }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { publishApi } from '@/api/modules/report';
import { downloadAoaSheets } from '@/utils/xlsxExport';
import { toast } from '@/lib/toast';

type OrderRow = {
  order_no?: string | null;
  article_id?: string | null;
  article_title?: string;
  article_note?: string;
  media_name?: string;
  status: string;
  published_url?: string | null;
  fail_reason?: string | null;
  sell_price?: number;
  cite_count?: number;
  created_at?: string | Date;
  row_type?: string;
};

const router = useRouter();
const PAGE_SIZE = 20;

const loading = ref(false);
const rows = ref<OrderRow[]>([]);
const total = ref(0);
const page = ref(1);
const retrying = ref('');
const tab = ref<'draft' | 'all' | 'publishing' | 'ok' | 'fail'>('all');
const counts = reactive({ draft: 0, all: 0, publishing: 0, ok: 0, fail: 0 });
const filters = reactive({
  q: '',
  cite: 'all',
  sort: 'newest',
  start: '',
  end: '',
});

const dateOpen = ref(false);
const dateRoot = ref<HTMLElement | null>(null);
const datePreset = ref('all');
const draftStart = ref('');
const draftEnd = ref('');

const previewOpen = ref(false);
const previewRow = ref<OrderRow | null>(null);

const tabs = [
  { key: 'draft' as const, label: '草稿', countKey: 'draft' as const },
  { key: 'all' as const, label: '全部', countKey: 'all' as const },
  { key: 'publishing' as const, label: '发布中', countKey: 'publishing' as const },
  { key: 'ok' as const, label: '已发布', countKey: 'ok' as const },
  { key: 'fail' as const, label: '发布失败', countKey: 'fail' as const },
];

const datePresets = [
  { key: 'today', label: '今日', days: 0 },
  { key: '7', label: '近 7 天', days: 7 },
  { key: '30', label: '近 30 天', days: 30 },
  { key: '90', label: '近 90 天', days: 90 },
  { key: '180', label: '近 180 天', days: 180 },
  { key: 'month', label: '本月', days: -1 },
  { key: 'lastMonth', label: '上月', days: -2 },
];

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
const rangeLabel = computed(() => {
  if (!total.value) return '0-0';
  const from = (page.value - 1) * PAGE_SIZE + 1;
  const to = Math.min(page.value * PAGE_SIZE, total.value);
  return `${from}-${to}`;
});
const pageButtons = computed(() => {
  const n = totalPages.value;
  const cur = page.value;
  if (n <= 5) return Array.from({ length: n }, (_, i) => i + 1);
  const set = new Set([ 1, n, cur, cur - 1, cur + 1 ].filter(p => p >= 1 && p <= n));
  return [ ...set ].sort((a, b) => a - b);
});
const dateLabel = computed(() => {
  if (!filters.start && !filters.end) return '全部时间';
  if (filters.start && filters.end) return `${filters.start} ~ ${filters.end}`;
  return filters.start || filters.end;
});

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatTime(v?: string | Date) {
  if (!v) return '—';
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) return '—';
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function isPublishing(s: string) { return s === 'pending' || s === 'submitted'; }
function statusLabel(s: string) {
  if (s === 'draft') return '草稿';
  if (s === 'ok') return '已发布';
  if (s === 'fail') return '发布失败';
  if (isPublishing(s)) return '发布中';
  return s;
}
function statusClass(s: string) {
  if (s === 'ok') return 'rc-status--ok';
  if (s === 'fail') return 'rc-status--fail';
  if (s === 'draft') return 'rc-status--draft';
  return 'rc-status--pending';
}

function setTab(k: typeof tab.value) {
  tab.value = k;
  reload(1);
}

function applyDatePreset(p: { key: string; days: number }) {
  datePreset.value = p.key;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (p.days === 0) {
    draftStart.value = fmtDate(today);
    draftEnd.value = fmtDate(today);
  } else if (p.days > 0) {
    const start = new Date(today);
    start.setDate(start.getDate() - (p.days - 1));
    draftStart.value = fmtDate(start);
    draftEnd.value = fmtDate(today);
  } else if (p.days === -1) {
    draftStart.value = fmtDate(new Date(today.getFullYear(), today.getMonth(), 1));
    draftEnd.value = fmtDate(today);
  } else if (p.days === -2) {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    draftStart.value = fmtDate(start);
    draftEnd.value = fmtDate(end);
  }
}
function clearDate() {
  datePreset.value = 'all';
  draftStart.value = '';
  draftEnd.value = '';
  filters.start = '';
  filters.end = '';
  dateOpen.value = false;
  reload(1);
}
function confirmDate() {
  filters.start = draftStart.value;
  filters.end = draftEnd.value;
  if (!filters.start && !filters.end) datePreset.value = 'all';
  dateOpen.value = false;
  reload(1);
}

async function reload(pageNo = page.value) {
  loading.value = true;
  page.value = pageNo;
  try {
    const resp: any = await publishApi.orders({
      page: pageNo,
      size: PAGE_SIZE,
      status: tab.value,
      q: filters.q.trim() || undefined,
      cite: filters.cite,
      sort: filters.sort,
      start_date: filters.start || undefined,
      end_date: filters.end || undefined,
    });
    rows.value = resp?.list || [];
    total.value = Number(resp?.total || 0);
    const c = resp?.counts || {};
    counts.draft = Number(c.draft || 0);
    counts.all = Number(c.all || 0);
    counts.publishing = Number(c.publishing || 0);
    counts.ok = Number(c.ok || 0);
    counts.fail = Number(c.fail || 0);
  } catch (e: any) {
    rows.value = [];
    toast.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function goPublish() { router.push('/dashboard/media-library/publish'); }
function goTracking() { router.push('/dashboard/media-library/tracking'); }
function editDraft(row: OrderRow) {
  router.push({ path: '/dashboard/media-library/publish', query: row.article_id ? { article_id: row.article_id } : {} });
}
function openPreview(row: OrderRow) {
  previewRow.value = row;
  previewOpen.value = true;
}
async function showCites(row: OrderRow) {
  if (!row.order_no) return;
  try {
    const resp: any = await publishApi.orderCites(row.order_no);
    toast.info(`引用 ${resp?.cite_count ?? row.cite_count ?? 0} 次`, '明细将在稿件追踪中持续更新');
  } catch (e: any) {
    toast.error(e?.message || '加载引用失败');
  }
}
async function retryOrder(row: OrderRow) {
  if (!row.order_no) return;
  retrying.value = row.order_no;
  try {
    await publishApi.republish(row.order_no);
    toast.success('已重新提交');
    await reload(page.value);
  } catch (e: any) {
    toast.error(e?.message || '重试失败');
  } finally {
    retrying.value = '';
  }
}
function exportXlsx() {
  const header = [ '订单号', '稿件', '发稿媒体', '状态', '发稿链接', '引用次数', '积分', '创建时间', '失败原因' ];
  const data = rows.value.map(r => [
    r.order_no || '',
    r.article_title || '',
    r.media_name || '',
    statusLabel(r.status),
    r.published_url || '',
    r.cite_count || 0,
    r.sell_price || 0,
    formatTime(r.created_at),
    r.fail_reason || '',
  ]);
  downloadAoaSheets(
    [{ name: '发稿记录', rows: [ header, ...data ], cols: [ { wch: 22 }, { wch: 36 }, { wch: 14 }, { wch: 10 }, { wch: 40 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 24 } ] }],
    `发稿记录_${fmtDate(new Date())}.xlsx`,
  );
}

function onDocClick(e: MouseEvent) {
  if (dateRoot.value && !dateRoot.value.contains(e.target as Node)) dateOpen.value = false;
}

onMounted(() => {
  document.addEventListener('click', onDocClick);
  reload(1);
});
onUnmounted(() => document.removeEventListener('click', onDocClick));
</script>

<style lang="scss" scoped>
.rc-page {
  background: #f8fafc;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
  font-size: 16px;
}
.rc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.rc-title-block { display: flex; flex-direction: column; gap: 4px; }
.rc-header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.rc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 37.5px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid;
  transition: background 0.15s;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.rc-btn--ghost {
  color: #2a2d36;
  background: #fff;
  border-color: #e6e8ee;
  &:hover { background: #f5f6fa; }
}
.rc-btn--dark {
  color: #fff;
  background: #0f1115;
  border-color: #0f1115;
  &:hover { background: #1a1d24; }
}
.rc-btn--sm { height: 32px; padding: 0 12px; font-size: 12.5px; }

.rc-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.rc-filter-bar {
  padding: 16px 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.rc-search-wrap {
  flex: 1 1 0%;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 10px;
}
.rc-search-icon { color: #8a8f9b; flex-shrink: 0; }
.rc-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #0f1115;
  font-family: inherit;
  &::placeholder { color: #8a8f9b; }
}
.rc-filter-group { display: flex; align-items: center; gap: 8px; }
.rc-filter-label { font-size: 12px; color: #5b606a; white-space: nowrap; }
.rc-select {
  height: 38px;
  padding: 0 8px;
  font-size: 12.5px;
  color: #2a2d36;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

.rc-date-wrap { position: relative; }
.rc-date-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  font-size: 12.5px;
  color: #0f1115;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  span { font-weight: 600; }
  svg:last-child { transition: transform 0.2s; }
  &:hover { border-color: #c7d2fe; }
}
.rc-date-btn--open {
  border-color: #6452ff;
  box-shadow: 0 0 0 3px #efecff;
}
.rc-date-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 60;
  width: 480px;
  max-width: 92vw;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 16px;
  box-shadow: rgba(15, 17, 21, 0.18) 0px 20px 60px;
  overflow: hidden;
  display: flex;
}
.rc-date-presets {
  width: 148px;
  flex-shrink: 0;
  border-right: 1px solid #f0f1f6;
  padding: 14px 10px;
}
.rc-date-presets-label {
  font-size: 11px;
  color: #8a8f9b;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 0 8px 8px;
}
.rc-date-preset {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  color: #2a2d36;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f5f6fa; }
  &.on { background: #efecff; color: #6452ff; font-weight: 600; }
}
.rc-date-custom {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: #5b606a;
    input {
      height: 36px;
      border: 1px solid #e6e8ee;
      border-radius: 8px;
      padding: 0 10px;
      font-size: 13px;
      font-family: inherit;
      color: #0f1115;
    }
  }
}
.rc-date-actions {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
}
.rc-date-link {
  border: none;
  background: transparent;
  color: #8a8f9b;
  font-size: 12.5px;
  cursor: pointer;
  font-family: inherit;
  &:hover { color: #6452ff; }
}
.rc-date-actions-right { display: flex; gap: 8px; }

.rc-tabs-bar {
  padding: 0 20px;
  border-bottom: 1px solid #e6e8ee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.rc-tabs { display: flex; align-items: center; gap: 0; }
.rc-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  font-size: 12.5px;
  font-weight: 500;
  color: #5b606a;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  &:hover { color: #0f1115; }
}
.rc-tab--active {
  color: #0f1115;
  font-weight: 700;
  border-bottom-color: #0f1115;
}
.rc-tab-num {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 100px;
  background: #f5f6fa;
  color: #5b606a;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
}
.rc-tab--active .rc-tab-num {
  background: #0f1115;
  color: #fff;
}

.rc-sort { display: flex; align-items: center; gap: 6px; }
.rc-sort-label { font-size: 12px; color: #8a8f9b; }
.rc-sort-select {
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
  color: #5b606a;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

.rc-table-wrap { overflow-x: auto; }
.rc-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.rc-th {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #5b606a;
  text-align: left;
  background: #f5f6fa;
  border-bottom: 1px solid #e6e8ee;
  white-space: nowrap;
}
.rc-th--title { width: 28%; }
.rc-th--action { width: 110px; text-align: right; }
.rc-tr {
  border-bottom: 1px solid #f0f1f6;
  transition: background 0.15s;
  &:hover { background: #fafbfc; }
  &:last-child { border-bottom: none; }
}
.rc-td {
  padding: 12px;
  font-size: 13px;
  color: #2a2d36;
  vertical-align: middle;
  word-break: break-word;
}
.rc-td--title { color: #0f1115; }
.rc-article-name { font-size: 13px; font-weight: 500; color: #0f1115; line-height: 20px; }
.rc-order-no { font-size: 11.5px; color: #8a8f9b; line-height: 17px; margin-top: 2px; }
.rc-td--time { font-size: 12px; color: #8a8f9b; white-space: nowrap; }
.rc-td--action { text-align: right; white-space: nowrap; }
.rc-empty {
  padding: 48px 16px;
  text-align: center;
  font-size: 12.5px;
  color: #8a8f9b;
  background: #fff;
}

.rc-status {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}
.rc-status--ok { color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; }
.rc-status--fail { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; }
.rc-status--pending { color: #6452ff; background: #efecff; border: 1px solid #c7d2fe; }
.rc-status--draft { color: #5b606a; background: #f5f6fa; border: 1px solid #e6e8ee; }

.rc-link {
  font-size: 12px;
  color: #6452ff;
  text-decoration: none;
  word-break: break-all;
  &:hover { text-decoration: underline; }
}
.rc-fail-reason { font-size: 12px; color: #dc2626; line-height: 18px; }
.rc-cite { font-size: 12px; color: #8a8f9b; background: transparent; border: none; padding: 0; font-family: inherit; }
.rc-cite--ok { color: #6452ff; font-weight: 600; cursor: pointer; }
.rc-cite--none { color: #8a8f9b; }
.rc-cite--dash { color: #c5c8d0; }
.rc-credit { font-size: 12.5px; font-weight: 600; color: #ea580c; }
.rc-credit--refund { color: #16a34a; font-weight: 500; }
.rc-credit--freeze { color: #6452ff; font-weight: 500; }

.rc-action {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  margin-left: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #6452ff;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #efecff; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.rc-action--retry { color: #dc2626; &:hover { background: #fef2f2; } }

.rc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #f0f1f6;
  flex-wrap: wrap;
}
.rc-page-info { font-size: 12px; color: #8a8f9b; }
.rc-page-controls { display: flex; align-items: center; gap: 4px; }
.rc-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: #2a2d36;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  &:hover:not(:disabled) { background: #f5f6fa; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}
.rc-page-btn--active {
  background: #0f1115;
  border-color: #0f1115;
  color: #fff;
}
.rc-page-btn--nav { min-width: auto; }

.rc-modal-mask {
  position: fixed; inset: 0; z-index: 1000; background: rgba(15, 17, 21, 0.4);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.rc-modal {
  width: min(560px, 100%);
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: rgba(15, 17, 21, 0.25) 0px 20px 60px;
}
.rc-modal-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 16px 18px; border-bottom: 1px solid #e6e8ee;
}
.rc-modal-title { font-size: 14.5px; font-weight: 700; color: #0f1115; }
.rc-modal-sub { font-size: 11.5px; color: #8a8f9b; margin-top: 2px; font-family: 'JetBrains Mono', ui-monospace, monospace; }
.rc-modal-x {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #e6e8ee; background: #fff; color: #5b606a; border-radius: 8px; cursor: pointer;
}
.rc-modal-body { padding: 18px 20px 22px; }
.rc-preview-title { font-size: 16px; font-weight: 700; color: #0f1115; line-height: 1.45; margin-bottom: 14px; }
.rc-preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  label { display: block; font-size: 11.5px; color: #8a8f9b; margin-bottom: 4px; }
  span, a { font-size: 13px; color: #2a2d36; }
}
.rc-preview-full { grid-column: 1 / -1; }
</style>
