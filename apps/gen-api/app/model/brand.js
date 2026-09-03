/**
 * 品牌主档（brands）
 *【填充时机】S1 Onboarding 第一步创建；切换品牌读它
 *【写入来源】onboarding 表单 / POST /user/brands/analyze
 *【被谁消费】GET /user/brands、GET /user/info（左上当牌、品牌卡）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    brand_id: { type: String, unique: true, default: () => require('uuid').v4() },
    user_id: { type: String, index: true },
    name: { type: String, required: true },
    industry: String,  // 公共家具制造
    website: String,
    business_desc: String,
    platforms: { type: [String], default: ['deepseek', 'doubao', 'wenxin', 'qwen', 'yuanbao'] },
    status: { type: String, enum: ['building', 'active', 'expired', 'disabled'], default: 'building' },
    is_first_brand: { type: Boolean, default: false },
    rename_remaining: { type: Number, default: 3 },
    access_type: { type: String, default: 'own' },  // own/agency 共享
    menu_keys: [String],
  }, { collection: 'brands', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('Brand', schema);
};
