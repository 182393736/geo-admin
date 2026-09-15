'use strict';
/**
 * AGENT 新建对话 / 会话流（对标 geo.timus.cn /dashboard/new-agent → /dashboard/writing/:id）
 *  - POST /agent/chat/start
 *  - GET  /agent/chat/list
 *  - GET  /agent/chat/:session_id
 *  - POST /agent/chat/:session_id/message
 *  - POST /agent/chat/:session_id/end
 */
const Controller = require('egg').Controller;
const { v4: uuid } = require('uuid');

const KIND_MAP = { chat: 'chat', mining: 'mining', writing: 'writing', strategy: 'chat' };
const KIND_LABEL = { chat: '聊', mining: '挖', writing: '写' };

function shortId() {
  return uuid().replace(/-/g, '').slice(0, 12);
}

function replyFor(mode, prompt) {
  const p = String(prompt || '');
  if (mode === 'mining') {
    return '已开始从监控问题与竞品覆盖面挖掘候选话题。建议先看口碑缺口与排名靠后的问题，再批量替换低效监控词。你可以补充行业关键词，我再细挖一轮。';
  }
  if (mode === 'writing') {
    return '已收到写稿需求。下一步会按所选话题与目标平台组织大纲、引用证据与正文结构。你可以补充目标读者、核心卖点或参考链接，我会据此调整稿件方向。';
  }
  if (/提及率|波动|趋势/.test(p)) {
    return '这方面暂时没有监控数据。提及率的逐日追踪需要一定周期的数据积累才能展示趋势，目前系统内还没有生成有效的提及率记录。你可以过段时间再看看，或者换一个已经有数据的问题来问。';
  }
  if (/热点/.test(p)) {
    return '今天暂未检测到足够新鲜的行业热点信号。可以先从监控问题里挑几个排名靠后的词，或切换到「问题挖掘」让我帮你补一批候选话题。';
  }
  if (/信源|豆包|DeepSeek|引用/.test(p)) {
    return '优质信源通常集中在权威媒体、垂直行业站与高引用内容号。建议先看「信源库 / 信源偏好」里的平台分布，再针对目标引擎补发可被引用的结构化稿件。';
  }
  return '已收到。我可以帮你看 GEO 表现、热点、信源选择与内容引用策略。请补充具体平台、时间范围或问题，我会给出更可执行的下一步。';
}

class AgentChatController extends Controller {
  _uid(ctx) {
    return ctx.state.user && (ctx.state.user.id || ctx.state.user.sub);
  }

  _serialize(doc) {
    const payload = doc.payload || {};
    const kind = doc.kind || 'chat';
    return {
      session_id: doc.session_id,
      brand_id: doc.brand_id,
      kind,
      kind_label: KIND_LABEL[kind] || '聊',
      title: payload.title || payload.prompt || '未命名对话',
      mode: payload.mode || kind,
      status: payload.status || 'awaiting_user',
      status_label: payload.status_label || '等用户追加',
      progress: payload.progress != null ? payload.progress : 5,
      cost: payload.cost || 0,
      prompt: payload.prompt || '',
      messages: payload.messages || [],
      platform: payload.platform || null,
      query_id: payload.query_id || null,
      ended: !!payload.ended,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  async start() {
    const { ctx } = this;
    const uid = this._uid(ctx);
    if (!uid) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }

    const b = ctx.request.body || {};
    const brand_id = String(b.brand_id || '').trim();
    if (!brand_id) { ctx.status = 400; ctx.body = { code: 400, msg: 'brand_id required' }; return; }

    const modeRaw = String(b.mode || 'chat').trim();
    const kind = KIND_MAP[modeRaw] || 'chat';
    const prompt = String(b.prompt || b.message || '').trim();
    if (!prompt && kind !== 'mining') {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'prompt required' };
      return;
    }
    const finalPrompt = prompt || '开始挖掘监控问题与潜在话题';

    const session_id = shortId();
    const assistant = replyFor(kind === 'chat' ? 'chat' : kind, finalPrompt);
    const now = new Date().toISOString();
    const payload = {
      title: finalPrompt.slice(0, 80),
      mode: kind,
      status: 'awaiting_user',
      status_label: '等用户追加',
      progress: 5,
      cost: 1,
      prompt: finalPrompt,
      platform: b.platform || null,
      query_id: b.query_id || null,
      ref_links: Array.isArray(b.ref_links) ? b.ref_links : [],
      messages: [
        { role: 'user', content: finalPrompt, at: now },
        { role: 'assistant', content: assistant, at: now },
      ],
      ended: false,
    };

    await ctx.model.AgentHistory.create({
      session_id, uid, brand_id, kind, payload,
    });

    ctx.body = { code: 200, msg: 'ok', data: this._serialize({ session_id, brand_id, kind, payload, created_at: now, updated_at: now }) };
  }

  async list() {
    const { ctx } = this;
    const uid = this._uid(ctx);
    if (!uid) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }
    const brand_id = String(ctx.query.brand_id || '').trim();
    const q = { uid };
    if (brand_id) q.brand_id = brand_id;
    const rows = await ctx.model.AgentHistory.find(q).sort({ updated_at: -1 }).limit(30).lean();
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(r => ({
          session_id: r.session_id,
          kind: r.kind,
          kind_label: KIND_LABEL[r.kind] || '聊',
          title: (r.payload && (r.payload.title || r.payload.prompt)) || '未命名对话',
          status: (r.payload && r.payload.status) || 'awaiting_user',
          ended: !!(r.payload && r.payload.ended),
          updated_at: r.updated_at,
        })),
      },
    };
  }

  async detail() {
    const { ctx } = this;
    const uid = this._uid(ctx);
    if (!uid) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }
    const session_id = ctx.params.session_id;
    const doc = await ctx.model.AgentHistory.findOne({ session_id, uid }).lean();
    if (!doc) { ctx.status = 404; ctx.body = { code: 404, msg: 'not found' }; return; }
    ctx.body = { code: 200, msg: 'ok', data: this._serialize(doc) };
  }

  async message() {
    const { ctx } = this;
    const uid = this._uid(ctx);
    if (!uid) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }
    const session_id = ctx.params.session_id;
    const content = String((ctx.request.body || {}).content || (ctx.request.body || {}).message || '').trim();
    if (!content) { ctx.status = 400; ctx.body = { code: 400, msg: 'content required' }; return; }

    const doc = await ctx.model.AgentHistory.findOne({ session_id, uid });
    if (!doc) { ctx.status = 404; ctx.body = { code: 404, msg: 'not found' }; return; }
    const payload = doc.payload || {};
    if (payload.ended) { ctx.status = 400; ctx.body = { code: 400, msg: 'session ended' }; return; }

    const now = new Date().toISOString();
    const messages = Array.isArray(payload.messages) ? payload.messages.slice() : [];
    messages.push({ role: 'user', content, at: now });
    const assistant = replyFor(doc.kind || 'chat', content);
    messages.push({ role: 'assistant', content: assistant, at: now });
    payload.messages = messages;
    payload.cost = (payload.cost || 0) + 1;
    payload.status = 'awaiting_user';
    payload.status_label = '等用户追加';
    payload.progress = Math.min(95, (payload.progress || 5) + 8);
    doc.payload = payload;
    doc.markModified('payload');
    await doc.save();

    ctx.body = { code: 200, msg: 'ok', data: this._serialize(doc.toObject()) };
  }

  async end() {
    const { ctx } = this;
    const uid = this._uid(ctx);
    if (!uid) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }
    const session_id = ctx.params.session_id;
    const doc = await ctx.model.AgentHistory.findOne({ session_id, uid });
    if (!doc) { ctx.status = 404; ctx.body = { code: 404, msg: 'not found' }; return; }
    const payload = doc.payload || {};
    payload.ended = true;
    payload.status = 'completed';
    payload.status_label = '已结束';
    payload.progress = 100;
    doc.payload = payload;
    doc.markModified('payload');
    await doc.save();
    ctx.body = { code: 200, msg: 'ok', data: this._serialize(doc.toObject()) };
  }
}

module.exports = AgentChatController;
