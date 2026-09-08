/**
 * 管理员总后台（gen-admin）契约类型
 * ------------------------------------------------------------------
 * 数据源：apps/gen-api/app/controller/admin.js（只读监控 API，/admin/**）
 * 响应统一壳 { code: 200, msg, data }；列表统一 { list, total, page, page_size }。
 */
export interface AdminMe {
  user_id: string;
  account: string;
  name: string;
  is_superuser: boolean;
  roles: string[];
}

// ---- 通用分页 ----
export interface AdminPaged<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

// ---- 驾驶舱 ----
export interface AdminOverview {
  counts: {
    users: number; brands: number; active_brands: number;
    monitor_queries: number; media_channels: number; subscriptions_active: number;
  };
  collection: {
    date: string; tasks: number;
    expected_slots: number; actual_slots: number; failed_slots: number;
    completeness: number | null;
    status: Record<string, number>;
  };
  parse: {
    raw_total: number; parsed: number; unparsed: number;
    mentions: number; opinions: number; entities: number;
    citations: number; canonical_sources: number;
  };
  llm: {
    today_calls: number; today_tokens: number; today_errors: number;
    today_avg_latency_ms: number; today_p95_latency_ms: number;
  };
  billing: {
    today_gmv: number; today_orders: number;
    gold_balance: number; silver_balance: number; frozen: number;
  };
  reports: { ready: number; generating: number; failed: number };
  reminders: { error: number; warn: number; unread: number };
  schedule: { queue_backlog: number; last_collect_date: string | null; last_report_at: string | null };
  recent: { users: AdminUserRow[]; orders: AdminOrderRow[] };
}

// ---- 用户 ----
export interface AdminUserRow {
  user_id: string; account: string; phone: string; name: string;
  company: string; industry: string; status: string;
  is_superuser: boolean; roles: string[]; brand_count: number;
  created_at: string; updated_at: string;
}
export interface AdminUserDetail {
  user: AdminUserRow;
  brands: { brand_id: string; name: string; industry: string; status: string; query_count: number; rename_remaining: number; created_at: string }[];
  credit: AdminCreditAccountRow | null;
  subscriptions: AdminSubscriptionRow[];
  orders: AdminOrderRow[];
  recent_clicks: { source: string; operation: string; ip: string; created_at: string }[];
}

// ---- 品牌 ----
export interface AdminBrandRow {
  brand_id: string; name: string; industry: string; user_id: string; account: string;
  status: string; platforms: string[]; rename_remaining: number; access_type: string;
  created_at: string; updated_at: string;
}
export interface AdminBrandDetail {
  brand: AdminBrandRow;
  user: AdminUserRow | null;
  profile: unknown;
  aliases: { alias: string; source: string; enabled: boolean }[];
  products: { name: string; category: string; price_range: string }[];
  competitors: { name: string; source: string; compet_point: string; enabled: boolean }[];
  queries: AdminQueryRow[];
  subscription: AdminSubscriptionRow | null;
  credit: AdminCreditAccountRow | null;
  collect_tasks: AdminCollectTaskRow[];
  target_entities: { entity_id: string; canonical_name: string; industry: string }[];
}
export interface AdminQueryRow {
  query_id: number; query: string; query_type: string;
  query_status: boolean; query_is_execute: boolean; weight: number; query_description: string;
}

// ---- 采集 ----
export interface AdminCollectTaskRow {
  task_id: string; brand_id: string; brand_name?: string; date: string; trigger: string;
  expected_slots: number; actual_slots: number; failed_slots: number;
  completeness_rate: number | null; status: string; started_at: string | null; finished_at: string | null;
}
export interface AdminSlotRow {
  slot_id: string; query_id: number; query_type: string; platform: string; end: string;
  question_sent: string; mock_account_id: string; status: string; answer_id: string;
  error: string; attempts: number; finished_at: string | null;
}
export interface AdminAnswerRow {
  answer_id: string; slot_id: string; brand_id: string; query_id: number; platform: string;
  date: string; question_sent: string; answer_len: number; cited_urls: number; parsed: boolean; created_at: string;
}
export interface AdminSnapshotRow {
  snapshot_id: string; slot_id: string; brand_id: string; platform: string;
  exec_date: string; photo_url: string; size: number;
}

// ---- 解析 ----
export interface AdminParseOverview {
  counts: {
    entities: number; canonical_sources: number; cited_articles: number;
    mentions: number; opinions: number; citations: number;
  };
  polarity: { positive: number; neutral: number; negative: number };
  recent_7d: { date: string; avg_rep_score: number; avg_mention_rate: number; brands: number }[];
}

// ---- LLM ----
export interface AdminLlmLogRow {
  call_site: string; brand_id: string; ref_id: string; prompt_version: string; model: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null;
  latency_ms: number; success: boolean; retry: number; error: string; created_at: string;
}
export interface AdminLlmAgg {
  call_site: string; calls: number; errors: number; tokens: number; avg_latency_ms: number;
}

// ---- 计费 ----
export interface AdminPlanRow {
  plan_id: number; plan_code: string; plan_name: string; plan_type: string;
  billing_cycle: string; price: number; original_price: number;
  duration_days: number; query_limit: number; on_sale: boolean; sort: number;
}
export interface AdminSubscriptionRow {
  subscription_id: number; user_id: string; brand_id: string; plan_name: string; vip_level: string;
  start_date: string; expire_date: string; query_limit: number; query_count: number; status: string;
}
export interface AdminOrderRow {
  order_no: string; user_id: string; brand_id: string; order_category: string;
  plan_name: string; pay_method: string; pay_amount: number; credit_amount: number;
  status: string; is_invoiced: boolean; paid_at: string | null; created_at: string;
}
export interface AdminCreditAccountRow {
  user_id: string; gold_balance: number; silver_balance: number; frozen: number;
  available: number; publish_available: number; total_recharge: number; total_consume: number; updated_at: string;
}
export interface AdminCreditTxnRow {
  txn_id: string; user_id: string; type: string; coin: string; amount: number;
  balance_after: number; ref_type: string; ref_id: string; remark: string; created_at: string;
}

// ---- 内容与发稿 ----
export interface AdminMediaRow {
  media_key: string; name: string; type: string; categories: string[]; indexed_engines: string[];
  sell_price: number; list_price: number; ref_count: number; article_count: number;
  cost_per_citation: number | null; enabled: boolean;
}
export interface AdminPublishOrderRow {
  order_no: string; user_id: string; brand_id: string; article_title: string; media_name: string;
  status: string; published_url: string; fail_reason: string; sell_price: number;
  cite_count: number; published_at: string | null; created_at: string;
}
export interface AdminArticleRow {
  article_id: string; job_id: string; brand_id: string; title: string;
  word_count: number; status: string; publish_order_nos: string[]; created_at: string;
}
export interface AdminWritingJobRow {
  job_id: string; uid: string; brand_id: string; topic: string; status: string; current_node: string; created_at: string;
}

// ---- 报告 ----
export interface AdminReportRow {
  report_id: string; brand_id: string; brand_name: string; period_type: string;
  period_key: string; label: string; status: string; generated_at: string | null; created_at: string;
}

// ---- 首登 ----
export interface AdminOnboardingTaskRow {
  task_id: string; user_id: string; brand_id: string; brand_name: string;
  stage: string; error: string; crawler_started_at: string | null;
  keyword_gen_completed_at: string | null; created_at: string;
}
export interface AdminOnboardingTraceRow {
  kind: string; query: string; url: string; keyword: string; weight: number;
  snapshot: string; meta: unknown; created_at: string;
}

// ---- 行为 / 诊断 / Agent / 消息 / 系统 ----
export interface AdminBehaviorEventRow {
  user_id: string; brand_id: string; source: string; operation: string; ip: string; created_at: string;
}
export interface AdminDiagnosisRow {
  diagnosis_id: string; user_id: string; status: string; credit_cost: number;
  order_no: string; aliases: string[]; created_at: string;
}
export interface AdminAgentHistoryRow {
  session_id: string; uid: string; brand_id: string; kind: string; created_at: string;
}
export interface AdminReminderRow {
  user_id: string; brand_id: string; type: string; level: string;
  title: string; body: string; read: boolean; created_at: string;
}
export interface AdminSystem {
  schedules: { name: string; cron: string; desc: string; last_evidence: string }[];
  queue: { impl: string; backlog: number; topics: string[] };
  menus: { menu_code: string; category: string; label: string; path: string; icon: string; sort_order: number; visible: boolean; min_plan: string }[];
}
