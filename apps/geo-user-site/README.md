# DEPRECATED — 已过期 / 无效

> **本应用不再作为用户网页端。**  
> 后续用户官网请使用仓库：**`site-manage-monorepo`** → `apps/web`  
> （配套：`apps/admin` 内容管理，`apps/server` CMS API）

| 状态 | 说明 |
|------|------|
| `pnpm dev` / `build` / `preview` | **直接失败**，防止误启动 |
| `pnpm run dev:legacy` | 仅紧急考古只读，禁止新功能 |

原说明见下方历史文档（保留备查，不再维护）。

---

# 透镜GEO 首页 · Nuxt 3 复刻（历史）

对 `https://geo.timus.cn/` 首页的 **1:1 还原**，基于真实 Chromium 渲染结果反向构建。

## 还原策略

| 层面 | 做法 |
| --- | --- |
| **样式** | 原站三份 CSS（重置/设计变量、主样式表 `design.css`、随页面内联下发的组件级样式）**逐字节保留**，按原站 `<head>` 顺序在 `nuxt.config.ts` 中全局引入，层叠结果不变 |
| **结构** | DOM 层级与 class 名 100% 照搬渲染结果；用原始字符串解析保留 `viewBox` 等大小写敏感属性（用 DOM 解析器会把它小写化，导致 SVG 失效） |
| **资源** | 24 个图片资源从 data URI 还原为文件，放 `public/` |
| **交互** | 原站 `design-runtime.js` 的滚动渐显（`.rv` → `.in`）用 `composables/useReveal.ts` 重写；导航吸顶毛玻璃、闭环区块轮播改为 Vue 响应式实现（初始停在第 1 步，进入视口后每 7s 自动播放，尊重 `prefers-reduced-motion`） |

## 快速开始（已废弃）

请改用 `site-manage-monorepo`。本目录默认脚本会退出；仅考古可用 `pnpm run dev:legacy`。
