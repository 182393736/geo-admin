<template>
  <div class="page-container">
    <h2 class="page-title">首登漏斗</h2>
    <p class="page-desc">品牌建档（onboarding）任务状态机 + 过程留痕回放（联网查询 / 大模型 I/O）</p>

    <div class="funnel-bar card mb">
      <div v-for="f in funnel" :key="f.stage" class="funnel-item">
        <div class="funnel-num">{{ f.n }}</div>
        <div class="funnel-label">{{ f.stage }}</div>
      </div>
      <span v-if="!funnel.length" class="muted">暂无任务</span>
    </div>

    <div class="toolbar">
      <a-button type="primary" @click="load(1)">刷新</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="task_id" size="medium">
        <template #stage="{ record }">
          <a-tag :color="stageColor(record.stage)">{{ record.stage }}</a-tag>
        </template>
        <template #op="{ record }">
          <a-link @click="openTraces(record)">留痕</a-link>
        </template>
      </a-table>
      <div class="pager"><a-pagination :total="total" :current="page" :page-size="20" show-total @change="load" /></div>
    </div>

    <a-drawer :visible="traceDrawer" :width="960" unmount-on-close title="过程留痕回放" @cancel="traceDrawer = false" :footer="false">
      <a-spin :loading="traceLoading">
        <a-timeline v-if="traces.length">
          <a-timeline-item v-for="(t, i) in traces" :key="i" :dot-color="dotColor(t.kind)">
            <div class="trace-head">
              <a-tag size="small" :color="dotColor(t.kind)">{{ t.kind }}</a-tag>
              <a-tag v-if="traceStep(t)" size="small" color="gray">{{ traceStep(t) }}</a-tag>
              <a-tag v-if="traceModel(t)" size="small" color="purple">{{ traceModel(t) }}</a-tag>
              <span class="muted">{{ t.created_at }}</span>
            </div>

            <div v-if="t.query" class="trace-body">检索词（输入）：{{ t.query }}</div>
            <div v-if="traceEngine(t)" class="trace-body">
              搜索接口：
              <a-tag size="small" :color="traceEngine(t) === 'bocha' ? 'green' : 'orangered'">{{ traceEngine(t) }}</a-tag>
              <a-tag v-if="traceFallback(t)" size="small" color="orange">fallback</a-tag>
              <span v-if="traceResultCount(t) != null" class="muted"> · {{ traceResultCount(t) }} 条</span>
              <span v-if="tracePrimaryError(t)" class="muted">（主引擎：{{ tracePrimaryError(t) }}）</span>
            </div>
            <div v-if="traceResults(t).length" class="trace-io">
              <div class="trace-io-label">联网输出</div>
              <div v-for="(r, ri) in traceResults(t)" :key="ri" class="trace-hit">
                <a :href="r.url" target="_blank" rel="noopener" class="trace-hit-title">{{ r.title || r.url }}</a>
                <div v-if="r.snippet" class="trace-hit-sn">{{ r.snippet }}</div>
              </div>
            </div>

            <div v-if="t.url" class="trace-body">阅读网页：{{ t.url }}</div>
            <div v-if="t.keyword" class="trace-body">母词「{{ t.keyword }}」热度 {{ t.weight }}</div>
            <div v-if="t.snapshot" class="trace-snapshot">{{ t.snapshot.slice(0, 200) }}…</div>

            <div v-if="traceInput(t)" class="trace-io">
              <div class="trace-io-label">大模型输入</div>
              <pre class="trace-pre">{{ traceInput(t) }}</pre>
            </div>
            <div v-if="traceOutput(t)" class="trace-io">
              <div class="trace-io-label">大模型输出</div>
              <pre class="trace-pre">{{ traceOutput(t) }}</pre>
            </div>
            <div v-if="traceUsage(t)" class="muted trace-usage">{{ traceUsage(t) }}</div>
          </a-timeline-item>
        </a-timeline>
        <p v-else-if="!traceLoading" class="muted">该任务无留痕记录</p>
      </a-spin>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminOnboardingTaskRow, AdminOnboardingTraceRow } from '@geo-admin/contracts';

const rows = ref<AdminOnboardingTaskRow[]>([]);
const funnel = ref<{ stage: string; n: number }[]>([]);
const total = ref(0); const page = ref(1); const loading = ref(false);

const cols = [
  { title: '品牌名', dataIndex: 'brand_name', ellipsis: true },
  { title: '用户', dataIndex: 'user_id', width: 130, ellipsis: true },
  { title: '阶段', slotName: 'stage', width: 100 },
  { title: '错误', dataIndex: 'error', ellipsis: true },
  { title: '创建时间', dataIndex: 'created_at', width: 170 },
  { title: '', slotName: 'op', width: 70, fixed: 'right' as const },
];

const traceDrawer = ref(false);
const traceLoading = ref(false);
const traces = ref<AdminOnboardingTraceRow[]>([]);

function stageColor(s: string) {
  return s === 'done' ? 'green' : s === 'fail' ? 'red' : 'arcoblue';
}
function dotColor(kind: string) {
  return { search_query: '#4338ca', page_read: '#0ea5e9', keyword_weight: '#ea580c', llm_output: '#16a34a', user_confirm: '#dc2626' }[kind] || '#9ca3af';
}
function asMeta(t: AdminOnboardingTraceRow): Record<string, unknown> {
  return (t.meta && typeof t.meta === 'object') ? t.meta as Record<string, unknown> : {};
}
function traceEngine(t: AdminOnboardingTraceRow) {
  const e = asMeta(t).engine;
  return typeof e === 'string' && e ? e : '';
}
function traceFallback(t: AdminOnboardingTraceRow) {
  return !!asMeta(t).fallback;
}
function tracePrimaryError(t: AdminOnboardingTraceRow) {
  const err = asMeta(t).primary_error;
  return typeof err === 'string' ? err.slice(0, 120) : '';
}
function traceResultCount(t: AdminOnboardingTraceRow) {
  const n = asMeta(t).result_count;
  return typeof n === 'number' ? n : null;
}
function traceResults(t: AdminOnboardingTraceRow): { title: string; url: string; snippet: string }[] {
  const list = asMeta(t).results;
  if (!Array.isArray(list)) return [];
  return list.map((r: any) => ({
    title: String(r?.title || ''),
    url: String(r?.url || ''),
    snippet: String(r?.snippet || ''),
  })).filter(r => r.url);
}
function traceStep(t: AdminOnboardingTraceRow) {
  const s = asMeta(t).step;
  return typeof s === 'string' ? s : '';
}
function traceModel(t: AdminOnboardingTraceRow) {
  const m = asMeta(t).model;
  return typeof m === 'string' ? m : '';
}
function traceInput(t: AdminOnboardingTraceRow) {
  const input = asMeta(t).input;
  if (!input || typeof input !== 'object') return '';
  const o = input as Record<string, unknown>;
  const parts: string[] = [];
  if (o.system) parts.push(`[system]\n${o.system}`);
  if (o.user) parts.push(`[user]\n${o.user}`);
  if (o.schemaHint) parts.push(`[schema]\n${o.schemaHint}`);
  return parts.join('\n\n');
}
function traceOutput(t: AdminOnboardingTraceRow) {
  const out = asMeta(t).output;
  return typeof out === 'string' ? out : '';
}
function traceUsage(t: AdminOnboardingTraceRow) {
  const u = asMeta(t).usage;
  if (!u || typeof u !== 'object') return '';
  const o = u as Record<string, unknown>;
  const total = o.total_tokens ?? ((Number(o.prompt_tokens) || 0) + (Number(o.completion_tokens) || 0));
  if (!total) return '';
  return `tokens: prompt=${o.prompt_tokens ?? '-'} completion=${o.completion_tokens ?? '-'} total=${total}`;
}

async function load(p = 1) {
  loading.value = true; page.value = p;
  try {
    const d = await adminApi.onboardingTasks({ page: p, page_size: 20 });
    rows.value = d.list; funnel.value = d.funnel; total.value = d.total;
  } finally { loading.value = false; }
}

async function openTraces(t: AdminOnboardingTaskRow) {
  traceDrawer.value = true; traceLoading.value = true;
  try {
    const d = await adminApi.onboardingTraces(t.task_id, t.brand_id);
    traces.value = d.list;
  } finally { traceLoading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.mb { margin-bottom: 14px; }
.funnel-bar { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
.funnel-item { text-align: center; }
.funnel-num { font-size: 20px; font-weight: 700; color: #4338ca; }
.funnel-label { font-size: 12px; color: #6b7280; }
.trace-head { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; flex-wrap: wrap; }
.trace-body { font-size: 13px; color: #1f2430; margin: 2px 0; word-break: break-all; }
.trace-snapshot {
  font-size: 12px; color: #6b7280; background: #f9fafb; border-radius: 6px;
  padding: 8px 10px; margin-top: 4px; white-space: pre-wrap;
}
.trace-io { margin-top: 8px; }
.trace-io-label {
  font-size: 12px; font-weight: 600; color: #4338ca; margin-bottom: 4px;
}
.trace-pre {
  margin: 0; padding: 10px 12px; background: #f8fafc; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 12px; line-height: 1.5; white-space: pre-wrap;
  word-break: break-word; max-height: 280px; overflow: auto; color: #1f2430;
}
.trace-hit { padding: 6px 0; border-bottom: 1px dashed #e5e7eb; }
.trace-hit:last-child { border-bottom: 0; }
.trace-hit-title { font-size: 13px; color: #2563eb; word-break: break-all; }
.trace-hit-sn { font-size: 12px; color: #6b7280; margin-top: 2px; }
.trace-usage { margin-top: 4px; font-size: 12px; }
</style>
