import type { MockMethod } from 'vite-plugin-mock'

/**
 * 开发期 Mock（vite-plugin-mock）
 * 仅当 .env.development 中 VITE_USE_MOCK=true 生效。
 * 接口返回结构严格遵循开发文档第 1 章：{ code, message, data, requestId }
 *
 * 系统管理相关接口（组织/用户/角色/字典）使用模块级内存数组存储，
 * 支持在会话内真实增删改查；服务重启后回到初始样例数据。
 */

// ============ 内存数据源 ============
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
  { id: 'DT_ROLE_STATUS', name: '角色状态', type: 'RoleStatus', status: 'ENABLED' }
]

// 字典项：按 type 分组
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

// ============ Mock 接口列表 ============
export default [
  // 登录
  {
    url: '/api/login/account',
    method: 'post',
    response: () => ({
      code: 0,
      message: 'success',
      data: { token: 'mock-token-xxxx', refreshToken: 'mock-refresh-xxxx' },
      requestId: 'm1'
    })
  },

  // 用户信息 + 菜单 + 权限
  {
    url: '/api/user/info',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'success',
      data: {
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
            'gis:view',
            'cert:view',
            'asset:view', 'asset:edit',
            'lease:view',
            'fin:bill:view',
            'safety:view',
            'report:screen:view'
          ]
        },
        menus: [
          {
            id: 'm_sys',
            parentId: '0',
            title: '系统基础管理',
            icon: 'Setting',
            path: 'system',
            children: [
              {
                id: 'm_sys_org',
                parentId: 'm_sys',
                title: '组织架构',
                path: 'system/org',
                component: 'system/OrgManage',
                permission: 'sys:org:view'
              },
              {
                id: 'm_sys_user',
                parentId: 'm_sys',
                title: '用户管理',
                path: 'system/user',
                component: 'system/UserManage',
                permission: 'sys:user:view'
              },
              {
                id: 'm_sys_role',
                parentId: 'm_sys',
                title: '角色管理',
                path: 'system/role',
                component: 'system/RoleManage',
                permission: 'sys:role:view'
              },
              {
                id: 'm_sys_dict',
                parentId: 'm_sys',
                title: '字典管理',
                path: 'system/dict',
                component: 'system/DictManage',
                permission: 'sys:dict:view'
              }
            ]
          },
          {
            id: 'm_gis',
            parentId: '0',
            title: 'GIS 地图分布',
            icon: 'MapLocation',
            path: 'gis/map',
            component: 'gis/GisMap',
            permission: 'gis:view'
          },
          {
            id: 'm_cert',
            parentId: '0',
            title: '权证管理',
            icon: 'Postcard',
            path: 'cert/overview',
            component: 'certificate/Overview',
            permission: 'cert:view'
          },
          {
            id: 'm_asset',
            parentId: '0',
            title: '资产全生命周期',
            icon: 'OfficeBuilding',
            path: 'asset/list',
            component: 'asset/AssetList',
            permission: 'asset:view'
          },
          {
            id: 'm_lease',
            parentId: '0',
            title: '招商租赁',
            icon: 'Sell',
            path: 'lease/board',
            component: 'lease/Board',
            permission: 'lease:view'
          },
          {
            id: 'm_fin',
            parentId: '0',
            title: '业财一体化',
            icon: 'Money',
            path: 'finance/bill',
            component: 'finance/Bill',
            permission: 'fin:bill:view'
          },
          {
            id: 'm_safety',
            parentId: '0',
            title: '安巡智管',
            icon: 'Bell',
            path: 'safety/dashboard',
            component: 'safety/Dashboard',
            permission: 'safety:view'
          },
          {
            id: 'm_report',
            parentId: '0',
            title: '经营分析',
            icon: 'DataLine',
            path: 'report/screen',
            component: 'report/Screen',
            permission: 'report:screen:view'
          }
        ]
      },
      requestId: 'm2'
    })
  },

  // ============ 系统管理：组织 ============
  {
    url: '/api/system/v1/org/tree',
    method: 'get',
    response: () => ({ code: 0, message: 'success', data: buildTree(orgList), requestId: 's1' })
  },
  {
    url: '/api/system/v1/org/page',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const kw = (query.keyword || '').trim()
      let filtered = orgList
      if (kw) filtered = filtered.filter((o) => o.name.includes(kw))
      if (query.parentId) filtered = filtered.filter((o) => o.parentId === query.parentId)
      return { code: 0, message: 'success', data: toPage(filtered, Number(query.pageNum), Number(query.pageSize)), requestId: 's2' }
    }
  },
  {
    url: '/api/system/v1/org',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const node = { id: uid('ORG'), parentId: body.parentId || '0', orderNo: orgList.length + 1, ...body }
      orgList.push(node)
      return { code: 0, message: 'success', data: node, requestId: 's3' }
    }
  },
  {
    url: /\/api\/system\/v1\/org\/[^/]+/,
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = url.split('/').pop()!
      const idx = orgList.findIndex((o) => o.id === id)
      if (idx > -1) orgList[idx] = { ...orgList[idx], ...body }
      return { code: 0, message: 'success', data: orgList[idx], requestId: 's4' }
    }
  },
  {
    url: /\/api\/system\/v1\/org\/[^/]+/,
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()!
      // 级联删除子节点
      const toRemove = new Set<string>([id])
      let changed = true
      while (changed) {
        changed = false
        orgList.forEach((o) => {
          if (o.parentId && toRemove.has(o.parentId) && !toRemove.has(o.id)) {
            toRemove.add(o.id)
            changed = true
          }
        })
      }
      for (let i = orgList.length - 1; i >= 0; i--) {
        if (toRemove.has(orgList[i].id)) orgList.splice(i, 1)
      }
      return { code: 0, message: 'success', data: true, requestId: 's5' }
    }
  },

  // ============ 系统管理：用户 ============
  {
    url: '/api/system/v1/user/page',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const kw = (query.keyword || '').trim()
      const filtered = kw ? userList.filter((u) => u.name.includes(kw) || u.username.includes(kw)) : userList
      return { code: 0, message: 'success', data: toPage(filtered, Number(query.pageNum), Number(query.pageSize)), requestId: 's6' }
    }
  },
  {
    url: '/api/system/v1/user',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const node = { id: uid('U'), status: 'ENABLED', ...body }
      userList.push(node)
      return { code: 0, message: 'success', data: node, requestId: 's7' }
    }
  },
  {
    url: /\/api\/system\/v1\/user\/[^/]+/,
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = url.split('/').pop()!
      const idx = userList.findIndex((u) => u.id === id)
      if (idx > -1) userList[idx] = { ...userList[idx], ...body }
      return { code: 0, message: 'success', data: userList[idx], requestId: 's8' }
    }
  },
  {
    url: /\/api\/system\/v1\/user\/[^/]+/,
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()!
      const idx = userList.findIndex((u) => u.id === id)
      if (idx > -1) userList.splice(idx, 1)
      return { code: 0, message: 'success', data: true, requestId: 's9' }
    }
  },

  // ============ 系统管理：角色 ============
  {
    url: '/api/system/v1/role/page',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const kw = (query.keyword || '').trim()
      const filtered = kw ? roleList.filter((r) => r.name.includes(kw) || r.code.includes(kw)) : roleList
      return { code: 0, message: 'success', data: toPage(filtered, Number(query.pageNum), Number(query.pageSize)), requestId: 's10' }
    }
  },
  {
    url: '/api/system/v1/role',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const node = { id: uid('R'), status: 'ENABLED', permissions: [], ...body }
      roleList.push(node)
      return { code: 0, message: 'success', data: node, requestId: 's11' }
    }
  },
  {
    url: /\/api\/system\/v1\/role\/[^/]+/,
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = url.split('/').pop()!
      const idx = roleList.findIndex((r) => r.id === id)
      if (idx > -1) roleList[idx] = { ...roleList[idx], ...body }
      return { code: 0, message: 'success', data: roleList[idx], requestId: 's12' }
    }
  },
  {
    url: /\/api\/system\/v1\/role\/[^/]+/,
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()!
      const idx = roleList.findIndex((r) => r.id === id)
      if (idx > -1) roleList.splice(idx, 1)
      return { code: 0, message: 'success', data: true, requestId: 's13' }
    }
  },

  // ============ 系统管理：字典 ============
  {
    url: '/api/system/v1/dict/type/page',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const kw = (query.keyword || '').trim()
      const filtered = kw ? dictTypeList.filter((d) => d.name.includes(kw) || d.type.includes(kw)) : dictTypeList
      return { code: 0, message: 'success', data: toPage(filtered, Number(query.pageNum), Number(query.pageSize)), requestId: 's14' }
    }
  },
  {
    url: '/api/system/v1/dict/type',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const node = { id: uid('DT'), status: 'ENABLED', ...body }
      dictTypeList.push(node)
      return { code: 0, message: 'success', data: node, requestId: 's15' }
    }
  },
  {
    url: /\/api\/system\/v1\/dict\/type\/[^/]+/,
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = url.split('/').pop()!
      const idx = dictTypeList.findIndex((d) => d.id === id)
      if (idx > -1) dictTypeList[idx] = { ...dictTypeList[idx], ...body }
      return { code: 0, message: 'success', data: dictTypeList[idx], requestId: 's16' }
    }
  },
  {
    url: /\/api\/system\/v1\/dict\/type\/[^/]+/,
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()!
      const idx = dictTypeList.findIndex((d) => d.id === id)
      if (idx > -1) {
        const type = dictTypeList[idx].type
        dictTypeList.splice(idx, 1)
        delete dictItemMap[type]
      }
      return { code: 0, message: 'success', data: true, requestId: 's17' }
    }
  },
  // 字典项列表（按 type）
  {
    url: '/api/system/v1/dict/items',
    method: 'get',
    response: ({ query }: { query: Record<string, any> }) => {
      const map: Record<string, { label: string; value: string }[]> = {
        AssetStatus: [
          { label: '待启用', value: 'PENDING' },
          { label: '在用', value: 'IN_USE' },
          { label: '空置', value: 'VACANT' },
          { label: '出租', value: 'LEASED' },
          { label: '改造', value: 'RENOVATING' },
          { label: '待处置', value: 'TO_DISPOSE' },
          { label: '已报废', value: 'SCRAPPED' }
        ],
        AssetType: [
          { label: '写字楼', value: 'OFFICE' },
          { label: '商业综合体', value: 'COMMERCIAL' },
          { label: '产业园区', value: 'PARK' },
          { label: '长租公寓', value: 'APARTMENT' },
          { label: '配套商铺', value: 'SHOP' },
          { label: '闲置自持物业', value: 'IDLE' }
        ]
      }
      return { code: 0, message: 'success', data: map[query.type] || [], requestId: 'm3' }
    }
  },
  {
    url: '/api/system/v1/dict/item/list',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const list = dictItemMap[query.type] || []
      const kw = (query.keyword || '').trim()
      const filtered = kw ? list.filter((i) => i.label.includes(kw) || i.value.includes(kw)) : list
      return { code: 0, message: 'success', data: toPage(filtered, Number(query.pageNum), Number(query.pageSize)), requestId: 's18' }
    }
  },
  {
    url: '/api/system/v1/dict/item',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const type = body.type
      if (!dictItemMap[type]) dictItemMap[type] = []
      const node = { id: uid('DI'), orderNo: dictItemMap[type].length + 1, ...body }
      dictItemMap[type].push(node)
      return { code: 0, message: 'success', data: node, requestId: 's19' }
    }
  },
  {
    url: /\/api\/system\/v1\/dict\/item\/[^/]+/,
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = url.split('/').pop()!
      let updated: any = null
      for (const type of Object.keys(dictItemMap)) {
        const idx = dictItemMap[type].findIndex((i) => i.id === id)
        if (idx > -1) {
          dictItemMap[type][idx] = { ...dictItemMap[type][idx], ...body }
          updated = dictItemMap[type][idx]
          break
        }
      }
      return { code: 0, message: 'success', data: updated, requestId: 's20' }
    }
  },
  {
    url: /\/api\/system\/v1\/dict\/item\/[^/]+/,
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()!
      for (const type of Object.keys(dictItemMap)) {
        const idx = dictItemMap[type].findIndex((i) => i.id === id)
        if (idx > -1) {
          dictItemMap[type].splice(idx, 1)
          break
        }
      }
      return { code: 0, message: 'success', data: true, requestId: 's21' }
    }
  },

  // 资产分页（样例数据）
  {
    url: '/api/asset/v1/asset/page',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'success',
      data: {
        list: [
          {
            assetId: 'A1001',
            assetCode: 'ZC-2026-0001',
            assetName: '滨江国际写字楼 A 座',
            assetType: 'OFFICE',
            orgName: '集团总部',
            building: 'A 座',
            area: 32000,
            status: 'LEASED',
            manager: '李资产'
          },
          {
            assetId: 'A1002',
            assetCode: 'ZC-2026-0002',
            assetName: '阳光商业广场',
            assetType: 'COMMERCIAL',
            orgName: '华东公司',
            building: '主楼',
            area: 56000,
            status: 'VACANT',
            manager: '王招商'
          },
          {
            assetId: 'A1003',
            assetCode: 'ZC-2026-0003',
            assetName: '智造产业园 3 号厂房',
            assetType: 'PARK',
            orgName: '产业园公司',
            building: '3 号',
            area: 18000,
            status: 'IN_USE',
            manager: '赵运营'
          }
        ],
        total: 3,
        pageNum: 1,
        pageSize: 20
      },
      requestId: 'm4'
    })
  },

  // 业财：按合同生成账单
  {
    url: '/api/finance/v1/bill/gen',
    method: 'post',
    response: () => ({
      code: 0,
      message: 'success',
      data: { billNo: 'B-' + Date.now() },
      requestId: 'm5'
    })
  },

  // 业财：账单分页
  {
    url: '/api/finance/v1/bill/page',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'success',
      data: {
        list: [
          { billNo: 'B-2026-0001', tenant: '某科技公司', period: '2026-07', amount: '86,400', status: '已收' },
          { billNo: 'B-2026-0002', tenant: '某餐饮品牌', period: '2026-07', amount: '52,000', status: '逾期' }
        ],
        total: 2,
        pageNum: 1,
        pageSize: 20
      },
      requestId: 'm6'
    })
  }
] as MockMethod[]
