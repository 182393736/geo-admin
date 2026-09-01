/**
 * 监控问题（核心配置）（monitor_queries）
 *【填充时机】S1 onboarding 生成首批（task_id 溯源）；话题挖掘/手工持续补充
 *【写入来源】onboarding 任务、POST /query/add、/query/batch_generalize、/topic-discovery
 *【被谁消费】GET /query/list；采集槽位生成唯一依据
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    query_id: { type: Number, unique: true },  // 自增序列（计数器集合维护），对齐线上 37935/40150
    user_id: { type: String, index: true },
    brand_id: { type: String, index: true },
    query: { type: String, required: true },  // platform_query 实际发问形态
    question_list: [{ user_friendly: String, platform_query: String }],
    query_type: { type: String, enum: ['industry', 'brand'], index: true },  // 排名题/口碑题
    is_golden: { type: Boolean, default: false },
    golden_query_ranking: Number,
    weight: { type: Number, default: 1 },
    query_status: { type: Boolean, default: true },  // 启用开关
    query_is_execute: { type: Boolean, default: true },  // 是否参与次日采集
    effective_to: Date,  // 生效截止
    query_order: { type: Number, default: 0 },  // /query/sort
    group_id: String,  // query_groups
    task_id: String,  // 溯源：来自哪个挖掘/生成任务
  }, { collection: 'monitor_queries', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  schema.index({ brand_id: 1, query_type: 1, query_status: 1 });
  return app.mongoose.model('MonitorQuery', schema);
};
