'use strict';
/**
 * AgentRunner：@geo-admin/geo-agent 的 Egg 薄适配层
 * 职责：注入 LLM 供应商配置（config.llm 统一入口，OpenAI 兼容，默认 deepseek，可切 mistral/siliconflow/agnes）、
 *       搜索 Provider/mongoose models/nextSeq，其余编排全在库里。
 * 另：首登各步 usage 写入 llm_call_logs（geo-agent 自带客户端，不经 deepseek 服务）。
 */
const { Service } = require('egg');
const { createSiliconFlowClient, createSearchProvider, createWebSearch, runOnboarding, persistResult, sanitizePreview } = require('@geo-admin/geo-agent');

const ONBOARD_SITE_MAP = {
  web_research: 'ONBOARD_WEB',
  profile: 'LLM-01',
  queries: 'LLM-04',
  library: 'ONBOARD_LIBRARY',
};

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  const prompt = Number(usage.prompt_tokens) || 0;
  const completion = Number(usage.completion_tokens) || 0;
  const total = Number(usage.total_tokens) || (prompt + completion);
  return { prompt_tokens: prompt, completion_tokens: completion, total_tokens: total };
}

class AgentRunnerService extends Service {
  buildDeps() {
    const { app } = this;
    const cfg = app.config.llm || app.config.siliconflow || {};
    const llm = createSiliconFlowClient({
      apiKey: cfg.apiKey, apiKeys: cfg.apiKeys, baseURL: cfg.baseURL, model: cfg.model,
      chatTemplateKwargs: cfg.chatTemplateKwargs,
      extraBody: cfg.extraBody,
      proxy: cfg.proxy || undefined,
    });
    const bochaKey = (app.config.bocha || {}).apiKey || '';
    const tavilyKey = (app.config.tavily || {}).apiKey || '';
    return {
      llm,
      searchProvider: createSearchProvider({}),
      webSearch: createWebSearch({ bochaKey, tavilyKey }),
    };
  }

  /** 将 geo-agent result.usage 写入 llm_call_logs */
  async _logOnboardingUsage(userId, brandId, taskId, usageList) {
    const { ctx } = this;
    const cfg = ctx.app.config.llm || ctx.app.config.siliconflow || {};
    const model = cfg.model || '';
    for (const row of usageList || []) {
      try {
        await ctx.model.LlmCallLog.create({
          call_site: ONBOARD_SITE_MAP[row.step] || `ONBOARD_${String(row.step || 'STEP').toUpperCase()}`,
          user_id: String(userId || ''),
          brand_id: String(brandId || ''),
          ref_id: String(taskId || ''),
          prompt_version: 'v1',
          model,
          usage: normalizeUsage(row.usage),
          latency_ms: 0,
          success: true,
          retry: 0,
        });
      } catch (e) {
        ctx.logger.warn(`[agent] 写首登 usage 失败 step=${row.step}: ${e.message}`);
      }
    }
  }

  async analyze(input, onEvent) {
    return runOnboarding(this.buildDeps(), input, onEvent);
  }

  /** 预览分析（不落库）并记账到该用户（brand 稍后在 confirm 时回填） */
  async analyzeAndLog(userId, input, onEvent) {
    const result = await runOnboarding(this.buildDeps(), input, onEvent);
    await this._logOnboardingUsage(userId, '', '', result && result.usage);
    return result;
  }

  async runAndPersist(userId, input, { brandId, taskId, selectedQueries, selectedAliases, confirmLimit } = {}, onEvent) {
    const { ctx } = this;
    const result = await runOnboarding(this.buildDeps(), input, onEvent);
    const saved = await persistResult(ctx.model, {
      userId, brandId, taskId, result,
      nextSeq: name => ctx.service.onboarding.nextSeq(name),
      selectedQueries, selectedAliases, confirmLimit,
    });
    await this._logOnboardingUsage(
      userId,
      (saved && saved.brand_id) || brandId,
      (saved && saved.task_id) || taskId,
      result && result.usage,
    );
    if (saved && saved.brand_id) {
      const brand = await ctx.model.Brand.findOne({ brand_id: saved.brand_id }).lean();
      await ctx.service.brandScope.ensureFreeSubscription(userId, brand || { brand_id: saved.brand_id });
    }
    return { result, saved };
  }

  /**
   * 两段式第二步：确认落库。预览阶段已写过 usage（无 brand），此处回填 brand_id/ref_id。
   */
  async persistPreview(userId, preview, { brandId, taskId, brandName, selectedQueries, selectedAliases, confirmLimit } = {}) {
    const { ctx } = this;
    const result = sanitizePreview(preview);
    if (typeof brandName === 'string' && brandName.trim()) {
      const name = brandName.trim().slice(0, 60);
      result.brand.name = name;
      // 旧正式名若与新名不同，且未在别名列表中，自动保留为别名，便于命中
      const prevName = String((preview && preview.brand && preview.brand.name) || '').trim();
      if (prevName && prevName.toLowerCase() !== name.toLowerCase()) {
        const list = Array.isArray(selectedAliases)
          ? selectedAliases.map(String)
          : (Array.isArray(result.aliases) ? result.aliases.slice() : []);
        const seen = new Set(list.map(a => String(a || '').trim().toLowerCase()).filter(Boolean));
        if (!seen.has(prevName.toLowerCase()) && !seen.has(name.toLowerCase())) {
          list.unshift(prevName);
        }
        selectedAliases = list;
      }
    }
    if (!result.brand.name || result.brand.name === '未命名品牌') {
      throw new Error('preview 缺少有效的品牌信息，请重新分析');
    }
    const saved = await persistResult(ctx.model, {
      userId, brandId, taskId, result,
      nextSeq: name => ctx.service.onboarding.nextSeq(name),
      selectedQueries, selectedAliases, confirmLimit,
    });
    const bid = (saved && saved.brand_id) || brandId || '';
    const tid = (saved && saved.task_id) || taskId || '';
    if (bid) {
      const since = new Date(Date.now() - 30 * 60 * 1000);
      await ctx.model.LlmCallLog.updateMany(
        {
          user_id: String(userId || ''),
          brand_id: '',
          created_at: { $gte: since },
          call_site: { $in: Object.values(ONBOARD_SITE_MAP) },
        },
        { $set: { brand_id: String(bid), ref_id: String(tid) } },
      ).catch(() => {});
      const brand = await ctx.model.Brand.findOne({ brand_id: bid }).lean();
      await ctx.service.brandScope.ensureFreeSubscription(userId, brand || { brand_id: bid });
    }
    return { result, saved };
  }
}

module.exports = AgentRunnerService;
