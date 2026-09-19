<template>
  <div class="flex h-[calc(100vh-0px)] min-h-[520px] flex-col">
    <!-- Header -->
    <div class="flex shrink-0 items-center gap-3 border-b bg-card/80 px-5 py-3 backdrop-blur">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <PenLine class="h-4 w-4" />
      </div>
      <div class="min-w-0 flex-1 truncate text-sm font-semibold" :title="session?.title">
        {{ session?.title || '…' }}
      </div>
      <button
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
        title="查看积分明细 / 充值"
        @click="goCredits"
      >
        <Sparkles class="h-3 w-3" />
        <span class="text-muted-foreground">本轮消耗</span>
        <span class="font-mono font-semibold tabular-nums">{{ session?.cost ?? 0 }}</span>
        <span class="text-muted-foreground/60">·</span>
        <span class="text-muted-foreground">可用余额</span>
        <span class="font-mono font-semibold tabular-nums">{{ balance }}</span>
      </button>
    </div>

    <!-- Status -->
    <div class="mx-5 mt-4 flex shrink-0 items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-xs text-primary">
      <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Loader2 class="h-3 w-3 animate-spin" />
      </div>
      <div class="min-w-0 flex-1 truncate font-medium">
        {{ session?.ended ? '已结束' : (session?.status_label || '等用户追加') }}
      </div>
      <Badge class="shrink-0 border-transparent bg-primary/10 font-mono text-[10px] text-primary">
        {{ session?.progress ?? 5 }}%
      </Badge>
    </div>

    <!-- Feed -->
    <div ref="feedRef" class="min-h-0 flex-1 overflow-auto px-5 py-5">
      <div class="mx-auto flex max-w-[680px] flex-col gap-3">
        <template v-for="(m, i) in session?.messages || []" :key="i">
          <div v-if="m.role === 'user'" class="flex justify-end">
            <div class="max-w-[75%] rounded-lg bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
              {{ m.content }}
            </div>
          </div>
          <div v-else class="flex justify-start">
            <div class="max-w-[90%] text-sm leading-relaxed text-foreground">
              <p class="whitespace-pre-wrap">{{ m.content }}</p>
            </div>
          </div>
        </template>
        <div v-if="sending" class="flex justify-start">
          <div class="text-sm italic text-muted-foreground">思考中…</div>
        </div>
      </div>
    </div>

    <!-- Composer -->
    <div class="shrink-0 border-t bg-card/60 px-5 py-4 backdrop-blur">
      <div class="mx-auto max-w-[680px]">
        <Card class="overflow-hidden focus-within:ring-2 focus-within:ring-ring">
          <CardContent class="flex items-end gap-2 p-2.5 pl-4">
            <textarea
              ref="taRef"
              v-model="draft"
              rows="1"
              placeholder="继续和 AI 对话..."
              class="max-h-[100px] min-h-[33px] flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!!session?.ended"
              @keydown="onKeydown"
              @input="autoGrow"
            />
            <Button
              size="icon"
              class="h-9 w-9 shrink-0"
              title="发送"
              :disabled="!canSend"
              @click="send"
            >
              <Send class="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
        <div class="mt-2 text-right">
          <button
            type="button"
            class="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            title="结束本轮写作(关闭 run, 不可续聊)"
            @click="askEnd"
          >
            × 结束本篇
          </button>
        </div>
      </div>
    </div>

    <!-- End confirm dialog -->
    <div
      v-if="endOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="endOpen = false"
    >
      <Card class="w-full max-w-sm shadow-lg">
        <CardContent class="space-y-4 p-5">
          <div>
            <h3 class="text-sm font-semibold">结束本篇</h3>
            <p class="mt-1.5 text-xs text-muted-foreground">结束本篇后将不可继续对话，确认结束？</p>
          </div>
          <div class="flex justify-end gap-2">
            <Button size="sm" variant="outline" @click="endOpen = false">取消</Button>
            <Button size="sm" variant="destructive" :disabled="ending" @click="confirmEnd">
              {{ ending ? '结束中…' : '结束' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2, PenLine, Send, Sparkles } from 'lucide-vue-next'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { Message } from '@/lib/toast'
import { agentApi, type AgentChatSession } from '@/api/modules/agent'
import { userApi } from '@/api/modules/user'

const route = useRoute()
const router = useRouter()
const session = ref<AgentChatSession | null>(null)
const balance = ref(0)
const draft = ref('')
const sending = ref(false)
const ending = ref(false)
const endOpen = ref(false)
const feedRef = ref<HTMLElement | null>(null)
const taRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => !sending.value && !session.value?.ended && !!draft.value.trim())

async function load() {
  const id = String(route.params.id || '')
  if (!id) {
    router.replace('/dashboard/new-agent')
    return
  }
  try {
    session.value = await agentApi.detail(id)
    await nextTick()
    scrollBottom()
  } catch {
    Message.error('会话不存在')
    router.replace('/dashboard/new-agent')
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

function scrollBottom() {
  const el = feedRef.value
  if (el) el.scrollTop = el.scrollHeight
}

function autoGrow() {
  const el = taRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(100, Math.max(33, el.scrollHeight))}px`
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

async function send() {
  if (!canSend.value || !session.value) return
  const content = draft.value.trim()
  draft.value = ''
  autoGrow()
  sending.value = true
  try {
    session.value = await agentApi.message(session.value.session_id, content)
    window.dispatchEvent(new CustomEvent('agent-sessions-changed'))
    await nextTick()
    scrollBottom()
  } catch (err: any) {
    Message.error(err?.message || '发送失败')
    draft.value = content
  } finally {
    sending.value = false
  }
}

function askEnd() {
  if (!session.value || session.value.ended) {
    router.push('/dashboard/new-agent')
    return
  }
  endOpen.value = true
}

async function confirmEnd() {
  if (!session.value || ending.value) return
  ending.value = true
  try {
    session.value = await agentApi.end(session.value.session_id)
    window.dispatchEvent(new CustomEvent('agent-sessions-changed'))
    Message.success('已结束')
    endOpen.value = false
    router.push('/dashboard/new-agent')
  } catch (err: any) {
    Message.error(err?.message || '结束失败')
  } finally {
    ending.value = false
  }
}

function goCredits() {
  router.push('/dashboard/plan-upgrade')
}

watch(() => route.params.id, () => load())

onMounted(() => {
  load()
  loadBalance()
})
</script>
