// 通用接口返回与业务类型定义

export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
  requestId?: string
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

// 资产主数据（沿用 PRD 4.2，并扩展「资产台账」设计稿字段）
export interface Asset {
  assetId: string
  assetCode?: string
  assetName?: string
  assetType?: string
  orgName?: string
  building?: string
  area?: number
  status?: string
  manager?: string
  // —— 资产台账列表（Figma）字段 ——
  buildingName?: string // 建筑物名称
  ownerUnit?: string // 产权单位
  certNo?: string // 产权证号
  address?: string // 建筑地址
  useTerm?: string // 使用期限
  buildingArea?: number // 建筑面积(㎡)
  landNature?: string // 土地性质
  structureType?: string // 结构类型
  source?: string // 来源（收购/划转/划拨）
  assetValue?: number // 资产价值(元)
  assetCondition?: string // 资产状况（完好/需修缮/老化）
  useStatus?: string // 使用状态（IN_USE/VACANT/FROZEN）
  lessee?: string // 承租人
  leaseArea?: number // 出租面积(㎡)
  leaseTerm?: string // 租赁期限
  payMethod?: string // 支付方式
  deposit?: number // 押金(元)
  arrears?: number // 欠款(元)
  remark?: string // 备注
  [key: string]: any
}

// 资产台账统计卡片
export interface AssetLedgerStat {
  total: number
  totalValue: number
  inUse: number
  inUseRate: string
  arrearsRisk: number
}

// ===== 接口文档 /api/v1/assets 类型 =====

// 资产详情视图对象（接口文档 AssetVO）
export interface AssetVO {
  id: number
  buildingName?: string
  ownerUnit?: string
  propertyNo?: string // 产权证号
  address?: string
  usageTerm?: string // 使用期限
  buildingArea?: number
  landNature?: string
  structureType?: string
  source?: string
  assetValue?: number
  statusName?: string // 使用状态（在用/闲置/欠费风险）
  [key: string]: any
}

// 资产统计视图对象（接口文档 AssetStatisticsVO）
export interface AssetStatisticsVO {
  totalCount: number
  totalValue: number
  inUseCount: number
  overdueRiskCount: number
}

// 资产查询参数（接口文档 AssetQueryParam）
export interface AssetQueryParam {
  page?: number
  pageSize?: number
  buildingName?: string
  status?: number // 0-闲置 1-在用 2-欠费风险
  source?: string
}

// 接口文档分页结构
export interface ApiPagination {
  page: number
  total: number
  pageSize: number
}

export interface ApiPageResult<T> {
  list: T[]
  pagination: ApiPagination
}
