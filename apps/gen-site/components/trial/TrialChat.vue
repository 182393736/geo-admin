<template>
  <!-- ================= 落地态：品牌输入作曲家 ================= -->
  <div v-if="phase === 'landing'" class="trial-hero">
    <h1 class="trial-h-title"><span class="trial-h-light">当客户问 AI 时，</span><br><span class="trial-h-grad">你被 AI 推荐了吗？</span></h1>
    <p class="trial-h-sub">AI 流量时代，别让品牌"隐形"——告诉我你的品牌，<span class="trial-h-purple">立即免费分析</span>它在豆包、DeepSeek、通义千问等大模型中的真实排名。</p>
    <div class="trial-h-card">
      <textarea
        v-model="form.text"
        class="trial-h-ta"
        placeholder="描述你的品牌，例如：我的品牌叫「格力空调」，是国内领先的空调品牌，官网是 www.gree.com，主要竞品是美的和海尔…"
        rows="3"
        @keydown.enter.exact.prevent="onSubmit"
      ></textarea>
      <div v-if="showLink" class="trial-h-attachments">
        <div class="trial-h-att">
          <span class="trial-h-att-ico">🔗</span>
          <input v-model="form.website" class="trial-h-att-txt trial-h-att-input" placeholder="粘贴官网链接，如 hanyuai.com（可选）">
          <span class="trial-h-att-del" @click="showLink = false; form.website = ''">×</span>
        </div>
      </div>
      <div class="trial-h-toolbar">
        <div class="trial-h-tools">
          <button class="trial-h-tool" type="button" @click="showLink = !showLink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            添加品牌介绍链接
          </button>
          <button class="trial-h-tool" type="button" @click="docHint = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            上传文档
          </button>
        </div>
        <button class="trial-h-send" type="button" :disabled="!form.text.trim()" @click="onSubmit">开始免费分析</button>
      </div>
    </div>
    <p v-if="hint" class="trial-h-hint">{{ hint }}</p>
    <div class="trial-h-chips">
      <span>快速填入：</span>
      <div v-for="c in quickChips" :key="c" class="trial-hc" @click="fillChip(c)">{{ c }}</div>
    </div>
    <div class="trial-h-feats"><span>⚡ 自动监测</span><span class="sep">·</span><span>🔍 竞对分析</span><span class="sep">·</span><span>🛡️ 绝对中立</span></div>
  </div>

  <!-- ================= 对话态：流式过程实况 ================= -->
  <template v-else>
    <div ref="wrapEl" class="trial-chat-wrap">
      <div class="trial-chat-col">
        <template v-for="m in msgs" :key="m.id">
          <!-- 用户消息 -->
          <div v-if="m.type === 'user'" class="trial-mu">{{ m.text }}</div>

          <!-- AI 文本消息 -->
          <div v-else-if="m.type === 'ai'" class="trial-ma">{{ m.text }}</div>

          <!-- 思考过程块（可折叠，进行中转圈/完成绿勾） -->
          <div v-else-if="m.type === 'think'" class="trial-think-block" :class="{ open: m.open }">
            <div class="trial-think-hd" :class="{ done: m.done }" @click="m.open = !m.open">
              <span v-if="!m.done" class="trial-mini-spin"></span>
              <span v-else class="trial-t-check"><svg viewBox="0 0 10 10" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round"><polyline points="1.5,5.5 4,8 8.5,2"></polyline></svg></span>
              {{ m.title }}
              <span class="trial-think-chevron"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="2,4 6,8 10,4"></polyline></svg></span>
            </div>
            <div v-show="m.open" class="trial-think-body">
              <div v-for="(it, i) in m.items" :key="i" class="trial-think-item">
                <span class="trial-think-name">{{ it.name }}</span>
                <span class="trial-think-st">
                  <span v-if="it.status === 'run'" class="trial-mini-spin"></span>
                  <span v-else class="trial-t-check"><svg viewBox="0 0 10 10" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round"><polyline points="1.5,5.5 4,8 8.5,2"></polyline></svg></span>
                </span>
              </div>
            </div>
          </div>

          <!-- 候选问题编号卡（聊天气泡内预览） -->
          <div v-else-if="m.type === 'topics'" style="align-self:stretch">
            <div v-for="(c, i) in m.candidates" :key="c.query" class="trial-tc">
              <span class="trial-tc-num">{{ i + 1 }}</span>
              <div style="flex:1">
                <div class="trial-tc-dim">{{ c.is_golden ? '★ 金标 · ' : '' }}热度 {{ c.weight }} · {{ c.query_type === 'industry' ? '行业' : '口碑' }}<template v-if="c.query_description"> · {{ c.query_description }}</template></div>
                <div class="trial-tc-q">{{ c.query }}</div>
              </div>
            </div>
          </div>

          <!-- 完成报告卡 -->
          <div v-else-if="m.type === 'report'" class="trial-rd-card">
            <h3 style="margin:0 0 10px;font-size:17px;font-weight:800;color:#0d0d0d">🎉 分析完成，品牌档案已建立</h3>
            <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.7">
              品牌「{{ m.summary.brand }}」 · 行业：{{ m.summary.industry || '待完善' }}<br>
              识别别名 {{ m.summary.aliases }} 个 · 竞品 {{ m.summary.competitors }} 个 · 已开启监控问题 {{ m.summary.queries }} 个
            </p>
            <p style="margin:0 0 14px;font-size:12px;color:#999">明日起每日自动采集各 AI 引擎回答，生成排名与口碑报告。</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <a :href="consoleUrl" target="_blank" rel="noopener" class="trial-cp-btn-ok" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center;padding:9px 18px;flex:none">前往控制台 →</a>
              <button class="trial-cp-btn-skip" type="button" @click="reset">再分析一个品牌</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 底部栏：确认面板 / 状态条 -->
    <div class="trial-bottom-bar">
      <div class="trial-bb-card">
        <!-- 候选确认面板（对标：勾选 ≤limit 条后才落库） -->
        <div v-if="phase === 'confirm' && preview" class="trial-cp">
          <div class="trial-cp-header">
            <span class="trial-cp-header-title"><span class="trial-cp-dot"></span>请确认要监控的问题（免费版最多 {{ limit }} 个）· 已选 {{ selected.size }}/{{ limit }}</span>
            <span class="trial-cp-dismiss" @click="skipConfirm">暂不选择</span>
          </div>
          <div class="trial-cp-body">
            <div class="trial-cp-title">AI 推荐 · 按搜索热度排序</div>
            <div
              v-for="c in preview.candidates"
              :key="c.query"
              class="trial-bc"
              :class="{ sel: selected.has(c.query) }"
              @click="toggleSelect(c.query)"
            >
              <div class="trial-bc-name">{{ c.is_golden ? '★ ' : '' }}{{ c.query }}</div>
              <div v-if="c.query_description" class="trial-bc-url">{{ c.query_description }}</div>
              <div class="trial-bc-desc">引擎发问口径：{{ c.question_list?.[0]?.platform_query || c.query }}</div>
              <div class="trial-bc-tags">
                <span class="trial-bc-tag">热度 {{ c.weight }}</span>
                <span class="trial-bc-tag">{{ c.query_type === 'industry' ? '行业排名' : '品牌口碑' }}</span>
                <span v-if="c.is_golden" class="trial-bc-tag">金标</span>
              </div>
            </div>
          </div>
          <div class="trial-cp-actions">
            <button class="trial-cp-btn-ok" type="button" :disabled="selected.size === 0 || saving" @click="doConfirm">
              {{ saving ? '保存中…' : `确认监控 ${selected.size} 个问题` }}
            </button>
            <button class="trial-cp-btn-skip" type="button" :disabled="saving" @click="skipConfirm">跳过</button>
          </div>
        </div>
        <!-- 运行中 / 完成的占位条 -->
        <div v-else class="trial-bb-inner">
          <input class="trial-bb-in" :value="phase === 'running' ? runningTip : doneTip" disabled>
          <button class="trial-bb-send" type="button" disabled>➤</button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
/**
 * /trial 首登分析对话流（复刻对标站交互）：
 *  品牌一段话+官网(可选) → SSE 过程实况气泡（识别→读官网→生成候选→验证热度→情报文）
 *  → 候选问题勾选面板（免费版 ≤3）→ confirm 落库 → 完成报告卡
 * 数据源：POST /agent/onboarding/stream（save=false 预览）→ POST /agent/onboarding/confirm（确认落库）
 */

defineOptions({ name: 'TrialChat' })

interface ThinkItem { name: string, status: 'run' | 'done' }
interface Msg {
  id: number, type: 'user' | 'ai' | 'think' | 'topics' | 'report'
  text?: string, title?: string, done?: boolean, open?: boolean
  items?: ThinkItem[], candidates?: any[], summary?: any
}

const { sse, apiPost, getToken } = useGeoApi()
const { isLoggedIn } = useAuth()
const authModal = useAuthModal()
const config = useRuntimeConfig()
const consoleUrl = String((config.public as Record<string, unknown>).consoleUrl || '#')

const QUICK = ['小鹏汽车', '完美日记', '格力空调', '维乐口腔']
const quickChips = QUICK
const limit = 3 // 免费版配额（与服务端 GEO_FREE_QUERY_LIMIT 对齐）

const phase = ref<'landing' | 'running' | 'confirm' | 'done' | 'error'>('landing')
const form = reactive({ text: '', website: '' })
const showLink = ref(false)
const hint = ref('')
const docHint = ref(false)
const msgs = reactive<Msg[]>([])
const preview = ref<any>(null)
const selected = reactive(new Set<string>())
const saving = ref(false)
const wrapEl = ref<HTMLElement | null>(null)
const runningTip = ref('分析进行中…')
const doneTip = '已完成。可前往控制台查看明细，或点击报告卡再分析一个品牌。'
let seq = 0
let pendingStart = false
let curBlock: Msg | null = null

watch(docHint, (v) => { if (v) { hint.value = '文档解析即将上线，先粘贴官网链接即可～'; setTimeout(() => { docHint.value = false }, 2400) } })

/** 从一段话里取品牌名（「引号」/品牌叫X/官网 URL 兜底为描述首段），与后端契约 brand_name 必填对齐 */
function extractBrand(text: string): { name: string, website: string } {
  const t = text.trim()
  const q = t.match(/[「『"]([^」』"]{1,30})[」』"]/)
  const n2 = t.match(/品牌(?:叫|是|为)[:： ]?([^，。,.\s]{1,30})/)
  const url = t.match(/(?:https?:\/\/)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)(?:\/[^\s，。]*)?/i)
  return { name: (q?.[1] || n2?.[1] || '').trim(), website: url?.[0]?.replace(/^https?:\/\//i, '') || '' }
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
    hint.value = '没认出来品牌名——请用「品牌名」的写法，或点上方「添加品牌介绍链接」粘贴官网。'
    return
  }
  if (!getToken() || !isLoggedIn.value) {
    pendingStart = true
    authModal.open('password', 'trial')
    watchOnceLogin()
    return
  }
  await start(text, ex.name, website)
}

/** 登录成功后自动接续分析（与对标站"登录后立即启动"一致） */
function watchOnceLogin() {
  const stop = watch(isLoggedIn, async (v) => {
    if (v && pendingStart) {
      pendingStart = false
      stop()
      const ex = extractBrand(form.text)
      await start(form.text.trim(), ex.name, form.website.trim() || ex.website)
    }
  })
}

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
function addItem(name: string, status: 'run' | 'done' = 'done') {
  if (!curBlock) return
  curBlock.items?.push({ name, status })
  scroll()
}

async function start(userText: string, brandName: string, website: string) {
  phase.value = 'running'
  runningTip.value = '分析进行中…'
  msgs.splice(0, msgs.length)
  preview.value = null
  selected.clear()
  curBlock = null

  push({ type: 'user', text: userText })
  push({ type: 'ai', text: `好的，我来分析「${brandName || website}」在主流 AI 助手中的可见度。${website ? `先读取官网 ${website}，` : ''}全程约 1~2 分钟。` })

  try {
    await sse('/agent/onboarding/stream', {
      brand_name: brandName || '未命名品牌',
      website,
      business_desc: userText,
      save: false,
    }, onEvent)
  } catch (e) {
    closeBlock()
    phase.value = 'error'
    push({ type: 'ai', text: `分析中断：${(e as Error)?.message || '网络异常'}。请稍后重试。` })
    pushRetry()
  }
}

function pushRetry() {
  const msg = push({ type: 'ai', text: '点击下方按钮重新开始分析。' })
  // 追加一个可点操作的气泡（复用 skip 按钮样式）
  nextTick(() => {
    const el = document.createElement('button')
    el.className = 'trial-cp-btn-skip'
    el.style.marginTop = '6px'
    el.textContent = '重新分析'
    el.onclick = () => { phase.value = 'landing' }
    const host = wrapEl.value?.querySelector('.trial-chat-col')
    if (host && msg) host.appendChild(el)
  })
}

function onEvent(ev: string, data: any) {
  if (ev === 'stage') {
    const st = data?.stage
    closeBlock()
    if (st === 'crawl' && form.website.trim()) openBlock('读取品牌资料', [{ name: `官网 ${form.website.trim()}`, status: 'run' }])
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
      addItem(`搜索：${data.query}`)
    } else if (data?.kind === 'keyword_weight') {
      addItem(`「${String(data.keyword || '').slice(0, 22)}」 热度 ${data.weight}${data.meta?.source === 'real_search' ? ' · 搜索验证' : ''}`)
    }
    return
  }
  if (ev === 'profile' && data?.brand) {
    closeBlock()
    const b = data.brand
    push({ type: 'ai', text: `已识别品牌「${b.name}」${b.industry ? `，行业：${b.industry}` : ''}。找到 ${data.competitors ?? 0} 个竞品方向、${(data.aliases || []).length} 个别名，继续深挖。` })
    return
  }
  if (ev === 'candidates' && Array.isArray(data?.candidates)) {
    closeBlock()
    push({ type: 'ai', text: `基于真实提问习惯生成了 ${data.count} 条候选监控问题，热度 ${data.weight_source === 'real_search' ? '已由搜索数据验证' : '为模型预估'}，按热度从高到低：`, })
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

/** 默认预选金标（≤limit），用户可改 */
function preselect() {
  selected.clear()
  for (const c of preview.value?.candidates || []) {
    if (c.is_golden && selected.size < limit) selected.add(c.query)
  }
  if (selected.size === 0) {
    for (const c of (preview.value?.candidates || []).slice(0, limit)) selected.add(c.query)
  }
}

function toggleSelect(q: string) {
  if (selected.has(q)) selected.delete(q)
  else if (selected.size < limit) selected.add(q)
  else {
    // 达到上限：替换最早选择，保持交互顺滑
    const first = selected.values().next().value
    if (first) selected.delete(first)
    selected.add(q)
  }
}

async function doConfirm() {
  if (!preview.value || selected.size === 0 || saving.value) return
  saving.value = true
  try {
    const res = await apiPost<{ data?: { saved?: { brand_id: string, counts: Record<string, number> } } }>(
      '/agent/onboarding/confirm',
      { preview: preview.value, selected_queries: [...selected] },
    )
    const saved = res?.data?.saved
    phase.value = 'done'
    push({
      type: 'ai',
      text: `已开启监控：${[...selected].join('、')}。竞品与别名档案同步建立。`,
    })
    push({
      type: 'report',
      summary: {
        brand: preview.value.brand?.name || '—',
        industry: preview.value.brand?.industry || preview.value.profile?.industry?.[0] || '',
        aliases: saved?.counts?.aliases ?? preview.value.aliases?.length ?? 0,
        competitors: saved?.counts?.competitors ?? preview.value.competitors?.length ?? 0,
        queries: saved?.counts?.queries ?? selected.size,
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
  msgs.splice(0, msgs.length)
  preview.value = null
  selected.clear()
  form.text = ''
  form.website = ''
  showLink.value = false
  hint.value = ''
}
</script>

<style scoped>
.trial-h-att-input { border: none; outline: none; background: transparent; font-size: 12px; flex: 1; font-family: inherit; color: #0d0d0d }
.trial-h-hint { max-width: 680px; margin: 8px auto 0; font-size: 12px; color: #b45309 }
</style>
