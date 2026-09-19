<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8 pb-24">
    <PageHeader
      title="信源库"
      description="在这些源上发的内容，更容易被 AI 引用 · 引用数据来自透镜GEO监测底座"
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" class="text-xs font-normal">
            全库 {{ formatNum(libraryTotal) }} 家
          </Badge>
          <Button size="sm" @click="goPublish()">
            去发布稿件
            <ArrowRight class="h-3.5 w-3.5" />
          </Button>
        </div>
      </template>
    </PageHeader>

    <Card class="overflow-hidden">
      <!-- 筛选 -->
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b px-5 py-3.5">
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground whitespace-nowrap">AI 引擎</span>
          <select
            v-model="filters.engine"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs"
            @change="reload(1)"
          >
            <option value="all">全部</option>
            <option value="doubao">豆包</option>
            <option value="deepseek">DeepSeek</option>
            <option value="wenxin">文心一言</option>
            <option value="qwen">千问</option>
            <option value="yuanbao">元宝</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground whitespace-nowrap">监控问题</span>
          <button
            type="button"
            class="inline-flex h-8 items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-xs"
            @click="queryOpen = !queryOpen"
          >
            <span>{{ queryLabel }}</span>
            <ChevronDown class="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground whitespace-nowrap">媒体类型</span>
          <select
            v-model="filters.category"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs"
            @change="reload(1)"
          >
            <option value="">不限</option>
            <option value="portal">新闻门户</option>
            <option value="selfmedia">自媒体</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground whitespace-nowrap">收录类型</span>
          <div class="inline-flex rounded-lg bg-muted p-0.5">
            <button
              type="button"
              :class="segBtnCls(filters.inclusion === 'all')"
              @click="setInclusion('all')"
            >不限</button>
            <button
              type="button"
              :class="segBtnCls(filters.inclusion === 'news')"
              @click="setInclusion('news')"
            >新闻源</button>
            <button
              type="button"
              :class="segBtnCls(filters.inclusion === 'web')"
              @click="setInclusion('web')"
            >网页</button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground whitespace-nowrap">积分消耗</span>
          <div class="flex items-center gap-1">
            <input
              v-model.number="filters.price_min"
              class="h-8 w-16 rounded-lg border border-input bg-background px-2 text-xs tabular-nums"
              type="number"
              placeholder="最低"
              min="0"
              @keydown.enter="reload(1)"
            />
            <span class="text-xs text-muted-foreground">—</span>
            <input
              v-model.number="filters.price_max"
              class="h-8 w-16 rounded-lg border border-input bg-background px-2 text-xs tabular-nums"
              type="number"
              placeholder="最高"
              min="0"
              @keydown.enter="reload(1)"
            />
            <span class="text-xs text-muted-foreground">积分</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground whitespace-nowrap">账号认证</span>
          <select
            v-model="filters.auth"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs"
            @change="reload(1)"
          >
            <option value="all">全部</option>
            <option value="yes">认证</option>
            <option value="no">未认证</option>
          </select>
        </div>

        <div class="relative" ref="taxRoot">
          <button
            type="button"
            class="inline-flex h-8 items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-xs"
            @click.stop="taxOpen = !taxOpen"
          >
            <span>{{ taxLabel }}</span>
            <ChevronDown class="h-3 w-3 text-muted-foreground" />
          </button>
          <div
            v-if="taxOpen"
            class="absolute left-0 top-[calc(100%+6px)] z-50 max-h-72 w-60 overflow-auto rounded-lg border bg-background p-1.5 shadow-lg"
            @click.stop
          >
            <button
              type="button"
              :class="taxItemCls(!filters.taxonomy)"
              @click="pickTaxonomy('')"
            >全部地区 / 分类</button>
            <button
              v-for="t in taxonomy"
              :key="t.value"
              type="button"
              :class="taxItemCls(filters.taxonomy === t.value)"
              @click="pickTaxonomy(t.value)"
            >
              <span>{{ t.value }}</span>
              <span class="text-muted-foreground">{{ t.count }}</span>
            </button>
          </div>
        </div>

        <div class="relative min-w-[220px] max-w-[420px] flex-1">
          <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="filters.q"
            class="h-8 pl-8 pr-8 text-xs"
            placeholder="搜索信源平台 / 媒体账号 / 投放位，按回车查询"
            @keydown.enter="reload(1)"
          />
          <button
            v-if="filters.q"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            @click="filters.q = ''; reload(1)"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground whitespace-nowrap">维度</span>
          <div class="inline-flex rounded-lg bg-muted p-0.5">
            <button
              type="button"
              :class="segBtnCls(displayMode === 'account')"
              @click="setMode('account')"
            >媒体账号</button>
            <button
              type="button"
              :class="segBtnCls(displayMode === 'platform')"
              @click="setMode('platform')"
            >信源平台</button>
          </div>
        </div>

        <button
          v-if="hasFilters"
          type="button"
          class="text-xs font-medium text-primary hover:underline"
          @click="clearFilters"
        >清空全部条件</button>
      </div>

      <!-- 工具栏 -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-5">
            <button
              type="button"
              :class="countTabCls(tab === 'all')"
              @click="setTab('all')"
            >
              全部 <b class="ml-1 font-semibold tabular-nums">{{ formatNum(total) }}</b>
            </button>
            <button
              type="button"
              :class="countTabCls(tab === 'fav')"
              @click="setTab('fav')"
            >
              我的收藏 <b class="ml-1 font-semibold tabular-nums">{{ favTotal }}</b>
            </button>
            <button
              type="button"
              :class="countTabCls(tab === 'selected')"
              @click="setTab('selected')"
            >
              已选 <b class="ml-1 font-semibold tabular-nums">{{ selectedKeys.length }}</b>
            </button>
          </div>
          <span class="text-xs text-muted-foreground">筛选出 {{ pageRows.length }} 家</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">排序</span>
          <select
            v-model="filters.sort"
            class="h-8 rounded-lg border border-input bg-background px-2.5 text-xs"
            @change="reload(1)"
          >
            <option value="verdict">综合推荐</option>
            <option value="cite-desc">引用指数 ↓</option>
            <option value="succ-desc">出稿率 ↓</option>
            <option value="price-asc">价格 低→高</option>
            <option value="price-desc">价格 高→低</option>
          </select>
        </div>
      </div>

      <!-- 表格：媒体账号 -->
      <div v-if="displayMode === 'account'" class="min-h-80 overflow-x-auto">
        <table class="w-full min-w-[1100px] text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th class="w-10 px-3 py-2.5 text-left font-medium">
                <input
                  type="checkbox"
                  class="h-3.5 w-3.5 accent-primary"
                  :checked="allChecked"
                  @change="toggleAll(($event.target as HTMLInputElement).checked)"
                />
              </th>
              <th class="px-3 py-2.5 text-left font-medium">媒体 · 信源</th>
              <th class="px-3 py-2.5 text-left font-medium">类型</th>
              <th class="px-3 py-2.5 text-left font-medium">收录情况</th>
              <th class="px-3 py-2.5 text-left font-medium">出稿率</th>
              <th class="px-3 py-2.5 text-left font-medium">引用指数</th>
              <th class="px-3 py-2.5 text-left font-medium">价格</th>
              <th class="px-3 py-2.5 text-left font-medium">备注</th>
              <th class="px-3 py-2.5 text-left font-medium">操作</th>
              <th class="px-3 py-2.5 text-left font-medium">收藏</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pageRows"
              :key="item.media_key"
              class="border-b last:border-0 hover:bg-muted/45"
            >
              <td class="px-3 py-3.5">
                <input
                  type="checkbox"
                  class="h-3.5 w-3.5 accent-primary"
                  :checked="selectedSet.has(item.media_key)"
                  @change="toggleSelect(item.media_key)"
                />
              </td>
              <td class="px-3 py-3.5">
                <div class="flex min-w-0 items-center gap-2.5">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                    :style="{ background: logoColor(item.name) }"
                  >{{ logoText(item.name) }}</div>
                  <div class="min-w-0">
                    <div class="truncate text-sm font-semibold">{{ item.name }}</div>
                    <a
                      v-if="item.case_url || item.site_url"
                      class="mt-0.5 inline-block text-xs font-medium text-primary hover:underline"
                      :href="item.case_url || item.site_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      @click.stop
                    >稿件案例</a>
                    <span v-else class="mt-0.5 inline-block text-xs text-muted-foreground/50">稿件案例</span>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3.5">
                <Badge variant="secondary" class="font-normal">{{ item.platform || item.type || '—' }}</Badge>
              </td>
              <td class="px-3 py-3.5 text-muted-foreground">{{ item.inclusion || '—' }}</td>
              <td class="px-3 py-3.5 tabular-nums">{{ item.success_rate != null ? `${item.success_rate}%` : '0%' }}</td>
              <td class="px-3 py-3.5">
                <div class="flex min-w-16 flex-col gap-1">
                  <span class="text-xs font-semibold tabular-nums text-emerald-600">{{ item.cite_count || item.ref_count || 0 }}</span>
                  <div class="h-1.5 overflow-hidden rounded-md bg-muted">
                    <div class="h-full rounded-md bg-emerald-500/85" :style="{ width: citePct(item) + '%' }" />
                  </div>
                </div>
              </td>
              <td class="px-3 py-3.5">
                <div class="flex flex-col leading-tight">
                  <s v-if="item.list_price" class="font-mono text-[10px] text-muted-foreground">✦{{ item.list_price }}</s>
                  <b class="font-mono text-xs font-semibold text-orange-600">✦{{ item.sell_price }}积分</b>
                </div>
              </td>
              <td class="max-w-[220px] px-3 py-3.5 text-xs text-muted-foreground break-words">{{ item.note || '—' }}</td>
              <td class="px-3 py-3.5">
                <Button size="sm" variant="outline" class="h-7 text-xs" @click="goPublish(item)">发稿</Button>
              </td>
              <td class="px-3 py-3.5">
                <button
                  type="button"
                  class="inline-flex text-muted-foreground hover:text-amber-500"
                  :class="{ 'text-amber-500': item.fav }"
                  title="收藏"
                  @click="toggleFav(item)"
                >
                  <Star class="h-4 w-4" :fill="item.fav ? 'currentColor' : 'none'" />
                </button>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="10" class="px-4 py-12 text-center text-sm text-muted-foreground">加载中…</td>
            </tr>
            <tr v-else-if="!pageRows.length">
              <td colspan="10" class="px-4 py-12 text-center text-sm text-muted-foreground">暂无匹配信源</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 表格：信源平台 -->
      <div v-else class="min-h-80 overflow-x-auto">
        <table class="w-full min-w-[900px] text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th class="w-10 px-3 py-2.5 text-left font-medium">
                <input
                  type="checkbox"
                  class="h-3.5 w-3.5 accent-primary"
                  :checked="allChecked"
                  @change="toggleAll(($event.target as HTMLInputElement).checked)"
                />
              </th>
              <th class="px-3 py-2.5 text-left font-medium">媒体 · 信源</th>
              <th class="px-3 py-2.5 text-left font-medium">类型</th>
              <th class="px-3 py-2.5 text-left font-medium">引用平台</th>
              <th class="px-3 py-2.5 text-left font-medium">引用指数</th>
              <th class="px-3 py-2.5 text-left font-medium">价格</th>
              <th class="px-3 py-2.5 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pageRows"
              :key="item.media_key"
              class="border-b last:border-0 hover:bg-muted/45"
            >
              <td class="px-3 py-3.5">
                <input
                  type="checkbox"
                  class="h-3.5 w-3.5 accent-primary"
                  :checked="selectedSet.has(item.media_key)"
                  @change="toggleSelect(item.media_key)"
                />
              </td>
              <td class="px-3 py-3.5">
                <div class="flex min-w-0 items-center gap-2.5">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                    :style="{ background: logoColor(item.name) }"
                  >{{ logoText(item.name) }}</div>
                  <div class="min-w-0">
                    <div class="truncate text-sm font-semibold">{{ item.name }}</div>
                    <div class="mt-0.5 text-[11px] text-muted-foreground">
                      {{ item.area || '全国' }} · 可投媒体号 {{ item.account_count || 1 }} 家
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3.5">
                <Badge variant="secondary" class="font-normal">{{ item.category_label || item.type || '自媒体' }}</Badge>
              </td>
              <td class="px-3 py-3.5">
                <div v-if="(item.geo_engines || item.indexed_engines || []).length" class="flex flex-wrap gap-1">
                  <Badge
                    v-for="e in (item.geo_engines || item.indexed_engines)"
                    :key="e"
                    class="border-transparent text-[10px] text-white"
                    :style="{ backgroundColor: engineColor(e) }"
                  >{{ engineLabel(e) }}</Badge>
                </div>
                <span v-else class="text-muted-foreground">—</span>
              </td>
              <td class="px-3 py-3.5">
                <div class="flex min-w-16 flex-col gap-1">
                  <span class="text-xs font-semibold tabular-nums text-emerald-600">{{ item.cite_count || item.ref_count || 0 }}</span>
                  <div class="h-1.5 overflow-hidden rounded-md bg-muted">
                    <div class="h-full rounded-md bg-emerald-500/85" :style="{ width: citePct(item) + '%' }" />
                  </div>
                </div>
              </td>
              <td class="px-3 py-3.5">
                <div class="flex flex-col leading-tight">
                  <s v-if="item.list_price" class="font-mono text-[10px] text-muted-foreground">✦{{ item.list_price }}</s>
                  <b class="font-mono text-xs font-semibold text-orange-600">✦{{ item.sell_price }}积分起</b>
                </div>
              </td>
              <td class="px-3 py-3.5">
                <Button size="sm" variant="outline" class="h-7 text-xs" @click="goPublish(item)">详情</Button>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="7" class="px-4 py-12 text-center text-sm text-muted-foreground">加载中…</td>
            </tr>
            <tr v-else-if="!pageRows.length">
              <td colspan="7" class="px-4 py-12 text-center text-sm text-muted-foreground">暂无匹配信源</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
        <span class="text-xs text-muted-foreground">共 {{ formatNum(total) }} 条</span>
        <div class="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            class="h-8 w-8 p-0"
            :disabled="page <= 1"
            @click="reload(page - 1)"
          >
            <ChevronLeft class="h-3.5 w-3.5" />
          </Button>
          <Button
            v-for="p in pageButtons"
            :key="p"
            size="sm"
            :variant="p === page ? 'default' : 'outline'"
            class="h-8 min-w-8 px-2"
            @click="reload(p)"
          >{{ p }}</Button>
          <Button
            size="sm"
            variant="outline"
            class="h-8 w-8 p-0"
            :disabled="page >= totalPages"
            @click="reload(page + 1)"
          >
            <ChevronRight class="h-3.5 w-3.5" />
          </Button>
          <input
            v-model.number="jumpPage"
            class="h-8 w-12 rounded-lg border border-input bg-background text-center text-xs"
            type="number"
            min="1"
            :placeholder="String(page)"
            @keydown.enter="doJump"
          />
          <Button size="sm" variant="outline" class="h-8" :disabled="!jumpPage" @click="doJump">跳转</Button>
        </div>
      </div>
    </Card>

    <!-- 已选悬浮条 -->
    <div
      v-if="selectedKeys.length"
      class="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-lg border bg-foreground px-4 py-2.5 text-sm text-background shadow-lg"
    >
      <span>已选 <b class="text-primary-foreground/90">{{ selectedKeys.length }}</b> 家</span>
      <div class="flex items-center gap-2">
        <button type="button" class="text-xs text-background/70 hover:text-background" @click="clearSelected">清空</button>
        <Button size="sm" class="bg-background text-foreground hover:bg-background/90" @click="goPublish()">去发布稿件</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Search, Star, X } from 'lucide-vue-next'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, Input } from '@/components/ui'
import { publishApi } from '@/api/modules/report'
import { toast } from '@/lib/toast'

type MediaItem = {
  media_key: string
  name: string
  platform?: string
  type?: string
  category_label?: string
  area?: string
  account_count?: number
  cite_count?: number
  ref_count?: number
  list_price?: number
  sell_price?: number
  note?: string
  fav?: boolean
  case_url?: string | null
  site_url?: string
  inclusion?: string | null
  success_rate?: number | null
  indexed_engines?: string[]
  geo_engines?: string[]
}

const router = useRouter()
const PAGE_SIZE = 20

const filters = reactive({
  engine: 'all',
  category: '',
  inclusion: 'all' as 'all' | 'news' | 'web',
  price_min: null as number | null,
  price_max: null as number | null,
  auth: 'all',
  taxonomy: '',
  q: '',
  sort: 'cite-desc',
})

const displayMode = ref<'account' | 'platform'>('account')
const tab = ref<'all' | 'fav' | 'selected'>('all')
const rows = ref<MediaItem[]>([])
const total = ref(0)
const libraryTotal = ref(0)
const favTotal = ref(0)
const page = ref(1)
const loading = ref(false)
const selectedKeys = ref<string[]>([])
const selectedMap = ref<Record<string, MediaItem>>({})
const jumpPage = ref<number | null>(null)
const taxonomy = ref<{ value: string; count: number }[]>([])
const taxOpen = ref(false)
const taxRoot = ref<HTMLElement | null>(null)
const queryOpen = ref(false)
const queryLabel = ref('全部')

const selectedSet = computed(() => new Set(selectedKeys.value))
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pageRows = computed(() => {
  if (tab.value === 'selected') {
    return selectedKeys.value.map(k => selectedMap.value[k]).filter(Boolean)
  }
  return rows.value
})
const allChecked = computed(() => pageRows.value.length > 0 && pageRows.value.every(r => selectedSet.value.has(r.media_key)))
const maxCite = computed(() => Math.max(1, ...rows.value.map(r => r.cite_count || r.ref_count || 0)))
const hasFilters = computed(() =>
  filters.engine !== 'all'
  || !!filters.category
  || filters.inclusion !== 'all'
  || filters.price_min != null
  || filters.price_max != null
  || filters.auth !== 'all'
  || !!filters.taxonomy
  || !!filters.q.trim(),
)
const taxLabel = computed(() => (filters.taxonomy ? `分类 · ${filters.taxonomy}` : '地区 / 媒体分类'))
const pageButtons = computed(() => {
  const n = totalPages.value
  const cur = page.value
  if (n <= 5) return Array.from({ length: n }, (_, i) => i + 1)
  const set = new Set([1, n, cur, cur - 1, cur + 1].filter(p => p >= 1 && p <= n))
  return [...set].sort((a, b) => a - b)
})

const ENGINE_META: Record<string, { label: string; color: string }> = {
  doubao: { label: '豆包', color: '#f59e0b' },
  deepseek: { label: 'DeepSeek', color: '#0ea5e9' },
  wenxin: { label: '文心一言', color: '#ec4899' },
  qwen: { label: '千问', color: '#0f766e' },
  yuanbao: { label: '元宝', color: '#2563eb' },
}

function engineLabel(e: string) { return ENGINE_META[e]?.label || e }
function engineColor(e: string) { return ENGINE_META[e]?.color || '#64748b' }
function formatNum(n: number) { return Number(n || 0).toLocaleString('zh-CN') }
function logoText(name: string) { return (name || '?').replace(/\s/g, '').slice(0, 1) }
function logoColor(name: string) {
  const colors = ['#2d7fd0', '#0f9d6b', '#e11d48', '#ea580c', '#0891b2', '#0f766e', '#2563eb']
  let h = 0
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % colors.length
  return colors[h]
}
function citePct(item: MediaItem) {
  const n = item.cite_count || item.ref_count || 0
  return Math.max(4, Math.min(100, Math.round((n / maxCite.value) * 100)))
}
function segBtnCls(on: boolean) {
  return [
    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
    on ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
  ]
}
function countTabCls(on: boolean) {
  return [
    'border-b-2 pb-1.5 text-sm font-medium transition-colors',
    on ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
  ]
}
function taxItemCls(on: boolean) {
  return [
    'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs',
    on ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
  ]
}

function buildPayload(pageNo: number) {
  return {
    page: pageNo,
    size: PAGE_SIZE,
    sort: filters.sort,
    display_mode: displayMode.value,
    fav: tab.value === 'fav',
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.engine !== 'all' ? { engine: filters.engine } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.taxonomy ? { taxonomy: filters.taxonomy } : {}),
    ...(filters.auth !== 'all' ? { auth: filters.auth } : {}),
    ...(filters.price_min != null && filters.price_min !== ('' as any) ? { price_min: filters.price_min } : {}),
    ...(filters.price_max != null && filters.price_max !== ('' as any) ? { price_max: filters.price_max } : {}),
  }
}

async function reload(pageNo = page.value) {
  if (tab.value === 'selected') {
    page.value = 1
    return
  }
  loading.value = true
  page.value = pageNo
  try {
    const resp: any = await publishApi.mediaList(buildPayload(pageNo))
    rows.value = resp?.list || []
    total.value = Number(resp?.total || 0)
    favTotal.value = Number(resp?.fav_total || 0)
    if (!hasFilters.value && tab.value === 'all' && displayMode.value === 'account') {
      libraryTotal.value = total.value
    }
  } catch (e: any) {
    rows.value = []
    toast.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function setMode(mode: 'account' | 'platform') {
  if (displayMode.value === mode) return
  displayMode.value = mode
  reload(1)
}
function setTab(t: 'all' | 'fav' | 'selected') {
  tab.value = t
  if (t !== 'selected') reload(1)
}
function setInclusion(v: 'all' | 'news' | 'web') {
  filters.inclusion = v
  if (v === 'news') filters.category = 'portal'
  else if (v === 'web') filters.category = 'selfmedia'
  else if (filters.category === 'portal' || filters.category === 'selfmedia') filters.category = ''
  reload(1)
}
function pickTaxonomy(v: string) {
  filters.taxonomy = v
  taxOpen.value = false
  reload(1)
}
function clearFilters() {
  filters.engine = 'all'
  filters.category = ''
  filters.inclusion = 'all'
  filters.price_min = null
  filters.price_max = null
  filters.auth = 'all'
  filters.taxonomy = ''
  filters.q = ''
  reload(1)
}
function toggleSelect(key: string) {
  const i = selectedKeys.value.indexOf(key)
  if (i >= 0) {
    selectedKeys.value.splice(i, 1)
    delete selectedMap.value[key]
    return
  }
  selectedKeys.value.push(key)
  const found = rows.value.find(r => r.media_key === key)
  if (found) selectedMap.value[key] = found
}
function toggleAll(on: boolean) {
  if (!on) {
    const drop = new Set(pageRows.value.map(r => r.media_key))
    selectedKeys.value = selectedKeys.value.filter(k => !drop.has(k))
    for (const k of drop) delete selectedMap.value[k]
    return
  }
  const set = new Set(selectedKeys.value)
  for (const r of pageRows.value) {
    set.add(r.media_key)
    selectedMap.value[r.media_key] = r
  }
  selectedKeys.value = [...set]
}
async function toggleFav(item: MediaItem) {
  const next = !item.fav
  try {
    const resp: any = await publishApi.mediaFav(item.media_key, next)
    item.fav = next
    favTotal.value = Number(resp?.fav_total ?? favTotal.value + (next ? 1 : -1))
    if (tab.value === 'fav' && !next) await reload(page.value)
  } catch (e: any) {
    toast.error(e?.message || '收藏失败')
  }
}
function clearSelected() {
  selectedKeys.value = []
  selectedMap.value = {}
}
function goPublish(item?: MediaItem) {
  const keys = item ? [item.media_key] : selectedKeys.value
  router.push({
    path: '/dashboard/media-library/publish',
    query: keys.length ? { media_keys: keys.join(',') } : {},
  })
}
function doJump() {
  const p = Number(jumpPage.value)
  if (!Number.isFinite(p) || p < 1) return
  reload(Math.min(totalPages.value, Math.floor(p)))
  jumpPage.value = null
}

function onDocClick(e: MouseEvent) {
  if (taxRoot.value && !taxRoot.value.contains(e.target as Node)) taxOpen.value = false
}

onMounted(async () => {
  document.addEventListener('click', onDocClick)
  try {
    const facets: any = await publishApi.mediaFacets()
    taxonomy.value = facets?.taxonomy || []
  } catch { /* ignore */ }
  await reload(1)
  if (!libraryTotal.value) libraryTotal.value = total.value
})
onUnmounted(() => document.removeEventListener('click', onDocClick))

watch(displayMode, () => {
  selectedKeys.value = []
  selectedMap.value = {}
})
</script>
