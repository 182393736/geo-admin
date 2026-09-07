'use strict';
/** E2E：登录 → 无品牌判定 → 提交首次分析 → 轮询 → 展示接口（brand/summary、query/list、get_query_status） */
const BASE = 'http://127.0.0.1:7001';

async function api(method, url, body, token) {
  const resp = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: resp.status, data: await resp.json().catch(() => null) };
}

function assert(cond, msg) {
  if (!cond) { console.error('❌ ASSERT FAIL:', msg); process.exit(1); }
  console.log('  ✓', msg);
}

(async () => {
  // 1. 登录（seed 账号，dev 有 2s 延迟）
  let r = await api('POST', '/user/login', { account: '123456', password: '123456' });
  assert(r.status === 200 && r.data.accessToken, '登录成功');
  const token = r.data.accessToken;

  // 2. 无品牌态
  r = await api('GET', '/user/info', null, token);
  assert(r.data.data.first_login === 1, 'first_login=1（无品牌）');

  // 3. 提交首次分析
  r = await api('POST', '/user/brands/analyze', {
    brand_name: '宏祥示例家具', website: '', business_desc: '佛山公共座椅源头厂家，主营礼堂椅、课桌椅、影院椅。',
  }, token);
  assert(r.data.code === 200 && r.data.data.task_id, 'analyze 受理返回 task_id');
  const taskId = r.data.data.task_id;

  // 4. 轮询到 done
  let st = null;
  for (let i = 0; i < 40; i++) {
    r = await api('GET', `/user/onboarding/status?task_id=${taskId}`, null, token);
    st = r.data.data;
    if (st.done || st.stage === 'fail') break;
    await new Promise(rr => setTimeout(rr, 800));
  }
  assert(st.stage === 'done', `分析完成 stage=done（识别词${st.generated.aliases} 排名题${st.generated.industry_queries}）`);

  // 5. 展示：品牌档案聚合
  r = await api('GET', '/api/brand/summary', null, token);
  const s = r.data.data;
  assert(s && s.brand && s.brand.name === '宏祥示例家具', 'brand/summary 品牌名正确');
  assert(Array.isArray(s.aliases), 'brand/summary 含识别词');
  assert(Array.isArray(s.competitors), 'brand/summary 含竞品');
  assert(Array.isArray(s.products), 'brand/summary 含产品');
  assert(Array.isArray(s.queries.industry) && s.queries.industry.length >= 3, `brand/summary 排名题 ${s.queries.industry.length} 条`);
  console.log('    brand/summary =>', JSON.stringify({ name: s.brand.name, industry: s.brand.industry, aliases: s.aliases.length, competitors: s.competitors.length, queries: s.queries.industry.length }));

  // 6. 展示：问题列表
  r = await api('GET', '/api/query/list?query_type=industry', null, token);
  assert(r.data.code === 200 && r.data.data.list.length >= 3, `query/list industry ${r.data.data.list.length} 条`);
  r = await api('GET', '/api/query/list?query_type=brand', null, token);
  assert(r.data.code === 200, 'query/list brand 空列表正常（口碑题不落库）');

  // 7. 展示：采集状态（采集前 → pending）
  r = await api('GET', '/user/get_query_status', null, token);
  const qs = r.data.data;
  assert(qs.pending === true, `get_query_status pending=true（等待首次采集）`);
  assert(qs.enabled_queries >= 3 && qs.expected_slots === qs.enabled_queries * 5, `启用问题 ${qs.enabled_queries} · 预计槽位 ${qs.expected_slots}`);

  // 8. 鉴权边界
  r = await api('GET', '/api/brand/summary');
  assert(r.status === 401, '未带 token 访问 brand/summary 被拒(401)');

  console.log('\n🎉 E2E 通过：登录→录入→提交→AI分析→展示（brand/summary + query/list + get_query_status）链路完整');
  process.exit(0);
})().catch(e => { console.error('❌ FAILED:', e); process.exit(1); });
