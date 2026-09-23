export default defineNuxtPlugin(() => {
  try {
    if (localStorage.getItem('hanyuai-site-theme') === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch { /* ignore */ }
})
