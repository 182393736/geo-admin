<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="flex flex-col gap-8 animate-fade-in max-w-[1600px] mx-auto pb-20">

      <!-- ===== 页面头部 ===== -->
      <div class="mb-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">AI排名透视</h2>
          <div class="mt-2 text-sm text-gray-500"><span>深度分析品牌在不同 AI 引擎中的排名竞争态势</span></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <button class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all mb-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              导出
            </button>
          </div>
          <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
            列表
          </button>
        </div>
      </div>

      <!-- ===== 卡片1：排名指标 ===== -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="px-6 py-4 flex items-center justify-between border-b border-gray-100 rounded-t-2xl">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">排名指标</span>
          </div>
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              导出
            </button>
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-gray-400 select-none">统计周期</span>
              <div class="relative">
                <button class="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[200px]">
                  <div class="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                    <span>{{ rangeStart }}</span>
                    <span class="text-gray-300">-</span>
                    <span>{{ rangeEnd }}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 flex items-center gap-6 border-b border-gray-50">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-400 shrink-0 select-none">AI 引擎</span>
            <div class="relative">
              <button class="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[130px]">
                <span class="truncate">{{ engineLabel }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-400 shrink-0 select-none">监控问题</span>
            <div class="relative">
              <button class="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[180px] max-w-[300px]">
                <span class="truncate">{{ queryLabel }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          <div v-for="kpi in kpiCards" :key="kpi.key" class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-bold text-gray-700">{{ kpi.label }}</span>
                <div class="group relative">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300 cursor-help"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                  <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-[100] text-left leading-relaxed">
                    <div class="font-bold mb-1">{{ kpi.label }}</div>
                    <div class="text-gray-200">{{ kpi.tip }}</div>
                    <div class="mt-1.5 text-gray-300">公式 = {{ kpi.formula }}</div>
                    <div class="mt-0.5 text-[11px] text-gray-400">一次采样 = 单个话题 × 单个引擎 × 单次监测</div>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col items-end leading-none">
                <span :class="['text-3xl font-extrabold tracking-tight', kpi.color]">
                  {{ kpi.value }}<span class="text-lg">%</span>
                </span>
                <span class="text-[11px] text-gray-400 font-medium mt-1">{{ kpi.ratio }}</span>
              </div>
            </div>
            <div class="h-[120px]">
              <SparkLine :points="kpi.points" :labels="kpi.labels" :color="kpi.line" height="120" :digits="2" />
            </div>
            <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span class="text-xs text-gray-400">提及问题 / 监控总数</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 卡片2：品牌排名 ===== -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="px-6 py-4 flex items-center justify-between border-b border-gray-100 rounded-t-2xl">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M17 3H7v4h10z"/><path d="M17 5h3v4h-3z"/><path d="M7 5H4v4h3z"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">品牌排名</span>
          </div>
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              导出
            </button>
            <div class="flex items-center gap-2 relative">
              <span class="text-xs font-medium text-gray-400 select-none">统计周期</span>
              <div class="relative">
                <button class="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[200px]">
                  <div class="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                    <span>{{ rangeStart }}</span><span class="text-gray-300">-</span><span>{{ rangeEnd }}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-50">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-400 shrink-0 select-none">AI 引擎</span>
            <div class="relative">
              <button class="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[130px]">
                <span class="truncate">{{ engineLabel }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
          <div class="flex min-w-0 items-center gap-2">
            <span class="text-xs font-medium text-gray-400 shrink-0 select-none">监控问题</span>
            <div class="relative min-w-0 max-w-full">
              <button class="flex w-[clamp(180px,24vw,320px)] min-w-0 max-w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 shadow-sm transition">
                <span class="truncate">{{ queryLabel }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div class="lg:col-span-4 flex flex-col">
              <div class="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col h-[480px]">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[13px] font-semibold text-gray-900">排名榜单</span>
                  <button class="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-indigo-600 transition-colors shrink-0">
                    查看全部
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
                <div class="flex-1 overflow-y-auto -mx-1 px-1">
                  <div class="flex flex-col">
                    <div v-for="(r, i) in leaderboard" :key="r.name + i" class="grid items-center gap-3 py-3 px-1 border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60" style="grid-template-columns:28px 1fr auto;">
                      <span :class="['inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-extrabold font-mono shadow-sm', rankBadgeCls(r.current_rank || i + 1)]">{{ r.current_rank || i + 1 }}</span>
                      <div class="flex items-center gap-2 min-w-0">
                        <span :class="['text-[13.5px] font-semibold truncate', r.is_target ? 'text-indigo-600' : 'text-gray-900']">{{ r.name }}</span>
                      </div>
                      <div class="flex items-center shrink-0">
                        <span v-if="r.trend === 'new'" class="text-[10.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono">NEW</span>
                        <span v-else-if="r.trend === 'down'" class="text-[10.5px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-mono">▼ {{ r.rank_change }}</span>
                        <span v-else-if="r.trend === 'up'" class="text-[10.5px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-mono">▲ {{ Math.abs(r.rank_change || 0) }}</span>
                      </div>
                    </div>
                    <div v-if="!leaderboard.length" class="py-10 text-center text-sm text-gray-400">暂无榜单数据</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="lg:col-span-8 flex flex-col">
              <div class="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col h-[480px]">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[13px] font-semibold text-gray-900">排名趋势</span>
                  <span class="text-xs text-gray-400 font-medium">近 7 天</span>
                </div>
                <div class="flex-1 min-h-0">
                  <SparkLine v-if="hasRankTrend" :points="rankTrendPoints" :labels="rankTrendLabels" color="#4f46e5" height="380" :digits="0" />
                  <div v-else class="h-full flex items-center justify-center text-sm text-gray-400">暂无趋势数据</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 卡片3：全景排名矩阵 ===== -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col animate-fade-in-up">
        <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-indigo-50/20 rounded-t-2xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900 tracking-tight">全景排名矩阵</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">快速定位优势与劣势领域 · {{ matrixDate }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <span>日期:</span>
              </div>
              <input v-model="matrixDate" type="date" class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all" />
            </div>
            <div class="relative border-l border-gray-200 pl-4">
              <button class="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-600 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 shadow-sm transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>
                <span>显示列</span>
              </button>
            </div>
            <div class="relative border-l border-gray-200 pl-4">
              <button class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                <span>导出</span>
              </button>
            </div>
          </div>
        </div>
        <div class="px-5 pb-5 pt-3">
          <div class="max-h-[90vh] overflow-auto rounded-xl border border-gray-100">
            <table class="w-full">
              <thead>
                <tr>
                  <th class="px-3.5 py-2.5 text-left text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);box-shadow:rgb(236,236,243) 0 2px 0, rgba(50,50,80,.06) 0 6px 12px;">问题</th>
                  <th class="px-2 py-2.5 text-center text-[11.5px] font-semibold whitespace-nowrap" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);box-shadow:rgb(236,236,243) 0 2px 0, rgba(50,50,80,.06) 0 6px 12px;">
                    <button class="inline-flex items-center justify-center gap-1 leading-tight hover:text-indigo-600 transition-colors">
                      <span>综合排名</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                    </button>
                  </th>
                  <th class="px-2 py-2.5 text-center text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);box-shadow:rgb(236,236,243) 0 2px 0, rgba(50,50,80,.06) 0 6px 12px;">品牌提及率</th>
                  <th class="px-2 py-2.5 text-center text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);box-shadow:rgb(236,236,243) 0 2px 0, rgba(50,50,80,.06) 0 6px 12px;">Top3 推荐率</th>
                  <th class="px-2 py-2.5 text-center text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);box-shadow:rgb(236,236,243) 0 2px 0, rgba(50,50,80,.06) 0 6px 12px;">首位推荐率</th>
                  <th v-for="e in engines" :key="e.key" class="px-2 py-2.5 text-center text-[11.5px] font-semibold align-bottom whitespace-nowrap" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);box-shadow:rgb(236,236,243) 0 2px 0, rgba(50,50,80,.06) 0 6px 12px;">
                    <button class="inline-flex flex-col items-center leading-tight group">
                      <span class="inline-flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                        {{ e.name }}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in matrixRows" :key="row.query" class="transition-colors hover:bg-[#fafafe]">
                  <td class="px-3.5 py-2.5 text-left align-middle" style="border-bottom:1px solid rgb(242,242,248);max-width:240px;white-space:normal;line-height:1.4;">
                    <span class="text-[12.5px] text-gray-700" :title="row.query">{{ row.query }}</span>
                  </td>
                  <td class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);">
                    <span v-if="row.overall === '未上榜'" class="text-[11.5px] font-semibold" style="color: rgb(192, 24, 37);">未上榜</span>
                    <span v-else class="inline-flex items-center justify-center min-w-[56px] px-2.5 py-1 rounded-lg text-[11.5px] font-bold font-mono" style="background: rgb(230, 251, 244); color: rgb(0, 110, 84);">第{{ row.overall }}名</span>
                  </td>
                  <td class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);"><span class="text-[12.5px] font-mono font-semibold text-gray-700">{{ pct(row.mention_rate) }}</span></td>
                  <td class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);"><span class="text-[12.5px] font-mono font-semibold text-gray-700">{{ pct(row.top3_mention_rate) }}</span></td>
                  <td class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);"><span class="text-[12.5px] font-mono font-semibold text-gray-700">{{ pct(row.first_mention_rate) }}</span></td>
                  <td v-for="e in engines" :key="e.key" class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);">
                    <span :class="cellCls()" :style="cellStyle(row.rank_value[e.key])" :title="`查看 ${row.query} 在${e.name}的快照`">{{ cellText(row.rank_value[e.key]) }}</span>
                  </td>
                </tr>
                <tr v-if="!matrixRows.length">
                  <td :colspan="5 + engines.length" class="px-3.5 py-10 text-center text-sm text-gray-400">暂无排名数据（采集或解析尚未产出）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import SparkLine from '@/components/SparkLine.vue';

// 对标 geoapi.timus.cn：5 家引擎，顺序 doubao/wenxin/deepseek/qwen/yuanbao
const ENGINES_ALL = ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'];
const engines = [
  { key: 'doubao', name: '豆包' },
  { key: 'wenxin', name: '文心一言' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'qwen', name: '通义千问' },
  { key: 'yuanbao', name: '元宝' },
] as const;

const rangeStart = ref('—');
const rangeEnd = ref('—');
const matrixDate = ref('');
const engineLabel = ref('全部');
const queryLabel = ref('全部问题');
const industryQueries = ref<any[]>([]);
const matrix = ref<any>({ list: {}, platforms: [] });
const ranking = ref<any[]>([]);
const visibilityTrend = ref<any[]>([]);
const mentionTrend = ref<any>({ trend: [] });
const top3Trend = ref<any>({ trend: [] });
const firstTrend = ref<any>({ trend: [] });

const pct = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? `${(+v).toFixed(2)}%` : '0.00%');
const fmtDate = (s: string) => (s ? s.slice(5) : '');

const leaderboard = computed(() => ranking.value.slice(0, 10));

/* 综合排名：优先用后端 rank_value.all；否则按各引擎位次均值升序（全部未提及则「未上榜」） */
const matrixRows = computed(() => {
  const rows: any[] = Object.values(matrix.value.list || {});
  const scored = rows.map(r => {
    const all = r.rank_value?.all;
    const allN = Number(all);
    const _avg = Number.isFinite(allN) ? allN : null;
    const fallbackVals = ENGINES_ALL.map(k => Number(r.rank_value?.[k])).filter(Number.isFinite);
    return {
      ...r,
      _avg: _avg ?? (fallbackVals.length ? fallbackVals.reduce((s: number, n: number) => s + n, 0) / fallbackVals.length : null),
    };
  });
  const orderable = scored.filter(r => r._avg != null).sort((a, b) => a._avg - b._avg);
  const rankOf = new Map(orderable.map((r, i) => [r.query, i + 1]));
  return scored.map(r => ({ ...r, overall: rankOf.get(r.query) ?? '未上榜' }));
});

const trendLabels = computed(() => (mentionTrend.value.trend || []).map((t: any) => fmtDate(t.date_day)));
const rankTrendLabels = computed(() => visibilityTrend.value.map((t: any) => fmtDate(t.date_day)));
const rankTrendPoints = computed(() => visibilityTrend.value.map((t: any) => Number(t.rank_value)).filter((n: number) => Number.isFinite(n)));
const hasRankTrend = computed(() => rankTrendPoints.value.length > 1);

const sumOf = (t: any) => t?.summary?.all || { denominator: 0, numerator: 0, rate: 0 };

const kpiCards = computed(() => [
  {
    key: 'mention', label: '品牌提及率', color: 'text-blue-600', line: '#2563eb',
    value: (+(sumOf(mentionTrend.value).rate || 0)).toFixed(2),
    ratio: `${sumOf(mentionTrend.value).numerator || 0} / ${sumOf(mentionTrend.value).denominator || 0}`,
    tip: '品牌在 AI 答案中被提及的采样占比，不限位次。',
    formula: '被提及的采样数 ÷ 总采样数',
    points: (mentionTrend.value.trend || []).map((t: any) => t.rate ?? 0), labels: trendLabels.value,
  },
  {
    key: 'top3', label: 'Top3 推荐率', color: 'text-green-600', line: '#059669',
    value: (+(sumOf(top3Trend.value).rate || 0)).toFixed(2),
    ratio: `${sumOf(top3Trend.value).numerator || 0} / ${sumOf(top3Trend.value).denominator || 0}`,
    tip: '品牌在 AI 答案中位列前三名的采样占比。',
    formula: '进入 Top3 的采样数 ÷ 总采样数',
    points: (top3Trend.value.trend || []).map((t: any) => t.rate ?? 0), labels: trendLabels.value,
  },
  {
    key: 'first', label: '首位推荐率', color: 'text-amber-500', line: '#d97706',
    value: (+(sumOf(firstTrend.value).rate || 0)).toFixed(2),
    ratio: `${sumOf(firstTrend.value).numerator || 0} / ${sumOf(firstTrend.value).denominator || 0}`,
    tip: '品牌在 AI 答案中位列首位的采样占比。',
    formula: '排到首位的采样数 ÷ 总采样数',
    points: (firstTrend.value.trend || []).map((t: any) => t.rate ?? 0), labels: trendLabels.value,
  },
]);

function rankBadgeCls(i: number) {
  if (i === 1) return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white';
  if (i === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white';
  if (i === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white';
  return 'bg-gray-100 text-gray-400';
}

function cellCls() {
  return 'inline-block min-w-[36px] px-[7px] py-[3px] rounded-md text-[12.5px] font-bold font-mono cursor-pointer transition-all hover:ring-2 hover:ring-indigo-300';
}
function cellStyle(v: any) {
  if (Number.isFinite(Number(v))) return { background: 'rgb(230, 251, 244)', color: 'rgb(0, 110, 84)' };
  return { background: 'rgb(254, 242, 242)', color: 'rgb(192, 24, 37)' };
}
function cellText(v: any) {
  if (Number.isFinite(Number(v))) return `#${v}`;
  return '未上榜';
}

function lastNDays(n: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (n - 1));
  const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: f(start), end: f(end) };
}

onMounted(async () => {
  const { start, end } = lastNDays(7);
  rangeStart.value = start;
  rangeEnd.value = end;
  matrixDate.value = end;
  try {
    const [qs, refs, a, b, c] = await Promise.all([
      monitorApi.queryList('industry'),
      monitorApi.getReferences(),
      monitorApi.mentionRateTrend(start, end),
      monitorApi.top3RateTrend(start, end),
      monitorApi.firstRateTrend(start, end),
    ]);
    industryQueries.value = qs?.list || [];
    if (industryQueries.value.length) queryLabel.value = industryQueries.value[0].query || '全部问题';
    ranking.value = refs?.company_ranking_data || [];
    visibilityTrend.value = refs?.visibility_trend?.all || [];
    mentionTrend.value = a || { trend: [] };
    top3Trend.value = b || { trend: [] };
    firstTrend.value = c || { trend: [] };
    const qids = industryQueries.value.map((q: any) => q.id).filter((n: number) => Number.isFinite(n));
    if (qids.length) {
      const m = await monitorApi.fullRankingMatrix(qids, end);
      matrix.value = m || { list: {}, platforms: [] };
      if ((m as any)?.valid_data_date_list?.length) matrixDate.value = (m as any).valid_data_date_list[0];
    }
  } catch { /* 保持空态 */ }
});
</script>
