/**
 * 管理总后台 API 模块（契约类型来自 @geo-admin/contracts/src/admin.ts）
 */
import { get, post } from './http';
import type {
  AdminMe, AdminOverview, AdminPaged, AdminUserRow, AdminUserDetail,
  AdminBrandRow, AdminBrandDetail, AdminCollectTaskRow, AdminSlotRow,
  AdminAnswerRow, AdminSnapshotRow, AdminParseOverview, AdminLlmLogRow, AdminLlmAgg,
  AdminPlanRow, AdminSubscriptionRow, AdminOrderRow, AdminCreditAccountRow, AdminCreditTxnRow,
  AdminMediaRow, AdminPublishOrderRow, AdminArticleRow, AdminWritingJobRow,
  AdminReportRow, AdminOnboardingTaskRow, AdminOnboardingTraceRow,
  AdminBehaviorEventRow, AdminDiagnosisRow, AdminAgentHistoryRow, AdminReminderRow, AdminSystem,
} from '@geo-admin/contracts';

export interface LoginRespLike { accessToken: string; user: { id: string; username: string }; brands: unknown[] }

const qs = (o: Record<string, any> = {}) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const adminApi = {
  // 鉴权（复用用户后台 /user/login）
  login: (account: string, password: string) => post<LoginRespLike>('/user/login', { account, password }, { raw: true }),
  me: () => get<AdminMe>('/admin/me'),

  // 驾驶舱
  overview: () => get<AdminOverview>('/admin/overview'),

  // 用户 / 品牌
  users: (p: Record<string, any> = {}) => get<AdminPaged<AdminUserRow>>(`/admin/users${qs(p)}`),
  userDetail: (id: string) => get<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`),
  brands: (p: Record<string, any> = {}) => get<AdminPaged<AdminBrandRow>>(`/admin/brands${qs(p)}`),
  brandDetail: (id: string) => get<AdminBrandDetail>(`/admin/brands/${encodeURIComponent(id)}`),

  // 采集
  collectTasks: (p: Record<string, any> = {}) => get<AdminPaged<AdminCollectTaskRow>>(`/admin/collect/tasks${qs(p)}`),
  collectSlots: (taskId: string) => get<{ task: AdminCollectTaskRow; summary: Record<string, number>; list: AdminSlotRow[] }>(`/admin/collect/tasks/${encodeURIComponent(taskId)}/slots`),
  collectAnswers: (p: Record<string, any> = {}) => get<AdminPaged<AdminAnswerRow>>(`/admin/collect/answers${qs(p)}`),
  collectSnapshots: (p: Record<string, any> = {}) => get<AdminPaged<AdminSnapshotRow>>(`/admin/collect/snapshots${qs(p)}`),

  // 解析
  parseOverview: () => get<AdminParseOverview>('/admin/parse/overview'),

  // LLM
  llmLogs: (p: Record<string, any> = {}) => get<AdminPaged<AdminLlmLogRow> & { agg: AdminLlmAgg[] }>(`/admin/llm/logs${qs(p)}`),

  // 计费
  plans: () => get<{ list: AdminPlanRow[] }>('/admin/billing/plans'),
  subscriptions: (p: Record<string, any> = {}) => get<AdminPaged<AdminSubscriptionRow>>(`/admin/billing/subscriptions${qs(p)}`),
  orders: (p: Record<string, any> = {}) => get<AdminPaged<AdminOrderRow>>(`/admin/billing/orders${qs(p)}`),
  credit: (p: Record<string, any> = {}) => get<AdminPaged<AdminCreditAccountRow> & { totals: Record<string, number> | null }>(`/admin/billing/credit${qs(p)}`),
  creditTxns: (p: Record<string, any> = {}) => get<AdminPaged<AdminCreditTxnRow>>(`/admin/billing/credit-transactions${qs(p)}`),

  // 内容与发稿
  media: (p: Record<string, any> = {}) => get<AdminPaged<AdminMediaRow> & { totals: Record<string, number> | null }>(`/admin/content/media${qs(p)}`),
  publishOrders: (p: Record<string, any> = {}) => get<AdminPaged<AdminPublishOrderRow>>(`/admin/content/publish-orders${qs(p)}`),
  articles: (p: Record<string, any> = {}) => get<AdminPaged<AdminArticleRow>>(`/admin/content/articles${qs(p)}`),
  writingJobs: (p: Record<string, any> = {}) => get<AdminPaged<AdminWritingJobRow>>(`/admin/content/writing-jobs${qs(p)}`),

  // 报告
  reports: (p: Record<string, any> = {}) => get<AdminPaged<AdminReportRow>>(`/admin/reports${qs(p)}`),

  // 首登
  onboardingTasks: (p: Record<string, any> = {}) => get<AdminPaged<AdminOnboardingTaskRow> & { funnel: { stage: string; n: number }[] }>(`/admin/onboarding/tasks${qs(p)}`),
  onboardingTraces: (taskId: string) => get<{ list: AdminOnboardingTraceRow[]; total: number }>(`/admin/onboarding/traces${qs({ task_id: taskId })}`),

  // 行为 / 诊断 / Agent / 消息 / 系统
  behavior: (p: Record<string, any> = {}) => get<AdminPaged<AdminBehaviorEventRow> & { top_pages: { source: string; n: number }[] }>(`/admin/behavior/events${qs(p)}`),
  diagnosis: (p: Record<string, any> = {}) => get<AdminPaged<AdminDiagnosisRow>>(`/admin/diagnosis${qs(p)}`),
  agentHistories: (p: Record<string, any> = {}) => get<AdminPaged<AdminAgentHistoryRow>>(`/admin/agent/histories${qs(p)}`),
  reminders: (p: Record<string, any> = {}) => get<AdminPaged<AdminReminderRow>>(`/admin/reminders${qs(p)}`),
  system: () => get<AdminSystem>('/admin/system'),
};
