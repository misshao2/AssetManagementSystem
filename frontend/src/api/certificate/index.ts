import { get, post, put } from '@/utils/request'
import type { PageResult } from '@/types'

export function getCertOverview() {
  return get('/cert/v1/overview')
}

// 电子档案库
export function getCertArchivePage(params: any) {
  return get<PageResult<any>>('/cert/v1/archive/page', params)
}
export function createCertArchive(data: any) {
  return post('/cert/v1/archive', data)
}
export function updateCertArchive(id: string, data: any) {
  return put(`/cert/v1/archive/${id}`, data)
}

// 到期预警
export function getCertExpireList(params: any) {
  return get<PageResult<any>>('/cert/v1/expire', params)
}

// 一户一档
export function getCertHousehold(params: any) {
  return get('/cert/v1/household', params)
}

// 借阅管理
export function getCertBorrowPage(params: any) {
  return get<PageResult<any>>('/cert/v1/borrow/page', params)
}
export function createBorrow(data: any) {
  return post('/cert/v1/borrow', data)
}
export function updateBorrow(id: string, data: any) {
  return put(`/cert/v1/borrow/${id}`, data)
}
