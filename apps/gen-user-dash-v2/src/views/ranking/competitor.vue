<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="AI 竞品透视" description="基于 AI 搜索排名数据的竞品分析与对比">
      <template #actions>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-muted-foreground">周期</span>
          <DashDateInput
            v-model="rangeStart"
            :min="rangeEnd ? addDays(rangeEnd, -MAX_DAYS) : undefined"
            :max="rangeEnd || today"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs"
            @change="onStartChange"
          />
          <span class="text-xs text-muted-foreground">至</span>
          <DashDateInput
            v-model="rangeEnd"
            :min="rangeStart || undefined"
            :max="rangeStart ? minDate(addDays(rangeStart, MAX_DAYS), today) : today"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs"
            @change="onEndChange"
          />
          <Button size="sm" :disabled="!canQuery" @click="onQuery">查询</Button>
          <Button size="sm" variant="outline" @click="reload(rangeStart, rangeEnd)">
            <RefreshCw class="h-3.5 w-3.5" />
            刷新
          </Button>
          <Button size="sm" variant="outline" :disabled="exporting" @click="onExport">
            <Download class="h-3.5 w-3.5" />
            {{ exporting ? '导出中…' : '导出 Excel' }}
          </Button>
          <Button size="sm" variant="outline" title="把同一品牌的不同写法归类合并" @click="correctionOpen = true">
            <GitMerge class="h-3.5 w-3.5" />
            修正品牌名
          </Button>
        </div>
      </template>
    </PageHeader>

    <BrandNameCorrectionModal
      :open="correctionOpen"
      :date="rangeEnd || rangeStart"
      @close="correctionOpen = false"
      @saved="onCorrectionSaved"
    />

    <!-- KPI -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardContent class="p-5">
          <div class="mb-2 text-sm text-muted-foreground">竞品总数</div>
          <div class="text-2xl font-bold tabular-nums">{{ kpi.total }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="mb-2 text-sm text-muted-foreground">监控问题</div>
          <div class="text-2xl font-bold tabular-nums">{{ kpi.queries }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="mb-2 text-sm text-muted-foreground">最强竞品</div>
          <div class="truncate text-lg font-semibold">{{ kpi.top.name }}</div>
          <div class="mt-1 text-xs text-muted-foreground">
            出现 {{ kpi.top.frequency }} 次 · 提及率 {{ kpi.top.mention_rate }}% · Top3 {{ kpi.top.top3_mention_rate }}%
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="mb-2 text-sm text-muted-foreground">头号竞品 Top3 推荐率</div>
          <div class="text-2xl font-bold tabular-nums text-primary">{{ kpi.top.top3_mention_rate }}%</div>
          <div class="mt-1 text-xs text-muted-foreground">{{ kpi.top.name }} · 综合 Top3 推荐率</div>
        </CardContent>
      </Card>
    </div>

    <!-- 竞品品牌提及率 -->
    <Card class="overflow-hidden">
      <div class="flex items-center gap-2.5 border-b px-5 py-4">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ChartColumn class="h-4 w-4" />
        </div>
        <span class="text-sm font-semibold">竞品品牌提及率</span>
      </div>
      <div class="max-h-[620px] overflow-auto">
        <table class="w-full table-fixed text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th class="sticky top-0 z-10 w-[6%] bg-muted px-4 py-2.5 text-left font-medium">序号</th>
              <th class="sticky top-0 z-10 w-[24%] bg-muted px-4 py-2.5 text-left font-medium">竞品名称</th>
              <th class="sticky top-0 z-10 w-[24%] bg-muted px-4 py-2.5 text-left font-medium">频次条</th>
              <th class="sticky top-0 z-10 w-[10%] bg-muted px-2 py-2.5 text-center font-medium">出现次数</th>
              <th class="sticky top-0 z-10 w-[12%] bg-muted px-2 py-2.5 text-center font-medium">提及率</th>
              <th class="sticky top-0 z-10 w-[12%] bg-muted px-2 py-2.5 text-center font-medium">Top3 推荐率</th>
              <th class="sticky top-0 z-10 w-[12%] bg-muted px-2 py-2.5 text-center font-medium">首位提及率</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(c, i) in rows"
              :key="c.name + i"
              :class="c.is_target
                ? 'border-b bg-primary/[0.06] last:border-0 hover:bg-primary/10'
                : 'border-b last:border-0 hover:bg-muted/45'"
            >
              <td class="px-4 py-3">
                <span
                  class="inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
                  :style="{ backgroundColor: badgeColor(i + 1) }"
                >{{ i + 1 }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex min-w-0 items-center gap-2">
                  <span
                    :class="['truncate text-sm font-semibold', c.is_target ? 'text-primary' : 'text-foreground']"
                    :title="c.name"
                  >{{ c.name }}</span>
                  <Badge v-if="c.is_target" class="shrink-0 border-transparent bg-primary/10 text-[10px] text-primary">本品牌</Badge>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="h-2.5 overflow-hidden rounded-md bg-muted">
                  <div class="h-full rounded-md bg-primary/85" :style="{ width: barW(c.frequency) }" />
                </div>
              </td>
              <td class="px-2 py-3 text-center font-semibold tabular-nums">{{ c.frequency }}</td>
              <td class="px-2 py-3 text-center">
                <span :class="metricCls('mention', c.mention_rate)">{{ c.mention_rate }}%</span>
              </td>
              <td class="px-2 py-3 text-center">
                <span :class="metricCls('top3', c.top3_mention_rate)">{{ c.top3_mention_rate }}%</span>
              </td>
              <td class="px-2 py-3 text-center">
                <span :class="metricCls('first', c.first_mention_rate)">{{ c.first_mention_rate }}%</span>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="7" class="px-4 py-10 text-center text-sm text-muted-foreground">暂无竞品数据（采集或解析尚未产出）</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 分平台排名指标 -->
    <Card class="overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutGrid class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">竞品品牌分平台排名指标</span>
        </div>
        <div class="flex items-center gap-2">
          <Badge class="border-transparent bg-primary/10 text-primary">提及率</Badge>
          <Badge class="border-transparent bg-violet-50 text-violet-700">Top3 推荐率</Badge>
          <Badge class="border-transparent bg-amber-50 text-amber-800">首位提及率</Badge>
        </div>
      </div>
      <div class="max-h-[620px] overflow-auto">
        <table class="w-full min-w-[1520px] text-sm">
          <thead class="sticky top-0 z-20">
            <tr class="border-b bg-muted">
              <th rowspan="2" class="sticky left-0 z-30 border-r bg-muted px-4 py-3 text-left align-bottom text-xs font-medium text-muted-foreground">竞品</th>
              <th
                v-for="g in GROUPS"
                :key="g.key"
                colspan="3"
                class="border-b px-2 py-2 text-center text-xs font-semibold text-foreground"
                :class="g.key === '综合' ? 'bg-muted' : ''"
              >
                <span class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">
                  {{ g.label }}
                  <Lock v-if="g.lock" class="h-2.5 w-2.5 text-amber-500" />
                </span>
              </th>
            </tr>
            <tr class="border-b bg-muted">
              <template v-for="g in GROUPS" :key="'h-' + g.key">
                <th class="px-2 py-2 text-center text-[10px] font-medium text-muted-foreground" :class="g.key === '综合' ? 'bg-muted' : ''">提及率</th>
                <th class="px-2 py-2 text-center text-[10px] font-medium text-muted-foreground" :class="g.key === '综合' ? 'bg-muted' : ''">Top3 推荐率</th>
                <th
                  class="border-r px-2 py-2 text-center text-[10px] font-medium text-muted-foreground"
                  :class="g.key === '综合' ? 'bg-muted' : ''"
                >首位提及率</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(c, i) in rows"
              :key="'p4-' + c.name + i"
              :class="c.is_target
                ? 'border-b bg-primary/[0.06] hover:bg-primary/10'
                : 'border-b hover:bg-muted/45'"
            >
              <td
                class="sticky left-0 z-[1] border-r px-4 py-3"
                :class="c.is_target ? 'bg-primary/[0.06]' : 'bg-card'"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
                    :style="{ backgroundColor: badgeColor(i + 1) }"
                  >{{ i + 1 }}</span>
                  <span :class="['max-w-[120px] truncate font-medium', c.is_target ? 'text-primary' : '']">{{ c.name }}</span>
                  <Badge v-if="c.is_target" class="shrink-0 border-transparent bg-primary/10 text-[10px] text-primary">本品牌</Badge>
                </div>
              </td>
              <template v-for="(g, gi) in GROUPS" :key="'c' + g.key + i">
                <template v-if="g.lock">
                  <td
                    v-for="n in 3"
                    :key="n"
                    class="px-2 py-3 text-center"
                    :class="n === 3 ? 'border-r' : ''"
                  >
                    <span class="inline-flex min-w-[62px] justify-center rounded-md px-2 py-1">
                      <Lock class="h-3 w-3 text-amber-500" />
                    </span>
                  </td>
                </template>
                <template v-else>
                  <td
                    v-for="(m, mi) in groupMetrics(c, g)"
                    :key="m.key"
                    class="px-2 py-3 text-center"
                    :class="[(g.key === '综合' ? 'bg-muted/40 ' : '') + (mi === 2 ? 'border-r' : '')]"
                  >
                    <span
                      class="inline-flex justify-center rounded-md px-2 py-1 text-xs font-semibold"
                      :class="[
                        m.value > 0 ? m.onCls : 'bg-muted text-muted-foreground/55',
                        m.key === 'top3' ? 'min-w-[72px]' : 'min-w-[62px]',
                      ]"
                    >{{ m.value }}%</span>
                  </td>
                </template>
              </template>
            </tr>
            <tr v-if="!rows.length">
              <td :colspan="1 + GROUPS.length * 3" class="px-4 py-10 text-center text-sm text-muted-foreground">
                暂无竞品数据（采集或解析尚未产出）
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 问题明细 -->
    <Card class="overflow-hidden">
      <div class="flex items-center gap-2.5 border-b px-5 py-4">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target class="h-4 w-4" />
        </div>
        <span class="text-sm font-semibold">问题明细</span>
      </div>
      <div class="space-y-3 p-5">
        <div v-for="q in queryRows" :key="q.id" class="overflow-hidden rounded-lg border">
          <button
            type="button"
            class="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            @click="toggleOpen(q.id)"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span class="truncate text-sm font-semibold" :title="q.name">{{ q.name }}</span>
              <Badge variant="secondary" class="shrink-0 text-[10px]">排名词</Badge>
            </div>
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground">本品牌</span>
                <Badge
                  :class="q.brandRank
                    ? 'border-transparent bg-primary/10 text-primary'
                    : 'bg-secondary text-muted-foreground'"
                >{{ q.brandRank ? '#' + q.brandRank : '未上榜' }}</Badge>
              </div>
              <div class="flex items-center gap-3 rounded-lg bg-muted px-3 py-1.5">
                <div v-for="e in q.engines" :key="e.key" class="min-w-[40px] text-center">
                  <div class="text-[10px] text-muted-foreground">{{ e.label }}</div>
                  <div :class="['text-xs font-semibold', e.rank ? 'text-foreground' : 'text-muted-foreground/50']">
                    {{ e.rank ? '#' + e.rank : '-' }}
                  </div>
                </div>
              </div>
              <span class="text-xs text-muted-foreground whitespace-nowrap">{{ q.competitorCount }} 个竞品</span>
              <ChevronDown
                class="h-4 w-4 text-muted-foreground transition-transform"
                :class="isOpen(q.id) ? 'rotate-180' : ''"
              />
            </div>
          </button>

          <div v-if="isOpen(q.id)" class="border-t px-4 py-3">
            <table v-if="q.rankings.length" class="w-full text-sm">
              <thead>
                <tr class="border-b text-xs text-muted-foreground">
                  <th class="px-3 py-2 text-left font-medium">排名</th>
                  <th class="px-3 py-2 text-left font-medium">品牌名称</th>
                  <th class="px-3 py-2 text-left font-medium">标识</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in q.rankings"
                  :key="q.id + '-' + r.rank + '-' + r.name"
                  :class="r.is_target
                    ? 'border-b bg-primary/[0.06]'
                    : 'border-b hover:bg-muted/40'"
                >
                  <td class="px-3 py-2.5">
                    <Badge :variant="r.rank === 1 ? 'default' : 'secondary'" class="font-mono text-[10px]">
                      #{{ r.rank }}
                    </Badge>
                  </td>
                  <td class="px-3 py-2.5">
                    <div class="flex min-w-0 items-center gap-2">
                      <span
                        :class="['truncate font-medium', r.is_target ? 'text-primary' : '']"
                        :title="r.name"
                      >{{ r.name }}</span>
                      <Badge v-if="r.is_target" class="shrink-0 border-transparent bg-primary/10 text-[10px] text-primary">本品牌</Badge>
                    </div>
                  </td>
                  <td class="px-3 py-2.5">
                    <span :class="r.is_target ? 'text-[10px] font-medium text-primary' : 'text-[10px] text-muted-foreground'">
                      {{ r.is_target ? '本品牌' : '竞品' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="py-2 text-sm text-muted-foreground">暂无该问题的竞品明细数据</div>
          </div>
        </div>
        <div v-if="!queryRows.length" class="py-6 text-center text-sm text-muted-foreground">暂无监控问题</div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ChartColumn,
  ChevronDown,
  Download,
  GitMerge,
  LayoutGrid,
  Lock,
  RefreshCw,
  Target,
} from 'lucide-vue-next'
import { Message } from '@/lib/toast'
import { monitorApi } from '@/api/modules/monitor'
import { lastNDays } from '@/utils/engines'
import BrandNameCorrectionModal from '@/components/BrandNameCorrectionModal.vue'
import DashDateInput from '@/components/DashDateInput.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent } from '@/components/ui'

const MAX_DAYS = 31
const today = lastNDays(1).end
const init = lastNDays(1)
const raw = ref<any>({})
const list = ref<any[]>([])
const queries = ref<any[]>([])
const rangeStart = ref(init.start)
const rangeEnd = ref(init.end)
const exporting = ref(false)
const loading = ref(false)
const correctionOpen = ref(false)

const rows = computed(() => list.value)
const canQuery = computed(() => {
  if (!rangeStart.value || !rangeEnd.value) return false
  if (rangeStart.value > rangeEnd.value) return false
  return dayDiff(rangeStart.value, rangeEnd.value) <= MAX_DAYS
})

function dayDiff(a: string, b: string) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}
function addDays(date: string, n: number) {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + n)
  return dt.toISOString().slice(0, 10)
}
function minDate(a: string, b: string) {
  return a < b ? a : b
}
function onStartChange() {
  if (rangeEnd.value && (rangeStart.value > rangeEnd.value || dayDiff(rangeStart.value, rangeEnd.value) > MAX_DAYS)) {
    rangeEnd.value = ''
  }
}
function onEndChange() {
  if (rangeStart.value && (rangeEnd.value < rangeStart.value || dayDiff(rangeStart.value, rangeEnd.value) > MAX_DAYS)) {
    rangeStart.value = ''
  }
}

async function reload(start?: string, end?: string) {
  loading.value = true
  try {
    const resp: any = await monitorApi.competitorInsight(start || undefined, end || undefined)
    raw.value = resp || {}
    list.value = resp?.competitor_compare_list || []
    queries.value = resp?.keyword_details || []
    if (!start && !end) {
      const s = resp?.start_date || resp?.date || ''
      const e = resp?.end_date || resp?.date || s
      if (s) rangeStart.value = s
      if (e) rangeEnd.value = e
    }
  } catch {
    /* 空态 */
  } finally {
    loading.value = false
  }
}

function onQuery() {
  if (!rangeStart.value || !rangeEnd.value) {
    Message.warning('请选择开始日期和结束日期')
    return
  }
  if (rangeStart.value > rangeEnd.value) {
    Message.warning('开始日期不能晚于结束日期')
    return
  }
  if (dayDiff(rangeStart.value, rangeEnd.value) > MAX_DAYS) {
    Message.warning('查询周期最多 31 天')
    return
  }
  void reload(rangeStart.value, rangeEnd.value)
}

async function onExport() {
  exporting.value = true
  try {
    const start = rangeEnd.value || rangeStart.value || undefined
    const { blob, filename } = await monitorApi.exportCompetitorXlsxBlob(start)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    Message.success('竞品数据已导出')
  } catch (e: any) {
    Message.error(e?.message || '导出失败，请稍后重试')
  } finally {
    exporting.value = false
  }
}

function onCorrectionSaved() {
  Message.success('品牌名归类已保存')
  void reload(rangeStart.value, rangeEnd.value)
}

/* 排名徽章：Blue 主题主色阶 */
const PALETTE = [
  'hsl(221.2 83.2% 53.3%)',
  'hsl(215 20% 45%)',
  'hsl(215 16% 58%)',
  'hsl(214 20% 65%)',
  'hsl(213 18% 70%)',
  'hsl(212 16% 74%)',
  'hsl(210 14% 78%)',
  'hsl(210 12% 82%)',
  'hsl(210 10% 85%)',
  'hsl(210 8% 88%)',
]
const badgeColor = (rank: number) => PALETTE[(rank - 1) % PALETTE.length]

const maxFreq = computed(() => Math.max(1, ...list.value.map((c: any) => c.frequency || 0)))
const barW = (v: number) => `${Math.max(0, Math.min(100, (v / maxFreq.value) * 100))}%`

function metricCls(kind: 'mention' | 'top3' | 'first', value: number) {
  if (!(value > 0)) return 'inline-flex min-w-[56px] justify-center rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold text-muted-foreground/55'
  if (kind === 'mention') return 'inline-flex min-w-[56px] justify-center rounded-md bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary'
  if (kind === 'top3') return 'inline-flex min-w-[56px] justify-center rounded-md bg-violet-50 px-2 py-1 font-mono text-xs font-semibold text-violet-700'
  return 'inline-flex min-w-[56px] justify-center rounded-md bg-amber-50 px-2 py-1 font-mono text-xs font-semibold text-amber-800'
}

const kpi = computed(() => {
  const top = list.value[0] || { name: '—', frequency: 0, mention_rate: 0, top3_mention_rate: 0 }
  return {
    total: raw.value.competitor_count ?? list.value.length,
    queries: raw.value.keyword_count ?? queries.value.length,
    top,
  }
})

const GROUPS = [
  { key: '综合', label: '综合', lock: false },
  { key: '豆包', label: '豆包', lock: false },
  { key: '文心一言', label: '文心一言', lock: false },
  { key: 'DeepSeek', label: 'DeepSeek', lock: false },
  { key: '通义千问', label: '通义千问', lock: false },
  { key: '元宝', label: '元宝', lock: false },
  { key: 'doubao_app', label: '豆包·APP', lock: true },
  { key: 'deepseek_app', label: 'DeepSeek·APP', lock: true },
  { key: 'qianwen_app', label: '通义千问·APP', lock: true },
]

function groupMetrics(c: any, g: { key: string; lock: boolean }) {
  const on = {
    mention: 'bg-primary/10 text-primary',
    top3: 'bg-violet-50 text-violet-700',
    first: 'bg-amber-50 text-amber-800',
  }
  if (g.key === '综合') {
    return [
      { key: 'mention', value: c.mention_rate ?? 0, onCls: on.mention },
      { key: 'top3', value: c.top3_mention_rate ?? 0, onCls: on.top3 },
      { key: 'first', value: c.first_mention_rate ?? 0, onCls: on.first },
    ]
  }
  const ps = c.platform_stats?.[g.key]
  return [
    { key: 'mention', value: ps?.mention_rate ?? 0, onCls: on.mention },
    { key: 'top3', value: ps?.top3_mention_rate ?? 0, onCls: on.top3 },
    { key: 'first', value: ps?.first_mention_rate ?? 0, onCls: on.first },
  ]
}

const ENG_ORDER = [
  { key: '豆包', label: '豆包' },
  { key: '文心一言', label: '文心一言' },
  { key: 'DeepSeek', label: 'DeepSeek' },
  { key: '通义千问', label: '通义千问' },
  { key: '元宝', label: '元宝' },
]

const queryRows = computed(() => {
  const details = raw.value.keyword_details || []
  return details.map((d: any) => {
    const pr = d.platform_ranks || {}
    const engines = ENG_ORDER.map((e) => {
      const v = pr[e.key]
      if (v == null || v === '' || v === '未上榜' || v === '-') {
        return { key: e.key, label: e.label, rank: null as number | null }
      }
      const n = Number(v)
      return { key: e.key, label: e.label, rank: Number.isFinite(n) ? n : null }
    })
    const rankings = (Array.isArray(d.rankings) ? d.rankings : [])
      .map((en: any) => ({
        name: String(en.name || ''),
        rank: Number(en.rank) || 0,
        score: en.score,
        is_target: !!en.is_target,
      }))
      .filter((en: any) => en.name && en.rank > 0)
      .sort((a: any, b: any) => a.rank - b.rank)
    const competitorCount = rankings.filter((en: any) => !en.is_target).length
    return {
      id: d.query_id,
      name: d.keyword,
      brandRank: d.target_rank ?? null,
      engines,
      competitorCount,
      rankings,
    }
  })
})

const openIds = ref<(string | number)[]>([])
const toggleOpen = (id: string | number) => {
  openIds.value = openIds.value.includes(id) ? openIds.value.filter((x) => x !== id) : [...openIds.value, id]
}
const isOpen = (id: string | number) => openIds.value.includes(id)

onMounted(() => {
  void reload()
})
</script>
