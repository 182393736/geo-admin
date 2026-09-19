<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="AI 口碑分析" description="定性分析 AI 回答内容的语义理解与情感倾向">
      <template #actions>
        <Button
          variant="outline"
          :disabled="exportingAnalysis || !brandQueries.length"
          @click="exportAnalysis"
        >
          <Download class="h-4 w-4" />
          {{ exportingAnalysis ? '导出中…' : '导出' }}
        </Button>
        <Button variant="outline" @click="goManageTopics">
          <List class="h-4 w-4" />
          管理监控问题
        </Button>
      </template>
    </PageHeader>

    <!-- 筛选 + 分布 / 走势 -->
    <Card class="overflow-visible">
      <div class="border-b bg-muted/30 px-5 py-4">
        <div class="flex items-start gap-4">
          <span class="mt-2 w-[48px] shrink-0 text-xs text-muted-foreground">问题</span>
          <div class="min-w-0 flex-1">
            <div
              class="flex flex-wrap gap-2 transition-all duration-300 ease-in-out"
              :class="queriesExpanded ? '' : 'max-h-[68px] overflow-hidden'"
            >
              <button
                v-for="q in brandQueries"
                :key="q.id"
                type="button"
                class="shrink-0 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors"
                :class="q.id === queryId
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background text-foreground hover:bg-accent'"
                @click="selectQuery(q.id)"
              >{{ q.query }}</button>
              <span v-if="!brandQueries.length" class="py-1.5 text-xs text-muted-foreground">暂无口碑监控问题</span>
            </div>
          </div>
          <Button
            v-if="brandQueries.length > 2"
            variant="ghost"
            size="sm"
            class="mt-0.5 h-8 shrink-0 px-2 text-xs"
            @click="queriesExpanded = !queriesExpanded"
          >
            {{ queriesExpanded ? '收起' : '展开全部' }}
            <ChevronDown class="h-3.5 w-3.5" :class="queriesExpanded ? 'rotate-180' : ''" />
          </Button>
        </div>

        <div class="mt-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <div class="flex items-center gap-2">
            <span class="shrink-0 text-xs text-muted-foreground">AI平台</span>
            <DashSelect
              v-model="platform"
              :options="platformSelectOptions"
              min-width="140px"
              @change="onPlatformChange"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="shrink-0 text-xs text-muted-foreground">日期</span>
            <DashDateRange v-model:start="rangeStart" v-model:end="rangeEnd" @change="onRangeChange" />
          </div>
        </div>
      </div>

      <CardContent class="p-5">
        <div class="flex w-full flex-col gap-4 lg:flex-row">
          <!-- 情感倾向分布 -->
          <div class="relative flex min-h-[320px] flex-[1] flex-col items-center justify-center rounded-lg border bg-card p-5">
            <div class="absolute left-5 top-5 flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PieChart class="h-4 w-4" />
              </div>
              <h3 class="text-sm font-semibold">情感倾向分布</h3>
            </div>
            <div class="relative mt-8 h-[180px] w-full">
              <svg viewBox="0 0 180 180" class="h-full w-full">
                <circle cx="90" cy="90" r="70" fill="none" stroke="hsl(var(--muted))" stroke-width="22" />
                <g v-for="(seg, i) in donutSegs" :key="i">
                  <circle
                    cx="90" cy="90" r="70" fill="none" :stroke="seg.color" stroke-width="22"
                    :stroke-dasharray="`${seg.len} ${C - seg.len}`"
                    stroke-dashoffset="-1"
                    :stroke-linecap="seg.len > 0.5 ? 'round' : 'butt'"
                    :transform="`rotate(${seg.offset} 90 90)`"
                  />
                </g>
              </svg>
              <div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div class="text-xl font-bold" :class="riskColor">{{ riskLabel }}</div>
                <div class="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">综合评级</div>
              </div>
            </div>
            <div class="mt-4 w-full px-2">
              <div
                v-for="row in ratioRows"
                :key="row.key"
                class="flex items-center justify-between border-b border-border/60 py-2 last:border-0"
              >
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full" :style="{ background: row.color }" />
                  <span class="text-xs text-muted-foreground">{{ row.label }}</span>
                </div>
                <span class="text-xs font-semibold tabular-nums">{{ pct(row.value) }}</span>
              </div>
            </div>
          </div>

          <!-- 情感走势 -->
          <div class="flex min-h-[320px] flex-[2] flex-col rounded-lg border bg-card p-5">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp class="h-4 w-4" />
              </div>
              <h3 class="text-sm font-semibold">情感走势</h3>
            </div>
            <div class="min-h-[220px] w-full flex-1">
              <SparkLine
                v-if="scoreSeries.length"
                :points="scoreSeries"
                :labels="scoreLabels"
                :series="scoreSparkSeries"
                color="#10b981"
                :height="220"
                interactive
                rate-label="口碑分"
                value-class="text-emerald-600"
                unit=""
                :digits="1"
              />
              <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">暂无情感走势数据</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 观点 + 原文 -->
    <Card class="flex h-[340px] flex-col overflow-hidden lg:flex-row">
      <div class="flex h-full flex-col border-b bg-muted/20 lg:w-1/3 lg:border-b-0 lg:border-r">
        <div class="border-b p-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="p in polarityTabs"
              :key="p.key"
              type="button"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              :class="p.key === polarity ? p.activeCls : p.idleCls"
              @click="setPolarity(p.key)"
            >{{ p.label }}</button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div class="flex flex-wrap content-start gap-2">
            <button
              v-for="label in topicLabels"
              :key="label"
              type="button"
              class="group inline-flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2 font-medium transition-all"
              :class="label === activeTopic
                ? `z-10 ring-2 ring-ring ring-offset-1 ${polarityBorderCls}`
                : 'border-border opacity-90 hover:opacity-100 hover:shadow-sm'"
              @click="activeTopic = label"
            >
              <span class="flex items-center gap-2 text-xs" :class="polarityTextCls">
                <TrendingUp class="h-3.5 w-3.5" />
                {{ label }}
              </span>
              <Badge
                variant="secondary"
                class="text-[10px]"
                :class="label === activeTopic ? 'bg-primary/10 text-primary' : ''"
              >{{ topicGroups[label]?.variants_count || 0 }}次</Badge>
            </button>
            <div v-if="!topicLabels.length" class="w-full py-6 text-center text-xs text-muted-foreground">暂无观点</div>
          </div>
        </div>
      </div>

      <div class="flex h-full flex-col bg-card lg:w-2/3">
        <div class="flex shrink-0 border-b bg-muted/40 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <div class="w-40 shrink-0">平台</div>
          <div class="flex-1 px-4">大模型原文引用</div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div class="divide-y">
            <div
              v-for="(item, i) in activeQuotes"
              :key="i"
              class="group flex items-start px-5 py-4 text-xs transition-colors hover:bg-muted/40"
            >
              <div class="flex w-40 shrink-0 flex-wrap content-start gap-2 pt-0.5">
                <Badge variant="secondary" class="text-[11px]">{{ platformName(item.platform) }}</Badge>
              </div>
              <div class="relative flex-1 px-4 italic leading-relaxed text-muted-foreground">
                <Quote class="absolute left-0 top-0 h-3 w-3 scale-x-[-1] text-muted-foreground/40" />
                <span class="block pl-4">{{ item.quote }}</span>
              </div>
            </div>
            <div v-if="!activeQuotes.length" class="px-5 py-10 text-center text-xs text-muted-foreground">该主题暂无原文引用</div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 全景口碑矩阵 -->
    <Card class="overflow-hidden">
      <div class="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-start gap-2.5">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutGrid class="h-4 w-4" />
          </div>
          <div>
            <div class="text-sm font-semibold">全景口碑矩阵</div>
            <p class="mt-0.5 text-xs text-muted-foreground">
              监控 <span class="font-medium text-foreground">口碑健康度</span>，并对比各平台情感分 · {{ matrixDate }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <Calendar class="h-3.5 w-3.5 text-muted-foreground" />
            <DashDateInput
              v-model="matrixDate"
              class="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              @change="loadMatrix"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            :disabled="exportingMatrix || !matrixRows.length"
            @click="exportMatrix"
          >
            <Download class="h-3.5 w-3.5" />
            {{ exportingMatrix ? '导出中…' : '导出' }}
          </Button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th class="px-5 py-3 font-medium">监控问题</th>
              <th class="px-4 py-3 text-center font-medium">综合健康度 (含7日趋势)</th>
              <th class="px-4 py-3 text-center font-medium">风险评级</th>
              <th class="px-5 py-3 text-center font-medium">
                <div class="flex justify-between px-4">
                  <span
                    v-for="e in matrixEngines"
                    :key="e.key"
                    class="inline-flex w-12 flex-col items-center gap-0.5 leading-tight"
                  >
                    <span class="whitespace-nowrap">{{ e.name }}</span>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in matrixRows"
              :key="row.id"
              class="border-b last:border-0 hover:bg-muted/45"
            >
              <td class="px-5 py-4">
                <div class="text-sm font-semibold">{{ row.query }}</div>
              </td>
              <td class="px-4 py-4 text-center">
                <div class="flex items-center justify-center gap-3">
                  <span
                    class="rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums"
                    :style="scorePillStyle(cellVal(row.today.all))"
                  >{{ fmtScore(cellVal(row.today.all)) }}</span>
                  <div class="mt-0.5 flex items-center gap-0.5">
                    <TrendingUp
                      v-if="row.allChange.trend === 'up'"
                      class="h-2.5 w-2.5 text-emerald-500"
                    />
                    <TrendingDown
                      v-else-if="row.allChange.trend === 'down'"
                      class="h-2.5 w-2.5 text-rose-500"
                    />
                    <span v-else class="text-xs text-muted-foreground/40">—</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-center">
                <span
                  class="mx-auto flex w-fit items-center justify-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium"
                  :class="riskBadgeCls(cellVal(row.today.all))"
                >
                  <AlertCircle class="h-2.5 w-2.5" />
                  {{ riskOf(cellVal(row.today.all)) }}
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="flex justify-between px-4">
                  <div
                    v-for="e in matrixEngines"
                    :key="e.key"
                    class="flex h-7 w-12 cursor-pointer items-center justify-center rounded-lg border border-border/50 text-[11px] font-bold tabular-nums transition-all hover:scale-110 hover:ring-2 hover:ring-ring"
                    :style="engineCellStyle(cellVal(row.today[e.key]))"
                    :title="`查看 ${row.query} 在${e.name}的快照`"
                    @click="goSnapshot(row.query)"
                  >{{ fmtScore(cellVal(row.today[e.key])) }}</div>
                </div>
              </td>
            </tr>
            <tr v-if="!matrixRows.length">
              <td colspan="4" class="px-5 py-10 text-center text-sm text-muted-foreground">暂无口碑监控问题</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Download,
  LayoutGrid,
  List,
  PieChart,
  Quote,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'
import { Message } from '@/lib/toast'
import { monitorApi } from '@/api/modules/monitor'
import { lastNDays } from '@/utils/engines'
import { downloadAoaSheets } from '@/utils/xlsxExport'
import type { ReputationAnalysis, ReputationDataResp, AiRankingMatrixResp, AiRankingScore } from '@/api/types'
import PageHeader from '@/components/layout/PageHeader.vue'
import DashDateRange from '@/components/DashDateRange.vue'
import DashDateInput from '@/components/DashDateInput.vue'
import DashSelect from '@/components/DashSelect.vue'
import SparkLine from '@/components/SparkLine.vue'
import { Badge, Button, Card, CardContent } from '@/components/ui'

const router = useRouter()

const PLATFORM_META: Record<string, string> = {
  doubao: '豆包', wenxin: '文心一言', deepseek: 'DeepSeek', qwen: '通义千问', yuanbao: '元宝',
  kimi: 'Kimi', qianwen: '通义千问', all: '综合评价',
}
const platformName = (p: string) => PLATFORM_META[p] || p

const platformOptions = [
  { key: 'all', label: '综合评价' },
  { key: 'doubao', label: '豆包' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'qwen', label: '通义千问' },
  { key: 'wenxin', label: '文心一言' },
  { key: 'yuanbao', label: '元宝' },
]
const platformSelectOptions = platformOptions.map(p => ({ value: p.key, label: p.label }))

const matrixEngines = [
  { key: 'doubao', name: '豆包' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'wenxin', name: '文心一言' },
  { key: 'qwen', name: '通义千问' },
  { key: 'yuanbao', name: '元宝' },
]

type Polarity = 'positive' | 'neutral' | 'negative'
const polarityTabs: { key: Polarity; label: string; activeCls: string; idleCls: string; textCls: string; borderCls: string }[] = [
  { key: 'positive', label: '正面评价', activeCls: 'bg-emerald-600 text-white border-emerald-600', idleCls: 'bg-background text-muted-foreground border-input hover:bg-accent', textCls: 'text-emerald-600', borderCls: 'text-emerald-600 border-emerald-200' },
  { key: 'neutral', label: '中性描述', activeCls: 'bg-slate-600 text-white border-slate-600', idleCls: 'bg-background text-muted-foreground border-input hover:bg-accent', textCls: 'text-slate-600', borderCls: 'text-slate-600 border-slate-200' },
  { key: 'negative', label: '负面反馈', activeCls: 'bg-rose-500 text-white border-rose-500', idleCls: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100', textCls: 'text-rose-600', borderCls: 'text-rose-600 border-rose-200' },
]

const brandQueries = ref<{ id: number; query: string }[]>([])
const queryId = ref(0)
const queriesExpanded = ref(false)
const rangeStart = ref('')
const rangeEnd = ref('')
const matrixDate = ref('')
const platform = ref('all')
const reputation = ref<ReputationDataResp | null>(null)
const matrix = ref<AiRankingMatrixResp['list']>({})
const polarity = ref<Polarity>('positive')
const activeTopic = ref('')
const exportingAnalysis = ref(false)
const exportingMatrix = ref(false)

const platformLabel = computed(
  () => platformOptions.find(p => p.key === platform.value)?.label || '综合评价',
)

const emptyAnalysis = (): ReputationAnalysis => ({
  ratio: { positive: 0, neutral: 0, negative: 0 }, positive: {}, neutral: {}, negative: {},
})

const repAnalysis = computed<ReputationAnalysis>(() =>
  reputation.value?.result?.[0]?.reputation_analysis || emptyAnalysis())
const ratio = computed(() => repAnalysis.value.ratio)
const scoreResult = computed(() => reputation.value?.score_result || [])

const riskLabel = computed(() => {
  const s = ratio.value.positive * 100
  return s >= 80 ? '健康' : s >= 60 ? '中风险' : '高风险'
})
const riskColor = computed(() =>
  (riskLabel.value === '健康' ? 'text-emerald-600' : riskLabel.value === '中风险' ? 'text-amber-600' : 'text-rose-600'))

const pct = (n: number) => `${Math.round((n || 0) * 100)}%`

const ratioRows = computed(() => [
  { key: 'positive', label: '正面评价', color: '#10b981', value: ratio.value.positive },
  { key: 'neutral', label: '中性描述', color: '#94a3b8', value: ratio.value.neutral },
  { key: 'negative', label: '负面反馈', color: '#f43f5e', value: ratio.value.negative },
])

const C = 2 * Math.PI * 70
const donutSegs = computed(() => {
  const r = ratio.value
  const total = r.positive + r.neutral + r.negative || 1
  const segs = [
    { key: 'positive', color: '#10b981', frac: r.positive / total },
    { key: 'neutral', color: '#94a3b8', frac: r.neutral / total },
    { key: 'negative', color: '#f43f5e', frac: r.negative / total },
  ]
  let acc = 0
  return segs.map(s => {
    const len = s.frac * C
    const seg = { ...s, len, offset: (acc / C) * 360 }
    acc += len
    return seg
  })
})

const scoreSeries = computed(() => scoreResult.value.map(r => Number(r.score) || 0))
const scoreLabels = computed(() => scoreResult.value.map(r => {
  const d = String(r.date_day || '')
  return d.length >= 10 ? d.slice(5) : d
}))
const scoreSparkSeries = computed(() => scoreResult.value.map(r => ({
  date: String(r.date_day || ''),
  rate: Number(r.score) || 0,
  numerator: Math.round(Number(r.score) || 0),
  denominator: 100,
})))

const topicGroups = computed(() => repAnalysis.value[polarity.value] || {} as Record<string, any>)
const topicLabels = computed(() => Object.keys(topicGroups.value))
const polarityTextCls = computed(() => polarityTabs.find(t => t.key === polarity.value)?.textCls || '')
const polarityBorderCls = computed(() => polarityTabs.find(t => t.key === polarity.value)?.borderCls || '')

const activeQuotes = computed(() => {
  const grp = topicGroups.value[activeTopic.value] as
    { platforms?: Record<string, string[]>; variants_count?: number } | undefined
  if (!grp) return []
  const out: { platform: string; quote: string }[] = []
  for (const [p, quotes] of Object.entries(grp.platforms || {})) {
    for (const q of quotes || []) {
      if (q) out.push({ platform: p, quote: q })
    }
  }
  return out
})

const EMPTY_MATRIX_ROW: AiRankingMatrixResp['list'][string] = {
  today_score: {}, yesterday_score: {}, change: {},
}
const matrixRows = computed(() => brandQueries.value.map(q => {
  const m = matrix.value[String(q.id)] || EMPTY_MATRIX_ROW
  const today: Record<string, number> = m.today_score || {}
  const change: Record<string, AiRankingScore> = m.change || {}
  const allChange: AiRankingScore = change.all || { value: 0, trend: 'flat' as const }
  return { id: q.id, query: q.query, today, allChange }
}))

const riskOf = (score: number) => (score >= 80 ? '健康' : score >= 60 ? '中风险' : '高风险')
const riskBadgeCls = (score: number) =>
  (score >= 80
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : score >= 60
      ? 'bg-amber-50 text-amber-600 border-amber-100'
      : 'bg-rose-50 text-rose-600 border-rose-100')

function cellVal(v: number | null | undefined): number {
  return v == null || Number.isNaN(Number(v)) ? 0 : Number(v)
}
function fmtScore(v: number) {
  if (!v) return '0'
  return Number.isInteger(v) ? String(v) : String(+v.toFixed(2))
}
function scorePillStyle(score: number) {
  if (score >= 80) return { backgroundColor: '#d1fae5', color: '#047857' }
  if (score >= 60) return { backgroundColor: '#fef3c7', color: '#b45309' }
  return { backgroundColor: '#fee2e2', color: '#b91c1c' }
}
function engineCellStyle(score: number) {
  if (!score) return { backgroundColor: '#f1f5f9', color: '#94a3b8' }
  if (score >= 80) return { backgroundColor: '#d1fae5', color: '#047857' }
  if (score >= 60) return { backgroundColor: '#fef3c7', color: '#b45309' }
  return { backgroundColor: '#fee2e2', color: '#b91c1c' }
}

function selectQuery(id: number) {
  queryId.value = id
  loadAnalysis()
}
function onPlatformChange(val: string | number) {
  platform.value = String(val)
  loadAnalysis()
}
function onRangeChange() {
  if (!matrixDate.value) matrixDate.value = rangeEnd.value
  loadAnalysis()
}
function setPolarity(key: Polarity) {
  polarity.value = key
  activeTopic.value = topicLabels.value[0] || ''
}
function goManageTopics() {
  router.push({ path: '/dashboard/topic-management', query: { type: 'brand' } })
}
function goSnapshot(query: string) {
  router.push({ path: '/dashboard/downloads', query: { type: 'brand', q: query } })
}

async function loadAnalysis() {
  if (!rangeStart.value || !rangeEnd.value) return
  try {
    const rep = await monitorApi.reputationData(
      queryId.value,
      rangeStart.value,
      rangeEnd.value,
      platform.value,
    )
    reputation.value = rep
    if (!activeTopic.value || !topicGroups.value[activeTopic.value]) {
      activeTopic.value = topicLabels.value[0] || ''
    }
  } catch {
    reputation.value = null
  }
}

async function loadMatrix() {
  if (!matrixDate.value || !brandQueries.value.length) {
    matrix.value = {}
    return
  }
  try {
    const mat = await monitorApi.aiRankingMatrix(
      brandQueries.value.map(q => q.id),
      matrixDate.value,
    )
    matrix.value = mat?.list || {}
  } catch {
    matrix.value = {}
  }
}

function exportAnalysis() {
  exportingAnalysis.value = true
  try {
    const scoreRows = [['日期', '口碑分', '平台'], ...scoreResult.value.map(r => [r.date_day, r.score, platformLabel.value])]
    const topicRows = [['情感', '观点', '次数']]
    for (const pol of ['positive', 'neutral', 'negative'] as Polarity[]) {
      const label = polarityTabs.find(t => t.key === pol)?.label || pol
      const groups = repAnalysis.value[pol] || {}
      for (const [topic, grp] of Object.entries(groups)) {
        topicRows.push([label, topic, (grp as any)?.variants_count || 0])
      }
    }
    const quoteRows = [['情感', '观点', '平台', '原文']]
    for (const pol of ['positive', 'neutral', 'negative'] as Polarity[]) {
      const label = polarityTabs.find(t => t.key === pol)?.label || pol
      const groups = repAnalysis.value[pol] || {}
      for (const [topic, grp] of Object.entries(groups)) {
        for (const [p, quotes] of Object.entries((grp as any)?.platforms || {})) {
          const list = Array.isArray(quotes) ? quotes : []
          for (const q of list) quoteRows.push([label, topic, platformName(p), q])
        }
      }
    }
    downloadAoaSheets([
      { name: '情感走势', rows: scoreRows },
      { name: '观点标签', rows: topicRows },
      { name: '原文引用', rows: quoteRows },
    ], `口碑分析_${rangeStart.value}_${rangeEnd.value}.xlsx`)
    Message.success('已导出口碑分析')
  } catch (e: any) {
    Message.error(e?.message || '导出失败')
  } finally {
    exportingAnalysis.value = false
  }
}

function exportMatrix() {
  exportingMatrix.value = true
  try {
    const head = ['监控问题', '综合健康度', '风险评级', ...matrixEngines.map(e => e.name)]
    const rows = [head, ...matrixRows.value.map(row => [
      row.query,
      fmtScore(cellVal(row.today.all)),
      riskOf(cellVal(row.today.all)),
      ...matrixEngines.map(e => fmtScore(cellVal(row.today[e.key]))),
    ])]
    downloadAoaSheets([{ name: '全景口碑矩阵', rows }], `全景口碑矩阵_${matrixDate.value}.xlsx`)
    Message.success('已导出矩阵')
  } catch (e: any) {
    Message.error(e?.message || '导出失败')
  } finally {
    exportingMatrix.value = false
  }
}

watch(topicLabels, labels => {
  if (!labels.includes(activeTopic.value)) activeTopic.value = labels[0] || ''
})

onMounted(async () => {
  const { start, end } = lastNDays(7)
  rangeStart.value = start
  rangeEnd.value = end
  matrixDate.value = end
  try {
    const qs = await monitorApi.queryList('brand')
    brandQueries.value = (qs?.list || []).map(q => ({ id: q.id, query: q.query }))
    if (brandQueries.value.length) queryId.value = brandQueries.value[0].id
  } catch {
    brandQueries.value = []
  }
  await Promise.all([loadAnalysis(), loadMatrix()])
})
</script>
