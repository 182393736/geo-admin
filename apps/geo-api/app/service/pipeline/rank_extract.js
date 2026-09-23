'use strict';
/**
 * 流水线A：榜单抽取（industry 题）
 * 读 raw_answers.answer_text → 写 brand_mentions + brand_entities(upsert)
 * 关键技术：LLM 抽取有序名录 → 品牌名归一（自家别名表 brand_aliases 命中 → is_target=true）
 *
 * 识别词命中规则（规则层，不喂 LLM）：
 *  - 全等（忽略大小写/空白）
 *  - 包含：识别词出现在抽取名中，或抽取名出现在识别词中（如「罗布麦赞」⊂「罗布麦赞特产超市」）
 *  - 含匹配要求识别词长度 ≥ 2，降低单字误伤
 */
const { Service } = require('egg');

const MIN_CONTAIN_LEN = 2;

function normKey(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, '').trim();
}

/** 抽取名是否命中任一识别词 / 品牌正式名 */
function hitsAlias(aliasKeys, ...names) {
  const candidates = names.map(normKey).filter(Boolean);
  if (!candidates.length || !aliasKeys.length) return false;
  for (const alias of aliasKeys) {
    for (const c of candidates) {
      if (c === alias) return true;
      if (alias.length >= MIN_CONTAIN_LEN && (c.includes(alias) || alias.includes(c))) return true;
    }
  }
  return false;
}

class RankExtractService extends Service {
  async run(answer) {
    const { ctx } = this;
    const { slot_id, brand_id, query_id, platform, end, date, answer_text } = answer;
    const ranked = await ctx.service.llm.deepseek.extractRankedList(answer_text, {
      brand_id,
      user_id: ((await ctx.model.Brand.findOne({ brand_id }, { user_id: 1 }).lean()) || {}).user_id || '',
      ref_id: answer.answer_id || slot_id,
    }); // [{name, norm_name, position, snippet}]
    const brand = await ctx.model.Brand.findOne({ brand_id }).lean();
    const aliasKeys = [
      ...(await ctx.model.BrandAlias.find({ brand_id, enabled: true }).lean()).map(x => normKey(x.alias)),
      normKey(brand && brand.name),
    ].filter(Boolean);

    for (const item of ranked) {
      const entity = await ctx.model.BrandEntity.findOneAndUpdate(
        { canonical_name: item.norm_name },
        { $setOnInsert: { entity_id: ctx.helper.uuid(), scope: 'discovered', discovered_from: { query_id, platform }, first_seen: date },
          $addToSet: { name_variants: item.name }, $set: { last_seen: date } },
        { upsert: true, new: true });
      const isTarget = hitsAlias(aliasKeys, item.norm_name, item.name);
      if (isTarget) await ctx.model.BrandEntity.updateOne({ entity_id: entity.entity_id }, { scope: 'target' });
      await ctx.model.BrandMention.create({ slot_id, date, brand_id, query_id, platform, end,
        entity_id: entity.entity_id, entity_name: entity.canonical_name,
        position: item.position, is_target: isTarget, snippet: item.snippet });
    }
  }
}

RankExtractService.hitsAlias = hitsAlias;
RankExtractService.normKey = normKey;
module.exports = RankExtractService;
