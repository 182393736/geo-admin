'use strict';
const Controller = require('egg').Controller;

/**
 * Onboarding 接口（首次品牌分析）
 *  - POST /user/brands/analyze   提交品牌信息 → 立即返回 task_id，异步跑解析
 *  - GET  /user/onboarding/status?task_id=xx   前端轮询进度
 *  - GET  /user/brands           品牌列表（登录响应同款结构；分析完成后前端刷新用）
 */
class OnboardingController extends Controller {
  async analyze() {
    const { ctx } = this;
    const { brand_name, website, business_desc } = ctx.request.body || {};

    const hasText = (s) => typeof s === 'string' && s.trim().length > 0;
    if (!hasText(brand_name) && !hasText(business_desc)) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '请至少填写品牌名称或品牌介绍' };
      return;
    }
    if (website && !/^[a-zA-Z0-9.-]+(:\/\/)?[^\s]*$/.test(String(website).replace(/^https?:\/\//, ''))) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '链接格式不正确' };
      return;
    }

    // 已在分析中则直接复用正在跑的任务（防止连点产生重复品牌）
    const running = await ctx.model.OnboardingTask.findOne({
      user_id: ctx.state.user.id,
      stage: { $in: ['crawl', 'keyword', 'query', 'overview'] },
    }).sort({ created_at: -1 }).lean();
    if (running) {
      ctx.body = { code: 200, msg: 'ok', data: { task_id: running.task_id, brand_id: running.brand_id, reused: true } };
      return;
    }

    const result = await ctx.service.onboarding.start(ctx.state.user.id, {
      brand_name: hasText(brand_name) ? String(brand_name).trim().slice(0, 60) : '',
      website: hasText(website) ? String(website).trim().slice(0, 200) : '',
      business_desc: hasText(business_desc) ? String(business_desc).trim().slice(0, 2000) : '',
    });
    ctx.body = { code: 200, msg: 'ok', data: result };
  }

  async status() {
    const { ctx } = this;
    const taskId = ctx.query.task_id;
    if (!taskId) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '缺少 task_id' };
      return;
    }
    const data = await ctx.service.onboarding.status(String(taskId), ctx.state.user.id);
    if (!data) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '任务不存在' };
      return;
    }
    ctx.body = { code: 200, msg: 'ok', data };
  }

  async brands() {
    const { ctx } = this;
    const rows = await ctx.model.Brand.find({ user_id: ctx.state.user.id, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    ctx.body = {
      code: 200, msg: 'ok',
      data: rows.map(b => ({
        brand_id: b.brand_id, name: b.name, industry: b.industry || '',
        status: b.status, is_first_brand: !!b.is_first_brand,
        platforms: b.platforms || [],
      })),
    };
  }
}
module.exports = OnboardingController;
