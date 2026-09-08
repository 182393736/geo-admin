/** ESM 冒烟：Vite / Nuxt 前端消费面 */
import assert from 'node:assert';
import {
  ENGINE_KEYS, COLLECT_PLATFORMS, PLAN_CATALOG, RANK_WEIGHTS,
  CollectSlotSchema, MonitorQuerySchema, decodeJwtPayload,
} from '../dist/index.mjs';

assert.strictEqual(ENGINE_KEYS.length, 5);
assert.strictEqual(COLLECT_PLATFORMS.length, 6);
assert.strictEqual(PLAN_CATALOG.length, 6);
assert.strictEqual(RANK_WEIGHTS[0], 40);

const q = MonitorQuerySchema.parse({
  query_id: 1, query: '华南公共座椅源头工厂厂家推荐', query_type: 'industry',
});
assert.strictEqual(q.query_type, 'industry');

const decoded = decodeJwtPayload(
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1MSIsImp0aSI6ImoxIiwibmFtZSI6Im5ld2JpZSJ9.sig',
);
assert.strictEqual(decoded.name, 'newbie');

console.log('✅ contracts ESM smoke ok');
