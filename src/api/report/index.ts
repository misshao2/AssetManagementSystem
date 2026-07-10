import { get, post } from '@/utils/request'
import type { PageResult } from '@/types'

export function getScreenData() {
  return get('/report/v1/screen')
}

export function getAssetLedger(params: any) {
  return get<PageResult<any>>('/report/v1/asset-ledger', params)
}

export function getContractReport(params: any) {
  return get<PageResult<any>>('/report/v1/contract', params)
}

export function getCollectionReport(params: any) {
  return get('/report/v1/collection', params)
}

export function getStateOwnedReport(params: any) {
  return get('/report/v1/state-owned', params)
}

export function saveCustomReport(data: any) {
  return post('/report/v1/custom', data)
}
