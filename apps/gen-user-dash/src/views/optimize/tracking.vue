<template>
  <div class="tk-page">
    <!-- 头部 -->
    <div class="tk-header">
      <div class="tk-title-block">
        <h2 class="tk-title">稿件追踪</h2>
        <p class="tk-desc">已上线文章统一台账（手动登记 + 发稿自动同步），持续追踪每一篇在 AI 回答中的被引表现；创作中稿件请见「稿件库」</p>
      </div>
      <div class="tk-header-actions">
        <button class="tk-btn tk-btn--ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          发稿记录
        </button>
        <button class="tk-btn tk-btn--indigo" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          新建稿件
        </button>
        <button class="tk-btn tk-btn--ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
          导出
        </button>
        <button class="tk-btn tk-btn--ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
          导入自有文章
        </button>
      </div>
    </div>

    <!-- 日期筛选行（独立） -->
    <div class="tk-date-row">
      <span class="tk-date-label">引用统计周期</span>
      <input class="tk-date-input" type="text" value="2026-07-31" readonly />
      <span class="tk-date-sep">至</span>
      <input class="tk-date-input" type="text" value="2026-08-29" readonly />
      <span class="tk-date-hint">（默认最近 30 天，最长 31 天；仅按引用发生时间统计，不影响已导入稿件展示）</span>
    </div>

    <!-- 统计卡片（独立） -->
    <div class="tk-stats">
      <div class="tk-stat-card">
        <span class="tk-stat-label">全部已导入稿件</span>
        <div class="tk-stat-value"><b class="tk-stat-num">7</b><span class="tk-stat-unit">篇</span></div>
      </div>
      <div class="tk-stat-card">
        <span class="tk-stat-label">周期内被 AI 引用文章数</span>
        <div class="tk-stat-value"><b class="tk-stat-num">4</b><span class="tk-stat-unit">篇 · <span class="tk-stat-pct">57%</span></span></div>
      </div>
      <div class="tk-stat-card">
        <span class="tk-stat-label">周期内被引次数</span>
        <div class="tk-stat-value"><b class="tk-stat-num">199</b><span class="tk-stat-unit">次</span></div>
      </div>
    </div>

    <!-- 内容卡片 -->
    <div class="tk-card">
      <!-- 筛选栏 -->
      <div class="tk-filter-bar">
        <div class="tk-filter-group">
          <select class="tk-select">
            <option value="all">全部</option>
            <option value="rank">排行词</option>
            <option value="koubei">口碑词</option>
          </select>
        </div>

        <div class="tk-filter-group">
          <select class="tk-select">
            <option value="all">全部</option>
            <option value="doubao">豆包</option>
            <option value="wenxin">文心一言</option>
            <option value="deepseek">DeepSeek</option>
            <option value="qwen">通义千问</option>
            <option value="yuanbao">元宝</option>
          </select>
        </div>

        <div class="tk-filter-group">
          <button class="tk-select-btn" type="button">
            <span>全部问题</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <div class="tk-filter-group">
          <select class="tk-select">
            <option value="all">全部</option>
            <option value="manual">手动登记</option>
            <option value="sync">发稿同步</option>
          </select>
        </div>

        <div class="tk-filter-group">
          <select class="tk-select">
            <option value="all">全部</option>
            <option value="cited">已引用</option>
            <option value="uncited">未引用</option>
          </select>
        </div>

        <div class="tk-search-wrap">
          <svg class="tk-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          <input class="tk-search-input" type="text" placeholder="搜索标题 / URL…" />
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="tk-toolbar">
        <div class="tk-toolbar-left">
          <button class="tk-sort-btn tk-sort-btn--active" type="button">
            登记时间
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <button class="tk-sort-btn" type="button">
            被引
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5"/></svg>
          </button>
        </div>
      </div>

      <!-- 表格 -->
      <div class="tk-table-wrap">
        <table class="tk-table">
          <thead>
            <tr>
              <th class="tk-th tk-th--article">文章</th>
              <th class="tk-th">来源</th>
              <th class="tk-th">登记时间</th>
              <th class="tk-th">被引</th>
              <th class="tk-th">收录引擎</th>
              <th class="tk-th">引用状态</th>
              <th class="tk-th">引用明细</th>
              <th class="tk-th tk-th--action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="tk-tr">
              <td class="tk-td tk-td--article">
                <div class="tk-article-title">礼堂椅 · 影院椅怎么选？2026 五大主流品牌推荐 · 宏祥盛誉 · 鸿基家具 · 郦江科创 · 康迪 · 大丰</div>
                <a class="tk-article-url" href="https://www.iesdouyin.com/share/video/7670667836927778469" target="_blank" rel="noopener">https://www.iesdouyin.com/share/video/7670667836927778469</a>
              </td>
              <td class="tk-td"><span class="tk-source tk-source--manual">登记</span></td>
              <td class="tk-td tk-td--time">2026-08-19</td>
              <td class="tk-td"><span class="tk-cite-count">74 次</span></td>
              <td class="tk-td"><span class="tk-engine">1/5</span></td>
              <td class="tk-td"><span class="tk-status tk-status--cited">已引用</span></td>
              <td class="tk-td"><button class="tk-detail-btn" type="button">查看明细</button></td>
              <td class="tk-td tk-td--action"></td>
            </tr>
            <tr class="tk-tr">
              <td class="tk-td tk-td--article">
                <div class="tk-article-title">礼堂椅影院椅怎么选？2026 十大主流品牌推荐</div>
                <a class="tk-article-url" href="https://www.iesdouyin.com/share/video/7668251616918719784" target="_blank" rel="noopener">https://www.iesdouyin.com/share/video/7668251616918719784</a>
              </td>
              <td class="tk-td"><span class="tk-source tk-source--manual">登记</span></td>
              <td class="tk-td tk-td--time">2026-08-19</td>
              <td class="tk-td"><span class="tk-cite-count">63 次</span></td>
              <td class="tk-td"><span class="tk-engine">1/5</span></td>
              <td class="tk-td"><span class="tk-status tk-status--cited">已引用</span></td>
              <td class="tk-td"><button class="tk-detail-btn" type="button">查看明细</button></td>
              <td class="tk-td tk-td--action"></td>
            </tr>
            <tr class="tk-tr">
              <td class="tk-td tk-td--article">
                <div class="tk-article-title">宏祥盛誉 | 佛山公共座椅源头生产厂家</div>
                <a class="tk-article-url" href="https://www.iesdouyin.com/share/video/7667955539053219091" target="_blank" rel="noopener">https://www.iesdouyin.com/share/video/7667955539053219091</a>
              </td>
              <td class="tk-td"><span class="tk-source tk-source--manual">登记</span></td>
              <td class="tk-td tk-td--time">2026-08-19</td>
              <td class="tk-td"><span class="tk-cite-count">39 次</span></td>
              <td class="tk-td"><span class="tk-engine">1/5</span></td>
              <td class="tk-td"><span class="tk-status tk-status--cited">已引用</span></td>
              <td class="tk-td"><button class="tk-detail-btn" type="button">查看明细</button></td>
              <td class="tk-td tk-td--action"></td>
            </tr>
            <tr class="tk-tr">
              <td class="tk-td tk-td--article">
                <div class="tk-article-title">佛山宏祥盛誉—公共座椅源头工厂的品质标杆—礼堂椅课桌椅影院椅</div>
                <a class="tk-article-url" href="https://www.iesdouyin.com/share/video/7672951121475882249" target="_blank" rel="noopener">https://www.iesdouyin.com/share/video/7672951121475882249</a>
              </td>
              <td class="tk-td"><span class="tk-source tk-source--manual">登记</span></td>
              <td class="tk-td tk-td--time">2026-08-19</td>
              <td class="tk-td"><span class="tk-cite-count">23 次</span></td>
              <td class="tk-td"><span class="tk-engine">1/5</span></td>
              <td class="tk-td"><span class="tk-status tk-status--cited">已引用</span></td>
              <td class="tk-td"><button class="tk-detail-btn" type="button">查看明细</button></td>
              <td class="tk-td tk-td--action"></td>
            </tr>
            <tr class="tk-tr">
              <td class="tk-td tk-td--article">
                <div class="tk-article-title">非遗豌杂面兵哥豌豆面怎么样？十二年从成都小店到百家连锁</div>
                <a class="tk-article-url" href="https://www.chinapp.com/pinpaijiedu/228898" target="_blank" rel="noopener">https://www.chinapp.com/pinpaijiedu/228898</a>
              </td>
              <td class="tk-td"><span class="tk-source tk-source--sync">发稿</span></td>
              <td class="tk-td tk-td--time">2026-08-17</td>
              <td class="tk-td"><span class="tk-cite-count tk-cite-count--zero">0 次</span></td>
              <td class="tk-td"><span class="tk-engine tk-engine--zero">0/5</span></td>
              <td class="tk-td"><span class="tk-status tk-status--uncited">未引用</span></td>
              <td class="tk-td"><button class="tk-detail-btn" type="button">查看明细</button></td>
              <td class="tk-td tk-td--action"></td>
            </tr>
            <tr class="tk-tr">
              <td class="tk-td tk-td--article">
                <div class="tk-article-title">深耕拉萨特产二十年 罗布麦赞以"正品平价"重塑特产零售新格局</div>
                <a class="tk-article-url" href="https://ws.dgsbcn.com/7367.html" target="_blank" rel="noopener">https://ws.dgsbcn.com/7367.html</a>
              </td>
              <td class="tk-td"><span class="tk-source tk-source--sync">发稿</span></td>
              <td class="tk-td tk-td--time">2026-08-14</td>
              <td class="tk-td"><span class="tk-cite-count tk-cite-count--zero">0 次</span></td>
              <td class="tk-td"><span class="tk-engine tk-engine--zero">0/5</span></td>
              <td class="tk-td"><span class="tk-status tk-status--uncited">未引用</span></td>
              <td class="tk-td"><button class="tk-detail-btn" type="button">查看明细</button></td>
              <td class="tk-td tk-td--action"></td>
            </tr>
            <tr class="tk-tr">
              <td class="tk-td tk-td--article">
                <div class="tk-article-title">守一锅鲜汤暖一座城：食家缘汤锅府的六年深耕路</div>
                <a class="tk-article-url" href="https://ws.dgsbcn.com/7365.html" target="_blank" rel="noopener">https://ws.dgsbcn.com/7365.html</a>
              </td>
              <td class="tk-td"><span class="tk-source tk-source--sync">发稿</span></td>
              <td class="tk-td tk-td--time">2026-08-14</td>
              <td class="tk-td"><span class="tk-cite-count tk-cite-count--zero">0 次</span></td>
              <td class="tk-td"><span class="tk-engine tk-engine--zero">0/5</span></td>
              <td class="tk-td"><span class="tk-status tk-status--uncited">未引用</span></td>
              <td class="tk-td"><button class="tk-detail-btn" type="button">查看明细</button></td>
              <td class="tk-td tk-td--action"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 稿件追踪页面
</script>

<style lang="scss" scoped>
/* ===================================================
   优化 - 稿件追踪 (像素级复刻)
   对标: geo.timus.cn/dashboard/article-library

   精确色值:
   主文本 #1e293b / 次文本 #64748b / 元文本 #94a3b8
   边框 #e2e8f0 / 浅边框 #f1f5f9 / 表头背景 #f8fafc
   紫色 #6452ff / 紫底 #efecff
   成功绿 #16a34a / 失败灰 #94a3b8
   卡片白底 #fff / 页面背景 #f8fafc / 圆角 14px
   阴影 rgba(16,18,30,0.04) 0px 2px 10px 0px
   =================================================== */

.tk-page {
  margin: -16px auto -16px;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  max-width: 1240px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #1e293b;
  font-size: 16px;
}

/* ====== 头部 ====== */
.tk-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: nowrap;
}

.tk-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.tk-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  line-height: 32px;
  letter-spacing: -0.5px;
}

.tk-desc {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  line-height: 18px;
}

.tk-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.tk-btn {
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

.tk-btn--ghost {
  color: #1e293b;
  background: #fff;
  border-color: #e2e8f0;
  &:hover { background: #f8fafc; }
}

.tk-btn--indigo {
  color: #6452ff;
  background: #efecff;
  border-color: #6452ff;
  &:hover { background: #e6e0ff; }
}

/* ====== 日期筛选行（独立） ====== */
.tk-date-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tk-date-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

.tk-date-hint {
  font-size: 11.5px;
  font-weight: 400;
  color: #94a3b8;
  line-height: 17px;
}

/* ====== 统计卡片 ====== */
.tk-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tk-stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tk-stat-label {
  font-size: 12.5px;
  font-weight: 500;
  color: #64748b;
  line-height: 18px;
}

.tk-stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.tk-stat-num {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  line-height: 34px;
}

.tk-stat-unit {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.tk-stat-pct {
  color: #6452ff;
  font-weight: 700;
}

/* ====== 内容卡片 ====== */
.tk-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ====== 筛选栏 ====== */
.tk-filter-bar {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tk-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 180px;
  max-width: 280px;
  margin-left: auto;
}

.tk-search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
}

.tk-search-input {
  width: 100%;
  height: 34px;
  padding: 0 10px 0 32px;
  font-size: 13px;
  font-weight: 400;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  font-family: inherit;

  &::placeholder { color: #94a3b8; }
  &:focus { border-color: #6452ff; background: #fff; }
}

.tk-filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tk-select {
  height: 34px;
  padding: 0 28px 0 10px;
  font-size: 12.5px;
  font-weight: 400;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;

  &:hover { border-color: #c7d2fe; }
}

.tk-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 10px;
  font-size: 12.5px;
  font-weight: 400;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;

  svg { color: #94a3b8; }
  &:hover { border-color: #c7d2fe; }
}

.tk-date-input {
  width: 110px;
  height: 34px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 400;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  text-align: center;
  cursor: pointer;
}

.tk-date-sep {
  font-size: 12px;
  color: #94a3b8;
}

/* ====== 工具栏 ====== */
.tk-toolbar {
  padding: 0 20px;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tk-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tk-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 38px;
  padding: 0 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;

  svg { color: #94a3b8; }
  &:hover { color: #1e293b; }
}

.tk-sort-btn--active {
  color: #1e293b;
  font-weight: 700;

  svg { color: #6452ff; }
}

/* ====== 表格 ====== */
.tk-table-wrap {
  overflow-x: auto;
}

.tk-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.tk-th {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-align: left;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.tk-th--article { width: 38%; }
.tk-th--action { width: 60px; }

.tk-tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;

  &:hover { background: #fafbfc; }
  &:last-child { border-bottom: none; }
}

.tk-td {
  padding: 12px 12px;
  font-size: 13px;
  font-weight: 400;
  color: #1e293b;
  vertical-align: middle;
  word-break: break-word;
}

.tk-td--time {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.tk-td--action {
  text-align: right;
}

.tk-article-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tk-article-url {
  display: block;
  font-size: 11.5px;
  font-weight: 400;
  color: #6452ff;
  text-decoration: none;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover { text-decoration: underline; }
}

/* 来源标签 */
.tk-source {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.tk-source--manual {
  color: #6452ff;
  background: #efecff;
}

.tk-source--sync {
  color: #1e293b;
  background: #f1f5f9;
}

/* 被引次数 */
.tk-cite-count {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.tk-cite-count--zero {
  color: #94a3b8;
  font-weight: 400;
}

/* 收录引擎 */
.tk-engine {
  font-size: 12px;
  font-weight: 600;
  color: #6452ff;
}

.tk-engine--zero {
  color: #94a3b8;
  font-weight: 400;
}

/* 引用状态 */
.tk-status {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.tk-status--cited {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.tk-status--uncited {
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

/* 查看明细按钮 */
.tk-detail-btn {
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

  &:hover { background: #e6e0ff; }
}
</style>
