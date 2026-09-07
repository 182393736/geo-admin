<template>
  <div class="ranking-page">
    <div v-if="currentTab === 'Ranking'" class="tab-content">
      <PreCollectionEmpty title="AI排名透视" />
    </div>

    <div v-else-if="currentTab === 'RankingCompetitor'" class="tab-content">
      <PreCollectionEmpty title="AI竞品透视" />
    </div>

    <div v-else-if="currentTab === 'RankingCitation'" class="tab-content">
      <PreCollectionEmpty title="引用源追溯" />
    </div>

    <div v-else-if="currentTab === 'RankingSourcePref'" class="tab-content">
      <PreCollectionEmpty title="信源平台偏好" />
    </div>

    <div v-else-if="currentTab === 'RankingSourceIntel'" class="tab-content">
      <PreCollectionEmpty title="引用源洞察" />
    </div>

    <div v-else-if="currentTab === 'RankingSnapshot'" class="tab-content">
      <PreCollectionEmpty title="搜索快照下载" />
    </div>

    <div v-else-if="currentTab === 'RankingExport'" class="tab-content">
      <PreCollectionEmpty title="导出品牌透视报告" />
    </div>

    <div v-else-if="currentTab === 'RankingQuestionMgmt'" class="qm-page">
      <!-- 头部区域：标题 + 配额卡片 -->
      <div class="qm-header-section">
        <div class="qm-title-block">
          <h2 class="qm-title">监控问题管理</h2>
          <div class="qm-desc-row">
            <span class="qm-desc-text">配置实际发送给 AI 的监控问题。</span>
          </div>
        </div>
        <div class="qm-quota-card">
          <!-- 总占用 -->
          <div class="qm-quota-item qm-quota-item--total">
            <div class="qm-quota-label-row">
              <span class="qm-quota-label">总占用 · 全部分类</span>
            </div>
            <span class="qm-quota-value qm-quota-value--red">{{ totalUsed }} <span class="qm-quota-suffix">/ {{ totalLimit }}</span></span>
          </div>
          <!-- 本页 · 排名词 -->
          <div class="qm-quota-item qm-quota-item--page">
            <div class="qm-quota-label-row">
              <span class="qm-quota-label">本页 · 排名词</span>
              <span class="qm-quota-tip-icon" title="总占用 · 全部分类：排名词 + 口碑词 全部已占用额度，是计费依据。&#10;本页 · 排名词：仅当前分类下的问题条数，所以会小于总占用，属正常现象。">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
              </span>
            </div>
            <span class="qm-quota-value qm-quota-value--indigo">{{ rankCount }} <span class="qm-quota-suffix">个</span></span>
          </div>
          <!-- 待释放 -->
          <div class="qm-quota-item qm-quota-item--pending">
            <div class="qm-quota-label-row">
              <span class="qm-quota-dot qm-quota-dot--amber"></span>
              <span class="qm-quota-label">待释放</span>
            </div>
            <span class="qm-quota-value qm-quota-value--amber">0 <span class="qm-quota-suffix">个</span></span>
          </div>
          <!-- 扩容 -->
          <button class="qm-quota-upgrade" title="升级套餐">
            <svg class="qm-upgrade-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
            <span class="qm-upgrade-text">扩容</span>
          </button>
        </div>
      </div>

      <!-- 内容卡片 -->
      <div class="qm-card">
        <!-- 卡片头 -->
        <div class="qm-card-header">
          <div class="qm-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            <span>问题列表 ({{ rankQueries.length }})</span>
          </div>
          <div class="qm-card-actions">
            <div class="qm-search-wrap">
              <svg class="qm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
              <input class="qm-search-input" type="text" placeholder="搜索问题..." />
            </div>
            <button class="qm-action-btn qm-action-btn--outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
              导出
            </button>
            <button class="qm-action-btn qm-action-btn--outline-strong">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
              导入问题
            </button>
            <button class="qm-action-btn qm-action-btn--disabled">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              增加新问题
            </button>
          </div>
        </div>
        <!-- 分组 Tabs -->
        <div class="qm-tabs-row">
          <button class="qm-tab qm-tab--active">全部</button>
          <button class="qm-tab">
            未分组 <b class="qm-tab-count">{{ rankCount }}</b>
          </button>
          <button class="qm-tab qm-tab--new">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            新建分组
          </button>
        </div>
        <!-- 表头 -->
        <div class="qm-table-header">
          <div class="qm-th qm-th--type">监控类型</div>
          <div class="qm-th qm-th--question">问题</div>
          <div class="qm-th qm-th--group">分组</div>
          <div class="qm-th qm-th--date">添加时间</div>
          <div class="qm-th qm-th--status">状态</div>
          <div class="qm-th qm-th--action">操作</div>
        </div>
        <!-- 行列表 -->
        <div class="qm-rows">
          <div v-for="q in rankQueries" :key="q.id" class="qm-row">
            <span class="qm-row-bar"></span>
            <div class="qm-td qm-td--type">
              <span class="qm-type-badge">{{ q.typeLabel }}</span>
            </div>
            <div class="qm-td qm-td--question">
              <span class="qm-question-text">{{ q.content }}</span>
            </div>
            <div class="qm-td qm-td--group">
              <select class="qm-group-select">
                <option value="">{{ q.group }}</option>
              </select>
            </div>
            <div class="qm-td qm-td--date">
              <span class="qm-date-text">{{ q.date }}</span>
            </div>
            <div class="qm-td qm-td--status">
              <span class="qm-status-badge">
                <span class="qm-status-dot"></span>
                {{ q.statusLabel }}
              </span>
            </div>
            <div class="qm-td qm-td--action">
              <button class="qm-icon-btn qm-icon-btn--edit" title="编辑问题">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
              </button>
              <button class="qm-icon-btn qm-icon-btn--delete" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 监控识别管理 -->

    <div v-else-if="currentTab === 'RankingRecognitionMgmt'" class="rm-page">
      <!-- 头部 -->
      <header class="rm-header">
        <h1 class="rm-h1">监控识别管理</h1>
        <p class="rm-subtitle">告诉 AI 哪些说法算「你」、哪些算「对手」，榜单与统计口径由此决定</p>
      </header>
      <!-- Tabs -->
      <div class="rm-tabs">
        <button class="rm-tab rm-tab--active" type="button">识别词</button>
        <button class="rm-tab rm-tab--inactive" type="button">竞品名</button>
      </div>
      <!-- 说明 -->
      <p class="rm-desc">AI 回答中出现以下任一说法，都算作提到你 —— 可以是品牌名称、产品名称、系列名或门店名</p>

      <!-- 表单区 -->
      <div class="rm-form-area">
        <!-- 卡片1：品牌名 + 别名 -->
        <section class="rm-section rm-section--with-gap">
          <!-- 品牌名 -->
          <div class="rm-field-block">
            <div class="rm-field-head">
              <span class="rm-field-label rm-field-label--bold">品牌名</span>
              <span class="rm-required-badge">必填</span>
              <span class="rm-meta-text">剩余修改次数 <strong class="rm-meta-strong">{{ recognitionData.remainingEdits }}</strong> 次</span>
              <button class="rm-edit-btn" type="button">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                修改
              </button>
            </div>
            <input class="rm-brand-input" type="text" readonly :value="recognitionData.brandName" />
          </div>
          <!-- 相似名称 / 别名 -->
          <div class="rm-field-block">
            <div class="rm-field-head">
              <span class="rm-field-label rm-field-label--bold">相似名称 / 别名</span>
              <span class="rm-meta-text">已登记 <strong class="rm-meta-strong">{{ recognitionData.aliases.length }}</strong> 个别名 · 监控统计时合并为「{{ recognitionData.brandName }}」</span>
              <button class="rm-edit-btn" type="button">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                修改
              </button>
            </div>
            <div class="rm-alias-box">
              <span v-for="alias in recognitionData.aliases" :key="alias" class="rm-alias-chip">
                <span>{{ alias }}</span>
              </span>
            </div>
          </div>
        </section>

        <!-- 卡片2：行业 + 官网 + 简介 -->
        <section class="rm-section">
          <div class="rm-grid-2">
            <!-- 所属行业 -->
            <div class="rm-form-field rm-form-field--col">
              <label class="rm-form-label">所属行业</label>
              <input class="rm-form-input" type="text" placeholder="例如:家电 · 空调" :value="recognitionData.industry" />
            </div>
            <!-- 官网 / 主链接 -->
            <div class="rm-form-field rm-form-field--col">
              <label class="rm-form-label">官网 / 主链接</label>
              <div class="rm-url-group">
                <select class="rm-url-select">
                  <option value="https://">https://</option>
                  <option value="http://">http://</option>
                </select>
                <input class="rm-url-input" type="text" placeholder="example.com/path" :value="recognitionData.websiteUrl" />
              </div>
            </div>
            <!-- 品牌简介 -->
            <div class="rm-form-field rm-form-field--full">
              <label class="rm-form-label">品牌简介</label>
              <textarea class="rm-textarea" rows="4" placeholder="一段话描述品牌的背景与定位...">{{ recognitionData.brandIntro }}</textarea>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 搜索快照下载 -->

    <a-modal v-model:visible="showAddQuestion" title="新增监控问题" @ok="showAddQuestion = false">
      <a-form :model="newQuestionForm" layout="vertical">
        <a-form-item field="content" label="问题内容">
          <a-input v-model="newQuestionForm.content" placeholder="输入要监控的问题" />
        </a-form-item>
        <a-form-item field="engine" label="选择引擎">
          <a-select v-model="newQuestionForm.engine" placeholder="选择引擎">
            <a-option v-for="e in engines" :key="e.key" :value="e.key">{{ e.label }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { monitorApi } from '@/api/modules/monitor';
import { userApi } from '@/api/modules/user';
import { brandApi } from '@/api/modules/brand';
import PreCollectionEmpty from '@/components/PreCollectionEmpty.vue';

const route = useRoute();
const currentTab = computed(() => route.name as string);

/* ---- 采集前真实数据：监控问题（排名词）+ 识别管理 ---- */
const TYPE_LABEL: Record<string, string> = { industry: '排名词', brand: '口碑词' };
const fmtDate = (d: string) => (d || '').slice(0, 10).replace(/-/g, '/');
const rankQueries = ref<{ id: number; typeLabel: string; content: string; group: string; date: string; statusLabel: string }[]>([]);
const totalUsed = ref(0);
const totalLimit = ref(0);
const recognitionData = reactive({
  remainingEdits: 0,
  brandName: '',
  aliases: [] as string[],
  industry: '',
  websiteProtocol: 'https://',
  websiteUrl: '',
  brandIntro: '',
});
const rankCount = computed(() => rankQueries.value.length);

/* 平台列表（真实配置 config.platforms 五大国产大模型） */
const engines = [
  { key: 'doubao', label: '豆包' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'wenxin', label: '文心一言' },
  { key: 'qwen', label: '通义千问' },
  { key: 'yuanbao', label: '元宝' },
];

/* 新增监控问题（采集前占位交互） */
const showAddQuestion = ref(false);
const newQuestionForm = reactive({ content: '', engine: '' });

onMounted(async () => {
  try {
    const [indResp, sub, summary] = await Promise.all([
      monitorApi.queryList('industry').catch(() => null),
      userApi.subscription().catch(() => null),
      brandApi.summary().catch(() => null),
    ]);
    rankQueries.value = (indResp?.list || []).map(q => ({
      id: q.id,
      typeLabel: TYPE_LABEL[q.query_type] || q.query_type,
      content: q.query,
      group: q.group_id ? String(q.group_id) : '未分组',
      date: fmtDate(q.created_at),
      statusLabel: q.query_status ? '监控中' : '已停用',
    }));
    if (sub) { totalUsed.value = sub.query_count ?? 0; totalLimit.value = sub.query_limit ?? 0; }
    if (summary) {
      recognitionData.brandName = summary.brand?.name || '';
      recognitionData.remainingEdits = summary.brand?.rename_remaining ?? 0;
      recognitionData.aliases = (summary.aliases || []).map(a => a.alias);
      recognitionData.industry = summary.brand?.industry || '';
      recognitionData.websiteUrl = summary.brand?.website || '';
      recognitionData.brandIntro = summary.profile?.description || summary.brand?.business_desc || '';
    }
  } catch { /* 保持空态 */ }
});
</script>

<style lang="scss" scoped>
.ranking-page {
  padding: 16px 24px;
  background: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #111827;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .toolbar-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 600;
    background: #eef2ff;
    color: #4338ca;
  }
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px;
    letter-spacing: -0.025em;
  }

  .page-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
}

.tab-content {
  margin-bottom: 20px;
}

.content-card {
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  background: #fff;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin-bottom: 12px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.competitor-card {
  text-align: center;

  .comp-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #111827;
  }

  .comp-metrics {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .metric {
      display: flex;
      justify-content: space-between;

      .metric-label {
        color: #6b7280;
      }
      .metric-value {
        font-weight: 600;
        color: #4338ca;
      }
    }
  }
}

.rank-empty {
  color: #d1d5db;
}
.rank-top3 {
  color: #dc2626;
  font-weight: 600;
}
.rank-normal {
  color: #111827;
}

:deep(.arco-btn-primary) {
  background-color: #4338ca;
  border-color: #4338ca;

  &:hover {
    background-color: #6366f1;
    border-color: #6366f1;
  }
}

/* ===== AI排名透视 (Ranking tab) ===== */
.rank-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 80px;
  animation: rk-fadeIn 0.4s ease-out;
}

@keyframes rk-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Header */
.rk-header {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

@media (min-width: 768px) {
  .rk-header {
    flex-direction: row;
    align-items: flex-end;
  }
}

.rk-header-left {
  min-width: 0;
}

.rk-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.2;
}

.rk-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.rk-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 通用按钮 */
.rk-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 4px;
  line-height: 1.2;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &--indigo {
    color: #4f46e5;
    border-color: #c7d2fe;

    &:hover { background: #eef2ff; }
  }

  &--gray {
    color: #374151;
    border-color: #e5e7eb;

    &:hover { background: #f9fafb; }
  }
}

/* 卡片 */
.rk-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 卡片头部 */
.rk-card-head {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f3f4f6;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.rk-card-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rk-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--indigo {
    background: #e0e7ff;
    color: #4f46e5;
  }

  &--solid {
    background: #4f46e5;
    color: #fff;
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3),
      0 4px 6px -4px rgba(79, 70, 229, 0.2);
  }
}

.rk-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.rk-card-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rk-mini-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  background: #fff;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.2;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &--indigo {
    color: #4f46e5;
    border-color: #c7d2fe;

    &:hover { background: #eef2ff; }
  }
}

.rk-period {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rk-period-label {
  font-size: 12px;
  color: #9ca3af;
  user-select: none;
}

.rk-date-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  min-width: 200px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  line-height: 1.2;
}

/* 筛选行 */
.rk-filter-row {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid #f9fafb;
}

.rk-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rk-filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
}

.rk-filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  line-height: 1.2;

  &--130 { min-width: 130px; }
  &--180 { min-width: 180px; }
  &--clamp { min-width: clamp(180px, 24vw, 320px); }
}

/* 排名指标网格 */
.rk-metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 20px;
}

@media (min-width: 768px) {
  .rk-metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.rk-metric-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.rk-metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.rk-metric-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rk-metric-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.rk-info-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
  cursor: help;
}

.rk-metric-value-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1;
}

.rk-metric-value {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.rk-metric-pct {
  font-size: 18px;
}

.rk-metric-sub {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 4px;
}

.rk-mini-chart {
  height: 120px;
}

.rk-mini-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.rk-metric-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  span {
    font-size: 12px;
    color: #9ca3af;
  }
}

/* 品牌排名网格 */
.rk-rank-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 20px;
}

@media (min-width: 1024px) {
  .rk-rank-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .rk-rank-col--list { grid-column: span 4 / span 4; }
  .rk-rank-col--trend { grid-column: span 8 / span 8; }
}

.rk-rank-col {
  display: flex;
  flex-direction: column;
}

.rk-rank-panel {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 480px;
}

.rk-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rk-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.rk-panel-sub {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.rk-fix-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  line-height: 1.2;
  transition: color 0.15s ease;

  &:hover { color: #4f46e5; }
}

/* 排名榜单 */
.rk-rank-list {
  flex: 1;
  overflow-y: auto;
  margin: 0 -4px;
  padding: 0 4px;
}

.rk-rank-list-inner {
  display: flex;
  flex-direction: column;
}

.rk-rank-item {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid #f3f4f6;
  grid-template-columns: 32px 1fr auto;
  transition: background 0.15s ease;

  &:last-child { border-bottom: 0; }
  &:hover { background: rgba(249, 250, 251, 0.6); }
}

.rk-rank-num-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  line-height: 1;

  &.rk-badge--1 {
    background: linear-gradient(to bottom right, #facc15, #fb923c);
    color: #fff;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  &.rk-badge--2 {
    background: linear-gradient(to bottom right, #d1d5db, #9ca3af);
    color: #fff;
  }
  &.rk-badge--3 {
    background: linear-gradient(to bottom right, #d97706, #b45309);
    color: #fff;
  }
  &.rk-badge--normal {
    background: #f3f4f6;
    color: #6b7280;
  }
}

.rk-rank-badge {
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.rk-badge--new {
  color: #1d4ed8;
  background: #eff6ff;
}
.rk-badge--up {
  color: #059669;
  background: #ecfdf5;
}
.rk-badge--down {
  color: #ef4444;
  background: #fef2f2;
}

.rk-rank-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.rk-rank-brand-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--brand {
    color: #7c3aed;
    font-weight: 800;
  }
}

.rk-rank-engines {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
}

.rk-engine-tag {
  font-size: 10.5px;
  font-weight: 700;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  line-height: 1.2;
}

/* 排名趋势图 */
.rk-trend-chart {
  flex: 1;
  min-height: 0;
  display: flex;
}

.rk-trend-svg {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: block;
}

.rk-grid-line {
  stroke: #f1f5f9;
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.rk-trend-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.rk-trend-xlabel {
  font-size: 12px;
  fill: #9ca3af;
}

/* 全景排名矩阵卡片 */
.rk-matrix-card {
  display: flex;
  flex-direction: column;
  animation: rk-fadeInUp 0.4s ease-out;
}

@keyframes rk-fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.rk-matrix-head {
  padding: 24px 32px;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(to right, #fff, rgba(238, 242, 255, 0.2));
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.rk-matrix-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rk-matrix-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.3;
}

.rk-matrix-sub {
  font-size: 10px;
  color: #9ca3af;
  margin: 2px 0 0;
  line-height: 1.4;
}

.rk-matrix-head-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.rk-matrix-date {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rk-matrix-date-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rk-date-input {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-family: inherit;
}

.rk-cols-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  color: #4b5563;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  line-height: 1.2;
  transition: background 0.15s ease;

  &:hover { background: #f9fafb; }
}

.rk-matrix-body {
  padding: 0 20px 20px;
  padding-top: 12px;
}

.rk-matrix-table-wrap {
  max-height: 90vh;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  scrollbar-gutter: stable;
}

.rk-matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12.5px;
}

.rk-mth {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fafafe;
  font-size: 11.5px;
  font-weight: 600;
  color: #6e6e7a;
  border-bottom: 1px solid #e1e1ec;
  box-shadow: #ececf3 0 2px 0, rgba(50, 50, 80, 0.06) 0 6px 12px;
  padding: 10px 14px;
  text-align: center;
  white-space: nowrap;
}

.rk-mth--question {
  text-align: left;
}

.rk-mth--center {
  text-align: center;
}

.rk-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6e6e7a;
  font-size: 11.5px;
  font-weight: 600;
  padding: 0;
  line-height: 1.2;
}

.rk-mtr {
  transition: background 0.15s ease;

  &:hover { background: #f9fafb; }
}

.rk-mtd {
  padding: 10px 14px;
  vertical-align: middle;
  border-bottom: 1px solid #f2f2f8;
  text-align: center;
}

.rk-mtd--question {
  text-align: left;
  max-width: 240px;
  white-space: normal;
  line-height: 1.4;
}

.rk-question-text {
  font-size: 12.5px;
  color: #374151;
  display: block;
}

.rk-mtd--center {
  text-align: center;
}

.rk-mtd--pct {
  text-align: center;
}

.rk-mtd--engine {
  text-align: center;
  border-left: 2px solid #ececef;
}

.rk-combined-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
  color: #6e6e7a;
  line-height: 1.2;
}

.rk-pct-cell {
  font-size: 12.5px;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
  font-weight: 600;
  color: #3a3a45;
}

.rk-engine-cell {
  display: inline-block;
  min-width: 36px;
  padding: 3px 7px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.2;

  &:hover {
    box-shadow: 0 0 0 2px #a5b4fc;
  }

  &.rk-cell--empty {
    background: #fef2f2;
    color: #c01825;
  }
  &.rk-cell--top3 {
    background: #fff5e3;
    color: #b67900;
  }
  &.rk-cell--normal {
    background: #fafafe;
    color: #6e6e7a;
  }
}

/* ===== AI竞品透视 (RankingCompetitor) ===== */
.cp-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 80px;
  animation: cp-fadeIn 0.4s ease-out;
}

@keyframes cp-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Header */
.cp-header {
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .cp-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.cp-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.2;
}

.cp-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.cp-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cp-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.2;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &--indigo {
    color: #4f46e5;
    border-color: #c7d2fe;
    &:hover { background: #eef2ff; }
  }
  &--gray {
    color: #374151;
    border-color: #e5e7eb;
    &:hover { background: #f9fafb; }
  }
}

/* 指标卡片 */
.cp-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 1024px) {
  .cp-metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.cp-metric-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  padding: 20px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.cp-metric-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 14px;
  margin-bottom: 8px;
}

.cp-metric-label-text {
  font-weight: 500;
}

.cp-metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.cp-metric-value {
  color: #111827;
  letter-spacing: -0.02em;

  &--xl {
    font-size: 24px;
    font-weight: 800;
    line-height: 1.2;
  }
  &--lg {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.3;
  }
}

.cp-metric-truncate {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cp-metric-sub {
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

/* 卡片容器 */
.cp-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.cp-card-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.2;

  :deep(svg) {
    color: #6366f1;
  }
}

/* 表格通用 */
.cp-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.cp-table-wrap--scroll {
  max-height: 70vh;
  overflow: auto;
}

.cp-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12.5px;
}

.cp-table--platform {
  min-width: 1520px;
}

.cp-th {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(249, 250, 251, 0.95);
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 16px;
  text-align: left;
  white-space: nowrap;
  line-height: 1.5rem;
}

.cp-th--num,
.cp-th--num2,
.cp-th--pct {
  text-align: center;
  padding: 12px 8px;
}

.cp-th--brand {
  text-align: left;
}

.cp-th--bar {
  text-align: left;
}

/* ===== 分平台表格样式 ===== */
.cp-thead--platform {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 20;
}

.cp-th--group {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  background: transparent;
  box-shadow: none;
  position: static;
  top: auto;
  z-index: auto;
}

.cp-th--group--combined {
  background: rgba(248, 250, 252, 0.8);
}

.cp-th--group--app {
  color: #4b5563;
  cursor: pointer;
}

.cp-group-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f9fafb;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.cp-group-badge--combined {
  background: #f1f5f9;
  color: #475569;
}

.cp-group-badge--app {
  background: #f9fafb;
  color: #4b5563;
}

.cp-lock-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.cp-th--platform-brand {
  position: sticky;
  left: 0;
  z-index: 10;
  background: #fff;
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  border-right: 1px solid #f3f4f6;
  vertical-align: bottom;
  border-bottom: 0;
  box-shadow: none;
  top: auto;
}

.cp-th--sub {
  text-align: center;
  padding: 8px;
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  background: transparent;
  border-bottom: 0;
  border-top: 0;
  box-shadow: none;
  position: static;
  top: auto;
  z-index: auto;
}

.cp-th--sub--combined {
  background: rgba(248, 250, 252, 0.6);
}

.cp-th--sub--last {
  border-right: 1px solid #f3f4f6;
}

.cp-tr {
  transition: background 0.15s ease;
  border-bottom: 1px solid #f9fafb;

  &:last-child { border-bottom: 0; }
  &:hover { background: rgba(248, 250, 252, 0.6); }

  &.cp-tr--brand {
    background: rgba(239, 246, 255, 0.4);
    &:hover { background: rgba(239, 246, 255, 0.6); }
  }
}

.cp-td {
  padding: 12px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f9fafb;
  text-align: left;
  line-height: 1.5rem;
}

.cp-td--num {
  text-align: center;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.cp-rank-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', monospace;
  line-height: 1;
}

/* 分平台标签 */
.cp-platform-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.cp-platform-tag {
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }

  &.cp-platform-tag--mention {
    color: #4f46e5;
    &::before { background: #4f46e5; }
  }
  &.cp-platform-tag--top3 {
    color: #8b5cf6;
    &::before { background: #8b5cf6; }
  }
  &.cp-platform-tag--first {
    color: #f97316;
    &::before { background: #f97316; }
  }
}

.cp-td--num2 {
  text-align: center;
  padding: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.cp-td--pct {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
}

.cp-pct--mention { color: #4f46e5; }
.cp-pct--top3 { color: #8b5cf6; }
.cp-pct--first { color: #9ca3af; }

/* 分平台数据行 */
.cp-tr--platform {
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s ease;
  &:hover { background: rgba(249, 250, 251, 0.5); }
  &:last-child { border-bottom: 0; }
}

.cp-td--platform-brand {
  position: sticky;
  left: 0;
  z-index: 1;
  background: #fff;
  padding: 12px 16px;
  border-right: 1px solid #f9fafb;
  text-align: left;
  vertical-align: middle;
}

.cp-brand-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cp-td--platform-brand .cp-brand-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cp-td--platform-brand .cp-brand-name--brand {
  color: #1d4ed8;
  font-weight: 500;
}

.cp-num-circle {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', monospace;
}

.cp-brand-tag {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #dbeafe;
  color: #1d4ed8;
}

.cp-td--platform {
  text-align: center;
  padding: 12px 8px;
  vertical-align: middle;
}

.cp-td--platform--combined {
  background: rgba(248, 250, 252, 0.4);
}

.cp-td--platform--last {
  border-right: 1px solid #f3f4f6;
}

/* 数据单元格span标签 */
.cp-cell {
  display: inline-flex;
  min-width: 62px;
  justify-content: center;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.cp-cell--mention {
  background: #e0e7ff;
  color: #4338ca;
}

.cp-cell--top3 {
  min-width: 72px;
  background: #f5f3ff;
  color: #6d28d9;
}

.cp-cell--first {
  background: #fef3c7;
  color: #b45309;
}

.cp-cell--zero {
  background: #f9fafb;
  color: #d1d5db;
}

.cp-table--platform .cp-tr {
  border-bottom: 0;
}

.cp-td--brand {
  text-align: left;
  max-width: 260px;
  padding: 12px 16px;
}

.cp-brand-name {
  font-size: 14px;
  color: #000000;
  font-weight: 400;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  &.cp-brand-name--brand {
    color: #000000;
    font-weight: 400;
  }
}

/* 频次条 */
.cp-bar-track {
  width: 100%;
  min-width: 80px;
  height: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.cp-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

/* 问题明细列表 */
.cp-problem-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cp-problem-item {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.cp-problem-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;
  gap: 16px;

  &:hover {
    background: rgba(249, 250, 251, 0.5);
  }
}

.cp-problem-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
}

.cp-problem-keyword {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.cp-problem-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e0e7ff;
  color: #4338ca;
  line-height: 1.4;
  white-space: nowrap;
}

.cp-problem-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.cp-brand-rank-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;

  &.cp-brand-rank--in {
    background: #f5f3ff;
    color: #6d28d9;
  }
  &.cp-brand-rank--out {
    background: #fef2f2;
    color: #c01825;
  }
}

.cp-engine-box-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cp-engine-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 4px 12px;
  min-width: 48px;
}

.cp-engine-box-name {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 400;
  line-height: 1.2;
}

.cp-engine-box-rank {
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
  line-height: 1.2;

  &.cp-engine-rank--in {
    color: #111827;
  }
  &.cp-engine-rank--out {
    color: #d1d5db;
  }
}

.cp-problem-chevron {
  color: #9ca3af;
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &.cp-problem-chevron--open {
    transform: rotate(180deg);
  }
}

.cp-problem-detail {
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
  background: #fafafe;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cp-problem-detail-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
  flex-wrap: wrap;
}

.cp-problem-detail-label {
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.cp-problem-detail-value {
  color: #111827;
  font-weight: 500;
}

/* ===== 引用源追溯页面样式 ===== */
.cit-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.3s ease;
}

.cit-header {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.cit-header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cit-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin: 0;
}

.cit-subtitle {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 12px;
}

.cit-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
}

.cit-btn--outline {
  background: #fff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover { background: #eef2ff; }
}

.cit-btn--indigo {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover { background: #4338ca; }
}

.cit-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 600px;
  overflow: visible;
}

.cit-filter-bar {
  width: 100%;
  background: #fff;
  padding: 16px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
}

.cit-filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.cit-filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  user-select: none;
}

.cit-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
}

.cit-select--question {
  background: #f9fafb;
  border-color: #f3f4f6;
  border-radius: 12px;
  padding: 8px 16px;
  min-width: 200px;
  max-width: 300px;
  &:hover { border-color: #d1d5db; }
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.cit-select--engine {
  border-radius: 8px;
  padding: 6px 12px;
  min-width: 140px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover { border-color: #a5b4fc; }
}

.cit-select--date {
  border-radius: 8px;
  padding: 6px 12px;
  min-width: 140px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover { border-color: #a5b4fc; }
}

.cit-engine-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cit-engine-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.cit-select-arrow {
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.cit-table-wrap {
  overflow-x: auto;
  width: 100%;
}

.cit-table {
  width: 100%;
  min-width: 1000px;
  text-align: left;
  border-collapse: collapse;
}

.cit-table thead {
  background: rgba(249, 250, 251, 0.5);
  border-bottom: 1px solid #f3f4f6;
}

.cit-th {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 16px 24px;
  cursor: pointer;
  transition: color 0.15s ease;
  user-select: none;
  &:hover { color: #4b5563; }
}

.cit-th--platform {
  width: 33.33%;
  padding: 16px 32px;
  text-align: left;
  cursor: pointer;
}

.cit-th--cite,
.cit-th--authority,
.cit-th--models,
.cit-th--channel,
.cit-th--action {
  text-align: center;
  padding: 16px 24px;
}

.cit-th-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cit-th-content--center {
  justify-content: center;
}

.cit-th-arrow {
  color: #d1d5db;
  transition: transform 0.2s ease;
}

.cit-th-arrow--active {
  color: #6366f1;
}

.cit-info-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  color: #d1d5db;
  transition: all 0.15s ease;
  cursor: help;
  &:hover {
    background: #e5e7eb;
    color: #4b5563;
  }
}

.cit-table tbody {
  & tr + tr { border-top: 1px solid #f9fafb; }
}

.cit-tr {
  transition: all 0.15s ease;
  cursor: pointer;
  &:hover { background: rgba(249, 250, 251, 0.5); }
}

.cit-td {
  padding: 20px 24px;
  vertical-align: middle;
}

.cit-td--platform {
  padding: 20px 24px;
}

.cit-td--cite,
.cit-td--authority,
.cit-td--models,
.cit-td--channel,
.cit-td--action {
  text-align: center;
  padding: 20px 24px;
}

.cit-platform-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cit-expand-icon {
  color: #9ca3af;
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.cit-platform-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cit-platform-name {
  font-size: 14px;
  font-weight: 800;
  color: #1f2937;
}

.cit-article-badge {
  padding: 1px 8px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  white-space: nowrap;
}

.cit-platform-cat {
  margin-top: 2px;
  font-size: 12px;
  color: #9ca3af;
}

.cit-cite-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cit-cite-numbers {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.cit-cite-num {
  font-size: 16px;
  font-weight: 900;
  color: #111827;
}

.cit-cite-pct {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
}

.cit-cite-bar {
  width: 64px;
  height: 4px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.cit-cite-bar-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.cit-auth-badge {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 999px;
  border: 1px solid;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
}

.cit-auth-badge--blue {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.cit-auth-badge--green {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.cit-auth-none {
  font-size: 12px;
  color: #d1d5db;
}

.cit-models {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.cit-model-tag {
  font-size: 10px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
  white-space: nowrap;
}

.cit-model-count {
  margin-left: 4px;
  opacity: 0.8;
}

.cit-channel-locked {
  font-size: 11px;
  color: #d1d5db;
}

.cit-channel-points {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
}

.cit-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  border-radius: 6px;
  border: 1px solid #6366f1;
  background: #fff;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  transition: all 0.15s ease;
  cursor: pointer;
  &:hover {
    background: #6366f1;
    color: #fff;
  }
}

/* ===== 信源平台偏好页面样式 ===== */
.sp-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.sp-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.sp-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.sp-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.sp-filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.sp-filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  user-select: none;
}

.sp-date-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  min-width: 200px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
  &:hover { border-color: #a5b4fc; }
}

.sp-date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sp-date-arrow {
  color: #9ca3af;
}

.sp-platform-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
}

.sp-tab {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.15s ease;
  border: none;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
  &:hover { background: #f9fafb; }
}

.sp-tab--active {
  background: #4f46e5;
  color: #fff;
  &:hover { background: #4338ca; }
}

.sp-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.sp-search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.sp-search-input {
  padding: 8px 12px 8px 36px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  width: 192px;
  outline: none;
  transition: all 0.15s ease;
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
}

.sp-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.sp-metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.15s ease;
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
}

.sp-metric-card--indigo:hover { border-color: #c7d2fe; }
.sp-metric-card--amber:hover { border-color: #fde68a; }
.sp-metric-card--emerald:hover { border-color: #a7f3d0; }

.sp-metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.sp-metric-icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
}

.sp-metric-icon--amber {
  background: #fffbeb;
  color: #d97706;
}

.sp-metric-icon--emerald {
  background: #ecfdf5;
  color: #059669;
}

.sp-metric-info {
  min-width: 0;
}

.sp-metric-label {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 2px;
}

.sp-metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
}

.sp-charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  max-width: 880px;
}

.sp-chart-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.sp-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.sp-chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.sp-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sp-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.sp-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.sp-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  height: 380px;
}

.sp-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sp-bar-label {
  font-size: 12px;
  color: #6b7280;
  width: 120px;
  flex-shrink: 0;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-bar-track {
  flex: 1;
  height: 20px;
  background: #f9fafb;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.sp-bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.sp-pie-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  height: 220px;
}

.sp-pie-svg {
  width: 233px;
  height: 220px;
}

.sp-pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.sp-pie-total {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
}

.sp-pie-label {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.sp-pie-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.sp-pie-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.sp-pie-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.sp-pie-legend-name {
  color: #4b5563;
  flex-shrink: 0;
}

.sp-pie-legend-bar-wrap {
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.sp-pie-legend-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.sp-pie-legend-value {
  font-weight: 600;
  color: #111827;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  width: 40px;
  text-align: right;
}

.sp-detail-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.sp-detail-header {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.sp-table-wrap {
  overflow-x: auto;
}

.sp-table {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}

.sp-table thead tr {
  background: #f9fafb;
  color: #6b7280;
}

.sp-th {
  padding: 12px 24px;
  font-weight: 500;
  font-size: 14px;
}

.sp-th--left {
  text-align: left;
}

.sp-th--center {
  text-align: center;
}

.sp-th--right {
  text-align: right;
}

.sp-th-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.sp-table tbody tr {
  border-top: 1px solid #f9fafb;
  transition: background 0.15s ease;
  &:hover { background: #f9fafb; }
}

.sp-td {
  padding: 12px 24px;
}

.sp-td--rank {
  color: #9ca3af;
  font-weight: 500;
}

.sp-td--name {
  font-weight: 500;
}

.sp-name-text {
  color: #111827;
  font-weight: 500;
}

.sp-td--authority {
  text-align: center;
}

.sp-auth-badge {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 999px;
  border: 1px solid;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
}

.sp-auth-badge--blue {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.sp-auth-badge--green {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.sp-auth-none {
  font-size: 12px;
  color: #d1d5db;
}

.sp-td--cite {
  text-align: right;
  font-weight: 600;
  color: #111827;
}

.sp-td--articles {
  text-align: right;
  color: #4b5563;
}

.sp-td--models {
  padding: 12px 24px;
}

.sp-models {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sp-model-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  color: #fff;
  white-space: nowrap;
}

.sp-model-count {
  opacity: 0.8;
}

/* ===== 引用源洞察页面样式 ===== */
.si-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.si-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.si-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
}

.si-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.si-date-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
  &:hover { border-color: #a5b4fc; }
}

.si-date-icon {
  color: #9ca3af;
}

.si-date-sep {
  color: #d1d5db;
  margin: 0 2px;
}

.si-trend-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.si-trend-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-trend-icon {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.si-trend-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.si-trend-tip {
  color: #9ca3af;
  cursor: help;
  display: flex;
  align-items: center;
}

.si-engine-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-engine-label {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  user-select: none;
}

.si-engine-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  min-width: 120px;
  max-width: 240px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
  &:hover { border-color: #a5b4fc; }
}

.si-trend-chart {
  padding: 20px 24px;
}

.si-trend-svg {
  width: 100%;
  height: 300px;
}

.si-platform-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 16px;
  padding: 12px 24px 0;
}

.si-platform-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  opacity: 1;
  transition: opacity 0.15s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover { opacity: 0.7; }
}

.si-tag-line {
  width: 12px;
  height: 3px;
  border-radius: 999px;
  flex-shrink: 0;
}

.si-tag-name {
  color: #374151;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.si-tag-count {
  color: #9ca3af;
}

.si-insight-tip {
  margin: 16px 24px;
  padding: 12px 16px;
  background: #eef2ff;
  border-radius: 12px;
}

.si-insight-text {
  font-size: 13px;
  color: #3730a3;
  line-height: 1.625;
  margin: 0;
}

.si-tip-bold {
  font-weight: 700;
}

.si-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.si-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.si-metric-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 4px;
}

.si-metric-tab {
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #f9fafb; }
}

.si-metric-tab--active {
  background: #4f46e5;
  color: #fff;
  &:hover { background: #4338ca; }
}

.si-export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: #a5b4fc; }
}

.si-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.si-search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.si-search-input {
  padding: 8px 12px 8px 36px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  width: 200px;
  outline: none;
  transition: all 0.15s ease;
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
}

.si-tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.si-data-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 4px;
}

.si-data-tab {
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #f9fafb; }
}

.si-data-tab--active {
  background: #4f46e5;
  color: #fff;
}

.si-status-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 4px;
}

.si-status-tab {
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #f9fafb; }
}

.si-status-tab--active {
  background: #4f46e5;
  color: #fff;
}

.si-table-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-table-wrap {
  overflow-x: auto;
  padding: 16px 20px;
}

.si-persp-card .si-table-wrap {
  padding: 0 20px 8px;
}

.si-table {
  width: 100%;
  border-collapse: collapse;
}

.si-table thead tr {
  border-bottom: 1px solid #f3f4f6;
}

.si-th {
  padding: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
}

.si-th--rank {
  text-align: left;
  width: 40px;
  position: sticky;
  left: 0;
  z-index: 20;
  background: #fff;
}

.si-th--name {
  text-align: left;
  position: sticky;
  left: 40px;
  z-index: 20;
  background: #fff;
}

.si-th--engine {
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;
  &:hover { color: #4b5563; }
}

.si-th--total {
  text-align: right;
}

.si-table tbody tr {
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s ease;
  &:hover { background: #f9fafb; }
  &:last-child { border-bottom: none; }
}

.si-td {
  padding: 12px 8px;
  border-bottom: 1px solid #f9fafb;
  vertical-align: middle;
}

.si-td--rank {
  position: sticky;
  left: 0;
  z-index: 10;
  background: #fff;
}

.si-table tbody tr:hover .si-td--rank {
  background: #f9fafb;
}

.si-rank-circle {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: #4f46e5;
  color: #fff;
}

.si-rank-circle--gray {
  background: #f3f4f6;
  color: #6b7280;
}

.si-td--name {
  position: sticky;
  left: 40px;
  z-index: 10;
  background: #fff;
  white-space: nowrap;
}

.si-table tbody tr:hover .si-td--name {
  background: #f9fafb;
}

.si-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-name-text {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.si-badge {
  font-size: 10px;
  font-weight: 700;
  color: #4f46e5;
  background: #e0e7ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.si-td--engine {
  text-align: center;
}

.si-engine-cell {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 40px;
  border-radius: 6px;
  color: #1f2937;
}

.si-engine-val {
  font-size: 12.5px;
  font-family: monospace;
  font-weight: 600;
}

.si-engine-delta {
  font-size: 9px;
  font-weight: 600;
}

.si-engine-delta--up {
  color: #047857;
}

.si-engine-delta--down {
  color: #b91c1c;
}

.si-td--total {
  text-align: right;
}

.si-total-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.si-total-bar-wrap {
  width: 80px;
  height: 12px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.si-total-bar {
  height: 100%;
  background: #6366f1;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.si-total-val {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  width: 32px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.si-status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.si-status-badge--new {
  background: #d1fae5;
  color: #047857;
}

.si-status-badge--lost {
  background: #fee2e2;
  color: #b91c1c;
}

.si-load-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.si-load-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #4f46e5;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    background: #eef2ff;
  }
}

/* AI 引擎信源偏好卡片 */
.si-pref-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-pref-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.si-pref-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.si-pref-icon {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.si-pref-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.si-th--status {
  text-align: center;
}

.si-th--change {
  text-align: center;
}

.si-td--status {
  text-align: center;
  padding: 12px 8px;
}

.si-status-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.si-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.si-status-dot--continued {
  background: #3b82f6;
}

.si-status-dot--new {
  background: #10b981;
}

.si-status-text {
  font-size: 11px;
  font-weight: 500;
}

.si-status-text--continued {
  color: #2563eb;
}

.si-status-text--new {
  color: #059669;
}

.si-td--engine-text {
  text-align: center;
  padding: 12px 8px;
  font-size: 12.5px;
  font-family: monospace;
  color: #374151;
}

.si-td--total-text {
  text-align: center;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.si-td--change {
  text-align: center;
  padding: 12px 8px;
}

.si-change-val {
  font-size: 11.5px;
  font-weight: 600;
}

.si-change--up {
  color: #059669;
}

.si-change--down {
  color: #ef4444;
}

.si-load-more-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 16px;
}

.si-load-count {
  font-size: 12px;
  color: #9ca3af;
}

/* Panel 3: 自有内容收录趋势 */
.si-trend3-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-trend3-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.si-trend3-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.si-trend3-icon {
  width: 32px;
  height: 32px;
  background: #d1fae5;
  color: #047857;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.si-trend3-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.si-trend3-filters {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.si-dim-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 2px;
}

.si-dim-tab {
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { color: #374151; }
}

.si-dim-tab--active {
  background: #fff;
  color: #047857;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.si-trend3-chart {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 240px;
}

.si-trend3-svg {
  width: 100%;
  height: 240px;
}

/* Panel 3: 左右布局 */
.si-trend3-body {
  display: grid;
  grid-template-columns: 0.8fr 2.4fr;
  gap: 24px;
  align-items: center;
  padding: 0 24px 20px;
}

.si-trend3-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.si-stat-item {}

.si-stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.si-stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.si-stat-unit {
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
}

.si-stat-delta {
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.si-stat-delta--up {
  color: #059669;
}

.si-trend3-chart-wrap {
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  background: rgba(249, 250, 251, 0.5);
  padding: 16px;
}

.si-trend3-chart-wrap .si-trend3-svg {
  width: 100%;
  height: 180px;
}

.si-trend3-latest {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
}

.si-trend3-latest-val {
  font-weight: 700;
  color: #047857;
}

/* Panel 4: 引用源透视 */
.si-persp-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-persp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.si-persp-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.si-persp-icon {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.si-persp-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.si-persp-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #4f46e5;
  background: #eef2ff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #e0e7ff; }
}

.si-persp-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px 8px;
}

.si-persp-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 24px 8px;
}

/* ============ 监控问题管理 ============ */
.qm-page {
  margin: -16px -24px;
  padding: 28px 36px 96px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #111827;
}

.qm-header-section {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 24px;
}

.qm-title-block {
  display: flex;
  flex-direction: column;
}

.qm-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.2;
}

.qm-desc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.qm-desc-text {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.5;
}

.qm-quota-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.qm-quota-item {
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid #f3f4f6;
}

.qm-quota-item--total {
  background: linear-gradient(to bottom, #fff, #f9fafb);
  border-radius: 12px 0 0 12px;
}

.qm-quota-item--page {
  background: #fff;
}

.qm-quota-item--pending {
  background: #fff;
}

.qm-quota-item:last-of-type {
  border-right: 1px solid #e0e7ff;
}

.qm-quota-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.qm-quota-label {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

.qm-quota-tip-icon {
  display: inline-flex;
  align-items: center;
  color: #9ca3af;
  cursor: help;
}

.qm-quota-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.qm-quota-dot--amber {
  background: #fbbf24;
}

.qm-quota-value {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
}

.qm-quota-value--red {
  color: #dc2626;
}

.qm-quota-value--indigo {
  color: #4f46e5;
}

.qm-quota-value--amber {
  color: #d97706;
}

.qm-quota-suffix {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
}

.qm-quota-upgrade {
  padding: 0 16px;
  background: #eef2ff;
  color: #4338ca;
  border: none;
  border-left: 1px solid #e0e7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #e0e7ff;
  }
}

.qm-upgrade-icon {
  color: #6366f1;
}

.qm-upgrade-text {
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.qm-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 400px;
}

.qm-card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: rgba(249, 250, 251, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.qm-card-title {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.qm-card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qm-search-wrap {
  position: relative;
  display: inline-block;
}

.qm-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.qm-search-input {
  padding: 8px 32px 8px 36px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  width: 192px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
    font-weight: 700;
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}

.qm-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  border: 1px solid;
  background: #fff;
}

.qm-action-btn--outline {
  color: #4f46e5;
  border-color: #c7d2fe;

  &:hover {
    background: #eef2ff;
  }
}

.qm-action-btn--outline-strong {
  color: #4f46e5;
  border-color: #a5b4fc;

  &:hover {
    background: #eef2ff;
  }
}

.qm-action-btn--disabled {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: pointer;
}

.qm-tabs-row {
  padding: 12px 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: #fff;
}

.qm-tab {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;
  background: #fff;
  color: #6b7280;
  border-color: #e5e7eb;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    border-color: #a5b4fc;
  }
}

.qm-tab--active {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;

  &:hover {
    border-color: #4f46e5;
  }
}

.qm-tab--new {
  border-style: dashed;
  border-color: #d1d5db;
  color: #6b7280;
  background: #f9fafb;

  &:hover {
    border-color: #818cf8;
    color: #4f46e5;
  }
}

.qm-tab-count {
  color: #9ca3af;
  font-weight: 400;
}

.qm-table-header {
  display: grid;
  grid-template-columns: 2fr 6fr 1.6fr 88px 80px 68px;
  gap: 16px;
  padding: 12px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
  align-items: center;
}

.qm-th {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qm-th--group {
  justify-content: center;
}

.qm-th--date {
  width: 88px;
  justify-content: center;
}

.qm-th--status {
  width: 80px;
  justify-content: center;
}

.qm-th--action {
  width: 68px;
  justify-content: center;
}

.qm-rows {
  background: #fff;
}

.qm-row {
  display: grid;
  grid-template-columns: 2fr 6fr 1.6fr 88px 80px 68px;
  gap: 16px;
  padding: 16px 24px;
  align-items: start;
  position: relative;
  border-top: 1px solid #f3f4f6;
  transition: background 0.15s;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: rgba(249, 250, 251, 0.8);

    .qm-row-bar {
      background: #a5b4fc;
    }
  }
}

.qm-row-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: background 0.15s;
}

.qm-td {
  min-width: 0;
}

.qm-type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #4338ca;
  display: inline-block;
  line-height: 1.4;
}

.qm-question-text {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  padding: 6px 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  line-height: 1.5;
}

.qm-td--group {
  min-width: 0;
  padding-top: 4px;
}

.qm-group-select {
  display: block;
  width: 100%;
  min-width: 0;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  outline: none;

  &:hover {
    border-color: #a5b4fc;
  }
}

.qm-td--date {
  width: 88px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.qm-date-text {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
}

.qm-td--status {
  width: 80px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.qm-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
  line-height: 1.4;
}

.qm-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  margin-right: 4px;
  display: inline-block;
}

.qm-td--action {
  width: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-top: 4px;
}

.qm-icon-btn {
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  background: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
}

.qm-icon-btn--edit {
  color: #9ca3af;

  &:hover {
    color: #4f46e5;
    background: #eef2ff;
  }
}

.qm-icon-btn--delete {
  color: #d1d5db;

  &:hover {
    color: #ef4444;
    background: #fef2f2;
  }
}

/* ============ 监控识别管理 ============ */
.rm-page {
  margin: -16px -24px;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
  animation: rm-fade-in 0.3s ease;
}

@keyframes rm-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.rm-header {
  margin-bottom: 20px;
}

.rm-h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #0f1115;
  line-height: 1.5;
}

.rm-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  line-height: 20px;
}

.rm-tabs {
  display: inline-flex;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 3px;
  margin-bottom: 20px;
}

@media (min-width: 640px) {
  .rm-tabs {
    width: auto;
  }
}

.rm-tab {
  height: 32px;
  flex: 1;
  border-radius: 6px;
  padding: 0 20px;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .rm-tab {
    flex: none;
  }
}

.rm-tab--active {
  background: #0f1115;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.rm-tab--inactive {
  background: transparent;
  color: #6b7280;
  font-weight: 500;

  &:hover {
    background: #f9fafb;
    color: #1f2937;
  }
}

.rm-desc {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  line-height: 20px;
}

.rm-form-area {
  display: flex;
  flex-direction: column;
}

.rm-section {
  border-radius: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e6e8ee;
  transition: all 0.2s;
}

.rm-section--with-gap {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.rm-field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rm-field-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12.5px;
}

.rm-field-label {
  font-size: 13px;
  color: #0f1115;
}

.rm-field-label--bold {
  font-weight: 700;
}

.rm-required-badge {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
  line-height: 15px;
  display: inline-flex;
  align-items: center;
}

.rm-meta-text {
  font-size: 11.5px;
  color: #8a8f9b;
  line-height: 1.5;
}

.rm-meta-strong {
  font-weight: 700;
  color: #2a2d36;
}

.rm-edit-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: #5b606a;
  background: transparent;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover {
    color: #0f1115;
    border-color: #c5c8d2;
    background: #f9fafb;
  }
}

.rm-brand-input {
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0f1115;
  background: #f5f6fa;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}

.rm-alias-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #f5f6fa;
  min-height: 40px;
  transition: border-color 0.15s;
}

.rm-alias-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #efecff;
  color: #4a38e0;
  height: 24px;
  line-height: 1;
}

.rm-grid-2 {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .rm-grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}

.rm-form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.rm-form-field--full {
  grid-column: 1 / -1;
}

.rm-form-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #2a2d36;
  letter-spacing: 0.025em;
}

.rm-form-input {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  background: #fff;
  border: 1px solid #e6e8ee;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.rm-url-group {
  display: flex;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e6e8ee;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.rm-url-select {
  padding: 0 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: #2a2d36;
  background: #f5f6fa;
  border: none;
  border-right: 1px solid #e6e8ee;
  cursor: pointer;
  outline: none;
}

.rm-url-input {
  flex: 1;
  min-width: 0;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }
}

.rm-textarea {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  background: #fff;
  border: 1px solid #e6e8ee;
  outline: none;
  line-height: 1.625;
  resize: none;
  min-height: 80px;
  width: 100%;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* ============ 搜索快照下载 ============ */
.sn-page {
  margin: -16px -24px;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 32px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #111827;
}

.sn-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 24px;
  gap: 16px;
}

.sn-title-block {
  display: flex;
  flex-direction: column;
}

.sn-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.2;
}

.sn-desc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.sn-desc-text {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.5;
}

.sn-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sn-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  border: 1px solid;
  background: #fff;
  flex-shrink: 0;
}

.sn-btn--gray {
  color: #374151;
  border-color: #e5e7eb;

  &:hover {
    background: #f9fafb;
  }
}

.sn-btn--indigo {
  color: #4f46e5;
  border-color: #c7d2fe;

  &:hover {
    background: #eef2ff;
  }
}

.sn-card {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.sn-filter-bar {
  width: 100%;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.sn-filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sn-filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  user-select: none;
}

.sn-select-wrap {
  position: relative;
  width: 240px;
}

.sn-select-wrap--narrow {
  width: 190px;
}

.sn-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: #d1d5db;
  }
}

.sn-select-text {
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sn-select-arrow {
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: 8px;
}

.sn-filter-count {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.sn-date-input {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: #a5b4fc;
  }

  &:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 1px #c7d2fe;
  }
}

.sn-table-wrap {
  flex: 1;
  overflow: auto;
  position: relative;
  min-height: 300px;
}

.sn-table {
  width: 100%;
  table-layout: fixed;
  text-align: left;
  border-collapse: collapse;

  thead {
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
  }
}

.sn-th {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
}

.sn-th--name {
  width: 42%;
}

.sn-th--rank {
  width: 110px;
}

.sn-th--size {
  width: 110px;
}

.sn-th--ai {
  width: 140px;
}

.sn-th--action {
  width: 180px;
  text-align: right;
}

.sn-tr {
  border-top: 1px solid #f9fafb;
  transition: background 0.15s;

  &:hover {
    background: rgba(249, 250, 251, 0.5);
  }
}

.sn-td {
  padding: 16px 24px;
  vertical-align: middle;
}

.sn-td--name {
  min-width: 0;
}

.sn-file-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.sn-file-icon {
  flex-shrink: 0;
  padding: 8px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sn-file-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.sn-file-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.sn-file-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 8px;
  row-gap: 4px;
}

.sn-engine-text {
  font-size: 14px;
  font-weight: 800;
  color: #374151;
}

.sn-platform-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 800;
}

.sn-date-text {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.sn-rank-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #e0e7ff;
}

.sn-td--size {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
}

.sn-ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 700;
  color: #7c3aed;
  background: #f5f3ff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #ede9fe;
  }
}

.sn-td--action {
  text-align: right;
}

.sn-action-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.sn-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: color 0.15s, background 0.15s;
}

.sn-action-btn--preview {
  color: #4b5563;

  &:hover {
    color: #4f46e5;
    background: #f3f4f6;
  }
}

.sn-action-btn--download {
  color: #4f46e5;

  &:hover {
    color: #4338ca;
    background: #eef2ff;
  }
}
</style>
