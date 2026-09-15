<template>
  <div class="geo-page">
    <div class="geo-page-header">
      <div class="geo-page-header__text">
        <h1 class="geo-page-title">引用源追溯</h1>
        <p class="geo-page-desc">追踪 AI 回答中高频引用的信息来源与权重归因</p>
      </div>
      <div class="geo-page-header__actions">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            :disabled="exporting"
            @click="onExport"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            {{ exporting ? '导出中...' : '导出数据' }}
          </button>
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            @click="importOpen = true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            导入自有文章
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 animate-fade-in max-w-[1600px] mx-auto pb-20">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible flex flex-col min-h-[600px]">
        <!-- 筛选行 -->
        <div class="flex flex-col border-b border-gray-100">
          <div class="w-full bg-white px-6 py-4 flex flex-wrap gap-x-6 gap-y-4 items-center">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
                <span>问题:</span>
              </div>
              <DashQuerySelect
                v-model="queryId"
                v-model:label="queryLabel"
                :options="queryOptions"
                btn-class="min-w-[200px] max-w-[300px] rounded-xl px-4 py-2 text-xs font-bold bg-gray-50 border-gray-100"
                @change="reload"
              />
            </div>
            <div class="flex items-center gap-3 relative">
              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <span>AI引擎:</span>
              </div>
              <div class="relative" ref="engineRoot">
                <button
                  type="button"
                  class="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[140px]"
                  @click.stop="engineOpen = !engineOpen"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :style="{ background: engineDot }"></span>
                    <span>{{ engineLabel }}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div
                  v-if="engineOpen"
                  class="absolute top-full left-0 z-50 mt-1 w-[230px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-2xl"
                  @click.stop
                >
                  <div class="border-b border-gray-50 px-4 py-2 text-[10px] font-bold text-gray-400">可多选模型，点击外部完成</div>
                  <div
                    class="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-[13px] transition-colors"
                    :class="engines.length === 0 || engines.length >= ENGINE_OPTS.length ? 'bg-indigo-50 font-semibold text-indigo-700' : 'font-medium text-gray-600 hover:bg-gray-50'"
                    @click="selectAllEngines"
                  >全部</div>
                  <div
                    v-for="opt in ENGINE_OPTS"
                    :key="opt.value"
                    class="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-[13px] transition-colors"
                    :class="engines.includes(opt.value) && engines.length < ENGINE_OPTS.length ? 'bg-indigo-50 font-semibold text-indigo-700' : 'font-medium text-gray-600 hover:bg-gray-50'"
                    @click="toggleEngine(opt.value)"
                  >{{ opt.label }}</div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3 relative">
              <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                <span>日期:</span>
              </div>
              <DashDateRange v-model:start="rangeStart" v-model:end="rangeEnd" @change="reload" />
            </div>
          </div>
          <div class="px-8 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500 font-medium">
                当前展示：
                <span class="font-bold text-gray-900 mx-1">{{ queryLabel || '全部问题' }}</span>
                <span class="mx-1">·</span>
                <span class="font-bold text-gray-900 mx-1">{{ engineSummary }}</span>
              </span>
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{{ loadedCount }} 个来源</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  type="button"
                  :class="['px-3 py-1.5 rounded-md text-xs font-bold transition-all', filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                  @click="filter = 'all'"
                >全部</button>
                <button
                  type="button"
                  :class="['px-3 py-1.5 rounded-md text-xs font-bold transition-all', filter === 'own' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                  @click="filter = 'own'"
                >自有文章</button>
              </div>
              <div class="relative group">
                <input
                  v-model="keyword"
                  placeholder="搜索来源名称..."
                  class="bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-10 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500 w-64 transition-all"
                  @keydown.enter="applySearch"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
                <button
                  type="button"
                  title="搜索信源平台"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  @click="applySearch"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 5v14"/><path d="M5 12h14"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格 -->
        <div class="overflow-x-auto min-h-[400px]">
          <table class="w-full min-w-[1000px] text-left">
            <thead class="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th class="px-8 py-4 w-1/3 cursor-pointer hover:text-gray-600 transition-colors select-none" @click="toggleSort('name')">
                  <div class="flex items-center gap-1">
                    <span>信源平台 (Platform)</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-center cursor-pointer hover:text-gray-600 transition-colors select-none" @click="toggleSort('ref')">
                  <div class="flex items-center justify-center gap-1">
                    总引用次
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <span>豆包媒体权威度</span>
                    <span class="group/authority-tip relative inline-flex">
                      <button type="button" class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                      </button>
                      <span class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-white shadow-lg group-hover/authority-tip:block">此评价来源于豆包接口。</span>
                    </span>
                  </div>
                </th>
                <th class="px-6 py-4 text-center">覆盖模型</th>
                <th class="px-6 py-4 text-center">发稿通道</th>
                <th class="px-6 py-4 text-center">分析</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <template v-for="s in filteredList" :key="s.canonical_source">
                <tr
                  class="group transition-all cursor-pointer"
                  :class="expanded === s.canonical_source ? 'bg-indigo-50/30' : 'hover:bg-gray-50/50'"
                  @click="toggleExpand(s)"
                >
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="text-gray-400 transition-colors">
                        <svg v-if="expanded === s.canonical_source" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <div class="text-sm font-extrabold text-gray-800">{{ s.canonical_source }}</div>
                          <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">{{ s.article_count }} 篇文章</span>
                        </div>
                        <div class="mt-0.5 text-xs text-gray-400">{{ s.category || '未分类' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-center">
                    <div class="flex flex-col items-center gap-1.5">
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-base font-black text-gray-900">{{ s.ref_count }}</span>
                        <span class="text-[11px] font-semibold text-gray-400">{{ share(s.ref_count) }}</span>
                      </div>
                      <div class="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500" :style="{ width: shareBar(s.ref_count) }"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-center">
                    <span
                      v-if="authLabel(s)"
                      class="inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium"
                      :class="authBadgeClass(s)"
                    >{{ authLabel(s) }}</span>
                    <span v-else class="text-xs text-gray-300">--</span>
                  </td>
                  <td class="px-6 py-5 text-center">
                    <div class="flex flex-wrap items-center justify-center gap-1.5">
                      <span
                        v-for="p in platformTags(s)"
                        :key="p.key"
                        class="text-[10px] font-medium px-2 py-1 rounded text-white"
                        :style="{ backgroundColor: p.color }"
                      >{{ p.name }}<span class="ml-1 opacity-80">{{ p.count }}</span></span>
                      <span v-if="!platformTags(s).length" class="text-xs text-gray-300">--</span>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-center">
                    <div class="flex flex-col items-center gap-0.5">
                      <span v-if="s.sell_price != null" class="inline-flex items-center gap-0.5 whitespace-nowrap text-[11px] font-bold text-indigo-600">{{ s.sell_price }} 积分起</span>
                      <span v-else class="text-[11px] text-gray-300">未开通</span>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-center" @click.stop>
                    <button
                      type="button"
                      title="打开信源分析"
                      class="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-indigo-500 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white disabled:opacity-50"
                      :disabled="analyzing === s.canonical_source"
                      @click="openAnalyze(s)"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
                      {{ analyzing === s.canonical_source ? '分析中' : '分析' }}
                    </button>
                  </td>
                </tr>

                <tr v-if="expanded === s.canonical_source && expandLoading[s.canonical_source]">
                  <td colspan="6" class="px-6 py-4 pl-24 text-xs text-gray-400">加载文章中…</td>
                </tr>
                <tr
                  v-for="art in (articlesMap[s.canonical_source] || [])"
                  v-show="expanded === s.canonical_source"
                  :key="art.article_id"
                  class="bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                >
                  <td class="px-6 py-3 pl-24 relative">
                    <div class="absolute left-16 top-1/2 -translate-y-1/2 w-4 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-lg"></div>
                    <div class="flex items-center gap-2">
                      <a
                        v-if="art.url"
                        :href="art.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-xs font-bold hover:underline truncate max-w-[300px] text-gray-700 hover:text-indigo-600"
                        :title="art.title"
                        @click.stop
                      >{{ art.title }}</a>
                      <span v-else class="text-xs font-bold truncate max-w-[300px] text-gray-700" :title="art.title">{{ art.title }}</span>
                      <button
                        v-if="!art.is_own"
                        type="button"
                        class="text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all border whitespace-nowrap shrink-0 text-gray-500 bg-gray-50 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                        title="点击标记为自有文章"
                        @click.stop="tagOwn(art, s.canonical_source)"
                      >标记自有</button>
                      <button
                        v-else
                        type="button"
                        class="text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all border whitespace-nowrap shrink-0 text-blue-600 bg-blue-50 border-blue-200"
                        title="取消自有标记"
                        @click.stop="tagOwn(art, s.canonical_source, false)"
                      >自有</button>
                    </div>
                    <div class="text-[10px] text-gray-400 mt-0.5 truncate max-w-[350px]"></div>
                  </td>
                  <td class="px-6 py-3 text-center">
                    <span class="text-xs font-medium text-gray-500">{{ art.ref_count }}</span>
                  </td>
                  <td class="px-6 py-3 text-center"><span class="text-xs text-gray-300">--</span></td>
                  <td class="px-6 py-3 text-center">
                    <div class="flex flex-wrap items-center justify-center gap-2">
                      <span
                        v-for="p in articlePlatformTags(art)"
                        :key="p.key"
                        class="text-[10px] font-medium px-2 py-1 rounded text-white"
                        :style="{ backgroundColor: p.color }"
                      >{{ p.name }}</span>
                      <span v-if="!articlePlatformTags(art).length" class="text-xs text-gray-300">--</span>
                    </div>
                  </td>
                  <td class="px-6 py-3 text-center"><span class="text-xs text-gray-300">--</span></td>
                  <td class="px-6 py-3 text-center"><span class="text-xs text-gray-300">--</span></td>
                </tr>
                <tr v-if="expanded === s.canonical_source && !expandLoading[s.canonical_source] && !(articlesMap[s.canonical_source] || []).length">
                  <td colspan="6" class="px-6 py-4 pl-24 text-xs text-gray-400">该信源下暂无文章明细</td>
                </tr>
              </template>
              <tr v-if="!filteredList.length">
                <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-400">
                  {{ loading ? '加载中…' : '暂无信源引用数据（采集或解析尚未产出）' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="hasMore" class="p-4 bg-gray-50/30 border-t border-gray-100 flex justify-center">
          <button
            type="button"
            class="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? '加载中…' : '查看更多关联引用数据' }}
            <svg v-if="!loadingMore" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 分析抽屉 -->
    <div v-if="analyzeOpen" class="fixed inset-0 z-[9998] bg-gray-950/35 backdrop-blur-[2px]" @click="closeAnalyze" />
    <aside
      v-if="analyzeOpen"
      class="fixed inset-y-0 right-0 z-[9999] flex w-[min(840px,96vw)] flex-col bg-white shadow-[-12px_0_40px_rgba(16,18,30,0.18)]"
    >
      <div class="shrink-0 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-5 pb-4 pt-5 sm:px-7">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="truncate text-[19px] font-extrabold text-gray-900">{{ analyzeName }}</h3>
            </div>
          </div>
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="关闭信源分析"
            @click="closeAnalyze"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="mt-4 inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1">
          <button
            type="button"
            class="rounded-lg px-5 py-2 text-[13px] font-bold transition-all"
            :class="analyzeTab === 'info' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'"
            @click="analyzeTab = 'info'"
          >信源信息</button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg px-5 py-2 text-[13px] font-bold transition-all"
            :class="analyzeTab === 'media' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'"
            @click="switchMediaTab"
          >
            媒体号
            <span class="rounded-full px-2 py-0.5 text-[10px]" :class="analyzeTab === 'media' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'">
              {{ mediaTotal || analyzeData?.source?.basic_info?.available_media_count || '—' }}
            </span>
          </button>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
        <div v-if="analyzeLoading" class="py-16 text-center text-sm text-gray-400">正在加载该信源的分析数据...</div>
        <template v-else-if="analyzeTab === 'info' && analyzeData?.source">
          <section class="mb-6">
            <h4 class="mb-2.5 text-xs font-bold text-gray-500">基本信息</h4>
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div class="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3">
                <span class="block text-[10px] text-gray-400">媒体类型</span>
                <b class="mt-1 block truncate text-base font-extrabold text-gray-900">{{ analyzeData.source.basic_info.media_type || '—' }}</b>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3">
                <span class="block text-[10px] text-gray-400">可投媒体号</span>
                <b class="mt-1 block truncate text-base font-extrabold text-gray-900">
                  {{ Number(analyzeData.source.basic_info.available_media_count || 0).toLocaleString() }} 家
                </b>
              </div>
            </div>
          </section>
          <section class="mb-6">
            <h4 class="mb-2.5 text-xs font-bold text-gray-500">信源简介</h4>
            <div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
              {{ analyzeData.source.description }}
            </div>
          </section>
          <section class="mb-6">
            <h4 class="mb-2.5 text-xs font-bold text-gray-500">发稿收录情况</h4>
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div class="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3">
                <span class="block text-[10px] text-gray-400">出稿时效性</span>
                <b class="mt-1 block truncate text-base font-extrabold text-gray-900">—</b>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3">
                <span class="block text-[10px] text-gray-400">平均出稿率</span>
                <b class="mt-1 block truncate text-base font-extrabold text-gray-900">
                  {{ analyzeData.source.publish_stats.average_success_rate != null ? `${analyzeData.source.publish_stats.average_success_rate}%` : '—' }}
                </b>
              </div>
            </div>
          </section>
          <section class="mb-6">
            <h4 class="mb-1 text-xs font-bold text-gray-500">
              按 AI 引擎
              <span class="ml-2 text-[11px] font-medium text-gray-400">
                共 {{ analyzeData.source.citation_performance.total_ref_count }} 次被引 · 覆盖 {{ analyzeData.source.citation_performance.engine_count }} 个引擎
              </span>
            </h4>
            <div>
              <div
                v-for="e in analyzeData.source.citation_performance.engine_breakdown"
                :key="e.platform"
                class="flex items-center gap-3 border-b border-gray-100 px-0.5 py-3 last:border-0"
              >
                <span class="h-2 w-2 shrink-0 rounded-full" :style="{ background: PLATFORM_META[e.platform]?.color || '#6b7280' }"></span>
                <span class="flex-1 text-sm text-gray-700">{{ e.display_name }}</span>
                <b class="text-base font-extrabold text-gray-900">{{ e.ref_count }}<em class="ml-1 text-[10px] not-italic font-semibold text-gray-400">次</em></b>
              </div>
            </div>
          </section>
          <section class="mb-6">
            <h4 class="mb-1 text-xs font-bold text-gray-500">
              监控问题覆盖
              <span class="ml-2 text-[11px] font-medium text-gray-400">覆盖 {{ analyzeData.source.citation_performance.query_count }} 个监控问题</span>
            </h4>
            <div>
              <div
                v-for="q in analyzeData.source.citation_performance.query_breakdown"
                :key="q.query_id"
                class="flex items-center gap-4 border-b border-gray-100 px-0.5 py-3 last:border-0"
              >
                <span class="min-w-0 flex-1 truncate text-[13px] text-gray-600" :title="q.question">{{ q.question }}</span>
                <b class="shrink-0 text-base font-extrabold text-gray-900">{{ q.ref_count }}<em class="ml-1 text-[10px] not-italic font-semibold text-gray-400">次</em></b>
              </div>
              <div v-if="!analyzeData.source.citation_performance.query_breakdown.length" class="py-4 text-xs text-gray-400">暂无问题覆盖</div>
            </div>
          </section>
          <p class="mt-6 border-t border-gray-100 pt-3 text-[10px] text-gray-400">信息来自信源库档案与当前筛选范围内的监控快照</p>
        </template>
        <template v-else-if="analyzeTab === 'media'">
          <div v-if="mediaLoading" class="py-16 text-center text-sm text-gray-400">加载媒体号…</div>
          <div v-else class="space-y-3">
            <div
              v-for="m in mediaList"
              :key="m.media_key"
              class="rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-indigo-200 transition-colors"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="truncate text-sm font-extrabold text-gray-900">{{ m.name }}</div>
                  <div class="mt-1 text-[11px] text-gray-400">{{ m.taxonomy || m.category || '' }} · {{ m.area || '全国' }}</div>
                  <div v-if="m.note" class="mt-1.5 text-xs text-gray-500 line-clamp-2">{{ m.note }}</div>
                </div>
                <div class="shrink-0 text-right">
                  <div class="text-sm font-extrabold text-indigo-600">{{ m.sell_price != null ? `${m.sell_price} 积分` : '—' }}</div>
                  <div v-if="m.list_price != null" class="text-[10px] text-gray-400 line-through">{{ m.list_price }}</div>
                </div>
              </div>
            </div>
            <div v-if="!mediaList.length" class="py-12 text-center text-sm text-gray-400">暂无可投媒体号</div>
          </div>
        </template>
      </div>
    </aside>

    <!-- 导入自有文章 -->
    <div v-if="importOpen" class="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" @click.self="closeImport">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">导入自有文章</h3>
            <p class="text-xs text-gray-500 mt-1">登记后系统持续监控它在 AI 回答中的被引情况，并计入深度分析</p>
          </div>
          <button type="button" class="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-40" :disabled="importing" @click="closeImport">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="flex items-center justify-between mb-1.5">
          <label class="block text-sm font-semibold text-gray-700">文章标题与链接</label>
          <span class="text-xs text-gray-400">支持粘贴多行（标题 Tab 链接，或每行一条链接）</span>
        </div>
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div class="grid grid-cols-[90px_1fr_1.4fr_36px] gap-2 bg-gray-50 text-xs font-semibold text-gray-500 px-3 py-2">
            <div>类型</div><div>标题</div><div>链接</div><div></div>
          </div>
          <div class="max-h-[240px] overflow-y-auto divide-y divide-gray-100" @paste="onImportPaste">
            <div
              v-for="(row, idx) in importRows"
              :key="idx"
              class="grid grid-cols-[90px_1fr_1.4fr_36px] items-center gap-2 px-2 py-1.5"
            >
              <select v-model="row.type" class="w-full px-1.5 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-indigo-400 bg-white">
                <option value="graphic">图文</option>
                <option value="video">视频</option>
              </select>
              <input v-model="row.title" placeholder="文章标题" class="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-indigo-400" />
              <input v-model="row.url" placeholder="https://..." class="w-full px-2 py-1.5 text-xs font-mono border border-gray-200 rounded-md outline-none focus:border-indigo-400" />
              <button
                type="button"
                class="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 flex items-center justify-center"
                :disabled="importRows.length <= 1"
                @click="importRows.splice(idx, 1)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
        <button type="button" class="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700" @click="importRows.push({ type: 'graphic', title: '', url: '' })">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          添加一行
        </button>

        <div class="flex items-center justify-between mt-4 mb-1.5">
          <label class="block text-sm font-semibold text-gray-700">或上传 Excel 批量导入</label>
          <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700" @click="downloadImportTemplate">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
            下载导入模板
          </button>
        </div>
        <label class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-500 flex-shrink-0"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-bold text-gray-800">点击上传 Excel</div>
            <div class="text-xs text-gray-400 truncate">含「URL/链接」列即可，「标题」列可选一并导入 · 支持 .xlsx / .xls</div>
          </div>
          <span class="shrink-0 text-xs font-semibold text-gray-400">{{ excelName || '未选择' }}</span>
          <input ref="excelInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onExcelPicked" />
        </label>

        <div class="flex items-start gap-2 mt-4 text-xs text-gray-400 leading-relaxed">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>自有文章导入后计入「自有文章覆盖」与被引监控，可衡量 GEO 投放效果。</span>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-60" :disabled="importing" @click="closeImport">取消</button>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg disabled:opacity-50"
            :disabled="importing"
            @click="submitImport"
          >{{ importing ? '导入中...' : '导入并开始监控' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { monitorApi, type SourceAnalyzeResp, type SourceArticleItem, type SourceMediaAccount } from '@/api/modules/monitor';
import { lastNDays } from '@/utils/engines';
import DashQuerySelect from '@/components/DashQuerySelect.vue';
import DashDateRange from '@/components/DashDateRange.vue';
import * as XLSX from 'xlsx';

const route = useRoute();
const type = computed<'industry' | 'brand'>(() => (route.query.type === 'brand' ? 'brand' : 'industry'));

const PLATFORM_META: Record<string, { name: string; color: string }> = {
  doubao: { name: '豆包', color: '#f59e0b' },
  deepseek: { name: 'DeepSeek', color: '#0ea5e9' },
  wenxin: { name: '文心一言', color: '#ec4899' },
  qwen: { name: '通义千问', color: '#9333ea' },
  yuanbao: { name: '元宝', color: '#6366f1' },
};

const ENGINE_OPTS = [
  { value: 'doubao', label: '豆包' },
  { value: 'wenxin', label: '文心一言' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'qwen', label: '通义千问' },
  { value: 'yuanbao', label: '元宝' },
];

const list = ref<any[]>([]);
const summary = ref<any>({ total_ref_count: 0 });
const rangeStart = ref('—');
const rangeEnd = ref('—');
const filter = ref<'all' | 'own'>('all');
const keyword = ref('');
const searchKeyword = ref('');
const loading = ref(false);
const loadingMore = ref(false);
const exporting = ref(false);
const sortKey = ref<'ref' | 'name'>('ref');
const sortAsc = ref(false);
const page = ref(1);
const pageSize = 20;
const totalSources = ref(0);

const queryId = ref<string | number>(0);
const queryLabel = ref('全部问题');
const queryOptions = ref<{ value: string | number; label: string }[]>([]);

const engines = ref<string[]>([]);
const engineOpen = ref(false);
const engineRoot = ref<HTMLElement | null>(null);

const expanded = ref<string | null>(null);
const articlesMap = ref<Record<string, SourceArticleItem[]>>({});
const expandLoading = ref<Record<string, boolean>>({});

const analyzeOpen = ref(false);
const analyzeTab = ref<'info' | 'media'>('info');
const analyzeName = ref('');
const analyzeLoading = ref(false);
const analyzing = ref<string | null>(null);
const analyzeData = ref<SourceAnalyzeResp | null>(null);
const mediaList = ref<SourceMediaAccount[]>([]);
const mediaTotal = ref(0);
const mediaLoading = ref(false);

const importOpen = ref(false);
const importing = ref(false);
const importRows = ref([{ type: 'graphic', title: '', url: '' }]);
const excelInput = ref<HTMLInputElement | null>(null);
const excelName = ref('');

const loadedCount = computed(() => list.value.length);
const hasMore = computed(() => list.value.length < totalSources.value);

const engineLabel = computed(() => {
  if (!engines.value.length || engines.value.length >= ENGINE_OPTS.length) return '全部·网页端';
  const names = ENGINE_OPTS.filter(o => engines.value.includes(o.value)).map(o => o.label);
  return `${names.join('、')}·网页端`;
});
const engineDot = computed(() => {
  if (!engines.value.length || engines.value.length >= ENGINE_OPTS.length) return '#111827';
  return PLATFORM_META[engines.value[0]]?.color || '#6366f1';
});
const engineSummary = computed(() => {
  if (!engines.value.length || engines.value.length >= ENGINE_OPTS.length) return '全部模型·网页端';
  return `${ENGINE_OPTS.filter(o => engines.value.includes(o.value)).map(o => o.label).join('、')}·网页端`;
});

const filteredList = computed(() => {
  let arr = [...list.value];
  if (filter.value === 'own') arr = arr.filter((s: any) => (s.own_article_count || 0) > 0);
  const kw = searchKeyword.value.trim();
  if (kw) arr = arr.filter((s: any) => (s.canonical_source || '').includes(kw));
  arr.sort((a: any, z: any) => {
    if (sortKey.value === 'name') {
      const cmp = String(a.canonical_source || '').localeCompare(String(z.canonical_source || ''));
      return sortAsc.value ? cmp : -cmp;
    }
    const cmp = (a.ref_count || 0) - (z.ref_count || 0);
    return sortAsc.value ? cmp : -cmp;
  });
  return arr;
});
const maxRef = computed(() => Math.max(1, ...filteredList.value.map((s: any) => s.ref_count || 0)));

function share(n: number) {
  const totalRef = summary.value.total_ref_count || 1;
  return `${((n / totalRef) * 100).toFixed(1)}%`;
}
function shareBar(n: number) {
  return `${Math.max(0, Math.min(100, (n / maxRef.value) * 100))}%`;
}
function authLabel(s: any) {
  const des = String(s?.auth_info_des || '').trim();
  if (des) return des;
  const level = s?.auth_info_level;
  if (level === 1 || level === '1') return '一般不权威';
  if (level === 2 || level === '2') return '正常权威';
  if (level === 3 || level === '3') return '一般权威';
  return '';
}
function authBadgeClass(s: any) {
  const label = authLabel(s);
  if (label.includes('不权威')) return 'bg-gray-50 text-gray-600 border-gray-200';
  if (label.includes('正常权威')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (label.includes('权威')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
}
function platformTags(s: any) {
  return Object.entries(s.platforms || {}).map(([k, v]: any) => ({
    key: k,
    name: PLATFORM_META[k]?.name || k,
    color: PLATFORM_META[k]?.color || '#6b7280',
    count: v?.ref_count || 0,
  }));
}
function articlePlatformTags(art: SourceArticleItem) {
  return Object.keys(art.platforms || {}).map(k => ({
    key: k,
    name: PLATFORM_META[k]?.name || k,
    color: PLATFORM_META[k]?.color || '#6b7280',
  }));
}

function toggleSort(key: 'ref' | 'name') {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value;
  else {
    sortKey.value = key;
    sortAsc.value = key === 'name';
  }
}

function applySearch() {
  searchKeyword.value = keyword.value;
}

function selectAllEngines() {
  engines.value = [];
  engineOpen.value = false;
  reload();
}
function toggleEngine(v: string) {
  // 空数组 =「全部」；从全部点某一项应变成「只选这一项」（对齐 DashEngineMulti）
  const next = new Set(engines.value.length ? engines.value : []);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  if (next.size === 0 || next.size >= ENGINE_OPTS.length) {
    engines.value = [];
    return;
  }
  engines.value = [...next];
}

function onDocClick(e: MouseEvent) {
  if (engineRoot.value && !engineRoot.value.contains(e.target as Node)) engineOpen.value = false;
}

async function fetchStats(pageNo: number, append: boolean) {
  const opts: { query_id?: number; platforms?: string[] } = {};
  const qid = Number(queryId.value);
  if (qid > 0) opts.query_id = qid;
  if (engines.value.length && engines.value.length < ENGINE_OPTS.length) opts.platforms = [...engines.value];
  const resp: any = await monitorApi.sourceStats(rangeStart.value, rangeEnd.value, pageNo, pageSize, type.value, opts);
  const rows = resp?.list || [];
  list.value = append ? [...list.value, ...rows] : rows;
  summary.value = resp?.summary || { total_ref_count: 0 };
  totalSources.value = Number(resp?.total ?? resp?.summary?.total_sources ?? list.value.length) || 0;
  page.value = pageNo;
}

async function reload() {
  loading.value = true;
  expanded.value = null;
  articlesMap.value = {};
  page.value = 1;
  try {
    await fetchStats(1, false);
  } catch {
    list.value = [];
    totalSources.value = 0;
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  try {
    await fetchStats(page.value + 1, true);
  } catch {
    Message.error('加载更多失败');
  } finally {
    loadingMore.value = false;
  }
}

async function toggleExpand(s: any) {
  const name = s.canonical_source;
  if (expanded.value === name) {
    expanded.value = null;
    return;
  }
  expanded.value = name;
  if (articlesMap.value[name]) return;
  expandLoading.value = { ...expandLoading.value, [name]: true };
  try {
    const opts: any = {
      start: rangeStart.value,
      end: rangeEnd.value,
      canonical_source: name,
      category: type.value,
      page: 1,
      page_size: 50,
    };
    const qid = Number(queryId.value);
    if (qid > 0) opts.query_id = qid;
    if (engines.value.length && engines.value.length < ENGINE_OPTS.length) opts.platforms = [...engines.value];
    const resp: any = await monitorApi.sourceArticles(opts);
    articlesMap.value = { ...articlesMap.value, [name]: resp?.list || [] };
  } catch {
    articlesMap.value = { ...articlesMap.value, [name]: [] };
  } finally {
    expandLoading.value = { ...expandLoading.value, [name]: false };
  }
}

async function tagOwn(art: SourceArticleItem, sourceName: string, is_own = true) {
  try {
    await monitorApi.tagOwnArticle({ article_id: art.article_id, url: art.url || undefined, is_own });
    art.is_own = is_own;
    Message.success(is_own ? '已标记为自有文章' : '已取消自有标记');
    // 刷新父行 own 计数
    const parent = list.value.find((s: any) => s.canonical_source === sourceName);
    if (parent) {
      parent.own_article_count = Math.max(0, (parent.own_article_count || 0) + (is_own ? 1 : -1));
    }
  } catch (e: any) {
    Message.error(e?.message || '标记失败');
  }
}

async function openAnalyze(s: any) {
  analyzeName.value = s.canonical_source;
  analyzeOpen.value = true;
  analyzeTab.value = 'info';
  analyzeLoading.value = true;
  analyzing.value = s.canonical_source;
  analyzeData.value = null;
  mediaList.value = [];
  mediaTotal.value = 0;
  try {
    const resp: any = await monitorApi.sourceAnalyze({
      start: rangeStart.value,
      end: rangeEnd.value,
      canonical_source: s.canonical_source,
      category: type.value,
    });
    analyzeData.value = resp;
    mediaTotal.value = resp?.source?.basic_info?.available_media_count || 0;
  } catch (e: any) {
    Message.error(e?.message || '分析加载失败');
    analyzeOpen.value = false;
  } finally {
    analyzeLoading.value = false;
    analyzing.value = null;
  }
}

function closeAnalyze() {
  analyzeOpen.value = false;
}

async function switchMediaTab() {
  analyzeTab.value = 'media';
  if (mediaList.value.length || !analyzeName.value) return;
  mediaLoading.value = true;
  try {
    const resp: any = await monitorApi.sourceMediaAccounts(analyzeName.value, 1, 50);
    mediaList.value = resp?.list || [];
    mediaTotal.value = resp?.total || mediaList.value.length;
  } catch {
    mediaList.value = analyzeData.value?.source?.media_accounts || [];
  } finally {
    mediaLoading.value = false;
  }
}

async function onExport() {
  exporting.value = true;
  try {
    const qid = Number(queryId.value);
    const { blob, filename } = await monitorApi.exportReferenceSourceBlob({
      start_date: rangeStart.value,
      end_date: rangeEnd.value,
      category: type.value,
      ...(qid > 0 ? { query_id: qid } : {}),
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Message.success('导出成功');
  } catch (e: any) {
    Message.error(e?.message || '导出失败');
  } finally {
    exporting.value = false;
  }
}

async function onExcelPicked(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0];
  if (!file) return;
  excelName.value = file.name;
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const mapped = rows.map(r => {
      const url = String(r.URL || r.url || r.链接 || r.link || r.Link || '').trim();
      const title = String(r.标题 || r.title || r.Title || '').trim();
      const typeRaw = String(r.类型 || r.type || r.Type || 'graphic').trim().toLowerCase();
      const type = typeRaw.includes('视频') || typeRaw === 'video' ? 'video' : 'graphic';
      return { type, title, url };
    }).filter(r => r.url);
    if (!mapped.length) {
      Message.warning('未解析到有效链接列');
      return;
    }
    importRows.value = mapped;
    Message.success(`已载入 ${mapped.length} 条`);
  } catch {
    Message.error('Excel 解析失败');
  }
}

function onImportPaste(ev: ClipboardEvent) {
  const text = ev.clipboardData?.getData('text') || '';
  if (!text.includes('\n') && !text.includes('\t')) return;
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2 && !lines.some(l => l.includes('\t'))) return;
  ev.preventDefault();
  const mapped = lines.map(line => {
    const parts = line.split(/\t+/);
    if (parts.length >= 2) {
      return { type: 'graphic', title: parts[0].trim(), url: parts[parts.length - 1].trim() };
    }
    return { type: 'graphic', title: '', url: line };
  }).filter(r => r.url);
  if (!mapped.length) return;
  importRows.value = mapped;
}

function downloadImportTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    [ '类型', '标题', 'URL' ],
    [ '图文', '示例文章标题', 'https://example.com/article' ],
    [ '视频', '示例视频标题', 'https://example.com/video' ],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '导入模板');
  XLSX.writeFile(wb, '自有文章导入模板.xlsx');
}

function closeImport() {
  if (importing.value) return;
  importOpen.value = false;
  excelName.value = '';
  importRows.value = [{ type: 'graphic', title: '', url: '' }];
  if (excelInput.value) excelInput.value.value = '';
}

async function submitImport() {
  const items = importRows.value
    .map(r => ({ title: r.title.trim(), url: r.url.trim(), type: r.type }))
    .filter(r => r.url);
  if (!items.length) {
    Message.warning('请至少填写一条链接');
    return;
  }
  importing.value = true;
  try {
    const resp: any = await monitorApi.importOwnArticles(items);
    Message.success(`已导入 ${resp?.count || items.length} 篇自有文章`);
    closeImport();
    await reload();
  } catch (e: any) {
    Message.error(e?.message || '导入失败');
  } finally {
    importing.value = false;
  }
}

watch(engineOpen, (open, prev) => {
  if (prev && !open) reload();
});

watch(type, async () => {
  queryId.value = 0;
  queryLabel.value = '全部问题';
  await loadQueries();
  await reload();
});

async function loadQueries() {
  try {
    const qs: any = await monitorApi.queryList(type.value);
    const arr = qs?.list || qs || [];
    queryOptions.value = (Array.isArray(arr) ? arr : []).map((q: any) => {
      const id = q.id ?? q.query_id;
      return {
        value: id,
        label: q.query || q.name || String(id),
      };
    }).filter((o: { value: any }) => o.value != null && o.value !== '');
  } catch {
    queryOptions.value = [];
  }
}

onMounted(async () => {
  document.addEventListener('click', onDocClick);
  const { start, end } = lastNDays(7);
  rangeStart.value = start;
  rangeEnd.value = end;
  await loadQueries();
  await reload();
});

onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
});
</script>
