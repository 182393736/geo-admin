'use strict';
/**
 * 解析+聚合驱动器（S4+S5 共用）
 * 供实时轮询（schedule/realtime_parse）与日批（schedule/daily_parse）复用。
 * - 解析：捞 raw_answers(parsed:false) 按 query_type 分流，逐条 try/catch；失败的留 parsed:false 下轮自动重试
 * - 聚合：按指定 date 与品牌范围跑 aggregate.run（按品牌、按日增量，全部 upsert 幂等，可反复跑）
 * - 埋点：每阶段写 pipeline_events（管理后台「流水线时间轴」），记录状态与出错原因
 */
const { Service } = require('egg');

class ParseService extends Service {
  /**
   * @param {object} opts
   * @param {string} opts.date       聚合目标统计日 YYYY-MM-DD（realtime 传今天；日批传昨天）
   * @param {boolean} opts.all       聚合范围：true=全部 active 品牌（日批/清扫）；缺省=仅本轮新解析到的品牌
   * @param {boolean} opts.skipParse 跳过解析、只聚合（实时清扫专用：覆盖仅 empty/fail 无 raw_answer 的槽位变化）
   */
  async runBatch({ date, all = false, skipParse = false } = {}) {
    const { ctx } = this;
    const config = ctx.app.config.parse || {};
    const targetDate = date || ctx.app.dayjs().format('YYYY-MM-DD');
    const affected = new Set();
    const parseStat = new Map(); // key: `${brand_id}|${date}` → { parsed, failed, firstError }
    let parsed = 0;

    if (!skipParse) {
      const answers = await ctx.model.RawAnswer.find({ parsed: false })
        .limit(config.batchSize || 200).lean();
      for (const a of answers) {
        const key = `${a.brand_id}|${a.date || targetDate}`;
        const st = parseStat.get(key) || { parsed: 0, failed: 0, firstError: null };
        try {
          if (a.query_type === 'industry') await ctx.service.pipeline.rankExtract.run(a);   // 流水线A 榜单
          else await ctx.service.pipeline.reputationExtract.run(a);                         // 流水线B 口碑
          await ctx.service.pipeline.citationExtract.run(a);                                // 流水线C 信源
          await ctx.model.RawAnswer.updateOne({ answer_id: a.answer_id }, { parsed: true });
          affected.add(a.brand_id);
          st.parsed += 1;
          parsed += 1;
        } catch (e) {
          // 单条失败不阻塞整批：保持 parsed:false，下一轮自动重试（LLM 抖动/限流场景）
          st.failed += 1;
          if (!st.firstError) st.firstError = e.message;
          ctx.logger.error(`[parse] answer ${a.answer_id} 解析失败，留待下轮重试: ${e.message}`);
        }
        parseStat.set(key, st);
      }
      // parse 阶段事件（按品牌×回答统计日）
      for (const [key, st] of parseStat) {
        const [brandId, evDate] = key.split('|');
        await ctx.service.pipelineEvent.record({
          brand_id: brandId, date: evDate, stage: 'parse',
          status: st.failed ? 'partial' : 'ok',
          message: `解析 ${st.parsed} 条${st.failed ? `，失败 ${st.failed} 条` : ''}`,
          error: st.firstError,
          detail: { parsed: st.parsed, failed: st.failed },
        });
      }
    }

    let brandIds = [...affected];
    if (all) {
      const brands = await ctx.model.Brand.find({ status: 'active' }).lean();
      brandIds = brands.map(b => b.brand_id);
    }

    let aggregated = 0;
    for (const brandId of brandIds) {
      try {
        await ctx.service.pipeline.aggregate.run(brandId, targetDate);
        aggregated += 1;
        await ctx.service.pipelineEvent.record({
          brand_id: brandId, date: targetDate, stage: 'aggregate',
          status: 'ok', message: '指标聚合完成', detail: null,
        });
      } catch (e) {
        ctx.logger.error(`[parse] 品牌 ${brandId} 聚合(${targetDate})失败: ${e.message}`);
        await ctx.service.pipelineEvent.record({
          brand_id: brandId, date: targetDate, stage: 'aggregate',
          status: 'fail', message: '指标聚合失败', error: e.message, detail: null,
        });
      }
    }
    return { parsed, aggregated, date: targetDate };
  }

  /**
   * 聚合「最近 N 天内有采集数据的日期」（测试程序多天槽位场景）。
   * realtime 轮询默认只聚合今天；测试程序展开「最近2/3天」槽位被采集后，历史日期的指标
   * 需要补跑聚合才会进 daily_metric_* / leaderboard_dailies，进而出现在排名/矩阵/三率页。
   * 只聚合 collect_slots 里确有 ok/empty 槽位的 (brand, date)，避免给无数据日期写空指标行。
   * @param {object} opts
   * @param {number} opts.daysBack 回溯天数（不含今天，默认 2 → 昨天/前天）
   * @returns {number} 实际聚合的品牌×日期数
   */
  async aggregateRecent({ daysBack = 2 } = {}) {
    const { ctx } = this;
    const M = ctx.model;
    const dayjs = ctx.app.dayjs;
    const today = dayjs().format('YYYY-MM-DD');
    const from = dayjs().subtract(daysBack, 'day').format('YYYY-MM-DD');
    let aggregated = 0;
    const brandIds = await M.CollectSlot.distinct('brand_id', {
      date: { $gte: from, $lt: today },
      status: { $in: ['ok', 'empty'] },
    });
    for (const brandId of brandIds) {
      const dates = await M.CollectSlot.distinct('date', {
        brand_id: brandId,
        date: { $gte: from, $lt: today },
        status: { $in: ['ok', 'empty'] },
      });
      for (const date of dates) {
        try {
          await ctx.service.pipeline.aggregate.run(brandId, date);
          aggregated += 1;
          await ctx.service.pipelineEvent.record({
            brand_id: brandId, date, stage: 'aggregate',
            status: 'ok', message: '指标聚合完成（历史日期补跑）', detail: null,
          });
        } catch (e) {
          ctx.logger.error(`[parse] 品牌 ${brandId} 历史日期聚合(${date})失败: ${e.message}`);
        }
      }
    }
    return aggregated;
  }

  /**
   * 管理端：单槽重新解析（最小方案）
   * 清该 slot 旧事实 → 再跑 A/B/C → 聚合该品牌×该日。不改原文、不改槽位采集状态。
   * @param {string} slotId
   */
  async reprocessSlot(slotId) {
    const { ctx } = this;
    const M = ctx.model;
    const id = String(slotId || '').trim();
    if (!id) {
      const err = new Error('缺少 slot_id');
      err.status = 400;
      throw err;
    }

    const slot = await M.CollectSlot.findOne({ slot_id: id }).lean();
    if (!slot) {
      const err = new Error('槽位不存在');
      err.status = 404;
      throw err;
    }

    const answer = await M.RawAnswer.findOne({ slot_id: id }).lean();
    if (!answer || !answer.answer_id) {
      const err = new Error('该槽位无原始回答，无法重解析（失败槽请先重置后重采）');
      err.status = 400;
      throw err;
    }

    // 清旧事实，避免 create 重复写入
    await Promise.all([
      M.BrandMention.deleteMany({ slot_id: id }),
      M.Opinion.deleteMany({ slot_id: id }),
      M.CitationEdge.deleteMany({ slot_id: id }),
    ]);
    await M.RawAnswer.updateOne({ answer_id: answer.answer_id }, { $set: { parsed: false } });

    const fresh = await M.RawAnswer.findOne({ answer_id: answer.answer_id }).lean();
    try {
      if (fresh.query_type === 'industry') await ctx.service.pipeline.rankExtract.run(fresh);
      else await ctx.service.pipeline.reputationExtract.run(fresh);
      await ctx.service.pipeline.citationExtract.run(fresh);
      await M.RawAnswer.updateOne({ answer_id: fresh.answer_id }, { $set: { parsed: true } });
    } catch (e) {
      ctx.logger.error(`[parse] 手动重解析失败 slot=${id}: ${e.message}`);
      await ctx.service.pipelineEvent.record({
        brand_id: slot.brand_id, date: slot.date, stage: 'parse',
        status: 'fail',
        message: `手动重解析失败 ${id}`,
        error: e.message,
        detail: { slot_id: id, answer_id: answer.answer_id },
      }).catch(() => {});
      const err = new Error(e.message || '重解析失败');
      err.status = 500;
      throw err;
    }

    await ctx.service.pipeline.aggregate.run(slot.brand_id, slot.date);
    await ctx.service.pipelineEvent.record({
      brand_id: slot.brand_id, date: slot.date, stage: 'parse',
      status: 'ok',
      message: `手动重解析槽位 ${id}`,
      detail: { slot_id: id, answer_id: answer.answer_id, query_type: fresh.query_type },
    }).catch(() => {});
    await ctx.service.pipelineEvent.record({
      brand_id: slot.brand_id, date: slot.date, stage: 'aggregate',
      status: 'ok',
      message: '指标聚合完成（单槽重解析后）',
      detail: { slot_id: id },
    }).catch(() => {});

    return {
      slot_id: id,
      answer_id: answer.answer_id,
      brand_id: slot.brand_id,
      date: slot.date,
      query_type: fresh.query_type || null,
      parsed: true,
      aggregated: true,
    };
  }
}
module.exports = ParseService;
