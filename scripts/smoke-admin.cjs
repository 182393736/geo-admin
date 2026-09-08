'use strict';
// 总后台冒烟：登录 → 驾驶舱 → 各页路由可渲染
const { chromium } = require('/home/user/geo-admin/apps/gen-test/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto('http://localhost:5180/login', { waitUntil: 'networkidle' });
  console.log('[1] 登录页标题:', await page.title());
  await page.fill('input[placeholder="管理员账号"]', '123456');
  await page.fill('input[placeholder="密码"]', '123456');
  await page.click('button:has-text("登录")');
  await page.waitForURL('**/overview', { timeout: 20000 });
  console.log('[2] 登录成功，当前 URL:', page.url());

  await page.waitForSelector('.stat-card', { timeout: 20000 });
  console.log('[3] 驾驶舱 stat-card 数量:', await page.locator('.stat-card').count());

  const routes = ['/users', '/brands', '/collect', '/parse', '/llm', '/billing', '/content', '/reports', '/onboarding', '/behavior', '/diagnosis', '/agent', '/reminders', '/system'];
  for (const r of routes) {
    try {
      await page.goto('http://localhost:5180' + r, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.page-title', { timeout: 20000 });
      const t = (await page.textContent('.page-title')).trim();
      console.log(`[4] ${r}  → 「${t}」`);
    } catch (e) {
      console.log(`[4] ${r}  → ❌ ${e.message.split('\n')[0]}`);
    }
  }

  // 退出登录
  await page.click('button:has-text("退出登录")');
  await page.waitForURL('**/login', { timeout: 10000 });
  console.log('[5] 退出登录成功，回到:', page.url());

  console.log('JS 错误数:', errors.length);
  if (errors.length) console.log(errors.slice(0, 10).join('\n'));
  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
