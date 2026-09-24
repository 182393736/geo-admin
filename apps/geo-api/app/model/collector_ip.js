/**
 * 采集节点 IP 台账（collector_ips）
 *【填充时机】采集端 submit 旁路 upsert（无则建）
 *【唯一键】machine_name + ip
 *【被谁消费】管理总后台「采集 IP」只读列表
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    machine_name: { type: String, required: true },
    ip: { type: String, required: true },
    port: Number,
    ok_count: { type: Number, default: 0 },
    fail_count: { type: Number, default: 0 },
    empty_count: { type: Number, default: 0 },
    total_count: { type: Number, default: 0 },
    // { doubao: { ok, fail, empty, total }, ... }
    by_platform: { type: Schema.Types.Mixed, default: {} },
    // { 'YYYY-MM-DD': { ok, fail, empty, total, by_platform: { ... } } } 仅保留近 3 天
    by_day: { type: Schema.Types.Mixed, default: {} },
    last_seen_at: Date,
    last_ok_at: Date,
    last_fail_at: Date,
    last_empty_at: Date,
  }, { collection: 'collector_ips', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  schema.index({ machine_name: 1, ip: 1 }, { unique: true });
  schema.index({ last_seen_at: -1 });

  return app.mongoose.model('CollectorIp', schema);
};
