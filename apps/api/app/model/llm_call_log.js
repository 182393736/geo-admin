/**
 * LLM调用日志（llm_call_logs）
 *【填充时机】每次 DeepSeek 调用结束即写（同步记录，不阻塞主流程）
 *【写入来源】app/service/llm/deepseek.js chatJson/chat 收口埋点
 *【被谁消费】成本看板/DeepSeek 账单核对/prompt 版本回溯审计
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    call_site: { type: String, index: true },     // LLM-01 ~ LLM-18
    brand_id: String,
    ref_id: String,                                // answer_id / report_id / job_id ...
    prompt_version: { type: String, default: 'v1' }, // 提示词版本号，数据可回溯
    model: { type: String, default: 'deepseek-chat' },
    input_hash: String,                            // 输入指纹（去重/重放检测）
    usage: { prompt_tokens: Number, completion_tokens: Number, total_tokens: Number },
    latency_ms: Number,
    success: Boolean,
    retry: { type: Number, default: 0 },
    error: String,
  }, { collection: 'llm_call_logs', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  schema.index({ call_site: 1, created_at: -1 });
  schema.index({ input_hash: 1 });
  return app.mongoose.model('LlmCallLog', schema);
};
