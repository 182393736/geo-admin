'use strict';

const Service = require('egg').Service;

class MenuService extends Service {
  normalizePath(path) {
    const raw = String(path || '').trim();
    if (!raw || raw === '/') return '/';
    return raw.replace(/\/+$/, '') || '/';
  }

  async listBySite(siteId) {
    const list = await this.ctx.model.Menu.find({ siteId })
      .sort({ sort: 1, createdAt: 1 })
      .lean();
    return this.buildTree(list);
  }

  async listFlatBySite(siteId, { visibleOnly = false } = {}) {
    const query = { siteId };
    if (visibleOnly) query.visible = true;
    return this.ctx.model.Menu.find(query).sort({ sort: 1, createdAt: 1 }).lean();
  }

  buildTree(list, parentId = null) {
    return list
      .filter(item => {
        const pid = item.parentId ? String(item.parentId) : null;
        return pid === parentId;
      })
      .map(item => ({
        ...item,
        children: this.buildTree(list, String(item._id)),
      }));
  }

  async findById(id) {
    return this.ctx.model.Menu.findById(id).lean();
  }

  async assertPathUnique(siteId, path, excludeId) {
    const normalized = this.normalizePath(path);
    const query = { siteId, path: normalized };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const exists = await this.ctx.model.Menu.findOne(query).lean();
    if (exists) {
      const err = new Error(`路径「${normalized}」已存在，不能重复添加`);
      err.status = 400;
      throw err;
    }
    return normalized;
  }

  async create(data) {
    await this.service.site.assertExists(data.siteId);
    const path = await this.assertPathUnique(data.siteId, data.path);
    return this.ctx.model.Menu.create({ ...data, path });
  }

  async update(id, data) {
    const current = await this.ctx.model.Menu.findById(id).lean();
    if (!current) return null;

    // 菜单始终归属创建时的域名，不允许改绑
    const payload = { ...data };
    delete payload.siteId;

    if (payload.path !== undefined) {
      payload.path = await this.assertPathUnique(current.siteId, payload.path, id);
    }
    return this.ctx.model.Menu.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  async destroy(id) {
    const res = await this.ctx.model.Menu.findByIdAndDelete(id);
    return !!res;
  }
}

module.exports = MenuService;
