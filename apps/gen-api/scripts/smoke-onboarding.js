'use strict';
/**
 * 一体化冒烟：内存 MongoDB + 程序化启动 Egg + 走完整 onboarding 链路
 *   登录 → /user/info(first_login=1) → /user/brands([]) → analyze → 轮询 status 到 done
 *   → /user/info(first_login=2) → 再登录 brands 有值
 * 用法：node scripts/smoke-onboarding.js
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const assert = require('assert');
const path = require('path');

const PORT = 17901;
const BASE = `http://127.0.0.1:${PORT}`;

async function api(method, url, body, token) {
  const resp = await fetch(BASE + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: resp.status, data: await resp.json().catch(() => null) };
}

(async () => {
  const mms = await MongoMemoryServer.create();
  process.env.MONGO_URL = mms.getUri('geo_smoke');
  process.env.JWT_SECRET = 'smoke-secret';
  delete process.env.DEEPSEEK_API_KEY; // 走确定性降级解析路径

  const { Application } = require('egg');
  const app = new Application({ baseDir: path.resolve(__dirname, '..'), framework: 'egg' });
  await app.ready();
  await new Promise(r => setTimeout(r, 1500)); // 等 beforeStart 种子账号
  const server = app.listen(PORT);
  await new Promise(r => server.once('listening', r));
  console.log('✓ app ready on', PORT);

  try {
    // 1. 登录（种子账号 123456/123456）
    let r = await api('POST', '/user/login', { account: '123456', password: '123456' });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    const token = r.data.accessToken;
    assert.ok(token, 'login token');
    console.log('✓ 登录成功，brands =', r.data.brands.length);

    // 2. 无品牌态
    r = await api('GET', '/user/info', null, token);
    assert.equal(r.data.data.first_login, 1, 'first_login 应为 1（无品牌）');
    assert.equal(r.data.data.brand_id, '', 'brand_id 应为空');
    console.log('✓ /user/info: first_login=1, brand_id 为空');

    r = await api('GET', '/user/brands', null, token);
    assert.equal(r.data.data.length, 0, '品牌列表应为空');
    console.log('✓ /user/brands: [] → 前端此时应跳 /trial');

    // 3. 提交首次分析
    r = await api('POST', '/user/brands/analyze', {
      brand_name: '宏祥示例家具',
      website: 'www.example.com',
      business_desc: '佛山公共座椅源头厂家，主营礼堂椅、课桌椅、影院椅。',
    }, token);
    assert.equal(r.data.code, 200, JSON.stringify(r.data));
    const { task_id, brand_id } = r.data.data;
    console.log('✓ analyze 受理 task_id =', task_id.slice(0, 8));

    // 4. 轮询状态直到 done（无 LLM key → 降级路径，秒级完成）
    let st = null;
    for (let i = 0; i < 30; i++) {
      r = await api('GET', `/user/onboarding/status?task_id=${task_id}`, null, token);
      st = r.data.data;
      if (st.done || st.stage === 'fail') break;
      await new Promise(rr => setTimeout(rr, 1000));
    }
    assert.equal(st.stage, 'done', '最终 stage=' + st.stage + ' error=' + st.error);
    console.log(`✓ 分析完成：识别词 ${st.generated.aliases} · 排名问题 ${st.generated.industry_queries} · 口碑问题 ${st.generated.brand_queries}`);
    assert.ok(st.generated.industry_queries >= 3, '应生成 >=3 条排名问题');

    // 5. 分析后：first_login 翻转 + 品牌激活
    r = await api('GET', '/user/info', null, token);
    assert.equal(r.data.data.first_login, 2, 'first_login 应翻转为 2');
    assert.equal(r.data.data.brand_id, brand_id, 'brand_id 应回写');
    console.log('✓ /user/info: first_login=2, brand_id 已写入')

    r = await api('GET', '/user/brands', null, token);
    assert.equal(r.data.data.length, 1);
    assert.equal(r.data.data[0].status, 'active');
    console.log('✓ /user/brands: 1 个品牌 status=active / is_first_brand =', r.data.data[0].is_first_brand);

    // 6. 重复提交应复用/幂等（已有品牌后再提交：允许建新任务但品牌生效走正常流程，这里只验证接口不崩）
    r = await api('POST', '/user/brands/analyze', { brand_name: '第二个品牌B' }, token);
    assert.equal(r.data.code, 200, '重复提交不应报错');
    console.log('✓ 重复提交 analyze：', r.data.data.reused ? '复用了进行中的任务' : '新建了任务');

    // 7. 鉴权边界
    r = await api('GET', '/user/onboarding/status?task_id=' + task_id);
    assert.equal(r.status, 401, '未带 token 应 401');
    console.log('✓ 未授权访问被拒绝(401)');

    console.log('\n🎉 全部通过：登录→无品牌判定→/trial 提交→分析→品牌就绪 链路完整可用');
  } finally {
    server.close();
    await app.close();
    await mms.stop();
  }
  process.exit(0);
})().catch(e => { console.error('❌ SMOKE FAILED:', e.message); process.exit(1); });
