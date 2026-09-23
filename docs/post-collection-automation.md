# 采集原数据之后的自动流程 / 系统计算 / AI 分析（全量盘点）

> 对齐代码：仓库当前实现（2026-09）。视角：以「一条原始回答（raw_answer）入库之后」为起点。

---

## 0. 先给一张全景图

```
采集端 geo-caiji（自动调度：总控开关 + 2s/平台 轮询）
   │  pull /collector/slots/pull  ── 领取 running 槽位
   │  对话 → 回答 + 信源（cited_urls）
   │  submit /collector/slots/:id/submit
   ▼
raw_answer（parsed=false） + collect_slot 状态机 + collect_task 汇总   ← 采集原数据落地（规则）
   │
   │  解析触发（二选一，由 PARSE_MODE 控制）
   │  ├─ realtime（默认）：schedule/realtime_parse 轮询未解析回答
   │  └─ daily：每天 04:00 daily_parse
   ├─ 流水线A 排名抽取   → brand_entities / brand_mentions      ← AI（LLM）
   ├─ 流水线B 口碑抽取   → opinion_topics / opinions            ← AI（LLM）
   └─ 流水线C 引用归一化 → canonical_sources / cited_articles / citation_edges  ← 规则
   │
   ▼  S5 aggregate（同批，规则计算 + 聚合）
   ├─ daily_metric_queries   （提及率/前三率/首位率/位次/权重分）
   ├─ daily_metric_brands    （口碑占比/rep_score/风险评级）
   ├─ source_daily_stats     （信源日被引/自有归因）
   ├─ leaderboard_dailies    （榜单快照排序）
   ├─ publish_orders.cite_count 回写 + media_channels 刷新
   ▼  S6 report_build（⏰ 周日 05:00 周报 / 月报另配）
   └─ reports（payload + overview_stats）← service/report.js 装配
```

---

## 1. 触发链：定时任务 + 手动入口

| 触发 | 时间 / 条件 | 做什么 | 状态 |
|---|---|---|---|
| `daily_collect` | 每天 00:30 | 为每个 active 品牌展开当日 `collect_tasks` + `collect_slots`（幂等），并把 `task_id` 推入队列 | ✅（队列为内存 backlog；实际由 geo-caiji **主动 pull**，不依赖队列消费者） |
| `realtime_parse` | 轮询（默认开启） | `PARSE_MODE=realtime` 时扫 `raw_answers(parsed:false)` → 三流水线 → `aggregate` | ✅ 默认 |
| `daily_parse` | 每天 04:00 | 同上批处理；仅当 `PARSE_MODE=daily` 时生效 | ✅ 备用 |
| `report_generate` | 每周日 05:00 | `reportBuild.run({period_type:'weekly'})` | ✅（月报 cron 未配） |
| `POST /user/generate_today` | 手动 | 与 daily_collect 同源的手动展槽 | ✅ |
| 采集 worker pull/submit | 实时 | geo-caiji 按平台 pull→对话→submit | ✅ |
| `_reclaimTimedOut` | 每次 pull 前 | running 超时（默认 15 分钟）→ attempts+1 → 终态 fail（默认不再回退 pending） | ✅ |
| Admin 重置失败槽 | 手动 | `POST /admin/collect/slots/:slotId/reset`、`POST /admin/collect/tasks/:id/reset-failed` | ✅ |

环境变量要点：

- `PARSE_MODE`：`realtime`（默认）| `daily`
- `COLLECT_MAX_ATTEMPTS`：默认 `1`（首次 fail/超时即终态；需人工重置后再采）
- 采集端对话超时约 10 分钟；服务端 running TTL 默认 15 分钟

---

## 2. 采集原数据落地（规则，非 AI）

`collector.submit` 收到 worker 提交后：

- **写 `raw_answer`**（`answer_text` + `cited_urls` 归一化 + `model_meta` + `parsed:false`）；按 `slot_id` upsert。
- **信源归一化 `_mapCitedUrls`**：url 必填；`index` 兼容旧 `rank`；`domain` 未传时从 url 兜底。
- **槽位状态机**：`ok` / `empty` / `fail`（`attempts` 达 `maxAttempts` 后终态 fail）。
- **任务汇总 `_syncTask`**：聚合 `actual_slots / failed_slots / completeness_rate / status`。
  - 任务状态含 **`partial`**：部分槽失败、部分成功时结清为 `partial`（非全 `ok` / 全 `fail`）。

> 以上均为确定性规则，不调用 LLM。外部引擎对话（豆包等）的 token **不**写入 `llm_call_logs`。

---

## 3. 自动流程分层的三类动作

### 3.1 AI 分析（调用 LLM）

| # | 名称 | 位置 | 输入 → 输出 | 状态 |
|---|---|---|---|---|
| AI-1 | **排名抽取** `extractRankedList` | `service/llm/deepseek.js` ← `pipeline/rank_extract.js` | answer_text → `[{name, position}]` | ✅ |
| AI-2 | **口碑抽取** `extractOpinions` | 同上 ← `pipeline/reputation_extract.js` | answer_text → `[{quote, label, polarity, target}]` | ✅ |
| AI-3 | 首登分析 Agent（geo-agent） | `agent_runner.js` + `packages/geo-agent` | 品牌名/官网 → 画像+竞品+别名+监控问题+情报文 | ✅（采集前） |
| AI-4 | 旧版首登 LLM 解析 | `onboarding.js` `analyzeWithLLM` | 品牌介绍 → 画像等 | ✅（兜底） |

调用收口：DeepSeek 结构化抽取走 `deepseek.js`，结束写入 **`llm_call_logs`**（含 `user_id` 等）；首登 geo-agent 各步 usage 由 `agent_runner` 另行落库。Admin LLM 页可按用户/品牌聚合 token。

> 本仓库监控题默认**行业中立**；流水线 B 主要处理「中立题里自发提及品牌」的回答（`query_type=brand` 仅兼容存量）。

### 3.2 系统计算（纯规则 / 公式，无 LLM）

| # | 名称 | 位置 | 计算逻辑 |
|---|---|---|---|
| C-1 | **位次权重分** `rankScore` | `service/metrics.js` | `rankWeights[position-1]`，未上榜 0 |
| C-2 | **三率** `rates` | 同上 | 分母=有效槽位数；mention/top3/first |
| C-3 | **口碑指标** `reputation` | 同上 | 正/中/负占比；`rep_score`；风险档 |
| C-4 | **环比** `delta` | 同上 | 本期 vs 上期 |
| C-5 | **榜单聚合** | `pipeline/aggregate.js` | 位次分累加 → 排序 → entries |
| C-6 | **信源日统计** | 同上 | citation_edges 按 source×platform |
| C-7 | **归因回写** | 同上 | 发稿被引 → `publish_orders.cite_count` |
| C-8 | **渠道库刷新** | `pipeline/media_stat.js` | 近 30 天 → `media_channels` |
| C-9 | 槽位状态机 / 任务汇总 / 超时回收 / 失败重置 | `collector` + `collect` service | §2 |

### 3.3 规则流水线（非 AI）

| # | 名称 | 位置 | 逻辑 | 状态 |
|---|---|---|---|---|
| R-1 | **引用归一化** | `pipeline/citation_extract.js` | cited_urls → sources/articles/edges；`DOMAIN_SOURCE_MAP` 域名→站点名 | ✅（未命中映射时回退域名启发式） |
| R-2 | 品牌实体 upsert | `rank_extract.js` | 别名命中 → is_target / scope | ✅ |
| R-3 | 话题归并 | `reputation_extract.js` | label → `opinion_topics.variants` | ✅ |

---

## 4. S5 聚合（aggregate.run）

对每个 active 品牌（或指定 brandId/date，date 默认昨天）：

1. 问题级日指标 → `daily_metric_queries`
2. 口碑日指标 → `daily_metric_brands`
3. 信源日统计 → `source_daily_stats`
4. 榜单快照 → `leaderboard_dailies`
5. 归因回写 → `publish_orders.cite_count`
6. 渠道库刷新 → `mediaStat.refresh`

全部确定性计算，无 AI。

---

## 5. 现状断点（仍待补）

| 断点 | 位置 | 影响 |
|---|---|---|
| ⚠️ queue 为内存 backlog，`push` 无真实消费者 | `service/queue.js` | 不影响现行 pull 采集 |
| ⚠️ snapshot 截图存证未做 | `model/snapshot.js` | 搜索快照面板无数据 |
| ⚠️ 月报 cron 未配置（仅周报 `0 0 5 * * 0`） | `schedule/report_generate.js` | 月报需另配或手动跑 |
| ⚠️ 引用映射覆盖不全 | `citation_extract.js` | 冷门域名归类偏粗，可继续扩 `DOMAIN_SOURCE_MAP` |

已补齐（相对旧文档断点）：

- ✅ `extractRankedList` / `extractOpinions`
- ✅ `service/report.js`（供 `report_build` 装配）
- ✅ `llm_call_logs` 埋点（DeepSeek + 首登 agent）
- ✅ 任务 `partial` + Admin 失败槽重置
- ✅ `COLLECT_MAX_ATTEMPTS` 默认 1 + 实时解析默认开启

---

## 6. 采集前的 AI 分析（对照）

首登 Agent：`crawl → web_research → profile → queries（中立闸门）→ weigh → library`，产出品牌档案 + 首批监控问题，为采集提供「问什么」。

---

## 7. 一句话结论

采集入库后：**实时或日批解析**（A/B LLM + C 规则）→ **S5 聚合** → **周日报告装配**。排名/口碑抽取与 `report` service 已接通；剩余主要是快照截图、月报调度、信源映射扩表，以及用户后台部分查询接口仍可能依赖线上 geoapi。

---

## 8. 多品牌请求约定（用户后台）

- 业务接口须显式传 `brand_id`（dash HTTP 客户端会从 `activeBrandId` 自动注入）。
- 缺 `brand_id` → **400**；非本人/禁用品牌 → **403**（`service/brand_scope.requireBrand`），禁止静默回落首个品牌。
- 账号级白名单：`/user/brands`、`/credit/*`、套餐价目等不要求 `brand_id`。
- 添加品牌：控制台左上角 → `/trial?from=add_brand#token=` → confirm 新建 → 回控制台 `#brand_id=` 自动切换。
- 未做：品牌禁用/删除入口、JWT 内嵌 activeBrand、Agency 组织。
- 静态校验：`node scripts/check-multi-brand.mjs`
