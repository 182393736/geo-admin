<template>
  <div class="page-container">
    <h2 class="page-title">计费中心</h2>
    <p class="page-desc">套餐 / 订阅 / 订单 / 积分钱包 / 流水（只读监控，对账用）</p>

    <a-tabs v-model:active-key="tab">
      <a-tab-pane key="plans" title="套餐配置">
        <div class="table-card">
          <a-table :data="plans" :columns="planCols" :loading="planLoading" :pagination="false" row-key="plan_id" size="medium">
            <template #on_sale="{ record }">
              <a-tag :color="record.on_sale ? 'green' : 'gray'">{{ record.on_sale ? '在售' : '下架' }}</a-tag>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="subs" title="订阅">
        <div class="toolbar">
          <a-select v-model="subStatus" placeholder="状态" style="width: 150px" allow-clear @change="loadSubs(1)">
            <a-option value="active">active</a-option>
            <a-option value="expired">expired</a-option>
            <a-option value="refunded">refunded</a-option>
          </a-select>
          <a-button type="primary" @click="loadSubs(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ subTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="subs" :columns="subCols" :loading="subLoading" :pagination="false" row-key="subscription_id" size="medium">
            <template #status="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">{{ record.status }}</a-tag>
            </template>
          </a-table>
          <div class="pager"><a-pagination :total="subTotal" :current="subPage" :page-size="20" show-total @change="loadSubs" /></div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="orders" title="订单">
        <div class="toolbar">
          <a-select v-model="orderStatus" placeholder="状态" style="width: 150px" allow-clear @change="loadOrders(1)">
            <a-option value="pending">pending</a-option>
            <a-option value="paid">paid</a-option>
            <a-option value="failed">failed</a-option>
            <a-option value="refunded">refunded</a-option>
            <a-option value="closed">closed</a-option>
          </a-select>
          <a-select v-model="orderCategory" placeholder="类别" style="width: 150px" allow-clear @change="loadOrders(1)">
            <a-option value="plan">plan</a-option>
            <a-option value="recharge">recharge</a-option>
            <a-option value="diagnosis">diagnosis</a-option>
          </a-select>
          <a-button type="primary" @click="loadOrders(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ orderTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="orders" :columns="orderCols" :loading="orderLoading" :pagination="false" row-key="order_no" size="medium">
            <template #status="{ record }">
              <a-tag :color="orderColor(record.status)">{{ record.status }}</a-tag>
            </template>
          </a-table>
          <div class="pager"><a-pagination :total="orderTotal" :current="orderPage" :page-size="20" show-total @change="loadOrders" /></div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="credit" title="积分钱包">
        <div class="toolbar">
          <a-button type="primary" @click="loadCredit(1)">刷新</a-button>
          <span class="muted" style="margin-left: auto">共 {{ creditTotal }} 户</span>
        </div>
        <div v-if="creditTotals" class="stat-grid mb">
          <StatCard label="金币余额合计" :value="creditTotals.gold_balance ?? 0" />
          <StatCard label="银币余额合计" :value="creditTotals.silver_balance ?? 0" />
          <StatCard label="冻结合计" :value="creditTotals.frozen ?? 0" />
          <StatCard label="累计充值" :value="creditTotals.total_recharge ?? 0" />
          <StatCard label="累计消费" :value="creditTotals.total_consume ?? 0" />
        </div>
        <div class="table-card">
          <a-table :data="credits" :columns="creditCols" :loading="creditLoading" :pagination="false" row-key="user_id" size="medium" />
          <div class="pager"><a-pagination :total="creditTotal" :current="creditPage" :page-size="20" show-total @change="loadCredit" /></div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="txns" title="积分流水">
        <div class="toolbar">
          <a-select v-model="txnType" placeholder="类型" style="width: 150px" allow-clear @change="loadTxns(1)">
            <a-option value="recharge">recharge</a-option>
            <a-option value="consume">consume</a-option>
            <a-option value="freeze">freeze</a-option>
            <a-option value="unfreeze">unfreeze</a-option>
            <a-option value="refund">refund</a-option>
            <a-option value="expired">expired</a-option>
          </a-select>
          <a-button type="primary" @click="loadTxns(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ txnTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="txns" :columns="txnCols" :loading="txnLoading" :pagination="false" row-key="txn_id" size="medium">
            <template #amount="{ record }">
              <span :style="{ color: record.amount >= 0 ? '#16a34a' : '#dc2626' }">{{ record.amount > 0 ? '+' : '' }}{{ record.amount }}</span>
            </template>
          </a-table>
          <div class="pager"><a-pagination :total="txnTotal" :current="txnPage" :page-size="20" show-total @change="loadTxns" /></div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import StatCard from '@/components/StatCard.vue';
import { adminApi } from '@/api/admin';
import type { AdminPlanRow, AdminSubscriptionRow, AdminOrderRow, AdminCreditAccountRow, AdminCreditTxnRow } from '@geo-admin/contracts';

const tab = ref('plans');

// 套餐
const plans = ref<AdminPlanRow[]>([]);
const planLoading = ref(false);
const planCols = [
  { title: 'ID', dataIndex: 'plan_id', width: 70 },
  { title: '名称', dataIndex: 'plan_name' },
  { title: '编码', dataIndex: 'plan_code', width: 150 },
  { title: '类型', dataIndex: 'plan_type', width: 90 },
  { title: '周期', dataIndex: 'billing_cycle', width: 90 },
  { title: '价格', dataIndex: 'price', width: 90 },
  { title: '问题额度', dataIndex: 'query_limit', width: 90 },
  { title: '在售', slotName: 'on_sale', width: 80 },
];

// 订阅
const subs = ref<AdminSubscriptionRow[]>([]);
const subTotal = ref(0); const subPage = ref(1); const subLoading = ref(false); const subStatus = ref('');
const subCols = [
  { title: '订阅ID', dataIndex: 'subscription_id', width: 90 },
  { title: '用户', dataIndex: 'user_id', width: 130, ellipsis: true },
  { title: '品牌', dataIndex: 'brand_id', width: 130, ellipsis: true },
  { title: '套餐', dataIndex: 'plan_name', width: 130 },
  { title: '周期', width: 200, render: ({ record }: any) => `${record.start_date} ~ ${record.expire_date}` },
  { title: '用量', width: 90, render: ({ record }: any) => `${record.query_count}/${record.query_limit}` },
  { title: '状态', slotName: 'status', width: 90 },
];

// 订单
const orders = ref<AdminOrderRow[]>([]);
const orderTotal = ref(0); const orderPage = ref(1); const orderLoading = ref(false);
const orderStatus = ref(''); const orderCategory = ref('');
const orderCols = [
  { title: '订单号', dataIndex: 'order_no', width: 180, ellipsis: true },
  { title: '类别', dataIndex: 'order_category', width: 90 },
  { title: '套餐', dataIndex: 'plan_name', width: 130 },
  { title: '支付方式', dataIndex: 'pay_method', width: 90 },
  { title: '实付', dataIndex: 'pay_amount', width: 90 },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

// 钱包
const credits = ref<AdminCreditAccountRow[]>([]);
const creditTotal = ref(0); const creditPage = ref(1); const creditLoading = ref(false);
const creditTotals = ref<Record<string, number> | null>(null);
const creditCols = [
  { title: '用户', dataIndex: 'user_id', width: 150, ellipsis: true },
  { title: '金币', dataIndex: 'gold_balance', width: 90 },
  { title: '银币', dataIndex: 'silver_balance', width: 90 },
  { title: '冻结', dataIndex: 'frozen', width: 90 },
  { title: '可用', dataIndex: 'available', width: 90 },
  { title: '累计充值', dataIndex: 'total_recharge', width: 100 },
  { title: '累计消费', dataIndex: 'total_consume', width: 100 },
  { title: '更新时间', dataIndex: 'updated_at', width: 170 },
];

// 流水
const txns = ref<AdminCreditTxnRow[]>([]);
const txnTotal = ref(0); const txnPage = ref(1); const txnLoading = ref(false); const txnType = ref('');
const txnCols = [
  { title: '流水ID', dataIndex: 'txn_id', width: 150, ellipsis: true },
  { title: '用户', dataIndex: 'user_id', width: 130, ellipsis: true },
  { title: '类型', dataIndex: 'type', width: 90 },
  { title: '币种', dataIndex: 'coin', width: 70 },
  { title: '金额', slotName: 'amount', width: 90 },
  { title: '变动后余额', dataIndex: 'balance_after', width: 100 },
  { title: '关联', width: 180, render: ({ record }: any) => `${record.ref_type}/${record.ref_id}` },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

function orderColor(s: string) {
  return s === 'paid' ? 'green' : s === 'pending' ? 'arcoblue' : s === 'refunded' ? 'orange' : 'red';
}

async function loadPlans() {
  planLoading.value = true;
  try { plans.value = (await adminApi.plans()).list; } finally { planLoading.value = false; }
}
async function loadSubs(p = 1) {
  subLoading.value = true; subPage.value = p;
  try { const d = await adminApi.subscriptions({ page: p, page_size: 20, status: subStatus.value }); subs.value = d.list; subTotal.value = d.total; }
  finally { subLoading.value = false; }
}
async function loadOrders(p = 1) {
  orderLoading.value = true; orderPage.value = p;
  try { const d = await adminApi.orders({ page: p, page_size: 20, status: orderStatus.value, category: orderCategory.value }); orders.value = d.list; orderTotal.value = d.total; }
  finally { orderLoading.value = false; }
}
async function loadCredit(p = 1) {
  creditLoading.value = true; creditPage.value = p;
  try { const d = await adminApi.credit({ page: p, page_size: 20 }); credits.value = d.list; creditTotal.value = d.total; creditTotals.value = d.totals; }
  finally { creditLoading.value = false; }
}
async function loadTxns(p = 1) {
  txnLoading.value = true; txnPage.value = p;
  try { const d = await adminApi.creditTxns({ page: p, page_size: 20, type: txnType.value }); txns.value = d.list; txnTotal.value = d.total; }
  finally { txnLoading.value = false; }
}

onMounted(() => { loadPlans(); loadSubs(1); loadOrders(1); loadCredit(1); loadTxns(1); });
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.mb { margin-bottom: 14px; }
.stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
</style>
