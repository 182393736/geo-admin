/** 全局 Toast（主题紫玻璃风）——任何地方 import { toast } 即可用 */
import { reactive } from 'vue';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastMsg { id: number; type: ToastType; text: string; desc?: string }

export const toastState = reactive<{ list: ToastMsg[] }>({ list: [] });
let seq = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export function dismissToast(id: number) {
  const i = toastState.list.findIndex(t => t.id === id);
  if (i >= 0) toastState.list.splice(i, 1);
  const t = timers.get(id);
  if (t) { clearTimeout(t); timers.delete(id); }
}

/**
 * show：成功/失败/信息提示
 * @param dur 自动关闭毫秒；默认 3000，传 0 不自动关
 */
export function toast(type: ToastType, text: string, desc?: string, dur = 3000) {
  const id = ++seq;
  toastState.list.push({ id, type, text, desc });
  if (dur > 0) timers.set(id, setTimeout(() => dismissToast(id), dur));
  return id;
}

toast.success = (text: string, desc?: string, dur?: number) => toast('success', text, desc, dur);
toast.error = (text: string, desc?: string, dur?: number) => toast('error', text, desc, dur);
toast.info = (text: string, desc?: string, dur?: number) => toast('info', text, desc, dur);
