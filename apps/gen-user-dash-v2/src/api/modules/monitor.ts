/** 监控问题/排名/口碑/竞品/信源/快照（summary & query 域） */
import { get, post, put } from '../http';
import type {
  MonitorQuery, QueryGroupResp, QueryStatusResp, RateTrendResp, FullRankingMatrixResp,
  AiRankingMatrixResp, ReputationDataResp, GetReferencesResp, SourceStatsResp, SnapshotItem,
  SnapshotAnswerResp, CompetitorInsightResp, SourceTrendResp, EnginePreferenceResp, OwnTrendResp, PerspectiveResp,
} from '../types';

export type SourceArticleItem = {
  article_id: string;
  title: string;
  url: string | null;
  canonical_url: string | null;
  ref_count: number;
  is_own: boolean;
  platforms: Record<string, { ref_count: number }>;
  auth_info_des?: string | null;
  auth_info_level?: string | number | null;
};

export type SourceMediaAccount = {
  media_key: string;
  name: string;
  category?: string;
  taxonomy?: string;
  area?: string;
  sell_price: number | null;
  list_price: number | null;
  platform?: string;
  note?: string;
  case_url?: string;
  ai_cite_count?: number;
};

export type SourceAnalyzeResp = {
  summary: { total_ref_count: number; total_sources: number; recommended_count: number };
  recommendations: any[];
  source: {
    canonical_source: string;
    basic_info: {
      media_type: string;
      region: string;
      available_media_count: number;
      source_origin: string;
      category: string | null;
      domain: string | null;
    };
    description: string;
    publish_stats: {
      expected_publish_time: string | null;
      inclusion_rate: number | null;
      average_success_rate: number | null;
      inclusion_type: string | null;
    };
    citation_performance: {
      citation_index: number;
      total_ref_count: number;
      article_count: number;
      query_count: number;
      engine_count: number;
      index_factors: { engine_coverage: number; query_coverage: number };
      engine_breakdown: { platform: string; display_name: string; ref_count: number }[];
      query_breakdown: { query_id: number; question: string; ref_count: number }[];
    };
    media_accounts: SourceMediaAccount[];
  };
};

// 对标 geoapi.timus.cn：5 家引擎（含 qwen，顺序 = 对标）
const ALL_PLATFORMS = ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'];
const TREND_BODY = (
  start: string,
  end: string,
  opts?: { platforms?: string[]; query_ids?: number[] },
) => ({
  end: 'web',
  start_date: start,
  end_date: end,
  platforms: opts?.platforms?.length ? opts.platforms : ALL_PLATFORMS,
  query_id: opts?.query_ids?.length ? opts.query_ids : undefined,
});

export const monitorApi = {
  // --- 监控问题 ---
  queryList: (query_type: 'industry' | 'brand' | 'all' = 'all') =>
    get<{ list: MonitorQuery[]; pending_release?: number; total?: number }>(
      `/query/list?query_type=${query_type}`,
    ),
  queryAdd: (payload: {
    queries: string[];
    query_type?: 'industry' | 'brand';
    group_id?: string | null;
  }) => post<{ created: { id: number; query: string }[]; count: number; remain: number }>('/query/add', payload),
  queryUpdate: (payload: {
    query_id: number;
    query?: string;
    query_status?: boolean;
    query_type?: 'industry' | 'brand';
    group_id?: string | null;
  }) => post('/query/update', payload),
  queryDelete: (query_id: number | number[]) =>
    post('/query/delete', Array.isArray(query_id) ? { query_ids: query_id } : { query_id }),
  querySort: (orders: { query_id: number; query_order: number }[]) =>
    post('/query/sort', { orders }),
  queryStatus: () => get<QueryStatusResp>('/user/get_query_status'),
  queryGroupList: (query_type: string = 'all') =>
    post<QueryGroupResp>('/query-group/list', { query_type }),
  queryGroupSave: (payload: { name: string; group_id?: string; query_type?: 'industry' | 'brand' }) =>
    post<{ group_id: string; name: string }>('/query-group/save', payload),
  queryGroupMove: (query_id: number, group_id: string | null) =>
    post('/query-group/move_query', { query_id, group_id }),
  queryGroupDelete: (group_id: string) =>
    post('/query-group/delete', { group_id }),

  // --- 排名透视 ---
  fullRankingMatrix: (query_ids: number[], date: string, group_id?: number | null) =>
    post<FullRankingMatrixResp>('/summary/full_ranking_matrix', { query_id: query_ids, start_date: date, end: 'web', group_id: group_id ?? null }),
  mentionRateTrend: (start: string, end: string, opts?: { platforms?: string[]; query_ids?: number[] }) =>
    post<RateTrendResp>('/summary/mention_rate_trend', TREND_BODY(start, end, opts)),
  top3RateTrend: (start: string, end: string, opts?: { platforms?: string[]; query_ids?: number[] }) =>
    post<RateTrendResp>('/summary/top3_rate_trend', TREND_BODY(start, end, opts)),
  firstRateTrend: (start: string, end: string, opts?: { platforms?: string[]; query_ids?: number[] }) =>
    post<RateTrendResp>('/summary/first_position_rate_trend', TREND_BODY(start, end, opts)),

  // --- 口碑 ---
  aiRankingMatrix: (query_ids: number[], date: string) =>
    post<AiRankingMatrixResp>('/summary/ai_ranking_matrix', { query_id: query_ids, end: 'web', start_date: date }),
  reputationData: (query_id: number, start: string, end: string, platform = 'all') =>
    post<ReputationDataResp>('/summary/reputation_data', {
      query_id, start_date: start, end_date: end, platform,
    }),

  // --- 竞品/引用 ---
  getReferences: (query_id?: number) =>
    post<GetReferencesResp>('/summary/get_references', {
      platform: 'all',
      platforms: ['all'],
      ...(query_id != null && query_id > 0 ? { query_id } : {}),
    }),
  competitorInsight: (start?: string | null, end?: string | null) =>
    post<CompetitorInsightResp>('/competitor/insight', {
      start_date: start || null,
      end_date: end || null,
      end: 'web',
    }),

  /** 修正品牌名：AI 识别名列表 */
  nameCorrections: (date?: string) =>
    get<{ brand: string; items: { source_name: string; assignment_type: string; target_name: string | null }[] }>(
      `/competitor/name-corrections${date ? `?date=${encodeURIComponent(date)}` : ''}`,
    ),

  saveNameCorrections: (
    corrections: { source_name: string; assignment_type: string; target_name: string | null }[],
    date?: string,
  ) =>
    put<{ aliases: string[]; updated: number }>('/competitor/name-corrections', {
      corrections,
      date: date || null,
    }),

  /** 导出竞品 Excel（对标 POST /export/competitor_xlsx） */
  exportCompetitorXlsxBlob: async (start_date?: string | null) => {
    const { useAuthStore } = await import('@/stores/auth');
    const { API_BASE } = await import('../http');
    const auth = useAuthStore();
    const resp = await fetch(`${API_BASE}/export/competitor_xlsx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: JSON.stringify({ brand_id: auth.activeBrandId, start_date: start_date || null }),
    });
    if (!resp.ok) throw new Error(`导出失败: ${resp.status}`);
    const cd = resp.headers.get('Content-Disposition') || '';
    const m = cd.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
    const filename = m
      ? decodeURIComponent(m[1].replace(/"/g, '').trim())
      : `竞品数据_${start_date || new Date().toISOString().slice(0, 10)}.csv`;
    return { blob: await resp.blob(), filename };
  },
  sourceStats: (
    start: string,
    end: string,
    page = 1,
    page_size = 20,
    category: 'industry' | 'brand' = 'industry',
    opts?: { query_id?: number; platforms?: string[]; platform?: string },
  ) =>
    post<SourceStatsResp>('/reference_source/stats', {
      page,
      page_size,
      start_date: start,
      end_date: end,
      end: 'web',
      sort_field: 'ref_count',
      sort_order: 'desc',
      category,
      ...(opts?.query_id && opts.query_id > 0 ? { query_id: opts.query_id } : {}),
      ...(opts?.platforms?.length ? { platforms: opts.platforms } : {}),
      ...(opts?.platform && opts.platform !== 'all' ? { platform: opts.platform } : {}),
    }),

  sourceArticles: (payload: {
    start: string;
    end: string;
    canonical_source: string;
    category?: 'industry' | 'brand';
    page?: number;
    page_size?: number;
    query_id?: number;
    platforms?: string[];
  }) =>
    post<{ list: SourceArticleItem[]; total: number; page: number; page_size: number }>(
      '/reference_source/articles',
      {
        start_date: payload.start,
        end_date: payload.end,
        end: 'web',
        canonical_source: payload.canonical_source,
        category: payload.category || 'industry',
        page: payload.page || 1,
        page_size: payload.page_size || 50,
        ...(payload.query_id && payload.query_id > 0 ? { query_id: payload.query_id } : {}),
        ...(payload.platforms?.length ? { platforms: payload.platforms } : {}),
      },
    ),

  sourceAnalyze: (payload: {
    start: string;
    end: string;
    canonical_source: string;
    category?: 'industry' | 'brand';
  }) =>
    post<SourceAnalyzeResp>('/reference_source/analyze', {
      start_date: payload.start,
      end_date: payload.end,
      end: 'web',
      canonical_source: payload.canonical_source,
      category: payload.category || 'industry',
      limit: 1,
    }),

  sourceMediaAccounts: (canonical_source: string, page = 1, size = 50, sort = 'priceAsc') =>
    post<{ list: SourceMediaAccount[]; total: number; page: number; page_size: number }>(
      '/reference_source/media_accounts',
      { canonical_source, page, size, sort },
    ),

  tagOwnArticle: (payload: { article_id?: string; url?: string; is_own?: boolean }) =>
    post<{ article_id: string; is_own: boolean }>('/summary/reference_source/tag_own_article', payload),

  importOwnArticles: (items: { title?: string; url: string; type?: string }[]) =>
    post<{ imported: any[]; count: number }>('/article/library/import', { items }),

  exportReferenceSourceBlob: async (payload: {
    start_date: string;
    end_date: string;
    category?: 'industry' | 'brand';
    query_id?: number;
  }) => {
    const { useAuthStore } = await import('@/stores/auth');
    const { API_BASE } = await import('../http');
    const auth = useAuthStore();
    const resp = await fetch(`${API_BASE}/export/reference_source`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: JSON.stringify({
        brand_id: auth.activeBrandId,
        start_date: payload.start_date,
        end_date: payload.end_date,
        category: payload.category || 'industry',
        ...(payload.query_id && payload.query_id > 0 ? { query_id: payload.query_id } : {}),
      }),
    });
    if (!resp.ok) throw new Error(`导出失败: ${resp.status}`);
    const cd = resp.headers.get('Content-Disposition') || '';
    const m = cd.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
    const filename = m
      ? decodeURIComponent(m[1].replace(/"/g, '').trim())
      : `引用源追溯_${payload.start_date}_${payload.end_date}.csv`;
    return { blob: await resp.blob(), filename };
  },

  // --- 信源洞察 4 件套（category: industry=排名 / brand=口碑，必须分流） ---
  siSourceTrend: (
    start: string,
    end: string,
    platform: string | null = null,
    category: 'industry' | 'brand' = 'industry',
  ) =>
    post<SourceTrendResp>('/source_intelligence/source_trend', {
      start_date: start, end_date: end, platform: platform || null, top_n: 10, category,
    }),
  siEnginePreference: (
    s: string, e: string, cs: string, ce: string,
    category: 'industry' | 'brand' = 'industry',
  ) =>
    post<EnginePreferenceResp>('/source_intelligence/engine_preference', {
      start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce, category,
    }),
  siOwnTrend: (
    s: string, e: string, cs: string, ce: string,
    platform: string | null = null,
    category: 'industry' | 'brand' = 'industry',
  ) =>
    post<OwnTrendResp>('/source_intelligence/own_trend', {
      start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce,
      platform: platform || null, category,
    }),
  siPerspective: (
    s: string, e: string, cs: string, ce: string,
    opts?: {
      platform?: string | null;
      view?: 'source' | 'article' | 'own';
      status?: string;
      search?: string;
      query_id?: number;
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: string;
      category?: 'industry' | 'brand';
    },
  ) =>
    post<PerspectiveResp>('/source_intelligence/perspective', {
      start_date: s, end_date: e, cmp_start_date: cs, cmp_end_date: ce,
      platform: opts?.platform || null,
      view: opts?.view || 'source',
      category: opts?.category || 'industry',
      ...(opts?.status && opts.status !== '全部' ? { status: opts.status } : {}),
      ...(opts?.search ? { search: opts.search } : {}),
      ...(opts?.query_id && opts.query_id > 0 ? { query_id: opts.query_id } : {}),
      page: opts?.page || 1,
      page_size: opts?.page_size || 20,
      sort_by: opts?.sort_by || 'total',
      sort_order: opts?.sort_order || 'desc',
    }),
  siTopics: (category: 'industry' | 'brand' = 'industry') =>
    get<{ query_id: number; name: string }[]>(`/source_intelligence/topics?category=${category}`),

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

  /** 导出品牌透视报告（对标 POST /export/competitor_report） */
  exportCompetitorReportBlob: async (start_date: string, end_date: string) => {
    const { useAuthStore } = await import('@/stores/auth');
    const { API_BASE } = await import('../http');
    const auth = useAuthStore();
    const oem = auth.activeBrand?.name || '透镜GEO';
    const body = {
      brand_id: auth.activeBrandId,
      start_date: start_date || null,
      end_date: end_date || null,
      query_id: null,
      oem_brand_name: oem,
    };
    const resp = await fetch(`${API_BASE}/export/competitor_report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`导出失败: ${resp.status}`);
    const cd = resp.headers.get('Content-Disposition') || '';
    const m = cd.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
    const filename = m ? decodeURIComponent(m[1].replace(/"/g, '').trim()) : `品牌透视报告_${start_date || ''}_${end_date || ''}.csv`;
    return { blob: await resp.blob(), filename };
  },

  /** 导出排名矩阵（对标 POST /export/ranking_matrix） */
  exportRankingMatrixBlob: async (start_date: string, end_date: string, platforms?: string[]) => {
    const { useAuthStore } = await import('@/stores/auth');
    const { API_BASE } = await import('../http');
    const auth = useAuthStore();
    const body = {
      brand_id: auth.activeBrandId,
      start_date: start_date || null,
      end_date: end_date || null,
      platforms: platforms?.length ? platforms : null,
    };
    const resp = await fetch(`${API_BASE}/export/ranking_matrix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`导出失败: ${resp.status}`);
    const cd = resp.headers.get('Content-Disposition') || '';
    const m = cd.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
    const filename = m
      ? decodeURIComponent(m[1].replace(/"/g, '').trim())
      : `排名矩阵_${start_date || ''}~${end_date || ''}.csv`;
    return { blob: await resp.blob(), filename };
  },
};
