/**
 * 接口契约类型（对齐线上实测响应，逐字段）
 * ------------------------------------------------------------------
 * 原为 apps/gen-user-dash/src/api/types.ts（已改为对本包的重导出）。
 * 端点清单见 apps/gen-api/app/router.js；样本见 docs/透镜GEO-接口分析报告.md。
 */
import type { EngineKey, OnboardingStage, QueryType } from './enums';

// ---- 鉴权/账号 ----
export interface LoginResp {
  accessToken: string;            // JWT HS256，7 天
  user: { id: string; username: string };
  brands: BrandBrief[];
  activeOrg: null | string;
}
export interface BrandBrief {
  brand_id: string; name: string; industry: string;
  vip_level: 'starter' | 'pro'; vip_plan_code: string;
  vip_expire_date: string; status: 'active' | 'expired' | 'building';
  platforms: EngineKey[]; aliases: string[]; is_first_brand: boolean;
  rename_remaining: number; created_at: string;
}

export interface UserInfo {
  user_id: string; brand_id: string; phone: string; brand: string; company: string;
  industary: string; aliases: string[]; vip_level: string; vip_expire_date: string;
  query_limit: number; daily_exec_count: number; first_login: number;
  crawler_started_at: string | null; keyword_gen_started_at: string | null; // onboarding 进度
}

export interface MenuItem {
  menu_code: string; category: string; label: string; path: string;
  icon: string; sort_order: number; visible: boolean;
}

// ---- 首次品牌分析（onboarding） ----
export interface AnalyzeBrandReq {
  brand_name?: string;      // 品牌名称
  website?: string;         // 官网 / 介绍链接
  business_desc?: string;   // 品牌补充介绍
}
export interface AnalyzeBrandResp { task_id: string; brand_id: string; reused?: boolean }
export interface OnboardingStatus {
  task_id: string; brand_id: string;
  stage: OnboardingStage;   // crawl→keyword→query→done / fail
  done: boolean; error: string | null;
  crawler_started_at: string | null; crawler_completed_at: string | null;
  keyword_gen_started_at: string | null; keyword_gen_completed_at: string | null;
  generated: { aliases: number; industry_queries: number; brand_queries: number };
  brand: { brand_id: string; name: string; industry: string; status: string } | null;
}

// ---- 品牌档案聚合（GET /api/brand/summary：建档结果页 / 概览页品牌卡） ----
export interface BrandSummary {
  brand: {
    brand_id: string; name: string; industry: string; website: string;
    business_desc: string; status: string; is_first_brand: boolean; platforms: string[];
    rename_remaining: number;
  };
  profile: { description: string; slogan: string; tone: unknown; scripts: string[] } | null;
  aliases: { alias: string; source: string; enabled: boolean }[];
  products: { name: string; category: string; specs: unknown; price_range: string }[];
  competitors: { name: string; compet_point: string; source: string }[];
  queries: {
    industry: MonitorQuery[];
    brand: MonitorQuery[];
  };
}

// ---- 采集状态（GET /user/get_query_status：概览页采集状态卡） ----
export interface QueryStatus {
  list: Record<string, { expected?: number; actual?: number; failed?: number }>;
  last_date: string;
  pending: boolean;         // true = 等待首次采集
  enabled_queries: number;  // 启用中的监控问题数
  expected_slots: number;   // 预计采集槽位 = 问题 × 引擎数
}

// ---- 监控问题 ----
export interface MonitorQuery {
  id: number;                     // 数字自增（实测 37935/40150）
  query: string;                  // platform_query 实际发问形态
  user_id: string; brand_id: string;
  question_list: { user_friendly: string; platform_query: string }[];
  query_type: QueryType; is_golden: boolean; weight: number;
  golden_query_ranking: Record<string, any> | null;
  query_status: boolean; query_is_execute: boolean; query_order: number;
  query_description?: string;     // AI 生成的热度·场景标签
  platform_prompt?: string;       // 平台差异化改写（默认同 query）
  task_id?: string | null; group_id?: string; effective_to: string | null;
  created_at: string; updated_at: string;
}
export interface QueryGroupResp { groups: any[]; ungrouped_count: number; total: number; query_map: Record<string, any> }
export interface QueryStatusResp extends QueryStatus { }

// ---- 排名/口碑指标（分母=槽位） ----
export interface RateBucket { denominator: number; numerator: number; rate: number }
export interface TrendDay extends RateBucket { date_day: string; platforms: Record<string, RateBucket> }
export interface RateTrendResp { start_date: string; end_date: string; summary: Record<string, RateBucket>; trend: TrendDay[] }

export interface RankingMatrixRow {
  query: string;
  rank_value: Record<string, string>;   // '4' | '未提及'
  competitor: string;                   // 该题榜一竞品名
  mention_rate: number; first_mention_rate: number; top3_mention_rate: number;
}
export interface FullRankingMatrixResp {
  platforms: EngineKey[];
  list: Record<string, RankingMatrixRow>;
  group_rows: any[]; valid_data_date_list: string[];
}

export interface AiRankingScore { value: number; trend: 'up' | 'down' | 'flat' }
export interface AiRankingMatrixResp {
  list: Record<string, {
    today_score: Record<string, number>;       // 含 all
    yesterday_score: Record<string, number>;
    change: Record<string, AiRankingScore>;
  }>;
  group_rows: any[];
}

// ---- 口碑 ----
export interface ReputationAnalysis {
  ratio: { positive: number; neutral: number; negative: number };
  positive: Record<string, { platforms: Record<string, string[]>; variants_count: number }>;
  neutral: Record<string, any>; negative: Record<string, any>;
}
export interface ReputationDataResp {
  query_dict: Record<string, string>;
  query_id: number;
  result: { id: number; query_id: number; date_day: string; platform: string; reputation_analysis: ReputationAnalysis }[];
  score_result: { date_day: string; score: string; platform: string; query_id: number }[];
  valid_data_date_list: string[];
  user_data_status: boolean;
}

// ---- 竞品洞察 ----
export interface CompanyRankItem {
  name: string; is_target: boolean; current_rank: number; current_score: number;
  previous_rank: number | null; previous_score: number | null; rank_change: number;
  trend: 'new' | 'up' | 'down' | 'same' | 'stable';
}
export interface GetReferencesResp {
  query_dict: Record<string, string>;
  company_ranking_data: CompanyRankItem[];
  visibility_trend: { all: { date_day: string; rank_value: string; score: string }[] };
  valid_data_date_list: string[];
  user_data_status: boolean;
}
/** 平台×指标统计块（对标 platform_stats 的键值形状：{ 豆包/文心一言/DeepSeek/通义千问/元宝/综合 }） */
export interface PlatformStatBucket {
  mention_rate: number; top3_mention_rate: number; first_mention_rate: number;
  denominator: number; mention_numerator: number; top3_numerator: number; first_numerator: number;
}
export interface CompetitorCompareRow {
  name: string; is_target: boolean;
  frequency: number; top3_frequency: number; first_frequency: number; keyword_count: number;
  mention_rate: number; top3_mention_rate: number; first_mention_rate: number;
  platform_stats: Record<string, PlatformStatBucket>;
}
export interface KeywordDetail {
  query_id: number; keyword: string; query_type: QueryType; target_rank: number | null;
  platform_ranks: Record<string, string>;
  rankings: { name: string; rank: number; score: number; is_target: boolean }[];
}
export interface CompetitorInsightResp {
  brand: string; date: string; start_date: string; end_date: string;
  keyword_count: number; competitor_count: number;
  target_mention_summary: {
    mention_rate: number; top3_mention_rate: number; first_mention_rate: number;
    denominator: number; mention_numerator: number; top3_numerator: number; first_numerator: number;
    platform_stats: Record<string, PlatformStatBucket>;
  };
  valid_data_date_list: string[];
  keyword_details: KeywordDetail[];
  competitor_compare_list: CompetitorCompareRow[];
}
export interface CompetitorRow extends CompetitorCompareRow {}

// ---- 信源 ----
export interface SourceStatItem {
  canonical_source: string; category: string | null; domain: string | null;
  auth_info_des: string | null; auth_info_level: string | null;   // 对标「媒体权威度」字段
  ref_count: number; article_count: number; query_count: number; own_article_count: number;
  first_cited_at: string | null; platforms: Record<string, { ref_count: number; article_count: number }>;
  media_key: string | null; sell_price: number | null; list_price: number | null; cost_per_citation: number | null;
}
export interface SourceStatsResp {
  list: SourceStatItem[];
  summary: { total_ref_count: number; total_article_count: number; total_sources: number; own_source_count: number; top5_share: number; platform_breakdown: Record<string, number> };
  page: number; page_size: number; total: number;
}

// ---- 信源洞察（对标 geoapi.timus.cn /source_intelligence 4 件套） ----
export interface SourceTrendResp {
  dates: string[];
  sources: { name: string; total: number; series: number[] }[];
}
export interface EnginePrefSource {
  canonical_source: string; category: string | null;
  engines: Record<string, { cur: number; cmp: number; chg: number }>;
  cur_total: number; cmp_total: number; chg_total: number;
}
export interface EnginePreferenceResp { sources: EnginePrefSource[] }
export interface OwnTrendResp {
  trend: { date: string; own_count: number; total_count: number; rate: number }[];
  summary: { cited: number; cited_chg: number; rate_now: number; rate_chg: number; own_articles: number; own_articles_chg: number };
}
export interface PerspectiveSource {
  name: string; category: string | null;
  cur_total: number; cmp_total: number; change: number; change_pct: number;
  status: string; tag: string;
  engines: Record<string, { cur: number; cmp: number }>;
  own_rate: number;
}
export interface PerspectiveResp { list: PerspectiveSource[]; total: number; page: number; page_size: number }

// ---- 报告 ----
export interface ReportTemplate { id: number; name: string; modules: { key: string; sort: number; enabled: boolean }[] }
export interface OverviewStats {
  monitored_queries: number; collected_queries: number; reference_sources: number; published_articles: number;
  industry: string; website: string | null; alias_count: number; competitor_count: number;
  stat_date: string; updated_at: string; collection_status: 'normal' | 'no_data';
  expected_slots: number; actual_slots: number; completeness_rate: number; source: string;
}
export interface ReportLatestResp {
  period_key: string; label: string; range: string; status: 'ready' | 'generating';
  generated_at: string; template: ReportTemplate;
  payload: Record<string, any> | null;      // 首份未生成时为 null！
  overview_stats: OverviewStats;
}
export interface ReportCycleResp {
  weekly_generate_dow: number; monthly_generate_dom: number;
  weekly_enabled: boolean; monthly_enabled: boolean; cycle_locked: boolean;
}

// ---- 套餐/钱包 ----
export interface CreditAccount {
  balance: number; frozen: number; available: number;
  gold_balance: number; silver_balance: number;
  gold_available: number; silver_available: number;   // 对标字段
  publish_available: number;
  total_recharge: number; total_consume: number; total_expired: number;
}
export interface Subscription {
  vip_level: string; plan_code: string; plan_name: string;
  start_date: string; expire_date: string; remaining_days: number;
  query_limit: number; query_count: number; query_remaining: number;
  platform_list: EngineKey[];
}

// ---- 发稿 ----
export interface MediaChannelItem {
  media_key: string; name: string; type: string; favicon?: string;
  site_url?: string; categories?: string[]; indexed_engines?: string[];
  list_price: number; sell_price: number; discount_rate: number;
  ref_count: number; article_count: number; query_count?: number;
  cost_per_citation: number | null; stats_window_days?: number;
}
export interface MediaListResp {
  list: MediaChannelItem[]; total: number; page: number;
  display_mode: string; stats_window_days: number; discount_rate: number; fav_total: number;
}
export interface PublishOrder {
  order_no: string; article_title: string; media_name: string;
  status: 'pending' | 'submitted' | 'ok' | 'fail';
  published_url: string | null; fail_reason: string | null;
  list_price: number; sell_price: number; cite_count: number;
  published_at: string | null; created_at: string;
}

// ---- 品牌·内容域（geoarticle 无壳 raw，带 /api 前缀） ----
export interface BrandIntroResp {
  industry: string[]; website: string; slogan: string; tone: Record<string, any>;
  description: string; scripts: string;
}
export interface BrandAliasesResp { aliases: string[] }
export interface BrandCompetitorItem { name: string }
export interface BrandProductItem { name: string; 来源: string }
export interface BrandWikiTreeResp {
  brand_present: boolean; company_present: boolean; brand_md: string; company_md: string;
  competitor: { path: string; markdown: string }[];
  competitors: { path: string; markdown: string }[];
}
export interface ArticlesResp {
  uid: string; brand_id: string | null; total: number;
  counters: { starting: number; running: number; awaiting_user: number; completed: number; failed: number; cancelled: number; all: number };
  pagination: { page: number; page_size: number; total: number };
  list: Record<string, any>[];
}

// ---- 稿件 / 诊断（geoapi 壳） ----
export interface ArticleDraftItem {
  article_id: string; job_id: string | null; title: string; word_count: number; status: string;
  quality_report: Record<string, any> | null; style_references: string[];
  publish_order_nos: string[]; created_at: string; updated_at: string;
}
export interface ArticleLibraryItem {
  id: string; title: string; url: string | null; canonical_url: string | null; source_id: string | null;
  publish_date: string | null; first_cited_at: string | null; last_cited_at: string | null; is_brand_published: boolean;
}
export interface DiagnosisTaskItem {
  diagnosis_id: string; status: string; target_brand_input: Record<string, any> | null;
  aliases: string[]; ends: string[]; credit_cost: number | null; order_no: string | null;
  result: Record<string, any> | null; share_token: string | null; created_at: string; updated_at: string;
}

// ---- 快照 ----
export interface SnapshotItem { id: number; platform: string; photo_url: string; exec_date: string; query_id: number }