import type { MockMethod } from 'vite-plugin-mock'

/**
 * 开发期 Mock（vite-plugin-mock）
 * 仅当 .env.development 中 VITE_USE_MOCK=true 生效。
 * 接口返回结构严格遵循开发文档第 1 章：{ code, message, data, requestId }
 *
 * 系统管理相关接口（组织/用户/角色/字典）使用模块级内存数组存储，
 * 支持在会话内真实增删改查；服务重启后回到初始样例数据。
 * 其余业务模块返回样例数据，用于前端联调与演示。
 */

function ok(data: any, requestId = 'm') {
  return { code: 0, message: 'success', data, requestId }
}

// ============ 内存数据源（系统管理） ============
const orgList: any[] = [
  { id: 'ORG_GROUP', name: '集团总部', type: 'GROUP', parentId: '0', orderNo: 1 },
  { id: 'ORG_EAST', name: '华东公司', type: 'COMPANY', parentId: 'ORG_GROUP', orderNo: 2 },
  { id: 'ORG_PARK', name: '产业园公司', type: 'COMPANY', parentId: 'ORG_GROUP', orderNo: 3 },
  { id: 'ORG_BJ', name: '滨江国际项目', type: 'PROJECT', parentId: 'ORG_EAST', orderNo: 4 },
  { id: 'ORG_YG', name: '阳光商业项目', type: 'PROJECT', parentId: 'ORG_EAST', orderNo: 5 },
  { id: 'ORG_ZZ', name: '智造产业园', type: 'PROJECT', parentId: 'ORG_PARK', orderNo: 6 }
]

const userList: any[] = [
  { id: 'U001', username: 'zhangsan', name: '张三', orgId: 'ORG_GROUP', roleIds: ['R_ADMIN'], status: 'ENABLED' },
  { id: 'U002', username: 'lisi', name: '李四', orgId: 'ORG_EAST', roleIds: ['R_OPS'], status: 'ENABLED' },
  { id: 'U003', username: 'wangwu', name: '王五', orgId: 'ORG_PARK', roleIds: ['R_FIN'], status: 'DISABLED' }
]

const roleList: any[] = [
  { id: 'R_ADMIN', code: 'GROUP_ADMIN', name: '集团管理员', status: 'ENABLED', permissions: ['sys:org:view', 'sys:user:view', 'sys:role:view', 'sys:dict:view'] },
  { id: 'R_OPS', code: 'OPS', name: '运营专员', status: 'ENABLED', permissions: ['asset:view', 'asset:edit'] },
  { id: 'R_FIN', code: 'FIN', name: '财务专员', status: 'ENABLED', permissions: ['fin:bill:view'] }
]

const dictTypeList: any[] = [
  { id: 'DT_ORG_TYPE', name: '组织类型', type: 'OrgType', status: 'ENABLED' },
  { id: 'DT_USER_STATUS', name: '用户状态', type: 'UserStatus', status: 'ENABLED' },
  { id: 'DT_ROLE_STATUS', name: '角色状态', type: 'RoleStatus', status: 'ENABLED' },
  { id: 'DT_CERT_TYPE', name: '权证类型', type: 'CertificateType', status: 'ENABLED' },
  { id: 'DT_HAZARD_LEVEL', name: '隐患等级', type: 'HazardLevel', status: 'ENABLED' }
]

const dictItemMap: Record<string, any[]> = {
  OrgType: [
    { id: 'OI1', type: 'OrgType', label: '集团', value: 'GROUP', orderNo: 1 },
    { id: 'OI2', type: 'OrgType', label: '公司', value: 'COMPANY', orderNo: 2 },
    { id: 'OI3', type: 'OrgType', label: '项目', value: 'PROJECT', orderNo: 3 },
    { id: 'OI4', type: 'OrgType', label: '部门', value: 'DEPT', orderNo: 4 }
  ],
  UserStatus: [
    { id: 'US1', type: 'UserStatus', label: '启用', value: 'ENABLED', orderNo: 1 },
    { id: 'US2', type: 'UserStatus', label: '停用', value: 'DISABLED', orderNo: 2 }
  ],
  RoleStatus: [
    { id: 'RS1', type: 'RoleStatus', label: '启用', value: 'ENABLED', orderNo: 1 },
    { id: 'RS2', type: 'RoleStatus', label: '停用', value: 'DISABLED', orderNo: 2 }
  ],
  CertificateType: [
    { id: 'CT1', type: 'CertificateType', label: '房屋所有权证', value: 'HOUSE_OWNERSHIP', orderNo: 1 },
    { id: 'CT2', type: 'CertificateType', label: '国有土地使用证', value: 'LAND_USE', orderNo: 2 },
    { id: 'CT3', type: 'CertificateType', label: '不动产权证', value: 'REAL_ESTATE', orderNo: 3 },
    { id: 'CT4', type: 'CertificateType', label: '他项权证', value: 'OTHER_RIGHT', orderNo: 4 }
  ],
  HazardLevel: [
    { id: 'HL1', type: 'HazardLevel', label: '一般', value: 'NORMAL', orderNo: 1 },
    { id: 'HL2', type: 'HazardLevel', label: '重大', value: 'MAJOR', orderNo: 2 }
  ]
}

function uid(prefix: string) {
  return prefix + '_' + Math.random().toString(36).slice(2, 8)
}

function toPage(list: any[], pageNum = 1, pageSize = 20) {
  const start = (pageNum - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length, pageNum, pageSize }
}

function buildTree(nodes: any[], parentId = '0'): any[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0))
    .map((n) => ({ ...n, children: buildTree(nodes, n.id) }))
}

// 过滤助手
function filterBy(list: any[], query: any) {
  let r = list
  const kw = (query.keyword || '').trim()
  if (kw) r = r.filter((i) => Object.values(i).some((v) => String(v).includes(kw)))
  const status = query.status
  if (status) r = r.filter((i) => i.status === status)
  return r
}

// 资产台账统计卡片计算
function calcLedgerStat(list: any[]) {
  const total = list.length
  const totalValue = list.reduce((s, a) => s + (Number(a.assetValue) || 0), 0)
  const inUse = list.filter((a) => a.useStatus === 'IN_USE').length
  const arrearsRisk = list.filter((a) => (Number(a.arrears) || 0) > 0).length
  const inUseRate = total ? ((inUse / total) * 100).toFixed(1) + '%' : '0%'
  return { total, totalValue, inUse, inUseRate, arrearsRisk }
}

// ============ 业务样例数据 ============
// 资产台账列表（对齐 Figma「资产管理-资产台账」设计稿）
const assetList = [
  { assetId: 'A1001', assetCode: 'ZC-2026-0001', assetName: '总部办公大楼A座', status: 'IN_USE', buildingName: '总部办公大楼A座', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证第2020001号', address: '上海市黄浦区中山东一路88号', useTerm: '2020-01-01 ~ 2050-12-31', buildingArea: 24000, landNature: '出让/商业办公用地', structureType: '钢筋混凝土框架结构', source: '收购', assetValue: 85000000, assetCondition: '完好', useStatus: 'IN_USE', lessee: '', leaseArea: null, leaseTerm: '', payMethod: '', deposit: null, arrears: null, remark: '集团总部所在地，6层综合办公空间' },
  { assetId: 'A1002', assetCode: 'ZC-2026-0002', assetName: '滨江商业中心B栋', status: 'IN_USE', buildingName: '滨江商业中心B栋', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证浦字第2021007号', address: '上海市浦东新区陆家嘴环路118号', useTerm: '2021-03-01 ~ 2041-02-28', buildingArea: 18500, landNature: '出让/商业综合体用地', structureType: '钢筋混凝土核心筒结构', source: '划转', assetValue: 62000000, assetCondition: '完好', useStatus: 'IN_USE', lessee: '星耀餐饮管理有限公司', leaseArea: 3200, leaseTerm: '2023-01-01 ~ 2027-12-31', payMethod: '季度缴纳，每季度末15日前', deposit: 960000, arrears: null, remark: '3-5层出租为商业餐饮，1-2层自用' },
  { assetId: 'A1003', assetCode: 'ZC-2026-0003', assetName: '科技产业园C区厂房', status: 'IN_USE', buildingName: '科技产业园C区厂房', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证闵字第2019021号', address: '上海市闵行区莘庄工业区88号', useTerm: '2019-06-01 ~ 2039-05-31', buildingArea: 12000, landNature: '出让/工业用地', structureType: '钢结构厂房', source: '划拨', assetValue: 28000000, assetCondition: '完好', useStatus: 'IN_USE', lessee: '芯锐半导体科技股份有限公司', leaseArea: 12000, leaseTerm: '2022-01-01 ~ 2026-12-31', payMethod: '月缴，每月5日前', deposit: 200000, arrears: 600000, remark: '整体出租，租户2024年起存在逾期' },
  { assetId: 'A1004', assetCode: 'ZC-2026-0004', assetName: '老城区仓储基地D栋', status: 'VACANT', buildingName: '老城区仓储基地D栋', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证静字第2015035号', address: '上海市静安区长安路325号', useTerm: '2015-03-01 ~ 2035-02-28', buildingArea: 5000, landNature: '划拨/仓储物流用地', structureType: '钢结构', source: '划转', assetValue: 15000000, assetCondition: '需修缮', useStatus: 'VACANT', lessee: '', leaseArea: null, leaseTerm: '', payMethod: '', deposit: null, arrears: null, remark: '已闲置180天，屋顶部分区域需修缮' },
  { assetId: 'A1005', assetCode: 'ZC-2026-0005', assetName: '南郊综合服务楼E座', status: 'IN_USE', buildingName: '南郊综合服务楼E座', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证徐字第2022018号', address: '上海市徐汇区龙吴路577号', useTerm: '2022-01-01 ~ 2042-12-31', buildingArea: 8200, landNature: '出让/综合服务用地', structureType: '钢筋混凝土框架结构', source: '收购', assetValue: 35000000, assetCondition: '完好', useStatus: 'IN_USE', lessee: '优享健身服务有限公司', leaseArea: 2500, leaseTerm: '2023-06-01 ~ 2028-05-31', payMethod: '月缴，每月10日前', deposit: 150000, arrears: null, remark: '1层出租为健身中心，2-4层办公' },
  { assetId: 'A1006', assetCode: 'ZC-2026-0006', assetName: '东郊培训中心F楼', status: 'IN_USE', buildingName: '东郊培训中心F楼', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证崇字第2023026号', address: '上海市崇明区安亭镇翠竹路9号', useTerm: '2023-04-01 ~ 2043-03-31', buildingArea: 4500, landNature: '出让/教育培训用地', structureType: '钢筋混凝土框架结构', source: '划拨', assetValue: 18000000, assetCondition: '完好', useStatus: 'IN_USE', lessee: '', leaseArea: null, leaseTerm: '', payMethod: '', deposit: null, arrears: null, remark: '集团培训中心专用，不对外出租' },
  { assetId: 'A1007', assetCode: 'ZC-2026-0007', assetName: '旧员工宿舍G栋', status: 'VACANT', buildingName: '旧员工宿舍G栋', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证杨字第2010020号', address: '上海市杨浦区控江路156号', useTerm: '2010-01-01 ~ 2030-12-31', buildingArea: 3800, landNature: '划拨/住宅用地', structureType: '砖混结构', source: '划拨', assetValue: 5000000, assetCondition: '老化', useStatus: 'VACANT', lessee: '', leaseArea: null, leaseTerm: '', payMethod: '', deposit: null, arrears: null, remark: '砖混结构老化严重，已闭楼待改造' },
  { assetId: 'A1008', assetCode: 'ZC-2026-0008', assetName: '北郊数据中心机房H座', status: 'IN_USE', buildingName: '北郊数据中心机房H座', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证宝字第2024009号', address: '上海市宝山区罗泾镇川纪路100号', useTerm: '2024-01-01 ~ 2054-12-31', buildingArea: 6000, landNature: '出让/工业用地（数据中心）', structureType: '钢筋混凝土结构', source: '收购', assetValue: 42000000, assetCondition: '完好', useStatus: 'IN_USE', lessee: '云信科技有限公司', leaseArea: 2000, leaseTerm: '2024-06-01 ~ 2029-05-31', payMethod: '月缴，每月1日前', deposit: 300000, arrears: null, remark: '2层出租为IDC机房托管区域' },
  { assetId: 'A1009', assetCode: 'ZC-2026-0009', assetName: '西郊物流仓库I栋', status: 'FROZEN', buildingName: '西郊物流仓库I栋', ownerUnit: '中国国有资产运营集团有限公司', certNo: '沪房权证松字第2018010号', address: '上海市松江区九亭镇漕亭路66号', useTerm: '2018-08-01 ~ 2038-07-31', buildingArea: 9500, landNature: '出让/仓储物流用地', structureType: '钢结构', source: '划转', assetValue: 22000000, assetCondition: '需修缮', useStatus: 'FROZEN', lessee: '迅捷物流股份有限公司', leaseArea: 9500, leaseTerm: '2020-03-01 ~ 2025-02-28', payMethod: '季度缴纳，每季度首月10日前', deposit: 500000, arrears: 1200000, remark: '因产权纠纷被法院查封，暂停处置' }
]

const certArchive = [
  { certId: 'C001', certNo: '沪(2026)不动产权第0001号', certType: 'REAL_ESTATE', assetName: '滨江国际写字楼 A 座', owner: '集团总部', acquireDate: '2021-05-12', expireDate: '2031-05-11', status: 'NORMAL', fileCount: 3 },
  { certId: 'C002', certNo: '沪(2026)不动产权第0002号', certType: 'REAL_ESTATE', assetName: '阳光商业广场', owner: '华东公司', acquireDate: '2020-09-01', expireDate: '2026-09-30', status: 'EXPIRING', fileCount: 2 }
]

const borrowList = [
  { borrowId: 'B001', certNo: '沪(2026)不动产权第0001号', borrower: '李四', dept: '招商部', purpose: '银行抵押', borrowDate: '2026-06-01', dueDate: '2026-07-01', returnDate: '', status: 'BORROWED' }
]

const tenantList = [
  { tenantId: 'T001', name: '某科技有限公司', type: 'ENTERPRISE', creditCode: '91310000XXXX', contact: '陈先生', industry: '信息技术', creditLevel: 'A', contractCount: 2 },
  { tenantId: 'T002', name: '某餐饮品牌', type: 'ENTERPRISE', creditCode: '91310000YYYY', contact: '林女士', industry: '餐饮', creditLevel: 'B', contractCount: 1 }
]

const leadList = [
  { leadId: 'L001', customer: '戴先生', phone: '138****0001', intention: '写字楼', area: '800㎡', source: '官网', followStatus: 'FOLLOWING', owner: '王招商', createTime: '2026-06-10' },
  { leadId: 'L002', customer: '周女士', phone: '139****0002', intention: '商铺', area: '200㎡', source: '中介', followStatus: 'SIGNED', owner: '王招商', createTime: '2026-05-22' }
]

const contractList = [
  { contractId: 'CT-0001', contractNo: 'HT-2026-0001', assetName: '滨江国际写字楼 A 座', tenant: '某科技有限公司', startDate: '2026-01-01', endDate: '2028-12-31', rent: 86400, status: 'EXECUTING' },
  { contractId: 'CT-0002', contractNo: 'HT-2026-0002', assetName: '阳光商业广场', tenant: '某餐饮品牌', startDate: '2026-03-01', endDate: '2027-02-28', rent: 52000, status: 'EXECUTING' }
]

const billList = [
  { billId: 'BL001', billNo: 'B-2026-0001', tenant: '某科技有限公司', contractNo: 'HT-2026-0001', period: '2026-07', amount: 86400, tax: 7776, status: 'PAID' },
  { billId: 'BL002', billNo: 'B-2026-0002', tenant: '某餐饮品牌', contractNo: 'HT-2026-0002', period: '2026-07', amount: 52000, tax: 4680, status: 'OVERDUE' }
]

const collectionList = [
  { collectionId: 'CO001', billNo: 'B-2026-0002', tenant: '某餐饮品牌', amount: 52000, overdueDays: 18, method: '电话', lastTime: '2026-07-05', result: '承诺月底前缴款', nextFollow: '2026-07-20' }
]

const invoiceList = [
  { invoiceId: 'IN001', invoiceNo: '2441700000001', billNo: 'B-2026-0001', tenant: '某科技有限公司', amount: 86400, tax: 7776, date: '2026-07-02', receiver: '陈先生', status: 'ISSUED' }
]

const inventoryList = [
  { taskId: 'IV001', taskName: '2026 半年度全面盘点', scope: '集团全部资产', executor: '资产管理部', planDate: '2026-06-30', status: 'DONE', scanned: 1286, total: 1286 },
  { taskId: 'IV002', taskName: '华东公司季度盘点', scope: '华东公司在管资产', executor: '华东公司', planDate: '2026-09-30', status: 'PENDING', scanned: 320, total: 860 }
]

const receiptList = [
  { receiptId: 'RC001', assetName: '智造产业园 5 号厂房', source: '在建工程转固', receiveDept: '智造产业园', receiveUser: '赵运营', receiveDate: '2026-04-18', status: 'DONE' }
]

const renovationList = [
  { renovationId: 'RV001', assetName: '阳光商业广场中庭', content: '中庭改造升级', budget: 3500000, startDate: '2026-05-10', endDate: '2026-08-30', status: 'DOING', approveStatus: 'APPROVED' }
]

const idleList = [
  { idleId: 'ID001', assetName: '阳光商业广场 B 座 3F', area: 4200, idleDays: 210, reason: '业态调整', suggest: '引入体验式业态', status: 'WARN' }
]

const planList = [
  { planId: 'PL001', planName: '月度消防巡检', area: '集团全部项目', type: 'DAILY', freq: 'MONTH', executor: '安全巡检员', startDate: '2026-07-01', endDate: '2026-12-31', status: 'RUNNING' }
]

const inspectList = [
  { inspectId: 'IP001', planName: '月度消防巡检', assetName: '滨江国际写字楼', executor: '安全巡检员', inspectDate: '2026-07-08', result: 'NORMAL', items: 12, abnormal: 0 }
]

const workOrderList = [
  { woId: 'WO001', title: '空调漏水维修', assetName: '滨江国际写字楼 A 座', priority: 'HIGH', source: '巡检', handler: '工程维保', status: 'DOING', createTime: '2026-07-06' }
]

const hazardList = [
  { hazardId: 'HZ001', title: '消防通道堆放杂物', assetName: '阳光商业广场', level: 'MAJOR', reporter: '安全巡检员', status: 'PENDING', deadline: '2026-07-15' }
]

const warnList = [
  { warnId: 'WN001', type: '合同到期', title: 'HT-2026-0002 即将到期', target: '某餐饮品牌', level: 'HIGH', time: '2026-07-09', status: 'UNREAD' },
  { warnId: 'WN002', type: '租金欠费', title: 'B-2026-0002 已逾期', target: '某餐饮品牌', level: 'HIGH', time: '2026-07-08', status: 'READ' }
]

const logList = [
  { logId: 'LG001', user: '张三', org: '集团总部', module: '资产台账', action: '查询', object: 'ZC-2026-0001', ip: '10.0.0.12', time: '2026-07-10 09:12:33', result: 'SUCCESS' },
  { logId: 'LG002', user: '李四', org: '华东公司', module: '租赁合同', action: '新增', object: 'HT-2026-0003', ip: '10.0.0.31', time: '2026-07-10 10:01:20', result: 'SUCCESS' }
]

const messageTemplateList = [
  { tplId: 'TP001', name: '合同到期提醒', scene: 'CONTRACT_EXPIRE', channel: 'SMS,EMAIL', content: '您的合同将于 {days} 天后到期，请及时处理。', status: 'ENABLED' }
]

const flowList = [
  { flowId: 'FL001', name: '资产处置审批流', key: 'asset_dispose', category: '资产', version: 2, nodes: 5, status: 'ENABLED' }
]

const regionTree = [
  {
    id: 'city_sh', name: '上海', children: [
      { id: 'proj_bj', name: '滨江国际项目', children: [{ id: 'bld_a', name: 'A 座' }] },
      { id: 'proj_yg', name: '阳光商业项目', children: [{ id: 'bld_main', name: '主楼' }] }
    ]
  },
  { id: 'city_hz', name: '杭州', children: [{ id: 'proj_zz', name: '智造产业园', children: [{ id: 'bld_3', name: '3 号厂房' }] }] }
]

// ============ Mock 接口列表 ============
export default [
  // 登录
  {
    url: '/api/login/account',
    method: 'post',
    response: () => ok({ token: 'mock-token-xxxx', refreshToken: 'mock-refresh-xxxx' }, 'm1')
  },

  // 用户信息 + 菜单 + 权限
  {
    url: '/api/user/info',
    method: 'get',
    response: () => ok({
      userInfo: {
        userId: 'U001',
        userName: '张三',
        orgId: 'ORG_GROUP',
        roles: ['GROUP_ADMIN'],
        permissions: [
          'sys:org:view', 'sys:org:edit',
          'sys:user:view', 'sys:user:edit',
          'sys:role:view', 'sys:role:edit',
          'sys:dict:view', 'sys:dict:edit',
          'sys:msg:view', 'sys:msg:edit',
          'sys:flow:view', 'sys:flow:edit',
          'sys:log:view',
          'gis:view',
          'cert:view', 'cert:borrow:view', 'cert:borrow:edit',
          'asset:view', 'asset:edit', 'asset:dispose',
          'asset:inventory:view', 'asset:receipt:view', 'asset:renovation:view', 'asset:idle:view',
          'lease:view', 'lease:tenant:view', 'lease:tenant:edit',
          'lease:contract:view', 'lease:contract:edit', 'lease:contract:sign',
          'lease:lead:view',
          'fin:bill:view', 'fin:bill:edit', 'fin:collection:view', 'fin:writeoff:view', 'fin:invoice:view',
          'safety:view', 'safety:plan:view', 'safety:plan:edit', 'safety:inspect:view',
          'safety:wo:view', 'safety:wo:edit', 'safety:hazard:view', 'safety:hazard:edit', 'safety:warn:view',
          'report:screen:view', 'report:view', 'report:state:view', 'report:custom:view'
        ]
      },
      menus: [
        {
          id: 'm_sys', parentId: '0', title: '系统基础管理', icon: 'Setting', path: 'system',
          children: [
            { id: 'm_sys_org', parentId: 'm_sys', title: '组织架构', path: 'system/org', component: 'system/OrgManage', permission: 'sys:org:view' },
            { id: 'm_sys_user', parentId: 'm_sys', title: '用户管理', path: 'system/user', component: 'system/UserManage', permission: 'sys:user:view' },
            { id: 'm_sys_role', parentId: 'm_sys', title: '角色管理', path: 'system/role', component: 'system/RoleManage', permission: 'sys:role:view' },
            { id: 'm_sys_dict', parentId: 'm_sys', title: '字典管理', path: 'system/dict', component: 'system/DictManage', permission: 'sys:dict:view' },
            { id: 'm_sys_msg', parentId: 'm_sys', title: '消息中心', path: 'system/message', component: 'system/MessageCenter', permission: 'sys:msg:view' },
            { id: 'm_sys_flow', parentId: 'm_sys', title: '流程设计器', path: 'system/flow', component: 'system/FlowDesigner', permission: 'sys:flow:view' },
            { id: 'm_sys_log', parentId: 'm_sys', title: '操作日志', path: 'system/log', component: 'system/OperLog', permission: 'sys:log:view' }
          ]
        },
        {
          id: 'm_gis', parentId: '0', title: 'GIS 地图分布', icon: 'MapLocation', path: 'gis/map', component: 'gis/GisMap', permission: 'gis:view'
        },
        {
          id: 'm_cert', parentId: '0', title: '权证管理', icon: 'Postcard', path: 'cert/overview', component: 'certificate/Overview', permission: 'cert:view',
          children: [
            { id: 'm_cert_overview', parentId: 'm_cert', title: '权证概览', path: 'cert/overview', component: 'certificate/Overview', permission: 'cert:view' },
            { id: 'm_cert_archive', parentId: 'm_cert', title: '电子档案库', path: 'cert/archive', component: 'certificate/Archive', permission: 'cert:view' },
            { id: 'm_cert_expire', parentId: 'm_cert', title: '到期预警', path: 'cert/expire', component: 'certificate/ExpireWarn', permission: 'cert:view' },
            { id: 'm_cert_household', parentId: 'm_cert', title: '一户一档', path: 'cert/household', component: 'certificate/Household', permission: 'cert:view' },
            { id: 'm_cert_borrow', parentId: 'm_cert', title: '借阅管理', path: 'cert/borrow', component: 'certificate/Borrow', permission: 'cert:borrow:view' }
          ]
        },
        {
          id: 'm_asset', parentId: '0', title: '资产全生命周期', icon: 'OfficeBuilding', path: 'asset/list', component: 'asset/AssetList', permission: 'asset:view',
          children: [
            { id: 'm_asset_list', parentId: 'm_asset', title: '资产台账', path: 'asset/list', component: 'asset/AssetList', permission: 'asset:view' },
            { id: 'm_asset_dash', parentId: 'm_asset', title: '资产仪表盘', path: 'asset/dashboard', component: 'asset/Dashboard', permission: 'asset:view' },
            { id: 'm_asset_detail', parentId: 'm_asset', title: '资产详情', path: 'asset/detail/:id', component: 'asset/AssetDetail', permission: 'asset:view', hidden: true },
            { id: 'm_asset_create', parentId: 'm_asset', title: '资产建档', path: 'asset/create', component: 'asset/AssetForm', permission: 'asset:edit' },
            { id: 'm_asset_transfer', parentId: 'm_asset', title: '调拨处置', path: 'asset/transfer', component: 'asset/AssetTransfer', permission: 'asset:dispose' },
            { id: 'm_asset_inventory', parentId: 'm_asset', title: '智能盘点', path: 'asset/inventory', component: 'asset/Inventory', permission: 'asset:inventory:view' },
            { id: 'm_asset_receipt', parentId: 'm_asset', title: '接收登记', path: 'asset/receipt', component: 'asset/Receipt', permission: 'asset:receipt:view' },
            { id: 'm_asset_renovation', parentId: 'm_asset', title: '改扩建管理', path: 'asset/renovation', component: 'asset/Renovation', permission: 'asset:renovation:view' },
            { id: 'm_asset_idle', parentId: 'm_asset', title: '闲置预警', path: 'asset/idle', component: 'asset/IdleWarn', permission: 'asset:idle:view' }
          ]
        },
        {
          id: 'm_lease', parentId: '0', title: '招商租赁', icon: 'Sell', path: 'lease/board', component: 'lease/Board', permission: 'lease:view',
          children: [
            { id: 'm_lease_board', parentId: 'm_lease', title: '运营看板', path: 'lease/board', component: 'lease/Board', permission: 'lease:view' },
            { id: 'm_lease_lead', parentId: 'm_lease', title: '招商线索', path: 'lease/lead', component: 'lease/Lead', permission: 'lease:lead:view' },
            { id: 'm_lease_tenant', parentId: 'm_lease', title: '租户档案', path: 'lease/tenant', component: 'lease/Tenant', permission: 'lease:tenant:view' },
            { id: 'm_lease_contract', parentId: 'm_lease', title: '合同管理', path: 'lease/contract', component: 'lease/Contract', permission: 'lease:contract:view' },
            { id: 'm_lease_contract_form', parentId: 'm_lease', title: '合同起草', path: 'lease/contract/:id', component: 'lease/ContractForm', permission: 'lease:contract:edit', hidden: true },
            { id: 'm_lease_sign', parentId: 'm_lease', title: '电子签章', path: 'lease/sign', component: 'lease/Sign', permission: 'lease:contract:sign' }
          ]
        },
        {
          id: 'm_fin', parentId: '0', title: '业财一体化', icon: 'Money', path: 'finance/bill', component: 'finance/Bill', permission: 'fin:bill:view',
          children: [
            { id: 'm_fin_bill', parentId: 'm_fin', title: '账单管理', path: 'finance/bill', component: 'finance/Bill', permission: 'fin:bill:view' },
            { id: 'm_fin_collection', parentId: 'm_fin', title: '催收管理', path: 'finance/collection', component: 'finance/Collection', permission: 'fin:collection:view' },
            { id: 'm_fin_writeoff', parentId: 'm_fin', title: '核销管理', path: 'finance/writeoff', component: 'finance/WriteOff', permission: 'fin:writeoff:view' },
            { id: 'm_fin_invoice', parentId: 'm_fin', title: '票据管理', path: 'finance/invoice', component: 'finance/Invoice', permission: 'fin:invoice:view' }
          ]
        },
        {
          id: 'm_safety', parentId: '0', title: '安巡智管', icon: 'Bell', path: 'safety/dashboard', component: 'safety/Dashboard', permission: 'safety:view',
          children: [
            { id: 'm_safety_dash', parentId: 'm_safety', title: '安巡总览', path: 'safety/dashboard', component: 'safety/Dashboard', permission: 'safety:view' },
            { id: 'm_safety_plan', parentId: 'm_safety', title: '巡检计划', path: 'safety/plan', component: 'safety/Plan', permission: 'safety:plan:view' },
            { id: 'm_safety_inspect', parentId: 'm_safety', title: '现场巡检', path: 'safety/inspect', component: 'safety/Inspect', permission: 'safety:inspect:view' },
            { id: 'm_safety_wo', parentId: 'm_safety', title: '维保工单', path: 'safety/workorder', component: 'safety/WorkOrder', permission: 'safety:wo:view' },
            { id: 'm_safety_hazard', parentId: 'm_safety', title: '隐患台账', path: 'safety/hazard', component: 'safety/Hazard', permission: 'safety:hazard:view' },
            { id: 'm_safety_warn', parentId: 'm_safety', title: '预警中心', path: 'safety/warn', component: 'safety/WarnCenter', permission: 'safety:warn:view' },
            { id: 'm_safety_board', parentId: 'm_safety', title: '隐患看板', path: 'safety/board', component: 'safety/HazardBoard', permission: 'safety:view' }
          ]
        },
        {
          id: 'm_report', parentId: '0', title: '经营分析', icon: 'DataLine', path: 'report/screen', component: 'report/Screen', permission: 'report:screen:view',
          children: [
            { id: 'm_report_screen', parentId: 'm_report', title: '数据大屏', path: 'report/screen', component: 'report/Screen', permission: 'report:screen:view' },
            { id: 'm_report_asset', parentId: 'm_report', title: '资产台账报表', path: 'report/asset-ledger', component: 'report/AssetLedger', permission: 'report:view' },
            { id: 'm_report_contract', parentId: 'm_report', title: '租赁合约报表', path: 'report/contract', component: 'report/ContractReport', permission: 'report:view' },
            { id: 'm_report_collection', parentId: 'm_report', title: '租金收缴报表', path: 'report/collection', component: 'report/CollectionReport', permission: 'report:view' },
            { id: 'm_report_state', parentId: 'm_report', title: '国资报表', path: 'report/state-owned', component: 'report/StateOwned', permission: 'report:state:view' },
            { id: 'm_report_custom', parentId: 'm_report', title: '自定义报表', path: 'report/custom', component: 'report/CustomReport', permission: 'report:custom:view' }
          ]
        }
      ]
    }, 'm2')
  },

  // ============ 系统管理：组织 ============
  { url: '/api/system/v1/org/tree', method: 'get', response: () => ok(buildTree(orgList), 's1') },
  {
    url: '/api/system/v1/org/page', method: 'get',
    response: ({ query }: any) => {
      const kw = (query.keyword || '').trim()
      let filtered = orgList
      if (kw) filtered = filtered.filter((o) => o.name.includes(kw))
      if (query.parentId) filtered = filtered.filter((o) => o.parentId === query.parentId)
      return ok(toPage(filtered, Number(query.pageNum), Number(query.pageSize)), 's2')
    }
  },
  { url: '/api/system/v1/org', method: 'post', response: ({ body }: any) => { const n = { id: uid('ORG'), parentId: body.parentId || '0', orderNo: orgList.length + 1, ...body }; orgList.push(n); return ok(n, 's3') } },
  { url: /\/api\/system\/v1\/org\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = orgList.findIndex((o) => o.id === id); if (i > -1) orgList[i] = { ...orgList[i], ...body }; return ok(orgList[i], 's4') } },
  { url: /\/api\/system\/v1\/org\/[^/]+$/, method: 'delete', response: ({ url }: any) => { const id = url.split('/').pop()!; const toRemove = new Set<string>([id]); let changed = true; while (changed) { changed = false; orgList.forEach((o) => { if (o.parentId && toRemove.has(o.parentId) && !toRemove.has(o.id)) { toRemove.add(o.id); changed = true } }) } for (let i = orgList.length - 1; i >= 0; i--) { if (toRemove.has(orgList[i].id)) orgList.splice(i, 1) } return ok(true, 's5') } },

  // ============ 系统管理：用户 ============
  { url: '/api/system/v1/user/page', method: 'get', response: ({ query }: any) => { const kw = (query.keyword || '').trim(); const f = kw ? userList.filter((u) => u.name.includes(kw) || u.username.includes(kw)) : userList; return ok(toPage(f, Number(query.pageNum), Number(query.pageSize)), 's6') } },
  { url: '/api/system/v1/user', method: 'post', response: ({ body }: any) => { const n = { id: uid('U'), status: 'ENABLED', ...body }; userList.push(n); return ok(n, 's7') } },
  { url: /\/api\/system\/v1\/user\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = userList.findIndex((u) => u.id === id); if (i > -1) userList[i] = { ...userList[i], ...body }; return ok(userList[i], 's8') } },
  { url: /\/api\/system\/v1\/user\/[^/]+$/, method: 'delete', response: ({ url }: any) => { const id = url.split('/').pop()!; const i = userList.findIndex((u) => u.id === id); if (i > -1) userList.splice(i, 1); return ok(true, 's9') } },

  // ============ 系统管理：角色 ============
  { url: '/api/system/v1/role/page', method: 'get', response: ({ query }: any) => { const kw = (query.keyword || '').trim(); const f = kw ? roleList.filter((r) => r.name.includes(kw) || r.code.includes(kw)) : roleList; return ok(toPage(f, Number(query.pageNum), Number(query.pageSize)), 's10') } },
  { url: '/api/system/v1/role', method: 'post', response: ({ body }: any) => { const n = { id: uid('R'), status: 'ENABLED', permissions: [], ...body }; roleList.push(n); return ok(n, 's11') } },
  { url: /\/api\/system\/v1\/role\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = roleList.findIndex((r) => r.id === id); if (i > -1) roleList[i] = { ...roleList[i], ...body }; return ok(roleList[i], 's12') } },
  { url: /\/api\/system\/v1\/role\/[^/]+$/, method: 'delete', response: ({ url }: any) => { const id = url.split('/').pop()!; const i = roleList.findIndex((r) => r.id === id); if (i > -1) roleList.splice(i, 1); return ok(true, 's13') } },

  // ============ 系统管理：字典 ============
  { url: '/api/system/v1/dict/type/page', method: 'get', response: ({ query }: any) => { const kw = (query.keyword || '').trim(); const f = kw ? dictTypeList.filter((d) => d.name.includes(kw) || d.type.includes(kw)) : dictTypeList; return ok(toPage(f, Number(query.pageNum), Number(query.pageSize)), 's14') } },
  { url: '/api/system/v1/dict/type', method: 'post', response: ({ body }: any) => { const n = { id: uid('DT'), status: 'ENABLED', ...body }; dictTypeList.push(n); return ok(n, 's15') } },
  { url: /\/api\/system\/v1\/dict\/type\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = dictTypeList.findIndex((d) => d.id === id); if (i > -1) dictTypeList[i] = { ...dictTypeList[i], ...body }; return ok(dictTypeList[i], 's16') } },
  { url: /\/api\/system\/v1\/dict\/type\/[^/]+$/, method: 'delete', response: ({ url }: any) => { const id = url.split('/').pop()!; const i = dictTypeList.findIndex((d) => d.id === id); if (i > -1) { const t = dictTypeList[i].type; dictTypeList.splice(i, 1); delete dictItemMap[t] } return ok(true, 's17') } },
  { url: '/api/system/v1/dict/items', method: 'get', response: ({ query }: any) => { const map: Record<string, { label: string; value: string }[]> = { AssetStatus: [{ label: '待启用', value: 'PENDING' }, { label: '在用', value: 'IN_USE' }, { label: '空置', value: 'VACANT' }, { label: '出租', value: 'LEASED' }, { label: '改造', value: 'RENOVATING' }, { label: '待处置', value: 'TO_DISPOSE' }, { label: '已报废', value: 'SCRAPPED' }], AssetType: [{ label: '写字楼', value: 'OFFICE' }, { label: '商业综合体', value: 'COMMERCIAL' }, { label: '产业园区', value: 'PARK' }, { label: '长租公寓', value: 'APARTMENT' }, { label: '配套商铺', value: 'SHOP' }, { label: '闲置自持物业', value: 'IDLE' }], ContractStatus: [{ label: '草稿', value: 'DRAFT' }, { label: '审批中', value: 'APPROVING' }, { label: '已签', value: 'SIGNED' }, { label: '执行中', value: 'EXECUTING' }, { label: '即将到期', value: 'EXPIRING' }, { label: '已退租', value: 'TERMINATED' }], BillStatus: [{ label: '待收', value: 'UNPAID' }, { label: '部分', value: 'PARTIAL' }, { label: '已收', value: 'PAID' }, { label: '逾期', value: 'OVERDUE' }], CertificateType: dictItemMap.CertificateType?.map((i) => ({ label: i.label, value: i.value })) || [], HazardLevel: dictItemMap.HazardLevel?.map((i) => ({ label: i.label, value: i.value })) || [] }; return ok(map[query.type] || [], 'm3') } },
  { url: '/api/system/v1/dict/item/list', method: 'get', response: ({ query }: any) => { const list = dictItemMap[query.type] || []; const kw = (query.keyword || '').trim(); const f = kw ? list.filter((i) => i.label.includes(kw) || i.value.includes(kw)) : list; return ok(toPage(f, Number(query.pageNum), Number(query.pageSize)), 's18') } },
  { url: '/api/system/v1/dict/item', method: 'post', response: ({ body }: any) => { const t = body.type; if (!dictItemMap[t]) dictItemMap[t] = []; const n = { id: uid('DI'), orderNo: dictItemMap[t].length + 1, ...body }; dictItemMap[t].push(n); return ok(n, 's19') } },
  { url: /\/api\/system\/v1\/dict\/item\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; let u: any = null; for (const t of Object.keys(dictItemMap)) { const i = dictItemMap[t].findIndex((x) => x.id === id); if (i > -1) { dictItemMap[t][i] = { ...dictItemMap[t][i], ...body }; u = dictItemMap[t][i]; break } } return ok(u, 's20') } },
  { url: /\/api\/system\/v1\/dict\/item\/[^/]+$/, method: 'delete', response: ({ url }: any) => { const id = url.split('/').pop()!; for (const t of Object.keys(dictItemMap)) { const i = dictItemMap[t].findIndex((x) => x.id === id); if (i > -1) { dictItemMap[t].splice(i, 1); break } } return ok(true, 's21') } },

  // ============ 系统管理：消息中心 ============
  { url: '/api/system/v1/message/template/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(messageTemplateList, query), Number(query.pageNum), Number(query.pageSize)), 's22') },
  { url: '/api/system/v1/message/template', method: 'post', response: ({ body }: any) => { const n = { id: uid('TP'), status: 'ENABLED', ...body }; messageTemplateList.push(n); return ok(n, 's23') } },
  { url: /\/api\/system\/v1\/message\/template\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = messageTemplateList.findIndex((t) => t.tplId === id); if (i > -1) messageTemplateList[i] = { ...messageTemplateList[i], ...body }; return ok(messageTemplateList[i], 's24') } },
  { url: /\/api\/system\/v1\/message\/template\/[^/]+$/, method: 'delete', response: ({ url }: any) => { const id = url.split('/').pop()!; const i = messageTemplateList.findIndex((t) => t.tplId === id); if (i > -1) messageTemplateList.splice(i, 1); return ok(true, 's25') } },

  // ============ 系统管理：流程引擎 ============
  { url: '/api/system/v1/flow/definition/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(flowList, query), Number(query.pageNum), Number(query.pageSize)), 's26') },
  { url: '/api/system/v1/flow/definition', method: 'post', response: ({ body }: any) => { const n = { id: uid('FL'), version: 1, status: 'ENABLED', ...body }; flowList.push(n); return ok(n, 's27') } },
  { url: /\/api\/system\/v1\/flow\/definition\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = flowList.findIndex((f) => f.flowId === id); if (i > -1) flowList[i] = { ...flowList[i], ...body }; return ok(flowList[i], 's28') } },
  { url: /\/api\/system\/v1\/flow\/definition\/[^/]+$/, method: 'delete', response: ({ url }: any) => { const id = url.split('/').pop()!; const i = flowList.findIndex((f) => f.flowId === id); if (i > -1) flowList.splice(i, 1); return ok(true, 's29') } },

  // ============ 系统管理：操作日志 ============
  { url: '/api/system/v1/log/page', method: 'get', response: ({ query }: any) => { const kw = (query.keyword || '').trim(); let f = logList; if (kw) f = f.filter((l) => l.user.includes(kw) || l.module.includes(kw) || l.object.includes(kw)); if (query.module) f = f.filter((l) => l.module === query.module); return ok(toPage(f, Number(query.pageNum), Number(query.pageSize)), 's30') } },

  // ============ GIS ============
  {
    url: '/api/gis/v1/asset/points', method: 'get',
    response: () => ok([
      { id: 'A1001', name: '滨江国际写字楼 A 座', lng: 121.5, lat: 31.2, assetType: 'OFFICE', area: 32000, leaseRate: 0.82, status: 'LEASED' },
      { id: 'A1002', name: '阳光商业广场', lng: 121.47, lat: 31.22, assetType: 'COMMERCIAL', area: 56000, leaseRate: 0.45, status: 'VACANT' },
      { id: 'A1003', name: '智造产业园 3 号厂房', lng: 120.2, lat: 30.3, assetType: 'PARK', area: 18000, leaseRate: 1, status: 'IN_USE' }
    ], 'g1')
  },
  { url: '/api/gis/v1/asset/heatmap', method: 'get', response: () => ok([{ lng: 121.5, lat: 31.2, weight: 80 }, { lng: 121.47, lat: 31.22, weight: 45 }, { lng: 120.2, lat: 30.3, weight: 100 }], 'g2') },
  { url: '/api/gis/v1/region/tree', method: 'get', response: () => ok(regionTree, 'g3') },

  // ============ 权证管理 ============
  {
    url: '/api/cert/v1/overview', method: 'get',
    response: () => ok({
      total: 1024,
      byType: [{ name: '房屋所有权证', value: 520 }, { name: '不动产权证', value: 410 }, { name: '他项权证', value: 94 }],
      expiring: 12,
      restricted: 5,
      expireList: [
        { certNo: '沪(2026)不动产权第0001号', assetName: '滨江国际写字楼', expireDate: '2026-12-31', remainDays: 174, status: '待处理' },
        { certNo: '沪(2026)不动产权第0002号', assetName: '阳光商业广场', expireDate: '2026-09-30', remainDays: 82, status: '续期中' }
      ]
    }, 'c1')
  },
  { url: '/api/cert/v1/archive/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(certArchive, query), Number(query.pageNum), Number(query.pageSize)), 'c2') },
  { url: '/api/cert/v1/archive', method: 'post', response: ({ body }: any) => { const n = { certId: uid('C'), status: 'NORMAL', fileCount: 1, ...body }; certArchive.push(n); return ok(n, 'c3') } },
  { url: /\/api\/cert\/v1\/archive\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = certArchive.findIndex((c) => c.certId === id); if (i > -1) certArchive[i] = { ...certArchive[i], ...body }; return ok(certArchive[i], 'c4') } },
  { url: '/api/cert/v1/expire', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(certArchive, query), Number(query.pageNum), Number(query.pageSize)), 'c5') },
  { url: '/api/cert/v1/household', method: 'get', response: ({ query }: any) => { const assetId = query.assetId; const list = assetId ? certArchive.filter((c) => c.assetName.includes(assetId)) : certArchive; return ok(list, 'c6') } },
  { url: '/api/cert/v1/borrow/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(borrowList, query), Number(query.pageNum), Number(query.pageSize)), 'c7') },
  { url: '/api/cert/v1/borrow', method: 'post', response: ({ body }: any) => { const n = { borrowId: uid('B'), status: 'BORROWED', returnDate: '', ...body }; borrowList.push(n); return ok(n, 'c8') } },
  { url: /\/api\/cert\/v1\/borrow\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = borrowList.findIndex((b) => b.borrowId === id); if (i > -1) borrowList[i] = { ...borrowList[i], ...body }; return ok(borrowList[i], 'c9') } },

  // ============ 资产全生命周期 ============
  {
    url: '/api/asset/v1/asset/ledger-stat', method: 'get',
    response: () => ok(calcLedgerStat(assetList), 'a0')
  },
  {
    url: '/api/asset/v1/asset/page', method: 'get',
    response: ({ query }: any) => {
      const kw = (query.keyword || '').trim()
      let f = assetList
      if (kw) f = f.filter((a) => [a.buildingName, a.ownerUnit, a.certNo, a.address, a.assetName].some((v) => (v || '').includes(kw)))
      if (query.buildingName) f = f.filter((a) => (a.buildingName || '').includes(query.buildingName))
      if (query.ownerUnit) f = f.filter((a) => (a.ownerUnit || '') === query.ownerUnit)
      if (query.source) f = f.filter((a) => a.source === query.source)
      if (query.useStatus) f = f.filter((a) => a.useStatus === query.useStatus)
      if (query.status) f = f.filter((a) => a.status === query.status)
      if (query.assetType) f = f.filter((a) => a.assetType === query.assetType)
      if (query.orgId) f = f.filter((a) => a.orgId === query.orgId)
      return ok(toPage(f, Number(query.pageNum), Number(query.pageSize)), 'a1')
    }
  },
  { url: '/api/asset/v1/dashboard', method: 'get', response: () => ok({ total: 1286, totalArea: 356.8, leaseRate: 82.4, vacantArea: 62.4, monthAdd: 8, toDispose: 37, warning: 5 }, 'a2') },
  { url: '/api/asset/v1/asset/page/export', method: 'post', response: () => ok(true, 'a3') },
  { url: '/api/asset/v1/asset/export', method: 'get', response: () => ok(true, 'a3b') },
  { url: /\/api\/asset\/v1\/asset\/[^/]+$/, method: 'get', response: ({ url }: any) => { const id = url.split('/').pop()!; const a = assetList.find((x) => x.assetId === id) || assetList[0]; return ok({ ...a, address: '上海市浦东新区世纪大道 100 号', useType: '办公',责任人: '李资产', qrCode: a.assetCode }, 'a4') } },
  { url: '/api/asset/v1/asset', method: 'post', response: ({ body }: any) => { const n = { assetId: uid('A'), assetCode: 'ZC-2026-' + String(assetList.length + 1).padStart(4, '0'), status: 'PENDING', ...body }; assetList.push(n); return ok(n, 'a5') } },
  { url: /\/api\/asset\/v1\/asset\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = assetList.findIndex((a) => a.assetId === id); if (i > -1) assetList[i] = { ...assetList[i], ...body }; return ok(assetList[i], 'a6') } },
  { url: /\/api\/asset\/v1\/asset\/[^/]+\/status$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/')[url.split('/').length - 2]; const i = assetList.findIndex((a) => a.assetId === id); if (i > -1) assetList[i] = { ...assetList[i], status: body.status }; return ok(assetList[i], 'a7') } },
  { url: '/api/asset/v1/asset/transfer', method: 'post', response: () => ok(true, 'a8') },
  { url: '/api/asset/v1/inventory/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(inventoryList, query), Number(query.pageNum), Number(query.pageSize)), 'a9') },
  { url: '/api/asset/v1/inventory', method: 'post', response: ({ body }: any) => { const n = { taskId: uid('IV'), status: 'PENDING', scanned: 0, total: 0, ...body }; inventoryList.push(n); return ok(n, 'a10') } },
  { url: '/api/asset/v1/receipt/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(receiptList, query), Number(query.pageNum), Number(query.pageSize)), 'a11') },
  { url: '/api/asset/v1/receipt', method: 'post', response: ({ body }: any) => { const n = { receiptId: uid('RC'), status: 'DONE', ...body }; receiptList.push(n); return ok(n, 'a12') } },
  { url: '/api/asset/v1/renovation/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(renovationList, query), Number(query.pageNum), Number(query.pageSize)), 'a13') },
  { url: '/api/asset/v1/renovation', method: 'post', response: ({ body }: any) => { const n = { renovationId: uid('RV'), status: 'DOING', approveStatus: 'APPROVING', ...body }; renovationList.push(n); return ok(n, 'a14') } },
  { url: '/api/asset/v1/idle/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(idleList, query), Number(query.pageNum), Number(query.pageSize)), 'a15') },
  { url: '/api/asset/v1/idle/warning', method: 'get', response: () => ok(idleList.filter((i) => i.status === 'WARN'), 'a16') },

  // ============ 招商租赁 ============
  { url: '/api/lease/v1/board', method: 'get', response: () => ok({ funnel: [{ name: '线索', value: 320 }, { name: '带看', value: 180 }, { name: '意向', value: 96 }, { name: '签约', value: 54 }], leaseRate: '82.4%', efficiency: '¥118/㎡', pending: 23 }, 'l1') },
  { url: '/api/lease/v1/lead/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(leadList, query), Number(query.pageNum), Number(query.pageSize)), 'l2') },
  { url: '/api/lease/v1/lead', method: 'post', response: ({ body }: any) => { const n = { leadId: uid('L'), followStatus: 'NEW', ...body }; leadList.push(n); return ok(n, 'l3') } },
  { url: '/api/lease/v1/tenant/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(tenantList, query), Number(query.pageNum), Number(query.pageSize)), 'l4') },
  { url: '/api/lease/v1/tenant', method: 'post', response: ({ body }: any) => { const n = { tenantId: uid('T'), contractCount: 0, ...body }; tenantList.push(n); return ok(n, 'l5') } },
  { url: /\/api\/lease\/v1\/tenant\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = tenantList.findIndex((t) => t.tenantId === id); if (i > -1) tenantList[i] = { ...tenantList[i], ...body }; return ok(tenantList[i], 'l6') } },
  { url: '/api/lease/v1/contract/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(contractList, query), Number(query.pageNum), Number(query.pageSize)), 'l7') },
  { url: '/api/lease/v1/contract', method: 'post', response: ({ body }: any) => { const n = { contractId: uid('CT'), status: 'DRAFT', ...body }; contractList.push(n); return ok(n, 'l8') } },
  { url: '/api/lease/v1/contract/calc-plan', method: 'post', response: ({ body }: any) => { const months = Number(body.months) || 12; const plan = Array.from({ length: months }, (_, i) => ({ period: `第${i + 1}期`, date: `2026-${String((i % 12) + 1).padStart(2, '0')}-01`, amount: Number(body.rent) || 0, status: 'UNPAID' })); return ok(plan, 'l9') } },
  { url: '/api/lease/v1/sign/url', method: 'post', response: () => ok({ signUrl: 'https://sign.example.com/portal?token=mock', qrcode: 'SIGN-MOCK-TOKEN' }, 'l10') },
  { url: '/api/lease/v1/sign/status', method: 'get', response: () => ok({ status: 'SIGNED', signedTime: '2026-07-10 11:30:00' }, 'l11') },

  // ============ 业财一体化 ============
  { url: '/api/finance/v1/bill/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(billList, query), Number(query.pageNum), Number(query.pageSize)), 'f1') },
  { url: '/api/finance/v1/bill/gen', method: 'post', response: () => ok({ billNo: 'B-' + Date.now() }, 'f2') },
  { url: '/api/finance/v1/collection/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(collectionList, query), Number(query.pageNum), Number(query.pageSize)), 'f3') },
  { url: '/api/finance/v1/collection', method: 'post', response: ({ body }: any) => { const n = { collectionId: uid('CO'), ...body }; collectionList.push(n); return ok(n, 'f4') } },
  { url: '/api/finance/v1/writeoff', method: 'post', response: () => ok({ writeOffNo: 'WO-' + Date.now(), amount: 0 }, 'f5') },
  { url: '/api/finance/v1/invoice/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(invoiceList, query), Number(query.pageNum), Number(query.pageSize)), 'f6') },
  { url: '/api/finance/v1/invoice', method: 'post', response: ({ body }: any) => { const n = { invoiceId: uid('IN'), status: 'ISSUED', ...body }; invoiceList.push(n); return ok(n, 'f7') } },

  // ============ 安巡智管 ============
  { url: '/api/safety/v1/dashboard', method: 'get', response: () => ok({ inspectRate: '92%', hazard: 18, workOrder: 7, warn: 3, hazardBar: [{ name: '一般隐患', done: 12, doing: 4 }, { name: '重大隐患', done: 3, doing: 1 }] }, 'sa1') },
  { url: '/api/safety/v1/plan/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(planList, query), Number(query.pageNum), Number(query.pageSize)), 'sa2') },
  { url: '/api/safety/v1/plan', method: 'post', response: ({ body }: any) => { const n = { planId: uid('PL'), status: 'RUNNING', ...body }; planList.push(n); return ok(n, 'sa3') } },
  { url: '/api/safety/v1/inspect/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(inspectList, query), Number(query.pageNum), Number(query.pageSize)), 'sa4') },
  { url: '/api/safety/v1/inspect', method: 'post', response: ({ body }: any) => { const n = { inspectId: uid('IP'), result: 'NORMAL', ...body }; inspectList.push(n); return ok(n, 'sa5') } },
  { url: '/api/safety/v1/workorder/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(workOrderList, query), Number(query.pageNum), Number(query.pageSize)), 'sa6') },
  { url: '/api/safety/v1/workorder', method: 'post', response: ({ body }: any) => { const n = { woId: uid('WO'), status: 'TODO', ...body }; workOrderList.push(n); return ok(n, 'sa7') } },
  { url: /\/api\/safety\/v1\/workorder\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = workOrderList.findIndex((w) => w.woId === id); if (i > -1) workOrderList[i] = { ...workOrderList[i], ...body }; return ok(workOrderList[i], 'sa8') } },
  { url: '/api/safety/v1/hazard/page', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(hazardList, query), Number(query.pageNum), Number(query.pageSize)), 'sa9') },
  { url: '/api/safety/v1/hazard', method: 'post', response: ({ body }: any) => { const n = { hazardId: uid('HZ'), status: 'PENDING', ...body }; hazardList.push(n); return ok(n, 'sa10') } },
  { url: /\/api\/safety\/v1\/hazard\/[^/]+$/, method: 'put', response: ({ url, body }: any) => { const id = url.split('/').pop()!; const i = hazardList.findIndex((h) => h.hazardId === id); if (i > -1) hazardList[i] = { ...hazardList[i], ...body }; return ok(hazardList[i], 'sa11') } },
  { url: '/api/safety/v1/warn', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(warnList, query), Number(query.pageNum), Number(query.pageSize)), 'sa12') },

  // ============ 经营分析报表 ============
  { url: '/api/report/v1/screen', method: 'get', response: () => ok({ metrics: [{ label: '资产总额', value: '¥ 48.6 亿' }, { label: '出租率', value: '82.4%' }, { label: '年度租金收入', value: '¥ 3.2 亿' }, { label: '空置面积', value: '62.4 万㎡' }], pie: [{ name: '写字楼', value: 520 }, { name: '商业', value: 310 }, { name: '产业园', value: 280 }], line: [62, 75, 81, 82.4] }, 'r1') },
  { url: '/api/report/v1/asset-ledger', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(assetList, query), Number(query.pageNum), Number(query.pageSize)), 'r2') },
  { url: '/api/report/v1/contract', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(contractList, query), Number(query.pageNum), Number(query.pageSize)), 'r3') },
  { url: '/api/report/v1/collection', method: 'get', response: () => ok({ rate: '91.3%', overdue: 520000, age: [{ name: '0-30天', value: 12 }, { name: '31-60天', value: 6 }, { name: '60天以上', value: 3 }] }, 'r4') },
  { url: '/api/report/v1/state-owned', method: 'get', response: () => ok({ total: 1286, totalArea: 356.8, leaseRate: 82.4, scrap: 7, restricted: 5 }, 'r5') },
  { url: '/api/report/v1/custom', method: 'get', response: ({ query }: any) => ok(toPage(filterBy(assetList, query), Number(query.pageNum), Number(query.pageSize)), 'r6') },
  { url: '/api/report/v1/custom', method: 'post', response: ({ body }: any) => ok({ id: uid('CR'), ...body }, 'r7') }
] as MockMethod[]
