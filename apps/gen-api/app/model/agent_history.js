/**
 * AGENT对话历史（agent_histories）
 *【填充时机】S7 new-agent 会话持续写入
 *【写入来源】AGENT 页对话/任务节点
 *【被谁消费】agent-history 页
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    session_id: { type: String, index: true },
    uid: String,
    brand_id: String,
    kind: { type: String, enum: ['chat', 'mining', 'writing', 'intel'] },
    payload: Schema.Types.Mixed,
  }, { collection: 'agent_histories', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('AgentHistory', schema);
};
