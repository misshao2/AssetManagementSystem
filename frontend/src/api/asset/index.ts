import { get, post, put } from '@/utils/request'
import type { PageResult, Asset, AssetLedgerStat, AssetVO, AssetStatisticsVO, ApiPageResult } from '@/types'
import { mockGetAssetPage, mockGetAssetDetail, mockGetAssetStatistics } from './mock-data'

/**
 * 资产台账接口适配层
 * 接口文档端点：GET /api/v1/assets, GET /api/v1/assets/{id}, GET /api/v1/assets/statistics
 * 适配策略：在此层做参数名转换 + 响应结构拍平，使上层 useTable / 页面组件无需改动
 *
 * 快速切换：在 .env.development 中设置 VITE_USE_ASSET_MOCK=true 即可使用前端 mock，
 * 后端不可用时无需启动后端服务。
 */

const USE_ASSET_MOCK = import.meta.env.VITE_USE_ASSET_MOCK === 'true'

if (USE_ASSET_MOCK) {
  console.info('%c[Asset] 使用前端 Mock 数据（VITE_USE_ASSET_MOCK=true）', 'color:#faad14;font-weight:bold')
}

// 旧使用状态(string枚举) → 新状态(int) 映射
const useStatusToInt: Record<string, number> = { IN_USE: 1, VACANT: 0, FROZEN: 2 }

// GET /api/v1/assets → 分页列表
export function getAssetPage(params: any) {
  if (USE_ASSET_MOCK) {
    return mockGetAssetPage(params).then((res) => ({
      list: res.list || [],
      total: res.pagination?.total ?? 0
    }) as PageResult<AssetVO>)
  }
  // 转换参数：pageNum → page, useStatus(string) → status(int)
  const { pageNum, pageSize, useStatus, ...rest } = params
  const apiParams: any = {
    page: pageNum,
    pageSize,
    ...rest // buildingName, source 等直接透传
  }
  if (useStatus !== undefined && useStatus !== '' && useStatus !== null) {
    apiParams.status = useStatusToInt[useStatus] ?? useStatus
  }
  return get<ApiPageResult<AssetVO>>('/v1/assets', apiParams).then((res) => {
    // 拍平响应：{ list, pagination: { total } } → { list, total }
    return {
      list: res.list || [],
      total: res.pagination?.total ?? 0
    } as PageResult<AssetVO>
  })
}

// GET /api/v1/assets/statistics → 统计卡片
export function getAssetLedgerStat() {
  if (USE_ASSET_MOCK) {
    return mockGetAssetStatistics().then((res) => {
      const total = res.totalCount || 0
      const inUse = res.inUseCount || 0
      return {
        total,
        totalValue: res.totalValue || 0,
        inUse,
        inUseRate: total ? ((inUse / total) * 100).toFixed(1) + '%' : '0%',
        arrearsRisk: res.overdueRiskCount || 0
      } as AssetLedgerStat
    })
  }
  return get<AssetStatisticsVO>('/v1/assets/statistics').then((res) => {
    // 映射字段名 + 计算在用率
    const total = res.totalCount || 0
    const inUse = res.inUseCount || 0
    return {
      total,
      totalValue: res.totalValue || 0,
      inUse,
      inUseRate: total ? ((inUse / total) * 100).toFixed(1) + '%' : '0%',
      arrearsRisk: res.overdueRiskCount || 0
    } as AssetLedgerStat
  })
}

export function getAssetDashboard() {
  return get('/asset/v1/dashboard')
}

// GET /api/v1/assets/{id} → 资产详情
export function getAssetDetail(id: string | number) {
  if (USE_ASSET_MOCK) return mockGetAssetDetail(id)
  return get<AssetVO>(`/v1/assets/${id}`)
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
