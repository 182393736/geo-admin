/**
 * 全平台共享常量（单一事实源）
 * 来源：apps/gen-api/config/config.default.js、app.js SEED_PLANS、model/*.js 注释。
 */
import type { EngineKey, PlanType, PlanBillingCycle } from './enums';

/** 监控引擎（4 家，品牌默认订阅平台列表；与 ENGINE_KEYS 同义，保留别名便于语义表达；千问 qwen 暂移除，见 enums.ts TODO(qwen)） */
export const PLATFORMS: readonly EngineKey[] = ['doubao', 'deepseek', 'wenxin', 'yuanbao'];

/** 免费版候选监控问题确认上限（agent 交互约束，GEO_FREE_QUERY_LIMIT 默认 3） */
export const FREE_QUERY_LIMIT = 3;

/** 免费套餐的问题额度（payment.js：free 订阅 query_limit=8，除非套餐另有说明） */
export const FREE_PLAN_QUERY_LIMIT = 8;

/** 免费版默认开启的前 3 个平台（payment.js 免费订阅只给前 3 家） */
export const FREE_PLATFORM_COUNT = 3;

/** 实测逆向的位次权重（第 1~10 名），可配置校准 */
export const RANK_WEIGHTS = [40, 20, 20, 16, 16, 13.33, 10, 10, 8, 8] as const;

/** 排名三态锚点（monitor_query.golden_query_ranking 的 rank 取值） */
export const RANK_ANCHORS = {
  /** 未检测 */
  NOT_DETECTED: -99,
  /** 检测到但未提及 */
  MENTIONED_NOT_RANKED: -2,
  /** 综合权重位（all） */
  ALL: -1,
} as const;

/** 口碑评级阈值（daily_metric_brands.rep_score） */
export const REP_SCORE_THRESHOLDS = {
  /** ≥80 健康 */
  HEALTHY: 80,
  /** ≥60 中风险；否则高风险 */
  RISKY: 60,
} as const;

/** 报告模板固定模块 key（report_templates.modules） */
export const REPORT_MODULE_KEYS = ['monitor', 'metrics', 'compete', 'sources', 'channels', 'publish'] as const;

/** 套餐目录（对齐 app.js SEED_PLANS；管理后台价目配置以这里为准） */
export interface PlanSeed {
  plan_id: number;
  plan_code: string;
  plan_name: string;
  plan_type: PlanType;
  billing_cycle: PlanBillingCycle;
  duration_days: number;
  price: number;
  original_price: number;
  query_limit: number;
  sort: number;
}

export const PLAN_CATALOG: readonly PlanSeed[] = [
  { plan_id: 1, plan_code: 'free', plan_name: '免费体验版', plan_type: 'free', billing_cycle: 'permanent', duration_days: 0, price: 0, original_price: 0, query_limit: 8, sort: 1 },
  { plan_id: 10, plan_code: 'starter_monthly', plan_name: '入门版-月付', plan_type: 'starter', billing_cycle: 'monthly', duration_days: 30, price: 79, original_price: 99, query_limit: 8, sort: 10 },
  { plan_id: 11, plan_code: 'starter_yearly', plan_name: '入门版-年付', plan_type: 'starter', billing_cycle: 'yearly', duration_days: 365, price: 790, original_price: 948, query_limit: 8, sort: 11 },
  { plan_id: 20, plan_code: 'pro_monthly', plan_name: '专业版-月付', plan_type: 'pro', billing_cycle: 'monthly', duration_days: 30, price: 199, original_price: 259, query_limit: 30, sort: 20 },
  { plan_id: 21, plan_code: 'pro_yearly', plan_name: '专业版-年付', plan_type: 'pro', billing_cycle: 'yearly', duration_days: 365, price: 1990, original_price: 2388, query_limit: 30, sort: 21 },
  { plan_id: 30, plan_code: 'custom', plan_name: '定制版', plan_type: 'custom', billing_cycle: 'yearly', duration_days: 365, price: 0, original_price: 0, query_limit: 100, sort: 30 },
] as const;
