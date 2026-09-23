/** 首登 / 添加品牌：onboarding SSE + confirm */
import { API_BASE } from '../http'

function getToken(): string {
  try {
    return localStorage.getItem('geo_token') || ''
  } catch {
    return ''
  }
}

function authHeaders(): Record<string, string> {
  const tk = getToken()
  return {
    'Content-Type': 'application/json',
    ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
  }
}

/** POST SSE：逐帧回调 onEvent(eventName, parsedData) */
export async function onboardingStream(
  body: Record<string, unknown>,
  onEvent: (ev: string, data: unknown) => void,
): Promise<void> {
  const resp = await fetch(`${API_BASE}/agent/onboarding/stream`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body || {}),
  })
  if (!resp.ok || !resp.body) {
    const data = await resp.json().catch(() => null)
    const err = new Error(String((data as { msg?: string } | null)?.msg || `请求失败（${resp.status}）`)) as Error & {
      status?: number
    }
    err.status = resp.status
    throw err
  }
  const reader = resp.body.getReader()
  const dec = new TextDecoder('utf-8')
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let idx: number
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const frame = buf.slice(0, idx)
      buf = buf.slice(idx + 2)
      let ev = 'message'
      const dataLines: string[] = []
      for (const line of frame.split('\n')) {
        if (line.startsWith('event:')) ev = line.slice(6).trim()
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
      }
      if (dataLines.length) {
        try {
          onEvent(ev, JSON.parse(dataLines.join('\n')))
        } catch { /* ignore */ }
      }
    }
  }
}

export async function onboardingConfirm(body: Record<string, unknown>): Promise<{
  saved?: { brand_id: string; counts: Record<string, number> }
}> {
  const resp = await fetch(`${API_BASE}/agent/onboarding/confirm`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body || {}),
  })
  const data = await resp.json().catch(() => ({} as Record<string, unknown>))
  if (!resp.ok || (data as { code?: number }).code !== 200) {
    const err = new Error(String((data as { msg?: string })?.msg || `请求失败（${resp.status}）`)) as Error & {
      status?: number
    }
    err.status = resp.status
    throw err
  }
  const payload = (data as { data?: { saved?: { brand_id: string; counts: Record<string, number> } } }).data
  return payload || {}
}

export { getToken as getOnboardingToken }
