import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/AdminLayout.vue'),
    redirect: '/overview',
    children: [
      { path: '/overview', name: 'Overview', component: () => import('@/views/overview/index.vue'), meta: { title: '运营驾驶舱' } },
      { path: '/users', name: 'Users', component: () => import('@/views/users/index.vue'), meta: { title: '用户管理' } },
      { path: '/brands', name: 'Brands', component: () => import('@/views/brands/index.vue'), meta: { title: '品牌管理' } },
      { path: '/collect', name: 'Collect', component: () => import('@/views/collect/index.vue'), meta: { title: '采集监控' } },
      { path: '/parse', name: 'Parse', component: () => import('@/views/parse/index.vue'), meta: { title: '解析监控' } },
      { path: '/llm', name: 'Llm', component: () => import('@/views/llm/index.vue'), meta: { title: 'LLM 调用' } },
      { path: '/billing', name: 'Billing', component: () => import('@/views/billing/index.vue'), meta: { title: '计费中心' } },
      { path: '/content', name: 'Content', component: () => import('@/views/content/index.vue'), meta: { title: '内容与发稿' } },
      { path: '/reports', name: 'Reports', component: () => import('@/views/reports/index.vue'), meta: { title: '报告中心' } },
      { path: '/onboarding', name: 'Onboarding', component: () => import('@/views/onboarding/index.vue'), meta: { title: '首登漏斗' } },
      { path: '/behavior', name: 'Behavior', component: () => import('@/views/behavior/index.vue'), meta: { title: '行为埋点' } },
      { path: '/diagnosis', name: 'Diagnosis', component: () => import('@/views/diagnosis/index.vue'), meta: { title: '诊断任务' } },
      { path: '/agent', name: 'Agent', component: () => import('@/views/agent/index.vue'), meta: { title: 'Agent 会话' } },
      { path: '/reminders', name: 'Reminders', component: () => import('@/views/reminders/index.vue'), meta: { title: '站内消息' } },
      { path: '/system', name: 'System', component: () => import('@/views/system/index.vue'), meta: { title: '系统观测' } },
    ],
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.path === '/login') {
    if (auth.isAuthenticated) return { path: '/overview' };
    return true;
  }
  if (!auth.isAuthenticated) return { path: '/login' };
  document.title = `${(to.meta.title as string) || ''} · GEO 管理总后台`;
  return true;
});

export default router;
