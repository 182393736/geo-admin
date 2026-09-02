'use strict';
/**
 * 官网抓取（可选步骤）：拿 <title> / meta description / 正文截断，供 LLM 取证
 * 任何失败都降级为空结果、绝不阻断主流程。返回的 text 是「纯文本截断」，不含整页原文。
 */

async function crawlPage(url, { fetchImpl, timeoutMs = 8000, maxChars = 6000 } = {}) {
  const doFetch = fetchImpl || globalThis.fetch;
  const out = { url: url || '', ok: false, title: '', description: '', text: '', error: null };
  if (!url || !String(url).trim()) return out;
  const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const resp = await doFetch(target, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GeoOnboardingBot/1.0; +geo-agent)' },
      redirect: 'follow',
    });
    out.url = target;
    if (!resp.ok) { out.error = `http ${resp.status}`; return out; }
    const html = await resp.text();
    const pick = re => { const m = html.match(re); return m ? decodeEntities(m[1].trim()) : ''; };
    out.title = pick(/<title[^>]*>([^<]{0,200})<\/title>/i);
    out.description = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,300})["']/i)
      || pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{0,300})["']/i);
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ');
    out.text = decodeEntities(body).replace(/\s+/g, ' ').trim().slice(0, maxChars);
    out.ok = true;
  } catch (e) {
    out.error = String((e && e.message) || e).slice(0, 200);
  }
  return out;
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

module.exports = { crawlPage };
