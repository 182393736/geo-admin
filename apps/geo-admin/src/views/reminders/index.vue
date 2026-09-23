<template>
  <div class="page-container">
    <h2 class="page-title">站内消息</h2>
    <p class="page-desc">reminders 全量消息（报告生成 / 采集异常 / 套餐临期等业务事件）</p>

    <div class="toolbar">
      <a-select v-model="level" placeholder="级别" style="width: 140px" allow-clear @change="load(1)">
        <a-option value="info">info</a-option>
        <a-option value="warn">warn</a-option>
        <a-option value="error">error</a-option>
      </a-select>
      <a-button type="primary" @click="load(1)">查询</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" :row-key="(r: any) => `${r.user_id}-${r.created_at}`" size="medium">
        <template #level="{ record }">
          <a-tag :color="record.level === 'error' ? 'red' : record.level === 'warn' ? 'orange' : 'gray'" size="small">{{ record.level }}</a-tag>
        </template>
        <template #read="{ record }">
          <span :class="record.read ? 'muted' : 'unread'">{{ record.read ? '已读' : '未读' }}</span>
        </template>
      </a-table>
      <div class="pager"><a-pagination :total="total" :current="page" :page-size="20" show-total @change="load" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminReminderRow } from '@geo-admin/contracts';

const rows = ref<AdminReminderRow[]>([]);
const total = ref(0); const page = ref(1); const loading = ref(false); const level = ref('');

const cols = [
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '级别', slotName: 'level', width: 80 },
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '内容', dataIndex: 'body', ellipsis: true },
  { title: '用户', dataIndex: 'user_id', width: 150, ellipsis: true },
  { title: '状态', slotName: 'read', width: 70 },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

async function load(p = 1) {
  loading.value = true; page.value = p;
  try {
    const d = await adminApi.reminders({ page: p, page_size: 20, level: level.value });
    rows.value = d.list; total.value = d.total;
  } finally { loading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #9ca3af; font-size: 13px; }
.unread { color: #dc2626; font-size: 13px; font-weight: 600; }
</style>
