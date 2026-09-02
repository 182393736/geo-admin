/**
 * 鉴权 store —— 对齐线上契约：
 *  - token 存 localStorage（JWT 7 天）
 *  - 401 全局登出（http.ts 里自动调用）
 *  - 品牌切换持久化 activeBrandId
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userApi } from '@/api/modules/user';
import type { BrandBrief } from '@/api/types';

const LS_TOKEN = 'geo_token';
const LS_USER = 'geo_user';
const LS_BRAND = 'geo_active_brand';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem(LS_TOKEN) || '');
  const user = ref<{ id: string; username: string } | null>(
    JSON.parse(localStorage.getItem(LS_USER) || 'null'));
  const brands = ref<BrandBrief[]>([]);
  const activeBrandId = ref<string>(localStorage.getItem(LS_BRAND) || '');

  const isAuthenticated = computed(() => !!token.value);
  const activeBrand = computed(() => brands.value.find(b => b.brand_id === activeBrandId.value));
  const brandsLoaded = ref(false);          // 本次会话是否已从后端拉过品牌列表
  const hasBrand = computed(() => brands.value.length > 0);

  /** 拉取/刷新品牌列表（登录返回、onboarding 完成、页面刷新恢复会话时调用） */
  async function refreshBrands() {
    const list = await userApi.brands();
    brands.value = list || [];
    brandsLoaded.value = true;
    if (!activeBrandId.value || !brands.value.some(b => b.brand_id === activeBrandId.value)) {
      activeBrandId.value = brands.value[0]?.brand_id || '';
      localStorage.setItem(LS_BRAND, activeBrandId.value);
    }
    return brands.value;
  }

  async function login(account: string, password: string) {
    const resp = await userApi.login(account, password);
    if (!resp?.accessToken) throw new Error((resp as any)?.msg || '账号或密码错误');
    token.value = resp.accessToken;
    user.value = resp.user;
    brands.value = resp.brands || [];
    brandsLoaded.value = true;
    activeBrandId.value = resp.brands?.[0]?.brand_id || '';
    localStorage.setItem(LS_TOKEN, token.value);
    localStorage.setItem(LS_USER, JSON.stringify(user.value));
    localStorage.setItem(LS_BRAND, activeBrandId.value);
    return resp;
  }

  function switchBrand(brand_id: string) {
    activeBrandId.value = brand_id;
    localStorage.setItem(LS_BRAND, brand_id);
  }

  function logout() {
    token.value = ''; user.value = null; activeBrandId.value = '';
    brands.value = []; brandsLoaded.value = false;
    localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_USER); localStorage.removeItem(LS_BRAND);
  }

  const expSoon = computed(() => {
    if (!token.value) return false;
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      return payload.exp * 1000 - Date.now() < 24 * 3600 * 1000; // 1天内过期
    } catch { return false; }
  });

  return { token, user, brands, brandsLoaded, hasBrand, activeBrandId, activeBrand,
    isAuthenticated, login, logout, switchBrand, refreshBrands, expSoon };
});
