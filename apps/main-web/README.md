# @geo-admin/main-web —— 官网首页（对标 geo.timus.cn 像素级复刻）

Nuxt 3 官网落地页，SSR 打开，可直接做 SEO。

## 启动

```bash
pnpm --filter @geo-admin/main-web dev     # 开发模式 :3000
pnpm --filter @geo-admin/main-web build   # 产物在 .output （nitro node 服务）
pnpm --filter @geo-admin/main-web generate # 静态生成（部署到 nginx/静态边缘）
```

## 页面结构（对标原站 11 段截图复刻）

```
SiteNav                导航（logo + 菜单 + CTA）
├ HeroSection          大标题 / 提示词表单 / 快速填充 / 4 大数据指标
├ PartnershipSection   战略合作（新华社重点实验室）
├ ClosedLoopSection    5 步闭环标签 + 仿真预览卡
├ EffectsSection       3 个真实效果案例（已脱敏）
├ MonitoringSection    中立监测 + 左文案 + 右监测产出 mock
├ WritingSection       循证写作 Agent（暗色面板 + 聊天框）
├ SourcesSection       引用源热力图 + 本期洞察
├ ChannelsSection      11万+ 渠道名单网格
├ DiagnosisSection     单次诊断 · AI 诊断报告（暗色 + 雷达图）
├ AgencySection        代理/多品牌工作台条
├ ContentHubSection    研究与内容 3 卡（报告/文章/资讯）
├ CTASection           从"看见"，到被 AI 引用（双 CTA）
├ ArticlesSection      最新文章与资讯（9 卡片 + 12 条链接）
├ FAQSection           常见问题（5 问手风琴）
└ SiteFooter           深色 footer
```

## SEO 要点

- `ssr: true`（Nuxt 3 默认 SSR，首屏就带完整 text，适合爬虫）
- `nuxt.config.ts` 里塞了 meta description/keywords/og
- 之后加 `sitemap.xml`、`robots.txt`、JSON-LD 可放 `public/` 或 `server/routes/`
- 图片资源若在 `public/`，会被 Nitro 原样输出，方便构建时静态部署

## 目前还没做的（有意留空）

- 真实申请/诊断接口（提交时直接跳 `/register`，可改成调 `apps/api` 的 `/user/diagnosis/start`）
- 各 `/pricing`、`/articles`、`/news` / `/contact` 等二级页（已经做了占位，路由防止404，但内容是空的）
- 字体防盗链（原版用了自定义字体，用系统字回退）；如需完全一致可自行购买
