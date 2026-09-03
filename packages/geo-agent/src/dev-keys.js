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

module.exports = { DEV_KEYS, resolveKey, devKeysEnabled };
