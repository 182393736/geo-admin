/**
 * 渠道收藏（media_favs）
 *【填充时机】信源库页点击收藏
 *【写入来源】收藏按钮
 *【被谁消费】publish/media/list 的 fav 参数
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    user_id: { type: String, index: true },
    media_key: String,
  }, { collection: 'media_favs', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ user_id: 1, media_key: 1 }, { unique: true });
  return app.mongoose.model('MediaFav', schema);
};
