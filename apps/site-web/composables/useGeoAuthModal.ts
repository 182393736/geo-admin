/**
 * 全站登录弹窗：默认微信扫码，可切账号密码。
 */
export type AuthTab = 'wechat' | 'password'

const isOpen = ref(false)
const tab = ref<AuthTab>('wechat')
const source = ref('header')

export function useGeoAuthModal() {
  function open(nextTab: AuthTab = 'wechat', nextSource = 'header') {
    tab.value = nextTab
    source.value = nextSource
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
