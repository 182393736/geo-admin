<template>
  <div class="page-container">
    <h2 class="page-title">LLM 调用监控</h2>
    <p class="page-desc">我方 API 调用成本（首登 / 解析等）。按操作点聚合；可筛用户、品牌。不含采集端第三方引擎对话。</p>

    <div class="toolbar">
      <a-input v-model="callSite" placeholder="call_site，如 LLM-07" style="width: 180px" allow-clear @press-enter="load(1)" />
      <a-input v-model="userId" placeholder="user_id" style="width: 200px" allow-clear @press-enter="load(1)" />
      <a-input v-model="brandId" placeholder="brand_id" style="width: 200px" allow-clear @press-enter="load(1)" />
      <a-select v-model="success" placeholder="成败" style="width: 120px" allow-clear @change="load(1)">
        <a-option value="true">成功</a-option>
        <a-option value="false">失败</a-option>
      </a-select>
      <a-button type="primary" @click="load(1)">查询</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条 · Tokens {{ totalTokens }}</span>
    </div>

    <div class="agg-grid mb">
      <div v-for="a in agg" :key="a.call_site" class="agg-card">
        <div class="agg-title">{{ a.label || a.call_site }}</div>
        <div class="agg-sub">{{ a.call_site }}</div>
        <div class="agg-num">{{ a.calls }}<span class="unit">次</span></div>
        <div class="agg-line">
          <span>失败 {{ a.errors }}</span>
          <span>Tokens {{ a.tokens }}</span>
          <span>均 {{ a.avg_latency_ms }}ms</span>
        </div>
      </div>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="created_at" size="medium">
        <template #site="{ record }">
          <div>{{ record.call_site_label || record.call_site }}</div>
          <div class="muted tiny">{{ record.call_site }}</div>
        </template>
        <template #success="{ record }">
          <a-tag :color="record.success ? 'green' : 'red'" size="small">{{ record.success ? '成功' : '失败' }}</a-tag>
        </template>
        <template #tokens="{ record }">
          {{ record.usage?.total_tokens ?? 0 }}
        </template>
        <template #error="{ record }">
          <a-tooltip v-if="record.error" :content="record.error">
            <span class="danger">查看</span>
          </a-tooltip>
          <span v-else class="muted">—</span>
        </template>
      </a-table>
      <div class="pager">
        <a-pagination :total="total" :current="page" :page-size="pageSize" show-total @change="load" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminLlmLogRow, AdminLlmAgg } from '@geo-admin/contracts';

const loading = ref(false);
const rows = ref<AdminLlmLogRow[]>([]);
const agg = ref<AdminLlmAgg[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const callSite = ref('');
const userId = ref('');
const brandId = ref('');
const success = ref('');

const totalTokens = computed(() => agg.value.reduce((s, a) => s + (a.tokens || 0), 0));

const cols = [
  { title: '操作', slotName: 'site', width: 160 },
  { title: '时间', dataIndex: 'created_at', width: 170 },
  { title: '账号', dataIndex: 'account', width: 120, ellipsis: true, render: ({ record }: any) => record.account || '—' },
  { title: '品牌', dataIndex: 'brand_name', width: 140, ellipsis: true, render: ({ record }: any) => record.brand_name || record.brand_id || '—' },
  { title: '模型', dataIndex: 'model', width: 120, ellipsis: true },
  { title: 'Tokens', slotName: 'tokens', width: 90 },
  { title: '延迟(ms)', dataIndex: 'latency_ms', width: 90 },
  { title: '重试', dataIndex: 'retry', width: 60 },
  { title: '成败', slotName: 'success', width: 80 },
  { title: '错误', slotName: 'error', width: 70 },
];

async function load(p = 1) {
  loading.value = true;
  page.value = p;
  try {
    const d = await adminApi.llmLogs({
      page: p, page_size: pageSize,
      call_site: callSite.value,
      user_id: userId.value,
      brand_id: brandId.value,
      success: success.value,
    });
    rows.value = d.list;
    agg.value = d.agg;
    total.value = d.total;
  } finally { loading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.tiny { font-size: 11px; margin-top: 2px; }
.danger { color: #dc2626; font-size: 13px; cursor: pointer; }
.mb { margin-bottom: 14px; }
.agg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
.agg-card {
  background: #fff; border-radius: 10px; padding: 12px 14px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06);
}
.agg-title { font-size: 13px; font-weight: 600; color: #4338ca; }
.agg-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
.agg-num { font-size: 22px; font-weight: 700; color: #1f2430; margin: 2px 0; }
.agg-num .unit { font-size: 12px; color: #6b7280; margin-left: 2px; }
.agg-line { display: flex; gap: 10px; font-size: 12px; color: #6b7280; flex-wrap: wrap; }
</style>
