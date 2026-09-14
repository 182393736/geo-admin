'use strict';
/**
 * 对话截图压缩：
 * - 宽高均 ≤ 16383：优先 WebP 无损（像素一致，体积通常远小于 PNG）
 * - 超出 WebP 上限（长回答整页常见）：改用 JPEG mozjpeg（WebP 无法编码）
 * - 再回退 PNG sharp / zlib
 */
const zlib = require('node:zlib');

const WEBP_MAX_SIDE = 16383;

let sharp = null;
try {
  sharp = require('sharp');
} catch {
  sharp = null;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
}

/** 纯 JS：按 chunk 重压 IDAT（无损），失败则返回原 buffer */
function recompressPngWithZlib(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(sig)) return buf;

  const out = [sig];
  const idatParts = [];
  let offset = 8;
  const flushIdat = () => {
    if (!idatParts.length) return;
    const raw = Buffer.concat(idatParts);
    const inflated = zlib.inflateSync(raw);
    const deflated = zlib.deflateSync(inflated, { level: 9 });
    const typeBuf = Buffer.from('IDAT');
    const chunk = Buffer.concat([u32(deflated.length), typeBuf, deflated]);
    const crc = crc32(Buffer.concat([typeBuf, deflated]));
    out.push(chunk, u32(crc));
    idatParts.length = 0;
  };

  while (offset + 8 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + len;
    const crcEnd = dataEnd + 4;
    if (crcEnd > buf.length) break;
    const data = buf.subarray(dataStart, dataEnd);
    if (type === 'IDAT') {
      idatParts.push(data);
    } else {
      flushIdat();
      out.push(buf.subarray(offset, crcEnd));
    }
    offset = crcEnd;
  }
  flushIdat();
  return Buffer.concat(out);
}

/**
 * @param {Buffer} input Playwright PNG buffer
 * @returns {Promise<{
 *   raw: Buffer,
 *   compressed: Buffer,
 *   rawBytes: number,
 *   compressedBytes: number,
 *   engine: string,
 *   ext: string,
 * }>}
 */
async function compressShot(input) {
  const raw = Buffer.isBuffer(input) ? input : Buffer.from(input || []);
  if (!raw.length) {
    return {
      raw,
      compressed: raw,
      rawBytes: 0,
      compressedBytes: 0,
      engine: 'none',
      ext: 'png',
    };
  }

  /** @type {{ buffer: Buffer, engine: string, ext: string }[]} */
  const candidates = [];

  let width = 0;
  let height = 0;
  if (sharp) {
    try {
      const meta = await sharp(raw).metadata();
      width = Number(meta.width) || 0;
      height = Number(meta.height) || 0;
    } catch {
      /* ignore */
    }

    const fitsWebp =
      width > 0 &&
      height > 0 &&
      width <= WEBP_MAX_SIDE &&
      height <= WEBP_MAX_SIDE;

    if (fitsWebp) {
      try {
        const webp = await sharp(raw)
          .webp({ lossless: true, effort: 6 })
          .toBuffer();
        if (webp.length) candidates.push({ buffer: webp, engine: 'webp-lossless', ext: 'webp' });
      } catch {
        /* ignore — 再试其它格式 */
      }
    }

    // 超长整页截图：WebP 硬限制 16383，改用 JPEG（文字 UI 仍远小于 PNG）
    if (!fitsWebp || !candidates.some(c => c.ext === 'webp')) {
      try {
        const jpeg = await sharp(raw)
          .jpeg({ quality: 88, mozjpeg: true })
          .toBuffer();
        if (jpeg.length) {
          candidates.push({
            buffer: jpeg,
            engine: fitsWebp ? 'jpeg' : `jpeg-oversized(${width}x${height})`,
            ext: 'jpg',
          });
        }
      } catch {
        /* ignore */
      }
    }

    try {
      const png = await sharp(raw)
        .png({ compressionLevel: 9, force: true, palette: false })
        .toBuffer();
      if (png.length) candidates.push({ buffer: png, engine: 'png-sharp', ext: 'png' });
    } catch {
      /* ignore */
    }
  }

  try {
    const zlibPng = recompressPngWithZlib(raw);
    if (zlibPng.length) candidates.push({ buffer: zlibPng, engine: 'png-zlib', ext: 'png' });
  } catch {
    /* ignore */
  }

  candidates.push({ buffer: raw, engine: 'passthrough', ext: 'png' });
  candidates.sort((a, b) => a.buffer.length - b.buffer.length);
  const best = candidates[0];

  if (best.buffer.length >= raw.length) {
    return {
      raw,
      compressed: raw,
      rawBytes: raw.length,
      compressedBytes: raw.length,
      engine: best.engine === 'passthrough' ? 'passthrough' : `${best.engine}-noop`,
      ext: 'png',
    };
  }

  return {
    raw,
    compressed: best.buffer,
    rawBytes: raw.length,
    compressedBytes: best.buffer.length,
    engine: best.engine,
    ext: best.ext,
  };
}

/** @deprecated 兼容旧调用名 */
async function compressPngLossless(input) {
  return compressShot(input);
}

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) return '0 B';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) {
    const kb = n / 1024;
    return `${kb >= 100 ? Math.round(kb) : kb.toFixed(1)} KB`;
  }
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 生成压缩前后对比预览页（同目录相对引用 raw/compressed） */
function buildShotCompareHtml({
  platformName,
  rawFile,
  compressedFile,
  rawBytes,
  compressedBytes,
  engine,
}) {
  const rawLabel = formatBytes(rawBytes);
  const cmpLabel = formatBytes(compressedBytes);
  const saved = Math.max(0, (Number(rawBytes) || 0) - (Number(compressedBytes) || 0));
  const savedLabel = formatBytes(saved);
  const ratio =
    rawBytes > 0 ? `${((1 - compressedBytes / rawBytes) * 100).toFixed(1)}%` : '0%';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>截图压缩对比 · ${escapeHtml(platformName || '')}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0f172a; color: #e2e8f0; }
  .bar { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: center; padding: 12px 16px; background: #1e293b; border-bottom: 1px solid #334155; position: sticky; top: 0; z-index: 2; }
  .bar strong { color: #f8fafc; }
  .pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: #334155; font-size: 13px; }
  .pill.ok { background: #14532d; color: #bbf7d0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; min-height: calc(100vh - 58px); }
  @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
  .panel { background: #111827; border: 1px solid #334155; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
  .panel h2 { margin: 0; padding: 10px 12px; font-size: 14px; font-weight: 600; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; gap: 8px; }
  .panel .meta { color: #94a3b8; font-weight: 500; }
  .view { flex: 1; overflow: auto; background: #020617; display: flex; justify-content: center; align-items: flex-start; padding: 12px; }
  .view img { max-width: 100%; height: auto; background: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.35); }
</style>
</head>
<body>
  <div class="bar">
    <strong>${escapeHtml(platformName || '对话截图')} · 压缩对比</strong>
    <span class="pill">压缩前 ${escapeHtml(rawLabel)}</span>
    <span class="pill">压缩后 ${escapeHtml(cmpLabel)}</span>
    <span class="pill ok">节省 ${escapeHtml(savedLabel)}（${escapeHtml(ratio)}）</span>
    <span class="pill">引擎 ${escapeHtml(engine || '-')}</span>
  </div>
  <div class="grid">
    <section class="panel">
      <h2><span>压缩前 PNG</span><span class="meta">${escapeHtml(rawLabel)} · ${escapeHtml(rawFile || '')}</span></h2>
      <div class="view"><img src="./${escapeHtml(rawFile || '')}" alt="压缩前"></div>
    </section>
    <section class="panel">
      <h2><span>压缩后</span><span class="meta">${escapeHtml(cmpLabel)} · ${escapeHtml(compressedFile || '')}</span></h2>
      <div class="view"><img src="./${escapeHtml(compressedFile || '')}" alt="压缩后"></div>
    </section>
  </div>
</body>
</html>`;
}

module.exports = {
  compressShot,
  compressPngLossless,
  formatBytes,
  buildShotCompareHtml,
  hasSharp: !!sharp,
  WEBP_MAX_SIDE,
};
