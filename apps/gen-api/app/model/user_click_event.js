/**
 * 功能访问埋点（user_click_events）
 *【填充时机】实时：用户每进入一个模块
 *【写入来源】POST /user/register/click { source, operation }
 *【被谁消费】内部运营分析
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    user_id: String,
    brand_id: String,
    source: { type: String, required: true },  // 页面名，如 报告/AI 口碑分析
    operation: { type: String, default: '访问' },
    ip: String,
    ua: String,
    created_at: { type: Date, default: Date.now },
  }, { collection: 'user_click_events', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ user_id: 1, created_at: -1 });
  return app.mongoose.model('UserClickEvent', schema);
};
