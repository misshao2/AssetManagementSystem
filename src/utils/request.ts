import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, clearAuth } from './auth'
import { storage } from './storage'
import type { ApiResult } from '@/types'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
})

// 请求拦截：附加令牌与组织上下文
service.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  const orgId = storage.get<string>('asset_org')
  if (orgId) config.headers['X-Org-Id'] = orgId
  return config
})

// 响应拦截：统一处理 code 与错误
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResult
    if (res.code === 0) return res.data
    if (res.code === 401) {
      clearAuth()
      ElMessageBox.alert('登录已过期，请重新登录', '提示', {
        confirmButtonText: '去登录',
        type: 'warning'
      }).then(() => {
        location.href = '/login'
      })
      return Promise.reject(new Error(res.message || '未授权'))
    }
    if (res.code === 403) {
      ElMessage.error('无权限访问该资源')
      return Promise.reject(new Error(res.message || '无权限'))
    }
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || 'Error'))
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      location.href = '/login'
    }
    const msg = error.response?.data?.message || error.message || '网络异常'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export function get<T = any>(url: string, params?: any, config?: any): Promise<T> {
  return service.get<ApiResult<T>>(url, { params, ...config }) as unknown as Promise<T>
}

export function post<T = any>(url: string, data?: any, config?: any): Promise<T> {
  return service.post<ApiResult<T>>(url, data, config) as unknown as Promise<T>
}

export function put<T = any>(url: string, data?: any, config?: any): Promise<T> {
  return service.put<ApiResult<T>>(url, data, config) as unknown as Promise<T>
}

export function del<T = any>(url: string, config?: any): Promise<T> {
  return service.delete<ApiResult<T>>(url, config) as unknown as Promise<T>
}

export default service
