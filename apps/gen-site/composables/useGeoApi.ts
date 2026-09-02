/**
 * GEO API 客户端（apps/api, Egg.js）
 * - apiPost：普通 JSON POST（Bearer token 自动带）
 * - sse：POST + ReadableStream 解析 SSE 帧（EventSource 不支持 POST/自定义头，故手写）
 * token 存 localStorage 'geo.token'，由 useAuth.login 写入
 */
export function useGeoApi() {
  const config = useRuntimeConfig()
  const base = String((config.public as Record<string, unknown>).apiBase || '/geo-api')

  function getToken(): string {
    try {
      return localStorage.getItem('geo.token') || ''
    } catch {
      return ''
    }
  }
  function setToken(t: string) {
    try {
      if (t) localStorage.setItem('geo.token', t)
      else localStorage.removeItem('geo.token')
    } catch { /* 隐私模式忽略 */ }
  }
  function authHeaders() {
    const tk = getToken()
    return {
      'Content-Type': 'application/json',
      ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
    }
  }

  async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
    const resp = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body || {}),
    })
    const data = await resp.json().catch(() => ({} as Record<string, unknown>))
    if (!resp.ok) {
      const err = new Error(String((data as { msg?: string })?.msg || `请求失败（${resp.status}）`)) as Error & { status?: number }
      err.status = resp.status
      throw err
    }
    return data as T
  }

  /** POST SSE：逐帧回调 onEvent(eventName, parsedData)，流结束正常返回；失败抛带 .status 的 Error */
  async function sse(path: string, body: unknown, onEvent: (ev: string, data: unknown) => void): Promise<void> {
    const resp = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body || {}),
    })
    if (!resp.ok || !resp.body) {
      const data = await resp.json().catch(() => null)
      const err = new Error(String((data as { msg?: string } | null)?.msg || `请求失败（${resp.status}）`)) as Error & { status?: number }
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
          } catch { /* 半包/非 JSON 帧忽略 */ }
        }
      }
    }
  }

  return { apiPost, sse, getToken, setToken, base }
}
