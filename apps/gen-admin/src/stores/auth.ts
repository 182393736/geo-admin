/**
 * 总后台鉴权 store —— 复用 /user/login（管理员账号 = is_superuser=true）
 * - token 存 localStorage('admin_token')
 * - 登录后需通过 /admin/me 校验管理员身份（403 即非管理员）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { adminApi } from '@/api/admin';

const LS_TOKEN = 'admin_token';
const LS_ADMIN = 'admin_admin';

export const useAuthStore = defineStore('adminAuth', () => {
  const token = ref<string>(localStorage.getItem(LS_TOKEN) || '');
  const admin = ref<{ user_id: string; account: string; name: string } | null>(
    JSON.parse(localStorage.getItem(LS_ADMIN) || 'null'));

  const isAuthenticated = computed(() => !!token.value);

  async function login(account: string, password: string) {
    const resp = await adminApi.login(account, password);
    if (!resp?.accessToken) throw new Error((resp as any)?.msg || '账号或密码错误');
    token.value = resp.accessToken;
    localStorage.setItem(LS_TOKEN, token.value);
    // 校验管理员身份
    const me = await adminApi.me();
    admin.value = me;
    localStorage.setItem(LS_ADMIN, JSON.stringify(me));
    return me;
  }

  function logout() {
    token.value = '';
    admin.value = null;
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_ADMIN);
  }

  return { token, admin, isAuthenticated, login, logout };
});
