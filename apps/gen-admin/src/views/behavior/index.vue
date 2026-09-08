<template>
  <div class="page-container">
    <h2 class="page-title">行为埋点</h2>
    <p class="page-desc">功能访问埋点（user_click_events）· 页面 PV 排行 + 明细</p>

    <a-row :gutter="16">
      <a-col :span="8">
        <div class="card">
          <h3 class="card-title">页面访问 TOP</h3>
          <div v-for="t in topPages" :key="t.source" class="rank-row">
            <span class="rank-name">{{ t.source }}</span>
            <span class="rank-num">{{ t.n }}</span>
          </div>
          <p v-if="!topPages.length" class="muted">暂无数据</p>
        </div>
      </a-col>
      <a-col :span="16">
        <div class="toolbar">
          <a-input v-model="source" placeholder="按页面名筛选" style="width: 220px" allow-clear @press-enter="load(1)" />
          <a-button type="primary" @click="load(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" :row-key="(r: any) => `${r.user_id}-${r.created_at}`" size="medium" />
          <div class="pager"><a-pagination :total="total" :current="page" :page-size="20" show-total @change="load" /></div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminBehaviorEventRow } from '@geo-admin/contracts';

const rows = ref<AdminBehaviorEventRow[]>([]);
const topPages = ref<{ source: string; n: number }[]>([]);
const total = ref(0); const page = ref(1); const loading = ref(false); const source = ref('');

const cols = [
  { title: '用户', dataIndex: 'user_id', width: 150, ellipsis: true },
  { title: '品牌', dataIndex: 'brand_id', width: 150, ellipsis: true },
  { title: '页面', dataIndex: 'source' },
  { title: '操作', dataIndex: 'operation', width: 90 },
  { title: 'IP', dataIndex: 'ip', width: 130 },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

async function load(p = 1) {
  loading.value = true; page.value = p;
  try {
    const d = await adminApi.behavior({ page: p, page_size: 20, source: source.value });
    rows.value = d.list; topPages.value = d.top_pages; total.value = d.total;
  } finally { loading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.card-title { font-size: 14px; font-weight: 600; margin: 0 0 12px; color: #1f2430; }
.rank-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed #eef0f5; font-size: 13px; }
.rank-row:last-child { border-bottom: none; }
.rank-name { color: #1f2430; }
.rank-num { color: #4338ca; font-weight: 600; }
</style>
