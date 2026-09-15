/** 监控问题/排名/口碑/竞品/信源/快照（summary & query 域） */
import { get, post } from '../http';
import type {
  MonitorQuery, QueryGroupResp, QueryStatusResp, RateTrendResp, FullRankingMatrixResp,
  AiRankingMatrixResp, ReputationDataResp, GetReferencesResp, SourceStatsResp, SnapshotItem,
  SnapshotAnswerResp, CompetitorInsightResp, SourceTrendResp, EnginePreferenceResp, OwnTrendResp, PerspectiveResp,
} from '../types';

// 对标 geoapi.timus.cn：5 家引擎（含 qwen，顺序 = 对标）
const TREND_BODY = (start: string, end: string) => ({
  end: 'web', start_date: start, end_date: end,
  platforms: ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'],
});

export const monitorApi = {
  // --- 监控问题 ---
  queryList: (query_type: 'industry' | 'brand') => get<{ list: MonitorQuery[] }>(`/query/list?query_type=${query_type}`),
  queryStatus: () => get<QueryStatusResp>('/user/get_query_status'),
  queryGroupList: (query_type: string) => post<QueryGroupResp>('/query-group/list', { query_type }),

  // --- 排名透视 ---
  fullRankingMatrix: (query_ids: number[], date: string, group_id?: number | null) =>
    post<FullRankingMatrixResp>('/summary/full_ranking_matrix', { query_id: query_ids, start_date: date, end: 'web', group_id: group_id ?? null }),
  mentionRateTrend: (start: string, end: string) => post<RateTrendResp>('/summary/mention_rate_trend', TREND_BODY(start, end)),
  top3RateTrend: (start: string, end: string) => post<RateTrendResp>('/summary/top3_rate_trend', TREND_BODY(start, end)),
  firstRateTrend: (start: string, end: string) => post<RateTrendResp>('/summary/first_position_rate_trend', TREND_BODY(start, end)),

  // --- 口碑 ---
  aiRankingMatrix: (query_ids: number[], date: string) =>
    post<AiRankingMatrixResp>('/summary/ai_ranking_matrix', { query_id: query_ids, end: 'web', start_date: date }),
  reputationData: (query_id: number, start: string, end: string) =>
    post<ReputationDataResp>('/summary/reputation_data', { query_id, start_date: start, end_date: end, platform: 'all' }),

  // --- 竞品/引用 ---
  getReferences: () => post<GetReferencesResp>('/summary/get_references', { platform: 'all', platforms: ['all'] }),
  competitorInsight: () => post<CompetitorInsightResp>('/competitor/insight', { start_date: null, end: 'all' }),
  sourceStats: (start: string, end: string, page = 1, page_size = 20, category: 'industry' | 'brand' = 'industry') =>
    post<SourceStatsResp>('/reference_source/stats',
      { page, page_size, start_date: start, end_date: end, end: 'web', sort_field: 'ref_count', sort_order: 'desc', category }),

  // --- 信源洞察 4 件套 ---
  siSourceTrend: (start: string, end: string) => post<SourceTrendResp>('/source_intelligence/source_trend', { start_date: start, end_date: end, platform: null, top_n: 10 }),
  siEnginePreference: (s: string, e: string, cs: string, ce: string) =>
    post<EnginePreferenceResp>('/source_intelligence/engine_preference', { start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce }),
  siOwnTrend: (s: string, e: string, cs: string, ce: string) =>
    post<OwnTrendResp>('/source_intelligence/own_trend', { start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce, platform: null }),
  siPerspective: (s: string, e: string, cs: string, ce: string) =>
    post<PerspectiveResp>('/source_intelligence/perspective', { start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce, platform: null, view: 'source' }),
  siTopics: () => get<{ query_id: number; name: string }[]>('/source_intelligence/topics'),

  // --- 快照 ---
  snapshotList: (
    date: string,
    query_id: number,
    page = 1,
    query_type: 'industry' | 'brand' = 'industry',
    platform = 'all',
    page_size = 50,
  ) =>
    post<{ list: SnapshotItem[]; total: number; page: number; page_size: number }>(
      '/snapshot/export/list',
      { page, page_size, start_date: date, query_id, query_type, platform },
    ),
  snapshotAnswer: (snapshot_id: string) =>
    post<SnapshotAnswerResp>('/snapshot/export/answer', { snapshot_id }),
  /** 下载回答 CSV（绕过 JSON 解包） */
  snapshotExportTextBlob: async (payload: {
    start_date: string;
    query_id: number;
    query_type: 'industry' | 'brand';
    platform?: string;
  }) => {
    const { useAuthStore } = await import('@/stores/auth');
    const { API_BASE } = await import('../http');
    const auth = useAuthStore();
    const body = { ...payload, brand_id: auth.activeBrandId };
    const resp = await fetch(`${API_BASE}/snapshot/export/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`导出失败 HTTP ${resp.status}`);
    return resp.blob();
  },
};
