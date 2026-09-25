/**
 * 始终按 domain + path 拉取 CMS pageData。
 * 有发布页则写入 useSitePage；无则保持 null，前台走静态兜底。
 */
export default defineNuxtPlugin(async () => {
  if (!import.meta.server) return

  const event = useRequestEvent()
  const route = useRoute()

  const host = event?.node?.req?.headers?.host || 'localhost'
  const domain = resolveDomain(host)
  const path = route.path || '/'

  const sitePage = useSitePage()
  const payload = await fetchSitePage(domain, path)
  sitePage.value = payload

  // page 可能为 null（路径无 CMS 页，仅有 site）；条件勿用 page.seo 短路，否则 site.meta 为真时仍会读 page.seo → 500
  if (payload?.page || payload?.site?.meta) {
    const seo = payload.page?.seo || {}
    const meta = payload.site?.meta || {}
    useHead({
      title: seo.title || payload.page?.title || meta.title || payload.site?.name,
      meta: [
        { name: 'description', content: seo.description || meta.description || '' },
        { name: 'keywords', content: seo.keywords || meta.keywords || '' },
      ],
    })
  }
})
