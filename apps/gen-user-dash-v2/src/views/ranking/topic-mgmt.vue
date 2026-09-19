<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="监控问题管理" description="配置实际发送给 AI 的监控问题。">
      <template #actions>
        <div class="flex items-stretch overflow-hidden rounded-lg border bg-card shadow-sm">
          <div class="flex flex-col justify-center border-r bg-muted/30 px-5 py-2.5">
            <div class="mb-0.5 flex items-center gap-1.5">
              <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">总占用 · 全部分类</span>
            </div>
            <span class="text-xl font-bold leading-none tabular-nums">
              {{ totalUsed }}<span class="text-xs font-normal text-muted-foreground"> / {{ totalLimit }}</span>
            </span>
          </div>
          <div class="group relative flex cursor-help flex-col justify-center border-r bg-card px-5 py-2.5">
            <div class="mb-0.5 flex items-center gap-1.5">
              <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">本页 · {{ pageScopeLabel }}</span>
              <CircleHelp class="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <div class="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border bg-popover p-3 text-xs leading-relaxed text-popover-foreground opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
              <span class="font-semibold text-primary">总占用 · 全部分类</span>：排名词 + 口碑词 全部已占用额度，是计费依据。<br>
              <span class="font-semibold text-primary">本页 · {{ pageScopeLabel }}</span>：仅当前分类下的问题条数，所以会小于总占用，属正常现象。
            </div>
            <span class="text-xl font-bold leading-none tabular-nums text-primary">
              {{ pageCount }}<span class="text-xs font-normal text-muted-foreground">个</span>
            </span>
          </div>
          <div class="flex flex-col justify-center border-r bg-card px-5 py-2.5">
            <div class="mb-0.5 flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-amber-400" />
              <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">待释放</span>
            </div>
            <span class="text-xl font-bold leading-none tabular-nums text-amber-600">
              {{ pendingRelease }}<span class="text-xs font-normal text-muted-foreground">个</span>
            </span>
          </div>
          <button
            type="button"
            class="flex min-w-[52px] flex-col items-center justify-center gap-1 border-l bg-primary/5 px-4 text-primary transition-colors hover:bg-primary/10"
            title="扩容额度"
            @click="goPricing"
          >
            <Crown class="h-4 w-4" />
            <span class="text-[10px] font-semibold">扩容</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <Card class="relative flex min-h-[400px] flex-col overflow-hidden">
      <!-- 卡片头 -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-4">
        <div class="flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Layers class="h-3.5 w-3.5" />
          问题列表 ({{ filteredRows.length }})
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              v-model="search"
              placeholder="搜索问题..."
              class="h-9 w-48 rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button size="sm" variant="outline" :disabled="!filteredRows.length" @click="exportList">
            <Download class="h-3.5 w-3.5" />
            导出
          </Button>
          <Button size="sm" variant="outline" @click="openImport">
            <Upload class="h-3.5 w-3.5" />
            导入问题
          </Button>
          <Button size="sm" :disabled="remainQuota <= 0" @click="openAdd">
            <Plus class="h-3.5 w-3.5" />
            增加新问题
          </Button>
        </div>
      </div>

      <!-- 分组 Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b px-5 py-3">
        <button type="button" :class="groupTabCls(activeGroup === 'all')" @click="activeGroup = 'all'">全部</button>
        <button type="button" :class="groupTabCls(activeGroup === 'ungrouped', true)" @click="activeGroup = 'ungrouped'">
          未分组
          <b class="font-semibold" :class="activeGroup === 'ungrouped' ? 'text-primary-foreground/80' : 'text-muted-foreground'">{{ ungroupedCount }}</b>
        </button>
        <button
          v-for="g in groups"
          :key="g.group_id"
          type="button"
          :class="groupTabCls(activeGroup === g.group_id, true)"
          @click="activeGroup = g.group_id"
        >
          {{ g.name }}
          <b class="font-semibold" :class="activeGroup === g.group_id ? 'text-primary-foreground/80' : 'text-muted-foreground'">{{ g.query_count }}</b>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-md border border-dashed border-input bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          @click="openCreateGroup"
        >
          <Plus class="h-3 w-3" />
          新建分组
        </button>
      </div>

      <!-- 表头 -->
      <div class="grid grid-cols-[2fr_6fr_1.6fr_auto_auto_auto] items-center gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
        <div>监控类型</div>
        <div>问题</div>
        <div class="text-center">分组</div>
        <div class="w-[88px] text-center">添加时间</div>
        <div class="w-[80px] text-center">状态</div>
        <div class="w-[68px] text-center">操作</div>
      </div>

      <!-- 行 -->
      <div class="divide-y bg-card">
        <div
          v-for="q in filteredRows"
          :key="q.id"
          class="group relative grid cursor-grab grid-cols-[2fr_6fr_1.6fr_auto_auto_auto] items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40 active:cursor-grabbing"
          draggable="true"
          @dragstart="onDragStart(q.id, $event)"
          @dragover.prevent
          @drop="onDrop(q.id)"
        >
          <div class="absolute bottom-0 left-0 top-0 w-1 bg-transparent transition-colors group-hover:bg-primary/40" />
          <div>
            <Badge
              :class="q.query_type === 'brand'
                ? 'border-transparent bg-orange-50 text-orange-700'
                : 'border-transparent bg-primary/10 text-primary'"
            >{{ TYPE_LABEL[q.query_type] || q.query_type }}</Badge>
          </div>
          <div class="relative">
            <span class="inline-flex flex-wrap items-center gap-2 py-1.5 text-sm font-semibold">{{ q.query }}</span>
          </div>
          <div class="min-w-0 pt-1">
            <select
              class="block w-full min-w-0 max-w-full cursor-pointer truncate rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:border-primary/40"
              :value="q.group_id || ''"
              @change="onMoveGroup(q.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">未分组</option>
              <option v-for="g in groups" :key="g.group_id" :value="g.group_id">{{ g.name }}</option>
            </select>
          </div>
          <div class="flex w-[88px] justify-center pt-2">
            <span class="whitespace-nowrap text-[11px] text-muted-foreground">{{ fmtDate(q.created_at) }}</span>
          </div>
          <div class="flex w-[80px] justify-center pt-2">
            <button
              type="button"
              class="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors"
              :class="q.query_status
                ? 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'border-border bg-muted text-muted-foreground hover:bg-muted/80'"
              :title="q.query_status ? '点击停用' : '点击启用'"
              @click="toggleStatus(q)"
            >
              <span class="mr-1 h-1.5 w-1.5 rounded-full" :class="q.query_status ? 'bg-emerald-500' : 'bg-muted-foreground/40'" />
              {{ q.query_status ? '监控中' : '已停用' }}
            </button>
          </div>
          <div class="flex w-[68px] items-center justify-center gap-1">
            <button type="button" class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" title="编辑问题" @click="openEdit(q)">
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button type="button" class="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-red-50 hover:text-red-500" title="删除" @click="confirmDelete(q)">
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div v-if="loading" class="flex justify-center px-5 py-16">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
        <div v-else-if="!filteredRows.length" class="px-5 py-10 text-center text-sm text-muted-foreground">暂无监控问题</div>
      </div>
    </Card>

    <!-- 添加 / 导入 弹窗 -->
    <Teleport to="body">
      <div v-if="addOpen" class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-4" @click.self="closeAdd">
        <div class="w-full max-w-xl overflow-hidden rounded-lg border bg-card shadow-lg">
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h3 class="flex items-center gap-2 text-base font-semibold">
              <span class="text-primary">+</span> {{ addMode === 'import' ? '导入监控问题' : '添加监控问题' }}
            </h3>
            <button type="button" class="rounded-md p-1 text-muted-foreground hover:text-foreground" @click="closeAdd">
              <X class="h-4 w-4" />
            </button>
          </div>

          <div v-if="addStep === 1" class="space-y-5 px-6 py-5">
            <div>
              <div class="mb-2 text-sm font-semibold text-muted-foreground">输入监控问题</div>
              <textarea
                v-model="addText"
                rows="6"
                class="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="输入您想监控的问题，每行一个，支持批量添加...&#10;例如：&#10;智能手机推荐&#10;AI手机对比"
              />
            </div>
            <div class="rounded-lg border bg-muted/30 p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold">问题内容拓写</div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="generalize"
                  :aria-label="generalize ? '已开启：把问题改写成自然提问' : '已关闭：保持原文'"
                  class="relative h-6 w-10 rounded-full transition-colors"
                  :class="generalize ? 'bg-primary' : 'bg-muted-foreground/30'"
                  @click="generalize = !generalize"
                >
                  <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" :class="generalize ? 'translate-x-4' : ''" />
                </button>
              </div>
              <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
                把简短问题改写成用户真实向 AI 提问的自然语气，监测更贴合实际。关闭后将保持你输入的原文。
              </p>
              <div class="mt-3 rounded-md bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                例 <span class="text-foreground">电动汽车排名</span>
                <span class="mx-1 text-primary">→</span>
                <span class="text-primary">我想买一辆电动汽车，请帮我推荐几款</span>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4 px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold">确认预览</div>
              <div class="rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] text-amber-700">将占用 {{ previewLines.length }} 个额度</div>
            </div>
            <div class="max-h-64 space-y-2 overflow-y-auto">
              <div v-for="(line, i) in previewLines" :key="i" class="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                {{ line }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 border-t px-6 py-4">
            <div class="text-xs text-muted-foreground">剩余额度：{{ remainQuota }}</div>
            <div class="flex items-center gap-2">
              <Button v-if="addStep === 2" size="sm" variant="ghost" @click="addStep = 1">上一步</Button>
              <Button
                v-if="addStep === 1"
                size="sm"
                :disabled="!parsedLines.length || submitting"
                @click="goAddNext"
              >下一步 →</Button>
              <Button
                v-else
                size="sm"
                :disabled="!previewLines.length || submitting"
                @click="submitAdd"
              >
                <Check class="h-3.5 w-3.5" />
                确认添加
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 编辑弹窗 -->
    <Teleport to="body">
      <div v-if="editOpen" class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-4" @click.self="editOpen = false">
        <div class="w-full max-w-lg overflow-hidden rounded-lg border bg-card shadow-lg">
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h3 class="flex items-center gap-2 text-base font-semibold">
              <span class="text-primary">✦</span> 确认并优化配置
            </h3>
            <button type="button" class="rounded-md p-1 text-muted-foreground hover:text-foreground" @click="editOpen = false">
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="space-y-3 px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold">编辑预览</div>
              <div class="rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] text-amber-700">修改问题数据后即时生效</div>
            </div>
            <div class="rounded-lg border bg-muted/30 p-4">
              <div class="mb-2 text-xs font-semibold text-muted-foreground">监控问题 (限50字)</div>
              <textarea
                v-model="editText"
                maxlength="50"
                rows="3"
                class="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="监控问题（必填），不理想可自行修改…"
              />
              <div class="mt-1 text-right text-[11px] text-muted-foreground">{{ editText.length }}/50</div>
            </div>
          </div>
          <div class="flex items-center justify-between gap-3 border-t px-6 py-4">
            <Button size="sm" variant="ghost" @click="editOpen = false">上一步</Button>
            <Button
              size="sm"
              class="ml-auto max-w-xs flex-1"
              :disabled="!editText.trim() || submitting"
              @click="submitEdit"
            >
              <Check class="h-3.5 w-3.5" />
              确认并更新
            </Button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 新建分组 -->
    <Teleport to="body">
      <div v-if="groupOpen" class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-4" @click.self="groupOpen = false">
        <div class="w-full max-w-sm overflow-hidden rounded-lg border bg-card shadow-lg">
          <div class="flex items-center justify-between border-b px-5 py-4">
            <h3 class="text-base font-semibold">新建分组</h3>
            <button type="button" class="rounded-md p-1 text-muted-foreground hover:text-foreground" @click="groupOpen = false">
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="px-5 py-4">
            <input
              v-model="groupName"
              maxlength="30"
              placeholder="输入分组名称"
              class="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              @keydown.enter="submitGroup"
            />
          </div>
          <div class="flex justify-end gap-2 border-t px-5 py-3">
            <Button size="sm" variant="ghost" @click="groupOpen = false">取消</Button>
            <Button size="sm" :disabled="!groupName.trim() || submitting" @click="submitGroup">创建</Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Check,
  CircleHelp,
  Crown,
  Download,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-vue-next'
import { Message } from '@/lib/toast'
import { monitorApi } from '@/api/modules/monitor'
import { userApi } from '@/api/modules/user'
import { downloadAoaSheets } from '@/utils/xlsxExport'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card } from '@/components/ui'

const TYPE_LABEL: Record<string, string> = { industry: '排名词', brand: '口碑词' }
const fmtDate = (d: string) => (d || '').slice(0, 10).replace(/-/g, '/')

type Row = {
  id: number
  query: string
  query_type: 'industry' | 'brand'
  group_id: string | null
  created_at: string
  query_status: boolean
}

type Group = { group_id: string; name: string; query_count: number }

const route = useRoute()
const router = useRouter()

/** 口碑入口 ?from=sentiment 或 ?type=brand → 仅口碑词；排名入口展示全部分类 */
const isBrandPage = computed(() =>
  route.query.from === 'sentiment' || route.query.type === 'brand' || route.query.category === 'brand',
)
const listType = computed<'industry' | 'brand' | 'all'>(() => (isBrandPage.value ? 'brand' : 'all'))
const defaultAddType = computed<'industry' | 'brand'>(() => (isBrandPage.value ? 'brand' : 'industry'))
const pageScopeLabel = computed(() => (isBrandPage.value ? '口碑词' : '当前分类'))

const rows = ref<Row[]>([])
const groups = ref<Group[]>([])
const totalUsed = ref(0)
const totalLimit = ref(0)
const pendingRelease = ref(0)
const loading = ref(false)
const search = ref('')
const activeGroup = ref<string>('all')

const remainQuota = computed(() => Math.max(0, totalLimit.value - totalUsed.value))
const pageCount = computed(() => rows.value.length)
const ungroupedCount = computed(() => rows.value.filter(r => !r.group_id).length)

const filteredRows = computed(() => {
  let list = rows.value
  if (activeGroup.value === 'ungrouped') list = list.filter(r => !r.group_id)
  else if (activeGroup.value !== 'all') list = list.filter(r => r.group_id === activeGroup.value)
  const q = search.value.trim()
  if (q) list = list.filter(r => r.query.includes(q))
  return list
})

function groupTabCls(active: boolean, _withCount = false) {
  return [
    'inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-semibold transition-colors',
    active
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-input bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
  ]
}

function goPricing() {
  router.push('/dashboard/plan-upgrade')
}

async function load() {
  loading.value = true
  try {
    const [listResp, groupResp, sub, allResp]: any[] = await Promise.all([
      monitorApi.queryList(listType.value).catch(() => null),
      monitorApi.queryGroupList(listType.value).catch(() => null),
      userApi.subscription().catch(() => null),
      monitorApi.queryList('all').catch(() => null),
    ])
    const list = listResp?.list || []
    rows.value = list.map((q: any) => ({
      id: q.id ?? q.query_id,
      query: q.query,
      query_type: q.query_type === 'brand' ? 'brand' : 'industry',
      group_id: q.group_id || null,
      created_at: q.created_at,
      query_status: !!q.query_status,
    }))
    groups.value = (groupResp?.groups || []).map((g: any) => ({
      group_id: g.group_id,
      name: g.name,
      query_count: g.query_count || 0,
    }))
    const allList = allResp?.list || []
    totalUsed.value = allList.length || sub?.query_count || rows.value.length
    totalLimit.value = sub?.query_limit ?? 0
    pendingRelease.value = allList.length
      ? allList.filter((q: any) => !q.query_status).length
      : rows.value.filter(r => !r.query_status).length
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(listType, () => {
  activeGroup.value = 'all'
  load()
})

/* ---------- 添加 / 导入 ---------- */
const addOpen = ref(false)
const addMode = ref<'add' | 'import'>('add')
const addStep = ref<1 | 2>(1)
const addText = ref('')
const generalize = ref(true)
const previewLines = ref<string[]>([])
const submitting = ref(false)

const parsedLines = computed(() =>
  [...new Set(addText.value.split(/\n+/).map(s => s.trim()).filter(Boolean).map(s => s.slice(0, 50)))],
)

function openAdd() {
  addMode.value = 'add'
  addStep.value = 1
  addText.value = ''
  generalize.value = true
  previewLines.value = []
  addOpen.value = true
}

function openImport() {
  openAdd()
  addMode.value = 'import'
}

function closeAdd() {
  addOpen.value = false
}

function rewriteLine(line: string) {
  if (!generalize.value) return line
  if (/[？?吗呢]$/.test(line) || /怎么样|哪家|推荐|如何|好不好/.test(line)) return line
  return `我想了解一下「${line}」，请帮我推荐几款`
}

function goAddNext() {
  previewLines.value = parsedLines.value.map(rewriteLine)
  addStep.value = 2
}

async function submitAdd() {
  if (!previewLines.value.length) return
  if (previewLines.value.length > remainQuota.value) {
    Message.warning(`剩余额度不足（剩余 ${remainQuota.value}）`)
    return
  }
  submitting.value = true
  try {
    await monitorApi.queryAdd({
      queries: previewLines.value,
      query_type: defaultAddType.value,
    })
    addOpen.value = false
    Message.success('监控问题已添加')
    await load()
  } catch (e: any) {
    Message.error(e?.message || '添加失败')
  } finally {
    submitting.value = false
  }
}

/* ---------- 编辑 ---------- */
const editOpen = ref(false)
const editId = ref(0)
const editText = ref('')

function openEdit(q: Row) {
  editId.value = q.id
  editText.value = q.query
  editOpen.value = true
}

async function submitEdit() {
  const text = editText.value.trim().slice(0, 50)
  if (!text) return
  submitting.value = true
  try {
    await monitorApi.queryUpdate({ query_id: editId.value, query: text })
    editOpen.value = false
    Message.success('监控问题已更新')
    await load()
  } catch (e: any) {
    Message.error(e?.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

/* ---------- 删除 / 状态 / 分组 ---------- */
async function confirmDelete(q: Row) {
  if (!confirm(`确定删除监控问题「${q.query}」？删除后将释放 1 个额度。`)) return
  try {
    await monitorApi.queryDelete(q.id)
    Message.success('已删除')
    await load()
  } catch (e: any) {
    Message.error(e?.message || '删除失败')
  }
}

async function toggleStatus(q: Row) {
  try {
    await monitorApi.queryUpdate({ query_id: q.id, query_status: !q.query_status })
    await load()
  } catch (e: any) {
    Message.error(e?.message || '状态更新失败')
  }
}

async function onMoveGroup(queryId: number, groupId: string) {
  try {
    await monitorApi.queryGroupMove(queryId, groupId || null)
    await load()
  } catch (e: any) {
    Message.error(e?.message || '移动分组失败')
  }
}

const groupOpen = ref(false)
const groupName = ref('')

function openCreateGroup() {
  groupName.value = ''
  groupOpen.value = true
}

async function submitGroup() {
  const name = groupName.value.trim()
  if (!name) return
  submitting.value = true
  try {
    await monitorApi.queryGroupSave({ name, query_type: defaultAddType.value })
    groupOpen.value = false
    Message.success('分组已创建')
    await load()
  } catch (e: any) {
    Message.error(e?.message || '创建分组失败')
  } finally {
    submitting.value = false
  }
}

/* ---------- 导出 / 拖拽排序 ---------- */
function exportList() {
  const header = ['监控类型', '问题', '分组', '添加时间', '状态']
  const aoa = [
    header,
    ...filteredRows.value.map(r => [
      TYPE_LABEL[r.query_type] || r.query_type,
      r.query,
      groups.value.find(g => g.group_id === r.group_id)?.name || '未分组',
      fmtDate(r.created_at),
      r.query_status ? '监控中' : '已停用',
    ]),
  ]
  downloadAoaSheets(
    [{ name: '监控问题', rows: aoa, cols: [{ wch: 10 }, { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 10 }] }],
    `监控问题_${new Date().toISOString().slice(0, 10)}.xlsx`,
  )
  Message.success('导出成功')
}

const dragId = ref<number | null>(null)
function onDragStart(id: number, ev: DragEvent) {
  dragId.value = id
  ev.dataTransfer?.setData('text/plain', String(id))
}
async function onDrop(targetId: number) {
  const fromId = dragId.value
  dragId.value = null
  if (!fromId || fromId === targetId) return
  const list = [...rows.value]
  const fromIdx = list.findIndex(r => r.id === fromId)
  const toIdx = list.findIndex(r => r.id === targetId)
  if (fromIdx < 0 || toIdx < 0) return
  const [item] = list.splice(fromIdx, 1)
  list.splice(toIdx, 0, item)
  rows.value = list
  try {
    await monitorApi.querySort(list.map((r, i) => ({ query_id: r.id, query_order: i })))
  } catch {
    await load()
  }
}
</script>
