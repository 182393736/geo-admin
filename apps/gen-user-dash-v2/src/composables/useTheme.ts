import { computed, onMounted, ref } from 'vue'

const STORAGE_KEY = 'geo-v2-theme'

type ThemeMode = 'light' | 'dark'

const mode = ref<ThemeMode>('light')
let inited = false

function applyDom(next: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', next === 'dark')
  root.style.colorScheme = next
}

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'dark' || v === 'light') return v
  } catch { /* ignore */ }
  return 'light'
}

/** 尽早同步 DOM，避免首屏闪白 */
export function initTheme() {
  if (inited) return
  inited = true
  mode.value = readStored()
  applyDom(mode.value)
}

export function useTheme() {
  onMounted(() => initTheme())

  const isDark = computed(() => mode.value === 'dark')

  function setTheme(next: ThemeMode) {
    mode.value = next
    applyDom(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch { /* ignore */ }
  }

  function toggleTheme() {
    setTheme(mode.value === 'dark' ? 'light' : 'dark')
  }

  return { mode, isDark, setTheme, toggleTheme }
}
