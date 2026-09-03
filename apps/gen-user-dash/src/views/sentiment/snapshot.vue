<template>
  <div class="sn-page">
    <!-- 头部 -->
    <div class="sn-header">
      <div class="sn-title-block">
        <h2 class="sn-title">搜索快照下载</h2>
        <div class="sn-desc-row">
          <span class="sn-desc-text">预览 AI 回答，并下载不同模型中的搜索结果快照或回答 Excel</span>
        </div>
      </div>
      <div class="sn-header-actions">
        <button class="sn-btn sn-btn--gray" title="最多导出连续 7 天">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
          导出回答 Excel
        </button>
        <button class="sn-btn sn-btn--indigo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
          批量导出快照
        </button>
      </div>
    </div>

    <!-- 内容卡片 -->
    <div class="sn-card">
      <!-- 筛选栏 -->
      <div class="sn-filter-bar">
        <!-- 问题筛选 -->
        <div class="sn-filter-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
          <span>问题:</span>
        </div>
        <div class="sn-select-wrap">
          <button class="sn-select-btn" type="button">
            <span class="sn-select-text">采购礼堂椅厂家推荐</span>
            <svg class="sn-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
        <span class="sn-filter-count">共 7 个问题</span>
        <!-- 平台筛选 -->
        <div class="sn-filter-group">
          <div class="sn-filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            <span>平台:</span>
          </div>
          <div class="sn-select-wrap sn-select-wrap--narrow">
            <button class="sn-select-btn" type="button">
              <span class="sn-select-text">全部平台</span>
              <svg class="sn-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        </div>
        <!-- 日期筛选 -->
        <div class="sn-filter-group">
          <div class="sn-filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            <span>日期:</span>
          </div>
          <input class="sn-date-input" type="date" value="2026-08-28" max="2026-08-28" />
        </div>
      </div>

      <!-- 快照列表表格 -->
      <div class="sn-table-wrap">
        <table class="sn-table">
          <thead>
            <tr>
              <th class="sn-th sn-th--name">文件名称</th>
              <th class="sn-th sn-th--rank">排行值</th>
              <th class="sn-th sn-th--size">文件大小</th>
              <th class="sn-th sn-th--ai">AI 回答</th>
              <th class="sn-th sn-th--action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in snapshotList" :key="item.id" class="sn-tr">
              <td class="sn-td sn-td--name">
                <div class="sn-file-cell">
                  <div class="sn-file-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                  </div>
                  <div class="sn-file-info">
                    <span class="sn-file-name" :title="item.name">{{ item.name }}</span>
                    <div class="sn-file-meta">
                      <span class="sn-engine-text">{{ item.engine }}</span>
                      <span class="sn-platform-badge">{{ item.platform }}</span>
                      <span class="sn-date-text">{{ item.date }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="sn-td sn-td--rank">
                <span class="sn-rank-badge">{{ item.rank }}</span>
              </td>
              <td class="sn-td sn-td--size">{{ item.size }}</td>
              <td class="sn-td sn-td--ai">
                <button class="sn-ai-btn" type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  查看回答
                </button>
              </td>
              <td class="sn-td sn-td--action">
                <div class="sn-action-group">
                  <button class="sn-action-btn sn-action-btn--preview" type="button">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                    预览
                  </button>
                  <button class="sn-action-btn sn-action-btn--download" type="button">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
                    下载
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { snapshotList } from '@/mock/data';
</script>

<style lang="scss" scoped>
/* ============ 口碑搜索快照下载 ============ */
.sn-page {
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
  gap: 32px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

.sn-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #f1f5f9;
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
  color: #1e293b;
  letter-spacing: -0.6px;
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
  color: #64748b;
  line-height: 20px;
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
  font-family: inherit;
}

.sn-btn--gray {
  color: #334155;
  border-color: #e2e8f0;

  &:hover {
    background: #f8fafc;
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
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.sn-filter-bar {
  width: 100%;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
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
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s;
  font-family: inherit;

  &:hover {
    border-color: #cbd5e1;
  }
}

.sn-select-text {
  font-weight: 500;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sn-select-arrow {
  color: #94a3b8;
  flex-shrink: 0;
  margin-left: 8px;
}

.sn-filter-count {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.sn-date-input {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  cursor: pointer;
  font-family: inherit;
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
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
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
  border-top: 1px solid #f1f5f9;
  transition: background 0.15s;

  &:hover {
    background: rgba(248, 250, 252, 0.5);
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
  color: #1e293b;
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
  color: #334155;
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
  color: #64748b;
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
  color: #64748b;
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
  font-family: inherit;
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
  font-family: inherit;
  transition: color 0.15s, background 0.15s;
}

.sn-action-btn--preview {
  color: #475569;

  &:hover {
    color: #4f46e5;
    background: #f1f5f9;
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
