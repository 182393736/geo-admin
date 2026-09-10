# 采集原数据之后的自动流程 / 系统计算 / AI 分析（全量盘点）

> 分析基准：remote main `ea575ad`（2026-09-10）。仅分析，未改动任何代码。
> 视角：以「一条原始回答（raw_answer）入库之后」为起点，向后梳理所有自动流程、纯规则计算、以及调用 LLM 的 AI 分析。

---

## 0. 先给一张全景图

```
采集端 gen-caiji（自动调度：总控开关 + 2s/平台 轮询）
   │  pull /collector/slots/pull  ── 领取 running 槽位
   │  对话 → 回答 + 信源（cited_urls）
   │  submit /collector/slots/:id/submit
   ▼
raw_answer（parsed=false） + collect_slot 状态机 + collect_task 汇总   ← 采集原数据落地（规则）
   │
   │  ⏰ 04:00 daily_parse（自动）
   ├─ 流水线A 排名抽取   → brand_entities / brand_mentions      ← AI（LLM 抽取）
   ├─ 流水线B 口碑抽取   → opinion_topics / opinions            ← AI（LLM 抽取）
   └─ 流水线C 引用归一化 → canonical_sources / cited_articles / citation_edges  ← 规则（部分 stub）
   │
   ▼  S5 aggregate（同批，规则计算 + 聚合）
   ├─ daily_metric_queries   （提及率/前三率/首位率/位次/权重分） ← 纯系统计算
   ├─ daily_metric_brands    （口碑占比/rep_score/风险评级）      ← 纯系统计算
   ├─ source_daily_stats     （信源日被引/自有归因）              ← 纯系统计算
   ├─ leaderboard_dailies    （榜单快照排序）                     ← 纯系统计算
   ├─ publish_orders.cite_count 回写 + media_channels 刷新        ← 纯系统计算
   ▼  S6 report_build（⏰ 周日 05:00 周报 / 月报另配）
   └─ reports（payload 18 键 + overview_stats）                  ← 装配（依赖 report service，当前缺）
```

---

## 1. 触发链：三个定时任务 + 手动入口

| 触发 | 时间 | 做什么 | 状态 |
|---|---|---|---|
| `daily_collect` | 每天 00:30 | 为每个 active 品牌展开当日 `collect_tasks` + `collect_slots`（幂等），并把 `task_id` 推入队列 | ✅ 已实现（队列为 dev 内存实现，无真实消费者） |
| `daily_parse` | 每天 04:00 | 扫 `raw_answers(parsed:false)` → 三条流水线 → `aggregate` | ⚠️ 编排已实现，但 A/B 两条 AI 流水线的方法缺失（见 §5） |
| `report_generate` | 每周日 05:00 | 跑 `reportBuild.run({period_type:'weekly'})` | ⚠️ 编排已实现，但依赖的 `report` service 整个不存在（见 §5） |
| `POST /user/generate_today` | 手动 | 与 daily_collect 同源的手动展槽 | ✅ 已实现 |
| 采集 worker pull/submit | 实时 | gen-caiji 按平台 pull→对话→submit，驱动槽位状态机 | ✅ 已实现（新增 collector-api.cjs） |
| `_reclaimTimedOut` | 每次 pull 前 | running 超时（默认 15 分钟）→ attempts+1 → 回退 pending / 终态 fail | ✅ 已实现（系统计算） |

---

## 2. 采集原数据落地（规则，非 AI）

`collector.submit` 收到 worker 提交后：

- **写 `raw_answer`**（`answer_text` 原文 + `cited_urls` 归一化 + `model_meta` + `parsed:false`）；按 `slot_id` upsert，重采不撞唯一索引。
- **信源归一化 `_mapCitedUrls`**（纯规则）：url 必填；`index` 兼容旧 `rank`；`domain` 未传时从 url 兜底推导（小写、去 www）。
- **槽位状态机**：`ok`（answer_text 必填）/ `empty`（可带原文留证）/ `fail`（attempts+1，达 `maxAttempts=2` 终态，否则回退 pending 重试）。
- **任务汇总 `_syncTask`**（纯规则）：按 slot 状态聚合 `actual_slots / failed_slots / completeness_rate / status`。

> 以上都是确定性规则计算，不调用 LLM。

---

## 3. 自动流程分层的三类动作

### 3.1 AI 分析（调用 LLM）

| # | 名称 | 位置 | 输入 → 输出 | 状态 |
|---|---|---|---|---|
| AI-1 | **排名抽取** extractRankedList | pipeline/rank_extract.js | answer_text → `[{name, position}]` 有序名录 | ❌ 方法未实现（`ctx.service.llm.extractRankedList` 不存在） |
| AI-2 | **口碑抽取** extractOpinions | pipeline/reputation_extract.js | answer_text → `[{quote, label, polarity, target}]` 观点 | ❌ 方法未实现（`ctx.service.llm.extractOpinions` 不存在） |
| AI-3 | 首登分析 Agent（geo-agent） | service/agent_runner.js + packages/geo-agent | 品牌名/官网 → 画像+竞品+别名+监控问题+情报文 | ✅ 已实现（**采集前**流程，见 §6） |
| AI-4 | 旧版首登 LLM 解析 | service/onboarding.js `analyzeWithLLM` | 品牌介绍 → 画像/竞品/关键词/行业问题 | ✅ 已实现（采集前，兜底路径） |

> 结论：**采集之后**的 AI 分析只有 AI-1 / AI-2 两处设计点，且都还没实现方法体——这是「采集数据进来后解析跑不动」的直接原因。

### 3.2 系统计算（纯规则 / 公式，无 LLM）

| # | 名称 | 位置 | 计算逻辑 |
|---|---|---|---|
| C-1 | **位次权重分** `rankScore` | service/metrics.js | `rankWeights[position-1]`，第1名 40 分…未上榜 0 |
| C-2 | **三率** `rates` | service/metrics.js | 分母=有效槽位数；mention/top3/first 率 = 命中 is_target 的 mention 数 / 分母 ×100 |
| C-3 | **口碑指标** `reputation` | service/metrics.js | 正/中/负占比；`rep_score=positive占比×100`；≥80 健康 / ≥60 中风险 / 否则高风险 |
| C-4 | **环比** `delta` | service/metrics.js | 本期 vs 上期差值 + up/down/flat |
| C-5 | **榜单聚合** | pipeline/aggregate.js §4 | 各实体位次分累加 → 排序 → entries（rank/score/is_target/平台数） |
| C-6 | **信源日统计** | pipeline/aggregate.js §3 | citation_edges 按 source×platform 聚合 ref_count/article_count/query_count/own |
| C-7 | **归因回写** | pipeline/aggregate.js §5 | 本品牌发稿被引次数 → publish_orders.cite_count + cite_days |
| C-8 | **渠道库刷新** | pipeline/media_stat.js | source_daily_stats 近 30 天 → media_channels.ref_count/cost_per_citation |
| C-9 | 槽位状态机 / 任务汇总 / 超时回收 | controller/collector.js | §2 已述 |

### 3.3 规则流水线（非 AI、非指标，是数据规整）

| # | 名称 | 位置 | 逻辑 | 状态 |
|---|---|---|---|---|
| R-1 | **引用归一化** citationExtract | pipeline/citation_extract.js | cited_urls → canonical_sources / cited_articles / citation_edges（is_own 判定 = canonical_url 命中本品牌 publish_orders） | ⚠️ `normalizeUrl`/`normalizeSource` 是 stub（返回原值/固定「抖音」），需补域名映射 |
| R-2 | 品牌实体 upsert | pipeline/rank_extract.js | canonical_name 归一 + 别名命中 → is_target / scope | ✅（依赖 AI-1 的产出） |
| R-3 | 话题归并 | pipeline/reputation_extract.js | label 相同 → opinion_topics.variants 累加 | ✅（依赖 AI-2 的产出） |

---

## 4. S5 聚合（aggregate.run）逐段说明

对每个 active 品牌（或指定 brandId/date，date 默认昨天）：

1. **问题级日指标**：按 `query_id|platform|end` 分组有效槽位，用 `metrics.rates` 算三率；`rank_value`=命中实体位次或「未提及」；`score`=命中 mention 的 `rankScore` 累加 → 写 `daily_metric_queries`。
2. **口碑日指标**：按平台聚合 opinions → `metrics.reputation` → 写 `daily_metric_brands`。
3. **信源日统计**：citation_edges 聚合 → 写 `source_daily_stats`（含 own_article_count 自有归因）。
4. **榜单快照**：每个 industry 题的 mentions 按实体累加 rankScore → 排序 → `leaderboard_dailies.entries`。
5. **归因回写**：本品牌 ok 发稿的 published_url 被引次数 → `publish_orders.cite_count`。
6. **渠道库刷新**：`mediaStat.refresh`（30 天窗口）。

> 全部是确定性计算（Mongo 聚合 + 公式），无 AI。

---

## 5. 现状断点（重要，采集跑通前必须先补）

| 断点 | 位置 | 影响 |
|---|---|---|
| ❌ `ctx.service.llm.extractRankedList` 未定义 | rank_extract.js:13 | 流水线A 运行时抛错 → 排名数据无法入库 |
| ❌ `ctx.service.llm.extractOpinions` 未定义 | reputation_extract.js:11 | 流水线B 运行时抛错 → 口碑数据无法入库 |
| ❌ `ctx.service.report.*`（range/trend/engines/metricCards/monitorCards/sourceSummary/competitors/writingSummary/terminals/overviewStats）整个 service 文件不存在 | report_build.js | 周报/月报装配跑不通 |
| ⚠️ citation_extract 的 `normalizeUrl`/`normalizeSource` 是 stub | citation_extract.js | 信源归一/站点归类失真（永远返回「抖音」） |
| ⚠️ `llm_call_log` 模型注明「deepseek.js 收口埋点」，但 deepseek.js 内无任何写入 | model/llm_call_log.js vs service/llm/deepseek.js | LLM 成本看板/审计无数据 |
| ⚠️ queue 为内存 dev 实现，`push` 只记 backlog 无消费者 | service/queue.js | daily_collect 推送的 `geo.collect.slot` 无人消费（现采集由 gen-caiji 主动 pull，不走该队列，暂不影响） |
| ⚠️ snapshot 截图存证未做（计划中） | model/snapshot.js | 搜索快照面板无数据 |
| ⚠️ 月报 cron 未配置（仅周报 `0 0 5 * * 0`） | schedule/report_generate.js | 月报需另配 |

---

## 6. 采集前的 AI 分析（对照参考，不属「采集之后」）

首登分析 Agent（`/agent/onboarding/run|stream|confirm`）是当前唯一**完整可跑**的 AI 流程，阶段：`crawl 官网抓取 → web_research 联网取证（工具循环 2~4 次 web_search）→ profile 画像抽取 → queries 监控问题生成（品牌中立闸门 + 纠偏重试）→ weigh 热度重排 → library 情报文`，产出品牌档案 + 首批监控问题。它跑在**采集之前**，为采集提供「问什么」。

---

## 7. 一句话结论

采集原数据（raw_answer）之后的自动流程 = **一个 04:00 批处理**（三条流水线 + S5 聚合）+ **一个周日 05:00 报告装配**。

- **AI 分析只有 2 处**（排名抽取、口碑抽取），且**都还没实现方法体**；
- **系统计算有 9 处**（权重分、三率、口碑、环比、榜单聚合、信源统计、归因回写、渠道刷新、槽位状态机），全部已实现；
- **规则流水线 1 处**（引用归一化）有 stub 待补；
- **报告装配依赖的 `report` service 整个缺失**。

要「采集 → 解析 → 面板」整链路打通，最小补丁集是：① 实现 `extractRankedList` / `extractOpinions`（LLM JSON 抽取，schema 可仿 onboarding 的 chatJson 风格）；② 新建 `service/report.js`（或 report 目录）实现 report_build 引用的 10 个方法；③ 补 citation 的域名→站点映射。以上按顺序先做 ①，解析层即通；②③ 属于报告与信源展示层。
