import { defineConfig } from 'tsup';

// 双格式输出：gen-api / geo-agent / 采集程序（Node CJS require）+ 前端（Vite/Nuxt ESM + 类型）
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'es2022',
  treeshake: true,
  splitting: false,
  sourcemap: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
});
