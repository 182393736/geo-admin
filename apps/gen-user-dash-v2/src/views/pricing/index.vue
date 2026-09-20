<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="套餐版本" description="查看当前的套餐权益、用量与账单记录 · 统计周期：实时">
      <template #actions>
        <Button
          size="sm"
          class="bg-primary text-primary-foreground hover:bg-primary/90"
          title="查看积分明细"
          @click="openCreditDetail"
        >
          <Sparkles class="h-3.5 w-3.5" />
          账户积分 ✦ {{ creditDisplay }}
        </Button>
        <Button size="sm" variant="outline" @click="openRecharge">
          <Plus class="h-3.5 w-3.5" />
          充值积分
        </Button>
      </template>
    </PageHeader>

    <!-- 当前套餐 -->
    <Card>
      <CardContent class="flex flex-col items-stretch gap-8 p-6 md:flex-row md:items-center">
        <div class="min-w-[260px] shrink-0">
          <div class="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers class="h-3.5 w-3.5" />
            当前套餐 · {{ brandName }}
          </div>
          <div class="mb-2 text-2xl font-bold tracking-tight">{{ sub?.plan_name || '暂无订阅' }}</div>
          <div class="text-sm text-muted-foreground">有效期至 {{ expireText }}</div>
        </div>
        <div class="flex w-full flex-1 flex-col gap-5">
          <div>
            <div class="mb-2 flex items-center gap-2">
              <Layers class="h-3.5 w-3.5 text-muted-foreground" />
              <span class="text-xs font-medium text-muted-foreground">监控问题配额</span>
              <span class="ml-auto font-mono text-xs text-muted-foreground">
                <b class="font-bold text-foreground">{{ sub?.query_limit ?? 0 }}</b>
                / {{ sub?.query_count ?? 0 }}
              </span>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-muted">
              <div class="h-full rounded-full bg-primary" :style="{ width: quotaPct + '%' }" />
            </div>
          </div>
          <div>
            <div class="mb-2 flex items-center gap-2">
              <Layers class="h-3.5 w-3.5 text-muted-foreground" />
              <span class="text-xs font-medium text-muted-foreground">覆盖大模型平台</span>
              <span class="ml-auto font-mono text-xs text-muted-foreground">
                <b class="font-bold text-foreground">{{ platformMax }}</b>
                / {{ platformCount }}
              </span>
            </div>
            <div class="flex gap-0.5 rounded-full bg-muted">
              <div
                v-for="i in 5"
                :key="i"
                class="h-1.5 flex-1 rounded-full"
                :class="i <= platformCount ? 'bg-primary' : 'bg-transparent'"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 套餐标题 -->
    <div class="pt-1 text-center">
      <div class="flex items-center justify-center gap-2 text-lg font-bold">
        <Zap class="h-5 w-5 text-amber-500" />
        监控会员套餐
      </div>
      <p class="mt-1.5 text-xs text-muted-foreground">
        监控会员套餐按品牌独立开通 · 当前品牌：{{ brandName }} · 可用账户积分或现金支付
      </p>
    </div>

    <!-- 套餐网格 -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Card
        v-for="plan in plans"
        :key="plan.id"
        class="relative flex flex-col overflow-hidden"
        :class="plan.highlighted
          ? 'border-primary shadow-md ring-1 ring-primary/20'
          : plan.current
            ? 'border-primary/40'
            : ''"
      >
        <Badge
          v-if="plan.current"
          class="absolute right-3 top-3 z-10 border-transparent bg-primary text-[10px] text-primary-foreground"
        >当前套餐</Badge>

        <div
          v-if="plan.banner"
          class="flex items-center gap-1.5 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Zap class="h-3.5 w-3.5 fill-current" />
          {{ plan.banner }}
        </div>

        <CardContent class="flex flex-1 flex-col p-5 pt-5">
          <h4 class="mb-3 flex items-center text-lg font-bold">
            {{ plan.name }}
            <span v-if="plan.icon" class="ml-1 text-base font-normal">{{ plan.icon }}</span>
          </h4>

          <div class="mb-3.5">
            <div v-if="plan.price !== null" class="flex items-baseline">
              <span class="mr-0.5 text-xl font-bold">¥</span>
              <span class="text-4xl font-bold tracking-tight">{{ displayPrice(plan) }}</span>
              <span v-if="plan.unit" class="ml-1 text-xs font-medium text-muted-foreground">{{ plan.unit }}</span>
            </div>
            <div v-else class="text-3xl font-bold tracking-tight text-emerald-700">
              {{ plan.priceText }}
            </div>
            <p v-if="plan.subtitle" class="mt-1 text-xs text-muted-foreground">{{ plan.subtitle }}</p>
          </div>

          <template v-if="plan.hasAISection">
            <div class="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Layers class="h-3 w-3" />
              AI 引擎监控能力
            </div>
            <div class="mb-3.5 rounded-lg bg-muted/50 p-1">
              <div class="mb-1.5 flex gap-1">
                <button
                  type="button"
                  class="flex flex-1 items-center justify-center rounded-md px-1 py-2 text-[11px] font-semibold transition-colors"
                  :class="scopeOf(plan.id) === 'pc'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background'"
                  @click="setScope(plan.id, 'pc')"
                >网页端</button>
                <button
                  type="button"
                  disabled
                  title="即将开放"
                  class="flex flex-1 cursor-not-allowed items-center justify-center rounded-md px-1 py-2 text-[11px] font-semibold text-muted-foreground/40"
                >APP 端</button>
                <button
                  type="button"
                  class="flex flex-1 items-center justify-center rounded-md px-1 py-2 text-[11px] font-semibold transition-colors"
                  :class="scopeOf(plan.id) === 'both'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background'"
                  @click="setScope(plan.id, 'both')"
                >双端</button>
              </div>
              <div class="flex items-center gap-1.5 border-t px-1 pb-0.5 pt-2">
                <Monitor class="h-3.5 w-3.5 shrink-0 text-primary" />
                <span class="min-w-0 whitespace-nowrap text-xs font-semibold">
                  {{ scopeOf(plan.id) === 'both' ? '8 端主流 AI' : '5 大主流 AI' }}
                </span>
                <span
                  class="inline-flex cursor-help text-muted-foreground hover:text-primary"
                  :title="scopeOf(plan.id) === 'both' ? '网页端 5 + APP 端 3' : 'DeepSeek · 豆包 · 文心一言 · 通义千问 · 元宝'"
                >
                  <Info class="h-3 w-3" />
                </span>
              </div>
            </div>
          </template>

          <div class="mb-4 flex flex-1 flex-col gap-2" :class="plan.id === 'custom' ? 'mt-3' : ''">
            <div
              v-for="(feat, fi) in plan.features"
              :key="fi"
              class="flex items-center gap-1.5 whitespace-nowrap text-[11.5px] leading-snug"
              :class="!feat.included
                ? 'text-muted-foreground'
                : plan.hasAISection && fi === 0
                  ? 'font-semibold text-primary'
                  : 'text-foreground/80'"
            >
              <Zap
                v-if="feat.included"
                class="h-3 w-3 shrink-0"
                :class="plan.hasAISection && fi === 0 ? 'text-primary' : 'text-muted-foreground'"
              />
              <X v-else class="h-3 w-3 shrink-0 text-muted-foreground" />
              <span>{{ feat.text }}</span>
            </div>
            <div
              v-for="(feat, fi) in plan.customFeatures || []"
              :key="'c' + fi"
              class="flex items-center gap-1.5 whitespace-nowrap text-[11.5px] leading-snug"
              :class="fi === (plan.customFeatures || []).length - 1
                ? 'font-semibold text-emerald-700'
                : 'text-emerald-800'"
            >
              <Check class="h-3 w-3 shrink-0 text-emerald-500" />
              <span>{{ feat }}</span>
            </div>
          </div>

          <template v-if="plan.billingPeriods">
            <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">计费周期</div>
            <div class="mb-4 flex gap-1 rounded-lg bg-muted/50 p-1">
              <button
                v-for="bp in plan.billingPeriods"
                :key="bp.cycle"
                type="button"
                class="relative flex flex-1 items-center justify-center rounded-md px-1 py-2 text-[11px] font-semibold transition-colors"
                :class="cycleOf(plan.id) === bp.cycle
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/60'"
                @click="setCycle(plan.id, bp.cycle)"
              >
                {{ bp.label }}
                <span
                  v-if="bp.discount"
                  class="absolute -right-1 -top-2 rounded-full bg-destructive px-1.5 py-px text-[9px] font-bold text-destructive-foreground"
                >{{ bp.discount }}</span>
              </button>
            </div>
          </template>

          <div class="mt-auto flex flex-col gap-2">
            <Button
              v-if="plan.primaryBtn"
              :class="primaryBtnClass(plan.primaryBtn.type)"
              :variant="plan.primaryBtn.type === 'disabled' ? 'secondary' : 'default'"
              :disabled="plan.primaryBtn.type === 'disabled' || paying"
              @click="onPrimary(plan)"
            >{{ plan.primaryBtn.text }}</Button>
            <Button
              v-if="plan.secondaryBtn"
              variant="secondary"
              class="w-full bg-primary/10 text-primary hover:bg-primary/15"
              :disabled="paying"
              @click="onCreditPay(plan)"
            >{{ plan.secondaryBtn.text }}</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 积分明细 -->
    <Teleport to="body">
      <div
        v-if="creditDetailOpen"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="creditDetailOpen = false"
      >
        <Card class="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden shadow-lg">
          <div class="flex items-center justify-between border-b px-5 py-4">
            <h3 class="text-base font-semibold">积分明细</h3>
            <div class="flex items-center gap-2">
              <Button size="sm" @click="openRechargeFromDetail">
                <Plus class="h-3.5 w-3.5" />
                购买积分
              </Button>
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="creditDetailOpen = false">
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div class="border-b bg-primary/5 px-5 py-5">
            <div class="mb-1 text-xs text-muted-foreground">账户积分余额</div>
            <div class="flex items-baseline gap-1 text-3xl font-bold">
              <span class="text-lg text-primary">✦</span>{{ creditDisplay }}
            </div>
            <div class="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
              <span>总额度 <b class="font-bold text-foreground">{{ creditDisplay }}</b></span>
              <span>当前冻结 <b class="font-bold text-amber-600">{{ creditFrozen }}</b></span>
              <span>剩余额度 <b class="font-bold text-emerald-600">{{ creditDisplay }}</b></span>
            </div>
            <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
              <span>累计充值 <b class="font-bold text-foreground">{{ fmtNum(creditMeta.total_recharge) }}</b></span>
              <span>累计消耗 <b class="font-bold text-foreground">{{ fmtNum(creditMeta.total_consume) }}</b></span>
              <span>累计过期 <b class="font-bold text-foreground">{{ fmtNum(creditMeta.total_expired) }}</b></span>
            </div>
          </div>

          <div class="flex gap-1 px-5 pt-4">
            <button
              v-for="t in (['all', 'consume', 'obtain'] as const)"
              :key="t"
              type="button"
              class="rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors"
              :class="txnTab === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'"
              @click="switchTxnTab(t)"
            >{{ t === 'all' ? '全部' : t === 'consume' ? '消耗' : '获得' }}</button>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-3" style="max-height: 360px">
            <div v-if="!txns.length" class="py-10 text-center text-sm text-muted-foreground">暂无流水</div>
            <div
              v-for="txn in txns"
              :key="txn.txn_id"
              class="flex items-center justify-between border-b border-border/50 py-3 last:border-0"
            >
              <div class="min-w-0">
                <div class="truncate text-sm font-medium" style="max-width: 280px">
                  {{ txn.title || txn.remark || '积分变动' }}
                </div>
                <div class="mt-0.5 text-[11px] text-muted-foreground">{{ fmtTime(txn.created_at) }}</div>
              </div>
              <div class="shrink-0 pl-3 text-right">
                <div
                  class="text-base font-bold"
                  :class="txn.amount < 0 ? 'text-destructive' : txn.amount > 0 ? 'text-emerald-600' : ''"
                >{{ txn.amount > 0 ? '+' : '' }}{{ fmtNum(txn.amount) }}</div>
                <Badge class="mt-0.5 border-transparent bg-amber-50 text-[10px] text-amber-600">积分</Badge>
              </div>
            </div>
          </div>

          <div class="border-t px-5 py-3 text-[11px] leading-relaxed text-muted-foreground">
            充值积分自充值起 2 年有效,先到期的先抵扣;不支持退款、不可转赠、不可提现。
          </div>
        </Card>
      </div>
    </Teleport>

    <!-- 购买积分 -->
    <Teleport to="body">
      <div
        v-if="rechargeOpen"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="rechargeOpen = false"
      >
        <Card class="relative w-full max-w-3xl overflow-hidden p-7 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            class="absolute right-4 top-4 h-8 w-8"
            @click="rechargeOpen = false"
          >
            <X class="h-5 w-5" />
          </Button>
          <div class="mb-5 flex items-center gap-2 text-primary">
            <Sparkles class="h-[18px] w-[18px]" />
            <h3 class="text-xl font-bold text-foreground">购买积分</h3>
          </div>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
            <button
              v-for="p in packs"
              :key="p.pack_id"
              type="button"
              class="rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:shadow-sm"
              @click="buyPack(p)"
            >
              <div class="flex items-baseline gap-0.5 text-2xl font-bold">
                <span class="text-base text-primary">✦</span>{{ fmtNum(p.credits) }}
              </div>
              <div class="mt-1 text-lg font-bold">
                <span class="text-sm text-muted-foreground">¥</span>{{ p.price }}
              </div>
              <div class="mt-0.5 text-[11px] text-muted-foreground">¥{{ p.unit_price.toFixed(2) }}/积分</div>
            </button>
          </div>
          <p class="mt-4 text-xs leading-relaxed text-muted-foreground">
            积分可用于开通各品牌监测套餐、单次诊断与按次监测;充值积分自购买起 2 年有效,不支持退款、不可转赠、不可提现。
          </p>
        </Card>
      </div>
    </Teleport>

    <!-- 微信支付 -->
    <Teleport to="body">
      <div
        v-if="payOpen && payOrder"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="closePay"
      >
        <Card class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden shadow-lg md:min-h-[500px] md:flex-row">
          <div class="relative flex w-full flex-col overflow-hidden bg-primary p-8 text-primary-foreground md:w-[42%]">
            <div class="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
              <Sparkles class="h-3 w-3" />
              {{ payBadge }}
            </div>
            <h3 class="mb-2 text-3xl font-bold leading-tight">{{ payTitle }}</h3>
            <p class="mb-6 text-sm leading-relaxed text-primary-foreground/80">{{ paySubtitle }}</p>
            <div class="mb-8 flex flex-col gap-4">
              <div v-for="b in payBenefits" :key="b.t" class="flex items-start gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10">
                  <Layers v-if="b.ic === 'layers'" class="h-4 w-4" />
                  <Bot v-else-if="b.ic === 'bot'" class="h-4 w-4" />
                  <Crown v-else class="h-4 w-4" />
                </div>
                <div>
                  <div class="text-sm font-bold">{{ b.t }}</div>
                  <div class="mt-0.5 text-xs text-primary-foreground/70">{{ b.d }}</div>
                </div>
              </div>
            </div>
            <div class="mt-auto">
              <div class="mb-1 text-xs font-medium uppercase tracking-wider text-primary-foreground/70">订单总额</div>
              <div class="flex items-baseline gap-1">
                <span class="text-2xl font-medium text-primary-foreground/70">¥</span>
                <span class="text-5xl font-bold tracking-tight">{{ payOrder.price }}</span>
                <span class="ml-1 text-sm text-primary-foreground/70">/ {{ payDurationLabel }}</span>
              </div>
            </div>
          </div>

          <div class="relative flex w-full flex-col items-center justify-center p-8 md:w-[58%]">
            <Button
              variant="ghost"
              size="icon"
              class="absolute right-4 top-4 h-9 w-9"
              @click="closePay"
            >
              <X class="h-5 w-5" />
            </Button>
            <h4 class="text-xl font-bold">微信扫码支付</h4>
            <p class="mb-5 mt-2 text-sm text-muted-foreground">请使用手机微信扫描下方二维码完成支付</p>
            <div class="mb-3 rounded-2xl p-3 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]">
              <div class="flex h-[180px] w-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 text-xs text-muted-foreground">
                <div
                  class="h-24 w-24 opacity-15"
                  style="background: linear-gradient(#111 1px, transparent 1px) 0 0 / 12px 12px, linear-gradient(90deg, #111 1px, transparent 1px) 0 0 / 12px 12px"
                />
                <span>模拟收款码</span>
              </div>
            </div>
            <div class="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock class="h-3.5 w-3.5" />
              支付剩余时间 {{ payRemainText }}
            </div>
            <div class="mb-3 flex w-full max-w-[280px] items-center justify-between rounded-lg bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
              <span>支付方式</span>
              <span class="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <i class="inline-block h-4 w-4 rounded bg-[#07c160]" />
                微信支付
              </span>
            </div>
            <Button
              class="mb-3.5 w-full max-w-[280px]"
              :disabled="paying"
              @click="confirmMockPay"
            >开发环境：模拟支付成功</Button>
            <p class="mb-2 max-w-xs text-center text-[11px] leading-relaxed text-muted-foreground">
              购买即代表你同意《透镜GEO 用户协议》，因机制特殊性，付款不支持退款，请知悉。《支付/退款协议》
            </p>
            <button
              type="button"
              class="text-xs text-primary hover:underline"
              @click="router.push('/dashboard/support')"
            >
              支付遇到问题？联系客服
            </button>
          </div>
        </Card>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@/lib/toast'
import { useAuthStore } from '@/stores/auth'
import {
  paymentApi,
  creditApi,
  type PlansGrouped,
  type PlanItem,
  type CreditTxn,
  type RechargePack,
  type PayOrderCreated,
} from '@/api/modules/payment'
import { userApi } from '@/api/modules/user'
import type { CreditAccount, Subscription } from '@/api/types'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import {
  Sparkles,
  Plus,
  Layers,
  Zap,
  Monitor,
  Info,
  X,
  Check,
  Clock,
  Bot,
  Crown,
} from 'lucide-vue-next'

interface Feature { text: string; included: boolean }
interface BillingPeriod { label: string; discount?: string; cycle: string }
interface PlanCard {
  id: string
  name: string
  icon?: string
  price: number | null
  priceText?: string
  unit?: string
  subtitle?: string
  current?: boolean
  highlighted?: boolean
  banner?: string
  hasAISection?: boolean
  features: Feature[]
  customFeatures?: string[]
  billingPeriods?: BillingPeriod[]
  primaryBtn?: { text: string; type: 'primary' | 'green' | 'disabled' }
  secondaryBtn?: { text: string }
  queryLimit?: number
}

const auth = useAuthStore()
const router = useRouter()
const credit = ref(0)
const creditFrozen = ref(0)
const creditMeta = reactive({ total_recharge: 0, total_consume: 0, total_expired: 0 })
const sub = ref<Subscription | null>(null)
const grouped = ref<PlansGrouped | null>(null)
const paying = ref(false)

const scopeSel = reactive<Record<string, 'pc' | 'both'>>({})
const cycleSel = reactive<Record<string, string>>({})

const creditDetailOpen = ref(false)
const txnTab = ref<'all' | 'consume' | 'obtain'>('all')
const txns = ref<CreditTxn[]>([])

const rechargeOpen = ref(false)
const packs = ref<RechargePack[]>([])

const payOpen = ref(false)
const payOrder = ref<PayOrderCreated | null>(null)
const payKind = ref<'plan' | 'recharge'>('plan')
const payRemain = ref(15 * 60)
let payTimer: ReturnType<typeof setInterval> | null = null

const brandName = computed(() => auth.activeBrand?.name || '当前品牌')
const creditDisplay = computed(() => fmtNum(credit.value))
const expireText = computed(() => (sub.value?.expire_date || '').replace(/-/g, '/') || '—')
const quotaPct = computed(() => {
  const s = sub.value
  if (!s || !s.query_limit) return 0
  return Math.min(100, Math.round((s.query_count / s.query_limit) * 100))
})
const platformMax = computed(() => (sub.value?.platform_list?.length && sub.value.platform_list.length > 5 ? 8 : 5))
const platformCount = computed(() => Math.min(platformMax.value, sub.value?.platform_list?.length ?? 0))

const TIER_ORDER = [
  { type: 'free', name: '免费版' },
  { type: 'starter', name: '入门版', subtitle: '按月灵活订阅' },
  { type: 'basic', name: '基础版', subtitle: '按月灵活订阅' },
  { type: 'pro', name: '专业版', icon: '👑', subtitle: '按月灵活订阅', highlighted: true, banner: '最受欢迎 · 性价比之选' },
  { type: 'custom', name: '定制版', icon: '★', subtitle: '根据企业需求量身定制' },
] as const

const CUSTOM_FEATURES = [
  '更多监控问题查询',
  '批量品牌诊断',
  'AI 模型定制',
  '产品 OEM 定制',
  'API 接口输出',
  '功能定制',
  '监控代运营服务',
  '等等……',
]

function fmtNum(n: number) {
  return Number(n || 0).toLocaleString('en-US')
}
function fmtTime(s: string) {
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return String(s).replace('T', ' ').slice(0, 19)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function scopeOf(id: string) { return scopeSel[id] || 'pc' }
function cycleOf(id: string) { return cycleSel[id] || 'monthly' }
function setScope(id: string, s: 'pc' | 'both') { scopeSel[id] = s }
function setCycle(id: string, c: string) { cycleSel[id] = c }

function primaryBtnClass(type: 'primary' | 'green' | 'disabled') {
  if (type === 'green') return 'w-full bg-emerald-600 text-white hover:bg-emerald-600/90'
  if (type === 'disabled') return 'w-full cursor-not-allowed opacity-60'
  return 'w-full'
}

function featuresFor(type: string, limit: number): Feature[] {
  const list: Feature[] = [
    { text: '真实账号抓取', included: true },
    { text: `监控问题数量 ${limit} 个`, included: true },
  ]
  if (type === 'free') {
    list.push(
      { text: '3 个网页端 AI 引擎', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: false },
      { text: '数据导出报告', included: false },
      { text: '稿件中心撰稿', included: false },
      { text: '稿件中心发稿', included: false },
    )
  } else {
    list.push(
      { text: '5 大主流 AI 引擎', included: true },
      { text: '监测频率 1 天 1 次', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: true },
      { text: '数据导出报告', included: true },
    )
    if (type === 'pro') {
      list.push({ text: '专属客户经理', included: true }, { text: '7×24 小时技术支持', included: true })
    }
    list.push(
      { text: '解锁撰稿功能（需额外消耗积分）', included: true },
      { text: '解锁发稿功能（需额外消耗积分）', included: true },
    )
  }
  return list
}

function discountLabel(item: PlanItem): string | undefined {
  const rate = item.discount_rate != null
    ? item.discount_rate
    : (item.original_price > 0 ? item.price / item.original_price : 1)
  if (rate >= 0.999) return undefined
  const z = Math.round(rate * 10)
  return `${z}折`
}

function itemsForTier(type: string, scope: 'pc' | 'both'): PlanItem[] {
  const g = grouped.value as unknown as Record<string, PlanItem[]> | null
  const items = g?.[type] || []
  return items.filter(i => {
    const sc = i.platform_scope || 'pc'
    if (scope === 'both') return sc === 'both'
    return sc === 'pc' || (!i.platform_scope && !/_app|_both/.test(i.plan_code))
  })
}

function selectedItem(type: string): PlanItem | null {
  const items = itemsForTier(type, scopeOf(type))
  if (!items.length) return null
  const cycle = cycleOf(type)
  return items.find(i => i.billing_cycle === cycle) || items.find(i => i.billing_cycle === 'monthly') || items[0]
}

function billingPeriodsFor(type: string): BillingPeriod[] | undefined {
  const items = itemsForTier(type, scopeOf(type))
  const order: Record<string, number> = { monthly: 0, quarterly: 1, yearly: 2 }
  const label: Record<string, string> = { monthly: '1个月', quarterly: '3个月', yearly: '12个月' }
  const seen = new Set<string>()
  const periods: BillingPeriod[] = []
  for (const i of [...items].sort((a, b) => (order[a.billing_cycle] ?? 9) - (order[b.billing_cycle] ?? 9))) {
    if (!i.billing_cycle || i.billing_cycle === 'permanent' || seen.has(i.billing_cycle)) continue
    seen.add(i.billing_cycle)
    periods.push({ label: label[i.billing_cycle] || i.billing_cycle, discount: discountLabel(i), cycle: i.billing_cycle })
  }
  return periods.length ? periods : undefined
}

function priceLabel(n: number) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10)
}

function displayPrice(plan: PlanCard) {
  if (plan.id === 'free' || plan.price === null) return plan.price ?? 0
  const item = selectedItem(plan.id)
  if (!item) return plan.price
  const cycle = item.billing_cycle
  if (cycle === 'monthly') return priceLabel(item.price)
  const monthly = itemsForTier(plan.id, scopeOf(plan.id)).find(i => i.billing_cycle === 'monthly')
  return priceLabel(monthly?.price ?? item.price)
}

function creditPriceOf(item: PlanItem) {
  return item.credit_price != null ? item.credit_price : Math.round(item.price * 10)
}

const plans = computed<PlanCard[]>(() => {
  const g = grouped.value
  if (!g) {
    return [{
      id: 'custom', name: '定制版', icon: '★', price: null, priceText: '按需定价',
      subtitle: '根据企业需求量身定制', features: [], customFeatures: CUSTOM_FEATURES,
      primaryBtn: { text: '联系客服', type: 'green' },
    }]
  }
  const groups = g as unknown as Record<string, PlanItem[]>
  return TIER_ORDER.map(t => {
    if (t.type === 'custom') {
      return {
        id: 'custom', name: t.name, icon: t.icon, price: null, priceText: '按需定价',
        subtitle: t.subtitle, features: [], customFeatures: CUSTOM_FEATURES,
        primaryBtn: { text: '联系客服', type: 'green' as const },
      } as PlanCard
    }
    const all = groups[t.type]
    if (!all?.length && t.type !== 'free') return null
    const item = selectedItem(t.type) || all?.[0]
    if (!item && t.type !== 'free') return null
    const monthly = itemsForTier(t.type, scopeOf(t.type)).find(i => i.billing_cycle === 'monthly') || item
    const price = monthly?.price ?? item?.price ?? 0
    const qLimit = item?.query_limit || monthly?.query_limit || 0
    const current = sub.value?.vip_level === t.type
    const payAmt = item?.price ?? price
    const creditAmt = item ? creditPriceOf(item) : Math.round(price * 10)
    return {
      id: t.type, name: t.name, icon: (t as { icon?: string }).icon, price, unit: t.type === 'free' ? '' : '/月',
      subtitle: (t as { subtitle?: string }).subtitle, current,
      highlighted: (t as { highlighted?: boolean }).highlighted,
      banner: (t as { banner?: string }).banner,
      hasAISection: t.type !== 'free',
      queryLimit: qLimit,
      features: featuresFor(t.type, qLimit),
      billingPeriods: t.type === 'free' ? undefined : billingPeriodsFor(t.type),
      primaryBtn: t.type === 'free'
        ? { text: '免费版', type: 'disabled' as const }
        : { text: current ? `支付 ¥${priceLabel(payAmt)} 续费` : `直接支付 ¥${priceLabel(payAmt)}`, type: 'primary' as const },
      secondaryBtn: t.type === 'free' ? undefined : { text: `积分支付 ✦ ${fmtNum(creditAmt)}` },
    } as PlanCard
  }).filter((x): x is PlanCard => !!x)
})

const payRemainText = computed(() => {
  const m = Math.floor(payRemain.value / 60)
  const s = payRemain.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const payBadge = computed(() => (
  payKind.value === 'recharge'
    ? '积分充值'
    : (sub.value?.vip_level && payOrder.value?.plan_type === sub.value.vip_level ? '续费订阅' : '开通订阅')
))
const payTitle = computed(() => {
  if (payKind.value === 'recharge') return `充值 ${fmtNum(payOrder.value?.credits || 0)} 积分`
  return `解锁${payOrder.value?.plan_name || '套餐'}权益`
})
const paySubtitle = computed(() => (
  payKind.value === 'recharge'
    ? '积分可用于开通套餐、单次诊断与按次监测'
    : '解锁更多核心业务词与竞品词查询'
))
const payDurationLabel = computed(() => {
  const d = payOrder.value?.duration_days || 0
  if (payKind.value === 'recharge') return '一次'
  if (d >= 360) return '12个月'
  if (d >= 80) return '3个月'
  return '1个月'
})
const payBenefits = computed(() => {
  if (payKind.value === 'recharge') {
    return [
      { ic: 'layers', t: `${fmtNum(payOrder.value?.credits || 0)} 积分到账`, d: '充值后立即到账，2 年有效' },
      { ic: 'bot', t: '全站通用', d: '套餐开通 / 诊断 / 发稿均可抵扣' },
      { ic: 'crown', t: '安全可靠', d: '不支持退款、不可转赠、不可提现' },
    ]
  }
  const q = payOrder.value?.query_limit || 8
  return [
    { ic: 'layers', t: `${q} 个监控问题`, d: '覆盖更多核心业务词与竞品词' },
    { ic: 'bot', t: '5 大主流模型覆盖', d: '包含 豆包, DeepSeek, 文心, 通义千问，元宝等' },
    { ic: 'crown', t: '专属客户经理', d: '1对1 策略咨询服务' },
  ]
})

async function refreshCredit() {
  const acc = await creditApi.account().catch(() => null)
  if (!acc) return
  credit.value = acc.available ?? acc.balance ?? 0
  creditFrozen.value = acc.frozen ?? 0
  creditMeta.total_recharge = acc.total_recharge ?? 0
  creditMeta.total_consume = acc.total_consume ?? 0
  creditMeta.total_expired = acc.total_expired ?? 0
}

async function refreshSub() {
  sub.value = await paymentApi.subscription().catch(() => null) as Subscription | null
}

async function loadTxns() {
  const res = await creditApi.transactions(1, 20, txnTab.value).catch(() => null)
  txns.value = res?.list || []
}

async function openCreditDetail() {
  creditDetailOpen.value = true
  txnTab.value = 'all'
  await Promise.all([refreshCredit(), loadTxns()])
}

async function switchTxnTab(tab: 'all' | 'consume' | 'obtain') {
  txnTab.value = tab
  await loadTxns()
}

async function openRecharge() {
  rechargeOpen.value = true
  packs.value = (await creditApi.packs().catch(() => [])) || []
}

function openRechargeFromDetail() {
  creditDetailOpen.value = false
  openRecharge()
}

function startPayTimer(expireIso?: string) {
  stopPayTimer()
  if (expireIso) {
    const left = Math.max(0, Math.floor((new Date(expireIso).getTime() - Date.now()) / 1000))
    payRemain.value = left || 15 * 60
  } else {
    payRemain.value = 15 * 60
  }
  payTimer = setInterval(() => {
    if (payRemain.value <= 0) { stopPayTimer(); return }
    payRemain.value -= 1
  }, 1000)
}
function stopPayTimer() {
  if (payTimer) { clearInterval(payTimer); payTimer = null }
}
function closePay() {
  payOpen.value = false
  payOrder.value = null
  stopPayTimer()
}

async function openWxPay(order: PayOrderCreated, kind: 'plan' | 'recharge') {
  payKind.value = kind
  payOrder.value = order
  payOpen.value = true
  startPayTimer(order.expire_time)
}

async function onPrimary(plan: PlanCard) {
  if (plan.id === 'custom') {
    router.push('/dashboard/support')
    return
  }
  if (plan.id === 'free') return
  const item = selectedItem(plan.id)
  if (!item) { Message.error('套餐不可用'); return }
  paying.value = true
  try {
    const order = await paymentApi.createOrder({
      brand_id: auth.activeBrandId || undefined,
      plan_code: item.plan_code,
      pay_method: 'wx',
      order_type: plan.current ? 'upgrade' : 'new',
    })
    await openWxPay(order, 'plan')
  } catch (e: unknown) {
    Message.error((e as Error)?.message || '下单失败')
  } finally {
    paying.value = false
  }
}

async function onCreditPay(plan: PlanCard) {
  if (plan.id === 'custom' || plan.id === 'free') return
  const item = selectedItem(plan.id)
  if (!item) { Message.error('套餐不可用'); return }
  const need = creditPriceOf(item)
  if (credit.value < need) {
    Message.warning(`积分不足，还需 ${fmtNum(need - credit.value)} 积分`)
    openRecharge()
    return
  }
  paying.value = true
  try {
    await paymentApi.createOrder({
      brand_id: auth.activeBrandId || undefined,
      plan_code: item.plan_code,
      pay_method: 'credit',
      order_type: plan.current ? 'upgrade' : 'new',
    })
    Message.success('积分支付成功，套餐已生效')
    await Promise.all([refreshCredit(), refreshSub()])
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '积分支付失败'
    Message.error(msg)
    if (/不足/.test(msg)) openRecharge()
  } finally {
    paying.value = false
  }
}

async function buyPack(p: RechargePack) {
  paying.value = true
  try {
    const order = await creditApi.createRecharge(p.pack_id, auth.activeBrandId || undefined)
    rechargeOpen.value = false
    await openWxPay(order, 'recharge')
  } catch (e: unknown) {
    Message.error((e as Error)?.message || '创建充值订单失败')
  } finally {
    paying.value = false
  }
}

async function confirmMockPay() {
  if (!payOrder.value?.order_no) return
  paying.value = true
  try {
    await paymentApi.mockPay(payOrder.value.order_no)
    Message.success(payKind.value === 'recharge' ? '充值成功' : '支付成功，套餐已生效')
    closePay()
    await Promise.all([refreshCredit(), refreshSub()])
    if (creditDetailOpen.value) await loadTxns()
  } catch (e: unknown) {
    Message.error((e as Error)?.message || '支付失败')
  } finally {
    paying.value = false
  }
}

onMounted(async () => {
  try {
    const [creditRes, subRes, planRes] = await Promise.all([
      userApi.creditAccount().catch(() => null),
      paymentApi.subscription().catch(() => null),
      paymentApi.plansGrouped().catch(() => null),
    ])
    const acc = creditRes as CreditAccount | null
    credit.value = acc?.available ?? acc?.balance ?? 0
    creditFrozen.value = acc?.frozen ?? 0
    creditMeta.total_recharge = acc?.total_recharge ?? 0
    creditMeta.total_consume = acc?.total_consume ?? 0
    creditMeta.total_expired = acc?.total_expired ?? 0
    sub.value = subRes as Subscription | null
    grouped.value = planRes as PlansGrouped | null
    for (const t of ['starter', 'basic', 'pro']) {
      scopeSel[t] = 'pc'
      cycleSel[t] = 'monthly'
    }
  } catch { /* 降级空态 */ }
})

onUnmounted(() => stopPayTimer())
</script>
