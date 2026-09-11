'use strict';
/**
 * S4+S5 实时轮询（测试模式）：每 5 秒检查一次新提交的回答，立即解析+聚合「今天」。
 * 仅当 config.parse.mode === 'realtime' 时生效；量大后把 PARSE_MODE 切回 daily 即自动停用。
 * 设计要点：
 *  - type:'worker' 保证单 worker 跑；
 *  - ⚠️ egg-schedule 每个 tick 都会 new 一个 Subscription 实例，实例字段（this._running）不跨 tick 保留，
 *    因此防重入守卫与清扫时间戳必须放「模块级」变量，否则并发 tick 会叠着跑（已实测）。
 *  - 每 60s 做一次全品牌清扫：覆盖仅 empty/fail（无 raw_answer）的槽位变化，刷新三率分母
 */

// 模块级防重入状态：schedule 每 tick 新建实例，状态必须挂在模块作用域才跨 tick 生效
let running = false;
let lastSweep = 0;

const { Subscription } = require('egg');

class RealtimeParse extends Subscription {
  static get schedule() { return { interval: 5000, type: 'worker', immediate: true }; }
  async subscribe() {
    const { ctx } = this;
    const config = ctx.app.config.parse || {};
    if (config.mode !== 'realtime') return; // daily 模式由 daily_parse 负责
    if (running) return;                    // 上一轮未跑完，跳过本轮
    running = true;
    try {
      const today = ctx.app.dayjs().format('YYYY-MM-DD');
      // 1) 新答案即时解析 + 按受影响品牌聚合今天
      await ctx.service.parse.runBatch({ date: today });
      // 2) 定期全量清扫（默认 60s）：聚合所有 active 品牌的今天
      const sweepMs = Number(config.sweepIntervalMs) || 60 * 1000;
      const now = Date.now();
      if (!lastSweep || now - lastSweep >= sweepMs) {
        lastSweep = now;
        await ctx.service.parse.runBatch({ date: today, all: true, skipParse: true });
      }
    } catch (e) {
      ctx.logger.error(`[realtime_parse] 轮询异常: ${e.message}`);
    } finally {
      running = false;
    }
  }
}
module.exports = RealtimeParse;
