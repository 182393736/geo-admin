'use strict';
/**
 * AgentRunner：@geo-admin/geo-agent 的 Egg 薄适配层
 * 职责：注入硅基流动配置/搜索 Provider/mongoose models/nextSeq，其余编排全在库里。
 */
const { Service } = require('egg');
const { createSiliconFlowClient, createSearchProvider, createWebSearch, runOnboarding, persistResult, sanitizePreview } = require('@geo-admin/geo-agent');

class AgentRunnerService extends Service {
  buildDeps() {
    const { app } = this;
    const cfg = app.config.siliconflow || {};
    const llm = createSiliconFlowClient({ apiKey: cfg.apiKey, baseURL: cfg.baseURL, model: cfg.model });
    // 联网取证：优先用 config.tavily.apiKey（env > dev-keys 内置测试密钥），为空则自动降级不联网
    // 热度验证 Provider 暂缺（SerpAPI/Bing 已停用，自建搜索后接入）→ 诚实保持 llm_estimate
    const tavilyKey = (app.config.tavily || {}).apiKey || '';
    return { llm, searchProvider: createSearchProvider({}), webSearch: createWebSearch({ tavilyKey }) };
  }

  /** 只跑分析不落库：返回完整 result（预览/调试用） */
  async analyze(input, onEvent) {
    return runOnboarding(this.buildDeps(), input, onEvent);
  }

  /** 跑分析并落库；selectedQueries 传入时按用户勾选保存 */
  async runAndPersist(userId, input, { brandId, taskId, selectedQueries, confirmLimit } = {}, onEvent) {
    const { ctx } = this;
    const result = await runOnboarding(this.buildDeps(), input, onEvent);
    const saved = await persistResult(ctx.model, {
      userId, brandId, taskId, result,
      nextSeq: name => ctx.service.onboarding.nextSeq(name),
      selectedQueries, confirmLimit,
    });
    return { result, saved };
  }

  /**
   * 两段式第二步：用户对前端回传的 preview 勾选后确认落库
   * preview 是不可信输入 → sanitizePreview 全量重建后再持久化
   */
  async persistPreview(userId, preview, { brandId, taskId, selectedQueries, confirmLimit } = {}) {
    const { ctx } = this;
    const result = sanitizePreview(preview);
    if (!result.brand.name || result.brand.name === '未命名品牌') {
      throw new Error('preview 缺少有效的品牌信息，请重新分析');
    }
    const saved = await persistResult(ctx.model, {
      userId, brandId, taskId, result,
      nextSeq: name => ctx.service.onboarding.nextSeq(name),
      selectedQueries, confirmLimit,
    });
    return { result, saved };
  }
}

module.exports = AgentRunnerService;
