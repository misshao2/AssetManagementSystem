import { get, post, put } from '@/utils/request'
import type { PageResult } from '@/types'

export function getLeaseBoard() {
  return get('/lease/v1/board')
}

// 招商线索（docx 4.4.3）
export function getLeadPage(params: any) {
  return get<PageResult<any>>('/lease/v1/lead/page', params)
}
export function createLead(data: any) {
  return post('/lease/v1/lead', data)
}

// 租户档案
export function getTenantPage(params: any) {
  return get<PageResult<any>>('/lease/v1/tenant/page', params)
}
export function createTenant(data: any) {
  return post('/lease/v1/tenant', data)
}
export function updateTenant(id: string, data: any) {
  return put(`/lease/v1/tenant/${id}`, data)
}

// 合同管理
export function getContractPage(params: any) {
  return get<PageResult<any>>('/lease/v1/contract/page', params)
}
export function createContract(data: any) {
  return post('/lease/v1/contract', data)
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
