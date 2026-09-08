<template>
  <div class="page-container">
    <h2 class="page-title">用户管理</h2>
    <p class="page-desc">全平台用户账号（只读）· 支持搜索 / 状态筛选 / 详情下钻</p>

    <div class="toolbar">
      <a-input v-model="kw" placeholder="搜索账号 / 手机号 / 姓名" style="width: 240px" allow-clear @press-enter="load(1)" />
      <a-select v-model="status" placeholder="状态" style="width: 140px" allow-clear @change="load(1)">
        <a-option value="active">active</a-option>
        <a-option value="disabled">disabled</a-option>
      </a-select>
      <a-checkbox v-model="onlySuper" @change="load(1)">仅管理员</a-checkbox>
      <a-button type="primary" @click="load(1)">查询</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="user_id" size="medium">
        <template #status="{ record }">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">{{ record.status }}</a-tag>
        </template>
        <template #super="{ record }">
          <a-tag v-if="record.is_superuser" color="arcoblue">管理员</a-tag>
          <span v-else class="muted">—</span>
        </template>
        <template #op="{ record }">
          <a-link @click="openDetail(record.user_id)">详情</a-link>
        </template>
      </a-table>
      <div class="pager">
        <a-pagination :total="total" :current="page" :page-size="pageSize" show-total @change="load" />
      </div>
    </div>

    <!-- 用户详情抽屉 -->
    <a-drawer :visible="drawer" :width="680" :title="`用户详情 · ${detail?.user?.account || ''}`" @cancel="drawer = false" :footer="false">
      <a-spin :loading="detailLoading">
        <template v-if="detail">
          <h4 class="sec">基本信息</h4>
          <div class="kv">
            <span class="k">用户 ID</span><span class="v">{{ detail.user.user_id }}</span>
            <span class="k">账号</span><span class="v">{{ detail.user.account || '—' }}</span>
            <span class="k">手机号</span><span class="v">{{ detail.user.phone || '—' }}</span>
            <span class="k">姓名 / 公司</span><span class="v">{{ detail.user.name || '—' }} / {{ detail.user.company || '—' }}</span>
            <span class="k">行业</span><span class="v">{{ detail.user.industry || '—' }}</span>
            <span class="k">状态</span><span class="v">{{ detail.user.status }} · {{ detail.user.is_superuser ? '管理员' : '普通用户' }}</span>
            <span class="k">注册时间</span><span class="v">{{ detail.user.created_at }}</span>
          </div>

          <h4 class="sec">品牌（{{ detail.brands.length }}）</h4>
          <a-table :data="detail.brands" :columns="brandCols" :pagination="false" size="small" row-key="brand_id" />

          <h4 class="sec">订阅</h4>
          <a-table v-if="detail.subscriptions.length" :data="detail.subscriptions" :columns="subCols" :pagination="false" size="small" row-key="subscription_id" />
          <p v-else class="muted">无订阅记录</p>

          <h4 class="sec">积分钱包</h4>
          <div class="kv" v-if="detail.credit">
            <span class="k">金币</span><span class="v">{{ detail.credit.gold_balance }}</span>
            <span class="k">银币</span><span class="v">{{ detail.credit.silver_balance }}</span>
            <span class="k">冻结</span><span class="v">{{ detail.credit.frozen }}</span>
            <span class="k">累计充值 / 消费</span><span class="v">{{ detail.credit.total_recharge }} / {{ detail.credit.total_consume }}</span>
          </div>
          <p v-else class="muted">无钱包</p>

          <h4 class="sec">最近订单</h4>
          <a-table v-if="detail.orders.length" :data="detail.orders" :columns="orderCols" :pagination="false" size="small" row-key="order_no" />
          <p v-else class="muted">无订单</p>

          <h4 class="sec">最近行为</h4>
          <a-table v-if="detail.recent_clicks.length" :data="detail.recent_clicks" :columns="clickCols" :pagination="false" size="small" />
          <p v-else class="muted">无行为记录</p>
        </template>
      </a-spin>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminUserRow, AdminUserDetail } from '@geo-admin/contracts';

const loading = ref(false);
const rows = ref<AdminUserRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const kw = ref('');
const status = ref('');
const onlySuper = ref(false);

const cols = [
  { title: '账号', dataIndex: 'account', width: 140 },
  { title: '手机号', dataIndex: 'phone', width: 130 },
  { title: '姓名', dataIndex: 'name', width: 120 },
  { title: '公司', dataIndex: 'company', ellipsis: true },
  { title: '品牌数', dataIndex: 'brand_count', width: 80 },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '角色', slotName: 'super', width: 100 },
  { title: '注册时间', dataIndex: 'created_at', width: 170 },
  { title: '', slotName: 'op', width: 70, fixed: 'right' as const },
];
const brandCols = [
  { title: '品牌名', dataIndex: 'name', ellipsis: true },
  { title: '行业', dataIndex: 'industry', width: 130 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '问题数', dataIndex: 'query_count', width: 80 },
];
const subCols = [
  { title: '套餐', dataIndex: 'plan_name', width: 130 },
  { title: '到期', dataIndex: 'expire_date', width: 110 },
  { title: '状态', dataIndex: 'status', width: 90 },
];
const orderCols = [
  { title: '订单号', dataIndex: 'order_no', width: 170, ellipsis: true },
  { title: '类别', dataIndex: 'order_category', width: 80 },
  { title: '金额', dataIndex: 'pay_amount', width: 80 },
  { title: '状态', dataIndex: 'status', width: 80 },
];
const clickCols = [
  { title: '页面', dataIndex: 'source' },
  { title: '操作', dataIndex: 'operation', width: 80 },
  { title: '时间', dataIndex: 'created_at', width: 160 },
];

const drawer = ref(false);
const detail = ref<AdminUserDetail | null>(null);
const detailLoading = ref(false);

async function load(p = 1) {
  loading.value = true;
  page.value = p;
  try {
    const d = await adminApi.users({ page: p, page_size: pageSize, kw: kw.value, status: status.value, super: onlySuper.value });
    rows.value = d.list;
    total.value = d.total;
  } finally { loading.value = false; }
}

async function openDetail(id: string) {
  drawer.value = true;
  detailLoading.value = true;
  try { detail.value = await adminApi.userDetail(id); } finally { detailLoading.value = false; }
}

onMounted(() => load(1));
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.sec { font-size: 14px; font-weight: 600; margin: 18px 0 8px; color: #1f2430; }
.kv { display: grid; grid-template-columns: 120px 1fr; gap: 6px 10px; font-size: 13px; }
.kv .k { color: #6b7280; }
.kv .v { color: #1f2430; word-break: break-all; }
</style>
