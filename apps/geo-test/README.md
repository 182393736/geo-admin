# @geo-admin/geo-test —— 端到端测试程序

网页添加测试任务 → Playwright 逐步执行「登录 dash-v2 → /trial 首登建档 → 后台采集前数据验证」→ 一键删除任务数据。

## 本地依赖（全部本机）

| 服务 | 地址 | 启动 |
|------|------|------|
| geo-api | `http://127.0.0.1:6001` | `pnpm dev:api` 或 `pnpm dev:all` |
| 用户后台 v2 | `http://127.0.0.1:5180` | `pnpm dev:web-v2` 或 `pnpm dev:all` |
| 用户前台 | `http://localhost:5003` | `site-manage-monorepo` 里 `pnpm dev:web`（探活用，首登在 dash-v2） |
| 管理总后台 | `http://localhost:6004` | `pnpm dev:admin` 或 `pnpm dev:all` |
| 测试程序 | `http://localhost:6005` | 见下 |

域名由根目录 `pnpm env:local` 写入 `apps/geo-test/.env`，默认已是上表。

## 运行

```bash
# 终端 1：geo-admin（api + dash-v2 + admin + geo-test）
cd /path/to/geo-admin
pnpm env:local
pnpm --filter @geo-admin/geo-test exec playwright install chromium   # 首次
pnpm dev:all        # 或分别: pnpm dev:api & pnpm dev:web-v2 & pnpm dev:admin & pnpm dev:test

# 终端 2：用户前台（可选，依赖探活）
cd /path/to/site-manage-monorepo
pnpm env:local && pnpm dev:web
```

打开 http://localhost:6005 添加任务并执行。

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `PORT` | `6005` | 网页/API 端口 |
| `TEST_MONGO_URL` | 与 geo-api 同库 | `dev:all` 注入 `mongodb://127.0.0.1:6007/geo_dev` |
| `DASH_URL` | `http://127.0.0.1:5180` | 用户后台 v2 |
| `SITE_URL` | `http://localhost:5003` | 用户前台（site-manage） |
| `API_URL` | `http://127.0.0.1:6001` | geo-api |
| `ADMIN_URL` | `http://localhost:6004` | 管理总后台 |

## 执行流程（steps.js）

1. 打开 dash-v2 `/login` → 填账号密码 → 登录
2. 无品牌 → `/trial` 建档：填品牌 → SSE 分析 → 确认监控 → 报告卡 → 前往控制台概览；有品牌 → 直接进后台
3. **可选多品牌**：填「品牌 2」时，侧栏品牌切换 →「添加新品牌」→ `/trial?from=add_brand` → 再建档 → 断言面板有 2 个品牌
4. 后台验证：概览 / 套餐 / 名片 / 监控问题 / 识别管理 / 信源库
5. `POST /user/generate_today` 生成采集任务 → 管理后台「采集监控」可见未采任务

> 首登已迁入 **dash-v2 `/trial`**，不再走旧 geo-user-site / `/trial` 跨站 `#token`。
