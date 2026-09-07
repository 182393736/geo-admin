import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard/overview',
    children: [
      {
        path: '/dashboard/overview',
        name: 'Overview',
        component: () => import('@/views/overview/index.vue'),
        meta: { title: '概览' },
      },
      // 排名 - 9个子页面
      {
        path: '/dashboard/ai-index',
        name: 'Ranking',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: 'AI排名透视' },
      },
      {
        path: '/dashboard/ai-index/competitor',
        name: 'RankingCompetitor',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: 'AI竞品透视' },
      },
      {
        path: '/dashboard/ai-index/citation',
        name: 'RankingCitation',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: '引用源追溯' },
      },
      {
        path: '/dashboard/ai-index/source-pref',
        name: 'RankingSourcePref',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: '信源平台偏好' },
      },
      {
        path: '/dashboard/ai-index/source-intel',
        name: 'RankingSourceIntel',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: '引用源洞察' },
      },
      {
        path: '/dashboard/ai-index/question-mgmt',
        name: 'RankingQuestionMgmt',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: '监控问题管理' },
      },
      {
        path: '/dashboard/ai-index/recognition-mgmt',
        name: 'RankingRecognitionMgmt',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: '监控识别管理' },
      },
      {
        path: '/dashboard/ai-index/snapshot',
        name: 'RankingSnapshot',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: '搜索快照下载' },
      },
      {
        path: '/dashboard/ai-index/export',
        name: 'RankingExport',
        component: () => import('@/views/ranking/index.vue'),
        meta: { title: '导出品牌透视报告' },
      },
      // 口碑 - 5个子页面
      {
        path: '/dashboard/sentiment',
        name: 'Sentiment',
        component: () => import('@/views/sentiment/index.vue'),
        meta: { title: 'AI口碑分析' },
      },
      {
        path: '/dashboard/sentiment/citation',
        name: 'SentimentCitation',
        component: () => import('@/views/sentiment/citation.vue'),
        meta: { title: '引用源追溯' },
      },
      {
        path: '/dashboard/sentiment/question-mgmt',
        name: 'SentimentQuestionMgmt',
        component: () => import('@/views/sentiment/question-mgmt.vue'),
        meta: { title: '监控问题管理' },
      },
      {
        path: '/dashboard/sentiment/recognition-mgmt',
        name: 'SentimentRecognitionMgmt',
        component: () => import('@/views/sentiment/recognition-mgmt.vue'),
        meta: { title: '监控识别管理' },
      },
      {
        path: '/dashboard/sentiment/snapshot',
        name: 'SentimentSnapshot',
        component: () => import('@/views/sentiment/snapshot.vue'),
        meta: { title: '搜索快照下载' },
      },
      // 优化 - 4个子页面
      {
        path: '/dashboard/media-library',
        name: 'Optimize',
        component: () => import('@/views/optimize/source-library.vue'),
        meta: { title: '信源库' },
      },
      {
        path: '/dashboard/media-library/publish',
        name: 'OptimizePublish',
        component: () => import('@/views/optimize/publish.vue'),
        meta: { title: '发布稿件' },
      },
      {
        path: '/dashboard/media-library/records',
        name: 'OptimizeRecords',
        component: () => import('@/views/optimize/records.vue'),
        meta: { title: '发稿记录' },
      },
      {
        path: '/dashboard/media-library/tracking',
        name: 'OptimizeTracking',
        component: () => import('@/views/optimize/tracking.vue'),
        meta: { title: '稿件追踪' },
      },
      // AGENT
      {
        path: '/dashboard/new-agent',
        name: 'Agent',
        component: () => import('@/views/agent/new-chat.vue'),
        meta: { title: 'AGENT' },
      },
      {
        path: '/dashboard/new-agent/knowledge',
        name: 'AgentKnowledge',
        component: () => import('@/views/agent/knowledge.vue'),
        meta: { title: 'Agent知识库' },
      },
      {
        path: '/dashboard/new-agent/articles',
        name: 'AgentArticles',
        component: () => import('@/views/agent/articles.vue'),
        meta: { title: '稿件库' },
      },
      // 诊断
      {
        path: '/dashboard/report-center',
        name: 'Diagnosis',
        component: () => import('@/views/diagnosis/index.vue'),
        meta: { title: '诊断' },
      },
      // 套餐
      {
        path: '/dashboard/plan-upgrade',
        name: 'Pricing',
        component: () => import('@/views/pricing/index.vue'),
        meta: { title: '套餐' },
      },
      // 用户菜单（pixel-clone 入口占位）
      {
        path: '/dashboard/profile',
        name: 'Profile',
        component: () => import('@/views/placeholder/index.vue'),
        meta: { title: '个人资料', icon: '👤' },
      },
      {
        path: '/dashboard/support',
        name: 'Support',
        component: () => import('@/views/placeholder/index.vue'),
        meta: { title: '联系客服', icon: '💬' },
      },
      // 品牌 - 4个子页面
      {
        path: '/dashboard/brand-card',
        name: 'Brand',
        component: () => import('@/views/brand/index.vue'),
        meta: { title: '名片' },
      },
      {
        path: '/dashboard/brand-card/products',
        name: 'BrandProducts',
        component: () => import('@/views/brand/index.vue'),
        meta: { title: '产品' },
      },
      {
        path: '/dashboard/brand-card/competitors',
        name: 'BrandCompetitors',
        component: () => import('@/views/brand/index.vue'),
        meta: { title: '竞品' },
      },
      {
        path: '/dashboard/brand-card/wiki',
        name: 'BrandWiki',
        component: () => import('@/views/brand/index.vue'),
        meta: { title: '知识库' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

// 登录守卫 + 首次分析引导：
//  - 无 token 进登录页；401 后 http.ts 会自动跳出
//  - 已登录但无品牌（首次未分析）→ 跳到官网 /trial（Nuxt 站，本应用不再自建 /trial 页）
//  - 已有品牌 → 正常进入工作台
import { useAuthStore } from '@/stores/auth';
import { siteTrialUrl } from '@/utils/site';

/** 无品牌 → 整页跳转到官网 /trial（Nuxt），携带 token 免二次登录 */
function goToTrial(auth: ReturnType<typeof useAuthStore>) {
  window.location.assign(siteTrialUrl(auth.token));
  return false;
}

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (to.path === '/login') {
    if (auth.isAuthenticated) {
      await ensureBrands(auth);
      return auth.hasBrand ? { path: '/dashboard/overview' } : goToTrial(auth);
    }
    return true;
  }
  if (!auth.isAuthenticated) return { path: '/login' };

  await ensureBrands(auth); // 刷新/F5 后会话恢复：从后端拉一次品牌列表

  // 旧书签直接访问后台 /trial：有品牌回工作台，无品牌去官网站
  if (to.path === '/trial') {
    return auth.hasBrand ? { path: '/dashboard/overview' } : goToTrial(auth);
  }
  if (!auth.hasBrand) return goToTrial(auth);

  document.title = `${(to.meta.title as string) || ''} · GEO 管理平台`;
  return true;
});

/** 会话恢复兜底：token 在但品牌列表未加载时拉取一次（失败不阻塞路由） */
async function ensureBrands(auth: ReturnType<typeof useAuthStore>) {
  if (auth.brandsLoaded) return;
  try {
    await auth.refreshBrands();
  } catch {
    auth.brandsLoaded = true; // 网络异常时视为无品牌，由 /trial 页内自行兜底
  }
}
