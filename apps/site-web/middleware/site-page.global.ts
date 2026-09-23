/**
 * 客户端路由切换时刷新 CMS pageData（与 SSR 插件对齐）。
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const sitePage = useSitePage()
  const domain =
    sitePage.value?.site?.domain ||
    (import.meta.client ? window.location.hostname : 'localhost')

  const payload = await fetchSitePage(domain, to.path || '/')
  sitePage.value = payload

  if (payload?.page) {
    useHead({
      title: payload.page.seo?.title || payload.page.title || payload.site.name,
      meta: [
        { name: 'description', content: payload.page.seo?.description || '' },
        { name: 'keywords', content: payload.page.seo?.keywords || '' },
      ],
    })
  }
})
