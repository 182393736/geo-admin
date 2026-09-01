/**
 * 报告模板（report_templates）
 *【填充时机】运维配置
 *【写入来源】管理后台
 *【被谁消费】report/latest.template；报告模板弹层
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    name: String,  // 标准版
    modules: [{ key: String, sort: Number, enabled: Boolean }],  // monitor/metrics/compete/sources/channels/publish
  }, { collection: 'report_templates', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('ReportTemplate', schema);
};
