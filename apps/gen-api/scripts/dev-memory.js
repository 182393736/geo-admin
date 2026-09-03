'use strict';
/**
 * 本地一键开发：自动拉起内存 MongoDB 再以 dev 模式启动 Egg API
 * 用法：pnpm --filter @geo-admin/gen-api run dev:memory
 * 需要真实 LLM 时：SILICONFLOW_API_KEY=sk-xxx pnpm run dev:memory
 */
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// mongod 数据目录落到工作区磁盘（/tmp 为 tmpfs，容量太小会 fassert）
const GEO_TMP = path.join(__dirname, '../../..', '.tmp-geo');
fs.mkdirSync(GEO_TMP, { recursive: true });
process.env.TMPDIR = GEO_TMP;

const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mem = await MongoMemoryServer.create();
  const url = mem.getUri('geo_dev');
  console.log(`[dev-memory] mongod 内存库已启动: ${url}`);
  const child = spawn('npx', ['egg-bin', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, MONGO_URL: url },
    cwd: __dirname + '/..',
  });
  const shutdown = async () => {
    child.kill('SIGTERM');
    await mem.stop().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  child.on('exit', code => process.exit(code ?? 0));
})().catch(e => { console.error('[dev-memory] 启动失败:', e); process.exit(1); });
