'use strict';
/**
 * 大模型客户端 —— OpenAI 兼容协议（默认硅基流动，可切 Agnes/DeepSeek 等任一 OpenAI 兼容供应商）
 * 端点：POST {baseURL}/chat/completions   默认模型：deepseek-ai/DeepSeek-V4-Flash
 * 契约：chatJson 强制 JSON 输出（response_format json_object，400 时不带该参数自动降级重试）；
 *       chatStream 走 SSE(stream:true) 逐 token 回调，用于过程实况/长文生成。
 * 密钥解析：显式入参 > 环境变量 SILICONFLOW_API_KEY > src/dev-keys.js 内置测试密钥（私有仓库，生产用 env 覆盖）。
 * 供应商扩展：opts.chatTemplateKwargs（如 { enable_thinking:false }）随每个请求体下发，用于关闭推理模型的思考模式。
 */

const { resolveKey, resolveKeys } = require('./dev-keys');

function extractJson(content) {
  if (!content) return null;
  const s = String(content).replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(s); } catch (e) { /* fallthrough */ }
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (e) { /* fallthrough */ } }
  return null;
}

/** 归一化模型输出的 content 为字符串：兼容字符串 / content-parts 数组（[{type:'text',text:'..'}]）/ null */
function asText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(p => {
      if (typeof p === 'string') return p;
      if (p && typeof p === 'object') {
        if (typeof p.text === 'string') return p.text;
        if (typeof p.content === 'string') return p.content;
      }
      return '';
    }).join('');
  }
  if (content == null) return '';
  return String(content);
}

function createSiliconFlowClient(opts = {}) {
  // 多 key 轮询：opts.apiKeys（数组）优先；否则单 key（opts.apiKey / SILICONFLOW_API_KEY）
  const apiKeys = resolveKeys('SILICONFLOW_API_KEY', opts.apiKeys);
  const singleKey = resolveKey('SILICONFLOW_API_KEY', opts.apiKey);
  const keys = apiKeys.length ? apiKeys : (singleKey ? [singleKey] : []);
  let keyCursor = 0;
  const pickKey = () => (keys.length ? keys[keyCursor++ % keys.length] : '');
  const baseURL = resolveKey('SILICONFLOW_BASE_URL', opts.baseURL).replace(/\/+$/, '');
  const model = resolveKey('SILICONFLOW_MODEL', opts.model);
  const doFetch = opts.fetchImpl || globalThis.fetch;
  // 供应商扩展字段（如 Agnes 的 chat_template_kwargs: { enable_thinking:false }），随每个请求体一并下发
  const chatTemplateKwargs = opts.chatTemplateKwargs || null;
  if (!doFetch) throw new Error('geo-agent: 需要 Node>=20 的全局 fetch，或由宿主注入 fetchImpl');

  // 显式 HTTP(S) 代理：opts.proxy > 环境变量 LLM_PROXY（如 http://127.0.0.1:1087）。
  // Node 的全局 fetch 不读 HTTP_PROXY/HTTPS_PROXY，必须显式挂 undici 的 ProxyAgent 作为 dispatcher。
  // 生产环境不设置 LLM_PROXY → 直连；本地开发需翻墙时由 dev:all 注入默认代理。
  let dispatcher = null;
  const proxyUrl = String(opts.proxy || process.env.LLM_PROXY || '').trim();
  if (proxyUrl) {
    try {
      const { ProxyAgent } = require('undici');
      dispatcher = new ProxyAgent(proxyUrl);
    } catch (e) {
      // undici 缺失时静默降级直连（保证零依赖场景仍可用）
      console.warn(`[geo-agent] 已配置代理 ${proxyUrl} 但无法加载 undici，忽略代理直连: ${e.message}`);
    }
  }

  // 单次 LLM 请求超时（毫秒）。Agnes 等供应商响应偏慢时 90s 偏紧，默认放宽到 180s；
  // 可用 GEO_LLM_TIMEOUT_MS 覆盖（如 GEO_LLM_TIMEOUT_MS=300000）。
  const REQ_TIMEOUT_MS = Number(process.env.GEO_LLM_TIMEOUT_MS) || 180_000;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function post(path, body, { timeoutMs = REQ_TIMEOUT_MS, stream = false, retries = 2 } = {}) {
    if (!keys.length) throw new Error('geo-agent: 缺少 LLM API Key（LLM_PROVIDER 对应的 *_API_KEY/_API_KEYS 环境变量未配置）');
    const finalBody = chatTemplateKwargs ? { ...body, chat_template_kwargs: chatTemplateKwargs } : body;
    let lastErr = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const key = pickKey(); // 每次尝试轮询取 key：多 key 分摊速率限制，重试自动换下一个 key
      let resp;
      try {
        resp = await doFetch(`${baseURL}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify(finalBody),
          signal: AbortSignal.timeout(timeoutMs),
          ...(dispatcher ? { dispatcher } : {}),
        });
      } catch (e) {
        // 网络中断 / 超时：留一次重试机会（供应商偶发抖动时自愈）
        if (attempt < retries) { await sleep(1000 * (attempt + 1)); lastErr = e; continue; }
        throw e;
      }
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        // 5xx / 网关 520 / 429 限流等临时故障：指数退避重试（轮询自动换 key）；4xx 视为确定错误不重试
        if ((resp.status >= 500 || resp.status === 429) && attempt < retries) {
          await sleep(1000 * (attempt + 1));
          lastErr = Object.assign(new Error(`llm ${resp.status}: ${text.slice(0, 300)}`), { status: resp.status });
          continue;
        }
        const err = new Error(`llm ${resp.status}: ${text.slice(0, 300)}`);
        err.status = resp.status;
        throw err;
      }
      return resp;
    }
    throw lastErr;
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
    return { content: asText(choice.message && choice.message.content), usage: data.usage || null };
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
  async function chatStream({ system, user, onToken, temperature = 0.5, maxTokens = 4096, timeoutMs = REQ_TIMEOUT_MS } = {}) {
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
          if (piece) { const t = asText(piece); full += t; if (onToken) onToken(t); }
        } catch (e) { /* 半行 JSON，忽略 */ }
      }
    }
    return { content: full };
  }

  /**
   * 工具调用循环（联网取证的正解：Function Calling，非托管开关）
   * - 模型发 tool_calls → 本函数执行 handlers[name](args) → 结果以 tool 消息回填 → 继续
   * - 约束：DeepSeek/硅基流动 JSON Mode 与 tools 互斥 → 循环期间不开 JSON Mode；
   *   结束后返回 { content, calls, truncated }，结构化结果由调用方再走 chatJson
   * - 兼容：模型/网关不支持 tools（400 报错）时自动降级为普通 chat 一次
   */
  async function chatToolLoop({ system, user, tools = [], handlers = {}, maxRounds = 4, temperature = 0.3, maxTokens = 2048, timeoutMs = REQ_TIMEOUT_MS } = {}) {
    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];
    const calls = [];
    for (let round = 0; round <= maxRounds; round++) {
      const body = { model, temperature, max_tokens: maxTokens, messages, tools, tool_choice: 'auto' };
      let j;
      try {
        const resp = await post('/chat/completions', body, { timeoutMs });
        j = await resp.json();
      } catch (e) {
        // 不支持 tools：去掉 tools 降级为普通对话
        if (e.status === 400 && round === 0) {
          const r = await chat(messages, { jsonMode: false, temperature, maxTokens });
          return { content: r.content, calls, degraded: true };
        }
        throw e;
      }
      const msg = (j.choices && j.choices[0] && j.choices[0].message) || {};
      if (Array.isArray(msg.tool_calls) && msg.tool_calls.length) {
        messages.push({ role: 'assistant', content: asText(msg.content), tool_calls: msg.tool_calls });
        for (const tc of msg.tool_calls) {
          const name = tc.function && tc.function.name;
          const fn = handlers[name];
          let args = {};
          let out;
          try { args = JSON.parse(tc.function.arguments || '{}'); } catch (e) { /* 参数坏也给 handler 兜底 */ }
          if (!fn) {
            out = { error: `unknown tool: ${name}` };
          } else {
            try { out = await fn(args); } catch (e) { out = { error: String(e.message || e).slice(0, 300) }; }
          }
          calls.push({ tool: name, args, result: out });
          messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(out).slice(0, 4000) });
        }
        continue;
      }
      return { content: asText(msg.content), calls, usage: j.usage || null };
    }
    return { content: '', calls, truncated: true };
  }

  return { chat, chatJson, chatStream, chatToolLoop, model, baseURL };
}

module.exports = { createSiliconFlowClient, extractJson };
