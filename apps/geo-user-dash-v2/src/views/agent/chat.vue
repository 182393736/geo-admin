<template>
  <div class="mx-auto max-w-[760px] space-y-6 px-6 py-10">
    <!-- Hero -->
    <div class="text-center">
      <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">今天想让 Agent 帮你做什么？</h1>
      <p class="mt-2 min-h-[1.25rem] text-sm text-muted-foreground">{{ modeCfg.sub }}</p>
      <div class="mt-5 flex flex-wrap items-center justify-center gap-1.5">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors"
          :class="mode === tab.key
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
          @click="mode = tab.key"
        >
          <component :is="tab.icon" class="h-3.5 w-3.5" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Composer card -->
    <Card
      class="relative overflow-hidden transition-shadow"
      :class="starting ? 'ring-2 ring-primary/40' : 'focus-within:ring-2 focus-within:ring-ring'"
    >
      <CardContent class="space-y-3 p-4 sm:p-5">
        <!-- Chips row -->
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="mode === 'writing'">
            <div ref="topicRoot" class="relative">
              <button
                type="button"
                class="inline-flex items-center gap-2.5 rounded-lg border bg-background px-2 py-1.5 text-left transition-colors hover:bg-accent"
                @click.stop="topicOpen = !topicOpen"
              >
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot class="h-3.5 w-3.5" />
                </div>
                <span class="min-w-0 leading-tight">
                  <span class="block max-w-[160px] truncate text-xs font-medium">{{ selectedTopicLabel }}</span>
                  <span class="block text-[10px] text-muted-foreground">监控话题</span>
                </span>
                <ChevronDown
                  class="h-3 w-3 shrink-0 text-muted-foreground transition-transform"
                  :class="topicOpen ? 'rotate-180' : ''"
                />
              </button>
              <div
                v-if="topicOpen"
                class="absolute left-0 top-full z-20 mt-1.5 max-h-[280px] min-w-[260px] max-w-[360px] overflow-auto rounded-lg border bg-popover p-1.5 shadow-md"
                @click.stop
              >
                <button
                  type="button"
                  class="block w-full rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent"
                  @click="pickTopic(null)"
                >不指定话题</button>
                <button
                  v-for="q in topics"
                  :key="q.query_id"
                  type="button"
                  class="block w-full rounded-md px-2.5 py-2 text-left text-xs transition-colors"
                  :class="selectedQueryId === q.query_id
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'hover:bg-accent'"
                  @click="pickTopic(q)"
                >{{ q.query }}</button>
                <div v-if="!topics.length" class="px-2.5 py-2 text-xs text-muted-foreground">暂无监控话题</div>
              </div>
            </div>

            <div
              class="inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1"
              role="group"
              aria-label="目标 AI 平台"
            >
              <span class="px-1.5 text-[10px] font-medium text-muted-foreground">优化平台</span>
              <button
                type="button"
                class="rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors"
                :class="platform === 'doubao'
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground'"
                :aria-pressed="platform === 'doubao'"
                @click="platform = 'doubao'"
              >豆包</button>
              <button
                type="button"
                class="cursor-not-allowed rounded-md px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground/50"
                disabled
                title="DeepSeek 即将开放"
              >DeepSeek</button>
            </div>
          </template>

          <button
            type="button"
            class="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
            title="查看积分明细 / 充值"
            @click="goCredits"
          >
            <Sparkles class="h-3 w-3" />
            <span class="text-muted-foreground">可用余额</span>
            <span class="font-mono font-semibold tabular-nums">{{ balance }}</span>
          </button>
        </div>

        <textarea
          ref="taRef"
          v-model="prompt"
          class="min-h-[72px] w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          :placeholder="modeCfg.placeholder"
          rows="3"
          @keydown="onKeydown"
        />

        <div class="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <div class="flex flex-wrap items-center gap-1.5">
            <template v-if="mode === 'mining'">
              <Button size="sm" variant="outline" @click="pickFile">
                <FileUp class="h-3.5 w-3.5" />
                上传文件
              </Button>
              <Button size="sm" variant="outline" @click="addLink">
                <Link2 class="h-3.5 w-3.5" />
                链接
              </Button>
            </template>
            <template v-else-if="mode === 'writing'">
              <Button
                size="sm"
                variant="outline"
                :class="refLink ? 'border-primary/30 bg-primary/5 text-primary' : ''"
                @click="addLink"
              >
                <Link2 class="h-3.5 w-3.5" />
                {{ refLink ? '已添加链接' : '添加参考链接' }}
              </Button>
              <Button
                size="sm"
                variant="outline"
                :class="mimicFile ? 'border-primary/30 bg-primary/5 text-primary' : ''"
                @click="pickFile"
              >
                <FileUp class="h-3.5 w-3.5" />
                {{ mimicFile || '上传仿写文章' }}
              </Button>
            </template>
          </div>
          <Button size="sm" :disabled="starting || !canStart" @click="start">
            <Loader2 v-if="starting" class="h-3.5 w-3.5 animate-spin" />
            {{ starting ? '启动中…' : modeCfg.submit }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Quick prompts -->
    <div>
      <div class="mb-2 text-xs font-medium text-muted-foreground">{{ modeCfg.guide }}</div>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          v-for="(q, i) in modeCfg.questions"
          :key="i"
          type="button"
          class="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 text-left text-xs transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
          :class="prompt === q ? 'border-primary/40 bg-primary/[0.04] text-primary' : 'text-foreground'"
          @click="useQuestion(q)"
        >
          <span class="min-w-0 truncate">{{ q }}</span>
          <ChevronRight class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </div>
    </div>

    <input ref="fileRef" type="file" class="hidden" @change="onFile" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bot,
  ChevronDown,
  ChevronRight,
  FileUp,
  Link2,
  Loader2,
  MessageSquare,
  PenLine,
  Search,
  Sparkles,
} from 'lucide-vue-next'
import { Button, Card, CardContent } from '@/components/ui'
import { Message } from '@/lib/toast'
import { agentApi, type AgentChatMode } from '@/api/modules/agent'
import { userApi } from '@/api/modules/user'
import { monitorApi } from '@/api/modules/monitor'

const route = useRoute()
const router = useRouter()
const mode = ref<AgentChatMode>(
  (['chat', 'mining', 'writing'].includes(String(route.query.mode || ''))
    ? (String(route.query.mode) as AgentChatMode)
    : 'chat'),
)
const prompt = ref('')
const balance = ref(0)
const starting = ref(false)
const platform = ref('doubao')
const topics = ref<{ query_id: number; query: string }[]>([])
const selectedQueryId = ref<number | null>(null)
const topicOpen = ref(false)
const refLink = ref('')
const mimicFile = ref('')
const taRef = ref<HTMLTextAreaElement | null>(null)
const fileRef = ref<HTMLInputElement | null>(null)
const topicRoot = ref<HTMLElement | null>(null)

const tabs = [
  { key: 'chat' as const, label: '优化策略', icon: MessageSquare },
  { key: 'mining' as const, label: '问题挖掘', icon: Search },
  { key: 'writing' as const, label: '撰写稿件', icon: PenLine },
]

const MODES: Record<
  AgentChatMode,
  { sub: string; placeholder: string; submit: string; guide: string; questions: string[] }
> = {
  chat: {
    sub: '查数据，找问题，制定优化计划',
    placeholder: '问我 GEO 表现、行业热点、信源选择或内容引用...',
    submit: '开始',
    guide: '大家在问',
    questions: [
      '分析一下提及率有什么波动？',
      '看看今天有什么热点？',
      '做豆包优化有哪些优质信源？',
      '做 DeepSeek 优化有哪些优质信源？',
      '什么样的内容更容易被豆包引用？',
      '什么样的内容更容易被 DeepSeek 引用？',
    ],
  },
  mining: {
    sub: '挖掘用户意图问题，优化问题库',
    placeholder: '说说你想挖什么，或直接开始',
    submit: '开始挖掘',
    guide: '大家在挖',
    questions: [
      '分析现状再挖新话题',
      '哪些监控问题该换掉了？',
      '竞品覆盖了我没覆盖的？',
      '口碑这段缺口大不大？',
    ],
  },
  writing: {
    sub: '创作高引用稿件',
    placeholder: '描述你想写的主题、目标读者和核心观点...',
    submit: '开始写稿',
    guide: '大家在写',
    questions: [
      '帮我出几个撰稿选题',
      '哪些问题排名靠后、该补稿？',
      '行业和竞品最近在写什么？',
      '口碑热词里能借哪些势？',
    ],
  },
}

const modeCfg = computed(() => MODES[mode.value])
const selectedTopicLabel = computed(() => {
  if (!selectedQueryId.value) return '选择监控话题'
  return topics.value.find((t) => t.query_id === selectedQueryId.value)?.query || '选择监控话题'
})
const canStart = computed(() => {
  if (mode.value === 'mining') return true
  return !!prompt.value.trim()
})

watch(mode, () => {
  prompt.value = ''
  topicOpen.value = false
})

function useQuestion(q: string) {
  prompt.value = q
  taRef.value?.focus()
}

function pickTopic(q: { query_id: number; query: string } | null) {
  selectedQueryId.value = q ? q.query_id : null
  if (q && !prompt.value.trim()) prompt.value = q.query
  topicOpen.value = false
}

function goCredits() {
  router.push('/dashboard/plan-upgrade')
}

function addLink() {
  const url = window.prompt('请输入参考链接')
  if (url && url.trim()) {
    refLink.value = url.trim()
    Message.success('已添加参考链接')
  }
}

function pickFile() {
  fileRef.value?.click()
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  mimicFile.value = f.name.length > 12 ? `${f.name.slice(0, 10)}…` : f.name
  Message.success(`已选择 ${f.name}`)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    start()
  }
}

async function start() {
  if (starting.value || !canStart.value) return
  starting.value = true
  try {
    const text = prompt.value.trim() || (mode.value === 'mining' ? '开始挖掘监控问题与潜在话题' : '')
    const data = await agentApi.start({
      mode: mode.value,
      prompt: text,
      platform: mode.value === 'writing' ? platform.value : undefined,
      query_id: mode.value === 'writing' ? selectedQueryId.value : undefined,
      ref_links: refLink.value ? [refLink.value] : undefined,
    })
    window.dispatchEvent(new CustomEvent('agent-sessions-changed'))
    await router.push(`/dashboard/writing/${data.session_id}`)
  } catch (err: any) {
    Message.error(err?.message || '启动失败')
  } finally {
    starting.value = false
  }
}

async function loadBalance() {
  try {
    const acc: any = await userApi.creditAccount()
    balance.value = Math.round(Number(acc?.available ?? acc?.balance ?? 0))
  } catch {
    /* ignore */
  }
}

async function loadTopics() {
  try {
    const res: any = await monitorApi.queryList('all')
    const list = res?.list || []
    topics.value = (Array.isArray(list) ? list : [])
      .map((q: any) => ({
        query_id: Number(q.query_id ?? q.id),
        query: String(q.query || q.text || ''),
      }))
      .filter((q: any) => q.query_id && q.query)
  } catch {
    topics.value = []
  }
}

function onDocClick(e: MouseEvent) {
  if (!topicOpen.value) return
  const root = topicRoot.value
  if (root && !root.contains(e.target as Node)) topicOpen.value = false
}

onMounted(() => {
  loadBalance()
  loadTopics()
  document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>
