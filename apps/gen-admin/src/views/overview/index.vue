<template>
  <div class="page-container">
    <h2 class="page-title">运营驾驶舱</h2>
    <p class="page-desc">跨用户 / 跨品牌全局监控 · 数据来自 /admin/overview（实时聚合）</p>

    <a-spin :loading="loading">
      <template v-if="d">
        <!-- 规模 -->
        <div class="stat-grid">
          <StatCard label="注册用户" :value="d.counts.users" />
          <StatCard label="品牌总数" :value="d.counts.brands" :extra="`活跃 ${d.counts.active_brands}`" />
          <StatCard label="监控问题" :value="d.counts.monitor_queries" />
          <StatCard label="发稿渠道" :value="d.counts.media_channels" />
          <StatCard label="活跃订阅" :value="d.counts.subscriptions_active" />
        </div>

        <!-- 采集健康 -->
        <a-row :gutter="16" class="mt">
          <a-col :span="12">
            <div class="card">
              <h3 class="card-title">📡 今日采集健康（{{ d.collection.date }}）</h3>
              <div class="stat-grid small">
                <StatCard label="采集任务" :value="d.collection.tasks" />
                <StatCard label="应采槽位" :value="d.collection.expected_slots" />
                <StatCard label="已采槽位" :value="d.collection.actual_slots" />
                <StatCard label="失败槽位" :value="d.collection.failed_slots" :color="d.collection.failed_slots > 0 ? '#dc2626' : undefined" />
              </div>
              <div class="mt">
                <div class="kv-row"><span>完成率</span><a-progress :percent="(d.collection.completeness ?? 0) / 100" :color="completenessColor" /></div>
                <div class="kv-row" v-if="Object.keys(d.collection.status).length">
                  <span>任务状态分布</span>
                  <span class="muted">
                    <span v-for="(n, s) in d.collection.status" :key="s" class="chip">{{ s }} {{ n }}</span>
                  </span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="card">
              <h3 class="card-title">🧩 解析与数据量</h3>
              <div class="stat-grid small">
                <StatCard label="原始回答" :value="d.parse.raw_total" />
                <StatCard label="待解析积压" :value="d.parse.unparsed" :color="d.parse.unparsed > 1000 ? '#dc2626' : undefined" />
                <StatCard label="品牌提及" :value="d.parse.mentions" />
                <StatCard label="观点" :value="d.parse.opinions" />
              </div>
              <div class="mt kv-row"><span>归一实体 / 信源</span><span class="muted">{{ d.parse.entities }} / {{ d.parse.canonical_sources }}</span></div>
              <div class="kv-row"><span>引用边</span><span class="muted">{{ d.parse.citations }}</span></div>
            </div>
          </a-col>
        </a-row>

        <!-- LLM / 计费 / 报告 / 告警 -->
        <a-row :gutter="16" class="mt">
          <a-col :span="6">
            <div class="card">
              <h3 class="card-title">🤖 今日 LLM 消耗</h3>
              <div class="big-num">{{ d.llm.today_calls }}</div>
              <div class="muted">调用次数</div>
              <div class="kv-row"><span>Token</span><span class="muted">{{ d.llm.today_tokens }}</span></div>
              <div class="kv-row"><span>失败</span><span class="muted" :class="{ 'danger': d.llm.today_errors > 0 }">{{ d.llm.today_errors }}</span></div>
              <div class="kv-row"><span>均延迟 / P95</span><span class="muted">{{ d.llm.today_avg_latency_ms }}ms / {{ d.llm.today_p95_latency_ms }}ms</span></div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="card">
              <h3 class="card-title">💰 计费概览</h3>
              <div class="big-num">¥{{ d.billing.today_gmv }}</div>
              <div class="muted">今日实收（{{ d.billing.today_orders }} 单）</div>
              <div class="kv-row"><span>金币余额</span><span class="muted">{{ d.billing.gold_balance }}</span></div>
              <div class="kv-row"><span>银币余额</span><span class="muted">{{ d.billing.silver_balance }}</span></div>
              <div class="kv-row"><span>冻结中</span><span class="muted">{{ d.billing.frozen }}</span></div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="card">
              <h3 class="card-title">📄 报告状态</h3>
              <div class="stat-grid small">
                <StatCard label="就绪" :value="d.reports.ready" color="#16a34a" />
                <StatCard label="生成中" :value="d.reports.generating" color="#ea580c" />
                <StatCard label="失败" :value="d.reports.failed" color="#dc2626" />
              </div>
              <h3 class="card-title mt">🔔 告警（未读）</h3>
              <div class="stat-grid small">
                <StatCard label="error" :value="d.reminders.error" color="#dc2626" />
                <StatCard label="warn" :value="d.reminders.warn" color="#ea580c" />
              </div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="card">
              <h3 class="card-title">🛠️ 调度与队列</h3>
              <div class="kv-row"><span>队列积压</span><span class="muted">{{ d.schedule.queue_backlog }}</span></div>
              <div class="kv-row"><span>最近采集日</span><span class="muted">{{ d.schedule.last_collect_date || '—' }}</span></div>
              <div class="kv-row"><span>最近报告</span><span class="muted">{{ d.schedule.last_report_at ? fmtTime(d.schedule.last_report_at) : '—' }}</span></div>
            </div>
          </a-col>
        </a-row>

        <!-- 最近动态 -->
        <a-row :gutter="16" class="mt">
          <a-col :span="12">
            <div class="card">
              <h3 class="card-title">🆕 最近注册用户</h3>
              <a-table :data="d.recent.users" :columns="userCols" :pagination="false" size="small" row-key="user_id" />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="card">
              <h3 class="card-title">🧾 最近订单</h3>
              <a-table :data="d.recent.orders" :columns="orderCols" :pagination="false" size="small" row-key="order_no" />
            </div>
          </a-col>
        </a-row>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import StatCard from '@/components/StatCard.vue';
import { adminApi } from '@/api/admin';
import type { AdminOverview } from '@geo-admin/contracts';

const loading = ref(false);
const d = ref<AdminOverview | null>(null);

const userCols = [
  { title: '账号', dataIndex: 'account', width: 120 },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '注册时间', dataIndex: 'created_at', width: 160, render: ({ record }: any) => fmtTime(record.created_at) },
];
const orderCols = [
  { title: '订单号', dataIndex: 'order_no', width: 170, ellipsis: true },
  { title: '类别', dataIndex: 'order_category', width: 70 },
  { title: '金额', dataIndex: 'pay_amount', width: 80 },
  { title: '状态', dataIndex: 'status', width: 80 },
];

const completenessColor = computed(() => {
  const v = d.value?.collection.completeness ?? 100;
  return v < 80 ? '#dc2626' : v < 95 ? '#ea580c' : '#16a34a';
});

function fmtTime(t: string | Date | null | undefined) {
  if (!t) return '—';
  const s = new Date(t);
  return `${s.getMonth() + 1}-${s.getDate()} ${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`;
}

onMounted(async () => {
  loading.value = true;
  try { d.value = await adminApi.overview(); } finally { loading.value = false; }
});
</script>

<style scoped lang="scss">
.mt { margin-top: 16px; }
.stat-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
  &.small { grid-template-columns: repeat(4, 1fr); }
}
.card-title { font-size: 14px; font-weight: 600; margin: 0 0 12px; color: #1f2430; }
.big-num { font-size: 28px; font-weight: 700; color: #1f2430; }
.muted { color: #6b7280; font-size: 13px; }
.danger { color: #dc2626; }
.kv-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0; border-bottom: 1px dashed #eef0f5; font-size: 13px;
  &:last-child { border-bottom: none; }
  > span:first-child { color: #6b7280; }
}
.chip {
  display: inline-block; background: #f3f4f6; color: #374151; border-radius: 4px;
  padding: 1px 8px; margin-left: 6px; font-size: 12px;
}
</style>
