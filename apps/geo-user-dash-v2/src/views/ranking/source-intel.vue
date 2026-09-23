<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="引用源洞察" description="深度拆解 AI 平台的引用源偏好与你的内容被引效果，产出内容分发与优化策略">
      <template #actions>
        <div class="relative" ref="dateRoot">
          <Button variant="outline" size="sm" @click.stop="dateOpen = !dateOpen">
            <CalendarRange class="h-3.5 w-3.5" />
            <span>{{ rangeStart }} ~ {{ rangeEnd }}</span>
            <span class="mx-0.5 text-muted-foreground">vs</span>
            <span class="text-muted-foreground">{{ cmpStart }} ~ {{ cmpEnd }}</span>
          </Button>
          <div
            v-if="dateOpen"
            class="absolute right-0 top-full z-50 mt-2 w-[420px] rounded-lg border bg-popover p-4 shadow-md"
            @click.stop
          >
            <div class="space-y-3">
              <div>
                <div class="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">本期</div>
                <DashDateRange v-model:start="rangeStart" v-model:end="rangeEnd" @change="onPeriodChange" />
              </div>
              <div>
                <div class="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">对比期（自动对齐等长）</div>
                <div class="rounded-lg border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground">
                  {{ cmpStart }} → {{ cmpEnd }}
                </div>
              </div>
              <div class="flex justify-end gap-2 border-t pt-3">
                <Button size="sm" variant="ghost" @click="dateOpen = false">关闭</Button>
                <Button size="sm" @click="applyDates">应用</Button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </PageHeader>

    <!-- Top10 信源每日波动趋势 -->
    <Card class="overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">Top10 信源每日波动趋势</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground select-none">AI 引擎</span>
          <DashSelect v-model="trendEngine" :options="engineOptions" min-width="120px" @change="reloadTrend" />
        </div>
      </div>
      <CardContent class="p-5">
        <div class="relative" style="height: 280px;" @mouseleave="trendHover = null">
          <svg v-if="trendDates.length && visibleTrendSources.length" :viewBox="`0 0 ${TW} ${TH}`" class="h-full w-full" preserveAspectRatio="none">
            <line v-for="(t, i) in trendYTicks" :key="'yg'+i" :x1="TML" :x2="TW - TMR" :y1="trendY(t)" :y2="trendY(t)" stroke="hsl(214 20% 90%)" stroke-width="1" />
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
              stroke="hsl(215 16% 58%)"
              stroke-dasharray="4 4"
              stroke-width="1"
            />
            <rect x="0" y="0" :width="TW" :height="TH" fill="transparent" class="cursor-crosshair" @mousemove="onTrendMove" />
          </svg>
          <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">暂无信源波动数据</div>
          <div
            v-if="trendHover"
            class="pointer-events-none absolute z-20 min-w-[140px] rounded-lg border bg-popover p-2.5 text-xs shadow-md"
            :style="{ left: trendHover.left + 'px', top: '8px' }"
          >
            <div class="mb-1.5 font-semibold">{{ fmtDate(trendDates[trendHover.idx]) }}</div>
            <div v-for="(s, si) in visibleTrendSources" :key="s.name" class="flex items-center justify-between gap-3 leading-5 text-muted-foreground">
              <span class="flex items-center gap-1.5 truncate">
                <span class="h-2 w-2 shrink-0 rounded-full" :style="{ background: palette[si % palette.length] }" />
                {{ s.name }}
              </span>
              <span class="font-semibold tabular-nums text-foreground">{{ (s.series || [])[trendHover.idx] ?? 0 }}</span>
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
            <span class="h-[3px] w-3 rounded-full" :style="{ background: palette[i % palette.length] }" />
            <span class="max-w-[140px] truncate text-foreground">{{ s.name }}</span>
            <span class="text-muted-foreground">{{ s.total }}</span>
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- AI 引擎信源偏好 -->
    <Card class="overflow-hidden">
      <div class="flex items-center gap-2.5 border-b px-5 py-4">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users class="h-4 w-4" />
        </div>
        <span class="text-sm font-semibold">AI 引擎信源偏好</span>
      </div>
      <div class="mx-5 mt-4 rounded-lg bg-primary/5 px-4 py-3">
        <p v-if="insight" class="text-[13px] leading-relaxed text-primary">
          <span class="font-semibold">{{ insight.source }}</span> 是当前被 AI 引擎引用最多的信源平台（共
          <span class="font-semibold">{{ insight.total }}</span> 次），其中
          <span class="font-semibold">{{ insight.platform }}</span> 对它的引用最为集中（{{ insight.count }} 次）。建议优先在该平台布局高质量内容。
        </p>
        <p v-else class="text-[13px] leading-relaxed text-primary/80">暂无引用数据，完成采集解析后即可生成信源偏好洞察。</p>
      </div>
      <div class="overflow-x-auto px-5 py-4">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="sticky left-0 z-20 w-10 bg-card px-2 py-2 text-left text-[11.5px] font-medium text-muted-foreground">#</th>
              <th class="sticky left-10 z-20 whitespace-nowrap bg-card px-2 py-2 text-left text-[11.5px] font-medium text-muted-foreground">信源平台</th>
              <th
                v-for="p in platforms"
                :key="p.key"
                class="cursor-pointer select-none whitespace-nowrap px-2 py-2 text-center text-[11.5px] font-medium transition-colors"
                :class="prefSort === p.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
                @click="setPrefSort(p.key)"
              >
                <span class="inline-flex items-center gap-0.5">{{ p.name }}
                  <ChevronsUpDown class="h-2.5 w-2.5" />
                </span>
              </th>
              <th
                class="min-w-[140px] cursor-pointer select-none whitespace-nowrap px-2 py-2 text-right text-[11.5px] font-medium transition-colors"
                :class="prefSort === 'total' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
                @click="setPrefSort('total')"
              >
                <span class="inline-flex items-center justify-end gap-0.5">总被引
                  <ChevronsUpDown class="h-2.5 w-2.5" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, i) in prefRows" :key="s.canonical_source" class="group border-b last:border-0 hover:bg-muted/45">
              <td class="sticky left-0 z-10 bg-card px-2 py-2.5 group-hover:bg-muted/45">
                <div
                  :class="[
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                    i === 0 ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                  ]"
                >{{ i + 1 }}</div>
              </td>
              <td class="sticky left-10 z-10 whitespace-nowrap bg-card px-2 py-2.5 group-hover:bg-muted/45">
                <div class="flex items-center gap-2">
                  <span class="text-[13px] font-semibold">{{ s.canonical_source }}</span>
                  <Badge v-if="i === 0" class="border-transparent bg-primary/10 text-[10px] text-primary">首选</Badge>
                </div>
              </td>
              <td v-for="p in platforms" :key="p.key" class="px-1 py-2.5 text-center">
                <div
                  class="inline-flex h-10 w-12 flex-col items-center justify-center rounded-md text-foreground"
                  :style="{ background: heatBg(engCur(s, p.key)) }"
                >
                  <span class="font-mono text-[12.5px] font-semibold">{{ engCur(s, p.key) }}</span>
                  <span
                    v-if="engChg(s, p.key)"
                    :class="['text-[9px] font-semibold', engChg(s, p.key)! > 0 ? 'text-emerald-600' : 'text-red-600']"
                  >{{ engChg(s, p.key)! > 0 ? '+' : '' }}{{ engChg(s, p.key) }}</span>
                </div>
              </td>
              <td class="px-2 py-2.5">
                <div class="flex items-center justify-end gap-2">
                  <div class="h-3 w-20 overflow-hidden rounded-full bg-muted">
                    <div class="h-full rounded-full bg-primary transition-all" :style="{ width: barW(s.cur_total || s.ref_count || 0) }" />
                  </div>
                  <span class="w-8 text-right text-[13px] font-semibold">{{ s.cur_total ?? s.ref_count }}</span>
                </div>
              </td>
            </tr>
            <tr v-if="!prefRows.length">
              <td :colspan="2 + platforms.length + 1" class="px-2 py-10 text-center text-sm text-muted-foreground">暂无信源偏好数据</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 pb-4 text-[11.5px] text-muted-foreground">颜色越深代表该引擎从该平台引用越多 | 右侧条形图为各引擎总引用次数</div>
    </Card>

    <!-- 自有内容收录趋势 -->
    <Card class="overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <LineChart class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">自有内容收录趋势</span>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground select-none">AI 引擎</span>
            <DashSelect v-model="ownEngine" :options="ownEngineOptions" min-width="120px" @change="reloadOwn" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground select-none">统计维度</span>
            <div class="flex rounded-lg bg-muted p-0.5">
              <button
                type="button"
                :class="['rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-all', dim === 'rate' ? 'bg-card text-emerald-700 shadow-sm' : 'text-muted-foreground hover:text-foreground']"
                @click="dim = 'rate'"
              >收录率</button>
              <button
                type="button"
                :class="['rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-all', dim === 'count' ? 'bg-card text-emerald-700 shadow-sm' : 'text-muted-foreground hover:text-foreground']"
                @click="dim = 'count'"
              >收录量</button>
            </div>
          </div>
        </div>
      </div>
      <CardContent class="grid grid-cols-1 items-center gap-6 p-5 md:grid-cols-[0.8fr_2.4fr]">
        <div class="flex flex-col gap-5">
          <div>
            <div class="mb-1 text-xs text-muted-foreground">本期自有被引</div>
            <div class="text-2xl font-bold">
              {{ ownSummary.cited ?? 0 }}<span class="text-sm font-medium text-muted-foreground"> 次</span>
              <span :class="['ml-2 text-xs font-semibold', (ownSummary.cited_chg || 0) >= 0 ? 'text-emerald-600' : 'text-red-500']">
                {{ (ownSummary.cited_chg || 0) >= 0 ? '↑' : '↓' }} {{ Math.abs(ownSummary.cited_chg || 0) }}{{ ownChgPct }}
              </span>
            </div>
          </div>
          <div>
            <div class="mb-1 text-xs text-muted-foreground">收录率（自有占比）</div>
            <div class="text-2xl font-bold">
              {{ ownSummary.rate_now ?? 0 }}<span class="text-sm font-medium text-muted-foreground"> %</span>
              <span :class="['ml-2 text-xs font-semibold', (ownSummary.rate_chg || 0) >= 0 ? 'text-emerald-600' : 'text-red-500']">
                {{ (ownSummary.rate_chg || 0) >= 0 ? '↑' : '↓' }} {{ Math.abs(ownSummary.rate_chg || 0) }}pp
              </span>
            </div>
          </div>
          <div>
            <div class="mb-1 text-xs text-muted-foreground">收录篇数</div>
            <div class="text-2xl font-bold">
              {{ ownSummary.own_articles ?? 0 }}<span class="text-sm font-medium text-muted-foreground"> 篇</span>
              <span :class="['ml-2 text-xs font-semibold', (ownSummary.own_articles_chg || 0) >= 0 ? 'text-emerald-600' : 'text-red-500']">
                {{ (ownSummary.own_articles_chg || 0) >= 0 ? '↑' : '↓' }} {{ Math.abs(ownSummary.own_articles_chg || 0) }}
              </span>
            </div>
          </div>
        </div>
        <div class="rounded-lg border bg-muted/20 p-4">
          <SparkLine
            v-if="ownPoints.length"
            :points="ownPoints"
            :labels="ownLabels"
            color="#059669"
            :height="180"
            :digits="dim === 'rate' ? 1 : 0"
            :unit="dim === 'rate' ? '%' : ''"
          />
          <div v-else class="flex h-[180px] items-center justify-center text-sm text-muted-foreground">暂无自有内容趋势</div>
          <div class="mt-2 text-center text-xs text-muted-foreground">
            最新{{ dim === 'rate' ? '收录率' : '收录量' }}
            <span class="font-semibold text-emerald-700">{{ ownLatest }}{{ dim === 'rate' ? '%' : '' }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 引用源透视 -->
    <Card>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Eye class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">引用源透视</span>
        </div>
        <Button size="sm" variant="outline" :disabled="exporting" @click="exportPerspective">
          <Download class="h-3.5 w-3.5" />
          {{ exporting ? '导出中…' : '导出 Excel' }}
        </Button>
      </div>
      <div class="relative z-30 flex flex-wrap items-center gap-4 px-5 pt-4">
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground select-none">问题</span>
          <DashSelect v-model="perspQueryId" :options="topicOptions" min-width="180px" @change="reloadPerspective(true)" />
        </div>
        <div class="ml-auto flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-sm">
          <Search class="h-3.5 w-3.5 text-muted-foreground" />
          <input
            v-model="perspSearch"
            placeholder="搜索名称..."
            class="w-36 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            @keydown.enter="reloadPerspective(true)"
          />
        </div>
      </div>
      <div class="relative z-0 flex flex-wrap items-center gap-4 px-5 pb-2 pt-3">
        <div class="flex rounded-lg bg-muted p-0.5">
          <button v-for="v in viewTabs" :key="v.key" type="button" :class="tabCls(perspView === v.key)" @click="setView(v.key)">{{ v.label }}</button>
        </div>
        <div class="flex rounded-lg bg-muted p-0.5">
          <button v-for="s in statusTabs" :key="s" type="button" :class="tabCls(perspStatus === s)" @click="setStatus(s)">{{ s }}</button>
        </div>
      </div>
      <div class="overflow-x-auto px-5 pb-2">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="sticky left-0 z-20 w-10 bg-card px-2 py-2.5 text-left text-[11.5px] font-medium text-muted-foreground">排名</th>
              <th class="sticky left-10 z-20 whitespace-nowrap bg-card px-2 py-2.5 text-left text-[11.5px] font-medium text-muted-foreground">名称</th>
              <th class="px-2 py-2.5 text-center text-[11.5px] font-medium text-muted-foreground">状态</th>
              <th v-for="p in platforms" :key="p.key" class="whitespace-nowrap px-2 py-2.5 text-center text-[11.5px] font-medium text-muted-foreground">{{ p.name }}</th>
              <th class="cursor-pointer px-2 py-2.5 text-center text-[11.5px] font-medium text-primary" @click="reloadPerspective(true)">合计</th>
              <th class="whitespace-nowrap px-2 py-2.5 text-center text-[11.5px] font-medium text-muted-foreground">较上期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, i) in perspectiveRows" :key="s.name + i" class="group border-b last:border-0 hover:bg-muted/45">
              <td class="sticky left-0 z-10 bg-card px-2 py-3 group-hover:bg-muted/45">
                <div
                  :class="[
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                    i === 0 ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                  ]"
                >{{ i + 1 }}</div>
              </td>
              <td class="sticky left-10 z-10 max-w-[220px] truncate whitespace-nowrap bg-card px-2 py-3 text-[13px] font-semibold group-hover:bg-muted/45">
                <span :title="s.name">{{ s.name }}</span>
              </td>
              <td class="px-2 py-3 text-center">
                <span class="inline-flex items-center gap-1">
                  <span :class="['h-1.5 w-1.5 rounded-full', statusDot(s.status)]" />
                  <span :class="['text-[11px] font-medium', statusText(s.status)]">{{ s.status }}</span>
                </span>
              </td>
              <td v-for="p in platforms" :key="p.key" class="px-2 py-3 text-center font-mono text-[12.5px] text-muted-foreground">{{ engCur(s, p.key) }}</td>
              <td class="px-2 py-3 text-center text-[13px] font-bold">{{ s.cur_total ?? s.ref_count }}</td>
              <td class="px-2 py-3 text-center">
                <span v-if="s.change" :class="['text-[11.5px] font-semibold', s.change > 0 ? 'text-emerald-600' : 'text-red-500']">
                  {{ s.change > 0 ? '▲' : '▼' }} {{ s.change > 0 ? '+' : '' }}{{ s.change }}
                </span>
                <span v-else class="text-[11.5px] font-semibold text-muted-foreground/40">—</span>
              </td>
            </tr>
            <tr v-if="!perspectiveRows.length">
              <td :colspan="4 + platforms.length" class="px-2 py-10 text-center text-sm text-muted-foreground">暂无引用源透视数据</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="perspTotal > perspectiveRows.length" class="flex justify-center px-5 py-4">
        <Button size="sm" variant="outline" :disabled="perspLoading" @click="loadMorePerspective">
          {{ perspLoading ? '加载中…' : '加载更多' }}
        </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  CalendarRange,
  ChevronsUpDown,
  Download,
  Eye,
  LineChart,
  Search,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import { Message } from '@/lib/toast'
import { monitorApi } from '@/api/modules/monitor'
import SparkLine from '@/components/SparkLine.vue'
import DashDateRange from '@/components/DashDateRange.vue'
import DashSelect from '@/components/DashSelect.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { lastNDays, fmtDate } from '@/utils/engines'
import { downloadAoaSheets } from '@/utils/xlsxExport'

/** 对标表头顺序：豆包 / DeepSeek / 文心一言 / 通义千问 / 元宝 */
const platforms = [
  { key: 'doubao', name: '豆包' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'wenxin', name: '文心一言' },
  { key: 'qwen', name: '通义千问' },
  { key: 'yuanbao', name: '元宝' },
]

const palette = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#06b6d4', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#ec4899']

const engineOptions = [
  { value: 'all', label: '全部' },
  ...platforms.map(p => ({ value: p.key, label: p.name })),
]
const ownEngineOptions = [
  { value: 'all', label: '综合' },
  ...platforms.map(p => ({ value: p.key, label: p.name })),
]

const viewTabs = [
  { key: 'source' as const, label: '信源平台' },
  { key: 'article' as const, label: '引用文章' },
  { key: 'own' as const, label: '自有文章' },
]
const statusTabs = ['全部', '本期新增', '持续被引', '本期流失']

const route = useRoute()
/** industry=排名 / brand=口碑；支持 ?category= / ?type= / ?from=sentiment */
const category = computed<'industry' | 'brand'>(() => {
  if (route.query.category === 'brand' || route.query.type === 'brand' || route.query.from === 'sentiment') return 'brand'
  return 'industry'
})

const init = lastNDays(7)
const rangeStart = ref(init.start)
const rangeEnd = ref(init.end)
const cmpStart = ref('')
const cmpEnd = ref('')
const dateOpen = ref(false)
const dateRoot = ref<HTMLElement | null>(null)

const trendEngine = ref<string | number>('all')
const ownEngine = ref<string | number>('all')
const dim = ref<'rate' | 'count'>('rate')
const prefSort = ref('total')
const prefSortAsc = ref(false)

const topSources = ref<any[]>([])
const trendDates = ref<string[]>([])
const hiddenTrend = ref(new Set<string>())
const trendHover = ref<null | { idx: number; left: number }>(null)

const prefSources = ref<any[]>([])
const ownTrend = ref<any[]>([])
const ownSummary = ref<any>({})
const perspectiveRows = ref<any[]>([])
const perspTotal = ref(0)
const perspPage = ref(1)
const perspLoading = ref(false)
const perspView = ref<'source' | 'article' | 'own'>('source')
const perspStatus = ref('全部')
const perspSearch = ref('')
const perspQueryId = ref<string | number>(0)
const topicOptions = ref([{ value: 0, label: '全部' }])
const exporting = ref(false)

const TW = 720
const TH = 280
const TML = 36
const TMR = 12
const TMT = 10
const TMB = 28

function syncCmp() {
  const s = new Date(rangeStart.value)
  const e = new Date(rangeEnd.value)
  const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1)
  const ce = new Date(s); ce.setDate(ce.getDate() - 1)
  const cs = new Date(ce); cs.setDate(cs.getDate() - (days - 1))
  const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  cmpStart.value = f(cs)
  cmpEnd.value = f(ce)
}

function onPeriodChange() {
  syncCmp()
}

async function applyDates() {
  dateOpen.value = false
  syncCmp()
  await reloadAll()
}

const visibleTrendSources = computed(() => topSources.value.filter(s => !hiddenTrend.value.has(s.name)))
const trendXLabels = computed(() => {
  const lbs = trendDates.value.map(d => fmtDate(d))
  if (lbs.length === 1) return [lbs[0], lbs[0]]
  return lbs
})
function trendXLabelPos(i: number) {
  const n = trendXLabels.value.length
  if (n <= 1) return TML + (TW - TML - TMR) / 2
  return TML + (i / (n - 1)) * (TW - TML - TMR)
}
const trendMax = computed(() => {
  let m = 1
  for (const s of visibleTrendSources.value) {
    for (const v of s.series || []) m = Math.max(m, Number(v) || 0)
  }
  return m
})
const trendYTicks = computed(() => {
  const max = trendMax.value
  const step = max <= 10 ? 2 : max <= 40 ? 10 : max <= 100 ? 20 : Math.ceil(max / 4 / 10) * 10
  const ticks: number[] = []
  for (let v = 0; v <= max + 0.01; v += step) ticks.push(v)
  return ticks.slice(0, 6)
})

function trendX(i: number) {
  const n = Math.max(1, trendDates.value.length)
  if (n <= 1) return TML + (TW - TML - TMR) / 2
  return TML + (i / (n - 1)) * (TW - TML - TMR)
}
function trendY(v: number) {
  const max = trendYTicks.value[trendYTicks.value.length - 1] || trendMax.value || 1
  const plotH = TH - TMT - TMB
  return TMT + plotH - (v / max) * plotH
}
function trendPath(s: any) {
  let series = [...(s.series || [])]
  if (series.length === 1) series = [series[0], series[0]]
  const n = Math.max(series.length, trendDates.value.length === 1 ? 2 : trendDates.value.length)
  return series.map((v: number, i: number) => {
    const x = n <= 1 ? trendX(0) : TML + (i / (n - 1)) * (TW - TML - TMR)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${trendY(Number(v) || 0).toFixed(1)}`
  }).join(' ')
}
function onTrendMove(ev: MouseEvent) {
  const svg = ev.currentTarget as SVGRectElement
  const root = svg.ownerSVGElement?.parentElement
  if (!root || !trendDates.value.length) return
  const rect = root.getBoundingClientRect()
  const rel = ((ev.clientX - rect.left) / rect.width) * TW
  const n = trendDates.value.length
  let idx = 0
  if (n > 1) {
    const t = (rel - TML) / (TW - TML - TMR)
    idx = Math.round(Math.max(0, Math.min(1, t)) * (n - 1))
  }
  trendHover.value = {
    idx,
    left: Math.min(Math.max(8, ev.clientX - rect.left + 10), rect.width - 160),
  }
}
function toggleTrend(name: string) {
  const next = new Set(hiddenTrend.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  if (next.size >= topSources.value.length) return
  hiddenTrend.value = next
}

const prefMax = computed(() => Math.max(1, ...prefSources.value.map((s: any) => s.cur_total || 0)))
const prefRows = computed(() => {
  const rows = [...prefSources.value]
  const key = prefSort.value
  rows.sort((a, b) => {
    const av = key === 'total' ? (a.cur_total || 0) : engCur(a, key)
    const bv = key === 'total' ? (b.cur_total || 0) : engCur(b, key)
    return prefSortAsc.value ? av - bv : bv - av
  })
  return rows.slice(0, 15)
})
function setPrefSort(key: string) {
  if (prefSort.value === key) prefSortAsc.value = !prefSortAsc.value
  else { prefSort.value = key; prefSortAsc.value = false }
}
function engCur(s: any, key: string) {
  const e = s.engines?.[key]
  if (e && typeof e === 'object') return Number(e.cur) || 0
  return Number(e) || 0
}
function engChg(s: any, key: string) {
  const e = s.engines?.[key]
  if (e && typeof e === 'object' && e.chg) return Number(e.chg) || 0
  return 0
}
function heatBg(v: number) {
  const max = Math.max(1, ...prefRows.value.flatMap((s: any) => platforms.map(p => engCur(s, p.key))))
  const a = 0.08 + 0.6 * Math.min(1, v / max)
  return `hsla(221.2, 83.2%, 53.3%, ${a.toFixed(3)})`
}
function barW(v: number) {
  return `${Math.max(0, Math.min(100, (v / prefMax.value) * 100))}%`
}

const insight = computed(() => {
  const top = prefRows.value[0]
  if (!top) return null
  let bestKey = platforms[0].key
  let best = -1
  for (const p of platforms) {
    const c = engCur(top, p.key)
    if (c > best) { best = c; bestKey = p.key }
  }
  return {
    source: top.canonical_source,
    total: top.cur_total || 0,
    platform: platforms.find(p => p.key === bestKey)?.name || bestKey,
    count: best,
  }
})

const ownPoints = computed(() => {
  if (dim.value === 'rate') return ownTrend.value.map((t: any) => Number(t.rate) || 0)
  return ownTrend.value.map((t: any) => Number(t.own_count) || 0)
})
const ownLabels = computed(() => ownTrend.value.map((t: any) => fmtDate(t.date)))
const ownLatest = computed(() => {
  if (!ownPoints.value.length) return 0
  return ownPoints.value[ownPoints.value.length - 1]
})
const ownChgPct = computed(() => {
  const cur = Number(ownSummary.value.cited) || 0
  const chg = Number(ownSummary.value.cited_chg) || 0
  const prev = cur - chg
  if (!prev) return ''
  const pct = Math.round((chg / Math.abs(prev)) * 100)
  return ` ${Math.abs(pct)}%`
})

function tabCls(active: boolean) {
  return [
    'rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-all',
    active ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
  ]
}
function statusDot(s: string) {
  if (s === '本期新增') return 'bg-emerald-500'
  if (s === '本期流失') return 'bg-amber-500'
  return 'bg-primary'
}
function statusText(s: string) {
  if (s === '本期新增') return 'text-emerald-600'
  if (s === '本期流失') return 'text-amber-600'
  return 'text-primary'
}
function setView(v: 'source' | 'article' | 'own') {
  perspView.value = v
  reloadPerspective(true)
}
function setStatus(s: string) {
  perspStatus.value = s
  reloadPerspective(true)
}

async function reloadTrend() {
  try {
    const plat = trendEngine.value === 'all' ? null : String(trendEngine.value)
    const resp: any = await monitorApi.siSourceTrend(rangeStart.value, rangeEnd.value, plat, category.value)
    trendDates.value = resp?.dates || []
    topSources.value = (resp?.sources || []).map((s: any) => ({
      name: s.name, total: s.total, series: s.series || [],
    }))
    hiddenTrend.value = new Set()
  } catch {
    topSources.value = []
    trendDates.value = []
  }
}

async function reloadPref() {
  try {
    const resp: any = await monitorApi.siEnginePreference(
      rangeStart.value, rangeEnd.value, cmpStart.value, cmpEnd.value, category.value,
    )
    prefSources.value = (resp?.sources || []).map((s: any) => ({
      canonical_source: s.canonical_source,
      cur_total: s.cur_total,
      engines: s.engines || {},
    }))
  } catch {
    prefSources.value = []
  }
}

async function reloadOwn() {
  try {
    const plat = ownEngine.value === 'all' ? null : String(ownEngine.value)
    const resp: any = await monitorApi.siOwnTrend(
      rangeStart.value, rangeEnd.value, cmpStart.value, cmpEnd.value, plat, category.value,
    )
    ownTrend.value = resp?.trend || []
    ownSummary.value = resp?.summary || {}
  } catch {
    ownTrend.value = []
    ownSummary.value = {}
  }
}

async function reloadPerspective(reset = false) {
  if (reset) {
    perspPage.value = 1
    perspectiveRows.value = []
  }
  perspLoading.value = true
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
        category: category.value,
      },
    )
    const rows = (resp?.list || []).map((s: any) => ({
      name: s.name,
      cur_total: s.cur_total,
      change: s.change,
      status: s.status,
      engines: s.engines || {},
    }))
    perspectiveRows.value = reset ? rows : [...perspectiveRows.value, ...rows]
    perspTotal.value = resp?.total || 0
  } catch {
    if (reset) perspectiveRows.value = []
  } finally {
    perspLoading.value = false
  }
}

async function loadMorePerspective() {
  perspPage.value += 1
  await reloadPerspective(false)
}

async function exportPerspective() {
  exporting.value = true
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
        category: category.value,
      },
    )
    const rows = [
      ['排名', '名称', '状态', ...platforms.map(p => p.name), '合计', '较上期'],
      ...(resp?.list || []).map((s: any, i: number) => [
        i + 1,
        s.name,
        s.status,
        ...platforms.map(p => (s.engines?.[p.key]?.cur) ?? 0),
        s.cur_total,
        s.change ?? 0,
      ]),
    ]
    downloadAoaSheets(
      [{ name: '引用源透视', rows, cols: [{ wch: 6 }, { wch: 28 }, { wch: 12 }, ...platforms.map(() => ({ wch: 10 })), { wch: 8 }, { wch: 8 }] }],
      `引用源透视_${rangeStart.value}_${rangeEnd.value}.xlsx`,
    )
    Message.success('引用源透视已导出')
  } catch (e: any) {
    Message.error(e?.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

async function loadTopics() {
  try {
    const topics: any = await monitorApi.siTopics(category.value)
    const list = Array.isArray(topics) ? topics : (topics?.list || topics || [])
    topicOptions.value = [
      { value: 0, label: '全部' },
      ...list.map((t: any) => ({ value: t.query_id, label: t.name || String(t.query_id) })),
    ]
  } catch {
    topicOptions.value = [{ value: 0, label: '全部' }]
  }
}

async function reloadAll() {
  await Promise.all([reloadTrend(), reloadPref(), reloadOwn(), reloadPerspective(true)])
}

function onDocClick(e: MouseEvent) {
  if (dateRoot.value && !dateRoot.value.contains(e.target as Node)) dateOpen.value = false
}

onMounted(async () => {
  syncCmp()
  document.addEventListener('click', onDocClick)
  await loadTopics()
  await reloadAll()
})

onUnmounted(() => document.removeEventListener('click', onDocClick))

watch(category, async () => {
  perspQueryId.value = 0
  await loadTopics()
  await reloadAll()
})
</script>

<style scoped>
.si-axis { font-size: 10px; fill: hsl(215 16% 58%); }
</style>
