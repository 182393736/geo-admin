# @geo-admin/geo-agent

GEO 首登分析 Agent：**品牌名 + 官网（可选）→ 完整字段集**（画像/别名/产品/竞品/监控问题候选/情报文）+ 过程留痕。

- 纯 CJS、**零运行时依赖**（Node ≥20 全局 fetch）；不 import egg/mongoose，模型与配置由宿主注入
- 大模型走**硅基流动** OpenAI 兼容协议，默认模型 `deepseek-ai/DeepSeek-V4-Flash`
- 选型说明：先以 zero-build CJS 库落地（当前唯一宿主 apps/api 是 CJS Egg；`dist/` 不进工作区快照，避免构建产物丢失）。出现 ESM 消费者（如 Nuxt server route）时再加 tsup 双格式。

## 配置（环境变量）

| 变量 | 必填 | 说明 |
|---|---|---|
| `SILICONFLOW_API_KEY` | ✅ | 硅基流动密钥，**只走环境变量，不进代码库** |
| `SILICONFLOW_BASE_URL` | | 默认 `https://api.siliconflow.cn/v1` |
| `SILICONFLOW_MODEL` | | 默认 `deepseek-ai/DeepSeek-V4-Flash` |
| `SERPAPI_KEY` / `BING_SEARCH_KEY` | | 配置后候选问题按**真实搜索命中量**重排赋权（10/9/8…）；未配置则保留 LLM 估计并在 trace 标 `llm_estimate` |

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

## 测试

```bash
pnpm --filter @geo-admin/geo-agent test          # 离线契约桩（零网络）
SILICONFLOW_API_KEY=sk-*** pnpm --filter @geo-admin/geo-agent test:live   # 真机
```
