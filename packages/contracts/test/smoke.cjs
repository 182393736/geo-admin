'use strict';
/** CJS 冒烟：gen-api / geo-agent / 采集程序（Node require）消费面 */
const assert = require('node:assert');
const c = require('../dist/index.cjs');

// 枚举
assert.deepStrictEqual([...c.ENGINE_KEYS], ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao']);
assert.deepStrictEqual([...c.COLLECT_PLATFORMS], ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao', 'kimi']);
assert.ok(c.COLLECT_PLATFORMS.includes('kimi') && !c.ENGINE_KEYS.includes('kimi'), '采集平台比监控引擎多 kimi');

// 常量
assert.strictEqual(c.FREE_QUERY_LIMIT, 3);
assert.strictEqual(c.FREE_PLAN_QUERY_LIMIT, 8);
assert.strictEqual(c.RANK_WEIGHTS.length, 10);
assert.strictEqual(c.PLAN_CATALOG.length, 6);
assert.strictEqual(c.RANK_ANCHORS.NOT_DETECTED, -99);

// zod schema：合法数据通过
const slot = c.CollectSlotSchema.parse({
  slot_id: 's1', task_id: 't1', brand_id: 'b1', query_id: 1,
  platform: 'kimi', date: '2026-09-08',
});
assert.strictEqual(slot.status, 'pending');
assert.strictEqual(slot.end, 'web');

// zod schema：非法枚举拒绝
assert.throws(() => c.CollectSlotSchema.parse({
  slot_id: 's2', task_id: 't1', brand_id: 'b1', query_id: 1, platform: 'not-a-platform', date: '2026-09-08',
}), /platform|Invalid enum/i);

// JWT 解码（base64url 无 padding 场景）
const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({ sub: 'u1', jti: 'j1', name: 'newbie', exp: 1789377218 })).toString('base64url');
const decoded = c.decodeJwtPayload(`${header}.${payload}.sig`);
assert.strictEqual(decoded.sub, 'u1');
assert.strictEqual(decoded.name, 'newbie');

console.log('✅ contracts CJS smoke ok');
