<template>
  <div class="page-container">
    <h2 class="page-title">首登漏斗</h2>
    <p class="page-desc">品牌建档（onboarding）任务状态机 + 过程留痕回放（"AI 为什么这么定位品牌"）</p>

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

    <a-drawer :visible="traceDrawer" :width="820" title="过程留痕回放" @cancel="traceDrawer = false" :footer="false">
      <a-spin :loading="traceLoading">
        <a-timeline v-if="traces.length">
          <a-timeline-item v-for="(t, i) in traces" :key="i" :dot-color="dotColor(t.kind)">
            <div class="trace-head">
              <a-tag size="small" :color="dotColor(t.kind)">{{ t.kind }}</a-tag>
              <span class="muted">{{ t.created_at }}</span>
            </div>
            <div v-if="t.query" class="trace-body">检索词：{{ t.query }}</div>
            <div v-if="t.url" class="trace-body">阅读网页：{{ t.url }}</div>
            <div v-if="t.keyword" class="trace-body">母词「{{ t.keyword }}」热度 {{ t.weight }}</div>
            <div v-if="t.snapshot" class="trace-snapshot">{{ t.snapshot.slice(0, 200) }}…</div>
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
    const d = await adminApi.onboardingTraces(t.task_id);
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
.trace-head { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.trace-body { font-size: 13px; color: #1f2430; margin: 2px 0; word-break: break-all; }
.trace-snapshot {
  font-size: 12px; color: #6b7280; background: #f9fafb; border-radius: 6px;
  padding: 8px 10px; margin-top: 4px; white-space: pre-wrap;
}
</style>
