/** 最小作者库：内容页 SEO / 署名用。先组织作者，具名专家有简历后再加。 */

export type GeoAuthor = {
  id: string
  /** Person | Organization */
  kind: 'Person' | 'Organization'
  name: string
  short: string
  jobTitle?: string
  urlPath?: string
  sameAs?: string[]
}

/** 默认内容作者：机构（方法页 / 术语页够用，不必每页虚构个人） */
export const GEO_AUTHOR_ORG: GeoAuthor = {
  id: 'hanyuai-geo',
  kind: 'Organization',
  name: 'HANYUAI GEO',
  short: 'HANYUAI GEO 方法与产品团队',
  urlPath: '/',
}

/**
 * 具名作者占位：有真实专家简历、头像与对外主页后再启用，并挂到具体文章。
 * 现在不要给每页硬编不同假作者——搜索与用户都能看出来。
 */
export const GEO_AUTHORS: GeoAuthor[] = [GEO_AUTHOR_ORG]

export function getGeoAuthor(id?: string | null): GeoAuthor {
  if (!id) return GEO_AUTHOR_ORG
  return GEO_AUTHORS.find((a) => a.id === id) || GEO_AUTHOR_ORG
}

/** 内容批次时间戳：加厚/改 schema 时更新日期，避免全站写死旧日 */
export const GEO_CONTENT_STAMP = {
  datePublished: '2026-09-20',
  dateModified: '2026-09-25',
} as const
