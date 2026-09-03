<template>
  <div class="ar-page">
    <!-- 头部 -->
    <div class="ar-header">
      <div class="ar-title-block">
        <h2 class="ar-title">稿件库</h2>
        <p class="ar-desc">所有由 AI 辅助生成的稿件 · 数据实时同步</p>
      </div>
      <div class="ar-header-actions">
        <button class="ar-btn ar-btn--ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          刷新
        </button>
        <button class="ar-btn ar-btn--ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          发稿记录
        </button>
        <button class="ar-btn ar-btn--ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
          发布稿件
        </button>
        <button class="ar-btn ar-btn--dark" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          新建稿件
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="ar-search-wrap">
      <svg class="ar-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
      <input class="ar-search-input" type="text" placeholder="搜索稿件标题、关键词..." />
    </div>

    <!-- Tabs 行 -->
    <div class="ar-tabs-bar">
      <div class="ar-tabs">
        <button class="ar-tab ar-tab--active" type="button">全部</button>
        <button class="ar-tab" type="button">进行中</button>
        <button class="ar-tab" type="button">已中断</button>
        <button class="ar-tab" type="button">已完成</button>
      </div>
      <div class="ar-sort">
        <span class="ar-sort-label">按</span>
        <span class="ar-sort-field">更新时间</span>
        <span class="ar-sort-label">排序</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>

    <!-- 内容卡片（空状态） -->
    <div class="ar-card ar-card--empty">
      <div class="ar-empty-icon">📝</div>
      <div class="ar-empty-title">还没有稿件</div>
      <div class="ar-empty-hint">点右上角「新建稿件」让 AI 帮你写第一篇</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// AGENT - 稿件库
</script>

<style lang="scss" scoped>
/* ===================================================
   AGENT - 稿件库 (像素级复刻)
   对标: geo.timus.cn/dashboard/my-articles

   精确色值:
   主文本 #0f1115 / 次文本 #5b606a / 元文本 #8a8f9b
   边框 #e6e8ee / 卡片白底 #fff / 页面背景 #f8fafc
   黑色按钮 #0f1115 / 紫色 #6452ff
   圆角 10px(搜索) / 14px(卡片) / 8px(按钮)
   =================================================== */

.ar-page {
  margin: -16px auto -16px;
  padding: 24px 32px 60px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  max-width: 1240px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
  font-size: 16px;
}

/* ====== 头部 ====== */
.ar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: nowrap;
}

.ar-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.ar-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f1115;
  line-height: 30px;
  letter-spacing: -0.3px;
}

.ar-desc {
  margin: 4px 0 0;
  font-size: 12.5px;
  font-weight: 400;
  color: #5b606a;
  line-height: 18.75px;
}

.ar-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.ar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid;
  transition: background 0.15s;
}

.ar-btn--ghost {
  color: #2a2d36;
  background: #fff;
  border-color: #e6e8ee;
  &:hover { background: #f5f6fa; }
}

.ar-btn--dark {
  color: #fff;
  background: #0f1115;
  border-color: #0f1115;
  &:hover { background: #1a1d24; }
}

/* ====== 搜索栏 ====== */
.ar-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 360px;
}

.ar-search-icon {
  position: absolute;
  left: 12px;
  color: #8a8f9b;
  pointer-events: none;
}

.ar-search-input {
  width: 100%;
  height: 38px;
  padding: 0 12px 0 36px;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 10px;
  outline: none;
  font-family: inherit;

  &::placeholder { color: #8a8f9b; }
  &:focus { border-color: #6452ff; }
}

/* ====== Tabs 行 ====== */
.ar-tabs-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e6e8ee;
}

.ar-tabs {
  display: flex;
  align-items: center;
  gap: 20px;
}

.ar-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 38px;
  font-size: 12.5px;
  font-weight: 500;
  color: #5b606a;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s;

  &:hover { color: #0f1115; }
}

.ar-tab--active {
  color: #0f1115;
  font-weight: 700;
  border-bottom-color: #0f1115;
}

.ar-sort {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11.5px;
  font-weight: 400;
  color: #8a8f9b;

  svg { color: #8a8f9b; }
}

.ar-sort-field {
  font-weight: 600;
  color: #2a2d36;
}

/* ====== 内容卡片（空状态） ====== */
.ar-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(0, 0, 0, 0.03) 0px 1px 3px 0px;
}

.ar-card--empty {
  padding: 60px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ar-empty-icon {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 4px;
}

.ar-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f1115;
  line-height: 22px;
}

.ar-empty-hint {
  font-size: 12.5px;
  font-weight: 400;
  color: #8a8f9b;
  line-height: 18.75px;
}
</style>
