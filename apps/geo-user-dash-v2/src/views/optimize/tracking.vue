<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader
      title="稿件追踪"
      description="已上线文章统一台账（手动登记 + 发稿自动同步），持续追踪每一篇在 AI 回答中的被引表现；创作中稿件请见「稿件库」"
    >
      <template #actions>
        <Button size="sm" variant="outline" @click="goRecords">
          <FileText class="h-3.5 w-3.5" />
          发稿记录
        </Button>
        <Button size="sm" variant="outline" @click="goNewArticle">
          <PenLine class="h-3.5 w-3.5" />
          新建稿件
        </Button>
        <Button size="sm" variant="outline" :disabled="!rows.length" @click="exportXlsx">
          <Download class="h-3.5 w-3.5" />
          导出
        </Button>
        <Button size="sm" @click="importOpen = true">
          <Plus class="h-3.5 w-3.5" />
          导入自有文章
        </Button>
      </template>
    </PageHeader>

    <!-- 日期 + 统计 -->
    <Card>
      <CardContent class="space-y-4 p-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium">引用统计周期</span>
          <input
            v-model="rangeStart"
            type="date"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="onDateChange"
          />
          <span class="text-xs text-muted-foreground">至</span>
          <input
            v-model="rangeEnd"
            type="date"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="onDateChange"
          />
          <span class="text-[11px] leading-relaxed text-muted-foreground">
            （默认最近 30 天，最长 31 天；仅按引用发生时间统计，不影响已导入稿件展示）
          </span>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-lg border bg-muted/30 p-4">
            <div class="mb-1.5 text-xs text-muted-foreground">全部已导入稿件</div>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold tabular-nums">{{ stats.imported }}</span>
              <span class="text-sm text-muted-foreground">篇</span>
            </div>
          </div>
          <div class="rounded-lg border bg-muted/30 p-4">
            <div class="mb-1.5 text-xs text-muted-foreground">周期内被 AI 引用文章数</div>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold tabular-nums">{{ stats.period_cited_articles }}</span>
              <span class="text-sm text-muted-foreground">
                篇 · <span class="font-semibold text-primary">{{ stats.cite_rate }}%</span>
              </span>
            </div>
          </div>
          <div class="rounded-lg border bg-muted/30 p-4">
            <div class="mb-1.5 text-xs text-muted-foreground">周期内被引次数</div>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold tabular-nums">{{ stats.period_cite_times }}</span>
              <span class="text-sm text-muted-foreground">次</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="overflow-hidden">
      <div class="flex flex-wrap items-end gap-3 border-b px-5 py-4">
        <div class="flex flex-col gap-1">
          <span class="text-[11px] text-muted-foreground">关键词类型</span>
          <select
            v-model="filters.query_type"
            class="h-8 min-w-[100px] rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="reload(1)"
          >
            <option value="">全部</option>
            <option value="industry">排行词</option>
            <option value="brand">口碑词</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[11px] text-muted-foreground">AI 引擎</span>
          <select
            v-model="filters.engine"
            class="h-8 min-w-[100px] rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="reload(1)"
          >
            <option value="">全部</option>
            <option value="doubao">豆包</option>
            <option value="wenxin">文心一言</option>
            <option value="deepseek">DeepSeek</option>
            <option value="qwen">通义千问</option>
            <option value="yuanbao">元宝</option>
          </select>
        </div>
        <div class="flex min-w-[160px] flex-col gap-1">
          <span class="text-[11px] text-muted-foreground">监控问题</span>
          <DashQuerySelect
            v-model="filters.query_id"
            v-model:label="queryLabel"
            :options="queryOptions"
            btn-class="!h-8 !min-w-[160px] !max-w-[240px] !text-xs !shadow-none"
            @change="reload(1)"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[11px] text-muted-foreground">来源</span>
          <select
            v-model="filters.source_kind"
            class="h-8 min-w-[100px] rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="reload(1)"
          >
            <option value="">全部</option>
            <option value="own">手动登记</option>
            <option value="publish">发稿同步</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[11px] text-muted-foreground">内容类型</span>
          <select
            v-model="filters.content_type"
            class="h-8 min-w-[100px] rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="reload(1)"
          >
            <option value="">全部</option>
            <option value="graphic">图文</option>
            <option value="video">视频</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[11px] text-muted-foreground">引用状态</span>
          <select
            v-model="filters.cite"
            class="h-8 min-w-[100px] rounded-lg border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
            @change="reload(1)"
          >
            <option value="all">全部</option>
            <option value="cited">已引用</option>
            <option value="uncited">未引用</option>
          </select>
        </div>
        <div class="relative ml-auto min-w-[200px]">
          <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="filters.q"
            placeholder="搜索标题 / URL…"
            class="h-8 pl-8 text-xs"
            @keydown.enter="reload(1)"
          />
        </div>
      </div>

      <div class="flex items-center gap-1.5 border-b px-5 py-2">
        <button
          type="button"
          class="h-7 rounded-md border px-2.5 text-xs font-medium transition-colors"
          :class="sortBy === 'registered_at'
            ? 'border-border bg-muted text-foreground'
            : 'border-transparent text-muted-foreground hover:bg-muted'"
          @click="toggleSort('registered_at')"
        >
          登记时间 {{ sortBy === 'registered_at' ? (sortAsc ? '↑' : '↓') : '' }}
        </button>
        <button
          type="button"
          class="h-7 rounded-md border px-2.5 text-xs font-medium transition-colors"
          :class="sortBy === 'cite'
            ? 'border-border bg-muted text-foreground'
            : 'border-transparent text-muted-foreground hover:bg-muted'"
          @click="toggleSort('cite')"
        >
          被引 {{ sortBy === 'cite' ? (sortAsc ? '↑' : '↓') : '↕' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[1000px] table-fixed text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th class="w-[32%] px-4 py-2.5 text-left font-medium">文章</th>
              <th class="px-3 py-2.5 text-left font-medium">来源</th>
              <th class="px-3 py-2.5 text-left font-medium">类型</th>
              <th class="px-3 py-2.5 text-left font-medium">登记时间</th>
              <th class="px-3 py-2.5 text-left font-medium">被引</th>
              <th class="px-3 py-2.5 text-left font-medium">收录引擎</th>
              <th class="px-3 py-2.5 text-left font-medium">引用状态</th>
              <th class="px-3 py-2.5 text-left font-medium">引用明细</th>
              <th class="w-[70px] px-3 py-2.5 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="px-4 py-12 text-center text-sm text-muted-foreground">加载中…</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="9" class="px-4 py-12 text-center text-sm text-muted-foreground">
                该筛选下暂无文章 · 点击右上角「导入自有文章」开始登记
              </td>
            </tr>
            <tr
              v-for="row in rows"
              :key="row.article_id"
              class="border-b last:border-0 hover:bg-muted/45"
            >
              <td class="min-w-0 px-4 py-3">
                <div
                  class="line-clamp-2 text-sm font-semibold leading-snug"
                  :title="row.title || '未命名文章'"
                >{{ row.title || '未命名文章' }}</div>
                <a
                  v-if="row.url"
                  class="mt-1 block truncate text-[11.5px] text-primary hover:underline"
                  :href="row.url"
                  target="_blank"
                  rel="noopener"
                >{{ row.url }}</a>
              </td>
              <td class="px-3 py-3">
                <Badge
                  :class="row.source_kind === 'publish'
                    ? 'border-transparent bg-emerald-50 text-emerald-700'
                    : 'border-transparent bg-primary/10 text-primary'"
                >
                  {{ row.source_label || (row.source_kind === 'publish' ? '发稿' : '登记') }}
                </Badge>
              </td>
              <td class="px-3 py-3 text-sm">{{ row.content_label || (row.content_type === 'video' ? '视频' : '图文') }}</td>
              <td class="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">{{ row.registered_at || '—' }}</td>
              <td class="px-3 py-3">
                <span
                  class="text-sm"
                  :class="row.cite_count ? 'font-bold' : 'font-medium text-muted-foreground'"
                >{{ row.cite_count || 0 }} 次</span>
              </td>
              <td class="px-3 py-3">
                <span
                  class="text-sm"
                  :class="row.engine_count ? 'font-semibold' : 'font-medium text-muted-foreground'"
                >{{ row.engine_count || 0 }}/5</span>
              </td>
              <td class="px-3 py-3">
                <Badge
                  :class="row.cited
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-transparent bg-muted text-muted-foreground'"
                >
                  {{ row.cited ? '已引用' : '未引用' }}
                </Badge>
              </td>
              <td class="px-3 py-3">
                <button
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline"
                  @click="openCites(row)"
                >查看明细</button>
              </td>
              <td class="px-3 py-3 text-right">
                <a
                  v-if="row.url"
                  class="text-xs font-semibold text-muted-foreground hover:text-primary"
                  :href="row.url"
                  target="_blank"
                  rel="noopener"
                >打开</a>
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

    <!-- 导入弹层 -->
    <Teleport to="body">
      <div
        v-if="importOpen"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="importOpen = false"
      >
        <Card class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden shadow-lg">
          <div class="flex items-start justify-between border-b px-5 py-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload class="h-4 w-4" />
              </div>
              <div>
                <h3 class="text-sm font-semibold">导入自有文章</h3>
                <p class="mt-0.5 text-xs text-muted-foreground">登记后系统持续监控它在 AI 回答中的被引情况，并计入深度分析</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8" :disabled="importing" @click="importOpen = false">
              <X class="h-4 w-4" />
            </Button>
          </div>

          <div class="flex-1 overflow-auto px-5 py-4">
            <div class="mb-2 flex items-baseline justify-between gap-2">
              <span class="text-sm font-medium">文章标题与链接</span>
              <span class="text-[11px] text-muted-foreground">支持粘贴多行（标题 Tab 链接，或每行一条链接）</span>
            </div>
            <div class="overflow-hidden rounded-lg border">
              <div class="grid grid-cols-[88px_1fr_1.2fr_36px] gap-2 bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>类型</span><span>标题</span><span>链接</span><span />
              </div>
              <div v-for="(row, idx) in importRows" :key="idx" class="grid grid-cols-[88px_1fr_1.2fr_36px] items-center gap-2 border-t px-2 py-1.5">
                <select
                  v-model="row.type"
                  class="h-8 rounded-md border border-input bg-background px-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="graphic">图文</option>
                  <option value="video">视频</option>
                </select>
                <Input
                  v-model="row.title"
                  placeholder="文章标题"
                  class="h-8 text-xs"
                  @paste="onPasteRows($event, idx)"
                />
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
            <button
              type="button"
              class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              @click="importRows.push({ type: 'graphic', title: '', url: '' })"
            >
              <Plus class="h-3.5 w-3.5" />
              添加一行
            </button>

            <div class="mb-2 mt-5 flex items-center justify-between">
              <span class="text-sm font-medium">或上传 Excel 批量导入</span>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                @click="downloadTemplate"
              >
                <Download class="h-3 w-3" />
                下载导入模板
              </button>
            </div>
            <label class="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5">
              <FileUp class="h-5 w-5 shrink-0 text-primary" />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-primary">点击上传 Excel</div>
                <div class="text-[11px] text-muted-foreground">需包含「内容类型、标题、URL/链接」列 · 支持 .xlsx / .xls</div>
              </div>
              <span class="shrink-0 text-xs text-muted-foreground">{{ excelName || '未选择' }}</span>
              <input type="file" accept=".xlsx,.xls" class="hidden" @change="onExcelPick" />
            </label>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
            <p class="max-w-sm text-xs leading-relaxed text-muted-foreground">
              自有文章导入后计入「自有文章覆盖」与被引用监控，可衡量 GEO 投放效果。
            </p>
            <div class="ml-auto flex gap-2">
              <Button variant="ghost" :disabled="importing" @click="importOpen = false">取消</Button>
              <Button :disabled="importing" @click="submitImport">
                {{ importing ? '导入中…' : '导入并开始监控' }}
              </Button>
            </div>
          </div>
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
        <Card class="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden shadow-lg">
          <div class="flex items-start justify-between border-b px-5 py-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Quote class="h-4 w-4" />
              </div>
              <div class="min-w-0">
                <h3 class="text-sm font-semibold">引用明细</h3>
                <p class="mt-0.5 truncate text-xs text-muted-foreground" :title="citesRow?.title || ''">{{ citesRow?.title }}</p>
                <p v-if="citesList.length" class="mt-0.5 text-[11px] text-muted-foreground">共 {{ citesList.length }} 条引用记录</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="citesOpen = false">
              <X class="h-4 w-4" />
            </Button>
          </div>
          <div class="overflow-auto p-5">
            <div v-if="citesLoading" class="py-10 text-center text-sm text-muted-foreground">加载中…</div>
            <div v-else-if="!citesList.length" class="py-10 text-center text-sm text-muted-foreground">周期内暂无引用记录</div>
            <table v-else class="w-full min-w-[720px] text-sm">
              <thead>
                <tr class="border-b bg-muted text-xs text-muted-foreground">
                  <th class="px-3 py-2 text-left font-medium">日期</th>
                  <th class="px-3 py-2 text-left font-medium">引擎</th>
                  <th class="px-3 py-2 text-left font-medium">监控问题</th>
                  <th class="px-3 py-2 text-left font-medium">发布媒体</th>
                  <th class="px-3 py-2 text-left font-medium">类型</th>
                  <th class="px-3 py-2 text-left font-medium">提及对象</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(c, i) in citesList" :key="i" class="border-b last:border-0">
                  <td class="whitespace-nowrap px-3 py-2 text-xs">{{ c.date || c.cited_at }}</td>
                  <td class="whitespace-nowrap px-3 py-2 text-xs">{{ c.platform_label || c.platform }}</td>
                  <td class="max-w-[240px] px-3 py-2 text-xs" :title="c.query_text || c.question || ''">
                    <span class="line-clamp-2">{{ c.query_text || c.question || '—' }}</span>
                  </td>
                  <td class="max-w-[140px] truncate px-3 py-2 text-xs" :title="c.media || c.media_name || ''">
                    {{ c.media || c.media_name || '—' }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-2 text-xs">
                    {{ c.query_type === 'brand' ? '口碑词' : c.query_type === 'industry' ? '排行词' : '—' }}
                  </td>
                  <td class="max-w-[120px] truncate px-3 py-2 text-xs text-muted-foreground" :title="c.mentioned_entity || ''">
                    {{ c.mentioned_entity || '—' }}
                  </td>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import {
  FileText, PenLine, Download, Plus, Search, Upload, X, Trash2, FileUp, Quote,
} from 'lucide-vue-next'
import { publishApi } from '@/api/modules/report'
import { monitorApi } from '@/api/modules/monitor'
import DashQuerySelect from '@/components/DashQuerySelect.vue'
import { downloadAoaSheets } from '@/utils/xlsxExport'
import { toast } from '@/lib/toast'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent, Input } from '@/components/ui'

type Row = {
  article_id: string
  title?: string
  url?: string | null
  source_kind?: string
  source_label?: string
  content_type?: string
  content_label?: string
  registered_at?: string | null
  cite_count?: number
  engine_count?: number
  cited?: boolean
}

const router = useRouter()
const PAGE_SIZE = 20

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function defaultRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 29)
  return { start: fmtDate(start), end: fmtDate(end) }
}

const initRange = defaultRange()
const rangeStart = ref(initRange.start)
const rangeEnd = ref(initRange.end)
const loading = ref(false)
const rows = ref<Row[]>([])
const total = ref(0)
const page = ref(1)
const sortBy = ref<'registered_at' | 'cite'>('registered_at')
const sortAsc = ref(false)
const stats = reactive({
  imported: 0,
  period_cited_articles: 0,
  period_cite_times: 0,
  cite_rate: 0,
})
const filters = reactive({
  query_type: '',
  engine: '',
  query_id: 0 as string | number,
  source_kind: '',
  content_type: '',
  cite: 'all',
  q: '',
})
const queryOptions = ref<{ value: string | number; label: string }[]>([])
const queryLabel = ref('全部问题')

const importOpen = ref(false)
const importing = ref(false)
const importRows = ref([{ type: 'graphic', title: '', url: '' }])
const excelName = ref('')

const citesOpen = ref(false)
const citesLoading = ref(false)
const citesRow = ref<Row | null>(null)
const citesList = ref<any[]>([])

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

function clampRange() {
  const s = new Date(rangeStart.value)
  const e = new Date(rangeEnd.value)
  if (!Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime())) return
  if (e < s) {
    rangeEnd.value = rangeStart.value
    return
  }
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000) + 1
  if (diff > 31) {
    const capped = new Date(s)
    capped.setDate(s.getDate() + 30)
    rangeEnd.value = fmtDate(capped)
    toast.info('统计周期最长 31 天')
  }
}

function onDateChange() {
  clampRange()
  reload(1)
}

function toggleSort(key: 'registered_at' | 'cite') {
  if (sortBy.value === key) sortAsc.value = !sortAsc.value
  else {
    sortBy.value = key
    sortAsc.value = false
  }
  reload(1)
}

async function loadQueries() {
  try {
    const qt = filters.query_type === 'brand' || filters.query_type === 'industry'
      ? filters.query_type
      : 'all'
    const resp: any = await monitorApi.queryList(qt as any)
    const list = resp?.list || resp || []
    queryOptions.value = (Array.isArray(list) ? list : [])
      .map((q: any) => ({
        value: q.id ?? q.query_id,
        label: q.query || q.query_text || q.text || q.name || `问题 ${q.id ?? q.query_id}`,
      }))
      .filter((o: { value: any }) => o.value != null && o.value !== '')
  } catch {
    queryOptions.value = []
  }
}

async function reload(pageNo = page.value) {
  loading.value = true
  page.value = pageNo
  try {
    const resp: any = await publishApi.articleLibrary({
      page: pageNo,
      page_size: PAGE_SIZE,
      start_date: rangeStart.value,
      end_date: rangeEnd.value,
      query_type: filters.query_type || undefined,
      engine: filters.engine || undefined,
      query_id: filters.query_id && filters.query_id !== 0 ? filters.query_id : undefined,
      source_kind: filters.source_kind || undefined,
      content_type: filters.content_type || undefined,
      cite: filters.cite,
      q: filters.q.trim() || undefined,
      sort_by: sortBy.value === 'cite' ? 'cite' : 'registered_at',
      sort_order: sortAsc.value ? 'asc' : 'desc',
    })
    rows.value = resp?.list || []
    total.value = Number(resp?.total || 0)
    const s = resp?.stats || {}
    stats.imported = Number(s.imported || 0)
    stats.period_cited_articles = Number(s.period_cited_articles || 0)
    stats.period_cite_times = Number(s.period_cite_times || 0)
    stats.cite_rate = Number(s.cite_rate || 0)
  } catch (e: any) {
    rows.value = []
    toast.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function goRecords() {
  router.push('/dashboard/media-library/records')
}
function goNewArticle() {
  router.push('/dashboard/new-agent/articles')
}

function onPasteRows(e: ClipboardEvent, idx: number) {
  const text = e.clipboardData?.getData('text') || ''
  if (!text.includes('\n') && !text.includes('\t')) return
  e.preventDefault()
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const parsed = lines.map((line) => {
    const parts = line.split(/\t+/)
    if (parts.length >= 2) return { type: 'graphic', title: parts[0], url: parts[1] }
    return { type: 'graphic', title: '', url: line }
  })
  importRows.value.splice(idx, 1, ...parsed)
}

function downloadTemplate() {
  downloadAoaSheets(
    [{
      name: '导入模板',
      rows: [
        ['内容类型', '标题', 'URL/链接'],
        ['图文', '示例标题', 'https://example.com/article'],
        ['视频', '示例视频', 'https://example.com/video'],
      ],
      cols: [{ wch: 10 }, { wch: 36 }, { wch: 48 }],
    }],
    '自有文章导入模板.xlsx',
  )
}

async function onExcelPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!f) return
  excelName.value = f.name
  try {
    const buf = await f.arrayBuffer()
    const wb = XLSX.read(buf)
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    const header = (aoa[0] || []).map((h: any) => String(h || ''))
    const typeIdx = header.findIndex((h) => /类型|type/i.test(h))
    const titleIdx = header.findIndex((h) => /标题|title/i.test(h))
    const urlIdx = header.findIndex((h) => /url|链接|link/i.test(h))
    const parsed = aoa
      .slice(1)
      .map((row) => {
        const typeRaw = String(row[typeIdx >= 0 ? typeIdx : 0] || '')
        const type = /视频|video/i.test(typeRaw) ? 'video' : 'graphic'
        return {
          type,
          title: String(row[titleIdx >= 0 ? titleIdx : 1] || ''),
          url: String(row[urlIdx >= 0 ? urlIdx : 2] || ''),
        }
      })
      .filter((r) => r.url.trim())
    if (!parsed.length) {
      toast.error('未解析到有效行')
      return
    }
    importRows.value = parsed
    toast.success(`已载入 ${parsed.length} 行`)
  } catch (err: any) {
    toast.error(err?.message || 'Excel 解析失败')
  }
}

async function submitImport() {
  const items = importRows.value
    .map((r) => ({ title: r.title.trim(), url: r.url.trim(), type: r.type }))
    .filter((r) => r.url)
  if (!items.length) {
    toast.error('请至少填写一条有效链接')
    return
  }
  importing.value = true
  try {
    const resp: any = await monitorApi.importOwnArticles(items)
    toast.success(`已导入 ${resp?.count || items.length} 篇`)
    importOpen.value = false
    importRows.value = [{ type: 'graphic', title: '', url: '' }]
    excelName.value = ''
    await reload(1)
  } catch (e: any) {
    toast.error(e?.message || '导入失败')
  } finally {
    importing.value = false
  }
}

async function openCites(row: Row) {
  citesRow.value = row
  citesOpen.value = true
  citesLoading.value = true
  citesList.value = []
  try {
    const resp: any = await publishApi.articleCites({
      article_id: row.article_id,
      start_date: rangeStart.value,
      end_date: rangeEnd.value,
    })
    citesList.value = resp?.list || []
  } catch (e: any) {
    toast.error(e?.message || '加载明细失败')
  } finally {
    citesLoading.value = false
  }
}

function exportXlsx() {
  const header = ['标题', 'URL', '来源', '类型', '登记时间', '被引次数', '收录引擎', '引用状态']
  const data = rows.value.map((r) => [
    r.title || '',
    r.url || '',
    r.source_label || '',
    r.content_label || '',
    r.registered_at || '',
    r.cite_count || 0,
    `${r.engine_count || 0}/5`,
    r.cited ? '已引用' : '未引用',
  ])
  downloadAoaSheets(
    [{
      name: '稿件追踪',
      rows: [header, ...data],
      cols: [
        { wch: 40 }, { wch: 48 }, { wch: 8 }, { wch: 8 },
        { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
      ],
    }],
    `稿件追踪_${rangeStart.value}_${rangeEnd.value}.xlsx`,
  )
}

watch(() => filters.query_type, async () => {
  filters.query_id = 0
  queryLabel.value = '全部问题'
  await loadQueries()
  reload(1)
})

onMounted(async () => {
  await loadQueries()
  await reload(1)
})
</script>
