<template>
  <div class="ml-page">
    <!-- 头部 -->
    <div class="ml-header">
      <div class="ml-title-block">
        <h2 class="ml-title">信源库</h2>
        <p class="ml-desc">全库 156,991 家在这些源上发的内容，更容易被 AI 引用</p>
      </div>
      <div class="ml-header-actions">
        <button class="ml-btn ml-btn--indigo" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          去发布稿件
        </button>
      </div>
    </div>

    <!-- 内容卡片 -->
    <div class="ml-card">
      <!-- 筛选栏 -->
      <div class="ml-filter-bar">
        <!-- AI引擎偏好 -->
        <div class="ml-filter-group">
          <span class="ml-filter-label">AI 引擎</span>
          <select class="ml-select">
            <option value="all">全部</option>
            <option value="doubao">豆包</option>
            <option value="deepseek">DeepSeek</option>
            <option value="wenxin">文心一言</option>
            <option value="qwen">千问</option>
            <option value="yuanbao">元宝</option>
          </select>
        </div>

        <!-- 媒体类型 -->
        <div class="ml-filter-group">
          <span class="ml-filter-label">媒体类型</span>
          <select class="ml-select">
            <option value="">不限</option>
            <option value="portal">新闻门户</option>
            <option value="selfmedia">自媒体</option>
          </select>
        </div>

        <!-- 积分消耗 -->
        <div class="ml-filter-group">
          <span class="ml-filter-label">积分消耗</span>
          <div class="ml-range-group">
            <input class="ml-range-input" type="number" placeholder="最低" min="0" />
            <span class="ml-range-sep">—</span>
            <input class="ml-range-input" type="number" placeholder="最高" min="0" />
          </div>
        </div>

        <!-- 账号认证 -->
        <div class="ml-filter-group">
          <span class="ml-filter-label">账号认证</span>
          <select class="ml-select">
            <option value="all">全部</option>
            <option value="yes">认证</option>
            <option value="no">未认证</option>
          </select>
        </div>

        <!-- 地区 / 媒体分类 -->
        <div class="ml-filter-group">
          <span class="ml-filter-label">地区 / 媒体分类</span>
          <button class="ml-select ml-select--btn" type="button">
            <span>全部地区</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <!-- 搜索框 -->
        <div class="ml-search-wrap">
          <svg class="ml-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          <input class="ml-search-input" type="text" placeholder="搜索信源平台 / 媒体账号 / 投放位，按回车查询" />
        </div>
      </div>

      <!-- 工具栏：切换 + 计数 + 排序 -->
      <div class="ml-toolbar">
        <div class="ml-toolbar-left">
          <!-- 媒体账号 / 信源平台 切换 -->
          <div class="ml-view-toggle">
            <button class="ml-view-tab ml-view-tab--active" type="button">媒体账号</button>
            <button class="ml-view-tab" type="button">信源平台</button>
          </div>
          <!-- 计数 -->
          <div class="ml-count-tabs">
            <button class="ml-count-tab ml-count-tab--active" type="button">
              全部 <b class="ml-count-num">156,991</b>
            </button>
            <button class="ml-count-tab" type="button">
              我的收藏 <b class="ml-count-num">0</b>
            </button>
            <button class="ml-count-tab" type="button">
              已选 <b class="ml-count-num">0</b>
            </button>
          </div>
        </div>
        <div class="ml-toolbar-right">
          <select class="ml-select ml-sort-select">
            <option value="verdict">综合推荐</option>
            <option value="cite-desc" selected>引用指数 ↓</option>
            <option value="succ-desc">出稿率 ↓</option>
            <option value="price-asc">价格 低→高</option>
            <option value="price-desc">价格 高→低</option>
          </select>
        </div>
      </div>

      <!-- 表格 -->
      <div class="ml-table-wrap">
        <table class="ml-table">
          <thead>
            <tr>
              <th class="ml-th ml-th--check"><input type="checkbox" class="ml-checkbox" /></th>
              <th class="ml-th ml-th--media">媒体</th>
              <th class="ml-th ml-th--type">类型</th>
              <th class="ml-th ml-th--engine">引擎偏好</th>
              <th class="ml-th ml-th--cite">引用指数</th>
              <th class="ml-th ml-th--price">价格</th>
              <th class="ml-th ml-th--cert">认证</th>
              <th class="ml-th ml-th--action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in mediaLibraryList" :key="item.id" class="ml-tr">
              <td class="ml-td ml-td--check"><input type="checkbox" class="ml-checkbox" /></td>
              <td class="ml-td ml-td--media">
                <div class="ml-media-cell">
                  <div class="ml-media-logo">{{ item.logo }}</div>
                  <div class="ml-media-info">
                    <div class="ml-media-name">{{ item.name }}</div>
                    <div class="ml-media-cat">{{ item.category }} · {{ item.fans }}</div>
                  </div>
                </div>
              </td>
              <td class="ml-td ml-td--type">
                <span class="ml-type-badge" :class="getTypeClass(item.type)">{{ item.type }}</span>
              </td>
              <td class="ml-td ml-td--engine">
                <div class="ml-engine-tags">
                  <span
                    v-for="eng in item.enginePref"
                    :key="eng"
                    class="ml-engine-tag"
                    :class="getEngineClass(eng)"
                  >{{ getEngineLabel(eng) }}</span>
                </div>
              </td>
              <td class="ml-td ml-td--cite">
                <div class="ml-cite-cell">
                  <span class="ml-cite-num">{{ item.citeIndex }}</span>
                  <div class="ml-cite-bar">
                    <div class="ml-cite-bar-fill" :style="{ width: item.citeIndex + '%' }"></div>
                  </div>
                </div>
              </td>
              <td class="ml-td ml-td--price">
                <span class="ml-price">¥{{ item.price }}</span>
              </td>
              <td class="ml-td ml-td--cert">
                <span class="ml-cert-badge">{{ item.certStatus }}</span>
              </td>
              <td class="ml-td ml-td--action">
                <div class="ml-action-group">
                  <a class="ml-action-link" href="javascript:void(0)">稿件案例</a>
                  <button class="ml-action-btn" type="button">发稿</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="ml-pagination">
        <span class="ml-page-info">共 156,991 条</span>
        <div class="ml-page-btns">
          <button class="ml-page-btn ml-page-btn--nav" type="button" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button class="ml-page-btn ml-page-btn--active" type="button">1</button>
          <button class="ml-page-btn" type="button">2</button>
          <button class="ml-page-btn" type="button">3</button>
          <span class="ml-page-ellipsis">…</span>
          <button class="ml-page-btn" type="button">19,625</button>
          <button class="ml-page-btn ml-page-btn--nav" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mediaLibraryList } from '@/mock/data';

const engineMap: Record<string, { label: string; class: string }> = {
  doubao: { label: '豆包', class: 'ml-engine-tag--blue' },
  deepseek: { label: 'DeepSeek', class: 'ml-engine-tag--purple' },
  yuanbao: { label: '元宝', class: 'ml-engine-tag--red' },
  wenxin: { label: '文心一言', class: 'ml-engine-tag--green' },
  qianwen: { label: '千问', class: 'ml-engine-tag--pink' },
};

function getEngineLabel(eng: string): string {
  return engineMap[eng]?.label || eng;
}

function getEngineClass(eng: string): string {
  return engineMap[eng]?.class || '';
}

function getTypeClass(type: string): string {
  if (type.includes('门户')) return 'ml-type-badge--blue';
  if (type.includes('问答')) return 'ml-type-badge--green';
  return 'ml-type-badge--gray';
}
</script>

<style lang="scss" scoped>
/* ============ 优化 - 信源库 (像素级复刻) ============ */
/* 对标页面精确样式值：
   主文本 #0f1115 / 次文本 #5b606a / 元文本 #8a8f9b
   表格文本 #2a2d36 / 边框 #e6e8ee / 单元格边框 #f0f1f6
   表头背景 #f5f6fa / 页面背景 #f8fafc / 卡片白底 #fff
   卡片圆角 14px / 阴影 rgba(16,18,30,0.04) 0px 2px 10px 0px
*/

.ml-page {
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
  color: #0f1115;
  font-size: 16px;
}

/* ---------- 头部 ---------- */
.ml-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.ml-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ml-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f1115;
  line-height: 33px;
  letter-spacing: -0.3px;
}

.ml-desc {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: #5b606a;
  line-height: 21px;
}

.ml-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ml-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #c7d2fe;
  background: #fff;
  color: #4f46e5;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  &:hover {
    background: #eef2ff;
  }
}

/* ---------- 卡片 ---------- */
.ml-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ---------- 筛选栏 ---------- */
.ml-filter-bar {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f1f6;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.ml-filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ml-filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #5b606a;
  white-space: nowrap;
  user-select: none;
}

.ml-select {
  height: 32px;
  padding: 0 8px;
  font-size: 12.5px;
  font-weight: 400;
  color: #2a2d36;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;

  &:hover {
    border-color: #c7d2fe;
  }
}

.ml-select--btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  height: 32px;
  padding: 0 8px;
  font-size: 12.5px;
  font-weight: 400;
  color: #2a2d36;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    border-color: #c7d2fe;
  }
}

.ml-range-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ml-range-input {
  width: 64px;
  height: 32px;
  padding: 0 7px;
  font-size: 12px;
  font-weight: 400;
  color: #2a2d36;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 7px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;

  &::placeholder {
    color: #8a8f9b;
  }

  &:focus {
    border-color: #6452ff;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.ml-range-sep {
  color: #8a8f9b;
  font-size: 12px;
}

.ml-search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  height: 32px;
  padding: 0 8px;
  background: #fff;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: #6452ff;
  }
}

.ml-search-icon {
  color: #8a8f9b;
  flex-shrink: 0;
  margin-right: 6px;
}

.ml-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  font-family: inherit;
  height: 100%;

  &::placeholder {
    color: #8a8f9b;
  }
}

/* ---------- 工具栏 ---------- */
.ml-toolbar {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f1f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.ml-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ml-view-toggle {
  display: inline-flex;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  overflow: hidden;
}

.ml-view-tab {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  background: #fff;
  color: #5b606a;

  &--active {
    background: #0f1115;
    color: #fff;
    font-weight: 600;
  }

  &:not(&--active):hover {
    background: #f5f6fa;
    color: #0f1115;
  }
}

.ml-count-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ml-count-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 9999px;
  font-size: 12.5px;
  font-weight: 500;
  border: 1px solid #e6e8ee;
  background: #fff;
  color: #5b606a;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: #c7d2fe;
    color: #4f46e5;
  }

  &--active {
    background: #0f1115;
    color: #fff;
    border-color: #0f1115;
    font-weight: 600;

    .ml-count-num {
      color: #8a8f9b;
    }
  }
}

.ml-count-num {
  font-weight: 400;
  color: #8a8f9b;
}

.ml-toolbar-right {
  display: flex;
  align-items: center;
}

.ml-sort-select {
  height: 30px;
}

/* ---------- 表格 ---------- */
.ml-table-wrap {
  overflow-x: auto;
}

.ml-table {
  width: 100%;
  table-layout: auto;
  border-collapse: collapse;
}

.ml-th {
  font-size: 12px;
  font-weight: 600;
  color: #8a8f9b;
  background: #f5f6fa;
  padding: 9px 10px;
  border-bottom: 1px solid #e6e8ee;
  text-align: left;
  white-space: nowrap;
}

.ml-th--check {
  width: 40px;
  text-align: center;
}

.ml-th--media {
  min-width: 140px;
}

.ml-th--type {
  width: 90px;
}

.ml-th--engine {
  width: 160px;
}

.ml-th--cite {
  width: 120px;
}

.ml-th--price {
  width: 70px;
}

.ml-th--cert {
  width: 70px;
}

.ml-th--action {
  width: 120px;
  text-align: right;
}

.ml-tr {
  border-top: none;
  transition: background 0.15s;

  &:hover {
    background: #f5f6fa;
  }
}

.ml-td {
  font-size: 12.5px;
  color: #2a2d36;
  padding: 13px 10px;
  border-bottom: 1px solid #f0f1f6;
  vertical-align: middle;
}

.ml-td--check {
  text-align: center;
}

.ml-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #6452ff;
}

.ml-media-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ml-media-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f5f6fa;
  color: #5b606a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.ml-media-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.ml-media-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f1115;
  white-space: nowrap;
}

.ml-media-cat {
  font-size: 11.5px;
  font-weight: 400;
  color: #8a8f9b;
  white-space: nowrap;
}

.ml-type-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 500;
  border: 1px solid;
}

.ml-type-badge--blue {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.ml-type-badge--green {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #dcfce7;
}

.ml-type-badge--gray {
  background: #f5f6fa;
  color: #5b606a;
  border-color: #e6e8ee;
}

.ml-engine-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.ml-engine-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid;
}

.ml-engine-tag--blue {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.ml-engine-tag--purple {
  background: #f5f3ff;
  color: #7c3aed;
  border-color: #ddd6fe;
}

.ml-engine-tag--red {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.ml-engine-tag--green {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #dcfce7;
}

.ml-engine-tag--pink {
  background: #fdf2f8;
  color: #db2777;
  border-color: #fbcfe8;
}

.ml-cite-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ml-cite-num {
  font-size: 13px;
  font-weight: 600;
  color: #0f1115;
  min-width: 20px;
}

.ml-cite-bar {
  flex: 1;
  height: 4px;
  background: #f0f1f6;
  border-radius: 2px;
  overflow: hidden;
}

.ml-cite-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: #6452ff;
}

.ml-price {
  font-size: 13px;
  font-weight: 600;
  color: #e11d48;
}

.ml-cert-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 500;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.ml-td--action {
  text-align: right;
}

.ml-action-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.ml-action-link {
  font-size: 12.5px;
  font-weight: 500;
  color: #5b606a;
  text-decoration: none;
  font-family: inherit;
  transition: color 0.15s;

  &:hover {
    color: #6452ff;
  }
}

.ml-action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: #fff;
  background: #6452ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  &:hover {
    background: #5830e0;
  }
}

/* ---------- 分页 ---------- */
.ml-pagination {
  padding: 12px 20px;
  border-top: 1px solid #f0f1f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.ml-page-info {
  font-size: 12.5px;
  font-weight: 400;
  color: #8a8f9b;
}

.ml-page-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ml-page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  font-weight: 500;
  color: #2a2d36;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover:not(:disabled):not(.ml-page-btn--active) {
    border-color: #c7d2fe;
    color: #6452ff;
  }

  &:disabled {
    color: #c5c8d0;
    cursor: not-allowed;
  }
}

.ml-page-btn--active {
  background: #0f1115;
  color: #fff;
  border-color: #0f1115;
}

.ml-page-btn--nav {
  padding: 0;
}

.ml-page-ellipsis {
  color: #8a8f9b;
  font-size: 12.5px;
  padding: 0 2px;
}
</style>
