import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const apiTarget = 'http://127.0.0.1:6001'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5180,
    host: true,
    proxy: {
      '/user': { target: apiTarget, changeOrigin: true },
      '/api': { target: apiTarget, changeOrigin: true },
      '/payment': { target: apiTarget, changeOrigin: true },
      '/credit': { target: apiTarget, changeOrigin: true },
      '/publish': { target: apiTarget, changeOrigin: true },
      '/report': { target: apiTarget, changeOrigin: true },
      '/summary': { target: apiTarget, changeOrigin: true },
      '/competitor': { target: apiTarget, changeOrigin: true },
      '/reference_source': { target: apiTarget, changeOrigin: true },
      '/source_intelligence': { target: apiTarget, changeOrigin: true },
      '/snapshot': { target: apiTarget, changeOrigin: true },
      '/query': { target: apiTarget, changeOrigin: true },
      '/article': { target: apiTarget, changeOrigin: true },
      '/diagnosis': { target: apiTarget, changeOrigin: true },
      '/export': { target: apiTarget, changeOrigin: true },
      '/agent': { target: apiTarget, changeOrigin: true },
      '/query-group': { target: apiTarget, changeOrigin: true },
    },
  },
})
