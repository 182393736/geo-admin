'use strict';
/**
 * MongoDB 连接与任务 CRUD
 * 复用 gen-api 的 MongoDB（TEST_MONGO_URL，默认同 dev 库 geo_dev）。
 * 任务集合 gen_test_tasks 与业务集合同库，便于「删除任务相关数据」时一并清理。
 */
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = process.env.TEST_MONGO_URL || 'mongodb://127.0.0.1:27017/geo_dev';
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

async function createTask({ account, password, brandInput, screenshot = true }) {
  const col = await tasks();
  const now = new Date();
  const doc = {
    account: String(account || '').trim(),
    password: String(password || ''),
    brand_input: String(brandInput || '').trim(),
    screenshot: !!screenshot,
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

module.exports = { connect, close, createTask, listTasks, getTask, updateTask, appendStep, removeTaskRecord, MONGO_URL };
