/** 全站共用的底部 Toast（复用原站 .toast 样式） */
const text = ref('正在进入控制台...')
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function showToast(msg?: string, duration = 2200) {
    if (msg) text.value = msg
    visible.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
      timer = null
    }, duration)
  }

  function hideToast() {
    visible.value = false
    if (timer) { clearTimeout(timer); timer = null }
  }

  return { text, visible, showToast, hideToast }
}
