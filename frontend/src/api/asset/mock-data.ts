/**
 * 资产台账前端 Mock 数据
 * 当 VITE_USE_ASSET_MOCK=true 时由 src/api/asset/index.ts 调用
 * 数据结构严格对齐接口文档 AssetVO / AssetStatisticsVO
 */

import type { AssetVO, AssetStatisticsVO, ApiPageResult } from '@/types'

const mockAssets: AssetVO[] = [
  { id: 1, buildingName: '总部办公大楼A座', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证第2020001号', address: '上海市黄浦区中山东一路88号', usageTerm: '2020-01-01 ~ 2050-12-31', buildingArea: 24000, landNature: '出让/商业办公用地', structureType: '钢筋混凝土框架结构', source: '收购', assetValue: 85000000, statusName: '在用' },
  { id: 2, buildingName: '滨江商业中心B栋', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证浦字第2021007号', address: '上海市浦东新区陆家嘴环路118号', usageTerm: '2021-03-01 ~ 2041-02-28', buildingArea: 18500, landNature: '出让/商业综合体用地', structureType: '钢筋混凝土核心筒结构', source: '划转', assetValue: 62000000, statusName: '在用' },
  { id: 3, buildingName: '科技产业园C区厂房', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证闵字第2019021号', address: '上海市闵行区莘庄工业区88号', usageTerm: '2019-06-01 ~ 2039-05-31', buildingArea: 12000, landNature: '出让/工业用地', structureType: '钢结构厂房', source: '划拨', assetValue: 28000000, statusName: '欠费风险' },
  { id: 4, buildingName: '老城区仓储基地D栋', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证静字第2015035号', address: '上海市静安区长安路325号', usageTerm: '2015-03-01 ~ 2035-02-28', buildingArea: 5000, landNature: '划拨/仓储物流用地', structureType: '钢结构', source: '划转', assetValue: 15000000, statusName: '闲置' },
  { id: 5, buildingName: '南郊综合服务楼E座', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证徐字第2022018号', address: '上海市徐汇区龙吴路577号', usageTerm: '2022-01-01 ~ 2042-12-31', buildingArea: 8200, landNature: '出让/综合服务用地', structureType: '钢筋混凝土框架结构', source: '收购', assetValue: 35000000, statusName: '在用' },
  { id: 6, buildingName: '东郊培训中心F楼', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证崇字第2023026号', address: '上海市崇明区安亭镇翠竹路9号', usageTerm: '2023-04-01 ~ 2043-03-31', buildingArea: 4500, landNature: '出让/教育培训用地', structureType: '钢筋混凝土框架结构', source: '划拨', assetValue: 18000000, statusName: '在用' },
  { id: 7, buildingName: '旧员工宿舍G栋', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证杨字第2010020号', address: '上海市杨浦区控江路156号', usageTerm: '2010-01-01 ~ 2030-12-31', buildingArea: 3800, landNature: '划拨/住宅用地', structureType: '砖混结构', source: '划拨', assetValue: 5000000, statusName: '闲置' },
  { id: 8, buildingName: '北郊数据中心机房H座', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证宝字第2024009号', address: '上海市宝山区罗泾镇川纪路100号', usageTerm: '2024-01-01 ~ 2054-12-31', buildingArea: 6000, landNature: '出让/工业用地（数据中心）', structureType: '钢筋混凝土结构', source: '收购', assetValue: 42000000, statusName: '在用' },
  { id: 9, buildingName: '西郊物流仓库I栋', ownerUnit: '中国国有资产运营集团有限公司', propertyNo: '沪房权证松字第2018010号', address: '上海市松江区九亭镇漕亭路66号', usageTerm: '2018-08-01 ~ 2038-07-31', buildingArea: 9500, landNature: '出让/仓储物流用地', structureType: '钢结构', source: '划转', assetValue: 22000000, statusName: '欠费风险' }
]

// status int → statusName 映射
const statusIntToName: Record<number, string> = { 0: '闲置', 1: '在用', 2: '欠费风险' }

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /v1/assets → 分页列表 */
export async function mockGetAssetPage(params: any): Promise<ApiPageResult<AssetVO>> {
  await delay()
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 20

  let list = [...mockAssets]
  if (params.buildingName) list = list.filter((a) => (a.buildingName || '').includes(params.buildingName))
  if (params.source) list = list.filter((a) => a.source === params.source)
  if (params.status !== undefined && params.status !== '' && params.status !== null) {
    const name = statusIntToName[Number(params.status)]
    if (name) list = list.filter((a) => a.statusName === name)
  }

  const total = list.length
  const start = (page - 1) * pageSize
  const pageList = list.slice(start, start + pageSize)

  return {
    list: pageList,
    pagination: { page, total, pageSize }
  }
}

/** GET /v1/assets/{id} → 资产详情 */
export async function mockGetAssetDetail(id: string | number): Promise<AssetVO> {
  await delay()
  const found = mockAssets.find((a) => String(a.id) === String(id))
  return found || mockAssets[0]
}

/** GET /v1/assets/statistics → 统计卡片 */
export async function mockGetAssetStatistics(): Promise<AssetStatisticsVO> {
  await delay()
  const total = mockAssets.length
  const inUse = mockAssets.filter((a) => a.statusName === '在用').length
  const overdue = mockAssets.filter((a) => a.statusName === '欠费风险').length
  const totalValue = mockAssets.reduce((sum, a) => sum + (a.assetValue || 0), 0)
  return { totalCount: total, totalValue, inUseCount: inUse, overdueRiskCount: overdue }
}
