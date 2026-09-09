/**
 * 全平台共享枚举（单一事实源）
 * ------------------------------------------------------------------
 * 全部用 `as const` 数组 + `typeof[number]` 联合类型，不用 TS `enum`：
 *  - 运行时 JS（gen-api / geo-agent / 采集程序）拿到的是数组/对象
 *  - TS 消费方拿到字面量联合类型，改一处全仓生效
 * 来源：apps/gen-api/app/model/*.js 的 Mongoose enum + 线上实测契约。
 */

// ==================== 平台 / 引擎 ====================
/** 监控引擎（参与排名/口碑计分的 4 家，对齐 config.platforms 与前端 EngineKey；千问暂移除） */
export const ENGINE_KEYS = ['doubao', 'deepseek', 'wenxin', 'yuanbao'] as const;
export type EngineKey = (typeof ENGINE_KEYS)[number];

/** 采集平台（比监控引擎多一家 kimi，来自 collect_slots.platform enum；千问暂移除） */
export const COLLECT_PLATFORMS = ['doubao', 'deepseek', 'wenxin', 'yuanbao', 'kimi'] as const;
export type CollectPlatform = (typeof COLLECT_PLATFORMS)[number];

/** 采集端（网页端 / 移动端） */
export const COLLECT_ENDS = ['web', 'mobile'] as const;
export type CollectEnd = (typeof COLLECT_ENDS)[number];

// ==================== 查询 ====================
/** 监控问题类型：排名题（industry）/ 口碑题（brand） */
export const QUERY_TYPES = ['industry', 'brand'] as const;
export type QueryType = (typeof QUERY_TYPES)[number];

// ==================== onboarding ====================
export const ONBOARDING_STAGES = ['crawl', 'keyword', 'query', 'overview', 'done', 'fail'] as const;
export type OnboardingStage = (typeof ONBOARDING_STAGES)[number];

export const ONBOARDING_TRACE_KINDS = ['search_query', 'page_read', 'keyword_weight', 'llm_output', 'user_confirm'] as const;
export type OnboardingTraceKind = (typeof ONBOARDING_TRACE_KINDS)[number];

// ==================== 账号 / 品牌 ====================
export const USER_STATUSES = ['active', 'disabled'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const BRAND_STATUSES = ['building', 'active', 'expired', 'disabled'] as const;
export type BrandStatus = (typeof BRAND_STATUSES)[number];

/** BrandBrief.status 实测取值（比品牌主档少 building） */
export const BRAND_BRIEF_STATUSES = ['active', 'expired', 'building'] as const;
export type BrandBriefStatus = (typeof BRAND_BRIEF_STATUSES)[number];

export const ALIAS_SOURCES = ['auto', 'manual'] as const;
export type AliasSource = (typeof ALIAS_SOURCES)[number];

export const ENTITY_SCOPES = ['target', 'registered', 'discovered'] as const;
export type EntityScope = (typeof ENTITY_SCOPES)[number];

// ==================== 采集 ====================
export const SLOT_STATUSES = ['pending', 'running', 'ok', 'fail', 'empty'] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export const TASK_TRIGGERS = ['schedule', 'manual'] as const;
export type TaskTrigger = (typeof TASK_TRIGGERS)[number];

export const TASK_STATUSES = ['created', 'running', 'ok', 'fail'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// ==================== 套餐 / 订阅 / 计费 ====================
export const PLAN_TYPES = ['free', 'starter', 'pro', 'custom'] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

/** 付费套餐计费周期（plan schema enum） */
export const BILLING_CYCLES = ['monthly', 'quarterly', 'yearly'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

/**
 * 套餐数据实际出现的计费周期（含免费版 'permanent'）。
 * ⚠️ 已知漂移：app.js 种子给 free 档写 billing_cycle='permanent'，但 plan.js enum 只有 monthly/quarterly/yearly
 *    （updateOne+upsert 不走校验所以没报错）。收口前用此常量承载数据事实，收口时二选一。
 */
export const PLAN_BILLING_CYCLES = [...BILLING_CYCLES, 'permanent'] as const;
export type PlanBillingCycle = (typeof PLAN_BILLING_CYCLES)[number];

export const VIP_LEVELS = ['starter', 'pro'] as const;
export type VipLevel = (typeof VIP_LEVELS)[number];

export const SUBSCRIPTION_STATUSES = ['active', 'expired', 'refunded'] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const CREDIT_TXN_TYPES = ['recharge', 'consume', 'freeze', 'unfreeze', 'refund', 'expired'] as const;
export type CreditTxnType = (typeof CREDIT_TXN_TYPES)[number];

export const COINS = ['gold', 'silver'] as const;
export type Coin = (typeof COINS)[number];

export const ORDER_CATEGORIES = ['plan', 'recharge', 'diagnosis'] as const;
export type OrderCategory = (typeof ORDER_CATEGORIES)[number];

export const PAY_METHODS = ['credit', 'wx'] as const;
export type PayMethod = (typeof PAY_METHODS)[number];

export const PAYMENT_ORDER_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'closed'] as const;
export type PaymentOrderStatus = (typeof PAYMENT_ORDER_STATUSES)[number];

export const ORDER_TYPES = ['new', 'upgrade'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

// ==================== 发稿 ====================
export const PUBLISH_ORDER_STATUSES = ['pending', 'submitted', 'ok', 'fail'] as const;
export type PublishOrderStatus = (typeof PUBLISH_ORDER_STATUSES)[number];

export const ARTICLE_STATUSES = ['draft', 'ready', 'published', 'archived'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const WRITING_JOB_STATUSES = ['starting', 'running', 'awaiting_user', 'completed', 'failed', 'cancelled'] as const;
export type WritingJobStatus = (typeof WRITING_JOB_STATUSES)[number];

// ==================== 报告 / 指标 ====================
export const REPORT_PERIOD_TYPES = ['weekly', 'monthly'] as const;
export type ReportPeriodType = (typeof REPORT_PERIOD_TYPES)[number];

export const REPORT_STATUSES = ['generating', 'ready', 'failed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_LATEST_STATUSES = ['ready', 'generating'] as const;
export type ReportLatestStatus = (typeof REPORT_LATEST_STATUSES)[number];

export const COLLECTION_STATUSES = ['normal', 'no_data'] as const;
export type CollectionStatus = (typeof COLLECTION_STATUSES)[number];

export const POLARITIES = ['positive', 'neutral', 'negative'] as const;
export type Polarity = (typeof POLARITIES)[number];

export const TRENDS = ['up', 'down', 'flat'] as const;
export type Trend = (typeof TRENDS)[number];

export const COMPANY_TRENDS = ['new', 'up', 'down', 'stable'] as const;
export type CompanyTrend = (typeof COMPANY_TRENDS)[number];

// ==================== 诊断 / 循证 / 挖掘 / 其余 ====================
export const DIAGNOSIS_STATUSES = ['pending', 'running', 'done', 'fail'] as const;
export type DiagnosisStatus = (typeof DIAGNOSIS_STATUSES)[number];

export const EVIDENCE_TAGS = ['top-cite', 'recent', '5star', 'standard'] as const;
export type EvidenceTag = (typeof EVIDENCE_TAGS)[number];

export const MINED_TOPIC_STATUSES = ['candidate', 'adopted', 'dismissed'] as const;
export type MinedTopicStatus = (typeof MINED_TOPIC_STATUSES)[number];

export const REMINDER_LEVELS = ['info', 'warn', 'error'] as const;
export type ReminderLevel = (typeof REMINDER_LEVELS)[number];

export const AGENT_HISTORY_KINDS = ['chat', 'mining', 'writing', 'intel'] as const;
export type AgentHistoryKind = (typeof AGENT_HISTORY_KINDS)[number];

export const LIBRARY_KINDS = ['doc', 'link', 'text'] as const;
export type LibraryKind = (typeof LIBRARY_KINDS)[number];

export const WIKI_SCOPES = ['brand', 'company', 'competitor'] as const;
export type WikiScope = (typeof WIKI_SCOPES)[number];

/** 品牌共享类型（brand.access_type） */
export const ACCESS_TYPES = ['own', 'agency'] as const;
export type AccessType = (typeof ACCESS_TYPES)[number];
