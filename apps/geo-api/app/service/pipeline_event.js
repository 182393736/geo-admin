'use strict';
/**
 * 流水线事件写入服务：各阶段（expand/collect/parse/aggregate/report）完成后 upsert 一条记录，
 * 供管理后台「流水线时间轴」按品牌×天×阶段展示状态与出错原因。
 */
const { Service } = require('egg');

class PipelineEventService extends Service {
  /**
   * @param {object} p
   * @param {string} p.brand_id
   * @param {string} p.date       YYYY-MM-DD
   * @param {string} p.stage     expand | collect | parse | aggregate | report
   * @param {string} p.status    pending | running | ok | partial | fail
   * @param {string} p.message   阶段小结
   * @param {string|null} p.error  出错原因
   * @param {object|null} p.detail  阶段计数
   */
  async record({ brand_id, date, stage, status = 'ok', message = '', error = null, detail = null }) {
    if (!brand_id || !date || !stage) return null;
    const { ctx } = this;
    try {
      return await ctx.model.PipelineEvent.findOneAndUpdate(
        { brand_id, date, stage },
        { $set: { status, message, error, detail }, $setOnInsert: { event_id: ctx.helper.uuid() } },
        { upsert: true, new: true },
      ).lean();
    } catch (e) {
      // 事件记录失败不能影响主流程
      ctx.logger.error(`[pipeline_event] 记录失败 ${brand_id}/${date}/${stage}: ${e.message}`);
      return null;
    }
  }
}
module.exports = PipelineEventService;
