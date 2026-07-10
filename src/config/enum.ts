// 通用业务枚举 / 字典映射（与后端数据字典保持一致）
// 说明：列表展示优先走 dictStore 动态字典；此处作为常用静态映射兜底。

export const AssetStatusMap: Record<string, { label: string; type: string }> = {
  PENDING: { label: '待启用', type: 'info' },
  IN_USE: { label: '在用', type: 'primary' },
  VACANT: { label: '空置', type: 'warning' },
  LEASED: { label: '出租', type: 'success' },
  RENOVATING: { label: '改造', type: 'warning' },
  TO_DISPOSE: { label: '待处置', type: 'danger' },
  SCRAPPED: { label: '已报废', type: 'info' }
}

export const AssetTypeMap: Record<string, string> = {
  OFFICE: '写字楼',
  COMMERCIAL: '商业综合体',
  PARK: '产业园区',
  APARTMENT: '长租公寓',
  SHOP: '配套商铺',
  IDLE: '闲置自持物业'
}

export const ContractStatusMap: Record<string, { label: string; type: string }> = {
  DRAFT: { label: '草稿', type: 'info' },
  APPROVING: { label: '审批中', type: 'warning' },
  SIGNED: { label: '已签', type: 'primary' },
  EXECUTING: { label: '执行中', type: 'success' },
  EXPIRING: { label: '即将到期', type: 'danger' },
  TERMINATED: { label: '已退租', type: 'info' }
}

export const BillStatusMap: Record<string, { label: string; type: string }> = {
  UNPAID: { label: '待收', type: 'warning' },
  PARTIAL: { label: '部分', type: 'warning' },
  PAID: { label: '已收', type: 'success' },
  OVERDUE: { label: '逾期', type: 'danger' }
}
