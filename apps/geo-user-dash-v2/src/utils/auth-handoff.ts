/**
 * Cross-origin same-tab auth handoff via window.name.
 * Survives navigation (unlike sessionStorage); keeps JWT out of the address bar.
 */
const PREFIX = 'geo_auth_handoff:'
const TTL_MS = 120_000

export type AuthHandoff = {
  token: string
  brandId?: string
}

export function stashAuthHandoff(token: string, brandId?: string): void {
  if (!token || typeof window === 'undefined') return
  window.name =
    PREFIX +
    JSON.stringify({
      v: 1,
      token,
      brand_id: brandId || undefined,
      t: Date.now(),
    })
}

/** Read and clear handoff. Returns null if missing/invalid/expired. */
export function takeAuthHandoff(): AuthHandoff | null {
  if (typeof window === 'undefined') return null
  const raw = window.name || ''
  if (!raw.startsWith(PREFIX)) return null
  try {
    const data = JSON.parse(raw.slice(PREFIX.length)) as {
      v?: number
      token?: string
      brand_id?: string
      t?: number
    }
    window.name = ''
    if (data?.v !== 1 || typeof data.token !== 'string' || !data.token) return null
    if (Date.now() - Number(data.t || 0) > TTL_MS) return null
    return {
      token: data.token,
      brandId: typeof data.brand_id === 'string' ? data.brand_id : undefined,
    }
  } catch {
    window.name = ''
    return null
  }
}
