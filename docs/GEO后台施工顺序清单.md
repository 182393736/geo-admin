# GEO 后台从零搭建 · 逐步施工清单（含理由）

> 使用方法：从上往下按编号执行，每步都是独立可提交的最小改动（一次 MR 一步）。
> 表中 **「为什么」= 依赖理由**，若你想调整顺序，先看该列确认下游没东西等它。
> 表结构：见 `egg-geo-backend/app/model/*.js`（45 个 model 已写好）。

---

## W0 底座（先把地基打平，后面每一步都不再回头）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 1 | 基建 | egg 工程初始化 + egg-mongoose 插件 + config（MONGO_URL、platforms、rankWeights） | 没它后面全没法跑 |
| 2 | 基建 | 统一响应壳中间件 `{code,msg,data}` + 异常兜底 | 前端 49 个接口全是这个壳，一开始统一，省得 80 个 chunk flora 重构 |
| 3 | 建表 | `counters`（自增序列：`{_id, seq}`） | query_id/order 号全靠它；建晚了存量 id 会格式不一致 |
| 4 | 建表 | `users` | 一切记录的 user_id 外键源头 |
| 5 | 基建 | 密码加密（bcrypt）+ JWT 签发/校验中间件 | 下一步登录接口的前提 |
| 6 | 接口 | `POST /user/register`（手机号+密码+图形验证码） | 第一个用户入口 |
| 7 | 接口 | `GET /user/captcha` | 注册/登录的防刷前提 |
| 8 | 接口 | `POST /user/login` → `{accessToken, user, brands[]}` | 实测契约已锁定；**注意参数名是 `account`+`password`+`client_type`** |
| 9 | 建表 | `menu_configs`（灌入 34 条菜单种子，含 min_plan） | 登录后前端第一件事就是拉菜单；先备数据 |
| 10 | 接口 | `GET /user/info`（联查 users+brands+subscription） | 登录后所有页面都要拿它渲染用户态 |
| 11 | 接口 | `GET /user/menus`（按套餐过滤） | 配合 #9 |
| 12 | 建表 | `user_click_events` + `POST /user/register/click` | 每个页面打开都埋点；**从一开始就有行为数据，二次分析不用回头补** |
| ✅ 验收 | | Postman 跑通：注册→验证码→登录→info→menus | |

---

## W1 配置层（Onboarding 状态机 = 产品第一屏）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 13 | 建表 | `brands`（brand_id 用 UUID） | 实测线上就是 UUID；且多品牌切换器读它 |
| 14 | 建表 | `plans`（先只灌 1 行：入门版 query_limit=8） | W6 才做钱，但**额度约束从第一天就要生效**，否则用户建 100 个问题你收不住 |
| 15 | 建表 | `subscriptions` + 注册时免费体验自动插入（30 天） | 品牌的 status(active/expired) 由它驱动 |
| 16 | 建表 | `onboarding_tasks`（状态机表） | 线上 /user/info 返回的 `crawler_started_at/keyword_gen_started_at` 就是它的投影 |
| 17 | 建表 | `brand_profiles` | 爬虫+LLM 产物落点 |
| 18 | 建表 | `brand_aliases` ⚠️ | **必须在解析层上线前建好**——解析时"算不算提到你"全靠它，数据缺失会污染所有指标 |
| 19 | 建表 | `brand_products`、`mined_topics` | #17 的配套，一次生成多份产出 |
| 20 | 基建 | LLM 服务封装 🔗LLM-00 `service/llm.js`（结构化输出+schema校验+重试） | W1/W3/W7 三处都要用；先封装好 |
| 21 | 任务 | onboarding 异步任务 🔗LLM-01/02/03/04：crawl→keyword→query 三段，写 `onboarding_tasks` 各阶段时间戳 | 前端轮询 /user/info 渲染进度条的依据 |
| 22 | 接口 | `POST /user/brands/analyze`（收表单→建 brand→启任务→返 task_id） | Onboarding 起始接口 |
| 23 | 建表 | `monitor_queries`（**数字自增 query_id**，双形态 question_list） | 实测线上就是数字 ID（37935/40150）；双形态直接模仿线上契约 |
| 24 | 接口 | `GET /query/list?query_type=industry|brand` | 排名页/口碑页/管理页共同数据源 |
| 25 | 接口 | `POST /query/add`（**前置校验 subscription.query_limit**） | 额度卡点；线上就是这样（8/8） |
| 26 | 接口 | `POST /query/update | delete | sort` | 管理页增删改排 |
| 27 | 建表 | `query_groups` + `POST /query-group/save|move_query|delete|list` | 问题多了需要分组；矩阵接口也要 group 过滤 |
| 28 | 接口 | `POST /query/batch_generalize` 🔗LLM-06（同义归并） | 线上文章强调"语义归并 76% 坍塌"，这是它的落地口 |
| 29 | 接口 | `GET /api/brand/intro | aliases | products | competitors`（4读） | 品牌页 4 个子页 |
| 30 | 建表 | `competitor_registers` | 用户登记竞品（线上实测 3 个），报告竞对卡片的白名单 |
| 31 | 任务 | 品牌切换上下文（token 内 activeBrandId + 每接口强制 brand_id 归属校验） | 多品牌安全隔离必须第一天就内建 |
| ✅ 验收 | | 全流程：注册→填表单→5 分钟后出现 8 条问题+2 个别名+3 个竞品；品牌页各子页能看能改 | |

---

## W2 采集层（⚡ 系统心脏，别贪全引擎——先 1 个引擎全链路）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 32 | 建表 | `collect_tasks`（品牌×天，含 expected/actual/completeness） | 线上 overview 的"当日采集查询/完整率"从这里来 |
| 33 | 建表 | `collect_slots`（**唯一键 brand+date+query+platform+end**） | ⚠️ 一切统计的分母；唯一键让半夜重跑安全 |
| 34 | 基建 | 队列接入（Bull/Redis）：`geo.collect.slot` | 40 槽×N 品牌必须异步；schedule 只负责推任务 |
| 35 | 任务 | schedule `daily_collect`（00:30）：展开启用中问题×引擎 | 实测 model 已写好，直接搬 |
| 36 | 建表 | `raw_answers`（原文+`cited_urls[]`，`parsed:false` 标记） | ⚠️ **原文先落库再解析**——解析逻辑必然会升级重跑 |
| 37 | 建表 | `snapshots` + OSS 上传封装 | 留证是产品承诺（"过程可回放"） |
| 38 | 任务 | 采集 worker：豆包客户端（脱个性化 mock 账号池先 1 账号） | 先跑通 1 平台再横向加 4 个（接口各异） |
| 39 | 接口 | `GET /user/get_query_status`（slot 分组计数） | 前端轮询今日采集进度 |
| 40 | 接口 | `POST /user/generate_today` | 演示/补采/手动触发刚需 |
| 41 | 任务 | 其余 4 引擎客户端（文心/通义/DeepSeek/元宝）逐个接入 | 每加一个就在工地测 8 槽跑通 |
| 42 | 任务 | slot 状态回收：running 超时→fail；task 全槽终态→task.ok + 推解析事件 | 流水线衔接点 |
| ✅ 验收 | | 早 9 点看 collect_tasks：expected=actual=35/35，OSS 能打开截图 | |

---

## W3 解析层（决定"准不准"的事，全部建完再进 W4）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 43 | 建表 | `brand_entities`（自动发现竞品池） | 实测品牌只登记 3 个竟品，系统跑出 229 个实体——这张表就是产品亮点 |
| 44 | 建表 | `brand_mentions`（槽位级位次事实） | 排名指标的唯一源头 |
| 45 | 任务 | pipeline A 榜单抽取 🔗LLM-07/08 `rank_extract.js`：LLM 有序名录→别名归一（读 brand_aliases）→is_target → 未知名 upsert entities | 依赖 #18（别名）、#43 |
| 46 | 工具 | **50 条人工对榜评估集**（从生产拉真实回答人工标注） | 没评估集调 prompt 是盲人摸象 |
| 47 | 建表 | `opinions` + `opinion_topics`（label 唯一，variants 数组） | 口碑指标源头；实测结构 {ratio, 话题:{variants_count, platforms:[原文]}} |
| 48 | 任务 | pipeline B 口碑拆解 🔗LLM-09/10：观点抽取→话题归并（upsert topics）→极性分类 | |
| 49 | 建表 | `canonical_sources`（canonical_source 唯一） | 信源归一的根表 |
| 50 | 建表 | `cited_articles`（canonical_url 唯一） | URL 归一；is_brand_published 预置字段给 W7 归因用 |
| 51 | 建表 | `citation_edges`（最大表，索引先行：(brand_id,date)、(source_id,date)、(article_id)） | 实测一周 4509 次引用/7题——量最大的原子事实 |
| 52 | 任务 | pipeline C 引用归一 + 自有比对 | normalizeUrl 去 utm/frag |
| 53 | 任务 | 解析编排：`raw_answers parsed:false` 扫描 + 三路并行 + 原子标记 | 失败可重跑 |
| 54 | 建表 | `evidence_items`（顺手沉淀 top-cite 优质文） | W7 写作要挂它；此刻数据免费，且不积压迁移 |
| ✅ 验收 | | 人工榜 vs 抽取榜一致率 ≥95% 才放行 W4；口碑样例与人工判读对齐极性 | |

---

## W4 指标层 + 页面只读 API（🎉 完成后立刻可演示产品）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 55 | 基建 | `service/metrics.js`（已写好）：rates/rankScore/reputation/delta 一律收口于此 | 全站口径唯一来源，防止前后端各自算 |
| 56 | 建表 | `daily_metric_queries`（业务键唯一：brand+query+platform+date+end） | 三率+矩阵的读取层 |
| 57 | 建表 | `daily_metric_brands`（口碑分/比率/risk 按日） | 口碑页卡片+走势 |
| 58 | 建表 | `source_daily_stats`（信源×引擎×天） | 4 个信源接口共用底座 |
| 59 | 建表 | `leaderboard_dailies`（题×天全榜快照，含 rank_weight_table 快照） | 竞品追踪/榜单/趋势都直接读它——**权重快照随表存，未来调权重不改历史** |
| 60 | 任务 | schedule `daily_parse` 04:00 聚合 `aggregate.js`（已写好） | 依赖 W3 事实表 |
| 61 | 接口 | `POST /summary/mention_rate_trend | top3_rate_trend | first_position_rate_trend` | 逐日分子/分母返回，前端画折线 |
| 62 | 接口 | `POST /summary/full_ranking_matrix`（每题×每引擎=位次） | 排名页主矩阵 |
| 63 | 接口 | `POST /summary/ai_ranking_matrix` | 口碑页评分卡（today/yesterday/change） |
| 64 | 接口 | `POST /summary/reputation_data` | 组装 {query_dict, result[], score_result[]} 与线上契约一致 |
| 65 | 接口 | `GET /query-group/list` | 页面前置筛选器 |
| 66 | 接口 | `GET /user/info`（追加 aliases/key_words 投影） | Onboarding 完成后刷新 |
| 67 | 接口 | `POST /summary/get_references`（原文引用回放） | "过程可审计"卖点支撑 |
| 68 | 接口 | `POST /snapshot/export/list` | 快照下载页 |
| 69 | 接口 | `POST /competitor/insight` | 竞品榜（实测 172KB 单响应；考虑分页） |
| 70 | 接口 | `POST /competitor/name-corrections` | 抽取修正闭环：改错 → entities 改名 |
| 71 | 接口 | `POST /reference_source/stats` | 引用源追溯页 |
| 72 | 接口 | `POST /source_intelligence/{engine_preference, source_trend, own_trend, perspective}` + `GET /topics` | 洞察页 5 件套；全部走 cmp 期对比 |
| 73 | 接口 | `POST /api/brand/mining/trigger 🔗LLM-05 | status` + `POST /api/brand/propose-topics` | 话题挖掘页（写 mined_topics） |
| ✅ 验收 | | **和线上同品牌同日期对数**：提及率/评级色值/榜单前三完全一致 → 此刻产品已经可以拿去内测 | |

---

## W5 报告装配（每周一次的"总结算"）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 74 | 建表 | `reports`（period_key 唯一，payload 用 Mixed 存大块 JSON） | 实测 payload 18 键 15KB，字段随版本漂移——不要拆列 |
| 75 | 建表 | `report_templates`（modules 开关数组） | 标准版 6 模块实测结构；先开关化，二期好加模块 |
| 76 | 任务 | schedule `report_generate` 🔗LLM-11（周日/月末 05:00）+ `report_build.js` 装配 | 实测线上 05:05 产出——照着做 |
| 77 | 接口 | `GET /report/cycle`、`POST /report/list` | 前置基础读 |
| 78 | 接口 | `POST /report/latest` ⚠️ | **处理"还没生成首份报告"的形态**：实测返回 payload=null + overview_stats 卡（品牌卡就是它喂的） |
| 79 | 任务 | sourceChanges 集合差算法（本期 allSourceNames vs 上期） | 实测 added/dropped/newIn/lost |
| 80 | 接口 | `GET /report/detail` | 列表点进去的历史报告 |
| 81 | 接口 | 导出族 6+2：`/export/ranking_matrix|competitor_xlsx|competitor_report|reputation_xlsx|reference_source|article_library`、`/snapshot/export/text|sync` | 前端 bundle 声明的完整导出面，W5 一起做（都是报告数据转 CSV/xlsx） |
| 82 | 接口 | 分享 `/r/:token` 无鉴权视图（reports report_id→token 哈希） | 实测官网 demo 就是分享页 |
| 83 | 任务 | 报告就绪事件 → 写 `reminders`（首个提醒用例） | |
| ✅ 验收 | | 新订单数 = 这周日 05:05 前全品牌生成成功；分享链接可匿名打开 | |

---

## W6 钱域（此时产品上量、需要收银）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 84 | 建表 | `credit_transactions`（一切余额变动落流水，余额不做增量计算而是快照冗余） | 对账的唯一事实源 |
| 85 | 任务 | 把 credit_accounts 的所有余额写入改走事务辅助函数 `applyCredit(userId, coin, delta, refType, refId)` | 杜绝散落的加减代码 |
| 86 | 接口 | `GET /credit/account`、`GET /credit/transactions` | 计费页钱包 |
| 87 | 接口 | `GET /credit/recharge/packs` + `POST /credit/recharge/create` | 充值（先 credit 内部记账，二期接微信） |
| 88 | 接口 | `GET /payment/plans/grouped`（实测 13KB 价目） | 套餐页 |
| 89 | 接口 | `POST /payment/order/create` + `GET /payment/order`(状态查询) | 统一下单口：plan/recharge/diagnosis 一类单号 CP* |
| 90 | 接口 | `GET /payment/orders | /payment/subscription/current` | 计费页流水+余量 |
| 91 | 接口 | `POST /payment/upgrade/preview`（**幂等预演**，不下单只算差价） | 升级 UI 的试算页 |
| 92 | 任务 | 微信支付对接：code_url 生成→回调验签幂等→paid→三写事务（order+txn+account/subscription） | 线上响应里有 wx_prepay_id 字段，接口形态已锁定 |
| 93 | 任务 | 到期清理 cron：subscriptions 过期→brands.status=expired→首页"只读"横幅 | 实测过期品牌的表现就是它 |
| ✅ 验收 | | 并发买套餐压测不亏钱；发稿失败 100% 解冻有流水；微信回调重放 200 次只记一次 | |

---

## W7 行动层（闭环的最后一块拼图：优化执行）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 94 | 建表 | `media_channels`（11 万渠道初始导入脚本 + `source_id` 关联 canonical_sources） | 没有渠道库就没有信源库页 |
| 95 | 任务 | 夜间刷新 `media_stat.js`：30天窗聚合 source_daily_stats → ref_count/cost_per_citation | 已写好；让"按被引成本推荐"有数据 |
| 96 | 建表 | `media_favs`（用户×渠道唯一键） | 列表 fav 过滤 |
| 97 | 接口 | `POST /publish/media/facets | list | media/favorite` | 信源库页 |
| 98 | 建表 | `brand_wikis` + `brand_libraries` | 写作 Agent 的知识底座，先备数据模型 |
| 99 | 接口 | `/api/brand/wiki/tree|file|profile|clear`、`/api/brand/library/docs|links|text|upload` | AGENT/品牌页读 |
| 100 | 建表 | `evidence_items` 接口补齐：`GET /api/brand/evidence-library` + `recommend|refresh` | 表在 W3 已建，这里补读口 |
| 101 | 建表 | `writing_jobs`（六态状态机：starting/running/awaiting_user/completed/failed/cancelled） | /api/articles 返回的 counters 就是它 |
| 102 | 基建 | WebSocket 网关 + channel 隔离 `ws:article:{job_id}`；断线重延续写 | 线上契约 `/ws/article` |
| 103 | 任务 | 写作 Agent 🔗LLM-13/14/15/16：选题（读 report 缺口）→ 大纲 → 循证正文（只许引 evidence/wiki/library，**禁编造外部源**）→ 护栏（禁用词/事实核验） | 线上"循证写作"的核心卖点 |
| 104 | 建表 | `articles_generated` + `agent_histories` | 稿件库+对话历史分离（实测两表） |
| 105 | 接口 | `POST /api/article/start` 🔗LLM-13/14/15/17、`GET /api/articles`（counters 用 aggregate 六态计数）、`/api/article/report/patch-draft` | 写作工作页三件套 |
| 106 | 建表 | `publish_orders`（order_no PB*，含 cite_count/cite_days 回写字段预留） | 发稿记录页 |
| 107 | 接口 | `POST /publish/estimate` → `/publish/review` → `/publish/submit`（**事务：冻结→下单**） | 发稿下单三步 |
| 108 | 接口 | `POST /publish/orders`、`POST /publish/order/cites`（逐稿被引）、`POST /publish/order/republish`（失败重发） | 发稿记录页功能 |
| 109 | 接口 | `POST /publish/article/drafts | save | delete` | 草稿箱 |
| 110 | 接口 | `POST /article/library | /article/library/citations | import | update | delete` | 稿件追踪页 |
| 111 | 任务 | **归因回流（最后的钩）**：次日管线 C 命中 published_url → is_own=true；聚合时回写 publish_orders.cite_count + cite_days；报告 writing 模块读它 | 没有这个，"闭环"就是单向死路——所以排在行动层最后、也是全项目最后一块砖 |
| ✅ 验收 | | E2E 录屏：写一篇→投出→次日在周报 writing 模块看到被引数字>0 | |

---

## W8 增值与硬化（发布后第一轮）

| # | 动作 | 内容 | 为什么这时做 |
|---|---|---|---|
| 112 | 建表 | `diagnosis_tasks`（含 ends=['web','mobile'] 双端） | 单次诊断是独立付费产品 |
| 113 | 接口 | `POST /diagnosis/aliases/suggest` 🔗LLM-18 → `POST /diagnosis/order/create` → `GET /diagnosis/tasks` → `/diagnosis-report/:id` | 诊断流 4 件套 |
| 114 | 任务 | Agency 多品牌：activeOrg 字段启用 + 共享积分池 | 线上 token 里已有 active_org 字段预留 |
| 115 | 加固 | OSS 截图改签名 URL、手机号出 URL（/api/beta/me 改 POST）、接口限速、审计表 | 修线上同款安全问题 |
| 116 | 加固 | 观测性：slot 失败率告警 / parse 积压告警 / 采集账号封禁率仪表盘 | 系统是"凌晨跑批"类，必须有可观测性才知道夜里塌没塌 |
| 117 | 加固 | 定时任务看门狗：每日 06:00 检查 collect_tasks/completeness<80% 报警 | 同上 |

---

## 附：顺序不可逆的 8 条铁律（一次讲透）

1. **#3 counters 先于一切数字 ID**（query_id、order_no 序列化）——后进入存量难兼容
2. **#18 brand_aliases 必须在 W3 解析前上线**（#43-#48 所有抽取都依赖"识别你"）
3. **#36 raw_answers 原文先落库再解析**——解析逻辑未来一定升级，没原文=无法重跑
4. **#33 collect_slots 唯一键必须在第一张指标表之前建好**——半夜重跑的唯一保护
5. **#55 metrics.js 收口先于任何 summary API**——否则口径会被复制到 N 处，永远对不齐
6. **#59 榜单权重表随快照存**——未来调权重不影响历史
7. **#85 积分类操作全部走统一事务函数**，再开放 #87 之后任何收/费接口
8. **#111 归因回写是闭环最后一块砖**——别在前 dashboards 上线后才想起它，那时 is_own 字段早就该每天有人填了

*附索引：表结构代码 `egg-geo-backend/app/model/*.js`；计算口径 `app/service/metrics.js`；管线 `app/service/pipeline/*.js`；schedule 三个 cron `app/schedule/*.js`*


---

## 附：LLM 调用点总入口

全项目共 **18 个 DeepSeek 调用点**（LLM-01 ~ LLM-18），每个点的触发时机/输入/完整提示词/输出 JSON 结构/落库表，全部集中在：**`egg-geo-backend/LLM调用点设计与提示词.md`**
配套：客户端封装 `app/service/llm/deepseek.js`（JSON Mode + 修复重试）、调用日志表 `app/model/llm_call_log.js`（成本与 prompt 版本回溯）。
