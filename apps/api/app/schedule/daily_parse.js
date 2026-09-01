'use strict';
/**
 * S4+S5 解析与聚合批处理：凌晨 04:00（采集完成后）
 * 读： raw_answers(parsed:false)
 * 写： brand_entities / brand_mentions / opinion_* / canonical_sources / cited_articles / citation_edges
 *     daily_metric_queries / daily_metric_brands / source_daily_stats / leaderboard_dailies
 */
const { Subscription } = require('egg').Schedule;

class DailyParse extends Subscription {
  static get schedule() { return { cron: '0 0 4 * * *', type: 'worker' }; }
  async subscribe() {
    const { app } = this;
    const answers = await app.mongoose.model('RawAnswer').find({ parsed: false }).limit(5000);
    for (const a of answers) {
      if (a.query_type === 'industry') await app.service.pipeline.rankExtract.run(a);   // 流水线A
      else await app.service.pipeline.reputationExtract.run(a);                        // 流水线B
      await app.service.pipeline.citationExtract.run(a);                               // 流水线C
      await app.mongoose.model('RawAnswer').updateOne({ answer_id: a.answer_id }, { parsed: true });
    }
    await app.service.pipeline.aggregate.run();                                        // S5 聚合
  }
}
module.exports = DailyParse;
