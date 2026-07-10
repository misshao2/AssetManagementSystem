import { get, post } from '@/utils/request'
import type { PageResult } from '@/types'

export function getLeaseBoard() {
  return get('/lease/v1/board')
}

export function getTenantPage(params: any) {
  return get<PageResult<any>>('/lease/v1/tenant/page', params)
}

export function getContractPage(params: any) {
  return get<PageResult<any>>('/lease/v1/contract/page', params)
}

// 租金自动测算
export function calcRentPlan(data: any) {
  return post('/lease/v1/contract/calc-plan', data)
}

// 电子签章
export function getSignUrl(contractId: string) {
  return post('/lease/v1/sign/url', { contractId })
}

export function getSignStatus(contractId: string) {
  return get('/lease/v1/sign/status', { contractId })
}
