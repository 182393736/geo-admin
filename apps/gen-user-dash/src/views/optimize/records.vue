<template>
  <div class="rc-page">
    <!-- 头部 -->
    <div class="rc-header">
      <div class="rc-title-block">
        <h2 class="rc-title">发稿记录</h2>
        <p class="rc-desc">把稿件一键分发到 AI 收录的媒体平台 · 每次发布按媒体逐家生成订单，实时回传发布状态与收录链接 · 提交冻结积分，成功扣除、失败全额退回</p>
      </div>
      <div class="rc-header-actions">
        <button class="rc-btn rc-btn--ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
          导出
        </button>
        <button class="rc-btn rc-btn--ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          稿件追踪
        </button>
        <button class="rc-btn rc-btn--indigo" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          发布新稿件
        </button>
      </div>
    </div>

    <!-- 内容卡片 -->
    <div class="rc-card">
      <!-- 筛选栏 -->
      <div class="rc-filter-bar">
        <!-- 搜索框 -->
        <div class="rc-search-wrap">
          <svg class="rc-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          <input class="rc-search-input" type="text" placeholder="搜索稿件、媒体..." />
        </div>

        <!-- 引用情况 -->
        <div class="rc-filter-group">
          <span class="rc-filter-label">引用情况</span>
          <select class="rc-select">
            <option value="all">全部</option>
            <option value="cited">已引用</option>
            <option value="uncited">未引用</option>
          </select>
        </div>

        <!-- 日期选择 -->
        <div class="rc-filter-group">
          <button class="rc-date-btn" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
            <span>全部时间</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>

      <!-- Tabs 栏 -->
      <div class="rc-tabs-bar">
        <div class="rc-tabs">
          <button class="rc-tab" type="button">草稿 <b class="rc-tab-num">0</b></button>
          <button class="rc-tab rc-tab--active" type="button">全部 <b class="rc-tab-num">4</b></button>
          <button class="rc-tab" type="button">发布中 <b class="rc-tab-num">0</b></button>
          <button class="rc-tab" type="button">已发布 <b class="rc-tab-num">3</b></button>
          <button class="rc-tab" type="button">发布失败 <b class="rc-tab-num">1</b></button>
        </div>
        <div class="rc-sort">
          <button class="rc-sort-btn" type="button">
            <span>最新提交</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>

      <!-- 表格 -->
      <div class="rc-table-wrap">
        <table class="rc-table">
          <thead>
            <tr>
              <th class="rc-th rc-th--title">稿件</th>
              <th class="rc-th">发稿媒体</th>
              <th class="rc-th">状态</th>
              <th class="rc-th">发稿链接</th>
              <th class="rc-th">引用情况</th>
              <th class="rc-th">积分</th>
              <th class="rc-th">创建时间</th>
              <th class="rc-th rc-th--action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="rc-tr">
              <td class="rc-td rc-td--title">
                <div class="rc-article-name">非遗豌杂面兵哥豌豆面怎么样？十二年从成都小店到百家连锁</div>
                <div class="rc-order-no">订单 PB202608171622279VDD5E83</div>
              </td>
              <td class="rc-td">中国品牌网</td>
              <td class="rc-td"><span class="rc-status rc-status--ok">已发布</span></td>
              <td class="rc-td"><a class="rc-link" href="https://www.chinapp.com/pinpaijiedu/228898" target="_blank" rel="noopener">https://www.chinapp.com/pinpaijiedu/228898</a></td>
              <td class="rc-td"><span class="rc-cite rc-cite--none">暂无引用</span></td>
              <td class="rc-td"><span class="rc-credit">✦ 850</span></td>
              <td class="rc-td rc-td--time">08-17 16:22</td>
              <td class="rc-td rc-td--action"><button class="rc-action" type="button">预览</button></td>
            </tr>
            <tr class="rc-tr">
              <td class="rc-td rc-td--title">
                <div class="rc-article-name">2026公共座椅行业科普：从行业标准到源头工厂背后的产业逻辑</div>
                <div class="rc-order-no">订单 PB20260814154944SH5GPBYQ</div>
              </td>
              <td class="rc-td">豆丁网</td>
              <td class="rc-td"><span class="rc-status rc-status--fail">发布失败</span></td>
              <td class="rc-td"><span class="rc-fail-reason">失败：媒体id输入错误，找不到对应的媒体，</span></td>
              <td class="rc-td"><span class="rc-cite rc-cite--dash">—</span></td>
              <td class="rc-td"><span class="rc-credit rc-credit--refund">已解冻 ✦140</span></td>
              <td class="rc-td rc-td--time">08-14 15:49</td>
              <td class="rc-td rc-td--action"><button class="rc-action" type="button">预览</button><button class="rc-action rc-action--retry" type="button">重试</button></td>
            </tr>
            <tr class="rc-tr">
              <td class="rc-td rc-td--title">
                <div class="rc-article-name">深耕拉萨特产二十年 罗布麦赞以"正品平价"重塑特产零售新格局</div>
                <div class="rc-order-no">订单 PB20260814152705WAM7JVF1</div>
              </td>
              <td class="rc-td">西藏融媒</td>
              <td class="rc-td"><span class="rc-status rc-status--ok">已发布</span></td>
              <td class="rc-td"><a class="rc-link" href="https://ws.dgsbcn.com/7367.html" target="_blank" rel="noopener">https://ws.dgsbcn.com/7367.html</a></td>
              <td class="rc-td"><span class="rc-cite rc-cite--none">暂无引用</span></td>
              <td class="rc-td"><span class="rc-credit">✦ 120</span></td>
              <td class="rc-td rc-td--time">08-14 15:27</td>
              <td class="rc-td rc-td--action"><button class="rc-action" type="button">预览</button></td>
            </tr>
            <tr class="rc-tr">
              <td class="rc-td rc-td--title">
                <div class="rc-article-name">守一锅鲜汤暖一座城：食家缘汤锅府的六年深耕路</div>
                <div class="rc-order-no">订单 PB202608141520552TN08BHV</div>
              </td>
              <td class="rc-td">西藏融媒</td>
              <td class="rc-td"><span class="rc-status rc-status--ok">已发布</span></td>
              <td class="rc-td"><a class="rc-link" href="https://ws.dgsbcn.com/7365.html" target="_blank" rel="noopener">https://ws.dgsbcn.com/7365.html</a></td>
              <td class="rc-td"><span class="rc-cite rc-cite--none">暂无引用</span></td>
              <td class="rc-td"><span class="rc-credit">✦ 120</span></td>
              <td class="rc-td rc-td--time">08-14 15:20</td>
              <td class="rc-td rc-td--action"><button class="rc-action" type="button">预览</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="rc-pagination">
        <span class="rc-page-info">显示 1-4 · 共 4 条</span>
        <div class="rc-page-controls">
          <button class="rc-page-btn rc-page-btn--nav" type="button" disabled>‹ 上一页</button>
          <button class="rc-page-btn rc-page-btn--active" type="button">1</button>
          <button class="rc-page-btn rc-page-btn--nav" type="button">下一页 ›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 发稿记录页面
</script>

<style lang="scss" scoped>
/* ===================================================
   优化 - 发稿记录 (像素级复刻)
   对标: geo.timus.cn/dashboard/publish-records

   精确色值:
   主文本 #0f1115 / 次文本 #5b606a / 元文本 #8a8f9b
   边框 #e6e8ee / 浅边框 #f0f1f6 / 表头背景 #f5f6fa
   紫色 #6452ff / 紫底 #efecff
   成功绿 #16a34a / 失败红 #dc2626
   卡片白底 #fff / 页面背景 #f8fafc / 圆角 14px
   阴影 rgba(16,18,30,0.04) 0px 2px 10px 0px
   =================================================== */

.rc-page {
  margin: -16px auto -16px;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  max-width: 1240px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
  font-size: 16px;
}

/* ====== 头部 ====== */
.rc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.rc-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rc-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.rc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid;
  transition: background 0.15s;
}

.rc-btn--ghost {
  color: #2a2d36;
  background: #fff;
  border-color: #e6e8ee;
  &:hover { background: #f5f6fa; }
}

.rc-btn--indigo {
  color: #6452ff;
  background: #efecff;
  border-color: #6452ff;
  &:hover { background: #e6e0ff; }
}

.rc-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f1115;
  line-height: 33px;
  letter-spacing: -0.3px;
}

.rc-desc {
  margin: 0;
  font-size: 12.5px;
  font-weight: 400;
  color: #5b606a;
  line-height: 18.75px;
}

/* ====== 内容卡片 ====== */
.rc-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ====== 筛选栏 ====== */
.rc-filter-bar {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f1f6;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.rc-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.rc-search-icon {
  position: absolute;
  left: 10px;
  color: #8a8f9b;
  pointer-events: none;
}

.rc-search-input {
  width: 100%;
  height: 36px;
  padding: 0 10px 0 32px;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  background: #f8fafc;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;

  &::placeholder { color: #8a8f9b; }
  &:focus { border-color: #6452ff; background: #fff; }
}

.rc-filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rc-filter-label {
  font-size: 12.5px;
  font-weight: 500;
  color: #5b606a;
  white-space: nowrap;
}

.rc-select {
  height: 36px;
  padding: 0 28px 0 10px;
  font-size: 13px;
  font-weight: 400;
  color: #2a2d36;
  background: #f8fafc;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8f9b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;

  &:hover { border-color: #c7d2fe; }
}

.rc-date-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 400;
  color: #2a2d36;
  background: #f8fafc;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;

  svg { color: #8a8f9b; }
  &:hover { border-color: #c7d2fe; }
}

/* ====== Tabs 栏 ====== */
.rc-tabs-bar {
  padding: 0 20px;
  border-bottom: 1px solid #e6e8ee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.rc-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rc-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 42px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: #5b606a;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s, border-color 0.15s;

  &:hover { color: #0f1115; }
}

.rc-tab--active {
  color: #0f1115;
  font-weight: 700;
  border-bottom-color: #0f1115;
}

.rc-tab-num {
  font-size: 12px;
  font-weight: 600;
  color: #8a8f9b;
}

.rc-tab--active .rc-tab-num {
  color: #0f1115;
}

.rc-sort {
  display: flex;
  align-items: center;
}

.rc-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 400;
  color: #5b606a;
  background: transparent;
  border: 1px solid #e6e8ee;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;

  svg { color: #8a8f9b; }
  &:hover { color: #0f1115; border-color: #c7d2fe; }
}

/* ====== 表格 ====== */
.rc-table-wrap {
  overflow-x: auto;
}

.rc-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.rc-th {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #5b606a;
  text-align: left;
  background: #f5f6fa;
  border-bottom: 1px solid #e6e8ee;
  white-space: nowrap;
}

.rc-th--title { width: 28%; }
.rc-th--action { width: 90px; text-align: right; }

.rc-tr {
  border-bottom: 1px solid #f0f1f6;
  transition: background 0.15s;

  &:hover { background: #fafbfc; }
  &:last-child { border-bottom: none; }
}

.rc-td {
  padding: 12px 12px;
  font-size: 13px;
  font-weight: 400;
  color: #2a2d36;
  vertical-align: middle;
  word-break: break-word;
}

.rc-td--title {
  font-size: 13px;
  font-weight: 500;
  color: #0f1115;
  line-height: 20px;
}

.rc-article-name {
  font-size: 13px;
  font-weight: 500;
  color: #0f1115;
  line-height: 20px;
}

.rc-order-no {
  font-size: 11.5px;
  font-weight: 400;
  color: #8a8f9b;
  line-height: 17px;
  margin-top: 2px;
}

.rc-td--time {
  font-size: 12px;
  color: #8a8f9b;
  white-space: nowrap;
}

.rc-td--action {
  text-align: right;
  white-space: nowrap;
}

/* 状态标签 */
.rc-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.rc-status--ok {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.rc-status--fail {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

/* 链接 */
.rc-link {
  font-size: 12px;
  font-weight: 400;
  color: #6452ff;
  text-decoration: none;
  word-break: break-all;
  &:hover { text-decoration: underline; }
}

.rc-fail-reason {
  font-size: 12px;
  font-weight: 400;
  color: #dc2626;
  line-height: 18px;
}

/* 引用情况 */
.rc-cite {
  font-size: 12px;
  font-weight: 400;
}

.rc-cite--none { color: #8a8f9b; }
.rc-cite--dash { color: #c5c8d0; }

/* 积分 */
.rc-credit {
  font-size: 12px;
  font-weight: 600;
  color: #6452ff;
  white-space: nowrap;
}

.rc-credit--refund {
  color: #8a8f9b;
  font-weight: 400;
}

/* 操作按钮 */
.rc-action {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: #6452ff;
  background: #efecff;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  margin-left: 4px;

  &:hover { background: #e6e0ff; }
}

.rc-action--retry {
  color: #dc2626;
  background: #fef2f2;

  &:hover { background: #fee2e2; }
}

/* ====== 分页 ====== */
.rc-pagination {
  padding: 12px 20px;
  border-top: 1px solid #f0f1f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.rc-page-info {
  font-size: 12px;
  font-weight: 400;
  color: #8a8f9b;
}

.rc-page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rc-page-btn {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 400;
  color: #5b606a;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;

  &:hover:not(:disabled):not(.rc-page-btn--active) {
    color: #0f1115;
    border-color: #c7d2fe;
  }

  &:disabled {
    color: #c5c8d0;
    cursor: not-allowed;
  }
}

.rc-page-btn--active {
  color: #fff;
  background: #0f1115;
  border-color: #0f1115;
  font-weight: 600;
}

.rc-page-btn--nav {
  padding: 0 12px;
}
</style>
