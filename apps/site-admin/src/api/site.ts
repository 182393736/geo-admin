import { get, post, put, del } from './http'
import type { Site, PaginatedResult } from '@site-manage/shared'

export function fetchSites(params?: { page?: number; pageSize?: number; keyword?: string }) {
  return get<PaginatedResult<Site>>('/admin/sites', params)
}

export function fetchSite(id: string) {
  return get<Site>(`/admin/sites/${id}`)
}

export function createSite(data: Partial<Site>) {
  return post<Site>('/admin/sites', data)
}

export function updateSite(id: string, data: Partial<Site>) {
  return put<Site>(`/admin/sites/${id}`, data)
}

export function deleteSite(id: string) {
  return del<boolean>(`/admin/sites/${id}`)
}
