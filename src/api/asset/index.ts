import { get, post, put } from '@/utils/request'
import type { PageResult, Asset } from '@/types'

export function getAssetPage(params: any) {
  return get<PageResult<Asset>>('/asset/v1/asset/page', params)
}
export function getAssetDashboard() {
  return get('/asset/v1/dashboard')
}
export function getAssetDetail(id: string) {
  return get<Asset>(`/asset/v1/asset/${id}`)
}
export function createAsset(data: Partial<Asset>) {
  return post('/asset/v1/asset', data)
}
export function updateAsset(id: string, data: Partial<Asset>) {
  return put(`/asset/v1/asset/${id}`, data)
}
export function updateAssetStatus(id: string, status: string, reason?: string) {
  return put(`/asset/v1/asset/${id}/status`, { status, reason })
}
export function transferAsset(data: any) {
  return post('/asset/v1/asset/transfer', data)
}
export function exportAsset() {
  return get('/asset/v1/asset/export')
}

// ============ 智能盘点（docx 4.1.4） ============
export function getInventoryPage(params: any) {
  return get<PageResult<any>>('/asset/v1/inventory/page', params)
}
export function createInventory(data: any) {
  return post('/asset/v1/inventory', data)
}

// ============ 资产接收登记（docx 4.3.2） ============
export function getReceiptPage(params: any) {
  return get<PageResult<any>>('/asset/v1/receipt/page', params)
}
export function createReceipt(data: any) {
  return post('/asset/v1/receipt', data)
}

// ============ 改扩建管理（docx 4.3.4） ============
export function getRenovationPage(params: any) {
  return get<PageResult<any>>('/asset/v1/renovation/page', params)
}
export function createRenovation(data: any) {
  return post('/asset/v1/renovation', data)
}

// ============ 闲置资产智能预警（docx 4.3.5） ============
export function getIdlePage(params: any) {
  return get<PageResult<any>>('/asset/v1/idle/page', params)
}
export function getIdleWarning() {
  return get('/asset/v1/idle/warning')
}
