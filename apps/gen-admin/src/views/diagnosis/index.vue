<template>
  <div class="page-container">
    <h2 class="page-title">诊断任务</h2>
    <p class="page-desc">单次诊断（按积分计费）任务列表（只读）</p>

    <div class="toolbar">
      <a-select v-model="status" placeholder="状态" style="width: 150px" allow-clear @change="load(1)">
        <a-option value="pending">pending</a-option>
        <a-option value="running">running</a-option>
        <a-option value="done">done</a-option>
        <a-option value="fail">fail</a-option>
      </a-select>
      <a-button type="primary" @click="load(1)">查询</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="diagnosis_id" size="medium">
        <template #status="{ record }">
          <a-tag :color="record.status === 'done' ? 'green' : record.status === 'fail' ? 'red' : 'arcoblue'">{{ record.status }}</a-tag>
        </template>
      </a-table>
      <div class="pager"><a-pagination :total="total" :current="page" :page-size="20" show-total @change="load" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminDiagnosisRow } from '@geo-admin/contracts';

const rows = ref<AdminDiagnosisRow[]>([]);
const total = ref(0); const page = ref(1); const loading = ref(false); const status = ref('');

const cols = [
  { title: '诊断ID', dataIndex: 'diagnosis_id', width: 150, ellipsis: true },
  { title: '用户', dataIndex: 'user_id', width: 150, ellipsis: true },
  { title: '别名', dataIndex: 'aliases', width: 220, render: ({ record }: any) => (record.aliases || []).join(' / ') || '—' },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '积分消耗', dataIndex: 'credit_cost', width: 90 },
  { title: '订单号', dataIndex: 'order_no', width: 180, ellipsis: true },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

async function load(p = 1) {
  loading.value = true; page.value = p;
  try {
    const d = await adminApi.diagnosis({ page: p, page_size: 20, status: status.value });
    rows.value = d.list; total.value = d.total;
  } finally { loading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
</style>
