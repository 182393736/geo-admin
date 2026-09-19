import { createApp, reactive } from 'vue'

type ToastKind = 'success' | 'error' | 'warning' | 'info'

const state = reactive<{
  items: { id: number; kind: ToastKind; text: string }[]
}>({ items: [] })

let seq = 1

function push(kind: ToastKind, text: string) {
  const id = seq++
  state.items.push({ id, kind, text })
  window.setTimeout(() => {
    const i = state.items.findIndex((t) => t.id === id)
    if (i >= 0) state.items.splice(i, 1)
  }, 2800)
}

export const toast = {
  success: (text: string, _desc?: string) => push('success', text),
  error: (text: string, _desc?: string) => push('error', text),
  warning: (text: string, _desc?: string) => push('warning', text),
  info: (text: string, _desc?: string) => push('info', text),
}

/** 兼容旧代码 `Message.success/error/warning` */
export const Message = toast

export function installToast(app: ReturnType<typeof createApp>) {
  app.config.globalProperties.$toast = toast
  app.provide('toastState', state)
}

export { state as toastState }
