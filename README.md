# geo-admin — GEO 监测平台 Monorepo

> pnpm workspace monorepo。数据模型与接口设计**逆向自线上实测**（见 `docs/`）。

## 目录

```
apps/
├── gen-user-dash  @geo-admin/gen-user-dash  用户后台控制台（Vue3 + Vite + Pinia + Arco Design + ECharts）
├── gen-api        @geo-admin/gen-api        Egg.js + Mongoose 后台（46 model + 3 schedule + 7 pipeline service + LLM 封装）
├── gen-user-site  @geo-admin/gen-user-site  官网首页 / 首登分析站（Nuxt，/trial 为唯一建档入口）
└── gen-test       @geo-admin/gen-test       端到端测试程序（网页添加任务 → Playwright 执行 → 一键删除任务数据）
packages/
├── geo-agent   @geo-admin/geo-agent  首登分析 Agent（纯 CJS 零依赖，硅基流动 + 联网取证）
└── contracts   @geo-admin/contracts  共享契约包（枚举/常量/实体/zod schema/接口/JWT，单一事实源）
scripts/
└── dev-all.js  本地一键启动（仅限本地使用）
docs/           接口分析 · 业务闭环 · 数据库设计 · 施工清单 · LLM 调用点提示词
```

## 开发

```bash
pnpm install
pnpm dev:all        # ★ 本地开发一键启动（仅限本地使用！）
                    #   依次拉起：MongoDB(内存,42439) → gen-api(:7001) → 用户后台(:5173) → 官网(:3002) → 测试程序(:8787)
                    #   全部共用同一个 MongoDB，保证测试程序的「删除任务数据」能清理业务库
                    #   ⚠️ NODE_ENV=production 时脚本会拒绝启动
pnpm dev:web        # 用户后台 web（http://localhost:5173）
pnpm dev:api        # 后端（需 MONGO_URL，或 node scripts/dev-memory.js 内存库）
                    #   LLM/联网取证密钥已内置于 packages/geo-agent/src/dev-keys.js（私有仓库测试用，开箱即用）
                    #   生产：设置 SILICONFLOW_API_KEY / TAVILY_API_KEY 环境变量即自动覆盖内置值
pnpm dev:site       # 官网 gen-user-site（http://localhost:3002）
pnpm dev:test       # 端到端测试程序（http://localhost:8787，需先 playwright install chromium）
```

## 本地端到端测试（完整操作指南）

测试程序 `gen-test` 的作用：在网页里添加测试任务（账号密码 + 首次用户输入），
由 Playwright 打开浏览器一步步执行「登录 → 首登建档 → 后台采集前数据展示验证」，
结束后可一键删除该任务产生的所有数据（任务记录 + 日志截图 + 业务库数据）。

### 1. 前置条件

- Node.js ≥ 20、pnpm（仓库用 corepack，`packageManager` 已锁定 9.12.0）
- 首次安装浏览器：`pnpm --filter @geo-admin/gen-test exec playwright install chromium`

### 2. 一键启动全部服务

```bash
pnpm dev:all
```

等日志出现「✅ 服务启动完成」即可。打开测试程序网页：**http://localhost:8787**

> 也可以分开启动：`pnpm dev:api` + `pnpm dev:web` + `pnpm dev:site` + `pnpm dev:test`，
> 但 **MongoDB 必须共用同一个库**（gen-test 删除数据时要清理 gen-api 的业务库），
> 因此推荐用 `pnpm dev:all` 或 `node apps/gen-api/scripts/dev-mongo-fixed.js`（固定端口 42439）。

### 3. 添加测试任务

在网页左侧表单填写：

| 字段 | 说明 | 示例 |
|---|---|---|
| 登录账号 | 被测账号 | `newbie`（无品牌，走建档）或已有品牌的账号 |
| 登录密码 | 被测账号密码 | `123456` |
| 首次用户输入 | 品牌描述（喂给官网建档输入框） | `我的品牌叫「华南公共座椅源头工厂」，主营礼堂椅、课桌椅` |
| 每步截图 | 是否保留每步截图（任务详情可回看） | 勾选 |

点击「添加任务」。

### 4. 执行

- 点任务行上的 **▶ 执行**（或添加后直接确认执行）
- 同一时间只跑一个任务；执行中页面每 2 秒自动刷新进度
- 点 **查看** 打开任务详情抽屉：逐步日志 + 每步截图，点截图可放大

执行流程（16 步，可跳过不适用项）：

```
打开登录页 → 填账号密码 → 登录
  ├─ 无品牌（首次用户）→ 跳官网 /trial → 吸收 #token → 提交品牌 → 等 SSE 分析 → 确认监控问题 → 报告卡 → 回控制台
  └─ 已有品牌 → 直接进后台
→ 逐页验证采集前真实数据：
    概览页（品牌卡/采集状态）· 套餐页（免费体验版·4 档）· 名片页（品牌名·剩余修改）
    · 口碑监控问题（采集前 0 行）· 识别管理（品牌名）· 排名监控问题（≥3 行）· 信源库（19 家）
```

### 5. 查看结果

- 任务状态：`待执行` / `执行中` / `通过` / `失败`
- 失败时详情里会给出**具体失败的步骤与原因**（例如 LLM 402 余额不足会直接写明，不会干等超时）

### 6. 删除任务数据

- 点任务行的 **删除** → 确认 → 一次性清理：
  - 任务记录、步骤日志、截图目录
  - 该任务在 gen-api 业务库创建的数据（账号 / 品牌 / 订阅 / 积分 / 监控词 / 订单 / 采集 / 指标等 40+ 集合，按执行时记录的 user_id / brand_id 锚点精确清理）
- 执行中的任务不能删除（避免清到一半）

### 7. 测试账号

| 账号 | 密码 | 说明 |
|---|---|---|
| `123456` | `123456` | 种子管理员（gen-api 启动自动创建） |
| `newbie` | `123456` | 无品牌新用户（`node apps/gen-api/scripts/e2e-seed-fresh-user.js` 创建），走建档链路 |
| 任意 | 自设 | 已有品牌账号：先在后台完成一次建档后即可复用 |

### 8. 已知注意事项

- **首登建档链路依赖 LLM**：仓库内置 dev key 余额耗尽时会报 `siliconflow 402`（步骤 1–5 仍通过，第 6 步快速失败并写明原因）。
  有有效 key 时：`SILICONFLOW_API_KEY=sk-xxx pnpm dev:api` 即可跑通完整建档。
- **官网 :3002 只在「无品牌」路径需要**；测已有品牌账号时官网不启动也能过。
- 依赖服务健康状态实时显示在测试程序网页顶部（DASH / SITE / API 三绿灯）。

## 前端接真实后端

用户后台 web（默认 mock 驱动，联调真实 API 时）：

```bash
cp apps/gen-user-dash/.env.example apps/gen-user-dash/.env.local
# 设置 VITE_USE_MOCK=false + VITE_API_BASE / VITE_ARTICLE_BASE（置空走 vite proxy → 127.0.0.1:7001）
```

API 契约层类型已收口到 `packages/contracts`（`apps/gen-user-dash/src/api/types.ts` 仅做重导出）。
后端 model 的枚举与常量可引用 `@geo-admin/contracts`，避免前后端各写一份。

官网 gen-user-site 通过同域代理 `/geo-api/**` 转发到 API（默认 `http://127.0.0.1:7001`，
用 `NUXT_GEO_API_TARGET` 覆盖）；静态部署时用 `NUXT_PUBLIC_API_BASE` 直指 API 地址。

## 后端关键文档

- 建表与数据流向：`docs/数据库设计文档.md`（配合 `apps/gen-api/app/model/*.js`）
- 每日流水线：`apps/gen-api/app/schedule/*.js`（00:30 展槽 → 04:00 解析聚合 → 05:00 报告）
- 所有 LLM 调用（DeepSeek）的提示词与输出结构：`docs/LLM调用点设计与提示词.md`
