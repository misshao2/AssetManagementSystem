import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import constantRoutes from './constantRoutes'
import { generateRoutes } from './dynamicRoutes'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes as RouteRecordRaw[],
  scrollBehavior: () => ({ top: 0 })
})

const whiteList = ['/login']

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const hasToken = getToken()

  if (!hasToken) {
    if (whiteList.includes(to.path)) return next()
    return next(`/login?redirect=${encodeURIComponent(to.path)}`)
  }

  if (to.path === '/login') return next('/')

  const userStore = useUserStore()
  if (userStore.menus.length === 0) {
    try {
      const { menus } = await userStore.fetchUserInfo()
      const routes = generateRoutes(menus)
      routes.forEach((r) => router.addRoute('Layout', r))
      return next({ ...to, replace: true })
    } catch {
      userStore.logout()
      return next('/login')
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
