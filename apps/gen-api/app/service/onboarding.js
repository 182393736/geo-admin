'use strict';
/**
 * Onboarding 服务（精简版）
 *
 * 首登「品牌分析」的异步状态机（crawl→keyword→query→done）已迁移到
 * packages/geo-agent，由 /agent/onboarding/{run,stream,confirm} 落库；
 * 旧 POST /user/brands/analyze 路径已废弃移除（见提交
 * 《chore(gen-api): 移除废弃的 /user/brands/analyze 首登建档路径》，git 历史可恢复）。
 *
 * 本文件仅保留两个仍被线上链路使用的方法：
 *  - latestForUser()  供 /user/login 投影最近一次 onboarding task（first_login 等字段）
 *  - nextSeq()        自增序列（counters 集合）——query_id 的唯一来源（agent_runner 复用）
 */
const { Service } = require('egg');

class OnboardingService extends Service {
  /** 最新的一次 onboarding（供 /user/info 投影 first_login 等字段） */
  async latestForUser(userId) {
    return this.app.mongoose.model('OnboardingTask')
      .findOne({ user_id: userId }).sort({ created_at: -1 }).lean();
  }

  /** 自增序列（counters 集合）——query_id / 订单号的唯一来源 */
  async nextSeq(name) {
    const coll = this.app.mongoose.connection.db.collection('counters');
    const r = await coll.findOneAndUpdate(
      { _id: name }, { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );
    const doc = r && r.value ? r.value : r; // driver v4/v6 兼容
    return doc.seq;
  }
}
module.exports = OnboardingService;
