/**
 * LLM调用日志（llm_call_logs）
 *【填充时机】每次 LLM 调用结束即写（deepseek 统一入口 + 首登 agent usage 汇总）
 *【写入来源】app/service/llm/deepseek.js；agent_runner 落库首登各步 usage
 *【被谁消费】成本看板 / 用户·品牌 Token 汇总 / prompt 版本回溯
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    call_site: { type: String, index: true },     // LLM-01 ~ LLM-18 / ONBOARD_*
    user_id: { type: String, index: true, default: '' },
    brand_id: { type: String, index: true, default: '' },
    ref_id: { type: String, default: '' },         // answer_id / task_id / report_id ...
    prompt_version: { type: String, default: 'v1' },
    model: { type: String, default: '' },
    input_hash: String,
    usage: { prompt_tokens: Number, completion_tokens: Number, total_tokens: Number },
    latency_ms: Number,
    success: Boolean,
    retry: { type: Number, default: 0 },
    error: String,
  }, { collection: 'llm_call_logs', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  schema.index({ call_site: 1, created_at: -1 });
  schema.index({ user_id: 1, created_at: -1 });
  schema.index({ brand_id: 1, created_at: -1 });
  schema.index({ input_hash: 1 });
  return app.mongoose.model('LlmCallLog', schema);
};
