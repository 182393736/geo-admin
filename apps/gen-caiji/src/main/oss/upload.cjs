'use strict';
/**
 * 采集端直传阿里云 OSS（覆盖同 key）。
 * 主图：screenshots/{brand_id}/{exec_date}/{platform}/{slot_id}.{ext}
 * 原图：同路径 -raw.png
 */
const fs = require('node:fs');
const path = require('node:path');
const { getOssConfig } = require('./config.cjs');

let OSS = null;
try {
  OSS = require('ali-oss');
} catch {
  OSS = null;
}

function contentTypeForExt(ext) {
  const e = String(ext || '').toLowerCase().replace(/^\./, '');
  if (e === 'webp') return 'image/webp';
  if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
  if (e === 'png') return 'image/png';
  return 'application/octet-stream';
}

function buildShotKeys({ brandId, execDate, platform, slotId, ext }) {
  const cfg = getOssConfig();
  const safe = (v, fallback = '_') =>
    String(v == null || v === '' ? fallback : v)
      .replace(/[\\/]+/g, '_')
      .replace(/\s+/g, '_');
  const prefix = cfg.keyPrefix || 'screenshots';
  const base = `${prefix}/${safe(brandId)}/${safe(execDate)}/${safe(platform)}/${safe(slotId)}`;
  const compressedExt = String(ext || 'webp').replace(/^\./, '') || 'webp';
  return {
    ossKey: `${base}.${compressedExt}`,
    ossRawKey: `${base}-raw.png`,
  };
}

function publicUrlForKey(ossKey) {
  const cfg = getOssConfig();
  if (!cfg.publicBaseUrl || !ossKey) return '';
  return `${cfg.publicBaseUrl}/${String(ossKey).replace(/^\//, '')}`;
}

function createClient() {
  const cfg = getOssConfig();
  if (!cfg.enabled) {
    throw new Error('OSS 未配置：请设置环境变量或创建 apps/gen-caiji/oss.local.json（参考 oss.local.example.json）');
  }
  if (!OSS) throw new Error('未安装 ali-oss，请在 apps/gen-caiji 执行 pnpm add ali-oss');
  return new OSS({
    accessKeyId: cfg.accessKeyId,
    accessKeySecret: cfg.accessKeySecret,
    bucket: cfg.bucket,
    region: cfg.region,
    endpoint: cfg.endpoint,
    secure: true,
    timeout: 120_000,
  });
}

/**
 * @param {{ buffer: Buffer, ossKey: string, contentType?: string }} opts
 */
async function putObject({ buffer, ossKey, contentType }) {
  const client = createClient();
  const body = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (!body.length) throw new Error('上传内容为空');
  if (!ossKey) throw new Error('缺少 ossKey');
  await client.put(ossKey, body, {
    headers: {
      'Content-Type': contentType || contentTypeForExt(path.extname(ossKey)),
      // 公有读桶：显式可读；覆盖同 key
      'x-oss-object-acl': 'public-read',
    },
  });
  return {
    ossKey,
    photoUrl: publicUrlForKey(ossKey),
    size: body.length,
  };
}

/**
 * 上传压缩图 + raw；同槽覆盖。
 * @returns {Promise<null | {
 *   oss_key: string, photo_url: string, size: number,
 *   oss_raw_key?: string, photo_raw_url?: string, size_raw?: number,
 * }>}
 */
async function uploadShotPair({
  brandId,
  execDate,
  platform,
  slotId,
  compressedBuffer,
  compressedExt,
  rawBuffer,
  compressedPath,
  rawPath,
}) {
  const cfg = getOssConfig();
  if (!cfg.enabled) return null;

  let compressed = compressedBuffer;
  let raw = rawBuffer;
  if ((!compressed || !compressed.length) && compressedPath && fs.existsSync(compressedPath)) {
    compressed = fs.readFileSync(compressedPath);
  }
  if ((!raw || !raw.length) && rawPath && fs.existsSync(rawPath)) {
    raw = fs.readFileSync(rawPath);
  }
  if (!compressed || !compressed.length) {
    throw new Error('无压缩截图可上传');
  }

  const ext =
    compressedExt ||
    (compressedPath ? path.extname(compressedPath).replace(/^\./, '') : '') ||
    'webp';
  const { ossKey, ossRawKey } = buildShotKeys({
    brandId,
    execDate,
    platform,
    slotId,
    ext,
  });

  const main = await putObject({
    buffer: compressed,
    ossKey,
    contentType: contentTypeForExt(ext),
  });

  const out = {
    oss_key: main.ossKey,
    photo_url: main.photoUrl,
    size: main.size,
  };

  if (raw && raw.length) {
    const rawPut = await putObject({
      buffer: raw,
      ossKey: ossRawKey,
      contentType: 'image/png',
    });
    out.oss_raw_key = rawPut.ossKey;
    out.photo_raw_url = rawPut.photoUrl;
    out.size_raw = rawPut.size;
  }

  return out;
}

module.exports = {
  getOssConfig,
  buildShotKeys,
  publicUrlForKey,
  putObject,
  uploadShotPair,
};
