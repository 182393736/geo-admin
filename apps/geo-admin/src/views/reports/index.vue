<template>
  <div class="page-container">
    <h2 class="page-title">报告中心</h2>
    <p class="page-desc">全品牌周报 / 月报生成状态（只读）</p>

    <div class="toolbar">
      <a-select v-model="status" placeholder="状态" style="width: 150px" allow-clear @change="load(1)">
        <a-option value="generating">generating</a-option>
        <a-option value="ready">ready</a-option>
        <a-option value="failed">failed</a-option>
      </a-select>
      <a-select v-model="period" placeholder="周期" style="width: 150px" allow-clear @change="load(1)">
        <a-option value="weekly">weekly</a-option>
        <a-option value="monthly">monthly</a-option>
      </a-select>
      <a-button type="primary" @click="load(1)">查询</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="report_id" size="medium">
        <template #status="{ record }">
          <a-tag :color="record.status === 'ready' ? 'green' : record.status === 'generating' ? 'arcoblue' : 'red'">{{ record.status }}</a-tag>
        </template>
      </a-table>
      <div class="pager"><a-pagination :total="total" :current="page" :page-size="20" show-total @change="load" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminReportRow } from '@geo-admin/contracts';

const rows = ref<AdminReportRow[]>([]);
const total = ref(0); const page = ref(1); const loading = ref(false);
const status = ref(''); const period = ref('');

const cols = [
  { title: '品牌', dataIndex: 'brand_name', ellipsis: true },
  { title: '周期', dataIndex: 'period_type', width: 90 },
  { title: 'period_key', dataIndex: 'period_key', width: 130 },
  { title: '标签', dataIndex: 'label', width: 160 },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '生成时间', dataIndex: 'generated_at', width: 170 },
];

async function load(p = 1) {
  loading.value = true; page.value = p;
  try {
    const d = await adminApi.reports({ page: p, page_size: 20, status: status.value, period_type: period.value });
    rows.value = d.list; total.value = d.total;
  } finally { loading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
</style>
