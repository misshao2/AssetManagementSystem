import { get, post, put } from '@/utils/request'
import type { PageResult } from '@/types'

export function getCertOverview() {
  return get('/cert/v1/overview')
}

export function getCertArchivePage(params: any) {
  return get<PageResult<any>>('/cert/v1/archive/page', params)
}

export function getCertExpireList(params: any) {
  return get<PageResult<any>>('/cert/v1/expire', params)
}

export function getCertHousehold(params: any) {
  return get('/cert/v1/household', params)
}

export function createBorrow(data: any) {
  return post('/cert/v1/borrow', data)
}
