'use strict';
/** 开发用内存 MongoDB：打印 MONGO_URL 后常驻。用法：node scripts/dev-mongo.js */
const { MongoMemoryServer } = require('mongodb-memory-server');
(async () => {
  const mms = await MongoMemoryServer.create({ instance: { dbName: 'geo' } });
  console.log('MONGO_URL=' + mms.getUri('geo'));
  setInterval(() => {}, 1 << 30);
  process.on('SIGTERM', async () => { await mms.stop(); process.exit(0); });
})().catch(e => { console.error(e); process.exit(1); });
