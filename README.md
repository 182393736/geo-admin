# geo-admin — GEO 监测平台 Monorepo

> pnpm workspace monorepo。数据模型与接口设计**逆向自线上实测**（见 `docs/`）。

## 目录

```
apps/
├── web    @geo-admin/web   Vue3 + Arco Design + ECharts 控制台（当前 mock 驱动）
└── api    @geo-admin/api   Egg.js + Mongoose 后台（46 model + 3 schedule + 7 pipeline service + LLM 封装）
docs/                         接口分析 · 业务闭环 · 数据库设计 · 施工清单 · LLM 调用点提示词
```

## 开发

```bash
pnpm install
pnpm dev:web        # 前端（默认 mock 数据）
pnpm dev:api        # 后端（需 MONGO_URL / DEEPSEEK_API_KEY）
```

## 前端接真实后端

```bash
cp apps/web/.env.example apps/web/.env.local
# 设置 VITE_USE_MOCK=false + VITE_API_BASE / VITE_ARTICLE_BASE
```

API 契约层在 `apps/web/src/api/`（types.ts 与线上 49 端点实测响应逐字段对齐）。

## 后端关键文档

- 建表与数据流向：`docs/数据库设计文档.md`（配合 `apps/api/app/model/*.js`）
- 每日流水线：`apps/api/app/schedule/*.js`（00:30 展槽 → 04:00 解析聚合 → 05:00 报告）
- 所有 LLM 调用（DeepSeek）的提示词与输出结构：`docs/LLM调用点设计与提示词.md`
