/**
 * 登录态（真实接口版）
 *
 * 已接入 apps/gen-api 的 POST /user/login（账号密码 → JWT）。
 * 对外暴露的 isLoggedIn / user / login / logout 签名与模拟版一致，
 * 站点各处（SiteAuthModal 等）无需改动。token 另存 'geo.token' 供 useGeoApi 使用。
 * 手机验证码通道待 API 侧短信能力接入后启用（弹窗手机 tab 会提示先用账号密码）。
 */
export interface AuthUser {
  /** 登录账号（手机号或用户名） */
  account: string
  /** 头像里显示的字（取账号首字符） */
  initial: string
}

const STORAGE_KEY = 'timus.auth'

const user = ref<AuthUser | null>(null)
const ready = ref(false)
// 是否已过首登分析（已有品牌）：
//   true  = 有品牌 → 点用户名跳控制台
//   false = 无品牌 → 点用户名跳 /trial 建档
//   null  = 尚未确认（未登录 / 网络失败）
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
  } catch {
    /* 隐私模式下 localStorage 不可用，忽略即可 */
  }
}

/**
 * 吸收用户后台（gen-user-dash）跳转带回的登录态：
 * 后台判定无品牌 → 跳本页 /trial#token=...（hash 不进服务器日志），
 * 这里在挂载时读出来写入 geo.token + timus.auth，免去二次登录，
 * 并立即清除 URL 里的 token 防泄漏 / 刷新重复使用。
 */
function applyHandoffToken() {
  try {
    const m = window.location.hash.match(/[#&]?token=([^&]+)/)
    if (!m) return
    const token = decodeURIComponent(m[1])
    if (!token) return
    const { setToken } = useGeoApi()
    setToken(token)
    // 从 JWT 解出账号（apps/gen-api sign 载荷 { sub, jti, name }），重建最小登录态
    let account = ''
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      account = payload?.name || ''
    } catch { /* 忽略 */ }
    if (account) {
      const next: AuthUser = { account, initial: account.slice(0, 1).toUpperCase() }
      user.value = next
      persist(next)
    }
    const url = new URL(window.location.href)
    url.hash = url.hash.replace(/[?&]?token=[^&]*/g, '')
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  } catch { /* 忽略 */ }
}

export function useAuth() {
  // 登录态只能在客户端读取；onMounted 后赋值避免 SSR/CSR hydration 不一致回滚。
  onMounted(() => {
    if (!ready.value) {
      applyHandoffToken() // 后台跳转带回的 token 优先吸收
      user.value = read()
      ready.value = true
      if (user.value) refreshBrandState() // 已登录则回填品牌态
    }
  })

  const isLoggedIn = computed(() => !!user.value)

  /**
   * 拉取当前用户品牌列表，确认是否已过首登分析。
   * 返回 true/false；未登录或网络异常返回 null（调用方决定兜底）。
   */
  async function refreshBrandState(): Promise<boolean | null> {
    const { apiGet, getToken } = useGeoApi()
    if (!getToken()) { hasBrand.value = null; return null }
    try {
      const res = await apiGet<{ code?: number; data?: unknown }>('/user/brands')
      const list = (res && res.data) ?? res
      const ok = Array.isArray(list) && list.length > 0
      hasBrand.value = ok
      return ok
    } catch {
      hasBrand.value = null
      return null
    }
  }

  /** 登录：成功返回 true，失败返回错误文案 */
  async function login(account: string, password: string): Promise<true | string> {
    if (!account.trim()) return '请输入账号'
    if (password.length < 6) return '密码至少 6 位'
    const { apiPost, setToken } = useGeoApi()
    try {
      const res = await apiPost<{ accessToken?: string }>('/user/login', {
        account: account.trim(),
        password,
      })
      if (!res?.accessToken) return '登录失败：响应缺少令牌'
      setToken(res.accessToken)
    } catch (e) {
      return `登录失败：${(e as Error)?.message || '网络异常'}`
    }
    const next: AuthUser = {
      account: account.trim(),
      initial: account.trim().slice(0, 1).toUpperCase(),
    }
    user.value = next
    persist(next)
    refreshBrandState() // 登录成功即回填品牌态（决定后续点用户名跳转目标）
    return true
  }

  function logout() {
    user.value = null
    hasBrand.value = null
    persist(null)
    try {
      localStorage.removeItem('geo.token')
    } catch { /* 忽略 */ }
  }

  return { user, isLoggedIn, hasBrand, refreshBrandState, login, logout }
}
