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

/** 保存结果 HTML，返回文件绝对路径 */
function saveResult(dir, { ip, platform, platformName, prompt, answer, sources, startedAt }) {
  const finishedAt = fmt(new Date());
  const html = buildResultHtml({
    ip,
    platform,
    platformName,
    prompt,
    answer,
    sources,
    startedAt: startedAt || finishedAt,
    finishedAt
  });
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${platform}-${ts()}.html`);
  fs.writeFileSync(file, html, 'utf8');
  return file;
}

module.exports = { runChat, buildResultHtml, saveResult, RUNNERS };
