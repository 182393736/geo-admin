/**
 * 品牌资料库（docs/links/text）（brand_libraries）
 *【填充时机】S1/S7 品牌-知识库页上传
 *【写入来源】POST /api/brand/library/docs/upload 等
 *【被谁消费】GET library/docs|links|text；写作 Agent 引用资料
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, index: true },
    kind: { type: String, enum: ['doc', 'link', 'text'] },
    title: String,
    content: String,
    file_oss_key: String,
    url: String,
    meta: Schema.Types.Mixed,
  }, { collection: 'brand_libraries', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('BrandLibrary', schema);
};
