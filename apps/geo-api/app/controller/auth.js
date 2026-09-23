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
      brands: await ctx.service.brandScope.brandBriefs(brands),
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
    // brand_id 可选：传入则投影该品牌；缺省兼容取首个启用品牌
    const brands = await ctx.model.Brand.find({ user_id: user._id, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    let current = null;
    try {
      current = await ctx.service.brandScope.resolveBrandOptional(user._id, ctx.query.brand_id);
    } catch (e) {
      ctx.status = e.status || 400;
      ctx.body = { code: e.code || e.status || 400, msg: e.message };
      return;
    }
    const dayjs = ctx.app.dayjs ? ctx.app.dayjs() : require('dayjs')();
    const today = dayjs.format('YYYY-MM-DD');
    const [task, aliasRows, sub, freePlan, dailyExec] = await Promise.all([
      ctx.service.onboarding.latestForUser(String(user._id)),
      current ? ctx.model.BrandAlias.find({ brand_id: current.brand_id, enabled: true }).lean() : Promise.resolve([]),
      current ? ctx.model.Subscription.findOne({ brand_id: current.brand_id, status: 'active' }).sort({ created_at: -1 }).lean() : Promise.resolve(null),
      ctx.model.Plan.findOne({ plan_code: 'free' }).lean(),
      current ? ctx.model.CollectSlot.countDocuments({ brand_id: current.brand_id, date: today, status: { $in: ['ok', 'fail', 'empty'] } }) : Promise.resolve(0),
    ]);
    ctx.body = {
      code: 200,
      msg: 'ok',
      data: {
        user_id: user._id,
        account: user.account || '',
        name: user.name || '',
        position: user.position || '',
        brand_id: current ? current.brand_id : '',
        phone: user.phone || '',
        brand: current ? current.name : (user.company || ''),
        company: user.company || '',
        industary: (current && current.industry) || user.industry || '',
        industry: user.industry || '',
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

  /** POST /user/info/update —— 个人资料（公司/姓名/职位/行业/手机） */
  async updateInfo() {
    const { ctx } = this;
    const uid = ctx.state.user && ctx.state.user.id;
    if (!uid) {
      ctx.status = 401;
      ctx.body = { code: 401, msg: '未登录' };
      return;
    }
    const b = ctx.request.body || {};
    const patch = {};
    if (b.name != null) patch.name = String(b.name).trim().slice(0, 40);
    if (b.company != null) patch.company = String(b.company).trim().slice(0, 80);
    if (b.position != null) patch.position = String(b.position).trim().slice(0, 40);
    if (b.industry != null) patch.industry = String(b.industry).trim().slice(0, 60);
    if (b.phone != null) {
      const phone = String(b.phone).trim();
      if (phone && !/^1\d{10}$/.test(phone)) {
        ctx.status = 400;
        ctx.body = { code: 400, msg: '手机号格式不正确' };
        return;
      }
      if (phone) {
        const hit = await ctx.model.User.findOne({ phone, _id: { $ne: uid } }).lean();
        if (hit) {
          ctx.status = 400;
          ctx.body = { code: 400, msg: '该手机号已被其他账号绑定' };
          return;
        }
      }
      patch.phone = phone || undefined;
    }
    await ctx.model.User.updateOne({ _id: uid }, { $set: patch });
    const user = await ctx.model.User.findById(uid).lean();
    ctx.body = {
      code: 200,
      msg: 'ok',
      data: {
        account: user.account || '',
        name: user.name || '',
        phone: user.phone || '',
        company: user.company || '',
        position: user.position || '',
        industry: user.industry || '',
      },
    };
  }

  /** POST /user/change_password —— 修改登录密码 */
  async changePassword() {
    const { ctx } = this;
    const uid = ctx.state.user && ctx.state.user.id;
    if (!uid) {
      ctx.status = 401;
      ctx.body = { code: 401, msg: '未登录' };
      return;
    }
    const b = ctx.request.body || {};
    const oldPwd = String(b.old_password || b.password || '');
    const newPwd = String(b.new_password || '');
    if (!oldPwd || !newPwd) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '请填写当前密码与新密码' };
      return;
    }
    if (newPwd.length < 6) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '新密码至少 6 位' };
      return;
    }
    if (oldPwd === newPwd) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '新密码不能与当前密码相同' };
      return;
    }
    const user = await ctx.model.User.findById(uid).select('+password_hash');
    if (!user || !user.password_hash || !require('bcryptjs').compareSync(oldPwd, user.password_hash)) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '当前密码不正确' };
      return;
    }
    const hash = require('bcryptjs').hashSync(newPwd, 10);
    user.password_hash = hash;
    user.password_plain = newPwd;
    await user.save();
    ctx.body = { code: 200, msg: '密码已更新' };
  }

  async logout() {
    const { ctx } = this;
    ctx.service.auth.revoke(ctx.state.user.jti);
    ctx.body = { code: 200, msg: 'ok' };
  }
}

module.exports = AuthController;
