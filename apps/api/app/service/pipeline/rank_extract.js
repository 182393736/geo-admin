'use strict';
/**
 * 流水线A：榜单抽取（industry 题）
 * 读 raw_answers.answer_text → 写 brand_mentions + brand_entities(upsert)
 * 关键技术：LLM 抽取有序名录 → 品牌名归一（自家别名表 brand_aliases 命中 → is_target=true）
 */
const { Service } = require('egg');

class RankExtractService extends Service {
  async run(answer) {
    const { ctx } = this;
    const { slot_id, brand_id, query_id, platform, end, date, answer_text } = answer;
    const ranked = await ctx.service.llm.extractRankedList(answer_text); // [{name, position}]
    const aliases = new Set((await ctx.model.BrandAlias.find({ brand_id, enabled: true }).lean())
      .map(x => x.alias.toLowerCase()).concat([(await ctx.model.Brand.findOne({ brand_id }).lean()).name.toLowerCase()]));
    for (const item of ranked) {
      const entity = await ctx.model.BrandEntity.findOneAndUpdate(
        { canonical_name: item.norm_name },
        { $setOnInsert: { entity_id: ctx.helper.uuid(), scope: 'discovered', discovered_from: { query_id, platform }, first_seen: date },
          $addToSet: { name_variants: item.name }, $set: { last_seen: date } },
        { upsert: true, new: true });
      const isTarget = aliases.has(item.norm_name.toLowerCase()) || aliases.has(item.name.toLowerCase());
      if (isTarget) await ctx.model.BrandEntity.updateOne({ entity_id: entity.entity_id }, { scope: 'target' });
      await ctx.model.BrandMention.create({ slot_id, date, brand_id, query_id, platform, end,
        entity_id: entity.entity_id, entity_name: entity.canonical_name,
        position: item.position, is_target: isTarget, snippet: item.snippet });
    }
  }
}
module.exports = RankExtractService;
