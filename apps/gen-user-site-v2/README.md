# gen-user-site-v2

HANYUAI GEO助手官网 v2 —— 参照 `hanyuai-shadcn` 设计稿，基于 Nuxt 3 实现。

## 开发

```bash
# 在仓库根目录
pnpm install
pnpm dev:site-v2
```

打开 http://127.0.0.1:6010

## 环境变量（可选）

| 变量 | 说明 | 默认 |
|------|------|------|
| `NUXT_PUBLIC_CONSOLE_URL` | 「登录」跳转控制台 | `http://127.0.0.1:5180` |
| `NUXT_PUBLIC_API_BASE` | API 前缀 | `/geo-api` |
| `NUXT_GEO_API_TARGET` | 代理到 gen-api | `http://127.0.0.1:6001` |
