<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="引用源追溯" description="追踪 AI 回答中高频引用的信息来源与权重归因">
      <template #actions>
        <Button size="sm" variant="outline" :disabled="exporting" @click="onExport">
          <Download class="h-3.5 w-3.5" />
          {{ exporting ? '导出中...' : '导出数据' }}
        </Button>
        <Button size="sm" @click="importOpen = true">
          <Upload class="h-3.5 w-3.5" />
          导入自有文章
        </Button>
      </template>
    </PageHeader>

    <Card class="overflow-visible">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">问题</span>
          <DashQuerySelect
            v-model="queryId"
            v-model:label="queryLabel"
            :options="queryOptions"
            @change="reload"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">AI 引擎</span>
          <DashEngineMulti v-model="engines" :options="engineMultiOptions" @change="reload" />
        </div>
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">日期</span>
          <DashDateRange v-model:start="rangeStart" v-model:end="rangeEnd" @change="reload" />
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-muted-foreground">
            当前展示：
            <span class="mx-1 font-medium text-foreground">{{ queryLabel || '全部问题' }}</span>
            <span class="mx-1">·</span>
            <span class="mx-1 font-medium text-foreground">{{ engineSummary }}</span>
          </span>
          <Badge class="border-transparent bg-muted text-muted-foreground">{{ loadedCount }} 个来源</Badge>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-0.5 rounded-lg border bg-muted p-0.5">
            <button
              type="button"
              :class="[
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                filter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              ]"
              @click="filter = 'all'"
            >全部</button>
            <button
              type="button"
              :class="[
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                filter === 'own' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              ]"
              @click="filter = 'own'"
            >自有文章</button>
          </div>
          <div class="relative">
            <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="keyword"
              placeholder="搜索来源名称..."
              class="h-8 w-56 pl-8 pr-8 text-xs"
              @keydown.enter="applySearch"
            />
            <button
              type="button"
              title="搜索信源平台"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-primary"
              @click="applySearch"
            >
              <Plus class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div class="min-h-[400px] overflow-x-auto">
        <table class="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th
                class="w-1/3 cursor-pointer select-none px-5 py-3 font-medium hover:text-foreground"
                @click="toggleSort('name')"
              >
                <div class="flex items-center gap-1">
                  <span>信源平台 (Platform)</span>
                  <ChevronsUpDown class="h-3 w-3" />
                </div>
              </th>
              <th
                class="cursor-pointer select-none px-4 py-3 text-center font-medium hover:text-foreground"
                @click="toggleSort('ref')"
              >
                <div class="flex items-center justify-center gap-1">
                  总引用次
                  <ChevronsUpDown class="h-3 w-3" />
                </div>
              </th>
              <th class="px-4 py-3 text-center font-medium">
                <div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span>豆包媒体权威度</span>
                  <span class="group/authority-tip relative inline-flex">
                    <button
                      type="button"
                      class="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <CircleHelp class="h-3 w-3" />
                    </button>
                    <span class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-background shadow-md group-hover/authority-tip:block">
                      此评价来源于豆包接口。
                    </span>
                  </span>
                </div>
              </th>
              <th class="px-4 py-3 text-center font-medium">覆盖模型</th>
              <th class="px-4 py-3 text-center font-medium">发稿通道</th>
              <th class="px-4 py-3 text-center font-medium">分析</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="s in filteredList" :key="s.canonical_source">
              <tr
                class="cursor-pointer border-b transition-colors last:border-0"
                :class="expanded === s.canonical_source ? 'bg-primary/[0.06]' : 'hover:bg-muted/45'"
                @click="toggleExpand(s)"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="text-muted-foreground">
                      <ChevronUp v-if="expanded === s.canonical_source" class="h-4 w-4" />
                      <ChevronDown v-else class="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <div class="text-sm font-semibold">{{ s.canonical_source }}</div>
                        <Badge class="border-transparent bg-muted text-[10px] text-muted-foreground">
                          {{ s.article_count }} 篇文章
                        </Badge>
                      </div>
                      <div class="mt-0.5 text-xs text-muted-foreground">{{ s.category || '未分类' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="flex flex-col items-center gap-1.5">
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-base font-bold tabular-nums">{{ s.ref_count }}</span>
                      <span class="text-[11px] font-medium text-muted-foreground">{{ share(s.ref_count) }}</span>
                    </div>
                    <div class="h-1 w-16 overflow-hidden rounded-full bg-muted">
                      <div class="h-full rounded-full bg-primary" :style="{ width: shareBar(s.ref_count) }" />
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-center">
                  <span
                    v-if="authLabel(s)"
                    class="inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    :class="authBadgeClass(s)"
                  >{{ authLabel(s) }}</span>
                  <span v-else class="text-xs text-muted-foreground/50">--</span>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="flex flex-wrap items-center justify-center gap-1.5">
                    <span
                      v-for="p in platformTags(s)"
                      :key="p.key"
                      class="rounded px-2 py-1 text-[10px] font-medium text-white"
                      :style="{ backgroundColor: p.color }"
                    >{{ p.name }}<span class="ml-1 opacity-80">{{ p.count }}</span></span>
                    <span v-if="!platformTags(s).length" class="text-xs text-muted-foreground/50">--</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="flex flex-col items-center gap-0.5">
                    <span
                      v-if="s.sell_price != null"
                      class="inline-flex items-center gap-0.5 whitespace-nowrap text-[11px] font-semibold text-primary"
                    >{{ s.sell_price }} 积分起</span>
                    <span v-else class="text-[11px] text-muted-foreground/50">未开通</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-center" @click.stop>
                  <Button
                    size="sm"
                    variant="outline"
                    class="h-7 px-2.5 text-[11px]"
                    :disabled="analyzing === s.canonical_source"
                    @click="openAnalyze(s)"
                  >
                    <Activity class="h-3 w-3" />
                    {{ analyzing === s.canonical_source ? '分析中' : '分析' }}
                  </Button>
                </td>
              </tr>

              <tr v-if="expanded === s.canonical_source && expandLoading[s.canonical_source]">
                <td colspan="6" class="px-5 py-4 pl-20 text-xs text-muted-foreground">加载文章中…</td>
              </tr>
              <tr
                v-for="art in (articlesMap[s.canonical_source] || [])"
                v-show="expanded === s.canonical_source"
                :key="art.article_id"
                class="border-b bg-muted/20 transition-colors hover:bg-muted/40 last:border-0"
              >
                <td class="relative px-5 py-3 pl-20">
                  <div class="absolute left-14 top-1/2 h-4 w-4 -translate-y-1/2 rounded-bl-lg border-b-2 border-l-2 border-border" />
                  <div class="flex items-center gap-2">
                    <a
                      v-if="art.url"
                      :href="art.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="max-w-[300px] truncate text-xs font-medium text-foreground hover:text-primary hover:underline"
                      :title="art.title"
                      @click.stop
                    >{{ art.title }}</a>
                    <span
                      v-else
                      class="max-w-[300px] truncate text-xs font-medium"
                      :title="art.title"
                    >{{ art.title }}</span>
                    <button
                      v-if="!art.is_own"
                      type="button"
                      class="shrink-0 cursor-pointer whitespace-nowrap rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      title="点击标记为自有文章"
                      @click.stop="tagOwn(art, s.canonical_source)"
                    >标记自有</button>
                    <button
                      v-else
                      type="button"
                      class="shrink-0 cursor-pointer whitespace-nowrap rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary transition-colors"
                      title="取消自有标记"
                      @click.stop="tagOwn(art, s.canonical_source, false)"
                    >自有</button>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs font-medium text-muted-foreground">{{ art.ref_count }}</span>
                </td>
                <td class="px-4 py-3 text-center"><span class="text-xs text-muted-foreground/50">--</span></td>
                <td class="px-4 py-3 text-center">
                  <div class="flex flex-wrap items-center justify-center gap-2">
                    <span
                      v-for="p in articlePlatformTags(art)"
                      :key="p.key"
                      class="rounded px-2 py-1 text-[10px] font-medium text-white"
                      :style="{ backgroundColor: p.color }"
                    >{{ p.name }}</span>
                    <span v-if="!articlePlatformTags(art).length" class="text-xs text-muted-foreground/50">--</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center"><span class="text-xs text-muted-foreground/50">--</span></td>
                <td class="px-4 py-3 text-center"><span class="text-xs text-muted-foreground/50">--</span></td>
              </tr>
              <tr
                v-if="expanded === s.canonical_source && !expandLoading[s.canonical_source] && !(articlesMap[s.canonical_source] || []).length"
              >
                <td colspan="6" class="px-5 py-4 pl-20 text-xs text-muted-foreground">该信源下暂无文章明细</td>
              </tr>
            </template>
            <tr v-if="!filteredList.length">
              <td colspan="6" class="px-5 py-12 text-center text-sm text-muted-foreground">
                {{ loading ? '加载中…' : '暂无信源引用数据（采集或解析尚未产出）' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="hasMore" class="flex justify-center border-t bg-muted/20 p-4">
        <Button variant="ghost" size="sm" class="text-primary" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? '加载中…' : '查看更多关联引用数据' }}
          <ChevronDown v-if="!loadingMore" class="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>

    <!-- 分析抽屉 -->
    <div
      v-if="analyzeOpen"
      class="fixed inset-0 z-[9998] bg-foreground/35 backdrop-blur-[2px]"
      @click="closeAnalyze"
    />
    <aside
      v-if="analyzeOpen"
      class="fixed inset-y-0 right-0 z-[9999] flex w-[min(840px,96vw)] flex-col border-l bg-background shadow-lg"
    >
      <div class="shrink-0 border-b bg-muted/30 px-5 pb-4 pt-5 sm:px-7">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="truncate text-lg font-semibold">{{ analyzeName }}</h3>
          </div>
          <Button variant="outline" size="icon" class="h-8 w-8 shrink-0" aria-label="关闭信源分析" @click="closeAnalyze">
            <X class="h-4 w-4" />
          </Button>
        </div>
        <div class="mt-4 inline-flex rounded-lg border bg-muted p-1">
          <button
            type="button"
            class="rounded-md px-5 py-2 text-[13px] font-medium transition-all"
            :class="analyzeTab === 'info' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            @click="analyzeTab = 'info'"
          >信源信息</button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-md px-5 py-2 text-[13px] font-medium transition-all"
            :class="analyzeTab === 'media' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            @click="switchMediaTab"
          >
            媒体号
            <span
              class="rounded-full px-2 py-0.5 text-[10px]"
              :class="analyzeTab === 'media' ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/15 text-muted-foreground'"
            >
              {{ mediaTotal || analyzeData?.source?.basic_info?.available_media_count || '—' }}
            </span>
          </button>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
        <div v-if="analyzeLoading" class="py-16 text-center text-sm text-muted-foreground">正在加载该信源的分析数据...</div>
        <template v-else-if="analyzeTab === 'info' && analyzeData?.source">
          <section class="mb-6">
            <h4 class="mb-2.5 text-xs font-medium text-muted-foreground">基本信息</h4>
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div class="rounded-lg border bg-muted/30 px-3.5 py-3">
                <span class="block text-[10px] text-muted-foreground">媒体类型</span>
                <b class="mt-1 block truncate text-base font-semibold">{{ analyzeData.source.basic_info.media_type || '—' }}</b>
              </div>
              <div class="rounded-lg border bg-muted/30 px-3.5 py-3">
                <span class="block text-[10px] text-muted-foreground">可投媒体号</span>
                <b class="mt-1 block truncate text-base font-semibold">
                  {{ Number(analyzeData.source.basic_info.available_media_count || 0).toLocaleString() }} 家
                </b>
              </div>
            </div>
          </section>
          <section class="mb-6">
            <h4 class="mb-2.5 text-xs font-medium text-muted-foreground">信源简介</h4>
            <div class="rounded-lg border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
              {{ analyzeData.source.description }}
            </div>
          </section>
          <section class="mb-6">
            <h4 class="mb-2.5 text-xs font-medium text-muted-foreground">发稿收录情况</h4>
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div class="rounded-lg border bg-muted/30 px-3.5 py-3">
                <span class="block text-[10px] text-muted-foreground">出稿时效性</span>
                <b class="mt-1 block truncate text-base font-semibold">—</b>
              </div>
              <div class="rounded-lg border bg-muted/30 px-3.5 py-3">
                <span class="block text-[10px] text-muted-foreground">平均出稿率</span>
                <b class="mt-1 block truncate text-base font-semibold">
                  {{ analyzeData.source.publish_stats.average_success_rate != null ? `${analyzeData.source.publish_stats.average_success_rate}%` : '—' }}
                </b>
              </div>
            </div>
          </section>
          <section class="mb-6">
            <h4 class="mb-1 text-xs font-medium text-muted-foreground">
              按 AI 引擎
              <span class="ml-2 text-[11px] font-normal">
                共 {{ analyzeData.source.citation_performance.total_ref_count }} 次被引 · 覆盖 {{ analyzeData.source.citation_performance.engine_count }} 个引擎
              </span>
            </h4>
            <div>
              <div
                v-for="e in analyzeData.source.citation_performance.engine_breakdown"
                :key="e.platform"
                class="flex items-center gap-3 border-b px-0.5 py-3 last:border-0"
              >
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  :style="{ background: PLATFORM_META[e.platform]?.color || '#6b7280' }"
                />
                <span class="flex-1 text-sm">{{ e.display_name }}</span>
                <b class="text-base font-semibold tabular-nums">
                  {{ e.ref_count }}<em class="ml-1 text-[10px] font-medium not-italic text-muted-foreground">次</em>
                </b>
              </div>
            </div>
          </section>
          <section class="mb-6">
            <h4 class="mb-1 text-xs font-medium text-muted-foreground">
              监控问题覆盖
              <span class="ml-2 text-[11px] font-normal">
                覆盖 {{ analyzeData.source.citation_performance.query_count }} 个监控问题
              </span>
            </h4>
            <div>
              <div
                v-for="q in analyzeData.source.citation_performance.query_breakdown"
                :key="q.query_id"
                class="flex items-center gap-4 border-b px-0.5 py-3 last:border-0"
              >
                <span class="min-w-0 flex-1 truncate text-[13px] text-muted-foreground" :title="q.question">{{ q.question }}</span>
                <b class="shrink-0 text-base font-semibold tabular-nums">
                  {{ q.ref_count }}<em class="ml-1 text-[10px] font-medium not-italic text-muted-foreground">次</em>
                </b>
              </div>
              <div v-if="!analyzeData.source.citation_performance.query_breakdown.length" class="py-4 text-xs text-muted-foreground">
                暂无问题覆盖
              </div>
            </div>
          </section>
          <p class="mt-6 border-t pt-3 text-[10px] text-muted-foreground">信息来自信源库档案与当前筛选范围内的监控快照</p>
        </template>
        <template v-else-if="analyzeTab === 'media'">
          <div v-if="mediaLoading" class="py-16 text-center text-sm text-muted-foreground">加载媒体号…</div>
          <div v-else class="space-y-3">
            <div
              v-for="m in mediaList"
              :key="m.media_key"
              class="rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/40"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold">{{ m.name }}</div>
                  <div class="mt-1 text-[11px] text-muted-foreground">{{ m.taxonomy || m.category || '' }} · {{ m.area || '全国' }}</div>
                  <div v-if="m.note" class="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{{ m.note }}</div>
                </div>
                <div class="shrink-0 text-right">
                  <div class="text-sm font-semibold text-primary">{{ m.sell_price != null ? `${m.sell_price} 积分` : '—' }}</div>
                  <div v-if="m.list_price != null" class="text-[10px] text-muted-foreground line-through">{{ m.list_price }}</div>
                </div>
              </div>
            </div>
            <div v-if="!mediaList.length" class="py-12 text-center text-sm text-muted-foreground">暂无可投媒体号</div>
          </div>
        </template>
      </div>
    </aside>

    <!-- 导入自有文章 -->
    <div
      v-if="importOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
      @click.self="closeImport"
    >
      <Card class="w-full max-w-xl overflow-hidden shadow-lg">
        <CardContent class="p-6">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold">导入自有文章</h3>
              <p class="mt-1 text-xs text-muted-foreground">登记后系统持续监控它在 AI 回答中的被引情况，并计入深度分析</p>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8" :disabled="importing" @click="closeImport">
              <X class="h-4 w-4" />
            </Button>
          </div>

          <div class="mb-1.5 flex items-center justify-between">
            <label class="block text-sm font-medium">文章标题与链接</label>
            <span class="text-xs text-muted-foreground">支持粘贴多行（标题 Tab 链接，或每行一条链接）</span>
          </div>
          <div class="overflow-hidden rounded-lg border">
            <div class="grid grid-cols-[90px_1fr_1.4fr_36px] gap-2 bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
              <div>类型</div><div>标题</div><div>链接</div><div></div>
            </div>
            <div class="max-h-[240px] divide-y overflow-y-auto" @paste="onImportPaste">
              <div
                v-for="(row, idx) in importRows"
                :key="idx"
                class="grid grid-cols-[90px_1fr_1.4fr_36px] items-center gap-2 px-2 py-1.5"
              >
                <select
                  v-model="row.type"
                  class="w-full rounded-md border border-input bg-background px-1.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="graphic">图文</option>
                  <option value="video">视频</option>
                </select>
                <Input v-model="row.title" placeholder="文章标题" class="h-8 text-xs" />
                <Input v-model="row.url" placeholder="https://..." class="h-8 font-mono text-xs" />
                <button
                  type="button"
                  class="flex items-center justify-center p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30"
                  :disabled="importRows.length <= 1"
                  @click="importRows.splice(idx, 1)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            @click="importRows.push({ type: 'graphic', title: '', url: '' })"
          >
            <Plus class="h-3.5 w-3.5" />
            添加一行
          </button>

          <div class="mb-1.5 mt-4 flex items-center justify-between">
            <label class="block text-sm font-medium">或上传 Excel 批量导入</label>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              @click="downloadImportTemplate"
            >
              <Download class="h-3 w-3" />
              下载导入模板
            </button>
          </div>
          <label class="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5">
            <FileUp class="h-5 w-5 shrink-0 text-primary" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium">点击上传 Excel</div>
              <div class="truncate text-xs text-muted-foreground">含「URL/链接」列即可，「标题」列可选一并导入 · 支持 .xlsx / .xls</div>
            </div>
            <span class="shrink-0 text-xs font-medium text-muted-foreground">{{ excelName || '未选择' }}</span>
            <input ref="excelInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onExcelPicked" />
          </label>

          <div class="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info class="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>自有文章导入后计入「自有文章覆盖」与被引监控，可衡量 GEO 投放效果。</span>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <Button variant="ghost" :disabled="importing" @click="closeImport">取消</Button>
            <Button :disabled="importing" @click="submitImport">
              {{ importing ? '导入中...' : '导入并开始监控' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  Download, Upload, Search, Plus, ChevronsUpDown, CircleHelp, ChevronUp, ChevronDown,
  Activity, X, Trash2, FileUp, Info,
} from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import { Message } from '@/lib/toast';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Badge, Button, Card, CardContent, Input } from '@/components/ui';
import { monitorApi, type SourceAnalyzeResp, type SourceArticleItem, type SourceMediaAccount } from '@/api/modules/monitor';
import { lastNDays } from '@/utils/engines';
import DashQuerySelect from '@/components/DashQuerySelect.vue';
import DashDateRange from '@/components/DashDateRange.vue';
import DashEngineMulti from '@/components/DashEngineMulti.vue';

const route = useRoute();
const type = computed<'industry' | 'brand'>(() =>
  (route.query.type === 'brand' || route.query.from === 'sentiment' ? 'brand' : 'industry'),
);

const PLATFORM_META: Record<string, { name: string; color: string }> = {
  doubao: { name: '豆包', color: '#3b82f6' },
  deepseek: { name: 'DeepSeek', color: '#2563eb' },
  wenxin: { name: '文心一言', color: '#ec4899' },
  qwen: { name: '通义千问', color: '#f59e0b' },
  yuanbao: { name: '元宝', color: '#06b6d4' },
};

const ENGINE_OPTS = [
  { value: 'doubao', label: '豆包' },
  { value: 'wenxin', label: '文心一言' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'qwen', label: '通义千问' },
  { value: 'yuanbao', label: '元宝' },
];
const engineMultiOptions = ENGINE_OPTS;

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
  if (label.includes('不权威')) return 'bg-muted text-muted-foreground border-border';
  if (label.includes('正常权威')) return 'bg-primary/10 text-primary border-primary/20';
  if (label.includes('权威')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-muted text-muted-foreground border-border';
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
      const rowType = typeRaw.includes('视频') || typeRaw === 'video' ? 'video' : 'graphic';
      return { type: rowType, title, url };
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
    ['类型', '标题', 'URL'],
    ['图文', '示例文章标题', 'https://example.com/article'],
    ['视频', '示例视频标题', 'https://example.com/video'],
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
  const { start, end } = lastNDays(7);
  rangeStart.value = start;
  rangeEnd.value = end;
  await loadQueries();
  await reload();
});
</script>
