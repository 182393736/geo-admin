# geo-admin — GEO 监测平台 Monorepo

> pnpm workspace monorepo。数据模型与接口设计**逆向自线上实测**（见 `docs/`）。

## 目录

```
apps/
├── api       @geo-admin/api        Egg.js + Mongoose 后台（46 model + 3 schedule + 7 pipeline service + LLM 封装）
├── main-web  @geo-admin/main-web   官网首页（手写复刻版）
└── gen-site  @geo-admin/gen-site   官网首页（对照线上真实样式表逐像素复刻）
packages/
└── geo-agent @geo-admin/geo-agent  首登分析 Agent（纯 CJS 零依赖，硅基流动 + 联网取证）
docs/                         接口分析 · 业务闭环 · 数据库设计 · 施工清单 · LLM 调用点提示词
```

## 开发

```bash
pnpm install
pnpm dev:api        # 后端（需 MONGO_URL / SILICONFLOW_API_KEY，或 node scripts/dev-memory.js 内存库）
pnpm dev:site       # 官网 gen-site（http://localhost:3002）
```

## 前端接真实后端

官网 gen-site 通过同域代理 `/geo-api/**` 转发到 API（默认 `http://127.0.0.1:7001`，
用 `NUXT_GEO_API_TARGET` 覆盖）；静态部署时用 `NUXT_PUBLIC_API_BASE` 直指 API 地址。

## 后端关键文档

- 建表与数据流向：`docs/数据库设计文档.md`（配合 `apps/api/app/model/*.js`）
- 每日流水线：`apps/api/app/schedule/*.js`（00:30 展槽 → 04:00 解析聚合 → 05:00 报告）
- 所有 LLM 调用（DeepSeek）的提示词与输出结构：`docs/LLM调用点设计与提示词.md`
