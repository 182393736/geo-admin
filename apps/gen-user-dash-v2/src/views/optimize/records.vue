<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader
      title="发稿记录"
      description="把稿件一键分发到 AI 收录的媒体平台 · 每次发布按媒体逐家生成订单，实时回传发布状态与收录链接 · 提交冻结积分，成功扣除、失败全额退回"
    >
      <template #actions>
        <Button size="sm" variant="outline" :disabled="!rows.length" @click="exportXlsx">
          <Download class="h-3.5 w-3.5" />
          导出
        </Button>
        <Button size="sm" variant="outline" @click="goTracking">
          <Eye class="h-3.5 w-3.5" />
          稿件追踪
        </Button>
        <Button size="sm" @click="goPublish">
          <Plus class="h-3.5 w-3.5" />
          发布新稿件
        </Button>
      </template>
    </PageHeader>

    <Card class="overflow-hidden">
      <!-- 筛选 -->
      <div class="flex flex-wrap items-center gap-3 border-b px-5 py-4">
        <div class="relative min-w-[240px] flex-1">
          <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="filters.q"
            placeholder="搜索稿件、媒体..."
            class="h-8 pl-8 text-xs"
            @keydown.enter="reload(1)"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">引用情况</span>
          <select
            v-model="filters.cite"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="reload(1)"
          >
            <option value="all">全部</option>
            <option value="cited">已引用</option>
            <option value="uncited">未引用</option>
          </select>
        </div>

        <div class="relative" ref="dateRoot">
          <button
            type="button"
            class="flex h-8 items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-xs font-medium transition-colors hover:bg-accent"
            :class="dateOpen ? 'border-primary ring-2 ring-ring' : ''"
            @click.stop="dateOpen = !dateOpen"
          >
            <Calendar class="h-3.5 w-3.5 text-muted-foreground" />
            <span>{{ dateLabel }}</span>
            <ChevronDown
              class="h-3.5 w-3.5 text-muted-foreground transition-transform"
              :class="dateOpen ? 'rotate-180' : ''"
            />
          </button>
          <div
            v-if="dateOpen"
            class="absolute right-0 top-full z-50 mt-2 flex w-[480px] max-w-[92vw] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
            @click.stop
          >
            <div class="w-[148px] shrink-0 border-r p-3">
              <div class="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">快速选择</div>
              <button
                v-for="p in datePresets"
                :key="p.key"
                type="button"
                class="block w-full rounded-md px-3 py-2 text-left text-xs transition-colors"
                :class="datePreset === p.key
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
                @click="applyDatePreset(p)"
              >{{ p.label }}</button>
            </div>
            <div class="flex flex-1 flex-col gap-3 p-4">
              <label class="block text-xs text-muted-foreground">
                开始日期
                <input
                  v-model="draftStart"
                  type="date"
                  class="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label class="block text-xs text-muted-foreground">
                结束日期
                <input
                  v-model="draftEnd"
                  type="date"
                  class="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <div class="mt-auto flex items-center justify-between border-t pt-3">
                <button type="button" class="text-xs text-muted-foreground hover:text-primary" @click="clearDate">清除</button>
                <div class="flex gap-2">
                  <Button size="sm" variant="ghost" @click="dateOpen = false">取消</Button>
                  <Button size="sm" @click="confirmDate">应用</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5">
        <div class="flex items-center gap-0 overflow-x-auto">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            class="inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors"
            :class="tab === t.key
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'"
            @click="setTab(t.key)"
          >
            {{ t.label }}
            <span
              class="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold"
              :class="tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
            >{{ counts[t.countKey] || 0 }}</span>
          </button>
        </div>
        <div class="flex items-center gap-2 py-2">
          <span class="text-xs text-muted-foreground">排序</span>
          <select
            v-model="filters.sort"
            class="h-7 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="reload(1)"
          >
            <option value="newest">最新提交</option>
            <option value="oldest">最早提交</option>
            <option value="cite-desc">引用最多</option>
            <option value="price-desc">积分最高</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full min-w-[960px] table-fixed text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th class="w-[28%] px-4 py-2.5 text-left font-medium">稿件</th>
              <th class="px-3 py-2.5 text-left font-medium">发稿媒体</th>
              <th class="px-3 py-2.5 text-left font-medium">状态</th>
              <th class="px-3 py-2.5 text-left font-medium">发稿链接</th>
              <th class="px-3 py-2.5 text-left font-medium">引用情况</th>
              <th class="px-3 py-2.5 text-left font-medium">积分</th>
              <th class="px-3 py-2.5 text-left font-medium">创建时间</th>
              <th class="w-[110px] px-3 py-2.5 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-12 text-center text-sm text-muted-foreground">加载中…</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="8" class="px-4 py-12 text-center text-sm text-muted-foreground">该状态下暂无发稿记录</td>
            </tr>
            <tr
              v-for="row in rows"
              :key="row.order_no || row.article_id || undefined"
              class="border-b last:border-0 hover:bg-muted/45"
            >
              <td class="px-4 py-3">
                <div class="text-sm font-medium leading-5">{{ row.article_title || '未命名稿件' }}</div>
                <div class="mt-0.5 text-[11.5px] text-muted-foreground">
                  {{ row.order_no ? `订单 ${row.order_no}` : `草稿 ${row.article_id}` }}
                </div>
              </td>
              <td class="px-3 py-3 text-sm">{{ row.media_name || '—' }}</td>
              <td class="px-3 py-3">
                <Badge :class="statusBadgeClass(row.status)">{{ statusLabel(row.status) }}</Badge>
              </td>
              <td class="px-3 py-3">
                <a
                  v-if="row.published_url"
                  class="break-all text-xs text-primary hover:underline"
                  :href="row.published_url"
                  target="_blank"
                  rel="noopener"
                >{{ row.published_url }}</a>
                <span v-else-if="row.status === 'fail' && row.fail_reason" class="text-xs text-destructive">失败：{{ row.fail_reason }}</span>
                <span v-else class="text-xs text-muted-foreground/50">—</span>
              </td>
              <td class="px-3 py-3">
                <span
                  v-if="row.status === 'draft' || row.status === 'fail' || isPublishing(row.status)"
                  class="text-xs text-muted-foreground/50"
                >—</span>
                <button
                  v-else-if="(row.cite_count || 0) > 0"
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline"
                  @click="showCites(row)"
                >已被引 {{ row.cite_count }} 次</button>
                <span v-else class="text-xs text-muted-foreground">暂无引用</span>
              </td>
              <td class="px-3 py-3">
                <span v-if="row.status === 'draft'" class="text-xs text-muted-foreground/50">—</span>
                <span v-else-if="row.status === 'fail'" class="text-xs font-medium text-emerald-600">已解冻 ✦{{ row.sell_price || 0 }}</span>
                <span v-else-if="isPublishing(row.status)" class="text-xs font-medium text-primary">冻结中 ✦{{ row.sell_price || 0 }}</span>
                <span v-else class="text-xs font-semibold text-orange-600">✦ {{ row.sell_price || 0 }}</span>
              </td>
              <td class="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">{{ formatTime(row.created_at) }}</td>
              <td class="whitespace-nowrap px-3 py-3 text-right">
                <Button
                  v-if="row.status === 'draft'"
                  size="sm"
                  variant="ghost"
                  class="h-7 px-2 text-xs text-primary"
                  @click="editDraft(row)"
                >继续编辑</Button>
                <template v-else>
                  <Button size="sm" variant="ghost" class="h-7 px-2 text-xs text-primary" @click="openPreview(row)">预览</Button>
                  <Button
                    v-if="row.status === 'fail'"
                    size="sm"
                    variant="ghost"
                    class="h-7 px-2 text-xs text-destructive"
                    :disabled="retrying === row.order_no"
                    @click="retryOrder(row)"
                  >{{ retrying === row.order_no ? '重试中…' : '重试' }}</Button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
        <span class="text-xs text-muted-foreground">显示 {{ rangeLabel }} · 共 {{ total }} 条</span>
        <div class="flex items-center gap-1">
          <Button size="sm" variant="outline" :disabled="page <= 1" @click="reload(page - 1)">‹ 上一页</Button>
          <Button
            v-for="p in pageButtons"
            :key="p"
            size="sm"
            :variant="p === page ? 'default' : 'outline'"
            class="min-w-8"
            @click="reload(p)"
          >{{ p }}</Button>
          <Button size="sm" variant="outline" :disabled="page >= totalPages" @click="reload(page + 1)">下一页 ›</Button>
        </div>
      </div>
    </Card>

    <!-- 预览 -->
    <Teleport to="body">
      <div
        v-if="previewOpen"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="previewOpen = false"
      >
        <Card class="w-full max-w-lg overflow-hidden shadow-lg">
          <div class="flex items-start justify-between border-b px-5 py-4">
            <div>
              <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText class="h-4 w-4" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold">订单预览</h3>
                  <p class="mt-0.5 font-mono text-[11px] text-muted-foreground">{{ previewRow?.order_no || '' }}</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="previewOpen = false">
              <X class="h-4 w-4" />
            </Button>
          </div>
          <CardContent v-if="previewRow" class="space-y-4 p-5">
            <div class="text-base font-semibold leading-snug">{{ previewRow.article_title }}</div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <div class="mb-1 text-[11px] text-muted-foreground">发稿媒体</div>
                <div class="text-sm">{{ previewRow.media_name || '—' }}</div>
              </div>
              <div>
                <div class="mb-1 text-[11px] text-muted-foreground">状态</div>
                <Badge :class="statusBadgeClass(previewRow.status)">{{ statusLabel(previewRow.status) }}</Badge>
              </div>
              <div>
                <div class="mb-1 text-[11px] text-muted-foreground">积分</div>
                <div class="text-sm">✦ {{ previewRow.sell_price || 0 }}</div>
              </div>
              <div>
                <div class="mb-1 text-[11px] text-muted-foreground">创建时间</div>
                <div class="text-sm">{{ formatTime(previewRow.created_at) }}</div>
              </div>
              <div class="col-span-2">
                <div class="mb-1 text-[11px] text-muted-foreground">发稿链接</div>
                <a
                  v-if="previewRow.published_url"
                  :href="previewRow.published_url"
                  target="_blank"
                  rel="noopener"
                  class="break-all text-sm text-primary hover:underline"
                >{{ previewRow.published_url }}</a>
                <span v-else-if="previewRow.fail_reason" class="text-sm text-destructive">{{ previewRow.fail_reason }}</span>
                <span v-else class="text-sm text-muted-foreground">—</span>
              </div>
              <div v-if="previewRow.article_note" class="col-span-2">
                <div class="mb-1 text-[11px] text-muted-foreground">发稿备注</div>
                <div class="text-sm">{{ previewRow.article_note }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Teleport>

    <!-- 引用明细 -->
    <Teleport to="body">
      <div
        v-if="citesOpen"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="citesOpen = false"
      >
        <Card class="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden shadow-lg">
          <div class="flex items-start justify-between border-b px-5 py-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Quote class="h-4 w-4" />
              </div>
              <div>
                <h3 class="text-sm font-semibold">引用明细</h3>
                <p class="mt-0.5 text-xs text-muted-foreground">{{ citesRow?.article_title || citesRow?.order_no }}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="citesOpen = false">
              <X class="h-4 w-4" />
            </Button>
          </div>
          <div class="overflow-auto p-5">
            <div v-if="citesLoading" class="py-10 text-center text-sm text-muted-foreground">加载中…</div>
            <div v-else-if="!citesList.length" class="py-10 text-center text-sm text-muted-foreground">
              暂无引用明细 · 共 {{ citesCount }} 次 · 详情见稿件追踪
            </div>
            <table v-else class="w-full text-sm">
              <thead>
                <tr class="border-b bg-muted text-xs text-muted-foreground">
                  <th class="px-3 py-2 text-left font-medium">日期</th>
                  <th class="px-3 py-2 text-left font-medium">引擎</th>
                  <th class="px-3 py-2 text-left font-medium">问题</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(c, i) in citesList" :key="i" class="border-b last:border-0">
                  <td class="px-3 py-2 text-xs">{{ c.date || c.created_at || '—' }}</td>
                  <td class="px-3 py-2 text-xs">{{ c.platform_label || c.platform || '—' }}</td>
                  <td class="px-3 py-2 text-xs">{{ c.query_text || c.query_id || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Download, Eye, Plus, Search, Calendar, ChevronDown, FileText, X, Quote } from 'lucide-vue-next'
import { publishApi } from '@/api/modules/report'
import { downloadAoaSheets } from '@/utils/xlsxExport'
import { toast } from '@/lib/toast'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent, Input } from '@/components/ui'

type OrderRow = {
  order_no?: string | null
  article_id?: string | null
  article_title?: string
  article_note?: string
  media_name?: string
  status: string
  published_url?: string | null
  fail_reason?: string | null
  sell_price?: number
  cite_count?: number
  created_at?: string | Date
  row_type?: string
}

const router = useRouter()
const PAGE_SIZE = 20

const loading = ref(false)
const rows = ref<OrderRow[]>([])
const total = ref(0)
const page = ref(1)
const retrying = ref('')
const tab = ref<'draft' | 'all' | 'publishing' | 'ok' | 'fail'>('all')
const counts = reactive({ draft: 0, all: 0, publishing: 0, ok: 0, fail: 0 })
const filters = reactive({
  q: '',
  cite: 'all',
  sort: 'newest',
  start: '',
  end: '',
})

const dateOpen = ref(false)
const dateRoot = ref<HTMLElement | null>(null)
const datePreset = ref('all')
const draftStart = ref('')
const draftEnd = ref('')

const previewOpen = ref(false)
const previewRow = ref<OrderRow | null>(null)

const citesOpen = ref(false)
const citesLoading = ref(false)
const citesRow = ref<OrderRow | null>(null)
const citesList = ref<any[]>([])
const citesCount = ref(0)

const tabs = [
  { key: 'draft' as const, label: '草稿', countKey: 'draft' as const },
  { key: 'all' as const, label: '全部', countKey: 'all' as const },
  { key: 'publishing' as const, label: '发布中', countKey: 'publishing' as const },
  { key: 'ok' as const, label: '已发布', countKey: 'ok' as const },
  { key: 'fail' as const, label: '发布失败', countKey: 'fail' as const },
]

const datePresets = [
  { key: 'today', label: '今日', days: 0 },
  { key: '7', label: '近 7 天', days: 7 },
  { key: '30', label: '近 30 天', days: 30 },
  { key: '90', label: '近 90 天', days: 90 },
  { key: '180', label: '近 180 天', days: 180 },
  { key: 'month', label: '本月', days: -1 },
  { key: 'lastMonth', label: '上月', days: -2 },
]

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const rangeLabel = computed(() => {
  if (!total.value) return '0-0'
  const from = (page.value - 1) * PAGE_SIZE + 1
  const to = Math.min(page.value * PAGE_SIZE, total.value)
  return `${from}-${to}`
})
const pageButtons = computed(() => {
  const n = totalPages.value
  const cur = page.value
  if (n <= 5) return Array.from({ length: n }, (_, i) => i + 1)
  const set = new Set([1, n, cur, cur - 1, cur + 1].filter((p) => p >= 1 && p <= n))
  return [...set].sort((a, b) => a - b)
})
const dateLabel = computed(() => {
  if (!filters.start && !filters.end) return '全部时间'
  if (filters.start && filters.end) return `${filters.start} ~ ${filters.end}`
  return filters.start || filters.end
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function formatTime(v?: string | Date) {
  if (!v) return '—'
  const d = new Date(v)
  if (!Number.isFinite(d.getTime())) return '—'
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function isPublishing(s: string) {
  return s === 'pending' || s === 'submitted'
}
function statusLabel(s: string) {
  if (s === 'draft') return '草稿'
  if (s === 'ok') return '已发布'
  if (s === 'fail') return '发布失败'
  if (isPublishing(s)) return '发布中'
  return s
}
function statusBadgeClass(s: string) {
  if (s === 'ok') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (s === 'fail') return 'border-red-200 bg-red-50 text-red-700'
  if (s === 'draft') return 'border-transparent bg-muted text-muted-foreground'
  return 'border-transparent bg-primary/10 text-primary'
}

function setTab(k: typeof tab.value) {
  tab.value = k
  reload(1)
}

function applyDatePreset(p: { key: string; days: number }) {
  datePreset.value = p.key
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (p.days === 0) {
    draftStart.value = fmtDate(today)
    draftEnd.value = fmtDate(today)
  } else if (p.days > 0) {
    const start = new Date(today)
    start.setDate(start.getDate() - (p.days - 1))
    draftStart.value = fmtDate(start)
    draftEnd.value = fmtDate(today)
  } else if (p.days === -1) {
    draftStart.value = fmtDate(new Date(today.getFullYear(), today.getMonth(), 1))
    draftEnd.value = fmtDate(today)
  } else if (p.days === -2) {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    draftStart.value = fmtDate(start)
    draftEnd.value = fmtDate(end)
  }
}
function clearDate() {
  datePreset.value = 'all'
  draftStart.value = ''
  draftEnd.value = ''
  filters.start = ''
  filters.end = ''
  dateOpen.value = false
  reload(1)
}
function confirmDate() {
  filters.start = draftStart.value
  filters.end = draftEnd.value
  if (!filters.start && !filters.end) datePreset.value = 'all'
  dateOpen.value = false
  reload(1)
}

async function reload(pageNo = page.value) {
  loading.value = true
  page.value = pageNo
  try {
    const resp: any = await publishApi.orders({
      page: pageNo,
      size: PAGE_SIZE,
      status: tab.value,
      q: filters.q.trim() || undefined,
      cite: filters.cite,
      sort: filters.sort,
      start_date: filters.start || undefined,
      end_date: filters.end || undefined,
    })
    rows.value = resp?.list || []
    total.value = Number(resp?.total || 0)
    const c = resp?.counts || {}
    counts.draft = Number(c.draft || 0)
    counts.all = Number(c.all || 0)
    counts.publishing = Number(c.publishing || 0)
    counts.ok = Number(c.ok || 0)
    counts.fail = Number(c.fail || 0)
  } catch (e: any) {
    rows.value = []
    toast.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function goPublish() {
  router.push('/dashboard/media-library/publish')
}
function goTracking() {
  router.push('/dashboard/media-library/tracking')
}
function editDraft(row: OrderRow) {
  router.push({
    path: '/dashboard/media-library/publish',
    query: row.article_id ? { article_id: row.article_id } : {},
  })
}
function openPreview(row: OrderRow) {
  previewRow.value = row
  previewOpen.value = true
}
async function showCites(row: OrderRow) {
  if (!row.order_no) return
  citesRow.value = row
  citesOpen.value = true
  citesLoading.value = true
  citesList.value = []
  citesCount.value = row.cite_count || 0
  try {
    const resp: any = await publishApi.orderCites(row.order_no)
    citesCount.value = Number(resp?.cite_count ?? row.cite_count ?? 0)
    citesList.value = resp?.list || resp?.cites || []
    if (!citesList.value.length) {
      toast.info(`引用 ${citesCount.value} 次`, '明细将在稿件追踪中持续更新')
    }
  } catch (e: any) {
    toast.error(e?.message || '加载引用失败')
    citesOpen.value = false
  } finally {
    citesLoading.value = false
  }
}
async function retryOrder(row: OrderRow) {
  if (!row.order_no) return
  retrying.value = row.order_no
  try {
    await publishApi.republish(row.order_no)
    toast.success('已重新提交')
    await reload(page.value)
  } catch (e: any) {
    toast.error(e?.message || '重试失败')
  } finally {
    retrying.value = ''
  }
}
function exportXlsx() {
  const header = ['订单号', '稿件', '发稿媒体', '状态', '发稿链接', '引用次数', '积分', '创建时间', '失败原因']
  const data = rows.value.map((r) => [
    r.order_no || '',
    r.article_title || '',
    r.media_name || '',
    statusLabel(r.status),
    r.published_url || '',
    r.cite_count || 0,
    r.sell_price || 0,
    formatTime(r.created_at),
    r.fail_reason || '',
  ])
  downloadAoaSheets(
    [{
      name: '发稿记录',
      rows: [header, ...data],
      cols: [
        { wch: 22 }, { wch: 36 }, { wch: 14 }, { wch: 10 }, { wch: 40 },
        { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 24 },
      ],
    }],
    `发稿记录_${fmtDate(new Date())}.xlsx`,
  )
}

function onDocClick(e: MouseEvent) {
  if (dateRoot.value && !dateRoot.value.contains(e.target as Node)) dateOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  reload(1)
})
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
