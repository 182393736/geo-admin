<template>
  <div class="sa-page">
    <!-- 头部 -->
    <div class="sa-header">
      <div class="sa-title-block">
        <h2 class="sa-title">AI 口碑分析</h2>
        <div class="sa-desc-row">
          <span class="sa-desc-text">定性分析 AI 回答内容的语义理解与情感倾向</span>
        </div>
      </div>
      <div class="sa-header-btns">
        <button class="sa-btn sa-btn--indigo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
          导出
        </button>
        <button class="sa-btn sa-btn--gray">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
          管理监控问题
        </button>
      </div>
    </div>

    <!-- 卡片1：筛选区 -->
    <div class="sa-card sa-filter-card">
      <!-- 问题行 -->
      <div class="sa-question-row">
        <div class="sa-filter-label sa-filter-label--question">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
          <span>问题:</span>
        </div>
        <div class="sa-question-tags">
          <button class="sa-question-tag sa-question-tag--active">宏祥盛誉怎么样，口碑好不好</button>
        </div>
        <button class="sa-expand-btn">
          展开全部
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      <!-- 平台 + 日期行 -->
      <div class="sa-filter-row2">
        <div class="sa-filter-group">
          <div class="sa-filter-label sa-filter-label--platform">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            <span>AI平台:</span>
          </div>
          <button class="sa-select sa-select--platform" type="button">
            <span>综合评价</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
        <div class="sa-filter-group">
          <div class="sa-filter-label sa-filter-label--date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            <span>日期:</span>
          </div>
          <button class="sa-select sa-select--date" type="button">
            <span class="sa-date-range">
              <span>2026-08-22</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              <span>2026-08-28</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 卡片2：图表区（饼图 + 走势图） -->
    <div class="sa-card sa-chart-card">
      <div class="sa-chart-grid">
        <!-- 情感倾向分布 -->
        <div class="sa-donut-panel">
          <div class="sa-donut-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #4f46e5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <h3 class="sa-panel-h3">情感倾向分布</h3>
          </div>
          <div class="sa-donut-chart">
            <svg viewBox="0 0 211 180" width="100%" height="180">
              <!-- Sector 1: 正面评价 (Positive) - #10B981 -->
              <path stroke="none" fill="#10B981" d="M 176.3872,90 A4,4,0,0,0,180.3809,85.7746 A75,75,0,0,0,30.5016,89.5031 A4,4,0,0,0,34.7004,93.5246 L46.7086,92.9268 A4,4,0,0,0,50.509,89.0042 A55,55,0,0,1,160.3735,86.2712 A4,4,0,0,0,164.3643,90 Z"/>
              <!-- Sector 2: 中性描述 (Neutral) - #94A3B8 -->
              <path stroke="none" fill="#94A3B8" d="M 35.277,99.6818 A4,4,0,0,0,31.8979,104.413 A75,75,0,0,0,115.6402,164.3113 A4,4,0,0,0,119.0259,159.5848 L116.7318,147.7827 A4,4,0,0,0,112.31,144.5768 A55,55,0,0,1,51.65,101.1885 A4,4,0,0,0,47.1874,98.0397 Z"/>
              <!-- Sector 3: 负面反馈 (Negative) - #F43F5E -->
              <path stroke="none" fill="#F43F5E" d="M 125.0392,158.1412 A4,4,0,0,0,130.2016,160.8155 A75,75,0,0,0,179.7277,100.7356 A4,4,0,0,0,176.1175,96.1782 L164.1403,95.1304 A4,4,0,0,0,159.8397,98.4972 A55,55,0,0,1,124.2095,141.7199 A4,4,0,0,0,121.7252,146.5839 Z"/>
            </svg>
            <div class="sa-donut-center">
              <span class="sa-donut-center-main">高风险</span>
              <span class="sa-donut-center-sub">综合评级</span>
            </div>
          </div>
          <div class="sa-legend">
            <div class="sa-legend-item" v-for="item in sentimentDistribution" :key="item.label">
              <div class="sa-legend-left">
                <span class="sa-legend-dot" :style="{ backgroundColor: item.color }"></span>
                <span class="sa-legend-label">{{ item.label }}</span>
              </div>
              <span class="sa-legend-value">{{ item.value }}%</span>
            </div>
          </div>
        </div>

        <!-- 情感走势 -->
        <div class="sa-trend-panel">
          <div class="sa-trend-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #4f46e5"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>
            <h3 class="sa-panel-h3">情感走势</h3>
          </div>
          <div class="sa-trend-chart">
            <svg viewBox="0 0 495 290" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#10B981" stop-opacity="0.1"/>
                  <stop offset="95%" stop-color="#10B981" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- Grid lines (dashed) -->
              <line x1="30" y1="10" x2="485" y2="10" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3"/>
              <line x1="30" y1="72.5" x2="485" y2="72.5" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3"/>
              <line x1="30" y1="135" x2="485" y2="135" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3"/>
              <line x1="30" y1="197.5" x2="485" y2="197.5" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3"/>
              <line x1="30" y1="260" x2="485" y2="260" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3"/>
              <!-- Y-axis labels -->
              <text x="22" y="263" font-size="10" fill="#94a3b8" text-anchor="end">0</text>
              <text x="22" y="200.5" font-size="10" fill="#94a3b8" text-anchor="end">25</text>
              <text x="22" y="138" font-size="10" fill="#94a3b8" text-anchor="end">50</text>
              <text x="22" y="75.5" font-size="10" fill="#94a3b8" text-anchor="end">75</text>
              <text x="22" y="13" font-size="10" fill="#94a3b8" text-anchor="end">100</text>
              <!-- Area fill -->
              <path stroke-width="2" fill="url(#colorSentiment)" fill-opacity="0.6" stroke="none" d="M30,75 C55.278,75 80.556,75 105.833,75 C131.111,75 156.389,75 181.667,75 C206.944,75 232.222,75 257.5,75 C282.778,75 308.056,75 333.333,75 C358.611,75 383.889,55 409.167,55 C434.444,55 459.722,70 485,85 L485,260 C459.722,260 434.444,260 409.167,260 C383.889,260 358.611,260 333.333,260 C308.056,260 282.778,260 257.5,260 C232.222,260 206.944,260 181.667,260 C156.389,260 131.111,260 105.833,260 C80.556,260 55.278,260 30,260 Z"/>
              <!-- Line curve -->
              <path stroke-width="2" fill="none" stroke="#10B981" d="M30,75 C55.278,75 80.556,75 105.833,75 C131.111,75 156.389,75 181.667,75 C206.944,75 232.222,75 257.5,75 C282.778,75 308.056,75 333.333,75 C358.611,75 383.889,55 409.167,55 C434.444,55 459.722,70 485,85"/>
              <!-- X-axis labels -->
              <text x="30" y="278" font-size="11" fill="#94a3b8" text-anchor="middle">08-22</text>
              <text x="105.833" y="278" font-size="11" fill="#94a3b8" text-anchor="middle">08-23</text>
              <text x="181.667" y="278" font-size="11" fill="#94a3b8" text-anchor="middle">08-24</text>
              <text x="257.5" y="278" font-size="11" fill="#94a3b8" text-anchor="middle">08-25</text>
              <text x="333.333" y="278" font-size="11" fill="#94a3b8" text-anchor="middle">08-26</text>
              <text x="409.167" y="278" font-size="11" fill="#94a3b8" text-anchor="middle">08-27</text>
              <text x="479.023" y="278" font-size="11" fill="#94a3b8" text-anchor="middle">08-28</text>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片3：关键词 + 引用 -->
    <div class="sa-card sa-keyword-citation">
      <!-- 左：关键词 -->
      <div class="sa-keyword-panel">
        <div class="sa-tabs">
          <button class="sa-tab sa-tab--positive sa-tab--active">正面评价</button>
          <button class="sa-tab sa-tab--neutral">中性描述</button>
          <button class="sa-tab sa-tab--negative">负面反馈</button>
        </div>
        <div class="sa-keyword-list">
          <button
            v-for="(kw, idx) in sentimentKeywords.positive"
            :key="kw.keyword"
            class="sa-keyword-tag"
            :class="{ 'sa-keyword-tag--active': idx === 0 }"
          >
            <span class="sa-keyword-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>
              {{ kw.keyword }}
            </span>
            <span class="sa-keyword-count" :class="{ 'sa-keyword-count--active': idx === 0 }">{{ kw.count }}次</span>
          </button>
        </div>
      </div>
      <!-- 右：引用 -->
      <div class="sa-citation-panel">
        <div class="sa-citation-header">
          <div class="sa-citation-col-platform">平台</div>
          <div class="sa-citation-col-text">大模型原文引用</div>
        </div>
        <div class="sa-citation-list">
          <div class="sa-citation-row" v-for="(cite, idx) in sentimentCitations" :key="idx">
            <div class="sa-citation-platform">
              <span class="sa-platform-badge">{{ cite.platform }}</span>
            </div>
            <div class="sa-citation-text">
              <svg class="sa-quote-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>
              <span class="sa-citation-text-content">{{ cite.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片4：全景口碑矩阵 -->
    <div class="sa-card sa-matrix-card">
      <div class="sa-matrix-header">
        <div class="sa-matrix-title-block">
          <div class="sa-matrix-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/></svg>
          </div>
          <div>
            <h3 class="sa-matrix-title">全景口碑矩阵</h3>
            <p class="sa-matrix-desc">监控 <span class="sa-matrix-highlight">口碑健康度</span>，并对比各平台情感分 · 2026-08-28</p>
          </div>
        </div>
        <div class="sa-matrix-actions">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #9ca3af"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          <input class="sa-matrix-date" type="date" value="2026-08-28" max="2026-08-28" />
          <button class="sa-matrix-export">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
            导出
          </button>
        </div>
      </div>
      <div class="sa-matrix-table-wrap">
        <table class="sa-matrix-table">
          <thead>
            <tr>
              <th class="sa-mt-th sa-mt-th--question">监控问题</th>
              <th class="sa-mt-th sa-mt-th--health">综合健康度 (含7日趋势)</th>
              <th class="sa-mt-th sa-mt-th--risk">风险评级</th>
              <th class="sa-mt-th sa-mt-th--platforms">
                <div class="sa-mt-platforms-header">
                  <span class="sa-mt-platform-name" v-for="p in sentimentMatrix.platforms" :key="p">{{ p }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in sentimentMatrix.rows" :key="idx" class="sa-mt-tr">
              <td class="sa-mt-td sa-mt-td--question">
                <div class="sa-mt-question-text">{{ row.question }}</div>
              </td>
              <td class="sa-mt-td sa-mt-td--health">
                <div class="sa-mt-health">
                  <span class="sa-mt-score sa-mt-score--amber">{{ row.healthScore }}</span>
                  <svg class="sa-mt-trend-down" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/></svg>
                </div>
              </td>
              <td class="sa-mt-td sa-mt-td--risk">
                <span class="sa-mt-risk sa-mt-risk--amber">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  {{ row.riskLevel }}
                </span>
              </td>
              <td class="sa-mt-td sa-mt-td--platforms">
                <div class="sa-mt-platforms">
                  <div
                    v-for="(score, si) in row.scores"
                    :key="si"
                    class="sa-mt-platform-score"
                    :class="score.type === 'green' ? 'sa-mt-score--green' : 'sa-mt-score--red'"
                  >{{ score.value }}</div>
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
import {
  sentimentDistribution,
  sentimentKeywords,
  sentimentCitations,
  sentimentMatrix,
} from '@/mock/data';
</script>

<style lang="scss" scoped>
/* ============ AI 口碑分析 ============ */
.sa-page {
  margin: -16px -24px;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  max-width: 1240px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

.sa-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
  }
}

.sa-title-block {
  display: flex;
  flex-direction: column;
}

.sa-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.6px;
  margin: 0;
  line-height: 1.2;
}

.sa-desc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.sa-desc-text {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
  line-height: 20px;
}

.sa-header-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sa-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  border: 1px solid;
  background: #fff;
  flex-shrink: 0;
}

.sa-btn--indigo {
  color: #6366f1;
  border-color: #c7d2fe;

  &:hover {
    background: #eef2ff;
  }
}

.sa-btn--gray {
  color: #475569;
  border-color: #e2e8f0;

  &:hover {
    background: #f8fafc;
  }
}

/* ============ 通用卡片 ============ */
.sa-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* ============ 卡片1：筛选区 ============ */
.sa-filter-card {
  display: flex;
  flex-direction: column;
}

.sa-question-row {
  width: 100%;
  padding: 16px 24px 8px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.sa-filter-label {
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

.sa-filter-label--question {
  width: 60px;
  margin-top: 8px;
  justify-content: flex-start;
}

.sa-filter-label--platform {
  width: 70px;
  justify-content: flex-start;
}

.sa-filter-label--date {
  justify-content: flex-start;
}

.sa-question-tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 30px;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

.sa-question-tag {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s;
  border: 1px solid;
  cursor: pointer;
}

.sa-question-tag--active {
  background: #1e293b;
  color: #fff;
  border-color: #1e293b;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.sa-expand-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;

  &:hover {
    background: #eef2ff;
  }
}

.sa-filter-row2 {
  width: 100%;
  padding: 12px 24px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.sa-filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sa-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: border-color 0.15s;
  font-weight: 600;
  color: #475569;

  &:hover {
    border-color: #a5b4fc;
  }
}

.sa-select--platform {
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  min-width: 130px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.sa-select--date {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #1e293b;
  border-color: #1e293b;
  min-width: 220px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.sa-date-range {
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: rgba(255, 255, 255, 0.7);
  }
}

/* ============ 卡片2：图表区 ============ */
.sa-chart-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.sa-chart-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 4fr 8fr;
  }
}

.sa-panel-h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* 情感倾向分布 */
.sa-donut-panel {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 320px;
}

.sa-donut-title {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sa-donut-chart {
  height: 180px;
  width: 100%;
  margin-top: 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sa-donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}

.sa-donut-center-main {
  font-size: 20px;
  font-weight: 800;
  color: #e11d48;
  line-height: 1;
}

.sa-donut-center-sub {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.sa-legend {
  width: 100%;
  padding: 18px 18px 10px;
  margin-top: 16px;
}

.sa-legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;

  &:last-child {
    border-bottom: 0;
  }
}

.sa-legend-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sa-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sa-legend-label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.sa-legend-value {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

/* 情感走势 */
.sa-trend-panel {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.sa-trend-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.sa-trend-chart {
  flex: 1;
  width: 100%;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: block;
  }
}

/* ============ 卡片3：关键词 + 引用 ============ */
.sa-keyword-citation {
  display: flex;
  flex-direction: column;
  height: 340px;
  overflow: hidden;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
}

.sa-keyword-panel {
  border-right: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(248, 250, 252, 0.2);

  @media (min-width: 1024px) {
    width: 33.333%;
  }
}

.sa-tabs {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sa-tab {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s;
  border: 1px solid;
  cursor: pointer;
}

.sa-tab--positive {
  &.sa-tab--active {
    background: #059669;
    color: #fff;
    border-color: #059669;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:not(.sa-tab--active) {
    background: #f8fafc;
    color: #475569;
    border-color: #e2e8f0;

    &:hover {
      background: #f1f5f9;
    }
  }
}

.sa-tab--neutral {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;

  &:hover {
    background: #f1f5f9;
  }
}

.sa-tab--negative {
  background: #fff1f2;
  color: #e11d48;
  border-color: #fecdd3;

  &:hover {
    background: #ffe4e6;
  }
}

.sa-keyword-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.sa-keyword-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #059669;
  background: #fff;
  border: 1px solid #d1fae5;
  opacity: 0.9;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 1;
  }
}

.sa-keyword-tag--active {
  opacity: 1;
  box-shadow: 0 0 0 1px #fff, 0 0 0 3px #6366f1, 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.sa-keyword-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sa-keyword-count {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #fefce8;
  color: #ca8a04;
  transition: background 0.15s;
}

.sa-keyword-count--active {
  background: #eef2ff;
  color: #6366f1;
}

/* 引用面板 */
.sa-citation-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;

  @media (min-width: 1024px) {
    width: 66.666%;
  }
}

.sa-citation-header {
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  padding: 12px 20px;
  display: flex;
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  flex-shrink: 0;
}

.sa-citation-col-platform {
  width: 160px;
  flex-shrink: 0;
}

.sa-citation-col-text {
  flex: 1;
  padding-left: 16px;
}

.sa-citation-list {
  overflow-y: auto;
  flex: 1;
}

.sa-citation-row {
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  font-size: 12px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;

  &:hover {
    background: rgba(248, 250, 252, 0.5);
  }
}

.sa-citation-platform {
  width: 160px;
  flex-shrink: 0;
  padding-top: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.sa-platform-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #475569;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 11px;
}

.sa-citation-text {
  flex: 1;
  padding-left: 16px;
  color: #475569;
  line-height: 1.625;
  font-style: italic;
  position: relative;
}

.sa-quote-icon {
  position: absolute;
  left: 0;
  top: 0;
  color: #d1d5db;
  transform: scaleX(-1);
}

.sa-citation-text-content {
  padding-left: 16px;
  display: block;
}

/* ============ 卡片4：全景口碑矩阵 ============ */
.sa-matrix-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.sa-matrix-header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(to right, #fff 0%, rgba(238, 242, 255, 0.2) 100%);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sa-matrix-title-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sa-matrix-icon {
  width: 32px;
  height: 32px;
  background: #4f46e5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.sa-matrix-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.4px;
  margin: 0;
}

.sa-matrix-desc {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  margin-top: 2px;
  margin-bottom: 0;
}

.sa-matrix-highlight {
  font-weight: 700;
  color: #475569;
}

.sa-matrix-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sa-matrix-date {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: #a5b4fc;
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
}

.sa-matrix-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fff;
  color: #6366f1;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #c7d2fe;
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #eef2ff;
  }
}

/* 矩阵表格 */
.sa-matrix-table-wrap {
  overflow-x: auto;
}

.sa-matrix-table {
  width: 100%;
  text-align: left;
  border-collapse: collapse;

  thead {
    background: rgba(248, 250, 252, 0.5);
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 1px;
    border-bottom: 1px solid #f1f5f9;
  }
}

.sa-mt-th {
  padding: 16px 24px;
}

.sa-mt-th--question {
  padding: 16px 32px;
}

.sa-mt-th--health,
.sa-mt-th--risk {
  text-align: center;
  padding: 16px 24px;
}

.sa-mt-th--platforms {
  text-align: center;
  padding: 16px 32px;
}

.sa-mt-platforms-header {
  display: flex;
  justify-content: space-between;
  padding: 0 24px;

  .sa-mt-platform-name {
    width: 48px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    line-height: 1.1;
    letter-spacing: normal;
    white-space: nowrap;
  }
}

.sa-mt-tr {
  border-top: 1px solid #f8fafc;
  transition: background 0.15s;

  &:hover {
    background: rgba(248, 250, 252, 0.5);
  }
}

.sa-mt-td {
  padding: 20px 24px;
  font-size: 16px;
  font-weight: 400;
  color: #000;
  vertical-align: middle;
}

.sa-mt-td--question {
  padding: 20px 32px;
}

.sa-mt-question-text {
  font-size: 16px;
  font-weight: 400;
  color: #000;
}

.sa-mt-td--health,
.sa-mt-td--risk {
  text-align: center;
}

.sa-mt-health {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.sa-mt-score {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 900;
}

.sa-mt-score--amber {
  background: #fef3c7;
  color: #b45309;
}

.sa-mt-trend-down {
  color: #e11d48;
}

.sa-mt-risk {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  justify-content: center;
}

.sa-mt-risk--amber {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.sa-mt-td--platforms {
  padding: 20px 32px;
}

.sa-mt-platforms {
  display: flex;
  justify-content: space-between;
  padding: 0 24px;
}

.sa-mt-platform-score {
  width: 48px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    box-shadow: 0 0 0 2px #818cf8;
    transform: scale(1.1);
  }
}

.sa-mt-score--green {
  background: #d1fae5;
  color: #047857;
}

.sa-mt-score--red {
  background: #fee2e2;
  color: #b91c1c;
}
</style>
