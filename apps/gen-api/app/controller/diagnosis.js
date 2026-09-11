'use strict';
const Controller = require('egg').Controller;

/**
 * 诊断（对标 geoapi.timus.cn GET /diagnosis/tasks?page=&size= → { list, total, page, size }）
 * 诊断任务表 diagnosis_tasks；当前阶段无生成入口，返回真实（通常为空）列表。
 */
class DiagnosisController extends Controller {
  async list() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const page = Math.max(1, parseInt(ctx.query.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(ctx.query.size, 10) || 50));
    const [total, rows] = await Promise.all([
      ctx.model.DiagnosisTask.countDocuments({ user_id: userId }),
      ctx.model.DiagnosisTask.find({ user_id: userId })
        .sort({ created_at: -1 }).skip((page - 1) * size).limit(size).lean(),
    ]);
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(t => ({
          diagnosis_id: t.diagnosis_id, status: t.status,
          target_brand_input: t.target_brand_input || null,
          aliases: t.aliases || [], ends: t.ends || ['web', 'mobile'],
          credit_cost: t.credit_cost != null ? t.credit_cost : null,
          order_no: t.order_no || null, result: t.result || null,
          share_token: t.share_token || null,
          created_at: t.created_at, updated_at: t.updated_at,
        })),
        total, page, size,
      },
    };
  }
}

module.exports = DiagnosisController;
