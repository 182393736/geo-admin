<template>
  <div class="page-container">
    <h2 class="page-title">采集监控</h2>
    <p class="page-desc">每日采集任务 → 槽位 → 原始回答 → 截图，逐层下钻（只读）</p>

    <a-tabs v-model:active-key="tab">
      <!-- 任务 -->
      <a-tab-pane key="tasks" title="采集任务">
        <div class="toolbar">
          <a-date-picker v-model="fromDate" style="width: 150px" placeholder="开始日期" @change="loadTasks(1)" />
          <span class="muted">~</span>
          <a-date-picker v-model="toDate" style="width: 150px" placeholder="结束日期" @change="loadTasks(1)" />
          <a-select v-model="taskStatus" placeholder="状态" style="width: 140px" allow-clear @change="loadTasks(1)">
            <a-option value="created">created</a-option>
            <a-option value="running">running</a-option>
            <a-option value="ok">ok</a-option>
            <a-option value="fail">fail</a-option>
          </a-select>
          <a-button type="primary" @click="loadTasks(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ taskTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="tasks" :columns="taskCols" :loading="taskLoading" :pagination="false" row-key="task_id" size="medium">
            <template #status="{ record }">
              <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
            </template>
            <template #rate="{ record }">
              <a-progress :percent="(record.completeness_rate ?? 0) / 100" :size="'small'" :show-text="true" />
            </template>
            <template #op="{ record }">
              <a-link @click="openSlots(record)">槽位</a-link>
            </template>
          </a-table>
          <div class="pager">
            <a-pagination :total="taskTotal" :current="taskPage" :page-size="20" show-total @change="loadTasks" />
          </div>
        </div>
      </a-tab-pane>

      <!-- 原始回答 -->
      <a-tab-pane key="answers" title="原始回答">
        <div class="toolbar">
          <a-radio-group v-model="parsedFilter" type="button" @change="loadAnswers(1)">
            <a-radio value="">全部</a-radio>
            <a-radio value="false">未解析</a-radio>
            <a-radio value="true">已解析</a-radio>
          </a-radio-group>
          <a-button type="primary" @click="loadAnswers(1)">刷新</a-button>
          <span class="muted" style="margin-left: auto">共 {{ answerTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="answers" :columns="answerCols" :loading="answerLoading" :pagination="false" row-key="answer_id" size="medium">
            <template #parsed="{ record }">
              <a-tag :color="record.parsed ? 'green' : 'orange'">{{ record.parsed ? '已解析' : '未解析' }}</a-tag>
            </template>
            <template #op="{ record }">
              <a-link @click="openAnswer(record)">查看</a-link>
            </template>
          </a-table>
          <div class="pager">
            <a-pagination :total="answerTotal" :current="answerPage" :page-size="20" show-total @change="loadAnswers" />
          </div>
        </div>
      </a-tab-pane>

      <!-- 截图 -->
      <a-tab-pane key="snapshots" title="截图存证">
        <div class="toolbar">
          <a-button type="primary" @click="loadSnaps(1)">刷新</a-button>
          <span class="muted" style="margin-left: auto">共 {{ snapTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="snaps" :columns="snapCols" :loading="snapLoading" :pagination="false" row-key="snapshot_id" size="medium">
            <template #photo="{ record }">
              <a-link v-if="record.photo_url" :href="record.photo_url" target="_blank">查看</a-link>
              <span v-else class="muted">—</span>
            </template>
          </a-table>
          <div class="pager">
            <a-pagination :total="snapTotal" :current="snapPage" :page-size="20" show-total @change="loadSnaps" />
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 槽位抽屉 -->
    <a-drawer :visible="slotDrawer" :width="860" :title="`槽位明细 · ${slotTask?.brand_name || ''} · ${slotTask?.date || ''}`" @cancel="slotDrawer = false" :footer="false">
      <a-spin :loading="slotLoading">
        <template v-if="slotTask">
          <div class="kv-row mb">
            <span>任务 ID</span><span class="muted">{{ slotTask.task_id }}</span>
            <span>应采 / 已采 / 失败</span><span class="muted">{{ slotTask.expected_slots }} / {{ slotTask.actual_slots }} / {{ slotTask.failed_slots }}</span>
          </div>
          <div class="mb">
            <span v-for="(n, s) in slotSummary" :key="s" class="chip" :style="{ background: slotColor(s) }">{{ s }} {{ n }}</span>
          </div>
          <a-table :data="slots" :columns="slotCols" :pagination="false" size="small" row-key="slot_id">
            <template #status="{ record }">
              <a-tag :color="statusColor(record.status)" size="small">{{ record.status }}</a-tag>
            </template>
          </a-table>
        </template>
      </a-spin>
    </a-drawer>

    <!-- 原始回答详情 -->
    <a-drawer
      :visible="answerDrawer"
      :width="920"
      :title="`原始回答 · ${answerDetail?.brand_name || ''} · ${answerDetail?.platform || ''} · ${answerDetail?.date || ''}`"
      @cancel="answerDrawer = false"
      :footer="false"
    >
      <a-spin :loading="answerDetailLoading">
        <template v-if="answerDetail">
          <div class="kv-row mb wrap">
            <span>问题</span><span class="muted grow">{{ answerDetail.question_sent || '—' }}</span>
          </div>
          <div class="kv-row mb wrap">
            <span>槽位</span><span class="muted grow mono">{{ answerDetail.slot_id }}</span>
            <span>解析</span>
            <a-tag :color="answerDetail.parsed ? 'green' : 'orange'" size="small">
              {{ answerDetail.parsed ? '已解析' : '未解析' }}
            </a-tag>
          </div>

          <h4 class="sec">回答正文（{{ answerDetail.answer_len }} 字）</h4>
          <pre class="answer-body">{{ answerDetail.answer_text || '（空）' }}</pre>

          <h4 class="sec">信源列表（{{ (answerDetail.cited_urls || []).length }} 条）</h4>
          <div v-if="!(answerDetail.cited_urls || []).length" class="muted">暂无信源</div>
          <ol v-else class="cite-list">
            <li v-for="(c, i) in answerDetail.cited_urls" :key="`${c.url}-${i}`" class="cite-item">
              <div class="cite-head">
                <span class="cite-idx">[{{ c.index != null ? c.index : i + 1 }}]</span>
                <a v-if="c.url" class="cite-title" :href="c.url" target="_blank" rel="noopener">{{ c.title || c.url }}</a>
                <span v-else class="cite-title">{{ c.title || '（无标题）' }}</span>
              </div>
              <div v-if="c.site_name || c.domain || c.publish_time" class="cite-meta">
                <span v-if="c.site_name">{{ c.site_name }}</span>
                <span v-if="c.domain">{{ c.domain }}</span>
                <span v-if="c.publish_time">{{ c.publish_time }}</span>
              </div>
              <div v-if="c.url && c.title" class="cite-url">{{ c.url }}</div>
              <div v-if="c.snippet" class="cite-snippet">{{ c.snippet }}</div>
            </li>
          </ol>
        </template>
      </a-spin>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminCollectTaskRow, AdminSlotRow, AdminAnswerRow, AdminAnswerDetail, AdminSnapshotRow } from '@geo-admin/contracts';

const tab = ref('tasks');

// 任务
const tasks = ref<AdminCollectTaskRow[]>([]);
const taskTotal = ref(0);
const taskPage = ref(1);
const taskLoading = ref(false);
const fromDate = ref<any>('');
const toDate = ref<any>('');

function fmtDate(d: any) {
  if (!d) return undefined;
  if (d instanceof Date) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return String(d).slice(0, 10);
}
const taskStatus = ref('');
const taskCols = [
  { title: '品牌', dataIndex: 'brand_name', ellipsis: true },
  { title: '日期', dataIndex: 'date', width: 110 },
  { title: '触发', dataIndex: 'trigger', width: 80 },
  { title: '应采/已采/失败', width: 150, render: ({ record }: any) => `${record.expected_slots}/${record.actual_slots}/${record.failed_slots}` },
  { title: '完成率', slotName: 'rate', width: 150 },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '', slotName: 'op', width: 60, fixed: 'right' as const },
];

// 回答
const answers = ref<AdminAnswerRow[]>([]);
const answerTotal = ref(0);
const answerPage = ref(1);
const answerLoading = ref(false);
const parsedFilter = ref('');
const answerCols = [
  { title: '日期', dataIndex: 'date', width: 110 },
  { title: '品牌', dataIndex: 'brand_name', width: 160, ellipsis: true },
  { title: '问题', dataIndex: 'question_sent', ellipsis: true },
  { title: '平台', dataIndex: 'platform', width: 90 },
  { title: '长度', dataIndex: 'answer_len', width: 80 },
  { title: '引用链接', dataIndex: 'cited_urls', width: 80 },
  { title: '解析', slotName: 'parsed', width: 90 },
  { title: '', slotName: 'op', width: 60, fixed: 'right' as const },
];

// 截图
const snaps = ref<AdminSnapshotRow[]>([]);
const snapTotal = ref(0);
const snapPage = ref(1);
const snapLoading = ref(false);
const snapCols = [
  { title: '日期', dataIndex: 'exec_date', width: 110 },
  { title: '品牌', dataIndex: 'brand_name', width: 160, ellipsis: true },
  { title: '平台', dataIndex: 'platform', width: 90 },
  { title: '槽位', dataIndex: 'slot_id', ellipsis: true },
  { title: '截图', slotName: 'photo', width: 80 },
];

// 槽位
const slotDrawer = ref(false);
const slotLoading = ref(false);
const slotTask = ref<AdminCollectTaskRow | null>(null);
const slots = ref<AdminSlotRow[]>([]);
const slotSummary = ref<Record<string, number>>({});
const slotCols = [
  { title: '问题ID', dataIndex: 'query_id', width: 80 },
  { title: '平台', dataIndex: 'platform', width: 90 },
  { title: '端', dataIndex: 'end', width: 70 },
  { title: '发出问题', dataIndex: 'question_sent', ellipsis: true },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '尝试', dataIndex: 'attempts', width: 60 },
  { title: '错误', dataIndex: 'error', ellipsis: true, width: 140 },
];

function statusColor(s: string) {
  return s === 'ok' ? 'green' : s === 'running' || s === 'created' ? 'arcoblue' : s === 'empty' ? 'orange' : 'red';
}
function slotColor(s: string) {
  return s === 'ok' ? '#dcfce7' : s === 'fail' ? '#fee2e2' : s === 'empty' ? '#ffedd5' : '#e0e7ff';
}

async function loadTasks(p = 1) {
  taskLoading.value = true;
  taskPage.value = p;
  try {
    const d = await adminApi.collectTasks({
      page: p, page_size: 20, status: taskStatus.value,
      from: fmtDate(fromDate.value), to: fmtDate(toDate.value),
    });
    tasks.value = d.list;
    taskTotal.value = d.total;
  } finally { taskLoading.value = false; }
}

async function loadAnswers(p = 1) {
  answerLoading.value = true;
  answerPage.value = p;
  try {
    const d = await adminApi.collectAnswers({ page: p, page_size: 20, parsed: parsedFilter.value });
    answers.value = d.list;
    answerTotal.value = d.total;
  } finally { answerLoading.value = false; }
}

async function loadSnaps(p = 1) {
  snapLoading.value = true;
  snapPage.value = p;
  try {
    const d = await adminApi.collectSnapshots({ page: p, page_size: 20 });
    snaps.value = d.list;
    snapTotal.value = d.total;
  } finally { snapLoading.value = false; }
}

async function openSlots(t: AdminCollectTaskRow) {
  slotTask.value = t;
  slotDrawer.value = true;
  slotLoading.value = true;
  try {
    const d = await adminApi.collectSlots(t.task_id);
    slotSummary.value = d.summary;
    slots.value = d.list;
  } finally { slotLoading.value = false; }
}

const answerDrawer = ref(false);
const answerDetailLoading = ref(false);
const answerDetail = ref<AdminAnswerDetail | null>(null);

async function openAnswer(row: AdminAnswerRow) {
  answerDrawer.value = true;
  answerDetail.value = null;
  answerDetailLoading.value = true;
  try {
    answerDetail.value = await adminApi.collectAnswerDetail(row.answer_id);
  } finally {
    answerDetailLoading.value = false;
  }
}

onMounted(() => loadTasks(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.kv-row { display: flex; gap: 24px; align-items: center; font-size: 13px; margin-bottom: 4px; }
.kv-row.wrap { flex-wrap: wrap; align-items: flex-start; }
.kv-row > span:nth-child(odd) { color: #6b7280; flex-shrink: 0; }
.kv-row .grow { flex: 1; min-width: 0; word-break: break-all; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.mb { margin-bottom: 12px; }
.sec { margin: 18px 0 8px; font-size: 14px; color: #1f2430; }
.chip {
  display: inline-block; border-radius: 4px; padding: 2px 10px; margin-right: 8px;
  font-size: 12px; color: #1f2430;
}
.answer-body {
  margin: 0;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.7;
  color: #1f2430;
  max-height: 46vh;
  overflow: auto;
}
.cite-list { margin: 0; padding-left: 0; list-style: none; }
.cite-item {
  padding: 10px 12px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  margin-bottom: 8px;
}
.cite-head { display: flex; gap: 8px; align-items: flex-start; }
.cite-idx { color: #6b7280; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.cite-title { color: #2563eb; text-decoration: none; font-size: 14px; word-break: break-all; }
.cite-title:hover { text-decoration: underline; }
.cite-meta { margin-top: 4px; font-size: 12px; color: #6b7280; display: flex; gap: 10px; flex-wrap: wrap; }
.cite-url { margin-top: 3px; font-size: 12px; color: #9ca3af; word-break: break-all; }
.cite-snippet { margin-top: 4px; font-size: 12.5px; color: #4b5563; line-height: 1.6; }
</style>
