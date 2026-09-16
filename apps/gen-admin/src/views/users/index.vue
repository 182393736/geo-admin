<template>
  <div class="page-container">
    <h2 class="page-title">用户管理</h2>
    <p class="page-desc">全平台用户账号 · 支持搜索 / 添加用户 / 状态筛选 / 详情下钻<span v-if="purgeEnabled"> · <b style="color:#c81e1e">开发环境可清空用户全部数据</b></span></p>

    <div class="toolbar">
      <a-input v-model="kw" placeholder="搜索账号 / 手机号 / 姓名" style="width: 240px" allow-clear @press-enter="load(1)" />
      <a-select v-model="status" placeholder="状态" style="width: 140px" allow-clear @change="load(1)">
        <a-option value="active">active</a-option>
        <a-option value="disabled">disabled</a-option>
      </a-select>
      <a-checkbox v-model="onlySuper" @change="load(1)">仅管理员</a-checkbox>
      <a-button type="primary" @click="load(1)">查询</a-button>
      <a-button type="outline" @click="openCreate">添加用户</a-button>
      <span class="muted" style="margin-left: auto">共 {{ total }} 条</span>
    </div>

    <div class="table-card">
      <a-table :data="rows" :columns="cols" :loading="loading" :pagination="false" row-key="user_id" size="medium">
        <template #password="{ record }">
          <span class="pwd">{{ record.password || '—' }}</span>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">{{ record.status }}</a-tag>
        </template>
        <template #super="{ record }">
          <a-tag v-if="record.is_superuser" color="arcoblue">管理员</a-tag>
          <span v-else class="muted">—</span>
        </template>
        <template #op="{ record }">
          <a-space :size="8">
            <a-link @click="openDetail(record.user_id)">详情</a-link>
            <a-link
              v-if="purgeEnabled"
              status="danger"
              @click="openPurge(record)"
            >清空数据</a-link>
          </a-space>
        </template>
      </a-table>
      <div class="pager">
        <a-pagination :total="total" :current="page" :page-size="pageSize" show-total @change="load" />
      </div>
    </div>

    <!-- 添加用户 -->
    <a-modal
      v-model:visible="createOpen"
      title="添加新用户"
      :ok-loading="creating"
      ok-text="创建"
      unmount-on-close
      @ok="submitCreate"
      @cancel="createOpen = false"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="账号" required>
          <a-input v-model="form.account" placeholder="登录账号" allow-clear />
        </a-form-item>
        <a-form-item label="密码" required>
          <a-input v-model="form.password" placeholder="登录密码（列表中明文可见）" allow-clear />
        </a-form-item>
        <a-form-item label="姓名">
          <a-input v-model="form.name" placeholder="可选" allow-clear />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model="form.phone" placeholder="可选" allow-clear />
        </a-form-item>
        <a-form-item label="公司">
          <a-input v-model="form.company" placeholder="可选" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model="form.is_superuser">设为管理员（可登录总后台）</a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 用户详情抽屉 -->
    <a-drawer :visible="drawer" :width="680" :title="`用户详情 · ${detail?.user?.account || ''}`" @cancel="drawer = false" :footer="false">
      <a-spin :loading="detailLoading">
        <template v-if="detail">
          <h4 class="sec">基本信息</h4>
          <div class="kv">
            <span class="k">用户 ID</span><span class="v">{{ detail.user.user_id }}</span>
            <span class="k">账号</span><span class="v">{{ detail.user.account || '—' }}</span>
            <span class="k">密码</span><span class="v pwd">{{ detail.user.password || '—' }}</span>
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

          <h4 class="sec">Token 消耗</h4>
          <div class="kv" v-if="detail.token_summary">
            <span class="k">总 Tokens</span><span class="v">{{ detail.token_summary.tokens }}（调用 {{ detail.token_summary.calls }} 次 / 失败 {{ detail.token_summary.errors }}）</span>
            <span class="k">Prompt / Completion</span><span class="v">{{ detail.token_summary.prompt_tokens }} / {{ detail.token_summary.completion_tokens }}</span>
          </div>
          <a-table
            v-if="detail.token_summary?.by_call_site?.length"
            :data="detail.token_summary.by_call_site"
            :columns="tokenCols"
            :pagination="false"
            size="small"
            row-key="call_site"
            class="mb"
          />
          <p v-else class="muted">暂无 LLM 调用记录</p>

          <h4 class="sec">最近订单</h4>
          <a-table v-if="detail.orders.length" :data="detail.orders" :columns="orderCols" :pagination="false" size="small" row-key="order_no" />
          <p v-else class="muted">无订单</p>

          <h4 class="sec">最近行为</h4>
          <a-table v-if="detail.recent_clicks.length" :data="detail.recent_clicks" :columns="clickCols" :pagination="false" size="small" />
          <p v-else class="muted">无行为记录</p>

          <div v-if="purgeEnabled" class="purge-box">
            <h4 class="sec danger">危险操作（仅开发环境）</h4>
            <p class="muted">将永久删除该用户账号、品牌、监控、采集、积分、订单等全部业务数据，不可恢复。</p>
            <a-button type="primary" status="danger" :loading="purging" @click="openPurge(detail.user)">清空此用户全部数据</a-button>
          </div>
        </template>
      </a-spin>
    </a-drawer>

    <a-modal
      v-model:visible="purgeOpen"
      title="确认清空用户全部数据"
      ok-text="永久删除"
      :ok-loading="purging"
        :ok-button-props="{ status: 'danger' }"
      unmount-on-close
      @ok="submitPurge"
      @cancel="purgeOpen = false"
    >
      <a-alert type="error" style="margin-bottom: 12px">
        仅开发环境可用。将删除账号「{{ purgeTarget?.account }}」及其全部品牌与业务数据，不可恢复。
      </a-alert>
      <p class="muted" style="margin-bottom: 8px">请输入账号 <strong>{{ purgeTarget?.account }}</strong> 以确认：</p>
      <a-input v-model="purgeConfirm" placeholder="目标账号" allow-clear />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { adminApi } from '@/api/admin';
import { useAuthStore } from '@/stores/auth';
import type { AdminUserRow, AdminUserDetail } from '@geo-admin/contracts';

const auth = useAuthStore();
const purgeEnabled = computed(() => !!auth.admin?.purge_user_enabled);

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
  { title: '密码', slotName: 'password', width: 140 },
  { title: '手机号', dataIndex: 'phone', width: 130 },
  { title: '姓名', dataIndex: 'name', width: 120 },
  { title: '公司', dataIndex: 'company', ellipsis: true },
  { title: '品牌数', dataIndex: 'brand_count', width: 80 },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '角色', slotName: 'super', width: 100 },
  { title: '注册时间', dataIndex: 'created_at', width: 170 },
  { title: '', slotName: 'op', width: 140, fixed: 'right' as const },
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
const tokenCols = [
  { title: '操作', dataIndex: 'label', ellipsis: true },
  { title: 'call_site', dataIndex: 'call_site', width: 140 },
  { title: '次数', dataIndex: 'calls', width: 70 },
  { title: 'Tokens', dataIndex: 'tokens', width: 90 },
  { title: '失败', dataIndex: 'errors', width: 70 },
];

const drawer = ref(false);
const detail = ref<AdminUserDetail | null>(null);
const detailLoading = ref(false);

const createOpen = ref(false);
const creating = ref(false);
const form = reactive({
  account: '',
  password: '',
  name: '',
  phone: '',
  company: '',
  is_superuser: false,
});

function openCreate() {
  form.account = '';
  form.password = '';
  form.name = '';
  form.phone = '';
  form.company = '';
  form.is_superuser = false;
  createOpen.value = true;
}

async function submitCreate() {
  const account = form.account.trim();
  const password = form.password;
  if (!account) {
    Message.warning('请填写账号');
    return Promise.reject();
  }
  if (!password || password.length < 4) {
    Message.warning('密码至少 4 位');
    return Promise.reject();
  }
  creating.value = true;
  try {
    await adminApi.createUser({
      account,
      password,
      name: form.name.trim() || undefined,
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      is_superuser: form.is_superuser,
    });
    Message.success('用户已创建');
    createOpen.value = false;
    await load(1);
  } catch (e: any) {
    Message.error(e?.message || '创建失败');
    return Promise.reject();
  } finally {
    creating.value = false;
  }
}

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

const purgeOpen = ref(false);
const purging = ref(false);
const purgeConfirm = ref('');
const purgeTarget = ref<{ user_id: string; account: string } | null>(null);

function openPurge(row: { user_id: string; account: string }) {
  if (!purgeEnabled.value) {
    Message.warning('仅开发环境可用');
    return;
  }
  if (auth.admin?.user_id && row.user_id === auth.admin.user_id) {
    Message.warning('不能删除当前登录管理员自己');
    return;
  }
  purgeTarget.value = { user_id: row.user_id, account: row.account };
  purgeConfirm.value = '';
  purgeOpen.value = true;
}

async function submitPurge() {
  const target = purgeTarget.value;
  if (!target) return Promise.reject();
  if (purgeConfirm.value.trim() !== target.account) {
    Message.warning('账号不一致，请重新输入');
    return Promise.reject();
  }
  purging.value = true;
  try {
    const r = await adminApi.purgeUser(target.user_id, target.account);
    const n = Object.values(r.deleted || {}).reduce((s, x) => s + Number(x || 0), 0);
    Message.success(`已清空「${r.account}」相关数据（约 ${n} 条）`);
    purgeOpen.value = false;
    if (detail.value?.user?.user_id === target.user_id) {
      drawer.value = false;
      detail.value = null;
    }
    await load(page.value);
  } catch (e: any) {
    Message.error(e?.message || '清空失败');
    return Promise.reject();
  } finally {
    purging.value = false;
  }
}

onMounted(async () => {
  try { await auth.refreshMe?.(); } catch { /* ignore */ }
  await load(1);
});
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
.sec { font-size: 14px; font-weight: 600; margin: 18px 0 8px; color: #1f2430; }
.sec.danger { color: #c81e1e; }
.kv { display: grid; grid-template-columns: 120px 1fr; gap: 6px 10px; font-size: 13px; }
.kv .k { color: #6b7280; }
.kv .v { color: #1f2430; word-break: break-all; }
.pwd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 0.02em; }
.purge-box {
  margin-top: 24px;
  padding: 14px 16px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  border-radius: 10px;
}
</style>
