<template>
  <div class="ranking-page">
    <!-- AI排名透视 -->
    <div v-if="currentTab === 'Ranking'" class="rank-content">
      <!-- 1. Header -->
      <header class="rk-header">
        <div class="rk-header-left">
          <h2 class="rk-title">AI排名透视</h2>
          <div class="rk-subtitle">深度分析品牌在不同 AI 引擎中的排名竞争态势</div>
        </div>
        <div class="rk-header-right">
          <button class="rk-btn rk-btn--indigo">
            <IconDownload :size="16" />
            导出品牌透视报告
          </button>
          <button class="rk-btn rk-btn--gray">
            <IconSettings :size="16" />
            管理监控问题
          </button>
        </div>
      </header>

      <!-- 2. 卡片1: 排名指标 -->
      <section class="rk-card">
        <div class="rk-card-head">
          <div class="rk-card-head-left">
            <div class="rk-icon-box rk-icon-box--indigo"><IconChartNoAxes :size="16" /></div>
            <span class="rk-card-title">排名指标</span>
          </div>
          <div class="rk-card-head-right">
            <button class="rk-mini-btn rk-mini-btn--indigo">
              <IconDownload :size="14" />
              导出
            </button>
            <div class="rk-period">
              <span class="rk-period-label">统计周期</span>
              <button class="rk-date-btn">
                2026-08-21
                <IconArrowRight :size="12" />
                2026-08-27
                <IconChevronDown :size="14" />
              </button>
            </div>
          </div>
        </div>
        <div class="rk-filter-row">
          <div class="rk-filter">
            <span class="rk-filter-label">AI 引擎</span>
            <button class="rk-filter-btn rk-filter-btn--130">全部 <IconChevronDown :size="14" /></button>
          </div>
          <div class="rk-filter">
            <span class="rk-filter-label">监控问题</span>
            <button class="rk-filter-btn rk-filter-btn--180">全部问题 <IconChevronDown :size="14" /></button>
          </div>
        </div>
        <div class="rk-metrics-grid">
          <div v-for="m in rankingMetrics" :key="m.key" class="rk-metric-card">
            <div class="rk-metric-head">
              <div class="rk-metric-title-row">
                <span class="rk-metric-title">{{ m.title }}</span>
                <span class="rk-info-icon" :title="m.desc"><IconInfo :size="13" /></span>
              </div>
              <div class="rk-metric-value-col">
                <span class="rk-metric-value" :style="{ color: m.color }">{{ m.value }}<span class="rk-metric-pct">%</span></span>
                <span class="rk-metric-sub">{{ m.sub }}</span>
              </div>
            </div>
            <div class="rk-mini-chart">
              <svg class="rk-mini-svg" viewBox="0 0 227 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient :id="'rkGrad' + m.key" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" :stop-color="m.color" stop-opacity="0.15" />
                    <stop offset="95%" :stop-color="m.color" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <!-- 网格线 -->
                <line v-for="gy in [5, 47.5, 68.75, 90]" :key="'mg' + gy" :x1="40" :y1="gy" :x2="214" :y2="gy" stroke="#f1f5f9" stroke-dasharray="3 3" />
                <!-- Y 轴标签 -->
                <text v-for="yl in miniChartYLabels" :key="'my' + yl.text" :x="32" :y="yl.y" font-size="9" fill="#94a3b8" text-anchor="end" dominant-baseline="middle">{{ yl.text }}</text>
                <!-- X 轴标签 -->
                <text v-for="xl in miniChartXLabels" :key="'mx' + xl.text" :x="xl.x" :y="98" font-size="9" fill="#94a3b8" text-anchor="middle">{{ xl.text }}</text>
                <path :d="miniAreaPath(m.chart, m.key)" :fill="'url(#rkGrad' + m.key + ')'" stroke="none" />
                <path :d="miniLinePath(m.chart)" :stroke="m.color" stroke-width="2" fill="none" />
              </svg>
            </div>
            <div class="rk-metric-footer">
              <span>提及问题 / 监控总数</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 卡片2: 品牌排名 -->
      <section class="rk-card">
        <div class="rk-card-head">
          <div class="rk-card-head-left">
            <div class="rk-icon-box rk-icon-box--indigo"><IconMedal :size="16" /></div>
            <span class="rk-card-title">品牌排名</span>
          </div>
          <div class="rk-card-head-right">
            <button class="rk-mini-btn rk-mini-btn--indigo">
              <IconDownload :size="14" />
              导出
            </button>
            <div class="rk-period">
              <span class="rk-period-label">统计周期</span>
              <button class="rk-date-btn">
                2026-08-21
                <IconArrowRight :size="12" />
                2026-08-27
                <IconChevronDown :size="14" />
              </button>
            </div>
          </div>
        </div>
        <div class="rk-filter-row">
          <div class="rk-filter">
            <span class="rk-filter-label">AI 引擎</span>
            <button class="rk-filter-btn rk-filter-btn--130">全部 <IconChevronDown :size="14" /></button>
          </div>
          <div class="rk-filter">
            <span class="rk-filter-label">监控问题</span>
            <button class="rk-filter-btn rk-filter-btn--clamp">采购礼堂椅厂家推荐 <IconChevronDown :size="14" /></button>
          </div>
        </div>
        <div class="rk-rank-grid">
          <!-- 左侧排名榜单 -->
          <div class="rk-rank-col rk-rank-col--list">
            <div class="rk-rank-panel">
              <div class="rk-panel-head">
                <span class="rk-panel-title">排名榜单</span>
                <button class="rk-fix-btn" title="把同一品牌的不同写法归类合并">
                  <IconShare2 :size="12" />
                  修正品牌名
                </button>
              </div>
              <div class="rk-rank-list">
                <div v-for="item in rankingList" :key="item.rank" class="rk-rank-item">
                  <span class="rk-rank-num-badge" :class="rankBadgeClass(item.rank)">{{ item.rank }}</span>
                  <div class="rk-rank-brand">
                    <span class="rk-rank-brand-name" :class="{ 'rk-rank-brand-name--brand': item.isBrand }">{{ item.name }}</span>
                  </div>
                  <div class="rk-rank-badge" :class="'rk-badge--' + item.badge.type">{{ item.badge.text }}</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 右侧排名趋势 -->
          <div class="rk-rank-col rk-rank-col--trend">
            <div class="rk-rank-panel">
              <div class="rk-panel-head">
                <span class="rk-panel-title">排名趋势</span>
                <span class="rk-panel-sub">近 7 天</span>
              </div>
              <div class="rk-trend-chart">
                <svg class="rk-trend-svg" viewBox="0 0 518 415" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="rkAreaCombined" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.15" />
                      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <!-- 网格线 -->
                  <line v-for="gy in [10, 72.5, 135, 197.5, 260, 322.5, 385]" :key="'g' + gy" :x1="40" :y1="gy" :x2="508" :y2="gy" class="rk-grid-line" />
                  <!-- Y 轴标签 -->
                  <text v-for="(yl, i) in trendYLabels" :key="'yl' + i" :x="32" :y="yl.y" font-size="10" fill="#94a3b8" text-anchor="end" dominant-baseline="middle">{{ yl.text }}</text>
                  <!-- 综合填充区 -->
                  <path :d="trendAreaPath" fill="url(#rkAreaCombined)" />
                  <!-- 综合曲线 -->
                  <path :d="smoothPath(trendCombinedPoints)" :stroke="trendCombinedColor" class="rk-trend-line" />
                  <!-- 综合线上的点 -->
                  <circle
                    v-for="(p, i) in trendCombinedPoints"
                    :key="'p' + i"
                    :cx="p.x"
                    :cy="p.y"
                    r="3"
                    :fill="trendCombinedColor"
                    stroke="#fff"
                    stroke-width="2"
                  />
                  <!-- X 轴标签 -->
                  <text
                    v-for="(lbl, i) in rankingTrend.labels"
                    :key="'l' + i"
                    :x="trendX(i)"
                    y="403"
                    font-size="11"
                    fill="#94a3b8"
                    text-anchor="middle"
                  >{{ lbl }}</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. 卡片3: 全景排名矩阵 -->
      <section class="rk-card rk-matrix-card">
        <div class="rk-matrix-head">
          <div class="rk-matrix-head-left">
            <div class="rk-icon-box rk-icon-box--solid"><IconChartNoAxes :size="18" /></div>
            <div>
              <h3 class="rk-matrix-title">全景排名矩阵</h3>
              <p class="rk-matrix-sub">快速定位优势与劣势领域 · 2026-08-27</p>
            </div>
          </div>
          <div class="rk-matrix-head-right">
            <div class="rk-matrix-date">
              <span class="rk-matrix-date-label"><IconCalendar :size="14" /> 日期:</span>
              <input type="date" value="2026-08-27" class="rk-date-input" />
            </div>
            <button class="rk-cols-btn">
              <IconEye :size="14" />
              显示列
              <IconChevronDown :size="12" />
            </button>
            <button class="rk-btn rk-btn--indigo">
              <IconDownload :size="16" />
              导出排名矩阵
            </button>
          </div>
        </div>
        <div class="rk-matrix-body">
          <div class="rk-matrix-table-wrap">
            <table class="rk-matrix-table">
              <thead>
                <tr>
                  <th class="rk-mth rk-mth--question">问题</th>
                  <th class="rk-mth rk-mth--center">
                    <button class="rk-sort-btn">综合排名 <IconArrowDown :size="11" /></button>
                  </th>
                  <th class="rk-mth rk-mth--center">品牌提及率</th>
                  <th class="rk-mth rk-mth--center">Top3 推荐率</th>
                  <th class="rk-mth rk-mth--center">首位推荐率</th>
                  <th class="rk-mth rk-mth--center">豆包</th>
                  <th class="rk-mth rk-mth--center">DeepSeek</th>
                  <th class="rk-mth rk-mth--center">文心一言</th>
                  <th class="rk-mth rk-mth--center">通义千问</th>
                  <th class="rk-mth rk-mth--center">元宝</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in rankingMatrix" :key="i" class="rk-mtr">
                  <td class="rk-mtd rk-mtd--question">
                    <span class="rk-question-text">{{ row.question }}</span>
                  </td>
                  <td class="rk-mtd rk-mtd--center">
                    <span class="rk-combined-cell">{{ row.combined ? '第' + row.combined + '名' : '未上榜' }}</span>
                  </td>
                  <td class="rk-mtd rk-mtd--center rk-mtd--pct">
                    <span class="rk-pct-cell">{{ formatPct(row.mention) }}</span>
                  </td>
                  <td class="rk-mtd rk-mtd--center rk-mtd--pct">
                    <span class="rk-pct-cell">{{ formatPct(row.top3) }}</span>
                  </td>
                  <td class="rk-mtd rk-mtd--center rk-mtd--pct">
                    <span class="rk-pct-cell">{{ formatPct(row.first) }}</span>
                  </td>
                  <td v-for="e in matrixEngineKeys" :key="e" class="rk-mtd rk-mtd--engine">
                    <span class="rk-engine-cell" :class="rankCellClass(row[e])">{{ row[e] ? '#' + row[e] : '未上榜' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- AI竞品透视 -->
    <div v-else-if="currentTab === 'RankingCompetitor'" class="cp-content">
      <!-- 1. Header -->
      <div class="cp-header">
        <div>
          <h2 class="cp-title">AI 竞品透视</h2>
          <div class="cp-subtitle">基于 AI 搜索排名数据的竞品分析与对比</div>
        </div>
        <div class="cp-header-right">
          <button class="cp-btn cp-btn--gray">
            <IconCalendar :size="16" />
            2026-08-27
            <IconChevronDown :size="14" />
          </button>
          <button class="cp-btn cp-btn--indigo">
            <IconRefresh :size="16" />
            刷新
          </button>
          <button class="cp-btn cp-btn--indigo">
            <IconDownload :size="16" />
            导出 Excel
          </button>
          <button class="cp-btn cp-btn--gray">
            <IconShare2 :size="16" />
            修正品牌名
          </button>
        </div>
      </div>

      <!-- 2. 指标卡片 -->
      <div class="cp-metrics-grid">
        <div v-for="m in competitorMetrics" :key="m.key" class="cp-metric-card">
          <div class="cp-metric-label">
            <span class="cp-metric-icon" :class="'cp-metric-icon--' + m.icon">
              <IconUsers v-if="m.icon === 'users'" :size="14" />
              <IconEye v-else-if="m.icon === 'eye'" :size="14" />
              <IconTrophy v-else-if="m.icon === 'trophy'" :size="14" />
              <IconShield v-else-if="m.icon === 'shield'" :size="14" />
            </span>
            <span class="cp-metric-label-text">{{ m.label }}</span>
          </div>
          <div v-if="m.truncate" class="cp-metric-value cp-metric-value--lg">
            <span class="cp-metric-truncate">{{ m.value }}</span>
          </div>
          <div v-else class="cp-metric-value cp-metric-value--xl">{{ m.value }}</div>
          <div v-if="m.sub" class="cp-metric-sub">{{ m.sub }}</div>
        </div>
      </div>

      <!-- 3. 卡片1: 竞品品牌提及率 -->
      <section class="cp-card">
        <h3 class="cp-card-title">
          <IconBarChart :size="16" />
          竞品品牌提及率
        </h3>
        <div class="cp-table-wrap cp-table-wrap--scroll">
          <table class="cp-table">
            <thead>
              <tr>
                <th class="cp-th cp-th--num">序号</th>
                <th class="cp-th cp-th--brand">竞品名称</th>
                <th class="cp-th cp-th--bar">频次条</th>
                <th class="cp-th cp-th--num2">出现次数</th>
                <th class="cp-th cp-th--pct">提及率</th>
                <th class="cp-th cp-th--pct">Top3 推荐率</th>
                <th class="cp-th cp-th--pct">首位提及率</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in competitorMentionList"
                :key="row.id"
                class="cp-tr"
                :class="{ 'cp-tr--brand': row.isBrand }"
              >
                <td class="cp-td cp-td--num"><span class="cp-rank-circle" :style="{ background: rowColor(row.id) }">{{ row.id }}</span></td>
                <td class="cp-td cp-td--brand">
                  <span class="cp-brand-name" :class="{ 'cp-brand-name--brand': row.isBrand }">{{ row.name }}</span>
                </td>
                <td class="cp-td cp-td--bar">
                  <div class="cp-bar-track">
                    <div class="cp-bar-fill" :style="{ width: mentionBarWidth(row.count) + '%', background: rowColor(row.id) }" />
                  </div>
                </td>
                <td class="cp-td cp-td--num2">{{ row.count }}</td>
                <td class="cp-td cp-td--pct cp-pct--mention">{{ formatPct(row.mention) }}</td>
                <td class="cp-td cp-td--pct cp-pct--top3">{{ formatPct(row.top3) }}</td>
                <td class="cp-td cp-td--pct" :style="{ color: firstPctColor(row.first) }">{{ formatPct(row.first) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 4. 卡片2: 竞品品牌分平台排名 -->
      <section class="cp-card">
        <h3 class="cp-card-title">
          <IconBarChart :size="16" />
          竞品品牌分平台排名指标
        </h3>
        <div class="cp-platform-tags">
          <span class="cp-platform-tag cp-platform-tag--mention">提及率</span>
          <span class="cp-platform-tag cp-platform-tag--top3">Top3 推荐率</span>
          <span class="cp-platform-tag cp-platform-tag--first">首位提及率</span>
        </div>
        <div class="cp-table-wrap cp-table-wrap--scroll">
          <table class="cp-table cp-table--platform">
            <thead class="cp-thead--platform">
              <tr class="cp-tr--group1">
                <th rowspan="2" class="cp-th cp-th--platform-brand">竞品</th>
                <th v-for="g in platformGroups" :key="g.key" colspan="3" class="cp-th cp-th--group" :class="{ 'cp-th--group--combined': g.key === 'combined', 'cp-th--group--app': g.key.includes('App') }">
                  <span class="cp-group-badge" :class="{ 'cp-group-badge--combined': g.key === 'combined', 'cp-group-badge--app': g.key.includes('App') }">
                    {{ g.label }}
                    <IconLock v-if="g.key.includes('App')" :size="10" class="cp-lock-icon" />
                  </span>
                </th>
              </tr>
              <tr class="cp-tr--group2">
                <template v-for="g in platformGroups" :key="g.key">
                  <th class="cp-th cp-th--sub" :class="{ 'cp-th--sub--combined': g.key === 'combined' }">提及率</th>
                  <th class="cp-th cp-th--sub" :class="{ 'cp-th--sub--combined': g.key === 'combined' }">Top3 推荐率</th>
                  <th class="cp-th cp-th--sub cp-th--sub--last" :class="{ 'cp-th--sub--combined': g.key === 'combined' }">首位提及率</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in competitorPlatformList"
                :key="row.id"
                class="cp-tr cp-tr--platform"
                :class="{ 'cp-tr--brand': row.isBrand }"
              >
                <td class="cp-td cp-td--platform-brand">
                  <div class="cp-brand-cell">
                    <span class="cp-num-circle" :style="{ backgroundColor: rowColor(row.id) }">{{ row.id }}</span>
                    <span class="cp-brand-name" :class="{ 'cp-brand-name--brand': row.isBrand }">{{ row.name }}</span>
                    <span v-if="row.isBrand" class="cp-brand-tag">本品牌</span>
                  </div>
                </td>
                <template v-for="g in platformGroups" :key="g.key">
                  <td class="cp-td cp-td--platform" :class="{ 'cp-td--platform--combined': g.key === 'combined' }">
                    <span :class="platformCellClass('mention', row[g.key].mention)">{{ formatPct(row[g.key].mention) }}</span>
                  </td>
                  <td class="cp-td cp-td--platform" :class="{ 'cp-td--platform--combined': g.key === 'combined' }">
                    <span :class="platformCellClass('top3', row[g.key].top3)">{{ formatPct(row[g.key].top3) }}</span>
                  </td>
                  <td class="cp-td cp-td--platform cp-td--platform--last" :class="{ 'cp-td--platform--combined': g.key === 'combined' }">
                    <span :class="platformCellClass('first', row[g.key].first)">{{ formatPct(row[g.key].first) }}</span>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 5. 卡片3: 问题明细 -->
      <section class="cp-card">
        <h3 class="cp-card-title">
          <IconTarget :size="16" />
          问题明细
        </h3>
        <div class="cp-problem-list">
          <div
            v-for="item in competitorProblemList"
            :key="item.id"
            class="cp-problem-item"
          >
            <button class="cp-problem-btn" @click="toggleProblem(item.id)">
              <div class="cp-problem-left">
                <span class="cp-problem-keyword">{{ item.keyword }}</span>
                <span class="cp-problem-badge">排名词</span>
              </div>
              <div class="cp-problem-right">
                <span class="cp-brand-rank-badge" :class="item.brandRank > 0 ? 'cp-brand-rank--in' : 'cp-brand-rank--out'">
                  本品牌 {{ item.brandRank > 0 ? '#' + item.brandRank : '未上榜' }}
                </span>
                <div class="cp-engine-box-list">
                  <div v-for="e in item.engines" :key="e.name" class="cp-engine-box">
                    <span class="cp-engine-box-name">{{ e.name }}</span>
                    <span class="cp-engine-box-rank" :class="e.rank > 0 ? 'cp-engine-rank--in' : 'cp-engine-rank--out'">
                      {{ e.rank > 0 ? '#' + e.rank : '未上榜' }}
                    </span>
                  </div>
                </div>
                <IconChevronDown :size="16" class="cp-problem-chevron" :class="{ 'cp-problem-chevron--open': openProblems.includes(item.id) }" />
              </div>
            </button>
            <div v-if="openProblems.includes(item.id)" class="cp-problem-detail">
              <div class="cp-problem-detail-row">
                <span class="cp-problem-detail-label">监控问题：</span>
                <span class="cp-problem-detail-value">{{ item.keyword }}</span>
              </div>
              <div class="cp-problem-detail-row">
                <span class="cp-problem-detail-label">本品牌综合排名：</span>
                <span class="cp-problem-detail-value">{{ item.brandRank > 0 ? '第 ' + item.brandRank + ' 名' : '未上榜' }}</span>
              </div>
              <div class="cp-problem-detail-row">
                <span class="cp-problem-detail-label">各引擎排名：</span>
                <span class="cp-problem-detail-value">
                  <span v-for="(e, i) in item.engines" :key="e.name">
                    {{ i > 0 ? ' · ' : '' }}{{ e.name }}：{{ e.rank > 0 ? '#' + e.rank : '未上榜' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 引用源追溯 -->
    <div v-else-if="currentTab === 'RankingCitation'" class="tab-content cit-page">
      <!-- Header -->
      <header class="cit-header">
        <div class="cit-header-left">
          <h2 class="cit-title">引用源追溯</h2>
          <div class="cit-subtitle">追踪 AI 回答中高频引用的信息来源与权重归因</div>
        </div>
        <div class="cit-header-right">
          <button class="cit-btn cit-btn--outline">
            <IconDownload :size="16" />
            导出数据
          </button>
          <button class="cit-btn cit-btn--indigo">
            <IconUpload :size="16" />
            导入自有文章
          </button>
        </div>
      </header>

      <!-- 主卡片 -->
      <section class="cit-card">
        <!-- 过滤器栏 -->
        <div class="cit-filter-bar">
          <div class="cit-filter-group">
            <div class="cit-filter-label">
              <IconLayers :size="14" />
              <span>问题:</span>
            </div>
            <button class="cit-select cit-select--question">
              <span class="truncate">全部问题</span>
              <IconChevronDown :size="14" class="cit-select-arrow" />
            </button>
          </div>

          <div class="cit-filter-group">
            <div class="cit-filter-label">
              <IconZap :size="14" />
              <span>AI引擎:</span>
            </div>
            <button class="cit-select cit-select--engine">
              <div class="cit-engine-display">
                <span class="cit-engine-dot" style="background-color: rgb(17, 24, 39);"></span>
                <span>全部·网页端</span>
              </div>
              <IconChevronDown :size="14" class="cit-select-arrow" />
            </button>
          </div>

          <div class="cit-filter-group">
            <div class="cit-filter-label">
              <IconCalendar :size="14" />
              <span>日期:</span>
            </div>
            <button class="cit-select cit-select--date">
              <span>2026-08-21</span>
              <IconArrowRight :size="12" />
              <span>2026-08-27</span>
              <IconChevronDown :size="14" class="cit-select-arrow" />
            </button>
          </div>
        </div>

        <!-- 表格 -->
        <div class="cit-table-wrap">
          <table class="cit-table">
            <thead>
              <tr>
                <th class="cit-th cit-th--platform">
                  <div class="cit-th-content">
                    <span>信源平台 (Platform)</span>
                    <IconChevronDown :size="12" class="cit-th-arrow" />
                  </div>
                </th>
                <th class="cit-th cit-th--cite">
                  <div class="cit-th-content cit-th-content--center">
                    总引用次
                    <IconChevronDown :size="12" class="cit-th-arrow cit-th-arrow--active" />
                  </div>
                </th>
                <th class="cit-th cit-th--authority">
                  <div class="cit-th-content cit-th-content--center">
                    <span>豆包媒体权威度</span>
                    <span class="cit-info-tip" title="此评价来源于豆包接口。">
                      <IconInfo :size="13" />
                    </span>
                  </div>
                </th>
                <th class="cit-th cit-th--models">
                  <div class="cit-th-content cit-th-content--center">覆盖模型</div>
                </th>
                <th class="cit-th cit-th--channel">
                  <div class="cit-th-content cit-th-content--center">发稿通道</div>
                </th>
                <th class="cit-th cit-th--action">
                  <div class="cit-th-content cit-th-content--center">分析</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in citationPlatformList"
                :key="row.id"
                class="cit-tr"
              >
                <td class="cit-td cit-td--platform">
                  <div class="cit-platform-cell">
                    <IconChevronDown :size="16" class="cit-expand-icon" />
                    <div>
                      <div class="cit-platform-name-row">
                        <div class="cit-platform-name">{{ row.name }}</div>
                        <span class="cit-article-badge">{{ row.articleCount }}</span>
                      </div>
                      <div class="cit-platform-cat">{{ row.category }}</div>
                    </div>
                  </div>
                </td>
                <td class="cit-td cit-td--cite">
                  <div class="cit-cite-cell">
                    <div class="cit-cite-numbers">
                      <span class="cit-cite-num">{{ row.totalCite }}</span>
                      <span class="cit-cite-pct">{{ row.pct }}</span>
                    </div>
                    <div class="cit-cite-bar">
                      <div class="cit-cite-bar-fill" :style="{ width: barWidth(row.pct) }"></div>
                    </div>
                  </div>
                </td>
                <td class="cit-td cit-td--authority">
                  <span
                    v-if="row.authorityColor === 'blue'"
                    class="cit-auth-badge cit-auth-badge--blue"
                    :title="row.name"
                  >{{ row.authority }}</span>
                  <span
                    v-else-if="row.authorityColor === 'green'"
                    class="cit-auth-badge cit-auth-badge--green"
                    :title="row.name"
                  >{{ row.authority }}</span>
                  <span v-else class="cit-auth-none">--</span>
                </td>
                <td class="cit-td cit-td--models">
                  <div class="cit-models">
                    <span
                      v-for="model in row.models"
                      :key="model.name"
                      class="cit-model-tag"
                      :style="{ backgroundColor: model.color }"
                    >{{ model.name }}<span class="cit-model-count">{{ model.count }}</span></span>
                  </div>
                </td>
                <td class="cit-td cit-td--channel">
                  <span v-if="row.channelType === 'locked'" class="cit-channel-locked">{{ row.channel }}</span>
                  <span v-else class="cit-channel-points">{{ row.channel }}</span>
                </td>
                <td class="cit-td cit-td--action">
                  <button class="cit-action-btn" title="打开信源分析">
                    <IconActivity :size="11" />
                    分析
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- 信源平台偏好 -->
    <div v-else-if="currentTab === 'RankingSourcePref'" class="tab-content sp-page">
      <!-- Header -->
      <header class="sp-header">
        <div>
          <h1 class="sp-title">信源平台偏好</h1>
          <p class="sp-subtitle">分析各 AI 平台收录引用的来源偏好，洞察内容分发策略</p>
        </div>
      </header>

      <!-- 过滤器栏 -->
      <div class="sp-filter-bar">
        <!-- 日期选择器 -->
        <div class="sp-filter-group">
          <div class="sp-filter-label">
            <IconCalendar :size="14" />
            <span>日期:</span>
          </div>
          <button class="sp-date-btn">
            <div class="sp-date-range">
              <span>2026-08-21</span>
              <IconArrowRight :size="12" class="sp-date-arrow" />
              <span>2026-08-27</span>
            </div>
            <IconChevronDown :size="14" class="sp-select-arrow" />
          </button>
        </div>

        <!-- 平台标签组 -->
        <div class="sp-platform-tabs">
          <button class="sp-tab sp-tab--active">全部平台</button>
          <button class="sp-tab">豆包</button>
          <button class="sp-tab">DeepSeek</button>
          <button class="sp-tab">文心一言</button>
          <button class="sp-tab">通义千问</button>
          <button class="sp-tab">元宝</button>
        </div>

        <!-- 搜索框 -->
        <div class="sp-search-wrap">
          <IconSearch :size="16" class="sp-search-icon" />
          <input placeholder="搜索来源..." class="sp-search-input" type="text" />
        </div>
      </div>

      <!-- 指标卡片 -->
      <div class="sp-metrics-grid">
        <div v-for="m in sourcePrefMetrics" :key="m.key" class="sp-metric-card" :class="'sp-metric-card--' + m.iconColor">
          <div class="sp-metric-icon" :class="'sp-metric-icon--' + m.iconColor">
            <IconHeart v-if="m.icon === 'heart'" :size="22" />
            <IconChartNoAxes v-else-if="m.icon === 'chart'" :size="22" />
            <IconTrendingUp v-else :size="22" />
          </div>
          <div class="sp-metric-info">
            <div class="sp-metric-label">{{ m.label }}</div>
            <div class="sp-metric-value">{{ m.value }}</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="sp-charts-grid">
        <!-- TOP10 信源平台 -->
        <div class="sp-chart-card sp-chart-card--bar">
          <div class="sp-chart-header">
            <h3 class="sp-chart-title">TOP10 信源平台</h3>
            <div class="sp-legend">
              <div class="sp-legend-item">
                <span class="sp-legend-dot" style="background-color: #f59e0b;"></span>
                <span class="sp-legend-text">豆包</span>
              </div>
              <div class="sp-legend-item">
                <span class="sp-legend-dot" style="background-color: #ec4899;"></span>
                <span class="sp-legend-text">文心一言</span>
              </div>
              <div class="sp-legend-item">
                <span class="sp-legend-dot" style="background-color: #6366f1;"></span>
                <span class="sp-legend-text">DeepSeek</span>
              </div>
              <div class="sp-legend-item">
                <span class="sp-legend-dot" style="background-color: #9333ea;"></span>
                <span class="sp-legend-text">通义千问</span>
              </div>
              <div class="sp-legend-item">
                <span class="sp-legend-dot" style="background-color: #0ea5e9;"></span>
                <span class="sp-legend-text">元宝</span>
              </div>
            </div>
          </div>
          <div class="sp-bar-chart">
            <div v-for="item in top10Platforms" :key="item.name" class="sp-bar-row">
              <span class="sp-bar-label">{{ item.name }}</span>
              <div class="sp-bar-track">
                <div v-if="item.doubao > 0" class="sp-bar-segment" style="background-color: #f59e0b;" :style="{ width: barSegWidth(item.doubao) }"></div>
                <div v-if="item.wenxin > 0" class="sp-bar-segment" style="background-color: #ec4899;" :style="{ width: barSegWidth(item.wenxin) }"></div>
                <div v-if="item.deepseek > 0" class="sp-bar-segment" style="background-color: #6366f1;" :style="{ width: barSegWidth(item.deepseek) }"></div>
                <div v-if="item.qianwen > 0" class="sp-bar-segment" style="background-color: #9333ea;" :style="{ width: barSegWidth(item.qianwen) }"></div>
                <div v-if="item.yuanbao > 0" class="sp-bar-segment" style="background-color: #0ea5e9;" :style="{ width: barSegWidth(item.yuanbao) }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 平台引用占比 -->
        <div class="sp-chart-card sp-chart-card--pie">
          <div class="sp-chart-header">
            <h3 class="sp-chart-title">平台引用占比</h3>
          </div>
          <div class="sp-pie-container">
            <svg class="sp-pie-svg" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="88" fill="none" stroke="#f3f4f6" stroke-width="40" />
              <template v-for="(seg, i) in pieSegments" :key="i">
                <circle
                  cx="110" cy="110" r="88" fill="none"
                  :stroke="seg.color"
                  stroke-width="40"
                  :stroke-dasharray="seg.dashArray"
                  :stroke-dashoffset="seg.dashOffset"
                  :transform="seg.transform"
                />
              </template>
            </svg>
            <div class="sp-pie-center">
              <div class="sp-pie-total">4,158</div>
              <div class="sp-pie-label">总引用</div>
            </div>
          </div>
          <div class="sp-pie-legend">
            <div v-for="item in platformRatio" :key="item.name" class="sp-pie-legend-item">
              <span class="sp-pie-legend-dot" :style="{ backgroundColor: item.color }"></span>
              <span class="sp-pie-legend-name">{{ item.name }}</span>
              <div class="sp-pie-legend-bar-wrap">
                <div class="sp-pie-legend-bar" :style="{ width: item.value + '%', backgroundColor: item.color }"></div>
              </div>
              <span class="sp-pie-legend-value">{{ item.value }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 引用来源明细 -->
      <div class="sp-detail-card">
        <div class="sp-detail-header">
          <h3 class="sp-chart-title">引用来源明细</h3>
        </div>
        <div class="sp-table-wrap">
          <table class="sp-table">
            <thead>
              <tr>
                <th class="sp-th sp-th--left">排名</th>
                <th class="sp-th sp-th--left">信源平台</th>
                <th class="sp-th sp-th--center">
                  <div class="sp-th-content">
                    <span>豆包媒体权威度</span>
                    <span class="cit-info-tip" title="此评价来源于豆包接口。">
                      <IconInfo :size="13" />
                    </span>
                  </div>
                </th>
                <th class="sp-th sp-th--right">引用次数</th>
                <th class="sp-th sp-th--right">文章数</th>
                <th class="sp-th sp-th--left">平台分布</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sourceDetailList" :key="row.id" class="sp-tr">
                <td class="sp-td sp-td--rank">{{ row.id }}</td>
                <td class="sp-td sp-td--name">
                  <span class="sp-name-text">{{ row.name }}</span>
                </td>
                <td class="sp-td sp-td--authority">
                  <span v-if="row.authority === '--'" class="sp-auth-none">--</span>
                  <span v-else class="sp-auth-badge" :class="row.authority === '高权威' ? 'sp-auth-badge--green' : 'sp-auth-badge--blue'">{{ row.authority }}</span>
                </td>
                <td class="sp-td sp-td--cite">{{ row.cite }}</td>
                <td class="sp-td sp-td--articles">{{ row.articles }}</td>
                <td class="sp-td sp-td--models">
                  <div class="sp-models">
                    <span
                      v-for="model in row.models"
                      :key="model.name"
                      class="sp-model-tag"
                      :style="{ backgroundColor: model.color }"
                    >{{ model.name }}<span class="sp-model-count">{{ model.count }}</span></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 引用源洞察 -->
    <div v-else-if="currentTab === 'RankingSourceIntel'" class="tab-content si-page">
      <!-- Header -->
      <header class="si-header">
        <div>
          <h1 class="si-title">引用源洞察</h1>
          <p class="si-subtitle">深度拆解 AI 平台的引用源偏好与你的内容被引效果，产出内容分发与优化策略</p>
        </div>
        <button class="si-date-btn">
          <IconCalendar :size="14" class="si-date-icon" />
          <span>2026-08-21 ~ 2026-08-27</span>
          <span class="si-date-sep">vs</span>
          <span>2026-08-14 ~ 2026-08-20</span>
          <IconChevronDown :size="14" class="si-select-arrow" />
        </button>
      </header>

      <!-- 趋势图卡片 -->
      <div class="si-trend-card">
        <div class="si-trend-header">
          <div class="si-trend-title-row">
            <div class="si-trend-icon"><IconTrendingUp :size="16" /></div>
            <span class="si-trend-title">Top10 信源每日波动趋势</span>
            <span class="si-trend-tip" title="本期引用量 Top10 的信源平台，逐日引用次数波动。可切换 AI 引擎单看某平台，点击图例可隐藏/显示对应信源。">
              <IconInfo :size="14" />
            </span>
          </div>
          <div class="si-engine-filter">
            <span class="si-engine-label">AI 引擎</span>
            <button class="si-engine-btn">
              <span>全部</span>
              <IconChevronDown :size="14" class="si-select-arrow" />
            </button>
          </div>
        </div>
        <!-- 简化趋势图 -->
        <div class="si-trend-chart">
          <svg class="si-trend-svg" viewBox="0 0 830 300" preserveAspectRatio="none">
            <!-- 网格线 -->
            <line v-for="gy in [10, 75, 140, 205, 270]" :key="'tg' + gy" :x1="40" :y1="gy" :x2="810" :y2="gy" stroke="#e5e7eb" stroke-dasharray="3 3" />
            <!-- Y轴标签 -->
            <text v-for="yl in siTrendYLabels" :key="'ty' + yl.text" :x="32" :y="yl.y" font-size="11" fill="#9ca3af" text-anchor="end" dominant-baseline="middle">{{ yl.text }}</text>
            <!-- X轴标签 -->
            <text v-for="xl in siTrendXLabels" :key="'tx' + xl" :x="xl.x" y="290" font-size="11" fill="#9ca3af" text-anchor="middle">{{ xl.text }}</text>
            <!-- 多条折线 -->
            <path v-for="(line, i) in trendLines" :key="'tl' + i" :d="line.path" :stroke="line.color" stroke-width="2" fill="none" />
          </svg>
        </div>
        <!-- 平台标签 -->
        <div class="si-platform-tags">
          <button v-for="tag in insightPlatformTags" :key="tag.name" class="si-platform-tag">
            <span class="si-tag-line" :style="{ backgroundColor: tag.color }"></span>
            <span class="si-tag-name">{{ tag.name }}</span>
            <span class="si-tag-count">{{ tag.count }}</span>
          </button>
        </div>
      </div>

      <!-- Panel 2: AI 引擎信源偏好 -->
      <div class="si-pref-card">
        <div class="si-pref-header">
          <div class="si-pref-title-row">
            <div class="si-pref-icon"><IconChartNoAxes :size="16" /></div>
            <span class="si-pref-title">AI 引擎信源偏好</span>
            <span class="si-trend-tip" title="各 AI 引擎更爱从哪些信源平台取材。格子颜色越深 = 该引擎从这个平台取材越多；右侧条越长 = 被 AI 引用越多、越值得优先布局。">
              <IconInfo :size="14" />
            </span>
          </div>
        </div>
        <!-- AI洞察提示 -->
        <div class="si-insight-tip">
          <p class="si-insight-text" v-html="formatInsightTip(insightTip)"></p>
        </div>
        <!-- 8列colored cells表格 -->
        <div class="si-table-wrap">
          <table class="si-table">
            <thead>
              <tr>
                <th class="si-th si-th--rank">#</th>
                <th class="si-th si-th--name">信源平台</th>
                <th class="si-th si-th--engine">豆包</th>
                <th class="si-th si-th--engine">DeepSeek</th>
                <th class="si-th si-th--engine">文心一言</th>
                <th class="si-th si-th--engine">通义千问</th>
                <th class="si-th si-th--engine">元宝</th>
                <th class="si-th si-th--total">总被引</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sourceInsightList.slice(0, 15)" :key="row.rank" class="si-tr">
                <td class="si-td si-td--rank">
                  <div class="si-rank-circle">{{ row.rank }}</div>
                </td>
                <td class="si-td si-td--name">
                  <span class="si-name-text">{{ row.name }}</span>
                </td>
                <td class="si-td si-td--engine">
                  <div class="si-engine-cell" :style="{ background: cellBg(row.doubao) }">
                    <span class="si-engine-val">{{ row.doubao }}</span>
                  </div>
                </td>
                <td class="si-td si-td--engine">
                  <div class="si-engine-cell" :style="{ background: cellBg(row.deepseek) }">
                    <span class="si-engine-val">{{ row.deepseek }}</span>
                  </div>
                </td>
                <td class="si-td si-td--engine">
                  <div class="si-engine-cell" :style="{ background: cellBg(row.wenxin) }">
                    <span class="si-engine-val">{{ row.wenxin }}</span>
                  </div>
                </td>
                <td class="si-td si-td--engine">
                  <div class="si-engine-cell" :style="{ background: cellBg(row.qianwen) }">
                    <span class="si-engine-val">{{ row.qianwen }}</span>
                  </div>
                </td>
                <td class="si-td si-td--engine">
                  <div class="si-engine-cell" :style="{ background: cellBg(row.yuanbao) }">
                    <span class="si-engine-val">{{ row.yuanbao }}</span>
                  </div>
                </td>
                <td class="si-td si-td--total">
                  <div class="si-total-wrap">
                    <div class="si-total-bar-wrap">
                      <div class="si-total-bar" :style="{ width: totalBarWidth(row.total) }"></div>
                    </div>
                    <span class="si-total-val">{{ row.total }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel 3: 自有内容收录趋势 -->
      <div class="si-trend3-card">
        <div class="si-trend3-header">
          <div class="si-trend3-title-row">
            <div class="si-trend3-icon"><IconTrendingUp :size="16" /></div>
            <span class="si-trend3-title">自有内容收录趋势</span>
            <span class="si-trend-tip" title="自有内容被 AI 收录的率（占比）与量（被引次数）随时间变化，判断是真涨还是被大盘稀释。">
              <IconInfo :size="14" />
            </span>
          </div>
          <div class="si-trend3-filters">
            <div class="si-engine-filter">
              <span class="si-engine-label">AI 引擎</span>
              <button class="si-engine-btn">
                <span>综合</span>
                <IconChevronDown :size="14" class="si-select-arrow" />
              </button>
            </div>
            <div class="si-dim-tabs">
              <button class="si-dim-tab si-dim-tab--active">收录率</button>
              <button class="si-dim-tab">收录量</button>
            </div>
          </div>
        </div>
        <div class="si-trend3-body">
          <!-- 左块：指标数据 -->
          <div class="si-trend3-stats">
            <div class="si-stat-item">
              <div class="si-stat-label">本期自有被引</div>
              <div class="si-stat-value">32 <span class="si-stat-unit">次</span><span class="si-stat-delta si-stat-delta--up">↑ 540%</span></div>
            </div>
            <div class="si-stat-item">
              <div class="si-stat-label">收录率（自有占比）</div>
              <div class="si-stat-value">0.8<span class="si-stat-unit">%</span><span class="si-stat-delta si-stat-delta--up">↑ 0.7pp</span></div>
            </div>
            <div class="si-stat-item">
              <div class="si-stat-label">收录篇数</div>
              <div class="si-stat-value">4 <span class="si-stat-unit">篇</span><span class="si-stat-delta si-stat-delta--up">↑ 0</span></div>
            </div>
          </div>
          <!-- 右块：趋势图 -->
          <div class="si-trend3-chart-wrap">
            <svg class="si-trend3-svg" viewBox="0 0 571 180" preserveAspectRatio="none">
              <line v-for="gy in [10, 45, 80, 115, 150]" :key="'t3g' + gy" :x1="40" :y1="gy" :x2="561" :y2="gy" stroke="#e5e7eb" stroke-dasharray="3 3" />
              <text v-for="yl in trend3YLabels2" :key="'t3y' + yl.text" :x="32" :y="yl.y" font-size="11" fill="#9ca3af" text-anchor="end" dominant-baseline="middle">{{ yl.text }}</text>
              <text v-for="xl in siTrendXLabels2" :key="'t3x' + xl.text" :x="xl.x" y="172" font-size="11" fill="#9ca3af" text-anchor="middle">{{ xl.text }}</text>
              <defs>
                <linearGradient id="trend3Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#10b981" stop-opacity="0.25" />
                  <stop offset="95%" stop-color="#10b981" stop-opacity="0.02" />
                </linearGradient>
              </defs>
              <path d="M40,120C82,115,125,110,168,105C211,100,254,95,297,90C339,85,382,80,425,75C468,70,511,65,553,60C596,55,639,50,682,45 L561,150 L40,150 Z" fill="url(#trend3Grad)" />
              <path d="M40,120C82,115,125,110,168,105C211,100,254,95,297,90C339,85,382,80,425,75C468,70,511,65,553,60" stroke="#10b981" stroke-width="2" fill="none" />
            </svg>
            <div class="si-trend3-latest">最新值：<span class="si-trend3-latest-val">1.06%</span></div>
          </div>
        </div>
      </div>

      <!-- Panel 4: 引用源透视 -->
      <div class="si-persp-card">
        <div class="si-persp-header">
          <div class="si-persp-title-row">
            <div class="si-persp-icon"><IconSearch :size="16" /></div>
            <span class="si-persp-title">引用源透视</span>
            <span class="si-trend-tip" title="多维度透视各信源、文章的被引用情况，支持按引擎、问题、状态等筛选。">
              <IconInfo :size="14" />
            </span>
          </div>
          <button class="si-persp-export">
            <IconDownload :size="14" />
            导出 Excel
          </button>
        </div>
        <!-- 过滤器栏 -->
        <div class="si-persp-filters">
          <div class="si-engine-filter">
            <span class="si-engine-label">问题</span>
            <button class="si-engine-btn" style="min-width: 140px;">
              <span>全部</span>
              <IconChevronDown :size="14" class="si-select-arrow" />
            </button>
          </div>
          <div class="si-search-wrap">
            <IconSearch :size="14" class="si-search-icon" />
            <input placeholder="搜索名称..." class="si-search-input" type="text" />
          </div>
        </div>
        <!-- Tab切换栏 -->
        <div class="si-persp-tabs">
          <div class="si-data-tabs">
            <button class="si-data-tab si-data-tab--active">信源平台</button>
            <button class="si-data-tab">引用文章</button>
            <button class="si-data-tab">自有文章</button>
          </div>
          <div class="si-status-tabs">
            <button class="si-status-tab si-status-tab--active">全部</button>
            <button class="si-status-tab">本期新增</button>
            <button class="si-status-tab">持续被引</button>
            <button class="si-status-tab">本期流失</button>
          </div>
        </div>
        <!-- 10列表格 -->
        <div class="si-table-wrap">
          <table class="si-table">
            <thead>
              <tr>
                <th class="si-th si-th--rank">排名</th>
                <th class="si-th si-th--name">名称</th>
                <th class="si-th si-th--status">状态</th>
                <th class="si-th si-th--engine">豆包</th>
                <th class="si-th si-th--engine">DeepSeek</th>
                <th class="si-th si-th--engine">文心一言</th>
                <th class="si-th si-th--engine">通义千问</th>
                <th class="si-th si-th--engine">元宝</th>
                <th class="si-th si-th--total">合计</th>
                <th class="si-th si-th--change">较上期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sourceInsightList" :key="row.rank" class="si-tr">
                <td class="si-td si-td--rank">
                  <div class="si-rank-circle" :class="row.rank > 10 ? 'si-rank-circle--gray' : ''">{{ row.rank }}</div>
                </td>
                <td class="si-td si-td--name">
                  <span class="si-name-text">{{ row.name }}</span>
                </td>
                <td class="si-td si-td--status">
                  <span class="si-status-wrap">
                    <span class="si-status-dot" :class="row.status === '本期新增' ? 'si-status-dot--new' : 'si-status-dot--continued'"></span>
                    <span class="si-status-text" :class="row.status === '本期新增' ? 'si-status-text--new' : 'si-status-text--continued'">{{ row.status }}</span>
                  </span>
                </td>
                <td class="si-td si-td--engine-text">{{ row.doubao }}</td>
                <td class="si-td si-td--engine-text">{{ row.deepseek }}</td>
                <td class="si-td si-td--engine-text">{{ row.wenxin }}</td>
                <td class="si-td si-td--engine-text">{{ row.qianwen }}</td>
                <td class="si-td si-td--engine-text">{{ row.yuanbao }}</td>
                <td class="si-td si-td--total-text">{{ row.total }}</td>
                <td class="si-td si-td--change">
                  <span class="si-change-val" :class="row.change.startsWith('-') ? 'si-change--down' : 'si-change--up'">
                    {{ row.change.startsWith('-') ? '▼ ' + row.change : '▲ ' + row.change }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 加载更多 -->
        <div class="si-load-more-bar">
          <span class="si-load-count">已加载 20 / 704 条</span>
          <button class="si-load-btn">加载更多</button>
        </div>
      </div>
    </div>

    <!-- 监控问题管理 -->
    <div v-else-if="currentTab === 'RankingQuestionMgmt'" class="qm-page">
      <!-- 头部区域：标题 + 配额卡片 -->
      <div class="qm-header-section">
        <div class="qm-title-block">
          <h2 class="qm-title">监控问题管理</h2>
          <div class="qm-desc-row">
            <span class="qm-desc-text">配置实际发送给 AI 的监控问题。</span>
          </div>
        </div>
        <div class="qm-quota-card">
          <!-- 总占用 -->
          <div class="qm-quota-item qm-quota-item--total">
            <div class="qm-quota-label-row">
              <span class="qm-quota-label">总占用 · 全部分类</span>
            </div>
            <span class="qm-quota-value qm-quota-value--red">8 <span class="qm-quota-suffix">/ 8</span></span>
          </div>
          <!-- 本页 · 排名词 -->
          <div class="qm-quota-item qm-quota-item--page">
            <div class="qm-quota-label-row">
              <span class="qm-quota-label">本页 · 排名词</span>
              <span class="qm-quota-tip-icon" title="总占用 · 全部分类：排名词 + 口碑词 全部已占用额度，是计费依据。&#10;本页 · 排名词：仅当前分类下的问题条数，所以会小于总占用，属正常现象。">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
              </span>
            </div>
            <span class="qm-quota-value qm-quota-value--indigo">7 <span class="qm-quota-suffix">个</span></span>
          </div>
          <!-- 待释放 -->
          <div class="qm-quota-item qm-quota-item--pending">
            <div class="qm-quota-label-row">
              <span class="qm-quota-dot qm-quota-dot--amber"></span>
              <span class="qm-quota-label">待释放</span>
            </div>
            <span class="qm-quota-value qm-quota-value--amber">0 <span class="qm-quota-suffix">个</span></span>
          </div>
          <!-- 扩容 -->
          <button class="qm-quota-upgrade" title="升级套餐">
            <svg class="qm-upgrade-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
            <span class="qm-upgrade-text">扩容</span>
          </button>
        </div>
      </div>

      <!-- 内容卡片 -->
      <div class="qm-card">
        <!-- 卡片头 -->
        <div class="qm-card-header">
          <div class="qm-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            <span>问题列表 ({{ monitorQuestions.length }})</span>
          </div>
          <div class="qm-card-actions">
            <div class="qm-search-wrap">
              <svg class="qm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
              <input class="qm-search-input" type="text" placeholder="搜索问题..." />
            </div>
            <button class="qm-action-btn qm-action-btn--outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
              导出
            </button>
            <button class="qm-action-btn qm-action-btn--outline-strong">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
              导入问题
            </button>
            <button class="qm-action-btn qm-action-btn--disabled">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              增加新问题
            </button>
          </div>
        </div>
        <!-- 分组 Tabs -->
        <div class="qm-tabs-row">
          <button class="qm-tab qm-tab--active">全部</button>
          <button class="qm-tab">
            未分组 <b class="qm-tab-count">7</b>
          </button>
          <button class="qm-tab qm-tab--new">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            新建分组
          </button>
        </div>
        <!-- 表头 -->
        <div class="qm-table-header">
          <div class="qm-th qm-th--type">监控类型</div>
          <div class="qm-th qm-th--question">问题</div>
          <div class="qm-th qm-th--group">分组</div>
          <div class="qm-th qm-th--date">添加时间</div>
          <div class="qm-th qm-th--status">状态</div>
          <div class="qm-th qm-th--action">操作</div>
        </div>
        <!-- 行列表 -->
        <div class="qm-rows">
          <div v-for="q in monitorQuestions" :key="q.id" class="qm-row">
            <span class="qm-row-bar"></span>
            <div class="qm-td qm-td--type">
              <span class="qm-type-badge">{{ q.type }}</span>
            </div>
            <div class="qm-td qm-td--question">
              <span class="qm-question-text">{{ q.content }}</span>
            </div>
            <div class="qm-td qm-td--group">
              <select class="qm-group-select">
                <option value="">{{ q.group }}</option>
              </select>
            </div>
            <div class="qm-td qm-td--date">
              <span class="qm-date-text">{{ q.date }}</span>
            </div>
            <div class="qm-td qm-td--status">
              <span class="qm-status-badge">
                <span class="qm-status-dot"></span>
                {{ q.status }}
              </span>
            </div>
            <div class="qm-td qm-td--action">
              <button class="qm-icon-btn qm-icon-btn--edit" title="编辑问题">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
              </button>
              <button class="qm-icon-btn qm-icon-btn--delete" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 监控识别管理 -->
    <div v-else-if="currentTab === 'RankingRecognitionMgmt'" class="rm-page">
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

    <!-- 搜索快照下载 -->
    <div v-else-if="currentTab === 'RankingSnapshot'" class="sn-page">
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

    <!-- 导出品牌透视报告 -->
    <div v-else-if="currentTab === 'RankingExport'" class="tab-content">
      <div class="content-card">
        <div class="section-title">导出品牌透视报告</div>
        <a-empty description="导出品牌透视报告（开发中）" />
      </div>
    </div>

    <a-modal v-model:visible="showAddQuestion" title="新增监控问题" @ok="showAddQuestion = false">
      <a-form :model="newQuestionForm" layout="vertical">
        <a-form-item field="content" label="问题内容">
          <a-input v-model="newQuestionForm.content" placeholder="输入要监控的问题" />
        </a-form-item>
        <a-form-item field="engine" label="选择引擎">
          <a-select v-model="newQuestionForm.engine" placeholder="选择引擎">
            <a-option v-for="e in engines" :key="e.key" :value="e.key">{{ e.label }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import {
  engines,
  competitors,
  monitorQuestions,
  citationSources,
  citationPlatformList,
  sourcePrefMetrics,
  top10Platforms,
  platformRatio,
  sourceDetailList,
  insightPlatformTags,
  sourceInsightList,
  insightTip,
  topicRanking,
  rankingMetrics,
  rankingList,
  rankingTrend,
  rankingMatrix,
  competitorMetrics,
  competitorMentionList,
  competitorPlatformList,
  competitorProblemList,
  recognitionData,
  snapshotList,
} from '@/mock/data';

const route = useRoute();

const currentTab = computed(() => route.name as string);

const svgAttrs: Record<string, string | number> = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 2,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};

function makeIcon(paths: string, viewBox = '0 0 24 24') {
  return defineComponent({
    props: { size: { type: Number, default: 24 } },
    setup(props) {
      return () => {
        const p: any = {
          width: props.size,
          height: props.size,
          viewBox,
          ...svgAttrs,
          innerHTML: paths,
        };
        return h('svg', p);
      };
    },
  });
}

const IconDownload = makeIcon(
  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
);
const IconSettings = makeIcon(
  '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
);
const IconChartNoAxes = makeIcon(
  '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
);
const IconArrowRight = makeIcon('<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>');
const IconChevronDown = makeIcon('<path d="m6 9 6 6 6-6"/>');
const IconInfo = makeIcon(
  '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="11" y2="17"/><line x1="12" x2="12.01" y1="8" y2="8"/>',
);
const IconTrendingUp = makeIcon(
  '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
);
const IconTrendingDown = makeIcon(
  '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
);
const IconMedal = makeIcon(
  '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h2v-2"/>',
);
const IconShare2 = makeIcon(
  '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
);
const IconCalendar = makeIcon(
  '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
);
const IconEye = makeIcon(
  '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
);
const IconArrowDown = makeIcon('<line x1="12" x2="12" y1="5" y2="19"/><polyline points="19 12 12 19 5 12"/>');
const IconUsers = makeIcon(
  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v-2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
);
const IconTrophy = makeIcon(
  '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
);
const IconShield = makeIcon(
  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
);
const IconBarChart = makeIcon(
  '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
);
const IconTarget = makeIcon(
  '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
);
const IconRefresh = makeIcon(
  '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
);
const IconLock = makeIcon(
  '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
);
const IconUpload = makeIcon(
  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
);
const IconLayers = makeIcon(
  '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
);
const IconZap = makeIcon(
  '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
);
const IconActivity = makeIcon(
  '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
);
const IconHeart = makeIcon(
  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 1.5-1.5-1-2.74-1.5-4.5-1.5A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
);
const IconSearch = makeIcon(
  '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
);

function barWidth(pct: string): string {
  const num = parseFloat(pct.replace('%', ''));
  return Math.min(100, num * 5) + '%';
}

function barSegWidth(val: number): string {
  const maxVal = 411; // 最大引用次数
  return Math.min(100, (val / maxVal) * 100) + '%';
}

const pieSegments = computed(() => {
  const circumference = 2 * Math.PI * 88;
  let offset = 0;
  return platformRatio.map((item: { name: string; value: number; color: string }) => {
    const length = (item.value / 100) * circumference;
    const seg = {
      color: item.color,
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -offset,
      transform: 'rotate(-90 110 110)',
    };
    offset += length;
    return seg;
  });
});

// 信源洞察 - 趋势图Y轴标签
const siTrendYLabels = [
  { text: '450', y: 10 },
  { text: '338', y: 75 },
  { text: '225', y: 140 },
  { text: '113', y: 205 },
  { text: '0', y: 270 },
];

// 信源洞察 - 自有内容趋势图Y轴标签
const trend3YLabels2 = [
  { text: '1.2%', y: 10 },
  { text: '0.9%', y: 45 },
  { text: '0.6%', y: 80 },
  { text: '0.3%', y: 115 },
  { text: '0%', y: 150 },
];

// 信源洞察 - 自有内容趋势图X轴标签
const siTrendXLabels2 = [
  { text: '08-21', x: 40 },
  { text: '08-22', x: 125 },
  { text: '08-23', x: 210 },
  { text: '08-24', x: 295 },
  { text: '08-25', x: 380 },
  { text: '08-26', x: 465 },
  { text: '08-27', x: 550 },
];

// 信源洞察 - 趋势图X轴标签
const siTrendXLabels = [
  { text: '08-21', x: 40 },
  { text: '08-22', x: 168 },
  { text: '08-23', x: 296 },
  { text: '08-24', x: 425 },
  { text: '08-25', x: 553 },
  { text: '08-26', x: 681 },
  { text: '08-27', x: 810 },
];

// 信源洞察 - 趋势图折线数据
const trendLines = [
  { color: '#10b981', path: 'M40,234C82,236,125,238,168,238C211,238,254,228,297,228C339,228,382,254,425,254C468,254,511,241,553,238C596,234,639,231,682,231C724,231,767,238,810,244' },
  { color: '#6366f1', path: 'M40,234C82,232,125,229,168,228C211,226,254,225,297,225C339,225,382,234,425,238C468,241,511,247,553,247C596,247,639,221,682,221C724,221,767,233,810,244' },
  { color: '#f59e0b', path: 'M40,195C82,218,125,241,168,241C211,241,254,235,297,231C339,227,382,218,425,218C468,218,511,247,553,247C596,247,639,220,682,218C724,216,767,215,810,215' },
  { color: '#ef4444', path: 'M40,244C82,229,125,215,168,215C211,215,254,231,297,231C339,231,382,230,425,228C468,226,511,214,553,212C596,209,639,208,682,208C724,208,767,212,810,215' },
  { color: '#8b5cf6', path: 'M40,202C82,208,125,215,168,215C211,215,254,208,297,208C339,208,382,208,425,208C468,208,511,222,553,228C596,234,639,244,682,244C724,244,767,242,810,241' },
  { color: '#06b6d4', path: 'M40,182C82,182,125,182,168,182C211,182,254,208,297,208C339,208,382,197,425,188C468,179,511,175,553,175C596,175,639,188,682,195C724,202,767,208,810,211' },
  { color: '#14b8a6', path: 'M40,221C82,228,125,234,168,234C211,234,254,221,297,215C339,209,382,202,425,202C468,202,511,221,553,228C596,235,639,241,682,241C724,241,767,238,810,234' },
  { color: '#f97316', path: 'M40,247C82,241,125,234,168,234C211,234,254,247,297,253C339,259,382,260,425,260C468,260,511,253,553,250C596,247,639,244,682,244C724,244,767,247,810,250' },
  { color: '#84cc16', path: 'M40,250C82,250,125,250,168,250C211,250,254,253,297,253C339,253,382,250,425,250C468,250,511,253,553,253C596,253,639,253,682,253C724,253,767,253,810,253' },
  { color: '#ec4899', path: 'M40,253C82,253,125,253,168,253C211,253,254,256,297,256C339,256,382,253,425,253C468,253,511,256,553,256C596,256,639,256,682,256C724,256,767,256,810,256' },
];

// 信源洞察 - 格式化提示文字
function formatInsightTip(tip: string): string {
  return tip
    .replace(/(抖音|豆包)/g, '<span class="si-tip-bold">$1</span>')
    .replace(/(\d+次)/g, '<span class="si-tip-bold">$1</span>');
}

// 信源洞察 - 单元格背景色
function cellBg(val: number): string {
  if (val === 0) return 'rgba(99, 102, 241, 0.08)';
  const intensity = Math.min(0.68, 0.08 + val / 600);
  return `rgba(99, 102, 241, ${intensity})`;
}

// 信源洞察 - 总被引进度条宽度
function totalBarWidth(val: number): string {
  const maxVal = 411; // 最大引用次数
  return Math.min(100, (val / maxVal) * 100) + '%';
}

// ===== AI竞品透视 helpers =====
const platformGroups = [
  { key: 'combined', label: '综合' },
  { key: 'doubao', label: '豆包' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'wenxin', label: '文心一言' },
  { key: 'qwen', label: '通义千问' },
  { key: 'yuanbao', label: '元宝' },
  { key: 'doubaoApp', label: '豆包·APP' },
  { key: 'deepseekApp', label: 'DeepSeek·APP' },
  { key: 'qwenApp', label: '通义千问·APP' },
] as const;

// 每行序号颜色（10种循环）
const rowColors = [
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#9333ea', // purple-600
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
];

function rowColor(id: number): string {
  return rowColors[(id - 1) % rowColors.length];
}

function firstPctColor(val: number): string {
  return val > 0 ? '#f97316' : '#9ca3af';
}

function platformCellClass(type: 'mention' | 'top3' | 'first', val: number): string {
  if (val <= 0) return 'cp-cell cp-cell--zero';
  if (type === 'mention') return 'cp-cell cp-cell--mention';
  if (type === 'top3') return 'cp-cell cp-cell--top3';
  return 'cp-cell cp-cell--first';
}

function mentionBarWidth(count: number): number {
  const max = 7;
  return Math.round((count / max) * 100);
}

const openProblems = ref<number[]>([1]);

function toggleProblem(id: number) {
  const idx = openProblems.value.indexOf(id);
  if (idx >= 0) {
    openProblems.value.splice(idx, 1);
  } else {
    openProblems.value.push(id);
  }
}

const engineFilter = ref('doubao');
const dateFilter = ref('2026-08-26');
const showAddQuestion = ref(false);

const allEngine = ref('all');
const allType = ref('all');

const newQuestionForm = reactive({
  content: '',
  engine: 'doubao',
});

const visibleEngines = computed(() => engines.filter(e => !e.locked));

const rankingData = computed(() =>
  topicRanking.map(r => ({
    question: r.question,
    doubao: r.doubao,
    deepseek: r.deepseek,
    yuanbao: r.yuanbao,
  }))
);

const competitorRankingData = computed(() => [
  { brand: 'HANYUAI', doubao: 1, deepseek: 3, yuanbao: 0 },
  { brand: '美图云', doubao: 2, deepseek: 2, yuanbao: 1 },
  { brand: '可灵AI', doubao: 3, deepseek: 5, yuanbao: 2 },
  { brand: '即梦AI', doubao: 4, deepseek: 4, yuanbao: 3 },
  { brand: 'Runway', doubao: 0, deepseek: 6, yuanbao: 0 },
]);

function getRankClass(rank: number) {
  if (rank === 0) return 'rank-empty';
  if (rank <= 3) return 'rank-top3';
  return 'rank-normal';
}

function getEngineColor(engine: string) {
  const map: Record<string, string> = {
    doubao: 'blue',
    deepseek: 'purple',
    yuanbao: 'red',
    wenxin: 'green',
    qianwen: 'pink',
  };
  return map[engine] || 'gray';
}

function getEngineLabel(engine: string) {
  return engines.find(e => e.key === engine)?.label || engine;
}

// ===== Ranking tab helpers =====
const engineShortMap: Record<string, string> = {
  豆包: '豆',
  DeepSeek: 'DS',
  文心一言: 'WX',
  通义千问: 'TY',
  元宝: 'YB',
};

function engineShort(label: string) {
  return engineShortMap[label] || label.slice(0, 2);
}

function rankBadgeClass(rank: number) {
  if (rank === 1) return 'rk-badge--1';
  if (rank === 2) return 'rk-badge--2';
  if (rank === 3) return 'rk-badge--3';
  return 'rk-badge--normal';
}

function rankCellClass(rank: number) {
  if (rank === 0) return 'rk-cell--empty';
  if (rank <= 3) return 'rk-cell--top3';
  return 'rk-cell--normal';
}

function formatPct(v: number) {
  return `${v.toFixed(2)}%`;
}

const matrixEngineKeys = ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao'] as const;

// ===== 排名趋势 SVG 计算 =====
const trendPadL = 40;
const trendPadT = 10;
const trendPlotW = 468;
const trendPlotH = 375;
const trendMaxRank = 7;

// 趋势图 Y 轴标签数据
const trendYLabels = [
  { text: '第1名', y: 10 },
  { text: '第2名', y: 72.5 },
  { text: '第3名', y: 135 },
  { text: '第4名', y: 197.5 },
  { text: '第5名', y: 260 },
  { text: 'Top10', y: 322.5 },
  { text: '未上榜', y: 385 },
];

function trendX(i: number) {
  const n = rankingTrend.labels.length;
  return trendPadL + Math.round((i * trendPlotW) / (n - 1));
}

function trendY(rankVal: number) {
  return trendPadT + Math.round(((rankVal - 1) / (trendMaxRank - 1)) * trendPlotH);
}

function miniSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`;
  }
  return d;
}

// 迷你曲线图坐标轴标签数据
const miniChartYLabels = [
  { text: '0', y: 90 },
  { text: '25', y: 68.75 },
  { text: '50', y: 47.5 },
  { text: '75', y: 26.25 },
  { text: '100', y: 6.75 },
];
const miniChartXLabels = [
  { text: '08-21', x: 40 },
  { text: '08-22', x: 70 },
  { text: '08-24', x: 131 },
  { text: '08-27', x: 214 },
];

function miniChartPoints(chart: number[]) {
  const padL = 40, plotW = 174, plotT = 5, plotH = 85;
  const max = 100;
  return chart.map((v, i) => ({
    x: Math.round(padL + (i * plotW) / (chart.length - 1)),
    y: Math.round(plotT + (1 - v / max) * plotH),
  }));
}

function miniLinePath(chart: number[]): string {
  return miniSmoothPath(miniChartPoints(chart));
}

function miniAreaPath(chart: number[], _key: string): string {
  const pts = miniChartPoints(chart);
  const baseY = 90;
  return `${miniSmoothPath(pts)} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
}

const trendCombinedColor = computed(
  () => rankingTrend.series.find(s => s.key === 'combined')!.color
);

const trendCombinedPoints = computed(() =>
  rankingTrend.series
    .find(s => s.key === 'combined')!
    .values.map((v, i) => ({ x: trendX(i), y: trendY(v) }))
);

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`;
  }
  return d;
}

const trendAreaPath = computed(() => {
  const pts = trendCombinedPoints.value;
  const baseY = trendPadT + trendPlotH;
  return `${smoothPath(pts)} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
});
</script>

<style lang="scss" scoped>
.ranking-page {
  padding: 16px 24px;
  background: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #111827;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .toolbar-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 600;
    background: #eef2ff;
    color: #4338ca;
  }
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px;
    letter-spacing: -0.025em;
  }

  .page-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
}

.tab-content {
  margin-bottom: 20px;
}

.content-card {
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  background: #fff;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin-bottom: 12px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.competitor-card {
  text-align: center;

  .comp-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #111827;
  }

  .comp-metrics {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .metric {
      display: flex;
      justify-content: space-between;

      .metric-label {
        color: #6b7280;
      }
      .metric-value {
        font-weight: 600;
        color: #4338ca;
      }
    }
  }
}

.rank-empty {
  color: #d1d5db;
}
.rank-top3 {
  color: #dc2626;
  font-weight: 600;
}
.rank-normal {
  color: #111827;
}

:deep(.arco-btn-primary) {
  background-color: #4338ca;
  border-color: #4338ca;

  &:hover {
    background-color: #6366f1;
    border-color: #6366f1;
  }
}

/* ===== AI排名透视 (Ranking tab) ===== */
.rank-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 80px;
  animation: rk-fadeIn 0.4s ease-out;
}

@keyframes rk-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Header */
.rk-header {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

@media (min-width: 768px) {
  .rk-header {
    flex-direction: row;
    align-items: flex-end;
  }
}

.rk-header-left {
  min-width: 0;
}

.rk-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.2;
}

.rk-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.rk-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 通用按钮 */
.rk-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 4px;
  line-height: 1.2;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &--indigo {
    color: #4f46e5;
    border-color: #c7d2fe;

    &:hover { background: #eef2ff; }
  }

  &--gray {
    color: #374151;
    border-color: #e5e7eb;

    &:hover { background: #f9fafb; }
  }
}

/* 卡片 */
.rk-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 卡片头部 */
.rk-card-head {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f3f4f6;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.rk-card-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rk-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--indigo {
    background: #e0e7ff;
    color: #4f46e5;
  }

  &--solid {
    background: #4f46e5;
    color: #fff;
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3),
      0 4px 6px -4px rgba(79, 70, 229, 0.2);
  }
}

.rk-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.rk-card-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rk-mini-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  background: #fff;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.2;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &--indigo {
    color: #4f46e5;
    border-color: #c7d2fe;

    &:hover { background: #eef2ff; }
  }
}

.rk-period {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rk-period-label {
  font-size: 12px;
  color: #9ca3af;
  user-select: none;
}

.rk-date-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  min-width: 200px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  line-height: 1.2;
}

/* 筛选行 */
.rk-filter-row {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid #f9fafb;
}

.rk-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rk-filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
}

.rk-filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  line-height: 1.2;

  &--130 { min-width: 130px; }
  &--180 { min-width: 180px; }
  &--clamp { min-width: clamp(180px, 24vw, 320px); }
}

/* 排名指标网格 */
.rk-metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 20px;
}

@media (min-width: 768px) {
  .rk-metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.rk-metric-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.rk-metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.rk-metric-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rk-metric-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.rk-info-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
  cursor: help;
}

.rk-metric-value-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1;
}

.rk-metric-value {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.rk-metric-pct {
  font-size: 18px;
}

.rk-metric-sub {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 4px;
}

.rk-mini-chart {
  height: 120px;
}

.rk-mini-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.rk-metric-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  span {
    font-size: 12px;
    color: #9ca3af;
  }
}

/* 品牌排名网格 */
.rk-rank-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 20px;
}

@media (min-width: 1024px) {
  .rk-rank-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .rk-rank-col--list { grid-column: span 4 / span 4; }
  .rk-rank-col--trend { grid-column: span 8 / span 8; }
}

.rk-rank-col {
  display: flex;
  flex-direction: column;
}

.rk-rank-panel {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 480px;
}

.rk-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rk-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.rk-panel-sub {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.rk-fix-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  line-height: 1.2;
  transition: color 0.15s ease;

  &:hover { color: #4f46e5; }
}

/* 排名榜单 */
.rk-rank-list {
  flex: 1;
  overflow-y: auto;
  margin: 0 -4px;
  padding: 0 4px;
}

.rk-rank-list-inner {
  display: flex;
  flex-direction: column;
}

.rk-rank-item {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid #f3f4f6;
  grid-template-columns: 32px 1fr auto;
  transition: background 0.15s ease;

  &:last-child { border-bottom: 0; }
  &:hover { background: rgba(249, 250, 251, 0.6); }
}

.rk-rank-num-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  line-height: 1;

  &.rk-badge--1 {
    background: linear-gradient(to bottom right, #facc15, #fb923c);
    color: #fff;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  &.rk-badge--2 {
    background: linear-gradient(to bottom right, #d1d5db, #9ca3af);
    color: #fff;
  }
  &.rk-badge--3 {
    background: linear-gradient(to bottom right, #d97706, #b45309);
    color: #fff;
  }
  &.rk-badge--normal {
    background: #f3f4f6;
    color: #6b7280;
  }
}

.rk-rank-badge {
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.rk-badge--new {
  color: #1d4ed8;
  background: #eff6ff;
}
.rk-badge--up {
  color: #059669;
  background: #ecfdf5;
}
.rk-badge--down {
  color: #ef4444;
  background: #fef2f2;
}

.rk-rank-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.rk-rank-brand-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--brand {
    color: #7c3aed;
    font-weight: 800;
  }
}

.rk-rank-engines {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
}

.rk-engine-tag {
  font-size: 10.5px;
  font-weight: 700;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  line-height: 1.2;
}

/* 排名趋势图 */
.rk-trend-chart {
  flex: 1;
  min-height: 0;
  display: flex;
}

.rk-trend-svg {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: block;
}

.rk-grid-line {
  stroke: #f1f5f9;
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.rk-trend-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.rk-trend-xlabel {
  font-size: 12px;
  fill: #9ca3af;
}

/* 全景排名矩阵卡片 */
.rk-matrix-card {
  display: flex;
  flex-direction: column;
  animation: rk-fadeInUp 0.4s ease-out;
}

@keyframes rk-fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.rk-matrix-head {
  padding: 24px 32px;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(to right, #fff, rgba(238, 242, 255, 0.2));
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.rk-matrix-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rk-matrix-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.3;
}

.rk-matrix-sub {
  font-size: 10px;
  color: #9ca3af;
  margin: 2px 0 0;
  line-height: 1.4;
}

.rk-matrix-head-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.rk-matrix-date {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rk-matrix-date-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rk-date-input {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-family: inherit;
}

.rk-cols-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  color: #4b5563;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  line-height: 1.2;
  transition: background 0.15s ease;

  &:hover { background: #f9fafb; }
}

.rk-matrix-body {
  padding: 0 20px 20px;
  padding-top: 12px;
}

.rk-matrix-table-wrap {
  max-height: 90vh;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  scrollbar-gutter: stable;
}

.rk-matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12.5px;
}

.rk-mth {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fafafe;
  font-size: 11.5px;
  font-weight: 600;
  color: #6e6e7a;
  border-bottom: 1px solid #e1e1ec;
  box-shadow: #ececf3 0 2px 0, rgba(50, 50, 80, 0.06) 0 6px 12px;
  padding: 10px 14px;
  text-align: center;
  white-space: nowrap;
}

.rk-mth--question {
  text-align: left;
}

.rk-mth--center {
  text-align: center;
}

.rk-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6e6e7a;
  font-size: 11.5px;
  font-weight: 600;
  padding: 0;
  line-height: 1.2;
}

.rk-mtr {
  transition: background 0.15s ease;

  &:hover { background: #f9fafb; }
}

.rk-mtd {
  padding: 10px 14px;
  vertical-align: middle;
  border-bottom: 1px solid #f2f2f8;
  text-align: center;
}

.rk-mtd--question {
  text-align: left;
  max-width: 240px;
  white-space: normal;
  line-height: 1.4;
}

.rk-question-text {
  font-size: 12.5px;
  color: #374151;
  display: block;
}

.rk-mtd--center {
  text-align: center;
}

.rk-mtd--pct {
  text-align: center;
}

.rk-mtd--engine {
  text-align: center;
  border-left: 2px solid #ececef;
}

.rk-combined-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
  color: #6e6e7a;
  line-height: 1.2;
}

.rk-pct-cell {
  font-size: 12.5px;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
  font-weight: 600;
  color: #3a3a45;
}

.rk-engine-cell {
  display: inline-block;
  min-width: 36px;
  padding: 3px 7px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.2;

  &:hover {
    box-shadow: 0 0 0 2px #a5b4fc;
  }

  &.rk-cell--empty {
    background: #fef2f2;
    color: #c01825;
  }
  &.rk-cell--top3 {
    background: #fff5e3;
    color: #b67900;
  }
  &.rk-cell--normal {
    background: #fafafe;
    color: #6e6e7a;
  }
}

/* ===== AI竞品透视 (RankingCompetitor) ===== */
.cp-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 80px;
  animation: cp-fadeIn 0.4s ease-out;
}

@keyframes cp-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Header */
.cp-header {
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .cp-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.cp-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.2;
}

.cp-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.cp-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cp-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.2;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &--indigo {
    color: #4f46e5;
    border-color: #c7d2fe;
    &:hover { background: #eef2ff; }
  }
  &--gray {
    color: #374151;
    border-color: #e5e7eb;
    &:hover { background: #f9fafb; }
  }
}

/* 指标卡片 */
.cp-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 1024px) {
  .cp-metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.cp-metric-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  padding: 20px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.cp-metric-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 14px;
  margin-bottom: 8px;
}

.cp-metric-label-text {
  font-weight: 500;
}

.cp-metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.cp-metric-value {
  color: #111827;
  letter-spacing: -0.02em;

  &--xl {
    font-size: 24px;
    font-weight: 800;
    line-height: 1.2;
  }
  &--lg {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.3;
  }
}

.cp-metric-truncate {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cp-metric-sub {
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

/* 卡片容器 */
.cp-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.cp-card-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.2;

  :deep(svg) {
    color: #6366f1;
  }
}

/* 表格通用 */
.cp-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.cp-table-wrap--scroll {
  max-height: 70vh;
  overflow: auto;
}

.cp-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12.5px;
}

.cp-table--platform {
  min-width: 1520px;
}

.cp-th {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(249, 250, 251, 0.95);
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 16px;
  text-align: left;
  white-space: nowrap;
  line-height: 1.5rem;
}

.cp-th--num,
.cp-th--num2,
.cp-th--pct {
  text-align: center;
  padding: 12px 8px;
}

.cp-th--brand {
  text-align: left;
}

.cp-th--bar {
  text-align: left;
}

/* ===== 分平台表格样式 ===== */
.cp-thead--platform {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 20;
}

.cp-th--group {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  background: transparent;
  box-shadow: none;
  position: static;
  top: auto;
  z-index: auto;
}

.cp-th--group--combined {
  background: rgba(248, 250, 252, 0.8);
}

.cp-th--group--app {
  color: #4b5563;
  cursor: pointer;
}

.cp-group-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f9fafb;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.cp-group-badge--combined {
  background: #f1f5f9;
  color: #475569;
}

.cp-group-badge--app {
  background: #f9fafb;
  color: #4b5563;
}

.cp-lock-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.cp-th--platform-brand {
  position: sticky;
  left: 0;
  z-index: 10;
  background: #fff;
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  border-right: 1px solid #f3f4f6;
  vertical-align: bottom;
  border-bottom: 0;
  box-shadow: none;
  top: auto;
}

.cp-th--sub {
  text-align: center;
  padding: 8px;
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  background: transparent;
  border-bottom: 0;
  border-top: 0;
  box-shadow: none;
  position: static;
  top: auto;
  z-index: auto;
}

.cp-th--sub--combined {
  background: rgba(248, 250, 252, 0.6);
}

.cp-th--sub--last {
  border-right: 1px solid #f3f4f6;
}

.cp-tr {
  transition: background 0.15s ease;
  border-bottom: 1px solid #f9fafb;

  &:last-child { border-bottom: 0; }
  &:hover { background: rgba(248, 250, 252, 0.6); }

  &.cp-tr--brand {
    background: rgba(239, 246, 255, 0.4);
    &:hover { background: rgba(239, 246, 255, 0.6); }
  }
}

.cp-td {
  padding: 12px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f9fafb;
  text-align: left;
  line-height: 1.5rem;
}

.cp-td--num {
  text-align: center;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.cp-rank-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', monospace;
  line-height: 1;
}

/* 分平台标签 */
.cp-platform-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.cp-platform-tag {
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }

  &.cp-platform-tag--mention {
    color: #4f46e5;
    &::before { background: #4f46e5; }
  }
  &.cp-platform-tag--top3 {
    color: #8b5cf6;
    &::before { background: #8b5cf6; }
  }
  &.cp-platform-tag--first {
    color: #f97316;
    &::before { background: #f97316; }
  }
}

.cp-td--num2 {
  text-align: center;
  padding: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.cp-td--pct {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
}

.cp-pct--mention { color: #4f46e5; }
.cp-pct--top3 { color: #8b5cf6; }
.cp-pct--first { color: #9ca3af; }

/* 分平台数据行 */
.cp-tr--platform {
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s ease;
  &:hover { background: rgba(249, 250, 251, 0.5); }
  &:last-child { border-bottom: 0; }
}

.cp-td--platform-brand {
  position: sticky;
  left: 0;
  z-index: 1;
  background: #fff;
  padding: 12px 16px;
  border-right: 1px solid #f9fafb;
  text-align: left;
  vertical-align: middle;
}

.cp-brand-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cp-td--platform-brand .cp-brand-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cp-td--platform-brand .cp-brand-name--brand {
  color: #1d4ed8;
  font-weight: 500;
}

.cp-num-circle {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', monospace;
}

.cp-brand-tag {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #dbeafe;
  color: #1d4ed8;
}

.cp-td--platform {
  text-align: center;
  padding: 12px 8px;
  vertical-align: middle;
}

.cp-td--platform--combined {
  background: rgba(248, 250, 252, 0.4);
}

.cp-td--platform--last {
  border-right: 1px solid #f3f4f6;
}

/* 数据单元格span标签 */
.cp-cell {
  display: inline-flex;
  min-width: 62px;
  justify-content: center;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.cp-cell--mention {
  background: #e0e7ff;
  color: #4338ca;
}

.cp-cell--top3 {
  min-width: 72px;
  background: #f5f3ff;
  color: #6d28d9;
}

.cp-cell--first {
  background: #fef3c7;
  color: #b45309;
}

.cp-cell--zero {
  background: #f9fafb;
  color: #d1d5db;
}

.cp-table--platform .cp-tr {
  border-bottom: 0;
}

.cp-td--brand {
  text-align: left;
  max-width: 260px;
  padding: 12px 16px;
}

.cp-brand-name {
  font-size: 14px;
  color: #000000;
  font-weight: 400;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  &.cp-brand-name--brand {
    color: #000000;
    font-weight: 400;
  }
}

/* 频次条 */
.cp-bar-track {
  width: 100%;
  min-width: 80px;
  height: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.cp-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

/* 问题明细列表 */
.cp-problem-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cp-problem-item {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.cp-problem-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;
  gap: 16px;

  &:hover {
    background: rgba(249, 250, 251, 0.5);
  }
}

.cp-problem-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
}

.cp-problem-keyword {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.cp-problem-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e0e7ff;
  color: #4338ca;
  line-height: 1.4;
  white-space: nowrap;
}

.cp-problem-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.cp-brand-rank-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;

  &.cp-brand-rank--in {
    background: #f5f3ff;
    color: #6d28d9;
  }
  &.cp-brand-rank--out {
    background: #fef2f2;
    color: #c01825;
  }
}

.cp-engine-box-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cp-engine-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 4px 12px;
  min-width: 48px;
}

.cp-engine-box-name {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 400;
  line-height: 1.2;
}

.cp-engine-box-rank {
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
  line-height: 1.2;

  &.cp-engine-rank--in {
    color: #111827;
  }
  &.cp-engine-rank--out {
    color: #d1d5db;
  }
}

.cp-problem-chevron {
  color: #9ca3af;
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &.cp-problem-chevron--open {
    transform: rotate(180deg);
  }
}

.cp-problem-detail {
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
  background: #fafafe;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cp-problem-detail-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
  flex-wrap: wrap;
}

.cp-problem-detail-label {
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.cp-problem-detail-value {
  color: #111827;
  font-weight: 500;
}

/* ===== 引用源追溯页面样式 ===== */
.cit-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.3s ease;
}

.cit-header {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.cit-header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cit-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin: 0;
}

.cit-subtitle {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 12px;
}

.cit-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
}

.cit-btn--outline {
  background: #fff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover { background: #eef2ff; }
}

.cit-btn--indigo {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover { background: #4338ca; }
}

.cit-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 600px;
  overflow: visible;
}

.cit-filter-bar {
  width: 100%;
  background: #fff;
  padding: 16px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
}

.cit-filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.cit-filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  user-select: none;
}

.cit-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
}

.cit-select--question {
  background: #f9fafb;
  border-color: #f3f4f6;
  border-radius: 12px;
  padding: 8px 16px;
  min-width: 200px;
  max-width: 300px;
  &:hover { border-color: #d1d5db; }
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.cit-select--engine {
  border-radius: 8px;
  padding: 6px 12px;
  min-width: 140px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover { border-color: #a5b4fc; }
}

.cit-select--date {
  border-radius: 8px;
  padding: 6px 12px;
  min-width: 140px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover { border-color: #a5b4fc; }
}

.cit-engine-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cit-engine-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.cit-select-arrow {
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.cit-table-wrap {
  overflow-x: auto;
  width: 100%;
}

.cit-table {
  width: 100%;
  min-width: 1000px;
  text-align: left;
  border-collapse: collapse;
}

.cit-table thead {
  background: rgba(249, 250, 251, 0.5);
  border-bottom: 1px solid #f3f4f6;
}

.cit-th {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 16px 24px;
  cursor: pointer;
  transition: color 0.15s ease;
  user-select: none;
  &:hover { color: #4b5563; }
}

.cit-th--platform {
  width: 33.33%;
  padding: 16px 32px;
  text-align: left;
  cursor: pointer;
}

.cit-th--cite,
.cit-th--authority,
.cit-th--models,
.cit-th--channel,
.cit-th--action {
  text-align: center;
  padding: 16px 24px;
}

.cit-th-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cit-th-content--center {
  justify-content: center;
}

.cit-th-arrow {
  color: #d1d5db;
  transition: transform 0.2s ease;
}

.cit-th-arrow--active {
  color: #6366f1;
}

.cit-info-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  color: #d1d5db;
  transition: all 0.15s ease;
  cursor: help;
  &:hover {
    background: #e5e7eb;
    color: #4b5563;
  }
}

.cit-table tbody {
  & tr + tr { border-top: 1px solid #f9fafb; }
}

.cit-tr {
  transition: all 0.15s ease;
  cursor: pointer;
  &:hover { background: rgba(249, 250, 251, 0.5); }
}

.cit-td {
  padding: 20px 24px;
  vertical-align: middle;
}

.cit-td--platform {
  padding: 20px 24px;
}

.cit-td--cite,
.cit-td--authority,
.cit-td--models,
.cit-td--channel,
.cit-td--action {
  text-align: center;
  padding: 20px 24px;
}

.cit-platform-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cit-expand-icon {
  color: #9ca3af;
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.cit-platform-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cit-platform-name {
  font-size: 14px;
  font-weight: 800;
  color: #1f2937;
}

.cit-article-badge {
  padding: 1px 8px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  white-space: nowrap;
}

.cit-platform-cat {
  margin-top: 2px;
  font-size: 12px;
  color: #9ca3af;
}

.cit-cite-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cit-cite-numbers {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.cit-cite-num {
  font-size: 16px;
  font-weight: 900;
  color: #111827;
}

.cit-cite-pct {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
}

.cit-cite-bar {
  width: 64px;
  height: 4px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.cit-cite-bar-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.cit-auth-badge {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 999px;
  border: 1px solid;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
}

.cit-auth-badge--blue {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.cit-auth-badge--green {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.cit-auth-none {
  font-size: 12px;
  color: #d1d5db;
}

.cit-models {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.cit-model-tag {
  font-size: 10px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
  white-space: nowrap;
}

.cit-model-count {
  margin-left: 4px;
  opacity: 0.8;
}

.cit-channel-locked {
  font-size: 11px;
  color: #d1d5db;
}

.cit-channel-points {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
}

.cit-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  border-radius: 6px;
  border: 1px solid #6366f1;
  background: #fff;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  transition: all 0.15s ease;
  cursor: pointer;
  &:hover {
    background: #6366f1;
    color: #fff;
  }
}

/* ===== 信源平台偏好页面样式 ===== */
.sp-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.sp-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.sp-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.sp-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.sp-filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.sp-filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  user-select: none;
}

.sp-date-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  min-width: 200px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
  &:hover { border-color: #a5b4fc; }
}

.sp-date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sp-date-arrow {
  color: #9ca3af;
}

.sp-platform-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
}

.sp-tab {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.15s ease;
  border: none;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
  &:hover { background: #f9fafb; }
}

.sp-tab--active {
  background: #4f46e5;
  color: #fff;
  &:hover { background: #4338ca; }
}

.sp-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.sp-search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.sp-search-input {
  padding: 8px 12px 8px 36px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  width: 192px;
  outline: none;
  transition: all 0.15s ease;
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
}

.sp-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.sp-metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.15s ease;
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
}

.sp-metric-card--indigo:hover { border-color: #c7d2fe; }
.sp-metric-card--amber:hover { border-color: #fde68a; }
.sp-metric-card--emerald:hover { border-color: #a7f3d0; }

.sp-metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.sp-metric-icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
}

.sp-metric-icon--amber {
  background: #fffbeb;
  color: #d97706;
}

.sp-metric-icon--emerald {
  background: #ecfdf5;
  color: #059669;
}

.sp-metric-info {
  min-width: 0;
}

.sp-metric-label {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 2px;
}

.sp-metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
}

.sp-charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  max-width: 880px;
}

.sp-chart-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.sp-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.sp-chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.sp-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sp-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.sp-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.sp-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  height: 380px;
}

.sp-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sp-bar-label {
  font-size: 12px;
  color: #6b7280;
  width: 120px;
  flex-shrink: 0;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-bar-track {
  flex: 1;
  height: 20px;
  background: #f9fafb;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.sp-bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.sp-pie-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  height: 220px;
}

.sp-pie-svg {
  width: 233px;
  height: 220px;
}

.sp-pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.sp-pie-total {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
}

.sp-pie-label {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.sp-pie-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.sp-pie-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.sp-pie-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.sp-pie-legend-name {
  color: #4b5563;
  flex-shrink: 0;
}

.sp-pie-legend-bar-wrap {
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.sp-pie-legend-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.sp-pie-legend-value {
  font-weight: 600;
  color: #111827;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  width: 40px;
  text-align: right;
}

.sp-detail-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.sp-detail-header {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.sp-table-wrap {
  overflow-x: auto;
}

.sp-table {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}

.sp-table thead tr {
  background: #f9fafb;
  color: #6b7280;
}

.sp-th {
  padding: 12px 24px;
  font-weight: 500;
  font-size: 14px;
}

.sp-th--left {
  text-align: left;
}

.sp-th--center {
  text-align: center;
}

.sp-th--right {
  text-align: right;
}

.sp-th-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.sp-table tbody tr {
  border-top: 1px solid #f9fafb;
  transition: background 0.15s ease;
  &:hover { background: #f9fafb; }
}

.sp-td {
  padding: 12px 24px;
}

.sp-td--rank {
  color: #9ca3af;
  font-weight: 500;
}

.sp-td--name {
  font-weight: 500;
}

.sp-name-text {
  color: #111827;
  font-weight: 500;
}

.sp-td--authority {
  text-align: center;
}

.sp-auth-badge {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 999px;
  border: 1px solid;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
}

.sp-auth-badge--blue {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.sp-auth-badge--green {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.sp-auth-none {
  font-size: 12px;
  color: #d1d5db;
}

.sp-td--cite {
  text-align: right;
  font-weight: 600;
  color: #111827;
}

.sp-td--articles {
  text-align: right;
  color: #4b5563;
}

.sp-td--models {
  padding: 12px 24px;
}

.sp-models {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sp-model-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  color: #fff;
  white-space: nowrap;
}

.sp-model-count {
  opacity: 0.8;
}

/* ===== 引用源洞察页面样式 ===== */
.si-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.si-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.si-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
}

.si-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.si-date-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
  &:hover { border-color: #a5b4fc; }
}

.si-date-icon {
  color: #9ca3af;
}

.si-date-sep {
  color: #d1d5db;
  margin: 0 2px;
}

.si-trend-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.si-trend-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-trend-icon {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.si-trend-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.si-trend-tip {
  color: #9ca3af;
  cursor: help;
  display: flex;
  align-items: center;
}

.si-engine-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-engine-label {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  user-select: none;
}

.si-engine-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  min-width: 120px;
  max-width: 240px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
  &:hover { border-color: #a5b4fc; }
}

.si-trend-chart {
  padding: 20px 24px;
}

.si-trend-svg {
  width: 100%;
  height: 300px;
}

.si-platform-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 16px;
  padding: 12px 24px 0;
}

.si-platform-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  opacity: 1;
  transition: opacity 0.15s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover { opacity: 0.7; }
}

.si-tag-line {
  width: 12px;
  height: 3px;
  border-radius: 999px;
  flex-shrink: 0;
}

.si-tag-name {
  color: #374151;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.si-tag-count {
  color: #9ca3af;
}

.si-insight-tip {
  margin: 16px 24px;
  padding: 12px 16px;
  background: #eef2ff;
  border-radius: 12px;
}

.si-insight-text {
  font-size: 13px;
  color: #3730a3;
  line-height: 1.625;
  margin: 0;
}

.si-tip-bold {
  font-weight: 700;
}

.si-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.si-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.si-metric-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 4px;
}

.si-metric-tab {
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #f9fafb; }
}

.si-metric-tab--active {
  background: #4f46e5;
  color: #fff;
  &:hover { background: #4338ca; }
}

.si-export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: #a5b4fc; }
}

.si-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.si-search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.si-search-input {
  padding: 8px 12px 8px 36px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  width: 200px;
  outline: none;
  transition: all 0.15s ease;
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
}

.si-tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.si-data-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 4px;
}

.si-data-tab {
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #f9fafb; }
}

.si-data-tab--active {
  background: #4f46e5;
  color: #fff;
}

.si-status-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 4px;
}

.si-status-tab {
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #f9fafb; }
}

.si-status-tab--active {
  background: #4f46e5;
  color: #fff;
}

.si-table-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-table-wrap {
  overflow-x: auto;
  padding: 16px 20px;
}

.si-persp-card .si-table-wrap {
  padding: 0 20px 8px;
}

.si-table {
  width: 100%;
  border-collapse: collapse;
}

.si-table thead tr {
  border-bottom: 1px solid #f3f4f6;
}

.si-th {
  padding: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
}

.si-th--rank {
  text-align: left;
  width: 40px;
  position: sticky;
  left: 0;
  z-index: 20;
  background: #fff;
}

.si-th--name {
  text-align: left;
  position: sticky;
  left: 40px;
  z-index: 20;
  background: #fff;
}

.si-th--engine {
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;
  &:hover { color: #4b5563; }
}

.si-th--total {
  text-align: right;
}

.si-table tbody tr {
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s ease;
  &:hover { background: #f9fafb; }
  &:last-child { border-bottom: none; }
}

.si-td {
  padding: 12px 8px;
  border-bottom: 1px solid #f9fafb;
  vertical-align: middle;
}

.si-td--rank {
  position: sticky;
  left: 0;
  z-index: 10;
  background: #fff;
}

.si-table tbody tr:hover .si-td--rank {
  background: #f9fafb;
}

.si-rank-circle {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: #4f46e5;
  color: #fff;
}

.si-rank-circle--gray {
  background: #f3f4f6;
  color: #6b7280;
}

.si-td--name {
  position: sticky;
  left: 40px;
  z-index: 10;
  background: #fff;
  white-space: nowrap;
}

.si-table tbody tr:hover .si-td--name {
  background: #f9fafb;
}

.si-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-name-text {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.si-badge {
  font-size: 10px;
  font-weight: 700;
  color: #4f46e5;
  background: #e0e7ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.si-td--engine {
  text-align: center;
}

.si-engine-cell {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 40px;
  border-radius: 6px;
  color: #1f2937;
}

.si-engine-val {
  font-size: 12.5px;
  font-family: monospace;
  font-weight: 600;
}

.si-engine-delta {
  font-size: 9px;
  font-weight: 600;
}

.si-engine-delta--up {
  color: #047857;
}

.si-engine-delta--down {
  color: #b91c1c;
}

.si-td--total {
  text-align: right;
}

.si-total-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.si-total-bar-wrap {
  width: 80px;
  height: 12px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.si-total-bar {
  height: 100%;
  background: #6366f1;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.si-total-val {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  width: 32px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.si-status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.si-status-badge--new {
  background: #d1fae5;
  color: #047857;
}

.si-status-badge--lost {
  background: #fee2e2;
  color: #b91c1c;
}

.si-load-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.si-load-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #4f46e5;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    background: #eef2ff;
  }
}

/* AI 引擎信源偏好卡片 */
.si-pref-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-pref-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.si-pref-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.si-pref-icon {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.si-pref-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.si-th--status {
  text-align: center;
}

.si-th--change {
  text-align: center;
}

.si-td--status {
  text-align: center;
  padding: 12px 8px;
}

.si-status-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.si-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.si-status-dot--continued {
  background: #3b82f6;
}

.si-status-dot--new {
  background: #10b981;
}

.si-status-text {
  font-size: 11px;
  font-weight: 500;
}

.si-status-text--continued {
  color: #2563eb;
}

.si-status-text--new {
  color: #059669;
}

.si-td--engine-text {
  text-align: center;
  padding: 12px 8px;
  font-size: 12.5px;
  font-family: monospace;
  color: #374151;
}

.si-td--total-text {
  text-align: center;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.si-td--change {
  text-align: center;
  padding: 12px 8px;
}

.si-change-val {
  font-size: 11.5px;
  font-weight: 600;
}

.si-change--up {
  color: #059669;
}

.si-change--down {
  color: #ef4444;
}

.si-load-more-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 16px;
}

.si-load-count {
  font-size: 12px;
  color: #9ca3af;
}

/* Panel 3: 自有内容收录趋势 */
.si-trend3-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-trend3-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.si-trend3-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.si-trend3-icon {
  width: 32px;
  height: 32px;
  background: #d1fae5;
  color: #047857;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.si-trend3-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.si-trend3-filters {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.si-dim-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 2px;
}

.si-dim-tab {
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { color: #374151; }
}

.si-dim-tab--active {
  background: #fff;
  color: #047857;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.si-trend3-chart {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 240px;
}

.si-trend3-svg {
  width: 100%;
  height: 240px;
}

/* Panel 3: 左右布局 */
.si-trend3-body {
  display: grid;
  grid-template-columns: 0.8fr 2.4fr;
  gap: 24px;
  align-items: center;
  padding: 0 24px 20px;
}

.si-trend3-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.si-stat-item {}

.si-stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.si-stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.si-stat-unit {
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
}

.si-stat-delta {
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.si-stat-delta--up {
  color: #059669;
}

.si-trend3-chart-wrap {
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  background: rgba(249, 250, 251, 0.5);
  padding: 16px;
}

.si-trend3-chart-wrap .si-trend3-svg {
  width: 100%;
  height: 180px;
}

.si-trend3-latest {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
}

.si-trend3-latest-val {
  font-weight: 700;
  color: #047857;
}

/* Panel 4: 引用源透视 */
.si-persp-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.si-persp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.si-persp-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.si-persp-icon {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.si-persp-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.si-persp-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #4f46e5;
  background: #eef2ff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: #e0e7ff; }
}

.si-persp-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px 8px;
}

.si-persp-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 24px 8px;
}

/* ============ 监控问题管理 ============ */
.qm-page {
  margin: -16px -24px;
  padding: 28px 36px 96px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #111827;
}

.qm-header-section {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 24px;
}

.qm-title-block {
  display: flex;
  flex-direction: column;
}

.qm-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.2;
}

.qm-desc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.qm-desc-text {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.5;
}

.qm-quota-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.qm-quota-item {
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid #f3f4f6;
}

.qm-quota-item--total {
  background: linear-gradient(to bottom, #fff, #f9fafb);
  border-radius: 12px 0 0 12px;
}

.qm-quota-item--page {
  background: #fff;
}

.qm-quota-item--pending {
  background: #fff;
}

.qm-quota-item:last-of-type {
  border-right: 1px solid #e0e7ff;
}

.qm-quota-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.qm-quota-label {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

.qm-quota-tip-icon {
  display: inline-flex;
  align-items: center;
  color: #9ca3af;
  cursor: help;
}

.qm-quota-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.qm-quota-dot--amber {
  background: #fbbf24;
}

.qm-quota-value {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
}

.qm-quota-value--red {
  color: #dc2626;
}

.qm-quota-value--indigo {
  color: #4f46e5;
}

.qm-quota-value--amber {
  color: #d97706;
}

.qm-quota-suffix {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
}

.qm-quota-upgrade {
  padding: 0 16px;
  background: #eef2ff;
  color: #4338ca;
  border: none;
  border-left: 1px solid #e0e7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #e0e7ff;
  }
}

.qm-upgrade-icon {
  color: #6366f1;
}

.qm-upgrade-text {
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.qm-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 400px;
}

.qm-card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: rgba(249, 250, 251, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.qm-card-title {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.qm-card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qm-search-wrap {
  position: relative;
  display: inline-block;
}

.qm-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.qm-search-input {
  padding: 8px 32px 8px 36px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  width: 192px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
    font-weight: 700;
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}

.qm-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  border: 1px solid;
  background: #fff;
}

.qm-action-btn--outline {
  color: #4f46e5;
  border-color: #c7d2fe;

  &:hover {
    background: #eef2ff;
  }
}

.qm-action-btn--outline-strong {
  color: #4f46e5;
  border-color: #a5b4fc;

  &:hover {
    background: #eef2ff;
  }
}

.qm-action-btn--disabled {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: pointer;
}

.qm-tabs-row {
  padding: 12px 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: #fff;
}

.qm-tab {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;
  background: #fff;
  color: #6b7280;
  border-color: #e5e7eb;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    border-color: #a5b4fc;
  }
}

.qm-tab--active {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;

  &:hover {
    border-color: #4f46e5;
  }
}

.qm-tab--new {
  border-style: dashed;
  border-color: #d1d5db;
  color: #6b7280;
  background: #f9fafb;

  &:hover {
    border-color: #818cf8;
    color: #4f46e5;
  }
}

.qm-tab-count {
  color: #9ca3af;
  font-weight: 400;
}

.qm-table-header {
  display: grid;
  grid-template-columns: 2fr 6fr 1.6fr 88px 80px 68px;
  gap: 16px;
  padding: 12px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
  align-items: center;
}

.qm-th {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qm-th--group {
  justify-content: center;
}

.qm-th--date {
  width: 88px;
  justify-content: center;
}

.qm-th--status {
  width: 80px;
  justify-content: center;
}

.qm-th--action {
  width: 68px;
  justify-content: center;
}

.qm-rows {
  background: #fff;
}

.qm-row {
  display: grid;
  grid-template-columns: 2fr 6fr 1.6fr 88px 80px 68px;
  gap: 16px;
  padding: 16px 24px;
  align-items: start;
  position: relative;
  border-top: 1px solid #f3f4f6;
  transition: background 0.15s;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: rgba(249, 250, 251, 0.8);

    .qm-row-bar {
      background: #a5b4fc;
    }
  }
}

.qm-row-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: background 0.15s;
}

.qm-td {
  min-width: 0;
}

.qm-type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #4338ca;
  display: inline-block;
  line-height: 1.4;
}

.qm-question-text {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  padding: 6px 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  line-height: 1.5;
}

.qm-td--group {
  min-width: 0;
  padding-top: 4px;
}

.qm-group-select {
  display: block;
  width: 100%;
  min-width: 0;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  outline: none;

  &:hover {
    border-color: #a5b4fc;
  }
}

.qm-td--date {
  width: 88px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.qm-date-text {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
}

.qm-td--status {
  width: 80px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.qm-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
  line-height: 1.4;
}

.qm-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  margin-right: 4px;
  display: inline-block;
}

.qm-td--action {
  width: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-top: 4px;
}

.qm-icon-btn {
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  background: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
}

.qm-icon-btn--edit {
  color: #9ca3af;

  &:hover {
    color: #4f46e5;
    background: #eef2ff;
  }
}

.qm-icon-btn--delete {
  color: #d1d5db;

  &:hover {
    color: #ef4444;
    background: #fef2f2;
  }
}

/* ============ 监控识别管理 ============ */
.rm-page {
  margin: -16px -24px;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
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
  color: #0f1115;
  line-height: 1.5;
}

.rm-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  line-height: 20px;
}

.rm-tabs {
  display: inline-flex;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
}

@media (min-width: 640px) {
  .rm-tab {
    flex: none;
  }
}

.rm-tab--active {
  background: #0f1115;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.rm-tab--inactive {
  background: transparent;
  color: #6b7280;
  font-weight: 500;

  &:hover {
    background: #f9fafb;
    color: #1f2937;
  }
}

.rm-desc {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
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
  border: 1px solid #e6e8ee;
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
  color: #0f1115;
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
  color: #8a8f9b;
  line-height: 1.5;
}

.rm-meta-strong {
  font-weight: 700;
  color: #2a2d36;
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
  color: #5b606a;
  background: transparent;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover {
    color: #0f1115;
    border-color: #c5c8d2;
    background: #f9fafb;
  }
}

.rm-brand-input {
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0f1115;
  background: #f5f6fa;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}

.rm-alias-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #f5f6fa;
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
  background: #efecff;
  color: #4a38e0;
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
  color: #2a2d36;
  letter-spacing: 0.025em;
}

.rm-form-input {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  background: #fff;
  border: 1px solid #e6e8ee;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.rm-url-group {
  display: flex;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e6e8ee;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.rm-url-select {
  padding: 0 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: #2a2d36;
  background: #f5f6fa;
  border: none;
  border-right: 1px solid #e6e8ee;
  cursor: pointer;
  outline: none;
}

.rm-url-input {
  flex: 1;
  min-width: 0;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }
}

.rm-textarea {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  color: #0f1115;
  background: #fff;
  border: 1px solid #e6e8ee;
  outline: none;
  line-height: 1.625;
  resize: none;
  min-height: 80px;
  width: 100%;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* ============ 搜索快照下载 ============ */
.sn-page {
  margin: -16px -24px;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 32px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #111827;
}

.sn-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #f3f4f6;
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
  color: #111827;
  letter-spacing: -0.025em;
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
  color: #6b7280;
  line-height: 1.5;
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
}

.sn-btn--gray {
  color: #374151;
  border-color: #e5e7eb;

  &:hover {
    background: #f9fafb;
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
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.sn-filter-bar {
  width: 100%;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
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
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: #d1d5db;
  }
}

.sn-select-text {
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sn-select-arrow {
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: 8px;
}

.sn-filter-count {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.sn-date-input {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  cursor: pointer;
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
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
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
  border-top: 1px solid #f9fafb;
  transition: background 0.15s;

  &:hover {
    background: rgba(249, 250, 251, 0.5);
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
  color: #111827;
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
  color: #374151;
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
  color: #6b7280;
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
  color: #6b7280;
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
  transition: color 0.15s, background 0.15s;
}

.sn-action-btn--preview {
  color: #4b5563;

  &:hover {
    color: #4f46e5;
    background: #f3f4f6;
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
