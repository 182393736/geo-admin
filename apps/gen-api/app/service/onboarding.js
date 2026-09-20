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

  /**
   * 自增序列（counters 集合）——query_id 的唯一来源。
   * 历史 bug：首登 persist 用 counter名 `monitor_query`，手动 /query/add 用 `query_id`，
   * 两套序列并存 → 添加问题时撞唯一索引 → Egg 返回 HTML 500 → 前端 JSON 解析失败。
   * 统一落到 `query_id`，并在发放前抬到 ≥ 库内最大 query_id。
   */
  async nextSeq(name) {
    const coll = this.app.mongoose.connection.db.collection('counters');
    // 兼容旧调用方（geo-agent persist 曾传 monitor_query）
    if (name === 'monitor_query' || name === 'query_id') {
      name = 'query_id';
      await this._ensureQueryIdCounter(coll);
    }
    const r = await coll.findOneAndUpdate(
      { _id: name }, { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );
    const doc = r && r.value != null ? r.value : r; // driver v4/v6 兼容
    if (!doc || typeof doc.seq !== 'number') {
      throw new Error(`nextSeq(${name}) returned invalid seq`);
    }
    return doc.seq;
  }

  /** 将 counters.query_id 抬到 ≥ max(库内最大 query_id, 旧 monitor_query counter) */
  async _ensureQueryIdCounter(coll) {
    const maxRow = await this.ctx.model.MonitorQuery
      .findOne()
      .sort({ query_id: -1 })
      .select({ query_id: 1 })
      .lean();
    const maxId = (maxRow && Number(maxRow.query_id)) || 0;
    const legacy = await coll.findOne({ _id: 'monitor_query' });
    const legacySeq = (legacy && Number(legacy.seq)) || 0;
    const floor = Math.max(maxId, legacySeq);
    if (floor <= 0) return;
    await coll.updateOne(
      { _id: 'query_id' },
      [{ $set: { seq: { $max: [{ $ifNull: ['$seq', 0] }, floor] } } }],
      { upsert: true },
    );
  }
}
module.exports = OnboardingService;
