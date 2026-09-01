/**
 * 用户账号（users）
 *【填充时机】S0 注册时创建
 *【写入来源】POST /login（账号密码注册/登录）
 *【被谁消费】GET /user/info；所有接口鉴权 JWT.sub
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    _id: { type: String, default: () => new (require('uuid').v4)() },  // UUID 与线上 sub 形态一致
    phone: { type: String, unique: true, required: true },
    password_hash: { type: String, select: false },
    name: String,
    company: String,
    position: String,
    industry: String,
    is_superuser: { type: Boolean, default: false },
    roles: [String],
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  }, { collection: 'users', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('User', schema);
};
