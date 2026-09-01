'use strict';
/**
 * 流水线B：口碑语义拆解（brand 题）
 * 读 raw_answers → LLM 抽观点 → 话题归并(opinion_topics.variants) → 写 opinions
 */
const { Service } = require('egg');

class ReputationExtractService extends Service {
  async run(answer) {
    const { ctx } = this;
    const units = await ctx.service.llm.extractOpinions(answer.answer_text); // [{quote, label, polarity}]
    for (const u of units) {
      const topic = await ctx.model.OpinionTopic.findOneAndUpdate(
        { brand_id: answer.brand_id, label: u.label },
        { $setOnInsert: { topic_id: ctx.helper.uuid(), first_seen: answer.date },
          $addToSet: { variants: u.quote }, $set: { last_seen: answer.date, polarity_hint: u.polarity } },
        { upsert: true, new: true });
      await ctx.model.Opinion.create({ slot_id: answer.slot_id, date: answer.date, brand_id: answer.brand_id,
        query_id: answer.query_id, platform: answer.platform,
        topic_id: topic.topic_id, quote_text: u.quote, polarity: u.polarity, target_entity: u.target });
    }
  }
}
module.exports = ReputationExtractService;
