/**
 * 问题分组（query_groups）
 *【填充时机】监控问题管理页随时
 *【写入来源】POST /query-group/save|move_query|delete
 *【被谁消费】POST /query-group/list；矩阵接口查询条件下的 group_rows
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    group_id: { type: String, unique: true, default: () => require('uuid').v4() },
    brand_id: { type: String, index: true },
    query_type: String,
    name: String,
    sort: Number,
  }, { collection: 'query_groups', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('QueryGroup', schema);
};
