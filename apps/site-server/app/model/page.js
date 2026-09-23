'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ModuleSchema = { type: Schema.Types.Mixed, default: undefined };

  // 页面即菜单节点：同一份数据既用于导航，也用于 SSR pageData
  const PageSchema = new Schema(
    {
      siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
      path: { type: String, required: true },
      title: { type: String, required: true },
      parentId: { type: Schema.Types.ObjectId, ref: 'Page', default: null },
      sort: { type: Number, default: 0 },
      visible: { type: Boolean, default: true },
      template: { type: String, default: 'default' },
      pageKind: {
        type: String,
        enum: [
          'default',
          'home',
          'hub',
          'learn',
          'report',
          'glossary',
          'insight',
          'solution',
          'product',
          'compare',
          'pricing',
          'contact',
        ],
        default: 'default',
        index: true,
      },
      seo: {
        title: String,
        description: String,
        keywords: String,
        ogImage: String,
        canonical: String,
      },
      /** 网页级 Schema.org */
      schema: ModuleSchema,
      /** 旗舰页按滚动顺序平铺的模块 */
      hero: ModuleSchema,
      workflow: ModuleSchema,
      effects: ModuleSchema,
      watch: ModuleSchema,
      write: ModuleSchema,
      cite: ModuleSchema,
      channel: ModuleSchema,
      diagnosis: ModuleSchema,
      rails: ModuleSchema,
      invite: ModuleSchema,
      posts: ModuleSchema,
      faq: ModuleSchema,
      status: { type: String, enum: [ 'draft', 'published' ], default: 'draft' },
      // 以下为旧字段，兼容未迁移页面；旗舰种子不再写入
      hubContent: { type: Schema.Types.Mixed, default: null },
      tabVisible: { type: Schema.Types.Mixed, default: undefined },
      header: { type: Schema.Types.Mixed, default: undefined },
      start: { type: Schema.Types.Mixed, default: undefined },
      blocks: { type: Schema.Types.Mixed, default: undefined },
      qa: { type: Schema.Types.Mixed, default: undefined },
      howto: { type: Schema.Types.Mixed, default: undefined },
      steps: { type: Schema.Types.Mixed, default: undefined },
    },
    { timestamps: true }
  );

  PageSchema.index({ siteId: 1, path: 1 }, { unique: true });
  PageSchema.index({ siteId: 1, pageKind: 1, status: 1 });

  return mongoose.model('Page', PageSchema);
};
