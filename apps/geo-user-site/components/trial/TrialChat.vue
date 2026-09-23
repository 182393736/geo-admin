<template>
  <!-- ================= 落地态：品牌输入作曲家 ================= -->
  <div v-if="phase === 'landing'" class="trial-hero">
    <h1 class="trial-h-title"><span class="trial-h-light">{{ heroTitleLight }}</span><br><span class="trial-h-grad">{{ heroTitleGrad }}</span></h1>
    <p v-if="isAddBrand" class="trial-h-sub">{{ heroSub }}</p>
    <p v-else class="trial-h-sub">AI 流量时代，别让品牌"隐形"——告诉我你的品牌，<span class="trial-h-purple">立即免费分析</span>它在豆包、DeepSeek、通义千问等大模型中的真实排名。</p>
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
        <button class="trial-h-send" type="button" :disabled="!form.text.trim()" @click="onSubmit">{{ sendLabel }}</button>
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
              <div v-for="(it, i) in m.items" :key="i" class="trial-think-item" :class="{ 'has-detail': it.detail || it.href }">
                <div class="trial-think-main">
                  <a v-if="it.href" class="trial-think-name trial-think-link" :href="it.href" target="_blank" rel="noopener">{{ it.name }}</a>
                  <span v-else class="trial-think-name">{{ it.name }}</span>
                  <span v-if="it.detail" class="trial-think-detail">{{ it.detail }}</span>
                </div>
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
                <div class="trial-tc-dim">{{ c.is_golden ? '★ 金标 · ' : '' }}热度 {{ c.weight }} · 行业中立<template v-if="c.query_description"> · {{ c.query_description }}</template></div>
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
              <a :href="consoleLink" target="_blank" rel="noopener" class="trial-cp-btn-ok" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center;padding:9px 18px;flex:none">前往控制台 →</a>
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
            <span class="trial-cp-header-title"><span class="trial-cp-dot"></span>请确认品牌词、识别名与监控问题（免费版最多 {{ limit }} 个）· 已选 {{ selected.size }}/{{ limit }}</span>
            <span class="trial-cp-dismiss" @click="skipConfirm">暂不选择</span>
          </div>
          <div class="trial-cp-body">
            <div class="trial-cp-title">品牌词 · 正式识别名（必填，可改）</div>
            <p class="trial-cp-sub">口碑题与命中统计都归到这个名字；改错了可点「修改」</p>
            <div class="trial-brand-row" @click.stop>
              <template v-if="brandEditing">
                <input
                  ref="brandInputEl"
                  v-model="brandDraft"
                  class="trial-brand-input"
                  maxlength="60"
                  placeholder="输入品牌正式名"
                  @keydown="onBrandKeydown"
                >
                <button type="button" class="trial-bc-btn trial-bc-btn-save" @click="saveBrandEdit">保存</button>
                <button type="button" class="trial-bc-btn trial-bc-btn-cancel" @click="cancelBrandEdit">取消</button>
              </template>
              <template v-else>
                <span class="trial-brand-name">{{ draftBrandName || '—' }}</span>
                <button type="button" class="trial-bc-btn trial-bc-btn-edit" @click="startBrandEdit">修改</button>
              </template>
            </div>
            <p v-if="brandHint" class="trial-cp-hint">{{ brandHint }}</p>

            <div class="trial-cp-title trial-cp-title--gap">相似识别名 · AI 回答出现这些写法都会算作你的品牌</div>
            <p class="trial-cp-sub">可增删其它写法，首次采集更容易命中（最多 {{ aliasLimit }} 个；不含上方品牌词）</p>
            <div class="trial-alias-box" @click.stop>
              <span
                v-for="a in draftAliases"
                :key="'alias:' + a"
                class="trial-alias-tag trial-alias-tag--edit"
              >
                <span>{{ a }}</span>
                <button type="button" class="trial-alias-remove" aria-label="移除" @click="removeAlias(a)">×</button>
              </span>
              <input
                v-model="aliasInput"
                type="text"
                class="trial-alias-input"
                :disabled="draftAliases.length >= aliasLimit"
                :placeholder="draftAliases.length >= aliasLimit ? '已达上限' : '输入别名后按回车或逗号添加…'"
                maxlength="60"
                @keydown="onAliasKeydown"
              >
            </div>
            <p v-if="aliasHint" class="trial-cp-hint">{{ aliasHint }}</p>

            <div class="trial-cp-title trial-cp-title--gap">监控问题 · 可勾选，也可点「修改」改写（请保持行业中立、不含品牌名）</div>
            <p v-if="editHint" class="trial-cp-hint">{{ editHint }}</p>
            <div
              v-for="(c, i) in preview.candidates"
              :key="candKey(c, i)"
              class="trial-bc"
              :class="{ sel: selected.has(i), editing: editingIdx === i }"
              @click="toggleSelect(i)"
            >
              <div class="trial-bc-top">
                <template v-if="editingIdx === i">
                  <input
                    ref="editInputEl"
                    v-model="editDraft"
                    class="trial-bc-input"
                    maxlength="80"
                    @click.stop
                    @keydown="onQueryEditKeydown($event, i)"
                  >
                  <button type="button" class="trial-bc-btn trial-bc-btn-save" @click.stop="saveEdit(i)">保存</button>
                  <button type="button" class="trial-bc-btn trial-bc-btn-cancel" @click.stop="cancelEdit">取消</button>
                </template>
                <template v-else>
                  <div class="trial-bc-name">{{ c.is_golden ? '★ ' : '' }}{{ c.query }}</div>
                  <button type="button" class="trial-bc-btn trial-bc-btn-edit" @click.stop="startEdit(i)">修改</button>
                </template>
              </div>
              <div v-if="c.query_description && editingIdx !== i" class="trial-bc-url">{{ c.query_description }}</div>
              <div v-if="editingIdx !== i" class="trial-bc-desc">引擎发问口径：{{ c.question_list?.[0]?.platform_query || c.query }}</div>
              <div class="trial-bc-tags">
                <span class="trial-bc-tag">热度 {{ c.weight }}</span>
                <span class="trial-bc-tag">行业排名</span>
                <span v-if="c.is_golden" class="trial-bc-tag">金标</span>
                <span v-if="isEdited(c)" class="trial-bc-tag trial-bc-tag-edit">已修改</span>
              </div>
            </div>
          </div>
          <div class="trial-cp-actions">
            <button class="trial-cp-btn-ok" type="button" :disabled="selected.size === 0 || saving || editingIdx != null || brandEditing || !draftBrandName.trim()" @click="doConfirm">
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
 *  → 品牌词确认 + 识别名确认 + 候选问题勾选（免费版 ≤3）→ confirm 落库 → 完成报告卡
 * 数据源：POST /agent/onboarding/stream（save=false 预览）→ POST /agent/onboarding/confirm（确认落库）
 */

defineOptions({ name: 'TrialChat' })

interface ThinkItem { name: string, status: 'run' | 'done', detail?: string, href?: string }
interface Msg {
  id: number, type: 'user' | 'ai' | 'think' | 'topics' | 'report'
  text?: string, title?: string, done?: boolean, open?: boolean
  items?: ThinkItem[], candidates?: any[], summary?: any
}

const { sse, apiPost, getToken } = useGeoApi()
const { isLoggedIn } = useAuth()
const authModal = useAuthModal()
const config = useRuntimeConfig()
const route = useRoute()
const isAddBrand = computed(() => String(route.query.from || '') === 'add_brand')
const consoleUrl = String((config.public as Record<string, unknown>).consoleUrl || 'http://127.0.0.1:6002')
/** 确认落库后的新 brand_id，回控制台时写入 hash 以便后台切到该品牌 */
const savedBrandId = ref('')
/** 「前往控制台」落地地址：#token= + 可选 brand_id= */
const consoleLink = computed(() => {
  const base = consoleUrl.split('#')[0].replace(/\/+$/, '')
  const tk = getToken()
  if (!tk) return `${base}/dashboard/overview`
  const parts = [`token=${encodeURIComponent(tk)}`]
  if (savedBrandId.value) parts.push(`brand_id=${encodeURIComponent(savedBrandId.value)}`)
  // 明确落到概览，避免仅打开根路径时被其它入口带走
  return `${base}/dashboard/overview#${parts.join('&')}`
})

const QUICK = ['小鹏汽车', '完美日记', '格力空调', '维乐口腔']
const quickChips = QUICK
const limit = 3 // 免费版配额（与服务端 GEO_FREE_QUERY_LIMIT 对齐）
const aliasLimit = 8

const phase = ref<'landing' | 'running' | 'confirm' | 'done' | 'error'>('landing')
const form = reactive({ text: '', website: '' })
const showLink = ref(false)
const hint = ref('')
const docHint = ref(false)
const msgs = reactive<Msg[]>([])
const preview = ref<any>(null)
/** 勾选用候选下标（改文案后仍稳定）；提交时映射成当前 query 文案 */
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
    : 'AI 流量时代，别让品牌"隐形"——告诉我你的品牌，立即免费分析它在豆包、DeepSeek、通义千问等大模型中的真实排名。'
))
const sendLabel = computed(() => (isAddBrand.value ? '开始添加品牌' : '开始免费分析'))
let seq = 0
let pendingStart = false
let curBlock: Msg | null = null

watch(docHint, (v) => { if (v) { hint.value = '文档解析即将上线，先粘贴官网链接即可～'; setTimeout(() => { docHint.value = false }, 2400) } })

/** 从一段话里取品牌名与官网：
 *  支持 markdown 链接粘贴（[文字](url) → 取 url 为官网、文字还原进正文）、
 *  裸域名识别、[「品牌」/「品牌叫X」]、以及首个非域名词条兜底（如 "hanyuai hanyuai.com" → hanyuai）
 */
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
      if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(tok)) continue // 跳过域名
      // 纯英文 / 纯中文 / 中英混合短名（如「透镜geo」）
      if (
        /^[a-z0-9-]{2,30}$/i.test(tok)
        || /^[一-龥]{2,20}$/.test(tok)
        || /^(?=.*[一-龥])(?=.*[a-z0-9])[一-龥a-z0-9-]{2,30}$/i.test(tok)
      ) { name = tok; break }
    }
  }
  // 整段就是一个短品牌名（无空格、非域名）时直接采用
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
    hint.value = '没认出来品牌名——请用「品牌名」的写法，或点上方「添加品牌介绍链接」粘贴官网。'
    return
  }
  if (!getToken() || !isLoggedIn.value) {
    pendingStart = true
    authModal.open('password', 'trial')
    watchOnceLogin()
    return
  }
  await start(ex.cleanText, ex.name, website)
}

/** 登录成功后自动接续分析（与对标站"登录后立即启动"一致） */
function watchOnceLogin() {
  const stop = watch(isLoggedIn, async (v) => {
    if (v && pendingStart) {
      pendingStart = false
      stop()
      const ex = extractBrand(form.text)
      await start(ex.cleanText, ex.name, form.website.trim() || ex.website)
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
function addItem(name: string, status: 'run' | 'done' = 'done', extra?: { detail?: string; href?: string }) {
  if (!curBlock) return
  curBlock.items?.push({ name, status, ...(extra || {}) })
  scroll()
}

async function start(userText: string, brandName: string, website: string) {
  phase.value = 'running'
  runningTip.value = '分析进行中…'
  msgs.splice(0, msgs.length)
  preview.value = null
  selected.clear()
  curBlock = null

  const display = brandName || website || '你的品牌'
  push({ type: 'user', text: userText })
  push({ type: 'ai', text: `好的，我来分析「${display}」在主流 AI 助手中的可见度。${website ? `先读取官网 ${website}，` : ''}全程约 1~2 分钟。` })

  try {
    await sse('/agent/onboarding/stream', {
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
      authModal.open('password', 'trial')
      watchOnceLogin()
      return
    }
    if (status === 404) {
      push({ type: 'ai', text: '分析服务未就绪（404）：本地 API 运行的不是最新代码，请重启 API（pnpm --filter @geo-admin/geo-api run dev:memory）后再试。' })
    } else {
      push({ type: 'ai', text: `分析中断：${(e as Error)?.message || '网络异常'}。请稍后重试。` })
    }
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
    else if (st === 'web_research') { /* 联网检索仍在后端执行，前端不展示检索词/结果 */ }
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
      // 联网取证结果不在 /trial 展示（管理后台留痕仍有完整 I/O）
      if (data?.meta?.phase === 'web_research') return
      addItem(`搜索：${data.query}`)
    } else if (data?.kind === 'keyword_weight') {
      addItem(`「${String(data.keyword || '').slice(0, 22)}」 热度 ${data.weight}${data.meta?.source === 'real_search' ? ' · 搜索验证' : ''}`)
    }
    return
  }
  if (ev === 'evidence') {
    // 证据要点不在对话流展示
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
    // 问题一律行业中立：带品牌名的问法会让 AI 必然提到该品牌，监测结果失真，已在服务端剔除
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

/** 默认预选金标（≤limit），用户可改；按 index 勾选，便于改文案；品牌词/识别名默认可改 */
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
  // 记下原始问法，便于展示「已修改」
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
  // 新名若在相似识别名里，去掉，避免与正式名重复
  for (let i = draftAliases.length - 1; i >= 0; i--) {
    if (draftAliases[i].toLowerCase() === next.toLowerCase()) draftAliases.splice(i, 1)
  }
  // 旧名保留为相似识别名，首次采集仍能命中旧写法
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
  // 中文等 IME 选词回车：此时 isComposing=true，不能当「添加」否则会清空刚输入的字
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
    const res = await apiPost<{ data?: { saved?: { brand_id: string, counts: Record<string, number> } } }>(
      '/agent/onboarding/confirm',
      {
        preview: preview.value,
        brand_name: brandName,
        selected_queries: queries,
        selected_aliases: aliases,
      },
    )
    const saved = res?.data?.saved
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

<style scoped>
.trial-h-att-input { border: none; outline: none; background: transparent; font-size: 12px; flex: 1; font-family: inherit; color: #0d0d0d }
.trial-h-hint { max-width: 680px; margin: 8px auto 0; font-size: 12px; color: #b45309 }
</style>
