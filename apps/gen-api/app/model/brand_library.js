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
    // 以下为实测契约 GET /api/brand/library/text 显式字段（此前混在 meta 里，对齐线上后显式化）
    slug: { type: String, index: true },  // 如 "品牌口碑与市场处境-品牌挖掘"
    tags: [String],                        // 如 ["品牌挖掘","口碑"]
    source: String,                        // 如 "品牌挖掘"（AI 情报文）/ "用户上传"
    word_count: Number,                    // 正文字数（线上 438）
    meta: Schema.Types.Mixed,              // 其余杂项（_file_size/_file_mtime 等）
  }, { collection: 'brand_libraries', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('BrandLibrary', schema);
};
