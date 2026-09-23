'use strict';
/**
 * 对话测试公共工具（CommonJS，主进程用）
 * 参考上传的 types.ts：sleep / ChatLogFn / ChatConversationResult / findVisibleLocator
 */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 依次尝试一组选择器，返回第一个可见的最后一个匹配 locator */
async function findVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).last();
    if ((await locator.count()) === 0) continue;
    const visible = await locator.isVisible().catch(() => false);
    if (visible) return locator;
  }
  return undefined;
}

/**
 * 抓取最后一条回答的纯文本 + 清洗后 HTML（保留标题/列表/表格等原格式）
 * 按 contentSelectors 顺序尝试；同一选择器取「最外层」可见节点。
 * 默认取靠下一条；若明显短于同批最长条（追问卡/引导句），改用最长条，
 * 避免文心等把主回答丢掉只留下「需要我帮你…」尾卡。
 */
async function extractAnswerHtml(page, { contentSelectors, stripSelectors = [] }) {
  return page.evaluate(
    ({ contentSelectors, stripSelectors }) => {
      const isVisible = el => {
        if (!(el instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const textLen = el =>
        ((el && (el.innerText || el.textContent)) || '').replace(/\s+/g, '').length;

      const candidates = [];
      for (const sel of contentSelectors) {
        const matches = Array.from(document.querySelectorAll(sel)).filter(isVisible);
        if (!matches.length) continue;
        const outers = matches.filter(
          el => !matches.some(other => other !== el && other.contains(el))
        );
        for (const el of outers) {
          if (!candidates.some(c => c === el || c.contains(el) || el.contains(c))) {
            candidates.push(el);
          } else {
            // 若已有祖先/子孙，保留更外层
            const idx = candidates.findIndex(c => c.contains(el) || el.contains(c));
            if (idx >= 0 && el.contains(candidates[idx])) candidates[idx] = el;
          }
        }
      }

      let root = null;
      if (candidates.length) {
        candidates.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y);
        let chosen = candidates[candidates.length - 1];
        const longest = candidates.reduce((a, b) => (textLen(a) >= textLen(b) ? a : b));
        const chosenLen = textLen(chosen);
        const longestLen = textLen(longest);
        if (
          longest &&
          chosen !== longest &&
          (chosenLen < 120 || chosenLen < longestLen * 0.45)
        ) {
          chosen = longest;
        }
        root = chosen;
      }
      if (!(root instanceof HTMLElement)) return { text: '', html: '' };

      const clone = root.cloneNode(true);
      const strip = [
        'script',
        'style',
        'noscript',
        'iframe',
        'button',
        'nav',
        'svg',
        '[class*="toolbar"]',
        '[class*="operation"]',
        '[class*="action-bar"]',
        '[class*="actionBar"]',
        '[class*="feedback"]',
        '[data-foundation-type="receive-message-action-bar"]',
        ...stripSelectors
      ].join(',');
      clone.querySelectorAll(strip).forEach(n => n.remove());

      clone.querySelectorAll('*').forEach(el => {
        for (const attr of Array.from(el.attributes)) {
          if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
          if (
            (attr.name === 'href' || attr.name === 'src') &&
            /^\s*javascript:/i.test(attr.value || '')
          ) {
            el.removeAttribute(attr.name);
          }
        }
      });

      const text = (clone.innerText || clone.textContent || '')
        .replace(/\u00a0/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      return { text, html: (clone.innerHTML || '').trim() };
    },
    { contentSelectors, stripSelectors }
  );
}

/**
 * 豆包会话主栏多为虚拟列表（v_list_scroller）：撑开 height 不会渲染视口外节点。
 * 对 div[data-page-search-scope="conversation"] 内滚动容器做「滚动 + 切片」，
 * 再在页面内用 canvas 拼接（不依赖 sharp，避免 Electron ABI 失败后回退成空白长图）。
 * @returns {Promise<Buffer|null>}
 */
async function captureDoubaoConversationStitch(page, opts = {}) {
  const log = typeof opts.log === 'function' ? opts.log : () => {};

  const ready = await page.evaluate(() => {
    const root = document.querySelector('div[data-page-search-scope="conversation"]');
    if (!(root instanceof HTMLElement)) return null;
    const scrollEl =
      Array.from(root.querySelectorAll('div')).find(d => d.scrollHeight > d.clientHeight + 40) || root;
    return {
      needsStitch: scrollEl.scrollHeight > scrollEl.clientHeight + 50,
      scrollH: scrollEl.scrollHeight,
      clientH: scrollEl.clientHeight,
      cls: String(scrollEl.className || '').slice(0, 80),
    };
  }).catch(() => null);

  if (!ready) {
    console.log('[shot] doubao stitch: no conversation scope');
    return null;
  }
  console.log(
    `[shot] doubao stitch check needsStitch=${ready.needsStitch} scroll=${ready.scrollH}/${ready.clientH} cls=${ready.cls}`,
  );
  log(
    'info',
    `豆包截图：会话滚动 ${ready.scrollH}/${ready.clientH}${ready.needsStitch ? '，将滚动拼接' : '（单屏）'}`,
  );

  // 单屏：直接 CDP 截 conversation，绝不走 expand-height
  if (!ready.needsStitch) {
    const session = await page.context().newCDPSession(page);
    try {
      const box = await page.evaluate(() => {
        const root = document.querySelector('div[data-page-search-scope="conversation"]');
        if (!(root instanceof HTMLElement)) return null;
        const r = root.getBoundingClientRect();
        return {
          x: Math.max(0, Math.floor(r.x + window.scrollX)),
          y: Math.max(0, Math.floor(r.y + window.scrollY)),
          width: Math.max(1, Math.ceil(r.width)),
          height: Math.max(1, Math.ceil(r.height)),
        };
      });
      if (!box) return null;
      const result = await session.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
        clip: { x: box.x, y: box.y, width: box.width, height: box.height, scale: 1 },
      });
      log('info', '截图选择器：div[data-page-search-scope="conversation"]（单屏）');
      console.log('[shot] platform=doubao mode=single-cdp');
      return Buffer.from(result.data, 'base64');
    } finally {
      await session.detach().catch(() => {});
    }
  }

  // 隐藏底部输入条 / sticky，避免叠进切片（不要隐藏 conversation 内部）
  await page.evaluate(() => {
    const hidden = [];
    const root = document.querySelector('div[data-page-search-scope="conversation"]');
    const hide = el => {
      if (!(el instanceof HTMLElement)) return;
      if (el.dataset.geoShotHide === '1') return;
      if (root && (el === root || root.contains(el))) return;
      hidden.push({ el, display: el.style.display });
      el.dataset.geoShotHide = '1';
      el.style.display = 'none';
    };
    for (const sel of ['textarea', '[contenteditable="true"]']) {
      document.querySelectorAll(sel).forEach(el => {
        hide(el);
        let cur = el.parentElement;
        for (let i = 0; i < 6 && cur && cur !== document.body; i++) {
          const r = cur.getBoundingClientRect();
          if (r.height > 36 && r.height < 280 && r.bottom > window.innerHeight - 280) {
            hide(cur);
            break;
          }
          cur = cur.parentElement;
        }
      });
    }
    for (const el of document.querySelectorAll('div, form, section, footer')) {
      if (!(el instanceof HTMLElement)) continue;
      const st = getComputedStyle(el);
      if (st.position !== 'fixed' && st.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 80 || r.height < 28) continue;
      if (r.bottom >= window.innerHeight - 8 && (el.querySelector('textarea, [contenteditable="true"]') || r.height < 260)) {
        hide(el);
      }
    }
    window.__geoShotHidden = hidden;
  }).catch(() => {});

  await page.evaluate(() => {
    const root = document.querySelector('div[data-page-search-scope="conversation"]');
    if (!root) return;
    const scrollEl =
      Array.from(root.querySelectorAll('div')).find(d => d.scrollHeight > d.clientHeight + 40) || root;
    scrollEl.scrollTop = 0;
  }).catch(() => {});
  await sleep(200);

  const session = await page.context().newCDPSession(page);
  const slices = [];
  try {
    const overlap = 80;
    let lastTop = -1;
    for (let i = 0; i < 80; i++) {
      const box = await page.evaluate(() => {
        const root = document.querySelector('div[data-page-search-scope="conversation"]');
        if (!(root instanceof HTMLElement)) return null;
        const scrollEl =
          Array.from(root.querySelectorAll('div')).find(d => d.scrollHeight > d.clientHeight + 40) || root;
        const r = root.getBoundingClientRect();
        const viewH = Math.max(1, Math.ceil(Math.min(r.height, scrollEl.clientHeight || r.height)));
        return {
          x: Math.max(0, Math.floor(r.x + window.scrollX)),
          y: Math.max(0, Math.floor(r.y + window.scrollY)),
          width: Math.max(1, Math.ceil(r.width)),
          height: viewH,
          scrollTop: Math.round(scrollEl.scrollTop),
          scrollH: scrollEl.scrollHeight,
          clientH: scrollEl.clientHeight,
          atEnd: scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 3,
        };
      });
      if (!box) break;
      if (box.scrollTop === lastTop && i > 0) {
        console.log(`[shot] doubao stitch: scrollTop stuck at ${box.scrollTop}, stop`);
        break;
      }
      lastTop = box.scrollTop;

      // 等虚拟列表渲染当前窗
      await sleep(180);

      let clipH = box.height;
      if (box.atEnd) {
        const tightH = await page.evaluate(() => {
          const root = document.querySelector('div[data-page-search-scope="conversation"]');
          if (!(root instanceof HTMLElement)) return 0;
          const r = root.getBoundingClientRect();
          let maxBottom = r.top;
          root.querySelectorAll(
            'p, li, img, video, h1, h2, h3, h4, pre, table, button, a, [data-testid]',
          ).forEach(n => {
            if (!(n instanceof HTMLElement)) return;
            const st = getComputedStyle(n);
            if (st.display === 'none' || st.visibility === 'hidden') return;
            const br = n.getBoundingClientRect();
            if (br.width < 2 || br.height < 2) return;
            const t = (n.innerText || '').replace(/\s+/g, '');
            if (t.length > 0 || n.matches?.('img, video, button')) {
              maxBottom = Math.max(maxBottom, br.bottom);
            }
          });
          return Math.max(40, Math.ceil(maxBottom - r.top + 12));
        }).catch(() => 0);
        if (tightH > 40 && tightH < clipH) clipH = tightH;
      }

      const result = await session.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
        clip: { x: box.x, y: box.y, width: box.width, height: clipH, scale: 1 },
      });
      slices.push({
        scrollTop: box.scrollTop,
        cssW: box.width,
        cssH: clipH,
        b64: result.data,
      });
      console.log(
        `[shot] doubao slice#${i} scrollTop=${box.scrollTop} clip=${box.width}x${clipH} atEnd=${box.atEnd}`,
      );

      if (box.atEnd) break;

      const step = Math.max(80, box.clientH - overlap);
      const scrolled = await page.evaluate(stepPx => {
        const root = document.querySelector('div[data-page-search-scope="conversation"]');
        const scrollEl =
          Array.from(root.querySelectorAll('div')).find(d => d.scrollHeight > d.clientHeight + 40) || root;
        const before = scrollEl.scrollTop;
        const max = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
        scrollEl.scrollTop = Math.min(scrollEl.scrollTop + stepPx, max);
        // 触发虚拟列表
        scrollEl.dispatchEvent(new Event('scroll', { bubbles: true }));
        return { before, after: scrollEl.scrollTop, max };
      }, step);
      console.log(`[shot] doubao scroll ${scrolled.before} → ${scrolled.after} (max ${scrolled.max})`);
      if (scrolled.after <= scrolled.before + 1) break;
      await sleep(220);
    }
  } finally {
    await session.detach().catch(() => {});
  }

  // 恢复隐藏
  await page.evaluate(() => {
    for (const h of window.__geoShotHidden || []) {
      try {
        h.el.style.display = h.display;
        delete h.el.dataset.geoShotHide;
      } catch { /* ignore */ }
    }
    delete window.__geoShotHidden;
  }).catch(() => {});

  if (!slices.length) return null;
  if (slices.length === 1) {
    log('info', '截图选择器：div[data-page-search-scope="conversation"]（单屏）');
    console.log('[shot] platform=doubao mode=single');
    return Buffer.from(slices[0].b64, 'base64');
  }

  // 页面内 canvas 拼接（CSS 像素坐标；drawImage 自动处理 DPR 图源）
  const totalH = Math.ceil(slices[slices.length - 1].scrollTop + slices[slices.length - 1].cssH);
  const cssW = slices[0].cssW;
  let outB64 = null;
  try {
    outB64 = await page.evaluate(async ({ slices, cssW, totalH }) => {
      const canvas = document.createElement('canvas');
      canvas.width = cssW;
      canvas.height = Math.min(totalH, 32000);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const s of slices) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = `data:image/png;base64,${s.b64}`;
        });
        ctx.drawImage(img, 0, s.scrollTop, s.cssW, s.cssH);
      }
      return canvas.toDataURL('image/png').split(',')[1];
    }, { slices, cssW, totalH });
  } catch (e) {
    console.log(`[shot] doubao canvas stitch failed: ${(e && e.message) || e}`);
    // 兜底：试 sharp
    try {
      const sharpMod = require('sharp');
      const composites = [];
      for (const s of slices) {
        const buf = Buffer.from(s.b64, 'base64');
        const meta = await sharpMod(buf).metadata();
        const dpr = (meta.width || s.cssW) / s.cssW;
        composites.push({
          input: buf,
          top: Math.round(s.scrollTop * dpr),
          left: 0,
        });
      }
      const last = slices[slices.length - 1];
      const meta0 = await sharpMod(Buffer.from(slices[0].b64, 'base64')).metadata();
      const dpr0 = (meta0.width || cssW) / cssW;
      const out = await sharpMod({
        create: {
          width: Math.round(cssW * dpr0),
          height: Math.round((last.scrollTop + last.cssH) * dpr0),
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .composite(composites)
        .png()
        .toBuffer();
      log('info', `截图选择器：div[data-page-search-scope="conversation"]（sharp 拼接 ${slices.length} 片）`);
      console.log(`[shot] platform=doubao mode=stitch-sharp slices=${slices.length}`);
      return out;
    } catch (e2) {
      console.log(`[shot] doubao sharp stitch also failed: ${(e2 && e2.message) || e2}`);
      return null;
    }
  }

  if (!outB64) return null;
  const out = Buffer.from(outB64, 'base64');
  log(
    'info',
    `截图选择器：div[data-page-search-scope="conversation"]（滚动拼接 ${slices.length} 片 → ${cssW}×${totalH}）`,
  );
  console.log(
    `[shot] platform=doubao mode=stitch-canvas slices=${slices.length} size=${cssW}x${totalH} bytes=${out.length}`,
  );
  return out;
}

/**
 * 元宝：.agent-chat__list__content-wrapper 是真实滚动容器（内层 content 已是全高）。
 * 禁止 expand-height（只会得到首屏 + 大片白），改为滚动切片 + canvas 拼接。
 */
async function captureYuanbaoConversationStitch(page, opts = {}) {
  const log = typeof opts.log === 'function' ? opts.log : () => {};

  const ready = await page.evaluate(() => {
    const sels = [
      '.agent-chat__list__content-wrapper',
      '[class*="agent-chat__list__content-wrapper"]',
    ];
    let root = null;
    let selUsed = '';
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (el instanceof HTMLElement && el.getBoundingClientRect().width > 200) {
        root = el;
        selUsed = sel;
        break;
      }
    }
    if (!root) return null;
    let scrollEl = root;
    if (!(root.scrollHeight > root.clientHeight + 40)) {
      const inner =
        root.querySelector('.agent-chat__list__content') ||
        Array.from(root.querySelectorAll('div')).find(d => d.scrollHeight > d.clientHeight + 40);
      if (inner instanceof HTMLElement) scrollEl = inner;
    }
    return {
      sel: selUsed,
      needsStitch: scrollEl.scrollHeight > scrollEl.clientHeight + 50,
      scrollH: scrollEl.scrollHeight,
      clientH: scrollEl.clientHeight,
      cls: String(scrollEl.className || '').slice(0, 80),
    };
  }).catch(() => null);

  if (!ready) {
    console.log('[shot] yuanbao stitch: no content-wrapper');
    return null;
  }
  console.log(
    `[shot] yuanbao stitch check needsStitch=${ready.needsStitch} scroll=${ready.scrollH}/${ready.clientH} sel=${ready.sel} scrollCls=${ready.cls}`,
  );
  log(
    'info',
    `元宝截图：${ready.sel} 滚动 ${ready.scrollH}/${ready.clientH}${ready.needsStitch ? '，将滚动拼接' : '（单屏）'}`,
  );

  await page.evaluate(() => {
    const hidden = [];
    const hide = el => {
      if (!(el instanceof HTMLElement) || el.dataset.geoShotHide === '1') return;
      hidden.push({ el, display: el.style.display });
      el.dataset.geoShotHide = '1';
      el.style.display = 'none';
    };
    for (const sel of [
      '.agent-dialogue__content--common__input',
      '.agent-chat__input-box',
      '[class*="agent-chat__input-box"]',
      '[class*="new-framework-input"]',
      '.agent-dialogue__content-copyright',
      '[class*="agent-dialogue__content-copyright"]',
    ]) {
      document.querySelectorAll(sel).forEach(hide);
    }
    window.__geoShotHidden = hidden;
  }).catch(() => {});

  const restoreHidden = async () => {
    await page.evaluate(() => {
      for (const h of window.__geoShotHidden || []) {
        try {
          h.el.style.display = h.display;
          delete h.el.dataset.geoShotHide;
        } catch { /* ignore */ }
      }
      delete window.__geoShotHidden;
    }).catch(() => {});
  };

  await page.evaluate(() => {
    const root =
      document.querySelector('.agent-chat__list__content-wrapper') ||
      document.querySelector('[class*="agent-chat__list__content-wrapper"]');
    if (!(root instanceof HTMLElement)) return;
    let scrollEl = root;
    if (!(root.scrollHeight > root.clientHeight + 40)) {
      const inner =
        root.querySelector('.agent-chat__list__content') ||
        Array.from(root.querySelectorAll('div')).find(d => d.scrollHeight > d.clientHeight + 40);
      if (inner instanceof HTMLElement) scrollEl = inner;
    }
    scrollEl.scrollTop = 0;
  }).catch(() => {});
  await sleep(200);

  if (!ready.needsStitch) {
    const session = await page.context().newCDPSession(page);
    try {
      const box = await page.evaluate(() => {
        const root =
          document.querySelector('.agent-chat__list__content-wrapper') ||
          document.querySelector('[class*="agent-chat__list__content-wrapper"]');
        if (!(root instanceof HTMLElement)) return null;
        const r = root.getBoundingClientRect();
        let maxBottom = r.top;
        root
          .querySelectorAll(
            '[class*="agent-chat__list__item"], [class*="agent-chat__conv"], .hyc-content-md, [class*="hyc-content-md"], p, li, img, table, h1, h2, h3',
          )
          .forEach(n => {
            if (!(n instanceof HTMLElement)) return;
            const st = getComputedStyle(n);
            if (st.display === 'none' || st.visibility === 'hidden') return;
            const br = n.getBoundingClientRect();
            if (br.width < 2 || br.height < 2) return;
            const t = (n.innerText || '').replace(/\s+/g, '');
            if (t.length > 0 || n.matches?.('img, table')) maxBottom = Math.max(maxBottom, br.bottom);
          });
        const contentH = Math.max(40, Math.ceil(maxBottom - r.top + 12));
        const height = Math.min(Math.ceil(r.height), contentH > 40 ? contentH : Math.ceil(r.height));
        return {
          x: Math.max(0, Math.floor(r.x + window.scrollX)),
          y: Math.max(0, Math.floor(r.y + window.scrollY)),
          width: Math.max(1, Math.ceil(r.width)),
          height: Math.max(1, height),
        };
      });
      if (!box) return null;
      const result = await session.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
        clip: { x: box.x, y: box.y, width: box.width, height: box.height, scale: 1 },
      });
      log('info', `截图选择器：${ready.sel}（单屏）`);
      console.log('[shot] platform=yuanbao mode=single-cdp');
      return Buffer.from(result.data, 'base64');
    } finally {
      await session.detach().catch(() => {});
      await restoreHidden();
    }
  }

  const session = await page.context().newCDPSession(page);
  const slices = [];
  try {
    const overlap = 80;
    let lastTop = -1;
    for (let i = 0; i < 80; i++) {
      const box = await page.evaluate(() => {
        const root =
          document.querySelector('.agent-chat__list__content-wrapper') ||
          document.querySelector('[class*="agent-chat__list__content-wrapper"]');
        if (!(root instanceof HTMLElement)) return null;
        let scrollEl = root;
        if (!(root.scrollHeight > root.clientHeight + 40)) {
          const inner =
            root.querySelector('.agent-chat__list__content') ||
            Array.from(root.querySelectorAll('div')).find(d => d.scrollHeight > d.clientHeight + 40);
          if (inner instanceof HTMLElement) scrollEl = inner;
        }
        const r = root.getBoundingClientRect();
        const viewH = Math.max(1, Math.ceil(Math.min(r.height, scrollEl.clientHeight || r.height)));
        return {
          x: Math.max(0, Math.floor(r.x + window.scrollX)),
          y: Math.max(0, Math.floor(r.y + window.scrollY)),
          width: Math.max(1, Math.ceil(r.width)),
          height: viewH,
          scrollTop: Math.round(scrollEl.scrollTop),
          scrollH: scrollEl.scrollHeight,
          clientH: scrollEl.clientHeight,
          atEnd: scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 3,
        };
      });
      if (!box) break;
      if (box.scrollTop === lastTop && i > 0) {
        console.log(`[shot] yuanbao stitch: scrollTop stuck at ${box.scrollTop}, stop`);
        break;
      }
      lastTop = box.scrollTop;
      await sleep(160);

      let clipH = box.height;
      if (box.atEnd) {
        const tightH = await page.evaluate(() => {
          const root =
            document.querySelector('.agent-chat__list__content-wrapper') ||
            document.querySelector('[class*="agent-chat__list__content-wrapper"]');
          if (!(root instanceof HTMLElement)) return 0;
          const r = root.getBoundingClientRect();
          let maxBottom = r.top;
          root
            .querySelectorAll(
              '[class*="agent-chat__list__item"], [class*="agent-chat__conv"], .hyc-content-md, [class*="hyc-content-md"], p, li, img, table, h1, h2, h3, button',
            )
            .forEach(n => {
              if (!(n instanceof HTMLElement)) return;
              const st = getComputedStyle(n);
              if (st.display === 'none' || st.visibility === 'hidden') return;
              const br = n.getBoundingClientRect();
              if (br.width < 2 || br.height < 2) return;
              const t = (n.innerText || '').replace(/\s+/g, '');
              if (t.length > 0 || n.matches?.('img, table, button')) {
                maxBottom = Math.max(maxBottom, br.bottom);
              }
            });
          return Math.max(40, Math.ceil(maxBottom - r.top + 12));
        }).catch(() => 0);
        if (tightH > 40 && tightH < clipH) clipH = tightH;
      }

      const result = await session.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
        clip: { x: box.x, y: box.y, width: box.width, height: clipH, scale: 1 },
      });
      slices.push({
        scrollTop: box.scrollTop,
        cssW: box.width,
        cssH: clipH,
        b64: result.data,
      });
      console.log(
        `[shot] yuanbao slice#${i} scrollTop=${box.scrollTop} clip=${box.width}x${clipH} atEnd=${box.atEnd}`,
      );
      if (box.atEnd) break;

      const step = Math.max(80, box.clientH - overlap);
      const scrolled = await page.evaluate(stepPx => {
        const root =
          document.querySelector('.agent-chat__list__content-wrapper') ||
          document.querySelector('[class*="agent-chat__list__content-wrapper"]');
        if (!(root instanceof HTMLElement)) return { before: 0, after: 0, max: 0 };
        let scrollEl = root;
        if (!(root.scrollHeight > root.clientHeight + 40)) {
          const inner =
            root.querySelector('.agent-chat__list__content') ||
            Array.from(root.querySelectorAll('div')).find(d => d.scrollHeight > d.clientHeight + 40);
          if (inner instanceof HTMLElement) scrollEl = inner;
        }
        const before = scrollEl.scrollTop;
        const max = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
        scrollEl.scrollTop = Math.min(scrollEl.scrollTop + stepPx, max);
        scrollEl.dispatchEvent(new Event('scroll', { bubbles: true }));
        return { before, after: scrollEl.scrollTop, max };
      }, step);
      console.log(`[shot] yuanbao scroll ${scrolled.before} → ${scrolled.after} (max ${scrolled.max})`);
      if (scrolled.after <= scrolled.before + 1) break;
      await sleep(200);
    }
  } finally {
    await session.detach().catch(() => {});
  }

  await restoreHidden();

  if (!slices.length) return null;
  if (slices.length === 1) {
    log('info', `截图选择器：${ready.sel}（单屏）`);
    console.log('[shot] platform=yuanbao mode=single');
    return Buffer.from(slices[0].b64, 'base64');
  }

  const totalH = Math.ceil(slices[slices.length - 1].scrollTop + slices[slices.length - 1].cssH);
  const cssW = slices[0].cssW;
  let outB64 = null;
  try {
    outB64 = await page.evaluate(
      async ({ slices, cssW, totalH }) => {
        const canvas = document.createElement('canvas');
        canvas.width = cssW;
        canvas.height = Math.min(totalH, 32000);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const s of slices) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = `data:image/png;base64,${s.b64}`;
          });
          ctx.drawImage(img, 0, s.scrollTop, s.cssW, s.cssH);
        }
        return canvas.toDataURL('image/png').split(',')[1];
      },
      { slices, cssW, totalH },
    );
  } catch (e) {
    console.log(`[shot] yuanbao canvas stitch failed: ${(e && e.message) || e}`);
    return null;
  }

  if (!outB64) return null;
  const out = Buffer.from(outB64, 'base64');
  log(
    'info',
    `截图选择器：${ready.sel}（滚动拼接 ${slices.length} 片 → ${cssW}×${totalH}）`,
  );
  console.log(
    `[shot] platform=yuanbao mode=stitch-canvas slices=${slices.length} size=${cssW}x${totalH} bytes=${out.length}`,
  );
  return out;
}

/**
 * 截取完整回答（含超长内容）：
 * 按平台锚定「最后一条 AI 回答」卡片，撑开裁剪祖先后再截该元素。
 * 避免误选左侧历史会话栏（DeepSeek / 文心常见问题）。
 * @param {import('playwright').Page} page
 * @param {{ platform?: string, log?: Function }} [opts]
 */
async function captureConversationScreenshot(page, opts = {}) {
  await page.bringToFront().catch(() => {});
  const platform = String(opts.platform || '');

  // 豆包：虚拟列表只能滚动拼接。禁止回退 expand-height（会截出「首屏 + 大片白」）
  if (platform === 'doubao') {
    try {
      const stitched = await captureDoubaoConversationStitch(page, opts);
      if (stitched && stitched.length) return stitched;
      console.log('[shot] doubao stitch returned empty (no expand fallback)');
      if (typeof opts.log === 'function') {
        opts.log('warn', '豆包滚动拼接未产出图片（已禁止撑高回退）');
      }
    } catch (e) {
      console.log(`[shot] doubao stitch failed: ${(e && e.message) || e}`);
      if (typeof opts.log === 'function') {
        opts.log('warn', `豆包滚动拼接失败：${(e && e.message) || e}`);
      }
    }
    return null;
  }

  // 元宝：content-wrapper 可滚，expand 只会首屏+白；强制滚动拼接
  if (platform === 'yuanbao') {
    try {
      const stitched = await captureYuanbaoConversationStitch(page, opts);
      if (stitched && stitched.length) return stitched;
      console.log('[shot] yuanbao stitch returned empty (no expand fallback)');
      if (typeof opts.log === 'function') {
        opts.log('warn', '元宝滚动拼接未产出图片（已禁止撑高回退）');
      }
    } catch (e) {
      console.log(`[shot] yuanbao stitch failed: ${(e && e.message) || e}`);
      if (typeof opts.log === 'function') {
        opts.log('warn', `元宝滚动拼接失败：${(e && e.message) || e}`);
      }
    }
    return null;
  }

  await page.evaluate(platformKey => {
    const isEl = n => n instanceof HTMLElement;
    const isVisible = el => {
      if (!isEl(el)) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const textLen = el => ((el && (el.innerText || el.textContent)) || '').replace(/\s+/g, '').length;

    /** 侧栏/历史：窄且贴左，或 class 暗示 */
    const looksLikeSidebar = el => {
      if (!isEl(el)) return true;
      const r = el.getBoundingClientRect();
      const cls = String(el.className || '');
      if (/sidebar|side-bar|aside|history|session-list|conv-list|nav-list/i.test(cls)) return true;
      if (r.width > 0 && r.width < 380 && r.left < 80 && r.height > 200) return true;
      return false;
    };

    const answerSelectorsByPlatform = {
      deepseek: ['.ds-markdown', '[class*="ds-markdown"]'],
      wenxin: [
        '.chat-qa-container',
        '.cosd-markdown-content',
        '[class*="cosd-markdown-content"]',
        '[class*="answerBox"] [class*="markdown"]',
        '[data-module="answer"]',
        '[class*="md-content"]',
      ],
      doubao: [
        '.flow-markdown-body',
        '.md-box-root',
        '[class*="md-box-root"]',
        '[data-testid="message_text_content"]',
      ],
      qianwen: ['.response-message-content.phase-answer', '[class*="phase-answer"]', '[class*="markdown"]'],
      yuanbao: [
        '[class*="agent-chat__list__item--ai"]',
        '.hyc-content-md',
        '[class*="hyc-content-md"]',
        '[class*="hyc-common-markdown"]',
        '[class*="agent-chat__speech-text"]',
        '[class*="hyc-content"]',
      ],
    };

    const bubbleClimbSelectors = {
      deepseek: ['.ds-message', '[class*="ds-message"]'],
      wenxin: [
        '.chat-qa-container',
        '[class*="answerBox"]',
        '[class*="answer-box"]',
        '[class*="ai-message"]',
        '[class*="dialogue"]',
        '[data-module="answer"]',
      ],
      doubao: [
        'div[data-page-search-scope="conversation"]',
        '[data-testid="receive_message"]',
        '[data-testid="union_message"]',
        '[class*="receive-message"]',
        '[class*="message-block"]',
      ],
      qianwen: ['[class*="response-message"]', '[class*="chat-item"]', '[class*="message-item"]'],
      yuanbao: [
        '.agent-chat__list__content-wrapper',
        '[class*="agent-chat__list__content-wrapper"]',
        '.agent-dialogue__content--common__content',
        '[class*="agent-chat__list__item"]',
        '[class*="agent-chat__conv--ai"]',
      ],
    };

    const genericAnswerSels = [
      '.ds-markdown',
      '[class*="ds-markdown"]',
      '.cosd-markdown-content',
      '[class*="cosd-markdown-content"]',
      '[data-testid="message_text_content"]',
      '.flow-markdown-body',
      '[class*="phase-answer"]',
      '[class*="markdown-body"]',
      '[class*="markdown"]',
    ];

    const ansSels = answerSelectorsByPlatform[platformKey] || genericAnswerSels;
    const bubbleSels = bubbleClimbSelectors[platformKey] || [];

    let shotSelector = '';

    // 收集候选回答节点：可见、非侧栏、有足够正文
    const tips = [];
    for (const sel of ansSels) {
      for (const el of Array.from(document.querySelectorAll(sel)).filter(isVisible)) {
        if (looksLikeSidebar(el)) continue;
        // 豆包/通用：信源列表面板里的链接文字很长，绝不能当回答正文
        if (
          el.closest('[data-plugin-identifier*="search_query_result"]') ||
          el.closest('[data-plugin-identifier*="search"]') ||
          el.closest('[class*="search_query_result"]') ||
          el.closest('[class*="SearchResultList"]') ||
          el.closest('[class*="source-list"]')
        ) {
          continue;
        }
        const n = textLen(el);
        if (n < 20) continue;
        // 只要最外层（去掉被更大 markdown 包裹的叶子）
        tips.push({ el, n, y: el.getBoundingClientRect().y, sel });
      }
    }
    // 去重：被其它候选包含的去掉
    const outers = tips.filter(
      a => !tips.some(b => b.el !== a.el && b.el.contains(a.el))
    );

    let tip = null;
    if (outers.length) {
      outers.sort((a, b) => a.y - b.y);
      tip = outers[outers.length - 1];
      const longest = outers.reduce((a, b) => (a.n >= b.n ? a : b));
      if (tip !== longest && (tip.n < 120 || tip.n < longest.n * 0.45)) tip = longest;
    }

    // 上溯到消息气泡
    let card = tip ? tip.el : null;
    if (tip) {
      // DeepSeek：只截最后一条 AI 消息气泡，排除底部输入框；对话区先滚到底
      if (platformKey === 'deepseek') {
        const bubble =
          tip.el.closest('.ds-message, [class*="ds-message"]') || tip.el;
        card = bubble;

        const isComposer = el => {
          if (!isEl(el)) return false;
          if (el.matches?.('#chat-input, textarea, [class*="chat-input"], [class*="ChatInput"]')) return true;
          if (el.querySelector?.('#chat-input, textarea#chat-input, textarea[data-testid="chat-input"]')) return true;
          const cls = String(el.className || '');
          if (/composer|input-area|input-box|chat-input|footer-input/i.test(cls)) return true;
          return false;
        };

        // 找主对话滚动容器（含消息、不含侧栏），滚到底部
        let scroller = null;
        let cur = bubble.parentElement;
        while (cur && cur !== document.body) {
          if (!looksLikeSidebar(cur) && cur.scrollHeight > cur.clientHeight + 80) {
            const r = cur.getBoundingClientRect();
            if (r.width >= 420 && bubble && cur.contains(bubble) && !isComposer(cur)) {
              scroller = cur;
              break;
            }
          }
          cur = cur.parentElement;
        }
        if (!scroller) {
          scroller =
            bubble.closest('[class*="scroll"]') ||
            document.scrollingElement ||
            document.documentElement;
        }
        try {
          scroller.scrollTop = scroller.scrollHeight;
          bubble.scrollIntoView({ block: 'end', inline: 'nearest' });
          // 再滚一次，避免输入框抢占视口后消息被顶走
          scroller.scrollTop = scroller.scrollHeight;
        } catch { /* ignore */ }

        // 若误选了含输入框的父级，强制退回气泡本身
        if (card && isComposer(card)) card = bubble;
      }

      // 豆包：优先截整个会话主栏（data-page-search-scope=conversation）；找不到再回退到 receive 消息气泡
      if (platformKey === 'doubao') {
        const DOUBAO_SCOPE_SEL = 'div[data-page-search-scope="conversation"]';
        const scope = document.querySelector(DOUBAO_SCOPE_SEL);
        if (scope && isVisible(scope) && !looksLikeSidebar(scope)) {
          card = scope;
          shotSelector = DOUBAO_SCOPE_SEL;
          try {
            scope.scrollIntoView({ block: 'start', inline: 'nearest' });
          } catch { /* ignore */ }
        } else if (tip) {
          const md =
            tip.el.closest('.flow-markdown-body, .md-box-root, [class*="md-box-root"]') || tip.el;
          let cur = md;
          let best = md;
          let hitBubbleSel = '';
          for (let i = 0; i < 12 && cur && cur !== document.body; i++) {
            if (looksLikeSidebar(cur)) break;
            if (
              cur.matches?.('[data-plugin-identifier*="search_query_result"]') ||
              cur.closest?.('[data-plugin-identifier*="search_query_result"]') === cur
            ) {
              cur = cur.parentElement;
              continue;
            }
            const hasMd = !!cur.querySelector(
              '.flow-markdown-body, .md-box-root, [class*="md-box-root"]'
            );
            const bubbleMatch = [
              '[data-testid="receive_message"]',
              '[data-testid="union_message"]',
              '[data-testid*="receive_message"]',
              '[class*="receive-message"]',
              '[class*="bg-g-receive-msg-bubble"]',
              '[class*="message-block"]',
            ].find(s => cur.matches?.(s));
            const isBubble = !!bubbleMatch;
            const r = cur.getBoundingClientRect();
            if (
              hasMd &&
              textLen(cur.querySelector('.flow-markdown-body, .md-box-root, [class*="md-box-root"]') || md) >= 40 &&
              r.width >= 360 &&
              r.width < window.innerWidth * 0.96
            ) {
              best = cur;
              if (isBubble) {
                hitBubbleSel = bubbleMatch;
                break;
              }
            }
            cur = cur.parentElement;
          }
          card = best;
          shotSelector = hitBubbleSel
            ? `fallback:${hitBubbleSel}`
            : `fallback:md-climb(tip=${tip.sel || 'unknown'})`;
          try {
            const mdEl = card.querySelector('.flow-markdown-body, .md-box-root, [class*="md-box-root"]') || md;
            mdEl.scrollIntoView({ block: 'start', inline: 'nearest' });
          } catch { /* ignore */ }
        } else {
          shotSelector = 'doubao:no-scope-no-tip';
        }
      }

      // 文心：优先截 .chat-qa-container（整段问答区）；找不到再上溯包住信源+回答
      if (platformKey === 'wenxin') {
        const WENXIN_SCOPE_SEL = '.chat-qa-container';
        const scope =
          (tip && tip.el.closest?.(WENXIN_SCOPE_SEL)) ||
          Array.from(document.querySelectorAll(WENXIN_SCOPE_SEL))
            .filter(el => isVisible(el) && !looksLikeSidebar(el))
            .sort((a, b) => b.getBoundingClientRect().y - a.getBoundingClientRect().y)[0] ||
          null;
        if (scope && isVisible(scope) && !looksLikeSidebar(scope)) {
          card = scope;
          shotSelector = WENXIN_SCOPE_SEL;
          try {
            scope.scrollIntoView({ block: 'start', inline: 'nearest' });
          } catch { /* ignore */ }
        } else {
        const vis = el => {
          if (!isEl(el)) return false;
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
          const r = el.getBoundingClientRect();
          return r.width > 8 && r.height > 8;
        };
        let cur = tip.el;
        for (let i = 0; i < 16 && cur && cur !== document.body; i++) {
          if (looksLikeSidebar(cur)) break;
          const hasAns = !!cur.querySelector(
            '.cosd-markdown-content, [class*="cosd-markdown-content"], [class*="answerBox"] [class*="markdown"]'
          );
          const refNodes = Array.from(
            cur.querySelectorAll(
              [
                '[class*="_reference-item_"]',
                '[class*="reference-item"]',
                '[class*="sourceContainer"] [class*="item"]',
                '[class*="source-item"]',
                '[class*="reference-list"] a',
              ].join(',')
            )
          ).filter(vis);
          const hasRefHeader = !!Array.from(
            cur.querySelectorAll('[class*="_could-expand_"], [class*="_main-header_"], span, div')
          ).find(el => {
            if (!vis(el)) return false;
            const t = (el.textContent || '').replace(/\s+/g, '');
            return /^共参考\d+篇资料$/.test(t) || (/共参考\d+篇资料/.test(t) && t.length < 24);
          });
          // 优先：可见信源条目 + 回答；否则至少标题 + 回答（展开失败时仍尽量完整截回答）
          if (hasAns && (refNodes.length >= 2 || hasRefHeader) && isVisible(cur)) {
            const r = cur.getBoundingClientRect();
            if (r.width >= 360 && r.width < window.innerWidth * 0.96) {
              // 有可见信源时立刻采用；仅有标题则继续上溯找更大容器
              if (refNodes.length >= 2) {
                card = cur;
                break;
              }
              card = cur;
            }
          }
          cur = cur.parentElement;
        }
        }
      }

      // 元宝：严格锚定消息列表内容区，禁止爬到带输入框的 dialogue 大壳
      if (platformKey === 'yuanbao') {
        const YUANBAO_SCOPE_SELS = [
          '.agent-chat__list__content-wrapper',
          '[class*="agent-chat__list__content-wrapper"]',
          '.agent-dialogue__content--common__content',
        ];
        const hasComposer = el =>
          !!(
            el &&
            el.querySelector?.(
              [
                '.agent-dialogue__content--common__input',
                '.agent-chat__input-box',
                '[class*="agent-chat__input"]',
                '[class*="new-framework-input"]',
                '.ql-editor',
                'textarea',
                '[contenteditable="true"]',
              ].join(','),
            )
          );
        const pickScope = () => {
          for (const sel of YUANBAO_SCOPE_SELS) {
            const fromTip = tip && tip.el.closest?.(sel);
            if (fromTip && isVisible(fromTip) && !looksLikeSidebar(fromTip) && !hasComposer(fromTip)) {
              return { el: fromTip, sel };
            }
            const list = Array.from(document.querySelectorAll(sel)).filter(
              el => isVisible(el) && !looksLikeSidebar(el) && !hasComposer(el),
            );
            if (!list.length) continue;
            list.sort((a, b) => b.getBoundingClientRect().y - a.getBoundingClientRect().y);
            // 优先包含 tip / 有 markdown 的
            const withTip = tip ? list.find(el => el.contains(tip.el)) : null;
            const withMd = list.find(el =>
              el.querySelector(
                '.hyc-content-md, [class*="hyc-content-md"], [class*="hyc-common-markdown"], [class*="agent-chat__list__item--ai"]',
              ),
            );
            const chosen = withTip || withMd || list[0];
            if (chosen) return { el: chosen, sel };
          }
          return null;
        };
        const hit = pickScope();
        if (hit) {
          card = hit.el;
          shotSelector = hit.sel;
          try {
            hit.el.scrollIntoView({ block: 'start', inline: 'nearest' });
          } catch { /* ignore */ }
        }
      }

      if (
        platformKey !== 'deepseek' &&
        platformKey !== 'doubao' &&
        platformKey !== 'yuanbao' &&
        (!card || card === tip.el)
      ) {
        for (const sel of bubbleSels) {
          const hit = tip.el.closest(sel);
          if (hit && isEl(hit) && !looksLikeSidebar(hit)) {
            card = hit;
            break;
          }
        }
      }
      if (
        platformKey !== 'deepseek' &&
        platformKey !== 'doubao' &&
        platformKey !== 'yuanbao' &&
        card === tip.el
      ) {
        let cur = tip.el.parentElement;
        for (let i = 0; i < 8 && cur && cur !== document.body; i++) {
          if (looksLikeSidebar(cur)) break;
          const r = cur.getBoundingClientRect();
          if (r.width >= 420 && r.width < window.innerWidth * 0.96 && textLen(cur) >= tip.n) {
            card = cur;
            if (r.height >= tip.el.getBoundingClientRect().height * 0.9) break;
          }
          cur = cur.parentElement;
        }
      }
    }

    let target = card;
    if (!target && platformKey === 'wenxin') {
      const scopes = Array.from(document.querySelectorAll('.chat-qa-container')).filter(
        el => isVisible(el) && !looksLikeSidebar(el),
      );
      if (scopes.length) {
        scopes.sort((a, b) => b.getBoundingClientRect().y - a.getBoundingClientRect().y);
        target = scopes[0];
        shotSelector = '.chat-qa-container';
      }
    }
    if (!target && platformKey === 'yuanbao') {
      const YUANBAO_SCOPE_SELS = [
        '.agent-chat__list__content-wrapper',
        '[class*="agent-chat__list__content-wrapper"]',
        '.agent-dialogue__content--common__content',
      ];
      for (const sel of YUANBAO_SCOPE_SELS) {
        const scopes = Array.from(document.querySelectorAll(sel)).filter(el => {
          if (!isVisible(el) || looksLikeSidebar(el)) return false;
          if (
            el.querySelector?.(
              '.agent-dialogue__content--common__input, .agent-chat__input-box, .ql-editor, [contenteditable="true"]',
            )
          ) {
            return false;
          }
          return true;
        });
        if (!scopes.length) continue;
        scopes.sort((a, b) => b.getBoundingClientRect().y - a.getBoundingClientRect().y);
        target = scopes[0];
        shotSelector = sel;
        break;
      }
    }
    if (!target) {
      let best = null;
      let bestScore = 0;
      for (const el of document.querySelectorAll('div, main, section, article')) {
        if (!isVisible(el) || looksLikeSidebar(el)) continue;
        const dy = el.scrollHeight - el.clientHeight;
        if (dy < 80) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 420) continue;
        const hasMd = !!el.querySelector(
          '.ds-markdown, [class*="ds-markdown"], .cosd-markdown-content, [class*="markdown"]'
        );
        const score = el.scrollHeight + (hasMd ? 50000 : 0) + r.width * 5;
        if (score > bestScore) {
          best = el;
          bestScore = score;
        }
      }
      target = best || document.documentElement;
    }

    try {
      if (platformKey === 'deepseek') {
        // 已在上方滚到底；保持消息贴底，避免再滚回顶部把输入框带进构图
        target.scrollIntoView({ block: 'end', inline: 'nearest' });
      } else {
        target.scrollIntoView({ block: 'start', inline: 'nearest' });
      }
    } catch { /* ignore */ }

    // DeepSeek：截图目标不得包含输入框
    if (
      platformKey === 'deepseek' &&
      target &&
      target.querySelector &&
      target.querySelector('#chat-input, textarea#chat-input, textarea[data-testid="chat-input"]')
    ) {
      const bubble = target.querySelector('.ds-message .ds-markdown, [class*="ds-message"] .ds-markdown');
      const msg = bubble && bubble.closest('.ds-message, [class*="ds-message"]');
      if (msg) target = msg;
    }

    const patched = [];
    const seen = new Set();
    const patch = el => {
      if (!isEl(el) || el === document.documentElement || seen.has(el)) return;
      const cs = getComputedStyle(el);
      const needs =
        el === target ||
        el.scrollHeight > el.clientHeight + 10 ||
        /auto|scroll|hidden/.test(cs.overflowY) ||
        /auto|scroll|hidden/.test(cs.overflow) ||
        (cs.maxHeight && cs.maxHeight !== 'none' && cs.maxHeight !== '0px');
      if (!needs) return;
      seen.add(el);
      patched.push({
        el,
        overflow: el.style.overflow,
        overflowY: el.style.overflowY,
        overflowX: el.style.overflowX,
        height: el.style.height,
        maxHeight: el.style.maxHeight,
        minHeight: el.style.minHeight,
      });
      el.style.overflow = 'visible';
      el.style.overflowY = 'visible';
      el.style.overflowX = 'visible';
      el.style.maxHeight = 'none';
    };

    const applyHeights = () => {
      // 多轮：子节点撑开后再更新祖先高度
      for (let round = 0; round < 4; round++) {
        for (const p of patched) {
          const h = Math.max(p.el.scrollHeight, p.el.clientHeight, p.el.offsetHeight || 0);
          p.el.style.height = `${h}px`;
          p.el.style.minHeight = `${h}px`;
        }
      }
    };

    // DeepSeek：只撑开消息气泡内部，不要改祖先（祖先一撑容易把整页/输入区卷进来）
    // 豆包会话主栏：容器常为视口高、下方空白，禁止把 height 撑到 scrollHeight（否则截出大片白）
    const doubaoScope =
      platformKey === 'doubao' &&
      target &&
      target.matches?.('div[data-page-search-scope="conversation"]');
    if (platformKey === 'deepseek') {
      patch(target);
      if (target && target.querySelectorAll) {
        target.querySelectorAll('div, section, article').forEach(patch);
      }
      applyHeights();
    } else if (doubaoScope) {
      /** 找出会话主栏内真正滚动的节点 */
      const findScrollers = root => {
        const list = [];
        const add = el => {
          if (!isEl(el) || list.includes(el)) return;
          const cs = getComputedStyle(el);
          const oy = cs.overflowY || cs.overflow;
          if ((/auto|scroll/.test(oy) && el.scrollHeight > el.clientHeight + 8) || el.scrollHeight > el.clientHeight + 40) {
            list.push(el);
          }
        };
        add(root);
        root.querySelectorAll('div, section, main, article').forEach(add);
        list.sort((a, b) => b.scrollHeight - a.scrollHeight);
        return list;
      };

      const contentSel = [
        '[data-testid="receive_message"]',
        '[data-testid="union_message"]',
        '[data-testid="send_message"]',
        '[data-testid="message_text_content"]',
        '.flow-markdown-body',
        '.md-box-root',
        '[class*="md-box-root"]',
        '[class*="receive-message"]',
        '[class*="message-block"]',
        'img',
        'video',
        'canvas',
        'pre',
        'table',
        'p',
        'li',
        'h1',
        'h2',
        'h3',
      ].join(',');

      const scrollers = findScrollers(target);
      const pickScrollEl = () => {
        const nodes = Array.from(target.querySelectorAll(contentSel));
        for (const s of scrollers) {
          if (nodes.some(n => s.contains(n))) return s;
        }
        return scrollers[0] || target;
      };

      // 1) 滚到底，尽量触发懒渲染
      for (const s of scrollers) {
        try {
          s.scrollTop = s.scrollHeight;
        } catch { /* ignore */ }
      }
      try {
        target.scrollTop = target.scrollHeight;
      } catch { /* ignore */ }

      let scrollEl = pickScrollEl();
      // 用于「撑开」的高度：至少盖住可滚动区域
      const expandH = Math.max(
        scrollEl.scrollHeight || 0,
        target.scrollHeight || 0,
        Math.ceil(scrollEl.getBoundingClientRect().height) + (scrollEl.scrollHeight - scrollEl.clientHeight),
        400,
      );

      try {
        scrollEl.scrollTop = 0;
        target.scrollTop = 0;
      } catch { /* ignore */ }

      const expandTo = (el, h) => {
        if (!isEl(el) || seen.has(el)) return;
        seen.add(el);
        patched.push({
          el,
          overflow: el.style.overflow,
          overflowY: el.style.overflowY,
          overflowX: el.style.overflowX,
          height: el.style.height,
          maxHeight: el.style.maxHeight,
          minHeight: el.style.minHeight,
        });
        el.style.overflow = 'visible';
        el.style.overflowY = 'visible';
        el.style.overflowX = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = `${h}px`;
        el.style.minHeight = `${h}px`;
      };

      expandTo(scrollEl, expandH);
      if (scrollEl !== target) expandTo(target, expandH);
      let cur = target.parentElement;
      for (let i = 0; i < 8 && cur && cur !== document.body; i++) {
        if (seen.has(cur)) {
          cur = cur.parentElement;
          continue;
        }
        const cs = getComputedStyle(cur);
        if (/auto|scroll|hidden/.test(cs.overflowY) || /auto|scroll|hidden/.test(cs.overflow) || (cs.maxHeight && cs.maxHeight !== 'none')) {
          seen.add(cur);
          patched.push({
            el: cur,
            overflow: cur.style.overflow,
            overflowY: cur.style.overflowY,
            overflowX: cur.style.overflowX,
            height: cur.style.height,
            maxHeight: cur.style.maxHeight,
            minHeight: cur.style.minHeight,
          });
          cur.style.overflow = 'visible';
          cur.style.overflowY = 'visible';
          cur.style.maxHeight = 'none';
        }
        cur = cur.parentElement;
      }

      // 强制重排后再量内容底
      void target.offsetHeight;
      void scrollEl.offsetHeight;

      // 2) 撑开后再量「真实内容底」（视口坐标，不再依赖 scrollHeight，避免 flex 空白）
      const tightContentH = () => {
        const rootR = target.getBoundingClientRect();
        let maxBottom = rootR.top;
        const push = node => {
          if (!(node instanceof HTMLElement)) return;
          const st = getComputedStyle(node);
          if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return;
          const br = node.getBoundingClientRect();
          if (br.width < 2 || br.height < 2) return;
          const text = (node.innerText || '').replace(/\s+/g, '');
          const meaningful =
            text.length > 0 ||
            node.matches?.('img, video, canvas, svg, table, pre') ||
            !!node.getAttribute?.('data-testid');
          if (meaningful) maxBottom = Math.max(maxBottom, br.bottom);
        };
        target.querySelectorAll(contentSel).forEach(push);
        if (maxBottom <= rootR.top + 40) {
          target.querySelectorAll('div, section, article, span').forEach(n => {
            const t = (n.innerText || '').replace(/\s+/g, '');
            if (t.length >= 12) push(n);
          });
        }
        return Math.max(40, Math.ceil(maxBottom - rootR.top + 16));
      };

      let contentH = tightContentH();
      if (contentH < 80) contentH = expandH;

      if (contentH > 40 && contentH < expandH) {
        scrollEl.style.height = `${contentH}px`;
        scrollEl.style.minHeight = `${contentH}px`;
        if (scrollEl !== target) {
          target.style.height = `${contentH}px`;
          target.style.minHeight = `${contentH}px`;
        }
        void target.offsetHeight;
        // 裁完再量一次，防止第一次漏掉底部节点
        const again = tightContentH();
        if (again > contentH + 8) {
          contentH = again;
          scrollEl.style.height = `${contentH}px`;
          scrollEl.style.minHeight = `${contentH}px`;
          if (scrollEl !== target) {
            target.style.height = `${contentH}px`;
            target.style.minHeight = `${contentH}px`;
          }
        }
      }

      window.__geoShotContentHeight = contentH;
      window.__geoShotExpandHeight = expandH;
    } else if (platformKey === 'yuanbao' && target) {
      // 只撑开消息列表本身，绝不改含输入框的祖先（否则裁剪区会叠进底部 composer）
      const contentSel = [
        '[class*="agent-chat__list__item"]',
        '[class*="agent-chat__conv"]',
        '.hyc-content-md',
        '[class*="hyc-content-md"]',
        '[class*="hyc-common-markdown"]',
        '[class*="agent-chat__speech-text"]',
        'img',
        'video',
        'table',
        'pre',
        'p',
        'li',
        'h1',
        'h2',
        'h3',
      ].join(',');

      const expandTo = (el, h) => {
        if (!isEl(el) || seen.has(el)) return;
        seen.add(el);
        patched.push({
          el,
          overflow: el.style.overflow,
          overflowY: el.style.overflowY,
          overflowX: el.style.overflowX,
          height: el.style.height,
          maxHeight: el.style.maxHeight,
          minHeight: el.style.minHeight,
        });
        el.style.overflow = 'visible';
        el.style.overflowY = 'visible';
        el.style.overflowX = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = `${h}px`;
        el.style.minHeight = `${h}px`;
      };

      try {
        target.scrollTop = 0;
      } catch { /* ignore */ }

      const expandH = Math.max(target.scrollHeight || 0, Math.ceil(target.getBoundingClientRect().height), 400);
      expandTo(target, expandH);
      if (target.querySelectorAll) {
        target.querySelectorAll('div, section, article').forEach(el => {
          const cs = getComputedStyle(el);
          if (
            el.scrollHeight > el.clientHeight + 10 ||
            /auto|scroll|hidden/.test(cs.overflowY) ||
            (cs.maxHeight && cs.maxHeight !== 'none')
          ) {
            expandTo(el, Math.max(el.scrollHeight, el.clientHeight));
          }
        });
      }
      void target.offsetHeight;

      const tightContentH = () => {
        const rootR = target.getBoundingClientRect();
        let maxBottom = rootR.top;
        const push = node => {
          if (!(node instanceof HTMLElement)) return;
          const st = getComputedStyle(node);
          if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return;
          const br = node.getBoundingClientRect();
          if (br.width < 2 || br.height < 2) return;
          const text = (node.innerText || '').replace(/\s+/g, '');
          const meaningful =
            text.length > 0 ||
            node.matches?.('img, video, canvas, svg, table, pre') ||
            !!node.getAttribute?.('data-testid');
          if (meaningful) maxBottom = Math.max(maxBottom, br.bottom);
        };
        target.querySelectorAll(contentSel).forEach(push);
        if (maxBottom <= rootR.top + 40) {
          target.querySelectorAll('div, section, article, span').forEach(n => {
            const t = (n.innerText || '').replace(/\s+/g, '');
            if (t.length >= 12) push(n);
          });
        }
        return Math.max(40, Math.ceil(maxBottom - rootR.top + 16));
      };

      let contentH = tightContentH();
      if (contentH < 80) contentH = expandH;
      if (contentH > 40) {
        target.style.height = `${contentH}px`;
        target.style.minHeight = `${contentH}px`;
        void target.offsetHeight;
        const again = tightContentH();
        if (again > contentH + 8) {
          contentH = again;
          target.style.height = `${contentH}px`;
          target.style.minHeight = `${contentH}px`;
        }
      }
      window.__geoShotContentHeight = contentH;
      window.__geoShotExpandHeight = expandH;
    } else {
      let cur2 = target;
      while (cur2 && cur2 !== document.documentElement) {
        patch(cur2);
        cur2 = cur2.parentElement;
      }
      if (target && target.querySelectorAll) {
        target.querySelectorAll('div, section, article, main').forEach(patch);
      }
      applyHeights();
    }

    try {
      target.setAttribute('data-geo-shot-target', '1');
    } catch { /* ignore */ }

    window.__geoShotRestore = patched;
    window.__geoShotTarget = target;
    window.__geoShotApplyHeights = applyHeights;
    if (!shotSelector) {
      if (target === document.documentElement) shotSelector = 'documentElement';
      else if (platformKey === 'deepseek') shotSelector = 'deepseek:ds-message';
      else if (platformKey === 'wenxin') shotSelector = shotSelector || 'wenxin:answer-climb';
      else if (platformKey === 'yuanbao') shotSelector = shotSelector || 'yuanbao:item-climb';
      else shotSelector = 'heuristic-scroll-container';
    }
    window.__geoShotSelector = shotSelector;
    try {
      const r = target.getBoundingClientRect();
      window.__geoShotMeta = {
        selector: shotSelector,
        tag: target.tagName || '',
        className: String(target.className || '').slice(0, 120),
        w: Math.round(r.width),
        h: Math.round(window.__geoShotContentHeight || Math.max(r.height, target.scrollHeight || 0)),
        contentH: window.__geoShotContentHeight || null,
      };
    } catch {
      window.__geoShotMeta = { selector: shotSelector };
    }
  }, platform);

  const shotMeta = await page.evaluate(() => window.__geoShotMeta || { selector: window.__geoShotSelector || '?' }).catch(() => ({ selector: '?' }));
  console.log(
    `[shot] platform=${platform || '(unknown)'} selector=${shotMeta.selector}` +
      (shotMeta.tag ? ` tag=${shotMeta.tag}` : '') +
      (shotMeta.w != null ? ` size=${shotMeta.w}x${shotMeta.h}` : '') +
      (shotMeta.contentH != null ? ` contentH=${shotMeta.contentH}` : '') +
      (shotMeta.className ? ` class=${JSON.stringify(shotMeta.className)}` : ''),
  );
  if (typeof opts.log === 'function') {
    opts.log(
      'info',
      `截图选择器：${shotMeta.selector}` +
        (shotMeta.contentH != null
          ? `（内容高 ${shotMeta.contentH}px）`
          : shotMeta.w != null
            ? `（${shotMeta.w}×${shotMeta.h}）`
            : ''),
    );
  }

  await sleep(platform === 'wenxin' ? 400 : 150);
  await page.evaluate(() => {
    try {
      if (typeof window.__geoShotApplyHeights === 'function') window.__geoShotApplyHeights();
    } catch { /* ignore */ }
  }).catch(() => {});
  await sleep(120);

  // 截图前隐藏底部固定输入条 / sticky 浮层，避免滚动拼接把对话框叠进图
  await page.evaluate(() => {
    const hidden = [];
    const hide = (el, { force = false } = {}) => {
      if (!(el instanceof HTMLElement)) return;
      if (el.dataset.geoShotHide === '1') return;
      const target = window.__geoShotTarget;
      if (!force && target && (el === target || target.contains(el) || el.contains(target))) return;
      if (force && target && el === target) return;
      hidden.push({ el, display: el.style.display });
      el.dataset.geoShotHide = '1';
      el.style.display = 'none';
    };

    // 元宝输入条：即使误选了大容器也强制藏掉，避免叠进截图
    for (const sel of [
      '.agent-dialogue__content--common__input',
      '.agent-chat__input-box',
      '[class*="agent-chat__input-box"]',
      '[class*="new-framework-input_searchContent"]',
      '.agent-dialogue__content-copyright',
      '[class*="agent-dialogue__content-copyright"]',
    ]) {
      document.querySelectorAll(sel).forEach(el => hide(el, { force: true }));
    }

    for (const sel of [
      '#chat-input',
      'textarea#chat-input',
      'textarea[data-testid="chat-input"]',
      'textarea[data-testid="chat_input"]',
      'textarea[placeholder*="DeepSeek"]',
      'textarea[placeholder*="发送消息"]',
      'textarea[placeholder*="给 DeepSeek"]',
      // 元宝输入区
      '.agent-dialogue__content--common__input',
      '.agent-chat__input-box',
      '[class*="agent-chat__input-box"]',
      '[class*="new-framework-input"]',
      '.agent-dialogue__content-copyright',
      '[class*="agent-dialogue__content-copyright"]',
    ]) {
      document.querySelectorAll(sel).forEach(el => {
        hide(el);
        let cur = el.parentElement;
        for (let i = 0; i < 8 && cur && cur !== document.body; i++) {
          const r = cur.getBoundingClientRect();
          const cls = String(cur.className || '');
          if (
            r.height > 36 &&
            r.height < 320 &&
            r.width > 240 &&
            (r.bottom > window.innerHeight - 260 ||
              /input|composer|editor|footer|bottom|textarea|chat-input|searchContent|copyright/i.test(cls))
          ) {
            hide(cur);
            break;
          }
          cur = cur.parentElement;
        }
      });
    }

    for (const el of document.querySelectorAll('div, form, section, footer, aside')) {
      if (!(el instanceof HTMLElement)) continue;
      const st = getComputedStyle(el);
      if (st.position !== 'fixed' && st.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 100 || r.height < 28) continue;
      if (r.top > window.innerHeight * 0.5 || r.bottom >= window.innerHeight - 8) {
        if (el.querySelector('textarea, input, [contenteditable="true"]') || r.height < 260) {
          hide(el);
        }
      }
    }

    for (const el of document.querySelectorAll('div, p, span')) {
      if (!(el instanceof HTMLElement)) continue;
      const t = (el.textContent || '').replace(/\s+/g, '');
      if (t === '内容由AI生成，请仔细甄别' || t === '内容由AI生成请仔细甄别') {
        hide(el);
        if (el.parentElement && (el.parentElement.textContent || '').replace(/\s+/g, '').length < 40) {
          hide(el.parentElement);
        }
      }
    }

    window.__geoShotHidden = hidden;
  });

  let buf = null;
  try {
    // CDP 超出视口截完整目标盒：避免 element.screenshot 滚动拼接叠入固定输入框，也避免长回答被裁切
    const box = await page.evaluate(platformKey => {
      const el = window.__geoShotTarget || document.querySelector('[data-geo-shot-target="1"]');
      if (!(el instanceof HTMLElement)) return null;
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.floor(r.x + window.scrollX));
      const y = Math.max(0, Math.floor(r.y + window.scrollY));
      const width = Math.max(1, Math.ceil(Math.max(r.width, el.scrollWidth)));
      let height = Math.max(1, Math.ceil(Math.max(r.height, el.scrollHeight)));

      // 豆包会话主栏：用撑开后的内容高度（含视口外滚动内容），避免只截一屏
      if (
        platformKey === 'doubao' &&
        el.matches?.('div[data-page-search-scope="conversation"]')
      ) {
        const contentH = Number(window.__geoShotContentHeight) || 0;
        if (contentH > 40) {
          // 以内容高为准，不要再用 r.height/scrollHeight 抬高（会带回底部空白）
          height = contentH;
        } else {
          height = Math.max(1, Math.ceil(Math.max(r.height, el.scrollHeight)));
        }
      }

      // 元宝：同样以实测内容高为准，避免 scrollHeight 空白 + 输入栏叠入
      if (platformKey === 'yuanbao') {
        const contentH = Number(window.__geoShotContentHeight) || 0;
        if (contentH > 40) height = contentH;
        else height = Math.max(1, Math.ceil(Math.max(r.height, el.scrollHeight)));
      }

      return { x, y, width, height, contentH: window.__geoShotContentHeight || null };
    }, platform);

    if (box) {
      console.log(`[shot] clip=${box.width}x${box.height} @(${box.x},${box.y}) contentH=${box.contentH}`);
    }

    if (box) {
      const session = await page.context().newCDPSession(page);
      try {
        const width = Math.min(box.width, 4500);
        const height = Math.min(box.height, 32000);
        const result = await session.send('Page.captureScreenshot', {
          format: 'png',
          fromSurface: true,
          captureBeyondViewport: true,
          clip: { x: box.x, y: box.y, width, height, scale: 1 },
        });
        buf = Buffer.from(result.data, 'base64');
      } finally {
        await session.detach().catch(() => {});
      }
    }

    if (!buf || !buf.length) {
      const handle = await page.evaluateHandle(() => window.__geoShotTarget);
      const el = handle.asElement();
      if (el) {
        try {
          buf = await el.screenshot({ type: 'png', animations: 'disabled' });
        } catch {
          buf = null;
        }
      }
      await handle.dispose().catch(() => {});
    }
    if (!buf || !buf.length) {
      buf = await page.screenshot({ type: 'png', fullPage: true, animations: 'disabled' });
    }
  } finally {
    await page.evaluate(() => {
      const hidden = window.__geoShotHidden || [];
      for (const h of hidden) {
        try {
          h.el.style.display = h.display;
          delete h.el.dataset.geoShotHide;
        } catch { /* ignore */ }
      }
      delete window.__geoShotHidden;

      const patched = window.__geoShotRestore || [];
      for (const p of patched) {
        try {
          p.el.style.overflow = p.overflow;
          p.el.style.overflowY = p.overflowY;
          p.el.style.overflowX = p.overflowX;
          p.el.style.height = p.height;
          p.el.style.maxHeight = p.maxHeight;
          p.el.style.minHeight = p.minHeight;
        } catch { /* ignore */ }
      }
      try {
        document.querySelectorAll('[data-geo-shot-target]').forEach(n => n.removeAttribute('data-geo-shot-target'));
      } catch { /* ignore */ }
      delete window.__geoShotRestore;
      delete window.__geoShotTarget;
      delete window.__geoShotApplyHeights;
      delete window.__geoShotSelector;
      delete window.__geoShotMeta;
      delete window.__geoShotContentHeight;
      delete window.__geoShotScrollElTag;
      delete window.__geoShotExpandHeight;
    }).catch(() => {});
  }

  return buf;
}

module.exports = { sleep, findVisibleLocator, extractAnswerHtml, captureConversationScreenshot };
