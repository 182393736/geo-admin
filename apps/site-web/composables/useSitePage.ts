import type { SitePagePayload } from '@site-manage/shared'

export const useSitePage = () => useState<SitePagePayload | null>('sitePage', () => null)
