# DeepSeek 调用点设计与提示词全表（GEO 后台）

> 全系统所有 LLM 调用统一走 `app/service/llm/deepseek.js` 的 `chatJson()`（强制 JSON Mode + 失败修复重试）。
> 所有调用点都是 **DeepSeek-V3 系列 `deepseek-chat`**（OpenAI 兼容端点 `POST https://api.deepseek.com/chat/completions`）。
> 下表按施工清单顺序编号（#列对回 `GEO后台施工顺序清单.md`）；每点五要素：**触发时机 · 输入数据 · 提示词 · 输出结构 · 落库去向**。

## 全表速览

| ID | 施工步 | 调用场景 | 时机 | 输出落库 |
|---|---|---|---|---|
| LLM-01 | #21 | 品牌画像生成 | onboarding 任务 crawl 段 | `brand_profiles` |
| LLM-02 | #21 | 品牌别名扩展 | onboarding 画像完成后 | `brand_aliases` |
| LLM-03 | #21 | 行业关键词生成 | onboarding keyword 段 | `onboarding_tasks.keywords` |
| LLM-04 | #21 | 监控问题生成（双形态） | onboarding query 段 | `mined_topics` + `monitor_queries` |
| LLM-05 | #73 | 话题挖掘（增量） | 用户点"挖掘监控问题" | `mined_topics` |
| LLM-06 | #28 | 问题语义归并 | 用户在管理页点"批量归并" | `query_groups` + 标记 |
| LLM-07 | #45 | 榜单抽取（流水线A） | 每天 04:00 每条排名题回答 | `brand_mentions` + `brand_entities` |
| LLM-08 | #45 | 品牌实体名归一（辅助） | 抽取后未知实体校验 | `brand_entities.name_variants` |
| LLM-09 | #48 | 口碑观点拆解（流水线B） | 每天 04:00 每条口碑题回答 | `opinions` + `opinion_topics` |
| LLM-10 | #48 | 话题归并（variants） | B 流水线内部二次合并 | `opinion_topics` |
| LLM-11 | #76 | 周报文字摘要 | 报告装配期 payload.summary | `reports.payload.summary` |
| LLM-12 | W4/W7 | 洞察建议（缺口→措施） | 引用源洞察页/写作选题 | 页面内嵌文案 |
| LLM-13 | #103 | 写作 Agent 选题 | 写作工作开始 | `writing_jobs.topic` |
| LLM-14 | #103 | 写作大纲 | Agent 节点 2 | `writing_jobs.outline` |
| LLM-15 | #103 | 循证正文 | Agent 节点 3 | `articles_generated.content_md` |
| LLM-16 | #103 | 事实核验护栏 | Agent 节点 4 | `writing_jobs.guardrail_report` |
| LLM-17 | #105 | 草稿修改（patch-draft） | 用户在编辑页给指令 | `articles_generated` 更新 |
| LLM-18 | #113 | 诊断别名推荐 | 单次诊断下单前 | `diagnosis_tasks.aliases` |

---

## LLM-01 品牌画像生成（Onboarding · crawl 段）

- **触发**：`POST /user/brands/analyze` 后异步任务第一段
- **输入**：官网 HTML 正文（截断 8000 字）+ 品牌名 + 用户填的业务描述 + 搜索引擎摘要片段
- **temperature**: 0.3 · **max_tokens**: 1500

**System 提示词**
```
你是 B2B 品牌分析专家。根据用户提供的官网正文与用户自填资料，输出该品牌的结构化画像。
只依据输入资料中的事实，禁止编造未出现的产品、数字、资质。字段缺失就留空字符串或空数组。
输出 JSON。
```

**User 模板**
```
品牌名：{brand_name}
用户自填业务描述：{business_desc}
官网正文：---
{website_text}
---
搜索摘要：{search_snippets}
```

**输出结构（写入 `brand_profiles` + 回填 `brands`）**
```json
{
  "company_name": "规范公司全称", 
  "industry": ["公共家具制造"],            // 1~3 个国标类目短语
  "website": "https://...", 
  "slogan": "", 
  "description": "200字内品牌定位+目标客群总结",
  "target_customers": ["学校及教育机构"],  // 客群数组
  "scripts": ["以公共家具为定位焦点", ...], // 3~5 条对外话术要点
  "tone": {"style": "专业务实", "avoid": ["夸大宣传"]}
}
```

---

## LLM-02 品牌别名扩展

- **触发**：LLM-01 完成后 · **输入**：规范公司名、description、行业
- **temperature**: 0.2 · **落库**：`brand_aliases`（source=auto）

**System**：`你是品牌实体识别专家，识别品牌在中文互联网可能被 AI 引用的所有称呼。输出 JSON。`
**User**
```
公司全称：{company_name}
画像描述：{description}
请给出 AI 在推荐/回答场景可能使用的别名：简称、缩略、常见口语叫法、英文名(如有)。
每个别名给 confidence(0-1)，只保留 ≥0.6 的。
```

**输出**
```json
{ "aliases": [ {"alias": "宏祥盛誉", "confidence": 0.92, "kind": "字号称谓"}, 
               {"alias": "宏祥家具", "confidence": 0.9, "kind": "简称"} ] }
```
> ⚠️ 这是 `brand_mentions.is_target` 命中率的决定因素，错了全站提及率系统性偏差。

---

## LLM-03 行业关键词生成

- **触发**：onboarding keyword 段 · **落库**：`onboarding_tasks.keywords`（同时回填 `/user/info.key_words` 投影）
- **输入**：brand_profiles 输出 + 竞品（若有）

**User**
```
基于品牌画像，生成 10~20 个潜在客户在采购决策时会搜索/提问的行业关键词（名词短语，非句子）。
例：礼堂椅、课桌椅、阶梯排椅。
要求表述与"宏祥家具实业有限公司"的产品线对应，避免过泛（如"家具"）。
```
**输出**：`{ "keywords": ["礼堂椅", "课桌椅", ...] }`

---

## LLM-04 监控问题生成（★ 最关键的一次生成，决定整个监测面）

- **触发**：onboarding query 段 · **落库**：`monitor_queries`（8 条内，遵守 subscription.query_limit）+ `mined_topics`（候选池多余部分 status=candidate）
- **temperature**: 0.4

> **⚠️ 口径变更（重要）**：监控问题**一律行业中立，不得出现品牌名/别名/英文名/公司主体名/官网域名**。
> 客户要测的是「行业里的真实用户问 AI 时，AI 会不会主动提到我的品牌」——问题里一旦带了品牌名，
> AI 必然顺着提到该品牌，提及率/排名/口碑全部失真（等于自问自答），监测就失去意义。
> 因此**不再产出 `query_type='brand'` 的口碑题**；口碑改由中立问题里 AI **自发提及**的品牌拆解得出（流水线 B）。
> 该约束不只写在提示词里，还有**代码级硬闸门**兜底（见下）。

**System**
```
你是中文 AI 搜索行为研究专家。为「AI 搜索可见性监测」生成监控问题候选集：
模拟一个不认识该品牌的普通用户向 AI 助手提问，用来观察 AI 会不会自己提到该品牌。
每条问题输出两种形态：
- user_friendly：给用户看的短形态（名词+需求，如"礼堂椅厂家推荐"）
- platform_query：实际发给 AI 的完整问句（带采购场景，如"采购礼堂椅厂家推荐"）
【硬性禁止】query / user_friendly / platform_query 三段文本里都不得出现：品牌名、品牌简称或别名、英文名、公司主体名、产品名。
  反例（禁止）：「XX怎么样，口碑好不好」「XX和YY哪个好用」「XX官网入口」
  正例（照此写）：「礼堂椅厂家推荐」「报告厅座椅怎么选」「学校课桌椅采购要注意什么」
【角度覆盖】品类推荐 / 场景选型 / 功能对比 / 价格预算 / 避坑评价，尽量分散。
禁止生成带绝对化词汇（最好/第一/最强）和违规词的问句。
```

**User 模板**
```
品牌（仅用于理解业务，禁止出现在问题里）：{company_name}
行业关键词：{keywords}
客群：{target_customers}
【禁止出现的词】{brand_tokens}（含大小写变体、简称与中英文混写）
请生成 {quota} 条监控问题，全部为行业中立问法，每条附 intent 分类与 weight(1~10 热度)。
```

**输出结构（对齐实测 `/query/list` 字段）**
```json
{
  "queries": [
    {
      "query_type": "industry",
      "question_list": [{"user_friendly": "礼堂椅厂家推荐", "platform_query": "采购礼堂椅厂家推荐"}],
      "intent": "厂家推荐",
      "weight": 10
    },
    {
      "query_type": "industry",
      "question_list": [{"user_friendly": "报告厅座椅怎么选", "platform_query": "报告厅座椅怎么选，有哪些注意事项"}],
      "intent": "场景选型",
      "weight": 8
    }
  ]
}
```

**代码级硬闸门（提示词之外的兜底，实现在 `packages/geo-agent/src/neutral.js`）**

LLM 不保证听话，所以生成后必须再过一遍黑名单：

| 环节 | 做法 |
|---|---|
| 黑名单构造 | `buildBrandTokens({ name, company, aliases, website, extra })` → 品牌名 + 公司主体 + 别名 + 官网域名主体 + 用户原始入参，归一化（全角→半角、转小写、去空白标点）后去重 |
| 通用词豁免 | 品牌名恰好叫「智能」「推荐」这类词时不进黑名单，避免误杀正常行业问法 |
| 剔除范围 | 一条候选的 `query` / `platform_prompt` / `question_list[].user_friendly` / `question_list[].platform_query` 任一命中即整条剔除 |
| 剔除留痕 | `onboarding_traces`（kind=`llm_output`, meta.step=`queries_brand_filter`）记录被剔问题与命中的指纹，供 badcase 归因 |
| 纠偏重试 | 剔除后不足 3 条时，带被剔样本再要一轮（最多一次），避免候选清零 |
| 确认前复检 | 浏览器回传的 `preview` 属不可信输入，`sanitizePreview` 用重建后的画像再过一遍闸门，防止用户手工塞自问自答题把指标做假 |

---

## LLM-05 话题挖掘（持续增量）

- **触发**：话题挖掘页"开始挖掘" · **落库**：`mined_topics`
- **输入**：现有 monitor_queries（去重用）+ 近 30 天 citation_edges 引用文中高频问题表述 + 现有榜单暂无覆盖缺口
- **temperature**: 0.6（要发散）
- **输出**
```json
{ "topics": [ {"query_text": "...", "semantic_hash": "md5(规范化)", 
               "volume_hint": 0~100, "competition_hint": 0~100, "rationale": "为何值得监测"} ] }
```
> 蓝海策略：volume 高 + competition 低 的优先建议（官网实测口径）。

---

## LLM-06 问题语义归并（batch_generalize）

- **输入**：用户勾选的一组 query 文本
- **System**：`把语义等价的提问归到一个语义槽，为每槽选一个代表性的 platform_query`
- **输出**
```json
{ "groups": [ {"slot": "礼堂椅厂家推荐", "member_texts": ["..."], "keep_query": "采购礼堂椅厂家推荐"} ] }
```
> 落库：被归并的成员转 query_groups / 软删，实测视角"76% 语义坍塌"。

---

## LLM-07 榜单抽取（流水线 A · 每天 04:00 · 全站数据质量天花板）

- **触发**：`daily_parse`，读取 `raw_answers where query_type=industry and parsed=false`
- **输入**：`answer_text`（原始回答，可能含 markdown 列表/序号）
- **temperature**：**0**（抽取要确定性）· max_tokens 2048

**System 提示词（线上逆向出的行为目标）**
```
你是搜索答案名词抽取器。从 AI 回答中抽取"推荐/排名的品牌有序的名单"。
规则：
1. 只回答中明确按顺序出现的品牌/公司/厂商名称；未排序的散点提及不算
2. position 从 1 开始按文中先后/排名编号
3. name 用文中出现的原始写法（含括号内注释），不要自行翻译/补全
4. snippet 截取该名称前后 50 字原文作为证据
5. 若回答中不存在有序名录，返回 has_list=false
输出 JSON。
```

**User**：`问题：{platform_query}\n回答：---\n{answer_text}\n---`

**输出结构（每条 position 记录 → `brand_mentions` 一行）**
```json
{
  "has_list": true,
  "list": [
    {"name": "河北润华体育器材制造有限公司", "position": 1, "snippet": "文中上下文"},
    {"name": "澳舒健 OSJ", "position": 2, "snippet": "..."}
  ],
  "answers_tone": "中性推荐"   // 备用：答案口吻
}
```
> 落库后处理（非 LLM）：查 `brand_aliases` 归一 → `is_target`，未知名 upsert `brand_entities`（scope=discovered）。

---

## LLM-08 实体名归一辅助（低权限、谨慎）

- **触发**：pipeline A 中，发现疑似同一实体的多种写法（如"大丰dafeng"/"浙江大丰实业(大丰 DAFENG)"）
- **System**：`判断两个品牌名是否指向同一商业实体；输出合并建议`
- **输出**：`{"same_entity": true, "canonical": "大丰", "reason": "..."}` → 命中则合并进 `brand_entities.name_variants`
> ⚠️ 人工修正入口 `/competitor/name-corrections` 永远优先于 LLM 自动合并。

---

## LLM-09 口碑观点拆解（流水线 B)

- **触发**：`daily_parse`，品牌题回答 · **temperature**: 0（要稳定）
- **输入**：`answer_text` + 该品牌别名表

**System**
```
你是中文舆情语义分析引擎。拆解 AI 对某品牌评价回答，输出观点单元数组。
每个观点单元：
- quote：原文短句（必须原样截取，不改写，禁止编造）
- label：≤6字的话题标签（如 性价比高/交期快/评价少）；同义表述要复用同一 label
- polarity：positive / neutral / negative（按对品牌影响判官）
- target：观点指向的品牌（默认本品牌）
```

**输出（逐条 → `opinions`）**
```json
{ "opinions": [
    {"quote": "交期快（现货3-7天）", "label": "交期快", "polarity": "positive", "target": "宏祥盛誉"},
    {"quote": "行业积淀不足", "label": "行业积淀不足", "polarity": "negative", "target": "宏祥盛誉"}
] }
```
> 实测 `reputation_data` 中"交期快/交付较快"两个话题并存——说明线上**话题归并滞后**，所以补了 LLM-10。

---

## LLM-10 话题归并（观点词典自净）

- **触发**：pipeline B 大批量写完后，`opinion_topics` 按 brand 做周期性合并
- **输入**：该品牌现有全部 label（≤100 条）+ 每个 label 的示例 quote
- **输出**
```json
{ "merges": [ {"keep": "交期快", "merge": ["交付较快","交付快"], "reason": "同义"} ] }
```
> 执行：`opinions.topic_id` 批量迁移 + `opinion_topics.variants` $addToSet 归总变体。

---

## LLM-11 周报文字摘要

- **触发**：report_build 时（metrics 已算好）
- **输入**：`{metrics, engines top3/first/mention/delta, sourceChanges, competitors top5, writing}` 打包压缩
- **temperature**: 0.4 · **非 JSON Mode**（自由短文本）
- **System**：`你是数据分析师，用 150 字内中文总结本期 GEO 表现：一句话总体+两个亮点+一个风险点+一个下周建议，不要罗列数字`
- **输出**：纯文本 → `reports.payload.summary`（实测线上为空=未启用，可以从这里做差异化功能点）+ `competitorNote`

---

## LLM-12 洞察建议（引用源洞察/机会缺口）

- **触发**：source-intelligence 页 payload 组装末尾（或预计算到 daily 表）
- **输入**：heatmap 数据（源×问题、own_rate、竞品占优标记）
- **输出**
```json
{ "insights": [ {"type": "help", "text": "「DeepSeek × 官方网媒」为竞品核心阵地（被引287次，你方占比12%）"},
                {"type": "action", "text": "建议：官方网媒补位 2 篇 · 抢占元宝问答社区首批引用位"} ] }
```
> 实测页面"本期洞察"就是这种结构的文案 → 服务端生成而非前端模板。

---

## LLM-13 写作选题（Agent 步骤1）

- **输入**：mention_rate 下降题 / 无提及题（蓝海缺口）+ evidence_items 可用量 + 用户指定的 query_id（可选）
- **输出**
```json
{ "topics": [ {"title": "礼堂椅采购时，厂家资质齐全有多重要", "target_query_id": 37935,
               "angle": "错维打击，用资质清单体抢被引", "evidence_ids": ["ev-..."]} ] }
```

## LLM-14 写作大纲（Agent 步骤2）

- 输入：选中 topic + 关联 evidence 摘录 + 品牌画像/知识库摘要
- 输出：`{"outline":[{"h2":"...", "points":["..."], "evidence_ids":[...]}]}`（每节绑定允许引用的循证 id，**强行约束来源**）

## LLM-15 循证正文（Agent 步骤3 · 防编造的核心闸门）

**System**
```
你是科技务实编辑。只能使用【循证材料】中的事实，禁止引入材料之外的任何数据/案例/数字。
每出现一个事实陈述，必须可对应到某条 evidence_id；做到"AI 会愿意引用"的答案型结构
（先给结论/清单，给对比表，给 FAQ）。
```

**User**：`大纲：{outline}\n【循证材料】{evidence_pack}\n品牌资料库摘要：{kb_pack}`
- 输出：`{"title":"...","content_md":"...","citations":[{"anchor":"文中片段","evidence_id":"..."}]}` → `articles_generated.content_md`

## LLM-16 事实核验护栏（Agent 步骤4）

- 输入：正文 + 该文允许使用的 evidence_pack
- System：`逐条核对正文中数据性陈述是否可被证据支持；同时做禁用词扫描（广告法违禁/绝对化）`
- 输出：
```json
{"pass": false, "issues":[{"sentence":"...", "kind":"无法证实|违禁词|数据失实", "suggestion":"..."}]}
```
→ `writing_jobs.guardrail_report`，pass=false 触发人工或自动改写节点。

## LLM-17 草稿修改（patch-draft）

- 输入：原 content_md + 用户自然语言指令（"把第二段改成厂家对比表"）
- 输出：`{"content_md": "修改后全文", "diff_summary":"本次改动点"}`
> 契约对应线上 `POST /api/article/report/patch-draft`。

## LLM-18 诊断别名推荐（单次诊断）

- 输入：用户给的品牌名/官网链接/文档全文片段
- 输出：同 LLM-01+02 的轻量合并版 `{official_name, aliases[], industry，confidence}` → `diagnosis_tasks.aliases`
> 对应线上 `/diagnosis/aliases/suggest`。

---

## 全局工程约定（贴进 `app/service/llm/` 每个调用文件头注释）

| 约定 | 值 |
|---|---|
| 模型 | `deepseek-chat`（输出超长时大纲/正文可 `max_tokens=8192`）|
| temperature | 抽取/核验 0 · 归并/别名 0.2-0.3 · 选题/挖掘 0.4-0.6 |
| JSON | 一律 `response_format: json_object` + `chatJson` 修复重试 |
| 幂等 | 同一 answer_id 的 A/B 抽取必须可重跑：服务层 `(slot_id, entity, position)` 唯一键 upsert |
| 成本监控 | 每次调用记录 `usage`（入库 `llm_call_logs`：{call_site, tokens, cost, latency, ok}，建议补建此表做 DeepSeek 账单核对） |
| 降级 | LLM 连续失败 3 次 → 槽位标记 fail 记 logs，日终告警，不阻塞当天其余解析 |

> 📌 建议新增一张表 `llm_call_logs`（model 30 行）：每张调用票= `{call_site:'LLM-07', input_hash, prompt_version, model, usage, latency_ms, success, retry}`，prompt_version 用于日后回溯"哪个版本的提示词生产的这批数据"。

*生成日期：2026-08-31 · 与前序交付：施工清单（#编号互相对齐）· 45 个 model · metrics.js*
