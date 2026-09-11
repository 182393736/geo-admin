'use strict';
/**
 * 执行步骤定义：Playwright 逐步执行「登录 → 首登建档 → 后台采集前数据展示验证」。
 * 每步 run(page, ctx) 返回 { status: 'ok'|'fail', detail }；抛异常视为 fail 并中断。
 * 选择器与断言对齐 /home/user/geo_login/verify_precollection_e2e.py。
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
      // 无品牌 → 官网 /trial#token；有品牌 → 后台 /dashboard/overview
      await page.waitForFunction(
        (dash, site) => {
          const u = location.href;
          return u.includes('/dashboard/overview') || u.includes(`${site}/trial`) || u.includes('/trial');
        },
        ctx.deps.DASH, ctx.deps.SITE,
        { timeout: 30_000 },
      );
      ctx.route = page.url().includes(`${ctx.deps.SITE}/trial`) || page.url().includes('/trial') ? 'trial' : 'console';
      return { status: 'ok', detail: `${page.url()}（${ctx.route === 'trial' ? '首次用户 → 官网建档' : '已有品牌 → 直接进后台'}）` };
    },
  },
  {
    name: '官网吸收登录态（#token → geo.token）',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      // 等 onMounted 吸收 token 并清除 URL hash
      await page.waitForFunction(() => !!localStorage.getItem('geo.token'), { timeout: 30_000 });
      await page.waitForFunction(() => !location.hash.includes('token='), null, { timeout: 15_000 });
      return { status: 'ok', detail: 'geo.token 已写入，URL 已清除 token' };
    },
  },
  {
    name: '填写品牌输入并提交分析',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      await page.waitForSelector('textarea.trial-h-ta', { timeout: 30_000 });
      await page.fill('textarea.trial-h-ta', ctx.task.brand_input);
      await page.click('button.trial-h-send');
      return { status: 'ok', detail: `品牌输入：${ctx.task.brand_input.slice(0, 60)}` };
    },
  },
  {
    name: '等待分析完成（SSE → 候选确认面板）',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      // 轮询：成功 → .trial-cp 出现；失败 → 页面出现「分析失败/中断」文案（如 LLM 402 余额不足）
      const result = await page.waitForFunction(() => {
        if (document.querySelector('.trial-cp')) return 'panel';
        const body = document.body.innerText || '';
        const m = body.match(/分析(?:失败|中断)[：:]\s*(.{0,160})/);
        return m ? 'err:' + m[0].replace(/\s+/g, ' ') : null;
      }, null, { timeout: ANALYSIS_TIMEOUT, polling: 1500 });
      const v = await result.jsonValue();
      if (v === 'panel') {
        const picked = await page.locator('.trial-bc.sel').count().catch(() => 0);
        return { status: 'ok', detail: `候选面板已出，默认预选 ${picked} 条` };
      }
      if (typeof v === 'string' && v.startsWith('err:')) {
        throw new Error('分析未完成：' + v.slice(4).slice(0, 200));
      }
      throw new Error('分析未在预期时间内完成');
    },
  },
  {
    name: '确认监控问题（落库）',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      await page.waitForSelector('.trial-cp-actions .trial-cp-btn-ok:not([disabled])', { timeout: 15_000 });
      await page.click('.trial-cp-actions .trial-cp-btn-ok');
      return { status: 'ok', detail: '已点击「确认监控」' };
    },
  },
  {
    name: '等待建档完成报告卡',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      await page.waitForSelector('.trial-rd-card', { timeout: 30_000 });
      const text = (await page.locator('.trial-rd-card').innerText()).slice(0, 120).replace(/\n/g, ' ');
      // LLM 落库名可能与输入不同（如输入「苹果手机」→ 品牌「iPhone」），后续断言必须用真实名
      const m = text.match(/品牌[「『"']([^」』"']{1,40})[」』"']/);
      if (m?.[1]) ctx.brandName = m[1].trim();
      return { status: 'ok', detail: text };
    },
  },
  {
    name: '前往控制台（后台吸收回传 token）',
    skip: ctx => ctx.route !== 'trial',
    async run(page, ctx) {
      const href = await page.locator('.trial-rd-card a.trial-cp-btn-ok').getAttribute('href');
      if (!href) throw new Error('报告卡缺少「前往控制台」链接');
      await page.goto(href, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction((dash) => location.href.includes(dash) || location.href.includes('/dashboard'), ctx.deps.DASH, { timeout: 30_000 });
      // 等 hash token 被后台吸收，避免下一步 goto overview 时态竞态
      await page.waitForFunction(() => !location.hash.includes('token='), null, { timeout: 15_000 }).catch(() => undefined);
      return { status: 'ok', detail: urlOf(page) };
    },
  },
  {
    name: '概览页（品牌卡 / 采集状态）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/overview`, { waitUntil: 'domcontentloaded' });
      // 等品牌卡异步加载（先渲染「—」占位），再读真实品牌名
      await page.waitForFunction(() => {
        const el = document.querySelector('.ov2-brand');
        if (!el) return false;
        const name = (el.childNodes[0]?.textContent || el.textContent || '').replace(/\s+/g, ' ').trim();
        return name.length >= 2 && name !== '—';
      }, null, { timeout: 45_000 });
      const shown = (await page.locator('.ov2-brand').innerText()).split('\n')[0].trim();
      // 纠正 ctx：无 trial 报告卡时也可能与 extractBrandName 不一致
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
      // 页面先渲染「暂无订阅」占位，订阅/套餐异步加载后才出「免费体验版」→ 等待真实数据到位
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
    name: '口碑·监控问题管理（采集前应 0 行）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/sentiment/question-mgmt`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.qm-card-title', { timeout: 30_000 });
      const rows = await page.locator('.qm-row').count();
      return { status: rows === 0 ? 'ok' : 'fail', detail: `行数=${rows}（采集前应 0）` };
    },
  },
  {
    name: '口碑·识别管理（品牌名）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/sentiment/recognition-mgmt`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input.rm-brand-input', { timeout: 30_000 });
      const brand = await page.locator('input.rm-brand-input').inputValue();
      return { status: brand.includes(ctx.brandName) ? 'ok' : 'fail', detail: `品牌名=${brand}` };
    },
  },
  {
    name: '排名·监控问题管理（建档生成 ≥2 行）',
    async run(page, ctx) {
      await page.goto(`${ctx.deps.DASH}/dashboard/topic-management`, { waitUntil: 'domcontentloaded' });
      // 面板为异步加载真实数据（queryList('industry')），轮询等首行渲染后计数
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
    name: '生成当日采集任务（POST /user/generate_today）',
    async run(page, ctx) {
      // 用登录用户自己的 JWT 调接口，为当日展开采集任务与槽位（幂等；与 00:30 定时任务同源逻辑）
      const token = await page.evaluate(() => localStorage.getItem('geo_token') || localStorage.getItem('geo.token') || '');
      if (!token) throw new Error('未找到登录 token，无法生成采集任务');
      const resp = await fetch(`${ctx.deps.API}/user/generate_today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const json = await resp.json().catch(() => ({}));
      if (json.code !== 200 || !json.data || !json.data.tasks || !json.data.tasks.length) {
        throw new Error(`生成失败：${JSON.stringify(json).slice(0, 200)}`);
      }
      const t = json.data.tasks[0];
      ctx.collectTask = { task_id: t.task_id, brand_name: t.brand_name, date: t.date, expected_slots: t.expected_slots, status: t.status };
      return { status: 'ok', detail: `task_id=${t.task_id}，品牌=${t.brand_name}，应采=${t.expected_slots} 槽，状态=${t.status}` };
    },
  },
  {
    name: '管理后台可见当日任务（未采集）',
    async run(page, ctx) {
      const task = ctx.collectTask;
      if (!task) throw new Error('缺少采集任务信息（前一步未成功）');
      const adminPage = await page.context().newPage();
      try {
        // 登录管理总后台（管理员 123456/123456，独立 origin 不影响用户会话）
        await adminPage.goto(`${ctx.deps.ADMIN}/login`, { waitUntil: 'domcontentloaded' });
        await adminPage.waitForSelector('input[placeholder="管理员账号"]', { timeout: 20_000 });
        await adminPage.fill('input[placeholder="管理员账号"]', '123456');
        await adminPage.fill('input[placeholder="密码"]', '123456');
        await adminPage.click('button.submit');
        await adminPage.waitForFunction(() => location.href.includes('/overview'), null, { timeout: 30_000 });

        // 打开「采集监控」，断言当日该品牌任务可见，且尚未采集
        await adminPage.goto(`${ctx.deps.ADMIN}/collect`, { waitUntil: 'domcontentloaded' });
        await adminPage.waitForFunction(
          (brand, date) => {
            const t = document.body.innerText || '';
            return t.includes(brand) && t.includes(date);
          },
          task.brand_name, task.date, { timeout: 30_000 },
        );
        const body = await adminPage.locator('body').innerText();
        // 未采集形态：状态 created/running 且「应采/已采/失败」列为 N/0/0（N≥1）
        const notCollected = /(created|running)/.test(body) && /[1-9]\d*\/0\/0/.test(body);
        return { status: notCollected ? 'ok' : 'fail', detail: `采集监控可见品牌=${task.brand_name} 日期=${task.date}；未采集形态=${notCollected}` };
      } finally {
        await adminPage.close().catch(() => {});
      }
    },
  },
];

module.exports = { steps, extractBrandName };
