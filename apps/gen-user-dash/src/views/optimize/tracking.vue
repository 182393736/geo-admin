<template>
  <div class="tk-page geo-page">
    <div class="tk-header geo-page-header">
      <div class="tk-title-block">
        <h2 class="tk-title geo-page-title">稿件追踪</h2>
        <p class="tk-desc geo-page-desc">已上线文章统一台账（手动登记 + 发稿自动同步），持续追踪每一篇在 AI 回答中的被引表现；创作中稿件请见「稿件库」</p>
      </div>
      <div class="tk-header-actions">
        <button class="tk-btn tk-btn--ghost" type="button" @click="goRecords">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          发稿记录
        </button>
        <button class="tk-btn tk-btn--ghost" type="button" @click="goNewArticle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          新建稿件
        </button>
        <button class="tk-btn tk-btn--ghost" type="button" :disabled="!rows.length" @click="exportXlsx">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
          导出
        </button>
        <button class="tk-btn tk-btn--primary" type="button" @click="importOpen = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          导入自有文章
        </button>
      </div>
    </div>

    <div class="geo-page-stack">
      <!-- 日期 + 统计 -->
      <div class="tk-period-card">
        <div class="tk-date-row">
          <span class="tk-date-label">引用统计周期</span>
          <input v-model="rangeStart" class="tk-date-input" type="date" @change="onDateChange" />
          <span class="tk-date-sep">至</span>
          <input v-model="rangeEnd" class="tk-date-input" type="date" @change="onDateChange" />
          <span class="tk-date-hint">（默认最近 30 天，最长 31 天；仅按引用发生时间统计，不影响已导入稿件展示）</span>
        </div>
        <div class="tk-stats">
          <div class="tk-stat-card">
            <span class="tk-stat-label">全部已导入稿件</span>
            <div class="tk-stat-value"><b class="tk-stat-num">{{ stats.imported }}</b><span class="tk-stat-unit">篇</span></div>
          </div>
          <div class="tk-stat-card">
            <span class="tk-stat-label">周期内被 AI 引用文章数</span>
            <div class="tk-stat-value">
              <b class="tk-stat-num">{{ stats.period_cited_articles }}</b>
              <span class="tk-stat-unit">篇 · <span class="tk-stat-pct">{{ stats.cite_rate }}%</span></span>
            </div>
          </div>
          <div class="tk-stat-card">
            <span class="tk-stat-label">周期内被引次数</span>
            <div class="tk-stat-value"><b class="tk-stat-num">{{ stats.period_cite_times }}</b><span class="tk-stat-unit">次</span></div>
          </div>
        </div>
      </div>

      <div class="tk-card">
        <div class="tk-filter-bar">
          <div class="tk-filter-group">
            <span class="tk-filter-label">关键词类型</span>
            <select v-model="filters.query_type" class="tk-select" @change="reload(1)">
              <option value="">全部</option>
              <option value="industry">排行词</option>
              <option value="brand">口碑词</option>
            </select>
          </div>
          <div class="tk-filter-group">
            <span class="tk-filter-label">AI 引擎</span>
            <select v-model="filters.engine" class="tk-select" @change="reload(1)">
              <option value="">全部</option>
              <option value="doubao">豆包</option>
              <option value="wenxin">文心一言</option>
              <option value="deepseek">DeepSeek</option>
              <option value="qwen">通义千问</option>
              <option value="yuanbao">元宝</option>
            </select>
          </div>
          <div class="tk-filter-group tk-filter-group--query">
            <span class="tk-filter-label">监控问题</span>
            <DashQuerySelect
              v-model="filters.query_id"
              v-model:label="queryLabel"
              :options="queryOptions"
              btn-class="tk-query-btn"
              wrap-class="tk-query-wrap"
              @change="reload(1)"
            />
          </div>
          <div class="tk-filter-group">
            <span class="tk-filter-label">来源</span>
            <select v-model="filters.source_kind" class="tk-select" @change="reload(1)">
              <option value="">全部</option>
              <option value="own">手动登记</option>
              <option value="publish">发稿同步</option>
            </select>
          </div>
          <div class="tk-filter-group">
            <span class="tk-filter-label">内容类型</span>
            <select v-model="filters.content_type" class="tk-select" @change="reload(1)">
              <option value="">全部</option>
              <option value="graphic">图文</option>
              <option value="video">视频</option>
            </select>
          </div>
          <div class="tk-filter-group">
            <span class="tk-filter-label">引用状态</span>
            <select v-model="filters.cite" class="tk-select" @change="reload(1)">
              <option value="all">全部</option>
              <option value="cited">已引用</option>
              <option value="uncited">未引用</option>
            </select>
          </div>
          <div class="tk-search-wrap">
            <svg class="tk-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
            <input
              v-model="filters.q"
              class="tk-search-input"
              type="text"
              placeholder="搜索标题 / URL…"
              @keydown.enter="reload(1)"
            />
          </div>
        </div>

        <div class="tk-toolbar">
          <div class="tk-toolbar-left">
            <button
              type="button"
              class="tk-sort-btn"
              :class="{ 'tk-sort-btn--active': sortBy === 'registered_at' }"
              @click="toggleSort('registered_at')"
            >
              登记时间 {{ sortBy === 'registered_at' ? (sortAsc ? '↑' : '↓') : '' }}
            </button>
            <button
              type="button"
              class="tk-sort-btn"
              :class="{ 'tk-sort-btn--active': sortBy === 'cite' }"
              @click="toggleSort('cite')"
            >
              被引 {{ sortBy === 'cite' ? (sortAsc ? '↑' : '↕') : '↕' }}
            </button>
          </div>
        </div>

        <div class="tk-table-wrap">
          <table class="tk-table">
            <thead>
              <tr>
                <th class="tk-th tk-th--article">文章</th>
                <th class="tk-th">来源</th>
                <th class="tk-th">类型</th>
                <th class="tk-th">登记时间</th>
                <th class="tk-th">被引</th>
                <th class="tk-th">收录引擎</th>
                <th class="tk-th">引用状态</th>
                <th class="tk-th">引用明细</th>
                <th class="tk-th tk-th--action">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td class="tk-empty" colspan="9">加载中…</td>
              </tr>
              <tr v-else-if="!rows.length">
                <td class="tk-empty" colspan="9">该筛选下暂无文章 · 点击右上角「导入自有文章」开始登记</td>
              </tr>
              <tr v-for="row in rows" :key="row.article_id" class="tk-tr">
                <td class="tk-td tk-td--article">
                  <div class="tk-article-title">{{ row.title || '未命名文章' }}</div>
                  <a v-if="row.url" class="tk-article-url" :href="row.url" target="_blank" rel="noopener">{{ row.url }}</a>
                </td>
                <td class="tk-td">
                  <span class="tk-source" :class="row.source_kind === 'publish' ? 'tk-source--sync' : 'tk-source--manual'">
                    {{ row.source_label || (row.source_kind === 'publish' ? '发稿' : '登记') }}
                  </span>
                </td>
                <td class="tk-td">{{ row.content_label || (row.content_type === 'video' ? '视频' : '图文') }}</td>
                <td class="tk-td tk-td--time">{{ row.registered_at || '—' }}</td>
                <td class="tk-td">
                  <span class="tk-cite-count" :class="{ 'tk-cite-count--zero': !row.cite_count }">{{ row.cite_count || 0 }} 次</span>
                </td>
                <td class="tk-td">
                  <span class="tk-engine" :class="{ 'tk-engine--zero': !row.engine_count }">{{ row.engine_count || 0 }}/5</span>
                </td>
                <td class="tk-td">
                  <span class="tk-status" :class="row.cited ? 'tk-status--cited' : 'tk-status--uncited'">
                    {{ row.cited ? '已引用' : '未引用' }}
                  </span>
                </td>
                <td class="tk-td">
                  <button class="tk-detail-btn" type="button" @click="openCites(row)">查看明细</button>
                </td>
                <td class="tk-td tk-td--action">
                  <a v-if="row.url" class="tk-action" :href="row.url" target="_blank" rel="noopener">打开</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="tk-pagination">
          <span class="tk-page-info">显示 {{ rangeLabel }} · 共 {{ total }} 条</span>
          <div class="tk-page-controls">
            <button class="tk-page-btn" type="button" :disabled="page <= 1" @click="reload(page - 1)">‹ 上一页</button>
            <button
              v-for="p in pageButtons"
              :key="p"
              type="button"
              class="tk-page-btn"
              :class="{ 'tk-page-btn--active': p === page }"
              @click="reload(p)"
            >{{ p }}</button>
            <button class="tk-page-btn" type="button" :disabled="page >= totalPages" @click="reload(page + 1)">下一页 ›</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入弹层 -->
    <div v-if="importOpen" class="tk-modal-mask" @click.self="importOpen = false">
      <div class="tk-modal tk-modal--import">
        <div class="tk-modal-head">
          <div>
            <div class="tk-modal-title">导入自有文章</div>
            <div class="tk-modal-sub">登记后系统持续监控它在 AI 回答中的被引情况，并计入深度分析</div>
          </div>
          <button type="button" class="tk-modal-x" @click="importOpen = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="tk-modal-body">
          <div class="tk-import-section-head">
            <span>文章标题与链接</span>
            <em>支持粘贴多行（标题 Tab 链接，或每行一条链接）</em>
          </div>
          <div class="tk-import-table">
            <div class="tk-import-thead">
              <span>类型</span><span>标题</span><span>链接</span><span></span>
            </div>
            <div v-for="(row, idx) in importRows" :key="idx" class="tk-import-row">
              <select v-model="row.type">
                <option value="graphic">图文</option>
                <option value="video">视频</option>
              </select>
              <input v-model="row.title" type="text" placeholder="文章标题" @paste="onPasteRows($event, idx)" />
              <input v-model="row.url" type="text" placeholder="https://..." />
              <button type="button" class="tk-import-del" :disabled="importRows.length <= 1" @click="importRows.splice(idx, 1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
              </button>
            </div>
          </div>
          <button type="button" class="tk-add-row" @click="importRows.push({ type: 'graphic', title: '', url: '' })">+ 添加一行</button>

          <div class="tk-import-section-head tk-import-section-head--excel">
            <span>或上传 Excel 批量导入</span>
            <button type="button" class="tk-tpl-btn" @click="downloadTemplate">下载导入模板</button>
          </div>
          <label class="tk-excel-box">
            <input type="file" accept=".xlsx,.xls" class="tk-file-hidden" @change="onExcelPick" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6452ff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            <div>
              <strong>点击上传 Excel</strong>
              <p>需包含「内容类型、标题、URL/链接」列 · 支持 .xlsx / .xls</p>
            </div>
            <span class="tk-excel-status">{{ excelName || '未选择' }}</span>
          </label>
        </div>
        <div class="tk-modal-foot">
          <p class="tk-import-tip">自有文章导入后计入「自有文章覆盖」与被引用监控，可衡量 GEO 投放效果。</p>
          <div class="tk-modal-actions">
            <button type="button" class="tk-btn tk-btn--ghost" @click="importOpen = false">取消</button>
            <button type="button" class="tk-btn tk-btn--primary" :disabled="importing" @click="submitImport">
              {{ importing ? '导入中…' : '导入并开始监控' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 引用明细 -->
    <div v-if="citesOpen" class="tk-modal-mask" @click.self="citesOpen = false">
      <div class="tk-modal tk-modal--cites">
        <div class="tk-modal-head">
          <div>
            <div class="tk-modal-title">引用明细</div>
            <div class="tk-modal-sub">{{ citesRow?.title }}</div>
          </div>
          <button type="button" class="tk-modal-x" @click="citesOpen = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="tk-modal-body">
          <div v-if="citesLoading" class="tk-empty">加载中…</div>
          <div v-else-if="!citesList.length" class="tk-empty">周期内暂无引用记录</div>
          <table v-else class="tk-cites-table">
            <thead>
              <tr><th>日期</th><th>引擎</th><th>问题</th><th>类型</th></tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in citesList" :key="i">
                <td>{{ c.date }}</td>
                <td>{{ c.platform_label || c.platform }}</td>
                <td>{{ c.query_text || c.query_id || '—' }}</td>
                <td>{{ c.query_type === 'brand' ? '口碑词' : c.query_type === 'industry' ? '排行词' : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';
import { publishApi } from '@/api/modules/report';
import { monitorApi } from '@/api/modules/monitor';
import DashQuerySelect from '@/components/DashQuerySelect.vue';
import { downloadAoaSheets } from '@/utils/xlsxExport';
import { toast } from '@/lib/toast';

type Row = {
  article_id: string;
  title?: string;
  url?: string | null;
  source_kind?: string;
  source_label?: string;
  content_type?: string;
  content_label?: string;
  registered_at?: string | null;
  cite_count?: number;
  engine_count?: number;
  cited?: boolean;
};

const router = useRouter();
const PAGE_SIZE = 20;

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { start: fmtDate(start), end: fmtDate(end) };
}

const initRange = defaultRange();
const rangeStart = ref(initRange.start);
const rangeEnd = ref(initRange.end);
const loading = ref(false);
const rows = ref<Row[]>([]);
const total = ref(0);
const page = ref(1);
const sortBy = ref<'registered_at' | 'cite'>('registered_at');
const sortAsc = ref(false);
const stats = reactive({
  imported: 0,
  period_cited_articles: 0,
  period_cite_times: 0,
  cite_rate: 0,
});
const filters = reactive({
  query_type: '',
  engine: '',
  query_id: 0 as string | number,
  source_kind: '',
  content_type: '',
  cite: 'all',
  q: '',
});
const queryOptions = ref<{ value: string | number; label: string }[]>([]);
const queryLabel = ref('全部问题');

const importOpen = ref(false);
const importing = ref(false);
const importRows = ref([{ type: 'graphic', title: '', url: '' }]);
const excelName = ref('');

const citesOpen = ref(false);
const citesLoading = ref(false);
const citesRow = ref<Row | null>(null);
const citesList = ref<any[]>([]);

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

function clampRange() {
  const s = new Date(rangeStart.value);
  const e = new Date(rangeEnd.value);
  if (!Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime())) return;
  if (e < s) {
    rangeEnd.value = rangeStart.value;
    return;
  }
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  if (diff > 31) {
    const capped = new Date(s);
    capped.setDate(s.getDate() + 30);
    rangeEnd.value = fmtDate(capped);
    toast.info('统计周期最长 31 天');
  }
}

function onDateChange() {
  clampRange();
  reload(1);
}

function toggleSort(key: 'registered_at' | 'cite') {
  if (sortBy.value === key) sortAsc.value = !sortAsc.value;
  else {
    sortBy.value = key;
    sortAsc.value = false;
  }
  reload(1);
}

async function loadQueries() {
  try {
    const qt = filters.query_type === 'brand' || filters.query_type === 'industry'
      ? filters.query_type
      : 'all';
    const resp: any = await monitorApi.queryList(qt as any);
    const list = resp?.list || resp || [];
    queryOptions.value = (Array.isArray(list) ? list : []).map((q: any) => ({
      value: q.id ?? q.query_id,
      label: q.query || q.query_text || q.text || q.name || `问题 ${q.id ?? q.query_id}`,
    })).filter((o: { value: any }) => o.value != null && o.value !== '');
  } catch {
    queryOptions.value = [];
  }
}

async function reload(pageNo = page.value) {
  loading.value = true;
  page.value = pageNo;
  try {
    const resp: any = await publishApi.articleLibrary({
      page: pageNo,
      page_size: PAGE_SIZE,
      start_date: rangeStart.value,
      end_date: rangeEnd.value,
      query_type: filters.query_type || undefined,
      engine: filters.engine || undefined,
      query_id: filters.query_id && filters.query_id !== 0 ? filters.query_id : undefined,
      source_kind: filters.source_kind || undefined,
      content_type: filters.content_type || undefined,
      cite: filters.cite,
      q: filters.q.trim() || undefined,
      sort_by: sortBy.value === 'cite' ? 'cite' : 'registered_at',
      sort_order: sortAsc.value ? 'asc' : 'desc',
    });
    rows.value = resp?.list || [];
    total.value = Number(resp?.total || 0);
    const s = resp?.stats || {};
    stats.imported = Number(s.imported || 0);
    stats.period_cited_articles = Number(s.period_cited_articles || 0);
    stats.period_cite_times = Number(s.period_cite_times || 0);
    stats.cite_rate = Number(s.cite_rate || 0);
  } catch (e: any) {
    rows.value = [];
    toast.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function goRecords() { router.push('/dashboard/media-library/records'); }
function goNewArticle() { router.push('/dashboard/new-agent/articles'); }

function onPasteRows(e: ClipboardEvent, idx: number) {
  const text = e.clipboardData?.getData('text') || '';
  if (!text.includes('\n') && !text.includes('\t')) return;
  e.preventDefault();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = lines.map(line => {
    const parts = line.split(/\t+/);
    if (parts.length >= 2) return { type: 'graphic', title: parts[0], url: parts[1] };
    return { type: 'graphic', title: '', url: line };
  });
  importRows.value.splice(idx, 1, ...parsed);
}

function downloadTemplate() {
  downloadAoaSheets(
    [{
      name: '导入模板',
      rows: [
        [ '内容类型', '标题', 'URL/链接' ],
        [ '图文', '示例标题', 'https://example.com/article' ],
        [ '视频', '示例视频', 'https://example.com/video' ],
      ],
      cols: [ { wch: 10 }, { wch: 36 }, { wch: 48 } ],
    }],
    '自有文章导入模板.xlsx',
  );
}

async function onExcelPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  (e.target as HTMLInputElement).value = '';
  if (!f) return;
  excelName.value = f.name;
  try {
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const header = (aoa[0] || []).map((h: any) => String(h || ''));
    const typeIdx = header.findIndex(h => /类型|type/i.test(h));
    const titleIdx = header.findIndex(h => /标题|title/i.test(h));
    const urlIdx = header.findIndex(h => /url|链接|link/i.test(h));
    const parsed = aoa.slice(1).map(row => {
      const typeRaw = String(row[typeIdx >= 0 ? typeIdx : 0] || '');
      const type = /视频|video/i.test(typeRaw) ? 'video' : 'graphic';
      return {
        type,
        title: String(row[titleIdx >= 0 ? titleIdx : 1] || ''),
        url: String(row[urlIdx >= 0 ? urlIdx : 2] || ''),
      };
    }).filter(r => r.url.trim());
    if (!parsed.length) {
      toast.error('未解析到有效行');
      return;
    }
    importRows.value = parsed;
    toast.success(`已载入 ${parsed.length} 行`);
  } catch (err: any) {
    toast.error(err?.message || 'Excel 解析失败');
  }
}

async function submitImport() {
  const items = importRows.value
    .map(r => ({ title: r.title.trim(), url: r.url.trim(), type: r.type }))
    .filter(r => r.url);
  if (!items.length) {
    toast.error('请至少填写一条有效链接');
    return;
  }
  importing.value = true;
  try {
    const resp: any = await monitorApi.importOwnArticles(items);
    toast.success(`已导入 ${resp?.count || items.length} 篇`);
    importOpen.value = false;
    importRows.value = [{ type: 'graphic', title: '', url: '' }];
    excelName.value = '';
    await reload(1);
  } catch (e: any) {
    toast.error(e?.message || '导入失败');
  } finally {
    importing.value = false;
  }
}

async function openCites(row: Row) {
  citesRow.value = row;
  citesOpen.value = true;
  citesLoading.value = true;
  citesList.value = [];
  try {
    const resp: any = await publishApi.articleCites({
      article_id: row.article_id,
      start_date: rangeStart.value,
      end_date: rangeEnd.value,
    });
    citesList.value = resp?.list || [];
  } catch (e: any) {
    toast.error(e?.message || '加载明细失败');
  } finally {
    citesLoading.value = false;
  }
}

function exportXlsx() {
  const header = [ '标题', 'URL', '来源', '类型', '登记时间', '被引次数', '收录引擎', '引用状态' ];
  const data = rows.value.map(r => [
    r.title || '',
    r.url || '',
    r.source_label || '',
    r.content_label || '',
    r.registered_at || '',
    r.cite_count || 0,
    `${r.engine_count || 0}/5`,
    r.cited ? '已引用' : '未引用',
  ]);
  downloadAoaSheets(
    [{ name: '稿件追踪', rows: [ header, ...data ], cols: [ { wch: 40 }, { wch: 48 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 } ] }],
    `稿件追踪_${rangeStart.value}_${rangeEnd.value}.xlsx`,
  );
}

watch(() => filters.query_type, async () => {
  filters.query_id = 0;
  queryLabel.value = '全部问题';
  await loadQueries();
  reload(1);
});

onMounted(async () => {
  await loadQueries();
  await reload(1);
});
</script>

<style lang="scss" scoped>
.tk-page {
  background: #f8fafc;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
  font-size: 16px;
}
.tk-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.tk-title-block { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.tk-header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }

.tk-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid;
  transition: background 0.15s;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.tk-btn--ghost {
  color: #2a2d36;
  background: #fff;
  border-color: #e6e8ee;
  &:hover { background: #f5f6fa; }
}
.tk-btn--primary {
  color: #fff;
  background: #6452ff;
  border-color: #6452ff;
  &:hover { background: #5340f0; }
}

.tk-period-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.tk-date-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tk-date-label { font-size: 13px; font-weight: 600; color: #0f1115; white-space: nowrap; }
.tk-date-sep { font-size: 12px; color: #8a8f9b; }
.tk-date-input {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  font-size: 12.5px;
  font-family: inherit;
  color: #0f1115;
  background: #fff;
}
.tk-date-hint { font-size: 11.5px; color: #8a8f9b; line-height: 17px; }

.tk-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.tk-stat-card {
  background: #f8fafc;
  border: 1px solid #f0f1f6;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tk-stat-label { font-size: 12.5px; color: #5b606a; }
.tk-stat-value { display: flex; align-items: baseline; gap: 4px; }
.tk-stat-num { font-size: 28px; font-weight: 800; color: #0f1115; line-height: 34px; }
.tk-stat-unit { font-size: 13px; color: #5b606a; font-weight: 500; }
.tk-stat-pct { color: #6452ff; font-weight: 700; }

.tk-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  overflow: hidden;
}
.tk-filter-bar {
  padding: 14px 16px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  border-bottom: 1px solid #f0f1f6;
}
.tk-filter-group { display: flex; flex-direction: column; gap: 4px; }
.tk-filter-label { font-size: 11.5px; color: #8a8f9b; font-weight: 500; }
.tk-select {
  height: 34px;
  padding: 0 8px;
  font-size: 12.5px;
  color: #2a2d36;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  min-width: 100px;
}
.tk-filter-group--query { min-width: 160px; }
:deep(.tk-query-wrap) { width: 100%; }
:deep(.tk-query-btn) {
  min-width: 160px !important;
  max-width: 240px !important;
  height: 34px !important;
  padding: 0 10px !important;
  border-radius: 8px !important;
  font-size: 12.5px !important;
  box-shadow: none !important;
}

.tk-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
  margin-left: auto;
  height: 34px;
  padding: 0 10px 0 32px;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  background: #fff;
}
.tk-search-icon { position: absolute; left: 10px; color: #8a8f9b; }
.tk-search-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12.5px;
  font-family: inherit;
  color: #0f1115;
  &::placeholder { color: #8a8f9b; }
}

.tk-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f1f6;
  display: flex;
  align-items: center;
}
.tk-toolbar-left { display: flex; gap: 6px; }
.tk-sort-btn {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: #5b606a;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f5f6fa; }
}
.tk-sort-btn--active {
  color: #0f1115;
  font-weight: 700;
  background: #f5f6fa;
  border-color: #e6e8ee;
}

.tk-table-wrap { overflow-x: auto; }
.tk-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.tk-th {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #5b606a;
  text-align: left;
  background: #f5f6fa;
  border-bottom: 1px solid #e6e8ee;
  white-space: nowrap;
}
.tk-th--article { width: 32%; }
.tk-th--action { width: 70px; text-align: right; }
.tk-tr {
  border-bottom: 1px solid #f0f1f6;
  &:hover { background: #fafbfc; }
}
.tk-td {
  padding: 12px;
  font-size: 13px;
  color: #2a2d36;
  vertical-align: middle;
  word-break: break-word;
}
.tk-td--article { min-width: 0; }
.tk-article-title { font-size: 13px; font-weight: 600; color: #0f1115; line-height: 1.45; }
.tk-article-url {
  display: block;
  margin-top: 4px;
  font-size: 11.5px;
  color: #6452ff;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:hover { text-decoration: underline; }
}
.tk-td--time { font-size: 12px; color: #8a8f9b; white-space: nowrap; }
.tk-td--action { text-align: right; }
.tk-empty {
  padding: 48px 16px;
  text-align: center;
  font-size: 12.5px;
  color: #8a8f9b;
}

.tk-source {
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}
.tk-source--manual { color: #6452ff; background: #efecff; }
.tk-source--sync { color: #0f9d6b; background: #e8f8f1; }
.tk-cite-count { font-size: 13px; font-weight: 700; color: #0f1115; }
.tk-cite-count--zero { color: #8a8f9b; font-weight: 500; }
.tk-engine { font-size: 12.5px; color: #2a2d36; font-weight: 600; }
.tk-engine--zero { color: #8a8f9b; font-weight: 500; }
.tk-status {
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}
.tk-status--cited { color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; }
.tk-status--uncited { color: #8a8f9b; background: #f5f6fa; border: 1px solid #e6e8ee; }
.tk-detail-btn {
  border: none;
  background: transparent;
  color: #6452ff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  &:hover { text-decoration: underline; }
}
.tk-action {
  font-size: 12.5px;
  font-weight: 600;
  color: #5b606a;
  text-decoration: none;
  &:hover { color: #6452ff; }
}

.tk-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #f0f1f6;
  flex-wrap: wrap;
}
.tk-page-info { font-size: 12px; color: #8a8f9b; }
.tk-page-controls { display: flex; gap: 4px; }
.tk-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  font-size: 12.5px;
  color: #2a2d36;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}
.tk-page-btn--active { background: #0f1115; border-color: #0f1115; color: #fff; }

.tk-modal-mask {
  position: fixed; inset: 0; z-index: 1000; background: rgba(15, 17, 21, 0.4);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.tk-modal {
  width: min(720px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: rgba(15, 17, 21, 0.25) 0 20px 60px;
}
.tk-modal--cites { width: min(680px, 100%); }
.tk-modal-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 16px 18px; border-bottom: 1px solid #e6e8ee;
}
.tk-modal-title { font-size: 15px; font-weight: 700; color: #0f1115; }
.tk-modal-sub { font-size: 12px; color: #8a8f9b; margin-top: 4px; line-height: 1.45; }
.tk-modal-x {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #e6e8ee; background: #fff; color: #5b606a; border-radius: 8px; cursor: pointer;
}
.tk-modal-body { padding: 16px 18px; overflow: auto; }
.tk-modal-foot {
  padding: 12px 18px 16px;
  border-top: 1px solid #f0f1f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.tk-modal-actions { display: flex; gap: 8px; margin-left: auto; }
.tk-import-tip { margin: 0; font-size: 12px; color: #8a8f9b; line-height: 1.5; max-width: 360px; }

.tk-import-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f1115;
  em { font-style: normal; font-size: 11.5px; font-weight: 400; color: #8a8f9b; }
}
.tk-import-section-head--excel { margin-top: 18px; }
.tk-import-table {
  border: 1px solid #e6e8ee;
  border-radius: 10px;
  overflow: hidden;
}
.tk-import-thead, .tk-import-row {
  display: grid;
  grid-template-columns: 88px 1fr 1.2fr 36px;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
}
.tk-import-thead {
  background: #f5f6fa;
  font-size: 12px;
  font-weight: 600;
  color: #5b606a;
}
.tk-import-row {
  border-top: 1px solid #f0f1f6;
  select, input {
    height: 34px;
    border: 1px solid #e6e8ee;
    border-radius: 8px;
    padding: 0 8px;
    font-size: 12.5px;
    font-family: inherit;
    color: #0f1115;
    background: #fff;
    outline: none;
  }
}
.tk-import-del {
  width: 28px; height: 28px; border: none; background: transparent; color: #8a8f9b; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  &:disabled { opacity: 0.35; cursor: not-allowed; }
  &:hover:not(:disabled) { color: #dc2626; }
}
.tk-add-row {
  margin-top: 10px;
  border: none;
  background: transparent;
  color: #6452ff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}
.tk-tpl-btn {
  border: none;
  background: transparent;
  color: #6452ff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.tk-excel-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px dashed #e6e8ee;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  strong { display: block; font-size: 13px; color: #6452ff; }
  p { margin: 2px 0 0; font-size: 11.5px; color: #8a8f9b; }
}
.tk-excel-status { margin-left: auto; font-size: 12px; color: #8a8f9b; white-space: nowrap; }
.tk-file-hidden { display: none; }

.tk-cites-table {
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 8px 10px;
    font-size: 12.5px;
    text-align: left;
    border-bottom: 1px solid #f0f1f6;
  }
  th { background: #f5f6fa; color: #5b606a; font-weight: 600; }
  td { color: #2a2d36; }
}

@media (max-width: 900px) {
  .tk-stats { grid-template-columns: 1fr; }
}
</style>
