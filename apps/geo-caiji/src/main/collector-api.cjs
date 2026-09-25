'use strict';
/**
 * geo-api 采集 worker HTTP 客户端
 *   POST /collector/slots/pull
 *   POST /collector/slots/:slot_id/submit
 * 鉴权：Authorization: Bearer <COLLECTOR_API_KEY> 或 X-Collector-Key
 *
 * 支持运行时切换 API 目标（本地 / 测试 / 生产），选择持久化到 userData。
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const TARGETS = {
  local: {
    id: 'local',
    label: '本地',
    baseUrl: process.env.GEO_API_BASE_LOCAL || 'http://127.0.0.1:6001',
  },
  test: {
    id: 'test',
    label: '测试服务器',
    baseUrl: process.env.GEO_API_BASE_TEST || 'https://test-geo-api.hanyuai.com',
  },
  prod: {
    id: 'prod',
    label: '生产服务器',
    baseUrl: process.env.GEO_API_BASE_PROD || 'https://geo-api.hanyuai.com',
  },
};

const DEFAULT_KEY =
  process.env.COLLECTOR_API_KEY || 'change-me-collector-key';

/** @type {'local'|'test'|'prod'} */
let currentTargetId = 'local';
let persistPath = '';

function listTargets() {
  return Object.values(TARGETS).map(t => ({
    id: t.id,
    label: t.label,
    baseUrl: String(t.baseUrl).replace(/\/$/, ''),
  }));
}

function getPersistPath(userDataDir) {
  if (userDataDir) persistPath = path.join(userDataDir, 'collector-api-target.json');
  return persistPath;
}

function loadTarget(userDataDir) {
  getPersistPath(userDataDir);
  // 环境变量 GEO_API_BASE 仍可强制覆盖默认，但 UI 切换优先于文件
  const envForce = String(process.env.GEO_API_BASE || process.env.API_URL || '').trim();
  if (envForce && !persistPath) {
    // 仅首次无 userData 时用 env；有持久化文件以文件为准
  }
  try {
    if (persistPath && fs.existsSync(persistPath)) {
      const raw = JSON.parse(fs.readFileSync(persistPath, 'utf8'));
      const id = String(raw && raw.targetId || '').trim();
      if (TARGETS[id]) {
        currentTargetId = id;
        return getConfig();
      }
    }
  } catch { /* ignore */ }
  // 无持久化时：按 GEO_API_BASE 推断默认目标
  if (/test-geo-api\.hanyuai\.com/i.test(envForce)) currentTargetId = 'test';
  else if (/^https?:\/\/geo-api\.hanyuai\.com/i.test(envForce)) currentTargetId = 'prod';
  else if (envForce && /127\.0\.0\.1|localhost/i.test(envForce)) currentTargetId = 'local';
  return getConfig();
}

function saveTarget(targetId) {
  if (!TARGETS[targetId]) throw new Error(`未知 API 目标: ${targetId}`);
  currentTargetId = targetId;
  if (persistPath) {
    try {
      fs.writeFileSync(
        persistPath,
        JSON.stringify({ targetId, baseUrl: TARGETS[targetId].baseUrl, updatedAt: new Date().toISOString() }, null, 2),
        'utf8',
      );
    } catch { /* ignore */ }
  }
  return getConfig();
}

function setTarget(targetId) {
  return saveTarget(targetId);
}

function getConfig() {
  const t = TARGETS[currentTargetId] || TARGETS.local;
  return {
    targetId: t.id,
    label: t.label,
    baseUrl: String(t.baseUrl).replace(/\/$/, ''),
    apiKey: String(DEFAULT_KEY),
  };
}

function getMachineName() {
  return String(os.hostname() || '').trim() || 'unknown';
}

async function collectorFetch(pathname, { method = 'POST', body } = {}) {
  const { baseUrl, apiKey } = getConfig();
  const url = `${baseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  const resp = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-Collector-Key': apiKey,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await resp.json();
  } catch {
    json = null;
  }
  if (!resp.ok) {
    const msg = (json && (json.msg || json.message)) || `HTTP ${resp.status}`;
    const err = new Error(msg);
    err.status = resp.status;
    err.body = json;
    throw err;
  }
  if (json && typeof json.code === 'number' && json.code !== 200) {
    const err = new Error(json.msg || `业务错误 code=${json.code}`);
    err.status = json.code;
    err.body = json;
    throw err;
  }
  return json && Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json;
}

/** 拉取一条待采集槽位；无任务时 data.slot === null；超日限抛 status=429 / error_code=DAILY_LIMIT */
async function pullSlot(params = {}) {
  const body = {};
  if (Array.isArray(params.platforms) && params.platforms.length) body.platforms = params.platforms;
  else if (params.platform) body.platform = params.platform;
  if (params.end) body.end = params.end;
  if (params.query_type) body.query_type = params.query_type;
  if (params.date) body.date = params.date;
  if (params.ip) body.ip = params.ip;
  if (params.machine_name) body.machine_name = params.machine_name;
  else body.machine_name = getMachineName();
  if (params.port != null && params.port !== '') body.port = params.port;
  return collectorFetch('/collector/slots/pull', { body });
}

/** 提交槽位结果（ok / empty / fail）；自动附带 machine_name，可另传 ip/port */
async function submitSlot(slotId, payload) {
  if (!slotId) throw new Error('缺少 slot_id');
  const body = { ...(payload || {}) };
  if (!body.machine_name) body.machine_name = getMachineName();
  return collectorFetch(`/collector/slots/${encodeURIComponent(slotId)}/submit`, {
    body,
  });
}

module.exports = {
  TARGETS,
  listTargets,
  loadTarget,
  setTarget,
  getConfig,
  getMachineName,
  pullSlot,
  submitSlot,
};
