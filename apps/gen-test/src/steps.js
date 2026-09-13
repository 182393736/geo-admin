'use strict';
/**
 * 执行步骤定义：Playwright 逐步执行
 * 「登录 → 首登建档 →（可选）添加第二品牌 → 后台采集前数据展示验证」。
 * 每步 run(page, ctx) 返回 { status: 'ok'|'fail', detail }；抛异常视为 fail 并中断。
 */

const ANALYSIS_TIMEOUT = 480_000; // LLM 分析最长时间（SSE 全程；Agnes 慢时放宽到 8 分钟）

function urlOf(page) { return page.url(); }

/** 从品牌输入里提取品牌名（「品牌名」/ "品牌叫X" / 首词兜底） */
function extractBrandName(input) {
  const t = String(input || '').trim();
  const q = t.match(/[「『"]([^」』"]{1,30})[」』"]/);
  const n = t.match(/品牌(?:叫|是|为)[:： ]?([^，。,\s]{1,30})/);
  const name = (q?.[1] || n?.[1] || '').trim();
  if (name) return name.slice(0, 30);
  const toks = t.split(/[\s，。,.；;：:（）()]+/).filter(Boolean);
  for (const tok of toks) {
    if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(tok)) continue;
    if (/^[a-z0-9-]{2,30}$/i.test(tok) || /^[一-龥]{2,20}$/.test(tok)) return tok;
  }
  return '你的品牌';
}

function hasSecondBrand(ctx) {
  return !!String(ctx.task.brand_input_2 || '').trim();
}

/** 官网 /trial 吸收 #token → geo.token */
async function absorbSiteToken(page) {
  await page.waitForFunction(() => !!localStorage.getItem('geo.token'), { timeout: 30_000 });
  await page.waitForFunction(() => !location.hash.includes('token='), null, { timeout: 15_000 });
}

/** 填写品牌描述并点发送 */
async function submitTrialBrand(page, brandInput) {
  await page.waitForSelector('textarea.trial-h-ta', { timeout: 30_000 });
  await page.fill('textarea.trial-h-ta', brandInput);
  await page.click('button.trial-h-send');
}

/** 等 SSE 出候选确认面板 */
async function waitTrialConfirmPanel(page) {
  const result = await page.waitForFunction(() => {
    if (document.querySelector('.trial-cp')) return 'panel';
    const body = document.body.innerText || '';
    const m = body.match(/分析(?:失败|中断)[：:]\s*(.{0,160})/);
    return m ? 'err:' + m[0].replace(/\s+/g, ' ') : null;
  }, null, { timeout: ANALYSIS_TIMEOUT, polling: 1500 });
  const v = await result.jsonValue();
  if (v === 'panel') {
    const picked = await page.locator('.trial-bc.sel').count().catch(() => 0);
    return `候选面板已出，默认预选 ${picked} 条`;
  }
  if (typeof v === 'string' && v.startsWith('err:')) {
    throw new Error('分析未完成：' + v.slice(4).slice(0, 200));
  }
  throw new Error('分析未在预期时间内完成');
}

/** 确认监控问题落库 */
async function confirmTrialQueries(page) {
  await page.waitForSelector('.trial-cp-actions .trial-cp-btn-ok:not([disabled])', { timeout: 15_000 });
  await page.click('.trial-cp-actions .trial-cp-btn-ok');
}

/** 等报告卡，解析落库品牌名写入 ctxKey */
async function waitTrialReportCard(page, ctx, ctxKey = 'brandName') {
  await page.waitForSelector('.trial-rd-card', { timeout: 30_000 });
  const text = (await page.locator('.trial-rd-card').innerText()).slice(0, 120).replace(/\n/g, ' ');
  const m = text.match(/品牌[「『"']([^」』"']{1,40})[」』"']/);
  if (m?.[1]) ctx[ctxKey] = m[1].trim();
  return text;
}

/** 点击「前往控制台」并确认 dash 吸收 geo_token */
async function goConsoleFromReport(page, dash) {
  const href = await page.locator('.trial-rd-card a.trial-cp-btn-ok').getAttribute('href');
  if (!href) throw new Error('报告卡缺少「前往控制台」链接');
  if (!/token=/.test(href)) throw new Error(`前往控制台链接缺少 token：${href.slice(0, 120)}`);
  await page.goto(href, { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(
      (d) => {
        const u = location.href;
        if (!u.includes(d) || u.includes('/login')) return false;
        return u.includes('/dashboard') || (location.pathname === '/' || location.pathname === '');
      },
      dash,
      { timeout: 45_000 },
    );
  } catch (e) {
    throw new Error(`未进入后台（当前 ${page.url()}；链接 ${href.slice(0, 160)}）。${String((e && e.message) || e).slice(0, 120)}`);
  }
  await page.waitForFunction(() => !location.hash.includes('token='), null, { timeout: 15_000 }).catch(() => undefined);
  const hasTok = await page.evaluate(() => !!localStorage.getItem('geo_token'));
  if (!hasTok) throw new Error(`后台未吸收 token（url=${page.url()}）`);
  return href;
}

const steps = [
  {
    name: '打开后台登录页',
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
      await page.click('button.submit-btn');
      await page.waitForFunction(
        ({ dash, site }) => {
          const u = location.href;
          return u.includes('/dashboard/overview') || u.includes(`${site}/trial`) || u.includes('/trial');
        },
        { dash: ctx.deps.DASH, site: ctx.deps.SITE },
        { timeout: 30_000 },
      );
      ctx.route = page.url().includes(`${ctx.deps.SITE}/trial`) || page.url().includes('/trial') ? 'trial' : 'console';
      return { status: 'ok', detail: `${page.url()}（${ctx.route === 'trial' ? '首次用户 → 官网建档' : '已有品牌 → 直接进后台'}）` };
    },
  },
  {
    name: '官网吸收登录态（#token → geo.token）',
    skip: ctx => ctx.route !== 'trial',
    async run(page) {
      await absorbSiteToken(page);
      return { status: 'ok', detail: 'geo.token 已写入，URL 已清除 token' };
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
    name: '确认品牌 1 监控问题（落库）',
    skip: ctx => ctx.route !== 'trial',
    async run(page) {
      await confirmTrialQueries(page);
      return { status: 'ok', detail: '已点击「确认监控」' };
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
    name: '前往控制台（品牌 1 回传 token）',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      await goConsoleFromReport(page, ctx.deps.DASH);
      return { status: 'ok', detail: urlOf(page) };
    },
  },

  // —— 多品牌：第二品牌（BrandSwitcher → /trial?from=add_brand）——
  {
    name: '打开品牌切换 → 添加新品牌',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page, ctx) {
      if (!page.url().includes(ctx.deps.DASH)) {
        await page.goto(`${ctx.deps.DASH}/dashboard/overview`, { waitUntil: 'domcontentloaded' });
      }
      await page.waitForSelector('button.bs-trigger, .bs-trigger', { timeout: 20_000 });
      await page.click('button.bs-trigger, .bs-trigger');
      await page.waitForSelector('.bs-panel .bs-action', { timeout: 10_000 });
      await Promise.all([
        page.waitForFunction(
          ({ site }) => location.href.includes('/trial') && (
            location.href.includes(site)
            || location.search.includes('from=add_brand')
            || location.href.includes('from=add_brand')
          ),
          { site: ctx.deps.SITE },
          { timeout: 30_000 },
        ),
        page.locator('.bs-panel .bs-action').filter({ hasText: '添加新品牌' }).click(),
      ]);
      ctx.route = 'add_brand';
      return { status: 'ok', detail: urlOf(page) };
    },
  },
  {
    name: '官网吸收登录态（添加品牌 #token）',
    skip: ctx => !hasSecondBrand(ctx),
    async run(page) {
      await absorbSiteToken(page);
      return { status: 'ok', detail: 'geo.token 已写入（add_brand）' };
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
    name: '前往控制台（品牌 2 回传 token + brand_id）',
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
      await page.waitForSelector('button.bs-trigger, .bs-trigger', { timeout: 20_000 });
      await page.click('button.bs-trigger, .bs-trigger');
      await page.waitForSelector('.bs-panel .bs-item-name', { timeout: 10_000 });
      const names = await page.locator('.bs-panel .bs-item .bs-item-name').allTextContents();
      const brandNames = names.filter(n => n && !/添加|编辑/.test(n));
      const mask = page.locator('.bs-mask');
      if (await mask.count()) await mask.click({ force: true }).catch(() => undefined);

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
      await page.goto(`${ctx.deps.DASH}/dashboard/overview`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => {
        const el = document.querySelector('.ov2-brand');
        if (!el) return false;
        const name = (el.childNodes[0]?.textContent || el.textContent || '').replace(/\s+/g, ' ').trim();
        return name.length >= 2 && name !== '—';
      }, null, { timeout: 45_000 });
      const shown = (await page.locator('.ov2-brand').innerText()).split('\n')[0].trim();
      if (shown && shown !== '—') ctx.brandName = shown.replace(/等待首次采集|采集正常/g, '').trim() || ctx.brandName;
      const body = await page.locator('body').innerText();
      const pending = body.includes('等待') || body.includes('首次') || body.includes('采集');
      const ok = !!(ctx.brandName && body.includes(ctx.brandName));
      return {
        status: ok ? 'ok' : 'fail',
        detail: `品牌卡=${shown}，断言名=${ctx.brandName}，采集状态区存在=${pending}`,
      };
    },
  },
  {
    name: '套餐页（免费体验版 / 4 档套餐）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/plan-upgrade`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => {
        const el = document.querySelector('.pp-current-name');
        return !!el && el.innerText.includes('免费体验版');
      }, null, { timeout: 30_000 });
      const planName = (await page.locator('.pp-current-name').innerText()).trim();
      const cards = await page.locator('.pp-plan-name').count();
      const ok = planName.includes('免费体验版') && cards === 4;
      return { status: ok ? 'ok' : 'fail', detail: `当前=${planName}，卡片数=${cards}（应 4）` };
    },
  },
  {
    name: '名片页（品牌名 / 剩余修改次数）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/brand-card`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input.input-readonly', { timeout: 30_000 });
      const nameInput = await page.locator('input.input-readonly').inputValue();
      const rename = await page.locator('.field-hint strong').first().innerText();
      const ok = nameInput.includes(ctx.brandName);
      return { status: ok ? 'ok' : 'fail', detail: `品牌名=${nameInput}，剩余修改=${rename}` };
    },
  },
  {
    name: '口碑·监控问题管理（建档生成 ≥2 个口碑词）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/topic-management?type=brand`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () => document.querySelectorAll('.qm-row').length >= 1,
        null, { timeout: 90_000 },
      );
      const rows = await page.locator('.qm-row').count();
      const first = (await page.locator('.qm-question-text').first().innerText()).slice(0, 30);
      return { status: rows >= 2 ? 'ok' : 'fail', detail: `行数=${rows}，首条=${first}（建档生成口碑词，应 ≥2）` };
    },
  },
  {
    name: '口碑·识别管理（品牌名）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/monitor-recognition?type=brand`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input.rm-brand-input', { timeout: 30_000 });
      const brand = await page.locator('input.rm-brand-input').inputValue();
      return { status: brand.includes(ctx.brandName) ? 'ok' : 'fail', detail: `品牌名=${brand}` };
    },
  },
  {
    name: '排名·监控问题管理（建档生成 ≥2 行）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/topic-management`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () => document.querySelectorAll('.qm-row').length >= 1,
        null, { timeout: 90_000 },
      );
      const rows = await page.locator('.qm-row').count();
      const first = (await page.locator('.qm-question-text').first().innerText()).slice(0, 30);
      return { status: rows >= 2 ? 'ok' : 'fail', detail: `行数=${rows}，首条=${first}` };
    },
  },
  {
    name: '信源库（19 家种子渠道）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/media-library`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.ml-tr', { timeout: 30_000 });
      const rows = await page.locator('.ml-tr').count();
      const info = (await page.locator('.ml-page-info').innerText()).trim();
      return { status: rows >= 15 ? 'ok' : 'fail', detail: `${info}，行数=${rows}` };
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
        await adminPage.click('button.submit');
        await adminPage.waitForFunction(() => location.href.includes('/overview'), null, { timeout: 30_000 });

        await adminPage.goto(`${ctx.deps.ADMIN}/collect`, { waitUntil: 'domcontentloaded' });
        await adminPage.waitForFunction(
          ({ brand, dates }) => {
            const t = document.body.innerText || '';
            return t.includes(brand) && dates.every(d => t.includes(d));
          },
          { brand, dates },
          { timeout: 30_000 },
        );
        const body = await adminPage.locator('body').innerText();
        const notCollected = /(created|running)/.test(body) && /[1-9]\d*\/0\/0/.test(body);
        return { status: notCollected ? 'ok' : 'fail', detail: `采集监控可见品牌=${brand} 日期=${dates.join('、')}；未采集形态=${notCollected}` };
      } finally {
        await adminPage.close().catch(() => {});
      }
    },
  },
];

module.exports = { steps, extractBrandName };
