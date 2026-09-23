<template>
  <div class="page-container">
    <h2 class="page-title">系统观测</h2>
    <p class="page-desc">任务调度（3 个 cron）/ 队列积压 / 菜单配置（只读）</p>

    <a-spin :loading="loading">
      <template v-if="d">
        <div class="card mb">
          <h3 class="card-title">🕒 定时任务（schedule）</h3>
          <a-table :data="d.schedules" :columns="schCols" :pagination="false" row-key="name" size="medium" />
        </div>

        <div class="card mb">
          <h3 class="card-title">📮 队列（Queue）</h3>
          <div class="kv">
            <span class="k">实现</span><span class="v">{{ d.queue.impl }}</span>
            <span class="k">积压量</span><span class="v" :class="{ danger: d.queue.backlog > 0 }">{{ d.queue.backlog }}</span>
            <span class="k">Topic</span><span class="v">{{ d.queue.topics.join(', ') || '—' }}</span>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">🧭 菜单配置（menu_configs）</h3>
          <a-table :data="d.menus" :columns="menuCols" :pagination="false" row-key="menu_code" size="medium">
            <template #visible="{ record }">
              <a-tag :color="record.visible ? 'green' : 'gray'" size="small">{{ record.visible ? '可见' : '隐藏' }}</a-tag>
            </template>
          </a-table>
        </div>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminSystem } from '@geo-admin/contracts';

const loading = ref(false);
const d = ref<AdminSystem | null>(null);

const schCols = [
  { title: '任务', dataIndex: 'name', width: 160 },
  { title: 'Cron', dataIndex: 'cron', width: 140 },
  { title: '说明', dataIndex: 'desc' },
  { title: '最近证据', dataIndex: 'last_evidence', width: 240 },
];
const menuCols = [
  { title: 'menu_code', dataIndex: 'menu_code', width: 170 },
  { title: '分类', dataIndex: 'category', width: 90 },
  { title: '名称', dataIndex: 'label', width: 140 },
  { title: '路径', dataIndex: 'path', width: 240 },
  { title: '套餐门控', dataIndex: 'min_plan', width: 100 },
  { title: '排序', dataIndex: 'sort_order', width: 70 },
  { title: '可见', slotName: 'visible', width: 80 },
];

onMounted(async () => {
  loading.value = true;
  try { d.value = await adminApi.system(); } finally { loading.value = false; }
});
</script>

<style scoped lang="scss">
.mb { margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 600; margin: 0 0 12px; color: #1f2430; }
.kv { display: grid; grid-template-columns: 120px 1fr; gap: 6px 10px; font-size: 13px; }
.kv .k { color: #6b7280; }
.kv .v { color: #1f2430; word-break: break-all; }
.danger { color: #dc2626; }
</style>
