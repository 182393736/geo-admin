/**
 * 管理总后台 HTTP 客户端（浅封装）
 * - 统一响应壳 { code, msg, data } 解包
 * - JWT Bearer（localStorage 'admin_token'）
 * - 401 → 跳登录；403 → 抛「无管理员权限」
 */
import { useAuthStore } from '@/stores/auth';

export const API_BASE = import.meta.env.VITE_API_BASE || '';

interface ReqOpts extends RequestInit { raw?: boolean }

export async function request<T = any>(url: string, opts: ReqOpts = {}): Promise<T> {
  const auth = useAuthStore();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

  const resp = await fetch(API_BASE + url, { ...opts, headers });
  if (resp.status === 401) { auth.logout(); location.href = '/login'; throw new Error('登录已过期'); }
  if (resp.status === 403) throw new Error('无管理员权限（需要管理员账号）');
  const data = await resp.json();
  if (opts.raw) return data as T;
  if (data.code !== 200) throw new Error(data.msg || '请求失败');
  return data.data as T;
}

export const get = <T>(url: string, opts?: ReqOpts) => request<T>(url, { method: 'GET', ...opts });
export const post = <T>(url: string, body?: any, opts?: ReqOpts) =>
  request<T>(url, { method: 'POST', body: JSON.stringify(body ?? {}), ...opts });
