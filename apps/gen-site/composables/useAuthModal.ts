/**
 * 登录弹窗的全局开关
 *
 * 站点各处（右上角登录按钮、首页未登录点提交、诊断页等）都通过它唤起同一个弹窗。
 * 也兼容原站的自定义事件 `timus:auth-open`，layout 里已做监听转发。
 */
export type AuthTab = 'phone' | 'password'

const isOpen = ref(false)
/** 默认选中「账号密码」登录 */
const tab = ref<AuthTab>('password')
/** 唤起弹窗的来源，便于埋点/后续区分处理 */
const source = ref<string>('')

export function useAuthModal() {
  function open(nextTab: AuthTab = 'password', from = '') {
    tab.value = nextTab
    source.value = from
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function setTab(next: AuthTab) {
    tab.value = next
  }

  return { isOpen, tab, source, open, close, setTab }
}
