<template>
  <div class="ar-page geo-page">
    <div class="ar-header geo-page-header">
      <div class="ar-title-block">
        <h2 class="ar-title geo-page-title">稿件库</h2>
        <p class="ar-desc geo-page-desc">所有由 AI 辅助生成的稿件 · 数据实时同步</p>
      </div>
      <div class="ar-header-actions">
        <button class="ar-btn ar-btn--ghost" type="button" :disabled="loading" @click="load">
          <svg v-if="loading" class="ar-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          刷新
        </button>
        <button class="ar-btn ar-btn--ghost" type="button" @click="router.push('/dashboard/media-library/records')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
          发稿记录
        </button>
        <button class="ar-btn ar-btn--ghost" type="button" @click="router.push('/dashboard/media-library/publish')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
          发布稿件
        </button>
        <button class="ar-btn ar-btn--dark" type="button" @click="router.push('/dashboard/new-agent?mode=writing')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
          新建稿件
        </button>
      </div>
    </div>

    <div class="ar-stack">
      <div class="ar-search-row">
        <div class="ar-search-wrap">
          <svg class="ar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8f9b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          <input v-model="keyword" class="ar-search-input" type="text" placeholder="搜索稿件标题、关键词..." />
        </div>
      </div>

      <div class="ar-tabs-bar">
        <div class="ar-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="ar-tab"
            :class="{ 'ar-tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key; page = 1"
          >
            {{ tab.label }}
            <span v-if="tabCount(tab.key) > 0" class="ar-tab-count">{{ tabCount(tab.key) }}</span>
          </button>
        </div>
        <div class="ar-sort">按 <strong>更新时间</strong> 排序 ↓</div>
      </div>

      <div class="ar-card">
        <div v-if="!auth.activeBrandId" class="ar-empty">
          <div class="ar-empty-icon">🏷️</div>
          <div class="ar-empty-title">请先选择品牌</div>
          <div class="ar-empty-hint">左侧选择 active brand 后才能看稿件</div>
        </div>
        <div v-else-if="loading && !items.length" class="ar-empty">
          <div class="ar-empty-icon">⏳</div>
          <div class="ar-empty-title">加载中...</div>
          <div class="ar-empty-hint">正在拉取稿件列表</div>
        </div>
        <div v-else-if="error" class="ar-empty">
          <div class="ar-empty-icon">⚠️</div>
          <div class="ar-empty-title">加载失败</div>
          <div class="ar-empty-hint">{{ error }}</div>
          <button class="ar-btn ar-btn--dark" type="button" style="margin-top:16px" @click="load">重试</button>
        </div>
        <div v-else-if="!filtered.length" class="ar-empty">
          <div class="ar-empty-icon">📝</div>
          <div class="ar-empty-title">还没有稿件</div>
          <div class="ar-empty-hint">点右上角「新建稿件」让 AI 帮你写第一篇</div>
        </div>
        <div v-else class="ar-list">
          <div
            v-for="(item, idx) in pageItems"
            :key="item.run_id"
            class="ar-row"
            :class="{ 'ar-row--last': idx === pageItems.length - 1 }"
            @click="openItem(item)"
          >
            <div class="ar-row-ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/></svg>
            </div>
            <div class="ar-row-main">
              <div class="ar-row-title" :title="itemTitle(item)">{{ itemTitle(item) }}</div>
              <div class="ar-row-meta">
                <span class="ar-mono">{{ relativeTime(item.updated_at) }}</span>
                <template v-if="item.generate_mode === 'evidence'">
                  <span class="ar-dot" />
                  <span class="ar-evidence">循证</span>
                </template>
              </div>
            </div>
            <div class="ar-row-status">
              <span class="ar-pill" :class="pillClass(item.status)">
                <span v-if="item.status === 'running' || item.status === 'starting'" class="ar-pill-dot ar-pill-dot--pulse" />
                <span v-else-if="item.status === 'awaiting_user'" class="ar-pill-dot" />
                <svg v-else-if="item.status === 'completed'" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
                {{ statusLabel(item) }}
              </span>
            </div>
            <div class="ar-row-actions" @click.stop>
              <button type="button" class="ar-mini" @click="openItem(item)">查看</button>
              <button type="button" class="ar-del" title="删除" @click="askDelete(item)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filtered.length" class="ar-pager">
        <div class="ar-pager-info">
          显示 <strong>{{ rangeStart }}-{{ rangeEnd }}</strong> · 共 <strong>{{ filtered.length }}</strong> 篇
        </div>
        <div class="ar-pager-btns">
          <button type="button" class="ar-page-btn" :disabled="page <= 1" @click="page--">‹ 上一页</button>
          <template v-for="(p, i) in pageNums" :key="`${p}-${i}`">
            <span v-if="p === '...'" class="ar-page-dots">...</span>
            <button
              v-else
              type="button"
              class="ar-page-btn"
              :class="{ on: p === page }"
              :disabled="p === page"
              @click="page = Number(p)"
            >{{ p }}</button>
          </template>
          <button type="button" class="ar-page-btn" :disabled="page >= totalPages" @click="page++">下一页 ›</button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="pendingDelete" class="ar-modal-mask" @click="!deleting && (pendingDelete = null)">
      <div class="ar-modal" @click.stop>
        <div class="ar-modal-hd">
          <div class="ar-modal-ic">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <div class="ar-modal-title">删除稿件</div>
        </div>
        <div class="ar-modal-body">
          确认删除 <strong>「{{ truncate(itemTitle(pendingDelete), 40) }}」</strong>？
        </div>
        <div v-if="isActive(pendingDelete)" class="ar-modal-warn">
          ⚠ 这个稿件还在生成中。删除会<strong>立即中止 agent 任务</strong>，已生成的草稿/调研文件也会一并删除。
        </div>
        <div class="ar-modal-tip">删除不可恢复 · 包括对话历史 / 调研资料 / 大纲 / 草稿 / 终稿</div>
        <div class="ar-modal-ft">
          <button type="button" class="ar-btn ar-btn--ghost" :disabled="deleting" @click="pendingDelete = null">取消</button>
          <button type="button" class="ar-btn ar-btn--danger" :disabled="deleting" @click="confirmDelete">
            <svg v-if="deleting" class="ar-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ deleting ? '删除中…' : (isActive(pendingDelete) ? '中止并删除' : '确认删除') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { brandApi, type ArticleLibraryItem } from '@/api/modules/brand';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

type TabKey = 'all' | 'running' | 'interrupted' | 'completed';
const tabs: { key: TabKey; label: string; statuses: string[] | null }[] = [
  { key: 'all', label: '全部', statuses: null },
  { key: 'running', label: '进行中', statuses: ['running', 'starting', 'awaiting_user'] },
  { key: 'interrupted', label: '已中断', statuses: ['failed', 'cancelled'] },
  { key: 'completed', label: '已完成', statuses: ['completed'] },
];

const items = ref<ArticleLibraryItem[]>([]);
const counters = ref<Record<string, number> | null>(null);
const loading = ref(false);
const error = ref('');
const keyword = ref('');
const activeTab = ref<TabKey>('all');
const page = ref(1);
const pageSize = 10;
const pendingDelete = ref<ArticleLibraryItem | null>(null);
const deleting = ref(false);
let pollTimer: number | null = null;
let loadSeq = 0;

const filtered = computed(() => {
  const tab = tabs.find(t => t.key === activeTab.value);
  const statuses = tab?.statuses ?? null;
  const kw = keyword.value.trim().toLowerCase();
  return items.value.filter(it => {
    if (statuses && !statuses.includes(it.status)) return false;
    if (!kw) return true;
    const hay = `${it.title ?? ''} ${it.topic ?? ''} ${it.slug ?? ''}`.toLowerCase();
    return hay.includes(kw);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const safePage = computed(() => Math.min(page.value, totalPages.value));
const pageItems = computed(() => {
  const p = safePage.value;
  return filtered.value.slice((p - 1) * pageSize, p * pageSize);
});
const rangeStart = computed(() => (filtered.value.length ? (safePage.value - 1) * pageSize + 1 : 0));
const rangeEnd = computed(() => Math.min(safePage.value * pageSize, filtered.value.length));

const pageNums = computed(() => {
  const total = totalPages.value;
  const cur = safePage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, cur, cur - 1, cur + 1]);
  const sorted = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | string)[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push('...');
    out.push(n);
    prev = n;
  }
  return out;
});

watch([activeTab, keyword], () => { page.value = 1; });
watch(totalPages, (tp) => { if (page.value > tp) page.value = tp; });

function tabCount(key: TabKey) {
  const c = counters.value;
  if (!c) return 0;
  if (key === 'all') return c.all || 0;
  if (key === 'running') return (c.running || 0) + (c.starting || 0) + (c.awaiting_user || 0);
  if (key === 'interrupted') return (c.failed || 0) + (c.cancelled || 0);
  if (key === 'completed') return c.completed || 0;
  return 0;
}

function itemTitle(it: ArticleLibraryItem) {
  return it.title || it.topic || it.slug || '未命名稿件';
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

function isActive(it: ArticleLibraryItem | null) {
  if (!it) return false;
  return it.status === 'running' || it.status === 'starting' || it.status === 'awaiting_user';
}

function relativeTime(raw?: string) {
  if (!raw) return '—';
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return '—';
  const diff = Date.now() - t;
  if (diff < 0 || diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusLabel(it: ArticleLibraryItem) {
  if (it.status === 'running' || it.status === 'starting') {
    return `生成中 ${it.progress_percent ? `${it.progress_percent}%` : ''}`.trim();
  }
  if (it.status === 'awaiting_user') return '待确认';
  if (it.status === 'completed') return '已完成';
  if (it.status === 'failed') return '失败';
  if (it.status === 'cancelled') return '已取消';
  return it.status;
}

function pillClass(status: string) {
  if (status === 'running' || status === 'starting') return 'ar-pill--warn';
  if (status === 'awaiting_user') return 'ar-pill--primary';
  if (status === 'completed') return 'ar-pill--ok';
  if (status === 'failed') return 'ar-pill--danger';
  return 'ar-pill--muted';
}

function openItem(it: ArticleLibraryItem) {
  router.push(`/dashboard/writing/${encodeURIComponent(it.run_id)}`);
}

function askDelete(it: ArticleLibraryItem) {
  pendingDelete.value = it;
}

async function confirmDelete() {
  if (!pendingDelete.value || deleting.value) return;
  deleting.value = true;
  try {
    await brandApi.deleteArticle(pendingDelete.value.run_id);
    items.value = items.value.filter(x => x.run_id !== pendingDelete.value!.run_id);
    if (counters.value) {
      const st = pendingDelete.value.status;
      if (counters.value[st] != null) counters.value[st] = Math.max(0, (counters.value[st] || 0) - 1);
      counters.value.all = Math.max(0, (counters.value.all || 0) - 1);
    }
    pendingDelete.value = null;
    ElMessage.success('已删除');
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败');
  } finally {
    deleting.value = false;
  }
}

async function load() {
  if (!auth.activeBrandId || !auth.user?.id) {
    items.value = [];
    counters.value = null;
    loading.value = false;
    return;
  }
  const seq = ++loadSeq;
  loading.value = true;
  error.value = '';
  try {
    const res: any = await brandApi.articles(auth.activeBrandId, auth.user.id, 200, 'writing');
    if (seq !== loadSeq) return;
    items.value = res?.items || [];
    counters.value = res?.counters || null;
  } catch (e: any) {
    if (seq !== loadSeq) return;
    error.value = e?.message || '加载失败';
  } finally {
    if (seq === loadSeq) loading.value = false;
  }
}

function setupPoll() {
  if (pollTimer) window.clearInterval(pollTimer);
  const hasActive = items.value.some(it => isActive(it));
  const ms = hasActive ? 10_000 : 60_000;
  pollTimer = window.setInterval(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
    load();
  }, ms);
}

watch(items, () => setupPoll(), { deep: true });
watch(() => auth.activeBrandId, () => load());

onMounted(() => {
  load();
  setupPoll();
});
onUnmounted(() => {
  if (pollTimer) window.clearInterval(pollTimer);
});
</script>

<style lang="scss" scoped>
.ar-page {
  background: #f8fafc;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
}

.ar-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.ar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px !important;
}

.ar-title-block { min-width: 0; flex: 1; }
.ar-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ar-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid transparent;
  transition: background 0.15s, opacity 0.15s;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.ar-btn--ghost {
  color: #2a2d36;
  background: #fff;
  border-color: #e6e8ee;
  &:hover:not(:disabled) { background: #f5f6fa; }
}
.ar-btn--dark {
  color: #fff;
  background: #0f1115;
  border-color: #0f1115;
  &:hover:not(:disabled) { background: #1a1d24; }
}
.ar-btn--danger {
  color: #fff;
  background: #dc2626;
  border: none;
  font-weight: 600;
  &:hover:not(:disabled) { background: #b91c1c; }
  &:disabled { background: #fda4a4; }
}

.ar-search-row {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.ar-search-wrap {
  flex: 1 1 0%;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 10px;
  padding: 0 12px;
  height: 38px;
  box-sizing: border-box;
}

.ar-search-icon {
  flex-shrink: 0;
  display: block;
}

.ar-search-input {
  flex: 1 1 0%;
  min-width: 0;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent;
  font-size: 13px;
  line-height: 1.4;
  color: #0f1115;
  font-family: inherit;
  height: auto;
  padding: 0;
  margin: 0;
  -webkit-appearance: none;
  appearance: none;

  &::placeholder { color: #8a8f9b; }
  &:focus { outline: none; border: none; box-shadow: none; }
}

.ar-tabs-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #e6e8ee;
}
.ar-tabs { display: flex; align-items: center; gap: 0; }
.ar-tab {
  padding: 9px 14px;
  border: none;
  background: transparent;
  color: #5b606a;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  transition: color 0.15s;
  &:hover { color: #0f1115; }
}
.ar-tab--active {
  color: #0f1115;
  font-weight: 700;
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: #0f1115;
    border-radius: 2px;
  }
  .ar-tab-count { background: #0f1115; color: #fff; }
}
.ar-tab-count {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 100px;
  background: #f5f6fa;
  color: #5b606a;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
}
.ar-sort {
  margin-left: auto;
  font-size: 11.5px;
  color: #8a8f9b;
  padding-right: 4px;
  strong { color: #2a2d36; font-weight: 600; }
}

.ar-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.ar-empty {
  padding: 60px 30px;
  text-align: center;
  color: #5b606a;
}
.ar-empty-icon { font-size: 40px; margin-bottom: 16px; line-height: 1; }
.ar-empty-title { font-size: 15px; font-weight: 600; color: #0f1115; margin-bottom: 6px; }
.ar-empty-hint { font-size: 12.5px; color: #8a8f9b; }

.ar-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f1f6;
  cursor: pointer;
  transition: background 120ms;
  &:hover { background: #efecff; }
  &--last { border-bottom: none; }
}
.ar-row-ic {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  flex-shrink: 0;
  background: #efecff;
  color: #6452ff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ar-row-main { flex: 1; min-width: 0; }
.ar-row-title {
  font-weight: 600;
  color: #0f1115;
  font-size: 13.5px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ar-row-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 11.5px;
  color: #8a8f9b;
}
.ar-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
.ar-dot { width: 3px; height: 3px; border-radius: 50%; background: #8a8f9b; }
.ar-evidence { color: #6452ff; font-weight: 600; }
.ar-row-status { flex-shrink: 0; }
.ar-row-actions { display: flex; gap: 6px; flex-shrink: 0; }

.ar-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  font-family: inherit;
  white-space: nowrap;
  border: 1px solid;
}
.ar-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  &--pulse { animation: pulse 1s infinite; }
}
.ar-pill--warn { background: #fff5e3; color: #f5a623; border-color: #f5a623; }
.ar-pill--primary { background: #efecff; color: #6452ff; border-color: #6452ff; }
.ar-pill--ok { background: #e6fbf4; color: #00d4a3; border-color: #00d4a3; }
.ar-pill--danger { background: #fde7e7; color: #dc2626; border-color: #dc2626; }
.ar-pill--muted { background: #f5f6fa; color: #8a8f9b; border-color: #8a8f9b; }

.ar-mini {
  padding: 4px 10px;
  border: 1px solid #e6e8ee;
  background: #fff;
  color: #2a2d36;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  &:hover { background: #f5f6fa; }
}
.ar-del {
  width: 26px;
  height: 26px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 1px solid #e6e8ee;
  background: #fff;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { background: #fef2f2; }
}

.ar-pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
}
.ar-pager-info {
  font-size: 12px;
  color: #5b606a;
  strong {
    color: #0f1115;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-weight: 700;
  }
}
.ar-pager-btns { display: flex; gap: 4px; }
.ar-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  background: #fff;
  border: 1px solid #e6e8ee;
  color: #5b606a;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  &.on {
    background: #0f1115;
    border-color: #0f1115;
    color: #fff;
    font-weight: 700;
  }
  &:disabled:not(.on) {
    background: #f5f6fa;
    color: #8a8f9b;
    cursor: not-allowed;
  }
}
.ar-page-dots {
  min-width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: #8a8f9b;
  font-size: 12px;
}

.ar-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 17, 21, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.ar-modal {
  width: 440px;
  max-width: 96vw;
  background: #fff;
  border-radius: 14px;
  padding: 24px 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}
.ar-modal-hd {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.ar-modal-ic {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #fef2f2;
  color: #dc2626;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.ar-modal-title { font-size: 16px; font-weight: 700; color: #0f1115; }
.ar-modal-body {
  font-size: 13px;
  color: #2a2d36;
  line-height: 1.65;
  margin-bottom: 6px;
  strong { color: #0f1115; word-break: break-all; }
}
.ar-modal-warn {
  margin-top: 10px;
  padding: 10px 12px;
  background: #fff8e6;
  border: 1px solid rgba(245, 166, 35, 0.25);
  border-radius: 8px;
  font-size: 12px;
  color: #8a5a00;
  line-height: 1.55;
  strong { font-weight: 700; color: #6b4500; }
}
.ar-modal-tip { margin-top: 16px; font-size: 11.5px; color: #8a8f9b; }
.ar-modal-ft {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.ar-spin { animation: spin 1s linear infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
