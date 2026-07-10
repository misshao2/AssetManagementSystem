import { get, post } from '@/utils/request'
import type { PageResult } from '@/types'

export function getBillPage(params: any) {
  return get<PageResult<any>>('/finance/v1/bill/page', params)
}

export function genBill(contractId: string) {
  return post('/finance/v1/bill/gen', { contractId })
}

export function getCollectionPage(params: any) {
  return get<PageResult<any>>('/finance/v1/collection/page', params)
}

export function writeOff(data: any) {
  return post('/finance/v1/writeoff', data)
}

export function getInvoicePage(params: any) {
  return get<PageResult<any>>('/finance/v1/invoice/page', params)
}
