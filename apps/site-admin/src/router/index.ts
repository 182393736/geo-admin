import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/sites' },
    {
      path: '/sites',
      name: 'sites',
      component: () => import('@/views/sites/SiteList.vue'),
    },
    {
      path: '/pages',
      name: 'pages',
      component: () => import('@/views/pages/PageList.vue'),
    },
    { path: '/menus', redirect: '/pages' },
  ],
})

export default router
