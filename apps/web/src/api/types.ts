/** 逆向实测契约类型（样本见 docs/透镜GEO-接口分析报告.md） */

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
export type EngineKey = 'doubao' | 'deepseek' | 'wenxin' | 'qwen' | 'yuanbao';

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

// ---- 监控问题 ----
export type QueryType = 'industry' | 'brand';
export interface MonitorQuery {
  id: number;                     // 数字自增（实测 37935/40150）
  query: string;                  // platform_query 实际发问形态
  question_list: { user_friendly: string; platform_query: string }[];
  query_type: QueryType; is_golden: boolean; weight: number;
  query_status: boolean; query_is_execute: boolean; query_order: number;
  task_id: string; group_id?: string; effective_to: string | null;
  created_at: string; updated_at: string;
}
export interface QueryGroupResp { groups: any[]; ungrouped_count: number; total: number; query_map: Record<string, any> }
export interface QueryStatusResp { list: Record<string, any>; last_date: string }

// ---- 排名/口碑指标（分母=槽位）----
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
  previous_rank: number | null; previous_score: number | null; rank_change: number; trend: 'new' | 'up' | 'down' | 'stable';
}
export interface GetReferencesResp {
  query_dict: Record<string, string>;
  company_ranking_data: CompanyRankItem[];
  visibility_trend: { all: { date_day: string; rank_value: string; score: string }[] };
}
export interface CompetitorRow {
  name: string; is_target: boolean; frequency: number; top3_frequency: number; first_frequency: number;
  keyword_count: number; mention_rate: number; top3_mention_rate: number; first_mention_rate: number;
  platform_stats: Record<string, RateBucket & { top3_mention_rate: number; first_mention_rate: number; top3_numerator: number; first_numerator: number }>;
}

// ---- 信源 ----
export interface SourceStatItem {
  canonical_source: string; category: string; domain: string | null;
  ref_count: number; article_count: number; query_count: number; own_article_count: number;
  first_cited_at: string; platforms: Record<string, { ref_count: number; article_count: number }>;
  media_key: string | null; sell_price: number | null; list_price: number | null; cost_per_citation: number | null;
}
export interface SourceStatsResp {
  list: SourceStatItem[];
  summary: { total_ref_count: number; total_article_count: number; total_sources: number; own_source_count: number; top5_share: number; platform_breakdown: Record<string, number> };
  page: number; page_size: number; total: number;
}

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

// ---- 套餐/钱包 ----
export interface CreditAccount {
  balance: number; frozen: number; available: number;
  gold_balance: number; silver_balance: number; publish_available: number;
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
  list_price: number; sell_price: number; discount_rate: number;
  ref_count: number; article_count: number; cost_per_citation: number | null;
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

// ---- 快照 ----
export interface SnapshotItem { id: number; platform: string; photo_url: string; exec_date: string; query_id: number }
