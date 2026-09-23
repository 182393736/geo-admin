<template>
  <div class="geo-page">
    <div class="geo-page-header">
      <div class="geo-page-header__text">
        <h1 class="geo-page-title">引用源洞察</h1>
        <p class="geo-page-desc">深度拆解 AI 平台的引用源偏好与你的内容被引效果，产出内容分发与优化策略</p>
      </div>
      <div class="geo-page-header__actions">
        <div class="relative" ref="dateRoot">
          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-indigo-300 transition-all shadow-sm"
            @click.stop="dateOpen = !dateOpen"
          >
            <span>{{ rangeStart }} ~ {{ rangeEnd }}</span>
            <span class="text-gray-300 mx-0.5">vs</span>
            <span>{{ cmpStart }} ~ {{ cmpEnd }}</span>
          </button>
          <div
            v-if="dateOpen"
            class="absolute right-0 top-full z-50 mt-2 w-[420px] rounded-xl border border-gray-100 bg-white p-4 shadow-2xl"
            @click.stop
          >
            <div class="space-y-3">
              <div>
                <div class="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">本期</div>
                <DashDateRange v-model:start="rangeStart" v-model:end="rangeEnd" @change="onPeriodChange" />
              </div>
              <div>
                <div class="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">对比期（自动对齐等长）</div>
                <div class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">
                  {{ cmpStart }} → {{ cmpEnd }}
                </div>
              </div>
              <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
                <button type="button" class="rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100" @click="dateOpen = false">关闭</button>
                <button type="button" class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700" @click="applyDates">应用</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6 pb-12">
      <!-- Top10 信源每日波动趋势 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">Top10 信源每日波动趋势</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-400 select-none">AI 引擎</span>
            <DashSelect v-model="trendEngine" :options="engineOptions" min-width="120px" @change="reloadTrend" />
          </div>
        </div>
        <div class="px-6 py-5">
          <div class="relative" style="height: 280px;" @mouseleave="trendHover = null">
            <svg v-if="trendDates.length && visibleTrendSources.length" :viewBox="`0 0 ${TW} ${TH}`" class="w-full h-full" preserveAspectRatio="none">
              <line v-for="(t, i) in trendYTicks" :key="'yg'+i" :x1="TML" :x2="TW - TMR" :y1="trendY(t)" :y2="trendY(t)" stroke="#f1f5f9" stroke-width="1" />
              <text v-for="(t, i) in trendYTicks" :key="'yl'+i" :x="TML - 6" :y="trendY(t) + 3" text-anchor="end" class="si-axis">{{ t }}</text>
              <text
                v-for="(lb, i) in trendXLabels"
                :key="'xl'+i"
                :x="trendXLabelPos(i)"
                :y="TH - 6"
                text-anchor="middle"
                class="si-axis"
              >{{ lb }}</text>
              <path
                v-for="(s, si) in visibleTrendSources"
                :key="s.name"
                :d="trendPath(s)"
                fill="none"
                :stroke="palette[si % palette.length]"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <line
                v-if="trendHover"
                :x1="trendX(trendHover.idx)"
                :x2="trendX(trendHover.idx)"
                :y1="TMT"
                :y2="TH - TMB"
                stroke="#94a3b8"
                stroke-dasharray="4 4"
                stroke-width="1"
              />
              <rect x="0" y="0" :width="TW" :height="TH" fill="transparent" class="cursor-crosshair" @mousemove="onTrendMove" />
            </svg>
            <div v-else class="h-full flex items-center justify-center text-sm text-gray-400">暂无信源波动数据</div>
            <div
              v-if="trendHover"
              class="pointer-events-none absolute z-20 min-w-[140px] rounded-lg border border-gray-200 bg-white p-2.5 text-xs shadow-lg"
              :style="{ left: trendHover.left + 'px', top: '8px' }"
            >
              <div class="mb-1.5 font-bold text-gray-900">{{ fmtDate(trendDates[trendHover.idx]) }}</div>
              <div v-for="(s, si) in visibleTrendSources" :key="s.name" class="flex items-center justify-between gap-3 leading-5 text-gray-600">
                <span class="flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: palette[si % palette.length] }"></span>
                  {{ s.name }}
                </span>
                <span class="font-semibold tabular-nums text-gray-900">{{ (s.series || [])[trendHover.idx] ?? 0 }}</span>
              </div>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <button
              v-for="(s, i) in topSources"
              :key="s.name"
              type="button"
              :class="['flex items-center gap-1.5 text-xs font-medium transition-opacity', hiddenTrend.has(s.name) ? 'opacity-35' : 'opacity-100']"
              @click="toggleTrend(s.name)"
            >
              <span class="w-3 h-[3px] rounded-full" :style="{ background: palette[i % palette.length] }"></span>
              <span class="text-gray-700 max-w-[140px] truncate">{{ s.name }}</span>
              <span class="text-gray-400">{{ s.total }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- AI 引擎信源偏好 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span class="text-base font-bold text-gray-900">AI 引擎信源偏好</span>
        </div>
        <div class="mx-6 mt-4 px-4 py-3 bg-indigo-50 rounded-xl">
          <p v-if="insight" class="text-[13px] text-indigo-800 leading-relaxed">
            <span class="font-bold">{{ insight.source }}</span> 是当前被 AI 引擎引用最多的信源平台（共
            <span class="font-bold">{{ insight.total }}</span> 次），其中
            <span class="font-bold">{{ insight.platform }}</span> 对它的引用最为集中（{{ insight.count }} 次）。建议优先在该平台布局高质量内容。
          </p>
          <p v-else class="text-[13px] text-indigo-800 leading-relaxed">暂无引用数据，完成采集解析后即可生成信源偏好洞察。</p>
        </div>
        <div class="px-5 py-4 overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="sticky left-0 z-20 bg-white text-left text-[11.5px] font-semibold text-gray-400 px-2 py-2 w-10">#</th>
                <th class="sticky left-10 z-20 bg-white text-left text-[11.5px] font-semibold text-gray-400 px-2 py-2 whitespace-nowrap">信源平台</th>
                <th
                  v-for="p in platforms"
                  :key="p.key"
                  class="text-center text-[11.5px] font-semibold px-2 py-2 whitespace-nowrap cursor-pointer select-none transition-colors"
                  :class="prefSort === p.key ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'"
                  @click="setPrefSort(p.key)"
                >
                  <span class="inline-flex items-center gap-0.5">{{ p.name }}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </span>
                </th>
                <th
                  class="text-right text-[11.5px] font-semibold px-2 py-2 whitespace-nowrap min-w-[140px] cursor-pointer select-none transition-colors"
                  :class="prefSort === 'total' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'"
                  @click="setPrefSort('total')"
                >
                  <span class="inline-flex items-center gap-0.5 justify-end">总被引
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in prefRows" :key="s.canonical_source" class="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-2 py-2.5">
                  <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold', i === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700']">{{ i + 1 }}</div>
                </td>
                <td class="sticky left-10 z-10 bg-white group-hover:bg-gray-50 px-2 py-2.5 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="text-[13px] font-semibold text-gray-900">{{ s.canonical_source }}</span>
                    <span v-if="i === 0" class="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">首选</span>
                  </div>
                </td>
                <td v-for="p in platforms" :key="p.key" class="text-center px-1 py-2.5">
                  <div
                    class="inline-flex flex-col items-center justify-center w-12 h-10 rounded-md text-gray-800"
                    :style="{ background: heatBg(engCur(s, p.key)) }"
                  >
                    <span class="text-[12.5px] font-mono font-semibold">{{ engCur(s, p.key) }}</span>
                    <span
                      v-if="engChg(s, p.key)"
                      :class="['text-[9px] font-semibold', engChg(s, p.key)! > 0 ? 'text-emerald-600' : 'text-red-600']"
                    >{{ engChg(s, p.key)! > 0 ? '+' : '' }}{{ engChg(s, p.key) }}</span>
                  </div>
                </td>
                <td class="px-2 py-2.5">
                  <div class="flex items-center gap-2 justify-end">
                    <div class="w-20 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-500 rounded-full transition-all" :style="{ width: barW(s.cur_total || s.ref_count || 0) }"></div>
                    </div>
                    <span class="text-[13px] font-bold text-gray-800 w-8 text-right">{{ s.cur_total ?? s.ref_count }}</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!prefRows.length">
                <td :colspan="2 + platforms.length + 1" class="px-2 py-10 text-center text-sm text-gray-400">暂无信源偏好数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 pb-4 text-[11.5px] text-gray-400">颜色越深代表该引擎从该平台引用越多 | 右侧条形图为各引擎总引用次数</div>
      </div>

      <!-- 自有内容收录趋势 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">自有内容收录趋势</span>
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-gray-400 select-none">AI 引擎</span>
              <DashSelect v-model="ownEngine" :options="ownEngineOptions" min-width="120px" @change="reloadOwn" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-gray-400 select-none">统计维度</span>
              <div class="flex bg-gray-100 rounded-lg p-0.5">
                <button type="button" :class="['px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all', dim === 'rate' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700']" @click="dim = 'rate'">收录率</button>
                <button type="button" :class="['px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all', dim === 'count' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700']" @click="dim = 'count'">收录量</button>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 pb-5 grid grid-cols-1 md:grid-cols-[0.8fr_2.4fr] gap-6 items-center">
          <div class="flex flex-col gap-5">
            <div>
              <div class="text-xs text-gray-400 mb-1">本期自有被引</div>
              <div class="text-2xl font-extrabold text-gray-900">
                {{ ownSummary.cited ?? 0 }}<span class="text-sm font-medium text-gray-400"> 次</span>
                <span :class="['ml-2 text-xs font-bold', (ownSummary.cited_chg || 0) >= 0 ? 'text-emerald-600' : 'text-red-500']">
                  {{ (ownSummary.cited_chg || 0) >= 0 ? '↑' : '↓' }} {{ Math.abs(ownSummary.cited_chg || 0) }}{{ ownChgPct }}
                </span>
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">收录率（自有占比）</div>
              <div class="text-2xl font-extrabold text-gray-900">
                {{ ownSummary.rate_now ?? 0 }}<span class="text-sm font-medium text-gray-400"> %</span>
                <span :class="['ml-2 text-xs font-bold', (ownSummary.rate_chg || 0) >= 0 ? 'text-emerald-600' : 'text-red-500']">
                  {{ (ownSummary.rate_chg || 0) >= 0 ? '↑' : '↓' }} {{ Math.abs(ownSummary.rate_chg || 0) }}pp
                </span>
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">收录篇数</div>
              <div class="text-2xl font-extrabold text-gray-900">
                {{ ownSummary.own_articles ?? 0 }}<span class="text-sm font-medium text-gray-400"> 篇</span>
                <span :class="['ml-2 text-xs font-bold', (ownSummary.own_articles_chg || 0) >= 0 ? 'text-emerald-600' : 'text-red-500']">
                  {{ (ownSummary.own_articles_chg || 0) >= 0 ? '↑' : '↓' }} {{ Math.abs(ownSummary.own_articles_chg || 0) }}
                </span>
              </div>
            </div>
          </div>
          <div class="border border-gray-100 rounded-xl bg-gray-50/50 p-4">
            <SparkLine
              v-if="ownPoints.length"
              :points="ownPoints"
              :labels="ownLabels"
              color="#059669"
              :height="180"
              :digits="dim === 'rate' ? 1 : 0"
              :unit="dim === 'rate' ? '%' : ''"
            />
            <div v-else class="h-[180px] flex items-center justify-center text-sm text-gray-400">暂无自有内容趋势</div>
            <div class="mt-2 text-center text-xs text-gray-500">
              最新{{ dim === 'rate' ? '收录率' : '收录量' }}
              <span class="font-bold text-emerald-700">{{ ownLatest }}{{ dim === 'rate' ? '%' : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 引用源透视（卡片勿 overflow-hidden，否则问题下拉会被裁切/被下方 tab 盖住） -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">引用源透视</span>
          </div>
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors disabled:opacity-60"
            :disabled="exporting"
            @click="exportPerspective"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            导出 Excel
          </button>
        </div>
        <div class="relative z-30 px-6 pt-4 flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-400 select-none">问题</span>
            <DashSelect v-model="perspQueryId" :options="topicOptions" min-width="180px" @change="reloadPerspective(true)" />
          </div>
          <div class="flex items-center gap-2 ml-auto">
            <div class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
              <input
                v-model="perspSearch"
                placeholder="搜索名称..."
                class="text-[13px] text-gray-700 placeholder-gray-400 outline-none bg-transparent w-36"
                @keydown.enter="reloadPerspective(true)"
              />
            </div>
          </div>
        </div>
        <div class="relative z-0 px-6 pt-3 pb-2 flex items-center gap-4 flex-wrap">
          <div class="flex bg-gray-100 rounded-lg p-0.5">
            <button v-for="v in viewTabs" :key="v.key" type="button" :class="tabCls(perspView === v.key)" @click="setView(v.key)">{{ v.label }}</button>
          </div>
          <div class="flex bg-gray-100 rounded-lg p-0.5">
            <button v-for="s in statusTabs" :key="s" type="button" :class="tabCls(perspStatus === s)" @click="setStatus(s)">{{ s }}</button>
          </div>
        </div>
        <div class="px-5 pb-2 overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="sticky left-0 z-20 bg-white text-left text-[11.5px] font-semibold text-gray-400 px-2 py-2.5 w-10">排名</th>
                <th class="sticky left-10 z-20 bg-white text-left text-[11.5px] font-semibold text-gray-400 px-2 py-2.5 whitespace-nowrap">名称</th>
                <th class="text-center text-[11.5px] font-semibold text-gray-400 px-2 py-2.5">状态</th>
                <th v-for="p in platforms" :key="p.key" class="text-center text-[11.5px] font-semibold px-2 py-2.5 whitespace-nowrap text-gray-400">{{ p.name }}</th>
                <th class="text-center text-[11.5px] font-semibold px-2 py-2.5 cursor-pointer text-indigo-600" @click="reloadPerspective(true)">合计</th>
                <th class="text-center text-[11.5px] font-semibold text-gray-400 px-2 py-2.5 whitespace-nowrap">较上期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in perspectiveRows" :key="s.name + i" class="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-2 py-3">
                  <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold', i === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700']">{{ i + 1 }}</div>
                </td>
                <td class="sticky left-10 z-10 bg-white group-hover:bg-gray-50 px-2 py-3 text-[13px] font-semibold whitespace-nowrap max-w-[220px] truncate">
                  <span class="text-gray-900" :title="s.name">{{ s.name }}</span>
                </td>
                <td class="px-2 py-3 text-center">
                  <span class="inline-flex items-center gap-1">
                    <span :class="['w-1.5 h-1.5 rounded-full', statusDot(s.status)]"></span>
                    <span :class="['text-[11px] font-medium', statusText(s.status)]">{{ s.status }}</span>
                  </span>
                </td>
                <td v-for="p in platforms" :key="p.key" class="text-center px-2 py-3 text-[12.5px] font-mono text-gray-700">{{ engCur(s, p.key) }}</td>
                <td class="text-center px-2 py-3 text-[13px] font-bold text-gray-900">{{ s.cur_total ?? s.ref_count }}</td>
                <td class="text-center px-2 py-3">
                  <span v-if="s.change" :class="['text-[11.5px] font-semibold', s.change > 0 ? 'text-emerald-600' : 'text-red-500']">
                    {{ s.change > 0 ? '▲' : '▼' }} {{ s.change > 0 ? '+' : '' }}{{ s.change }}
                  </span>
                  <span v-else class="text-[11.5px] font-semibold text-gray-300">—</span>
                </td>
              </tr>
              <tr v-if="!perspectiveRows.length">
                <td :colspan="4 + platforms.length" class="px-2 py-10 text-center text-sm text-gray-400">暂无引用源透视数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="perspTotal > perspectiveRows.length" class="px-6 py-4 flex justify-center">
          <button
            type="button"
            class="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors disabled:opacity-50"
            :disabled="perspLoading"
            @click="loadMorePerspective"
          >加载更多</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import SparkLine from '@/components/SparkLine.vue';
import DashDateRange from '@/components/DashDateRange.vue';
import DashSelect from '@/components/DashSelect.vue';
import { lastNDays, fmtDate } from '@/utils/engines';
import { downloadAoaSheets } from '@/utils/xlsxExport';

/** 对标表头顺序：豆包 / DeepSeek / 文心一言 / 通义千问 / 元宝 */
const platforms = [
  { key: 'doubao', name: '豆包' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'wenxin', name: '文心一言' },
  { key: 'qwen', name: '通义千问' },
  { key: 'yuanbao', name: '元宝' },
];

const palette = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#ec4899'];

const engineOptions = [
  { value: 'all', label: '全部' },
  ...platforms.map(p => ({ value: p.key, label: p.name })),
];
const ownEngineOptions = [
  { value: 'all', label: '综合' },
  ...platforms.map(p => ({ value: p.key, label: p.name })),
];

const viewTabs = [
  { key: 'source' as const, label: '信源平台' },
  { key: 'article' as const, label: '引用文章' },
  { key: 'own' as const, label: '自有文章' },
];
const statusTabs = ['全部', '本期新增', '持续被引', '本期流失'];

const init = lastNDays(7);
const rangeStart = ref(init.start);
const rangeEnd = ref(init.end);
const cmpStart = ref('');
const cmpEnd = ref('');
const dateOpen = ref(false);
const dateRoot = ref<HTMLElement | null>(null);

const trendEngine = ref<string | number>('all');
const ownEngine = ref<string | number>('all');
const dim = ref<'rate' | 'count'>('rate');
const prefSort = ref('total');
const prefSortAsc = ref(false);

const topSources = ref<any[]>([]);
const trendDates = ref<string[]>([]);
const hiddenTrend = ref(new Set<string>());
const trendHover = ref<null | { idx: number; left: number }>(null);

const prefSources = ref<any[]>([]);
const ownTrend = ref<any[]>([]);
const ownSummary = ref<any>({});
const perspectiveRows = ref<any[]>([]);
const perspTotal = ref(0);
const perspPage = ref(1);
const perspLoading = ref(false);
const perspView = ref<'source' | 'article' | 'own'>('source');
const perspStatus = ref('全部');
const perspSearch = ref('');
const perspQueryId = ref<string | number>(0);
const topicOptions = ref([{ value: 0, label: '全部' }]);
const exporting = ref(false);

const TW = 720;
const TH = 280;
const TML = 36;
const TMR = 12;
const TMT = 10;
const TMB = 28;

function syncCmp() {
  const s = new Date(rangeStart.value);
  const e = new Date(rangeEnd.value);
  const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
  const ce = new Date(s); ce.setDate(ce.getDate() - 1);
  const cs = new Date(ce); cs.setDate(cs.getDate() - (days - 1));
  const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  cmpStart.value = f(cs);
  cmpEnd.value = f(ce);
}

function onPeriodChange() {
  syncCmp();
}

async function applyDates() {
  dateOpen.value = false;
  syncCmp();
  await reloadAll();
}

const visibleTrendSources = computed(() => topSources.value.filter(s => !hiddenTrend.value.has(s.name)));
const trendXLabels = computed(() => {
  const lbs = trendDates.value.map(d => fmtDate(d));
  if (lbs.length === 1) return [lbs[0], lbs[0]];
  return lbs;
});
function trendXLabelPos(i: number) {
  const n = trendXLabels.value.length;
  if (n <= 1) return TML + (TW - TML - TMR) / 2;
  return TML + (i / (n - 1)) * (TW - TML - TMR);
}
const trendMax = computed(() => {
  let m = 1;
  for (const s of visibleTrendSources.value) {
    for (const v of s.series || []) m = Math.max(m, Number(v) || 0);
  }
  return m;
});
const trendYTicks = computed(() => {
  const max = trendMax.value;
  const step = max <= 10 ? 2 : max <= 40 ? 10 : max <= 100 ? 20 : Math.ceil(max / 4 / 10) * 10;
  const ticks: number[] = [];
  for (let v = 0; v <= max + 0.01; v += step) ticks.push(v);
  return ticks.slice(0, 6);
});

function trendX(i: number) {
  const n = Math.max(1, trendDates.value.length);
  if (n <= 1) return TML + (TW - TML - TMR) / 2;
  return TML + (i / (n - 1)) * (TW - TML - TMR);
}
function trendY(v: number) {
  const max = trendYTicks.value[trendYTicks.value.length - 1] || trendMax.value || 1;
  const plotH = TH - TMT - TMB;
  return TMT + plotH - (v / max) * plotH;
}
function trendPath(s: any) {
  let series = [...(s.series || [])];
  // 单日拉满：复制起止点
  if (series.length === 1) series = [series[0], series[0]];
  const n = Math.max(series.length, trendDates.value.length === 1 ? 2 : trendDates.value.length);
  return series.map((v: number, i: number) => {
    const x = n <= 1 ? trendX(0) : TML + (i / (n - 1)) * (TW - TML - TMR);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${trendY(Number(v) || 0).toFixed(1)}`;
  }).join(' ');
}
function onTrendMove(ev: MouseEvent) {
  const svg = ev.currentTarget as SVGRectElement;
  const root = svg.ownerSVGElement?.parentElement;
  if (!root || !trendDates.value.length) return;
  const rect = root.getBoundingClientRect();
  const rel = ((ev.clientX - rect.left) / rect.width) * TW;
  const n = trendDates.value.length;
  let idx = 0;
  if (n > 1) {
    const t = (rel - TML) / (TW - TML - TMR);
    idx = Math.round(Math.max(0, Math.min(1, t)) * (n - 1));
  }
  trendHover.value = {
    idx,
    left: Math.min(Math.max(8, ev.clientX - rect.left + 10), rect.width - 160),
  };
}
function toggleTrend(name: string) {
  const next = new Set(hiddenTrend.value);
  if (next.has(name)) next.delete(name);
  else next.add(name);
  // 至少保留 1 条
  if (next.size >= topSources.value.length) return;
  hiddenTrend.value = next;
}

const prefMax = computed(() => Math.max(1, ...prefSources.value.map((s: any) => s.cur_total || 0)));
const prefRows = computed(() => {
  const rows = [...prefSources.value];
  const key = prefSort.value;
  rows.sort((a, b) => {
    const av = key === 'total' ? (a.cur_total || 0) : engCur(a, key);
    const bv = key === 'total' ? (b.cur_total || 0) : engCur(b, key);
    return prefSortAsc.value ? av - bv : bv - av;
  });
  return rows.slice(0, 15);
});
function setPrefSort(key: string) {
  if (prefSort.value === key) prefSortAsc.value = !prefSortAsc.value;
  else { prefSort.value = key; prefSortAsc.value = false; }
}
function engCur(s: any, key: string) {
  const e = s.engines?.[key];
  if (e && typeof e === 'object') return Number(e.cur) || 0;
  return Number(e) || 0;
}
function engChg(s: any, key: string) {
  const e = s.engines?.[key];
  if (e && typeof e === 'object' && e.chg) return Number(e.chg) || 0;
  return 0;
}
function heatBg(v: number) {
  const max = Math.max(1, ...prefRows.value.flatMap((s: any) => platforms.map(p => engCur(s, p.key))));
  const a = 0.08 + 0.6 * Math.min(1, v / max);
  return `rgba(99, 102, 241, ${a.toFixed(3)})`;
}
function barW(v: number) {
  return `${Math.max(0, Math.min(100, (v / prefMax.value) * 100))}%`;
}

const insight = computed(() => {
  const top = prefRows.value[0];
  if (!top) return null;
  let bestKey = platforms[0].key;
  let best = -1;
  for (const p of platforms) {
    const c = engCur(top, p.key);
    if (c > best) { best = c; bestKey = p.key; }
  }
  return {
    source: top.canonical_source,
    total: top.cur_total || 0,
    platform: platforms.find(p => p.key === bestKey)?.name || bestKey,
    count: best,
  };
});

const ownPoints = computed(() => {
  if (dim.value === 'rate') return ownTrend.value.map((t: any) => Number(t.rate) || 0);
  return ownTrend.value.map((t: any) => Number(t.own_count) || 0);
});
const ownLabels = computed(() => ownTrend.value.map((t: any) => fmtDate(t.date)));
const ownLatest = computed(() => {
  if (!ownPoints.value.length) return 0;
  return ownPoints.value[ownPoints.value.length - 1];
});
const ownChgPct = computed(() => {
  const cur = Number(ownSummary.value.cited) || 0;
  const chg = Number(ownSummary.value.cited_chg) || 0;
  const prev = cur - chg;
  if (!prev) return '';
  const pct = Math.round((chg / Math.abs(prev)) * 100);
  return ` ${Math.abs(pct)}%`;
});

function tabCls(active: boolean) {
  return [
    'px-3 py-1.5 text-[12.5px] font-semibold rounded-md transition-all',
    active ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700',
  ];
}
function statusDot(s: string) {
  if (s === '本期新增') return 'bg-emerald-500';
  if (s === '本期流失') return 'bg-amber-500';
  return 'bg-blue-500';
}
function statusText(s: string) {
  if (s === '本期新增') return 'text-emerald-600';
  if (s === '本期流失') return 'text-amber-600';
  return 'text-blue-600';
}
function setView(v: 'source' | 'article' | 'own') {
  perspView.value = v;
  reloadPerspective(true);
}
function setStatus(s: string) {
  perspStatus.value = s;
  reloadPerspective(true);
}

async function reloadTrend() {
  try {
    const plat = trendEngine.value === 'all' ? null : String(trendEngine.value);
    const resp: any = await monitorApi.siSourceTrend(rangeStart.value, rangeEnd.value, plat, 'industry');
    trendDates.value = resp?.dates || [];
    topSources.value = (resp?.sources || []).map((s: any) => ({
      name: s.name, total: s.total, series: s.series || [],
    }));
    hiddenTrend.value = new Set();
  } catch {
    topSources.value = [];
    trendDates.value = [];
  }
}

async function reloadPref() {
  try {
    const resp: any = await monitorApi.siEnginePreference(rangeStart.value, rangeEnd.value, cmpStart.value, cmpEnd.value, 'industry');
    prefSources.value = (resp?.sources || []).map((s: any) => ({
      canonical_source: s.canonical_source,
      cur_total: s.cur_total,
      engines: s.engines || {},
    }));
  } catch {
    prefSources.value = [];
  }
}

async function reloadOwn() {
  try {
    const plat = ownEngine.value === 'all' ? null : String(ownEngine.value);
    const resp: any = await monitorApi.siOwnTrend(rangeStart.value, rangeEnd.value, cmpStart.value, cmpEnd.value, plat, 'industry');
    ownTrend.value = resp?.trend || [];
    ownSummary.value = resp?.summary || {};
  } catch {
    ownTrend.value = [];
    ownSummary.value = {};
  }
}

async function reloadPerspective(reset = false) {
  if (reset) {
    perspPage.value = 1;
    perspectiveRows.value = [];
  }
  perspLoading.value = true;
  try {
    const resp: any = await monitorApi.siPerspective(
      rangeStart.value, rangeEnd.value, cmpStart.value, cmpEnd.value,
      {
        view: perspView.value,
        status: perspStatus.value,
        search: perspSearch.value.trim() || undefined,
        query_id: Number(perspQueryId.value) || undefined,
        page: perspPage.value,
        page_size: 20,
        category: 'industry',
      },
    );
    const rows = (resp?.list || []).map((s: any) => ({
      name: s.name,
      cur_total: s.cur_total,
      change: s.change,
      status: s.status,
      engines: s.engines || {},
    }));
    perspectiveRows.value = reset ? rows : [...perspectiveRows.value, ...rows];
    perspTotal.value = resp?.total || 0;
  } catch {
    if (reset) perspectiveRows.value = [];
  } finally {
    perspLoading.value = false;
  }
}

async function loadMorePerspective() {
  perspPage.value += 1;
  await reloadPerspective(false);
}

async function exportPerspective() {
  exporting.value = true;
  try {
    const resp: any = await monitorApi.siPerspective(
      rangeStart.value, rangeEnd.value, cmpStart.value, cmpEnd.value,
      {
        view: perspView.value,
        status: perspStatus.value,
        search: perspSearch.value.trim() || undefined,
        query_id: Number(perspQueryId.value) || undefined,
        page: 1,
        page_size: 200,
        category: 'industry',
      },
    );
    const rows = [
      [ '排名', '名称', '状态', ...platforms.map(p => p.name), '合计', '较上期' ],
      ...(resp?.list || []).map((s: any, i: number) => [
        i + 1,
        s.name,
        s.status,
        ...platforms.map(p => (s.engines?.[p.key]?.cur) ?? 0),
        s.cur_total,
        s.change ?? 0,
      ]),
    ];
    downloadAoaSheets(
      [{ name: '引用源透视', rows, cols: [{ wch: 6 }, { wch: 28 }, { wch: 12 }, ...platforms.map(() => ({ wch: 10 })), { wch: 8 }, { wch: 8 }] }],
      `引用源透视_${rangeStart.value}_${rangeEnd.value}.xlsx`,
    );
  } finally {
    exporting.value = false;
  }
}

async function reloadAll() {
  await Promise.all([reloadTrend(), reloadPref(), reloadOwn(), reloadPerspective(true)]);
}

function onDocClick(e: MouseEvent) {
  if (dateRoot.value && !dateRoot.value.contains(e.target as Node)) dateOpen.value = false;
}

onMounted(async () => {
  syncCmp();
  document.addEventListener('click', onDocClick);
  try {
    const topics: any = await monitorApi.siTopics('industry');
    const list = Array.isArray(topics) ? topics : (topics?.list || topics || []);
    topicOptions.value = [
      { value: 0, label: '全部' },
      ...list.map((t: any) => ({ value: t.query_id, label: t.name || String(t.query_id) })),
    ];
  } catch { /* ignore */ }
  await reloadAll();
});

onUnmounted(() => document.removeEventListener('click', onDocClick));

watch(perspSearch, () => {
  // debounce light: enter/blur also triggers; short delay on type end
});
</script>

<style scoped>
.si-axis { font-size: 10px; fill: #94a3b8; }
</style>
