# 透镜GEO 首页 · Nuxt 3 复刻

对 `https://geo.timus.cn/` 首页的 **1:1 还原**，基于真实 Chromium 渲染结果反向构建。

## 还原策略

| 层面 | 做法 |
| --- | --- |
| **样式** | 原站三份 CSS（重置/设计变量、主样式表 `design.css`、随页面内联下发的组件级样式）**逐字节保留**，按原站 `<head>` 顺序在 `nuxt.config.ts` 中全局引入，层叠结果不变 |
| **结构** | DOM 层级与 class 名 100% 照搬渲染结果；用原始字符串解析保留 `viewBox` 等大小写敏感属性（用 DOM 解析器会把它小写化，导致 SVG 失效） |
| **资源** | 24 个图片资源从 data URI 还原为文件，放 `public/` |
| **交互** | 原站 `design-runtime.js` 的滚动渐显（`.rv` → `.in`）用 `composables/useReveal.ts` 重写；导航吸顶毛玻璃、闭环区块轮播改为 Vue 响应式实现（初始停在第 1 步，进入视口后每 7s 自动播放，尊重 `prefers-reduced-motion`） |

## 快速开始

在 monorepo 根目录：

```bash
pnpm install
pnpm dev:site       # http://localhost:3002
pnpm build:site
```

或在应用目录内：

```bash
cd apps/gen-user-site
pnpm dev            # http://localhost:3002
pnpm build && pnpm preview
```

## 页面

| 路由 | 布局 | 说明 |
| --- | --- | --- |
| `/` | `layouts/default.vue`（含导航 / 页脚） | 官网首页，14 个区块 |
| `/trial` | `layout: false` | 线上 `/trial` 是**独立的 React SPA**（Tailwind + 页面内联样式），与首页不是同一套样式体系，因此独立渲染、样式按需加载 |

## 目录

```
app.vue                        NuxtLayout + NuxtPage
layouts/default.vue            首页外壳（导航 / 页脚 / 背景 / Toast）+ 滚动渐显
assets/css/tokens.css          重置 + 设计变量 :root
assets/css/design.css          主样式表（原站 design.css，未改动）
assets/css/sections.css        组件级内联样式
public/                        24 个图片资源
components/SiteHeader.vue      导航（吸顶毛玻璃、登录、用户菜单）
components/SiteFooter.vue      页脚
components/SiteBackground.vue  背景装饰层
components/SiteToast.vue       Toast
components/home/*.vue          首页 14 个区块
components/trial/*.vue         /trial 页面区块
public/css/trial.css            /trial 样式（Tailwind + 页面内联样式，按需加载）
public/trial-assets/            /trial 字体与图片资源（71 个）
composables/useReveal.ts       滚动渐显（替代原站 design-runtime.js）
```

## 还原度验证

用 Chromium 在同一环境下分别渲染「原站渲染结果」与「Nuxt 复刻」，滚动触发全部懒加载与动画后做整页像素比对：

| 视口 | 原站高度 | Nuxt 高度 | 差异像素 | 差异率 |
| --- | --- | --- | --- | --- |
| 1440×900 桌面 | 10257px | 10257px | 108 | **0.0007%** |
| 1280×800 笔记本 | 10244px | 10244px | 225 | **0.0017%** |
| 820×1100 平板 | 12707px | 12707px | 156 | **0.0015%** |
| 390×844 手机 | 15453px | 15453px | 263 | **0.0031%** |

> 上表为首页。`/trial` 页面在四种视口下均为 **0 像素差异**（高度完全一致）。
> 页面含呼吸/流光等装饰动画，比对前需冻结动画，否则相位差会体现为像素噪声。

- **页面总高度在四种视口下完全一致**
- **可见文本完全一致**（385 行，相似度 100%）
- **控制台 / JS 错误：0**
- 残余差异仅为文字抗锯齿与 1px 描边的次像素级别差异

交互行为（已实测）：

| 行为 | 结果 |
| --- | --- |
| 滚动渐显 `.rv → .rv.in` | 首屏 0/55 → 滚到底 51/55（隐藏区块内 4 个保持未显现，与原站一致） |
| 导航吸顶毛玻璃 `.nav-fix.scrolled` | 顶部 `false` → 滚动 400px 后 `true` |
| 闭环区块轮播 | 初始第 1 步「透镜GEO · 中立监测」；点击第 4 步 → 标题与帧同步切到「透镜GEO · 精准发稿」 |
| 图片加载 | 25 张全部成功，0 失败 |
| 控制台 / JS 错误 | 0 |

比对方法：用同一 Chromium 分别渲染「线上页面的完整渲染快照」与本应用，
滚动触发全部懒加载与滚动渐显后截取整页图，再做逐像素 diff 与可见文本 diff。

## 已知取舍

- 原站首页第 4 个区块「闭环运行后的真实效果」带 `hidden` + `display:none`（原站按条件展示），复刻版保持同样隐藏状态
- 导航「单次诊断 / 定价 / 报告 / 文章 / 资讯 / 联系我们」已改写为站内路由 `/diagnose` 等，对应页面尚未实现
