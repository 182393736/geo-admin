'use strict';
/**
 * 对话测试入口：按平台分发 runner；生成并保存结果 HTML。
 */
const path = require('node:path');
const fs = require('node:fs');
const { runConversation: runDeepseek } = require('./deepseek.cjs');
const { runConversation: runDoubao } = require('./doubao.cjs');
const { runConversation: runQianwen } = require('./qianwen.cjs');
const { runConversation: runWenxin } = require('./wenxin.cjs');
const { runConversation: runYuanbao } = require('./yuanbao.cjs');

const RUNNERS = {
  deepseek: runDeepseek,
  doubao: runDoubao,
  qwen: runQianwen,
  wenxin: runWenxin,
  yuanbao: runYuanbao,
};

/** 在指定平台 page 上执行一次对话，返回 { answer, sources } */
async function runChat(page, platform, prompt, log) {
  const runner = RUNNERS[platform];
  if (!runner) throw new Error(`未知平台：${platform}`);
  return runner(page, prompt, log);
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 生成自包含（内联样式）的结果 HTML；优先嵌入 answerHtml 保留原排版 */
function buildResultHtml({ ip, platform, platformName, prompt, answer, answerHtml, sources, startedAt, finishedAt }) {
  const sourceItems = (sources || [])
    .map((s, i) => {
      const index = s.index != null ? s.index : i + 1;
      const title = escapeHtml(s.title || s.url || `来源 ${index}`);
      const url = s.url || '';
      const snippet = escapeHtml(s.snippet || '');
      const siteName = escapeHtml(s.site_name || '');
      const domain = escapeHtml(s.domain || (url ? domainFromUrl(url) : '') || '');
      const publishTime = escapeHtml(s.publish_time || '');
      const linkHtml = url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${title}</a>`
        : `<span>${title}</span>`;
      const metaBits = [
        domain ? `domain: ${domain}` : '',
        siteName ? `site: ${siteName}` : '',
        publishTime ? `time: ${publishTime}` : '',
      ].filter(Boolean);
      const metaLine = metaBits.length
        ? `<div class="meta-line">${metaBits.join(' · ')}</div>`
        : '<div class="meta-line empty-field">domain / site_name / publish_time 为空</div>';
      const urlLine = `<div class="url">${url ? escapeHtml(url) : '<span class="empty-field">(url 空)</span>'}</div>`;
      const snippetLine = snippet
        ? `<div class="snippet">${snippet}</div>`
        : '<div class="snippet empty-field">(snippet 空)</div>';
      return `<li><div class="idx">[${escapeHtml(String(index))}]</div>${linkHtml}${metaLine}${urlLine}${snippetLine}</li>`;
    })
    .join('');

  const rich = !!(answerHtml && String(answerHtml).trim());
  const answerBody = rich
    ? String(answerHtml)
    : escapeHtml(answer || '');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>对话结果 - ${escapeHtml(platformName)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 20px; background: #f4f6fb; color: #1f2430;
         font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif; }
  .card { max-width: 860px; margin: 0 auto 20px; background: #fff; border: 1px solid #e5e7eb;
          border-radius: 10px; padding: 24px 26px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
  .hd { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;
        border-bottom: 1px solid #eef0f4; padding-bottom: 14px; margin-bottom: 18px; }
  .plat { font-size: 16px; font-weight: 700; color: #1f2430; }
  .meta { font-size: 12px; color: #9ca3af; }
  .label { font-size: 12px; color: #6b7280; margin: 0 0 6px; font-weight: 600; letter-spacing: .5px; }
  .question { white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 1.7; }
  .answer { word-break: break-word; font-size: 14px; line-height: 1.8; }
  .answer.plain { white-space: pre-wrap; }
  .answer.rich h1, .answer.rich h2, .answer.rich h3, .answer.rich h4 {
    margin: 1.1em 0 .45em; font-weight: 700; line-height: 1.35; }
  .answer.rich h1 { font-size: 1.35em; } .answer.rich h2 { font-size: 1.2em; }
  .answer.rich h3 { font-size: 1.08em; } .answer.rich h4 { font-size: 1em; }
  .answer.rich p { margin: .55em 0; }
  .answer.rich ul, .answer.rich ol { margin: .55em 0; padding-left: 1.4em; }
  .answer.rich li { margin: .25em 0; }
  .answer.rich blockquote {
    margin: .7em 0; padding: .35em .9em; border-left: 3px solid #d1d5db; color: #4b5563; }
  .answer.rich pre {
    margin: .7em 0; padding: 12px 14px; overflow: auto; background: #f3f4f6;
    border-radius: 8px; font-size: 12.5px; line-height: 1.6; }
  .answer.rich code {
    font-family: "SFMono-Regular", Consolas, Menlo, monospace; font-size: .92em; }
  .answer.rich :not(pre) > code {
    padding: .1em .35em; background: #f3f4f6; border-radius: 4px; }
  .answer.rich table { border-collapse: collapse; width: 100%; margin: .7em 0; font-size: 13px; }
  .answer.rich th, .answer.rich td {
    border: 1px solid #e5e7eb; padding: 6px 10px; vertical-align: top; }
  .answer.rich th { background: #f9fafb; font-weight: 600; }
  .answer.rich img { max-width: 100%; height: auto; }
  .answer.rich a { color: #2563eb; }
  .answer.rich hr { border: 0; border-top: 1px solid #e5e7eb; margin: 1em 0; }
  .sources { list-style: none; margin: 0; padding: 0; }
  .sources li { padding: 10px 12px; border: 1px solid #eef0f4; border-radius: 8px; margin-bottom: 8px; position: relative; }
  .sources .idx { font-size: 12px; color: #6b7280; font-weight: 600; margin-bottom: 4px; }
  .sources a { color: #2563eb; text-decoration: none; font-size: 14px; word-break: break-all; }
  .sources a:hover { text-decoration: underline; }
  .meta-line { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .url { font-size: 12px; color: #9ca3af; margin-top: 3px; word-break: break-all; }
  .snippet { font-size: 12.5px; color: #4b5563; margin-top: 4px; line-height: 1.6; }
  .empty-field { color: #c4c9d2; font-style: italic; }
  .empty { color: #9ca3af; font-size: 13px; }
</style>
</head>
<body>
  <div class="card">
    <div class="hd">
      <span class="plat">${escapeHtml(platformName)}</span>
      <span class="meta">IP ${escapeHtml(ip)} · 开始 ${escapeHtml(startedAt)} · 完成 ${escapeHtml(finishedAt)}</span>
    </div>
    <p class="label">问题</p>
    <div class="question">${escapeHtml(prompt)}</div>
  </div>
  <div class="card">
    <p class="label">回答</p>
    <div class="answer ${rich ? 'rich' : 'plain'}">${answerBody}</div>
  </div>
  <div class="card">
    <p class="label">信源（${(sources || []).length} 条）</p>
    ${sourceItems ? `<ul class="sources">${sourceItems}</ul>` : '<div class="empty">未提取到信源</div>'}
  </div>
</body>
</html>`;
}

function ts() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function fmt(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 统一时间格式：Date 直接格式化；字符串尽量解析成同一格式，解析失败原样返回 */
function fmtTime(v) {
  if (v instanceof Date) return fmt(v);
  if (!v) return '';
  const d = new Date(v);
  if (!isNaN(d.getTime())) return fmt(d);
  return String(v);
}

/** 从 url 推导域名：小写、去 www（与服务端兜底逻辑一致） */
function domainFromUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * 生成「模拟提交后台接口」的结果 JSON（对齐 SubmitAnswerRequest / CitedUrl）
 * cited_urls 每条固定带齐字段：url/title/index/snippet/site_name/domain/publish_time
 * 缺省用空字符串（index 用序号数字）
 */
function buildSubmitJson({ ip, platform, platformName, prompt, answer, sources, startedAt, finishedAt }) {
  const cited = (sources || [])
    .filter(s => s && (s.url || s.title))
    .map((s, i) => {
      const url = String(s.url || '');
      const domain =
        String(s.domain || '').trim().toLowerCase().replace(/^www\./, '') ||
        (url ? domainFromUrl(url) : '');
      return {
        url,
        title: String(s.title || ''),
        index: s.index != null && s.index !== '' ? Number(s.index) : i + 1,
        snippet: String(s.snippet || ''),
        site_name: String(s.site_name || ''),
        domain: domain || '',
        publish_time: String(s.publish_time || ''),
      };
    })
    .filter(s => s.url); // 后台 url 必填
  const hasAnswer = !!(answer && String(answer).trim());
  return {
    status: hasAnswer ? 'ok' : 'empty',
    ...(hasAnswer ? { answer_text: String(answer) } : {}),
    cited_urls: cited,
    model_meta: {
      platform,
      platform_name: platformName,
      ip,
      prompt,
      started_at: startedAt,
      finished_at: finishedAt,
      answer_length: (answer || '').length,
      sources_count: cited.length,
    },
  };
}

/** 生成 JSON 预览页（自包含内联样式，深色 <pre> 展示） */
function buildJsonPreviewHtml(content) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>提交 JSON 预览</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 20px; background: #0f172a; color: #e2e8f0;
         font-family: "JetBrains Mono", "SFMono-Regular", Consolas, Menlo, monospace; }
  .bar { display: flex; justify-content: space-between; align-items: center;
         margin-bottom: 12px; color: #94a3b8; font-size: 12px; }
  pre { margin: 0; padding: 18px; background: #1e293b; border: 1px solid #334155;
        border-radius: 8px; white-space: pre-wrap; word-break: break-word;
        font-size: 12.5px; line-height: 1.7; color: #7dd3fc; }
</style>
</head>
<body>
  <div class="bar"><span>模拟提交 JSON（SubmitAnswerRequest 结构）</span></div>
  <pre>${escapeHtml(content)}</pre>
</body>
</html>`;
}

/** 保存结果：同时写 HTML 与模拟提交 JSON（同时间戳成对），返回 { htmlPath, jsonPath } */
function saveResult(dir, { ip, platform, platformName, prompt, answer, answerHtml, sources, startedAt }) {
  const finishedAt = fmt(new Date());
  const started = fmtTime(startedAt) || finishedAt;
  const html = buildResultHtml({
    ip, platform, platformName, prompt, answer, answerHtml, sources, startedAt: started, finishedAt,
  });
  const json = buildSubmitJson({ ip, platform, platformName, prompt, answer, sources, startedAt: started, finishedAt });
  fs.mkdirSync(dir, { recursive: true });
  const stamp = ts();
  const htmlPath = path.join(dir, `${platform}-${stamp}.html`);
  const jsonPath = path.join(dir, `${platform}-${stamp}.json`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  return { htmlPath, jsonPath };
}

module.exports = { runChat, buildResultHtml, buildSubmitJson, buildJsonPreviewHtml, saveResult, RUNNERS };
