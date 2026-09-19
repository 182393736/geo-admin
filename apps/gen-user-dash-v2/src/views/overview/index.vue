<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutTemplate, ArrowRight, Search, PenLine, Library, ChartColumn } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { brandApi } from '@/api/modules/brand'
import { monitorApi } from '@/api/modules/monitor'
import { reportApi } from '@/api/modules/report'
import type { BrandSummary, QueryStatus, ReportLatestResp } from '@/api/types'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { Message } from '@/lib/toast'

const router = useRouter()
const auth = useAuthStore()

const summary = ref<BrandSummary | null>(null)
const queryStatus = ref<QueryStatus | null>(null)
const report = ref<ReportLatestResp | null>(null)
const loading = ref(true)
const periodType = ref<'weekly' | 'monthly'>('weekly')

const brandName = computed(() => summary.value?.brand?.name || '—')
const brandMark = computed(() => {
  const n = (brandName.value || '').replace(/\s+/g, '')
  return n && n !== '—' ? n.slice(0, 1) : '品'
})
const industry = computed(() => summary.value?.brand?.industry || '')
const website = computed(() => summary.value?.brand?.website || '')
const aliasCount = computed(() => summary.value?.aliases?.length || 0)
const industryQueryCount = computed(() => summary.value?.queries?.industry?.length || 0)
const competitorCount = computed(() => summary.value?.competitors?.length || 0)
const pendingCollection = computed(() => queryStatus.value?.pending ?? true)

const payload = computed(() => report.value?.payload || null)
const ovStats = computed(() => report.value?.overview_stats || null)

const reportGeneratedAt = computed(() => {
  const t = report.value?.generated_at
  if (!t) return ''
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
})

const fmtPct = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? `${+v.toFixed(2)}%` : '—')
const fmtNum = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? `${Math.round(v * 100) / 100}` : '—')
const deltaTxt = (d: any) => (!d || d.trend === 'flat' || !d.delta ? '—' : `${d.delta > 0 ? '+' : ''}${d.delta}`)
const deltaClass = (d: any) => {
  const t = d?.trend
  if (t === 'up') return 'text-emerald-600'
  if (t === 'dn' || t === 'down') return 'text-red-600'
  return 'text-muted-foreground'
}

const engineColors: Record<string, string> = {
  deepseek: 'rgb(37, 99, 235)',
  doubao: 'rgb(59, 130, 246)',
  wenxin: 'rgb(236, 72, 153)',
  yuanbao: 'rgb(6, 182, 212)',
  qianwen: 'rgb(245, 158, 11)',
}

const engines = computed(() => (payload.value?.engines || []).filter((e: any) => e.key !== 'all'))
const monitorIndustryCount = computed(
  () => (payload.value?.monitor || []).filter((m: any) => m.query_type === 'industry').length,
)
const monitorBrandCount = computed(
  () => (payload.value?.monitor || []).filter((m: any) => m.query_type === 'brand').length,
)
const collectedQueries = computed(() => ovStats.value?.collected_queries ?? 0)
const sourceTotal = computed(() => ovStats.value?.reference_sources ?? 0)

const citeStatTags = computed(() => [
  { value: monitorIndustryCount.value, label: '监控排名问题', accent: true },
  { value: monitorBrandCount.value, label: '监控口碑问题', accent: false },
  { value: collectedQueries.value, label: '本期查询量', accent: false },
  { value: sourceTotal.value, label: '引用源总量', accent: false },
])

const metricByKey = (key: string) => (payload.value?.metrics || []).find((x: any) => x.key === key) || {}
const metricCard = computed(() => ({
  mention: metricByKey('mention_rate').value ?? 0,
  top3: metricByKey('top3_rate').value ?? 0,
  first: metricByKey('first_rate').value ?? 0,
  rep: metricByKey('rep_score').value ?? 0,
  sources: metricByKey('sources').value ?? 0,
  mentionD: metricByKey('mention_rate'),
  top3D: metricByKey('top3_rate'),
  firstD: metricByKey('first_rate'),
  repD: metricByKey('rep_score'),
}))

const sourceChanges = computed(() => payload.value?.sourceChanges || [])
const newSources = computed(() =>
  sourceChanges.value.filter(
    (s: any) => Number(s.delta_ref) > 0 && Number(s.ref_count) > 0 && Number(s.delta_ref) === Number(s.ref_count),
  ),
)
const lostSources = computed(() =>
  sourceChanges.value.filter((s: any) => Number(s.ref_count) === 0 && Number(s.delta_ref) < 0),
)

const channelRows = computed(() =>
  (payload.value?.channels || []).map((c: any) => ({
    name: c.canonical_source,
    ref_count: c.ref_count || 0,
    cost_per_citation: c.cost_per_citation,
  })),
)

const publishRows = computed(() =>
  (payload.value?.publish || []).map((o: any) => ({
    title: o.article_title || '—',
    media: o.media_name || '—',
    status: o.status,
    cites: o.cite_count ?? '—',
  })),
)

function publishStatusTxt(s: string) {
  if (s === 'ok') return '已发布'
  if (s === 'fail') return '失败'
  if (s === 'submitted') return '已提交'
  return '待发布'
}

function publishStatusClass(s: string) {
  if (s === 'ok') return 'border-transparent bg-emerald-100 text-emerald-800'
  if (s === 'fail') return 'border-transparent bg-red-100 text-red-800'
  return 'bg-secondary text-secondary-foreground'
}

const competitors = computed(() =>
  (payload.value?.competitors || []).slice(0, 10).map((c: any) => ({
    brand: c.name,
    rate: fmtPct(c.mention_rate),
    top3: fmtPct(c.top3_rate),
    first: fmtPct(c.first_rate),
  })),
)

const maxRef = computed(() => {
  const s = payload.value?.sources || []
  return s.length ? Math.max(...s.map((x: any) => x.ref_count || 0)) : 1
})

const deltaBySource = computed(() => {
  const m: Record<string, number> = {}
  for (const s of sourceChanges.value) m[s.canonical_source] = Number(s.delta_ref) || 0
  return m
})

const citationPlatforms = computed(() => {
  const known = new Set(payload.value?.knownSourceNames || [])
  return (payload.value?.sources || []).slice(0, 15).map((s: any) => {
    const delta = deltaBySource.value[s.canonical_source] ?? 0
    let dCls = 'text-muted-foreground'
    let dTxt = '—'
    if (delta > 0) {
      dCls = 'text-emerald-600'
      dTxt = `↑${delta}`
    } else if (delta < 0) {
      dCls = 'text-red-600'
      dTxt = `↓${Math.abs(delta)}`
    }
    return {
      platform: s.canonical_source,
      cited: String(s.ref_count || 0),
      cover: s.query_count || 0,
      placeable: s.media_key || known.has(s.canonical_source) ? '信源库内' : '未收录',
      bar: maxRef.value ? Math.round(((s.ref_count || 0) / maxRef.value) * 100) : 0,
      dCls,
      dTxt,
    }
  })
})

const shortcuts = [
  {
    title: '挖掘监控问题',
    desc: '对话式补全监测面',
    to: { path: '/dashboard/topic-management', query: { type: 'industry' } },
    icon: Search,
  },
  {
    title: 'AI 撰写稿件',
    desc: '写作 Agent · 挂载知识库',
    to: '/dashboard/new-agent',
    icon: PenLine,
  },
  {
    title: '信源库',
    desc: '监控 × 价格 · 按被引成本推荐',
    to: '/dashboard/media-library',
    icon: Library,
  },
  {
    title: 'AI排名透视',
    desc: '实时位次 · 逐题下钻',
    to: '/dashboard/ai-index',
    icon: ChartColumn,
  },
]

async function loadBrand() {
  summary.value = await brandApi.summary(auth.activeBrandId || undefined)
  queryStatus.value = await monitorApi.queryStatus()
}

async function loadReport() {
  try {
    report.value = await reportApi.latest(periodType.value)
  } catch {
    report.value = null
  }
}

function setPeriod(t: 'weekly' | 'monthly') {
  if (periodType.value === t) return
  periodType.value = t
  void loadReport()
}

function onExport() {
  Message.info('导出报告即将开放')
}

let reportTimer: number | undefined

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([loadBrand(), loadReport()])
  } catch (e: any) {
    Message.error(e?.message || '报告数据加载失败')
  } finally {
    loading.value = false
  }
  reportTimer = window.setInterval(() => {
    void loadReport()
  }, 30000)
})

onBeforeUnmount(() => {
  if (reportTimer) window.clearInterval(reportTimer)
})

watch(
  () => auth.activeBrandId,
  async () => {
    loading.value = true
    try {
      await Promise.all([loadBrand(), loadReport()])
    } finally {
      loading.value = false
    }
  },
)
</script>

<template>
  <div class="mx-auto max-w-[1120px] space-y-6 px-6 py-8">
    <PageHeader
      :title="'报告'"
      :description="`当前品牌：${brandName} · 周报每周日截止、月报每月月末截止后次日自动生成`"
    >
      <template #actions>
        <Button variant="outline" @click="router.push('/dashboard/report-templates')">
          <LayoutTemplate class="h-4 w-4" />
          <span class="text-left leading-tight">
            报告模板
            <span class="block text-[11px] font-normal text-muted-foreground">标准版</span>
          </span>
        </Button>
      </template>
    </PageHeader>

    <div class="grid items-stretch gap-4 lg:grid-cols-[1.7fr_1fr]">
      <Card class="flex h-full flex-col overflow-hidden border-primary/10 bg-gradient-to-br from-primary/[0.07] via-card to-sky-50/80 shadow-sm">
        <CardContent class="relative flex h-full flex-1 flex-col p-5">
          <div
            class="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary/[0.06] blur-2xl"
            aria-hidden="true"
          />
          <div
            class="pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-sky-400/[0.06] blur-2xl"
            aria-hidden="true"
          />
          <div class="relative flex items-start gap-3">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20"
            >
              {{ brandMark }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-lg font-semibold">{{ loading ? '加载中…' : brandName }}</span>
                <Badge
                  v-if="pendingCollection"
                  class="border-transparent bg-amber-100 text-amber-900"
                >
                  等待首次采集
                </Badge>
                <Badge v-else class="border-transparent bg-emerald-100 text-emerald-800">采集正常</Badge>
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">{{ industry || '未设置行业' }}</Badge>
                <Badge variant="outline">{{ website || '未设置官网' }}</Badge>
                <Badge variant="outline">{{ aliasCount }} 个识别词</Badge>
                <Badge variant="outline">{{ industryQueryCount }} 个监控问题</Badge>
                <Badge variant="outline">{{ competitorCount }} 个竞品</Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" @click="router.push('/dashboard/brand-library')">
              品牌档案
              <ArrowRight class="h-3.5 w-3.5" />
            </Button>
          </div>

          <div class="relative mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-primary/10 pt-4">
            <div class="grid min-w-0 flex-1 grid-cols-3 gap-3 sm:gap-6">
              <div>
                <div class="text-2xl font-semibold tabular-nums text-primary">
                  {{ pendingCollection ? '—' : (ovStats?.collected_queries ?? '—') }}
                </div>
                <div class="mt-0.5 text-xs text-muted-foreground">当日采集查询</div>
              </div>
              <div>
                <div class="text-2xl font-semibold tabular-nums">
                  {{ pendingCollection ? '—' : (ovStats?.reference_sources ?? '—') }}
                </div>
                <div class="mt-0.5 text-xs text-muted-foreground">引用源</div>
              </div>
              <div>
                <div class="text-2xl font-semibold tabular-nums">
                  {{ pendingCollection ? '—' : (ovStats?.published_articles ?? '—') }}
                </div>
                <div class="mt-0.5 text-xs text-muted-foreground">已发稿件</div>
              </div>
            </div>
            <p class="max-w-[220px] shrink-0 text-right text-xs leading-relaxed text-muted-foreground">
              <template v-if="pendingCollection">
                等待首次采集 · 预计 {{ queryStatus?.expected_slots || 0 }} 槽位（{{ queryStatus?.enabled_queries || 0 }} 问题 × 引擎）
              </template>
              <template v-else>
                统计日期 {{ ovStats?.stat_date || '—' }}
                <br />
                更新于 {{ ovStats?.updated_at || '—' }}
              </template>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card class="flex h-full flex-col">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">快捷动作</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-1 flex-col space-y-2">
          <button
            v-for="a in shortcuts"
            :key="a.title"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
            @click="router.push(a.to as any)"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <component :is="a.icon" class="h-4 w-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-medium">{{ a.title }}</span>
              <span class="block text-xs text-muted-foreground">{{ a.desc }}</span>
            </span>
            <ArrowRight class="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    </div>

    <!-- 采集前空态 -->
    <Card v-if="pendingCollection">
      <CardContent class="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div class="text-3xl">📡</div>
        <div class="text-base font-semibold">尚未开始数据采集</div>
        <p class="max-w-xl text-sm text-muted-foreground">
          品牌档案已建立：{{ brandName }} · {{ industryQueryCount }} 个监控问题（预计
          {{ queryStatus?.expected_slots || 0 }} 采集槽位）。今日槽位已生成，采集完成后将自动展示周报/月报。
        </p>
        <div class="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">注册 ✓</Badge>
          <span>→</span>
          <Badge variant="secondary">建档 ✓</Badge>
          <span>→</span>
          <Badge variant="outline">今日采集</Badge>
          <span>→</span>
          <Badge variant="outline">分析入库</Badge>
          <span>→</span>
          <Badge variant="outline">报告展示</Badge>
        </div>
      </CardContent>
    </Card>

    <template v-else>
      <Card>
        <CardContent class="flex flex-wrap items-center gap-2 p-3">
          <div class="inline-flex rounded-lg bg-secondary p-0.5">
            <Button
              size="sm"
              class="h-7"
              :variant="periodType === 'weekly' ? 'default' : 'ghost'"
              @click="setPeriod('weekly')"
            >
              周报
            </Button>
            <Button
              size="sm"
              class="h-7"
              :variant="periodType === 'monthly' ? 'default' : 'ghost'"
              @click="setPeriod('monthly')"
            >
              月报
            </Button>
          </div>
          <span class="text-sm font-medium">{{ report?.label || '—' }}</span>
          <span class="text-sm text-muted-foreground">{{ report?.range || '—' }}</span>
          <Badge variant="secondary">最新一期</Badge>
          <span class="text-xs text-muted-foreground">生成于 {{ reportGeneratedAt || '—' }}</span>
          <span class="text-xs text-muted-foreground">· 模板 标准版 · 6 个模块</span>
          <Button class="ml-auto" size="sm" @click="onExport">导出报告</Button>
        </CardContent>
      </Card>

      <!-- 本期引用概况 -->
      <Card class="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/[0.07] via-card to-sky-50/80 shadow-sm">
        <CardHeader class="relative border-b border-primary/10 py-4">
          <div
            class="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-primary/[0.06] blur-2xl"
            aria-hidden="true"
          />
          <CardTitle class="relative text-base">本期引用概况</CardTitle>
          <CardDescription class="relative">AI 引擎采集分布 · 监控问题 / 查询量 / 引用源总量</CardDescription>
        </CardHeader>
        <CardContent class="relative p-5">
          <div
            class="pointer-events-none absolute -bottom-10 left-1/4 h-28 w-28 rounded-full bg-sky-400/[0.06] blur-2xl"
            aria-hidden="true"
          />

          <div
            class="relative flex flex-col items-center justify-center gap-8 px-2 py-4 lg:flex-row lg:gap-12 xl:gap-16"
          >
            <!-- 左侧：平台标签 -->
            <div class="flex flex-wrap items-center justify-center gap-2 lg:max-w-[220px] lg:flex-col lg:items-end lg:justify-center">
              <span
                v-for="e in engines"
                :key="e.key"
                class="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3.5 py-2 text-[12.5px] font-semibold text-foreground shadow-sm shadow-primary/5 backdrop-blur-sm"
              >
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  :style="{ background: engineColors[e.key] || 'hsl(var(--primary))' }"
                />
                {{ e.name }} · 网页端
              </span>
              <span
                v-if="!engines.length"
                class="text-sm text-muted-foreground"
              >暂无引擎数据</span>
            </div>

            <!-- 中间：品牌 -->
            <div class="flex shrink-0 flex-col items-center gap-2 text-center">
              <div
                class="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-[17px] font-bold text-primary-foreground shadow-[0_10px_26px_rgba(37,99,235,0.28),0_0_0_7px_rgba(255,255,255,0.7)]"
              >
                {{ brandName.slice(0, 2) || '品牌' }}
              </div>
              <div class="text-[12.5px] font-bold text-foreground">{{ brandName }} · 监控品牌</div>
              <div class="text-[10.5px] text-muted-foreground">监控问题 × AI 引擎 × 天</div>
            </div>

            <!-- 右侧：统计标签 -->
            <div class="flex flex-wrap items-center justify-center gap-2 lg:max-w-[260px] lg:flex-col lg:items-start lg:justify-center">
              <span
                v-for="s in citeStatTags"
                :key="s.label"
                class="inline-flex items-baseline gap-2 rounded-full border border-white/60 bg-white/80 px-3.5 py-2 shadow-sm shadow-primary/5 backdrop-blur-sm"
              >
                <span
                  class="text-lg font-bold tabular-nums leading-none"
                  :class="s.accent ? 'text-primary' : 'text-foreground'"
                >{{ s.value }}</span>
                <span class="text-[11px] text-muted-foreground">{{ s.label }}</span>
              </span>
            </div>
          </div>

          <p class="relative mt-4 text-xs leading-relaxed text-muted-foreground">
            查询量 = 本期实际采集到的「监控问题 × AI 引擎 × 天」去重条数；引用源 = 本期 AI 回答里出现过的来源域名，按域名去重
          </p>
        </CardContent>
      </Card>

      <!-- 核心指标 -->
      <Card>
        <CardHeader class="border-b py-4">
          <CardTitle class="text-base">核心指标</CardTitle>
          <CardDescription>四项主指标 + 五个 AI 引擎逐项环比（口径同 AI排名透视）</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5 p-5">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div class="rounded-lg bg-muted/50 p-3">
              <div class="text-xs text-muted-foreground">品牌提及率</div>
              <div class="mt-1 text-xl font-semibold tabular-nums">
                {{ fmtPct(metricCard.mention) }}
                <span class="ml-1 text-xs font-medium" :class="deltaClass(metricCard.mentionD)">{{ deltaTxt(metricCard.mentionD) }}</span>
              </div>
            </div>
            <div class="rounded-lg bg-muted/50 p-3">
              <div class="text-xs text-muted-foreground">Top3 推荐率</div>
              <div class="mt-1 text-xl font-semibold tabular-nums">
                {{ fmtPct(metricCard.top3) }}
                <span class="ml-1 text-xs font-medium" :class="deltaClass(metricCard.top3D)">{{ deltaTxt(metricCard.top3D) }}</span>
              </div>
            </div>
            <div class="rounded-lg bg-muted/50 p-3">
              <div class="text-xs text-muted-foreground">首位推荐率</div>
              <div class="mt-1 text-xl font-semibold tabular-nums">
                {{ fmtPct(metricCard.first) }}
                <span class="ml-1 text-xs font-medium" :class="deltaClass(metricCard.firstD)">{{ deltaTxt(metricCard.firstD) }}</span>
              </div>
            </div>
            <div class="rounded-lg bg-muted/50 p-3">
              <div class="text-xs text-muted-foreground">口碑分</div>
              <div class="mt-1 text-xl font-semibold tabular-nums">
                {{ fmtNum(metricCard.rep) }}
                <span class="ml-1 text-xs font-medium" :class="deltaClass(metricCard.repD)">{{ deltaTxt(metricCard.repD) }}</span>
              </div>
            </div>
            <div class="rounded-lg bg-muted/50 p-3">
              <div class="text-xs text-muted-foreground">引用源总量</div>
              <div class="mt-1 text-xl font-semibold tabular-nums">{{ fmtNum(metricCard.sources) }}</div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <div class="grid min-w-[640px] grid-cols-5 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span>AI 引擎</span>
              <span>权重分</span>
              <span>提及率</span>
              <span>Top3 推荐率</span>
              <span>首位推荐率</span>
            </div>
            <div
              v-for="e in engines"
              :key="e.key"
              class="grid min-w-[640px] grid-cols-5 items-center px-3 py-2.5 text-sm"
            >
              <span class="flex items-center gap-2 font-medium">
                <i
                  class="inline-block h-2 w-2 rounded-full"
                  :style="{ background: engineColors[e.key] || 'hsl(var(--primary))' }"
                />
                {{ e.name }}
              </span>
              <span>
                <b>#{{ fmtNum(e.score) }}</b>
                <em class="ml-1 text-xs not-italic" :class="deltaClass(e.score_delta)">{{ deltaTxt(e.score_delta) }}</em>
              </span>
              <span>
                <b>{{ fmtPct(e.mention_rate) }}</b>
                <em class="ml-1 text-xs not-italic" :class="deltaClass(e.mention_rate_delta)">{{ deltaTxt(e.mention_rate_delta) }}</em>
              </span>
              <span>
                <b>{{ fmtPct(e.top3_rate) }}</b>
                <em class="ml-1 text-xs not-italic" :class="deltaClass(e.top3_rate_delta)">{{ deltaTxt(e.top3_rate_delta) }}</em>
              </span>
              <span>
                <b>{{ fmtPct(e.first_rate) }}</b>
                <em class="ml-1 text-xs not-italic" :class="deltaClass(e.first_rate_delta)">{{ deltaTxt(e.first_rate_delta) }}</em>
              </span>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            口径同「AI排名透视」：提及率 / Top3 / 首位推荐率按采样占比；权重分 = 平均位次权重；一次采样 = 监控问题 × 引擎 × 单次监测
          </p>
        </CardContent>
      </Card>

      <!-- 竞争格局 -->
      <Card>
        <CardHeader class="flex flex-row items-start justify-between border-b py-4">
          <div>
            <CardTitle class="text-base">竞争格局</CardTitle>
            <CardDescription>竞品提及与推荐率对比</CardDescription>
          </div>
          <Button variant="ghost" size="sm" @click="router.push('/dashboard/competitor-insight')">
            竞品透视
            <ArrowRight class="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <div class="grid min-w-[560px] grid-cols-[48px_1.4fr_1fr_1fr_1fr] border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>#</span><span>品牌</span><span>提及率</span><span>Top3 推荐率</span><span>首位提及率</span>
            </div>
            <div
              v-for="(row, i) in competitors"
              :key="i"
              class="grid min-w-[560px] grid-cols-[48px_1.4fr_1fr_1fr_1fr] items-center border-b px-4 py-2.5 text-sm last:border-0"
            >
              <span class="text-muted-foreground">{{ i + 1 }}</span>
              <span class="font-medium">{{ row.brand }}</span>
              <span>{{ row.rate }}</span>
              <span>{{ row.top3 }}</span>
              <span>{{ row.first }}</span>
            </div>
            <div v-if="!competitors.length" class="px-4 py-8 text-center text-sm text-muted-foreground">暂无竞品数据</div>
          </div>
        </CardContent>
      </Card>

      <!-- 信源引用趋势 -->
      <Card>
        <CardHeader class="flex flex-row items-start justify-between border-b py-4">
          <div>
            <CardTitle class="text-base">信源引用趋势</CardTitle>
            <CardDescription>本期引用源增减、Top 平台被引变化与可投放标记</CardDescription>
          </div>
          <Button variant="ghost" size="sm" @click="router.push('/dashboard/citation-sources')">
            引用源追溯
            <ArrowRight class="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent class="space-y-4 p-5">
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-lg border p-3">
              <div class="text-xl font-semibold tabular-nums">{{ (payload?.sources || []).length }}</div>
              <div class="text-xs text-muted-foreground">命中信源平台数</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xl font-semibold tabular-nums" :class="newSources.length ? 'text-emerald-600' : ''">
                {{ newSources.length ? `↑${newSources.length}` : '—' }}
              </div>
              <div class="text-xs text-muted-foreground">本期新增信源平台</div>
            </div>
            <div class="rounded-lg border p-3">
              <div class="text-xl font-semibold tabular-nums" :class="lostSources.length ? 'text-red-600' : ''">
                {{ lostSources.length ? `↓${lostSources.length}` : '—' }}
              </div>
              <div class="text-xs text-muted-foreground">本期流失信源平台</div>
            </div>
          </div>

          <div class="overflow-x-auto rounded-lg border">
            <div class="grid min-w-[640px] grid-cols-[1.4fr_1fr_1.2fr_1fr_0.8fr] border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span>信源平台</span>
              <span>本期被引</span>
              <span></span>
              <span>覆盖监控问题</span>
              <span>可投放</span>
            </div>
            <div
              v-for="(row, i) in citationPlatforms"
              :key="i"
              class="grid min-w-[640px] grid-cols-[1.4fr_1fr_1.2fr_1fr_0.8fr] items-center gap-2 border-b px-3 py-2.5 text-sm last:border-0"
            >
              <span class="truncate font-medium">{{ row.platform }}</span>
              <span>
                <b>{{ row.cited }}</b>
                <em class="ml-1 text-xs not-italic" :class="row.dCls">{{ row.dTxt }}</em>
              </span>
              <span class="h-1.5 overflow-hidden rounded-full bg-secondary">
                <i class="block h-full rounded-full bg-primary" :style="{ width: row.bar + '%' }" />
              </span>
              <span class="text-muted-foreground">{{ row.cover }} 个</span>
              <Badge :variant="row.placeable === '信源库内' ? 'secondary' : 'outline'">{{ row.placeable }}</Badge>
            </div>
            <div v-if="!citationPlatforms.length" class="px-4 py-8 text-center text-sm text-muted-foreground">暂无信源数据</div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div class="mb-2 flex items-center justify-between text-sm font-medium text-emerald-900">
                <span>本期新进信源平台</span>
                <b>{{ newSources.length }}</b>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span v-if="!newSources.length" class="text-xs text-muted-foreground">本期无变化</span>
                <Badge v-for="s in newSources.slice(0, 6)" :key="s.canonical_source" variant="outline">
                  {{ s.canonical_source }} +{{ s.delta_ref }}
                </Badge>
              </div>
            </div>
            <div class="rounded-lg border border-red-200 bg-red-50/50 p-3">
              <div class="mb-2 flex items-center justify-between text-sm font-medium text-red-900">
                <span>本期掉出信源平台</span>
                <b>{{ lostSources.length }}</b>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span v-if="!lostSources.length" class="text-xs text-muted-foreground">本期无变化</span>
                <Badge v-for="s in lostSources.slice(0, 6)" :key="s.canonical_source" variant="outline">
                  {{ s.canonical_source }} {{ s.delta_ref }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 信源投放分析 -->
      <Card>
        <CardHeader class="flex flex-row items-start justify-between border-b py-4">
          <div>
            <CardTitle class="text-base">信源投放分析</CardTitle>
            <CardDescription>各信源的被引转化与积分成本效率</CardDescription>
          </div>
          <Button variant="ghost" size="sm" @click="router.push('/dashboard/media-library')">
            信源库
            <ArrowRight class="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <div class="grid min-w-[480px] grid-cols-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>信源</span><span>本期被引</span><span>每次被引成本</span>
            </div>
            <div
              v-for="c in channelRows"
              :key="c.name"
              class="grid min-w-[480px] grid-cols-3 border-b px-4 py-2.5 text-sm last:border-0"
            >
              <span class="font-medium">{{ c.name }}</span>
              <span>{{ c.ref_count }}</span>
              <span>{{ c.cost_per_citation != null ? `✦ ${c.cost_per_citation}` : '—' }}</span>
            </div>
            <div v-if="!channelRows.length" class="px-4 py-8 text-center text-sm text-muted-foreground">
              暂无已收录信源的投放数据
            </div>
          </div>
          <p class="border-t px-4 py-3 text-xs text-muted-foreground">
            每次被引成本 = 信源发稿价 ÷ 本期被引次数；成本越低说明该信源在 AI 回答里越「顶用」。
          </p>
        </CardContent>
      </Card>

      <!-- 发稿明细 -->
      <Card>
        <CardHeader class="flex flex-row items-start justify-between border-b py-4">
          <div>
            <CardTitle class="text-base">发稿明细</CardTitle>
            <CardDescription>本期稿件清单与发布状态</CardDescription>
          </div>
          <Button variant="ghost" size="sm" @click="router.push('/dashboard/media-library/records')">
            全部记录
            <ArrowRight class="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <div class="grid min-w-[560px] grid-cols-[1.6fr_1fr_0.8fr_0.6fr] border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>稿件</span><span>信源</span><span>状态</span><span>被引</span>
            </div>
            <div
              v-for="(o, i) in publishRows"
              :key="i"
              class="grid min-w-[560px] grid-cols-[1.6fr_1fr_0.8fr_0.6fr] items-center border-b px-4 py-2.5 text-sm last:border-0"
            >
              <span class="truncate font-medium">{{ o.title }}</span>
              <span>{{ o.media }}</span>
              <Badge :class="cn(publishStatusClass(o.status))">{{ publishStatusTxt(o.status) }}</Badge>
              <span>{{ o.cites }}</span>
            </div>
            <div v-if="!publishRows.length" class="px-4 py-8 text-center text-sm text-muted-foreground">本期暂无发稿</div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
