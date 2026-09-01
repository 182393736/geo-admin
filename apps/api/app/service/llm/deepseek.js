'use strict';
/**
 * DeepSeek 客户端封装 —— 全项目所有 LLM 调用唯一入口
 * 接口：POST https://api.deepseek.com/chat/completions（OpenAI 兼容）
 * 约定：所有结构化抽取强制 JSON Mode（response_format: json_object），失败自动修复重试一次
 */
const { Service } = require('egg');

class DeepseekService extends Service {
  async chat(messages, { model = 'deepseek-chat', temperature = 0.2, jsonMode = true, maxTokens = 4096 } = {}) {
    const { ctx } = this;
    const body = {
      model, temperature, messages, max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };
    const resp = await ctx.curl('https://api.deepseek.com/chat/completions', {
      method: 'POST', timeout: 60000,
      headers: { Authorization: `Bearer ${this.config.deepseek.apiKey}`, 'Content-Type': 'application/json' },
      contentType: 'json', data: body, dataType: 'json',
    });
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
    if (data === null) throw new Error(`DeepSeek JSON 解析失败: ${content.slice(0, 200)}`);
    return { data, usage };
  }

  safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
}
module.exports = DeepseekService;
