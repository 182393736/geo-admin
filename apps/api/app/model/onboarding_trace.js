/**
 * 首次分析过程留痕（onboarding_traces）
 *【填充时机】S1 onboarding 异步分析全流程每个动作追加一条
 *【写入来源】onboarding agent：联网检索 / 读网页 / 热度验证 / LLM 生成 / 用户勾选确认
 *【被谁消费】审计回放（"AI 为什么这么定位我的品牌"）、提示词调优、badcase 归因
 * 设计动机：对标站在首登过程产生但不出现在任何终态表里的中间产物——
 *   检索词组合（竞品们+行业词 / 公司主体+别名 / 品牌+产品线）、
 *   实际读过的 url 列表、母词去重后的真实搜索热度分（weight 的来源证据）。
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    task_id: { type: String, index: true },   // 关联 onboarding_tasks
    brand_id: { type: String, index: true },
    user_id: String,
    kind: {
      type: String,
      enum: ['search_query', 'page_read', 'keyword_weight', 'llm_output', 'user_confirm'],
      required: true,
    },
    // kind=search_query：发出的检索词组合
    query: String,
    // kind=page_read：抓取/阅读过的网页
    url: String,
    snapshot: String,         // 页面正文截断快照（提示词调优时回看证据）
    // kind=keyword_weight：母词（去重后）及其真实搜索热度
    keyword: String,
    weight: Number,           // 热度分（10/9/8…），monitor_queries.weight 的来源证据
    meta: Schema.Types.Mixed, // 其余原始产物（llm 原文、勾选清单等）
  }, { collection: 'onboarding_traces', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: false } });
  schema.index({ task_id: 1, kind: 1, created_at: 1 });
  return app.mongoose.model('OnboardingTrace', schema);
};
