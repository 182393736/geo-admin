/** 监控问题/排名/口碑/竞品/信源/快照（summary & query 域） */
import { get, post } from '../http';
import type {
  MonitorQuery, QueryGroupResp, QueryStatusResp, RateTrendResp, FullRankingMatrixResp,
  AiRankingMatrixResp, ReputationDataResp, GetReferencesResp, SourceStatsResp, SnapshotItem,
} from '../types';

const TREND_BODY = (start: string, end: string) => ({
  end: 'web', start_date: start, end_date: end,
  platforms: ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao'],
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
  competitorInsight: () => post('/competitor/insight', { start_date: null, end: 'all' }),
  sourceStats: (start: string, end: string, page = 1, page_size = 20) =>
    post<SourceStatsResp>('/reference_source/stats',
      { page, page_size, start_date: start, end_date: end, end: 'web', sort_field: 'ref_count', sort_order: 'desc' }),

  // --- 信源洞察 4 件套 ---
  siSourceTrend: (start: string, end: string) => post('/source_intelligence/source_trend', { start_date: start, end_date: end, platform: null, top_n: 10 }),
  siEnginePreference: (s: string, e: string, cs: string, ce: string) =>
    post('/source_intelligence/engine_preference', { start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce }),
  siOwnTrend: (s: string, e: string, cs: string, ce: string) =>
    post('/source_intelligence/own_trend', { start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce, platform: null }),
  siPerspective: (s: string, e: string, cs: string, ce: string) =>
    post('/source_intelligence/perspective', { start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce, platform: null, view: 'source' }),
  siTopics: () => get<{ query_id: number; name: string }[]>('/source_intelligence/topics'),

  // --- 快照 ---
  snapshotList: (date: string, query_id: number, page = 1) =>
    post<{ list: SnapshotItem[] }>('/snapshot/export/list', { page, page_size: 10, start_date: date, query_id }),
};
