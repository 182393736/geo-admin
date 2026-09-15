/** 报告（周报/月报）与发稿 */
import { get, post } from '../http';
import type { ReportLatestResp, MediaListResp, PublishOrder } from '../types';

export const reportApi = {
  cycle: () => get<Record<string, any>>('/report/cycle'),
  list: (period_type: 'weekly' | 'monthly') => post('/report/list', { period_type, limit: 8, offset: 0 }),
  latest: (period_type: 'weekly' | 'monthly' = 'weekly') => post<ReportLatestResp>('/report/latest', { period_type }),
};

export const publishApi = {
  mediaFacets: () => post<{ taxonomy: { value: string; count: number }[]; areas?: { value: string; count: number }[]; types?: { value: string; count: number }[] }>('/publish/media/facets', {}),
  mediaList: (payload: Record<string, any> = {}) =>
    post<MediaListResp>('/publish/media/list', {
      display_mode: 'account',
      sort: 'cite-desc',
      fav: false,
      page: 1,
      size: 20,
      ...payload,
    }),
  mediaFav: (media_key: string, fav = true) =>
    post<{ media_key: string; fav: boolean; fav_total: number }>('/publish/media/fav', { media_key, fav }),
  orders: (payload: Record<string, any> = {}) =>
    post<{
      list: PublishOrder[];
      total: number;
      page: number;
      size: number;
      counts?: { draft: number; all: number; publishing: number; ok: number; fail: number };
    }>('/publish/orders', { page: 1, size: 20, ...payload }),
  drafts: (payload: Record<string, any> = {}) => post<{ list: any[]; total: number; page: number }>('/publish/article/drafts', { size: 50, ...payload }),
  saveDraft: (payload: Record<string, any>) =>
    post<{ article_id: string; word_count: number; title: string }>('/publish/article/save_draft', payload),
  articleLibrary: (payload: Record<string, any> = {}) =>
    post<{
      list: any[];
      total: number;
      page: number;
      page_size: number;
      stats?: { imported: number; period_cited_articles: number; period_cite_times: number; cite_rate: number };
    }>('/article/library', payload),
  articleCites: (payload: Record<string, any>) =>
    post<{ article_id: string; total: number; list: any[] }>('/article/library/cites', payload),

  estimate: (mediaKeys: string[], articleId?: string) =>
    post<{ total_points: number; list: any[]; count: number }>('/publish/estimate', { media_keys: mediaKeys, article_id: articleId }),
  submit: (payload: any) => post('/publish/submit', payload),
  orderCites: (order_no: string) => post('/publish/order/cites', { order_no }),
  republish: (order_no: string) => post('/publish/order/republish', { order_no }),
};
