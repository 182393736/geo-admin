/**
 * 动态菜单配置（menu_configs）
 *【填充时机】运维配置（初始化脚本灌入 34 条）
 *【写入来源】后台管理
 *【被谁消费】GET /user/menus（按套餐过滤后下发）
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    menu_code: { type: String, unique: true },
    category: String,  // 品牌/概览/排名/口碑/优化/AGENT/诊断/套餐/账号
    label: String,
    path: String,  // /dashboard/ai-index
    icon: String,
    sort_order: Number,
    visible: { type: Boolean, default: true },
    min_plan: { type: String, default: 'starter' },  // 套餐等级门控
  }, { collection: 'menu_configs', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('MenuConfig', schema);
};
