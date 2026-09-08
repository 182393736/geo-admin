/**
 * JWT 载荷与解码（单一事实源）
 * ------------------------------------------------------------------
 * 载荷形状由 apps/gen-api/app/service/auth.js 签发：
 *   { sub: user._id, jti: uuid, name: user.account }，HS256，7 天。
 * 消费方：
 *  - gen-user-dash src/utils/site.ts（吸收 #token= 解出 id/username）
 *  - gen-user-site composables/useAuth.ts（解出 account）
 * 改载荷字段时，只改这里，两处消费方随之生效。
 */

export interface JwtPayload {
  /** 用户 id（对齐线上 sub 形态 = user._id） */
  sub: string;
  /** 唯一 jti（黑名单吊销用） */
  jti: string;
  /** 登录账号（account） */
  name: string;
  /** 签发时间戳（秒） */
  iat?: number;
  /** 过期时间戳（秒） */
  exp?: number;
}

/** base64url 解码（兼容 node 与浏览器） */
function base64UrlDecode(segment: string): string {
  const b64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin =
    typeof atob === 'function'
      ? atob(b64 + pad)
      : Buffer.from(b64 + pad, 'base64').toString('binary');
  return decodeURIComponent(
    bin
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
}

/**
 * 解出 JWT 载荷（不验签——验签属于 API 侧职责，这里只做结构读取）。
 * 解析失败返回 null（兼容非标准 token 场景）。
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}
