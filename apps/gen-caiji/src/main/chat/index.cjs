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

/** 生成自包含（内联样式）的结果 HTML */
function buildResultHtml({ ip, platform, platformName, prompt, answer, sources, startedAt, finishedAt }) {
  const sourceItems = (sources || [])
    .map((s, i) => {
      const title = escapeHtml(s.title || s.url || `来源 ${i + 1}`);
      const url = s.url || '';
      const snippet = escapeHtml(s.snippet || '');
      const linkHtml = url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${title}</a>`
        : `<span>${title}</span>`;
      const urlLine = url ? `<div class="url">${escapeHtml(url)}</div>` : '';
      const snippetLine = snippet ? `<div class="snippet">${snippet}</div>` : '';
      return `<li>${linkHtml}${urlLine}${snippetLine}</li>`;
    })
    .join('');

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
  .answer { white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 1.8; }
  .sources { list-style: none; margin: 0; padding: 0; }
  .sources li { padding: 10px 12px; border: 1px solid #eef0f4; border-radius: 8px; margin-bottom: 8px; }
  .sources a { color: #2563eb; text-decoration: none; font-size: 14px; word-break: break-all; }
  .sources a:hover { text-decoration: underline; }
  .url { font-size: 12px; color: #9ca3af; margin-top: 3px; word-break: break-all; }
  .snippet { font-size: 12.5px; color: #4b5563; margin-top: 4px; line-height: 1.6; }
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
    <div class="answer">${escapeHtml(answer || '')}</div>
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
 * 生成「模拟提交后台接口」的结果 JSON（对齐 SubmitAnswerRequest 结构）
 *   status: ok（有回答）/ empty（无有效回答）
 *   answer_text：回答原文（与信源分离）
 *   cited_urls[]：url 必填；index=正文 [1][2] 角标序号（1 起）；title/snippet/domain 可选
 *   model_meta：引擎/会话元信息（平台、IP、问题、起止时间、长度等）
 */
function buildSubmitJson({ ip, platform, platformName, prompt, answer, sources, startedAt, finishedAt }) {
  // url 为必填：仅保留带链接的信源（与后台 cited_urls 契约一致）
  const cited = (sources || [])
    .filter(s => s && s.url)
    .map((s, i) => {
      const url = String(s.url);
      const domain = domainFromUrl(url);
      const item = { url, index: i + 1 };
      if (s.title) item.title = s.title;
      if (s.snippet) item.snippet = s.snippet;
      if (domain) item.domain = domain;
      return item;
    });
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
      sources_count: (sources || []).length,
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
function saveResult(dir, { ip, platform, platformName, prompt, answer, sources, startedAt }) {
  const finishedAt = fmt(new Date());
  const started = startedAt || finishedAt;
  const html = buildResultHtml({ ip, platform, platformName, prompt, answer, sources, startedAt: started, finishedAt });
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
