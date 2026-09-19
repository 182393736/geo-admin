import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { installToast } from './lib/toast'
import { ingestConsoleToken } from './utils/site'
import { initTheme } from './composables/useTheme'
import './style.css'

ingestConsoleToken()
initTheme()

const app = createApp(App)
app.use(createPinia())
app.use(router)
installToast(app)
app.mount('#app')
