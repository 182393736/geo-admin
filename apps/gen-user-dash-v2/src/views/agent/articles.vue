<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="稿件库" description="所有由 AI 辅助生成的稿件 · 数据实时同步">
      <template #actions>
        <Button size="sm" variant="outline" :disabled="loading" @click="load">
          <RefreshCw class="h-3.5 w-3.5" :class="loading ? 'animate-spin' : ''" />
          刷新
        </Button>
        <Button size="sm" variant="outline" @click="router.push('/dashboard/media-library/records')">
          <Send class="h-3.5 w-3.5" />
          发稿记录
        </Button>
        <Button size="sm" variant="outline" @click="router.push('/dashboard/media-library/publish')">
          <Upload class="h-3.5 w-3.5" />
          发布稿件
        </Button>
        <Button size="sm" @click="router.push('/dashboard/new-agent?mode=writing')">
          <PenLine class="h-3.5 w-3.5" />
          新建稿件
        </Button>
      </template>
    </PageHeader>

    <Card class="overflow-hidden">
      <!-- 搜索 -->
      <div class="flex flex-wrap items-center gap-3 border-b px-5 py-4">
        <div class="relative min-w-[240px] flex-1">
          <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="keyword"
            placeholder="搜索稿件标题、关键词..."
            class="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5">
        <div class="flex items-center gap-0 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors"
            :class="activeTab === tab.key
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'"
            @click="activeTab = tab.key; page = 1"
          >
            {{ tab.label }}
            <span
              v-if="tabCount(tab.key) > 0"
              class="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold"
              :class="activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
            >{{ tabCount(tab.key) }}</span>
          </button>
        </div>
        <div class="py-2 text-xs text-muted-foreground">
          按 <span class="font-medium text-foreground">更新时间</span> 排序 ↓
        </div>
      </div>

      <!-- 列表 -->
      <div v-if="!auth.activeBrandId" class="px-5 py-16 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Tag class="h-5 w-5" />
        </div>
        <div class="text-sm font-medium">请先选择品牌</div>
        <div class="mt-1 text-xs text-muted-foreground">左侧选择 active brand 后才能看稿件</div>
      </div>
      <div v-else-if="loading && !items.length" class="px-5 py-16 text-center">
        <div class="text-sm text-muted-foreground">加载中…</div>
        <div class="mt-1 text-xs text-muted-foreground">正在拉取稿件列表</div>
      </div>
      <div v-else-if="error" class="px-5 py-16 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle class="h-5 w-5" />
        </div>
        <div class="text-sm font-medium">加载失败</div>
        <div class="mt-1 text-xs text-muted-foreground">{{ error }}</div>
        <Button size="sm" class="mt-4" @click="load">重试</Button>
      </div>
      <div v-else-if="!filtered.length" class="px-5 py-16 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText class="h-5 w-5" />
        </div>
        <div class="text-sm font-medium">还没有稿件</div>
        <div class="mt-1 text-xs text-muted-foreground">点右上角「新建稿件」让 AI 帮你写第一篇</div>
      </div>
      <div v-else>
        <div
          v-for="(item, idx) in pageItems"
          :key="item.run_id"
          class="flex cursor-pointer items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/45"
          :class="idx < pageItems.length - 1 ? 'border-b' : ''"
          @click="openItem(item)"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText class="h-[18px] w-[18px]" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium" :title="itemTitle(item)">{{ itemTitle(item) }}</div>
            <div class="mt-0.5 flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <span class="font-mono">{{ relativeTime(item.updated_at) }}</span>
              <template v-if="item.generate_mode === 'evidence'">
                <span class="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
                <span class="font-medium text-primary">循证</span>
              </template>
            </div>
          </div>
          <Badge :class="statusBadgeClass(item.status)">
            <span
              v-if="item.status === 'running' || item.status === 'starting'"
              class="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current"
            />
            <span
              v-else-if="item.status === 'awaiting_user'"
              class="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current"
            />
            <Check
              v-else-if="item.status === 'completed'"
              class="mr-1 h-2.5 w-2.5"
            />
            {{ statusLabel(item) }}
          </Badge>
          <div class="flex shrink-0 items-center gap-1.5" @click.stop>
            <Button size="sm" variant="outline" class="h-7 px-2.5 text-xs" @click="openItem(item)">查看</Button>
            <Button
              size="sm"
              variant="outline"
              class="h-7 w-7 px-0 text-destructive hover:bg-destructive/10"
              title="删除"
              @click="askDelete(item)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div v-if="filtered.length" class="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
        <span class="text-xs text-muted-foreground">
          显示 <span class="font-mono font-semibold text-foreground">{{ rangeStart }}-{{ rangeEnd }}</span>
          · 共 <span class="font-mono font-semibold text-foreground">{{ filtered.length }}</span> 篇
        </span>
        <div class="flex items-center gap-1">
          <Button size="sm" variant="outline" :disabled="page <= 1" @click="page--">‹ 上一页</Button>
          <template v-for="(p, i) in pageNums" :key="`${p}-${i}`">
            <span v-if="p === '...'" class="grid h-8 min-w-8 place-items-center text-xs text-muted-foreground">...</span>
            <Button
              v-else
              size="sm"
              :variant="p === page ? 'default' : 'outline'"
              class="min-w-8"
              :disabled="p === page"
              @click="page = Number(p)"
            >{{ p }}</Button>
          </template>
          <Button size="sm" variant="outline" :disabled="page >= totalPages" @click="page++">下一页 ›</Button>
        </div>
      </div>
    </Card>

    <!-- 删除确认 -->
    <Teleport to="body">
      <div
        v-if="pendingDelete"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="!deleting && (pendingDelete = null)"
      >
        <Card class="w-full max-w-md overflow-hidden shadow-lg">
          <div class="flex items-start gap-2.5 border-b px-5 py-4">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 class="h-4 w-4" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-semibold">删除稿件</h3>
              <p class="mt-1 text-xs text-muted-foreground">
                确认删除「{{ truncate(itemTitle(pendingDelete), 40) }}」？
              </p>
            </div>
          </div>
          <CardContent class="space-y-3 p-5">
            <div
              v-if="isActive(pendingDelete)"
              class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800"
            >
              ⚠ 这个稿件还在生成中。删除会<strong>立即中止 agent 任务</strong>，已生成的草稿/调研文件也会一并删除。
            </div>
            <p class="text-[11.5px] text-muted-foreground">
              删除不可恢复 · 包括对话历史 / 调研资料 / 大纲 / 草稿 / 终稿
            </p>
            <div class="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="outline" :disabled="deleting" @click="pendingDelete = null">取消</Button>
              <Button size="sm" variant="destructive" :disabled="deleting" @click="confirmDelete">
                <RefreshCw v-if="deleting" class="h-3.5 w-3.5 animate-spin" />
                {{ deleting ? '删除中…' : (isActive(pendingDelete) ? '中止并删除' : '确认删除') }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertTriangle,
  Check,
  FileText,
  PenLine,
  RefreshCw,
  Search,
  Send,
  Tag,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import { brandApi, type ArticleLibraryItem } from '@/api/modules/brand'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/lib/toast'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent, Input } from '@/components/ui'

const router = useRouter()
const auth = useAuthStore()

type TabKey = 'all' | 'running' | 'interrupted' | 'completed'
const tabs: { key: TabKey; label: string; statuses: string[] | null }[] = [
  { key: 'all', label: '全部', statuses: null },
  { key: 'running', label: '进行中', statuses: ['running', 'starting', 'awaiting_user'] },
  { key: 'interrupted', label: '已中断', statuses: ['failed', 'cancelled'] },
  { key: 'completed', label: '已完成', statuses: ['completed'] },
]

const items = ref<ArticleLibraryItem[]>([])
const counters = ref<Record<string, number> | null>(null)
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const activeTab = ref<TabKey>('all')
const page = ref(1)
const pageSize = 10
const pendingDelete = ref<ArticleLibraryItem | null>(null)
const deleting = ref(false)
let pollTimer: number | null = null
let loadSeq = 0

const filtered = computed(() => {
  const tab = tabs.find((t) => t.key === activeTab.value)
  const statuses = tab?.statuses ?? null
  const kw = keyword.value.trim().toLowerCase()
  return items.value.filter((it) => {
    if (statuses && !statuses.includes(it.status)) return false
    if (!kw) return true
    const hay = `${it.title ?? ''} ${it.topic ?? ''} ${it.slug ?? ''}`.toLowerCase()
    return hay.includes(kw)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const safePage = computed(() => Math.min(page.value, totalPages.value))
const pageItems = computed(() => {
  const p = safePage.value
  return filtered.value.slice((p - 1) * pageSize, p * pageSize)
})
const rangeStart = computed(() => (filtered.value.length ? (safePage.value - 1) * pageSize + 1 : 0))
const rangeEnd = computed(() => Math.min(safePage.value * pageSize, filtered.value.length))

const pageNums = computed(() => {
  const total = totalPages.value
  const cur = safePage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, cur, cur - 1, cur + 1])
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out: (number | string)[] = []
  let prev = 0
  for (const n of sorted) {
    if (n - prev > 1) out.push('...')
    out.push(n)
    prev = n
  }
  return out
})

watch([activeTab, keyword], () => { page.value = 1 })
watch(totalPages, (tp) => { if (page.value > tp) page.value = tp })

function tabCount(key: TabKey) {
  const c = counters.value
  if (!c) return 0
  if (key === 'all') return c.all || 0
  if (key === 'running') return (c.running || 0) + (c.starting || 0) + (c.awaiting_user || 0)
  if (key === 'interrupted') return (c.failed || 0) + (c.cancelled || 0)
  if (key === 'completed') return c.completed || 0
  return 0
}

function itemTitle(it: ArticleLibraryItem) {
  return it.title || it.topic || it.slug || '未命名稿件'
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s
}

function isActive(it: ArticleLibraryItem | null) {
  if (!it) return false
  return it.status === 'running' || it.status === 'starting' || it.status === 'awaiting_user'
}

function relativeTime(raw?: string) {
  if (!raw) return '—'
  const t = new Date(raw).getTime()
  if (!Number.isFinite(t)) return '—'
  const diff = Date.now() - t
  if (diff < 0 || diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`
  const d = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function statusLabel(it: ArticleLibraryItem) {
  if (it.status === 'running' || it.status === 'starting') {
    return `生成中 ${it.progress_percent ? `${it.progress_percent}%` : ''}`.trim()
  }
  if (it.status === 'awaiting_user') return '待确认'
  if (it.status === 'completed') return '已完成'
  if (it.status === 'failed') return '失败'
  if (it.status === 'cancelled') return '已取消'
  return it.status
}

function statusBadgeClass(status: string) {
  if (status === 'running' || status === 'starting') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  if (status === 'awaiting_user') return 'border-transparent bg-primary/10 text-primary'
  if (status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'failed') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-transparent bg-muted text-muted-foreground'
}

function openItem(it: ArticleLibraryItem) {
  router.push(`/dashboard/writing/${encodeURIComponent(it.run_id)}`)
}

function askDelete(it: ArticleLibraryItem) {
  pendingDelete.value = it
}

async function confirmDelete() {
  if (!pendingDelete.value || deleting.value) return
  deleting.value = true
  try {
    await brandApi.deleteArticle(pendingDelete.value.run_id)
    items.value = items.value.filter((x) => x.run_id !== pendingDelete.value!.run_id)
    if (counters.value) {
      const st = pendingDelete.value.status
      if (counters.value[st] != null) counters.value[st] = Math.max(0, (counters.value[st] || 0) - 1)
      counters.value.all = Math.max(0, (counters.value.all || 0) - 1)
    }
    pendingDelete.value = null
    toast.success('已删除')
  } catch (e: any) {
    toast.error(e?.message || '删除失败')
  } finally {
    deleting.value = false
  }
}

async function load() {
  if (!auth.activeBrandId || !auth.user?.id) {
    items.value = []
    counters.value = null
    loading.value = false
    return
  }
  const seq = ++loadSeq
  loading.value = true
  error.value = ''
  try {
    const res: any = await brandApi.articles(auth.activeBrandId, auth.user.id, 200, 'writing')
    if (seq !== loadSeq) return
    items.value = res?.items || []
    counters.value = res?.counters || null
  } catch (e: any) {
    if (seq !== loadSeq) return
    error.value = e?.message || '加载失败'
  } finally {
    if (seq === loadSeq) loading.value = false
  }
}

function setupPoll() {
  if (pollTimer) window.clearInterval(pollTimer)
  const hasActive = items.value.some((it) => isActive(it))
  const ms = hasActive ? 10_000 : 60_000
  pollTimer = window.setInterval(() => {
    if (typeof document !== 'undefined' && document.hidden) return
    load()
  }, ms)
}

watch(items, () => setupPoll(), { deep: true })
watch(() => auth.activeBrandId, () => load())

onMounted(() => {
  load()
  setupPoll()
})
onUnmounted(() => {
  if (pollTimer) window.clearInterval(pollTimer)
})
</script>
