import { get, post } from '@/utils/request'
import type { PageResult } from '@/types'

export function getSafetyDashboard() {
  return get('/safety/v1/dashboard')
}

export function getPlanPage(params: any) {
  return get<PageResult<any>>('/safety/v1/plan/page', params)
}

export function createPlan(data: any) {
  return post('/safety/v1/plan', data)
}

export function getInspectPage(params: any) {
  return get<PageResult<any>>('/safety/v1/inspect/page', params)
}

export function getWorkOrderPage(params: any) {
  return get<PageResult<any>>('/safety/v1/workorder/page', params)
}

export function getHazardPage(params: any) {
  return get<PageResult<any>>('/safety/v1/hazard/page', params)
}

export function getWarnCenter(params: any) {
  return get('/safety/v1/warn', params)
}
