const STORAGE_KEY = 'hanyuai-site-theme'

export function useTheme() {
  const isDark = useState('site-is-dark', () => false)

  function apply(dark: boolean) {
    isDark.value = dark
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', dark)
      try {
        localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
      } catch { /* ignore */ }
    }
  }

  function init() {
    if (!import.meta.client) return
    let dark = false
    try {
      dark = localStorage.getItem(STORAGE_KEY) === 'dark'
    } catch { /* ignore */ }
    apply(dark)
  }

  function toggle() {
    apply(!isDark.value)
  }

  return { isDark, apply, init, toggle }
}
