<template>
  <div class="page-container">
    <h2 class="page-title">采集监控</h2>
    <p class="page-desc">每日采集任务 → 槽位 → 原始回答 → 截图；失败槽位可手动重置。采集 IP：各平台竖排近 3 日；「今日已用/日限」可改，默认 80。</p>

    <a-tabs v-model:active-key="tab">
      <!-- 任务 -->
      <a-tab-pane key="tasks" title="采集任务">
        <div class="toolbar">
          <a-date-picker v-model="fromDate" style="width: 150px" placeholder="开始日期" @change="loadTasks(1)" />
          <span class="muted">~</span>
          <a-date-picker v-model="toDate" style="width: 150px" placeholder="结束日期" @change="loadTasks(1)" />
          <a-radio-group v-model="taskStatus" type="button" @change="loadTasks(1)">
            <a-radio value="">全部</a-radio>
            <a-radio value="created">已创建</a-radio>
            <a-radio value="running">进行中</a-radio>
            <a-radio value="ok">完成</a-radio>
            <a-radio value="partial">部分完成</a-radio>
            <a-radio value="fail">失败</a-radio>
          </a-radio-group>
          <a-button type="primary" @click="loadTasks(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ taskTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="tasks" :columns="taskCols" :loading="taskLoading" :pagination="false" row-key="task_id" size="medium">
            <template #status="{ record }">
              <a-tag :color="statusColor(record.status)">{{ taskStatusLabel(record.status) }}</a-tag>
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

      <!-- 槽位（跨任务，可按状态直筛） -->
      <a-tab-pane key="slots" title="采集槽位">
        <div class="toolbar">
          <a-date-picker v-model="slotFromDate" style="width: 150px" placeholder="开始日期" @change="loadSlotList(1)" />
          <span class="muted">~</span>
          <a-date-picker v-model="slotToDate" style="width: 150px" placeholder="结束日期" @change="loadSlotList(1)" />
          <a-select v-model="slotPlatform" placeholder="平台" style="width: 120px" allow-clear @change="loadSlotList(1)">
            <a-option value="doubao">豆包</a-option>
            <a-option value="deepseek">DeepSeek</a-option>
            <a-option value="wenxin">文心</a-option>
            <a-option value="yuanbao">元宝</a-option>
          </a-select>
          <a-radio-group v-model="slotListStatus" type="button" @change="loadSlotList(1)">
            <a-radio value="">全部</a-radio>
            <a-radio value="pending">待采</a-radio>
            <a-radio value="running">进行中</a-radio>
            <a-radio value="ok">成功</a-radio>
            <a-radio value="empty">空答</a-radio>
            <a-radio value="fail">失败</a-radio>
          </a-radio-group>
          <a-button type="primary" @click="loadSlotList(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ slotListTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="slotList" :columns="slotListCols" :loading="slotListLoading" :pagination="false" row-key="slot_id" size="medium">
            <template #status="{ record }">
              <a-tag :color="statusColor(record.status)" size="small">{{ slotStatusLabel(record.status) }}</a-tag>
            </template>
            <template #op="{ record }">
              <a-space>
                <a-button
                  v-if="record.status === 'ok' || record.status === 'empty'"
                  type="text"
                  size="mini"
                  :loading="reparsingSlotId === record.slot_id"
                  @click="reparseSlot(record)"
                >重解析</a-button>
                <a-button
                  v-if="record.status === 'fail'"
                  type="text"
                  size="mini"
                  status="warning"
                  :loading="resettingSlotId === record.slot_id"
                  @click="resetOneSlotFromList(record)"
                >重置</a-button>
                <span v-if="record.status !== 'ok' && record.status !== 'empty' && record.status !== 'fail'" class="muted">—</span>
              </a-space>
            </template>
          </a-table>
          <div class="pager">
            <a-pagination :total="slotListTotal" :current="slotListPage" :page-size="20" show-total @change="loadSlotList" />
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
              <a-space>
                <a-link @click="openAnswer(record)">查看</a-link>
                <a-button
                  v-if="record.slot_id"
                  type="text"
                  size="mini"
                  :loading="reparsingSlotId === record.slot_id"
                  @click="reparseSlot(record)"
                >重解析</a-button>
              </a-space>
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

      <!-- 采集 IP -->
      <a-tab-pane key="ips" title="采集 IP">
        <div class="toolbar">
          <a-input v-model="ipMachineQ" allow-clear placeholder="机器名" style="width: 180px" @press-enter="loadIps(1)" />
          <a-input v-model="ipQ" allow-clear placeholder="IP" style="width: 160px" @press-enter="loadIps(1)" />
          <a-button type="primary" @click="loadIps(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ ipTotal }} 条 · 默认日限 {{ ipDefaultDailyLimit }} · 平台列竖排近 3 日</span>
        </div>
        <div class="table-card">
          <a-table
            :data="ipRows"
            :columns="ipCols"
            :loading="ipLoading"
            :pagination="false"
            row-key="id"
            size="medium"
            :scroll="{ x: 1680 }"
          >
            <template #platDoubao="{ record }">
              <div class="ip-plat-days">
                <div v-for="line in platDayLines(record, 'doubao')" :key="line.date" class="ip-plat-day">
                  <span class="ip-plat-day-d">{{ line.md }}</span>
                  <span class="ip-plat-day-n">{{ line.text }}</span>
                </div>
              </div>
            </template>
            <template #platDeepseek="{ record }">
              <div class="ip-plat-days">
                <div v-for="line in platDayLines(record, 'deepseek')" :key="line.date" class="ip-plat-day">
                  <span class="ip-plat-day-d">{{ line.md }}</span>
                  <span class="ip-plat-day-n">{{ line.text }}</span>
                </div>
              </div>
            </template>
            <template #platWenxin="{ record }">
              <div class="ip-plat-days">
                <div v-for="line in platDayLines(record, 'wenxin')" :key="line.date" class="ip-plat-day">
                  <span class="ip-plat-day-d">{{ line.md }}</span>
                  <span class="ip-plat-day-n">{{ line.text }}</span>
                </div>
              </div>
            </template>
            <template #platYuanbao="{ record }">
              <div class="ip-plat-days">
                <div v-for="line in platDayLines(record, 'yuanbao')" :key="line.date" class="ip-plat-day">
                  <span class="ip-plat-day-d">{{ line.md }}</span>
                  <span class="ip-plat-day-n">{{ line.text }}</span>
                </div>
              </div>
            </template>
            <template #dailyLimits="{ record }">
              <div class="ip-limit-col">
                <div v-for="p in IP_LIMIT_PLATS" :key="p" class="ip-limit-row">
                  <span class="ip-limit-name">{{ platLabel(p) }}</span>
                  <span class="ip-limit-used" :title="`今日已用 ${todayUsedOf(record, p)}`">{{ todayUsedOf(record, p) }}/</span>
                  <a-input-number
                    :model-value="limitDraftOf(record, p)"
                    :min="1"
                    :max="100000"
                    size="mini"
                    hide-button
                    class="ip-limit-input"
                    :disabled="savingLimitKey === limitKey(record, p)"
                    @change="(v: number | undefined) => onLimitDraft(record, p, v)"
                    @press-enter="() => saveDailyLimit(record, p)"
                    @blur="() => saveDailyLimit(record, p)"
                  />
                </div>
              </div>
            </template>
          </a-table>
          <div class="pager">
            <a-pagination :total="ipTotal" :current="ipPage" :page-size="20" show-total @change="loadIps" />
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 槽位抽屉 -->
    <a-drawer :visible="slotDrawer" :width="920" :title="`槽位明细 · ${slotTask?.brand_name || ''} · ${slotTask?.date || ''}`" @cancel="slotDrawer = false" :footer="false">
      <a-spin :loading="slotLoading">
        <template v-if="slotTask">
          <div class="kv-row mb">
            <span>任务 ID</span><span class="muted">{{ slotTask.task_id }}</span>
            <span>应采 / 已采 / 失败</span><span class="muted">{{ slotTask.expected_slots }} / {{ slotTask.actual_slots }} / {{ slotTask.failed_slots }}</span>
            <span>状态</span><a-tag :color="statusColor(slotTask.status)" size="small">{{ taskStatusLabel(slotTask.status) }}</a-tag>
          </div>
          <div class="mb toolbar-inline">
            <a-radio-group v-model="slotStatus" type="button" size="small">
              <a-radio value="">全部</a-radio>
              <a-radio value="pending">待采</a-radio>
              <a-radio value="running">进行中</a-radio>
              <a-radio value="ok">成功</a-radio>
              <a-radio value="empty">空答</a-radio>
              <a-radio value="fail">失败</a-radio>
            </a-radio-group>
            <span v-for="(n, s) in slotSummary" :key="s" class="chip" :style="{ background: slotColor(s) }">{{ slotStatusLabel(String(s)) }} {{ n }}</span>
            <a-button
              v-if="(slotSummary.fail || 0) > 0"
              type="outline"
              status="warning"
              size="mini"
              :loading="resettingAll"
              @click="resetAllFailed"
            >重置全部失败（{{ slotSummary.fail }}）</a-button>
          </div>
          <a-table :data="filteredSlots" :columns="slotCols" :pagination="false" size="small" row-key="slot_id">
            <template #status="{ record }">
              <a-tag :color="statusColor(record.status)" size="small">{{ slotStatusLabel(record.status) }}</a-tag>
            </template>
            <template #op="{ record }">
              <a-space>
                <a-button
                  v-if="record.status === 'ok' || record.status === 'empty'"
                  type="text"
                  size="mini"
                  :loading="reparsingSlotId === record.slot_id"
                  @click="reparseSlot(record)"
                >重解析</a-button>
                <a-button
                  v-if="record.status === 'fail'"
                  type="text"
                  size="mini"
                  status="warning"
                  :loading="resettingSlotId === record.slot_id"
                  @click="resetOneSlot(record)"
                >重置</a-button>
                <span v-if="record.status !== 'ok' && record.status !== 'empty' && record.status !== 'fail'" class="muted">—</span>
              </a-space>
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
            <a-button
              v-if="answerDetail.slot_id"
              type="outline"
              size="mini"
              :loading="reparsingSlotId === answerDetail.slot_id"
              @click="reparseSlot(answerDetail)"
            >重新解析</a-button>
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
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { adminApi } from '@/api/admin';
import type { AdminCollectTaskRow, AdminSlotRow, AdminAnswerRow, AdminAnswerDetail, AdminSnapshotRow } from '@geo-admin/contracts';

const tab = ref('tasks');

const PLAT_LABEL: Record<string, string> = {
  doubao: '豆包',
  deepseek: 'DeepSeek',
  wenxin: '文心',
  yuanbao: '元宝',
  qwen: '通义千问',
  kimi: 'Kimi',
};
function platLabel(p: string) {
  return PLAT_LABEL[p] || p || '—';
}

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
const TASK_STATUS_LABEL: Record<string, string> = {
  created: '已创建',
  running: '进行中',
  ok: '完成',
  partial: '部分完成',
  fail: '失败',
};
function taskStatusLabel(s: string) {
  return TASK_STATUS_LABEL[s] || s || '—';
}
const SLOT_STATUS_LABEL: Record<string, string> = {
  pending: '待采',
  running: '进行中',
  ok: '成功',
  empty: '空答',
  fail: '失败',
};
function slotStatusLabel(s: string) {
  return SLOT_STATUS_LABEL[s] || s || '—';
}
const taskCols = [
  { title: '账户', dataIndex: 'account', width: 130, ellipsis: true, render: ({ record }: any) => record.account || '—' },
  { title: '品牌', dataIndex: 'brand_name', ellipsis: true },
  { title: '日期', dataIndex: 'date', width: 110 },
  { title: '触发', dataIndex: 'trigger', width: 80 },
  { title: '应采/已采/失败', width: 150, render: ({ record }: any) => `${record.expected_slots}/${record.actual_slots}/${record.failed_slots}` },
  { title: '完成率', slotName: 'rate', width: 150 },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '', slotName: 'op', width: 60, fixed: 'right' as const },
];

// 跨任务槽位列表
const slotList = ref<AdminSlotRow[]>([]);
const slotListTotal = ref(0);
const slotListPage = ref(1);
const slotListLoading = ref(false);
const slotListStatus = ref('fail');
const slotFromDate = ref<any>('');
const slotToDate = ref<any>('');
const slotPlatform = ref('');
const slotListCols = [
  { title: '日期', dataIndex: 'date', width: 110 },
  { title: '账户', dataIndex: 'account', width: 120, ellipsis: true, render: ({ record }: any) => record.account || '—' },
  { title: '品牌', dataIndex: 'brand_name', width: 140, ellipsis: true },
  { title: '平台', dataIndex: 'platform', width: 90 },
  { title: '问题ID', dataIndex: 'query_id', width: 80 },
  { title: '发出问题', dataIndex: 'question_sent', ellipsis: true },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '尝试', dataIndex: 'attempts', width: 60 },
  { title: '错误', dataIndex: 'error', ellipsis: true, width: 160 },
  { title: '操作', slotName: 'op', width: 120, fixed: 'right' as const },
];

// 回答
const answers = ref<AdminAnswerRow[]>([]);
const answerTotal = ref(0);
const answerPage = ref(1);
const answerLoading = ref(false);
const parsedFilter = ref('');
const answerCols = [
  { title: '日期', dataIndex: 'date', width: 110 },
  { title: '账户', dataIndex: 'account', width: 130, ellipsis: true, render: ({ record }: any) => record.account || '—' },
  { title: '品牌', dataIndex: 'brand_name', width: 160, ellipsis: true },
  { title: '问题', dataIndex: 'question_sent', ellipsis: true },
  { title: '平台', dataIndex: 'platform', width: 90 },
  { title: '长度', dataIndex: 'answer_len', width: 80 },
  { title: '引用链接', dataIndex: 'cited_urls', width: 80 },
  { title: '解析', slotName: 'parsed', width: 90 },
  { title: '操作', slotName: 'op', width: 140, fixed: 'right' as const },
];

// 截图
const snaps = ref<AdminSnapshotRow[]>([]);
const snapTotal = ref(0);
const snapPage = ref(1);
const snapLoading = ref(false);
const snapCols = [
  { title: '日期', dataIndex: 'exec_date', width: 110 },
  { title: '账户', dataIndex: 'account', width: 130, ellipsis: true, render: ({ record }: any) => record.account || '—' },
  { title: '品牌', dataIndex: 'brand_name', width: 160, ellipsis: true },
  { title: '平台', dataIndex: 'platform', width: 90 },
  { title: '槽位', dataIndex: 'slot_id', ellipsis: true },
  { title: '截图', slotName: 'photo', width: 80 },
];

// 采集 IP
type IpRow = {
  id: string
  machine_name: string
  ip: string
  port: number | null
  ok_count: number
  fail_count: number
  empty_count: number
  total_count: number
  by_platform: Record<string, { ok?: number; fail?: number; empty?: number; total?: number }>
  by_day: Record<string, { ok?: number; fail?: number; empty?: number; total?: number; by_platform?: Record<string, any> }>
  daily_limits?: Record<string, number>
  today_used?: Record<string, number>
  default_daily_limit?: number
  today?: string
  last_seen_at: string | null
  last_ok_at: string | null
  last_fail_at: string | null
};
const ipRows = ref<IpRow[]>([]);
const ipTotal = ref(0);
const ipPage = ref(1);
const ipLoading = ref(false);
const ipMachineQ = ref('');
const ipQ = ref('');
const ipDefaultDailyLimit = ref(80);
const limitDrafts = reactive<Record<string, number>>({});
const savingLimitKey = ref('');
const IP_LIMIT_PLATS = ['doubao', 'deepseek', 'wenxin', 'yuanbao'] as const;

function fmtTs(v: string | null | undefined) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 19);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtPlatTriple(st: { ok?: number; fail?: number; empty?: number; total?: number } | null | undefined) {
  if (!st) return '—';
  const ok = st.ok || 0;
  const fail = st.fail || 0;
  const empty = st.empty || 0;
  const total = st.total ?? ok + fail + empty;
  if (!total) return '—';
  return `${ok}/${fail}/${empty}`;
}

/** 今天起往前 3 个自然日（新→旧） */
function recentDayKeys() {
  const out: string[] = [];
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`);
  }
  return out;
}

/** 某平台最近 3 日竖排行 */
function platDayLines(record: IpRow, platform: string) {
  return recentDayKeys().map(date => {
    const st = ((record.by_day || {})[date]?.by_platform || {})[platform];
    return { date, md: date.slice(5), text: fmtPlatTriple(st) };
  });
}

function limitKey(record: IpRow, platform: string) {
  return `${record.id}::${platform}`;
}

function todayUsedOf(record: IpRow, platform: string) {
  return Number((record.today_used || {})[platform]) || 0;
}

function limitDraftOf(record: IpRow, platform: string) {
  const k = limitKey(record, platform);
  if (limitDrafts[k] != null) return limitDrafts[k];
  const n = Number((record.daily_limits || {})[platform]);
  if (Number.isFinite(n) && n > 0) return n;
  return record.default_daily_limit || ipDefaultDailyLimit.value || 80;
}

function onLimitDraft(record: IpRow, platform: string, v: number | undefined) {
  const n = Number(v);
  if (!Number.isFinite(n)) return;
  limitDrafts[limitKey(record, platform)] = Math.floor(n);
}

async function saveDailyLimit(record: IpRow, platform: string) {
  const k = limitKey(record, platform);
  const next = Math.floor(Number(limitDraftOf(record, platform)));
  const stored = (record.daily_limits || {})[platform];
  const prev = Number(stored);
  if (!Number.isFinite(next) || next < 1) {
    Message.warning('日限须 ≥ 1');
    return;
  }
  if (Number.isFinite(prev) && next === prev) return;
  if (!Number.isFinite(prev) && next === (record.default_daily_limit || ipDefaultDailyLimit.value || 80)) return;
  savingLimitKey.value = k;
  try {
    const r = await adminApi.collectIpDailyLimit({
      machine_name: record.machine_name,
      ip: record.ip,
      platform,
      daily_limit: next,
    });
    record.daily_limits = { ...(record.daily_limits || {}), ...(r.daily_limits || {}), [platform]: r.daily_limit };
    if (r.today_used) record.today_used = { ...(record.today_used || {}), ...r.today_used };
    limitDrafts[k] = r.daily_limit;
    Message.success(`${platLabel(platform)} 日限已设为 ${r.daily_limit}`);
  } catch (e: any) {
    Message.error(e?.message || '保存失败');
  } finally {
    savingLimitKey.value = '';
  }
}

const ipCols = [
  { title: '机器名', dataIndex: 'machine_name', width: 140, ellipsis: true, fixed: 'left' as const },
  { title: 'IP', dataIndex: 'ip', width: 130, fixed: 'left' as const },
  { title: '端口', dataIndex: 'port', width: 70, render: ({ record }: any) => record.port ?? '—' },
  { title: '累计成功', dataIndex: 'ok_count', width: 80 },
  { title: '累计失败', dataIndex: 'fail_count', width: 80 },
  { title: '累计空答', dataIndex: 'empty_count', width: 80 },
  { title: '累计总计', dataIndex: 'total_count', width: 80 },
  { title: '今日已用/日限', width: 168, slotName: 'dailyLimits' },
  { title: '豆包', width: 128, slotName: 'platDoubao' },
  { title: 'DeepSeek', width: 128, slotName: 'platDeepseek' },
  { title: '文心', width: 128, slotName: 'platWenxin' },
  { title: '元宝', width: 128, slotName: 'platYuanbao' },
  { title: '最近活跃', width: 150, render: ({ record }: any) => fmtTs(record.last_seen_at) },
  { title: '最近失败', width: 150, render: ({ record }: any) => fmtTs(record.last_fail_at) },
];

async function loadIps(p = 1) {
  ipLoading.value = true;
  ipPage.value = p;
  try {
    const d = await adminApi.collectIps({
      page: p,
      page_size: 20,
      machine_name: ipMachineQ.value.trim() || undefined,
      ip: ipQ.value.trim() || undefined,
    });
    ipRows.value = d.list as IpRow[];
    ipTotal.value = d.total;
    if (typeof (d as any).default_daily_limit === 'number') {
      ipDefaultDailyLimit.value = (d as any).default_daily_limit;
    }
    for (const row of ipRows.value) {
      for (const plat of IP_LIMIT_PLATS) {
        limitDrafts[limitKey(row, plat)] = Number((row.daily_limits || {})[plat])
          || row.default_daily_limit
          || ipDefaultDailyLimit.value
          || 80;
      }
    }
  } finally {
    ipLoading.value = false;
  }
}

// 槽位
const slotDrawer = ref(false);
const slotLoading = ref(false);
const slotTask = ref<AdminCollectTaskRow | null>(null);
const slots = ref<AdminSlotRow[]>([]);
const slotSummary = ref<Record<string, number>>({});
const slotStatus = ref('');
const filteredSlots = computed(() => {
  if (!slotStatus.value) return slots.value;
  return slots.value.filter(s => s.status === slotStatus.value);
});
const slotCols = [
  { title: '问题ID', dataIndex: 'query_id', width: 80 },
  { title: '平台', dataIndex: 'platform', width: 90 },
  { title: '端', dataIndex: 'end', width: 70 },
  { title: '发出问题', dataIndex: 'question_sent', ellipsis: true },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '尝试', dataIndex: 'attempts', width: 60 },
  { title: '错误', dataIndex: 'error', ellipsis: true, width: 140 },
  { title: '操作', slotName: 'op', width: 120, fixed: 'right' as const },
];

const resettingSlotId = ref('');
const resettingAll = ref(false);
const reparsingSlotId = ref('');

function statusColor(s: string) {
  return s === 'ok' ? 'green'
    : s === 'partial' ? 'orangered'
    : s === 'running' || s === 'created' ? 'arcoblue'
    : s === 'empty' ? 'orange'
    : 'red';
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

async function loadSlotList(p = 1) {
  slotListLoading.value = true;
  slotListPage.value = p;
  try {
    const d = await adminApi.collectSlotList({
      page: p,
      page_size: 20,
      status: slotListStatus.value,
      platform: slotPlatform.value,
      from: fmtDate(slotFromDate.value),
      to: fmtDate(slotToDate.value),
    });
    slotList.value = d.list;
    slotListTotal.value = d.total;
  } finally { slotListLoading.value = false; }
}

async function resetOneSlotFromList(row: AdminSlotRow) {
  Modal.warning({
    title: '重置失败槽位',
    content: `将 ${row.platform} / 问题 ${row.query_id}（${row.brand_name || row.brand_id}）重置为待采，采集端可重新领取。`,
    hideCancel: false,
    okText: '确认重置',
    onOk: async () => {
      resettingSlotId.value = row.slot_id;
      try {
        const r = await adminApi.collectSlotReset(row.slot_id);
        Message.success(`已重置为 ${r.slot.status}`);
        await loadSlotList(slotListPage.value);
      } catch (e: any) {
        Message.error(e?.message || '重置失败');
        throw e;
      } finally {
        resettingSlotId.value = '';
      }
    },
  });
}

/** 单槽重新解析：用已有原文再跑 A/B/C + 聚合该品牌×日 */
async function reparseSlot(row: { slot_id?: string; platform?: string; query_id?: number | string; brand_name?: string; brand_id?: string; date?: string }) {
  const slotId = String(row.slot_id || '').trim();
  if (!slotId) {
    Message.warning('缺少槽位 ID');
    return;
  }
  Modal.warning({
    title: '重新解析槽位',
    content: `将用已有原文重新抽取并聚合：${row.platform || ''} / 问题 ${row.query_id ?? ''}（${row.brand_name || row.brand_id || ''} · ${row.date || ''}）。不重采、不改原文。会消耗一次 LLM。`,
    hideCancel: false,
    okText: '确认重解析',
    onOk: async () => {
      reparsingSlotId.value = slotId;
      try {
        const r = await adminApi.collectSlotReparse(slotId);
        Message.success(`已重解析并聚合 ${r.brand_id} · ${r.date}`);
        if (tab.value === 'answers') await loadAnswers(answerPage.value);
        if (tab.value === 'slots') await loadSlotList(slotListPage.value);
        if (slotDrawer.value && slotTask.value?.task_id) await refreshSlots(slotTask.value.task_id);
        if (answerDrawer.value && answerDetail.value?.slot_id === slotId) {
          await openAnswer({ answer_id: r.answer_id } as AdminAnswerRow);
        }
      } catch (e: any) {
        Message.error(e?.message || '重解析失败');
        throw e;
      } finally {
        reparsingSlotId.value = '';
      }
    },
  });
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
  slotStatus.value = '';
  slotDrawer.value = true;
  await refreshSlots(t.task_id);
}

async function refreshSlots(taskId: string) {
  slotLoading.value = true;
  try {
    const d = await adminApi.collectSlots(taskId);
    slotSummary.value = d.summary;
    slots.value = d.list;
    if (d.task) {
      slotTask.value = { ...(slotTask.value || {} as AdminCollectTaskRow), ...d.task, brand_name: slotTask.value?.brand_name, account: slotTask.value?.account };
      // 同步外层任务列表里的计数/状态
      const i = tasks.value.findIndex(x => x.task_id === taskId);
      if (i >= 0) {
        tasks.value[i] = {
          ...tasks.value[i],
          ...d.task,
          brand_name: tasks.value[i].brand_name,
          account: tasks.value[i].account,
        };
      }
    }
  } finally { slotLoading.value = false; }
}

async function resetOneSlot(row: AdminSlotRow) {
  Modal.warning({
    title: '重置失败槽位',
    content: `将 ${row.platform} / 问题 ${row.query_id} 重置为 pending，attempts 清零，采集端可重新领取。`,
    hideCancel: false,
    okText: '确认重置',
    onOk: async () => {
      resettingSlotId.value = row.slot_id;
      try {
        const r = await adminApi.collectSlotReset(row.slot_id);
        Message.success(`已重置为 ${r.slot.status}`);
        if (slotTask.value?.task_id) await refreshSlots(slotTask.value.task_id);
      } catch (e: any) {
        Message.error(e?.message || '重置失败');
        throw e;
      } finally {
        resettingSlotId.value = '';
      }
    },
  });
}

async function resetAllFailed() {
  const n = slotSummary.value.fail || 0;
  if (!slotTask.value || n <= 0) return;
  Modal.warning({
    title: '重置全部失败槽位',
    content: `将本任务下 ${n} 个 fail 槽位全部重置为 pending，采集端可重新领取。`,
    hideCancel: false,
    okText: '确认重置',
    onOk: async () => {
      resettingAll.value = true;
      try {
        const r = await adminApi.collectTaskResetFailed(slotTask.value!.task_id);
        Message.success(`已重置 ${r.reset_count} 个槽位`);
        await refreshSlots(slotTask.value!.task_id);
      } catch (e: any) {
        Message.error(e?.message || '重置失败');
        throw e;
      } finally {
        resettingAll.value = false;
      }
    },
  });
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

onMounted(() => {
  loadTasks(1);
  loadSlotList(1);
});

watch(tab, (v) => {
  if (v === 'ips' && !ipRows.value.length) loadIps(1);
  if (v === 'answers' && !answers.value.length) loadAnswers(1);
  if (v === 'snapshots' && !snaps.value.length) loadSnaps(1);
});
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.kv-row { display: flex; gap: 24px; align-items: center; font-size: 13px; margin-bottom: 4px; }
.kv-row.wrap { flex-wrap: wrap; align-items: flex-start; }
.kv-row > span:nth-child(odd) { color: #6b7280; flex-shrink: 0; }
.kv-row .grow { flex: 1; min-width: 0; word-break: break-all; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.mb { margin-bottom: 12px; }
.toolbar-inline { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
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
.ip-plat-days {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
  line-height: 1.35;
}
.ip-plat-day {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
}
.ip-plat-day-d {
  color: #94a3b8;
  width: 36px;
  flex-shrink: 0;
}
.ip-plat-day-n {
  color: #334155;
}
.ip-limit-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0;
}
.ip-limit-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  white-space: nowrap;
}
.ip-limit-name {
  width: 52px;
  color: #64748b;
  flex-shrink: 0;
}
.ip-limit-used {
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
  min-width: 22px;
  text-align: right;
}
.ip-limit-input {
  width: 64px;
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
