/**
 * 写作Agent工作会话（writing_jobs）
 *【填充时机】S7 用户发起循证写作
 *【写入来源】POST /api/article/start；WebSocket /ws/article 逐节点推进
 *【被谁消费】AGENT 工作台会话流；agent-history
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    job_id: { type: String, unique: true },
    uid: { type: String, index: true },  // user_id（api/articles 的 uid 参数）
    brand_id: String,
    topic: String,  // 选题（可来自 propose-topics）
    query_id: Number,
    evidence_ids: [String],  // 挂载循证
    kb_refs: [String],  // 品牌知识库 wiki 节点
    status: { type: String, enum: ['starting', 'running', 'awaiting_user', 'completed', 'failed', 'cancelled'], default: 'starting', index: true },
    current_node: String,  // 选题→大纲→正文→护栏 检查点
    guardrail_report: Schema.Types.Mixed,  // 禁用词扫描/事实核验/结构检查
    outline: Schema.Types.Mixed,
    messages: [Schema.Types.Mixed],  // 对话流
  }, { collection: 'writing_jobs', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('WritingJob', schema);
};
