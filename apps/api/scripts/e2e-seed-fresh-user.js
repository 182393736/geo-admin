'use strict';
/** E2E 辅助：加一个没有任何品牌的新用户 account=newbie password=123456（幂等） */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
(async () => {
  const url = process.env.MONGO_URL;
  await mongoose.connect(url.replace(/\/geo$/, '/geo'));
  const db = mongoose.connection.db;
  await db.collection('users').updateOne(
    { account: 'newbie' },
    { $setOnInsert: { _id: uuid(), account: 'newbie', name: '新用户', phone: '13800001234',
        password_hash: bcrypt.hashSync('123456', 10), is_superuser: false,
        created_at: new Date(), updated_at: new Date() } },
    { upsert: true });
  console.log('fresh user ready: newbie/123456（无品牌）');
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
