<template>
  <div class="lab">
    <h2 class="lab-meta">本地页头实验室 · 对标报告页统一规范</h2>
    <p class="lab-meta-desc">标题 25px/800/#17182b · 描述 12.5px/#8b8d9d · 标题下 6px · header 下 18px · 壳 padding 28/36/80</p>

    <div class="geo-page lab-card">
      <div class="geo-page-header">
        <div class="geo-page-header__text">
          <h1 class="geo-page-title">报告</h1>
          <p class="geo-page-desc">当前品牌：示例品牌 · 周报 每周日截止、月报 每月月末截止后次日自动生成</p>
        </div>
        <button type="button" class="lab-btn">报告模板</button>
      </div>
      <div class="lab-fake-card">内容区起点（应距 header 底 18px）</div>
    </div>

    <div class="geo-page lab-card">
      <PageHeader title="AI排名透视" desc="深度分析品牌在不同 AI 引擎中的排名竞争态势">
        <template #actions>
          <button type="button" class="lab-btn">导出</button>
        </template>
      </PageHeader>
      <div class="lab-fake-card">内容区起点</div>
    </div>

    <div class="geo-page lab-card">
      <header class="brand-header geo-page-header">
        <div class="geo-page-header__text">
          <h1 class="brand-title geo-page-title">品牌名片</h1>
          <p class="brand-subtitle geo-page-desc">品牌身份与基础信息 · 监控统计、AI 写稿、洞察分析时调用</p>
        </div>
      </header>
      <div class="lab-fake-card">内容区起点</div>
    </div>

    <div class="geo-page lab-card">
      <header class="pp-header geo-page-header">
        <div class="geo-page-header__text">
          <h1 class="geo-page-title">套餐版本</h1>
          <p class="geo-page-desc">查看当前的套餐权益、用量与账单记录 · 统计周期：实时</p>
        </div>
      </header>
      <div class="lab-fake-card">内容区起点</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 免登录页头对照页
</script>

<style scoped>
.lab {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
  font-family: Inter, 'Noto Sans SC', system-ui, sans-serif;
}
.lab-meta {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #17182b;
}
.lab-meta-desc {
  margin: 0 0 20px;
  font-size: 12px;
  color: #8b8d9d;
}
.lab-card {
  background: #fff;
  border: 1px dashed #e7e9f0;
  border-radius: 12px;
  margin-bottom: 24px;
}
.lab-fake-card {
  background: #f7f8fb;
  border: 1px solid #e7e9f0;
  border-radius: 10px;
  padding: 16px;
  font-size: 13px;
  color: #626477;
}
.lab-btn {
  border: 1px solid #e7e9f0;
  background: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #4f3fd3;
  cursor: pointer;
}
</style>
