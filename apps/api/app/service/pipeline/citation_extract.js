'use strict';
/**
 * 流水线C：引用源归一化
 * 读 raw_answers.cited_urls → upsert cited_articles/canonical_sources → 写 citation_edges
 * 自有归因：canonical_url 命中本品牌 publish_orders.published_url → citation_edges.is_own=true
 */
const { Service } = require('egg');

class CitationExtractService extends Service {
  normalizeUrl(raw) { /* 去 utm/锚点/大小写/尾斜杠，归一到 canonical_url */ return raw; }
  normalizeSource(url) { /* 域名 → 站点主名（域名映射表 + 人工修正） */ return { name: '抖音', category: '视频', domains: [] }; }
  async run(answer) {
    const { ctx } = this;
    const mine = new Set((await ctx.model.PublishOrder.find({ brand_id: answer.brand_id, status: 'ok' }).lean()).map(o => o.published_url));
    for (const c of answer.cited_urls || []) {
      const canon = this.normalizeUrl(c.url);
      const srcMeta = this.normalizeSource(canon);
      const source = await ctx.model.CanonicalSource.findOneAndUpdate({ canonical_source: srcMeta.name },
        { $setOnInsert: { source_id: ctx.helper.uuid(), category: srcMeta.category, domains: srcMeta.domains, first_cited_at: answer.date },
          $set: { last_cited_at: answer.date } }, { upsert: true, new: true });
      const article = await ctx.model.CitedArticle.findOneAndUpdate({ canonical_url: canon },
        { $setOnInsert: { article_id: ctx.helper.uuid(), url: c.url, title: c.title, source_id: source.source_id, first_cited_at: answer.date },
          $set: { last_cited_at: answer.date, is_brand_published: mine.has(canon) } }, { upsert: true, new: true });
      await ctx.model.CitationEdge.create({ slot_id: answer.slot_id, date: answer.date, brand_id: answer.brand_id,
        query_id: answer.query_id, platform: answer.platform,
        article_id: article.article_id, source_id: source.source_id,
        is_own: mine.has(canon), mentioned_entity: null });
    }
  }
}
module.exports = CitationExtractService;
