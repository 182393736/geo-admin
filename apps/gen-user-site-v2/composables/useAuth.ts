/**
 * site-v2 登录态：账号密码 → JWT，登录后按是否有品牌跳转 dash-v2。
 * token 存 localStorage `geo.token`（站点侧）；跳转后台用 hash `#token=` 交接。
 */
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

export function useAuth() {
  const config = useRuntimeConfig()

  onMounted(() => {
    if (!ready.value) {
      user.value = read()
      ready.value = true
      if (user.value) refreshBrandState()
    }
  })

  const isLoggedIn = computed(() => !!user.value)

  async function apiPost<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
    const base = String(config.public.apiBase || '/geo-api').replace(/\/+$/, '')
    const resp = await fetch(`${base}${path}`, {
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
    const base = String(config.public.apiBase || '/geo-api').replace(/\/+$/, '')
    const resp = await fetch(`${base}${path}`, {
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
      setToken(res.accessToken)
      if (Array.isArray(res.brands)) {
        hasBrand.value = res.brands.length > 0
      } else {
        await refreshBrandState()
      }
    } catch (e) {
      return `登录失败：${(e as Error)?.message || '网络异常'}`
    }
    const next: AuthUser = {
      account: account.trim(),
      initial: account.trim().slice(0, 1).toUpperCase(),
    }
    user.value = next
    persist(next)
    return true
  }

  function logout() {
    user.value = null
    hasBrand.value = null
    persist(null)
    setToken('')
  }

  /** 跳转 v2 后台：无品牌 → /trial，有品牌 → 品牌库 */
  function goDash(opts?: { forceTrial?: boolean }) {
    const consoleUrl = String(config.public.consoleUrl || 'http://127.0.0.1:5180').replace(/\/+$/, '')
    const tk = getToken()
    const hash = tk ? `#token=${encodeURIComponent(tk)}` : ''
    if (opts?.forceTrial || hasBrand.value === false) {
      window.location.href = `${consoleUrl}/trial${hash}`
      return
    }
    window.location.href = `${consoleUrl}/dashboard/brand-library${hash}`
  }

  return {
    user,
    isLoggedIn,
    hasBrand,
    ready,
    getToken,
    refreshBrandState,
    login,
    logout,
    goDash,
  }
}
