/**
 * HTTP 客户端（对齐实测契约：geoapi.timus.cn / geoarticle.timus.cn 双域）
 * - 统一响应壳 { code, msg, data } 解包
 * - JWT Bearer 注入（localStorage，7天期）
 * - 401 自动登出跳转 /login（对齐线上 n0() 行为）
 */
import { useAuthStore } from '@/stores/auth';

export const API_BASE = import.meta.env.VITE_API_BASE || '';       // geoapi 主域
export const ARTICLE_BASE = import.meta.env.VITE_ARTICLE_BASE || ''; // geoarticle 域

interface ReqOpts extends RequestInit { base?: 'api' | 'article'; raw?: boolean }

export async function request<T = any>(url: string, opts: ReqOpts = {}): Promise<T> {
  const auth = useAuthStore();
  const base = opts.base === 'article' ? ARTICLE_BASE : API_BASE;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

  const resp = await fetch(base + url, { ...opts, headers });
  if (resp.status === 401) { auth.logout(); location.href = '/login'; throw new Error('401'); }
  const data = await resp.json();
  if (opts.raw || opts.base === 'article') return data as T; // geoarticle 无统一壳
  if (data.code !== 200) throw new Error(data.msg || '请求失败');
  return data.data as T;
}

export const get = <T>(url: string, opts?: ReqOpts) => request<T>(url, { method: 'GET', ...opts });
export const post = <T>(url: string, body?: any, opts?: ReqOpts) =>
  request<T>(url, { method: 'POST', body: JSON.stringify(body ?? {}), ...opts });
