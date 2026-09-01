/**
 * 注册引导任务状态机（onboarding_tasks）
 *【填充时机】S1 填写品牌信息时创建，随各阶段推进更新
 *【写入来源】POST analyze 异步任务；前端轮询 /user/info
 *【被谁消费】Onboarding 页进度；/user/info 的 crawler_started_at 等字段实际由此映射
 */
'use strict';

module.exports = app => {
  const { Schema } = app.mongoose;
  const schema = new Schema({
    task_id: { type: String, unique: true, default: () => require('uuid').v4() },
    user_id: { type: String, index: true },
    brand_id: String,
    input: { brand_name: String, website: String, business_desc: String, name: String, position: String },
    stage: { type: String, enum: ['crawl', 'keyword', 'query', 'overview', 'done', 'fail'], default: 'crawl' },
    crawler_started_at: Date,
    crawler_completed_at: Date,
    keyword_gen_started_at: Date,
    keyword_gen_completed_at: Date,
    keywords: [String],
    generated_question_list: [Schema.Types.Mixed],
    error: String,
  }, { collection: 'onboarding_tasks', versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

  return app.mongoose.model('OnboardingTask', schema);
};
