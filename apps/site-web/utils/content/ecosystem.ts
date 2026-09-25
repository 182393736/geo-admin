/** 行业生态：集成、伙伴、客户（禁止虚构评分） */

export type IntegrationItem = {
  slug: string
  name: string
  summary: string
  status: 'available' | 'beta' | 'planned'
  href?: string
}

export const GEO_INTEGRATIONS: IntegrationItem[] = [
  {
    slug: 'webhook',
    name: 'Webhook 通知',
    summary: '监测异常（如引擎未出现、提及率骤降）时推送到企业机器人或自建接收端。',
    status: 'available',
  },
  {
    slug: 'export-csv',
    name: 'CSV / 证据导出',
    summary: '导出问题集快照、提及明细与引用列表，便于审计与二次分析。',
    status: 'available',
  },
  {
    slug: 'slack',
    name: 'Slack',
    summary: '将诊断完成与周报摘要推送到频道（控制台侧配置）。',
    status: 'beta',
  },
  {
    slug: 'feishu',
    name: '飞书',
    summary: '周报与告警卡片推送，适合增长与内容协作。',
    status: 'beta',
  },
  {
    slug: 'cms-webhook',
    name: 'CMS 发布回流',
    summary: '发稿后把 URL 回写信源库，便于追踪是否进入引用池。',
    status: 'planned',
  },
  {
    slug: 'indexnow',
    name: 'IndexNow',
    summary: '流量站发布重要 URL 时通知 Bing 等引擎加快发现。',
    status: 'available',
    href: '/engines',
  },
]

export type PartnerTier = 'technology' | 'agency' | 'media'

export type PartnerItem = {
  slug: string
  name: string
  tier: PartnerTier
  blurb: string
}

export const GEO_PARTNERS: PartnerItem[] = [
  {
    slug: 'agency-geo',
    name: 'GEO 咨询与代运营伙伴',
    tier: 'agency',
    blurb: '使用统一采样口径为客户交付基线与复测。欢迎具备内容与公关能力的机构加盟。',
  },
  {
    slug: 'tech-data',
    name: '数据与云合作',
    tier: 'technology',
    blurb: '在合规前提下对接存储、观测与通知通道，不改变公开诊断只读原则。',
  },
  {
    slug: 'media-review',
    name: '测评与媒体协作',
    tier: 'media',
    blurb: '共建可引用测评与方法透明的行业内容，拒绝无方法排行榜。',
  },
]

export type CustomerStory = {
  slug: string
  industry: string
  title: string
  summary: string
  /** 只描述动作与方法，不写虚构分数 */
  actions: string[]
  outcomeNote: string
}

/** 真实案例占位：无客户授权前不写评分与精确名次 */
export const GEO_CUSTOMER_STORIES: CustomerStory[] = [
  {
    slug: 'consumer-brand-entity',
    industry: '消费品',
    title: '消费品品牌：先统一实体，再打对比题',
    summary: '团队优先治理别名与产品事实，再针对「怎么选」类问题补测评页。',
    actions: ['品牌实体与别名盘点', '锁定高意图对比问题集', '发布可抽取对比表与适用人群'],
    outcomeNote: '具体提及率变化以客户授权后的脱敏报告为准，本站不展示未授权数字。',
  },
  {
    slug: 'b2b-saas-competitor',
    industry: 'B2B SaaS',
    title: 'SaaS：用同口径竞品透视排期内容',
    summary: '把「替代 / 对比」题上的缺口直接变成两周内容日历。',
    actions: ['竞品同题采样', '识别独有机会问题', '案例页补结果指标（经客户确认）'],
    outcomeNote: '效果验证采用双周复测；对外只分享方法与授权摘要。',
  },
  {
    slug: 'agency-delivery',
    industry: '代理交付',
    title: '代理商：用证据包代替截图汇报',
    summary: '向客户交付问题时版本、引擎名单与原始回答归档，减少口径争议。',
    actions: ['问题集版本管理', '证据包导出', '季度方法说明对齐'],
    outcomeNote: '不使用无法复核的「AI 排名第一」话术。',
  },
]

export function getCustomerStory(slug: string) {
  return GEO_CUSTOMER_STORIES.find((c) => c.slug === slug)
}
