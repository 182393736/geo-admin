<template>
  <div class="page-container">
    <h2 class="page-title">Agent 会话</h2>
    <p class="page-desc">agent_histories 会话记录（chat / mining / writing / intel）</p>

    <div class="toolbar">
      <a-select v-model="kind" placeholder="类型" style="width: 150px" allow-clear @change="load(1)">
        <a-option value="chat">chat</a-option>
        <a-option value="mining">mining</a-option>
        <a-option value="writing">writing</a-option>
        <a-option value="intel">intel</a-option>
      </a-select>
      <a-button type="primary" @click="load(1)">查询</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="session_id" size="medium">
        <template #kind="{ record }">
          <a-tag color="arcoblue" size="small">{{ record.kind }}</a-tag>
        </template>
      </a-table>
      <div class="pager"><a-pagination :total="total" :current="page" :page-size="20" show-total @change="load" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminAgentHistoryRow } from '@geo-admin/contracts';

const rows = ref<AdminAgentHistoryRow[]>([]);
const total = ref(0); const page = ref(1); const loading = ref(false); const kind = ref('');

const cols = [
  { title: '会话ID', dataIndex: 'session_id', width: 170, ellipsis: true },
  { title: '用户', dataIndex: 'uid', width: 150, ellipsis: true },
  { title: '品牌', dataIndex: 'brand_id', width: 150, ellipsis: true },
  { title: '类型', slotName: 'kind', width: 100 },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

async function load(p = 1) {
  loading.value = true; page.value = p;
  try {
    const d = await adminApi.agentHistories({ page: p, page_size: 20, kind: kind.value });
    rows.value = d.list; total.value = d.total;
  } finally { loading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
</style>
