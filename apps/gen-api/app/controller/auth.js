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
      brands: await this._brandBriefs(brands),
      activeOrg: null,
    };
  }

  /**
   * 品牌摘要（登录响应 brands 列表）：订阅档位/识别词等一律真实查询，杜绝硬编码。
   * 尚未开通订阅（未访问过套餐页）时按系统默认「免费体验版」语义返回 free。
   */
  async _brandBriefs(brands) {
    const { ctx } = this;
    if (!brands || !brands.length) return [];
    const ids = brands.map(b => b.brand_id);
    const [subs, aliasRows] = await Promise.all([
      ctx.model.Subscription.find({ brand_id: { $in: ids }, status: 'active' }).sort({ created_at: -1 }).lean(),
      ctx.model.BrandAlias.find({ brand_id: { $in: ids }, enabled: true }).lean(),
    ]);
    const subMap = {};
    for (const s of subs) if (!subMap[s.brand_id]) subMap[s.brand_id] = s;
    const aliasMap = {};
    for (const a of aliasRows) (aliasMap[a.brand_id] ||= []).push(a.alias);
    return brands.map(b => {
      const sub = subMap[b.brand_id];
      return {
        brand_id: b.brand_id,
        name: b.name,
        industry: b.industry || '',
        vip_level: sub ? (sub.vip_level || 'free') : 'free',
        vip_plan_code: sub ? (sub.plan_code || '') : '',
        vip_expire_date: sub ? (sub.expire_date || '') : '',
        status: b.status,
        platforms: b.platforms || [],
        aliases: aliasMap[b.brand_id] || [],
        is_first_brand: !!b.is_first_brand,
        rename_remaining: b.rename_remaining != null ? b.rename_remaining : 0,
        created_at: b.created_at,
      };
    });
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
    const dayjs = ctx.app.dayjs ? ctx.app.dayjs() : require('dayjs')();
    const today = dayjs.format('YYYY-MM-DD');
    const [task, aliasRows, sub, freePlan, dailyExec] = await Promise.all([
      ctx.service.onboarding.latestForUser(String(user._id)),
      first ? ctx.model.BrandAlias.find({ brand_id: first.brand_id, enabled: true }).lean() : Promise.resolve([]),
      first ? ctx.model.Subscription.findOne({ brand_id: first.brand_id, status: 'active' }).sort({ created_at: -1 }).lean() : Promise.resolve(null),
      ctx.model.Plan.findOne({ plan_code: 'free' }).lean(),
      // 当日已执行采集槽位（ok/fail/empty 为已落定结果；采集前无 collect_slots → 真实为 0）
      first ? ctx.model.CollectSlot.countDocuments({ brand_id: first.brand_id, date: today, status: { $in: ['ok', 'fail', 'empty'] } }) : Promise.resolve(0),
    ]);
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
        aliases: aliasRows.map(a => a.alias),
        vip_level: sub ? (sub.vip_level || 'free') : 'free',
        vip_expire_date: sub ? (sub.expire_date || '') : '',
        query_limit: (sub && sub.query_limit) || (freePlan && freePlan.query_limit) || 8,
        daily_exec_count: dailyExec,
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
