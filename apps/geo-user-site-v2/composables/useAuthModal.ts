/** 全站登录弹窗状态 */
const isOpen = ref(false)
const tab = ref<'password' | 'phone'>('password')
const source = ref('header')

export function useAuthModal() {
  function open(nextTab: 'password' | 'phone' = 'password', nextSource = 'header') {
    tab.value = nextTab
    source.value = nextSource
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  return { isOpen, tab, source, open, close }
}
