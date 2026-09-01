/**
 * 站内提醒（reminders）
 *【填充时机】S6 报告生成/采集异常/套餐临期等业务事件触发
 *【写入来源】后台服务写入
 *【被谁消费】GET /user/reminders
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    user_id: { type: String, index: true },
    brand_id: String,
    type: String,  // plan_expire/collect_fail/report_ready...
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
    title: String,
    body: String,
    read: { type: Boolean, default: false },
  }, { collection: 'reminders', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('Reminder', schema);
};
