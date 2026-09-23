'use strict';

const Service = require('egg').Service;

const LEGACY_KEYS = [
  'hubContent', 'header', 'start', 'tabVisible', 'blocks', 'qa', 'howto', 'steps',
];

class PageService extends Service {
  normalizePath(path) {
    const raw = String(path || '').trim();
    if (!raw || raw === '/') return '/';
    return raw.replace(/\/+$/, '') || '/';
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

  async listTree(siteId) {
    const list = await this.ctx.model.Page.find({ siteId })
      .sort({ sort: 1, createdAt: 1 })
      .lean();
    return this.buildTree(list);
  }

  async listFlat(siteId, { publishedOnly = false, visibleOnly = false, pageKind } = {}) {
    const query = { siteId };
    if (publishedOnly) query.status = 'published';
    if (visibleOnly) query.visible = true;
    if (pageKind) query.pageKind = pageKind;
    return this.ctx.model.Page.find(query).sort({ sort: 1, createdAt: 1 }).lean();
  }

  async listByKind(siteId, pageKind, { publishedOnly = true } = {}) {
    if (!pageKind || pageKind === 'default') {
      return this.listFlat(siteId, { publishedOnly });
    }
    return this.listFlat(siteId, { publishedOnly, pageKind });
  }

  async listNavTree(siteId) {
    const list = await this.listFlat(siteId, { publishedOnly: true, visibleOnly: true });
    return this.buildTree(list).map(item => this.toMenuItem(item));
  }

  toMenuItem(page) {
    return {
      _id: page._id,
      siteId: page.siteId,
      title: page.title,
      path: page.path,
      parentId: page.parentId || null,
      sort: page.sort,
      visible: page.visible,
      children: (page.children || []).map(child => this.toMenuItem(child)),
    };
  }

  async findById(id) {
    return this.ctx.model.Page.findById(id).lean();
  }

  async findBySiteAndPath(siteId, path) {
    const normalized = this.normalizePath(path);
    return this.ctx.model.Page.findOne({
      siteId,
      path: normalized,
      status: 'published',
    }).lean();
  }

  async assertPathUnique(siteId, path, excludeId) {
    const normalized = this.normalizePath(path);
    const query = { siteId, path: normalized };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const exists = await this.ctx.model.Page.findOne(query).lean();
    if (exists) {
      const err = new Error(`路径「${normalized}」已存在，不能重复添加`);
      err.status = 400;
      throw err;
    }
    return normalized;
  }

  isFlatFlagship(data) {
    return !!(data && data.hero && typeof data.hero === 'object');
  }

  async create(data) {
    await this.service.site.assertExists(data.siteId);
    const path = await this.assertPathUnique(data.siteId, data.path || '/');
    const payload = {
      ...data,
      path,
      parentId: data.parentId || null,
      sort: data.sort ?? 0,
      visible: data.visible !== false,
      pageKind: data.pageKind || 'default',
    };
    if (this.isFlatFlagship(payload)) {
      for (const key of LEGACY_KEYS) delete payload[key];
    }
    return this.ctx.model.Page.create(payload);
  }

  async update(id, data) {
    const current = await this.ctx.model.Page.findById(id).lean();
    if (!current) return null;

    const payload = { ...data };
    delete payload.siteId;
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;

    if (payload.path !== undefined) {
      payload.path = await this.assertPathUnique(current.siteId, payload.path, id);
    }

    if (this.isFlatFlagship(payload) || this.isFlatFlagship(current)) {
      const unset = {};
      for (const key of LEGACY_KEYS) {
        delete payload[key];
        unset[key] = '';
      }
      return this.ctx.model.Page.findByIdAndUpdate(
        id,
        { $set: payload, $unset: unset },
        { new: true }
      ).lean();
    }

    return this.ctx.model.Page.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  async destroy(id) {
    const children = await this.ctx.model.Page.countDocuments({ parentId: id });
    if (children > 0) {
      const err = new Error('请先删除子页面/子菜单');
      err.status = 400;
      throw err;
    }
    const res = await this.ctx.model.Page.findByIdAndDelete(id);
    return !!res;
  }

  async copy(id, { path, title, status = 'draft', visible = false } = {}) {
    const src = await this.findById(id);
    if (!src) return null;

    let nextPath = path;
    if (!nextPath) {
      const base = this.normalizePath(src.path);
      nextPath = base === '/' ? '/home-copy' : `${base}-copy`;
    }
    nextPath = await this.assertPathUnique(src.siteId, nextPath);

    const payload = JSON.parse(JSON.stringify(src));
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;
    payload.path = nextPath;
    payload.title = title || `${src.title}（副本）`;
    payload.sort = (src.sort || 0) + 1;
    payload.visible = visible === true;
    payload.status = status === 'published' ? 'published' : 'draft';

    if (this.isFlatFlagship(payload)) {
      for (const key of LEGACY_KEYS) delete payload[key];
    }

    return this.create(payload);
  }
}

module.exports = PageService;
