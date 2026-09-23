'use strict';
/**
 * MongoDB 连接与任务 CRUD
 * 复用 geo-api 的 MongoDB（TEST_MONGO_URL / MONGO_URL，须与 geo-api 进程一致）。
 * 注意：本机常见是 mongodb://127.0.0.1:6007/geo_dev（隧道），不是 27017/geo。
 * 任务集合 gen_test_tasks 与业务集合同库，便于「删除任务相关数据」时一并清理。
 */
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('node:crypto');

const MONGO_URL = process.env.TEST_MONGO_URL || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/geo';
const TASKS_COLLECTION = 'gen_test_tasks';

let client = null;
let db = null;

async function connect() {
  if (db) return db;
  client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  db = client.db();
  await db.collection(TASKS_COLLECTION).createIndex({ created_at: -1 });
  return db;
}

async function tasks() {
  await connect();
  return db.collection(TASKS_COLLECTION);
}

function toApi(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

async function createTask({ account, password, brandInput, brandInput2 = '', screenshot = true, headed = false, slotDays = 1 }) {
  const col = await tasks();
  const now = new Date();
  const doc = {
    account: String(account || '').trim(),
    password: String(password || ''),
    brand_input: String(brandInput || '').trim(),
    brand_input_2: String(brandInput2 || '').trim(), // 可选：填了则首登后走「添加新品牌」再建第二品牌
    screenshot: !!screenshot,
    headed: !!headed,   // 有头模式：弹出真实浏览器窗口（本地有图形界面时观察交互过程）
    slot_days: [1, 2, 3].includes(Number(slotDays)) ? Number(slotDays) : 1, // 采集槽位日期范围：1=今天 / 2=最近2天 / 3=最近3天
    status: 'pending', // pending | running | passed | failed
    result: null,      // { pass: boolean, summary: string }
    steps: [],         // [{ seq, name, status, detail, screenshot, ts }]
    cleanup: null,     // { account, user_id, brand_id, brand_name, cleaned, cleaned_at, deleted_counts }
    created_at: now,
    started_at: null,
    finished_at: null,
  };
  const { insertedId } = await col.insertOne(doc);
  return toApi(await col.findOne({ _id: insertedId }));
}

/**
 * 确保测试账号可用（与 geo-api 同库）：
 *  - 不存在 → 插入 users（bcrypt），返回 { created:true }
 *  - 已存在 → 同步 password_hash / status，保证任务密码能登录（测试工具预期行为）
 */
async function ensureTestUser(account, password) {
  const db = await connect();
  const users = db.collection('users');
  const existing = await users.findOne({ account });
  const now = new Date();
  const password_hash = bcrypt.hashSync(password, 10);
  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      { $set: { password_hash, status: 'active', updated_at: now } },
    );
    return { created: false, account };
  }
  await users.insertOne({
    _id: randomUUID(),
    account,
    name: account,
    password_hash,
    is_superuser: false,
    status: 'active',
    created_at: now,
    updated_at: now,
  });
  return { created: true, account };
}

async function listTasks() {
  const col = await tasks();
  const docs = await col.find().sort({ created_at: -1 }).toArray();
  return docs.map(toApi);
}

async function getTask(id) {
  const col = await tasks();
  return toApi(await col.findOne({ _id: new ObjectId(id) }));
}

async function updateTask(id, patch) {
  const col = await tasks();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: patch });
  return getTask(id);
}

async function appendStep(id, step) {
  const col = await tasks();
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $push: { steps: { seq: step.seq, name: step.name, status: step.status, detail: step.detail, screenshot: step.screenshot, ts: step.ts } } },
  );
}

async function removeTaskRecord(id) {
  const col = await tasks();
  await col.deleteOne({ _id: new ObjectId(id) });
}

async function close() {
  if (client) { await client.close().catch(() => {}); client = null; db = null; }
}

module.exports = { connect, close, createTask, ensureTestUser, listTasks, getTask, updateTask, appendStep, removeTaskRecord, MONGO_URL };
