/** 品牌域（geoarticle 域带 /api 前缀） */
import { get, post, put, patch, request } from '../http';
import type { BrandSummary } from '../types';

export type BrandIntro = {
  industry: string[];
  website: string;
  slogan?: string;
  tone?: Record<string, unknown>;
  description: string;
  scripts?: string;
  updated_at?: string | null;
  exists?: boolean;
  seeded_from_db?: boolean;
};

export type CompetitorItem = {
  id: string;
  name: string;
  compet_point?: string;
  aliases?: string[];
  source?: string;
};

const art = { base: 'article' as const };
export const brandApi = {
  // 品牌档案聚合（geo-api 主域）：建档结果页 / 概览页品牌卡
  summary: (brand_id?: string) =>
    get<BrandSummary>(`/api/brand/summary${brand_id ? `?brand_id=${encodeURIComponent(brand_id)}` : ''}`),
  /** 修改识别词（正式名，限次） */
  rename: (name: string) =>
    post<{ name: string; rename_remaining: number }>('/api/brand/rename', { name }),
  /** 覆盖相似识别词列表 */
  updateAliases: (aliases: string[]) =>
    post<{ aliases: { alias: string; source: string; enabled: boolean }[] }>('/api/brand/aliases', { aliases }),
  intro: () => get<BrandIntro>('/api/brand/intro', art),
  /** 编辑档案失焦保存（部分字段） */
  patchIntro: (body: { industry?: string[]; website?: string; description?: string }) =>
    patch<BrandIntro>('/api/brand/intro', body, art),
  products: () => get('/api/brand/products', art),
  aliases: () => get('/api/brand/aliases', art),
  competitors: () => get<CompetitorItem[]>('/api/brand/competitors', art),
  createCompetitor: (body: { name: string; compet_point?: string; aliases?: string[] }) =>
    post<CompetitorItem>('/api/brand/competitors', body),
  updateCompetitor: (body: { id: string; name?: string; compet_point?: string; aliases?: string[] }) =>
    put<CompetitorItem>('/api/brand/competitors', body),
  deleteCompetitor: (id: string) =>
    request<{ id: string }>('/api/brand/competitors', { method: 'DELETE', body: { id } }),
  libraryDocs: () => get('/api/brand/library/docs', art),
  libraryLinks: () => get('/api/brand/library/links', art),
  libraryText: () => get('/api/brand/library/text', art),
  wikiTree: () => get('/api/brand/wiki/tree', art),
  evidenceLibrary: (since_days = 30, limit = 50) => get(`/api/brand/evidence-library?since_days=${since_days}&limit=${limit}`, art),
  articles: (brand_id: string, uid: string, limit = 200, kind = 'writing') =>
    get<{
      uid: string;
      brand_id: string | null;
      total: number;
      counters: Record<string, number>;
      items?: ArticleLibraryItem[];
      list?: any[];
    }>(`/api/articles?brand_id=${encodeURIComponent(brand_id)}&uid=${encodeURIComponent(uid)}&kind=${kind}&limit=${limit}`, art),
  deleteArticle: (run_id: string) =>
    request<{ ok: boolean; run_id: string }>(`/api/articles/${encodeURIComponent(run_id)}`, { method: 'DELETE', base: 'article' }),
  // Agent 写作（W7）
  articleStart: (p: { topic: string; query_id?: number; evidence_ids?: string[] }) => post('/api/article/start', p, art),
  patchDraft: (p: { article_id: string; instruction: string }) => post('/api/article/report/patch-draft', p, art),
  miningTrigger: (brand_id: string) => post('/api/brand/mining/trigger', { brand_id }, art),
  miningStatus: (brand_id: string) => get(`/api/brand/mining/status?brand_id=${brand_id}`, art),
};

export type ArticleLibraryItem = {
  run_id: string;
  job_id?: string;
  title?: string;
  topic?: string;
  slug?: string | null;
  status: string;
  progress_percent?: number;
  generate_mode?: string | null;
  updated_at?: string;
  created_at?: string;
  source?: string;
};
