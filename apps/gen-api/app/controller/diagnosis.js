'use strict';
const Controller = require('egg').Controller;
const { v4: uuid } = require('uuid');

/**
 * 诊断（对标 geoapi.timus.cn）
 *  GET  /diagnosis/tasks
 *  POST /diagnosis/order/create
 *  POST /diagnosis/order/cancel
 */
const WEB_COST = 2;
const APP_COST = 4;
const DOUBAO_APP_COST = 8;
const MIN_CREDIT = 100;

function estimateCost(topicCount, ends) {
  // ends: [{ engine, end: 'web'|'app' }]
  let unit = 0;
  for (const e of ends || []) {
    if (e.end === 'web') unit += WEB_COST;
    else if (e.end === 'app') unit += (e.engine === 'doubao' ? DOUBAO_APP_COST : APP_COST);
  }
  const raw = Math.max(1, topicCount || 1) * unit;
  return Math.max(MIN_CREDIT, raw);
}

class DiagnosisController extends Controller {
  _uid(ctx) {
    return ctx.state.user && (ctx.state.user.id || ctx.state.user.sub);
  }

  _serialize(t) {
    return {
      diagnosis_id: t.diagnosis_id,
      status: t.status,
      target_brand_input: t.target_brand_input || null,
      aliases: t.aliases || [],
      ends: t.ends || ['web', 'mobile'],
      platforms: t.platforms || [],
      topic_count: t.topic_count != null ? t.topic_count : null,
      credit_cost: t.credit_cost != null ? t.credit_cost : null,
      order_no: t.order_no || null,
      result: t.result || null,
      share_token: t.share_token || null,
      progress: t.progress != null ? t.progress : (t.status === 'done' ? 100 : (t.status === 'queued' || t.status === 'pending_pay' ? 0 : 35)),
      created_at: t.created_at,
      updated_at: t.updated_at,
    };
  }

  async list() {
    const { ctx } = this;
    const userId = this._uid(ctx);
    const page = Math.max(1, parseInt(ctx.query.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(ctx.query.size, 10) || 50));
    const [total, rows] = await Promise.all([
      ctx.model.DiagnosisTask.countDocuments({ user_id: userId }),
      ctx.model.DiagnosisTask.find({ user_id: userId })
        .sort({ created_at: -1 }).skip((page - 1) * size).limit(size).lean(),
    ]);
    ctx.body = {
      code: 200, msg: 'ok',
      data: { list: rows.map(t => this._serialize(t)), total, page, size },
    };
  }

  /** POST /diagnosis/order/create — 创建诊断订单（软路径：落库 queued，不真实跑批） */
  async create() {
    const { ctx } = this;
    const userId = this._uid(ctx);
    if (!userId) { ctx.status = 401; ctx.body = { code: 401, msg: 'unauthorized' }; return; }
    const b = ctx.request.body || {};
    const brandName = String((b.target_brand_input && (b.target_brand_input.name || b.target_brand_input.brand_name)) || b.brand_name || '').trim();
    if (!brandName) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'brand_name required' };
      return;
    }
    const topic_count = Math.max(1, parseInt(b.topic_count, 10) || 30);
    const platforms = Array.isArray(b.platforms) ? b.platforms : [];
    // platforms: [{ engine, ends: ['web','app'] }]
    const flatEnds = [];
    for (const p of platforms) {
      const engine = p.engine || p.key;
      for (const end of (p.ends || [])) flatEnds.push({ engine, end });
    }
    if (!flatEnds.length) {
      // default all web
      for (const engine of ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao']) {
        flatEnds.push({ engine, end: 'web' });
      }
    }
    const credit_cost = estimateCost(topic_count, flatEnds);
    const diagnosis_id = uuid().replace(/-/g, '').slice(0, 16);
    const order_no = `DG${Date.now()}${uuid().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
    const aliases = Array.isArray(b.aliases) ? b.aliases.map(String).filter(Boolean) : [];
    const doc = await ctx.model.DiagnosisTask.create({
      diagnosis_id,
      user_id: userId,
      target_brand_input: { name: brandName, brand_id: b.brand_id || null },
      aliases,
      ends: [...new Set(flatEnds.map(e => (e.end === 'app' ? 'mobile' : 'web')))],
      platforms: flatEnds,
      topic_count,
      status: 'queued',
      credit_cost,
      order_no,
      progress: 0,
      result: null,
      share_token: null,
    });
    ctx.body = { code: 200, msg: 'ok', data: this._serialize(doc.toObject ? doc.toObject() : doc) };
  }

  async cancel() {
    const { ctx } = this;
    const userId = this._uid(ctx);
    const diagnosis_id = String((ctx.request.body || {}).diagnosis_id || '').trim();
    if (!diagnosis_id) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'diagnosis_id required' };
      return;
    }
    const doc = await ctx.model.DiagnosisTask.findOne({ diagnosis_id, user_id: userId });
    if (!doc) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: 'not found' };
      return;
    }
    if (!['queued', 'pending_pay', 'pending', 'crawling', 'generating', 'running'].includes(doc.status)) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'cannot cancel' };
      return;
    }
    doc.status = 'cancelled';
    doc.progress = 0;
    await doc.save();
    ctx.body = { code: 200, msg: 'ok', data: this._serialize(doc.toObject()) };
  }
}

module.exports = DiagnosisController;
