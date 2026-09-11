'use strict';
const Controller = require('egg').Controller;

/**
 * 发稿渠道库（采集前即需真实展示：信源库页）
 *  - POST /publish/media/facets  行业标签聚合（taxonomy）
 *  - POST /publish/media/list    渠道列表（被引降序，分页）
 * 渠道本体为运维种子数据（app.js 幂等灌注代表性渠道）。
 */
class PublishController extends Controller {
  _fmtChannel(c) {
    return {
      media_key: c.media_key, name: c.name, type: c.type || '',
      favicon: c.favicon || '', site_url: c.site_url || '',
      list_price: c.list_price != null ? c.list_price : 0,
      sell_price: c.sell_price != null ? c.sell_price : 0,
      discount_rate: c.discount_rate != null ? c.discount_rate : 0,
      categories: c.categories || [], indexed_engines: c.indexed_engines || [],
      ref_count: c.ref_count || 0, article_count: c.article_count || 0,
      query_count: c.query_count || 0,
      cost_per_citation: c.cost_per_citation != null ? c.cost_per_citation : null,
      stats_window_days: c.stats_window_days || 30,
    };
  }

  async mediaFacets() {
    const { ctx } = this;
    // 行业标签聚合：categories 数组展开计数
    const rows = await ctx.model.MediaChannel.find({ enabled: { $ne: false } }, { categories: 1 }).lean();
    const counter = {};
    for (const r of rows) {
      for (const cat of (r.categories || [])) {
        if (cat) counter[cat] = (counter[cat] || 0) + 1;
      }
    }
    const taxonomy = Object.entries(counter)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
    ctx.body = { code: 200, msg: 'ok', data: { taxonomy } };
  }

  async orders() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.size, 10) || 20));
    const brands = await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } })
      .sort({ created_at: 1 }).lean();
    const brandIds = brands.map(x => x.brand_id);
    const q = brandIds.length ? { brand_id: { $in: brandIds } } : { brand_id: userId };
    const [total, rows] = await Promise.all([
      ctx.model.PublishOrder.countDocuments(q),
      ctx.model.PublishOrder.find(q).sort({ created_at: -1 }).skip((page - 1) * size).limit(size).lean(),
    ]);
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(o => ({
          order_no: o.order_no, article_title: o.article_title || '', media_name: o.media_name || '',
          status: o.status || 'pending', published_url: o.published_url || null, fail_reason: o.fail_reason || null,
          list_price: o.list_price != null ? o.list_price : 0, sell_price: o.sell_price != null ? o.sell_price : 0,
          cite_count: o.cite_count || 0, published_at: o.published_at || null, created_at: o.created_at,
        })),
        total, page, size,
      },
    };
  }

  async mediaList() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.size, 10) || 20));
    const sort = b.sort || 'cite-desc';

    const q = { enabled: { $ne: false } };
    if (b.category) q.categories = b.category;
    const sortMap = {
      'cite-desc': { ref_count: -1, _id: 1 },
      'price-asc': { sell_price: 1, _id: 1 },
      'price-desc': { sell_price: -1, _id: 1 },
    };
    const sortBy = sortMap[sort] || sortMap['cite-desc'];

    const [total, rows] = await Promise.all([
      ctx.model.MediaChannel.countDocuments(q),
      ctx.model.MediaChannel.find(q).sort(sortBy).skip((page - 1) * size).limit(size).lean(),
    ]);

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(r => this._fmtChannel(r)),
        total, page, size,
        display_mode: b.display_mode || 'account',
        stats_window_days: 30,
        discount_rate: null,
        fav_total: 0,
      },
    };
  }
}

module.exports = PublishController;
