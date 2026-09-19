<template>
  <!-- 落地：品牌输入 -->
  <div v-if="phase === 'landing'" class="mx-auto flex w-full max-w-2xl flex-col items-stretch px-4 py-16 sm:py-24">
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        透
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {{ heroTitleLight }}
        <span class="text-primary">{{ heroTitleGrad }}</span>
      </h1>
      <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {{ heroSub }}
      </p>
    </div>

    <div class="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <textarea
        v-model="form.text"
        class="min-h-[96px] w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="描述你的品牌，例如：我的品牌叫「格力空调」，是国内领先的空调品牌，官网是 www.gree.com，主要竞品是美的和海尔…"
        rows="3"
        @keydown.enter.exact.prevent="onSubmit"
      />

      <div v-if="showLink" class="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-input bg-muted/40 px-3 py-2">
        <Link2 class="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          v-model="form.website"
          class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="粘贴官网链接，如 hanyuai.com（可选）"
        >
        <button type="button" class="text-muted-foreground hover:text-foreground" @click="showLink = false; form.website = ''">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap gap-1.5">
          <Button variant="ghost" size="sm" type="button" class="text-muted-foreground" @click="showLink = !showLink">
            <Link2 class="h-3.5 w-3.5" />
            添加官网链接
          </Button>
          <Button variant="ghost" size="sm" type="button" class="text-muted-foreground" @click="docHint = true">
            <FileText class="h-3.5 w-3.5" />
            上传文档
          </Button>
        </div>
        <Button type="button" :disabled="!form.text.trim()" @click="onSubmit">
          {{ sendLabel }}
        </Button>
      </div>
    </div>

    <p v-if="hint" class="mt-3 text-center text-xs text-amber-600">{{ hint }}</p>

    <div class="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
      <span>快速填入</span>
      <button
        v-for="c in quickChips"
        :key="c"
        type="button"
        class="rounded-md border bg-background px-2.5 py-1 text-foreground transition-colors hover:bg-accent"
        @click="fillChip(c)"
      >
        {{ c }}
      </button>
    </div>

    <p class="mt-8 text-center text-xs text-muted-foreground">
      自动监测 · 竞对分析 · 绝对中立
    </p>
  </div>

  <!-- 对话态 -->
  <div v-else class="mx-auto flex h-[min(100vh,900px)] w-full max-w-2xl flex-col px-4 pb-4 pt-6">
    <div ref="wrapEl" class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
      <template v-for="m in msgs" :key="m.id">
        <div
          v-if="m.type === 'user'"
          class="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
        >
          {{ m.text }}
        </div>

        <div
          v-else-if="m.type === 'ai'"
          class="mr-auto max-w-[90%] rounded-2xl rounded-bl-md border bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground shadow-sm"
        >
          {{ m.text }}
        </div>

        <div
          v-else-if="m.type === 'think'"
          class="rounded-xl border bg-card shadow-sm"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium"
            @click="m.open = !m.open"
          >
            <Loader2 v-if="!m.done" class="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
            <CheckCircle2 v-else class="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span class="flex-1">{{ m.title }}</span>
            <ChevronDown class="h-3.5 w-3.5 text-muted-foreground transition-transform" :class="m.open ? 'rotate-180' : ''" />
          </button>
          <div v-show="m.open" class="space-y-1.5 border-t px-3.5 py-2.5">
            <div
              v-for="(it, i) in m.items"
              :key="i"
              class="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <div class="min-w-0 flex-1">
                <a
                  v-if="it.href"
                  class="text-primary hover:underline"
                  :href="it.href"
                  target="_blank"
                  rel="noopener"
                >{{ it.name }}</a>
                <span v-else class="text-foreground/80">{{ it.name }}</span>
                <span v-if="it.detail" class="ml-1">{{ it.detail }}</span>
              </div>
              <Loader2 v-if="it.status === 'run'" class="mt-0.5 h-3 w-3 shrink-0 animate-spin text-primary" />
              <CheckCircle2 v-else class="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
            </div>
          </div>
        </div>

        <div v-else-if="m.type === 'topics'" class="space-y-2">
          <div
            v-for="(c, i) in m.candidates"
            :key="c.query"
            class="flex gap-3 rounded-xl border bg-card px-3.5 py-3 shadow-sm"
          >
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
              {{ i + 1 }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] text-muted-foreground">
                {{ c.is_golden ? '金标 · ' : '' }}热度 {{ c.weight }} · 行业中立
                <template v-if="c.query_description"> · {{ c.query_description }}</template>
              </div>
              <div class="mt-0.5 text-sm font-medium">{{ c.query }}</div>
            </div>
          </div>
        </div>

        <div
          v-else-if="m.type === 'report'"
          class="rounded-xl border bg-card p-5 shadow-sm"
        >
          <h3 class="text-base font-bold tracking-tight">分析完成，品牌档案已建立</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            品牌「{{ m.summary.brand }}」 · 行业：{{ m.summary.industry || '待完善' }}<br>
            识别别名 {{ m.summary.aliases }} 个 · 竞品 {{ m.summary.competitors }} 个 · 已开启监控问题 {{ m.summary.queries }} 个
          </p>
          <p class="mt-2 text-xs text-muted-foreground">明日起每日自动采集各 AI 引擎回答，生成排名与口碑报告。</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <Button type="button" @click="goConsole">前往控制台</Button>
            <Button type="button" variant="outline" @click="reset">再分析一个品牌</Button>
          </div>
        </div>
      </template>

      <div v-if="showRetry" class="pt-1">
        <Button type="button" variant="outline" size="sm" @click="reset">重新分析</Button>
      </div>
    </div>

    <!-- 底部确认 / 状态 -->
    <div class="mt-3 shrink-0">
      <div v-if="phase === 'confirm' && preview" class="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div class="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5">
          <p class="text-xs font-medium text-foreground">
            确认品牌词、识别名与监控问题（最多 {{ limit }} 个）· 已选 {{ selected.size }}/{{ limit }}
          </p>
          <button type="button" class="shrink-0 text-xs text-muted-foreground hover:text-foreground" @click="skipConfirm">
            暂不选择
          </button>
        </div>

        <div class="max-h-[46vh] space-y-4 overflow-y-auto px-4 py-4">
          <section>
            <h4 class="text-sm font-semibold">品牌词 · 正式识别名</h4>
            <p class="mt-0.5 text-xs text-muted-foreground">口碑题与命中统计都归到这个名字</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <template v-if="brandEditing">
                <input
                  ref="brandInputEl"
                  v-model="brandDraft"
                  class="h-9 min-w-[160px] flex-1 rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  maxlength="60"
                  placeholder="输入品牌正式名"
                  @keydown="onBrandKeydown"
                >
                <Button type="button" size="sm" @click="saveBrandEdit">保存</Button>
                <Button type="button" size="sm" variant="ghost" @click="cancelBrandEdit">取消</Button>
              </template>
              <template v-else>
                <span class="text-sm font-semibold">{{ draftBrandName || '—' }}</span>
                <Button type="button" size="sm" variant="outline" @click="startBrandEdit">修改</Button>
              </template>
            </div>
            <p v-if="brandHint" class="mt-1.5 text-xs text-amber-600">{{ brandHint }}</p>
          </section>

          <section>
            <h4 class="text-sm font-semibold">相似识别名</h4>
            <p class="mt-0.5 text-xs text-muted-foreground">AI 回答出现这些写法都会算作你的品牌（最多 {{ aliasLimit }} 个）</p>
            <div class="mt-2 flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5">
              <span
                v-for="a in draftAliases"
                :key="'alias:' + a"
                class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {{ a }}
                <button type="button" class="opacity-60 hover:opacity-100" aria-label="移除" @click="removeAlias(a)">×</button>
              </span>
              <input
                v-model="aliasInput"
                type="text"
                class="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                :disabled="draftAliases.length >= aliasLimit"
                :placeholder="draftAliases.length >= aliasLimit ? '已达上限' : '输入后回车添加…'"
                maxlength="60"
                @keydown="onAliasKeydown"
              >
            </div>
            <p v-if="aliasHint" class="mt-1.5 text-xs text-amber-600">{{ aliasHint }}</p>
          </section>

          <section>
            <h4 class="text-sm font-semibold">监控问题</h4>
            <p class="mt-0.5 text-xs text-muted-foreground">勾选或改写；请保持行业中立、不含品牌名</p>
            <p v-if="editHint" class="mt-1.5 text-xs text-amber-600">{{ editHint }}</p>
            <div class="mt-2 space-y-2">
              <div
                v-for="(c, i) in preview.candidates"
                :key="candKey(c, i)"
                class="cursor-pointer rounded-lg border px-3 py-2.5 transition-colors"
                :class="selected.has(i) ? 'border-primary bg-primary/5' : 'bg-card hover:bg-muted/40'"
                @click="toggleSelect(i)"
              >
                <div class="flex items-start gap-2">
                  <template v-if="editingIdx === i">
                    <input
                      ref="editInputEl"
                      v-model="editDraft"
                      class="h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxlength="80"
                      @click.stop
                      @keydown="onQueryEditKeydown($event, i)"
                    >
                    <Button type="button" size="sm" @click.stop="saveEdit(i)">保存</Button>
                    <Button type="button" size="sm" variant="ghost" @click.stop="cancelEdit">取消</Button>
                  </template>
                  <template v-else>
                    <div class="min-w-0 flex-1 text-sm font-medium">
                      {{ c.is_golden ? '★ ' : '' }}{{ c.query }}
                    </div>
                    <Button type="button" size="sm" variant="ghost" class="shrink-0" @click.stop="startEdit(i)">修改</Button>
                  </template>
                </div>
                <p v-if="c.query_description && editingIdx !== i" class="mt-1 text-xs text-muted-foreground">{{ c.query_description }}</p>
                <div v-if="editingIdx !== i" class="mt-1.5 flex flex-wrap gap-1">
                  <span class="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">热度 {{ c.weight }}</span>
                  <span class="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">行业排名</span>
                  <span v-if="c.is_golden" class="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">金标</span>
                  <span v-if="isEdited(c)" class="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-200">已修改</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="flex flex-wrap gap-2 border-t px-4 py-3">
          <Button
            type="button"
            :disabled="selected.size === 0 || saving || editingIdx != null || brandEditing || !draftBrandName.trim()"
            @click="doConfirm"
          >
            {{ saving ? '保存中…' : `确认监控 ${selected.size} 个问题` }}
          </Button>
          <Button type="button" variant="outline" :disabled="saving" @click="skipConfirm">跳过</Button>
        </div>
      </div>

      <div
        v-else
        class="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
          <Loader2 v-if="phase === 'running'" class="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
          <span class="truncate">{{ phase === 'running' ? runningTip : doneTip }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * /trial 首登分析对话流（dash-v2 样式）
 */
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle2, ChevronDown, FileText, Link2, Loader2, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { getOnboardingToken, onboardingConfirm, onboardingStream } from '@/api/modules/onboarding'
import { Button } from '@/components/ui'

defineOptions({ name: 'TrialChat' })

interface ThinkItem { name: string, status: 'run' | 'done', detail?: string, href?: string }
interface Msg {
  id: number, type: 'user' | 'ai' | 'think' | 'topics' | 'report'
  text?: string, title?: string, done?: boolean, open?: boolean
  items?: ThinkItem[], candidates?: any[], summary?: any
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isLoggedIn = computed(() => auth.isAuthenticated)
const getToken = getOnboardingToken
const isAddBrand = computed(() => String(route.query.from || '') === 'add_brand')
const savedBrandId = ref('')
const showRetry = ref(false)

async function goConsole() {
  if (savedBrandId.value) auth.switchBrand(savedBrandId.value)
  try {
    await auth.refreshBrands()
  } catch { /* ignore */ }
  if (savedBrandId.value) auth.switchBrand(savedBrandId.value)
  router.push('/dashboard/overview')
}

const QUICK = ['小鹏汽车', '完美日记', '格力空调', '维乐口腔']
const quickChips = QUICK
const limit = 3
const aliasLimit = 8

const phase = ref<'landing' | 'running' | 'confirm' | 'done' | 'error'>('landing')
const form = reactive({ text: '', website: '' })
const showLink = ref(false)
const hint = ref('')
const docHint = ref(false)
const msgs = reactive<Msg[]>([])
const preview = ref<any>(null)
const selected = reactive(new Set<number>())
const draftAliases = reactive<string[]>([])
const aliasInput = ref('')
const aliasHint = ref('')
const draftBrandName = ref('')
const brandEditing = ref(false)
const brandDraft = ref('')
const brandHint = ref('')
const brandInputEl = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const editingIdx = ref<number | null>(null)
const editDraft = ref('')
const editHint = ref('')
const editInputEl = ref<HTMLInputElement | null>(null)
const wrapEl = ref<HTMLElement | null>(null)
const runningTip = ref('分析进行中…')
const doneTip = computed(() => (
  isAddBrand.value
    ? '已完成。可前往控制台查看新品牌，或再分析另一个品牌。'
    : '已完成。可前往控制台查看明细，或点击报告卡再分析一个品牌。'
))
const heroTitleLight = computed(() => (isAddBrand.value ? '添加一个新品牌，' : '当客户问 AI 时，'))
const heroTitleGrad = computed(() => (isAddBrand.value ? '继续免费分析' : '你被 AI 推荐了吗？'))
const heroSub = computed(() => (
  isAddBrand.value
    ? '为账号再增加一个监测空间——描述品牌后走同样的建档流程，完成后可在控制台左上角切换。'
    : 'AI 流量时代，别让品牌隐形——告诉我你的品牌，立即免费分析它在豆包、DeepSeek、通义千问等大模型中的真实排名。'
))
const sendLabel = computed(() => (isAddBrand.value ? '开始添加品牌' : '开始免费分析'))
let seq = 0
let pendingStart = false
let curBlock: Msg | null = null

watch(docHint, (v) => {
  if (v) {
    hint.value = '文档解析即将上线，先粘贴官网链接即可～'
    setTimeout(() => { docHint.value = false }, 2400)
  }
})

function extractBrand(rawText: string): { name: string, website: string, cleanText: string } {
  let t = rawText.trim()
  let website = ''
  const md = t.match(/\[([^\]]{1,80})\]\((https?:\/\/[^)\s]{4,200})\)/)
  if (md) {
    website = md[2].replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
    t = t.replace(md[0], md[1]).trim()
  }
  if (!website) {
    const url = t.match(/(?:https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(\/\S*)?/i)
    if (url) website = url[1]
  }
  const q = t.match(/[「『"]([^」』"]{1,30})[」』"]/)
  const n2 = t.match(/品牌(?:叫|是|为)[:： ]?([^，。,.\s]{1,30})/)
  let name = (q?.[1] || n2?.[1] || '').trim()
  if (!name) {
    const tokens = t.replace(/https?:\/\/\S+/gi, ' ').split(/[\s，。,.；;：:（）()]+/).filter(Boolean)
    for (const tok of tokens) {
      if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(tok)) continue
      if (
        /^[a-z0-9-]{2,30}$/i.test(tok)
        || /^[一-龥]{2,20}$/.test(tok)
        || /^(?=.*[一-龥])(?=.*[a-z0-9])[一-龥a-z0-9-]{2,30}$/i.test(tok)
      ) { name = tok; break }
    }
  }
  if (!name && /^[一-龥a-z0-9][一-龥a-z0-9-]{1,29}$/i.test(t) && !/\./.test(t)) {
    name = t
  }
  return { name: name.slice(0, 30), website, cleanText: t }
}

function fillChip(c: string) {
  form.text = `我的品牌叫「${c}」`
  hint.value = ''
}

async function onSubmit() {
  const text = form.text.trim()
  if (!text) return
  const ex = extractBrand(text)
  const website = form.website.trim() || ex.website
  if (!ex.name && !website) {
    hint.value = '没认出来品牌名——请用「品牌名」的写法，或点上方「添加官网链接」粘贴官网。'
    return
  }
  if (!getToken() || !isLoggedIn.value) {
    pendingStart = true
    router.push({ path: '/login', query: { redirect: '/trial' } })
    return
  }
  await start(ex.cleanText, ex.name, website)
}

watch(isLoggedIn, async (v) => {
  if (v && pendingStart) {
    pendingStart = false
    const ex = extractBrand(form.text)
    await start(ex.cleanText, ex.name, form.website.trim() || ex.website)
  }
})

function push(m: Omit<Msg, 'id'>): Msg {
  const msg = { ...m, id: ++seq } as Msg
  msgs.push(msg)
  scroll()
  return msg
}
function scroll() {
  nextTick(() => {
    const el = wrapEl.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function openBlock(title: string, items: ThinkItem[] = []): Msg {
  curBlock = push({ type: 'think', title, done: false, open: true, items })
  return curBlock
}
function closeBlock() {
  if (curBlock) {
    curBlock.done = true
    curBlock.items?.forEach((it) => { it.status = 'done' })
    curBlock.open = false
    curBlock = null
    scroll()
  }
}
function addItem(name: string, status: 'run' | 'done' = 'done', extra?: { detail?: string; href?: string }) {
  if (!curBlock) return
  curBlock.items?.push({ name, status, ...(extra || {}) })
  scroll()
}

async function start(userText: string, brandName: string, website: string) {
  phase.value = 'running'
  runningTip.value = '分析进行中…'
  showRetry.value = false
  msgs.splice(0, msgs.length)
  preview.value = null
  selected.clear()
  curBlock = null

  const display = brandName || website || '你的品牌'
  push({ type: 'user', text: userText })
  push({ type: 'ai', text: `好的，我来分析「${display}」在主流 AI 助手中的可见度。${website ? `先读取官网 ${website}，` : ''}全程约 1~2 分钟。` })

  try {
    await onboardingStream({
      brand_name: brandName || '',
      website,
      business_desc: userText,
      save: false,
    }, onEvent)
  } catch (e) {
    closeBlock()
    phase.value = 'error'
    const status = (e as Error & { status?: number })?.status
    if (status === 401) {
      push({ type: 'ai', text: '登录已过期，请重新登录，登录后自动继续本次分析。' })
      pendingStart = true
      router.push({ path: '/login', query: { redirect: '/trial' } })
      return
    }
    if (status === 404) {
      push({ type: 'ai', text: '分析服务未就绪（404）：本地 API 运行的不是最新代码，请重启 API（pnpm --filter @geo-admin/gen-api run dev:memory）后再试。' })
    } else {
      push({ type: 'ai', text: `分析中断：${(e as Error)?.message || '网络异常'}。请稍后重试。` })
    }
    pushRetry()
  }
}

function pushRetry() {
  push({ type: 'ai', text: '点击下方按钮重新开始分析。' })
  showRetry.value = true
}

function onEvent(ev: string, data: any) {
  if (ev === 'stage') {
    const st = data?.stage
    closeBlock()
    if (st === 'crawl' && form.website.trim()) openBlock('读取品牌资料', [{ name: `官网 ${form.website.trim()}`, status: 'run' }])
    else if (st === 'web_research') { /* skip UI */ }
    else if (st === 'analyze') openBlock('识别品牌与生成画像', [{ name: '解析品牌要素（行业/别名/竞品/卖点）', status: 'run' }])
    else if (st === 'queries') openBlock('生成候选监控问题', [{ name: '检索真实用户会问 AI 的问题', status: 'run' }])
    else if (st === 'weigh') openBlock('验证关键词热度', [])
    else if (st === 'library') openBlock('撰写品牌情报文', [{ name: '品牌口碑与市场处境（品牌挖掘）', status: 'run' }])
    return
  }
  if (ev === 'trace') {
    if (data?.kind === 'page_read') {
      addItem(`已读 ${data.url || '官网'}${data.meta?.title ? `（${String(data.meta.title).slice(0, 24)}）` : ''}`)
    } else if (data?.kind === 'search_query') {
      if (data?.meta?.phase === 'web_research') return
      addItem(`搜索：${data.query}`)
    } else if (data?.kind === 'keyword_weight') {
      addItem(`「${String(data.keyword || '').slice(0, 22)}」 热度 ${data.weight}${data.meta?.source === 'real_search' ? ' · 搜索验证' : ''}`)
    }
    return
  }
  if (ev === 'evidence') return
  if (ev === 'profile' && data?.brand) {
    closeBlock()
    const b = data.brand
    push({ type: 'ai', text: `已识别品牌「${b.name}」${b.industry ? `，行业：${b.industry}` : ''}。找到 ${data.competitors ?? 0} 个竞品方向、${(data.aliases || []).length} 个别名，继续深挖。` })
    return
  }
  if (ev === 'candidates' && Array.isArray(data?.candidates)) {
    closeBlock()
    const filtered = data.filtered_out ? `另有 ${data.filtered_out} 条含品牌名的问法已自动剔除。` : ''
    push({ type: 'ai', text: `基于真实提问习惯生成了 ${data.count} 条候选监控问题（均为不含品牌名的行业中立问法），热度${data.weight_source === 'real_search' ? '已由搜索数据验证' : '为模型预估'}，按热度从高到低：${filtered}` })
    push({ type: 'topics', candidates: data.candidates })
    return
  }
  if (ev === 'library' && data?.slug) {
    closeBlock()
    push({ type: 'ai', text: `情报文「品牌口碑与市场处境」已成稿（约 ${data.word_count} 字），将进入品牌知识库反哺后续报告。` })
    return
  }
  if (ev === 'error') {
    closeBlock()
    phase.value = 'error'
    push({ type: 'ai', text: `分析失败：${data?.msg || '未知错误'}` })
    pushRetry()
    return
  }
  if (ev === 'result' && data?.code === 200 && data?.data?.result) {
    closeBlock()
    preview.value = data.data.result
    preselect()
    phase.value = 'confirm'
  }
}

function preselect() {
  selected.clear()
  editingIdx.value = null
  editDraft.value = ''
  editHint.value = ''
  aliasInput.value = ''
  aliasHint.value = ''
  brandEditing.value = false
  brandDraft.value = ''
  brandHint.value = ''
  draftAliases.splice(0, draftAliases.length)
  const brandName = String(preview.value?.brand?.name || '').trim()
  draftBrandName.value = brandName
  const brandLower = brandName.toLowerCase()
  const seen = new Set<string>()
  for (const raw of preview.value?.aliases || []) {
    const a = String(raw || '').trim().slice(0, 60)
    if (!a) continue
    const key = a.toLowerCase()
    if (key === brandLower || seen.has(key)) continue
    seen.add(key)
    draftAliases.push(a)
    if (draftAliases.length >= aliasLimit) break
  }
  const list = preview.value?.candidates || []
  for (const c of list) {
    if (c && c._original_query == null) c._original_query = String(c.query || '')
  }
  for (let i = 0; i < list.length; i++) {
    if (list[i]?.is_golden && selected.size < limit) selected.add(i)
  }
  if (selected.size === 0) {
    for (let i = 0; i < Math.min(limit, list.length); i++) selected.add(i)
  }
}

function startBrandEdit() {
  brandDraft.value = draftBrandName.value
  brandEditing.value = true
  brandHint.value = ''
  nextTick(() => brandInputEl.value?.focus?.())
}

function cancelBrandEdit() {
  brandEditing.value = false
  brandDraft.value = ''
  brandHint.value = ''
}

function onBrandKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229) return
  if (e.key === 'Enter') {
    e.preventDefault()
    saveBrandEdit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancelBrandEdit()
  }
}

function saveBrandEdit() {
  const next = brandDraft.value.trim().replace(/\s+/g, ' ').slice(0, 60)
  if (!next) {
    brandHint.value = '品牌词不能为空'
    return
  }
  if (next.length < 2) {
    brandHint.value = '品牌词至少 2 个字'
    return
  }
  const old = draftBrandName.value.trim()
  draftBrandName.value = next
  for (let i = draftAliases.length - 1; i >= 0; i--) {
    if (draftAliases[i].toLowerCase() === next.toLowerCase()) draftAliases.splice(i, 1)
  }
  if (old && old.toLowerCase() !== next.toLowerCase()) {
    const seen = new Set(draftAliases.map(a => a.toLowerCase()))
    if (!seen.has(old.toLowerCase()) && draftAliases.length < aliasLimit) {
      draftAliases.unshift(old)
    }
  }
  if (preview.value?.brand) preview.value.brand.name = next
  brandEditing.value = false
  brandDraft.value = ''
  brandHint.value = ''
}

function removeAlias(alias: string) {
  const i = draftAliases.indexOf(alias)
  if (i >= 0) draftAliases.splice(i, 1)
  aliasHint.value = ''
}

function addAlias(raw: string) {
  const parts = String(raw || '').split(/[,，]/).map(s => s.trim()).filter(Boolean)
  if (!parts.length) return
  const brandLower = draftBrandName.value.trim().toLowerCase()
  const seen = new Set(draftAliases.map(a => a.toLowerCase()))
  let added = 0
  let skippedBrand = false
  let skippedDup = false
  for (const p of parts) {
    const next = p.slice(0, 60)
    const key = next.toLowerCase()
    if (!next) continue
    if (key === brandLower) { skippedBrand = true; continue }
    if (seen.has(key)) { skippedDup = true; continue }
    if (draftAliases.length >= aliasLimit) {
      aliasHint.value = `识别名最多 ${aliasLimit} 个`
      break
    }
    seen.add(key)
    draftAliases.push(next)
    added++
  }
  aliasInput.value = ''
  if (added) aliasHint.value = ''
  else if (skippedBrand) aliasHint.value = '与品牌词相同，无需再加为识别名'
  else if (skippedDup) aliasHint.value = '该识别名已存在'
}

function onAliasKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229) return
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addAlias(aliasInput.value)
  } else if (e.key === 'Backspace' && !aliasInput.value && draftAliases.length) {
    draftAliases.pop()
    aliasHint.value = ''
  }
}

function selectedAliases(): string[] {
  if (aliasInput.value.trim()) addAlias(aliasInput.value)
  return [...draftAliases]
}

function candKey(c: any, i: number) {
  return c?._original_query ? `o:${c._original_query}:${i}` : `i:${i}`
}

function isEdited(c: any) {
  const orig = c?._original_query
  return typeof orig === 'string' && orig.length > 0 && String(c.query || '') !== orig
}

function toggleSelect(i: number) {
  if (editingIdx.value === i) return
  if (selected.has(i)) selected.delete(i)
  else if (selected.size < limit) selected.add(i)
  else {
    const first = selected.values().next().value
    if (typeof first === 'number') selected.delete(first)
    selected.add(i)
  }
}

function startEdit(i: number) {
  const c = preview.value?.candidates?.[i]
  if (!c) return
  editHint.value = ''
  editingIdx.value = i
  editDraft.value = String(c.query || '')
  nextTick(() => {
    const el = Array.isArray(editInputEl.value) ? editInputEl.value[0] : editInputEl.value
    el?.focus?.()
    el?.select?.()
  })
}

function cancelEdit() {
  editingIdx.value = null
  editDraft.value = ''
  editHint.value = ''
}

function onQueryEditKeydown(e: KeyboardEvent, i: number) {
  if (e.isComposing || e.keyCode === 229) return
  if (e.key === 'Enter') {
    e.preventDefault()
    saveEdit(i)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
  }
}

function applyQueryEdit(c: any, next: string) {
  c.query = next
  c.platform_prompt = next
  c.platform_query = next
  c.user_friendly = next
  if (!Array.isArray(c.question_list) || !c.question_list.length) {
    c.question_list = [{ user_friendly: next, platform_query: next }]
  } else {
    c.question_list = c.question_list.map((q: any, qi: number) => (
      qi === 0
        ? { ...q, user_friendly: next, platform_query: next }
        : q
    ))
  }
}

function saveEdit(i: number) {
  const c = preview.value?.candidates?.[i]
  const next = editDraft.value.trim().replace(/\s+/g, ' ')
  if (!c || !next) return
  if (next.length < 2) {
    editHint.value = '问题至少 2 个字'
    return
  }
  applyQueryEdit(c, next.slice(0, 80))
  editingIdx.value = null
  editDraft.value = ''
  editHint.value = ''
}

function selectedQueries(): string[] {
  const list = preview.value?.candidates || []
  return [...selected]
    .sort((a, b) => a - b)
    .map(i => String(list[i]?.query || '').trim())
    .filter(Boolean)
}

async function doConfirm() {
  if (!preview.value || selected.size === 0 || saving.value) return
  if (brandEditing.value) {
    brandHint.value = '请先保存正在编辑的品牌词'
    return
  }
  if (editingIdx.value != null) {
    editHint.value = '请先保存正在编辑的问题'
    return
  }
  const brandName = draftBrandName.value.trim().replace(/\s+/g, ' ').slice(0, 60)
  if (!brandName || brandName.length < 2) {
    brandHint.value = '请填写有效的品牌词（至少 2 个字）'
    return
  }
  const queries = selectedQueries()
  if (!queries.length) return
  const brandLower = brandName.toLowerCase()
  const aliases = selectedAliases().filter(a => a.toLowerCase() !== brandLower)
  if (preview.value.brand) preview.value.brand.name = brandName
  preview.value.aliases = aliases
  saving.value = true
  try {
    const res = await onboardingConfirm({
      preview: preview.value,
      brand_name: brandName,
      selected_queries: queries,
      selected_aliases: aliases,
    })
    const saved = res?.saved
    if (saved?.brand_id) savedBrandId.value = saved.brand_id
    phase.value = 'done'
    const aliasTip = aliases.length ? `相似识别名：${aliases.join('、')}。` : ''
    push({
      type: 'ai',
      text: `已确认品牌「${brandName}」，开启监控：${queries.join('、')}。${aliasTip}竞品档案同步建立。`,
    })
    push({
      type: 'report',
      summary: {
        brand: brandName,
        industry: preview.value.brand?.industry || preview.value.profile?.industry?.[0] || '',
        aliases: saved?.counts?.aliases ?? aliases.length,
        competitors: saved?.counts?.competitors ?? preview.value.competitors?.length ?? 0,
        queries: saved?.counts?.queries ?? queries.length,
      },
    })
  } catch (e) {
    push({ type: 'ai', text: `保存失败：${(e as Error)?.message || '网络异常'}，请重试。` })
  } finally {
    saving.value = false
  }
}

function skipConfirm() {
  phase.value = 'done'
  push({ type: 'ai', text: '好的，本次不保存监控问题。完整画像与候选已生成，可随时重新分析。' })
  push({
    type: 'report',
    summary: {
      brand: preview.value?.brand?.name || '—',
      industry: preview.value?.brand?.industry || '',
      aliases: preview.value?.aliases?.length ?? 0,
      competitors: preview.value?.competitors?.length ?? 0,
      queries: 0,
    },
  })
}

function reset() {
  phase.value = 'landing'
  showRetry.value = false
  msgs.splice(0, msgs.length)
  preview.value = null
  selected.clear()
  draftAliases.splice(0, draftAliases.length)
  aliasInput.value = ''
  aliasHint.value = ''
  draftBrandName.value = ''
  brandEditing.value = false
  brandDraft.value = ''
  brandHint.value = ''
  editingIdx.value = null
  editDraft.value = ''
  editHint.value = ''
  form.text = ''
  form.website = ''
  showLink.value = false
  hint.value = ''
  savedBrandId.value = ''
}
</script>
