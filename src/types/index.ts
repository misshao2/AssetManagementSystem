// 通用接口返回与业务类型定义

export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
  requestId: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

export interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderBy?: string
  orderType?: 'ASC' | 'DESC'
  filters?: Record<string, any>
}

export interface UserInfo {
  userId: string
  userName: string
  orgId: string
  roles: string[]
  permissions: string[]
}

export interface MenuNode {
  id: string
  parentId: string
  title: string
  icon?: string
  path: string
  component?: string
  permission?: string
  children?: MenuNode[]
}

// 资产主数据（沿用 PRD 4.2）
export interface Asset {
  assetId: string
  assetCode: string
  assetName: string
  assetType: string
  orgName?: string
  building?: string
  area?: number
  status?: string
  manager?: string
  [key: string]: any
}
