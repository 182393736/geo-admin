'use strict';
/**
 * gen-api 采集 worker HTTP 客户端
 *   POST /collector/slots/pull
 *   POST /collector/slots/:slot_id/submit
 * 鉴权：Authorization: Bearer <COLLECTOR_API_KEY> 或 X-Collector-Key
 */
const DEFAULT_BASE = process.env.GEN_API_BASE || process.env.API_URL || 'http://127.0.0.1:7001';
const DEFAULT_KEY =
  process.env.COLLECTOR_API_KEY || 'collector-dev-key-8f3a1c2e9d7b4a5f';

function getConfig() {
  return {
    baseUrl: String(DEFAULT_BASE).replace(/\/$/, ''),
    apiKey: String(DEFAULT_KEY),
  };
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

/** 拉取一条待采集槽位；无任务时 data.slot === null */
async function pullSlot(params = {}) {
  const body = {};
  if (Array.isArray(params.platforms) && params.platforms.length) body.platforms = params.platforms;
  else if (params.platform) body.platform = params.platform;
  if (params.end) body.end = params.end;
  if (params.query_type) body.query_type = params.query_type;
  if (params.date) body.date = params.date;
  return collectorFetch('/collector/slots/pull', { body });
}

/** 提交槽位结果（ok / empty / fail） */
async function submitSlot(slotId, payload) {
  if (!slotId) throw new Error('缺少 slot_id');
  return collectorFetch(`/collector/slots/${encodeURIComponent(slotId)}/submit`, {
    body: payload || {},
  });
}

module.exports = { getConfig, pullSlot, submitSlot };
