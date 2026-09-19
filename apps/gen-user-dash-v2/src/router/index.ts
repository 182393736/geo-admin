import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/login.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/trial',
      name: 'Trial',
      component: () => import('@/views/trial/index.vue'),
      meta: { title: '首登分析' },
    },
    {
      path: '/',
      component: AppShell,
      redirect: '/dashboard/brand-library',
      children: [
        { path: 'dashboard/overview', component: () => import('@/views/overview/index.vue'), meta: { title: '概览报告' } },
        { path: 'dashboard/report-templates', component: () => import('@/views/overview/templates.vue'), meta: { title: '报告模板' } },
        { path: 'dashboard/brand-library', component: () => import('@/views/brand/library.vue'), meta: { title: '品牌档案' } },
        { path: 'dashboard/brand-card', component: () => import('@/views/brand/card.vue'), meta: { title: '品牌名片' } },
        { path: 'dashboard/ai-index', component: () => import('@/views/ranking/ai-index.vue'), meta: { title: 'AI排名透视' } },
        { path: 'dashboard/competitor-insight', component: () => import('@/views/ranking/competitor.vue'), meta: { title: 'AI竞品透视' } },
        { path: 'dashboard/citation-sources', component: () => import('@/views/ranking/citation.vue'), meta: { title: '引用源追溯' } },
        { path: 'dashboard/source-preference', component: () => import('@/views/ranking/source-pref.vue'), meta: { title: '信源平台偏好' } },
        { path: 'dashboard/source-intelligence', component: () => import('@/views/ranking/source-intel.vue'), meta: { title: '引用源洞察' } },
        { path: 'dashboard/topic-management', component: () => import('@/views/ranking/topic-mgmt.vue'), meta: { title: '监控问题管理' } },
        { path: 'dashboard/monitor-recognition', component: () => import('@/views/ranking/recognition.vue'), meta: { title: '监控识别管理' } },
        { path: 'dashboard/downloads', component: () => import('@/views/ranking/downloads.vue'), meta: { title: '搜索快照下载' } },
        { path: 'dashboard/sentiment', component: () => import('@/views/sentiment/index.vue'), meta: { title: 'AI口碑分析' } },
        { path: 'dashboard/media-library', component: () => import('@/views/optimize/library.vue'), meta: { title: '信源库' } },
        { path: 'dashboard/media-library/publish', component: () => import('@/views/optimize/publish.vue'), meta: { title: '发布稿件' } },
        { path: 'dashboard/media-library/records', component: () => import('@/views/optimize/records.vue'), meta: { title: '发稿记录' } },
        { path: 'dashboard/media-library/tracking', component: () => import('@/views/optimize/tracking.vue'), meta: { title: '稿件追踪' } },
        { path: 'dashboard/new-agent', component: () => import('@/views/agent/chat.vue'), meta: { title: '新建对话' } },
        { path: 'dashboard/writing/:id?', component: () => import('@/views/agent/writing.vue'), meta: { title: '写作会话' } },
        { path: 'dashboard/new-agent/articles', component: () => import('@/views/agent/articles.vue'), meta: { title: '稿件库' } },
        { path: 'dashboard/report-center', component: () => import('@/views/diagnosis/index.vue'), meta: { title: '单次品牌诊断' } },
        { path: 'dashboard/plan-upgrade', component: () => import('@/views/pricing/index.vue'), meta: { title: '套餐' } },
        { path: 'dashboard/profile', component: () => import('@/views/profile/index.vue'), meta: { title: '个人资料' } },
        { path: 'dashboard/settings', redirect: '/dashboard/profile' },
      ],
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

async function ensureBrands(auth: ReturnType<typeof useAuthStore>) {
  if (auth.brandsLoaded) return
  let lastErr: unknown
  for (let i = 0; i < 3; i++) {
    try {
      await auth.refreshBrands()
      return
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 250 * (i + 1)))
    }
  }
  console.warn('[ensureBrands] 品牌列表拉取失败', lastErr)
}

router.beforeEach(async (to) => {
  if (to.meta.public) return true
  const auth = useAuthStore()

  if (to.path === '/login') {
    if (auth.isAuthenticated) {
      await ensureBrands(auth)
      if (!auth.brandsLoaded) return { path: '/dashboard/brand-library' }
      return auth.hasBrand ? { path: '/dashboard/brand-library' } : { path: '/trial' }
    }
    return true
  }

  if (!auth.isAuthenticated) {
    return { path: '/login', query: to.path === '/trial' ? { redirect: '/trial' } : undefined }
  }

  await ensureBrands(auth)

  // 首登 / 添加品牌：允许无品牌进入
  if (to.path === '/trial') return true

  if (!auth.brandsLoaded) {
    if (auth.activeBrandId || to.path.startsWith('/dashboard') || to.path === '/') return true
    return { path: '/trial' }
  }
  if (!auth.hasBrand) return { path: '/trial' }
  return true
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || '用户后台'
  document.title = `${title} · 透镜 GEO`
})

export default router
