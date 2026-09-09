/**
 * 核心实体的 zod 运行时 schema（数据结构定义的运行时形态）
 * ------------------------------------------------------------------
 * 用途：
 *  - 接口响应校验 / 契约测试（测试程序直接 import 断言漂移）
 *  - 需要 JSON Schema 时可由 zod 导出
 * 字段名与 entities.ts 完全一致（TS 类型 = z.infer）。
 * 覆盖核心共享实体；其余实体目前仅类型层（entities.ts），按需补 schema。
 */
import { z } from 'zod';
import {
  ALIAS_SOURCES, BRAND_STATUSES, COLLECT_ENDS, COLLECT_PLATFORMS, CREDIT_TXN_TYPES,
  ORDER_CATEGORIES, PAY_METHODS, PAYMENT_ORDER_STATUSES, PUBLISH_ORDER_STATUSES,
  QUERY_TYPES, SLOT_STATUSES, SUBSCRIPTION_STATUSES, TASK_STATUSES, TASK_TRIGGERS,
} from './enums';

// ---------- 基础 ----------
const dateish = z.union([z.date(), z.string()]).optional();
const id = z.string();

// ---------- 账号 / 品牌 ----------
export const UserSchema = z.object({
  _id: id,
  account: z.string().nullish(),
  phone: z.string().nullish(),
  password_hash: z.string().optional(),
  name: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  industry: z.string().optional(),
  is_superuser: z.boolean().default(false),
  roles: z.array(z.string()).default([]),
  status: z.enum(['active', 'disabled']).default('active'),
  created_at: dateish,
  updated_at: dateish,
});
export type UserSchema = z.infer<typeof UserSchema>;

export const BrandSchema = z.object({
  brand_id: id,
  user_id: id,
  name: z.string().min(1),
  industry: z.string().optional(),
  website: z.string().optional(),
  business_desc: z.string().optional(),
  platforms: z.array(z.string()).default(['deepseek', 'doubao', 'wenxin', 'yuanbao']),
  status: z.enum(BRAND_STATUSES).default('building'),
  is_first_brand: z.boolean().default(false),
  rename_remaining: z.number().default(3),
  access_type: z.enum(['own', 'agency']).default('own'),
  menu_keys: z.array(z.string()).default([]),
});
export type BrandSchema = z.infer<typeof BrandSchema>;

export const BrandAliasSchema = z.object({
  brand_id: id,
  alias: z.string().min(1),
  source: z.enum(ALIAS_SOURCES).default('auto'),
  enabled: z.boolean().default(true),
});
export type BrandAliasSchema = z.infer<typeof BrandAliasSchema>;

// ---------- 监控问题 ----------
export const MonitorQuerySchema = z.object({
  query_id: z.number(),
  user_id: id.optional(),
  brand_id: id.optional(),
  query: z.string().min(1),
  question_list: z.array(z.object({ user_friendly: z.string().optional(), platform_query: z.string().optional() })).default([]),
  query_type: z.enum(QUERY_TYPES),
  is_golden: z.boolean().default(false),
  golden_query_ranking: z.unknown().nullable().default(null),
  weight: z.number().default(1),
  platform_prompt: z.string().optional(),
  query_description: z.string().optional(),
  query_status: z.boolean().default(true),
  query_is_execute: z.boolean().default(true),
  effective_to: z.union([z.date(), z.string(), z.null()]).optional(),
  query_order: z.number().default(0),
  group_id: z.string().optional(),
  task_id: z.string().optional(),
});
export type MonitorQuerySchema = z.infer<typeof MonitorQuerySchema>;

// ---------- 采集 ----------
export const CollectTaskSchema = z.object({
  task_id: id,
  brand_id: id,
  date: z.string(),
  trigger: z.enum(TASK_TRIGGERS).default('schedule'),
  expected_slots: z.number().optional(),
  actual_slots: z.number().default(0),
  failed_slots: z.number().default(0),
  completeness_rate: z.number().optional(),
  status: z.enum(TASK_STATUSES).default('created'),
  started_at: dateish,
  finished_at: dateish,
});
export type CollectTaskSchema = z.infer<typeof CollectTaskSchema>;

export const CollectSlotSchema = z.object({
  slot_id: id,
  task_id: id,
  brand_id: id,
  query_id: z.number(),
  query_type: z.string().optional(),
  platform: z.enum(COLLECT_PLATFORMS),
  end: z.enum(COLLECT_ENDS).default('web'),
  date: z.string(),
  question_sent: z.string().optional(),
  mock_account_id: z.string().optional(),
  status: z.enum(SLOT_STATUSES).default('pending'),
  answer_id: z.string().optional(),
  error: z.string().optional(),
  attempts: z.number().default(0),
  finished_at: dateish,
});
export type CollectSlotSchema = z.infer<typeof CollectSlotSchema>;

export const RawAnswerSchema = z.object({
  answer_id: id,
  slot_id: id,
  brand_id: z.string().optional(),
  query_id: z.number().optional(),
  platform: z.string().optional(),
  end: z.string().optional(),
  date: z.string().optional(),
  question_sent: z.string().optional(),
  answer_text: z.string().optional(),
  cited_urls: z.array(z.object({ url: z.string().optional(), title: z.string().optional(), rank: z.number().optional() })).default([]),
  model_meta: z.unknown().optional(),
  parsed: z.boolean().default(false),
});
export type RawAnswerSchema = z.infer<typeof RawAnswerSchema>;

export const SnapshotSchema = z.object({
  snapshot_id: id,
  slot_id: id,
  brand_id: z.string().optional(),
  query_id: z.number().optional(),
  platform: z.string().optional(),
  exec_date: z.string().optional(),
  photo_url: z.string().optional(),
  oss_key: z.string().optional(),
  size: z.number().optional(),
});
export type SnapshotSchema = z.infer<typeof SnapshotSchema>;

export const CitationEdgeSchema = z.object({
  slot_id: id,
  date: z.string(),
  brand_id: id,
  query_id: z.number(),
  platform: z.string(),
  article_id: z.string().optional(),
  source_id: id,
  is_own: z.boolean().default(false),
  mentioned_entity: z.string().optional(),
});
export type CitationEdgeSchema = z.infer<typeof CitationEdgeSchema>;

// ---------- 套餐 / 订阅 / 积分 ----------
export const PlanSchema = z.object({
  plan_id: z.number(),
  plan_code: z.string(),
  plan_name: z.string().optional(),
  plan_type: z.string().optional(),
  billing_cycle: z.enum(['monthly', 'quarterly', 'yearly']),
  price: z.number().optional(),
  original_price: z.number().optional(),
  duration_days: z.number().optional(),
  query_limit: z.number().optional(),
  features: z.unknown().optional(),
  sort: z.number().optional(),
  on_sale: z.boolean().default(true),
});
export type PlanSchema = z.infer<typeof PlanSchema>;

export const SubscriptionSchema = z.object({
  subscription_id: z.number(),
  user_id: id,
  brand_id: id,
  plan_id: z.number().optional(),
  plan_code: z.string().optional(),
  plan_name: z.string().optional(),
  vip_level: z.string().optional(),
  start_date: z.string().optional(),
  expire_date: z.string().optional(),
  query_limit: z.number().optional(),
  query_count: z.number().default(0),
  platform_list: z.array(z.string()).default([]),
  status: z.enum(SUBSCRIPTION_STATUSES).default('active'),
  upgrade_from_subscription_id: z.number().optional(),
});
export type SubscriptionSchema = z.infer<typeof SubscriptionSchema>;

export const CreditAccountSchema = z.object({
  user_id: id,
  gold_balance: z.number().default(0),
  silver_balance: z.number().default(0),
  frozen: z.number().default(0),
  available: z.number().optional(),
  publish_available: z.number().optional(),
  total_recharge: z.number().default(0),
  total_consume: z.number().default(0),
  total_expired: z.number().default(0),
});
export type CreditAccountSchema = z.infer<typeof CreditAccountSchema>;

export const CreditTransactionSchema = z.object({
  txn_id: id,
  user_id: id,
  type: z.enum(CREDIT_TXN_TYPES),
  coin: z.enum(['gold', 'silver']).default('gold'),
  amount: z.number().optional(),
  balance_after: z.number().optional(),
  ref_type: z.string().optional(),
  ref_id: z.string().optional(),
  remark: z.string().optional(),
});
export type CreditTransactionSchema = z.infer<typeof CreditTransactionSchema>;

export const PaymentOrderSchema = z.object({
  order_no: z.string(),
  user_id: id,
  brand_id: z.string().optional(),
  order_category: z.enum(ORDER_CATEGORIES),
  pay_method: z.enum(PAY_METHODS).default('credit'),
  credit_amount: z.number().optional(),
  plan_id: z.number().optional(),
  plan_code: z.string().optional(),
  plan_name: z.string().optional(),
  pack_id: z.number().optional(),
  duration_days: z.number().optional(),
  query_limit: z.number().optional(),
  original_price: z.number().optional(),
  price: z.number().optional(),
  pay_amount: z.number().optional(),
  upgrade_deduct: z.number().default(0),
  status: z.enum(PAYMENT_ORDER_STATUSES).default('pending'),
  receipt_no: z.string().optional(),
  is_invoiced: z.boolean().default(false),
  diagnosis_id: z.string().optional(),
  order_type: z.enum(['new', 'upgrade']).default('new'),
});
export type PaymentOrderSchema = z.infer<typeof PaymentOrderSchema>;

// ---------- 发稿 ----------
export const MediaChannelSchema = z.object({
  media_key: z.string(),
  name: z.string(),
  type: z.string().optional(),
  site_url: z.string().optional(),
  favicon: z.string().optional(),
  list_price: z.number().optional(),
  sell_price: z.number().optional(),
  discount_rate: z.number().optional(),
  categories: z.array(z.string()).default([]),
  indexed_engines: z.array(z.string()).default([]),
  ref_count: z.number().default(0),
  article_count: z.number().default(0),
  query_count: z.number().default(0),
  cost_per_citation: z.number().nullish(),
  stats_window_days: z.number().default(30),
  source_id: z.string().optional(),
  enabled: z.boolean().default(true),
});
export type MediaChannelSchema = z.infer<typeof MediaChannelSchema>;

export const PublishOrderSchema = z.object({
  order_no: z.string(),
  user_id: id,
  brand_id: z.string().optional(),
  article_id: z.string().optional(),
  article_title: z.string().optional(),
  article_note: z.string().optional(),
  media_key: z.string().optional(),
  media_name: z.string().optional(),
  status: z.enum(PUBLISH_ORDER_STATUSES).default('pending'),
  published_url: z.string().nullish(),
  fail_reason: z.string().nullish(),
  list_price: z.number().optional(),
  sell_price: z.number().optional(),
  discount_rate: z.number().optional(),
  credit_txn_freeze: z.string().optional(),
  credit_txn_settle: z.string().optional(),
  published_at: dateish,
  cite_count: z.number().default(0),
  cite_days: z.array(z.string()).default([]),
});
export type PublishOrderSchema = z.infer<typeof PublishOrderSchema>;

// ---------- onboarding / 报告 ----------
export const OnboardingTaskSchema = z.object({
  task_id: id,
  user_id: id,
  brand_id: z.string().optional(),
  input: z.object({
    brand_name: z.string().optional(),
    website: z.string().optional(),
    business_desc: z.string().optional(),
    name: z.string().optional(),
    position: z.string().optional(),
  }).optional(),
  stage: z.enum(['crawl', 'keyword', 'query', 'overview', 'done', 'fail']).default('crawl'),
  keywords: z.array(z.string()).default([]),
  generated_question_list: z.array(z.unknown()).default([]),
  error: z.string().optional(),
});
export type OnboardingTaskSchema = z.infer<typeof OnboardingTaskSchema>;

export const ReportSchema = z.object({
  report_id: id,
  brand_id: id,
  period_type: z.enum(['weekly', 'monthly']),
  period_key: z.string(),
  label: z.string().optional(),
  range: z.string().optional(),
  status: z.enum(['generating', 'ready', 'failed']).default('generating'),
  template_id: z.number().optional(),
  modules_summary: z.unknown().optional(),
  payload: z.unknown().optional(),
  overview_stats: z.unknown().optional(),
  generated_at: dateish,
});
export type ReportSchema = z.infer<typeof ReportSchema>;
