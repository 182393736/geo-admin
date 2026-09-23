/**
 * 公开诊断协议说明（只读）：
 * 流量站 POST /api/geo/diagnose → 代理 geo-admin /geo-api/public/diagnose
 * 响应含 upgrade.loginUrl（控制台登录回跳 + UTM）
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ brand?: string; url?: string }>(event).catch(() => ({}))
  const brand = String(body?.brand || body?.url || '').trim()
  if (!brand) {
    throw createError({ statusCode: 400, statusMessage: '请提供 brand 或 url' })
  }

  const config = useRuntimeConfig()
  const consoleUrl = String(config.public.consoleUrl || '').replace(/\/+$/, '')
  const loginUpgrade = `${consoleUrl}/login?intent=diagnose&redirect=${encodeURIComponent('/dashboard/report-center')}&utm_source=geo_diagnose_api&utm_medium=referral`

  const headers = getHeaders(event)
  const rateKey = headers['x-forwarded-for'] || headers['x-real-ip'] || 'local'

  // 简易限流提示头（真实限流在 geo-admin / 网关）
  setHeader(event, 'X-Geo-Diagnose-Protocol', 'v1')
  setHeader(event, 'X-RateLimit-Hint', String(rateKey).slice(0, 64))

  try {
    const upstream = await $fetch<{ ok?: boolean; data?: unknown; message?: string }>(
      '/geo-api/public/diagnose',
      {
        method: 'POST',
        body: { brand, source: 'site-manage-hub', protocol: 'v1' },
        timeout: 8000,
      },
    )
    return {
      ok: true,
      mode: 'live',
      protocol: 'v1',
      brand,
      data: upstream?.data ?? upstream,
      upgrade: {
        loginUrl: loginUpgrade,
        message: '完整引擎采样、引用证据与持续监测请登录工作台',
      },
    }
  } catch {
    return {
      ok: true,
      mode: 'demo',
      protocol: 'v1',
      brand,
      data: {
        summary: `已为「${brand}」生成演示基线说明。公开轻诊断不会修改网站。`,
        focus: [
          '确认品牌别名与品类',
          '固定 10–20 条高意图问题',
          '分引擎查看是否出现',
          '补第三方可引用证据',
        ],
        note: '演示模式：上游公开 API 暂不可用或超时。联调 geo-admin /public/diagnose 后自动切 live。',
      },
      upgrade: {
        loginUrl: loginUpgrade,
        message: '登录后可保存品牌并开启持续监测',
      },
    }
  }
})
