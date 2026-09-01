# 透镜GEO 控制台接口分析报告

| 项目 | 内容 |
|---|---|
| 分析对象 | https://geo.timus.cn 产品控制台（登录后区域） |
| 测试账号 | 18782434390 |
| 当前品牌 | **佛山市宏祥家具实业有限公司**（入门版-月付，2026-09-20 到期） |
| 采集时间 | 2026-08-31 |
| 采集方式 | Playwright 无头 Chromium 真实登录 → 切换品牌 → 遍历 8 大侧边栏模块 + 38 个子路由 + 页面交互点击，全程监听网络请求 |
| 采集总量 | **749 次网络请求，去重后 49 个独立接口端点** |

---

## 一、系统架构总览

### 1.1 域名与服务划分

控制台流量分流到 **3 个域名**，职责清晰：

| 域名 | 角色 | 承载内容 |
|---|---|---|
| `geo.timus.cn` | 前端宿主 | Next.js + Payload（官网/SEO）+ Vite SPA（控制台），/version.json 版本探测 |
| `geoapi.timus.cn` | **主业务 API** | 监测数据、排名、口碑、报告、发稿、套餐、用户体系（REST + JSON） |
| `geoarticle.timus.cn` | **稿件/知识库 API** | 写作 Agent、品牌知识库、循证库、内测门禁（/api 前缀） |

### 1.2 鉴权机制

- 登录后签发 **JWT（HS256）**，存储于 localStorage 的 zustand `auth-storage` 中
- 负载示例：`{sub: 用户UUID, device_id: "unknown-device", is_superuser: false, type: "regular", exp: ...}`
- Token 有效期约 **7 天**；请求经 `Authorization: Bearer` 头发送
- Cookie 中仅有百度统计（`Hm_*`），鉴权不走 Cookie → **CSRF 风险低**

### 1.3 前端与路由

- 控制台为 Vite + React SPA，共 **34 个菜单项（33 个可见）**，由后端 `GET /user/menus` 下发（可见性受套餐级别控制）
- 路由全部挂在 `/dashboard/*` 下；另有 `/periodic-report`、`/onboarding`、`/trial`、`/diagnosis-report/:id` 等独立页
- 每个页面进入时调用 `POST /user/register/click {source, operation:"访问"}` 做**功能访问埋点**
- 每次路由切换轮询 `GET /version.json?t=时间戳` 做热更新检测

### 1.4 API 响应封装约定

```
主站 geoapi：  {"code": 200, "msg": "success", "message": "success", "data": {...}}
稿件站 geoarticle：直接返回业务 JSON（无统一封装）
错误处理：本次遍历中 49 个端点全部返回 200，无 4xx/5xx
```

观察：POST 接口即便无参数也传空 JSON `{}`；看板类接口把筛选条件（日期、平台、问题 ID）全部放 body；`platforms` 支持 `["doubao","deepseek","wenxin","qwen","yuanbao"]` 五大引擎。

---

## 二、页面 ↔ 路由 ↔ 接口 总映射

| 侧边栏 | 官方菜单（来自 /user/menus） | 路由（实测可直达） | 主要接口 |
|---|---|---|---|
| 概览（报告） | 情报总览 | /dashboard/overview | /report/cycle, /report/list, /report/latest |
| 品牌 | 名片 / 产品 / 竞品 / 知识库 | brand-card / brand-products / brand-competitors / brand-library | brand/intro, brand/products, brand/aliases, brand/library/* |
| 排名 | AI排名透视 / AI竞品透视 / 引用源追溯 / 信源平台偏好 / 引用源洞察 / 监控问题管理 / 监控识别管理 / 搜索快照下载 | ai-index / competitor-insight / citation-sources / source-preference / source-intelligence / topic-management / monitor-recognition / downloads | summary/*, competitor/insight, reference_source/stats, source_intelligence/*, snapshot/export/list, query/list, query-group/list |
| 口碑 | AI口碑分析 / 引用源追溯 / 监控问题管理 / 监控识别管理 / 搜索快照下载 | sentiment（+ 排名组路由 ?type=brand 复用） | summary/reputation_data, summary/ai_ranking_matrix |
| 优化 | 信源库 / 发布稿件 / 发稿记录 / 稿件追踪 | media-library / publish-article / publish-records / article-library | publish/media/facets, publish/media/list, publish/orders, publish/article/drafts, article/library |
| AGENT | 新建对话 / 新建稿件 / 稿件库 / 话题挖掘 / 工作记忆×3 | new-agent / new-writing / my-articles / topic-discovery / wiki-brand / wiki-company / wiki-competitor | articles, brand/wiki/tree, brand/evidence-library, credit/account |
| 诊断 | 单次品牌诊断 | /dashboard/report-center | diagnosis/tasks |
| 套餐 | 套餐 | /dashboard/plan-upgrade | payment/plans/grouped, payment/subscription/current |
| （隐藏）账号 | 计费与套餐 / 个人资料 | /dashboard/billing / /dashboard/settings | payment/orders, user/info |

> 快捷动作卡实测跳转：挖掘监控问题 → topic-discovery；AI 撰写稿件 → new-writing；信源库 → media-library；AI排名透视 → ai-index；品牌档案 → brand-library。

---

## 三、接口清单（49 个实测触发）

### 3.1 geoapi.timus.cn — 用户与配置（8 个）

| 方法 | 路径 | 说明 | 实测摘录 |
|---|---|---|---|
| GET | /user/brands | 品牌列表（左上切换器数据源） | 3 个品牌：食家缘汤锅府(pro,过期)、佛山宏祥家具(starter,active)、曲阳大艺园林(starter) |
| POST | /user/register/click | 模块访问埋点 | `{source:"报告",operation:"访问"}` |
| GET | /user/menus | 动态菜单（34 项，含 visible 标志） | 6.7KB |
| GET | /user/reminders | 站内提醒 | — |
| GET | /user/get_query_status | 当日采集任务状态 | `{list:{}, last_date:"2026-08-31 16:53:48"}` |
| GET | /user/brands/pending-order | 待支付订单检查 | — |
| GET | /user/info | 当前用户+品牌详情 | 含 phone、vip 级别、query_limit=8、aliases 等 |
| POST | /query-group/list | 监控问题分组 | `{query_type:"industry"}` |

### 3.2 geoapi.timus.cn — 监控问题（1 个）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /query/list?query_type=industry\|brand | 监控问题列表。industry=排名类问题（7 条，如"采购礼堂椅厂家推荐"），brand=口碑类（1 条"宏祥盛誉怎么样，口碑好不好"）。字段含 question_list（user_friendly/platform_query 双形态）、is_golden、task_id |

### 3.3 geoapi.timus.cn — 报告（2+1 个）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /report/cycle | 报告生成周期配置（周报周日、月报月末，可开关） |
| POST | /report/list | 周报 `{period_type:"weekly",limit:8}` / 月报 `{period_type:"monthly",limit:20}` 列表 |
| POST | /report/latest | 最新一期报告全文。佛山品牌返回 15KB payload，含 `trend/engines/metrics/monitor/sources/channels/competitors/terminals` 等 18 个模块键；overview_stats：8 监控问题、40 当日采集、188 引用源、3 竞品、采集完整率 100% |

### 3.4 geoapi.timus.cn — 排名/口碑分析 summary（7 个）

| 方法 | 路径 | 请求参数（实测） | 说明 |
|---|---|---|---|
| POST | /summary/mention_rate_trend | 日期段 + 5 引擎 + end=web | 品牌提及率趋势 |
| POST | /summary/top3_rate_trend | 同上 | Top3 推荐率趋势 |
| POST | /summary/first_position_rate_trend | 同上 | 首位推荐率趋势 |
| POST | /summary/full_ranking_matrix | `query_id[7 个] + group_id` | 全榜单矩阵（逐题×引擎位次） |
| POST | /summary/ai_ranking_matrix | `query_id[40150] + start_date` | 口碑评分矩阵：当日文心 100 分、通义 93.75、DeepSeek 75、元宝 56.25、豆包 50，综合 78.5（↑11.5） |
| POST | /summary/get_references | `platforms:[all]` | AI 回答引用的原始来源明细 |
| POST | /summary/reputation_data | `query_id+日期+platform` | 口碑明细（31KB 全量：原文引用、情感分、趋势） |

### 3.5 geoapi.timus.cn — 竞品与信源情报（7 个）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /competitor/insight | 竞品对比全景 173KB：mention/top3/first 三率、按 keyword 下钻、competitor_compare_list |
| POST | /reference_source/stats | 引用源统计：分页 + 排序（ref_count desc），汇总 total_ref_count、own_source_count、top5_share、platform_breakdown；单日 8.8KB / 区间 181KB |
| POST | /source_intelligence/source_trend | 信源趋势（top_n=10） |
| POST | /source_intelligence/engine_preference | 引擎取材偏好（本期 vs 上期对比） |
| POST | /source_intelligence/own_trend | 自有内容被引趋势 |
| POST | /source_intelligence/perspective | 源×问题透视热力图数据 |
| GET | /source_intelligence/topics | 监控问题清单（情报页筛选器） |

### 3.6 geoapi.timus.cn — 搜索快照（1 个）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /snapshot/export/list | 采集留痕截图列表，`photo_url` 指向 **阿里云 OSS 公网地址**（`geo-server.oss-cn-beijing.aliyuncs.com/screenshots/...`），按 exec_date+platform+query 组织 |

### 3.7 geoapi.timus.cn — 优化与发稿（5 个）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /publish/media/facets | 媒体库筛选维度（类型/行业/收录引擎等，5KB） |
| POST | /publish/media/list | 媒体列表：`display_mode=account, sort=cite-desc`，每页 20 条（19~98KB），含价格与被引统计 |
| POST | /publish/orders | 发稿历史：实测含成功（中国品牌网 850 积分）与失败（豆丁网，"媒体id输入错误"）订单，均回传 cite_count |
| POST | /publish/article/drafts | 待发草稿箱 `{size:50}` |
| POST | /article/library | AI 回答中抓到的文章库（稿件追踪页），可按 engine/query/日期/是否被引筛选 |

### 3.8 geoapi.timus.cn — 诊断/套餐/积分（5 个）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /diagnosis/tasks?page&size | 单次诊断任务列表（当前品牌为空，本账号另一品牌有记录） |
| GET | /payment/plans/grouped | 套餐价目表 13KB（分组展示用） |
| GET | /payment/subscription/current | 当前订阅：starter_monthly ¥79/月，2026-07-20~09-20，8/8 监控问题额度已用满 |
| GET | /payment/orders?limit | 充值/套餐订单流水（含 CP 前缀订单号，credit 支付） |
| GET | /credit/account | 积分钱包：余额 330 / 冻结 0 / 累计充值 3000 / 消费 2670（金币/银币双账户模型） |

### 3.9 geoarticle.timus.cn — 品牌档案·写作 Agent·稿件（8 个）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/beta/me?phone= | 内测门禁（注意：**手机号明文出现在 URL**） |
| GET | /api/brand/intro | 品牌介绍（行业/描述/话术脚本，AI 生成） |
| GET | /api/brand/products / aliases / competitors | 产品、别名、竞品配置 |
| GET | /api/brand/library/docs / links / text | 品牌资料库三类素材 |
| GET | /api/brand/wiki/tree | Agent 工作记忆树（品牌/公司/竞品 md） |
| GET | /api/brand/evidence-library?limit&since_days | 循证库（供写作 Agent 引用） |
| GET | /api/articles?brand_id&limit&uid | 稿件列表+状态计数（starting/running/awaiting_user/completed/failed） |

### 3.10 geo.timus.cn — 前端辅助（1 个）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /version.json?t= | 构建版本探测，每次路由跳转轮询，命中新版本即提示刷新 |

---

## 四、前端包中发现、本次未触发的写操作接口（45 个节选）

以下接口存在于 JS bundle，属增删改/支付/上传类，为避免改动账户数据**未执行**，列为完整画像：

- **监控配置**：`/query/add` `/query/update` `/query/delete` `/query/sort` `/query/batch_generalize`、`/query-group/save|move_query|delete`、`/user/generate_today`（手动触发当日采集）
- **写作 Agent**：`POST /api/article/start`（启动写作）、`/api/article/report/patch-draft`、`/ws/article`（**WebSocket 实时进度/对话流**）、`/api/brand/propose-topics`、`/api/brand/mining/trigger`、`/api/brand/library/docs/upload`、`/api/brand/wiki/clear`
- **发稿下单**：`/publish/...`（媒体库 "一键发布"）、`/summary/reference_source/tag_own_article`、`/reference_source/analyze|articles|media_accounts`
- **交易**：`/payment/order/create`、`/payment/upgrade/preview`、`/credit/plan/purchase`、`/credit/plan/upgrade`、`/credit/recharge/create`、`/credit/recharge/packs`
- **诊断**：`/diagnosis/order/create`、`/diagnosis/aliases/suggest`（对应官网 geo.timus.cn/diagnose 单次诊断产品）
- **账号**：`/user/change_password`、`/user/info/update`、`/user/company_industry_keywords`、`/snapshot/export/sync`

---

## 五、账户业务现状（从接口数据还原）

| 维度 | 数据 |
|---|---|
| 品牌 | 佛山市宏祥家具实业有限公司（别名：宏祥盛誉、宏祥家具；行业：公共家具制造；官网未设置） |
| 套餐 | 入门版-月付 ¥79/月，2026-09-20 到期（剩 20 天）；**监控问题额度 8/8 已用满** |
| 监控配置 | 排名类 7 题（礼堂椅/课桌椅厂家推荐等）+ 口碑类 1 题，均开启执行 |
| 竞争监测 | 3 个竞品（河北润华体育器材、澳舒健 OSJ 等在榜） |
| 口碑评分 | 综合 78.5 分（↑11.5）；通义 93.75 > 文心 100 > DeepSeek 75 > 元宝 56.25 > 豆包 50 |
| 积分钱包 | 可用 330，累计充值 3000、消费 2670 |
| 发稿历史 | 有成功订单（中国品牌网）与失败订单（豆丁网参数错误），cite_count 均为 0（尚未被引） |
| 采集留痕 | 每日按 question×平台生成截图存 OSS，可公开访问 |
| 报告 | 周报由 8/24-8/30 数据生成（8/31 05:05），模板"标准版"含 6 模块；采集完整率 100%（35/35 槽位） |

---

## 六、工程与安全观察

1. **【风险】手机号明文入 URL**：`GET /api/beta/me?phone=18782434390` —— 手机号会进入网关/CDN/浏览器历史日志，建议改 POST 或从 JWT 上下文取。
2. **【风险】留痕截图 OSS 公网直链**：`photo_url` 无签名过期参数，任何拿到 URL 的人可看（含竞品词、采集原文截图）。建议改签名 URL。
3. **【提示】JWT 7 天有效 + device_id="unknown-device"**：未做设备绑定；token 存 localStorage，依赖页面自身 XSS 防护。
4. **【良好】全站 HTTPS、统一农历**错误封装、功能埋点（register/click）完善、接口幂等参数（日期+query_id 显式传递）便于复现调试。
5. **性能提示**：信源/竞品页单次响应达 100~180KB JSON，建议分页压缩；/version.json 每跳必查可用 ETag 优化。
6. 双 API 域风格不统一（geoarticle 无 code 封装、参数靠 querystring），网关层可考虑收敛。

---

## 七、原始证据文件

# 附录（2026-08-31 增补）：接口覆盖度盘点

用前端 80 个 JS chunk 反编译出**接口面全集 118 个 HTTP 端点 + 2 个 WebSocket**，与本报告实测捕获比对：

| 口径 | 数量 | 说明 |
|---|---|---|
| 接口面全集 | 118 + 2WS | 来源：全部 chunk 字面量 + 动态拼接审查，清单见 `api-crawl-data/接口覆盖度盘点-原始清单.txt` |
| ✅ 实测捕获（只读遍历） | 40 | 本报告第三节 49 端点（含分页/参数变体） |
| 🔬 另经 curl 实测 | /user/login | POST `{account,password,client_type:"web"}` → `{accessToken:JWT(7d), user, brands[]}` |
| ◇ 前端声明、未触发 | 78 + 2WS | 见下分类 |

**未触发接口分类**（本报告数据库设计已为其建模，字段为推断）：

1. **鉴权族**（新发现路径）：`/user/captcha`(图形码)、`/user/send/sms`、`/user/verify/login`(短信登录)、`/user/register`、`/user/oem/register`、`/api/auth/logout`、`/user/change_password`
2. **导出族**：`/export/ranking_matrix`、`/export/competitor_xlsx`、`/export/competitor_report`、`/export/reputation_xlsx`、`/export/reference_source`、`/export/article_library`、`/snapshot/export/text`、`/snapshot/export/sync`
3. **发稿交易族**：`/publish/estimate`(估价)、`/publish/review`、`/publish/submit`、`/publish/order/cites`(单稿归因)、`/publish/order/republish`(重发)、`/publish/article/save|delete`
4. **监控配置写族**：`/query/add|update|delete|sort`、`/query/batch_generalize`、`/query-group/save|move_query|delete`、`/user/generate_today`
5. **知识库/写作族**：library upload、`wiki/clear|file|profile`、`/api/article/start` + **WS /ws/article**、`propose-topics`、`mining/trigger|status`、`/api/brand/overview|products/stats`
6. **交易族**：`/payment/order|order/create|upgrade/preview`、`/credit/recharge/packs|create`、`/credit/plan/purchase|upgrade`、`/credit/transactions`
7. **稿件追踪管理**：`/article/library/citations|import|update|delete`
8. **标注/修正**：`/competitor/name-corrections`、`/summary/reference_source/tag_own_article`、`/reference_source/analyze|articles|media_accounts`
9. **外部第三方**：官网免费试用走 **Dify 服务**（`/api/v1/sessions`、`/api/v1/bot/upload`、`/ws`，trialApiConfig），非自研接口

**浏览器抓包永远无法观测**（只能架构推断）：微信支付异步回调、媒体供应商收录回执、凌晨跑批 worker、LLM 解析管线、中立账号池调度。

---

# 七、原始证据文件（原文）

- 全部请求索引：`/home/user/api-crawl-data/api-calls*.json`（3 轮，共 749 条）
- 逐条响应正文：`/home/user/api-crawl-data/resp-*.txt`（按请求 ID 编号）
- 页面截图 40+ 张：`/home/user/api-crawl-data/shot-*.png`
- 会话状态（含 JWT，注意保密）：仅存于临时目录，未存入工作区

> 本次操作严格遵守只读原则：未执行任何下单、支付、删除、改写配置类动作；唯一的状态变更是模块访问埋点记录。
