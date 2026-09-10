# 品牌采集完成后：可分析入库的数据 → 用户后台页面 / Panel 映射

> 分析范围：以 `apps/gen-api`（Egg 后端）的真实数据流为准，页面以 `apps/gen-user-dash`（用户后台）的真实代码为准。
> 当前状态：**采集（gen-caiji）已就绪，解析与聚合流水线已实现但依赖采集数据**；用户后台大部分数据面板目前仍是「等待首次采集」占位（`PreCollectionEmpty`），等采集跑通后接入。

---

## 一、数据链路总览（一条回答 → 最终面板）

```
采集 worker（gen-caiji 对话测试）
   │  submit {status, answer_text, cited_urls, model_meta}
   ▼
raw_answer（parsed=false）─────────────────────────── 采集提交落库
   │
   │  凌晨 04:00 daily_parse 按 query_type 分流
   ├── industry 题 ──► 流水线A rankExtract
   │                      ├─► brand_entities（品牌实体，upsert）
   │                      └─► brand_mentions（榜单位次，is_target 命中自家别名）
   │
   ├── brand 题   ──► 流水线B reputationExtract
   │                      ├─► opinion_topics（话题归并）
   │                      └─► opinions（观点/情感/针对实体）
   │
   └── 所有题     ──► 流水线C citationExtract
                          ├─► canonical_sources（信源站点）
                          ├─► cited_articles（被引文章，is_brand_published）
                          └─► citation_edges（引用边，is_own 自有归因）
   │
   ▼  S5 aggregate（同批）
   ├─► daily_metric_queries   （问题级日指标：提及率/前三率/首位率/位次/权重分）
   ├─► daily_metric_brands    （口碑日指标）
   ├─► source_daily_stats     （信源日被引统计 + 自有归因）
   ├─► leaderboard_dailies    （榜单快照 entries）
   ├─► publish_orders.cite_count 回写（本品牌发稿被引次数）
   └─► media_channels 刷新（渠道库 30 天被引 / cost_per_citation）
   │
   ▼  S6 report_build（周/月）
   └─► reports（payload 18 键 + overview_stats）→ 概览页周报/月报 6 模块
```

> `snapshot`（搜索快照）与 `evidence_item`（证据库）模型已建，截图上传本轮暂不做、证据库待接。

---

## 二、入库数据 → 页面 Panel 映射（正视角）

### 1. 采集事实层

| 数据表 | 内容 | 对应页面 / Panel |
|---|---|---|
| `raw_answer` | 完整回答原文 + cited_urls + model_meta | 不直接对用户展示；管理后台「采集监控 → 回答」查看 |
| `collect_slot` / `collect_task` | 槽位/任务状态、完整度 | 概览页「品牌卡」采集状态灯（采集正常 / 等待首次采集）；管理后台采集监控 |

### 2. 解析事实层（daily_parse 产出）

| 数据表 | 内容 | 对应页面 / Panel |
|---|---|---|
| `brand_mentions` | 每个回答里的品牌位次（position、is_target、snippet） | **AI排名透视**：品牌提及（提及率/前三率/首位率）、排名矩阵、榜单位次；**AI竞品透视**：竞品提及 |
| `brand_entities` | 归一后的品牌/竞品实体（scope: target/discovered） | **AI竞品透视**、**监控识别管理 → 竞品名** |
| `opinions` + `opinion_topics` | 口碑观点（quote、polarity、target_entity）+ 话题 | **AI口碑分析**：口碑指标、情感分布、话题排名、口碑矩阵、口碑趋势 |
| `citation_edges` | 引用边（is_own 自有/他源、mentioned_entity） | **引用源追溯**、**信源平台偏好**、**引用源洞察**、**信源库** |
| `cited_articles` | 被引文章（canonical_url、title、is_brand_published） | **引用源追溯** 的来源明细、**引用源洞察** |
| `canonical_sources` | 信源站点主名/分类/域名 | **信源库**（站点归类）、**信源平台偏好** |

### 3. 指标层（aggregate 产出）

| 数据表 | 内容 | 对应页面 / Panel |
|---|---|---|
| `daily_metric_queries` | 问题×引擎×日：mention/top3/first 率、rank_value（位次或「未提及」）、score | **AI排名透视**（核心指标卡 + 趋势 + 矩阵）；**概览页「核心指标」** |
| `daily_metric_brands` | 品牌口碑日指标（正/中/负、占比） | **AI口碑分析**（情感分布、口碑趋势）；**概览页「核心指标」** |
| `source_daily_stats` | 信源×引擎×日：ref_count/article_count/query_count/own_article_count | **概览页「信源引用趋势」「信源投放分析」**；**信源库**被引数 |
| `leaderboard_dailies` | 榜单快照 entries（实体名/位次/得分/is_target/平台数） | **概览页「竞争格局」**、**AI竞品透视**、**榜单快照** |
| `publish_orders.cite_count` | 本品牌发稿被引回写 | **发稿明细**、**发稿记录 → 回流追踪**、**信源投放分析** |
| `media_channels` | 渠道库被引/成本效率（ref_count、cost_per_citation） | **信源库**（被引数、单次引用成本） |

### 4. 报告层（report_build 产出）

| 数据表 | 内容 | 对应页面 / Panel |
|---|---|---|
| `reports` | 周报/月报 payload（trend/engines/metrics/monitor/sources/sourceChanges/competitors/writing/publish/channels/terminals…）+ overview_stats | **概览页** 周报/月报 Tab 的 6 个模块（见下） |

---

## 三、用户后台页面 × Panel 清单（反视角）

### A. 概览页 `/dashboard/overview`（报告页）

采集前：品牌卡 + 「等待首次采集」空态；采集后加载周报/月报，6 个 `rp-modcard` Panel：

| # | Panel 标题 | 数据来源 |
|---|---|---|
| 1 | 本期引用概况 | 采集分布（槽位）+ `source_daily_stats` 引用源总量 + 监控问题数 |
| 2 | 核心指标 | `daily_metric_queries`（提及/前三/首位率）+ `daily_metric_brands`（口碑）四主指标 + 引擎环比 |
| 3 | 竞争格局 | `leaderboard_dailies` 竞品透视 |
| 4 | 信源引用趋势 | `source_daily_stats` 增减 + Top 平台被引变化 + 可投放标记 |
| 5 | 信源投放分析 | `publish_orders`（发稿/发布/被引转化）+ `media_channels` 积分成本效率 |
| 6 | 发稿明细 | `publish_orders` 稿件清单与发布状态 |

### B. AI排名透视 `/dashboard/ai-index`（一个页面 9 个 Tab，当前多为空态）

| Tab | 内容 Panel（mock 参考名） | 数据来源 |
|---|---|---|
| AI排名透视 | 排名指标卡、榜单列表、趋势、排名矩阵（全量/单引擎） | `daily_metric_queries` + `brand_mentions` + `leaderboard_dailies` |
| AI竞品透视 | 竞品指标、竞品提及、竞品×平台矩阵、竞品问题榜 | `leaderboard_dailies` + `brand_mentions`(非目标实体) + `brand_entities` |
| 引用源追溯 | 引用源列表、来源明细 | `citation_edges` + `cited_articles` + `canonical_sources` |
| 信源平台偏好 | 平台偏好指标、TOP10 平台、平台占比 | `citation_edges` + `source_daily_stats` |
| 引用源洞察 | 平台标签、来源洞察列表、洞察结论 | `source_daily_stats` + `cited_articles` + `canonical_sources` |
| 监控问题管理 | 排名词/口碑词问题列表 | `monitor_queries`（非采集产出，采集前已可管理） |
| 监控识别管理 | 识别词（品牌名/别名）+ 竞品名 | `brand` + `brand_aliases` + `brand_entities`（采集后补充竞品实体） |
| 搜索快照下载 | 快照列表 | `snapshot`（截图暂不做） |
| 导出品牌透视报告 | 导出报告 | `reports` |

### C. AI口碑分析 `/dashboard/sentiment`

| Tab | 内容 Panel（mock 参考名） | 数据来源 |
|---|---|---|
| AI口碑分析 | 口碑指标、情感分布（正/中/负）、话题排名、口碑矩阵、口碑趋势 | `opinions` + `opinion_topics` + `daily_metric_brands` |
| 引用源追溯 | 同排名页 | `citation_edges` 等 |
| 监控问题管理 | 口碑词 | `monitor_queries` |
| 监控识别管理 | 识别词/竞品名 | `brand_aliases` 等 |
| 搜索快照下载 | 快照列表 | `snapshot` |

### D. 信源库 `/dashboard/media-library`

| Tab | 内容 Panel | 数据来源 |
|---|---|---|
| 信源库 | 渠道列表（被引数、成本效率） | `media_channels`（经 `source_daily_stats` 刷新） |
| 发布稿件 | 稿件 | `publish_orders`（发布侧，非采集产出） |
| 发稿记录 | 发稿清单 + 被引回流 | `publish_orders` + `citation_edges.is_own` 回写 cite_count |
| 回流追踪 | 发稿 → 被引转化 | `publish_orders.cite_count` / `cite_days` |

---

## 四、现状差距（哪些还没接通）

1. **采集 → 解析链路已实现**：`collector.submit` 落 `raw_answer` → `daily_parse` 三流水线 + `aggregate` 全都有真实实现，只等采集数据进来。
2. **用户后台多数数据面板仍为「等待首次采集」占位**：`ranking` 各 Tab、`sentiment` 各 Tab 目前都是 `PreCollectionEmpty`，真实数据接入是后续工作；`overview` 报告 6 模块已有完整 UI 但部分数据仍是 mock（`competitors`、`citationPlatforms` 为硬编码 ref）。
3. **`snapshot`（搜索快照/截图）与 `evidence_item`（证据库）**：模型已建，截图上传按计划暂不做。
4. **`/summary/*`、`/source_intelligence/*`、`/snapshot/export/list` 等查询接口**：前端 `monitor.ts` 已声明契约，但 gen-api 的 router 尚未挂载实现（现由线上 geoapi 承接）；这部分是「数据已能入库、查询接口待补」的环节。

---

## 五、一句话结论

一次品牌采集完成后，**回答原文**（raw_answer）会经三条流水线拆成 **榜单位次（brand_mentions）→ 口碑观点（opinions）→ 引用信源（citation_edges）** 三类事实，再聚合成 **日指标（daily_metric_*）、榜单快照（leaderboard_daily）、信源统计（source_daily_stat）**，最终装配成 **周报/月报（reports）**；它们分别落到用户后台的 **概览页 6 模块、AI排名透视 9 Tab、AI口碑分析 5 Tab、信源库 4 Tab**。其中「排名/口碑/引用源/快照」面板目前还是采集前占位，采集跑通后按上面映射逐项接入即可。
