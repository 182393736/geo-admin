<template>
  <div class="nc-page">
    <div class="nc-hero">
      <!-- 欢迎区 -->
      <h1 class="nc-welcome-title">今天想让 Agent 帮你做什么？</h1>
      <h2 class="nc-welcome-sub">查数据，找问题，制定优化计划</h2>

      <!-- Tab 切换 + 余额 -->
      <div class="nc-tab-row">
        <div class="nc-tabs">
          <button class="nc-tab nc-tab--active" type="button">优化策略</button>
          <button class="nc-tab" type="button">问题挖掘</button>
          <button class="nc-tab" type="button">撰写稿件</button>
        </div>
        <button class="nc-balance" type="button">可用余额 330</button>
      </div>

      <!-- 输入框卡片 -->
      <div class="nc-chat-card">
        <textarea
          class="nc-input"
          placeholder="问我 GEO 表现、行业热点、信源选择或内容引用..."
          rows="3"
        ></textarea>
        <div class="nc-chat-bottom">
          <div class="nc-input-hints">
            <span class="nc-hint-chip">⌘ Enter 发送</span>
          </div>
          <button class="nc-submit" type="button">开始</button>
        </div>
      </div>

      <!-- 大家在问 -->
      <div class="nc-guide">
        <div class="nc-guide-title">大家在问</div>
        <div class="nc-guide-list">
          <button class="nc-question" type="button">
            <span>分析一下提及率有什么波动？</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="nc-question" type="button">
            <span>看看今天有什么热点？</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="nc-question" type="button">
            <span>做豆包优化有哪些优质信源？</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="nc-question" type="button">
            <span>做 DeepSeek 优化有哪些优质信源？</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="nc-question" type="button">
            <span>什么样的内容更容易被豆包引用？</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="nc-question" type="button">
            <span>什么样的内容更容易被 DeepSeek 引用？</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// AGENT - 新建对话页面
</script>

<style lang="scss" scoped>
/* ===================================================
   AGENT - 新建对话 (像素级复刻)
   对标: geo.timus.cn/dashboard/new-agent

   精确色值:
   主文本 #111114 / 次文本 #6e6e7a / 元文本 #9a9aa6
   问题文字 #3a3a45 / 边框 #d8d8d8 / 浅边框 #ececf3
   紫色渐变 #4f46e5 → #7c3aed → #6366f1
   余额紫 #6b5bd2 / 余额底 #f3f0ff / 余额边 #e3deff
   页面背景 #f8fafc / 卡片白底 #fff
   hover边框 #c4b5fd / hover底 #faf9ff
   =================================================== */

.nc-page {
  margin: -16px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  display: flex;
  justify-content: center;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
}

.nc-hero {
  max-width: 760px;
  width: 100%;
  margin: 56px 44px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ====== 欢迎区 ====== */
.nc-welcome-title {
  margin: 0;
  font-size: 42px;
  font-weight: 900;
  color: #111114;
  text-align: center;
  line-height: 50px;
  letter-spacing: -1px;
}

.nc-welcome-sub {
  margin: 10px 0 0;
  font-size: 13px;
  font-weight: 400;
  color: #6e6e7a;
  text-align: center;
  line-height: 20px;
}

/* ====== Tab 切换 + 余额 ====== */
.nc-tab-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
  width: 100%;
}

.nc-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nc-tab {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 700;
  color: #5b606a;
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover { color: #111114; background: #f1f5f9; }
}

.nc-tab--active {
  color: #fff;
  background: #0f1115;
  &:hover { color: #fff; background: #0f1115; }
}

.nc-balance {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 500;
  color: #6b5bd2;
  background: #f3f0ff;
  border: 1px solid #e3deff;
  border-radius: 9999px;
  cursor: pointer;
  font-family: inherit;
}

/* ====== 输入框卡片 ====== */
.nc-chat-card {
  width: 100%;
  margin-top: 16px;
  background: #fff;
  border: 1.5px solid #d8d8d8;
  border-radius: 18px;
  padding: 16px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.15s;

  &:focus-within { border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1); }
}

.nc-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14.5px;
  font-weight: 400;
  color: #111114;
  font-family: inherit;
  line-height: 22px;
  resize: none;
  padding: 4px 4px 0;

  &::placeholder { color: #9a9aa6; }
}

.nc-chat-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.nc-input-hints {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nc-hint-chip {
  font-size: 11px;
  font-weight: 400;
  color: #9a9aa6;
  padding: 2px 6px;
  border-radius: 6px;
  background: #f4f4f6;
}

.nc-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 10px 20px;
  font-size: 13.5px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%);
  border: none;
  border-radius: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s, box-shadow 0.15s;

  &:hover { opacity: 0.92; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
}

/* ====== 大家在问 ====== */
.nc-guide {
  width: 100%;
  margin-top: 28px;
}

.nc-guide-title {
  font-size: 12px;
  font-weight: 600;
  color: #9a9aa6;
  margin: 0 2px 9px;
}

.nc-guide-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nc-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  font-size: 12.5px;
  font-weight: 500;
  color: #3a3a45;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid #ececf3;
  border-radius: 11px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.16s;

  svg { color: #c4b5fd; flex-shrink: 0; }

  &:hover {
    border-color: #c4b5fd;
    background: #faf9ff;
    transform: translateY(-1px);
    svg { color: #7c3aed; }
  }
}
</style>
