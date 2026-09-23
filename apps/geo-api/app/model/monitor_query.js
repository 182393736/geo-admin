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
    // 实测契约：引擎→{rank,score} 的映射对象，非数字。
    // rank 三态锚点：-99=未检测 / -2=检测未提及 / -1=综合权重位（all）；score 为归一分
    golden_query_ranking: { type: Schema.Types.Mixed, default: null },
    weight: { type: Number, default: 1 },  // 实测契约：AI 按母词真实搜索热度打分，10/9/8… 递减截断
    // 实测契约（/user/info.key_words）：各引擎实际发问口径，默认同 query；平台差异化改写时覆盖
    platform_prompt: String,
    // 实测契约：AI 生成的"热度·场景"分类标签，如 "高热度 · 工具选择"/"核心场景 · 科研绘图"
    query_description: String,
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
