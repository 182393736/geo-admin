/**
 * 控制台脱敏报告回流（stub）
 * 生产环境应校验服务端密钥，写入 CMS/DB；本地用内存演示。
 */
const memoryStore: Record<string, unknown> = {}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = getHeader(event, 'x-geo-ingest-secret')
  const expected = String((config as any).geoIngestSecret || process.env.NUXT_GEO_INGEST_SECRET || '')

  if (expected && secret !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  const body = await readBody<{
    id: string
    title: string
    industry?: string
    method?: string
    engines?: string[]
    highlights?: string[]
    sections?: { heading: string; paragraphs: string[] }[]
  }>(event)

  if (!body?.id || !body?.title) {
    throw createError({ statusCode: 400, statusMessage: 'id 与 title 必填' })
  }

  // 禁止写入未授权精确分数字段
  const sanitized = {
    id: body.id,
    title: body.title,
    industry: body.industry || '未分类',
    datePublished: new Date().toISOString().slice(0, 10),
    dateModified: new Date().toISOString().slice(0, 10),
    engines: body.engines || [],
    method: body.method || '控制台脱敏回流',
    highlights: body.highlights || [],
    sections: body.sections || [],
    sourceNote: '由控制台授权回流；不含未授权精确分数。',
  }

  memoryStore[body.id] = sanitized

  return {
    ok: true,
    path: `/reports/shared/${body.id}`,
    note: '本地内存存储；生产请接入 CMS pageKind=report。静态示例仍见 utils/content/authority.ts',
    item: sanitized,
  }
})
