/**
 * site-v2 登录态：账号密码 → JWT，登录后按是否有品牌跳转 dash-v2。
 * token 存 localStorage `geo.token`（站点侧）；跳转后台用 window.name 交接（避免 URL 带 token）。
 */
import { stashAuthHandoff } from '~/utils/auth-handoff'
export interface AuthUser {
  account: string
  initial: string
}

const STORAGE_KEY = 'timus.auth'
const TOKEN_KEY = 'geo.token'

const user = ref<AuthUser | null>(null)
const ready = ref(false)
/** true=有品牌 / false=无品牌 / null=未知 */
const hasBrand = ref<boolean | null>(null)

function read(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.account ? parsed : null
  } catch {
    return null
  }
}

function persist(next: AuthUser | null) {
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function setToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore */ }
}

export function useGeoAuth() {
  const config = useRuntimeConfig()

  onMounted(() => {
    if (!ready.value) {
      user.value = read()
      ready.value = true
      if (user.value) refreshBrandState()
    }
  })

  const isLoggedIn = computed(() => !!user.value)

  function geoApiBase() {
    return String(config.public.geoApiBase || '/geo-api').replace(/\/+$/, '')
  }

  async function apiPost<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
    const resp = await fetch(`${geoApiBase()}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok || (data as { code?: number }).code === 401) {
      throw new Error(String((data as { msg?: string }).msg || `请求失败（${resp.status}）`))
    }
    // 兼容 { code, data } 与直接返回
    if ((data as { code?: number }).code === 200 && 'data' in (data as object)) {
      return (data as { data: T }).data
    }
    return data as T
  }

  async function apiGet<T = unknown>(path: string): Promise<T> {
    const resp = await fetch(`${geoApiBase()}${path}`, {
      headers: {
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) throw new Error(String((data as { msg?: string }).msg || `请求失败（${resp.status}）`))
    if ((data as { code?: number }).code === 200 && 'data' in (data as object)) {
      return (data as { data: T }).data
    }
    return data as T
  }

  async function refreshBrandState(): Promise<boolean | null> {
    if (!getToken()) {
      hasBrand.value = null
      return null
    }
    try {
      const list = await apiGet<unknown[]>('/user/brands')
      const ok = Array.isArray(list) && list.length > 0
      hasBrand.value = ok
      return ok
    } catch {
      hasBrand.value = null
      return null
    }
  }

  /** 登录：成功 true，失败返回错误文案 */
  async function login(account: string, password: string): Promise<true | string> {
    if (!account.trim()) return '请输入账号'
    if (password.length < 6) return '密码至少 6 位'
    try {
      const res = await apiPost<{ accessToken?: string; brands?: unknown[] }>('/user/login', {
        account: account.trim(),
        password,
        client_type: 'web',
      })
      if (!res?.accessToken) return '登录失败：响应缺少令牌'
      return await applyLoginToken(res.accessToken, account.trim(), res.brands)
    } catch (e) {
      return `登录失败：${(e as Error)?.message || '网络异常'}`
    }
  }

  /** 扫码等通道：用已有 accessToken 落登录态 */
  async function loginWithToken(
    accessToken: string,
    accountHint = '微信用户',
    brands?: unknown[],
  ): Promise<true | string> {
    if (!accessToken) return '登录失败：响应缺少令牌'
    return applyLoginToken(accessToken, accountHint, brands)
  }

  async function applyLoginToken(
    accessToken: string,
    accountHint: string,
    brands?: unknown[],
  ): Promise<true> {
    setToken(accessToken)
    if (Array.isArray(brands)) {
      hasBrand.value = brands.length > 0
    } else {
      await refreshBrandState()
    }
    const next: AuthUser = {
      account: accountHint,
      initial: accountHint.slice(0, 1).toUpperCase(),
    }
    user.value = next
    persist(next)
    return true
  }

  /**
   * 申请微信登录二维码。
   * 约定：POST /user/wx/qrcode → { ticket, qrcode_url, expire_seconds? }
   */
  async function createWechatQr(): Promise<
    { ok: true; ticket: string; qrcodeUrl: string; expireSeconds: number } | { ok: false; message: string }
  > {
    try {
      const res = await apiPost<{
        ticket?: string
        qrcode_url?: string
        qrcodeUrl?: string
        expire_seconds?: number
        expireSeconds?: number
      }>('/user/wx/qrcode', { client_type: 'web' })
      const ticket = String(res?.ticket || '')
      const qrcodeUrl = String(res?.qrcode_url || res?.qrcodeUrl || '')
      if (!ticket || !qrcodeUrl) {
        return { ok: false, message: '微信登录暂未开通，请使用账号密码' }
      }
      return {
        ok: true,
        ticket,
        qrcodeUrl,
        expireSeconds: Number(res?.expire_seconds || res?.expireSeconds || 120),
      }
    } catch (e) {
      return {
        ok: false,
        message: (e as Error)?.message?.includes('404')
          ? '微信登录暂未开通，请使用账号密码'
          : `二维码获取失败：${(e as Error)?.message || '网络异常'}`,
      }
    }
  }

  /**
   * 轮询微信扫码状态。
   * 约定：GET /user/wx/qrcode/status?ticket= → { status, accessToken?, user?, brands? }
   * status: pending | scanned | confirmed | expired
   */
  async function pollWechatQr(ticket: string): Promise<{
    status: 'pending' | 'scanned' | 'confirmed' | 'expired' | 'error'
    accessToken?: string
    account?: string
    brands?: unknown[]
    message?: string
  }> {
    try {
      const res = await apiGet<{
        status?: string
        accessToken?: string
        user?: { username?: string; account?: string; name?: string }
        brands?: unknown[]
        msg?: string
      }>(`/user/wx/qrcode/status?ticket=${encodeURIComponent(ticket)}`)
      const status = String(res?.status || 'pending') as
        | 'pending'
        | 'scanned'
        | 'confirmed'
        | 'expired'
      if (status === 'confirmed' && res?.accessToken) {
        return {
          status: 'confirmed',
          accessToken: res.accessToken,
          account: res.user?.username || res.user?.account || res.user?.name || '微信用户',
          brands: res.brands,
        }
      }
      return { status, message: res?.msg }
    } catch (e) {
      return { status: 'error', message: (e as Error)?.message || '网络异常' }
    }
  }

  function logout() {
    user.value = null
    hasBrand.value = null
    persist(null)
    setToken('')
  }

  /** 跳转 v2 后台：无品牌 → /trial，有品牌 → 报告 */
  function goDash(opts?: { forceTrial?: boolean }) {
    const consoleUrl = String(config.public.consoleUrl || 'http://127.0.0.1:5180').replace(/\/+$/, '')
    const tk = getToken()
    if (tk) stashAuthHandoff(tk)
    const path =
      opts?.forceTrial || hasBrand.value === false
        ? '/trial'
        : '/dashboard/overview'
    window.location.href = `${consoleUrl}${path}`
  }

  return {
    user,
    isLoggedIn,
    hasBrand,
    ready,
    getToken,
    refreshBrandState,
    login,
    loginWithToken,
    createWechatQr,
    pollWechatQr,
    logout,
    goDash,
  }
}
