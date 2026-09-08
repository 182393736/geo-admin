'use strict';
/**
 * LLM 统一客户端（gen-api 侧所有 LLM 调用唯一入口）
 * ------------------------------------------------------------------
 * 协议：OpenAI 兼容 POST {baseURL}/chat/completions，默认跟随 config.llm 当前供应商
 *       （siliconflow / agnes / deepseek，LLM_PROVIDER 切换），向后兼容旧 config.deepseek。
 * 约定：所有结构化抽取强制 JSON Mode（response_format: json_object）；
 *       供应商不认该参数（400）时自动去掉重试一次；解析失败再按 JSON 修复重试一次。
 */
const { Service } = require('egg');

class DeepseekService extends Service {
  /** 当前供应商配置：config.llm（apiKey(s)/baseURL/model/chatTemplateKwargs）> config.deepseek */
  get cfg() {
    const llm = this.config.llm || {};
    const keys = (Array.isArray(llm.apiKeys) && llm.apiKeys.length)
      ? llm.apiKeys
      : (llm.apiKey ? [llm.apiKey] : ((this.config.deepseek || {}).apiKey ? [(this.config.deepseek || {}).apiKey] : []));
    return {
      apiKeys: keys,
      baseURL: (llm.baseURL || (this.config.deepseek || {}).baseURL || 'https://api.deepseek.com').replace(/\/+$/, ''),
      model: llm.model || (this.config.deepseek || {}).model || 'deepseek-chat',
      chatTemplateKwargs: llm.chatTemplateKwargs || null,
    };
  }

  /** 多 key 轮询：每次调用取下一个 key，重试自动换 key 分摊速率限制 */
  nextKey() {
    const keys = this.cfg.apiKeys;
    if (!keys.length) return '';
    if (this._keyCursor === undefined) this._keyCursor = 0;
    return keys[this._keyCursor++ % keys.length];
  }

  async chat(messages, { model, temperature = 0.2, jsonMode = true, maxTokens = 4096 } = {}) {
    const { ctx } = this;
    const c = this.cfg;
    if (!c.apiKeys.length) throw new Error('LLM 未配置 API Key（请设置 LLM_PROVIDER 对应供应商的 *_API_KEY / *_API_KEYS）');
    const body = {
      model: model || c.model, temperature, messages, max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      ...(c.chatTemplateKwargs ? { chat_template_kwargs: c.chatTemplateKwargs } : {}),
    };
    let resp;
    try {
      resp = await ctx.curl(`${c.baseURL}/chat/completions`, {
        method: 'POST', timeout: 60000,
        headers: { Authorization: `Bearer ${this.nextKey()}`, 'Content-Type': 'application/json' },
        contentType: 'json', data: body, dataType: 'json',
      });
    } catch (e) {
      // 供应商不认 response_format → 去掉重试一次
      if (jsonMode && e.status === 400) {
        const { response_format, ...rest } = body;
        resp = await ctx.curl(`${c.baseURL}/chat/completions`, {
          method: 'POST', timeout: 60000,
          headers: { Authorization: `Bearer ${this.nextKey()}`, 'Content-Type': 'application/json' },
          contentType: 'json', data: rest, dataType: 'json',
        });
      } else {
        throw e;
      }
    }
    const content = resp.data?.choices?.[0]?.message?.content ?? '';
    return { content, usage: resp.data?.usage };
  }

  /** 结构化调用：schema 仅用于提示词注入与校验注释，返回 JSON 对象 */
  async chatJson({ system, user, schemaHint, ...opts }) {
    const sys = `${system}\n【严格要求】只输出合法 JSON 对象，不要任何解释、不要 markdown 围栏。结构必须符合：\n${schemaHint}`;
    let { content, usage } = await this.chat([{ role: 'system', content: sys }, { role: 'user', content: user }], opts);
    let data = this.safeParse(content);
    if (data === null) {
      // 失败补救：抽取第一个 {...} 区块重试一次
      const m = content.match(/\{[\s\S]*\}/);
      if (m) data = this.safeParse(m[0]);
    }
    if (data === null) throw new Error(`LLM JSON 解析失败: ${content.slice(0, 200)}`);
    return { data, usage };
  }

  safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
}
module.exports = DeepseekService;
