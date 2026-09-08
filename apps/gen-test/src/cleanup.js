'use strict';
/**
 * 删除任务相关数据：
 *  1) 按任务记录的 user_id / brand_id 清理 gen-api 业务库（账号、品牌、订阅、积分、监控问题等）
 *  2) 删除截图产物目录
 *  3) 删除任务记录
 * 仅清理该任务创建的数据：以执行时记录的 user_id / brand_id 为锚，绝不越界。
 */
const fs = require('node:fs');
const path = require('node:path');
const { getTask, removeTaskRecord, connect } = require('./db');

const ARTIFACTS = process.env.ARTIFACTS_DIR || path.join(__dirname, '..', 'data', 'artifacts');

// collection -> 匹配字段：_id 用 user_id 本体；user_id/uid 用 user_id；brand_id 用 brand_id
const CLEANUP_PLAN = [
  { col: 'users', field: '_id' },
  { col: 'brands', field: 'user_id' },
  { col: 'brand_profiles', field: 'brand_id' },
  { col: 'brand_aliases', field: 'brand_id' },
  { col: 'brand_products', field: 'brand_id' },
  { col: 'competitor_registers', field: 'brand_id' },
  { col: 'brand_libraries', field: 'brand_id' },
  { col: 'brand_wikis', field: 'brand_id' },
  { col: 'subscriptions', field: 'user_id' },
  { col: 'credit_accounts', field: 'user_id' },
  { col: 'credit_transactions', field: 'user_id' },
  { col: 'monitor_queries', field: 'user_id' },
  { col: 'onboarding_tasks', field: 'user_id' },
  { col: 'onboarding_traces', field: 'user_id' },
  { col: 'payment_orders', field: 'user_id' },
  { col: 'publish_orders', field: 'user_id' },
  { col: 'media_favs', field: 'user_id' },
  { col: 'user_click_events', field: 'user_id' },
  { col: 'agent_histories', field: 'uid' },
  { col: 'writing_jobs', field: 'uid' },
  { col: 'articles_generated', field: 'uid' },
  { col: 'diagnosis_tasks', field: 'user_id' },
  { col: 'mined_topics', field: 'brand_id' },
  { col: 'query_groups', field: 'brand_id' },
  { col: 'reminders', field: 'user_id' },
  { col: 'collect_slots', field: 'brand_id' },
  { col: 'collect_tasks', field: 'brand_id' },
  { col: 'raw_answers', field: 'brand_id' },
  { col: 'snapshots', field: 'brand_id' },
  { col: 'citation_edges', field: 'brand_id' },
  { col: 'brand_mentions', field: 'brand_id' },
  { col: 'opinions', field: 'brand_id' },
  { col: 'opinion_topics', field: 'brand_id' },
  { col: 'daily_metric_brands', field: 'brand_id' },
  { col: 'daily_metric_queries', field: 'brand_id' },
  { col: 'leaderboard_dailies', field: 'brand_id' },
  { col: 'source_daily_stats', field: 'brand_id' },
  { col: 'evidence_items', field: 'brand_id' },
  { col: 'llm_call_logs', field: 'brand_id' },
  { col: 'reports', field: 'brand_id' },
];

async function deleteTask(id) {
  const task = await getTask(id);
  if (!task) throw Object.assign(new Error('任务不存在'), { status: 404 });

  const c = task.cleanup || {};
  const deleted = {};

  // 1) 业务库清理（只在任务记录到 user_id 时执行）
  if (c.user_id) {
    const db = await connect();
    for (const { col, field } of CLEANUP_PLAN) {
      let val;
      if (field === '_id' || field === 'user_id' || field === 'uid') val = c.user_id;
      else if (field === 'brand_id') val = c.brand_id || null;
      else val = null;
      if (!val) continue;
      try {
        const r = await db.collection(col).deleteMany({ [field]: val });
        if (r.deletedCount > 0) deleted[col] = r.deletedCount;
      } catch { /* 集合不存在或字段缺失，忽略 */ }
    }
  }

  // 2) 删除截图产物
  try {
    fs.rmSync(path.join(ARTIFACTS, id), { recursive: true, force: true });
    deleted._artifacts = true;
  } catch { /* 忽略 */ }

  // 3) 删除任务记录
  await removeTaskRecord(id);

  return {
    deleted_task: task.id,
    account: c.account || task.account,
    user_id: c.user_id || '',
    brand_id: c.brand_id || '',
    brand_name: c.brand_name || '',
    deleted_counts: deleted,
  };
}

module.exports = { deleteTask };
