'use strict';
/**
 * 清空某用户在业务库中的全部关联数据（含账号本身）。
 * 默认仅开发环境；生产可通过 ADMIN_ALLOW_USER_PURGE=1 临时放开。
 */
const { Service } = require('egg');

/** @returns {boolean} */
function isPurgeAllowed(app) {
  const flag = String(process.env.ADMIN_ALLOW_USER_PURGE || '').trim().toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'yes' || flag === 'on') return true;
  const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
  const eggEnv = String((app && app.config && app.config.env) || '').toLowerCase();
  if (nodeEnv === 'production' || eggEnv === 'prod') return false;
  return true;
}

/** 按 brand_id 清理的集合（mongoose model 名） */
const BY_BRAND = [
  'BrandProfile', 'BrandAlias', 'BrandProduct', 'CompetitorRegister',
  'BrandLibrary', 'BrandWiki', 'MinedTopic', 'QueryGroup',
  'CollectSlot', 'CollectTask', 'RawAnswer', 'Snapshot',
  'CitationEdge', 'BrandMention', 'Opinion', 'OpinionTopic',
  'DailyMetricBrand', 'DailyMetricQuery', 'LeaderboardDaily',
  'SourceDailyStat', 'EvidenceItem', 'LlmCallLog', 'Report',
  'PipelineEvent', 'Subscription', 'MonitorQuery', 'Reminder',
  'DiagnosisTask', 'OnboardingTask', 'OnboardingTrace',
  'PaymentOrder', 'PublishOrder',
];

/** 按 user_id / uid 清理（field, modelName） */
const BY_USER = [
  ['user_id', 'Brand'],
  ['user_id', 'Subscription'],
  ['user_id', 'CreditAccount'],
  ['user_id', 'CreditTransaction'],
  ['user_id', 'MonitorQuery'],
  ['user_id', 'OnboardingTask'],
  ['user_id', 'OnboardingTrace'],
  ['user_id', 'PaymentOrder'],
  ['user_id', 'PublishOrder'],
  ['user_id', 'MediaFav'],
  ['user_id', 'UserClickEvent'],
  ['user_id', 'DiagnosisTask'],
  ['user_id', 'Reminder'],
  ['user_id', 'LlmCallLog'],
  ['uid', 'AgentHistory'],
  ['uid', 'WritingJob'],
  ['uid', 'ArticleGenerated'],
];

class UserPurgeService extends Service {
  isAllowed() {
    return isPurgeAllowed(this.app);
  }

  /**
   * @param {string} userId
   * @param {{ actorId?: string }} [opts]
   * @returns {Promise<{ user_id: string, account: string, brand_ids: string[], deleted: Record<string, number> }>}
   */
  async purgeAll(userId, opts = {}) {
    const { ctx } = this;
    if (!this.isAllowed()) {
      const err = new Error('未开启用户数据清空（需开发环境或 ADMIN_ALLOW_USER_PURGE=1）');
      err.status = 403;
      throw err;
    }
    const id = String(userId || '').trim();
    if (!id) {
      const err = new Error('user_id 必填');
      err.status = 400;
      throw err;
    }
    if (opts.actorId && String(opts.actorId) === id) {
      const err = new Error('不能删除当前登录管理员自己');
      err.status = 400;
      throw err;
    }

    const user = await ctx.model.User.findById(id).lean();
    if (!user) {
      const err = new Error('用户不存在');
      err.status = 404;
      throw err;
    }

    const brands = await ctx.model.Brand.find({ user_id: id }).select('brand_id').lean();
    const brandIds = brands.map(b => b.brand_id).filter(Boolean);
    const deleted = {};

    const del = async (modelName, filter) => {
      const Model = ctx.model[modelName];
      if (!Model) return;
      try {
        const r = await Model.deleteMany(filter);
        const n = (r && r.deletedCount) || 0;
        if (n > 0) deleted[modelName] = (deleted[modelName] || 0) + n;
      } catch (e) {
        ctx.logger.warn('[user_purge] %s skip: %s', modelName, (e && e.message) || e);
      }
    };

    if (brandIds.length) {
      const brandFilter = { brand_id: { $in: brandIds } };
      for (const name of BY_BRAND) await del(name, brandFilter);
    }

    for (const [field, name] of BY_USER) {
      await del(name, { [field]: id });
    }

    // 账号本身最后删
    try {
      const r = await ctx.model.User.deleteOne({ _id: id });
      if (r.deletedCount) deleted.User = r.deletedCount;
    } catch (e) {
      ctx.logger.warn('[user_purge] User delete: %s', (e && e.message) || e);
    }

    ctx.logger.warn('[user_purge] purged user=%s account=%s brands=%j by=%s counts=%j',
      id, user.account || '', brandIds, opts.actorId || '', deleted);

    return {
      user_id: id,
      account: user.account || '',
      brand_ids: brandIds,
      deleted,
    };
  }
}

module.exports = UserPurgeService;
module.exports.isPurgeAllowed = isPurgeAllowed;
// 兼容旧引用名
module.exports.isDevPurgeAllowed = isPurgeAllowed;
