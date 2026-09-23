/**
 * Cross-origin same-tab auth handoff via window.name.
 */
const PREFIX = 'geo_auth_handoff:'

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
