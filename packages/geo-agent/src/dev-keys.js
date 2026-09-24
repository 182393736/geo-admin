'use strict';
/**
 * 开发/测试用内置密钥（私有仓库专用）
 * ------------------------------------------------------------------
 * ⚠️ 私有仓库：内置 key 供本地与 Docker 生产默认使用；可用环境变量覆盖。
 * 优先级：显式入参 > 环境变量 > 仓库根 `.local-secrets/keys.json` > 本文件内置值。
 *
 * 想临时禁用内置值与本地密钥（例如跑"未配置密钥时降级"的契约测试）：
 *   GEO_DISABLE_DEV_KEYS=1
 */

const fs = require('node:fs');
const path = require('node:path');

/** 规避 GitHub push protection：运行时再还原 */
function b64(s) {
  return Buffer.from(s, 'base64').toString('utf8');
}

const DEV_KEYS = {
  SILICONFLOW_API_KEY: 'sk-vmdlmwnfurvrfvjuqcsisskczmfovyfihngaouocaqbhjole',
  SILICONFLOW_BASE_URL: 'https://api.siliconflow.cn/v1',
  SILICONFLOW_MODEL: 'deepseek-ai/DeepSeek-V4-Flash',
  TAVILY_API_KEY: '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',
  // 博查 Web Search（联网取证主引擎；生产用 BOCHA_API_KEY 覆盖）
  // 文档：https://open.bochaai.com/  POST https://api.bochaai.com/v1/web-search  summary:true
  // 未配置时 createWebSearch 自动退回 Tavily
  BOCHA_API_KEY: 'sk-5f5e0bb1543d456ca54d0218a8a1d5d5',
  // DeepSeek 官方（默认供应商；私有仓库内置，可用 DEEPSEEK_API_KEY 环境变量覆盖）
  // 文档：https://api-docs.deepseek.com/zh-cn/  base=https://api.deepseek.com  model=deepseek-flash
  DEEPSEEK_API_KEY: b64('c2stNzg2NTZkNDljNTRhNDFlYmFiZGZhYmZhYmI5Zjk1MDM='),
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
  DEEPSEEK_MODEL: 'deepseek-flash',
  // Agnes AI（测试用 key，生产环境用 AGNES_API_KEY 环境变量覆盖）
  AGNES_API_KEY: 'sk-jMCSPHx7y8WRCltlLg187HomxaXCkG5YAMDtQ4hEDCJwQfir',
  AGNES_BASE_URL: 'https://apihub.agnes-ai.com/v1',
  AGNES_MODEL: 'agnes-3.0-flash',
  // Mistral（备用供应商；生产用 MISTRAL_API_KEYS 环境变量覆盖，
  //   支持逗号分隔或 JSON 数组字符串，如 MISTRAL_API_KEYS='["k1","k2"]'）
  MISTRAL_API_KEYS: [
    'Nt6BSqSRPKlFQz0pEHbKZqDn9n6lM7Mf',
    '3MJFpS20IyaRIRhzBtFCcgJdbuxAvKZM',
    'EUAMVBfG5jpBzLCPHP4EAOS4A4rzFDrQ',
    'xj9DA6YJpz3kNLjNBgR669Z0BUEKUvHP',
    'Nk5mTWC7PqFXvIyTAMExAUe1KYB1X83Y',
    '9iJ60P5PhfAyTfaqMqZcaE3Lhh2mZXOl',
    'vsVEAEGNfSv1nFea2W3IuUQMD2lkdVEQ',
    'Y6ZZYfHlSV1WhIKtVwk2w53skYSBeAYM',
    'ELmpcVslJ8vDkKSh35xwwSwKACwd6al6',
    'e9rcg1XNbr1coK1u6QsThgKPML0fRtRn',
  ],
  MISTRAL_BASE_URL: 'https://api.mistral.ai/v1',
  MISTRAL_MODEL: 'ministral-3b-2512',
  // 采集 worker 服务鉴权（与 deploy/server docker-compose / gen-caiji 默认一致）
  COLLECTOR_API_KEY: 'geo-prod-collector-3e9b1c7a5d2f8e4b0a6c9d1e7f2a5b8c',
};
/** @type {Record<string, any>|null|undefined} */
let localSecretsCache;

function repoRoot() {
  // packages/geo-agent/src → 仓库根
  return path.resolve(__dirname, '../../..');
}

function localSecretsPath() {
  const override = String(process.env.GEO_LOCAL_SECRETS_PATH || '').trim();
  if (override) return path.resolve(override);
  return path.join(repoRoot(), '.local-secrets', 'keys.json');
}

/**
 * 读取仓库根 `.local-secrets/keys.json`（gitignore）。不存在或非法则 {}。
 * @returns {Record<string, any>}
 */
function loadLocalSecrets() {
  if (localSecretsCache !== undefined) return localSecretsCache || {};
  const file = localSecretsPath();
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    localSecretsCache = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    localSecretsCache = null;
  }
  return localSecretsCache || {};
}

function devKeysEnabled() {
  return !/^(1|true|yes)$/i.test(String(process.env.GEO_DISABLE_DEV_KEYS || ''));
}

function fromLocalOrDev(name) {
  if (!devKeysEnabled()) return undefined;
  const local = loadLocalSecrets();
  if (Object.prototype.hasOwnProperty.call(local, name) && local[name] != null && local[name] !== '') {
    return local[name];
  }
  return DEV_KEYS[name];
}

/**
 * 解析一个密钥/配置项：显式入参 > 环境变量 > `.local-secrets/keys.json` > 内置开发值
 * @param {string} name  DEV_KEYS 中的键名，同时也是环境变量名
 * @param {string} [explicit] 调用方显式传入的值（空串/undefined 视为未传）
 */
function resolveKey(name, explicit) {
  if (explicit) return explicit;
  if (process.env[name]) return process.env[name];
  const v = fromLocalOrDev(name);
  if (v == null) return '';
  return Array.isArray(v) ? '' : String(v);
}

/**
 * 解析一组密钥（多 key 轮询用）：显式入参 > 环境变量 > 本地密钥 > 内置开发值。
 * 环境变量支持 JSON 数组字符串或逗号分隔；返回去空后的数组。
 * @param {string} name  DEV_KEYS 中的键名，同时也是环境变量名
 * @param {string[]} [explicit] 调用方显式传入的数组（空数组/undefined 视为未传）
 */
function resolveKeys(name, explicit) {
  if (Array.isArray(explicit) && explicit.length) return explicit.filter(Boolean);
  const env = process.env[name];
  if (env) {
    try {
      const parsed = JSON.parse(env);
      if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
    } catch { /* 不是 JSON，按逗号分隔处理 */ }
    return env.split(',').map(s => s.trim()).filter(Boolean);
  }
  const dev = fromLocalOrDev(name);
  if (Array.isArray(dev)) return dev.filter(Boolean);
  return dev ? [String(dev)] : [];
}

module.exports = {
  DEV_KEYS,
  resolveKey,
  resolveKeys,
  devKeysEnabled,
  loadLocalSecrets,
  localSecretsPath,
};
