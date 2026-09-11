<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="flex flex-col gap-6 animate-fade-in max-w-[1600px] mx-auto pb-20 min-w-0 overflow-x-hidden">

      <!-- 头部 -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">AI 竞品透视</h2>
          <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span>基于 AI 搜索排名数据的竞品分析与对比</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-3">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
              <span>周期:</span>
            </div>
            <span class="text-xs text-gray-400">开始</span>
            <input v-model="rangeStart" type="date" min="2026-08-11" max="2026-09-11" class="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all shadow-sm" />
            <span class="text-xs text-gray-400">至</span>
            <span class="text-xs text-gray-400">结束</span>
            <input v-model="rangeEnd" type="date" min="2026-09-11" max="2026-09-11" class="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all shadow-sm" />
            <button class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">查询</button>
          </div>
          <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            刷新
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            导出 Excel
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
            修正品牌名
          </button>
        </div>
      </div>

      <!-- KPI 指标 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <div class="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            竞品总数
          </div>
          <div class="text-2xl font-extrabold text-gray-900">{{ kpi.total }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <div class="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/></svg>
            监控问题
          </div>
          <div class="text-2xl font-extrabold text-gray-900">{{ kpi.queries }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <div class="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14.66v1.63a2 2 0 0 1-.98 1.7A5 5 0 0 0 7 21.98"/><path d="M14 14.66v1.63a2 2 0 0 0 .98 1.7A5 5 0 0 1 17 21.98"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/></svg>
            最强竞品
          </div>
          <div class="text-lg font-extrabold text-gray-900 truncate">{{ kpi.top.name }}</div>
          <div class="text-xs text-gray-400 mt-0.5">出现 {{ kpi.top.frequency }} 次 · 提及率 {{ kpi.top.mention_rate }}% · Top3 {{ kpi.top.top3_mention_rate }}%</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <div class="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            头号竞品 Top3 推荐率
          </div>
          <div class="text-2xl font-extrabold text-indigo-600">{{ kpi.top.top3_mention_rate }}%</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ kpi.top.name }} · 综合 Top3 推荐率</div>
        </div>
      </div>

      <!-- 竞品品牌提及率（大表） -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          竞品品牌提及率
        </h3>
        <div class="overflow-y-auto overflow-x-hidden border border-gray-100 rounded-xl" style="height: 620px;">
          <table class="w-full text-sm table-fixed">
            <thead class="sticky top-0 bg-gray-50/95 z-10">
              <tr class="border-b border-gray-100">
                <th class="text-left py-3 px-4 text-gray-500 font-semibold text-xs w-[6%]">序号</th>
                <th class="text-left py-3 px-4 text-gray-500 font-semibold text-xs w-[24%]">竞品名称</th>
                <th class="text-left py-3 px-4 text-gray-500 font-semibold text-xs w-[24%]">频次条</th>
                <th class="text-center py-3 px-2 text-gray-500 font-semibold text-xs w-[10%]">出现次数</th>
                <th class="text-center py-3 px-2 text-gray-500 font-semibold text-xs w-[11%]">
                  <button class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">提及率
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </th>
                <th class="text-center py-3 px-2 text-gray-500 font-semibold text-xs w-[13%]">
                  <button class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">Top3 推荐率
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </th>
                <th class="text-center py-3 px-2 text-gray-500 font-semibold text-xs w-[12%]">
                  <button class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">首位提及率
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(c, i) in rows"
                :key="c.name + i"
                :class="c.is_target
                  ? 'border-b border-gray-50 last:border-b-0 transition-colors bg-blue-50/40 hover:bg-blue-50/60'
                  : 'border-b border-gray-50 last:border-b-0 transition-colors hover:bg-slate-50/60'"
              >
                <td class="py-3 px-4">
                  <span class="inline-flex w-5 h-5 rounded-full text-[10px] font-bold items-center justify-center text-white" :style="{ backgroundColor: badgeColor(i + 1) }">{{ i + 1 }}</span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2 min-w-0">
                    <span :class="['text-[14px] font-semibold truncate', c.is_target ? 'text-blue-700' : 'text-gray-900']" :title="c.name">{{ c.name }}</span>
                    <span v-if="c.is_target" class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">本品牌</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div class="h-full rounded-full" :style="{ width: barW(c.frequency), backgroundColor: badgeColor(i + 1), opacity: 0.88 }"></div>
                  </div>
                </td>
                <td class="text-center py-3 px-2 font-bold text-gray-800">{{ c.frequency }}</td>
                <td class="text-center py-3 px-2 text-xs font-bold" :class="c.mention_rate > 0 ? 'text-indigo-600' : 'text-gray-400'">{{ c.mention_rate }}%</td>
                <td class="text-center py-3 px-2 text-xs font-bold" :class="c.top3_mention_rate > 0 ? 'text-violet-600' : 'text-gray-400'">{{ c.top3_mention_rate }}%</td>
                <td class="text-center py-3 px-2 text-xs font-bold" :class="c.first_mention_rate > 0 ? 'text-amber-600' : 'text-gray-400'">{{ c.first_mention_rate }}%</td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="7" class="py-10 text-center text-sm text-gray-400">暂无竞品数据（采集或解析尚未产出）</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 竞品品牌分平台排名指标 -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>
          竞品品牌分平台排名指标
        </h3>
        <p class="text-xs text-gray-400 mb-4"></p>
        <div class="flex items-center gap-3 mb-4">
          <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">提及率</span>
          <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-50 text-violet-700 text-[11px] font-semibold">Top3 推荐率</span>
          <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold">首位提及率</span>
        </div>
        <div class="overflow-auto rounded-xl border border-gray-100" style="height: 620px;">
          <table class="w-full text-sm min-w-[1520px]">
            <thead class="bg-white sticky top-0 z-20">
              <tr class="border-b border-gray-200">
                <th rowspan="2" class="sticky left-0 z-10 bg-white text-left py-3 px-4 text-gray-500 font-medium text-xs align-bottom border-r border-gray-100">竞品</th>
                <th
                  v-for="g in GROUPS"
                  :key="g.key"
                  colspan="3"
                  class="text-center py-2 px-2 font-bold text-xs border-b border-gray-100 text-gray-700"
                  :class="g.key === 'all' ? 'bg-slate-50/80' : (g.lock ? 'cursor-pointer text-gray-600' : '')"
                >
                  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-md', g.key === 'all' ? 'bg-slate-100 text-slate-700' : 'bg-gray-50 text-gray-700']">
                    {{ g.label }}
                    <svg v-if="g.lock" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 shrink-0"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                </th>
              </tr>
              <tr class="border-b border-gray-100">
                <template v-for="g in GROUPS" :key="g.key">
                  <th class="text-center py-2 px-2 text-gray-400 font-medium text-[10px]" :class="g.key === 'all' ? 'bg-slate-50/60' : ''">
                    <button type="button" title="点击排序" class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">提及率
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </th>
                  <th class="text-center py-2 px-2 text-gray-400 font-medium text-[10px]" :class="g.key === 'all' ? 'bg-slate-50/60' : ''">
                    <button type="button" title="点击排序" class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">Top3 推荐率
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </th>
                  <th class="text-center py-2 px-2 text-gray-400 font-medium text-[10px] border-r border-gray-100" :class="g.key === 'all' ? 'bg-slate-50/60' : ''">
                    <button type="button" title="点击排序" class="inline-flex items-center gap-0.5 transition-colors hover:text-gray-700">首位提及率
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in rows" :key="'p4-' + c.name + i" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td class="sticky left-0 z-[1] bg-white py-3 px-4 border-r border-gray-50">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white" :style="{ backgroundColor: badgeColor(i + 1) }">{{ i + 1 }}</span>
                    <span :class="['font-medium truncate max-w-[120px]', c.is_target ? 'text-blue-700' : 'text-gray-900']">{{ c.name }}</span>
                    <span v-if="c.is_target" class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">本品牌</span>
                  </div>
                </td>
                <template v-for="(g, gi) in GROUPS" :key="'c' + g.key + i">
                  <template v-if="g.lock">
                    <td
                      v-for="n in 3"
                      :key="n"
                      class="text-center py-3 px-2 cursor-pointer"
                      :class="n === 3 ? 'border-r border-gray-100' : ''"
                    >
                      <span class="inline-flex min-w-[62px] justify-center rounded-md px-2 py-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                    </td>
                  </template>
                  <template v-else>
                    <td
                      v-for="(m, mi) in groupMetrics(c, g)"
                      :key="m.key"
                      class="text-center py-3 px-2"
                      :class="[(g.key === 'all' ? 'bg-slate-50/40 ' : '') + (mi === 2 ? 'border-r border-gray-100' : '')]"
                    >
                      <span
                        class="inline-flex justify-center rounded-md px-2 py-1 text-xs font-bold"
                        :class="[
                          m.value > 0 ? m.onCls : 'bg-gray-50 text-gray-300',
                          m.key === 'top3' ? 'min-w-[72px]' : 'min-w-[62px]',
                        ]"
                      >{{ m.value }}%</span>
                    </td>
                  </template>
                </template>
              </tr>
              <tr v-if="!rows.length">
                <td :colspan="1 + GROUPS.length * 3" class="py-10 text-center text-sm text-gray-400">暂无竞品数据（采集或解析尚未产出）</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 问题明细 -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          问题明细
        </h3>
        <div class="flex flex-col gap-3">
          <div v-for="q in queryRows" :key="q.id" class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors" @click="toggleOpen(q.id)">
              <div class="flex items-center gap-4">
                <span class="text-sm font-bold text-gray-900">{{ q.name }}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">排名词</span>
              </div>
              <div class="flex items-center gap-8">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400">本品牌</span>
                  <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md" :class="q.brandRank ? 'bg-yellow-50' : 'bg-gray-50'">
                    <svg v-if="q.brandRank" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500"><path d="M11.56 3.27a.5.5 0 0 1 .88 0L15.39 8.87a1 1 0 0 0 1.52.29l4.27-3.66a.5.5 0 0 1 .8.52l-2.83 10.25a1 1 0 0 1-.96.73H5.81a1 1 0 0 1-.96-.73L2.02 6.02a.5.5 0 0 1 .8-.52l4.27 3.66a1 1 0 0 0 1.52-.29z"/><path d="M5 21h14"/></svg>
                    <span class="text-xs font-bold" :class="q.brandRank ? 'text-yellow-700' : 'text-gray-400'">{{ q.brandRank ? '#' + q.brandRank : '未上榜' }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-1.5">
                  <div v-for="e in q.engines" :key="e.key" class="flex flex-col items-center min-w-[48px]">
                    <span class="text-[10px] text-gray-400 mb-0.5">{{ e.label }}</span>
                    <span class="text-xs font-bold" :class="e.rank ? 'text-gray-700' : 'text-gray-300'">{{ e.rank ? '#' + e.rank : '-' }}</span>
                  </div>
                </div>
                <span class="text-xs text-gray-400">{{ q.competitorCount == null ? '—' : q.competitorCount }} 个竞品</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 transition-transform" :class="isOpen(q.id) ? 'rotate-180' : ''"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </button>
            <div v-if="isOpen(q.id)" class="px-5 pb-4 text-sm text-gray-400">暂无该问题的竞品明细数据</div>
          </div>
          <div v-if="!queryRows.length" class="text-center text-sm text-gray-400 py-6">暂无监控问题</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';

const list = ref<any[]>([]);
const queries = ref<any[]>([]);
const matrix = ref<any>({ list: {} });
const rangeStart = ref('2026-09-11');
const rangeEnd = ref('2026-09-11');

const rows = computed(() => list.value);

/* 排名徽章 10 色循环（真实站内联 background-color） */
const PALETTE = [
  'rgb(59, 130, 246)',
  'rgb(99, 102, 241)',
  'rgb(236, 72, 153)',
  'rgb(245, 158, 11)',
  'rgb(6, 182, 212)',
  'rgb(147, 51, 234)',
  'rgb(16, 185, 129)',
  'rgb(239, 68, 68)',
  'rgb(139, 92, 246)',
  'rgb(20, 184, 166)',
];
const badgeColor = (rank: number) => PALETTE[(rank - 1) % PALETTE.length];

const maxFreq = computed(() => Math.max(1, ...list.value.map((c: any) => c.frequency || 0)));
const barW = (v: number) => `${Math.max(0, Math.min(100, (v / maxFreq.value) * 100))}%`;

const kpi = computed(() => {
  const top = list.value[0] || { name: '—', frequency: 0, mention_rate: 0, top3_mention_rate: 0 };
  return { total: list.value.length, queries: queries.value.length, top };
});

/* 分平台排名指标：综合 / 5 引擎 / 3 个 APP(锁) */
const GROUPS = [
  { key: 'all', label: '综合', lock: false },
  { key: 'doubao', label: '豆包', lock: false },
  { key: 'deepseek', label: 'DeepSeek', lock: false },
  { key: 'wenxin', label: '文心一言', lock: false },
  { key: 'qianwen', label: '通义千问', lock: false },
  { key: 'yuanbao', label: '元宝', lock: false },
  { key: 'doubao_app', label: '豆包·APP', lock: true },
  { key: 'deepseek_app', label: 'DeepSeek·APP', lock: true },
  { key: 'qianwen_app', label: '通义千问·APP', lock: true },
];

function groupMetrics(c: any, g: { key: string; lock: boolean }) {
  if (g.key === 'all') {
    return [
      { key: 'mention', value: c.mention_rate ?? 0, onCls: 'bg-indigo-50 text-indigo-700' },
      { key: 'top3', value: c.top3_mention_rate ?? 0, onCls: 'bg-violet-50 text-violet-700' },
      { key: 'first', value: c.first_mention_rate ?? 0, onCls: 'bg-amber-50 text-amber-700' },
    ];
  }
  const ps = c.platform_stats?.[g.key];
  return [
    { key: 'mention', value: ps?.mention_rate ?? 0, onCls: 'bg-indigo-50 text-indigo-700' },
    { key: 'top3', value: ps?.top3_mention_rate ?? 0, onCls: 'bg-violet-50 text-violet-700' },
    { key: 'first', value: ps?.first_mention_rate ?? 0, onCls: 'bg-amber-50 text-amber-700' },
  ];
}

/* 问题明细：本品牌各引擎位次（真实站引擎顺序：豆包/文心一言/DeepSeek/通义千问/元宝） */
const ENG_ORDER = [
  { key: 'doubao', label: '豆包' },
  { key: 'wenxin', label: '文心一言' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'qianwen', label: '通义千问' },
  { key: 'yuanbao', label: '元宝' },
];

const queryRows = computed(() => {
  return queries.value.map((q: any) => {
    const m = matrix.value.list?.[String(q.id)];
    const rv = m?.rank_value || {};
    const engines = ENG_ORDER.map(e => {
      const v = rv[e.key];
      const n = Number(v);
      return { key: e.key, label: e.label, rank: Number.isFinite(n) ? n : null };
    });
    const ranked = engines.map(e => e.rank).filter((n): n is number => n != null);
    const brandRank = ranked.length ? Math.min(...ranked) : null;
    return {
      id: q.id,
      name: q.query,
      brandRank,
      engines,
      competitorCount: null, // 分问题竞品数接口未提供，占位
    };
  });
});

const openIds = ref<number[]>([]);
const toggleOpen = (id: number) => {
  openIds.value = openIds.value.includes(id) ? openIds.value.filter(x => x !== id) : [...openIds.value, id];
};
const isOpen = (id: number) => openIds.value.includes(id);

onMounted(async () => {
  try {
    const [resp, qs]: any[] = await Promise.all([
      monitorApi.competitorInsight().catch(() => null),
      monitorApi.queryList('industry').catch(() => null),
    ]);
    list.value = resp?.list || [];
    queries.value = qs?.list || [];
    const qids = queries.value.map((q: any) => q.id).filter((n: number) => Number.isFinite(n));
    if (qids.length) {
      const d = new Date();
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const m: any = await monitorApi.fullRankingMatrix(qids, iso).catch(() => null);
      if (m?.list) matrix.value = m;
    }
  } catch { /* 空态 */ }
});
</script>
