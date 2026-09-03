/** 报告（周报/月报）与发稿 */
import { get, post } from '../http';
import type { ReportLatestResp, MediaListResp, PublishOrder } from '../types';

export const reportApi = {
  cycle: () => get<Record<string, any>>('/report/cycle'),
  list: (period_type: 'weekly' | 'monthly') => post('/report/list', { period_type, limit: 8, offset: 0 }),
  latest: (period_type: 'weekly' | 'monthly' = 'weekly') => post<ReportLatestResp>('/report/latest', { period_type }),
};

export const publishApi = {
  mediaFacets: () => post('/publish/media/facets', {}),
  mediaList: (page = 1, size = 20, fav = false) =>
    post<MediaListResp>('/publish/media/list', { display_mode: 'account', sort: 'cite-desc', fav, page, size }),
  orders: (page = 1, size = 20) => post<{ list: PublishOrder[] }>('/publish/orders', { page, size }),
  drafts: () => post('/publish/article/drafts', { size: 50 }),
  articleLibrary: (start: string, end: string, cite: 'all' | 'mine' = 'all') =>
    post('/article/library', { engine: null, query_type: null, query_id: null, group_id: null, source_kind: null, cite, start_date: start, end_date: end }),

  // 写动作（契约来自前端声明，后端 W7 实现）
  estimate: (mediaKeys: string[], articleId: string) => post('/publish/estimate', { media_keys: mediaKeys, article_id: articleId }),
  submit: (payload: any) => post('/publish/submit', payload),
  orderCites: (order_no: string) => post('/publish/order/cites', { order_no }),
  republish: (order_no: string) => post('/publish/order/republish', { order_no }),
};
