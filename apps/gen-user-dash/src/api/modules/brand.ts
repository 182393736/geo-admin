/** 品牌域（geoarticle 域带 /api 前缀） */
import { get, post } from '../http';

const art = { base: 'article' as const };
export const brandApi = {
  intro: () => get('/api/brand/intro', art),
  products: () => get('/api/brand/products', art),
  aliases: () => get('/api/brand/aliases', art),
  competitors: () => get('/api/brand/competitors', art),
  libraryDocs: () => get('/api/brand/library/docs', art),
  libraryLinks: () => get('/api/brand/library/links', art),
  libraryText: () => get('/api/brand/library/text', art),
  wikiTree: () => get('/api/brand/wiki/tree', art),
  evidenceLibrary: (since_days = 30, limit = 50) => get(`/api/brand/evidence-library?since_days=${since_days}&limit=${limit}`, art),
  articles: (brand_id: string, uid: string, limit = 200) =>
    get(`/api/articles?brand_id=${brand_id}&uid=${uid}&limit=${limit}`, art),
  // Agent 写作（W7）
  articleStart: (p: { topic: string; query_id?: number; evidence_ids?: string[] }) => post('/api/article/start', p, art),
  patchDraft: (p: { article_id: string; instruction: string }) => post('/api/article/report/patch-draft', p, art),
  miningTrigger: (brand_id: string) => post('/api/brand/mining/trigger', { brand_id }, art),
  miningStatus: (brand_id: string) => get(`/api/brand/mining/status?brand_id=${brand_id}`, art),
};
