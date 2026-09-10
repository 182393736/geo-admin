<template>
  <div class="page-container">
    <h2 class="page-title">流水线时间轴</h2>
    <p class="page-desc">每个品牌 × 每天：槽位 → 采集 → AI 解析 → 指标聚合 → 报告，各阶段状态与出错原因</p>

    <div class="toolbar">
      <a-select v-model="brandFilter" placeholder="选择品牌" style="width: 260px" allow-clear allow-search @change="loadDays(1)">
        <a-option v-for="b in brands" :key="b.brand_id" :value="b.brand_id">{{ b.name }}</a-option>
      </a-select>
      <a-date-picker v-model="fromDate" style="width: 150px" placeholder="开始日期" @change="loadDays(1)" />
      <span class="muted">~</span>
      <a-date-picker v-model="toDate" style="width: 150px" placeholder="结束日期" @change="loadDays(1)" />
      <a-button type="primary" @click="loadDays(1)">查询</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="key" size="medium">
        <template #task_status="{ record }">
          <a-tag :color="statusColor(record.task_status)" size="small">{{ record.task_status }}</a-tag>
        </template>
        <template #rate="{ record }">
          <a-progress :percent="(record.completeness_rate ?? 0) / 100" :size="'small'" :show-text="true" />
        </template>
        <template #stages="{ record }">
          <span class="stage-cell">
            <a-tag v-for="s in stageKeys" :key="s" :color="stageColor(record.stages?.[s])" size="small" class="stage-tag">
              {{ stageShort(s) }}<template v-if="record.stages?.[s] !== 'none'">·{{ record.stages[s] }}</template>
            </a-tag>
          </span>
        </template>
        <template #has_error="{ record }">
          <a-tag :color="record.has_error ? 'red' : 'green'" size="small">{{ record.has_error ? '有错误' : '正常' }}</a-tag>
        </template>
        <template #op="{ record }">
          <a-link @click="openTimeline(record)">时间轴</a-link>
        </template>
      </a-table>
      <div class="pager">
        <a-pagination :total="total" :current="page" :page-size="20" show-total @change="loadDays" />
      </div>
    </div>

    <!-- 时间轴抽屉 -->
    <a-drawer
      :visible="drawer"
      :width="960"
      :title="`流水线时间轴 · ${tl?.brand?.name || ''} · ${tl?.date || ''}`"
      @cancel="drawer = false"
      :footer="false"
    >
      <a-spin :loading="tlLoading">
        <template v-if="tl">
          <!-- 任务概览 -->
          <div class="kv-row mb">
            <span>任务</span><span class="muted">{{ tl.task?.task_id || '—' }}</span>
            <span>应采/已采/失败</span>
            <span class="muted">{{ tl.task?.expected_slots ?? 0 }} / {{ tl.task?.actual_slots ?? 0 }} / {{ tl.task?.failed_slots ?? 0 }}</span>
          </div>
          <div class="kv-row mb">
            <span>回答</span>
            <span class="muted">共 {{ tl.answers.total }} · 已解析 {{ tl.answers.parsed }} · 待解析 {{ tl.answers.unparsed }}</span>
            <span>报告</span>
            <span class="muted">{{ tl.report ? `${tl.report.label}（${tl.report.status}）` : '尚未生成' }}</span>
          </div>

          <!-- 时间轴 -->
          <h4 class="sec">处理时间轴</h4>
          <div class="timeline">
            <div v-for="(s, i) in stageKeys" :key="s" class="tl-item">
              <div class="tl-rail">
                <span class="tl-dot" :style="{ background: dotColor(stageStatus(s)) }"></span>
                <span v-if="i < stageKeys.length - 1" class="tl-line"></span>
              </div>
              <div class="tl-body">
                <div class="tl-head">
                  <span class="tl-title">{{ stageLabel(s) }}</span>
                  <a-tag :color="stageColor(stageStatus(s))" size="small">{{ stageStatusText(s) }}</a-tag>
                  <span v-if="stageEvent(s)?.updated_at" class="tl-time">{{ fmtTime(stageEvent(s).updated_at) }}</span>
                </div>
                <div v-if="stageEvent(s)?.message" class="tl-msg">{{ stageEvent(s).message }}</div>
                <div v-if="stageEvent(s)?.error" class="tl-error">⚠ {{ stageEvent(s).error }}</div>
                <div v-if="stageEvent(s)?.detail && Object.keys(stageEvent(s).detail).length" class="tl-detail">
                  <span v-for="(v, k) in stageEvent(s).detail" :key="k" class="tl-kv">{{ k }}={{ formatVal(v) }}</span>
                </div>
                <div v-if="stageStatus(s) === 'none'" class="tl-msg muted">该阶段尚未执行</div>
              </div>
            </div>
          </div>

          <!-- 槽位明细 -->
          <h4 class="sec">槽位明细</h4>
          <div class="mb">
            <span v-for="(n, st) in tl.slots.summary" :key="st" class="chip" :style="{ background: slotBg(st) }">{{ st }} {{ n }}</span>
          </div>
          <a-table :data="tl.slots.list" :columns="slotCols" :pagination="false" size="small" row-key="slot_id">
            <template #status="{ record }">
              <a-tag :color="statusColor(record.status)" size="small">{{ record.status }}</a-tag>
            </template>
          </a-table>

          <!-- 失败原因 -->
          <template v-if="tl.slots.errors.length">
            <h4 class="sec">失败原因（{{ tl.slots.errors.length }}）</h4>
            <div class="err-list">
              <div v-for="(e, i) in tl.slots.errors" :key="i" class="err-item">
                <span class="mono">{{ e.slot_id }}</span>
                <span class="muted">平台 {{ e.platform }} · query {{ e.query_id }} · 尝试 {{ e.attempts }} 次</span>
                <span class="err-text">{{ e.error }}</span>
              </div>
            </div>
          </template>

          <!-- 最终计算结果 -->
          <h4 class="sec">最终计算结果（当日入库）</h4>
          <div class="result-grid">
            <StatCard label="品牌提及" :value="tl.results.mentions" />
            <StatCard label="观点" :value="tl.results.opinions" />
            <StatCard label="引用边" :value="tl.results.citation_edges" />
            <StatCard label="问题日指标" :value="tl.results.daily_metric_queries" />
            <StatCard label="口碑日指标" :value="tl.results.daily_metric_brands" />
            <StatCard label="信源日统计" :value="tl.results.source_daily_stats" />
            <StatCard label="榜单快照" :value="tl.results.leaderboard_dailies" />
          </div>
        </template>
      </a-spin>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import StatCard from '@/components/StatCard.vue';
import { adminApi } from '@/api/admin';
import type { AdminPipelineDayRow, AdminPipelineTimeline, AdminBrandRow } from '@geo-admin/contracts';

const stageKeys = ['expand', 'collect', 'parse', 'aggregate', 'report'] as const;
const stageLabel: Record<string, string> = {
  expand: '展开任务', collect: '采集执行', parse: 'AI 解析', aggregate: '指标聚合', report: '报告生成',
};
const stageShort = (s: string) => ({ expand: '展', collect: '采', parse: '析', aggregate: '聚', report: '报' }[s] || s);

// 筛选
const brands = ref<AdminBrandRow[]>([]);
const brandFilter = ref<string>('');
const fromDate = ref<any>('');
const toDate = ref<any>('');
const rows = ref<(AdminPipelineDayRow & { key: string })[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);

const cols = [
  { title: '品牌', dataIndex: 'brand_name', width: 200, ellipsis: true },
  { title: '日期', dataIndex: 'date', width: 110 },
  { title: '任务', slotName: 'task_status', width: 90 },
  { title: '完成率', slotName: 'rate', width: 140 },
  { title: '阶段', slotName: 'stages', width: 300 },
  { title: '健康', slotName: 'has_error', width: 80 },
  { title: '最新事件', dataIndex: 'latest_event_at', width: 150, render: ({ record }: any) => record.latest_event_at ? fmtTime(record.latest_event_at) : '—' },
  { title: '', slotName: 'op', width: 70, fixed: 'right' as const },
];

const slotCols = [
  { title: '问题ID', dataIndex: 'query_id', width: 80 },
  { title: '平台', dataIndex: 'platform', width: 90 },
  { title: '发出问题', dataIndex: 'question_sent', ellipsis: true },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '尝试', dataIndex: 'attempts', width: 60 },
  { title: '错误', dataIndex: 'error', ellipsis: true, width: 160 },
];

function fmtDate(d: any) {
  if (!d) return undefined;
  if (d instanceof Date) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return String(d).slice(0, 10);
}
function fmtTime(t: string | Date) {
  if (!t) return '—';
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function formatVal(v: any) {
  if (Array.isArray(v)) return v.join(',');
  if (v && typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
function statusColor(s: string) {
  return s === 'ok' ? 'green' : s === 'running' || s === 'created' ? 'arcoblue' : s === 'empty' || s === 'partial' ? 'orange' : 'red';
}
function stageColor(s?: string) {
  return s === 'ok' ? 'green' : s === 'running' || s === 'pending' ? 'arcoblue' : s === 'partial' ? 'orange' : s === 'fail' ? 'red' : 'gray';
}
function dotColor(s: string) {
  return s === 'ok' ? '#16a34a' : s === 'running' || s === 'pending' ? '#2563eb' : s === 'partial' ? '#f59e0b' : s === 'fail' ? '#dc2626' : '#d1d5db';
}
function slotBg(s: string) {
  return s === 'ok' ? '#dcfce7' : s === 'fail' ? '#fee2e2' : s === 'empty' ? '#ffedd5' : '#e0e7ff';
}

async function loadBrands() {
  const d = await adminApi.brands({ page: 1, page_size: 100 });
  brands.value = d.list;
}

async function loadDays(p = 1) {
  loading.value = true;
  page.value = p;
  try {
    const d = await adminApi.pipelineDays({
      page: p, page_size: 20,
      brand_id: brandFilter.value,
      from: fmtDate(fromDate.value), to: fmtDate(toDate.value),
    });
    rows.value = d.list.map(r => ({ ...r, key: `${r.brand_id}|${r.date}` }));
    total.value = d.total;
  } finally {
    loading.value = false;
  }
}

// 时间轴抽屉
const drawer = ref(false);
const tlLoading = ref(false);
const tl = ref<AdminPipelineTimeline | null>(null);
const eventByStage = (s: string) => (tl.value?.timeline || []).find(e => e.stage === s);
const stageEvent = eventByStage;
const stageStatus = (s: string) => eventByStage(s)?.status || 'none';
const stageStatusText = (s: string) => {
  const st = stageStatus(s);
  return st === 'none' ? '未开始' : st;
};

async function openTimeline(row: AdminPipelineDayRow) {
  drawer.value = true;
  tl.value = null;
  tlLoading.value = true;
  try {
    tl.value = await adminApi.pipelineTimeline(row.brand_id, row.date);
  } finally {
    tlLoading.value = false;
  }
}

onMounted(async () => {
  await loadBrands();
  loadDays(1);
});
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.mb { margin-bottom: 12px; }
.sec { margin: 18px 0 8px; font-size: 14px; color: #1f2430; }
.kv-row { display: flex; gap: 20px; align-items: center; font-size: 13px; margin-bottom: 6px; flex-wrap: wrap; }
.kv-row > span:nth-child(odd) { color: #6b7280; flex-shrink: 0; }
.chip { display: inline-block; border-radius: 4px; padding: 2px 10px; margin-right: 8px; font-size: 12px; color: #1f2430; }
.stage-cell { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.stage-tag { margin-right: 0; }

.timeline { padding-left: 4px; }
.tl-item { display: flex; gap: 14px; }
.tl-rail { display: flex; flex-direction: column; align-items: center; width: 14px; flex-shrink: 0; }
.tl-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
.tl-line { flex: 1; width: 2px; background: #e5e7eb; margin: 4px 0; }
.tl-body { flex: 1; padding: 0 0 18px 2px; }
.tl-head { display: flex; align-items: center; gap: 10px; }
.tl-title { font-weight: 600; font-size: 14px; color: #1f2430; }
.tl-time { font-size: 12px; color: #9ca3af; }
.tl-msg { margin-top: 4px; font-size: 13px; color: #374151; }
.tl-error { margin-top: 4px; font-size: 13px; color: #dc2626; }
.tl-detail { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px; }
.tl-kv { font-size: 12px; color: #4b5563; background: #f3f4f6; border-radius: 4px; padding: 1px 8px; }

.err-list { display: flex; flex-direction: column; gap: 6px; }
.err-item { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 12.5px; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 6px; padding: 6px 10px; }
.err-text { color: #dc2626; }

.result-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
</style>
