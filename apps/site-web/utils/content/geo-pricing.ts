import type { HubPricingContent, HubPricingPlan } from '@site-manage/shared'

/**
 * 公开站价格策略：对齐 geo-admin（geo-user-site PricingV2sec + dash 套餐档位）。
 * 监控按品牌订阅；撰稿/发稿按积分量付。3 个月 8 折、12 个月 7 折。
 */

export type PricingCycle = 'monthly' | 'quarterly' | 'yearly'
export type PricingScope = 'pc' | 'both'

export const PRICING_CYCLES: { id: PricingCycle; label: string; discount?: string; months: number; rate: number }[] = [
  { id: 'monthly', label: '1 个月', months: 1, rate: 1 },
  { id: 'quarterly', label: '3 个月', discount: '8 折', months: 3, rate: 0.8 },
  { id: 'yearly', label: '12 个月', discount: '7 折', months: 12, rate: 0.7 },
]

export const PRICING_PC_ENGINES = '豆包 · DeepSeek · 文心一言 · 通义千问 · 元宝'
export const PRICING_BOTH_HINT = '网页端 5 + APP 端 3'

const paidBase = (limit: number, extra: { text: string; included: boolean; highlight?: boolean }[] = []): HubPricingPlan['features'] => [
  { text: '真实账号抓取', included: true, highlight: true },
  { text: `监控问题数量 ${limit} 个`, included: true },
  { text: '5 大主流 AI 引擎', included: true },
  { text: '监测频率 1 天 1 次', included: true },
  { text: '品牌排名分析', included: true },
  { text: '品牌舆情分析', included: true },
  { text: '搜索快照下载', included: true },
  { text: '引用源情报洞察', included: true },
  { text: '数据导出报告', included: true },
  ...extra,
  { text: '稿件中心撰稿（消耗积分）', included: true },
  { text: '稿件中心发稿（消耗积分）', included: true },
]

/** geo-admin 监控会员套餐目录（月付标价） */
export const GEO_PRICING_PLANS: HubPricingPlan[] = [
  {
    id: 'free',
    name: '免费版',
    monthlyPrice: 0,
    unit: '',
    queryLimit: 3,
    hasAiScope: false,
    features: [
      { text: '真实账号抓取', included: true, highlight: true },
      { text: '监控问题数量 3 个', included: true },
      { text: '3 个网页端 AI 引擎', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: false },
      { text: '数据导出报告', included: false },
      { text: '稿件中心撰稿', included: false },
      { text: '稿件中心发稿', included: false },
    ],
    ctaLabel: '免费开始',
    ctaKind: 'console',
  },
  {
    id: 'starter',
    name: '入门版',
    monthlyPrice: 79,
    unit: '/月',
    subtitle: '按品牌独立开通',
    queryLimit: 8,
    hasAiScope: true,
    features: paidBase(8),
    ctaLabel: '开通入门版',
    ctaKind: 'console',
  },
  {
    id: 'basic',
    name: '基础版',
    monthlyPrice: 199,
    unit: '/月',
    subtitle: '按品牌独立开通',
    queryLimit: 30,
    hasAiScope: true,
    features: paidBase(30, [{ text: '专属客户经理', included: true }]),
    ctaLabel: '开通基础版',
    ctaKind: 'console',
  },
  {
    id: 'pro',
    name: '专业版',
    icon: '👑',
    monthlyPrice: 499,
    unit: '/月',
    subtitle: '按品牌独立开通',
    banner: '最受欢迎 · 性价比之选',
    highlighted: true,
    queryLimit: 100,
    hasAiScope: true,
    features: paidBase(100, [
      { text: '专属客户经理', included: true },
      { text: '7×24 小时技术支持', included: true },
    ]),
    ctaLabel: '开通专业版',
    ctaKind: 'console',
  },
  {
    id: 'custom',
    name: '定制版',
    icon: '★',
    monthlyPrice: null,
    priceText: '按需定价',
    subtitle: '根据企业需求量身定制',
    hasAiScope: false,
    features: [],
    customFeatures: [
      '更多监控问题查询',
      '批量品牌诊断',
      'AI 模型定制',
      '产品 OEM 定制',
      'API 接口输出',
      '功能定制',
      '监控代运营服务',
      '等等……',
    ],
    ctaLabel: '联系客服',
    ctaKind: 'demo',
  },
]

export const GEO_PRICING_FAQS: { q: string; a: string }[] = [
  {
    q: '免费版能做什么？边界在哪？',
    a: '免费版 ¥0，包含 3 个监控问题、3 个网页端 AI 引擎，具备真实账号抓取、品牌排名分析、品牌舆情分析。它足够把现状测出来，不足以支撑持续运营——3 个问题通常只能覆盖一条产品线里最核心的那几个提问。不含引用源情报洞察与数据导出报告。',
  },
  {
    q: '各档之间差在哪？主要按什么涨价？',
    a: '主要按监控问题数量分档：免费版 3 个、入门版 ¥79/月 8 个、基础版 ¥199/月 30 个、专业版 ¥499/月 100 个。付费档都是 5 大引擎（豆包、DeepSeek、文心一言、通义千问、元宝）、网页端与 APP 端双端可选、1 天 1 次监测。基础版起配专属客户经理，专业版加 7×24 小时技术支持。',
  },
  {
    q: '监测和写稿发稿是分开计费的吗？',
    a: '是。监控按品牌订阅（上面的月度档位），撰稿与发稿按积分量付，用多少扣多少。发稿按篇逐单：提交冻结积分，发布成功扣除、失败全额退回。这样设计是因为监测是持续的、内容生产是按需的，绑在一起会让不写稿的月份也付内容的钱。',
  },
  {
    q: '买长有优惠吗？',
    a: '有。3 个月 8 折、12 个月 7 折，各付费档位通用。',
  },
  {
    q: '需要 OEM、API 或私有化怎么办？',
    a: '定制版按需定价，覆盖更多监控问题查询、批量品牌诊断、AI 模型定制、产品 OEM 定制、API 接口输出、功能定制与监控代运营。需要把监测能力做成自己交付物的营销公司和代理商，走的是这一档。',
  },
]

export const GEO_PRICING_DEFAULT: HubPricingContent = {
  version: 1,
  eyebrow: '价格',
  title: '免费开始，',
  titleAccent: '按需付费',
  description: '监控按品牌订阅，写作与发稿按积分量付。套餐策略与工作台一致。',
  billingNote: '监控会员套餐按品牌独立开通 · 可用账户积分或现金支付',
  plans: GEO_PRICING_PLANS,
  faq: GEO_PRICING_FAQS,
  note: '具体下单与续费在工作台完成。报价以控制台为准；商务合同请先预约演示。',
}

/** 展示月付标价；长周期优惠体现在周期按钮折扣标，不改卡片主价（对齐 geo-admin 公开站）。 */
export function displayMonthlyPrice(plan: HubPricingPlan): string {
  if (plan.monthlyPrice == null) return plan.priceText || '按需定价'
  return String(plan.monthlyPrice)
}

/** 选定周期应付总额（营销示意，下单以工作台为准） */
export function cycleTotal(monthly: number, cycle: PricingCycle): number {
  const row = PRICING_CYCLES.find((c) => c.id === cycle) || PRICING_CYCLES[0]
  return Math.round(monthly * row.months * row.rate)
}
