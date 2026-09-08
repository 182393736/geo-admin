# @geo-admin/gen-test —— 端到端测试程序

网页添加测试任务 → Playwright 逐步执行「登录 → 首登建档 → 后台采集前数据展示验证」→ 一键删除任务数据。

## 定位

- 手动在网页里添加任务：登录账号 + 密码 + 首次用户输入（品牌描述）
- 应用用 Playwright 打开浏览器，一步步执行页面交互直到后台，逐页验证采集前真实数据展示
- 任务完成后可手动删除：任务记录 + 步骤日志/截图 + 该任务在 gen-api 业务库创建的账号/品牌/订阅等数据

## 运行

```bash
# 依赖服务需先就绪（见根 README）：
#   gen-api(:7001)、gen-user-dash(:5173)、gen-user-site(:3002)
pnpm --filter @geo-admin/gen-test exec playwright install chromium   # 首次装浏览器
pnpm --filter @geo-admin/gen-test run dev                             # 默认 http://localhost:8787
```

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `PORT` | `8787` | 网页/API 端口 |
| `TEST_MONGO_URL` | `mongodb://127.0.0.1:27017/geo_dev` | 复用 gen-api 的 MongoDB（任务记录与业务数据同库） |
| `DASH_URL` | `http://127.0.0.1:5173` | 用户后台 |
| `SITE_URL` | `http://localhost:3002` | 官网（Nuxt，注意绑定 localhost） |
| `API_URL` | `http://127.0.0.1:7001` | gen-api |
| `ARTIFACTS_DIR` | `apps/gen-test/data/artifacts` | 截图产物目录 |

## 执行流程（steps.js）

1. 打开后台登录页 → 填账号密码 → 登录
2. 落点判断：无品牌 → 官网 `/trial`（吸收 `#token`）→ 提交品牌 → 等 SSE 分析 → 确认监控问题 → 报告卡 → 回控制台；有品牌 → 直接进后台
3. 后台逐页验证采集前真实数据：概览 / 套餐（免费体验版·4 档）/ 名片（品牌名·剩余修改）/ 口碑监控问题（0 行）/ 识别管理 / 排名监控问题（≥3 行）/ 信源库（≥15 家）
4. 每步写日志 + 截图；执行结束记录 `user_id`（JWT sub）与 `brand_id` 作为删除锚点

## 删除清理（cleanup.js）

按任务记录的 `user_id`/`brand_id` 锚点，清理 40+ 个业务集合（users、brands、subscriptions、credit_accounts、monitor_queries、onboarding_*、publish/payment 订单等），再删截图目录与任务记录。只删该任务创建的数据，绝不越界。
