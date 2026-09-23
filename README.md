# geo-admin — GEO 监测平台 Monorepo

> pnpm workspace monorepo。数据模型与接口设计**逆向自线上实测**（见 `docs/`）。

## 目录

```
apps/
├── geo-user-dash / geo-user-dash-v2   用户后台控制台（工作台）
├── geo-api                            Egg.js + Mongoose 业务 API
├── site-web / site-admin / site-server  用户官网 + CMS（自 site-manage 迁入）
├── geo-user-site / geo-user-site-v2   ⚠️ DEPRECATED 旧官网
├── geo-test                           端到端测试程序
└── geo-admin                          管理员总后台
packages/
├── geo-agent   首登分析 Agent
├── contracts   共享契约包
└── site-shared 官网/CMS 共享类型（@site-manage/shared）
scripts/        本地一键启动与端口约定
docs/           接口分析 · 域名约定 · 业务闭环等
```

> **用户网页端**：`apps/site-web`（CMS：`site-admin` / `site-server`）。见 [`docs/site-apps.md`](./docs/site-apps.md)。  
> 本仓库 `geo-user-site*` 已标记过期；旧站请用 `pnpm dev:site`。

## 环境（local / test / prod）

**改域名只改** [`config/environments.json`](./config/environments.json)，然后：

```bash
pnpm env:local   # 本地（dev 命令会自动执行）
pnpm env:test    # 测试服 test-geo-*.hanyuai.com
pnpm env:prod    # 生产
```

脚本会写出各应用 `.env`，一般不用手填变量。详情见 [`docs/domains.md`](./docs/domains.md)。

| 用途 | local | test | prod |
|------|-------|------|------|
| 用户官网 | `http://localhost:5003`（site-web） | `test-geo.hanyuai.com` | `geo.hanyuai.com` |
| 用户后台 | `http://127.0.0.1:5180` | `test-geo-user-dash.hanyuai.com` | `geo-user-dash.hanyuai.com` |
| API | `http://127.0.0.1:6001` | `test-geo-api.hanyuai.com` | `geo-api.hanyuai.com` |
| 管理总后台 | `http://localhost:6004` | `test-geo-admin.hanyuai.com` | `geo-admin.hanyuai.com` |

## Docker 一键部署

先 `pnpm env:test` 或 `pnpm env:prod` 写出域名，再 compose：

```bash
# API（含 Mongo）
cd apps/geo-api && docker compose up -d --build

# 用户后台
cd apps/geo-user-dash && docker compose up -d --build

# 官网已废弃 —— 请用 site-manage-monorepo/apps/web
```

各目录另有 `DOCKER.md`。

## 开发

```bash
pnpm install
pnpm env:local      # 可选；下面的 dev:* 会自动执行
pnpm dev:all        # ★ 一键：Mongo(内存,6007) → geo-api(:6001) → dash-v2(:5180) → 测试(:6005) → 管理(:6004)
                    #   官网 CMS：另开 pnpm dev:site（site-web:5003 / site-admin:5002 / site-server:5001）
pnpm dev:site       # 官网三端并行（迁入的 site-*）
pnpm dev:site-web   # 仅官网 Nuxt :5003
pnpm dev:web-v2     # 用户后台 v2（:5180）
pnpm dev:api        # geo-api（:6001）
pnpm seed:cms       # CMS 演示数据
```

### 本地端口一览

| 端口 | 服务 |
|------|------|
| 6001 | geo-api |
| 5180 | geo-user-dash-v2 用户后台（测试程序默认） |
| 6002 | geo-user-dash v1（旧） |
| 5003 | apps/site-web 用户官网 |
| 5002 | apps/site-admin CMS 管理端 |
| 5001 | apps/site-server CMS API |
| 6004 | geo-admin 管理总后台 |
| 6005 | geo-test |
| 6006 | geo-caiji Vite |
| 6007 | MongoDB 内存实例（dev:all） |

## 本地端到端测试（完整操作指南）

测试程序 `geo-test` 的作用：在网页里添加测试任务（账号密码 + 首次用户输入），
由 Playwright 打开浏览器一步步执行「登录 → 首登建档 → 后台采集前数据展示验证」，
结束后可一键删除该任务产生的所有数据（任务记录 + 日志截图 + 业务库数据）。

### 1. 前置条件

- Node.js ≥ 20、pnpm（仓库用 corepack，`packageManager` 已锁定 9.12.0）
- 首次安装浏览器：`pnpm --filter @geo-admin/geo-test exec playwright install chromium`

### 2. 一键启动全部服务

```bash
pnpm dev:all
```

等日志出现「✅ 服务启动完成」即可。打开测试程序网页：**http://localhost:6005**

> **LLM 代理（仅本地）**：默认供应商 Mistral 在大陆直连会 `fetch failed`。
> `pnpm dev:all` 会自动走本机 HTTP 代理 `http://localhost:1087`；
> 自定义代理：`LLM_PROXY=http://127.0.0.1:7890 pnpm dev:all`；强制直连（如香港/海外网络）：`LLM_PROXY= pnpm dev:all`。
> 生产环境不经过 `dev:all`，不设 `LLM_PROXY` 即直连，不受影响。

> 也可以分开启动：`pnpm dev:api` + `pnpm dev:web` + `pnpm dev:site` + `pnpm dev:test`，
> 但 **MongoDB 必须共用同一个库**（geo-test 删除数据时要清理 geo-api 的业务库），
> 因此推荐用 `pnpm dev:all` 或 `node apps/geo-api/scripts/dev-mongo-fixed.js`（固定端口 6007）。

### 3. 添加测试任务

在网页左侧表单填写：

| 字段 | 说明 | 示例 |
|---|---|---|
| 登录账号 | 被测账号 | `newbie`（无品牌，走建档）或已有品牌的账号 |
| 登录密码 | 被测账号密码 | `123456` |
| 首次用户输入 | 品牌描述（喂给官网建档输入框） | `我的品牌叫「华南公共座椅源头工厂」，主营礼堂椅、课桌椅` |
| 每步截图 | 是否保留每步截图（任务详情可回看） | 勾选 |
| 有头模式 | 弹出真实浏览器窗口、每步操作放慢，可肉眼观察整个交互过程（需本机有图形界面） | 按需勾选 |

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
  - 该任务在 geo-api 业务库创建的数据（账号 / 品牌 / 订阅 / 积分 / 监控词 / 订单 / 采集 / 指标等 40+ 集合，按执行时记录的 user_id / brand_id 锚点精确清理）
- 执行中的任务不能删除（避免清到一半）

### 7. 测试账号

| 账号 | 密码 | 说明 |
|---|---|---|
| `123456` | `123456` | 种子管理员（geo-api 启动自动创建） |
| `newbie` | `123456` | 无品牌新用户（`node apps/geo-api/scripts/e2e-seed-fresh-user.js` 创建），走建档链路 |
| 任意 | 自设 | 已有品牌账号：先在后台完成一次建档后即可复用 |

### 8. 已知注意事项

- **首登建档链路依赖 LLM**：仓库内置 dev key 余额耗尽时会报 `siliconflow 402`（步骤 1–5 仍通过，第 6 步快速失败并写明原因）。
  有有效 key 时：`SILICONFLOW_API_KEY=sk-xxx pnpm dev:api` 即可跑通完整建档。
- **官网 :6003 只在「无品牌」路径需要**；测已有品牌账号时官网不启动也能过。
- 依赖服务健康状态实时显示在测试程序网页顶部（DASH / SITE / API 三绿灯）。

## 前端接真实后端

用户后台 web（默认 mock 驱动，联调真实 API 时）：

```bash
cp apps/geo-user-dash/.env.example apps/geo-user-dash/.env.local
# 设置 VITE_USE_MOCK=false + VITE_API_BASE / VITE_ARTICLE_BASE（置空走 vite proxy → 127.0.0.1:6001）
```

API 契约层类型已收口到 `packages/contracts`（`apps/geo-user-dash/src/api/types.ts` 仅做重导出）。
后端 model 的枚举与常量可引用 `@geo-admin/contracts`，避免前后端各写一份。

官网 geo-user-site 通过同域代理 `/geo-api/**` 转发到 API（默认 `http://127.0.0.1:6001`，
用 `NUXT_GEO_API_TARGET` 覆盖）；静态部署时用 `NUXT_PUBLIC_API_BASE` 直指 API 地址。

## 后端关键文档

- 建表与数据流向：`docs/数据库设计文档.md`（配合 `apps/geo-api/app/model/*.js`）
- 每日流水线：`apps/geo-api/app/schedule/*.js`（00:30 展槽 → 默认 realtime 解析聚合 / 或 `PARSE_MODE=daily` 的 04:00 批 → 周日 05:00 周报）；盘点见 `docs/post-collection-automation.md`
- 所有 LLM 调用（DeepSeek）的提示词与输出结构：`docs/LLM调用点设计与提示词.md`

## 管理员总后台（geo-admin）

只读监控全平台，独立应用，Arco 浅色主题，默认单角色管理员（`users.is_superuser=true`）。

```bash
pnpm dev:admin     # http://localhost:6004，本地管理员账号 123456/123456
```

- **鉴权**：复用 `/user/login` 登录，后端 `/admin/**` 全部走 `jwtAuth + adminAuth`（非管理员 403）。
- **页面**：运营驾驶舱 / 用户 / 品牌 / 采集监控 / 解析监控 / LLM 调用 / 计费中心 / 内容与发稿 /
  报告中心 / 首登漏斗 / 行为埋点 / 诊断任务 / Agent 会话 / 站内消息 / 系统观测（共 15 页）。
- **接口**：`apps/geo-api/app/controller/admin.js`（聚合查询 + 采集失败槽重置等；契约在 `packages/contracts/src/admin.ts`）。
- **演示数据**（可选，让每个监控页有内容）：
  `MONGO_URL=mongodb://127.0.0.1:6007/geo_dev node apps/geo-api/scripts/seed-admin-demo.js`
- **冒烟脚本**（登录 → 14 页路由渲染 → 退出）：`node scripts/smoke-admin.cjs`
- 部分运营写操作（封号 / 改套餐 / 退款 / 渠道管理）暂未实现，后续按需放开。
