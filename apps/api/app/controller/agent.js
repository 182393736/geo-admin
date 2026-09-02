'use strict';
/**
 * Agent 路由出口：
 *  POST /agent/onboarding/run     —— 一次性 JSON：完整字段集 + 落库（save=false 则只预览）
 *  POST /agent/onboarding/stream  —— SSE 实况：process 事件直推，最后 event=result 给完整结果
 */
const { Controller } = require('egg');

class AgentController extends Controller {
  /** 请求体：{ brand_name, website?, business_desc?, query_limit?, save?, brand_id?, selected_queries?, confirm_limit? } */
  async run() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    if (!b.brand_name || !String(b.brand_name).trim()) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'brand_name 必填' };
      return;
    }
    const userId = ctx.state.user && (ctx.state.user.id || ctx.state.user.sub);
    if (!userId) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }
    const input = {
      brand_name: String(b.brand_name).trim(),
      website: String(b.website || '').trim(),
      business_desc: String(b.business_desc || '').trim(),
      query_limit: b.query_limit,
    };
    try {
      if (b.save === false) {
        const result = await ctx.service.agentRunner.analyze(input);
        ctx.body = { code: 200, msg: 'success', data: { result, saved: null } };
      } else {
        const out = await ctx.service.agentRunner.runAndPersist(userId, input, {
          brandId: b.brand_id, selectedQueries: b.selected_queries, confirmLimit: b.confirm_limit,
        });
        ctx.body = { code: 200, msg: 'success', data: out };
      }
    } catch (e) {
      ctx.status = 502;
      ctx.body = { code: 502, msg: `agent failed: ${String(e.message || e).slice(0, 300)}` };
    }
  }

  /** SSE 版：同一入参；事件 stage/trace/profile/candidates/library/done，终事件 result */
  async stream() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    if (!b.brand_name || !String(b.brand_name).trim()) {
      ctx.status = 400; ctx.body = { code: 400, msg: 'brand_name 必填' }; return;
    }
    const userId = ctx.state.user && (ctx.state.user.id || ctx.state.user.sub);
    if (!userId) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }
    ctx.set({ 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    ctx.respond = false;
    const send = (event, data) => { try { ctx.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch (e) { /* 客户端断开 */ } };
    const input = {
      brand_name: String(b.brand_name).trim(),
      website: String(b.website || '').trim(),
      business_desc: String(b.business_desc || '').trim(),
      query_limit: b.query_limit,
    };
    try {
      const out = b.save === false
        ? { result: await ctx.service.agentRunner.analyze(input, ev => send(ev.type === 'trace' ? 'trace' : ev.type, ev)), saved: null }
        : await ctx.service.agentRunner.runAndPersist(userId, input, {
          brandId: b.brand_id, selectedQueries: b.selected_queries, confirmLimit: b.confirm_limit,
        }, ev => send(ev.type === 'trace' ? 'trace' : ev.type, ev));
      // 终事件下发完整 result：前端勾选确认（/agent/onboarding/confirm）需要回传 preview
      send('result', { code: 200, data: { saved: out.saved, result: out.result } });
    } catch (e) {
      send('error', { msg: String(e.message || e).slice(0, 300) });
    }
    ctx.res.end();
  }

  /**
   * 两段式确认（对标"用户勾选后才落库"）：
   * POST /agent/onboarding/confirm
   * 请求体：{ preview: <stream/run(save=false) 返回的 result>, selected_queries: string[], brand_id?, confirm_limit? }
   * confirm_limit 服务端硬封顶 = config.geoAgent.freeQueryLimit（默认 3）
   */
  async confirm() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const userId = ctx.state.user && (ctx.state.user.id || ctx.state.user.sub);
    if (!userId) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }
    if (!b.preview || typeof b.preview !== 'object') {
      ctx.status = 400; ctx.body = { code: 400, msg: 'preview 必填（取 stream/run 的 result）' }; return;
    }
    const cap = (ctx.app.config.geoAgent && ctx.app.config.geoAgent.freeQueryLimit) || 3;
    const confirmLimit = Math.min(Math.max(1, parseInt(b.confirm_limit, 10) || cap), cap);
    try {
      const out = await ctx.service.agentRunner.persistPreview(userId, b.preview, {
        brandId: b.brand_id,
        selectedQueries: Array.isArray(b.selected_queries) ? b.selected_queries.map(String) : undefined,
        confirmLimit,
      });
      ctx.body = { code: 200, msg: 'success', data: { saved: out.saved, confirm_limit: confirmLimit } };
    } catch (e) {
      ctx.status = 422;
      ctx.body = { code: 422, msg: String(e.message || e).slice(0, 300) };
    }
  }
}

module.exports = AgentController;
