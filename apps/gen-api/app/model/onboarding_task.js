/**
 * 注册引导任务状态机（onboarding_tasks）
 *【填充时机】首登建档各阶段推进时更新
 *【写入来源】首登建档（/agent/onboarding/{stream,confirm}，geo-agent persist.js 按 taskId 更新）
 *【被谁消费】/user/login 的 first_login 等字段投影（service.onboarding.latestForUser）；后台 onboarding 任务视图
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
