import { get, post, put } from '@/utils/request'
import type { PageResult } from '@/types'

export function getSafetyDashboard() {
  return get('/safety/v1/dashboard')
}

// 巡检计划
export function getPlanPage(params: any) {
  return get<PageResult<any>>('/safety/v1/plan/page', params)
}
export function createPlan(data: any) {
  return post('/safety/v1/plan', data)
}

// 现场巡检
export function getInspectPage(params: any) {
  return get<PageResult<any>>('/safety/v1/inspect/page', params)
}
export function createInspect(data: any) {
  return post('/safety/v1/inspect', data)
}

// 维保工单
export function getWorkOrderPage(params: any) {
  return get<PageResult<any>>('/safety/v1/workorder/page', params)
}
export function createWorkOrder(data: any) {
  return post('/safety/v1/workorder', data)
}
export function updateWorkOrder(id: string, data: any) {
  return put(`/safety/v1/workorder/${id}`, data)
}

// 隐患台账
export function getHazardPage(params: any) {
  return get<PageResult<any>>('/safety/v1/hazard/page', params)
}
export function createHazard(data: any) {
  return post('/safety/v1/hazard', data)
}
export function updateHazard(id: string, data: any) {
  return put(`/safety/v1/hazard/${id}`, data)
}

// 预警中心
export function getWarnPage(params: any) {
  return get<PageResult<any>>('/safety/v1/warn', params)
}
