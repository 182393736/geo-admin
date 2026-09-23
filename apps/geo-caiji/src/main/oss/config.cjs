'use strict';
/**
 * OSS 配置：环境变量优先，其次 apps/geo-caiji/oss.local.json（勿提交密钥）。
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..'); // apps/geo-caiji
const LOCAL_FILE = path.join(ROOT, 'oss.local.json');

function readLocalFile() {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return null;
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function getOssConfig() {
  const local = readLocalFile() || {};
  const bucket = String(process.env.OSS_BUCKET || local.bucket || '').trim();
  const region = String(process.env.OSS_REGION || local.region || 'oss-cn-beijing').trim();
  const endpoint = String(process.env.OSS_ENDPOINT || local.endpoint || `${region}.aliyuncs.com`)
    .trim()
    .replace(/^https?:\/\//, '');
  const accessKeyId = String(process.env.OSS_ACCESS_KEY_ID || local.accessKeyId || '').trim();
  const accessKeySecret = String(
    process.env.OSS_ACCESS_KEY_SECRET || local.accessKeySecret || '',
  ).trim();
  const keyPrefix = String(process.env.OSS_KEY_PREFIX || local.keyPrefix || 'screenshots')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  const publicBaseUrl = String(
    process.env.OSS_PUBLIC_BASE_URL ||
      local.publicBaseUrl ||
      (bucket && endpoint ? `https://${bucket}.${endpoint}` : ''),
  )
    .trim()
    .replace(/\/$/, '');

  const enabled = !!(bucket && accessKeyId && accessKeySecret);
  return {
    enabled,
    bucket,
    region,
    endpoint,
    accessKeyId,
    accessKeySecret,
    keyPrefix,
    publicBaseUrl,
    localFile: LOCAL_FILE,
  };
}

module.exports = { getOssConfig, LOCAL_FILE };
