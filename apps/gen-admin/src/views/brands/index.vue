<template>
  <div class="page-container">
    <h2 class="page-title">品牌管理</h2>
    <p class="page-desc">全平台品牌（只读）· 详情下钻：画像 / 别名 / 竞品 / 监控问题 / 订阅 / 采集任务</p>

    <div class="toolbar">
      <a-input v-model="kw" placeholder="搜索品牌名" style="width: 240px" allow-clear @press-enter="load(1)" />
      <a-select v-model="status" placeholder="状态" style="width: 160px" allow-clear @change="load(1)">
        <a-option value="building">building</a-option>
        <a-option value="active">active</a-option>
        <a-option value="expired">expired</a-option>
        <a-option value="disabled">disabled</a-option>
      </a-select>
      <a-button type="primary" @click="load(1)">查询</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="brand_id" size="medium">
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
        </template>
        <template #op="{ record }">
          <a-link @click="openDetail(record.brand_id)">详情</a-link>
        </template>
      </a-table>
      <div class="pager">
        <a-pagination :total="total" :current="page" :page-size="pageSize" show-total @change="load" />
      </div>
    </div>

    <a-drawer :visible="drawer" :width="720" :title="`品牌详情 · ${detail?.brand?.name || ''}`" @cancel="drawer = false" :footer="false">
      <a-spin :loading="detailLoading">
        <template v-if="detail">
          <h4 class="sec">基本信息</h4>
          <div class="kv">
            <span class="k">品牌 ID</span><span class="v">{{ detail.brand.brand_id }}</span>
            <span class="k">名称</span><span class="v">{{ detail.brand.name }}</span>
            <span class="k">行业</span><span class="v">{{ detail.brand.industry || '—' }}</span>
            <span class="k">所属用户</span><span class="v">{{ detail.brand.account }}（{{ detail.brand.user_id }}）</span>
            <span class="k">状态 / 剩余改名</span><span class="v">{{ detail.brand.status }} / {{ detail.brand.rename_remaining }}</span>
            <span class="k">监测平台</span><span class="v">{{ (detail.brand.platforms || []).join(', ') }}</span>
            <span class="k">创建时间</span><span class="v">{{ detail.brand.created_at }}</span>
          </div>

          <h4 class="sec">画像</h4>
          <p class="muted" v-if="!detail.profile">无画像</p>
          <div v-else class="kv">
            <span class="k">定位</span><span class="v">{{ (detail.profile as any).description || '—' }}</span>
            <span class="k">Slogan</span><span class="v">{{ (detail.profile as any).slogan || '—' }}</span>
            <span class="k">话术</span><span class="v">{{ ((detail.profile as any).scripts || []).join('；') || '—' }}</span>
          </div>

          <h4 class="sec">别名（{{ detail.aliases.length }}）</h4>
          <div v-if="detail.aliases.length">
            <a-tag v-for="(a, i) in detail.aliases" :key="i" :color="a.enabled ? 'green' : 'gray'" class="tag">{{ a.alias }}<span class="muted"> · {{ a.source }}</span></a-tag>
          </div>
          <p v-else class="muted">无别名</p>

          <h4 class="sec">竞品（{{ detail.competitors.length }}）</h4>
          <div v-if="detail.competitors.length">
            <div v-for="(c, i) in detail.competitors" :key="i" class="comp-row">
              <span class="comp-name">{{ c.name }}</span>
              <span class="muted">{{ c.compet_point || '—' }}</span>
            </div>
          </div>
          <p v-else class="muted">无竞品</p>

          <h4 class="sec">监控问题（{{ detail.queries.length }}）</h4>
          <a-table :data="detail.queries" :columns="qCols" :pagination="false" size="small" row-key="query_id" />

          <h4 class="sec">订阅</h4>
          <div class="kv" v-if="detail.subscription">
            <span class="k">套餐</span><span class="v">{{ detail.subscription.plan_name }}</span>
            <span class="k">周期</span><span class="v">{{ detail.subscription.start_date }} ~ {{ detail.subscription.expire_date }}</span>
            <span class="k">额度用量</span><span class="v">{{ detail.subscription.query_count }} / {{ detail.subscription.query_limit }}</span>
            <span class="k">状态</span><span class="v">{{ detail.subscription.status }}</span>
          </div>
          <p v-else class="muted">无订阅</p>

          <h4 class="sec">积分钱包</h4>
          <div class="kv" v-if="detail.credit">
            <span class="k">金币 / 银币</span><span class="v">{{ detail.credit.gold_balance }} / {{ detail.credit.silver_balance }}</span>
            <span class="k">冻结</span><span class="v">{{ detail.credit.frozen }}</span>
          </div>
          <p v-else class="muted">无钱包</p>

          <h4 class="sec">最近采集任务</h4>
          <a-table v-if="detail.collect_tasks.length" :data="detail.collect_tasks" :columns="taskCols" :pagination="false" size="small" row-key="task_id" />
          <p v-else class="muted">暂无采集任务</p>
        </template>
      </a-spin>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminBrandRow, AdminBrandDetail } from '@geo-admin/contracts';

const loading = ref(false);
const rows = ref<AdminBrandRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const kw = ref('');
const status = ref('');

const cols = [
  { title: '品牌名', dataIndex: 'name', ellipsis: true },
  { title: '行业', dataIndex: 'industry', width: 140 },
  { title: '账号', dataIndex: 'account', width: 120 },
  { title: '状态', slotName: 'status', width: 100 },
  { title: '平台数', dataIndex: 'platforms', width: 90, render: ({ record }: any) => (record.platforms || []).length },
  { title: '剩余改名', dataIndex: 'rename_remaining', width: 90 },
  { title: '创建时间', dataIndex: 'created_at', width: 170 },
  { title: '', slotName: 'op', width: 70, fixed: 'right' as const },
];
const qCols = [
  { title: 'ID', dataIndex: 'query_id', width: 70 },
  { title: '问题', dataIndex: 'query', ellipsis: true },
  { title: '类型', dataIndex: 'query_type', width: 90 },
  { title: '启用', dataIndex: 'query_status', width: 70, render: ({ record }: any) => (record.query_status ? '是' : '否') },
  { title: '权重', dataIndex: 'weight', width: 70 },
];
const taskCols = [
  { title: '日期', dataIndex: 'date', width: 110 },
  { title: '应采/已采/失败', width: 160, render: ({ record }: any) => `${record.expected_slots}/${record.actual_slots}/${record.failed_slots}` },
  { title: '状态', dataIndex: 'status', width: 90 },
];

const drawer = ref(false);
const detail = ref<AdminBrandDetail | null>(null);
const detailLoading = ref(false);

function statusColor(s: string) {
  return s === 'active' ? 'green' : s === 'building' ? 'arcoblue' : s === 'expired' ? 'orange' : 'red';
}

async function load(p = 1) {
  loading.value = true;
  page.value = p;
  try {
    const d = await adminApi.brands({ page: p, page_size: pageSize, kw: kw.value, status: status.value });
    rows.value = d.list;
    total.value = d.total;
  } finally { loading.value = false; }
}

async function openDetail(id: string) {
  drawer.value = true;
  detailLoading.value = true;
  try { detail.value = await adminApi.brandDetail(id); } finally { detailLoading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.sec { font-size: 14px; font-weight: 600; margin: 18px 0 8px; color: #1f2430; }
.kv { display: grid; grid-template-columns: 130px 1fr; gap: 6px 10px; font-size: 13px; }
.kv .k { color: #6b7280; }
.kv .v { color: #1f2430; word-break: break-all; }
.tag { margin: 2px 6px 2px 0; }
.comp-row { padding: 6px 0; border-bottom: 1px dashed #eef0f5; font-size: 13px; }
.comp-row:last-child { border-bottom: none; }
.comp-name { font-weight: 600; margin-right: 10px; }
</style>
