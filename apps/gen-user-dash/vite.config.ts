import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ArcoResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ArcoResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ArcoResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: false,
    // 沙箱/远程预览域名放行（e2b 预览代理）
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
    // 开发代理：用户后台全部前缀 → Egg api（:7001）
    proxy: {
      '/user': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/api': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/payment': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/credit': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/publish': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/report': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/summary': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/competitor': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/reference_source': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/source_intelligence': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/snapshot': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/query': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/article': { target: 'http://127.0.0.1:7001', changeOrigin: true },
      '/diagnosis': { target: 'http://127.0.0.1:7001', changeOrigin: true },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },
});
