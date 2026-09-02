'use strict';
/**
 * 大模型客户端 —— 硅基流动（SiliconFlow）OpenAI 兼容协议
 * 端点：POST {baseURL}/chat/completions   默认模型：deepseek-ai/DeepSeek-V4-Flash
 * 契约：chatJson 强制 JSON 输出（response_format json_object，400 时不带该参数自动降级重试）；
 *       chatStream 走 SSE(stream:true) 逐 token 回调，用于过程实况/长文生成。
 * 密钥只从宿主注入（env SIICONFLOW_API_KEY），本库不落任何默认密钥。
 */

function extractJson(content) {
  if (!content) return null;
  const s = String(content).replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(s); } catch (e) { /* fallthrough */ }
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (e) { /* fallthrough */ } }
  return null;
}

function createSiliconFlowClient(opts = {}) {
  const apiKey = opts.apiKey || process.env.SILICONFLOW_API_KEY || '';
  const baseURL = (opts.baseURL || process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, '');
  const model = opts.model || process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';
  const doFetch = opts.fetchImpl || globalThis.fetch;
  if (!doFetch) throw new Error('geo-agent: 需要 Node>=20 的全局 fetch，或由宿主注入 fetchImpl');

  async function post(path, body, { timeoutMs = 90000, stream = false } = {}) {
    if (!apiKey) throw new Error('geo-agent: 缺少 SILICONFLOW_API_KEY');
    const resp = await doFetch(`${baseURL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      const err = new Error(`siliconflow ${resp.status}: ${text.slice(0, 300)}`);
      err.status = resp.status;
      throw err;
    }
    return resp;
  }

  /** 原始对话：messages 进，{content, usage} 出 */
  async function chat(messages, { temperature = 0.2, maxTokens = 4096, timeoutMs, jsonMode = true } = {}) {
    const body = { model, temperature, max_tokens: maxTokens, messages };
    if (jsonMode) body.response_format = { type: 'json_object' };
    let resp;
    try {
      resp = await post('/chat/completions', body, { timeoutMs });
    } catch (e) {
      // 个别模型/网关不认 response_format → 去掉重试一次
      if (jsonMode && e.status === 400) resp = await post('/chat/completions', { ...body, response_format: undefined }, { timeoutMs });
      else throw e;
    }
    const data = await resp.json();
    const choice = (data.choices && data.choices[0]) || {};
    return { content: (choice.message && choice.message.content) || '', usage: data.usage || null };
  }

  /** 结构化调用：schemaHint 注入提示词，返回 {data, usage}；解析失败补救重试一次 */
  async function chatJson({ system, user, schemaHint, retries = 1, ...opts }) {
    const sys = `${system}\n【严格要求】只输出合法 JSON 对象，不要任何解释、不要使用 markdown 代码围栏。输出结构必须严格符合：\n${schemaHint}`;
    const messages = [ { role: 'system', content: sys }, { role: 'user', content: user } ];
    let last = null;
    for (let i = 0; i <= retries; i++) {
      const { content, usage } = await chat(messages, opts);
      last = { content, usage };
      const data = extractJson(content);
      if (data !== null) return { data, usage, content };
      messages.push({ role: 'user', content: '上次输出不是合法 JSON。请只输出修复后的完整 JSON 对象。' });
    }
    throw new Error(`geo-agent: LLM JSON 解析失败: ${String(last && last.content).slice(0, 200)}`);
  }

  /** 流式对话（SSE）：onToken(piece) 逐段回调，返回 {content} 全文 */
  async function chatStream({ system, user, onToken, temperature = 0.5, maxTokens = 4096, timeoutMs = 120000 } = {}) {
    const resp = await post('/chat/completions', {
      model, temperature, max_tokens: maxTokens, stream: true,
      messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
    }, { timeoutMs, stream: true });
    const reader = resp.body.getReader();
    const dec = new TextDecoder('utf-8');
    let buf = ''; let full = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') { buf = ''; break; }
        try {
          const j = JSON.parse(payload);
          const piece = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
          if (piece) { full += piece; if (onToken) onToken(piece); }
        } catch (e) { /* 半行 JSON，忽略 */ }
      }
    }
    return { content: full };
  }

  return { chat, chatJson, chatStream, model, baseURL };
}

module.exports = { createSiliconFlowClient, extractJson };
