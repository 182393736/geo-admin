'use strict';
/**
 * 执行步骤：Playwright 逐步执行
 * 「登录 dash-v2 → /trial 首登建档 →（可选）添加第二品牌 → 后台采集前数据展示验证」
 * 用户官网（site-manage :5003）仅作依赖探活；首登已迁入 dash-v2 /trial。
 */

const ANALYSIS_TIMEOUT = 480_000;

function urlOf(page) { return page.url(); }

function extractBrandName(input) {
  const t = String(input || '').trim();
  const q = t.match(/[「『"]([^」』"]{1,30})[」』"]/);
  const n = t.match(/品牌(?:叫|是|为)[:： ]?([^，。,\s]{1,30})/);
  const name = (q?.[1] || n?.[1] || '').trim();
  if (name) return name.slice(0, 30);
  const toks = t.split(/[\s，。,.；;：:（）()]+/).filter(Boolean);
  for (const tok of toks) {
    if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(tok)) continue;
    if (
      /^[a-z0-9-]{2,30}$/i.test(tok)
      || /^[一-龥]{2,20}$/.test(tok)
      || /^(?=.*[一-龥])(?=.*[a-z0-9])[一-龥a-z0-9-]{2,30}$/i.test(tok)
    ) return tok;
  }
  if (/^[一-龥a-z0-9][一-龥a-z0-9-]{1,29}$/i.test(t) && !/\./.test(t)) return t.slice(0, 30);
  return '你的品牌';
}

function hasSecondBrand(ctx) {
  return !!String(ctx.task.brand_input_2 || '').trim();
}

/** 填写品牌描述并提交（dash-v2 /trial） */
async function submitTrialBrand(page, brandInput) {
  let text = String(brandInput || '').trim();
  if (!text) throw new Error('品牌输入为空');
  if (!/[「『"']/.test(text) && !/品牌(?:叫|是|为)/.test(text) && text.length <= 40 && !/\s/.test(text)) {
    text = `我的品牌叫「${text}」`;
  }
  await page.waitForSelector('[data-testid="trial-input"]', { timeout: 30_000 });
  const ta = page.locator('[data-testid="trial-input"]');
  await ta.click();
  await ta.fill('');
  await ta.fill(text);
  await page.waitForFunction(() => {
    const btn = document.querySelector('[data-testid="trial-send"]');
    return !!btn && !btn.disabled;
  }, null, { timeout: 5_000 });
  await page.click('[data-testid="trial-send"]');

  const outcome = await page.waitForFunction(() => {
    const hint = document.body.innerText || '';
    if (/没认出来品牌名|请描述你的品牌/.test(hint) && document.querySelector('[data-testid="trial-input"]')) {
      // 仍在落地且有提示
      if (/没认出来品牌名/.test(hint)) return 'bad_name';
    }
    if (!document.querySelector('[data-testid="trial-input"]')) return 'ok';
    if (document.querySelector('[data-testid="trial-confirm-panel"]')) return 'ok';
    return null;
  }, null, { timeout: 15_000, polling: 300 });
  const v = await outcome.jsonValue();
  if (v === 'bad_name') throw new Error('未识别品牌名：请用「品牌名」写法或补充官网链接');
  if (v !== 'ok') throw new Error(`提交后页面状态异常：${v}`);
}

async function waitTrialConfirmPanel(page) {
  const result = await page.waitForFunction(() => {
    if (document.querySelector('[data-testid="trial-confirm-panel"]')) return 'panel';
    const body = document.body.innerText || '';
    const m = body.match(/分析(?:失败|中断)[：:]\s*(.{0,160})/);
    return m ? 'err:' + m[0].replace(/\s+/g, ' ') : null;
  }, null, { timeout: ANALYSIS_TIMEOUT, polling: 1500 });
  const v = await result.jsonValue();
  if (v === 'panel') return '候选确认面板已出';
  if (typeof v === 'string' && v.startsWith('err:')) {
    throw new Error('分析未完成：' + v.slice(4).slice(0, 200));
  }
  throw new Error('分析未在预期时间内完成');
}

async function confirmTrialQueries(page) {
  await page.waitForSelector('[data-testid="trial-confirm"]:not([disabled])', { timeout: 15_000 });
  await page.click('[data-testid="trial-confirm"]');
}

/**
 * 确认前：对每个「已勾选」的监控问题点修改 → 改文案 → 保存。
 * 改法保持行业中立（不插入品牌词），避免触发服务端品牌中立闸门误伤。
 */
async function editSelectedQueriesBeforeConfirm(page) {
  await page.waitForSelector('[data-testid="trial-confirm-panel"]', { timeout: 15_000 });
  const rows = page.locator('[data-testid="trial-confirm-panel"] section .rounded-lg.border');
  await rows.first().waitFor({ state: 'visible', timeout: 10_000 });
  const n = await rows.count();
  const edited = [];
  for (let i = 0; i < n; i++) {
    const row = rows.nth(i);
    const cls = (await row.getAttribute('class')) || '';
    // 已选：border-primary
    if (!/\bborder-primary\b/.test(cls)) continue;
    await row.locator('button:has-text("修改")').click();
    const input = row.locator('input');
    await input.waitFor({ state: 'visible', timeout: 5_000 });
    const oldVal = (await input.inputValue()).trim();
    let next = oldVal.replace(/\s+/g, ' ');
    if (!/选型/.test(next)) next = `${next}选型`;
    else if (!/对比/.test(next)) next = `${next}对比`;
    else next = `${next}指南`;
    next = next.slice(0, 80);
    await input.fill(next);
    await row.locator('button:has-text("保存")').click();
    await page.waitForFunction(
      (idx) => {
        const list = document.querySelectorAll('[data-testid="trial-confirm-panel"] section .rounded-lg.border');
        const el = list[idx];
        if (!el) return false;
        return !el.querySelector('input') && /已修改/.test(el.innerText || '');
      },
      i,
      { timeout: 8_000 },
    ).catch(() => null);
    edited.push({ index: i, from: oldVal, to: next });
  }
  if (!edited.length) throw new Error('未找到已勾选的监控问题，无法执行修改保存');
  // 确认按钮应可点（无未保存的编辑态）
  await page.waitForSelector('[data-testid="trial-confirm"]:not([disabled])', { timeout: 10_000 });
  return edited;
}

/**
 * 确认落库后核对：今日 collect_slots 数量（应 >0），并记录改写后的行业题是否落库。
 */
async function verifySlotsAfterConfirm(page, ctx) {
  const token = await page.evaluate(() => localStorage.getItem('geo_token') || '');
  if (!token) throw new Error('确认后无 geo_token');
  const api = ctx.deps.API;
  const brandsResp = await fetch(`${api}/user/brands`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const brandsJson = await brandsResp.json().catch(() => ({}));
  const brands = brandsJson.data?.list || brandsJson.data || brandsJson.list || [];
  const brandList = Array.isArray(brands) ? brands : [];
  if (!brandList.length) throw new Error(`确认后无品牌：${JSON.stringify(brandsJson).slice(0, 200)}`);
  const brand = brandList[0];
  const brandId = brand.brand_id || brand.id;
  ctx.brandId = brandId;
  ctx.brandName = brand.name || ctx.brandName;

  const qResp = await fetch(`${api}/query/list?brand_id=${encodeURIComponent(brandId)}&query_type=all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const qJson = await qResp.json().catch(() => ({}));
  const qList = qJson.data?.list || qJson.list || [];
  ctx.queriesAfterConfirm = qList.map(q => ({
    id: q.id ?? q.query_id,
    query: q.query,
    query_type: q.query_type,
  }));

  // 用 generate_today 触发幂等展槽，并返回当日 expected（若首登已展，应已有槽）
  const genResp = await fetch(`${api}/user/generate_today`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ days: 1 }),
  });
  const genJson = await genResp.json().catch(() => ({}));
  const tasks = genJson.data?.tasks || [];
  const expected = tasks.reduce((s, t) => s + (t.expected_slots || 0), 0);
  ctx.slotExpected = expected;
  ctx.collectTasks = tasks;

  const industry = ctx.queriesAfterConfirm.filter(q => q.query_type !== 'brand');
  const editedHit = (ctx.editedQueries || []).filter(e =>
    industry.some(q => q.query === e.to),
  );
  return {
    brandId,
    queryTotal: ctx.queriesAfterConfirm.length,
    industryCount: industry.length,
    editedSaved: editedHit.length,
    editedTotal: (ctx.editedQueries || []).length,
    expectedSlots: expected,
    industrySample: industry.slice(0, 3).map(q => q.query),
  };
}

async function waitTrialReportCard(page, ctx, ctxKey = 'brandName') {
  await page.waitForSelector('[data-testid="trial-report"]', { timeout: 30_000 });
  const text = (await page.locator('[data-testid="trial-report"]').innerText()).slice(0, 160).replace(/\n/g, ' ');
  const m = text.match(/品牌[「『"']([^」』"']{1,40})[」』"']/);
  if (m?.[1]) ctx[ctxKey] = m[1].trim();
  return text;
}

/** 报告卡 → 控制台概览（同域 SPA，无需 #token） */
async function goConsoleFromReport(page, dash) {
  await page.waitForSelector('[data-testid="trial-go-console"]', { timeout: 15_000 });
  await page.click('[data-testid="trial-go-console"]');
  try {
    await page.waitForFunction(
      (d) => {
        const u = location.href;
        return u.includes(d) && u.includes('/dashboard') && !u.includes('/login') && !u.includes('/trial');
      },
      dash,
      { timeout: 45_000 },
    );
  } catch (e) {
    throw new Error(`未进入后台（当前 ${page.url()}）。${String((e && e.message) || e).slice(0, 120)}`);
  }
  const hasTok = await page.evaluate(() => !!localStorage.getItem('geo_token'));
  if (!hasTok) throw new Error(`后台无 geo_token（url=${page.url()}）`);
  if (!/\/dashboard\/overview/.test(page.url())) {
    await page.goto(`${dash}/dashboard/overview`, { waitUntil: 'domcontentloaded' });
  }
}

const steps = [
  {
    name: '打开后台登录页（dash-v2）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[placeholder="请输入账号"]', { timeout: 15_000 });
      return { status: 'ok', detail: urlOf(page) };
    },
  },
  {
    name: '填写账号密码',
    async run(page, ctx) {
      await page.fill('input[placeholder="请输入账号"]', ctx.task.account);
      await page.fill('input[placeholder="请输入密码"]', ctx.task.password);
      return { status: 'ok', detail: `账号 ${ctx.task.account}` };
    },
  },
  {
    name: '点击登录并等待跳转',
    async run(page, ctx) {
      await page.click('[data-testid="login-submit"]');
      try {
        await page.waitForFunction(
          ({ dash }) => {
            const u = location.href;
            return (
              u.includes(`${dash}/trial`)
              || u.includes('/dashboard/')
            );
          },
          { dash: ctx.deps.DASH },
          { timeout: 30_000 },
        );
      } catch (e) {
        const err = await page.locator('.text-destructive, [class*="destructive"]').first().innerText().catch(() => '');
        throw new Error(`登录未跳转（url=${page.url()}${err ? `，提示=${err}` : ''}）：${e.message}`);
      }
      ctx.route = page.url().includes('/trial') ? 'trial' : 'console';
      return {
        status: 'ok',
        detail: `${page.url()}（${ctx.route === 'trial' ? '首次用户 → /trial 建档' : '已有品牌 → 直接进后台'}）`,
      };
    },
  },
  {
    name: '填写品牌 1 并提交分析',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      await submitTrialBrand(page, ctx.task.brand_input);
      return { status: 'ok', detail: `品牌 1：${ctx.task.brand_input.slice(0, 60)}` };
    },
  },
  {
    name: '等待品牌 1 分析完成（SSE → 候选确认面板）',
    skip: ctx => ctx.route !== 'trial',
    async run(page) {
      const detail = await waitTrialConfirmPanel(page);
      return { status: 'ok', detail };
    },
  },
  {
    name: '逐条修改已选监控问题并保存',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      const edited = await editSelectedQueriesBeforeConfirm(page);
      ctx.editedQueries = edited;
      const sample = edited.slice(0, 2).map(e => `${e.from.slice(0, 12)}→${e.to.slice(0, 16)}`).join('；');
      return { status: 'ok', detail: `已改 ${edited.length} 条：${sample}` };
    },
  },
  {
    name: '确认品牌 1 监控问题（落库）',
    skip: ctx => ctx.route !== 'trial',
    async run(page) {
      await confirmTrialQueries(page);
      return { status: 'ok', detail: '已点击「确认监控」' };
    },
  },
  {
    name: '核对落库问题与今日槽位',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      const v = await verifySlotsAfterConfirm(page, ctx);
      const ok = v.industryCount >= 1 && v.editedSaved === v.editedTotal && v.expectedSlots > 0;
      return {
        status: ok ? 'ok' : 'fail',
        detail: `行业题=${v.industryCount}，改写落库=${v.editedSaved}/${v.editedTotal}，今日槽位=${v.expectedSlots}，样例=${JSON.stringify(v.industrySample)}`,
      };
    },
  },
  {
    name: '等待品牌 1 建档完成报告卡',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      const text = await waitTrialReportCard(page, ctx, 'brandName');
      ctx.brandName1 = ctx.brandName;
      return { status: 'ok', detail: text };
    },
  },
  {
    name: '前往控制台（品牌 1）',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      await goConsoleFromReport(page, ctx.deps.DASH);
      return { status: 'ok', detail: urlOf(page) };
    },
  },

  // —— 多品牌：第二品牌（品牌切换 → /trial?from=add_brand）——
  {
    name: '打开品牌切换 → 添加新品牌',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page, ctx) {
      if (!page.url().includes(ctx.deps.DASH) || page.url().includes('/trial')) {
        await page.goto(`${ctx.deps.DASH}/dashboard/overview`, { waitUntil: 'domcontentloaded' });
      }
      await page.waitForSelector('[data-testid="brand-switcher"]', { timeout: 20_000 });
      await page.click('[data-testid="brand-switcher"]');
      await page.waitForSelector('[data-testid="brand-add"]', { timeout: 10_000 });
      await Promise.all([
        page.waitForURL(/\/trial(\?|$)/, { timeout: 30_000 }),
        page.click('[data-testid="brand-add"]'),
      ]);
      ctx.route = 'add_brand';
      return { status: 'ok', detail: urlOf(page) };
    },
  },
  {
    name: '填写品牌 2 并提交分析',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page, ctx) {
      const input = String(ctx.task.brand_input_2 || '').trim();
      await submitTrialBrand(page, input);
      return { status: 'ok', detail: `品牌 2：${input.slice(0, 60)}` };
    },
  },
  {
    name: '等待品牌 2 分析完成（SSE → 候选确认面板）',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page) {
      const detail = await waitTrialConfirmPanel(page);
      return { status: 'ok', detail };
    },
  },
  {
    name: '确认品牌 2 监控问题（落库）',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page) {
      await confirmTrialQueries(page);
      return { status: 'ok', detail: '已点击「确认监控」' };
    },
  },
  {
    name: '等待品牌 2 建档完成报告卡',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page, ctx) {
      const text = await waitTrialReportCard(page, ctx, 'brandName2');
      if (ctx.brandName2) ctx.brandName = ctx.brandName2;
      return { status: 'ok', detail: text };
    },
  },
  {
    name: '前往控制台（品牌 2）',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page, ctx) {
      await goConsoleFromReport(page, ctx.deps.DASH);
      return { status: 'ok', detail: urlOf(page) };
    },
  },
  {
    name: '验证品牌切换面板有 2 个品牌',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/overview`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-testid="brand-switcher"]', { timeout: 20_000 });
      await page.click('[data-testid="brand-switcher"]');
      await page.waitForSelector('[data-testid="brand-item-name"]', { timeout: 10_000 });
      const names = await page.locator('[data-testid="brand-item-name"]').allTextContents();
      const brandNames = names.map(n => n.trim()).filter(Boolean);
      await page.keyboard.press('Escape').catch(() => undefined);
      await page.locator('body').click({ position: { x: 10, y: 10 } }).catch(() => undefined);

      const n1 = ctx.brandName1 || extractBrandName(ctx.task.brand_input);
      const n2 = ctx.brandName2 || extractBrandName(ctx.task.brand_input_2);
      const hit1 = brandNames.some(n => n.includes(n1) || n1.includes(n));
      const hit2 = brandNames.some(n => n.includes(n2) || n2.includes(n));
      const ok = brandNames.length >= 2 && hit1 && hit2;
      return {
        status: ok ? 'ok' : 'fail',
        detail: `面板品牌=${JSON.stringify(brandNames)}；期望含「${n1}」「${n2}」`,
      };
    },
  },

  {
    name: '概览页（品牌卡 / 采集状态）',
    async run(page, ctx) {
      const target = `${ctx.deps.DASH}/dashboard/overview`;
      await page.goto(target, { waitUntil: 'domcontentloaded' });
      await page.waitForURL(/\/dashboard\/overview\/?/, { timeout: 20_000 }).catch(() => undefined);
      if (!/\/dashboard\/overview/.test(page.url())) {
        return { status: 'fail', detail: `未进入概览页，当前 ${page.url()}` };
      }
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="ov-brand"]');
        if (!el) return false;
        const name = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return name.length >= 2 && name !== '—' && name !== '加载中…';
      }, null, { timeout: 45_000 });
      const nameOnly = (await page.locator('[data-testid="ov-brand"]').innerText()).trim();
      if (nameOnly && nameOnly !== '—') ctx.brandName = nameOnly || ctx.brandName;
      const body = await page.locator('body').innerText();
      const pending = body.includes('等待') || body.includes('首次') || body.includes('采集');
      const ok = !!(ctx.brandName && body.includes(ctx.brandName));
      return {
        status: ok ? 'ok' : 'fail',
        detail: `品牌卡=${nameOnly}，断言名=${ctx.brandName}，采集状态区存在=${pending}，url=${page.url()}`,
      };
    },
  },
  {
    name: '套餐页（免费版 / 档位卡）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/plan-upgrade`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-testid="plan-current-name"]', { timeout: 30_000 });
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="plan-current-name"]');
        return !!el && /免费|体验/.test(el.textContent || '');
      }, null, { timeout: 30_000 });
      const planName = (await page.locator('[data-testid="plan-current-name"]').innerText()).trim();
      const cards = await page.locator('[data-testid="plan-card"]').count();
      const ok = /免费|体验/.test(planName) && cards >= 4;
      return { status: ok ? 'ok' : 'fail', detail: `当前=${planName}，卡片数=${cards}（应 ≥4）` };
    },
  },
  {
    name: '名片页（品牌名 / 剩余修改次数）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/brand-card`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-testid="brand-name-ro"]', { timeout: 30_000 });
      const nameInput = await page.locator('[data-testid="brand-name-ro"]').inputValue().catch(async () =>
        (await page.locator('[data-testid="brand-name-ro"]').innerText()).trim(),
      );
      const rename = await page.locator('[data-testid="rename-remaining"]').innerText().catch(() => '?');
      const ok = String(nameInput).includes(ctx.brandName);
      return { status: ok ? 'ok' : 'fail', detail: `品牌名=${nameInput}，剩余修改=${rename}` };
    },
  },
  {
    name: '口碑·监控问题管理（建档生成 ≥1 个口碑词）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/topic-management?type=brand`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () => document.querySelectorAll('[data-testid="qm-query"]').length >= 1,
        null, { timeout: 90_000 },
      );
      const { rows, first } = await page.evaluate(() => {
        const texts = [...document.querySelectorAll('[data-testid="qm-query"]')]
          .map(el => (el.textContent || '').trim())
          .filter(Boolean);
        return { rows: texts.length, first: (texts[0] || '').slice(0, 30) };
      });
      return { status: rows >= 1 ? 'ok' : 'fail', detail: `行数=${rows}，首条=${first}（首登默认至少 1 条口碑词）` };
    },
  },
  {
    name: '口碑·识别管理（品牌名）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/monitor-recognition?type=brand`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-testid="brand-name-ro"]', { timeout: 30_000 });
      const brand = await page.locator('[data-testid="brand-name-ro"]').inputValue().catch(async () =>
        (await page.locator('[data-testid="brand-name-ro"]').innerText()).trim(),
      );
      return { status: String(brand).includes(ctx.brandName) ? 'ok' : 'fail', detail: `品牌名=${brand}` };
    },
  },
  {
    name: '排名·监控问题管理（建档生成 ≥2 行）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/topic-management`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () => document.querySelectorAll('[data-testid="qm-query"]').length >= 2,
        null, { timeout: 90_000 },
      );
      const { rows, first } = await page.evaluate(() => {
        const texts = [...document.querySelectorAll('[data-testid="qm-query"]')]
          .map(el => (el.textContent || '').trim())
          .filter(Boolean);
        return { rows: texts.length, first: (texts[0] || '').slice(0, 30) };
      });
      return { status: rows >= 2 ? 'ok' : 'fail', detail: `行数=${rows}，首条=${first}` };
    },
  },
  {
    name: '信源库页可打开',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/media-library`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => {
        const t = document.body.innerText || '';
        return /信源|媒体|渠道/.test(t);
      }, null, { timeout: 30_000 });
      const rows = await page.locator('[data-testid="media-row"]').count().catch(() => 0);
      const body = await page.locator('body').innerText();
      const ok = /信源|媒体|渠道/.test(body);
      return { status: ok ? 'ok' : 'fail', detail: `页面就绪；媒体行数=${rows}（采集前可为 0）` };
    },
  },
  {
    name: '生成采集任务（POST /user/generate_today，可多天）',
    async run(page, ctx) {
      const token = await page.evaluate(() => localStorage.getItem('geo_token') || localStorage.getItem('geo.token') || '');
      if (!token) throw new Error('未找到登录 token，无法生成采集任务');
      const days = Math.max(1, Math.min(3, Number(ctx.task.slot_days) || 1));
      const resp = await fetch(`${ctx.deps.API}/user/generate_today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days }),
      });
      const json = await resp.json().catch(() => ({}));
      if (json.code !== 200 || !json.data || !json.data.tasks || !json.data.tasks.length) {
        throw new Error(`生成失败：${JSON.stringify(json).slice(0, 200)}`);
      }
      const tasks = json.data.tasks;
      ctx.collectTasks = tasks.map(t => ({
        task_id: t.task_id, brand_name: t.brand_name, date: t.date,
        expected_slots: t.expected_slots, status: t.status,
      }));
      const byDate = tasks.map(t => `${t.date}×${t.expected_slots}`).join('、');
      const first = tasks[0];
      return { status: 'ok', detail: `共 ${tasks.length} 个任务（${first.brand_name}）：${byDate} 槽/日` };
    },
  },
  {
    name: '管理后台可见任务（未采集）',
    async run(page, ctx) {
      const tasks = ctx.collectTasks;
      if (!tasks || !tasks.length) throw new Error('缺少采集任务信息（前一步未成功）');
      const brand = tasks[0].brand_name;
      const dates = tasks.map(t => t.date);
      const adminPage = await page.context().newPage();
      try {
        await adminPage.goto(`${ctx.deps.ADMIN}/login`, { waitUntil: 'domcontentloaded' });
        await adminPage.waitForSelector('input[placeholder="管理员账号"]', { timeout: 20_000 });
        await adminPage.fill('input[placeholder="管理员账号"]', '123456');
        await adminPage.fill('input[placeholder="密码"]', '123456');
        await adminPage.click('button.submit, .submit button, button[type="submit"]');
        await adminPage.waitForURL(/\/(overview|collect|users)/, { timeout: 30_000 }).catch(() => undefined);
        // 直接进采集监控，避免侧栏点击竞态
        await adminPage.goto(`${ctx.deps.ADMIN}/collect`, { waitUntil: 'domcontentloaded' });
        await adminPage.waitForSelector('.page-title', { timeout: 15_000 });

        // UI 状态为中文「已创建/进行中」；应采/已采/失败形如 16/0/0
        try {
          await adminPage.waitForFunction(
            ({ brand, dates }) => {
              const t = document.body.innerText || '';
              if (!(t.includes(brand) && dates.every(d => t.includes(d)))) return false;
              const statusOk = /已创建|进行中|\b(created|running)\b/.test(t);
              const rateOk = /[1-9]\d*\s*\/\s*0\s*\/\s*0/.test(t);
              return statusOk && rateOk;
            },
            { brand, dates },
            { timeout: 45_000 },
          );
        } catch (e) {
          const body = (await adminPage.locator('body').innerText().catch(() => '')).slice(0, 400);
          throw new Error(`采集监控未看到未采任务（url=${adminPage.url()} brand=${brand}）：${body.replace(/\s+/g, ' ')}`);
        }
        const body = await adminPage.locator('body').innerText();
        const notCollected = /已创建|进行中|\b(created|running)\b/.test(body) && /[1-9]\d*\s*\/\s*0\s*\/\s*0/.test(body);
        return { status: notCollected ? 'ok' : 'fail', detail: `采集监控可见品牌=${brand} 日期=${dates.join('、')}；未采集形态=${notCollected}` };
      } finally {
        await adminPage.close().catch(() => {});
      }
    },
  },
];

module.exports = { steps, extractBrandName };
