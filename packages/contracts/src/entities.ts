/**
 * 实体结构定义（对齐 apps/gen-api/app/model/*.js，字段名即 Mongo 文档字段）
 * ------------------------------------------------------------------
 * 这里是与 DB 一一对应的「数据结构」层；zod 运行时 schema 见 schemas.ts，
 * 接口请求/响应类型见 api.ts。三者的字段来源一致，避免各写一份。
 */
import type {
  AccessType, AgentHistoryKind, AliasSource, ArticleStatus, BrandStatus,
  BillingCycle, Coin, CollectEnd, CollectPlatform, CreditTxnType, DiagnosisStatus,
  EntityScope, EvidenceTag, LibraryKind, MinedTopicStatus, OrderCategory,
  OrderType, PayMethod, PaymentOrderStatus, Polarity, PublishOrderStatus,
  QueryType, ReminderLevel, ReportPeriodType, ReportStatus, SlotStatus,
  SubscriptionStatus, TaskStatus, TaskTrigger, UserStatus, WikiScope, WritingJobStatus,
} from './enums';

// ==================== 账号 / 品牌主档 ====================
/** 用户账号（users） */
export interface User {
  _id: string;
  account?: string | null;
  phone?: string | null;
  password_hash?: string;
  name?: string;
  company?: string;
  position?: string;
  industry?: string;
  is_superuser: boolean;
  roles: string[];
  status: UserStatus;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌主档（brands） */
export interface Brand {
  brand_id: string;
  user_id: string;
  name: string;
  industry?: string;
  website?: string;
  business_desc?: string;
  platforms: string[];
  status: BrandStatus;
  is_first_brand: boolean;
  rename_remaining: number;
  access_type: AccessType;
  menu_keys: string[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌画像（AI 生成，brand_profiles） */
export interface BrandProfile {
  brand_id: string;
  industry?: string[];
  website?: string;
  slogan?: string;
  tone?: unknown;
  description?: string;
  scripts?: string[];
  seeded_from_db: boolean;
  exists: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌识别别名（brand_aliases） */
export interface BrandAlias {
  brand_id: string;
  alias: string;
  source: AliasSource;
  enabled: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌产品线（brand_products） */
export interface BrandProduct {
  brand_id: string;
  name?: string;
  category?: string;
  specs?: unknown;
  price_range?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 用户登记竞品（competitor_registers） */
export interface CompetitorRegister {
  brand_id: string;
  name?: string;
  entity_id?: string;
  note?: string;
  source: string;
  compet_point?: string;
  enabled: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌实体库 / 竞品池（brand_entities） */
export interface BrandEntity {
  entity_id: string;
  canonical_name: string;
  name_variants: string[];
  scope: EntityScope;
  industry?: string;
  discovered_from?: { query_id?: number; platform?: string };
  first_seen?: string;
  last_seen?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌知识库（brand_wikis） */
export interface BrandWiki {
  brand_id: string;
  scope: WikiScope;
  path?: string;
  markdown?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌资料库 / 情报文（brand_libraries） */
export interface BrandLibrary {
  brand_id: string;
  kind: LibraryKind;
  title?: string;
  content?: string;
  file_oss_key?: string;
  url?: string;
  slug?: string;
  tags: string[];
  source?: string;
  word_count?: number;
  meta?: unknown;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==================== 监控问题 ====================
/** 监控问题（核心配置，monitor_queries） */
export interface MonitorQueryEntity {
  query_id: number;
  user_id?: string;
  brand_id?: string;
  query: string;
  question_list: { user_friendly?: string; platform_query?: string }[];
  query_type: QueryType;
  is_golden: boolean;
  golden_query_ranking?: unknown | null;
  weight: number;
  platform_prompt?: string;
  query_description?: string;
  query_status: boolean;
  query_is_execute: boolean;
  effective_to?: Date | string | null;
  query_order: number;
  group_id?: string;
  task_id?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 问题分组（query_groups） */
export interface QueryGroup {
  group_id: string;
  brand_id: string;
  query_type?: string;
  name?: string;
  sort?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 话题挖掘候选（mined_topics） */
export interface MinedTopic {
  topic_id: string;
  brand_id: string;
  query_text?: string;
  semantic_hash?: string;
  volume_hint?: number;
  competition_hint?: number;
  status: MinedTopicStatus;
  adopted_query_id?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==================== 采集 ====================
/** 每日采集任务（品牌×天，collect_tasks） */
export interface CollectTask {
  task_id: string;
  brand_id: string;
  date: string;
  trigger: TaskTrigger;
  expected_slots?: number;
  actual_slots: number;
  failed_slots: number;
  completeness_rate?: number;
  status: TaskStatus;
  started_at?: Date | string;
  finished_at?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 采集槽位（问题×引擎×天，原子单位，collect_slots） */
export interface CollectSlot {
  slot_id: string;
  task_id: string;
  brand_id: string;
  query_id: number;
  query_type?: string;
  platform: CollectPlatform;
  end: CollectEnd;
  date: string;
  question_sent?: string;
  mock_account_id?: string;
  status: SlotStatus;
  answer_id?: string;
  error?: string;
  attempts: number;
  finished_at?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** AI 原始回答（大文本事实源，raw_answers） */
export interface RawAnswer {
  answer_id: string;
  slot_id: string;
  brand_id?: string;
  query_id?: number;
  query_type?: QueryType;   // 解析分流的唯一依据：industry→排名流水线A / brand→口碑流水线B
  platform?: string;
  end?: string;
  date?: string;
  question_sent?: string;
  answer_text?: string;
  cited_urls: { url?: string; title?: string; index?: number; snippet?: string; site_name?: string; domain?: string; publish_time?: string }[];
  model_meta?: unknown;
  parsed: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 采集截图存证（snapshots） */
export interface Snapshot {
  snapshot_id: string;
  slot_id: string;
  brand_id?: string;
  query_id?: number;
  platform?: string;
  exec_date?: string;
  photo_url?: string;
  oss_key?: string;
  size?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 引用边（槽位→文章→信源，citation_edges） */
export interface CitationEdge {
  slot_id: string;
  date: string;
  brand_id: string;
  query_id: number;
  platform: string;
  article_id?: string;
  source_id: string;
  is_own: boolean;
  mentioned_entity?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 归一文内文章（cited_articles） */
export interface CitedArticle {
  article_id: string;
  canonical_url: string;
  url?: string;
  title?: string;
  source_id: string;
  publish_date?: string;
  first_cited_at?: string;
  last_cited_at?: string;
  is_brand_published: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 信源主档（canonical_sources） */
export interface CanonicalSource {
  source_id: string;
  canonical_source: string;
  category?: string;
  domains: string[];
  auth_info_des?: string;
  auth_info_level?: string;
  media_key?: string;
  first_cited_at?: string;
  last_cited_at?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 信源日统计（source_daily_stats） */
export interface SourceDailyStat {
  date: string;
  brand_id: string;
  source_id: string;
  platform?: string;
  ref_count?: number;
  article_count?: number;
  query_count?: number;
  own_article_count?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌位次命中（brand_mentions） */
export interface BrandMention {
  slot_id: string;
  date: string;
  brand_id: string;
  query_id: number;
  platform?: string;
  end?: string;
  entity_id?: string;
  entity_name?: string;
  position?: number;
  is_target: boolean;
  snippet?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==================== 指标 / 报告 ====================
/** 品牌级日指标（daily_metric_brands） */
export interface DailyMetricBrand {
  brand_id: string;
  query_id?: number;
  platform?: string;
  date?: string;
  positive_n?: number;
  neutral_n?: number;
  negative_n?: number;
  ratio?: { positive?: number; neutral?: number; negative?: number };
  rep_score?: number;
  mention_rate?: number;
  top3_rate?: number;
  first_rate?: number;
  avg_rank?: number;
  visibility_score?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 问题级日指标（daily_metric_queries） */
export interface DailyMetricQuery {
  brand_id: string;
  query_id: number;
  platform?: string;
  end?: string;
  date: string;
  denominator?: number;
  mentioned?: number;
  top3?: number;
  first?: number;
  mention_rate?: number;
  top3_rate?: number;
  first_rate?: number;
  rank_value?: string;
  score?: number;
  group_id?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 每日榜单快照（leaderboard_dailies） */
export interface LeaderboardDaily {
  date: string;
  brand_id: string;
  query_id: number;
  entries: {
    entity_id?: string;
    name?: string;
    rank?: number;
    score?: number;
    is_target?: boolean;
    mentioned_platforms?: number;
  }[];
  rank_weight_table: number[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 报告（reports） */
export interface Report {
  report_id: string;
  brand_id: string;
  period_type: ReportPeriodType;
  period_key: string;
  label?: string;
  range?: string;
  status: ReportStatus;
  template_id?: number;
  modules_summary?: unknown;
  payload?: unknown;
  overview_stats?: unknown;
  generated_at?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 报告模板（report_templates） */
export interface ReportTemplateEntity {
  name?: string;
  modules: { key?: string; sort?: number; enabled?: boolean }[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==================== 套餐 / 订阅 / 积分 ====================
/** 套餐定义（plans） */
export interface Plan {
  plan_id: number;
  plan_code: string;
  plan_name?: string;
  plan_type?: string;
  billing_cycle: BillingCycle;
  price?: number;
  original_price?: number;
  duration_days?: number;
  query_limit?: number;
  features?: unknown;
  sort?: number;
  on_sale: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 品牌订阅（subscriptions） */
export interface SubscriptionEntity {
  subscription_id: number;
  user_id: string;
  brand_id: string;
  plan_id?: number;
  plan_code?: string;
  plan_name?: string;
  vip_level?: string;
  start_date?: string;
  expire_date?: string;
  query_limit?: number;
  query_count: number;
  platform_list: string[];
  status: SubscriptionStatus;
  upgrade_from_subscription_id?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 积分钱包（credit_accounts） */
export interface CreditAccountEntity {
  user_id: string;
  gold_balance: number;
  silver_balance: number;
  frozen: number;
  available?: number;
  publish_available?: number;
  total_recharge: number;
  total_consume: number;
  total_expired: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 积分流水（credit_transactions） */
export interface CreditTransaction {
  txn_id: string;
  user_id: string;
  type: CreditTxnType;
  coin: Coin;
  amount?: number;
  balance_after?: number;
  ref_type?: string;
  ref_id?: string;
  remark?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 充值/套餐/诊断订单（payment_orders） */
export interface PaymentOrder {
  order_no: string;
  user_id: string;
  brand_id?: string;
  order_category: OrderCategory;
  pay_method: PayMethod;
  credit_amount?: number;
  plan_id?: number;
  plan_code?: string;
  plan_name?: string;
  pack_id?: number;
  duration_days?: number;
  query_limit?: number;
  original_price?: number;
  price?: number;
  pay_amount?: number;
  upgrade_deduct: number;
  status: PaymentOrderStatus;
  receipt_no?: string;
  is_invoiced: boolean;
  wx_prepay_id?: string;
  wx_transaction_id?: string;
  wx_code_url?: string;
  wx_pay_time?: Date | string;
  paid_at?: Date | string;
  expire_time?: Date | string;
  client_ip?: string;
  remark?: string;
  diagnosis_id?: string;
  order_type: OrderType;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==================== 发稿 ====================
/** 发稿渠道库（media_channels） */
export interface MediaChannelEntity {
  media_key: string;
  name: string;
  type?: string;
  site_url?: string;
  favicon?: string;
  list_price?: number;
  sell_price?: number;
  discount_rate?: number;
  categories: string[];
  indexed_engines: string[];
  ref_count: number;
  article_count: number;
  query_count: number;
  cost_per_citation?: number;
  stats_window_days: number;
  stats_status?: string;
  source_id?: string;
  enabled: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 渠道收藏（media_favs） */
export interface MediaFav {
  user_id: string;
  media_key?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 发稿订单（publish_orders） */
export interface PublishOrderEntity {
  order_no: string;
  user_id: string;
  brand_id?: string;
  article_id?: string;
  article_title?: string;
  article_note?: string;
  media_key?: string;
  media_name?: string;
  status: PublishOrderStatus;
  published_url?: string;
  fail_reason?: string;
  list_price?: number;
  sell_price?: number;
  discount_rate?: number;
  credit_txn_freeze?: string;
  credit_txn_settle?: string;
  published_at?: Date | string;
  cite_count: number;
  cite_days: string[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 生成稿件/草稿（articles_generated） */
export interface ArticleGenerated {
  article_id: string;
  job_id: string;
  uid?: string;
  brand_id?: string;
  title?: string;
  content_md?: string;
  word_count?: number;
  status: ArticleStatus;
  quality_report?: unknown;
  style_references: string[];
  publish_order_nos: string[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 写作 Agent 会话（writing_jobs） */
export interface WritingJob {
  job_id: string;
  uid: string;
  brand_id?: string;
  topic?: string;
  query_id?: number;
  evidence_ids: string[];
  kb_refs: string[];
  status: WritingJobStatus;
  current_node?: string;
  guardrail_report?: unknown;
  outline?: unknown;
  messages: unknown[];
  created_at?: Date | string;
  updated_at?: Date | string;
}

// ==================== onboarding / 诊断 / 循证 / 其余 ====================
/** 注册引导任务状态机（onboarding_tasks） */
export interface OnboardingTask {
  task_id: string;
  user_id: string;
  brand_id?: string;
  input?: { brand_name?: string; website?: string; business_desc?: string; name?: string; position?: string };
  stage: import('./enums').OnboardingStage;
  crawler_started_at?: Date | string;
  crawler_completed_at?: Date | string;
  keyword_gen_started_at?: Date | string;
  keyword_gen_completed_at?: Date | string;
  keywords: string[];
  generated_question_list: unknown[];
  error?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 首次分析过程留痕（onboarding_traces） */
export interface OnboardingTrace {
  task_id: string;
  brand_id: string;
  user_id?: string;
  kind: import('./enums').OnboardingTraceKind;
  query?: string;
  url?: string;
  snapshot?: string;
  keyword?: string;
  weight?: number;
  meta?: unknown;
  created_at?: Date | string;
}

/** 单次诊断任务（diagnosis_tasks） */
export interface DiagnosisTask {
  diagnosis_id: string;
  user_id: string;
  target_brand_input?: unknown;
  aliases: string[];
  ends: string[];
  status: DiagnosisStatus;
  credit_cost?: number;
  order_no?: string;
  result?: unknown;
  share_token?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 循证库（evidence_items） */
export interface EvidenceItem {
  evidence_id: string;
  brand_id: string;
  title?: string;
  url?: string;
  excerpt?: string;
  platform?: string;
  tag: EvidenceTag;
  quote_count: number;
  referenced_at?: string;
  alive: boolean;
  is_own: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 口碑观点单元（opinions） */
export interface Opinion {
  slot_id: string;
  date: string;
  brand_id?: string;
  query_id?: number;
  platform?: string;
  topic_id: string;
  quote_text?: string;
  polarity: Polarity;
  target_entity?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 观点话题词典（opinion_topics） */
export interface OpinionTopic {
  topic_id: string;
  brand_id: string;
  label?: string;
  variants: string[];
  polarity_hint?: string;
  first_seen?: string;
  last_seen?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 菜单配置（menu_configs） */
export interface MenuConfig {
  menu_code: string;
  category?: string;
  label?: string;
  path?: string;
  icon?: string;
  sort_order?: number;
  visible: boolean;
  min_plan: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 站内提醒（reminders） */
export interface Reminder {
  user_id: string;
  brand_id?: string;
  type?: string;
  level: ReminderLevel;
  title?: string;
  body?: string;
  read: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** 用户埋点（user_click_events） */
export interface UserClickEvent {
  user_id?: string;
  brand_id?: string;
  source: string;
  operation: string;
  ip?: string;
  ua?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** LLM 调用日志（llm_call_logs） */
export interface LlmCallLog {
  call_site: string;
  brand_id?: string;
  ref_id?: string;
  prompt_version: string;
  model: string;
  input_hash?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  latency_ms?: number;
  success?: boolean;
  retry: number;
  error?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/** Agent 会话史（agent_histories） */
export interface AgentHistory {
  session_id: string;
  uid?: string;
  brand_id?: string;
  kind: AgentHistoryKind;
  payload?: unknown;
  created_at?: Date | string;
  updated_at?: Date | string;
}
