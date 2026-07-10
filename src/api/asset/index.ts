import { get, post, put } from '@/utils/request'
import type { PageResult, Asset } from '@/types'

export function getAssetPage(params: any) {
  return get<PageResult<Asset>>('/asset/v1/asset/page', params)
}

export function getAssetDetail(id: string) {
  return get<Asset>(`/asset/v1/asset/${id}`)
}

export function createAsset(data: Partial<Asset>) {
  return post('/asset/v1/asset', data)
}

export function updateAssetStatus(id: string, status: string, reason?: string) {
  return put(`/asset/v1/asset/${id}/status`, { status, reason })
}

export function transferAsset(data: any) {
  return post('/asset/v1/asset/transfer', data)
}

export function getAssetDashboard() {
  return get('/asset/v1/dashboard')
}
