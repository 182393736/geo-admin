'use strict';
/**
 * 开发/测试用内置密钥（私有仓库专用）
 * ------------------------------------------------------------------
 * ⚠️ 这里的 key 仅供本地开发与联调，**上生产前必须替换为环境变量注入**。
 * 优先级：显式入参 > 环境变量 > 本文件内置值。
 * 生产部署只需在环境里设置 SILICONFLOW_API_KEY / TAVILY_API_KEY，即可自动覆盖。
 *
 * 想临时禁用内置值（例如跑"未配置密钥时降级"的契约测试）：
 *   GEO_DISABLE_DEV_KEYS=1
 */

const DEV_KEYS = {
  SILICONFLOW_API_KEY: 'sk-vmdlmwnfurvrfvjuqcsisskczmfovyfihngaouocaqbhjole',
  SILICONFLOW_BASE_URL: 'https://api.siliconflow.cn/v1',
  SILICONFLOW_MODEL: 'deepseek-ai/DeepSeek-V4-Flash',
  TAVILY_API_KEY: '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',
  // Agnes AI（测试用 key，生产环境用 AGNES_API_KEY 环境变量覆盖）
  AGNES_API_KEY: 'sk-jMCSPHx7y8WRCltlLg187HomxaXCkG5YAMDtQ4hEDCJwQfir',
  AGNES_BASE_URL: 'https://apihub.agnes-ai.com/v1',
  AGNES_MODEL: 'agnes-3.0-flash',
  // Mistral（ministral-3b-2512，多 key 轮询避速率限制；生产用 MISTRAL_API_KEYS 环境变量覆盖，
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
};

function devKeysEnabled() {
  return !/^(1|true|yes)$/i.test(String(process.env.GEO_DISABLE_DEV_KEYS || ''));
}

/**
 * 解析一个密钥/配置项：显式入参 > 环境变量 > 内置开发值
 * @param {string} name  DEV_KEYS 中的键名，同时也是环境变量名
 * @param {string} [explicit] 调用方显式传入的值（空串/undefined 视为未传）
 */
function resolveKey(name, explicit) {
  if (explicit) return explicit;
  if (process.env[name]) return process.env[name];
  return devKeysEnabled() ? DEV_KEYS[name] || '' : '';
}

/**
 * 解析一组密钥（多 key 轮询用）：显式入参 > 环境变量 > 内置开发值。
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
  const dev = devKeysEnabled() ? DEV_KEYS[name] : null;
  if (Array.isArray(dev)) return dev.filter(Boolean);
  return dev ? [dev] : [];
}

module.exports = { DEV_KEYS, resolveKey, resolveKeys, devKeysEnabled };
