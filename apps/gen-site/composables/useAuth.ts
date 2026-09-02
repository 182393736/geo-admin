/**
 * 登录态（前端模拟）
 *
 * 复刻站点只有静态页，没有后端可连，因此登录态用 localStorage 本地维护。
 * 若后续接真实接口，只需把 login / logout 里的实现换成请求即可，
 * 对外暴露的 isLoggedIn / user / login / logout 保持不变。
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
  // 登录态只能在客户端读取。
  // 必须在 onMounted 之后再赋值：SSR 输出的 HTML 是「未登录」状态，
  // 若在 setup 阶段就改写，客户端首次渲染会与 SSR 结果不一致，
  // 导致 hydration 后状态被回滚（表现为刷新后登录态丢失）。
  onMounted(() => {
    if (!ready.value) {
      user.value = read()
      ready.value = true
    }
  })

  const isLoggedIn = computed(() => !!user.value)

  /** 登录：成功返回 true，失败返回错误文案 */
  async function login(account: string, password: string): Promise<true | string> {
    // 模拟接口耗时，与线上弹窗的加载感一致
    await new Promise((r) => setTimeout(r, 600))
    if (!account.trim()) return '请输入账号'
    if (password.length < 6) return '密码至少 6 位'
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
  }

  return { user, isLoggedIn, login, logout }
}
