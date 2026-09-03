<template>
  <div class="qm-page">
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
          <span class="qm-quota-value qm-quota-value--red">8 <span class="qm-quota-suffix">/ 8</span></span>
        </div>
        <!-- 本页 · 口碑词 -->
        <div class="qm-quota-item qm-quota-item--page">
          <div class="qm-quota-label-row">
            <span class="qm-quota-label">本页 · 口碑词</span>
            <span class="qm-quota-tip-icon" title="总占用 · 全部分类：排名词 + 口碑词 全部已占用额度，是计费依据。&#10;本页 · 口碑词：仅当前分类下的问题条数，所以会小于总占用，属正常现象。">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </span>
          </div>
          <span class="qm-quota-value qm-quota-value--indigo">7 <span class="qm-quota-suffix">个</span></span>
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
          <span>问题列表 ({{ monitorQuestions.length }})</span>
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
          未分组 <b class="qm-tab-count">7</b>
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
        <div v-for="q in monitorQuestions" :key="q.id" class="qm-row">
          <span class="qm-row-bar"></span>
          <div class="qm-td qm-td--type">
            <span class="qm-type-badge">{{ q.type }}</span>
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
              {{ q.status }}
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
</template>

<script setup lang="ts">
import { monitorQuestions } from '@/mock/data';
</script>

<style lang="scss" scoped>
/* ============ 口碑监控问题管理 ============ */
.qm-page {
  margin-top: -16px;
  margin-bottom: -16px;
  margin-left: auto;
  margin-right: auto;
  padding: 28px 36px 96px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  max-width: 1240px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

.qm-header-section {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 24px;
}

.qm-title-block {
  display: flex;
  flex-direction: column;
}

.qm-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.6px;
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
  color: #64748b;
  line-height: 20px;
}

.qm-quota-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
}

.qm-quota-item {
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid #f1f5f9;
}

.qm-quota-item--total {
  background: linear-gradient(to bottom, #fff, #f8fafc);
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
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  line-height: 1;
}

.qm-quota-tip-icon {
  display: inline-flex;
  align-items: center;
  color: #94a3b8;
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
  color: #94a3b8;
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
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 400px;
}

.qm-card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: rgba(248, 250, 252, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.qm-card-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
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
  color: #94a3b8;
  pointer-events: none;
}

.qm-search-input {
  padding: 8px 32px 8px 36px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  width: 192px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #94a3b8;
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  border: 1px solid;
  background: #fff;
  font-family: inherit;
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
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
  cursor: pointer;
}

.qm-tabs-row {
  padding: 12px 24px;
  border-bottom: 1px solid #f1f5f9;
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
  color: #64748b;
  border-color: #e2e8f0;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: inherit;

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
  border-color: #cbd5e1;
  color: #64748b;
  background: #f8fafc;

  &:hover {
    border-color: #818cf8;
    color: #4f46e5;
  }
}

.qm-tab-count {
  color: #94a3b8;
  font-weight: 400;
}

.qm-table-header {
  display: grid;
  grid-template-columns: 2fr 6fr 1.6fr 88px 80px 68px;
  gap: 16px;
  padding: 12px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
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
  border-top: 1px solid #f1f5f9;
  transition: background 0.15s;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: rgba(248, 250, 252, 0.8);

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
  color: #1e293b;
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
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  cursor: pointer;
  outline: none;
  font-family: inherit;

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
  color: #94a3b8;
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
  padding-top: 6px;
}

.qm-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  color: #64748b;

  &:hover {
    border-color: #c7d2fe;
    color: #4f46e5;
    background: #eef2ff;
  }
}

.qm-icon-btn--delete:hover {
  border-color: #fecaca;
  color: #dc2626;
  background: #fef2f2;
}
</style>
