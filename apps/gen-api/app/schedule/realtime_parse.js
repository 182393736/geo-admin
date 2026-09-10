'use strict';
/**
 * S4+S5 实时轮询（测试模式）：每 5 秒检查一次新提交的回答，立即解析+聚合「今天」。
 * 仅当 config.parse.mode === 'realtime' 时生效；量大后把 PARSE_MODE 切回 daily 即自动停用。
 * 设计要点：
 *  - type:'worker' 保证单 worker 跑；this._running 守卫防止上一轮未跑完时重叠
 *  - 每 60s 做一次全品牌清扫：覆盖仅 empty/fail（无 raw_answer）的槽位变化，刷新三率分母
 */
const { Subscription } = require('egg');

class RealtimeParse extends Subscription {
  static get schedule() { return { interval: 5000, type: 'worker', immediate: true }; }
  async subscribe() {
    const { app } = this;
    const config = app.config.parse || {};
    if (config.mode !== 'realtime') return; // daily 模式由 daily_parse 负责
    if (this._running) return;              // 上一轮未跑完，跳过本轮
    this._running = true;
    try {
      const today = app.dayjs().format('YYYY-MM-DD');
      // 1) 新答案即时解析 + 按受影响品牌聚合今天
      await app.service.parse.runBatch({ date: today });
      // 2) 定期全量清扫（默认 60s）：聚合所有 active 品牌的今天
      const sweepMs = Number(config.sweepIntervalMs) || 60 * 1000;
      const now = Date.now();
      if (!this._lastSweep || now - this._lastSweep >= sweepMs) {
        this._lastSweep = now;
        await app.service.parse.runBatch({ date: today, all: true, skipParse: true });
      }
    } catch (e) {
      app.logger.error(`[realtime_parse] 轮询异常: ${e.message}`);
    } finally {
      this._running = false;
    }
  }
}
module.exports = RealtimeParse;
