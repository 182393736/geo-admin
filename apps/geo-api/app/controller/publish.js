'use strict';
const Controller = require('egg').Controller;

/**
 * 发稿渠道库（采集前即需真实展示：信源库页）
 *  - POST /publish/media/facets  行业标签聚合（taxonomy）
 *  - POST /publish/media/list    渠道列表（被引降序，分页）
 * 渠道本体为运维种子数据（app.js 幂等灌注代表性渠道）。
 */
class PublishController extends Controller {
  async _requireBrand(brandId) {
    const { ctx } = this;
    try {
      return await ctx.service.brandScope.requireBrand(ctx.state.user.id, brandId);
    } catch (e) {
      ctx.status = e.status || 400;
      ctx.body = { code: e.code || e.status || 400, msg: e.message };
      return null;
    }
  }

  _fmtChannel(c, { fav = false, display_mode = 'account' } = {}) {
    const listPts = this._toPoints(c.list_price);
    const sellPts = this._toPoints(c.sell_price);
    const platform = c.platform || c.name || '';
    const engines = c.indexed_engines || [];
    return {
      media_key: c.media_key,
      name: c.name,
      account_name: c.account_name || c.name,
      platform,
      type: c.type || '',
      category: c.type === '新闻门户' || c.type === '官方网媒' ? 'portal' : 'selfmedia',
      category_label: c.type || '自媒体',
      favicon: c.favicon || '',
      logo: c.favicon || '',
      site_url: c.site_url || '',
      url: c.site_url || '',
      case_url: c.case_url || c.site_url || null,
      list_price: listPts,
      sell_price: sellPts,
      discount_rate: c.discount_rate != null ? c.discount_rate : 0,
      categories: c.categories || [],
      taxonomy: (c.categories && c.categories[0]) || '',
      area: c.area || '全国',
      indexed_engines: engines,
      geo_engines: engines,
      cited_by: Object.fromEntries(engines.map(e => [e, c.ref_count || 0])),
      ref_count: c.ref_count || 0,
      cite_count: c.ref_count || 0,
      article_count: c.article_count || 0,
      account_count: c.account_count || 1,
      query_count: c.query_count || 0,
      cost_per_citation: c.cost_per_citation != null ? c.cost_per_citation : null,
      stats_window_days: c.stats_window_days || 30,
      auth_status: c.auth_status != null ? c.auth_status : 1,
      inclusion: c.inclusion || null,
      success_rate: c.success_rate != null ? c.success_rate : null,
      note: c.note || '',
      fav: !!fav,
      display_mode,
      can_geo: engines.length > 0,
      is_recommend: (c.ref_count || 0) >= 80,
      icon_color: null,
    };
  }

  /** 种子价为「分」，对标展示为「积分」 */
  _toPoints(v) {
    const n = Number(v) || 0;
    if (n >= 1000) return Math.round(n / 100);
    return Math.round(n);
  }

  async mediaFacets() {
    const { ctx } = this;
    const rows = await ctx.model.MediaChannel.find({ enabled: { $ne: false } })
      .select('categories type area platform name')
      .lean();
    const counter = {};
    const areas = {};
    const types = {};
    for (const r of rows) {
      for (const cat of (r.categories || [])) {
        if (cat) counter[cat] = (counter[cat] || 0) + 1;
      }
      const area = r.area || '全国';
      areas[area] = (areas[area] || 0) + 1;
      const t = r.type || '自媒体';
      types[t] = (types[t] || 0) + 1;
    }
    const taxonomy = Object.entries(counter)
      .map(([ value, count ]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        taxonomy,
        areas: Object.entries(areas).map(([ value, count ]) => ({ value, count })).sort((a, b) => b.count - a.count),
        types: Object.entries(types).map(([ value, count ]) => ({ value, count })),
      },
    };
  }

  async mediaList() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.size, 10) || 20));
    const sort = b.sort || 'cite-desc';
    const displayMode = b.display_mode === 'platform' ? 'platform' : 'account';
    const favOnly = !!b.fav;

    const q = { enabled: { $ne: false } };
    const kw = String(b.q || b.keyword || '').trim();
    if (kw) {
      q.$or = [
        { name: new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { platform: new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { note: new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      ];
    }
    if (b.category) {
      // portal / selfmedia 粗分
      if (b.category === 'portal') q.type = { $in: [ '新闻门户', '官方网媒' ] };
      else if (b.category === 'selfmedia') q.type = { $nin: [ '新闻门户', '官方网媒' ] };
      else q.categories = b.category;
    }
    if (b.taxonomy) q.categories = b.taxonomy;
    if (b.area) q.area = b.area;
    if (b.engine && b.engine !== 'all') q.indexed_engines = b.engine;
    if (b.auth === 'yes') q.auth_status = { $ne: 0 };
    if (b.auth === 'no') q.auth_status = 0;
    const mediaKeys = Array.isArray(b.media_keys)
      ? b.media_keys.map(k => String(k || '').trim()).filter(Boolean)
      : String(b.media_keys || '').split(',').map(k => k.trim()).filter(Boolean);
    if (mediaKeys.length) q.media_key = { $in: mediaKeys };

    const priceMin = b.price_min != null && b.price_min !== '' ? Number(b.price_min) : null;
    const priceMax = b.price_max != null && b.price_max !== '' ? Number(b.price_max) : null;
    // 入参是积分；库内可能是分
    if (Number.isFinite(priceMin) || Number.isFinite(priceMax)) {
      const range = {};
      if (Number.isFinite(priceMin)) range.$gte = priceMin * 100;
      if (Number.isFinite(priceMax)) range.$lte = priceMax * 100;
      q.sell_price = range;
    }

    let favKeys = [];
    const favTotal = await ctx.model.MediaFav.countDocuments({ user_id: userId });
    if (favOnly) {
      favKeys = (await ctx.model.MediaFav.find({ user_id: userId }).select('media_key').lean()).map(f => f.media_key);
      q.media_key = { $in: favKeys.length ? favKeys : [ '__none__' ] };
    } else {
      favKeys = (await ctx.model.MediaFav.find({ user_id: userId }).select('media_key').lean()).map(f => f.media_key);
    }
    const favSet = new Set(favKeys);

    const sortMap = {
      'cite-desc': { ref_count: -1, _id: 1 },
      'price-asc': { sell_price: 1, _id: 1 },
      'price-desc': { sell_price: -1, _id: 1 },
      'succ-desc': { success_rate: -1, ref_count: -1, _id: 1 },
      verdict: { ref_count: -1, sell_price: 1, _id: 1 },
    };
    const sortBy = sortMap[sort] || sortMap['cite-desc'];

    if (displayMode === 'platform') {
      // 按 platform/name 聚合
      const all = await ctx.model.MediaChannel.find(q).lean();
      const groups = {};
      for (const c of all) {
        const key = c.platform || c.name;
        const g = (groups[key] ||= {
          media_key: `plat_${key}`,
          name: key,
          platform: key,
          type: c.type || '自媒体',
          categories: new Set(c.categories || []),
          indexed_engines: new Set(c.indexed_engines || []),
          ref_count: 0,
          article_count: 0,
          account_count: 0,
          list_price: null,
          sell_price: null,
          area: c.area || '全国',
          note: '',
          site_url: c.site_url || '',
        });
        g.account_count += 1;
        g.ref_count += c.ref_count || 0;
        g.article_count += c.article_count || 0;
        for (const cat of (c.categories || [])) g.categories.add(cat);
        for (const e of (c.indexed_engines || [])) g.indexed_engines.add(e);
        const sp = c.sell_price != null ? c.sell_price : null;
        const lp = c.list_price != null ? c.list_price : null;
        if (sp != null && (g.sell_price == null || sp < g.sell_price)) {
          g.sell_price = sp;
          g.list_price = lp;
        }
      }
      let list = Object.values(groups).map(g => ({
        ...g,
        categories: [ ...g.categories ],
        indexed_engines: [ ...g.indexed_engines ],
      }));
      list.sort((a, z) => {
        if (sort === 'price-asc') return (a.sell_price || 0) - (z.sell_price || 0);
        if (sort === 'price-desc') return (z.sell_price || 0) - (a.sell_price || 0);
        return (z.ref_count || 0) - (a.ref_count || 0);
      });
      const total = list.length;
      const pageRows = list.slice((page - 1) * size, page * size);
      ctx.body = {
        code: 200, msg: 'ok',
        data: {
          list: pageRows.map(r => this._fmtChannel(r, { fav: false, display_mode: 'platform' })),
          total, page, size,
          display_mode: 'platform',
          stats_window_days: 30,
          discount_rate: null,
          fav_total: favTotal,
          stats_status: 'ok',
        },
      };
      return;
    }

    const [ total, rows ] = await Promise.all([
      ctx.model.MediaChannel.countDocuments(q),
      ctx.model.MediaChannel.find(q).sort(sortBy).skip((page - 1) * size).limit(size).lean(),
    ]);

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(r => this._fmtChannel(r, { fav: favSet.has(r.media_key), display_mode: 'account' })),
        total, page, size,
        display_mode: 'account',
        stats_window_days: 30,
        discount_rate: null,
        fav_total: favTotal,
        stats_status: 'ok',
      },
    };
  }

  /** POST /publish/media/fav — 收藏/取消 */
  async mediaFav() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const mediaKey = String(b.media_key || '').trim();
    if (!mediaKey) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'media_key required' };
      return;
    }
    const fav = b.fav !== false && b.fav !== 0 && b.fav !== '0';
    if (fav) {
      await ctx.model.MediaFav.updateOne(
        { user_id: userId, media_key: mediaKey },
        { $setOnInsert: { user_id: userId, media_key: mediaKey } },
        { upsert: true },
      );
    } else {
      await ctx.model.MediaFav.deleteOne({ user_id: userId, media_key: mediaKey });
    }
    const fav_total = await ctx.model.MediaFav.countDocuments({ user_id: userId });
    ctx.body = { code: 200, msg: 'ok', data: { media_key: mediaKey, fav, fav_total } };
  }

  async orders() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.size, 10) || 20));
    const brand = b.brand_id ? await this._requireBrand(b.brand_id) : null;
    if (b.brand_id && !brand) return;

    const brands = brand
      ? [ brand ]
      : await ctx.model.Brand.find({ user_id: userId, status: { $ne: 'disabled' } }).sort({ created_at: 1 }).lean();
    const brandIds = brands.map(x => x.brand_id);
    const baseQ = brandIds.length ? { brand_id: { $in: brandIds } } : { brand_id: userId };

    const kw = String(b.q || b.keyword || '').trim();
    const cite = b.cite || b.cite_status || 'all';
    const statusTab = String(b.status || b.tab || 'all');
    const start = b.start_date || b.start || null;
    const end = b.end_date || b.end || null;

    const q = { ...baseQ };
    if (kw) {
      const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      q.$or = [
        { article_title: re },
        { media_name: re },
        { order_no: re },
      ];
    }
    if (statusTab === 'publishing' || statusTab === 'pending') {
      q.status = { $in: [ 'pending', 'submitted' ] };
    } else if (statusTab === 'ok' || statusTab === 'published') {
      q.status = 'ok';
    } else if (statusTab === 'fail' || statusTab === 'failed') {
      q.status = 'fail';
    }
    if (cite === 'cited') q.cite_count = { $gt: 0 };
    else if (cite === 'uncited') q.cite_count = { $lte: 0 };

    if (start || end) {
      q.created_at = {};
      if (start) q.created_at.$gte = new Date(`${start}T00:00:00.000Z`);
      if (end) q.created_at.$lte = new Date(`${end}T23:59:59.999Z`);
    }

    const sortKey = b.sort || 'newest';
    const sortMap = {
      newest: { created_at: -1 },
      oldest: { created_at: 1 },
      'cite-desc': { cite_count: -1, created_at: -1 },
      'price-desc': { sell_price: -1, created_at: -1 },
    };
    const sortBy = sortMap[sortKey] || sortMap.newest;

    const draftQ = { uid: userId, status: 'draft' };
    if (brand) draftQ.brand_id = brand.brand_id;

    const [ total, rows, draftTotal, allTotal, publishingTotal, okTotal, failTotal ] = await Promise.all([
      statusTab === 'draft' ? Promise.resolve(0) : ctx.model.PublishOrder.countDocuments(q),
      statusTab === 'draft'
        ? Promise.resolve([])
        : ctx.model.PublishOrder.find(q).sort(sortBy).skip((page - 1) * size).limit(size).lean(),
      ctx.model.ArticleGenerated.countDocuments(draftQ),
      ctx.model.PublishOrder.countDocuments(baseQ),
      ctx.model.PublishOrder.countDocuments({ ...baseQ, status: { $in: [ 'pending', 'submitted' ] } }),
      ctx.model.PublishOrder.countDocuments({ ...baseQ, status: 'ok' }),
      ctx.model.PublishOrder.countDocuments({ ...baseQ, status: 'fail' }),
    ]);

    let list = rows.map(o => ({
      order_no: o.order_no,
      article_id: o.article_id || null,
      article_title: o.article_title || '',
      article_note: o.article_note || '',
      media_key: o.media_key || '',
      media_name: o.media_name || '',
      status: o.status || 'pending',
      published_url: o.published_url || null,
      fail_reason: o.fail_reason || null,
      list_price: o.list_price != null ? o.list_price : 0,
      sell_price: o.sell_price != null ? o.sell_price : 0,
      cite_count: o.cite_count || 0,
      published_at: o.published_at || null,
      created_at: o.created_at,
      row_type: 'order',
    }));

    if (statusTab === 'draft') {
      const draftFind = { ...draftQ };
      if (kw) draftFind.title = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const [ draftFilteredTotal, drafts ] = await Promise.all([
        ctx.model.ArticleGenerated.countDocuments(draftFind),
        ctx.model.ArticleGenerated.find(draftFind)
          .sort({ updated_at: -1 }).skip((page - 1) * size).limit(size).lean(),
      ]);
      list = drafts.map(a => ({
        order_no: null,
        article_id: a.article_id,
        article_title: a.title || '未命名草稿',
        article_note: '',
        media_key: '',
        media_name: '—',
        status: 'draft',
        published_url: null,
        fail_reason: null,
        list_price: 0,
        sell_price: 0,
        cite_count: 0,
        published_at: null,
        created_at: a.updated_at || a.created_at,
        row_type: 'draft',
        word_count: a.word_count || 0,
      }));
      ctx.body = {
        code: 200, msg: 'ok',
        data: {
          list,
          total: draftFilteredTotal,
          page, size,
          counts: {
            draft: draftTotal,
            all: allTotal,
            publishing: publishingTotal,
            ok: okTotal,
            fail: failTotal,
          },
        },
      };
      return;
    }

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list,
        total,
        page, size,
        counts: {
          draft: draftTotal,
          all: allTotal,
          publishing: publishingTotal,
          ok: okTotal,
          fail: failTotal,
        },
      },
    };
  }

  /** POST /publish/order/republish — 失败订单重试 */
  async orderRepublish() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const orderNo = String(b.order_no || '').trim();
    if (!orderNo) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'order_no required' };
      return;
    }
    const order = await ctx.model.PublishOrder.findOne({ order_no: orderNo }).lean();
    if (!order) {
      ctx.status = 404;
      ctx.body = { code: 404, msg: '订单不存在' };
      return;
    }
    const brand = await this._requireBrand(order.brand_id);
    if (!brand) return;
    if (order.status !== 'fail') {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '仅失败订单可重试' };
      return;
    }
    const { v4: uuid } = require('uuid');
    const newNo = `PB${Date.now()}${uuid().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    await ctx.model.PublishOrder.create({
      order_no: newNo,
      user_id: userId,
      brand_id: order.brand_id,
      article_id: order.article_id,
      article_title: order.article_title,
      article_note: order.article_note || '',
      media_key: order.media_key,
      media_name: order.media_name,
      status: 'submitted',
      list_price: order.list_price,
      sell_price: order.sell_price,
      discount_rate: order.discount_rate || 0,
      cite_count: 0,
    });
    const pts = order.sell_price || 0;
    if (pts > 0) {
      await ctx.model.CreditAccount.updateOne(
        { user_id: userId },
        { $inc: { frozen: pts, available: -pts } },
      );
    }
    ctx.body = { code: 200, msg: 'ok', data: { order_no: newNo, from: orderNo } };
  }

  /** POST /publish/order/cites — 订单引用明细（占位） */
  async orderCites() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const orderNo = String(b.order_no || '').trim();
    const order = orderNo
      ? await ctx.model.PublishOrder.findOne({ order_no: orderNo }).lean()
      : null;
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        order_no: orderNo,
        cite_count: order?.cite_count || 0,
        list: [],
      },
    };
  }

  /* ---------- 稿件草稿（对标 POST /publish/article/drafts body { size } → { list, total, page }） ---------- */
  async articleDrafts() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const size = Math.min(200, Math.max(1, parseInt(b.size, 10) || 50));
    const kw = String(b.q || b.keyword || '').trim();
    const q = { uid: userId };
    if (kw) q.title = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const rows = await ctx.model.ArticleGenerated.find(q)
      .sort({ updated_at: -1 }).limit(size).lean();
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: rows.map(a => ({
          article_id: a.article_id, job_id: a.job_id || null, title: a.title || '',
          content_md: a.content_md || '',
          word_count: a.word_count || 0, status: a.status,
          quality_report: a.quality_report || null,
          style_references: a.style_references || [],
          publish_order_nos: a.publish_order_nos || [],
          created_at: a.created_at, updated_at: a.updated_at,
        })),
        total: rows.length, page: 1,
      },
    };
  }

  /** POST /publish/article/save_draft — 存草稿 / 更新草稿 */
  async articleSaveDraft() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const title = String(b.title || '').trim();
    const content = String(b.content_md || b.content_html || b.content || '');
    if (!title && !content) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '标题或正文不能为空' };
      return;
    }
    const brand = b.brand_id ? await this._requireBrand(b.brand_id) : null;
    if (b.brand_id && !brand) return;

    const plain = content.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    const word_count = plain.length;
    let article_id = String(b.article_id || '').trim();
    const nowPayload = {
      title: title || '未命名草稿',
      content_md: content,
      word_count,
      status: 'draft',
      uid: userId,
      brand_id: brand ? brand.brand_id : (b.brand_id || null),
    };

    if (article_id) {
      const updated = await ctx.model.ArticleGenerated.findOneAndUpdate(
        { article_id, uid: userId },
        { $set: nowPayload },
        { new: true },
      ).lean();
      if (!updated) {
        ctx.status = 404;
        ctx.body = { code: 404, msg: '草稿不存在' };
        return;
      }
      ctx.body = { code: 200, msg: 'ok', data: { article_id, word_count, title: nowPayload.title } };
      return;
    }

    const { v4: uuid } = require('uuid');
    article_id = `AG${Date.now()}${uuid().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    await ctx.model.ArticleGenerated.create({ article_id, ...nowPayload });
    ctx.body = { code: 200, msg: 'ok', data: { article_id, word_count, title: nowPayload.title } };
  }

  /** POST /publish/estimate — 估价（积分合计） */
  async estimate() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const keys = Array.isArray(b.media_keys)
      ? b.media_keys.map(k => String(k || '').trim()).filter(Boolean)
      : [];
    if (!keys.length) {
      ctx.body = { code: 200, msg: 'ok', data: { total_points: 0, list: [], count: 0 } };
      return;
    }
    const rows = await ctx.model.MediaChannel.find({ media_key: { $in: keys } }).lean();
    const list = rows.map(r => ({
      media_key: r.media_key,
      name: r.name || r.platform || '',
      list_price: this._toPoints(r.list_price),
      sell_price: this._toPoints(r.sell_price),
    }));
    const total_points = list.reduce((s, x) => s + (x.sell_price || 0), 0);
    ctx.body = {
      code: 200, msg: 'ok',
      data: { total_points, list, count: list.length, article_id: b.article_id || null },
    };
  }

  /** POST /publish/submit — 提交发稿订单 */
  async submit() {
    const { ctx } = this;
    const userId = ctx.state.user.id;
    const b = ctx.request.body || {};
    const title = String(b.title || b.article_title || '').trim();
    const content = String(b.content_md || b.content_html || b.content || '');
    const note = String(b.article_note || b.note || '').trim();
    const scheduleAt = b.schedule_at || b.publish_at || null;
    const keys = Array.isArray(b.media_keys)
      ? [ ...new Set(b.media_keys.map(k => String(k || '').trim()).filter(Boolean)) ]
      : [];

    if (!title) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '请填写稿件标题' };
      return;
    }
    if (!keys.length) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: '请选择发布媒体' };
      return;
    }

    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    let article_id = String(b.article_id || '').trim();
    const plain = content.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    const word_count = plain.length;
    if (!article_id) {
      const { v4: uuid } = require('uuid');
      article_id = `AG${Date.now()}${uuid().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
      await ctx.model.ArticleGenerated.create({
        article_id, uid: userId, brand_id: brand.brand_id,
        title, content_md: content, word_count, status: 'ready',
      });
    } else {
      await ctx.model.ArticleGenerated.updateOne(
        { article_id, uid: userId },
        { $set: { title, content_md: content, word_count, status: 'ready', brand_id: brand.brand_id } },
      );
    }

    const channels = await ctx.model.MediaChannel.find({ media_key: { $in: keys } }).lean();
    const byKey = Object.fromEntries(channels.map(c => [ c.media_key, c ]));
    const missing = keys.filter(k => !byKey[k]);
    if (missing.length) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: `媒体不存在: ${missing.slice(0, 3).join(',')}` };
      return;
    }

    const totalPoints = channels.reduce((s, c) => s + this._toPoints(c.sell_price), 0);
    let acc = await ctx.model.CreditAccount.findOne({ user_id: userId });
    if (!acc) {
      acc = await ctx.model.CreditAccount.create({
        user_id: userId,
        gold_balance: 0, silver_balance: 0, frozen: 0,
        available: 0, publish_available: 0,
        total_recharge: 0, total_consume: 0, total_expired: 0,
      });
    }
    const gold = acc.gold_balance || 0;
    const silver = acc.silver_balance || 0;
    const frozen = acc.frozen || 0;
    const available = acc.available != null ? acc.available : (gold + silver - frozen);
    if (available < totalPoints) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: `积分不足，需要 ${totalPoints}，可用 ${Math.max(0, available)}` };
      return;
    }

    const { v4: uuid } = require('uuid');
    const orderNos = [];
    const created = [];
    for (const key of keys) {
      const c = byKey[key];
      const sell = this._toPoints(c.sell_price);
      const list = this._toPoints(c.list_price);
      const order_no = `PB${Date.now()}${uuid().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
      const doc = {
        order_no,
        user_id: userId,
        brand_id: brand.brand_id,
        article_id,
        article_title: title,
        article_note: scheduleAt ? `${note ? note + ' | ' : ''}定时:${scheduleAt}` : note,
        media_key: key,
        media_name: c.name || c.platform || key,
        status: scheduleAt ? 'pending' : 'submitted',
        list_price: list,
        sell_price: sell,
        discount_rate: c.discount_rate != null ? c.discount_rate : 0,
        published_at: null,
        cite_count: 0,
      };
      await ctx.model.PublishOrder.create(doc);
      orderNos.push(order_no);
      created.push({ order_no, media_key: key, media_name: doc.media_name, sell_price: sell });
    }

    await ctx.model.CreditAccount.updateOne(
      { user_id: userId },
      {
        $inc: {
          frozen: totalPoints,
          available: -totalPoints,
          gold_balance: -Math.min(gold, totalPoints),
        },
      },
    );
    await ctx.model.ArticleGenerated.updateOne(
      { article_id },
      { $addToSet: { publish_order_nos: { $each: orderNos } }, $set: { status: 'published' } },
    );

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        article_id,
        order_nos: orderNos,
        orders: created,
        total_points: totalPoints,
        schedule_at: scheduleAt,
      },
    };
  }

  /* ---------- 稿件库 / 稿件追踪（对标 POST /article/library） ---------- */
  async articleLibrary() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const page = Math.max(1, parseInt(b.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(b.page_size || b.size, 10) || 20));
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);

    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;

    // 同步发稿成功订单到 cited_articles（source_kind=publish）
    const orders = await ctx.model.PublishOrder.find({
      brand_id: brand.brand_id,
      status: 'ok',
      published_url: { $nin: [ null, '' ] },
    }).lean();
    const crypto = require('crypto');
    for (const o of orders) {
      const rawUrl = String(o.published_url || '').trim();
      if (!rawUrl) continue;
      let canon = rawUrl;
      try {
        const u = new URL(rawUrl);
        u.hash = '';
        canon = u.toString();
      } catch { /* keep */ }
      const article_id = crypto.createHash('sha1').update(canon).digest('hex').slice(0, 16);
      const reg = o.published_at
        ? ctx.app.dayjs(o.published_at).format('YYYY-MM-DD')
        : (o.created_at ? ctx.app.dayjs(o.created_at).format('YYYY-MM-DD') : ctx.app.dayjs().format('YYYY-MM-DD'));
      await ctx.model.CitedArticle.updateOne(
        { canonical_url: canon },
        {
          $set: {
            article_id,
            brand_id: brand.brand_id,
            url: rawUrl,
            title: o.article_title || canon,
            is_brand_published: true,
            source_kind: 'publish',
            content_type: 'graphic',
            registered_at: reg,
          },
          $setOnInsert: { first_cited_at: reg, last_cited_at: reg },
        },
        { upsert: true },
      );
      await ctx.model.CitationEdge.updateMany(
        { brand_id: brand.brand_id, article_id },
        { $set: { is_own: true } },
      );
    }

    // 收录：品牌登记文章 + is_own 边对应文章
    const ownEdgeIds = await ctx.model.CitationEdge.distinct('article_id', {
      brand_id: brand.brand_id, is_own: true,
    });
    const idOrBrand = {
      $or: [
        { brand_id: brand.brand_id },
        ...(ownEdgeIds.length ? [{ article_id: { $in: ownEdgeIds } }] : []),
      ],
    };
    const ands = [ idOrBrand ];
    if (b.source_kind === 'own' || b.source === 'own') ands.push({ source_kind: 'own' });
    if (b.source_kind === 'publish' || b.source === 'publish') {
      ands.push({ $or: [ { source_kind: 'publish' }, { is_brand_published: true } ] });
    }
    if (b.content_type === 'graphic' || b.content_type === 'video') ands.push({ content_type: b.content_type });
    const kw = String(b.q || b.keyword || '').trim();
    if (kw) {
      const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      ands.push({ $or: [ { title: re }, { url: re }, { canonical_url: re } ] });
    }
    const q = ands.length === 1 ? ands[0] : { $and: ands };

    let rows = await ctx.model.CitedArticle.find(q).lean();
    // 去重
    const seen = new Set();
    rows = rows.filter(r => {
      if (seen.has(r.article_id)) return false;
      seen.add(r.article_id);
      return true;
    });

    // 周期内引用边
    const edgeQ = { brand_id: brand.brand_id, article_id: { $in: rows.map(r => r.article_id) } };
    if (start && end) edgeQ.date = { $gte: start, $lte: end };
    if (b.engine && b.engine !== 'all') edgeQ.platform = b.engine;
    if (b.query_type === 'industry' || b.query_type === 'brand') edgeQ.query_type = b.query_type;
    const qid = parseInt(b.query_id, 10);
    if (Number.isFinite(qid) && qid > 0) edgeQ.query_id = qid;

    const edges = rows.length
      ? await ctx.model.CitationEdge.find(edgeQ).select('article_id platform query_id query_type').lean()
      : [];
    const byArt = {};
    for (const e of edges) {
      const a = (byArt[e.article_id] ||= { ref_count: 0, engines: new Set(), queries: {} });
      a.ref_count += 1;
      if (e.platform) a.engines.add(e.platform);
      if (e.query_id != null) a.queries[e.query_id] = (a.queries[e.query_id] || 0) + 1;
    }

    let list = rows.map(r => {
      const st = byArt[r.article_id] || { ref_count: 0, engines: new Set(), queries: {} };
      const source_kind = r.source_kind || (r.is_brand_published ? 'publish' : 'own');
      const content_type = r.content_type || 'graphic';
      return {
        id: r.article_id,
        article_id: r.article_id,
        title: r.title || '',
        url: r.url || r.canonical_url || null,
        canonical_url: r.canonical_url || r.url || null,
        source_kind,
        source_label: source_kind === 'publish' ? '发稿' : '登记',
        content_type,
        content_label: content_type === 'video' ? '视频' : '图文',
        registered_at: r.registered_at || r.first_cited_at || (r.created_at ? ctx.app.dayjs(r.created_at).format('YYYY-MM-DD') : null),
        publish_date: r.publish_date || null,
        first_cited_at: r.first_cited_at || null,
        last_cited_at: r.last_cited_at || null,
        is_brand_published: !!r.is_brand_published,
        cite_count: st.ref_count,
        engine_count: st.engines.size,
        engines: [ ...st.engines ],
        cited: st.ref_count > 0,
      };
    });

    // 引用状态筛选（基于周期内 cite）
    if (b.cite === 'cited') list = list.filter(x => x.cited);
    else if (b.cite === 'uncited') list = list.filter(x => !x.cited);

    // 引擎/问题类型过滤：若指定了引擎或问题类型但周期内无边，也应从 list 排除（除非 uncited 想看未引用）
    if ((b.engine && b.engine !== 'all') || b.query_type === 'industry' || b.query_type === 'brand' || (Number.isFinite(qid) && qid > 0)) {
      if (b.cite !== 'uncited') list = list.filter(x => x.cite_count > 0);
    }

    const sortBy = b.sort_by || b.sort || 'registered_at';
    const sortAsc = b.sort_order === 'asc';
    list.sort((a, z) => {
      if (sortBy === 'cite' || sortBy === 'cite_count' || sortBy === 'ref_count') {
        const d = (a.cite_count || 0) - (z.cite_count || 0);
        return sortAsc ? d : -d;
      }
      const av = a.registered_at || '';
      const zv = z.registered_at || '';
      return sortAsc ? av.localeCompare(zv) : zv.localeCompare(av);
    });

    const allImported = await ctx.model.CitedArticle.countDocuments(idOrBrand);
    const allArts = await ctx.model.CitedArticle.find(idOrBrand).select('article_id').lean();
    const allIds = [ ...new Set(allArts.map(a => a.article_id)) ];
    const statsEdgeQ = { brand_id: brand.brand_id, article_id: { $in: allIds } };
    if (start && end) statsEdgeQ.date = { $gte: start, $lte: end };
    const statsEdges = allIds.length
      ? await ctx.model.CitationEdge.find(statsEdgeQ).select('article_id').lean()
      : [];
    const citedSet = new Set(statsEdges.map(e => e.article_id));
    const periodCitedArticles = citedSet.size;
    const periodCiteTimes = statsEdges.length;
    const citeRate = allImported ? Math.round((periodCitedArticles / allImported) * 1000) / 10 : 0;

    const total = list.length;
    const pageRows = list.slice((page - 1) * size, page * size);

    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        list: pageRows,
        total,
        page,
        page_size: size,
        stats: {
          imported: allImported,
          period_cited_articles: periodCitedArticles,
          period_cite_times: periodCiteTimes,
          cite_rate: citeRate,
        },
        start_date: start || null,
        end_date: end || null,
      },
    };
  }

  /** POST /article/library/cites — 单篇引用明细 */
  async articleCites() {
    const { ctx } = this;
    const b = ctx.request.body || {};
    const brand = await this._requireBrand(b.brand_id);
    if (!brand) return;
    const articleId = String(b.article_id || b.id || '').trim();
    if (!articleId) {
      ctx.status = 400;
      ctx.body = { code: 400, msg: 'article_id required' };
      return;
    }
    const start = String(b.start_date || '').slice(0, 10);
    const end = String(b.end_date || '').slice(0, 10);
    const q = { brand_id: brand.brand_id, article_id: articleId };
    if (start && end) q.date = { $gte: start, $lte: end };
    const edges = await ctx.model.CitationEdge.find(q)
      .select('platform query_id query_type date is_own mentioned_entity')
      .sort({ date: -1 })
      .limit(200)
      .lean();
    const qids = [ ...new Set(edges.map(e => e.query_id).filter(x => x != null)) ];
    // MonitorQuery 正文字段是 query（不是 query_text）
    const queries = qids.length
      ? await ctx.model.MonitorQuery.find({ query_id: { $in: qids } }).select('query_id query query_type').lean()
      : [];
    const qMap = Object.fromEntries(queries.map(x => [ x.query_id, x ]));
    const ENGINE = { doubao: '豆包', wenxin: '文心一言', deepseek: 'DeepSeek', qwen: '通义千问', yuanbao: '元宝' };
    ctx.body = {
      code: 200, msg: 'ok',
      data: {
        article_id: articleId,
        total: edges.length,
        list: edges.map(e => ({
          date: e.date,
          platform: e.platform,
          platform_label: ENGINE[e.platform] || e.platform,
          query_id: e.query_id,
          query_text: (qMap[e.query_id] && qMap[e.query_id].query) || '',
          query_type: e.query_type || (qMap[e.query_id] && qMap[e.query_id].query_type) || null,
          mentioned_entity: e.mentioned_entity || '',
        })),
      },
    };
  }
}

module.exports = PublishController;
