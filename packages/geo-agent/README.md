# @geo-admin/geo-agent

GEO 首登分析 Agent：**品牌名 + 官网（可选）→ 完整字段集**（画像/别名/产品/竞品/监控问题候选/情报文）+ 过程留痕。

- 纯 CJS、**零运行时依赖**（Node ≥20 全局 fetch）；不 import egg/mongoose，模型与配置由宿主注入
- 大模型走**硅基流动** OpenAI 兼容协议，默认模型 `deepseek-ai/DeepSeek-V4-Flash`
- 选型说明：先以 zero-build CJS 库落地（当前唯一宿主 apps/gen-api 是 CJS Egg；`dist/` 不进工作区快照，避免构建产物丢失）。出现 ESM 消费者（如 Nuxt server route）时再加 tsup 双格式。

## 配置（环境变量）

| 变量 | 必填 | 说明 |
|---|---|---|
| `SILICONFLOW_API_KEY` | ✅ | 硅基流动密钥，**只走环境变量，不进代码库** |
| `SILICONFLOW_BASE_URL` | | 默认 `https://api.siliconflow.cn/v1` |
| `SILICONFLOW_MODEL` | | 默认 `deepseek-ai/DeepSeek-V4-Flash` |
| `TAVILY_API_KEY` | | 联网取证（`web_research` 工具循环）。配置后 DeepSeek 经 `web_search` 工具调 **Tavily** 真实检索，结果标 `search_grounded: true`；未配置不联网、诚实标 `llm_estimate`。basic 档 1 credit/次，免费额度 1000 credits/月 |

> 热度验证（候选问题按真实命中量重排）的 Provider **暂缺**：SerpAPI 已停用、Bing Search API 已于 2025-08-11 退役、Tavily 不返回总命中数（语义不匹配）。当前 `weight_source` 恒为 `llm_estimate`，自建搜索就绪后在 `src/search.js` 的 `createSearchProvider` 恢复分支即可（返回 `{ name, query(q) → number\|null }`）。

## 用法

```js
const { createSiliconFlowClient, runOnboarding, persistResult } = require('@geo-admin/geo-agent');

const llm = createSiliconFlowClient({ apiKey: process.env.SILICONFLOW_API_KEY });
const result = await runOnboarding(
  { llm },                                   // searchProvider? fetchImpl? 可选
  { brand_name: 'HANYUAI 图像助理', website: 'hanyuai.com', query_limit: 8 },
  ev => console.log(ev.type),                // 过程事件（SSE 直推用）
);
// result: { brand, profile, aliases, products, competitors, keywords,
//           candidates[], library_doc, traces[], usage[], weight_source }

await persistResult(models, {                // models = egg-mongoose 的 ctx.model
  userId, brandId?, taskId?, result,
  nextSeq,                                   // query_id 自增序列（api 侧提供）
  selectedQueries: ['免费AI绘图工具哪个好用'],  // 可选：用户勾选子集 → user_confirm 留痕
});
```

## 事件流（onEvent / SSE）

`stage(crawl→analyze→queries→weigh→library→done)`、`trace`（kind ∈ search_query/page_read/keyword_weight/llm_output，user_confirm 在 persist 侧）、`profile`、`candidates`、`library`、`done`。

## 联网取证（Function Calling，非托管开关）

DeepSeek/硅基流动的 OpenAI 兼容接口没有"联网开关"参数；联网的正解是**工具调用循环**：模型主动发起 `web_search(query)` → 本库执行真实搜索（`createWebSearch`，当前为 **Tavily**，返回清洗后正文而非 SERP 摘要）→ 结果以 tool 消息回填 → 画像/候选生成基于证据。约束：JSON Mode 与 tools 互斥，循环结束后才走结构化抽取。配置了 `TAVILY_API_KEY` 时结果标 `search_grounded: true`、检索词全部落 `onboarding_traces`；未配置则不联网且保持 `llm_estimate`，不假装验证过。SerpAPI 分支已注释停用（Bing Search API 已于 2025-08-11 退役），自建搜索上线后在 `src/search.js` 恢复/替换。

## 测试

```bash
pnpm --filter @geo-admin/geo-agent test          # 离线契约桩（含工具循环场景，零网络）
SILICONFLOW_API_KEY=sk-*** pnpm --filter @geo-admin/geo-agent test:live   # 真机
```
