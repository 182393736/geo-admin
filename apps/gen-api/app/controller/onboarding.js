'use strict';
const Controller = require('egg').Controller;

/**
 * Onboarding 接口（品牌列表）
 *  - GET /user/brands   品牌列表（登录响应同款结构；分析完成后前端刷新用）
 *
 * 说明：旧「首次品牌分析」接口 POST /user/brands/analyze 与 GET /user/onboarding/status
 *       已废弃移除——首登建档现走 /agent/onboarding/{run,stream,confirm}（geo-agent 落库）。
 *       如需找回旧实现，见提交《chore(gen-api): 移除废弃的 /user/brands/analyze 首登建档路径》。
 */
class OnboardingController extends Controller {
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
