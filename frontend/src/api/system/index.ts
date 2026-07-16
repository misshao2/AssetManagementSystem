import { get, post, put, del } from '@/utils/request'
import type { PageResult } from '@/types'

// ============ 数据字典项 ============
export function getDict(type: string) {
  return get<{ label: string; value: string }[]>('/system/v1/dict/items', { type })
}

// ============ 组织架构 ============
export function getOrgTree() {
  return get<any[]>('/system/v1/org/tree')
}
export function getOrgPage(params: any) {
  return get<PageResult<any>>('/system/v1/org/page', params)
}
export function createOrg(data: any) {
  return post('/system/v1/org', data)
}
export function updateOrg(id: string, data: any) {
  return put(`/system/v1/org/${id}`, data)
}
export function removeOrg(id: string) {
  return del(`/system/v1/org/${id}`)
}

// ============ 用户管理 ============
export function getUserPage(params: any) {
  return get<PageResult<any>>('/system/v1/user/page', params)
}
export function createUser(data: any) {
  return post('/system/v1/user', data)
}
export function updateUser(id: string, data: any) {
  return put(`/system/v1/user/${id}`, data)
}
export function removeUser(id: string) {
  return del(`/system/v1/user/${id}`)
}

// ============ 角色管理 ============
export function getRolePage(params: any) {
  return get<PageResult<any>>('/system/v1/role/page', params)
}
export function createRole(data: any) {
  return post('/system/v1/role', data)
}
export function updateRole(id: string, data: any) {
  return put(`/system/v1/role/${id}`, data)
}
export function removeRole(id: string) {
  return del(`/system/v1/role/${id}`)
}

// ============ 字典管理 ============
export function getDictTypePage(params: any) {
  return get<PageResult<any>>('/system/v1/dict/type/page', params)
}
export function createDictType(data: any) {
  return post('/system/v1/dict/type', data)
}
export function updateDictType(id: string, data: any) {
  return put(`/system/v1/dict/type/${id}`, data)
}
export function removeDictType(id: string) {
  return del(`/system/v1/dict/type/${id}`)
}
export function getDictItemPage(params: any) {
  return get<PageResult<any>>('/system/v1/dict/item/list', params)
}
export function createDictItem(data: any) {
  return post('/system/v1/dict/item', data)
}
export function updateDictItem(id: string, data: any) {
  return put(`/system/v1/dict/item/${id}`, data)
}
export function removeDictItem(id: string) {
  return del(`/system/v1/dict/item/${id}`)
}

// ============ 消息中心 ============
export function getMessageTemplatePage(params: any) {
  return get<PageResult<any>>('/system/v1/message/template/page', params)
}
export function createMessageTemplate(data: any) {
  return post('/system/v1/message/template', data)
}
export function updateMessageTemplate(id: string, data: any) {
  return put(`/system/v1/message/template/${id}`, data)
}
export function removeMessageTemplate(id: string) {
  return del(`/system/v1/message/template/${id}`)
}

// ============ 流程引擎 ============
export function getFlowPage(params: any) {
  return get<PageResult<any>>('/system/v1/flow/definition/page', params)
}
export function createFlow(data: any) {
  return post('/system/v1/flow/definition', data)
}
export function updateFlow(id: string, data: any) {
  return put(`/system/v1/flow/definition/${id}`, data)
}
export function removeFlow(id: string) {
  return del(`/system/v1/flow/definition/${id}`)
}

// ============ 操作日志 ============
export function getOperLogPage(params: any) {
  return get<PageResult<any>>('/system/v1/log/page', params)
}
