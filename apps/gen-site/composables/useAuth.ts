/**
 * 登录态（真实接口版）
 *
 * 已接入 apps/api 的 POST /user/login（账号密码 → JWT）。
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

export function useAuth() {
  // 登录态只能在客户端读取；onMounted 后赋值避免 SSR/CSR hydration 不一致回滚。
  onMounted(() => {
    if (!ready.value) {
      user.value = read()
      ready.value = true
    }
  })

  const isLoggedIn = computed(() => !!user.value)

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
    return true
  }

  function logout() {
    user.value = null
    persist(null)
    try {
      localStorage.removeItem('geo.token')
    } catch { /* 忽略 */ }
  }

  return { user, isLoggedIn, login, logout }
}
