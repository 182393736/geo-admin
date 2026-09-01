# 透镜GEO：从原始采集到页面展示 —— 业务闭环与数据流全梳理

> 分析方法：真实账号登录 + 全页面接口抓包（749 次请求实录）+ 前端 JS 逆向 + 响应体逐级拆解。
> 文中所有示例数值均取自实测品牌「佛山市宏祥家具实业有限公司」2026-08-25 ~ 08-31 周期真实数据。
> 标注约定：✅ = 已从接口/代码直接验证；🔎 = 基于数据逆向推断。

---

# 总览：五环业务闭环

```
┌─────────────────────────────────────────────────────────────────────┐
│  ① 配置层：品牌建档 → 监控问题生成（Onboarding / 话题挖掘）            │
│       ↓ 产出：监控问题表（7 排名题 + 1 口碑题）                         │
│  ② 采集层：每日对 5 大 AI 引擎中立模拟提问（槽位 = 问题 × 引擎）         │
│       ↓ 产出：原始回答全文 + 引用链接 + 截图存证（OSS）                  │
│  ③ 解析层：4 条 NLP 流水线（榜单抽取 / 口碑语义 / 引用源归一 / 留证）     │
│       ↓ 产出：结构化事实表（品牌位次、观点单元、引用记录）               │
│  ④ 指标层：分聚合统计（提及率/Top3/首位/位次分/口碑分/信源情报）         │
│       ↓ 产出：各页面看板数据 + 周月报 payload                          │
│  ⑤ 行动层：信源情报 → 循证写作 Agent → 精准发稿 → 被引回流归因          │
│       ↺ 回流：cite_count 反哺第③④层，构成"监测→优化→验证"闭环          │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 第一环 配置层：品牌与监控问题的诞生

## 1.1 注册后引导流程（/onboarding，前端逐字段驱动状态机）

前端 `OnboardingPage.js` 揭示了完整的状态机（日志原样保留在 bundle 里）：

```
填品牌名 + 官网 URL + 业务描述(≤500字)
   │
   ├─ POST /api/… 提交分析 → 「开始AI分析」
   ├─ 前端轮询 GET /user/info，观察状态字段迁移：
   │     crawler_started_at    → 爬取官网/公开信息识别公司实体
   │     keyword_gen_started_at→ 「公司行业关键词分析」生成行业词
   │     query_list 有数据      → 问题已生成（user_friendly 形态）
   │
   └─ 确认问题 → 提交监测词 → 「生成分析报告」→ 跳转 dashboard
```

✅ 实测证据：`/user/info` 返回 `crawler_started_at / crawler_completed_at / keyword_gen_started_at / keyword_gen_completed_at / task_id / key_words / first_login` 等状态字段——**注册引导本质是一个异步 ETL 任务，前端靠轮询 user/info 驱动进度**。

## 1.2 监控问题的双形态结构 ✅

`GET /query/list` 每条监控问题：

```json
{
  "id": 37935,
  "query": "采购礼堂椅厂家推荐",           // 平台实际执行形态 platform_query
  "question_list": [{
    "user_friendly": "礼堂椅厂家推荐",       // 用户友好展示形态
    "platform_query": "采购礼堂椅厂家推荐"   // 实际发给 AI 引擎的形态
  }],
  "query_type": "industry",               // industry=排名题 / brand=口碑题
  "is_golden": false,                     // 金标问题标记
  "task_id": "9394cd31-...",              // 溯源到生成任务
  "weight": 1, "query_is_execute": true
}
```

- **问题来源三条路**：注册引导 AI 生成 →「话题挖掘」(/topic-discovery) AI 挖掘补充 →「监控问题管理」手动添加/修改/导入（`query/add`、`query/batch_generalize` 语义归并、分组 `query-group/*`）
- **套餐约束**：query_limit 直接卡死（入门版 8/8 已用满），`query/update`、`query/delete` 受额度限制 🔎
- 同一语义可多措辞合并归并（"同义变体不值得铺量"——官网文章与 `batch_generalize` 接口互证）

---

# 第二环 采集层：每日中立模拟提问（原始数据的源头）

## 2.1 采集单元 =「槽位 slot」✅

**槽位 = 监控问题 × AI 引擎 × 天**。这是全系统一切统计的**原子分母**：

| 实测验证 | 计算 |
|---|---|
| 当日应采集槽位 expected_slots=35 | 7 个排名题 × 5 引擎 ✅ |
| 当日查询量 collected_queries=40 | (7 排名题 + 1 口碑题) × 5 引擎 ✅ |
| 周报 terminals 每引擎 collected=49 | 7 题 × 7 天 ✅；web 端合计 245 = 49×5 ✅ |
| 周报 denominator=35 | 当日 7 题 × 5 引擎 ✅ |
| 采集完整率 completeness_rate=1.0 | actual 35 / expected 35 ✅ |

## 2.2 采集方式（官网 FAQ 与接口互证）✅

- **中立模拟账号**轮转向各引擎发问，不携带个性化历史（"去个性化"）；
- 覆盖 5 大国产引擎：**豆包 / DeepSeek / 文心一言 / 通义千问 / 元宝**，端区分 `web`（网页端）与 `mobile`（APP 端——口碑数据中可见 `mobile_doubao/mobile_deepseek/mobile_qwen` 平台记录）✅；
- 接口参数约定统一：`platforms:["doubao","deepseek","wenxin","qwen","yuanbao"]`、`end:"web"`、`start_date/end_date`；
- **过程留证**：每次问答截图存阿里云 OSS（`photo_url: geo-server.oss-cn-beijing.aliyuncs.com/screenshots/2026/08/30/...jpg`），供「搜索快照下载」页回放审计 ✅；
- **更新节奏**：FAQ 明示"监测以天为单位"；实测报告生成于次日 **05:05**、`stat_date` 为昨日、`updated_at` 当日下午补录——**离线批处理流水线，凌晨跑批** ✅。
- `/user/get_query_status` 提供当日采集实时进度（list 按槽位状态）。
- 另有 `POST /user/generate_today` 支持手动触发当日采集（未触发）。

> ✅ 口碑题该站还有 `kimi` 平台字段位（观点桶里预留 kimi 数组），说明管线按多引擎横向扩展设计，当前对客只开 5 家。

---

# 第三环 解析层：原始回答 → 结构化事实（4 条 NLP 流水线）

每日凌晨批处理对 40 条原始回答做四类解析：

## 流水线 A：榜单抽取（排名题）✅

```
原始回答文本 ──► 识别回答中的有序推荐名录 ──► 逐条目抽取品牌名+位次
              ──► 品牌名实体归一（匹配自家品牌名+别名宏祥盛誉/宏祥家具；
                   未知名称 → 自动进入竞品候选库）
```

证据：`/competitor/insight` 返回 `competitor_count=229`——**系统从答案里自动发现了 229 个竞争品牌实体**，用户只登记了 3 个竞品；榜单上每个品牌带 `is_target` 标志、`score`、位次。`/competitor/name-corrections`（品牌名修正）用于人工修正抽取错误，页面上也有"修正品牌名"按钮 ✅。

产出事实表（逻辑结构）：`{date, query_id, platform, [(brand_entity, rank_position), ...]}`

## 流水线 B：口碑语义拆解（口碑题）✅

对口碑题（如"宏祥盛誉怎么样，口碑好不好"）的回答做 LLM 语义拆解：

```
回答文本 ──► 抽取「观点单元」（原文短句，如"交期快（现货3-7天）"）
        ──► 语义归并为「话题标签」：同义变体合并（"交期快"⇋"交付较快"，
            variants_count 记录变体数），逐平台留痕原文 platforms{…}
        ──► 观点极性三分：positive / neutral / negative
        ──► 按天×平台聚合出 ratio，如 {positive:0.44, neutral:0.31, negative:0.25}
```

✅ 实测正向话题：「交期快、性价比高、资质齐全全工序自产…」；负向话题：「评价少、品牌溢价低、行业积淀不足」——与口碑页截图完全对应。

## 流水线 C：引用源归一化 ✅

```
回答附带的引用链接 ──► 域名/站点归一化为 canonical_source
                  ──► 打站点类目（抖音=视频、百度=搜索引擎、中国采购与招标网=企业服务、1688=电商…）
                  ──► 关联 (问题 × 引擎 × 日期)，逐源累计 ref_count
                  ──► 与「发稿渠道库」比对：knownSourceNames / own_article_count
```

✅ 实测一周（7×35 槽位）规模：`total_ref_count=4509` 次引用、`total_article_count=2368` 篇、`total_sources=522` 个站点；引擎取材分布 文心 1542 / 豆包 1071 / 元宝 867 / DeepSeek 595 / 通义 434。
✅ 自有归因：`own_source_count=1`（仅 1 个自家源被引）、每源带 `own_article_count`——这就是"发出去的稿有没有被 AI 引"的归因底座。

## 流水线 D：存证落地 ✅

截图 + 原始回答留档（`snapshot/export/*`、`/summary/get_references` 返回原文引用清单），支撑官网宣称的"过程存证、可回放、可审计"。

---

# 第四环 指标层：统计口径全解（每个数字怎么算出来的）

## 4.1 三大率 —— 口径均为「槽位占比」✅

分母恒为 `监控问题数 × 引擎数`（当日 35，周 49/引擎）：

| 指标 | 公式 | 实测值 |
|---|---|---|
| **品牌提及率** mention_rate | 品牌（含别名）出现在回答推荐名单的槽位数 / 总槽位 | 12/35 = **34.29%** ✅（豆包 3/7=42.86%、DeepSeek 4/7=57.14%…） |
| **Top3 推荐率** | 位次 ≤3 的槽位 / 总槽位 | 3/35 = 8.57% ✅ |
| **首位推荐率** | 位次 =1 的槽位 / 总槽位 | 2/35 = 5.71% ✅ |

趋势接口按天切片（`mention_rate_trend` 返回逐日 {numerator, denominator, rate} + 各平台分项）。

## 4.2 位次与位次分（score）✅/🔎

- 每槽位记录品牌位次 `rank_value`（"未提及" = 未上榜）；
- **位次权重分**：从竞品榜单数据可反推权重随位次递减——实测映射：第1名≈40、第2~3名≈20、第4~5名≈16、第6名≈13.3、第7~8名≈10、第9~10名≈8（量级）；日度品牌分 = 当日各槽位权重分聚合。🔎 权重确切曲线未在前端暴露，但实测 `visibility_trend` 证明**分随位次单调递减且与排名联动**：位次 2→24.7 分、位次 4→16.3/18.0、位次 7→12.0、位次 9→10.0 ✅（同日同位次分值不同 → 分是跨槽位**聚合**而非纯位次函数）。
- 全站榜单（`get_references/company_ranking_data`）据此排序输出 current_rank、环比 previous_rank、trend（new/up/down/stable）。

## 4.3 口碑分与风险评级 ✅

- 每平台每日口碑分 0~100（score_result 按 日×平台 输出网格）；
- **综合评级阈值**（前端 `SentimentPage.js` 逆向实锤）：

```javascript
score>=80 → "健康"(绿)   score>=60 → "中风险"(黄)   score<60 → "高风险"(红)
```

评级取数 = 正面观点占比×100：实测正面 54% → <60 → **"高风险"**（与页面截图完全一致 ✅）。
页面卡片另有 per 平台 risk 标记（high/medium/low）。

## 4.4 环比机制 ✅

所有"洞察/周报"接口成对传本期+上期（`cmp_start_date/cmp_end_date`），服务端返回 `xxxDelta`（如 DeepSeek mentionDelta=+10.21pct、文心 visibilityDelta=-17.1）→ 前端红绿箭头。周报 metrics 卡片即此产物。

## 4.5 信源情报四件套 ✅

| 接口 | 计算 | 页面 |
|---|---|---|
| engine_preference | 信源×引擎被引矩阵 + 环比增减 | 信源平台偏好「先做哪个引擎」排序 |
| source_trend | Top10 信源逐日被引序列 | 引用源洞察趋势图 |
| perspective | 信源列表 + `own_rate`（自家占比）+ 状态标签（持续被引）+ 竞争标签（竞品占优） | 源×问题透视表 |
| reference_source/stats | 分页明细 + top5_share（头部集中度 30.6%）+ platform_breakdown | 引用竞争格局 |

`cost_per_citation`（实测抖音源 0.07 元/被引）= 发稿售价 sell_price ÷ ref_count —— **"按被引成本挑渠道"的算式就藏在字段里** ✅。

## 4.6 周报装配 ✅

`report/latest` payload = 纯数据装配产物，12+ 个模块直推自上述指标：

- `trend`：自家 vs 头名竞品的逐日趋势对照（brand: [26.8,31.7,…] vs competitor: [97.1,95.7,…100]）
- `engines[]`：引擎六项（rank/top3/first/mention/citations/visibility）各带 Delta
- `metrics[]`：品牌提及率 31.02%(+4.08)、Top3 12.65%、首位 2.45%、平均排名 4.4、口碑分 77(+5)、引用源 521(-13)
- `monitor/sources/sourceChanges`：覆盖 5 引擎、命中引用源 521、**新增被引信源 220 / 流失 233**、库内经销源新增 20
- `competitors[]`：竞品五维榜（mention/top3/first/score/delta）
- `writing`：发文被引归因（drafted/published/cited/totalCitations/costPerCitation，当前全 0——没开写）
- 生成机制：`report/cycle` 设定周日截止、次日 05:05 跑批；模板"标准版"6 模块开关（monitor/metrics/compete/sources/channels/publish）；导出成独立报告页（`/r/:token` 分享链、periodic-report）。

---

# 第五环 行动层：闭环回流

```
信源情报给出[机会缺口]（own_rate 低 / 竞品占优 / 引擎偏好错配）
     │
     ├─► 循证写作 Agent（/dashboard/new-agent、new-writing）
     │     底座：品牌知识库(/api/brand/wiki/*) + 循证库(evidence-library)
     │     + 监测数据选题(propose-topics)；WebSocket /ws/article 流式产出
     │
     ├─► 精准发稿（media-library 按 cite-desc 排序 + cost_per_citation 挑源
     │     → publish-article 下单 → publish/orders 回传 status/published_url）
     │     案例：成功[中国品牌网 850积分 cite=0] / 失败[豆丁网 退款]
     │
     └─► 归因回流：次日采集若答中引到该稿 → own_article_count+1、
         cite_count 累积 → 周报 writing 模块 → "每篇 ROI" 可见
```

✅ 积分经济贯穿行动层：`credit/account`（金币/银币双轨、发稿冻结 publish_available）、订单号双前缀（CP=充值/套餐、PB=发稿）。

---

# 附 1：页面 ↔ 数据溯源对照表

| 页面 | 数据源（接口） | 展示物 ← 上游产物 |
|---|---|---|
| 情报总览 overview | report/latest + report/list + report/cycle | 品牌卡(8题/6竞品/40槽/188源)、周报卡片、四快捷动作 |
| AI排名透视 ai-index | full_ranking_matrix + mention/top3/first_trend + query-group/list | 三率卡、逐题逐引擎位次矩阵、趋势折线 |
| AI竞品透视 competitor-insight | competitor/insight (173KB) | 229 竞品榜、关键词下钻、平台五维对比 |
| 引用源追溯 citation-sources | reference_source/stats + summary/get_references | 源级分页明细、原文引用清单 |
| 信源平台偏好 source-preference | source_intelligence/engine_preference | 引擎×信源矩阵 |
| 引用源洞察 source-intelligence | source_intelligence/{source_trend,own_trend,perspective,topics} | 趋势+透视+自有归因 |
| AI口碑分析 sentiment | summary/reputation_data + ai_ranking_matrix + query/list?query_type=brand | 情感环图(评级)、情感走势、观点标签卡、原文引用 |
| 监控问题管理 topic-management | query/list、query-group/* | 双形态问题列表、分组 |
| 监控识别管理 monitor-recognition | brand/aliases + brand/intro | 识别词（别名用于实体归一） |
| 搜索快照下载 downloads | snapshot/export/list | OSS 截图证据链 |
| 信源库 media-library | publish/media/facets + publish/media/list | 渠道×被引×价格×成本 |
| 发布稿件/发稿记录/稿件追踪 | publish/article/drafts、publish/orders、article/library | 订单流与 cite 回流 |
| AGENT 系 (new-agent 等) | geoarticle articles/wiki/evidence-library + credit/account | 写作工作台 |
| 诊断 report-center | diagnosis/tasks | 单次诊断（独立计费） |
| 套餐/计费 | payment/plans/grouped、subscription/current、orders、credit/account | 价目、配额 8/8、钱包 330 |

# 附 2：一句话总结数据流

> **问题（配置）→ 每日槽位采集（原子事实）→ 4 条 NLP 流水线（结构化）→ 三率/位次分/口碑分/信源情报（指标）→ 页面看板 + 周月报（装配）→ 循证写作与发稿（行动）→ 被引回流（归因）**，分母永远是「问题×引擎×天」的槽位数，环比永远是「本期 vs 上一等长周期」。

---

*分析日期：2026-08-31 · 全部结论可回溯至 /home/user/api-crawl-data/ 原始报文*
