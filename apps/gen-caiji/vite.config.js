import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// 渲染层构建配置（Electron 主进程 / 预加载脚本不经过 vite，直接用 node 运行）
export default defineConfig({
  base: './', // 打包后供 Electron file:// 加载，资源走相对路径
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src/renderer', import.meta.url)) },
  },
  server: {
    port: 5190,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
