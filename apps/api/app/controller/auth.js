'use strict';
const Controller = require('egg').Controller;

/**
 * 认证接口（契约对齐线上实测）：
 *  - POST /user/login        账号密码登录，raw:true 无统一壳，返回 LoginResp
 *  - GET  /user/info         需 JWT，统一壳 { code:200, data }
 *  - POST /api/auth/logout   需 JWT，无壳（article 域习惯）
 */
class AuthController extends Controller {
  async login() {
    const { ctx } = this;
    // dev 环境模拟真实网络延迟（可在 config.loginDelayMs 配置）
    const delay = Number(ctx.app.config.loginDelayMs) || 0;
    if (delay > 0) await new Promise(r => setTimeout(r, delay));

    const { account, password } = ctx.request.body || {};
    if (!account || !password) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '账号与密码必填' };
      return;
    }
    const user = await ctx.service.auth.verify(String(account).trim(), String(password));
    if (!user) {
      // 线上行为：凭证错误统一 401 + 简短 msg
      ctx.status = 401;
      ctx.body = { code: 401, msg: '账号或密码错误' };
      return;
    }
    const token = ctx.service.auth.sign(user);
    const brands = await ctx.model.Brand.find({ user_id: user._id, status: { $ne: 'disabled' } }).lean();
    ctx.body = {
      accessToken: token,
      user: { id: user._id, username: user.account },
      brands: brands.map(b => ({
        brand_id: b.brand_id, name: b.name, industry: b.industry || '',
        vip_level: 'starter', vip_plan_code: '',
      })),
      activeOrg: null,
    };
  }

  async info() {
    const { ctx } = this;
    const user = await ctx.model.User.findById(ctx.state.user.id).lean();
    if (!user) {
      ctx.status = 401;
      ctx.body = { code: 401, msg: '用户不存在' };
      return;
    }
    // 品牌态与 onboarding 投影：first_login=1 表示还没有任何品牌（前端据此跳 /trial）
    const brands = await ctx.model.Brand.find({ user_id: user._id, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    const first = brands[0] || null;
    const task = await ctx.service.onboarding.latestForUser(String(user._id));
    ctx.body = {
      code: 200,
      msg: 'ok',
      data: {
        user_id: user._id,
        brand_id: first ? first.brand_id : '',
        phone: user.phone || '',
        brand: first ? first.name : (user.company || ''),
        company: user.company || '',
        industary: (first && first.industry) || user.industry || '',
        aliases: [],
        vip_level: 'pro',
        vip_expire_date: '',
        query_limit: 100,
        daily_exec_count: 0,
        first_login: brands.length ? 2 : 1,   // 1=首次登录（无品牌）→ 前端跳 /trial
        task_id: task ? task.task_id : null,
        crawler_started_at: task ? (task.crawler_started_at || null) : null,
        keyword_gen_started_at: task ? (task.keyword_gen_started_at || null) : null,
        keyword_gen_completed_at: task ? (task.keyword_gen_completed_at || null) : null,
      },
    };
  }

  async logout() {
    const { ctx } = this;
    ctx.service.auth.revoke(ctx.state.user.jti);
    ctx.body = { code: 200, msg: 'ok' };
  }
}

module.exports = AuthController;
