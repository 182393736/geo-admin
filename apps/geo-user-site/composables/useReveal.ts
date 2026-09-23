/**
 * 还原原站 design-runtime.js 的滚动渐显：.rv 元素进入视口时加 .in
 */
export function useReveal() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('.rv'))
  if (!els.length) return

  const show = (el: HTMLElement) => el.classList.add('in')

  if (typeof IntersectionObserver === 'undefined') {
    els.forEach(show)
    return
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        show(e.target as HTMLElement)
        io.unobserve(e.target)
      }
    })
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 })

  els.forEach((el) => io.observe(el))

  // 兜底：若 IntersectionObserver 未正常触发，1.2s 后把「当前视口内」的元素显现，
  // 避免首屏内容不可见；视口外的继续留给滚动触发，保证渐显动画不被跳过
  setTimeout(() => {
    els.forEach((el) => {
      if (el.classList.contains('in')) return
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) show(el)
    })
  }, 1200)
}
