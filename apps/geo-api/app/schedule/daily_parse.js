'use strict';
/**
 * S4+S5 日批（正式模式）：凌晨 04:00 解析+聚合「昨天」
 * 仅当 config.parse.mode === 'daily' 时生效；实时测试期由 realtime_parse 接管（此处直接 return）。
 * 读： raw_answers(parsed:false)
 * 写： brand_entities / brand_mentions / opinion_* / canonical_sources / cited_articles / citation_edges
 *     daily_metric_queries / daily_metric_brands / source_daily_stats / leaderboard_dailies
 */
const { Subscription } = require('egg');

class DailyParse extends Subscription {
  static get schedule() { return { cron: '0 0 4 * * *', type: 'worker' }; }
  async subscribe() {
    const { ctx } = this;
    if ((ctx.app.config.parse || {}).mode !== 'daily') return; // realtime 模式由 realtime_parse 负责
    const date = ctx.app.dayjs().subtract(1, 'day').format('YYYY-MM-DD'); // 日批统计日 = 昨天
    await ctx.service.parse.runBatch({ date, all: true });
  }
}
module.exports = DailyParse;
