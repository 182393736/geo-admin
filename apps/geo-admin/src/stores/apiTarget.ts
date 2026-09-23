/**
 * 管理总后台 API 目标（本地 / 测试 / 生产）
 * 选择持久化到 localStorage，切换后需重新登录（token 不跨环境）。
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type ApiTargetId = 'local' | 'test' | 'prod';

export interface ApiTarget {
  id: ApiTargetId;
  label: string;
  /** 空字符串 = 走 Vite 代理到本机 6001 */
  baseUrl: string;
}

const LS_KEY = 'admin_api_target';

export const API_TARGETS: ApiTarget[] = [
  { id: 'local', label: '本地', baseUrl: '' },
  { id: 'test', label: '测试', baseUrl: 'https://test-geo-api.hanyuai.com' },
  { id: 'prod', label: '生产', baseUrl: 'https://geo-api.hanyuai.com' },
];

function resolveDefaultId(): ApiTargetId {
  const saved = String(localStorage.getItem(LS_KEY) || '').trim() as ApiTargetId;
  if (API_TARGETS.some(t => t.id === saved)) return saved;
  const envBase = String(import.meta.env.VITE_API_BASE || '').trim();
  if (/test-geo-api\.hanyuai\.com/i.test(envBase)) return 'test';
  if (/^https?:\/\/geo-api\.hanyuai\.com/i.test(envBase)) return 'prod';
  return 'local';
}

export const useApiTargetStore = defineStore('adminApiTarget', () => {
  const targetId = ref<ApiTargetId>(resolveDefaultId());

  const target = computed(() =>
    API_TARGETS.find(t => t.id === targetId.value) || API_TARGETS[0],
  );

  /** 实际请求前缀：local 空串走代理；其余用完整域名 */
  const apiBase = computed(() => {
    if (targetId.value === 'local') return '';
    return target.value.baseUrl.replace(/\/$/, '');
  });

  const displayUrl = computed(() => {
    if (targetId.value === 'local') return 'http://127.0.0.1:6001（Vite 代理）';
    return target.value.baseUrl;
  });

  function setTarget(id: ApiTargetId) {
    if (!API_TARGETS.some(t => t.id === id)) throw new Error(`未知 API 目标: ${id}`);
    targetId.value = id;
    localStorage.setItem(LS_KEY, id);
  }

  return { targetId, target, apiBase, displayUrl, setTarget, targets: API_TARGETS };
});

/** 供非 setup 上下文（http.ts）读取当前 API 前缀 */
export function getApiBase(): string {
  try {
    return useApiTargetStore().apiBase;
  } catch {
    const id = resolveDefaultId();
    const t = API_TARGETS.find(x => x.id === id) || API_TARGETS[0];
    return t.id === 'local' ? '' : t.baseUrl.replace(/\/$/, '');
  }
}
