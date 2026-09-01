/** 用户/鉴权模块（实测路径：POST /user/login 有效） */
import { get, post } from '../http';
import type { LoginResp, UserInfo, MenuItem, BrandBrief, CreditAccount, Subscription } from '../types';

export const userApi = {
  login: (account: string, password: string) =>
    post<LoginResp>('/user/login', { account, password, client_type: 'web' }, { raw: true }),
  smsLogin: (phone: string, code: string) =>
    post<LoginResp>('/user/verify/login', { phone, code }, { raw: true }),
  sendSms: (phone: string, scene: 'login' | 'register' | 'reset') => post('/user/send/sms', { phone, scene }),
  captcha: () => get('/user/captcha', { raw: true }),
  register: (p: { phone: string; password: string; password_confirm: string; captcha_id: string; captcha_code: string }) =>
    post('/user/register', p, { raw: true }),
  logout: () => post('/api/auth/logout', {}, { base: 'article' }).catch(() => {}),

  info: () => get<UserInfo>('/user/info').then((d: any) => d?.data ?? d),
  menus: () => get<{ menus: MenuItem[] }>('/user/menus'),
  brands: () => get<BrandBrief[]>('/user/brands'),
  pendingOrder: () => get('/user/brands/pending-order'),
  reminders: () => get('/user/reminders'),
  registerClick: (source: string) => post('/user/register/click', { source, operation: '访问' }).catch(() => {}),

  creditAccount: () => get<CreditAccount>('/credit/account'),
  subscription: () => get<Subscription>('/payment/subscription/current'),
};
