/**
 * HTTP 客户端（对齐实测契约：geoapi.timus.cn / geoarticle.timus.cn 双域）
 * - 统一响应壳 { code, msg, data } 解包
 * - JWT Bearer 注入（localStorage，7天期）
 * - 多品牌：自动注入当前 activeBrandId（query / body），账号级接口白名单除外
 * - 401 自动登出跳转 /login（对齐线上 n0() 行为）
 */
import { useAuthStore } from '@/stores/auth';

export const API_BASE = import.meta.env.VITE_API_BASE || '';       // geoapi 主域
export const ARTICLE_BASE = import.meta.env.VITE_ARTICLE_BASE || ''; // geoarticle 域

interface ReqOpts extends RequestInit { base?: 'api' | 'article'; raw?: boolean; skipBrand?: boolean }

/** 不要求 brand_id 的账号级路径前缀 */
const ACCOUNT_PATHS = [
  '/user/login', '/user/register', '/user/captcha', '/user/brands', '/user/menus',
  '/user/logout', '/user/generate_today', '/credit/', '/payment/plans', '/payment/orders',
];

function isAccountPath(url: string): boolean {
  const path = url.split('?')[0];
  return ACCOUNT_PATHS.some(p => path === p || path.startsWith(p));
}

function injectBrand(url: string, body: any, method: string, skipBrand?: boolean): { url: string; body: any } {
  if (skipBrand || isAccountPath(url)) return { url, body };
  const auth = useAuthStore();
  const bid = auth.activeBrandId;
  if (!bid) return { url, body };

  const upper = method.toUpperCase();
  if (upper === 'GET' || upper === 'DELETE') {
    if (!/[?&]brand_id=/.test(url)) {
      url += (url.includes('?') ? '&' : '?') + `brand_id=${encodeURIComponent(bid)}`;
    }
    return { url, body };
  }
  // POST/PUT：body 对象缺 brand_id 时补上
  if (body && typeof body === 'object' && !Array.isArray(body) && body.brand_id == null) {
    body = { ...body, brand_id: bid };
  } else if (body == null || body === undefined) {
    body = { brand_id: bid };
  }
  return { url, body };
}

export async function request<T = any>(url: string, opts: ReqOpts = {}): Promise<T> {
  const auth = useAuthStore();
  const base = opts.base === 'article' ? ARTICLE_BASE : API_BASE;
  const method = (opts.method || 'GET').toUpperCase();
  let bodyObj: any = undefined;
  if (opts.body && typeof opts.body === 'string') {
    try { bodyObj = JSON.parse(opts.body); } catch { bodyObj = undefined; }
  } else if (opts.body && typeof opts.body === 'object') {
    bodyObj = opts.body;
  }

  const injected = injectBrand(url, bodyObj, method, opts.skipBrand);
  url = injected.url;

  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

  const fetchOpts: RequestInit = { ...opts, method, headers };
  if (method !== 'GET' && method !== 'HEAD') {
    fetchOpts.body = injected.body != null ? JSON.stringify(injected.body) : opts.body;
  } else {
    delete fetchOpts.body;
  }

  const resp = await fetch(base + url, fetchOpts);
  if (resp.status === 401) { auth.logout(); location.href = '/login'; throw new Error('401'); }
  const data = await resp.json();
  if (opts.raw || opts.base === 'article') {
    // geoarticle 无统一壳；错误时也可能是 {code,msg}
    if (data && typeof data === 'object' && data.code && data.code !== 200 && data.msg) {
      throw new Error(data.msg || '请求失败');
    }
    return data as T;
  }
  if (data.code !== 200) throw new Error(data.msg || '请求失败');
  return data.data as T;
}

export const get = <T>(url: string, opts?: ReqOpts) => request<T>(url, { method: 'GET', ...opts });
export const post = <T>(url: string, body?: any, opts?: ReqOpts) =>
  request<T>(url, { method: 'POST', body: body ?? {}, ...opts });
export const put = <T>(url: string, body?: any, opts?: ReqOpts) =>
  request<T>(url, { method: 'PUT', body: body ?? {}, ...opts });
export const patch = <T>(url: string, body?: any, opts?: ReqOpts) =>
  request<T>(url, { method: 'PATCH', body: body ?? {}, ...opts });
