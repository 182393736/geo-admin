/**
 * 采集截图存证（snapshots）
 *【填充时机】S3 与 raw_answers 同步落库
 *【写入来源】采集 worker 上传 OSS 后写记录
 *【被谁消费】POST /snapshot/export/list（搜索快照下载页）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    snapshot_id: { type: String, unique: true },
    slot_id: { type: String, index: true },
    brand_id: String,
    query_id: Number,
    platform: String,
    exec_date: String,
    photo_url: String,  // OSS 公网（建议上线时改签名URL）
    oss_key: String,
    size: Number,
  }, { collection: 'snapshots', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, exec_date: 1, query_id: 1 });
  return app.mongoose.model('Snapshot', schema);
};
