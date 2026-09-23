'use strict';

const Service = require('egg').Service;

class SiteService extends Service {
  async list({ page = 1, pageSize = 20, keyword } = {}) {
    const { ctx } = this;
    const query = {};
    if (keyword) {
      query.$or = [
        { name: new RegExp(keyword, 'i') },
        { domain: new RegExp(keyword, 'i') },
        { brandZh: new RegExp(keyword, 'i') },
        { brandEn: new RegExp(keyword, 'i') },
        { companyZh: new RegExp(keyword, 'i') },
      ];
    }

    const skip = (page - 1) * pageSize;
    const [ list, total ] = await Promise.all([
      ctx.model.Site.find(query).sort({ sort: 1, createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      ctx.model.Site.countDocuments(query),
    ]);

    return { list, total, page, pageSize };
  }

  async findById(id) {
    return this.ctx.model.Site.findById(id).lean();
  }

  async findByDomain(domain) {
    const normalized = String(domain).toLowerCase().replace(/:\d+$/, '');
    return this.ctx.model.Site.findOne({
      status: 'active',
      enabled: { $ne: false },
      $or: [{ domain: normalized }, { aliases: normalized }],
    }).lean();
  }

  /** 菜单/页面创建前校验所属域名（网站）必须存在 */
  async assertExists(siteId) {
    if (!siteId) {
      const err = new Error('必须指定所属域名（网站）');
      err.status = 400;
      throw err;
    }
    const site = await this.ctx.model.Site.findById(siteId).lean();
    if (!site) {
      const err = new Error('所属域名不存在，请先创建网站');
      err.status = 400;
      throw err;
    }
    return site;
  }

  async create(data) {
    const enabled = data.enabled !== false;
    return this.ctx.model.Site.create({
      ...data,
      domain: String(data.domain).toLowerCase(),
      aliases: (data.aliases || []).map(d => String(d).toLowerCase()),
      enabled,
      status: enabled ? 'active' : 'inactive',
      sort: data.sort ?? 0,
    });
  }

  async update(id, data) {
    const payload = { ...data };
    if (payload.domain) payload.domain = String(payload.domain).toLowerCase();
    if (payload.aliases) payload.aliases = payload.aliases.map(d => String(d).toLowerCase());
    if (payload.enabled !== undefined) {
      payload.status = payload.enabled ? 'active' : 'inactive';
    }
    return this.ctx.model.Site.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  /** 删除域名时级联清理其下菜单与页面 */
  async destroy(id) {
    const res = await this.ctx.model.Site.findByIdAndDelete(id);
    if (!res) return false;
    await Promise.all([
      this.ctx.model.Page.deleteMany({ siteId: id }),
    ]);
    return true;
  }
}

module.exports = SiteService;
