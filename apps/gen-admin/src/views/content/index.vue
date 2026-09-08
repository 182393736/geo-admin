<template>
  <div class="page-container">
    <h2 class="page-title">内容与发稿</h2>
    <p class="page-desc">发稿渠道库（11万）/ 发稿订单 / 生成稿件 / 写作会话（只读）</p>

    <a-tabs v-model:active-key="tab">
      <a-tab-pane key="media" title="渠道库">
        <div class="toolbar">
          <a-input v-model="mediaKw" placeholder="搜索渠道名" style="width: 220px" allow-clear @press-enter="loadMedia(1)" />
          <a-button type="primary" @click="loadMedia(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">
            共 {{ mediaTotal }} 条
            <template v-if="mediaTotals">（启用 {{ mediaTotals.enabled }} · 累计被引 {{ mediaTotals.ref_count }}）</template>
          </span>
        </div>
        <div class="table-card">
          <a-table :data="medias" :columns="mediaCols" :loading="mediaLoading" :pagination="false" row-key="media_key" size="medium">
            <template #engines="{ record }">
              <a-tag v-for="e in record.indexed_engines" :key="e" size="small" color="arcoblue">{{ e }}</a-tag>
            </template>
            <template #enabled="{ record }">
              <a-tag :color="record.enabled ? 'green' : 'gray'" size="small">{{ record.enabled ? '启用' : '停用' }}</a-tag>
            </template>
          </a-table>
          <div class="pager"><a-pagination :total="mediaTotal" :current="mediaPage" :page-size="20" show-total @change="loadMedia" /></div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="publish" title="发稿订单">
        <div class="toolbar">
          <a-select v-model="poStatus" placeholder="状态" style="width: 150px" allow-clear @change="loadPublish(1)">
            <a-option value="pending">pending</a-option>
            <a-option value="submitted">submitted</a-option>
            <a-option value="ok">ok</a-option>
            <a-option value="fail">fail</a-option>
          </a-select>
          <a-button type="primary" @click="loadPublish(1)">查询</a-button>
          <span class="muted" style="margin-left: auto">共 {{ poTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="publishOrders" :columns="poCols" :loading="poLoading" :pagination="false" row-key="order_no" size="medium">
            <template #status="{ record }">
              <a-tag :color="record.status === 'ok' ? 'green' : record.status === 'fail' ? 'red' : 'arcoblue'" size="small">{{ record.status }}</a-tag>
            </template>
          </a-table>
          <div class="pager"><a-pagination :total="poTotal" :current="poPage" :page-size="20" show-total @change="loadPublish" /></div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="articles" title="生成稿件">
        <div class="toolbar">
          <a-button type="primary" @click="loadArticles(1)">刷新</a-button>
          <span class="muted" style="margin-left: auto">共 {{ artTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="articles" :columns="artCols" :loading="artLoading" :pagination="false" row-key="article_id" size="medium" />
          <div class="pager"><a-pagination :total="artTotal" :current="artPage" :page-size="20" show-total @change="loadArticles" /></div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="writing" title="写作会话">
        <div class="toolbar">
          <a-button type="primary" @click="loadWriting(1)">刷新</a-button>
          <span class="muted" style="margin-left: auto">共 {{ wjTotal }} 条</span>
        </div>
        <div class="table-card">
          <a-table :data="writingJobs" :columns="wjCols" :loading="wjLoading" :pagination="false" row-key="job_id" size="medium" />
          <div class="pager"><a-pagination :total="wjTotal" :current="wjPage" :page-size="20" show-total @change="loadWriting" /></div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';
import type { AdminMediaRow, AdminPublishOrderRow, AdminArticleRow, AdminWritingJobRow } from '@geo-admin/contracts';

const tab = ref('media');

// 渠道
const medias = ref<AdminMediaRow[]>([]);
const mediaTotal = ref(0); const mediaPage = ref(1); const mediaLoading = ref(false);
const mediaKw = ref('');
const mediaTotals = ref<Record<string, number> | null>(null);
const mediaCols = [
  { title: '名称', dataIndex: 'name', width: 140 },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '售价', dataIndex: 'sell_price', width: 100 },
  { title: '近30天被引', dataIndex: 'ref_count', width: 100 },
  { title: '单次被引成本', dataIndex: 'cost_per_citation', width: 110 },
  { title: '收录引擎', slotName: 'engines', width: 220 },
  { title: '状态', slotName: 'enabled', width: 80 },
];

// 发稿订单
const publishOrders = ref<AdminPublishOrderRow[]>([]);
const poTotal = ref(0); const poPage = ref(1); const poLoading = ref(false); const poStatus = ref('');
const poCols = [
  { title: '订单号', dataIndex: 'order_no', width: 180, ellipsis: true },
  { title: '稿件标题', dataIndex: 'article_title', ellipsis: true },
  { title: '媒体', dataIndex: 'media_name', width: 120 },
  { title: '状态', slotName: 'status', width: 90 },
  { title: '被引', dataIndex: 'cite_count', width: 70 },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

// 稿件
const articles = ref<AdminArticleRow[]>([]);
const artTotal = ref(0); const artPage = ref(1); const artLoading = ref(false);
const artCols = [
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '品牌', dataIndex: 'brand_id', width: 130, ellipsis: true },
  { title: '字数', dataIndex: 'word_count', width: 80 },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

// 写作会话
const writingJobs = ref<AdminWritingJobRow[]>([]);
const wjTotal = ref(0); const wjPage = ref(1); const wjLoading = ref(false);
const wjCols = [
  { title: '会话ID', dataIndex: 'job_id', width: 150, ellipsis: true },
  { title: '用户', dataIndex: 'uid', width: 130, ellipsis: true },
  { title: '选题', dataIndex: 'topic', ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 110 },
  { title: '当前节点', dataIndex: 'current_node', width: 120 },
  { title: '时间', dataIndex: 'created_at', width: 170 },
];

async function loadMedia(p = 1) {
  mediaLoading.value = true; mediaPage.value = p;
  try { const d = await adminApi.media({ page: p, page_size: 20, kw: mediaKw.value }); medias.value = d.list; mediaTotal.value = d.total; mediaTotals.value = d.totals; }
  finally { mediaLoading.value = false; }
}
async function loadPublish(p = 1) {
  poLoading.value = true; poPage.value = p;
  try { const d = await adminApi.publishOrders({ page: p, page_size: 20, status: poStatus.value }); publishOrders.value = d.list; poTotal.value = d.total; }
  finally { poLoading.value = false; }
}
async function loadArticles(p = 1) {
  artLoading.value = true; artPage.value = p;
  try { const d = await adminApi.articles({ page: p, page_size: 20 }); articles.value = d.list; artTotal.value = d.total; }
  finally { artLoading.value = false; }
}
async function loadWriting(p = 1) {
  wjLoading.value = true; wjPage.value = p;
  try { const d = await adminApi.writingJobs({ page: p, page_size: 20 }); writingJobs.value = d.list; wjTotal.value = d.total; }
  finally { wjLoading.value = false; }
}

onMounted(() => { loadMedia(1); loadPublish(1); loadArticles(1); loadWriting(1); });
</script>

<style scoped lang="scss">
.muted { color: #6b7280; font-size: 13px; }
</style>
