import type { RouteRecordRaw } from 'vue-router'
import type { MenuNode } from '@/types'
import { loadView } from './viewLoader'

// 将后端菜单树转换为路由。
// 注意：所有菜单（含多级）均拍平为 Layout 的平级子路由，
// path 直接使用菜单的完整 path（如 system/org、gis/map），
// 避免嵌套路由导致的路径重复拼接问题（/system/system/org）。
// 侧边栏菜单由 userStore.menus 树自行渲染，不依赖路由嵌套层级。
function flatten(menus: MenuNode[], acc: RouteRecordRaw[] = []): RouteRecordRaw[] {
  menus.forEach((menu) => {
    // 仅当菜单有可访问组件时生成路由（父级分组菜单无 component 则跳过）
    if (menu.component) {
      acc.push({
        path: menu.path,
        name: menu.id,
        component: loadView(menu.component),
        meta: {
          title: menu.title,
          icon: menu.icon,
          permission: menu.permission
        }
      })
    }
    if (menu.children && menu.children.length) {
      flatten(menu.children, acc)
    }
  })
  return acc
}

export function generateRoutes(menus: MenuNode[]): RouteRecordRaw[] {
  return flatten(menus)
}
