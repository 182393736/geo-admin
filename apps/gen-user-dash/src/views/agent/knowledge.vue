<template>
  <div class="kb-page geo-page">
    <!-- 头部 -->
    <div class="kb-header geo-page-header">
      <div class="kb-title-block geo-page-header__text">
        <h2 class="kb-title geo-page-title">Agent 知识库</h2>
        <p class="kb-desc geo-page-desc">写稿和挖掘过程中经你确认的资料，Agent 之后都按这份来</p>
      </div>
    </div>

    <div class="geo-page-stack">

    <!-- Tab 切换 -->
    <div class="kb-tabs">
      <button class="kb-tab kb-tab--active" type="button">品牌</button>
      <button class="kb-tab" type="button">公司</button>
      <button class="kb-tab" type="button">竞品档案</button>
    </div>

    <!-- 内容卡片 -->
    <div class="kb-card">
      <div class="kb-empty-row">
        <span class="kb-empty-text">还没有内容。写稿过程中确认过的事实会记到这里，也可以点「修改」自己写。</span>
        <button class="kb-edit-btn" type="button">修改</button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// AGENT - Agent知识库
</script>

<style lang="scss" scoped>
/* ===================================================
   AGENT - Agent知识库 (像素级复刻)
   对标: geo.timus.cn/dashboard/agent-kb

   精确色值:
   主文本 #0f1115 / 次文本 #5b606a / 元文本 #8a8f9b
   边框 #e6e8ee / 卡片白底 #fff / 页面背景 #f8fafc
   紫色 #4a38e0 / 紫底 #efecff
   圆角 16px / padding 20px 24px
   =================================================== */

.kb-page {
  background: #f8fafc;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
  font-size: 16px;
}

/* ====== 头部 ====== */
.kb-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.kb-title-block {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* .kb-title / .kb-desc：由 global.scss 统一 */

/* ====== Tab 切换 ====== */
.kb-tabs {
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid #e6e8ee;
  padding-bottom: 0;
}

.kb-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0 0 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: #5b606a;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s;

  &:hover { color: #0f1115; }
}

.kb-tab--active {
  color: #0f1115;
  font-weight: 800;
  border-bottom-color: #0f1115;
}

/* ====== 内容卡片 ====== */
.kb-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
}

.kb-empty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kb-empty-text {
  flex: 1;
  font-size: 12.5px;
  font-weight: 400;
  color: #8a8f9b;
  text-align: center;
  padding: 32px 0;
  line-height: 18.75px;
}

.kb-edit-btn {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 700;
  color: #4a38e0;
  background: #efecff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: #e6e0ff; }
}
</style>
