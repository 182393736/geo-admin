<template>
  <div class="rm-page">
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
</template>

<script setup lang="ts">
import { recognitionData } from '@/mock/data';
</script>

<style lang="scss" scoped>
/* ============ 口碑监控识别管理 ============ */
.rm-page {
  margin-top: -16px;
  margin-bottom: -16px;
  margin-left: auto;
  margin-right: auto;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  max-width: 1240px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #1e293b;
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
  color: #1e293b;
  line-height: 1.5;
}

.rm-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 400;
  color: #64748b;
  line-height: 20px;
}

.rm-tabs {
  display: inline-flex;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
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
  font-family: inherit;
}

@media (min-width: 640px) {
  .rm-tab {
    flex: none;
  }
}

.rm-tab--active {
  background: #1e293b;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.rm-tab--inactive {
  background: transparent;
  color: #64748b;
  font-weight: 500;

  &:hover {
    background: #f8fafc;
    color: #1e293b;
  }
}

.rm-desc {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 400;
  color: #64748b;
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
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
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
  color: #1e293b;
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
  color: #94a3b8;
  line-height: 1.5;
}

.rm-meta-strong {
  font-weight: 700;
  color: #334155;
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
  color: #475569;
  background: transparent;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  font-family: inherit;

  &:hover {
    color: #1e293b;
    border-color: #cbd5e1;
    background: #f8fafc;
  }
}

.rm-brand-input {
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  outline: none;
  width: 100%;
  font-family: inherit;
  transition: border-color 0.15s;
}

.rm-alias-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
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
  background: #eef2ff;
  color: #4f46e5;
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
  color: #334155;
  letter-spacing: 0.025em;
}

.rm-form-input {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  color: #1e293b;
  background: #fff;
  border: 1px solid #e2e8f0;
  outline: none;
  width: 100%;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px #eef2ff;
  }
}

.rm-url-group {
  display: flex;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px #eef2ff;
  }
}

.rm-url-select {
  padding: 0 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  background: #f8fafc;
  border: none;
  border-right: 1px solid #e2e8f0;
  cursor: pointer;
  outline: none;
  font-family: inherit;
}

.rm-url-input {
  flex: 1;
  min-width: 0;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 400;
  color: #1e293b;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: #94a3b8;
  }
}

.rm-textarea {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  color: #1e293b;
  background: #fff;
  border: 1px solid #e2e8f0;
  outline: none;
  line-height: 1.625;
  resize: none;
  min-height: 80px;
  width: 100%;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px #eef2ff;
  }
}
</style>
