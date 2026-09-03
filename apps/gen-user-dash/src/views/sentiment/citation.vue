<template>
  <div class="sc-page">
    <!-- Header -->
    <header class="sc-header">
      <div class="sc-header-left">
        <h2 class="sc-title">引用源追溯</h2>
        <div class="sc-subtitle">追踪 AI 回答中高频引用的信息来源与权重归因</div>
      </div>
      <div class="sc-header-right">
        <button class="sc-btn sc-btn--outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          导出数据
        </button>
        <button class="sc-btn sc-btn--indigo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          导入自有文章
        </button>
      </div>
    </header>

    <!-- 主卡片 -->
    <section class="sc-card">
      <!-- 过滤器栏 -->
      <div class="sc-filter-bar">
        <div class="sc-filter-group">
          <div class="sc-filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            <span>问题:</span>
          </div>
          <button class="sc-select sc-select--question">
            <span class="truncate">全部问题</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sc-select-arrow"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <div class="sc-filter-group">
          <div class="sc-filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
            <span>AI引擎:</span>
          </div>
          <button class="sc-select sc-select--engine">
            <div class="sc-engine-display">
              <span class="sc-engine-dot" style="background-color: rgb(17, 24, 39);"></span>
              <span>全部·网页端</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sc-select-arrow"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <div class="sc-filter-group">
          <div class="sc-filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <span>日期:</span>
          </div>
          <button class="sc-select sc-select--date">
            <span>2026-08-21</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            <span>2026-08-27</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sc-select-arrow"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>

      <!-- 表格 -->
      <div class="sc-table-wrap">
        <table class="sc-table">
          <thead>
            <tr>
              <th class="sc-th sc-th--platform">
                <div class="sc-th-content">
                  <span>信源平台 (Platform)</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sc-th-arrow"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </th>
              <th class="sc-th sc-th--cite">
                <div class="sc-th-content sc-th-content--center">
                  总引用次
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sc-th-arrow sc-th-arrow--active"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </th>
              <th class="sc-th sc-th--authority">
                <div class="sc-th-content sc-th-content--center">
                  <span>豆包媒体权威度</span>
                  <span class="sc-info-tip" title="此评价来源于豆包接口。">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="11" y2="17"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                  </span>
                </div>
              </th>
              <th class="sc-th sc-th--models">
                <div class="sc-th-content sc-th-content--center">覆盖模型</div>
              </th>
              <th class="sc-th sc-th--channel">
                <div class="sc-th-content sc-th-content--center">发稿通道</div>
              </th>
              <th class="sc-th sc-th--action">
                <div class="sc-th-content sc-th-content--center">分析</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in citationPlatformList"
              :key="row.id"
              class="sc-tr"
            >
              <td class="sc-td sc-td--platform">
                <div class="sc-platform-cell">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sc-expand-icon"><path d="m6 9 6 6 6-6"/></svg>
                  <div>
                    <div class="sc-platform-name-row">
                      <div class="sc-platform-name">{{ row.name }}</div>
                      <span class="sc-article-badge">{{ row.articleCount }}</span>
                    </div>
                    <div class="sc-platform-cat">{{ row.category }}</div>
                  </div>
                </div>
              </td>
              <td class="sc-td sc-td--cite">
                <div class="sc-cite-cell">
                  <div class="sc-cite-numbers">
                    <span class="sc-cite-num">{{ row.totalCite }}</span>
                    <span class="sc-cite-pct">{{ row.pct }}</span>
                  </div>
                  <div class="sc-cite-bar">
                    <div class="sc-cite-bar-fill" :style="{ width: barWidth(row.pct) }"></div>
                  </div>
                </div>
              </td>
              <td class="sc-td sc-td--authority">
                <span
                  v-if="row.authorityColor === 'blue'"
                  class="sc-auth-badge sc-auth-badge--blue"
                  :title="row.name"
                >{{ row.authority }}</span>
                <span
                  v-else-if="row.authorityColor === 'green'"
                  class="sc-auth-badge sc-auth-badge--green"
                  :title="row.name"
                >{{ row.authority }}</span>
                <span v-else class="sc-auth-none">--</span>
              </td>
              <td class="sc-td sc-td--models">
                <div class="sc-models">
                  <span
                    v-for="model in row.models"
                    :key="model.name"
                    class="sc-model-tag"
                    :style="{ backgroundColor: model.color }"
                  >{{ model.name }}<span class="sc-model-count">{{ model.count }}</span></span>
                </div>
              </td>
              <td class="sc-td sc-td--channel">
                <span v-if="row.channelType === 'locked'" class="sc-channel-locked">{{ row.channel }}</span>
                <span v-else class="sc-channel-points">{{ row.channel }}</span>
              </td>
              <td class="sc-td sc-td--action">
                <button class="sc-action-btn" title="打开信源分析">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
                  分析
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { citationPlatformList } from '@/mock/data';

function barWidth(pct: string): string {
  const num = parseFloat(pct.replace('%', ''));
  return Math.min(100, num * 5) + '%';
}
</script>

<style lang="scss" scoped>
/* ===== 引用源追溯页面 ===== */
.sc-page {
  margin-top: -16px;
  margin-bottom: -16px;
  margin-left: auto;
  margin-right: auto;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  max-width: 1240px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

.sc-header {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.sc-header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sc-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.6px;
  line-height: 1.2;
  margin: 0;
}

.sc-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 12px;
  line-height: 20px;
}

.sc-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sc-btn {
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

.sc-btn--outline {
  background: #fff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #eef2ff;
  }
}

.sc-btn--indigo {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #4338ca;
  }
}

.sc-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 600px;
  overflow: visible;
}

.sc-filter-bar {
  width: 100%;
  background: #fff;
  padding: 16px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.sc-filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.sc-filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  flex-shrink: 0;
  user-select: none;
}

.sc-select {
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

.sc-select--question {
  background: #f8fafc;
  border-color: #e2e8f0;
  border-radius: 12px;
  padding: 8px 16px;
  min-width: 200px;
  max-width: 300px;

  &:hover {
    border-color: #cbd5e1;
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.sc-select--engine {
  border-radius: 8px;
  padding: 6px 12px;
  min-width: 140px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #a5b4fc;
  }
}

.sc-select--date {
  border-radius: 8px;
  padding: 6px 12px;
  min-width: 140px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #a5b4fc;
  }
}

.sc-engine-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sc-engine-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.sc-select-arrow {
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.sc-table-wrap {
  overflow-x: auto;
  width: 100%;
}

.sc-table {
  width: 100%;
  min-width: 1000px;
  text-align: left;
  border-collapse: collapse;

  thead {
    background: rgba(248, 250, 252, 0.5);
    border-bottom: 1px solid #f1f5f9;
  }
}

.sc-th {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 16px 24px;
  cursor: pointer;
  transition: color 0.15s ease;
  user-select: none;

  &:hover {
    color: #475569;
  }
}

.sc-th--platform {
  width: 33.33%;
  padding: 16px 32px;
  text-align: left;
  cursor: pointer;
}

.sc-th--cite,
.sc-th--authority,
.sc-th--models,
.sc-th--channel,
.sc-th--action {
  text-align: center;
  padding: 16px 24px;
}

.sc-th-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sc-th-content--center {
  justify-content: center;
}

.sc-th-arrow {
  color: #cbd5e1;
  transition: transform 0.2s ease;
}

.sc-th-arrow--active {
  color: #6366f1;
}

.sc-info-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  color: #cbd5e1;
  transition: all 0.15s ease;
  cursor: help;

  &:hover {
    background: #e2e8f0;
    color: #475569;
  }
}

.sc-table tbody {
  & tr + tr {
    border-top: 1px solid #f1f5f9;
  }
}

.sc-tr {
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    background: rgba(248, 250, 252, 0.5);
  }
}

.sc-td {
  padding: 20px 24px;
  vertical-align: middle;
}

.sc-td--platform {
  padding: 20px 24px;
}

.sc-td--cite,
.sc-td--authority,
.sc-td--models,
.sc-td--channel,
.sc-td--action {
  text-align: center;
  padding: 20px 24px;
}

.sc-platform-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sc-expand-icon {
  color: #94a3b8;
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.sc-platform-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sc-platform-name {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
}

.sc-article-badge {
  padding: 1px 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  white-space: nowrap;
}

.sc-platform-cat {
  margin-top: 2px;
  font-size: 12px;
  color: #94a3b8;
}

.sc-cite-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.sc-cite-numbers {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.sc-cite-num {
  font-size: 16px;
  font-weight: 900;
  color: #1e293b;
}

.sc-cite-pct {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.sc-cite-bar {
  width: 64px;
  height: 4px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.sc-cite-bar-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.sc-auth-badge {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 999px;
  border: 1px solid;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
}

.sc-auth-badge--blue {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.sc-auth-badge--green {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.sc-auth-none {
  font-size: 12px;
  color: #cbd5e1;
}

.sc-models {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.sc-model-tag {
  font-size: 10px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
  white-space: nowrap;
}

.sc-model-count {
  margin-left: 4px;
  opacity: 0.8;
}

.sc-channel-locked {
  font-size: 11px;
  color: #cbd5e1;
}

.sc-channel-points {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
}

.sc-action-btn {
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
</style>
