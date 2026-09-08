'use strict';
/**
 * 开发用固定端口内存 MongoDB：gen-api 与 gen-test 共享同一实例/库。
 * 用法：node scripts/dev-mongo-fixed.js [port]   （默认 42439，dbName geo_dev）
 */
const path = require('node:path');
const fs = require('node:fs');

// mongod 数据目录落到工作区磁盘（/tmp 为 tmpfs，容量太小会 fassert）
const GEO_TMP = path.join(__dirname, '..', '..', '.tmp-geo');
fs.mkdirSync(GEO_TMP, { recursive: true });
process.env.TMPDIR = GEO_TMP;

const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const port = Number(process.argv[2] || 42439);
  const mem = await MongoMemoryServer.create({
    instance: { port, ip: '127.0.0.1', dbName: 'geo_dev' },
  });
  console.log('[dev-mongo] mongod 已启动: ' + mem.getUri('geo_dev'));
  setInterval(() => {}, 1 << 30);
  const shutdown = async () => { await mem.stop().catch(() => {}); process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch(e => { console.error('[dev-mongo] 启动失败:', e); process.exit(1); });
