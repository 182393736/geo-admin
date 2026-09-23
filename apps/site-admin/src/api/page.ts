import { get, post, put, del } from './http'
import type { PageData } from '@site-manage/shared'

/** 按域名拉取页面树（菜单+页面一体） */
export function fetchPages(siteId: string) {
  return get<PageData[]>('/admin/pages', { siteId })
}

export function fetchPage(id: string) {
  return get<PageData>(`/admin/pages/${id}`)
}

export function createPage(data: Partial<PageData>) {
  return post<PageData>('/admin/pages', data)
}

export function updatePage(id: string, data: Partial<PageData>) {
  return put<PageData>(`/admin/pages/${id}`, data)
}

export function deletePage(id: string) {
  return del<boolean>(`/admin/pages/${id}`)
}

/** 同类型复制：保留 pageKind 与正文，新 path */
export function copyPage(id: string, data: { path?: string; title?: string; status?: string } = {}) {
  return post<PageData>(`/admin/pages/${id}/copy`, data)
}
